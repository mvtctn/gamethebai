import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Peer } from 'peerjs';
import { Swords, Shield, Copy, ChevronLeft, Wifi, User } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

export default function MultiplayerEngine({ squad, currentUser, onExit, onWin, initialJoinId, CardComponent }) {
  const [peerId, setPeerId] = useState('');
  const [remotePeerId, setRemotePeerId] = useState(initialJoinId || '');
  const [status, setStatus] = useState('lobby');

  const peerInstance = useRef(null);
  const connRef = useRef(null);

  const [myDeck, setMyDeck] = useState([...squad]);
  const [opponentDeckCount, setOpponentDeckCount] = useState(squad.length);
  const [myScore, setMyScore] = useState(0);
  const [opponentScore, setOpponentScore] = useState(0);

  const [phase, setPhase] = useState('select_card');
  const [challengeStat, setChallengeStat] = useState(null);
  const [myPlayedCard, setMyPlayedCard] = useState(null);
  const [opponentPlayedCard, setOpponentPlayedCard] = useState(null);
  const [roundResultMsg, setRoundResultMsg] = useState('');
  const [roundWinner, setRoundWinner] = useState(null);

  const myDeckRef = useRef([...squad]);
  const myPlayedCardRef = useRef(null);
  const challengeStatRef = useRef(null);
  const roundCountRef = useRef(0);

  const sendData = useCallback((data) => {
    if (connRef.current && connRef.current.open) {
      connRef.current.send(data);
    } else {
      console.warn('[PVP] sendData: connection not ready');
    }
  }, []);

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

  const handleNetworkDataRef = useRef(null);

  useEffect(() => {
    handleNetworkDataRef.current = (data) => {
      if (data.type === 'challenge') {
        challengeStatRef.current = data.stat;
        setOpponentPlayedCard(data.card);
        setOpponentDeckCount(prev => prev - 1);
        setChallengeStat(data.stat);
        setPhase('defend');
        setRoundResultMsg(`Đối thủ thách đấu: ${data.stat.toUpperCase()}! Chọn bài đỡ!`);
      }
      else if (data.type === 'defend') {
        const myCard = myPlayedCardRef.current;
        const stat = challengeStatRef.current;
        if (!myCard || !stat) return;

        setOpponentPlayedCard(data.card);
        setOpponentDeckCount(prev => prev - 1);

        const myVal = myCard.stats[stat];
        const opVal = data.card.stats[stat];

        let winner, nextTurnIsMe;
        if (myVal > opVal) {
          winner = 'me'; nextTurnIsMe = true;
          setMyScore(s => s + 1);
          setRoundResultMsg('BẠN THẮNG VÒNG NÀY! 🎉');
          setRoundWinner('me');
        } else if (opVal > myVal) {
          winner = 'opponent'; nextTurnIsMe = false;
          setOpponentScore(s => s + 1);
          setRoundResultMsg('BẠN THUA VÒNG NÀY! 😤');
          setRoundWinner('opponent');
        } else {
          winner = 'draw'; nextTurnIsMe = true;
          setRoundResultMsg('HÒA! ⚖️');
          setRoundWinner('draw');
        }

        roundCountRef.current += 1;
        const isGameOver = roundCountRef.current >= squad.length;
        setPhase('result');

        sendData({ type: 'round_result', opponentCard: myCard, winner, nextTurnIsDefender: !nextTurnIsMe, isGameOver });
        setTimeout(() => clearRoundState(nextTurnIsMe, isGameOver), 2500);
      }
      else if (data.type === 'round_result') {
        const nextTurnIsMe = data.nextTurnIsDefender;
        const isGameOver = data.isGameOver;

        setOpponentPlayedCard(data.opponentCard);

        if (data.winner === 'me') {
          setOpponentScore(s => s + 1);
          setRoundResultMsg('BẠN THUA VÒNG NÀY! 😤');
          setRoundWinner('opponent');
        } else if (data.winner === 'opponent') {
          setMyScore(s => s + 1);
          setRoundResultMsg('BẠN THẮNG VÒNG NÀY! 🎉');
          setRoundWinner('me');
        } else {
          setRoundResultMsg('HÒA! ⚖️');
          setRoundWinner('draw');
        }

        roundCountRef.current += 1;
        setPhase('result');
        setTimeout(() => clearRoundState(nextTurnIsMe, isGameOver), 2500);
      }
    };
  });

  function setupConnectionHandlers(conn) {
    conn.on('data', (data) => { if (handleNetworkDataRef.current) handleNetworkDataRef.current(data); });
    conn.on('close', () => { alert('Đối thủ đã thoát trận!'); onExit(); });
  }

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
        if (initialJoinId && initialJoinId !== generatedCode) {
          const normalized = initialJoinId.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
          setStatus('connecting');
          const conn = peer.connect(`wc26-panini-${normalized}`);
          conn.on('open', () => { connRef.current = conn; setStatus('playing'); setPhase('waiting'); setupConnectionHandlers(conn); });
        }
      });

      peer.on('connection', (conn) => { connRef.current = conn; setStatus('playing'); setPhase('select_card'); setupConnectionHandlers(conn); });

      peer.on('error', (err) => {
        if (err.type === 'unavailable-id' && attempt === 0) { peer.destroy(); initPeer(1); }
        else if (err.type === 'peer-unavailable') { alert('Không tìm thấy đối thủ!'); setStatus('lobby'); }
        else { alert('Lỗi kết nối: ' + err.type); setStatus('lobby'); }
      });
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
    conn.on('open', () => { connRef.current = conn; setStatus('playing'); setPhase('waiting'); setupConnectionHandlers(conn); });
  };

  function handleCardSelect(card) {
    if (phase === 'defend' && !myPlayedCard) {
      const newDeck = myDeckRef.current.filter(c => c.id !== card.id);
      myDeckRef.current = newDeck;
      myPlayedCardRef.current = card;
      setMyPlayedCard(card);
      setMyDeck(newDeck);
      setPhase('waiting');
      setRoundResultMsg('Đang phân định thắng thua...');
      sendData({ type: 'defend', card });
    } else if (phase === 'select_card' && !myPlayedCard) {
      myPlayedCardRef.current = card;
      setMyPlayedCard(card);
      setPhase('select_stat');
    }
  }

  function handleStatSelect(stat) {
    if (phase !== 'select_stat' || !myPlayedCardRef.current) return;
    const card = myPlayedCardRef.current;
    const newDeck = myDeckRef.current.filter(c => c.id !== card.id);
    myDeckRef.current = newDeck;
    challengeStatRef.current = stat;
    setMyDeck(newDeck);
    setChallengeStat(stat);
    setPhase('waiting');
    setRoundResultMsg(`Đang chờ đối thủ đỡ đòn ${stat.toUpperCase()}...`);
    sendData({ type: 'challenge', card, stat });
  }

  function handleCancelCard() {
    myPlayedCardRef.current = null;
    setMyPlayedCard(null);
    setPhase('select_card');
  }

  const canSelect = (phase === 'select_card' || phase === 'defend') && !myPlayedCard;

  // ===== LOBBY UI =====
  if (status === 'lobby') {
    return (
      <div className="w-full max-w-2xl mx-auto flex flex-col mt-4 sm:mt-10 animate-fade-in relative z-10 px-4 pb-10">
        <div className="flex justify-start mb-5">
          <button className="btn !bg-blue-600 hover:!bg-blue-500 !py-2 !px-4 text-sm flex items-center gap-2" onClick={onExit}>
            <ChevronLeft size={18} /> Về Sảnh
          </button>
        </div>
        <h2 className="text-3xl sm:text-5xl font-black italic tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-amber-500 mb-6 uppercase text-center flex justify-center items-center gap-3">
          <Wifi size={36} className="text-red-500" /> PVP ONLINE
        </h2>
        <div className="flex flex-col gap-5 w-full">
          {/* TẠO PHÒNG */}
          <div className="glass-panel p-5 sm:p-7 rounded-3xl flex flex-col items-center text-center gap-3">
            <h3 className="text-base sm:text-xl font-bold uppercase text-amber-400">🏠 Tạo Phòng (Host)</h3>
            <p className="text-gray-400 text-sm">Chia sẻ mã phòng 6 số cho bạn bè để bắt đầu.</p>
            {peerId ? (
              <div className="bg-black/60 px-5 py-4 rounded-2xl border border-amber-500/40 w-full flex flex-col items-center gap-1">
                <span className="text-gray-400 text-[10px] uppercase tracking-widest">Mã Phòng</span>
                <span className="font-black text-5xl sm:text-6xl tracking-[0.3em] text-amber-400 drop-shadow-[0_0_20px_rgba(251,191,36,0.6)]">{peerId}</span>
              </div>
            ) : (
              <div className="animate-pulse text-gray-500 py-3">Đang thiết lập...</div>
            )}
            <div className="flex items-center gap-2 text-yellow-400 text-xs">
              <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-yellow-500"></span></span>
              Đang chờ đối thủ kết nối...
            </div>
            {peerId && (
              <div className="flex items-center gap-4">
                <div className="bg-white p-2 rounded-xl">
                  <QRCodeSVG value={`${window.location.origin}?pvp=${peerId.replace(' (Tạm)', '')}`} size={88} bgColor="#ffffff" fgColor="#000000" level="L" includeMargin={false} />
                </div>
                <button className="btn !bg-green-600 hover:!bg-green-500 flex flex-col items-center gap-1 px-5 py-4"
                  onClick={() => { navigator.clipboard.writeText(`${window.location.origin}?pvp=${peerId.replace(' (Tạm)', '')}`); alert('Đã copy link mời!'); }}>
                  <Copy size={20} /><span className="text-xs">Sao Chép Link</span>
                </button>
              </div>
            )}
          </div>

          {/* VÀO PHÒNG */}
          <div className="glass-panel p-5 sm:p-7 rounded-3xl flex flex-col items-center text-center gap-3">
            <h3 className="text-base sm:text-xl font-bold uppercase text-blue-400">⚔️ Vào Phòng (Join)</h3>
            <p className="text-gray-400 text-sm">Nhập mã 6 số từ đối thủ để tham chiến.</p>
            <input type="text" placeholder="• • • • • •" inputMode="numeric"
              className="w-full bg-black/60 border-2 border-white/20 rounded-2xl p-4 text-center font-black text-4xl sm:text-5xl tracking-[0.3em] text-white focus:outline-none focus:border-blue-400 transition-colors"
              value={remotePeerId} onChange={(e) => setRemotePeerId(e.target.value.replace(/\D/g, '').slice(0, 6))} />
            <button className="btn !bg-blue-600 hover:!bg-blue-500 w-full !py-4 text-lg flex justify-center items-center gap-2"
              onClick={connectToPeer} disabled={remotePeerId.length < 4}>
              <Swords size={20} /> Tham Chiến Ngay
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'connecting') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Wifi size={56} className="text-blue-500 animate-pulse" />
        <h2 className="text-xl font-bold text-white">Đang kết nối...</h2>
        <p className="text-gray-400 text-sm">Vui lòng chờ trong giây lát</p>
      </div>
    );
  }

  // ===== MÀN HÌNH THI ĐẤU =====
  return (
    <div className="w-full h-[100dvh] flex flex-col overflow-hidden animate-fade-in relative z-10"
      style={{ background: 'linear-gradient(180deg, #0d0015 0%, #080818 50%, #000d1a 100%)' }}>

      {/* HUD điểm số */}
      <div className="flex-none flex items-center justify-between px-4 py-2 sm:py-3 border-b border-white/10 bg-black/50 backdrop-blur-md shrink-0">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-900/60 rounded-full flex items-center justify-center border-2 border-red-500">
            <User className="text-red-400 w-5 h-5" />
          </div>
          <div>
            <div className="text-[9px] font-bold text-red-400 uppercase tracking-widest">Đối Thủ</div>
            <div className="text-3xl sm:text-4xl font-black text-white leading-none">{opponentScore}</div>
          </div>
        </div>

        <div className="flex flex-col items-center">
          <div className="text-[9px] font-bold tracking-widest text-gray-500 uppercase mb-0.5">
            Vòng {Math.min(roundCountRef.current + 1, squad.length)}/{squad.length}
          </div>
          <div className="text-xl sm:text-2xl font-black italic text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-blue-400">VS</div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 text-right">
          <div>
            <div className="text-[9px] font-bold text-blue-400 uppercase tracking-widest truncate max-w-[72px]">{currentUser}</div>
            <div className="text-3xl sm:text-4xl font-black text-white leading-none">{myScore}</div>
          </div>
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-900/60 rounded-full flex items-center justify-center border-2 border-blue-500">
            <User className="text-blue-400 w-5 h-5" />
          </div>
        </div>
      </div>

      {/* GAME OVER */}
      {status === 'gameover' ? (
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="glass-panel p-8 sm:p-12 rounded-3xl text-center w-full max-w-sm border border-white/10">
            <div className="text-6xl mb-4">{myScore > opponentScore ? '🏆' : myScore < opponentScore ? '😤' : '🤝'}</div>
            <h2 className="text-3xl sm:text-4xl font-black mb-3 uppercase">
              {myScore > opponentScore ? <span className="text-green-400">Chiến Thắng!</span>
                : myScore < opponentScore ? <span className="text-red-400">Thất Bại!</span>
                : <span className="text-yellow-400">Hòa Trận!</span>}
            </h2>
            <p className="text-xl mb-8 text-gray-300">Tỉ số: <span className="font-black text-white text-2xl">{myScore} – {opponentScore}</span></p>
            <div className="flex flex-col gap-3">
              <button className="btn !bg-gray-700 w-full !py-4" onClick={onExit}>Thoát</button>
              {myScore > opponentScore && (
                <button className="btn !bg-yellow-500 text-black w-full !py-4 font-black text-lg" onClick={() => { onWin(); onExit(); }}>
                  🎁 Nhận Thưởng
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col overflow-hidden">

          {/* SÂN ĐẤU */}
          <div className="flex-1 relative flex flex-col overflow-hidden" style={{ minHeight: 0 }}>

            {/* Đường phân cách giữa sân */}
            <div className="absolute top-1/2 left-8 right-8 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent pointer-events-none z-10" />

            {/* Khu vực đối thủ — phần trên */}
            <div className="flex-1 flex items-start justify-center pt-3 sm:pt-5">
              <div className="w-28 sm:w-40 md:w-48 lg:w-52 aspect-[5/7] transition-all duration-500">
                {opponentPlayedCard ? (
                  phase === 'defend' ? (
                    <div className="w-full h-full bg-gradient-to-b from-red-900/60 to-red-950/80 border-2 border-red-500/70 rounded-2xl flex flex-col items-center justify-center gap-2 shadow-[0_0_40px_rgba(239,68,68,0.35)]">
                      <Shield size={40} className="text-red-400 animate-pulse" />
                      <span className="text-red-300 text-xs font-black uppercase tracking-widest">Bí Mật</span>
                    </div>
                  ) : <CardComponent player={opponentPlayedCard} />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-red-400/30 border-2 border-dashed border-red-900/30 rounded-2xl gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-600/50 animate-ping" />
                    <span className="text-[9px] font-bold uppercase tracking-widest">Chờ địch</span>
                  </div>
                )}
              </div>
            </div>

            {/* THÔNG BÁO GIỮA SÂN */}
            <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 z-20 flex flex-col items-center gap-2 px-4 pointer-events-none">
              {roundResultMsg ? (
                <div className={`px-5 py-2.5 rounded-2xl text-sm sm:text-lg font-black uppercase tracking-wide shadow-2xl border backdrop-blur-xl text-center max-w-[280px] sm:max-w-sm ${
                  roundWinner === 'me'
                    ? 'bg-green-900/95 border-green-400 text-green-200'
                    : roundWinner === 'opponent'
                    ? 'bg-red-900/95 border-red-400 text-red-200'
                    : 'bg-slate-900/95 border-white/30 text-white'}`}>
                  {roundResultMsg}
                </div>
              ) : (
                <div className="bg-black/75 backdrop-blur-xl border border-white/20 px-5 py-2 rounded-full text-xs sm:text-sm font-bold uppercase tracking-wider">
                  {phase === 'select_card' && <span className="text-green-400">⚡ Lượt bạn — chọn thẻ</span>}
                  {phase === 'select_stat' && <span className="text-yellow-300">🎯 Chọn chỉ số thách đấu</span>}
                  {phase === 'defend' && <span className="text-orange-300">🛡️ Hãy chọn thẻ đỡ!</span>}
                  {phase === 'waiting' && <span className="text-gray-400">⏳ Chờ đối thủ...</span>}
                  {phase === 'result' && <span className="text-gray-500">⏳ Đang xử lý...</span>}
                </div>
              )}
              {challengeStat && !roundResultMsg && (
                <div className="text-lg sm:text-2xl font-black italic text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-yellow-300 uppercase">
                  Chỉ Số: {challengeStat.toUpperCase()}
                </div>
              )}
            </div>

            {/* Khu vực của tôi — phần dưới */}
            <div className="flex-1 flex items-end justify-center pb-3 sm:pb-5">
              <div className="relative">
                <div className="w-28 sm:w-40 md:w-48 lg:w-52 aspect-[5/7]">
                  {myPlayedCard ? (
                    <CardComponent player={myPlayedCard} />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-blue-400/30 border-2 border-dashed border-blue-900/30 rounded-2xl gap-2">
                      <span className="text-[9px] font-bold uppercase tracking-widest text-center px-2">
                        {phase === 'select_card' ? '👆 Chọn thẻ bên dưới' : phase === 'defend' ? '🛡 Chọn thẻ đỡ' : '—'}
                      </span>
                    </div>
                  )}
                </div>
                {/* Nút chọn chỉ số — hiện bên dưới thẻ */}
                {phase === 'select_stat' && myPlayedCard && (
                  <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 flex gap-2 z-50 pointer-events-auto">
                    {[
                      { key: 'attack', label: 'ATK', emoji: '⚔️', val: myPlayedCard.stats.attack, color: 'bg-red-600 border-red-400/60 shadow-red-900/60' },
                      { key: 'control', label: 'CTRL', emoji: '🎮', val: myPlayedCard.stats.control, color: 'bg-emerald-600 border-emerald-400/60 shadow-emerald-900/60' },
                      { key: 'defense', label: 'DEF', emoji: '🛡', val: myPlayedCard.stats.defense, color: 'bg-blue-600 border-blue-400/60 shadow-blue-900/60' },
                    ].map(b => (
                      <button key={b.key}
                        className={`${b.color} active:scale-90 text-white font-black py-2 px-3 rounded-xl text-center shadow-lg border flex flex-col items-center min-w-[52px] transition-transform`}
                        onClick={() => handleStatSelect(b.key)}>
                        <span className="text-base leading-none">{b.emoji}</span>
                        <span className="text-[9px] uppercase tracking-wide mt-0.5">{b.label}</span>
                        <span className="text-lg font-black leading-none">{b.val}</span>
                      </button>
                    ))}
                    <button
                      className="bg-gray-800 active:scale-90 text-gray-300 border border-gray-600 py-2 px-2.5 rounded-xl text-xs flex items-center justify-center font-bold transition-transform"
                      onClick={handleCancelCard}>✕</button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* BÀI TRÊN TAY */}
          <div className="flex-none bg-black/80 border-t border-white/10 backdrop-blur-md shrink-0"
            style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 8px)' }}>
            <div className="px-4 py-2 flex justify-between items-center border-b border-white/5">
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Bài Trên Tay</span>
              <span className="text-[10px] font-black text-blue-400 bg-blue-900/40 px-2 py-0.5 rounded-full">{myDeck.length} lá</span>
            </div>
            <div className="overflow-x-auto hide-scrollbar" style={{ height: 'clamp(88px, 17vw, 140px)' }}>
              <div className="flex flex-row items-center h-full px-3 py-2 gap-2 min-w-max">
                {myDeck.map((player, idx) => (
                  <div key={player.id}
                    className={`h-full aspect-[5/7] shrink-0 rounded-xl overflow-hidden transition-all duration-200 select-none ${
                      canSelect
                        ? 'cursor-pointer active:scale-90 hover:-translate-y-3 hover:shadow-2xl hover:shadow-black hover:ring-2 hover:ring-white/40'
                        : 'opacity-30 grayscale cursor-not-allowed'}`}
                    style={{ zIndex: myDeck.length - idx }}
                    onClick={() => canSelect && handleCardSelect(player)}>
                    <CardComponent player={player} />
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
