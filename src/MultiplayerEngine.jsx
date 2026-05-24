import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Peer } from 'peerjs';
import { Swords, Shield, Copy, ChevronLeft, Wifi, User, AlertCircle, ChevronRight } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

export default function MultiplayerEngine({ squad, currentUser, onExit, onWin, initialJoinId, CardComponent }) {
  const [peerId, setPeerId] = useState('');
  const [remotePeerId, setRemotePeerId] = useState(initialJoinId || '');
  const [status, setStatus] = useState('lobby');

  const peerInstance = useRef(null);
  const connRef = useRef(null); // Luôn giữ connection mới nhất qua ref

  // Game State
  const [myDeck, setMyDeck] = useState([...squad]);
  const [opponentDeckCount, setOpponentDeckCount] = useState(11);
  const [myScore, setMyScore] = useState(0);
  const [opponentScore, setOpponentScore] = useState(0);

  const [isMyTurn, setIsMyTurn] = useState(false);
  const isMyTurnRef = useRef(false); // ref để dùng trong stale closures
  useEffect(() => { isMyTurnRef.current = isMyTurn; }, [isMyTurn]);

  const [phase, setPhase] = useState('select_card'); // 'select_card' | 'select_stat' | 'defend' | 'result' | 'waiting'
  const phaseRef = useRef('select_card');
  useEffect(() => { phaseRef.current = phase; }, [phase]);

  const [challengeStat, setChallengeStat] = useState(null); // stat đang được thách đấu
  const challengeStatRef = useRef(null);
  useEffect(() => { challengeStatRef.current = challengeStat; }, [challengeStat]);

  const [myPlayedCard, setMyPlayedCard] = useState(null);
  const myPlayedCardRef = useRef(null);
  useEffect(() => { myPlayedCardRef.current = myPlayedCard; }, [myPlayedCard]);

  const myDeckRef = useRef([...squad]);
  useEffect(() => { myDeckRef.current = myDeck; }, [myDeck]);

  const [opponentPlayedCard, setOpponentPlayedCard] = useState(null);
  const [roundResultMsg, setRoundResultMsg] = useState('');
  const [roundWinner, setRoundWinner] = useState(null); // 'me' | 'opponent' | 'draw'

  // Gửi dữ liệu qua mạng
  const sendData = useCallback((data) => {
    if (connRef.current && connRef.current.open) {
      connRef.current.send(data);
    }
  }, []);

  // Xử lý dữ liệu nhận từ mạng — luôn dùng ref để có giá trị mới nhất
  const handleNetworkData = useCallback((data) => {
    if (data.type === 'challenge') {
      // Đối thủ ra bài tấn công, chọn chỉ số thách đấu
      setOpponentPlayedCard(data.card);
      setOpponentDeckCount(prev => prev - 1);
      setChallengeStat(data.stat);
      setIsMyTurn(true);
      setPhase('defend');
      setRoundResultMsg(`Đối thủ thách đấu: ${data.stat.toUpperCase()}! Chọn bài để đỡ!`);
    }
    else if (data.type === 'defend') {
      // Đối thủ ra bài đỡ — ta (attacker) phân định kết quả
      setOpponentPlayedCard(data.card);
      setOpponentDeckCount(prev => prev - 1);

      const myCard = myPlayedCardRef.current;
      const stat = challengeStatRef.current;
      if (!myCard || !stat) return;

      const myStatVal = myCard.stats[stat];
      const opStatVal = data.card.stats[stat];

      let winner, nextTurnIsMe;
      if (myStatVal > opStatVal) {
        winner = 'me';
        nextTurnIsMe = true; // attacker thắng → tiếp tục tấn công
        setMyScore(prev => prev + 1);
        setRoundResultMsg('BẠN THẮNG VÒNG NÀY! 🎉');
        setRoundWinner('me');
      } else if (opStatVal > myStatVal) {
        winner = 'opponent';
        nextTurnIsMe = false; // defender thắng → đối thủ tấn công tiếp
        setOpponentScore(prev => prev + 1);
        setRoundResultMsg('BẠN THUA VÒNG NÀY! 😤');
        setRoundWinner('opponent');
      } else {
        winner = 'draw';
        nextTurnIsMe = true; // hòa → giữ lượt tấn công
        setRoundResultMsg('HÒA! ⚖️');
        setRoundWinner('draw');
      }

      const deckAfterPlay = myDeckRef.current; // deck đã bị lọc trong handleStatSelect
      const isGameOver = deckAfterPlay.length === 0;

      setPhase('result');
      setIsMyTurn(false); // block tương tác trong lúc hiện kết quả

      // Báo Joiner (defender) biết kết quả
      sendData({
        type: 'round_result',
        opponentCard: myCard,
        winner: winner, // 'me' = attacker thắng = 'me' trên màn attacker = 'opponent' trên màn defender
        nextTurnIsDefender: !nextTurnIsMe,
        isGameOver,
      });

      // Sau 2.5s, clear và set lượt mới
      setTimeout(() => {
        setMyPlayedCard(null);
        setOpponentPlayedCard(null);
        setChallengeStat(null);
        setRoundResultMsg('');
        setRoundWinner(null);
        if (isGameOver) {
          setStatus('gameover');
        } else {
          setIsMyTurn(nextTurnIsMe);
          setPhase(nextTurnIsMe ? 'select_card' : 'waiting');
        }
      }, 2500);
    }
    else if (data.type === 'round_result') {
      // Ta là defender, nhận kết quả từ attacker
      setOpponentPlayedCard(data.opponentCard);

      if (data.winner === 'me') {
        // attacker thắng = ta (defender) thua
        setOpponentScore(prev => prev + 1);
        setRoundResultMsg('BẠN THUA VÒNG NÀY! 😤');
        setRoundWinner('opponent');
      } else if (data.winner === 'opponent') {
        // attacker thua = ta (defender) thắng
        setMyScore(prev => prev + 1);
        setRoundResultMsg('BẠN THẮNG VÒNG NÀY! 🎉');
        setRoundWinner('me');
      } else {
        setRoundResultMsg('HÒA! ⚖️');
        setRoundWinner('draw');
      }

      setPhase('result');
      setIsMyTurn(false);

      const nextTurnIsMe = data.nextTurnIsDefender; // ta là defender, nếu nextTurnIsDefender thì đến lượt ta tấn công
      const isGameOver = data.isGameOver;

      setTimeout(() => {
        setMyPlayedCard(null);
        setOpponentPlayedCard(null);
        setChallengeStat(null);
        setRoundResultMsg('');
        setRoundWinner(null);
        if (isGameOver) {
          setStatus('gameover');
        } else {
          setIsMyTurn(nextTurnIsMe);
          setPhase(nextTurnIsMe ? 'select_card' : 'waiting');
        }
      }, 2500);
    }
  }, [sendData]);

  // Setup connection handlers với ref để luôn dùng handleNetworkData mới nhất
  const handleNetworkDataRef = useRef(handleNetworkData);
  useEffect(() => { handleNetworkDataRef.current = handleNetworkData; }, [handleNetworkData]);

  function setupConnectionHandlers(conn) {
    conn.on('data', (data) => {
      handleNetworkDataRef.current(data); // luôn gọi phiên bản mới nhất
    });
    conn.on('close', () => {
      alert('Đối thủ đã thoát trận!');
      onExit();
    });
  }

  useEffect(() => {
    let peer = null;
    const initPeer = (attempt = 0) => {
      const generatedCode = attempt === 0 && !sessionStorage.getItem('panini_room_code')
        ? Math.floor(100000 + Math.random() * 900000).toString()
        : sessionStorage.getItem('panini_room_code') || Math.floor(100000 + Math.random() * 900000).toString();
      sessionStorage.setItem('panini_room_code', generatedCode);

      const myHostId = attempt === 0
        ? `wc26-panini-${generatedCode}`
        : `wc26-panini-${generatedCode}-${Math.floor(Math.random() * 10000)}`;

      peer = new Peer(myHostId);
      peer.on('open', () => {
        setPeerId(attempt === 0 ? generatedCode : `${generatedCode} (Tạm)`);
        if (initialJoinId && initialJoinId !== generatedCode) {
          const normalized = initialJoinId.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
          setStatus('connecting');
          const conn = peer.connect(`wc26-panini-${normalized}`);
          conn.on('open', () => {
            connRef.current = conn;
            setStatus('playing');
            setIsMyTurn(false);
            setPhase('waiting');
            setupConnectionHandlers(conn);
          });
        }
      });

      peer.on('connection', (conn) => {
        connRef.current = conn;
        setStatus('playing');
        setIsMyTurn(true);
        setPhase('select_card');
        setupConnectionHandlers(conn);
      });

      peer.on('error', (err) => {
        if (err.type === 'unavailable-id' && attempt === 0) {
          if (peer) peer.destroy();
          initPeer(1);
        } else if (err.type === 'peer-unavailable') {
          alert('Không tìm thấy đối thủ! Vui lòng kiểm tra mã phòng.');
          setStatus('lobby');
        } else {
          alert('Lỗi kết nối: ' + err.type);
          setStatus('lobby');
        }
      });

      peerInstance.current = peer;
    };

    initPeer(0);
    return () => { if (peer) peer.destroy(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const connectToPeer = () => {
    if (!remotePeerId.trim()) return;
    setStatus('connecting');
    const normalized = remotePeerId.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
    const conn = peerInstance.current.connect(`wc26-panini-${normalized}`);
    conn.on('open', () => {
      connRef.current = conn;
      setStatus('playing');
      setIsMyTurn(false);
      setPhase('waiting');
      setupConnectionHandlers(conn);
    });
  };

  // Chọn thẻ để tấn công
  function handleCardSelect(card) {
    if (phase !== 'select_card' && phase !== 'defend') return;
    if (phase === 'defend') {
      // Đang phòng thủ: chọn bài đỡ ngay
      setMyPlayedCard(card);
      setMyDeck(prev => prev.filter(c => c.id !== card.id));
      setIsMyTurn(false);
      setPhase('waiting');
      setRoundResultMsg('Đang phân định thắng thua...');
      sendData({ type: 'defend', card });
    } else {
      // Đang tấn công: chọn bài rồi chọn chỉ số
      setMyPlayedCard(card);
      setPhase('select_stat');
    }
  }

  // Chọn chỉ số tấn công
  function handleStatSelect(stat) {
    if (phase !== 'select_stat' || !myPlayedCard) return;
    const card = myPlayedCardRef.current;
    setMyDeck(prev => prev.filter(c => c.id !== card.id));
    setChallengeStat(stat);
    setIsMyTurn(false);
    setPhase('waiting');
    setRoundResultMsg(`Đang chờ đối thủ đỡ đòn ${stat.toUpperCase()}...`);
    sendData({ type: 'challenge', card, stat });
  }

  // Hủy chọn thẻ (khi đang ở phase select_stat, muốn đổi thẻ khác)
  function handleCancelCard() {
    setMyPlayedCard(null);
    setPhase('select_card');
  }

  // ===== UI =====
  if (status === 'lobby') {
    return (
      <div className="w-full max-w-4xl mx-auto flex flex-col mt-4 sm:mt-12 animate-fade-in relative z-10 px-4">
        <div className="flex justify-start mb-4">
          <button className="btn !bg-blue-600 hover:!bg-blue-500 !py-2 !px-4 text-sm flex items-center gap-2" onClick={onExit}>
            <ChevronLeft size={18} /> Về Sảnh
          </button>
        </div>
        <h2 className="text-4xl md:text-5xl font-black italic tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-amber-500 drop-shadow-lg mb-8 uppercase text-center flex justify-center items-center gap-4">
          <Wifi size={48} className="text-red-500" /> PVP ONLINE
        </h2>

        <div className="flex flex-col md:flex-row gap-8 w-full">
          {/* TẠO PHÒNG */}
          <div className="glass-panel p-8 rounded-3xl flex-1 flex flex-col items-center text-center">
            <h3 className="text-2xl font-bold mb-4 uppercase text-amber-400">Đợi Thách Đấu (Host)</h3>
            <p className="text-gray-400 mb-6">Gửi mã phòng 6 số cho bạn bè để bắt đầu.</p>
            {peerId ? (
              <div className="bg-black/50 p-4 rounded-xl border border-white/20 flex items-center gap-4 w-full justify-center">
                <span className="text-gray-400">Mã phòng:</span>
                <span className="font-black text-4xl tracking-[0.2em] text-amber-400 uppercase">{peerId}</span>
              </div>
            ) : (
              <div className="animate-pulse text-gray-500">Đang thiết lập mạng lưới...</div>
            )}
            <div className="mt-8 flex items-center justify-center gap-2 text-yellow-400 animate-pulse w-full">
              <span className="relative flex h-3 w-3"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-yellow-500"></span></span>
              Đang chờ bạn bè kết nối...
            </div>
            {peerId && (
              <div className="mt-6 flex flex-col items-center gap-4 w-full">
                <div className="bg-white p-2 rounded-xl shadow-[0_0_15px_rgba(255,255,255,0.3)]">
                  <QRCodeSVG value={`${window.location.origin}?pvp=${peerId.replace(' (Tạm)', '')}`} size={120} bgColor="#ffffff" fgColor="#000000" level="L" includeMargin={false} />
                </div>
                <button className="btn !bg-green-600 hover:!bg-green-500 flex justify-center items-center gap-2 w-full max-w-[200px]"
                  onClick={() => { const link = `${window.location.origin}?pvp=${peerId.replace(' (Tạm)', '')}`; navigator.clipboard.writeText(link); alert('Đã copy link mời!'); }}>
                  <Copy size={18} /> Sao Chép Link
                </button>
              </div>
            )}
          </div>

          {/* VÀO PHÒNG */}
          <div className="glass-panel p-8 rounded-3xl flex-1 flex flex-col items-center text-center">
            <h3 className="text-2xl font-bold mb-4 uppercase text-blue-400">Gửi Thách Đấu (Join)</h3>
            <p className="text-gray-400 mb-6">Nhập mã phòng 6 số của đối thủ để kết nối.</p>
            <input type="text" placeholder="MÃ PHÒNG (6 SỐ)"
              className="w-full bg-black/50 border border-white/20 rounded-xl p-4 text-center font-black text-3xl tracking-[0.2em] text-white focus:outline-none focus:border-blue-500 uppercase"
              value={remotePeerId} onChange={(e) => setRemotePeerId(e.target.value)} />
            <button className="btn !bg-blue-600 hover:!bg-blue-500 w-full mt-6 flex justify-center items-center gap-2"
              onClick={connectToPeer} disabled={!remotePeerId}>
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
        <h2 className="text-2xl font-bold text-white">Đang thiết lập kết nối...</h2>
      </div>
    );
  }

  // ===== MÀNG HÌNH THI ĐẤU =====
  return (
    <div className="w-full h-[100dvh] flex flex-col overflow-hidden bg-black/50 animate-fade-in relative z-10">
      {/* HUD */}
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
          {/* Sân Đấu */}
          <div className="flex-1 w-full relative bg-gradient-to-b from-red-900/10 via-black/40 to-blue-900/10 overflow-hidden flex flex-col justify-between py-4">
            
            {/* Vùng bài đối thủ (trên) */}
            <div className="h-[45%] w-full flex items-start justify-center pt-2">
              <div className="w-28 sm:w-40 aspect-[5/7] transition-all duration-500">
                {opponentPlayedCard ? (
                  (phase === 'defend') ? (
                    // Đang chờ mình đỡ — giấu bài đối thủ
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

            {/* Thông báo giữa sân */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[92%] text-center z-50 pointer-events-none flex flex-col items-center gap-2">
              {/* Kết quả vòng */}
              {roundResultMsg && (
                <div className={`inline-block px-4 sm:px-8 py-2 sm:py-3 rounded-full text-sm sm:text-xl font-black uppercase tracking-widest shadow-2xl border backdrop-blur-md
                  ${roundWinner === 'me' ? 'bg-green-900/80 border-green-400 text-green-300' : 
                    roundWinner === 'opponent' ? 'bg-red-900/80 border-red-400 text-red-300' : 
                    'bg-black/80 border-white/20 text-white'}`}>
                  {roundResultMsg}
                </div>
              )}
              {/* Chỉ số đang thách đấu */}
              {challengeStat && (
                <div className="text-xl sm:text-3xl font-black italic text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-yellow-400 uppercase drop-shadow-[0_0_15px_rgba(251,191,36,0.5)]">
                  Chỉ số: {challengeStat.toUpperCase()}
                </div>
              )}
              {/* Trạng thái lượt */}
              {!roundResultMsg && (
                <div className="inline-block bg-black/80 backdrop-blur-md border border-white/20 px-4 sm:px-6 py-1.5 sm:py-2 rounded-full text-xs sm:text-base font-bold uppercase tracking-widest">
                  {phase === 'select_card' && <span className="text-green-400">⚡ Lượt của bạn — chọn thẻ tấn công</span>}
                  {phase === 'select_stat' && <span className="text-yellow-400">🎯 Chọn chỉ số để thách đấu</span>}
                  {phase === 'defend' && <span className="text-orange-400">🛡 Chọn thẻ phòng thủ!</span>}
                  {phase === 'waiting' && <span className="text-gray-400">⏳ Đang chờ đối thủ...</span>}
                </div>
              )}
            </div>

            {/* Vùng bài của mình (dưới) */}
            <div className="h-[45%] w-full flex items-end justify-center pb-2">
              <div className="w-28 sm:w-40 aspect-[5/7] relative">
                {myPlayedCard ? (
                  <>
                    <CardComponent player={myPlayedCard} />
                    {/* Nút chọn chỉ số khi tấn công */}
                    {phase === 'select_stat' && (
                      <div className="absolute -top-14 left-1/2 -translate-x-1/2 flex gap-1 z-50 bg-black/90 p-1.5 rounded-xl border border-white/20 shadow-2xl">
                        <button className="bg-red-600 hover:bg-red-500 active:scale-95 text-white font-bold px-2 py-1.5 rounded-lg text-xs transition-all"
                          onClick={() => handleStatSelect('attack')}>
                          ⚔️ ATK<br/>{myPlayedCard.stats.attack}
                        </button>
                        <button className="bg-green-600 hover:bg-green-500 active:scale-95 text-white font-bold px-2 py-1.5 rounded-lg text-xs transition-all"
                          onClick={() => handleStatSelect('control')}>
                          🎮 CTRL<br/>{myPlayedCard.stats.control}
                        </button>
                        <button className="bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-bold px-2 py-1.5 rounded-lg text-xs transition-all"
                          onClick={() => handleStatSelect('defense')}>
                          🛡 DEF<br/>{myPlayedCard.stats.defense}
                        </button>
                        <button className="bg-gray-700 hover:bg-gray-600 active:scale-95 text-white font-bold px-2 py-1.5 rounded-lg text-xs transition-all"
                          onClick={handleCancelCard}>
                          ✕
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-blue-400/50 border-2 border-dashed border-blue-900/30 rounded-xl">
                    <span className="text-[10px] font-bold uppercase text-center px-2">
                      {phase === 'select_card' ? 'Chọn Bài' : phase === 'defend' ? 'Chọn Bài Đỡ' : '—'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Bài Trên Tay */}
          <div className="flex-none h-[25vh] sm:h-[30vh] w-full bg-black/80 border-t border-white/10 pb-4">
            <div className="px-4 py-1.5 flex justify-between items-center bg-white/5 border-b border-white/5">
              <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Bài Trên Tay</span>
              <span className="text-xs font-bold text-blue-400">{myDeck.length} lá</span>
            </div>
            <div className="h-full w-full overflow-x-auto overflow-y-hidden snap-x flex items-center px-4 pt-2 pb-6 hide-scrollbar">
              <div className="flex flex-row items-center justify-start min-w-max h-full space-x-[-40px] sm:space-x-2">
                {myDeck.map((player, idx) => {
                  const canSelect = (phase === 'select_card' || phase === 'defend') && !myPlayedCard;
                  return (
                    <div
                      key={player.id}
                      className={`h-[90%] sm:h-full aspect-[5/7] shrink-0 transition-all duration-300 transform ${
                        canSelect
                          ? 'cursor-pointer hover:-translate-y-6 hover:scale-110 z-10 relative shadow-2xl shadow-black'
                          : 'opacity-40 grayscale cursor-not-allowed translate-y-2'
                      }`}
                      style={{ zIndex: myDeck.length - idx }}
                      onClick={() => canSelect && handleCardSelect(player)}
                    >
                      <CardComponent player={player} />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
