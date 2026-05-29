import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Peer } from 'peerjs';
import { Shield, Swords, Wifi, Zap, Trophy, History, Copy, ChevronLeft, User } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import confetti from 'canvas-confetti';
import { ENV_WEATHER, ENV_TIME, FORM_STATES } from './constants';
import { generateCardForm, getSquadChemistry, getPlayerChemistryBoost } from './utils';
import { MatchHistoryModal } from './MatchHistoryModal';

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

// --- RANDOM PVP: Build a mixed-tier squad from user's collection ---
const buildRandomSquad = (collection) => {
  if (!collection || collection.length < 11) return null;

  const shuffle = (arr) => {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };

  const byRarity = {
    Icon: shuffle(collection.filter(c => c.rarity === 'Icon')),
    Legendary: shuffle(collection.filter(c => c.rarity === 'Legendary')),
    Diamond: shuffle(collection.filter(c => c.rarity === 'Diamond')),
    Platinum: shuffle(collection.filter(c => c.rarity === 'Platinum')),
    Gold: shuffle(collection.filter(c => c.rarity === 'Gold')),
    Silver: shuffle(collection.filter(c => c.rarity === 'Silver')),
    Bronze: shuffle(collection.filter(c => c.rarity === 'Bronze')),
  };

  const picked = [];
  const take = (tier, n) => {
    const available = byRarity[tier] || [];
    const count = Math.min(n, available.length);
    for (let i = 0; i < count && picked.length < 11; i++) {
      picked.push(available[i]);
    }
  };

  // Pick by tier quota
  take('Icon', 1);
  take('Legendary', Math.min(1, 2 - picked.length));
  take('Diamond', Math.min(3, 4 - picked.length));
  take('Platinum', Math.min(2, 7 - picked.length));
  take('Gold', Math.min(2, 9 - picked.length));
  take('Silver', Math.min(1, 10 - picked.length));
  take('Bronze', Math.min(1, 11 - picked.length));

  // If still not 11, fill from any remaining cards not yet picked
  if (picked.length < 11) {
    const pickedIds = new Set(picked.map(c => c.id));
    const remaining = shuffle(collection.filter(c => !pickedIds.has(c.id)));
    for (const card of remaining) {
      if (picked.length >= 11) break;
      picked.push(card);
    }
  }

  return shuffle(picked).slice(0, 11);
};

export default function MultiplayerEngine({ squad, collection = [], randomMode = false, currentUser, onExit, onWin, initialJoinId, CardComponent, onShare }) {
  // If randomMode: build a random squad from collection, else use squad as-is
  const effectiveSquad = useMemo(() => {
    if (randomMode && collection.length >= 11) {
      return buildRandomSquad(collection) || squad;
    }
    return squad;
  }, [randomMode, squad]); // collection is omitted to prevent regenerating mid-game if collection updates
  const [peerId, setPeerId] = useState('');
  const [remotePeerId, setRemotePeerId] = useState(initialJoinId || '');
  const [status, setStatus] = useState('lobby'); // 'lobby', 'connecting', 'playing', 'gameover'

  const peerInstance = useRef(null);
  const connRef = useRef(null);

  const [myDeck, setMyDeck] = useState([...effectiveSquad]);
  const [opponentDeckCount, setOpponentDeckCount] = useState(effectiveSquad.length);
  const [myScore, setMyScore] = useState(0);
  const [opponentScore, setOpponentScore] = useState(0);
  const [opponentUsername, setOpponentUsername] = useState('Đối Thủ');

  // Simultaneous PvP state variables
  const [phase, setPhase] = useState('select_card'); // 'waiting_start', 'select_card', 'waiting', 'result'
  const [activeStat, setActiveStat] = useState('attack'); // 'attack', 'control', 'defense'
  const [myPlayedCard, setMyPlayedCard] = useState(null);
  const [selectedPlayerCard, setSelectedPlayerCard] = useState(null);
  const [myPlayedStat, setMyPlayedStat] = useState(null);
  const myPlayedStatRef = useRef(null);
  const [opponentPlayedCard, setOpponentPlayedCard] = useState(null);
  const [roundResultMsg, setRoundResultMsg] = useState('');
  const [roundWinner, setRoundWinner] = useState(null); // 'me', 'opponent', 'draw'
  const [roundCount, setRoundCount] = useState(0); // Kept in state specifically for render-time safety
  const [copiedCode, setCopiedCode] = useState(false);
  const [pvpAlert, setPvpAlert] = useState(null); // Custom in-game dialog alert: { title, message, onClose }
  const [matchHistory, setMatchHistory] = useState([]);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [matchEnvironment, setMatchEnvironmentState] = useState({ weather: ENV_WEATHER[4], time: ENV_TIME[1] });
  const matchEnvironmentRef = useRef({ weather: ENV_WEATHER[4], time: ENV_TIME[1] });
  const setMatchEnvironment = useCallback((env) => {
    matchEnvironmentRef.current = env;
    setMatchEnvironmentState(env);
  }, []);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [opponentSquad, setOpponentSquad] = useState([]);
  const opponentSquadRef = useRef([]);

  const myScoreRef = useRef(0);
  const opponentScoreRef = useRef(0);
  const opponentDeckCountRef = useRef(effectiveSquad.length);

  useEffect(() => { myScoreRef.current = myScore; }, [myScore]);
  useEffect(() => { opponentScoreRef.current = opponentScore; }, [opponentScore]);
  useEffect(() => { opponentDeckCountRef.current = opponentDeckCount; }, [opponentDeckCount]);

  const handleCopyCode = () => {
    if (!peerId) return;
    const cleanCode = peerId.replace(' (Tạm)', '');
    navigator.clipboard.writeText(cleanCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 1500);
  };

  // Stable references for connection callbacks to prevent stale state issues
  const myDeckRef = useRef([...effectiveSquad]);
  const myPlayedCardRef = useRef(null);
  const opponentPlayedCardRef = useRef(null);
  const opponentPlayedStatRef = useRef(null);
  const activeStatRef = useRef('attack');
  const isHostRef = useRef(false);
  const roundCountRef = useRef(0);
  const phaseRef = useRef('select_card');
  const roundSeedRef = useRef(12345);
  const roundTimeoutRef = useRef(null);

  const seededRNG = (seedOffset) => {
    // A simple fast pseudo-random generator
    let seed = roundSeedRef.current + seedOffset;
    return () => {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };
  };

  const updateActiveStat = (stat) => {
    setActiveStat(stat);
    activeStatRef.current = stat;
  };

  const isMyAttackTurn = isHostRef.current
    ? (roundCount % 2 === 0)
    : (roundCount % 2 !== 0);

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
  const calculateRoundResult = useCallback((myCard, opCard, hostStatInput, guestStatInput) => {
    // Guard: only process once, and ONLY host calculates
    if (phaseRef.current === 'result') return;
    
    const hostStat = hostStatInput || activeStatRef.current || 'attack';
    const guestStat = guestStatInput || activeStatRef.current || 'defense';

    const getPlayerAttr = (player) => {
      if (!player || !player.stats) return { key: 'speed', name: 'Tốc Độ', emoji: '⚡' };
      const stats = player.stats;
      if (stats.control >= stats.attack && stats.control >= stats.defense) {
        return { key: 'tech', name: 'Kỹ Thuật', emoji: '🌀' };
      }
      if (stats.attack >= stats.defense) {
        return { key: 'power', name: 'Sức Mạnh', emoji: '💪' };
      }
      return { key: 'speed', name: 'Tốc Độ', emoji: '⚡' };
    };

    const checkAttrAdvantage = (attrKey1, attrKey2) => {
      if (attrKey1 === 'speed' && attrKey2 === 'tech') return true;
      if (attrKey1 === 'tech' && attrKey2 === 'power') return true;
      if (attrKey1 === 'power' && attrKey2 === 'speed') return true;
      return false;
    };

    // HOST perspective: myCard = host card, opCard = guest card
    // GUEST perspective: myCard = guest card, opCard = host card
    // Both call this only when HOST triggers it, so we use consistent seed assignment:
    // seed offset +1 always = host card, seed offset +2 always = guest card
    let hostCard, guestCard;
    if (isHostRef.current) {
      hostCard = myCard;
      guestCard = opCard;
    } else {
      // Guest should NOT calculate — this should not be reached
      console.warn('[PVP] Guest called calculateRoundResult — this should not happen!');
      return;
    }

    if (!hostCard || !guestCard) {
      console.warn('[PVP] calculateRoundResult: hostCard or guestCard is null', { hostCard, guestCard });
      return;
    }

    const attr1 = getPlayerAttr(hostCard); // host
    const attr2 = getPlayerAttr(guestCard); // guest

    let hostBonus = 0;
    let guestBonus = 0;

    if (checkAttrAdvantage(attr1.key, attr2.key)) {
      hostBonus = 10;
    } else if (checkAttrAdvantage(attr2.key, attr1.key)) {
      guestBonus = 10;
    }

    // Use a single consistent seed for both cards (no per-side reversal)
    const rng1 = seededRNG(roundCountRef.current * 10 + 1);
    const rng2 = seededRNG(roundCountRef.current * 10 + 2);
    const formResult1 = generateCardForm(hostCard, guestCard, matchEnvironmentRef.current, rng1);
    const formResult2 = generateCardForm(guestCard, hostCard, matchEnvironmentRef.current, rng2);

    const formBonus1 = formResult1.bonus; // host
    const formBonus2 = formResult2.bonus; // guest
    const envBonus1 = formResult1.envBonus || 0; // host
    const envBonus2 = formResult2.envBonus || 0; // guest

    // Squad Chemistry Boost (host uses squad, guest uses opponentSquad)
    const chemBonus1 = getPlayerChemistryBoost(hostCard, effectiveSquad); // host
    const chemBonus2 = getPlayerChemistryBoost(guestCard, opponentSquadRef.current); // guest

    // Captain Boost (+3 OVR)
    const capBonus1 = (effectiveSquad.length > 0 && hostCard.id === effectiveSquad[0].id) ? 3 : 0;
    const capBonus2 = (opponentSquadRef.current.length > 0 && guestCard.id === opponentSquadRef.current[0].id) ? 3 : 0;

    const hostLvlBonus = ((hostCard.level || 1) - 1) * 2;
    const guestLvlBonus = ((guestCard.level || 1) - 1) * 2;
    const hostVal = hostCard.stats[hostStat] + hostLvlBonus;
    const guestVal = guestCard.stats[guestStat] + guestLvlBonus;

    // --- CRITICAL STRIKE (Đột Biến / Bạo Kích) ---
    const rngCrit1 = seededRNG(roundCountRef.current * 10 + 3);
    const rngCrit2 = seededRNG(roundCountRef.current * 10 + 4);
    
    let hostCritChance = hostVal <= guestVal - 10 ? 0.35 : 0.10;
    let guestCritChance = guestVal <= hostVal - 10 ? 0.35 : 0.10;
    
    let hostCritBonus = 0;
    if (rngCrit1() < hostCritChance) {
      const isUnderdog = hostVal <= guestVal - 10;
      hostCritBonus = isUnderdog ? Math.floor(rngCrit1() * 6) + 15 : Math.floor(rngCrit1() * 6) + 10;
    }
    
    let guestCritBonus = 0;
    if (rngCrit2() < guestCritChance) {
      const isUnderdog = guestVal <= hostVal - 10;
      guestCritBonus = isUnderdog ? Math.floor(rngCrit2() * 6) + 15 : Math.floor(rngCrit2() * 6) + 10;
    }

    const hostFinal = hostVal + hostBonus + formBonus1 + envBonus1 + chemBonus1 + capBonus1 + hostCritBonus;
    const guestFinal = guestVal + guestBonus + formBonus2 + envBonus2 + chemBonus2 + capBonus2 + guestCritBonus;

    const bonusPart = (b, emoji, lb, fb, fs, env, chem, cap, crit) => {
      let parts = [];
      if (crit > 0) parts.push(`+${crit} BẠO KÍCH 💥`);
      if (lb > 0) parts.push(`+${lb} Lv`);
      if (b > 0) parts.push(`+${b} Khắc chế`);
      if (fb !== 0) {
        const sign = fb > 0 ? '+' : '';
        parts.push(`${sign}${fb} Phong độ ${fs.emoji}`);
      } else {
        parts.push(`+0 Phong độ ➡️`);
      }
      if (env !== 0) {
        const sign = env > 0 ? '+' : '';
        parts.push(`${sign}${env} Khí hậu`);
      }
      if (chem > 0) parts.push(`+${chem} Duyên 🤝`);
      if (cap > 0) parts.push(`+${cap} Đội trưởng 👑`);
      return parts.length > 0 ? ` [${parts.join(' & ')}]` : '';
    };

    const hostBonusDetails = bonusPart(hostBonus, attr1.emoji, hostLvlBonus, formBonus1, formResult1.state, envBonus1, chemBonus1, capBonus1, hostCritBonus);
    const guestBonusDetails = bonusPart(guestBonus, attr2.emoji, guestLvlBonus, formBonus2, formResult2.state, envBonus2, chemBonus2, capBonus2, guestCritBonus);

    // Determine winner from HOST perspective
    let winner; // 'host' | 'guest' | 'draw'
    if (hostFinal > guestFinal) {
      winner = 'host';
    } else if (guestFinal > hostFinal) {
      winner = 'guest';
    } else {
      winner = 'draw';
    }

    // Compute new scores
    const newHostScore = myScoreRef.current + (winner === 'host' ? 1 : 0);
    const newGuestScore = opponentScoreRef.current + (winner === 'guest' ? 1 : 0);

    // HOST builds result messages
    const hostResultMsg = winner === 'host'
      ? `BẠN THẮNG VÒNG NÀY! 🎉 (${hostFinal}${hostBonusDetails} > ${guestFinal}${guestBonusDetails})`
      : winner === 'guest'
      ? `BẠN THUA VÒNG NÀY! 😤 (${hostFinal}${hostBonusDetails} < ${guestFinal}${guestBonusDetails})`
      : `HÒA! ⚖️ (${hostFinal}${hostBonusDetails} = ${guestFinal}${guestBonusDetails})`;

    // GUEST gets mirrored message
    const guestResultMsg = winner === 'guest'
      ? `BẠN THẮNG VÒNG NÀY! 🎉 (${guestFinal}${guestBonusDetails} > ${hostFinal}${hostBonusDetails})`
      : winner === 'host'
      ? `BẠN THUA VÒNG NÀY! 😤 (${guestFinal}${guestBonusDetails} < ${hostFinal}${hostBonusDetails})`
      : `HÒA! ⚖️ (${guestFinal}${guestBonusDetails} = ${hostFinal}${hostBonusDetails})`;

    const historyEntry = {
      myStat: hostStat,
      myCardName: hostCard.name,
      myBonusDetails: hostBonusDetails,
      myFinalVal: hostFinal,
      opStat: guestStat,
      opCardName: guestCard.name,
      opBonusDetails: guestBonusDetails,
      opFinalVal: guestFinal,
      result: winner === 'host' ? 'win' : winner === 'guest' ? 'loss' : 'draw'
    };

    // ===== APPLY RESULT LOCALLY (HOST) =====
    applyRoundResult({
      winner,          // 'host' | 'guest' | 'draw'
      perspective: 'host',
      newHostScore,
      newGuestScore,
      resultMsg: hostResultMsg,
      historyEntry
    });

    // ===== BROADCAST AUTHORITATIVE RESULT TO GUEST =====
    sendData({
      type: 'round_result',
      winner,               // 'host' | 'guest' | 'draw'
      newHostScore,         // authoritative host score
      newGuestScore,        // authoritative guest score
      resultMsg: guestResultMsg,
      stat: hostStat,
      hostFinal,
      guestFinal,
      roundIndex: roundCountRef.current,
      historyEntry: {
        ...historyEntry,
        // Mirror for guest view
        myStat: guestStat,
        myCardName: guestCard.name,
        myBonusDetails: guestBonusDetails,
        myFinalVal: guestFinal,
        opStat: hostStat,
        opCardName: hostCard.name,
        opBonusDetails: hostBonusDetails,
        opFinalVal: hostFinal,
        result: winner === 'guest' ? 'win' : winner === 'host' ? 'loss' : 'draw'
      }
    });
  }, [effectiveSquad, sendData]);

  // Apply a round result (from local calculation or received from host)
  const applyRoundResult = useCallback(({
    winner,        // 'host' | 'guest' | 'draw'
    perspective,   // 'host' | 'guest'
    newHostScore,
    newGuestScore,
    resultMsg,
    historyEntry
  }) => {
    if (phaseRef.current === 'result') return;

    // Determine local winner label ('me', 'opponent', 'draw')
    let localWinner;
    if (winner === 'draw') {
      localWinner = 'draw';
    } else if (perspective === 'host') {
      localWinner = winner === 'host' ? 'me' : 'opponent';
    } else {
      localWinner = winner === 'guest' ? 'me' : 'opponent';
    }

    // Apply authoritative scores
    if (perspective === 'host') {
      setMyScore(newHostScore);
      myScoreRef.current = newHostScore;
      setOpponentScore(newGuestScore);
      opponentScoreRef.current = newGuestScore;
    } else {
      // Guest: my score = guest score, opponent score = host score
      setMyScore(newGuestScore);
      myScoreRef.current = newGuestScore;
      setOpponentScore(newHostScore);
      opponentScoreRef.current = newHostScore;
    }

    // Audio & visual feedback
    if (localWinner === 'me') {
      playFx('winPoint');
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#22c55e', '#3b82f6', '#fbbf24']
      });
    } else if (localWinner === 'opponent') {
      playFx('losePoint');
    } else {
      playFx('drawPoint');
    }

    setRoundWinner(localWinner);
    setRoundResultMsg(resultMsg);
    if (historyEntry) {
      setMatchHistory(prev => [...prev, historyEntry]);
    }
    updatePhase('result');
    roundCountRef.current += 1;
    setRoundCount(prev => prev + 1);
    const isGameOver = roundCountRef.current >= effectiveSquad.length;

    if (roundTimeoutRef.current) {
      clearTimeout(roundTimeoutRef.current);
    }

    roundTimeoutRef.current = setTimeout(() => {
      myPlayedCardRef.current = null;
      myPlayedStatRef.current = null;
      opponentPlayedCardRef.current = null;
      opponentPlayedStatRef.current = null;
      setMyPlayedCard(null);
      setMyPlayedStat(null);
      setOpponentPlayedCard(null);
      setRoundResultMsg('');
      setRoundWinner(null);
      roundTimeoutRef.current = null;

      if (isGameOver) {
        setStatus('gameover');
      } else {
        if (isHostRef.current) {
          const stats = ['attack', 'control', 'defense'];
          const nextStat = stats[Math.floor(Math.random() * stats.length)];
          const roundSeed = Math.floor(Math.random() * 1000000);
          roundSeedRef.current = roundSeed;
          updateActiveStat(nextStat);
          updatePhase('select_card');
          sendData({ 
            type: 'start_round', 
            stat: nextStat, 
            roundIndex: roundCountRef.current, 
            seed: roundSeed,
            weatherIdx: ENV_WEATHER.indexOf(matchEnvironmentRef.current.weather),
            timeIdx: ENV_TIME.indexOf(matchEnvironmentRef.current.time)
          });
        } else {
          if (phaseRef.current === 'result') {
            updatePhase('waiting_start');
            setRoundResultMsg('Đang chờ máy chủ bắt đầu vòng mới...');
          }
        }
      }
    }, 2500);
  }, [effectiveSquad.length, sendData]);

  const handleNetworkData = useCallback((data) => {
    if (data.type === 'ready') {
      console.log('[PVP] Guest connected and ready! Initializing first round...');
      if (data.username) {
        setOpponentUsername(data.username);
      }
      if (data.squad) {
        setOpponentSquad(data.squad);
        opponentSquadRef.current = data.squad;
      }
      const stats = ['attack', 'control', 'defense'];
      const firstStat = stats[Math.floor(Math.random() * stats.length)];
      
      const weatherIdx = Math.floor(Math.random() * ENV_WEATHER.length);
      const timeIdx = Math.floor(Math.random() * ENV_TIME.length);
      setMatchEnvironment({ weather: ENV_WEATHER[weatherIdx], time: ENV_TIME[timeIdx] });
      
      const roundSeed = Math.floor(Math.random() * 1000000);
      roundSeedRef.current = roundSeed;
      
      updateActiveStat(firstStat);
      updatePhase('select_card');
      setTimeout(() => {
        sendData({ type: 'start_round', stat: firstStat, roundIndex: 0, weatherIdx, timeIdx, seed: roundSeed, squad: effectiveSquad, username: currentUser });
      }, 300);
    }
    else if (data.type === 'start_round') {
      if (data.username) {
        setOpponentUsername(data.username);
      }
      if (roundTimeoutRef.current) {
        clearTimeout(roundTimeoutRef.current);
        roundTimeoutRef.current = null;
      }
      if (data.squad) {
        setOpponentSquad(data.squad);
        opponentSquadRef.current = data.squad;
      }
      if (data.weatherIdx !== undefined && data.timeIdx !== undefined) {
        setMatchEnvironment({ weather: ENV_WEATHER[data.weatherIdx], time: ENV_TIME[data.timeIdx] });
      }
      if (data.seed !== undefined) {
        roundSeedRef.current = data.seed;
      }
      roundCountRef.current = data.roundIndex;
      setRoundCount(data.roundIndex);
      myPlayedCardRef.current = null;
      myPlayedStatRef.current = null;
      opponentPlayedCardRef.current = null;
      opponentPlayedStatRef.current = null;
      setMyPlayedCard(null);
      setMyPlayedStat(null);
      setOpponentPlayedCard(null);
      setRoundWinner(null);
      setRoundResultMsg('');
      updateActiveStat(data.stat);
      updatePhase('select_card');
    }
    else if (data.type === 'play_card') {
      // Verify round index to avoid race conditions
      if (data.roundIndex !== roundCountRef.current) {
        console.warn(`[PVP] Stale/future play_card received: message index ${data.roundIndex}, current ${roundCountRef.current}`);
        return;
      }
      opponentPlayedCardRef.current = data.card;
      opponentPlayedStatRef.current = data.stat;
      setOpponentPlayedCard(data.card);
      setOpponentDeckCount(prev => prev - 1);

      // HOST ONLY: trigger calculation when both cards are played
      if (isHostRef.current && myPlayedCardRef.current) {
        calculateRoundResult(myPlayedCardRef.current, data.card, myPlayedStatRef.current, data.stat);
      }
      // Guest does NOT calculate — waits for 'round_result' from host
    }
    // ===== NEW: Authoritative round result from Host =====
    else if (data.type === 'round_result') {
      if (phaseRef.current === 'result') return; // already applied
      console.log('[PVP] Guest received authoritative round_result:', data);

      // Apply the host's authoritative result from GUEST perspective
      applyRoundResult({
        winner: data.winner,
        perspective: 'guest',
        newHostScore: data.newHostScore,
        newGuestScore: data.newGuestScore,
        resultMsg: data.resultMsg,
        historyEntry: data.historyEntry
      });
    }
    else if (data.type === 'sync_session') {
      if (isHostRef.current) {
        console.log('[PVP] Host ignoring sync_session from Guest to preserve authority.');
        return;
      }
      console.log('[PVP] Guest synchronizing match session state from Host...');
      if (data.squad) {
        setOpponentSquad(data.squad);
        opponentSquadRef.current = data.squad;
      }
      setMyScore(data.opponentScore);
      myScoreRef.current = data.opponentScore;
      setOpponentScore(data.myScore);
      opponentScoreRef.current = data.myScore;
      setRoundCount(data.roundIndex);
      roundCountRef.current = data.roundIndex;
      setOpponentDeckCount(data.opponentDeckCount);
      updateActiveStat(data.activeStat);
      updatePhase(data.phase);
      if (data.weatherIdx !== undefined && data.timeIdx !== undefined) {
        setMatchEnvironment({ weather: ENV_WEATHER[data.weatherIdx], time: ENV_TIME[data.timeIdx] });
      }
      setIsReconnecting(false);
      setRoundResultMsg('Đã kết nối thành công, Trận đấu Bắt đầu!');
      playFx('winPoint');
    }
    else if (data.type === 'ping') {
      sendData({ type: 'pong' });
    }
    else if (data.type === 'pong') {
      window.lastPvpPong = Date.now();
    }
  }, [calculateRoundResult, applyRoundResult, sendData, effectiveSquad]);

  const setupConnectionHandlers = useCallback((conn) => {
    conn.on('data', (data) => {
      handleNetworkData(data);
    });
    conn.on('close', () => {
      console.warn('[PVP] Connection closed silently. Starting auto-reconnect grace period...');
      setIsReconnecting(true);
      setRoundResultMsg('Mất kết nối! Đang tự động kết nối lại...');
      
      if (window.pvpExitTimeout) clearTimeout(window.pvpExitTimeout);
      window.pvpExitTimeout = setTimeout(() => {
        setIsReconnecting(false);
        setPvpAlert({
          title: 'Mất Kết Nối ⚠️',
          message: 'Đối thủ đã thoát trận hoặc bị gián đoạn kết nối quá lâu!',
          onClose: () => {
            onExit();
          }
        });
      }, 12000); // 12 seconds grace period to recover!
    });
    conn.on('error', (err) => {
      console.error('[PVP] Connection error:', err);
    });
    conn.on('open', () => {
      if (window.pvpExitTimeout) {
        clearTimeout(window.pvpExitTimeout);
        window.pvpExitTimeout = null;
      }
      setIsReconnecting(false);
      // Authoritative synchronization: Only the Host initiates state sync
      if (isHostRef.current) {
        conn.send({
          type: 'sync_session',
          roundIndex: roundCountRef.current,
          myScore: myScoreRef.current,
          opponentScore: opponentScoreRef.current,
          opponentDeckCount: myDeckRef.current.length,
          activeStat: activeStatRef.current,
          phase: phaseRef.current,
          weatherIdx: ENV_WEATHER.indexOf(matchEnvironmentRef.current.weather),
          timeIdx: ENV_TIME.indexOf(matchEnvironmentRef.current.time)
        });
      }
      setRoundResultMsg('Đã kết nối thành công, Trận đấu Bắt đầu!');
      playFx('winPoint');
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
              conn.send({ type: 'ready', squad: effectiveSquad, username: currentUser });
            }, 500);
          });
        } else {
          isHostRef.current = true;
        }
      });

      peer.on('connection', (conn) => {
        // Prevent cross-connection double-host bug and third-party interruptions
        if (!isHostRef.current && remotePeerId && conn.peer.includes(remotePeerId.trim().toLowerCase().replace(/[^a-z0-9]/g, ''))) {
          // Tie-breaker: Compare Peer IDs
          const myId = peer.id || '';
          const remoteId = conn.peer || '';
          if (myId.localeCompare(remoteId) > 0) {
            console.warn('[PVP] Cross-connection resolved: I become HOST.');
            isHostRef.current = true;
          } else {
            console.warn('[PVP] Cross-connection resolved: I remain GUEST.');
            isHostRef.current = false;
          }
        } else if (isHostRef.current && connRef.current && connRef.current.open) {
          console.warn('[PVP] Ignoring connection from third party:', conn.peer);
          return;
        } else {
          isHostRef.current = true;
        }

        connRef.current = conn;
        setStatus('playing');
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
      if (roundTimeoutRef.current) {
        clearTimeout(roundTimeoutRef.current);
        roundTimeoutRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // Keep alive pings to maintain socket channel
    const pingInterval = setInterval(() => {
      if (status === 'playing' && connRef.current && connRef.current.open) {
        connRef.current.send({ type: 'ping' });
      }
    }, 2500);

    // Reconnection check daemon
    const reconCheckInterval = setInterval(() => {
      if (status === 'playing' && (!connRef.current || !connRef.current.open) && isReconnecting) {
        console.log('[PVP] Reconnection daemon: attempting background recovery...');
        if (!isHostRef.current && remotePeerId && peerInstance.current && !peerInstance.current.destroyed) {
          const conn = peerInstance.current.connect(`wc26-panini-${remotePeerId.trim().toLowerCase().replace(/[^a-z0-9]/g, '')}`);
          connRef.current = conn;
          setupConnectionHandlers(conn);
        }
      }
    }, 3000);

    // Page visibility listener for lock screen or app switch
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        console.log('[PVP] App resumed from background. Checking connection health...');
        if (status === 'playing' && (!connRef.current || !connRef.current.open)) {
          setIsReconnecting(true);
          setRoundResultMsg('Mất kết nối nền! Đang tự động kết nối lại...');
        }
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      clearInterval(pingInterval);
      clearInterval(reconCheckInterval);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [status, isReconnecting, remotePeerId, setupConnectionHandlers]);

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
        conn.send({ type: 'ready', squad: effectiveSquad, username: currentUser });
      }, 500);
    });
  };

  const playRoundPvp = (stat) => {
    if (!selectedPlayerCard) return;
    const card = selectedPlayerCard;
    setSelectedPlayerCard(null);

    playFx('click');
    const newDeck = myDeckRef.current.filter(c => c.id !== card.id);
    myDeckRef.current = newDeck;
    myPlayedCardRef.current = card;
    myPlayedStatRef.current = stat;
    setMyPlayedCard(card);
    setMyPlayedStat(stat);
    setMyDeck(newDeck);

    // Broadcast played card and chosen stat
    sendData({ type: 'play_card', card, roundIndex: roundCountRef.current, stat });

    if (isHostRef.current) {
      if (opponentPlayedCardRef.current) {
        calculateRoundResult(card, opponentPlayedCardRef.current, stat, opponentPlayedStatRef.current);
      } else {
        updatePhase('waiting');
        setRoundResultMsg('Đang chờ đối thủ ra bài...');
      }
    } else {
      updatePhase('waiting');
      setRoundResultMsg('Đang chờ đối thủ ra bài...');
    }
  };

  function handleCardSelect(card) {
    if (!card) return;
    if (phase !== 'select_card' || myPlayedCard) return;

    if (isMyAttackTurn) {
      // Attacker: open the stat selection modal
      playFx('click');
      setSelectedPlayerCard(card);
    } else {
      // Defender: plays automatically using counter-stat of opponent's attack!
      // But they can only play if the opponent has already played!
      if (!opponentPlayedCardRef.current) {
        setPvpAlert({
          title: '⏳ Hãy Chờ',
          message: 'Đang trong lượt phòng thủ! Bạn cần chờ đối thủ của mình chọn cầu thủ và chỉ số tấn công trước nhé.'
        });
        return;
      }

      playFx('click');
      let defendStat = 'defense';
      const opStat = opponentPlayedStatRef.current;
      if (opStat === 'defense') defendStat = 'attack';
      else if (opStat === 'control') defendStat = 'control';

      const newDeck = myDeckRef.current.filter(c => c.id !== card.id);
      myDeckRef.current = newDeck;
      myPlayedCardRef.current = card;
      myPlayedStatRef.current = defendStat;
      setMyPlayedCard(card);
      setMyPlayedStat(defendStat);
      setMyDeck(newDeck);

      // Broadcast played card and computed defendStat
      sendData({ type: 'play_card', card, roundIndex: roundCountRef.current, stat: defendStat });

      if (isHostRef.current) {
        if (opponentPlayedCardRef.current) {
          calculateRoundResult(card, opponentPlayedCardRef.current, defendStat, opponentPlayedStatRef.current);
        }
      } else {
        updatePhase('waiting');
        setRoundResultMsg('Đang chờ máy chủ tính kết quả...');
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
        <h2 className="text-3xl sm:text-5xl font-black italic tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-amber-500 mb-3 uppercase text-center flex justify-center items-center gap-3 drop-shadow-[0_4px_10px_rgba(239,68,68,0.3)]">
          <Wifi size={36} className="text-red-500 animate-pulse" /> PVP ONLINE
        </h2>
        {randomMode && (
          <div className="flex items-center justify-center gap-2 mb-5 bg-gradient-to-r from-fuchsia-900/40 via-purple-900/40 to-indigo-900/40 border border-fuchsia-500/40 px-6 py-2.5 rounded-2xl shadow-[0_0_20px_rgba(168,85,247,0.3)]">
            <span className="text-2xl animate-bounce-subtle">🎲</span>
            <div className="text-center">
              <div className="text-fuchsia-300 font-black text-sm uppercase tracking-widest">Chế Độ Random PVP</div>
              <div className="text-purple-400 text-[10px] font-medium">Đội hình được tạo ngẫu nhiên từ bộ sưu tập của bạn</div>
            </div>
            <span className="text-2xl animate-bounce-subtle">🎲</span>
          </div>
        )}
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

  // Dynamic background
  const getArenaBg = () => {
    switch (matchEnvironment.time.key) {
      case 'Night': return 'radial-gradient(circle at 50% -20%, rgba(96, 165, 250, 0.18) 0%, transparent 60%), linear-gradient(180deg, #090a1b 0%, #050510 50%, #010207 100%)';
      case 'Noon': return 'radial-gradient(circle at 50% -20%, rgba(52, 211, 153, 0.18) 0%, transparent 60%), linear-gradient(180deg, #041a12 0%, #020f0a 50%, #010604 100%)';
      case 'Sunset': return 'radial-gradient(circle at 50% -20%, rgba(251, 191, 36, 0.15) 0%, transparent 60%), linear-gradient(180deg, #1a0815 0%, #0f030c 50%, #060108 100%)';
      default: return 'radial-gradient(circle at 50% -20%, rgba(96, 165, 250, 0.18) 0%, transparent 60%), linear-gradient(180deg, #090a1b 0%, #050510 50%, #010207 100%)';
    }
  };

  // ===== MÀN HÌNH THI ĐẤU =====
  return (
    <div className="w-full h-[100dvh] flex flex-col overflow-hidden animate-fade-in relative z-10"
      style={{ background: getArenaBg() }}>

      {/* HUD điểm số */}
      <div className="flex-none flex items-center justify-between px-4 py-2 sm:py-3 border-b border-white/10 bg-black/80 shrink-0">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-900/60 rounded-full flex items-center justify-center border-2 border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]">
            <User className="text-red-400 w-5 h-5" />
          </div>
          <div>
            <div className="text-[9px] font-bold text-red-400 uppercase tracking-widest">{opponentUsername} ({opponentDeckCount} lá)</div>
            <div className="text-3xl sm:text-4xl font-black text-white leading-none">{opponentScore}</div>
          </div>
        </div>

        <div className="flex flex-col items-center">
          <div className="text-[9px] font-bold tracking-widest text-gray-500 uppercase mb-0.5">
            Vòng {Math.min(roundCount + 1, effectiveSquad.length)}/{effectiveSquad.length}
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

      {/* Weather & Environment HUD */}
      <div className="flex-none flex flex-wrap items-center justify-center gap-2 sm:gap-4 bg-slate-950/80 border-b border-white/5 p-2.5 select-none text-center shadow-md">
        <div className="flex items-center gap-1 text-[10px] sm:text-xs">
          <span className="text-gray-400 font-bold uppercase">Sân đấu:</span>
          <span className="text-amber-400 font-black">Lusail Iconic 🏟️</span>
        </div>
        <div className="w-[1px] bg-white/10 h-3 hidden sm:block"></div>
        <div className="flex items-center gap-1 text-[10px] sm:text-xs" title={matchEnvironment.weather.desc}>
          <span className="text-gray-400 font-bold uppercase">Thời tiết:</span>
          <span className="text-white font-extrabold">{matchEnvironment.weather.name}</span>
        </div>
        <div className="w-[1px] bg-white/10 h-3 hidden sm:block"></div>
        <div className="flex items-center gap-1 text-[10px] sm:text-xs" title={matchEnvironment.time.desc}>
          <span className="text-gray-400 font-bold uppercase">Khung giờ:</span>
          <span className="text-cyan-400 font-extrabold">{matchEnvironment.time.name}</span>
        </div>
      </div>

      {/* Sleek Counter Guide Pill */}
      <div className="flex-none flex items-center justify-center gap-2 sm:gap-4 bg-slate-950/60 border-b border-white/5 py-1.5 px-4 text-[9px] sm:text-xs font-semibold tracking-wide select-none shadow-md">
        <span className="text-gray-400 font-bold uppercase text-[8px] sm:text-[10px]">Khắc chế (+5 OVR):</span>
        <span className="flex items-center gap-1 font-bold text-yellow-400">Tốc độ ⚡</span>
        <span className="text-gray-500 font-black">➔</span>
        <span className="flex items-center gap-1 font-bold text-cyan-400">Kỹ thuật 🌀</span>
        <span className="text-gray-500 font-black">➔</span>
        <span className="flex items-center gap-1 font-bold text-red-400">Sức mạnh 💪</span>
        <span className="text-gray-500 font-black">➔</span>
        <span className="flex items-center gap-1 font-bold text-yellow-400">Tốc độ ⚡</span>
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
            {/* Share PVP Result Button */}
            <button 
              className="w-full mb-3 flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-black tracking-widest text-xs py-3.5 px-4 rounded-2xl border border-emerald-400/20 shadow-[0_0_15px_rgba(16,185,129,0.2)] transition-all cursor-pointer active:scale-95 animate-pulse" 
              onClick={() => {
                playFx('click');
                if (onShare) {
                  onShare(myScore === opponentScore ? 'draw' : myScore > opponentScore ? 'win' : 'lose', opponentUsername, myScore, opponentScore);
                }
              }}
            >
              📢 KHOE CHIẾN TÍCH SIÊU CẤP
            </button>

            <div className="flex flex-col sm:flex-row gap-3 w-full">
              <button 
                className="flex-1 flex items-center justify-center gap-2 bg-slate-800/80 hover:bg-slate-700 text-white font-bold tracking-widest text-[10px] sm:text-xs py-3.5 px-4 rounded-2xl border border-white/10 transition-all cursor-pointer active:scale-95 shadow-inner" 
                onClick={() => setShowHistoryModal(true)}
              >
                <History size={16} /> DIỄN BIẾN
              </button>
              <button 
                className="flex-[0.6] flex items-center justify-center gap-2 bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 font-bold tracking-widest text-[10px] sm:text-xs py-3.5 px-4 rounded-2xl border border-rose-500/20 transition-all cursor-pointer active:scale-95" 
                onClick={() => onExit(myScore === opponentScore ? 'draw' : 'lose', opponentUsername, myScore, opponentScore)}
              >
                THOÁT
              </button>
            </div>
            {myScore > opponentScore && (
              <button 
                className="w-full mt-3 flex items-center justify-center gap-2 bg-gradient-to-r from-yellow-600 to-yellow-400 hover:from-yellow-500 hover:to-amber-400 text-black font-black tracking-widest text-xs sm:text-sm py-4 px-4 rounded-2xl border border-yellow-400 shadow-[0_0_20px_rgba(234,179,8,0.4)] transition-all cursor-pointer active:scale-95 animate-pulse" 
                onClick={() => { onWin(); onExit('win', opponentUsername, myScore, opponentScore); }}
              >
                🎁 NHẬN PHẦN THƯỞNG
              </button>
            )}
          </div>
          {showHistoryModal && (
            <MatchHistoryModal 
              history={matchHistory} 
              onClose={() => setShowHistoryModal(false)} 
            />
          )}
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
                  <div className="w-full h-full flex flex-col items-center justify-center text-red-500/20 border-2 border-dashed border-red-900/30 rounded-2xl gap-2 bg-slate-950/60">
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
                    <div className="w-full h-full flex flex-col items-center justify-center text-blue-400/20 border-2 border-dashed border-blue-900/40 rounded-2xl gap-2 bg-slate-950/60">
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
                <div className={`px-5 py-3 md:px-8 md:py-4 rounded-2xl md:rounded-3xl text-sm sm:text-base md:text-lg font-black tracking-wide shadow-2xl border text-center max-w-[280px] sm:max-w-sm md:max-w-md ${
                  roundResultMsg === roundResultMsg.toUpperCase() ? 'uppercase' : ''
                } ${
                  roundWinner === 'me'
                    ? 'bg-green-900/95 border-green-400 text-green-200 shadow-green-500/35'
                    : roundWinner === 'opponent'
                    ? 'bg-red-900/95 border-red-400 text-red-200 shadow-red-500/35'
                    : 'bg-slate-900/95 border-white/30 text-white shadow-white/10'}`}>
                  {roundResultMsg}
                </div>
              ) : (
                <div className="bg-black/90 border border-white/15 px-6 py-2.5 md:px-8 md:py-3.5 rounded-full text-xs sm:text-sm md:text-base font-black uppercase tracking-wider flex items-center gap-2 shadow-lg">
                  {phase === 'select_card' && (
                    isMyAttackTurn ? (
                      <span className="text-yellow-400 flex items-center gap-1.5 animate-pulse">
                        ⚔️ LƯỢT BẠN TẤN CÔNG! Hãy chọn cầu thủ & chỉ số
                      </span>
                    ) : (
                      opponentPlayedCard ? (
                        <span className="text-red-400 flex items-center gap-1.5 animate-pulse">
                          🛡️ ĐỐI THỦ TẤN CÔNG BẰNG {opponentPlayedStatRef.current?.toUpperCase()}! Chọn thẻ để thủ.
                        </span>
                      ) : (
                        <span className="text-slate-400 flex items-center gap-1.5 animate-pulse">
                          🛡️ LƯỢT BẠN PHÒNG THỦ! Đang chờ đối thủ chọn bài & chỉ số...
                        </span>
                      )
                    )
                  )}
                  {phase === 'waiting_start' && <span className="text-slate-400 animate-pulse">⏳ Chờ máy chủ cấp chỉ số mới...</span>}
                  {phase === 'waiting' && <span className="text-cyan-400 animate-pulse">⏳ Đã ra bài, chờ đối thủ...</span>}
                  {phase === 'result' && <span className="text-yellow-400 animate-pulse">⚡ Đang so tài chỉ số...</span>}
                </div>
              )}
            </div>

          </div>

          {/* BÀI TRÊN TAY */}
          <div className="flex-none bg-black/90 border-t border-white/10 shrink-0"
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
            <div className="overflow-x-auto hide-scrollbar" style={{ height: 'clamp(140px, 20vh, 180px)' }}>
              <div className="flex flex-row items-center h-full px-3 py-2 gap-2 min-w-max">
                {myDeck.map((player, idx) => {
                  const isCap = effectiveSquad.length > 0 && player.id === effectiveSquad[0].id;
                  const chemBoost = getPlayerChemistryBoost(player, effectiveSquad);
                  
                  return (
                    <div key={player.id}
                      className={`h-full aspect-[5/7] shrink-0 rounded-xl overflow-hidden transition-all duration-200 select-none relative ${
                        canSelect
                          ? 'cursor-pointer active:scale-90 hover:-translate-y-3 hover:shadow-2xl hover:shadow-cyan-500/20 hover:ring-2 hover:ring-cyan-400/80'
                          : 'opacity-30 grayscale cursor-not-allowed'}`}
                      style={{ zIndex: myDeck.length - idx }}
                      onClick={() => canSelect && handleCardSelect(player)}>
                      <CardComponent player={player} />
                      
                      {/* Badges overlay on the card in hand */}
                      <div className="absolute top-1 right-1 z-30 flex flex-col gap-0.5 pointer-events-none select-none">
                        {isCap && (
                          <span className="bg-gradient-to-r from-yellow-500 to-amber-600 text-slate-950 text-[7px] font-black px-1.5 py-0.2 rounded-full border border-yellow-400/50 shadow-md">
                            👑
                          </span>
                        )}
                        {chemBoost > 0 && (
                          <span className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-[7px] font-black px-1.5 py-0.2 rounded-full border border-cyan-400/50 shadow-md">
                            🤝
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Chọn chỉ số tấn công Modal */}
      {selectedPlayerCard && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fade-in pointer-events-auto">
          <div className="glass-panel p-6 sm:p-8 rounded-[2rem] max-w-sm sm:max-w-md w-full flex flex-col items-center border border-white/10 shadow-[0_0_50px_rgba(251,191,36,0.2)] animate-scale-in relative">
            <button 
              className="absolute top-4 right-4 text-gray-400 hover:text-white bg-black/40 hover:bg-black/80 p-2 rounded-full w-8 h-8 flex items-center justify-center transition-colors cursor-pointer"
              onClick={() => setSelectedPlayerCard(null)}
            >
              ✕
            </button>

            <h2 className="text-sm sm:text-base font-black text-amber-400 mb-6 uppercase tracking-widest text-center">Chọn Chỉ Số Tấn Công</h2>
            
            <div className="w-40 sm:w-48 mb-8 scale-110 drop-shadow-2xl">
              <CardComponent player={selectedPlayerCard} />
            </div>

            <div className="flex gap-3 sm:gap-4 w-full">
              <button className="flex-1 flex flex-col items-center bg-black/60 hover:bg-red-900/50 border border-red-500/50 hover:border-red-400 rounded-xl py-3 transition-all group shadow-[0_0_15px_rgba(239,68,68,0.3)] hover:-translate-y-2 hover:shadow-[0_0_30px_rgba(239,68,68,0.6)] cursor-pointer" onClick={() => playRoundPvp('attack')}>
                  <span className="text-[10px] sm:text-xs font-bold text-red-400 tracking-widest uppercase group-hover:text-white transition-colors">ATK</span>
                  <span className="text-2xl sm:text-3xl font-black text-white">{selectedPlayerCard.stats.attack}</span>
              </button>
              <button className="flex-1 flex flex-col items-center bg-black/60 hover:bg-green-900/50 border border-green-500/50 hover:border-green-400 rounded-xl py-3 transition-all group shadow-[0_0_15px_rgba(34,197,94,0.3)] hover:-translate-y-2 hover:shadow-[0_0_30px_rgba(34,197,94,0.6)] cursor-pointer" onClick={() => playRoundPvp('control')}>
                  <span className="text-[10px] sm:text-xs font-bold text-green-400 tracking-widest uppercase group-hover:text-white transition-colors">CTRL</span>
                  <span className="text-2xl sm:text-3xl font-black text-white">{selectedPlayerCard.stats.control}</span>
              </button>
              <button className="flex-1 flex flex-col items-center bg-black/60 hover:bg-blue-900/50 border border-blue-500/50 hover:border-blue-400 rounded-xl py-3 transition-all group shadow-[0_0_15px_rgba(59,130,246,0.3)] hover:-translate-y-2 hover:shadow-[0_0_30px_rgba(59,130,246,0.6)] cursor-pointer" onClick={() => playRoundPvp('defense')}>
                  <span className="text-[10px] sm:text-xs font-bold text-blue-400 tracking-widest uppercase group-hover:text-white transition-colors">DEF</span>
                  <span className="text-2xl sm:text-3xl font-black text-white">{selectedPlayerCard.stats.defense}</span>
              </button>
            </div>

            <button 
              className="mt-6 w-full py-2.5 bg-white/5 hover:bg-white/10 text-white font-bold text-xs uppercase tracking-widest rounded-xl transition-all cursor-pointer border border-white/10 hover:border-white/20 active:scale-[0.98]"
              onClick={() => {
                playFx('click');
                setSelectedPlayerCard(null);
              }}
            >
              ⟲ Chọn Cầu Thủ Khác
            </button>
          </div>
        </div>
      )}

      {/* Reusable In-Game Custom Alert Modal */}
      {pvpAlert && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center bg-black/90 p-4 animate-fade-in">
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
