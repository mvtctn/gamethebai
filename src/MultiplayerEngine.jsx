import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Peer } from 'peerjs';
import { Swords, Shield, Copy, ChevronLeft, Wifi, User } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

export default function MultiplayerEngine({ squad, currentUser, onExit, onWin, initialJoinId, CardComponent }) {
  const [peerId, setPeerId] = useState('');
  const [remotePeerId, setRemotePeerId] = useState(initialJoinId || '');
  const [status, setStatus] = useState('lobby'); // 'lobby' | 'connecting' | 'playing' | 'gameover'

  const peerInstance = useRef(null);
  const connRef = useRef(null); // Luôn trỏ đến connection hiện tại

  // --- Game State ---
  const [myDeck, setMyDeck] = useState([...squad]);
  const [opponentDeckCount, setOpponentDeckCount] = useState(squad.length);
  const [myScore, setMyScore] = useState(0);
  const [opponentScore, setOpponentScore] = useState(0);

  // phase: 'select_card' | 'select_stat' | 'defend' | 'waiting' | 'result'
  const [phase, setPhase] = useState('select_card');
  const [challengeStat, setChallengeStat] = useState(null);
  const [myPlayedCard, setMyPlayedCard] = useState(null);
  const [opponentPlayedCard, setOpponentPlayedCard] = useState(null);
  const [roundResultMsg, setRoundResultMsg] = useState('');
  const [roundWinner, setRoundWinner] = useState(null); // 'me' | 'opponent' | 'draw' | null

  // --- Refs cập nhật ĐỒNG BỘ để tránh stale closure trong async callbacks ---
  const myDeckRef = useRef([...squad]);
  const myPlayedCardRef = useRef(null);
  const challengeStatRef = useRef(null);
  const roundCountRef = useRef(0); // Đếm số vòng đấu; game kết thúc sau squad.length vòng

  // --- Gửi dữ liệu qua P2P ---
  const sendData = useCallback((data) => {
    if (connRef.current && connRef.current.open) {
      connRef.current.send(data);
    } else {
      console.warn('[PVP] sendData: connection not ready', connRef.current);
    }
  }, []);

  // --- Hàm reset state sau mỗi vòng ---
  const clearRoundState = useCallback((nextTurnIsMe, isGameOver) => {
    myPlayedCardRef.current = null;
    challengeStatRef.current = null;
    setMyPlayedCard(null);
    setOpponentPlayedCard(null);
    setChallengeStat(null);
    setRoundResultMsg('');
    setRoundWinner(null);
    if (isGameOver) {
      setStatus('gameover');
    } else {
      setPhase(nextTurnIsMe ? 'select_card' : 'waiting');
    }
  }, []);

  // --- Xử lý dữ liệu đến từ mạng ---
  // Dùng ref để luôn gọi phiên bản mới nhất, tránh stale closure
  const handleNetworkDataRef = useRef(null);

  useEffect(() => {
    handleNetworkDataRef.current = (data) => {
      // ---- NHẬN THÁCH ĐẤU (ta là DEFENDER) ----
      if (data.type === 'challenge') {
        challengeStatRef.current = data.stat;
        setOpponentPlayedCard(data.card);
        setOpponentDeckCount(prev => prev - 1);
        setChallengeStat(data.stat);
        setPhase('defend');
        setRoundResultMsg(`Đối thủ thách đấu: ${data.stat.toUpperCase()}! Chọn bài đỡ!`);
      }

      // ---- NHẬN BÀI ĐỠ (ta là ATTACKER, phân định kết quả) ----
      else if (data.type === 'defend') {
        const myCard = myPlayedCardRef.current;
        const stat = challengeStatRef.current;
        if (!myCard || !stat) {
          console.warn('[PVP] defend: missing myCard or stat', myCard, stat);
          return;
        }

        setOpponentPlayedCard(data.card);
        setOpponentDeckCount(prev => prev - 1);

        const myVal = myCard.stats[stat];
        const opVal = data.card.stats[stat];

        let winner, nextTurnIsMe;
        if (myVal > opVal) {
          winner = 'me';
          nextTurnIsMe = true; // attacker thắng → tiếp tục tấn công
          setMyScore(s => s + 1);
          setRoundResultMsg('BẠN THẮNG VÒNG NÀY! 🎉');
          setRoundWinner('me');
        } else if (opVal > myVal) {
          winner = 'opponent';
          nextTurnIsMe = false; // defender thắng → defender tấn công tiếp
          setOpponentScore(s => s + 1);
          setRoundResultMsg('BẠN THUA VÒNG NÀY! 😤');
          setRoundWinner('opponent');
        } else {
          winner = 'draw';
          nextTurnIsMe = true; // hòa → attacker tiếp tục
          setRoundResultMsg('HÒA! ⚖️');
          setRoundWinner('draw');
        }

        roundCountRef.current += 1;
        const isGameOver = roundCountRef.current >= squad.length;

        setPhase('result');

        // Gửi kết quả cho defender
        sendData({
          type: 'round_result',
          opponentCard: myCard,
          winner,
          nextTurnIsDefender: !nextTurnIsMe,
          isGameOver,
        });

        // Sau 2.5s reset và chuyển lượt
        setTimeout(() => clearRoundState(nextTurnIsMe, isGameOver), 2500);
      }

      // ---- NHẬN KẾT QUẢ VÒNG (ta là DEFENDER) ----
      else if (data.type === 'round_result') {
        const nextTurnIsMe = data.nextTurnIsDefender; // ta là defender
        const isGameOver = data.isGameOver;

        setOpponentPlayedCard(data.opponentCard);

        if (data.winner === 'me') {
          // attacker thắng → ta (defender) thua
          setOpponentScore(s => s + 1);
          setRoundResultMsg('BẠN THUA VÒNG NÀY! 😤');
          setRoundWinner('opponent');
        } else if (data.winner === 'opponent') {
          // attacker thua → ta (defender) thắng
          setMyScore(s => s + 1);
          setRoundResultMsg('BẠN THẮNG VÒNG NÀY! 🎉');
          setRoundWinner('me');
        } else {
          setRoundResultMsg('HÒA! ⚖️');
          setRoundWinner('draw');
        }

        roundCountRef.current += 1;
        setPhase('result');

        // Sau 2.5s reset và chuyển lượt
        setTimeout(() => clearRoundState(nextTurnIsMe, isGameOver), 2500);
      }
    };
  }); // Không có dependency array → luôn cập nhật mỗi render

  // --- Setup handlers cho connection ---
  function setupConnectionHandlers(conn) {
    conn.on('data', (data) => {
      if (handleNetworkDataRef.current) {
        handleNetworkDataRef.current(data);
      }
    });
    conn.on('close', () => {
      alert('Đối thủ đã thoát trận!');
      onExit();
    });
  }

  // --- Khởi tạo Peer ---
  useEffect(() => {
    let peer = null;

    const initPeer = (attempt = 0) => {
      const savedCode = sessionStorage.getItem('panini_room_code');
      const generatedCode = attempt === 0 && !savedCode
        ? Math.floor(100000 + Math.random() * 900000).toString()
        : savedCode || Math.floor(100000 + Math.random() * 900000).toString();

      sessionStorage.setItem('panini_room_code', generatedCode);
      const myHostId = attempt === 0
        ? `wc26-panini-${generatedCode}`
        : `wc26-panini-${generatedCode}-${Math.floor(Math.random() * 10000)}`;

      peer = new Peer(myHostId);
      peerInstance.current = peer;

      peer.on('open', () => {
        setPeerId(attempt === 0 ? generatedCode : `${generatedCode} (Tạm)`);

        // Nếu có initialJoinId → tự động join
        if (initialJoinId && initialJoinId !== generatedCode) {
          const normalized = initialJoinId.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
          setStatus('connecting');
          const conn = peer.connect(`wc26-panini-${normalized}`);
          conn.on('open', () => {
            connRef.current = conn;
            setStatus('playing');
            setPhase('waiting'); // Joiner chờ host tấn công trước
            setupConnectionHandlers(conn);
          });
          conn.on('error', (e) => console.error('[PVP] conn error', e));
        }
      });

      peer.on('connection', (conn) => {
        connRef.current = conn;
        setStatus('playing');
        setPhase('select_card'); // Host tấn công trước
        setupConnectionHandlers(conn);
      });

      peer.on('error', (err) => {
        console.error('[PVP] peer error', err);
        if (err.type === 'unavailable-id' && attempt === 0) {
          peer.destroy();
          initPeer(1);
        } else if (err.type === 'peer-unavailable') {
          alert('Không tìm thấy đối thủ! Kiểm tra lại mã phòng.');
          setStatus('lobby');
        } else {
          alert('Lỗi kết nối: ' + err.type);
          setStatus('lobby');
        }
      });
    };

    initPeer(0);
    return () => { if (peer) peer.destroy(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- Kết nối thủ công ---
  const connectToPeer = () => {
    if (!remotePeerId.trim()) return;
    setStatus('connecting');
    const normalized = remotePeerId.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
    const conn = peerInstance.current.connect(`wc26-panini-${normalized}`);
    conn.on('open', () => {
      connRef.current = conn;
      setStatus('playing');
      setPhase('waiting');
      setupConnectionHandlers(conn);
    });
  };

  // --- Chọn thẻ ---
  function handleCardSelect(card) {
    if (phase === 'defend' && !myPlayedCard) {
      // Phòng thủ — cập nhật refs ĐỒNG BỘ trước khi gửi
      const newDeck = myDeckRef.current.filter(c => c.id !== card.id);
      myDeckRef.current = newDeck;
      myPlayedCardRef.current = card;
      setMyPlayedCard(card);
      setMyDeck(newDeck);
      setPhase('waiting');
      setRoundResultMsg('Đang phân định thắng thua...');
      sendData({ type: 'defend', card });
    } else if (phase === 'select_card' && !myPlayedCard) {
      // Tấn công — chọn thẻ, chờ chọn chỉ số
      myPlayedCardRef.current = card;
      setMyPlayedCard(card);
      setPhase('select_stat');
    }
  }

  // --- Chọn chỉ số tấn công ---
  function handleStatSelect(stat) {
    if (phase !== 'select_stat' || !myPlayedCardRef.current) return;
    const card = myPlayedCardRef.current;
    // Cập nhật refs ĐỒNG BỘ
    const newDeck = myDeckRef.current.filter(c => c.id !== card.id);
    myDeckRef.current = newDeck;
    challengeStatRef.current = stat;
    setMyDeck(newDeck);
    setChallengeStat(stat);
    setPhase('waiting');
    setRoundResultMsg(`Đang chờ đối thủ đỡ đòn ${stat.toUpperCase()}...`);
    sendData({ type: 'challenge', card, stat });
  }

  // --- Hủy chọn thẻ ---
  function handleCancelCard() {
    myPlayedCardRef.current = null;
    setMyPlayedCard(null);
    setPhase('select_card');
  }

  // ===== LOBBY UI =====
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
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-yellow-500"></span>
              </span>
              Đang chờ bạn bè kết nối...
            </div>
            {peerId && (
              <div className="mt-6 flex flex-col items-center gap-4 w-full">
                <div className="bg-white p-2 rounded-xl shadow-[0_0_15px_rgba(255,255,255,0.3)]">
                  <QRCodeSVG value={`${window.location.origin}?pvp=${peerId.replace(' (Tạm)', '')}`} size={120} bgColor="#ffffff" fgColor="#000000" level="L" includeMargin={false} />
                </div>
                <button className="btn !bg-green-600 hover:!bg-green-500 flex justify-center items-center gap-2 w-full max-w-[200px]"
                  onClick={() => { navigator.clipboard.writeText(`${window.location.origin}?pvp=${peerId.replace(' (Tạm)', '')}`); alert('Đã copy link mời!'); }}>
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

  // ===== MÀN HÌNH THI ĐẤU =====
  return (
    <div className="w-full h-[100dvh] flex flex-col overflow-hidden bg-black/50 animate-fade-in relative z-10">

      {/* HUD điểm số */}
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

      {/* Game Over screen */}
      {status === 'gameover' ? (
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="glass-panel p-8 sm:p-12 rounded-3xl text-center w-full max-w-lg">
            <h2 className="text-4xl sm:text-5xl font-black mb-4 uppercase">
              {myScore > opponentScore
                ? <span className="text-green-400">Chiến Thắng! 🏆</span>
                : myScore < opponentScore
                ? <span className="text-red-400">Thất Bại! 😤</span>
                : <span className="text-yellow-400">Hòa Trận! ⚖️</span>}
            </h2>
            <p className="text-lg sm:text-xl mb-8">Tỉ số chung cuộc: {myScore} - {opponentScore}</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="btn !bg-gray-600 w-full sm:w-auto" onClick={onExit}>Thoát</button>
              {myScore > opponentScore && (
                <button className="btn !bg-yellow-500 text-black w-full sm:w-auto" onClick={() => { onWin(); onExit(); }}>
                  Nhận Thưởng 🎁
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Sân Đấu */}
          <div className="flex-1 w-full relative bg-gradient-to-b from-red-900/10 via-black/40 to-blue-900/10 overflow-hidden flex flex-col justify-between py-4">

            {/* Bài đối thủ (trên) */}
            <div className="h-[45%] w-full flex items-start justify-center pt-2">
              <div className="w-28 sm:w-40 aspect-[5/7] transition-all duration-500">
                {opponentPlayedCard ? (
                  phase === 'defend' ? (
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
              {roundResultMsg ? (
                <div className={`inline-block px-4 sm:px-8 py-2 sm:py-3 rounded-full text-sm sm:text-xl font-black uppercase tracking-widest shadow-2xl border backdrop-blur-md ${
                  roundWinner === 'me' ? 'bg-green-900/80 border-green-400 text-green-300' :
                  roundWinner === 'opponent' ? 'bg-red-900/80 border-red-400 text-red-300' :
                  'bg-black/80 border-white/20 text-white'}`}>
                  {roundResultMsg}
                </div>
              ) : (
                <div className="inline-block bg-black/80 backdrop-blur-md border border-white/20 px-4 sm:px-6 py-1.5 sm:py-2 rounded-full text-xs sm:text-base font-bold uppercase tracking-widest">
                  {phase === 'select_card' && <span className="text-green-400">⚡ Lượt của bạn — chọn thẻ tấn công</span>}
                  {phase === 'select_stat' && <span className="text-yellow-400">🎯 Chọn chỉ số để thách đấu</span>}
                  {phase === 'defend' && <span className="text-orange-400">🛡 Chọn thẻ phòng thủ!</span>}
                  {phase === 'waiting' && <span className="text-gray-400">⏳ Đang chờ đối thủ...</span>}
                  {phase === 'result' && <span className="text-gray-400">⏳ Đang xử lý...</span>}
                </div>
              )}
              {challengeStat && (
                <div className="text-xl sm:text-3xl font-black italic text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-yellow-400 uppercase">
                  Chỉ số: {challengeStat.toUpperCase()}
                </div>
              )}
            </div>

            {/* Bài của mình (dưới) */}
            <div className="h-[45%] w-full flex items-end justify-center pb-2">
              <div className="w-28 sm:w-40 aspect-[5/7] relative">
                {myPlayedCard ? (
                  <>
                    <CardComponent player={myPlayedCard} />
                    {phase === 'select_stat' && (
                      <div className="absolute -top-14 left-1/2 -translate-x-1/2 flex gap-1 z-50 bg-black/90 p-1.5 rounded-xl border border-white/20 shadow-2xl">
                        <button className="bg-red-600 hover:bg-red-500 active:scale-95 text-white font-bold px-2 py-1.5 rounded-lg text-xs transition-all"
                          onClick={() => handleStatSelect('attack')}>
                          ⚔️ ATK<br />{myPlayedCard.stats.attack}
                        </button>
                        <button className="bg-green-600 hover:bg-green-500 active:scale-95 text-white font-bold px-2 py-1.5 rounded-lg text-xs transition-all"
                          onClick={() => handleStatSelect('control')}>
                          🎮 CTRL<br />{myPlayedCard.stats.control}
                        </button>
                        <button className="bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-bold px-2 py-1.5 rounded-lg text-xs transition-all"
                          onClick={() => handleStatSelect('defense')}>
                          🛡 DEF<br />{myPlayedCard.stats.defense}
                        </button>
                        <button className="bg-gray-700 hover:bg-gray-600 active:scale-95 text-white font-bold px-2 py-1.5 rounded-lg text-xs transition-all"
                          onClick={handleCancelCard}>✕</button>
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
            <div className="h-full w-full overflow-x-auto overflow-y-hidden flex items-center px-4 pt-2 pb-6 hide-scrollbar">
              <div className="flex flex-row items-center justify-start min-w-max h-full space-x-[-40px] sm:space-x-2">
                {myDeck.map((player, idx) => {
                  const canSelect = (phase === 'select_card' || phase === 'defend') && !myPlayedCard;
                  return (
                    <div key={player.id}
                      className={`h-[90%] sm:h-full aspect-[5/7] shrink-0 transition-all duration-300 transform ${
                        canSelect
                          ? 'cursor-pointer hover:-translate-y-6 hover:scale-110 z-10 relative shadow-2xl shadow-black'
                          : 'opacity-40 grayscale cursor-not-allowed translate-y-2'}`}
                      style={{ zIndex: myDeck.length - idx }}
                      onClick={() => canSelect && handleCardSelect(player)}>
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
