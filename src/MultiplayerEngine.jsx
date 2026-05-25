import { useState, useEffect, useRef, useCallback } from 'react';
import { Peer } from 'peerjs';
import { Swords, Shield, Copy, ChevronLeft, Wifi, User } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import confetti from 'canvas-confetti';

const playFx = (type) => {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    const now = audioCtx.currentTime;

    if (type === 'click') {
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(800, now);
      oscillator.frequency.exponentialRampToValueAtTime(300, now + 0.1);
      gainNode.gain.setValueAtTime(0.1, now);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
      oscillator.start(now);
      oscillator.stop(now + 0.1);
    } else if (type === 'winPoint') {
      // Giai điệu trưởng cực kỳ vui tươi & phấn khởi (C5 -> E5 -> G5 -> C6)
      const notes = [523.25, 659.25, 783.99, 1046.50];
      oscillator.type = 'triangle';
      notes.forEach((freq, i) => {
        oscillator.frequency.setValueAtTime(freq, now + i * 0.08);
      });
      gainNode.gain.setValueAtTime(0.15, now);
      gainNode.gain.setValueAtTime(0.15, now + 0.25);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
      oscillator.start(now);
      oscillator.stop(now + 0.4);
      new Audio('https://actions.google.com/sounds/v1/crowds/crowd_cheer.ogg').play().catch(()=>{});
    } else if (type === 'losePoint') {
      // Giai điệu thứ buồn bã, thất vọng đi xuống (G4 -> Eb4 -> C4 -> B3)
      const notes = [392.00, 311.13, 261.63, 246.94];
      oscillator.type = 'sawtooth';
      notes.forEach((freq, i) => {
        oscillator.frequency.setValueAtTime(freq, now + i * 0.1);
      });
      gainNode.gain.setValueAtTime(0.1, now);
      gainNode.gain.linearRampToValueAtTime(0, now + 0.45);
      oscillator.start(now);
      oscillator.stop(now + 0.45);
      new Audio('https://actions.google.com/sounds/v1/weather/thunder_crack.ogg').play().catch(()=>{});
    } else if (type === 'drawPoint') {
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(1000, now);
      oscillator.frequency.linearRampToValueAtTime(1200, now + 0.15);
      gainNode.gain.setValueAtTime(0.08, now);
      gainNode.gain.linearRampToValueAtTime(0, now + 0.15);
      oscillator.start(now);
      oscillator.stop(now + 0.15);
      setTimeout(() => {
        try {
          const ctx2 = new (window.AudioContext || window.webkitAudioContext)();
          const osc2 = ctx2.createOscillator();
          const gain2 = ctx2.createGain();
          osc2.connect(gain2);
          gain2.connect(ctx2.destination);
          const t2 = ctx2.currentTime;
          osc2.type = 'sine';
          osc2.frequency.setValueAtTime(1000, t2);
          osc2.frequency.linearRampToValueAtTime(1200, t2 + 0.25);
          gain2.gain.setValueAtTime(0.08, t2);
          gain2.gain.linearRampToValueAtTime(0, t2 + 0.25);
          osc2.start(t2);
          osc2.stop(t2 + 0.25);
        } catch { /* ignore */ }
      }, 100);
    } else if (type === 'winGame') {
      // Khúc nhạc khải hoàn chiến thắng hoành tráng (C5 -> G5 -> E5 -> G5 -> C6)
      const notes = [523.25, 783.99, 659.25, 783.99, 1046.50];
      oscillator.type = 'triangle';
      notes.forEach((freq, i) => {
        oscillator.frequency.setValueAtTime(freq, now + i * 0.15);
      });
      gainNode.gain.setValueAtTime(0.15, now);
      gainNode.gain.setValueAtTime(0.15, now + 0.60);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.85);
      oscillator.start(now);
      oscillator.stop(now + 0.85);
      confetti({ particleCount: 300, spread: 100, origin: { y: 0.6 } });
      new Audio('https://actions.google.com/sounds/v1/crowds/crowd_cheer.ogg').play().catch(()=>{});
    } else if (type === 'loseGame') {
      // Nhạc Game Over u sầu, chậm rãi thất bại hoàn toàn (C4 -> G3 -> Eb3 -> B2)
      const notes = [261.63, 196.00, 155.56, 123.47];
      oscillator.type = 'sawtooth';
      notes.forEach((freq, i) => {
        oscillator.frequency.setValueAtTime(freq, now + i * 0.25);
      });
      gainNode.gain.setValueAtTime(0.12, now);
      gainNode.gain.linearRampToValueAtTime(0, now + 1.1);
      oscillator.start(now);
      oscillator.stop(now + 1.1);
      new Audio('https://actions.google.com/sounds/v1/weather/thunder_crack.ogg').play().catch(()=>{});
    }
  } catch (e) {
    console.error('Audio play error:', e);
  }
};

export default function MultiplayerEngine({ squad, currentUser, onExit, onWin, initialJoinId, CardComponent }) {
  const [peerId, setPeerId] = useState('');
  const [remotePeerId, setRemotePeerId] = useState(initialJoinId || '');
  const [status, setStatus] = useState('lobby'); // 'lobby', 'connecting', 'playing', 'gameover'

  const peerInstance = useRef(null);
  const connRef = useRef(null);

  const [myDeck, setMyDeck] = useState([...squad]);
  const [opponentDeckCount, setOpponentDeckCount] = useState(squad.length);
  const [myScore, setMyScore] = useState(0);
  const [opponentScore, setOpponentScore] = useState(0);

  // Simultaneous PvP state variables
  const [phase, setPhase] = useState('select_card'); // 'waiting_start', 'select_card', 'waiting', 'result'
  const [activeStat, setActiveStat] = useState('attack'); // 'attack', 'control', 'defense'
  const [myPlayedCard, setMyPlayedCard] = useState(null);
  const [opponentPlayedCard, setOpponentPlayedCard] = useState(null);
  const [roundResultMsg, setRoundResultMsg] = useState('');
  const [roundWinner, setRoundWinner] = useState(null); // 'me', 'opponent', 'draw'
  const [roundCount, setRoundCount] = useState(0); // Kept in state specifically for render-time safety
  const [copiedCode, setCopiedCode] = useState(false);
  const [pvpAlert, setPvpAlert] = useState(null); // Custom in-game dialog alert: { title, message, onClose }

  const handleCopyCode = () => {
    if (!peerId) return;
    const cleanCode = peerId.replace(' (Tạm)', '');
    navigator.clipboard.writeText(cleanCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 1500);
  };

  // Stable references for connection callbacks to prevent stale state issues
  const myDeckRef = useRef([...squad]);
  const myPlayedCardRef = useRef(null);
  const opponentPlayedCardRef = useRef(null);
  const opponentPlayedStatRef = useRef(null);
  const activeStatRef = useRef('attack');
  const isHostRef = useRef(false);
  const roundCountRef = useRef(0);
  const phaseRef = useRef('select_card');

  const updateActiveStat = (stat) => {
    setActiveStat(stat);
    activeStatRef.current = stat;
  };

  const updatePhase = (newPhase) => {
    setPhase(newPhase);
    phaseRef.current = newPhase;
  };

  const sendData = useCallback((data) => {
    if (connRef.current && connRef.current.open) {
      connRef.current.send(data);
    } else {
      console.warn('[PVP] sendData: connection not ready');
    }
  }, []);

  const calculateRoundResult = useCallback((myCard, opCard, currentStat) => {
    if (phaseRef.current === 'result') return;

    let winner;
    const myVal = myCard.stats[currentStat];
    const opVal = opCard.stats[currentStat];

    if (myVal > opVal) {
      winner = 'me';
      setMyScore(s => s + 1);
      setRoundResultMsg(`BẠN THẮNG VÒNG NÀY! 🎉 (${myVal} > ${opVal})`);
      playFx('winPoint');
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#22c55e', '#3b82f6', '#fbbf24']
      });
    } else if (opVal > myVal) {
      winner = 'opponent';
      setOpponentScore(s => s + 1);
      setRoundResultMsg(`BẠN THUA VÒNG NÀY! 😤 (${myVal} < ${opVal})`);
      playFx('losePoint');
    } else {
      winner = 'draw';
      setRoundResultMsg(`HÒA! ⚖️ (${myVal} = ${opVal})`);
      playFx('drawPoint');
    }

    setRoundWinner(winner);
    updatePhase('result');
    roundCountRef.current += 1;
    setRoundCount(prev => prev + 1);
    const isGameOver = roundCountRef.current >= squad.length;

    setTimeout(() => {
      // Reset values for the next round
      myPlayedCardRef.current = null;
      opponentPlayedCardRef.current = null;
      opponentPlayedStatRef.current = null;
      setMyPlayedCard(null);
      setOpponentPlayedCard(null);
      setRoundResultMsg('');
      setRoundWinner(null);

      if (isGameOver) {
        setStatus('gameover');
      } else {
        if (isHostRef.current) {
          // Host generates next stat and pushes to guest
          const stats = ['attack', 'control', 'defense'];
          const nextStat = stats[Math.floor(Math.random() * stats.length)];
          updateActiveStat(nextStat);
          updatePhase('select_card');
          sendData({ type: 'start_round', stat: nextStat, roundIndex: roundCountRef.current });
        } else {
          // GUEST ONLY: Only transition to waiting_start if we haven't already transitioned
          // to select_card via a fast-arriving network 'start_round' message.
          if (phaseRef.current === 'result') {
            updatePhase('waiting_start');
            setRoundResultMsg('Đang chờ máy chủ bắt đầu vòng mới...');
          }
        }
      }
    }, 2500);
  }, [squad.length, sendData]);

  const handleNetworkData = useCallback((data) => {
    if (data.type === 'ready') {
      console.log('[PVP] Guest connected and ready! Initializing first round...');
      const stats = ['attack', 'control', 'defense'];
      const firstStat = stats[Math.floor(Math.random() * stats.length)];
      updateActiveStat(firstStat);
      updatePhase('select_card');
      setTimeout(() => {
        sendData({ type: 'start_round', stat: firstStat, roundIndex: 0 });
      }, 300);
    }
    else if (data.type === 'start_round') {
      // Synchronize round count
      roundCountRef.current = data.roundIndex;
      setRoundCount(data.roundIndex);

      // Clear played cards for the new round immediately to avoid race condition!
      myPlayedCardRef.current = null;
      opponentPlayedCardRef.current = null;
      opponentPlayedStatRef.current = null;
      setMyPlayedCard(null);
      setOpponentPlayedCard(null);
      setRoundWinner(null);
      setRoundResultMsg('');

      updateActiveStat(data.stat);
      updatePhase('select_card');
    }
    else if (data.type === 'play_card') {
      // Verify round index to avoid race conditions!
      if (data.roundIndex !== roundCountRef.current) {
        console.warn(`[PVP] Stale/future play_card received: message index ${data.roundIndex}, current index ${roundCountRef.current}`);
        return;
      }
      opponentPlayedCardRef.current = data.card;
      opponentPlayedStatRef.current = data.stat;
      setOpponentPlayedCard(data.card);
      setOpponentDeckCount(prev => prev - 1);

      if (myPlayedCardRef.current) {
        calculateRoundResult(myPlayedCardRef.current, data.card, data.stat);
      }
    }
  }, [calculateRoundResult, sendData]);

  const setupConnectionHandlers = useCallback((conn) => {
    conn.on('data', (data) => {
      handleNetworkData(data);
    });
    conn.on('close', () => {
      setPvpAlert({
        title: 'Mất Kết Nối ⚠️',
        message: 'Đối thủ đã thoát trận hoặc bị gián đoạn kết nối!',
        onClose: () => {
          onExit();
        }
      });
    });
  }, [handleNetworkData, onExit]);

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
          isHostRef.current = false;
          const conn = peer.connect(`wc26-panini-${normalized}`);
          conn.on('open', () => {
            connRef.current = conn;
            setStatus('playing');
            updatePhase('waiting_start');
            setupConnectionHandlers(conn);
            // GUEST sends ready signal once open!
            setTimeout(() => {
              conn.send({ type: 'ready' });
            }, 500);
          });
        } else {
          isHostRef.current = true;
        }
      });

      peer.on('connection', (conn) => {
        connRef.current = conn;
        setStatus('playing');
        isHostRef.current = true;
        setupConnectionHandlers(conn);
      });

      peer.on('error', (err) => {
        if (err.type === 'unavailable-id' && attempt === 0) {
          peer.destroy();
          initPeer(1);
        } else if (err.type === 'peer-unavailable') {
          setPvpAlert({
            title: 'Không Tìm Thấy 🔍',
            message: 'Không tìm thấy HLV đối thủ với mã đã cho! Vui lòng kiểm tra lại.',
            onClose: () => {
              setStatus('lobby');
            }
          });
        } else {
          setPvpAlert({
            title: 'Lỗi Kết Nối ❌',
            message: `Lỗi kết nối mạng PVP (Mã lỗi: ${err.type}).`,
            onClose: () => {
              setStatus('lobby');
            }
          });
        }
      });
    };

    initPeer(0);

    return () => {
      if (peer) peer.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (status === 'gameover') {
      if (myScore > opponentScore) {
        playFx('winGame');
      } else if (myScore < opponentScore) {
        playFx('loseGame');
      } else {
        playFx('drawPoint');
      }
    }
  }, [status, myScore, opponentScore]);

  const connectToPeer = () => {
    if (!remotePeerId.trim()) return;
    setStatus('connecting');
    isHostRef.current = false;
    const normalized = remotePeerId.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
    const conn = peerInstance.current.connect(`wc26-panini-${normalized}`);
    conn.on('open', () => {
      connRef.current = conn;
      setStatus('playing');
      updatePhase('waiting_start');
      setupConnectionHandlers(conn);
      // GUEST sends ready signal on manual connect
      setTimeout(() => {
        conn.send({ type: 'ready' });
      }, 500);
    });
  };

  function handleCardSelect(card) {
    if (phase === 'select_card' && !myPlayedCard) {
      playFx('click');
      const newDeck = myDeckRef.current.filter(c => c.id !== card.id);
      myDeckRef.current = newDeck;
      myPlayedCardRef.current = card;
      setMyPlayedCard(card);
      setMyDeck(newDeck);

      // Broadcast play card to opponent
      sendData({ type: 'play_card', card, roundIndex: roundCountRef.current, stat: activeStatRef.current });

      if (opponentPlayedCardRef.current) {
        calculateRoundResult(card, opponentPlayedCardRef.current, opponentPlayedStatRef.current || activeStatRef.current);
      } else {
        updatePhase('waiting');
        setRoundResultMsg('Đang chờ đối thủ ra bài...');
      }
    }
  }

  const canSelect = phase === 'select_card' && !myPlayedCard;

  // Render Stat Name in Vietnamese with gorgeous color tags
  const getStatInfo = (statKey) => {
    switch (statKey) {
      case 'attack':
        return { name: 'Tấn Công (ATK)', color: 'from-red-500 to-rose-600', emoji: '⚔️' };
      case 'control':
        return { name: 'Kiểm Soát (CTRL)', color: 'from-emerald-400 to-teal-600', emoji: '🎮' };
      case 'defense':
        return { name: 'Phòng Ngự (DEF)', color: 'from-blue-500 to-indigo-600', emoji: '🛡️' };
      default:
        return { name: statKey.toUpperCase(), color: 'from-gray-500 to-slate-600', emoji: '⚽' };
    }
  };

  const statInfo = getStatInfo(activeStat);

  // ===== LOBBY UI =====
  if (status === 'lobby') {
    return (
      <div className="w-full max-w-2xl mx-auto flex flex-col mt-4 sm:mt-10 animate-fade-in relative z-10 px-4 pb-10">
        <div className="flex justify-start mb-5">
          <button className="btn !bg-blue-600 hover:!bg-blue-500 !py-2 !px-4 text-sm flex items-center gap-2 animate-bounce-subtle" onClick={onExit}>
            <ChevronLeft size={18} /> Về Sảnh
          </button>
        </div>
        <h2 className="text-3xl sm:text-5xl font-black italic tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-amber-500 mb-6 uppercase text-center flex justify-center items-center gap-3 drop-shadow-[0_4px_10px_rgba(239,68,68,0.3)]">
          <Wifi size={36} className="text-red-500 animate-pulse" /> PVP ONLINE
        </h2>
        <div className="flex flex-col gap-5 w-full">
          {/* TẠO PHÒNG */}
          <div className="glass-panel p-5 sm:p-7 rounded-3xl flex flex-col items-center text-center gap-3 border border-amber-500/20 shadow-[0_0_30px_rgba(251,191,36,0.15)]">
            <h3 className="text-base sm:text-xl font-bold uppercase text-amber-400 tracking-wider">🏠 Tạo Phòng (Host)</h3>
            <p className="text-gray-400 text-sm">Chia sẻ mã phòng 6 số hoặc liên kết cho bạn bè để bắt đầu.</p>
            {peerId ? (
              <div 
                className="bg-black/60 px-5 py-4 rounded-2xl border border-amber-500/40 w-full flex flex-col items-center gap-1 cursor-pointer hover:border-amber-400 hover:bg-black/80 hover:shadow-[0_0_25px_rgba(251,191,36,0.25)] active:scale-98 transition-all relative group"
                onClick={handleCopyCode}
                title="Click để sao chép nhanh mã phòng"
              >
                <span className="text-gray-400 text-[10px] uppercase tracking-widest group-hover:text-amber-400 transition-colors">
                  {copiedCode ? '✅ ĐÃ SAO CHÉP MÃ!' : 'Mã Phòng (Click để sao chép nhanh)'}
                </span>
                <span className="font-black text-5xl sm:text-6xl tracking-[0.3em] text-amber-400 drop-shadow-[0_0_20px_rgba(251,191,36,0.6)] pl-[0.3em] transition-transform duration-200 group-hover:scale-105">
                  {peerId}
                </span>
              </div>
            ) : (
              <div className="animate-pulse text-gray-500 py-3">Đang thiết lập...</div>
            )}
            <div className="flex items-center gap-2 text-yellow-400 text-xs">
              <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-yellow-500"></span></span>
              Đang chờ đối thủ kết nối...
            </div>
            {peerId && (
              <div className="flex items-center gap-4 mt-2">
                <div className="bg-white p-2 rounded-xl border-2 border-amber-500/40">
                  <QRCodeSVG value={`${window.location.origin}?pvp=${peerId.replace(' (Tạm)', '')}`} size={88} bgColor="#ffffff" fgColor="#000000" level="L" includeMargin={false} />
                </div>
                <button className="btn !bg-green-600 hover:!bg-green-500 flex flex-col items-center gap-1 px-5 py-4 shadow-lg shadow-green-900/40 active:scale-95 transition-transform"
                  onClick={() => { navigator.clipboard.writeText(`${window.location.origin}?pvp=${peerId.replace(' (Tạm)', '')}`); alert('Đã copy link mời!'); }}>
                  <Copy size={20} /><span className="text-xs">Sao Chép Link</span>
                </button>
              </div>
            )}
          </div>

          {/* VÀO PHÒNG */}
          <div className="glass-panel p-5 sm:p-7 rounded-3xl flex flex-col items-center text-center gap-3 border border-blue-500/20 shadow-[0_0_30px_rgba(59,130,246,0.15)]">
            <h3 className="text-base sm:text-xl font-bold uppercase text-blue-400 tracking-wider">⚔️ Vào Phòng (Join)</h3>
            <p className="text-gray-400 text-sm">Nhập mã 6 số từ đối thủ để tham chiến.</p>
            <input type="text" placeholder="• • • • • •" inputMode="numeric"
              className="w-full bg-black/60 border-2 border-white/20 rounded-2xl p-4 text-center font-black text-4xl sm:text-5xl tracking-[0.3em] text-white focus:outline-none focus:border-blue-400 transition-colors shadow-inner"
              value={remotePeerId} onChange={(e) => setRemotePeerId(e.target.value.replace(/\D/g, '').slice(0, 6))} />
            <button className="btn !bg-blue-600 hover:!bg-blue-500 w-full !py-4 text-lg flex justify-center items-center gap-2 shadow-lg shadow-blue-900/50 active:scale-98 transition-transform"
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
        <h2 className="text-xl font-bold text-white tracking-widest">Đang kết nối...</h2>
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
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-900/60 rounded-full flex items-center justify-center border-2 border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]">
            <User className="text-red-400 w-5 h-5" />
          </div>
          <div>
            <div className="text-[9px] font-bold text-red-400 uppercase tracking-widest">Đối Thủ ({opponentDeckCount} lá)</div>
            <div className="text-3xl sm:text-4xl font-black text-white leading-none">{opponentScore}</div>
          </div>
        </div>

        <div className="flex flex-col items-center">
          <div className="text-[9px] font-bold tracking-widest text-gray-500 uppercase mb-0.5">
            Vòng {Math.min(roundCount + 1, squad.length)}/{squad.length}
          </div>
          <div className="text-xl sm:text-2xl font-black italic text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-blue-400">VS</div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 text-right">
          <div>
            <div className="text-[9px] font-bold text-blue-400 uppercase tracking-widest truncate max-w-[72px]">{currentUser}</div>
            <div className="text-3xl sm:text-4xl font-black text-white leading-none">{myScore}</div>
          </div>
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-900/60 rounded-full flex items-center justify-center border-2 border-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]">
            <User className="text-blue-400 w-5 h-5" />
          </div>
        </div>
      </div>

      {/* GAME OVER */}
      {status === 'gameover' ? (
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="glass-panel p-8 sm:p-12 rounded-3xl text-center w-full max-w-sm border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.6)]">
            <div className="text-6xl mb-4">{myScore > opponentScore ? '🏆' : myScore < opponentScore ? '😤' : '🤝'}</div>
            <h2 className="text-3xl sm:text-4xl font-black mb-3 uppercase tracking-wider">
              {myScore > opponentScore ? <span className="text-green-400">Chiến Thắng!</span>
                : myScore < opponentScore ? <span className="text-red-400">Thất Bại!</span>
                : <span className="text-yellow-400">Hòa Trận!</span>}
            </h2>
            <p className="text-xl mb-8 text-gray-300">Tỉ số: <span className="font-black text-white text-2xl">{myScore} – {opponentScore}</span></p>
            <div className="flex flex-col gap-3">
              <button className="btn !bg-gray-700 w-full !py-4 active:scale-95 transition-transform" onClick={() => onExit(myScore === opponentScore ? 'draw' : 'lose')}>Thoát</button>
              {myScore > opponentScore && (
                <button className="btn !bg-yellow-500 text-black w-full !py-4 font-black text-lg shadow-lg shadow-yellow-500/20 active:scale-95 transition-transform" onClick={() => { onWin(); onExit('win'); }}>
                  🎁 Nhận Thưởng
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col overflow-hidden">

          {/* SÂN ĐẤU */}
          <div className="stadium-battlefield animate-fade-in" style={{ minHeight: 0 }}>
            <style>{`
              .stadium-battlefield {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                gap: 1.5rem;
                position: relative;
                flex: 1 1 0%;
                overflow: hidden;
                width: 100%;
                padding: 1rem;
              }

              /* MÀN HÌNH CHỮ NHẬT / DESKTOP (Chiều rộng lớn hơn chiều cao) */
              @media (min-aspect-ratio: 1.1/1) and (min-width: 640px) {
                .stadium-battlefield {
                  flex-direction: row-reverse !important;
                  gap: 8vw !important;
                  padding-left: 2rem !important;
                  padding-right: 2rem !important;
                }
                .stadium-card-wrapper {
                  flex: none !important;
                  align-items: center !important;
                  padding: 0 !important;
                }
                .stadium-separator-h {
                  display: none !important;
                }
                .stadium-separator-v {
                  display: block !important;
                }
              }

              /* MÀN HÌNH DỌC / ĐIỆN THOẠI (Chiều cao lớn hơn chiều rộng) */
              @media (max-aspect-ratio: 1.1/1), (max-width: 639px) {
                .stadium-battlefield {
                  flex-direction: column !important;
                  gap: 1rem !important;
                }
                .stadium-card-wrapper {
                  flex: 1 1 0% !important;
                }
                .stadium-card-wrapper-opp {
                  align-items: flex-start !important;
                  padding-top: 1.5rem !important;
                  padding-bottom: 0 !important;
                }
                .stadium-card-wrapper-my {
                  align-items: flex-end !important;
                  padding-bottom: 1.5rem !important;
                  padding-top: 0 !important;
                }
                .stadium-separator-h {
                  display: block !important;
                }
                .stadium-separator-v {
                  display: none !important;
                }
              }
            `}</style>

            {/* Battle Overlay for Effects */}
            {phase === 'result' && (
              <div className={`battle-overlay active ${
                roundResultMsg.includes('THÃ”NG') || roundResultMsg.includes('THẮNG') ? '' : 
                roundResultMsg.includes('THUA') ? 'cloud-overlay' : 'draw-overlay'
              }`}></div>
            )}

            {/* Đường phân cách giữa sân (Ngang trên Mobile, Dọc trên Desktop) */}
            <div className="stadium-separator-h absolute top-1/2 left-8 right-8 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent pointer-events-none z-10" />
            <div className="stadium-separator-v absolute left-1/2 top-12 bottom-12 w-px bg-gradient-to-b from-transparent via-white/15 to-transparent pointer-events-none z-10" />

            {/* Khu vực đối thủ — bên phải trên Desktop, bên trên trên Mobile */}
            <div className="stadium-card-wrapper stadium-card-wrapper-opp flex justify-center z-10">
              <div className="w-28 sm:w-40 md:w-56 lg:w-64 xl:w-72 aspect-[5/7] transition-all duration-300">
                {opponentPlayedCard ? (
                  phase === 'result' ? (
                    <CardComponent player={opponentPlayedCard} />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-b from-red-950 via-slate-900 to-blue-950 border-2 border-red-500/70 rounded-2xl flex flex-col items-center justify-center gap-2 shadow-[0_0_30px_rgba(239,68,68,0.4)] animate-pulse">
                      <div className="relative">
                        <Shield size={44} className="text-red-500 animate-bounce" />
                        <Swords size={20} className="text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                      </div>
                      <span className="text-red-400 text-xs font-black uppercase tracking-widest">ĐÃ CHỌN 🛡️</span>
                    </div>
                  )
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-red-500/20 border-2 border-dashed border-red-900/30 rounded-2xl gap-2 bg-black/25 backdrop-blur-sm">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/50 animate-ping" />
                    <span className="text-[10px] md:text-xs font-black uppercase tracking-widest text-center px-1 leading-normal">Đối thủ<br/>đang chọn...</span>
                  </div>
                )}
              </div>
            </div>

            {/* Khu vực của tôi — bên trái trên Desktop, bên dưới trên Mobile */}
            <div className="stadium-card-wrapper stadium-card-wrapper-my flex justify-center z-10">
              <div className="relative">
                <div className="w-28 sm:w-40 md:w-56 lg:w-64 xl:w-72 aspect-[5/7] transition-all duration-300">
                  {myPlayedCard ? (
                    <CardComponent player={myPlayedCard} />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-blue-400/20 border-2 border-dashed border-blue-900/40 rounded-2xl gap-2 bg-black/25 backdrop-blur-sm">
                      <span className="text-[10px] md:text-xs font-black uppercase tracking-widest text-center px-2 text-cyan-400/70 leading-normal animate-pulse">
                        {phase === 'select_card' ? '👆 HÃY CHỌN THẺ\nỞ DƯỚI' : '—'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* THÔNG BÁO GIỮA SÂN */}
            <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 z-20 flex flex-col items-center gap-2 px-4 pointer-events-none">
              {roundResultMsg ? (
                <div className={`px-5 py-3 md:px-8 md:py-4 rounded-2xl md:rounded-3xl text-sm sm:text-base md:text-lg font-black uppercase tracking-wide shadow-2xl border backdrop-blur-xl text-center max-w-[280px] sm:max-w-sm md:max-w-md ${
                  roundWinner === 'me'
                    ? 'bg-green-900/95 border-green-400 text-green-200 shadow-green-500/35'
                    : roundWinner === 'opponent'
                    ? 'bg-red-900/95 border-red-400 text-red-200 shadow-red-500/35'
                    : 'bg-slate-900/95 border-white/30 text-white shadow-white/10'}`}>
                  {roundResultMsg}
                </div>
              ) : (
                <div className="bg-black/85 backdrop-blur-xl border border-white/20 px-6 py-2.5 md:px-8 md:py-3.5 rounded-full text-xs sm:text-sm md:text-base font-black uppercase tracking-wider flex items-center gap-2 shadow-[0_0_30px_rgba(0,0,0,0.8)]">
                  {phase === 'select_card' && (
                    <span className="text-yellow-400 flex items-center gap-1.5">
                      ⚡ Vòng này đọ: <span className="bg-gradient-to-r from-yellow-300 to-amber-500 text-black px-2.5 py-0.5 rounded text-[10px] md:text-xs font-extrabold">{statInfo.emoji} {statInfo.name}</span>
                    </span>
                  )}
                  {phase === 'waiting_start' && <span className="text-slate-400 animate-pulse">⏳ Chờ máy chủ cấp chỉ số mới...</span>}
                  {phase === 'waiting' && <span className="text-cyan-400 animate-pulse">⏳ Đã ra bài, chờ đối thủ...</span>}
                  {phase === 'result' && <span className="text-yellow-400 animate-pulse">⚡ Đang so tài chỉ số...</span>}
                </div>
              )}
            </div>

          </div>

          {/* BÀI TRÊN TAY */}
          <div className="flex-none bg-black/85 border-t border-white/10 backdrop-blur-md shrink-0"
            style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 8px)' }}>
            <div className="px-4 py-2 flex justify-between items-center border-b border-white/5 bg-black/30">
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Bài Trên Tay</span>
              {phase === 'select_card' && !myPlayedCard && (
                <span className="text-[9px] bg-gradient-to-r from-amber-400 to-yellow-500 text-black px-2.5 py-0.5 rounded-full font-black animate-pulse uppercase">
                  Lượt của bạn
                </span>
              )}
              <span className="text-[10px] font-black text-blue-400 bg-blue-900/40 px-2 py-0.5 rounded-full">{myDeck.length} lá</span>
            </div>
            <div className="overflow-x-auto hide-scrollbar" style={{ height: 'clamp(88px, 17vw, 140px)' }}>
              <div className="flex flex-row items-center h-full px-3 py-2 gap-2 min-w-max">
                {myDeck.map((player, idx) => (
                  <div key={player.id}
                    className={`h-full aspect-[5/7] shrink-0 rounded-xl overflow-hidden transition-all duration-200 select-none ${
                      canSelect
                        ? 'cursor-pointer active:scale-90 hover:-translate-y-3 hover:shadow-2xl hover:shadow-cyan-500/20 hover:ring-2 hover:ring-cyan-400/80'
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

      {/* Reusable In-Game Custom Alert Modal */}
      {pvpAlert && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
          <div className="glass-panel p-6 sm:p-8 rounded-[2rem] max-w-sm w-full text-center flex flex-col items-center bg-gradient-to-t from-slate-900 via-slate-950 to-slate-900 border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.8)] relative animate-scale-in">
            <h3 className="text-base font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400 mb-4 uppercase tracking-widest">
              {pvpAlert.title || 'Thông Báo'}
            </h3>
            <p className="text-xs sm:text-sm font-semibold text-gray-200 mb-6 leading-relaxed">
              {pvpAlert.message}
            </p>
            <button 
              className="btn w-full !bg-cyan-600 hover:!bg-cyan-500 text-white font-bold py-3 rounded-xl transition-all active:scale-[0.98] cursor-pointer"
              onClick={() => {
                playFx('click');
                const closeHandler = pvpAlert.onClose;
                setPvpAlert(null);
                if (closeHandler) closeHandler();
              }}
            >
              Đồng Ý
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
