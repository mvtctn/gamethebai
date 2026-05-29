import { useState, useEffect, useCallback } from 'react';
import { ref, set, push, onValue, update, get, serverTimestamp, remove } from 'firebase/database';
import { database, isConnectedToFirebase } from '../../../firebase';
import { playFx } from '../../../utils';

export function useTournamentLogic(currentUser, level, showAlert) {
  const [activeTournamentId, setActiveTournamentId] = useState(null);
  const [activeTournamentMatchId, setActiveTournamentMatchId] = useState(null);
  const [tournamentData, setTournamentData] = useState(null);
  const [tournamentChat, setTournamentChat] = useState([]);
  const [loading, setLoading] = useState(false);

  // Subscribe to current tournament
  useEffect(() => {
    if (!activeTournamentId || !isConnectedToFirebase) {
      setTournamentData(null);
      setTournamentChat([]);
      return;
    }

    const tRef = ref(database, `/tournaments/${activeTournamentId}`);
    const unsubT = onValue(tRef, (snap) => {
      if (snap.exists()) {
        setTournamentData(snap.val());
      } else {
        setTournamentData(null);
        setActiveTournamentId(null);
        showAlert("Lỗi", "Giải đấu không tồn tại hoặc đã bị xóa.");
      }
    });

    const chatRef = ref(database, `/tournaments/${activeTournamentId}/chat`);
    const unsubChat = onValue(chatRef, (snap) => {
      if (snap.exists()) {
        const msgs = [];
        snap.forEach(child => {
          msgs.push({ id: child.key, ...child.val() });
        });
        setTournamentChat(msgs);
      } else {
        setTournamentChat([]);
      }
    });

    return () => {
      unsubT();
      unsubChat();
    };
  }, [activeTournamentId, isConnectedToFirebase, showAlert]);

  const generateTournamentId = () => {
    return 'T-' + Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  const createTournament = async (name, format) => {
    if (!currentUser || !isConnectedToFirebase) return null;
    setLoading(true);
    playFx('click');
    const tid = generateTournamentId();
    const newTournament = {
      id: tid,
      name,
      host: currentUser,
      format, // 'single' | 'double'
      status: 'gathering', // gathering, playing, finished
      createdAt: serverTimestamp(),
      participants: {
        [currentUser]: {
          name: currentUser,
          points: 0,
          played: 0,
          won: 0,
          draw: 0,
          lost: 0,
          gf: 0,
          ga: 0
        }
      }
    };

    try {
      await set(ref(database, `/tournaments/${tid}`), newTournament);
      setActiveTournamentId(tid);
      return tid;
    } catch (e) {
      console.error(e);
      showAlert("Lỗi", "Không thể tạo giải đấu");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const joinTournament = async (tid) => {
    if (!currentUser || !isConnectedToFirebase) return;
    setLoading(true);
    playFx('click');
    const tidUpper = tid.toUpperCase();
    try {
      const snap = await get(ref(database, `/tournaments/${tidUpper}`));
      if (!snap.exists()) {
        showAlert("Lỗi", "Mã giải đấu không tồn tại!");
        setLoading(false);
        return;
      }
      const tData = snap.val();
      if (tData.status !== 'gathering') {
        showAlert("Lỗi", "Giải đấu này đã bắt đầu hoặc đã kết thúc, không thể tham gia!");
        setLoading(false);
        return;
      }
      if (tData.participants && tData.participants[currentUser]) {
        // Already joined
        setActiveTournamentId(tidUpper);
        setLoading(false);
        return;
      }

      await update(ref(database, `/tournaments/${tidUpper}/participants/${currentUser}`), {
        name: currentUser,
        points: 0,
        played: 0,
        won: 0,
        draw: 0,
        lost: 0,
        gf: 0,
        ga: 0
      });
      setActiveTournamentId(tidUpper);
    } catch (e) {
      console.error(e);
      showAlert("Lỗi", "Có lỗi xảy ra khi tham gia giải đấu.");
    } finally {
      setLoading(false);
    }
  };

  const leaveTournament = async () => {
    if (!activeTournamentId || !currentUser || !tournamentData) return;
    playFx('click');
    
    if (tournamentData.status === 'gathering') {
      // Just remove participant
      if (tournamentData.host === currentUser) {
        // If host leaves during gathering, delete tournament
        await remove(ref(database, `/tournaments/${activeTournamentId}`));
        setActiveTournamentId(null);
        showAlert("Thông báo", "Giải đấu đã bị hủy do chủ tọa rời đi.");
      } else {
        await remove(ref(database, `/tournaments/${activeTournamentId}/participants/${currentUser}`));
        setActiveTournamentId(null);
      }
    } else if (tournamentData.status === 'playing') {
      // Forfeit all remaining matches
      const updates = {};
      Object.keys(tournamentData.matches || {}).forEach(mId => {
        const m = tournamentData.matches[mId];
        if (m.status === 'pending' && (m.p1 === currentUser || m.p2 === currentUser)) {
          updates[`/tournaments/${activeTournamentId}/matches/${mId}/status`] = 'forfeited';
          const winner = m.p1 === currentUser ? m.p2 : m.p1;
          updates[`/tournaments/${activeTournamentId}/matches/${mId}/winner`] = winner;
          
          // Add points to winner
          const wPts = tournamentData.participants[winner].points || 0;
          const wWon = tournamentData.participants[winner].won || 0;
          const wPlayed = tournamentData.participants[winner].played || 0;
          updates[`/tournaments/${activeTournamentId}/participants/${winner}/points`] = wPts + 3;
          updates[`/tournaments/${activeTournamentId}/participants/${winner}/won`] = wWon + 1;
          updates[`/tournaments/${activeTournamentId}/participants/${winner}/played`] = wPlayed + 1;

          // Add loss to leaver
          const lPlayed = tournamentData.participants[currentUser].played || 0;
          const lLost = tournamentData.participants[currentUser].lost || 0;
          updates[`/tournaments/${activeTournamentId}/participants/${currentUser}/played`] = lPlayed + 1;
          updates[`/tournaments/${activeTournamentId}/participants/${currentUser}/lost`] = lLost + 1;
        }
      });
      
      // Mark user as left
      updates[`/tournaments/${activeTournamentId}/participants/${currentUser}/hasLeft`] = true;
      
      await update(ref(database), updates);
      setActiveTournamentId(null);
      showAlert("Thông báo", "Bạn đã rời giải. Tất cả các trận còn lại của bạn bị xử thua.");
    } else {
      setActiveTournamentId(null);
    }
  };

  const startTournament = async () => {
    if (!activeTournamentId || !tournamentData || tournamentData.host !== currentUser) return;
    const pKeys = Object.keys(tournamentData.participants || {});
    if (pKeys.length < 3) {
      showAlert("Lỗi", "Cần tối thiểu 3 người chơi để bắt đầu giải đấu.");
      return;
    }
    playFx('click');
    setLoading(true);

    // Generate Round Robin Schedule
    const matches = {};
    const format = tournamentData.format || 'single';
    let matchCounter = 1;

    for (let i = 0; i < pKeys.length; i++) {
      for (let j = i + 1; j < pKeys.length; j++) {
        // Leg 1
        matches[`m${matchCounter}`] = {
          p1: pKeys[i],
          p2: pKeys[j],
          status: 'pending',
          score1: 0,
          score2: 0,
          round: 1
        };
        matchCounter++;

        // Leg 2
        if (format === 'double') {
          matches[`m${matchCounter}`] = {
            p1: pKeys[j], // Reverse home/away
            p2: pKeys[i],
            status: 'pending',
            score1: 0,
            score2: 0,
            round: 2
          };
          matchCounter++;
        }
      }
    }

    try {
      await update(ref(database, `/tournaments/${activeTournamentId}`), {
        status: 'playing',
        matches: matches
      });
      sendTournamentChat("HỆ THỐNG", "Giải đấu chính thức bắt đầu! Chúc các HLV thi đấu tốt.");
    } catch (e) {
      console.error(e);
      showAlert("Lỗi", "Không thể bắt đầu giải đấu.");
    } finally {
      setLoading(false);
    }
  };

  const sendTournamentChat = async (sender, text) => {
    if (!activeTournamentId || !isConnectedToFirebase || !text.trim()) return;
    const chatRef = ref(database, `/tournaments/${activeTournamentId}/chat`);
    await push(chatRef, {
      sender,
      text: text.trim(),
      timestamp: serverTimestamp()
    });
  };

  return {
    activeTournamentId,
    setActiveTournamentId,
    activeTournamentMatchId,
    setActiveTournamentMatchId,
    tournamentData,
    tournamentChat,
    createTournament,
    joinTournament,
    leaveTournament,
    startTournament,
    sendTournamentChat,
    loading
  };
}
