import React, { useState, useEffect, useRef } from 'react';
import { Peer } from 'peerjs';
import { Swords, Shield, Copy, CheckCircle2, ChevronLeft, Wifi, User, Play, AlertCircle } from 'lucide-react';
import { Card } from './App'; // Assuming Card is exported from App.jsx, I need to make sure of that! Or I can recreate/extract it.

// LƯU Ý: File này cần được App.jsx import và truyền Card component vào hoặc Card phải được tách ra.
// Tạm thời nhận Card component qua props để tránh circular dependency.

export default function MultiplayerEngine({ squad, currentUser, onExit, onWin, initialJoinId, CardComponent }) {
  const [peerId, setPeerId] = useState('');
  const [remotePeerId, setRemotePeerId] = useState(initialJoinId || '');
  const [connection, setConnection] = useState(null);
  const [status, setStatus] = useState('lobby'); // 'lobby', 'connecting', 'playing', 'gameover'
  const [copied, setCopied] = useState(false);
  
  const peerInstance = useRef(null);
  
  // Game State
  const [myDeck, setMyDeck] = useState([]);
  const [opponentDeckCount, setOpponentDeckCount] = useState(11);
  const [myScore, setMyScore] = useState(0);
  const [opponentScore, setOpponentScore] = useState(0);
  
  const [isMyTurn, setIsMyTurn] = useState(false);
  const [currentChallenge, setCurrentChallenge] = useState(null); // { stat: 'attack' }
  const [myPlayedCard, setMyPlayedCard] = useState(null);
  const [opponentPlayedCard, setOpponentPlayedCard] = useState(null);
  const [roundResult, setRoundResult] = useState('');
  const [matchLog, setMatchLog] = useState([]);

  useEffect(() => {
    // Clone squad
    setMyDeck([...squad]);
    
    // Tạo Peer ID dựa trên tên người dùng (thêm prefix để tránh trùng lặp trên server public toàn cầu)
    const normalizedUsername = currentUser.toLowerCase().replace(/[^a-z0-9]/g, '');
    const myHostId = `wc26-panini-${normalizedUsername}`;
    
    // Initialize Peer
    const peer = new Peer(myHostId);
    
    peer.on('open', (id) => {
      setPeerId(currentUser); // Chỉ hiện thị tên cho user dễ hiểu
    });

    peer.on('connection', (conn) => {
      // Nhận kết nối từ người khác (Mình là Host)
      setConnection(conn);
      setStatus('playing');
      setIsMyTurn(true); // Host đi trước
      setupConnectionHandlers(conn, true);
    });

    peer.on('error', (err) => {
      console.error(err);
      if (err.type === 'unavailable-id') {
         alert("Tên của bạn đang được ai đó sử dụng để làm máy chủ! Vui lòng đổi tên đăng nhập khác.");
      } else if (err.type === 'peer-unavailable') {
         alert("Không tìm thấy đối thủ hoặc đối thủ chưa sẵn sàng! Vui lòng kiểm tra lại link/tên hoặc chờ đối thủ tạo phòng.");
      } else {
         alert("Lỗi kết nối mạng: " + err.type);
      }
      setStatus('lobby');
    });

    peerInstance.current = peer;

    return () => {
      peer.destroy();
    };
  }, []);

  const setupConnectionHandlers = (conn, isHost) => {
    conn.on('data', (data) => {
      handleNetworkData(data, isHost);
    });
    
    conn.on('close', () => {
      alert("Đối thủ đã thoát trận!");
      onExit();
    });
  };

  const connectToPeer = (targetId = remotePeerId) => {
    if (!targetId || !targetId.trim()) return;
    setStatus('connecting');
    
    const normalizedOpponent = targetId.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
    const targetHostId = `wc26-panini-${normalizedOpponent}`;
    
    const conn = peerInstance.current.connect(targetHostId);
    
    conn.on('open', () => {
      setConnection(conn);
      setStatus('playing');
      setIsMyTurn(false); // Joiner đi sau
      setupConnectionHandlers(conn, false);
    });
  };

  const handleNetworkData = (data, isHost) => {
    if (data.type === 'challenge') {
      // Đối thủ ra bài và thách đấu chỉ số
      setOpponentPlayedCard(data.card);
      setCurrentChallenge(data.stat);
      setOpponentDeckCount(prev => prev - 1);
      setRoundResult(`Đối thủ thách đấu chỉ số: ${data.stat.toUpperCase()}! Hãy chọn bài để đỡ!`);
      setIsMyTurn(true);
    } 
    else if (data.type === 'defend') {
      // Đối thủ ra bài đỡ
      setOpponentPlayedCard(data.card);
      setOpponentDeckCount(prev => prev - 1);
      resolveRound(myPlayedCard, data.card, currentChallenge, true); // Resolve immediately
    }
    else if (data.type === 'round_result') {
      // Host gửi kết quả round
      setOpponentPlayedCard(data.opponentCard); // Cập nhật bài host đã đánh
      if (data.winner === 'host') {
        setRoundResult("Bạn đã THUA vòng này!");
        setOpponentScore(prev => prev + 1);
        setIsMyTurn(false);
      } else if (data.winner === 'joiner') {
        setRoundResult("Bạn đã THẮNG vòng này!");
        setMyScore(prev => prev + 1);
        setIsMyTurn(true);
      } else {
        setRoundResult("HÒA!");
        // Nếu hoà, ai vừa tấn công thì đánh tiếp (Host gửi data.nextTurn)
        setIsMyTurn(data.nextTurn === 'joiner');
      }
      
      setTimeout(() => {
        setMyPlayedCard(null);
        setOpponentPlayedCard(null);
        setCurrentChallenge(null);
        if (data.isGameOver) {
           setStatus('gameover');
        }
      }, 3000);
    }
  };

  const handleCardSelect = (card) => {
    if (!isMyTurn) return;
    if (currentChallenge) {
      // Đang phòng thủ
      playDefense(card);
    } else {
      // Đang tấn công, phải chờ chọn chỉ số
      setMyPlayedCard(card);
    }
  };

  const handleStatSelect = (stat) => {
    if (!myPlayedCard || !isMyTurn || currentChallenge) return;
    
    // Gửi yêu cầu thách đấu
    connection.send({
      type: 'challenge',
      card: myPlayedCard,
      stat: stat
    });
    
    setMyDeck(myDeck.filter(c => c.id !== myPlayedCard.id));
    setCurrentChallenge(stat);
    setIsMyTurn(false);
    setRoundResult(`Đang chờ đối thủ đỡ đòn ${stat.toUpperCase()}...`);
  };

  const playDefense = (defenseCard) => {
    setMyPlayedCard(defenseCard);
    setMyDeck(myDeck.filter(c => c.id !== defenseCard.id));
    
    // Gửi thẻ phòng thủ cho Host
    connection.send({
      type: 'defend',
      card: defenseCard
    });
    
    setIsMyTurn(false);
    setRoundResult("Đang phân định thắng thua...");
  };

  const resolveRound = (hostCard, joinerCard, stat, isHostContext) => {
    const hostStat = hostCard.stats[stat];
    const joinerStat = joinerCard.stats[stat];
    
    let winner = 'draw';
    let nextTurn = 'host';
    
    if (hostStat > joinerStat) {
      winner = 'host';
      nextTurn = 'host';
      setMyScore(prev => prev + 1);
      setRoundResult("Bạn THẮNG vòng này!");
    } else if (joinerStat > hostStat) {
      winner = 'joiner';
      nextTurn = 'joiner';
      setOpponentScore(prev => prev + 1);
      setRoundResult("Bạn THUA vòng này!");
    } else {
      setRoundResult("HÒA!");
    }

    const isGameOver = myDeck.length <= 1; // Round này kết thúc là deck còn 0
    
    setIsMyTurn(nextTurn === 'host');
    
    // Báo cho Joiner biết kết quả
    connection.send({
      type: 'round_result',
      opponentCard: hostCard,
      winner: winner,
      nextTurn: nextTurn,
      isGameOver: isGameOver
    });

    if (isGameOver) {
      setTimeout(() => setStatus('gameover'), 3000);
    } else {
      setTimeout(() => {
        setMyPlayedCard(null);
        setOpponentPlayedCard(null);
        setCurrentChallenge(null);
      }, 3000);
    }
  };

  if (status === 'lobby') {
    return (
      <div className="w-full max-w-4xl mx-auto flex flex-col items-center mt-12 animate-fade-in relative z-10">
        <button className="btn !bg-gray-700/50 absolute top-0 left-0" onClick={onExit}><ChevronLeft /> Trở Về</button>
        <h2 className="text-4xl md:text-5xl font-black italic tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-amber-500 drop-shadow-lg mb-8 uppercase text-center flex items-center gap-4">
          <Wifi size={48} className="text-red-500" /> PVP ONLINE
        </h2>

        <div className="flex flex-col md:flex-row gap-8 w-full">
          {/* TẠO PHÒNG */}
          <div className="glass-panel p-8 rounded-3xl flex-1 flex flex-col items-center text-center">
            <h3 className="text-2xl font-bold mb-4 uppercase text-amber-400">Đợi Thách Đấu (Host)</h3>
            <p className="text-gray-400 mb-6">Hãy bảo bạn bè nhập tên của bạn vào máy của họ để bắt đầu.</p>
            
            {peerId ? (
              <div className="bg-black/50 p-4 rounded-xl border border-white/20 flex items-center gap-4 w-full justify-center">
                <span className="text-gray-400">Tên của bạn:</span>
                <span className="font-black text-3xl tracking-wider text-amber-400 uppercase">{peerId}</span>
              </div>
            ) : (
              <div className="animate-pulse text-gray-500">Đang thiết lập mạng lưới...</div>
            )}
            
            <div className="mt-8 flex items-center justify-center gap-2 text-yellow-400 animate-pulse w-full">
              <span className="relative flex h-3 w-3"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-yellow-500"></span></span>
              Đang chờ bạn bè kết nối...
            </div>

            {peerId && (
              <button 
                className="btn !bg-green-600 hover:!bg-green-500 mt-6 flex justify-center items-center gap-2 w-full max-w-[200px]"
                onClick={() => {
                  const link = `${window.location.origin}?pvp=${peerId}`;
                  navigator.clipboard.writeText(link);
                  alert("Đã copy link mời! Hãy gửi cho bạn bè để họ vào thi đấu ngay.");
                }}
              >
                <Copy size={18} /> Sao Chép Link
              </button>
            )}
          </div>

          {/* VÀO PHÒNG */}
          <div className="glass-panel p-8 rounded-3xl flex-1 flex flex-col items-center text-center">
            <h3 className="text-2xl font-bold mb-4 uppercase text-blue-400">Gửi Thách Đấu (Join)</h3>
            <p className="text-gray-400 mb-6">Nhập tên đăng nhập của đối thủ để kết nối thẳng vào máy của họ.</p>
            
            <input 
              type="text" 
              placeholder="Nhập tên đối thủ..." 
              className="w-full bg-black/50 border border-white/20 rounded-xl p-4 text-center font-black text-2xl text-white focus:outline-none focus:border-blue-500 uppercase"
              value={remotePeerId}
              onChange={(e) => setRemotePeerId(e.target.value)}
            />
            
            <button 
              className="btn !bg-blue-600 hover:!bg-blue-500 w-full mt-6 flex justify-center items-center gap-2"
              onClick={connectToPeer}
              disabled={!remotePeerId}
            >
              <Swords /> Tham Chiến
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'connecting') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <Wifi size={64} className="text-blue-500 animate-pulse mb-4" />
        <h2 className="text-2xl font-bold text-white">Đang thiết lập kết nối mã hóa...</h2>
      </div>
    );
  }

  // --- GAME PLAYING ---
  return (
    <div className="w-full h-[100dvh] flex flex-col overflow-hidden bg-black/50 animate-fade-in relative z-10">
      {/* HUD Mạng (Top ~10vh) */}
      <div className="w-full flex-none flex justify-between items-center bg-black/60 backdrop-blur-md px-4 py-2 border-b border-white/10 shadow-lg">
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="w-8 h-8 sm:w-12 sm:h-12 bg-red-900/50 rounded-full flex items-center justify-center border border-red-500">
            <User className="text-red-400 w-4 h-4 sm:w-6 sm:h-6" />
          </div>
          <div>
            <div className="text-[10px] sm:text-xs font-bold text-red-400 uppercase">Đối Thủ</div>
            <div className="text-xl sm:text-2xl font-black text-white leading-none">{opponentScore}</div>
          </div>
        </div>
        
        <div className="flex flex-col items-center">
          <div className="text-[10px] sm:text-xs font-bold tracking-widest text-gray-400 uppercase mb-0.5">PVP</div>
          <div className="text-2xl sm:text-3xl font-black italic text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-blue-500 leading-none">VS</div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4 text-right">
          <div>
            <div className="text-[10px] sm:text-xs font-bold text-blue-400 uppercase truncate max-w-[80px]">{currentUser}</div>
            <div className="text-xl sm:text-2xl font-black text-white leading-none">{myScore}</div>
          </div>
          <div className="w-8 h-8 sm:w-12 sm:h-12 bg-blue-900/50 rounded-full flex items-center justify-center border border-blue-500">
            <User className="text-blue-400 w-4 h-4 sm:w-6 sm:h-6" />
          </div>
        </div>
      </div>

      {status === 'gameover' ? (
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="glass-panel p-8 sm:p-12 rounded-3xl text-center w-full max-w-lg">
            <h2 className="text-4xl sm:text-5xl font-black mb-4 uppercase">
              {myScore > opponentScore ? <span className="text-green-400">Chiến Thắng!</span> : myScore < opponentScore ? <span className="text-red-400">Thất Bại!</span> : <span className="text-yellow-400">Hòa Trận!</span>}
            </h2>
            <p className="text-lg sm:text-xl mb-8">Tỉ số chung cuộc: {myScore} - {opponentScore}</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="btn !bg-gray-600 w-full sm:w-auto" onClick={onExit}>Thoát</button>
              {myScore > opponentScore && <button className="btn !bg-yellow-500 text-black w-full sm:w-auto" onClick={() => { onWin(); onExit(); }}>Nhận Thưởng</button>}
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Sân Đấu (Middle ~55vh) */}
          <div className="flex-1 w-full relative bg-gradient-to-b from-red-900/10 via-black/40 to-blue-900/10 overflow-hidden flex flex-col justify-between py-4">
            
            {/* Vùng bài đối thủ */}
            <div className="h-[45%] w-full flex items-start justify-center pt-2">
              <div className="w-28 sm:w-40 aspect-[5/7] transition-all duration-500 transform translate-y-0 relative">
                {opponentPlayedCard ? (
                  currentChallenge && !myPlayedCard ? (
                    // Đang chờ mình đỡ, giấu bài đối thủ
                    <div className="w-full h-full bg-red-900/50 border-2 border-red-500/50 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(239,68,68,0.3)]">
                      <Shield size={48} className="text-red-400 animate-pulse" />
                    </div>
                  ) : (
                    <CardComponent player={opponentPlayedCard} />
                  )
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-red-400/50 border-2 border-dashed border-red-900/30 rounded-xl">
                     <div className="w-2 h-2 rounded-full bg-red-500 animate-ping mb-2"></div>
                     <span className="text-[10px] font-bold uppercase text-center">Chờ Địch</span>
                  </div>
                )}
              </div>
            </div>

            {/* Vùng thông báo giữa sân */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] text-center z-50 pointer-events-none">
              <div className="inline-block bg-black/80 backdrop-blur-md border border-white/20 px-4 sm:px-8 py-2 sm:py-3 rounded-full text-sm sm:text-xl font-bold uppercase tracking-widest shadow-2xl">
                {roundResult || (isMyTurn ? <span className="text-green-400">Lượt của bạn</span> : <span className="text-yellow-400">Lượt đối thủ...</span>)}
              </div>
              {currentChallenge && (
                <div className="mt-2 sm:mt-4 text-xl sm:text-3xl font-black italic text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-yellow-400 uppercase drop-shadow-[0_0_15px_rgba(251,191,36,0.5)]">
                  Chỉ số: {currentChallenge}
                </div>
              )}
            </div>

            {/* Vùng bài của mình */}
            <div className="h-[45%] w-full flex items-end justify-center pb-2">
              <div className="w-28 sm:w-40 aspect-[5/7] transition-all duration-500 transform translate-y-0 relative">
                {myPlayedCard ? (
                  <>
                     <CardComponent player={myPlayedCard} />
                     {/* Bảng chọn chỉ số tấn công */}
                     {isMyTurn && !currentChallenge && (
                       <div className="absolute -top-12 left-1/2 -translate-x-1/2 flex gap-1 sm:gap-2 z-50 bg-black/80 p-1.5 rounded-lg border border-white/20">
                          <button className="bg-red-600 hover:bg-red-500 text-white font-bold px-2 py-1 sm:px-3 sm:py-1 rounded text-xs sm:text-sm" onClick={() => handleStatSelect('attack')}>ATK {myPlayedCard.stats.attack}</button>
                          <button className="bg-green-600 hover:bg-green-500 text-white font-bold px-2 py-1 sm:px-3 sm:py-1 rounded text-xs sm:text-sm" onClick={() => handleStatSelect('defense')}>DEF {myPlayedCard.stats.defense}</button>
                          <button className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-2 py-1 sm:px-3 sm:py-1 rounded text-xs sm:text-sm" onClick={() => handleStatSelect('control')}>CTRL {myPlayedCard.stats.control}</button>
                       </div>
                     )}
                  </>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-blue-400/50 border-2 border-dashed border-blue-900/30 rounded-xl">
                     <span className="text-[10px] font-bold uppercase text-center px-2">Chọn Bài</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Bài Trên Tay (Bottom ~30vh) */}
          <div className="flex-none h-[25vh] sm:h-[30vh] w-full bg-black/80 border-t border-white/10 pb-4">
            <div className="px-4 py-1.5 flex justify-between items-center bg-white/5 border-b border-white/5">
              <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Bài Trên Tay</span>
              <span className="text-xs font-bold text-blue-400">{myDeck.length} lá</span>
            </div>
            
            {/* Scroll ngang hoặc Flex xếp chồng cho Mobile */}
            <div className="h-full w-full overflow-x-auto overflow-y-hidden snap-x flex items-center px-4 pt-2 pb-6 hide-scrollbar">
              <div className="flex flex-row items-center justify-start min-w-max h-full space-x-[-40px] sm:space-x-2">
                {myDeck.map((player, idx) => (
                  <div 
                    key={player.id} 
                    className={`h-[90%] sm:h-full aspect-[5/7] shrink-0 transition-all duration-300 transform ${
                      (!isMyTurn || myPlayedCard) 
                      ? 'opacity-50 grayscale cursor-not-allowed translate-y-4' 
                      : 'cursor-pointer hover:-translate-y-6 hover:scale-110 z-10 relative shadow-2xl shadow-black'
                    }`}
                    style={{ zIndex: myDeck.length - idx }}
                    onClick={() => handleCardSelect(player)}
                  >
                    <CardComponent player={player} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
