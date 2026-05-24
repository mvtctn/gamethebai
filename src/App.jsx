import React, { useState, useEffect } from 'react';
import { PackageOpen, Users, Swords, ChevronRight, CheckCircle2, Lock, Coins, Sparkles, Play, Trophy, Shield, Target, Wifi } from 'lucide-react';
import playersData from './players.json';
import MultiplayerEngine from './MultiplayerEngine';

const PITCH_POSITIONS = [
  { top: '85%', left: '50%' }, // GK
  { top: '65%', left: '15%' }, // LB
  { top: '70%', left: '35%' }, // CB1
  { top: '70%', left: '65%' }, // CB2
  { top: '65%', left: '85%' }, // RB
  { top: '45%', left: '25%' }, // CM1
  { top: '50%', left: '50%' }, // CM2
  { top: '45%', left: '75%' }, // CM3
  { top: '20%', left: '25%' }, // LW
  { top: '15%', left: '50%' }, // ST
  { top: '20%', left: '75%' }, // RW
];

// --- Card Component ---
export const Card = ({ player, onClick, isSelectable, isSelected, hideStats }) => {
  if (!player) return null;
  const maxStat = Math.max(player.stats.attack, player.stats.defense, player.stats.control);
  
  return (
    <div 
      className={`card-container group relative w-full aspect-[5/7] ${isSelectable ? 'cursor-pointer' : ''} ${isSelected ? 'scale-105 z-50' : ''}`}
      onClick={() => onClick && onClick(player)}
    >
      {isSelected && <div className="absolute inset-0 bg-blue-500 blur-md rounded-xl opacity-50 z-[-1]"></div>}
      
      <div className="card w-full h-full" data-rarity={player.type}>
        {/* Background texture */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 mix-blend-overlay"></div>
        <div className="card-glow absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

        {/* Top left info: Overall Rating, Type */}
        <div className="absolute top-2 left-2 flex flex-col items-center z-20 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
          <span className="text-xl sm:text-2xl font-black italic text-white tracking-tighter leading-none mb-0.5">
            {maxStat}
          </span>
          <span className="text-[0.55rem] sm:text-[0.65rem] font-bold uppercase tracking-widest text-white/90 mb-1">
            {player.type.split(' ')[0]}
          </span>
          {player.nation && player.nation !== 'World' && (
            <img src={`https://flagcdn.com/w20/${player.nation}.png`} alt={player.nation} className="w-5 h-auto rounded-sm drop-shadow-md border border-white/30" title={player.nation.toUpperCase()} />
          )}
        </div>
        
        {/* Player Image */}
        <div className="absolute top-0 left-0 w-full h-[65%] z-10 flex items-end justify-center overflow-hidden rounded-t-lg">
          <img 
            src={player.image} 
            alt={player.name} 
            className="w-full h-full object-cover object-top drop-shadow-[0_5px_10px_rgba(0,0,0,0.6)] transition-transform duration-500 group-hover:scale-110" 
          />
        </div>

        {/* Bottom Info Area with gradient overlay */}
        <div className="absolute bottom-0 w-full h-[45%] bg-gradient-to-t from-black via-black/90 to-transparent z-20 flex flex-col items-center justify-end pb-2 sm:pb-3 px-1 sm:px-2 pointer-events-none">
          {/* Name */}
          <div className="text-center w-[90%] mb-1 sm:mb-2 border-b-2 border-white/20 pb-0.5 sm:pb-1">
            <h3 className="text-xs sm:text-sm font-black italic uppercase text-white truncate drop-shadow-[0_2px_2px_rgba(0,0,0,1)] tracking-wider">
              {player.name}
            </h3>
          </div>
          
          {/* Stats Grid */}
          <div className="flex justify-around w-[90%]">
            <div className="flex flex-col items-center">
               <span className="text-xs sm:text-sm font-black text-white">{hideStats ? '?' : player.stats.attack}</span>
               <span className="text-[0.45rem] sm:text-[0.55rem] font-bold text-gray-400">ATK</span>
            </div>
            <div className="w-[1px] bg-white/20 mx-0.5"></div>
            <div className="flex flex-col items-center">
               <span className="text-xs sm:text-sm font-black text-white">{hideStats ? '?' : player.stats.control}</span>
               <span className="text-[0.45rem] sm:text-[0.55rem] font-bold text-gray-400">CTRL</span>
            </div>
            <div className="w-[1px] bg-white/20 mx-0.5"></div>
            <div className="flex flex-col items-center">
               <span className="text-xs sm:text-sm font-black text-white">{hideStats ? '?' : player.stats.defense}</span>
               <span className="text-[0.45rem] sm:text-[0.55rem] font-bold text-gray-400">DEF</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Main App Component ---
export default function App() {
  const currentUser = localStorage.getItem('panini_currentUser');

  // Load state directly based on currentUser prefix
  const [collection, setCollection] = useState(() => JSON.parse(localStorage.getItem(`panini_${currentUser}_collection`)) || []);
  const [squad, setSquad] = useState(() => JSON.parse(localStorage.getItem(`panini_${currentUser}_squad`)) || []);
  const [coins, setCoins] = useState(() => {
    const saved = localStorage.getItem(`panini_${currentUser}_coins`);
    return saved !== null ? parseInt(saved) : 200; // Starting coins
  });
  const [completedQuests, setCompletedQuests] = useState(() => JSON.parse(localStorage.getItem(`panini_${currentUser}_quests`)) || []);
  
  const [gameState, setGameState] = useState('lobby'); // 'lobby', 'packOpening', 'teamBuilder', 'matchEngine', 'quests', 'multiplayer'
  
  // Auth State
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'register'
  const [authUsername, setAuthUsername] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  
  const [isPackOpeningAnim, setIsPackOpeningAnim] = useState(false);
  const [openedCards, setOpenedCards] = useState([]);

  // Economy State
  const [quests, setQuests] = useState([
    { id: 'play1', title: 'Đá 1 trận với AI', target: 1, progress: 0, reward: 50, isCompleted: false, isClaimed: false },
    { id: 'win1', title: 'Thắng 1 trận với AI', target: 1, progress: 0, reward: 100, isCompleted: false, isClaimed: false },
    { id: 'collect20', title: 'Sưu tầm 20 thẻ khác nhau', target: 20, progress: 0, reward: 150, isCompleted: false, isClaimed: false }
  ]);
  const [lastReward, setLastReward] = useState(0);

  useEffect(() => {
    const uniqueCards = new Set(collection.map(c => c.id)).size;
    setQuests(prev => prev.map(q => {
      if (q.id === 'collect20') {
        const isDone = uniqueCards >= 20;
        return { ...q, progress: Math.min(uniqueCards, 20), isCompleted: isDone || q.isCompleted };
      }
      return q;
    }));
  }, [collection]);

  // Match State
  const [difficulty, setDifficulty] = useState('Easy');
  const [matchPhase, setMatchPhase] = useState('setup'); // setup, playing, roundResult, gameOver
  const [playerHand, setPlayerHand] = useState([]);
  const [aiHand, setAiHand] = useState([]);
  const [matchScore, setMatchScore] = useState({ player: 0, ai: 0 });
  const [matchLogs, setMatchLogs] = useState([]);
  
  // Current Round State
  const [selectedPlayerCard, setSelectedPlayerCard] = useState(null);
  const [selectedStat, setSelectedStat] = useState(null);
  const [currentAiCard, setCurrentAiCard] = useState(null);
  const [roundResultMsg, setRoundResultMsg] = useState("");
  const [playedCardIds, setPlayedCardIds] = useState([]);

  const handleAuth = (e) => {
    e.preventDefault();
    if (!authUsername.trim()) return;
    localStorage.setItem('panini_currentUser', authUsername);
    window.location.reload();
  };

  const handleLogout = () => {
    localStorage.removeItem('panini_currentUser');
    window.location.reload();
  };

  // --- Logic ---
  const openPack = () => {
    if (coins < 100) {
      alert("Bạn không đủ Xu để mua gói thẻ. Hãy làm nhiệm vụ để kiếm thêm Xu!");
      return;
    }
    setCoins(c => c - 100);
    setIsPackOpeningAnim(true);
    setTimeout(() => {
      const weakCards = playersData.filter(p => p.type === 'Base');
      const strongCards = playersData.filter(p => !['Base', 'Icon', 'Golden Baller'].includes(p.type));
      const eliteCards = playersData.filter(p => ['Icon', 'Golden Baller'].includes(p.type));

      const packCards = [];
      // Mở 16 thẻ
      for (let i = 0; i < 16; i++) {
        const rand = Math.random();
        let pool;
        if (rand < 0.75) {
          pool = weakCards; // 75% ra thẻ Base (yếu)
        } else if (rand < 0.95) {
          pool = strongCards; // 20% ra thẻ hiếm thường
        } else {
          pool = eliteCards; // 5% ra thẻ cực hiếm (Icon, Golden Baller)
        }
        
        // Random 1 thẻ trong pool
        const randomCard = pool[Math.floor(Math.random() * pool.length)];
        
        // Tránh trùng lặp 1 thẻ y hệt trong cùng 1 pack
        if (!packCards.find(c => c.id === randomCard.id)) {
          packCards.push(randomCard);
        } else {
          i--; // Thử lại nếu trùng
        }
      }

      setOpenedCards(packCards);
      setCollection(prev => {
        const newCollection = [...prev];
        packCards.forEach(c => {
          if (!newCollection.find(p => p.id === c.id)) {
            newCollection.push(c);
          }
        });
        return newCollection;
      });
      setIsPackOpeningAnim(false);
    }, 1500);
  };

  const toggleSquad = (player) => {
    if (squad.find(p => p.id === player.id)) {
      setSquad(squad.filter(p => p.id !== player.id));
    } else {
      if (squad.length < 11) {
        setSquad([...squad, player]);
      }
    }
  };

  const generateAITeam = (diff) => {
    const pool = [...playersData];
    const filteredPool = pool.filter(p => {
      // Đánh giá sức mạnh thẻ dựa trên chỉ số tốt nhất của nó
      const maxStat = Math.max(p.stats.attack, p.stats.defense, p.stats.control);
      
      if (diff === 'Easy') return maxStat <= 75; // Chỉ dùng thẻ yếu
      if (diff === 'Medium') return maxStat > 75 && maxStat <= 89; // Thẻ tầm trung và khá
      if (diff === 'Hard') return maxStat >= 93; // Cực khó: Toàn siêu sao với chỉ số đỉnh cao >= 93
      return true;
    });

    const safePool = filteredPool.length >= 11 ? filteredPool : pool;
    const shuffled = safePool.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 11);
  };

  const startMatch = () => {
    setPlayerHand([...squad]);
    setAiHand(generateAITeam(difficulty));
    setMatchScore({ player: 0, ai: 0 });
    setMatchLogs([]);
    setPlayedCardIds([]);
    setMatchPhase('playing');
    setSelectedPlayerCard(null);
    setSelectedStat(null);
    setCurrentAiCard(null);
  };

    const playRound = (stat) => {
    setSelectedStat(stat);
    
    // AI picks a random card
    const aiIndex = Math.floor(Math.random() * aiHand.length);
    const aiCard = aiHand[aiIndex];
    setCurrentAiCard(aiCard);

    // Compare logic:
    // If player picks Attack, compare with AI's Defense
    // If player picks Defense, compare with AI's Attack
    // If player picks Control, compare with AI's Control
    let v1 = selectedPlayerCard.stats[stat];
    let v2 = 0;
    let stat2Name = '';
    
    if (stat === 'attack') {
      v2 = aiCard.stats.defense;
      stat2Name = 'defense';
    } else if (stat === 'defense') {
      v2 = aiCard.stats.attack;
      stat2Name = 'attack';
    } else {
      v2 = aiCard.stats.control;
      stat2Name = 'control';
    }

    let pScore = matchScore.player;
    let aScore = matchScore.ai;
    let msg = '';

    if (v1 > v2) {
      pScore++;
      msg = `THẮNG! ${v1} > ${v2}`;
    } else if (v2 > v1) {
      aScore++;
      msg = `THUA! ${v1} < ${v2}`;
    } else {
      msg = `HÒA! ${v1} = ${v2}`;
    }

    setMatchScore({ player: pScore, ai: aScore });
    setRoundResultMsg(msg);
    setMatchLogs([...matchLogs, `Lượt ${playedCardIds.length + 1}: ${selectedPlayerCard.name} (${stat.toUpperCase()}) vs ${aiCard.name} (${stat2Name.toUpperCase()}) -> ${msg}`]);
    setMatchPhase('roundResult');

    // Remove cards from hands
    setPlayedCardIds([...playedCardIds, selectedPlayerCard.id]);
    setAiHand(aiHand.filter((_, i) => i !== aiIndex));
  };

  const nextRound = () => {
    if (playedCardIds.length >= 10) { // Đã đánh 11 lá (0 đến 10 là 11 lá, check sau khi cộng)
      // Trận đấu kết thúc -> Tính thưởng
      let reward = 10;
      if (matchScore.player > matchScore.ai) reward = 50;
      else if (matchScore.player === matchScore.ai) reward = 20;
      
      setCoins(c => c + reward);
      setLastReward(reward);
      
      // Cập nhật Nhiệm vụ
      setQuests(prev => prev.map(q => {
         if (q.id === 'play1') return { ...q, progress: 1, isCompleted: true };
         if (q.id === 'win1' && matchScore.player > matchScore.ai) return { ...q, progress: 1, isCompleted: true };
         return q;
      }));

      setMatchPhase('gameOver');
    } else {
      setSelectedPlayerCard(null);
      setSelectedStat(null);
      setCurrentAiCard(null);
      setMatchPhase('playing');
    }
  };

  const returnToLobby = () => {
    setGameState('lobby');
    setMatchPhase('setup');
    setPlayerHand([]);
    setAiHand([]);
    setSelectedPlayerCard(null);
    setSelectedStat(null);
    setCurrentAiCard(null);
  };

  return (
    <>
      {/* Auth Modal overlay over everything if not logged in */}
      {!currentUser && (
        <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1518605368461-1ee7c5320746?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-30 blur-sm"></div>
          <div className="bg-slate-900/90 backdrop-blur-xl border-2 border-slate-700 p-8 rounded-2xl w-full max-w-md relative z-10 shadow-[0_0_50px_rgba(0,0,0,0.8)]">
            <h1 className="text-4xl font-black italic text-center mb-8 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400 drop-shadow-lg">
              WC 2026 PANINI
            </h1>
            <div className="flex gap-4 mb-6">
              <button 
                className={`flex-1 pb-2 font-bold text-lg border-b-2 transition-colors ${authMode === 'login' ? 'border-blue-500 text-blue-400' : 'border-slate-700 text-slate-500 hover:text-slate-300'}`}
                onClick={() => setAuthMode('login')}
              >
                Đăng Nhập
              </button>
              <button 
                className={`flex-1 pb-2 font-bold text-lg border-b-2 transition-colors ${authMode === 'register' ? 'border-blue-500 text-blue-400' : 'border-slate-700 text-slate-500 hover:text-slate-300'}`}
                onClick={() => setAuthMode('register')}
              >
                Đăng Ký Mới
              </button>
            </div>
            <form onSubmit={handleAuth} className="flex flex-col gap-4">
              <div>
                <label className="block text-slate-400 text-sm font-bold mb-2">Tên Đăng Nhập</label>
                <input 
                  type="text" 
                  className="w-full bg-slate-800 border border-slate-600 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  value={authUsername}
                  onChange={(e) => setAuthUsername(e.target.value)}
                  placeholder="Nhập username (viết liền không dấu)..."
                />
              </div>
              <div>
                <label className="block text-slate-400 text-sm font-bold mb-2">Mật Khẩu</label>
                <input 
                  type="password" 
                  className="w-full bg-slate-800 border border-slate-600 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  placeholder="Nhập password..."
                />
              </div>
              <button type="submit" className="btn !bg-blue-600 hover:!bg-blue-500 !py-4 mt-4 w-full text-xl font-bold uppercase tracking-wider">
                {authMode === 'login' ? 'Vào Game 🎮' : 'Đăng Ký Ngay 🚀'}
              </button>
            </form>
          </div>
        </div>
      )}

      {currentUser && (
        <>
          <div className="bg-stadium"></div>
          <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,_transparent_0%,_rgba(0,0,0,0.8)_100%)] z-50 mix-blend-overlay"></div>
          <div className="fixed inset-0 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20 z-50"></div>
          
          {/* User Header Profile */}
          <div className="absolute top-4 right-4 z-50 flex items-center gap-4 bg-black/50 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 shadow-lg">
            <div className="text-sm">
              <span className="text-gray-400">HLV: </span>
              <span className="font-bold text-fuchsia-400">{currentUser}</span>
            </div>
            <div className="w-[1px] h-4 bg-white/20"></div>
            <button onClick={handleLogout} className="text-xs text-red-400 hover:text-red-300 font-bold uppercase tracking-wider">Thoát</button>
          </div>

          <div className="app-container relative z-10">
            {gameState !== 'lobby' && (
              <h1 className="text-3xl md:text-5xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-gray-100 to-gray-400 drop-shadow-[0_5px_15px_rgba(0,0,0,0.8)] text-center mb-8 uppercase cursor-pointer" onClick={() => setGameState('lobby')}>
                WC 2026 PANINI
              </h1>
            )}

            {gameState === 'lobby' && (() => {
              const uniqueCards = new Set(collection.map(c => c.id)).size;
              const totalCards = playersData.length;
              const completionPercent = Math.round((uniqueCards / totalCards) * 100) || 0;

              return (
                <div className="flex flex-col items-center justify-center min-h-[85vh] w-full animate-fade-in relative z-10 pt-12">
                  
                  {/* Hero Section */}
                  <div className="relative flex flex-col items-center mb-16">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-yellow-500/20 rounded-full blur-[100px] pointer-events-none"></div>
                    
                    <Trophy size={180} className="text-yellow-400 trophy-hero mb-4 drop-shadow-[0_0_40px_rgba(251,191,36,0.8)]" />
                    
                    <h1 className="text-7xl md:text-9xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-blue-100 to-blue-400 drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)] mb-2 uppercase text-center leading-none">
                      World Cup
                    </h1>
                    <h2 className="text-4xl md:text-6xl font-black italic tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-500 to-cyan-500 drop-shadow-[0_5px_15px_rgba(0,0,0,0.9)] mb-8 uppercase text-center">
                      2026 Ultimate
                    </h2>
                    
                    <div className="glass-panel px-8 py-4 rounded-full flex gap-8 mb-8 mt-4">
                      <div className="flex items-center gap-3">
                        <Coins className="text-yellow-400" size={28}/> 
                        <span className="text-2xl font-black text-white drop-shadow-md">{coins} Xu</span>
                      </div>
                      <div className="w-[1px] bg-white/20"></div>
                      <div className="flex items-center gap-3">
                        <span className="text-2xl font-black text-cyan-400 drop-shadow-md">Tiến độ: {completionPercent}%</span>
                      </div>
                    </div>
                  </div>

                  {/* Glass Menu */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6 w-full max-w-6xl px-4 z-20">
                    <button className="glass-menu-card p-8 rounded-3xl flex flex-col items-center group cursor-pointer" onClick={() => {
                        if (coins >= 100) {
                          setOpenedCards([]);
                          setGameState('packOpening');
                        } else {
                          alert("Bạn không đủ Xu!");
                        }
                      }}>
                      <PackageOpen size={64} className="text-fuchsia-400 mb-4 group-hover:scale-110 group-hover:-rotate-6 transition-transform duration-300 drop-shadow-[0_0_20px_rgba(232,121,249,0.6)]" />
                      <h3 className="text-2xl font-black italic uppercase tracking-wider mb-2 text-white">Mở Gói Thẻ</h3>
                      <p className="text-gray-300 text-center font-medium text-sm">100 Xu • Nhận siêu sao.</p>
                    </button>

                    <button className={`glass-menu-card p-8 rounded-3xl flex flex-col items-center group cursor-pointer ${collection.length === 0 ? 'opacity-50 grayscale' : ''}`} onClick={() => collection.length > 0 && setGameState('teamBuilder')}>
                      <Users size={64} className="text-blue-400 mb-4 group-hover:scale-110 transition-transform duration-300 drop-shadow-[0_0_20px_rgba(96,165,250,0.6)]" />
                      <h3 className="text-2xl font-black italic uppercase tracking-wider mb-2 text-white">Đội Hình</h3>
                      <p className="text-gray-300 text-center font-medium text-sm">Chọn 11 cầu thủ xuất sắc.</p>
                    </button>

                    <button className={`glass-menu-card p-8 rounded-3xl flex flex-col items-center group cursor-pointer ${squad.length < 11 ? 'opacity-50 grayscale' : ''}`} onClick={() => squad.length === 11 && setGameState('matchEngine')}>
                      <Swords size={64} className="text-amber-400 mb-4 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300 drop-shadow-[0_0_20px_rgba(251,191,36,0.6)]" />
                      <h3 className="text-2xl font-black italic uppercase tracking-wider mb-2 text-white">Đấu AI</h3>
                      <p className="text-gray-300 text-center font-medium text-sm">Đấu với Máy nhận phần thưởng.</p>
                    </button>

                    <button className={`glass-menu-card p-8 rounded-3xl flex flex-col items-center group cursor-pointer ${squad.length < 11 ? 'opacity-50 grayscale' : ''}`} onClick={() => squad.length === 11 && setGameState('multiplayer')}>
                      <div className="relative mb-4">
                        <Wifi size={64} className="text-red-400 group-hover:scale-110 transition-transform duration-300 drop-shadow-[0_0_20px_rgba(248,113,113,0.6)]" />
                        <span className="absolute -top-2 -right-2 bg-red-600 text-white text-[10px] font-black px-2 py-1 rounded-full animate-pulse">HOT</span>
                      </div>
                      <h3 className="text-2xl font-black italic uppercase tracking-wider mb-2 text-white">PVP ONLINE</h3>
                      <p className="text-gray-300 text-center font-medium text-sm">Đấu với bạn bè qua mạng.</p>
                    </button>
                  </div>

                  {/* Quests Quick Button */}
                  <div className="mt-12 mb-8">
                     <button className="glass-panel px-8 py-3 rounded-full text-lg font-bold uppercase tracking-widest text-emerald-400 hover:text-emerald-300 hover:bg-white/10 transition-colors flex items-center gap-2 cursor-pointer" onClick={() => setGameState('quests')}>
                        Nhiệm Vụ Hàng Ngày <ChevronRight size={20}/>
                     </button>
                  </div>
                </div>
              );
            })()}

      {gameState === 'multiplayer' && (
        <MultiplayerEngine 
          squad={squad} 
          currentUser={currentUser} 
          CardComponent={Card}
          onExit={() => setGameState('lobby')}
          onWin={() => {
            setCoins(c => c + 100);
            alert("Bạn nhận được 100 Xu vì giành chiến thắng PVP!");
          }}
        />
      )}

      {gameState === 'quests' && (
        <div className="w-full max-w-3xl mx-auto flex flex-col items-center mt-8">
          <div className="flex justify-between items-center w-full mb-8">
            <button className="btn !bg-gray-700" onClick={() => setGameState('lobby')}>← Về Sảnh</button>
            <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500 uppercase">
              Nhiệm Vụ
            </h2>
            <div className="flex items-center gap-2 bg-black/40 px-4 py-2 rounded-lg border border-yellow-500/30">
              <Coins className="text-yellow-400" />
              <span className="font-bold text-yellow-400 text-xl">{coins} Xu</span>
            </div>
          </div>

          <div className="w-full flex flex-col gap-4">
            {quests.map(q => (
              <div key={q.id} className={`p-6 rounded-xl border flex items-center justify-between ${q.isClaimed ? 'bg-black/50 border-gray-700 opacity-50' : 'bg-gradient-to-r from-indigo-900/40 to-slate-900 border-indigo-500/50 shadow-lg'}`}>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">{q.title}</h3>
                  <div className="text-sm text-gray-400 mb-2">Tiến độ: {q.progress} / {q.target}</div>
                  <div className="w-48 h-2 bg-gray-800 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500" style={{ width: `${Math.min(100, (q.progress/q.target)*100)}%` }}></div>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <div className="text-yellow-400 font-bold mb-2 flex items-center gap-1">
                    <Coins size={16} /> +{q.reward} Xu
                  </div>
                  {q.isClaimed ? (
                    <button className="btn !bg-gray-600 !px-4 !py-1" disabled>Đã Nhận</button>
                  ) : q.isCompleted ? (
                    <button className="btn !bg-yellow-500 !text-black !px-4 !py-1 font-bold animate-pulse" onClick={() => {
                      setCoins(c => c + q.reward);
                      setQuests(prev => prev.map(p => p.id === q.id ? { ...p, isClaimed: true } : p));
                    }}>
                      Nhận Thưởng
                    </button>
                  ) : (
                    <button className="btn !bg-gray-700 !px-4 !py-1" disabled>Chưa Đạt</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {gameState === 'packOpening' && (
        <div className="pack-opener">
          <h2>Nhận Đội Hình Đầu Tiên Của Bạn</h2>
          {openedCards.length === 0 ? (
            <div 
              className={`pack-visual ${isPackOpeningAnim ? 'opening' : ''}`}
              onClick={!isPackOpeningAnim ? openPack : undefined}
            >
            </div>
          ) : (
            <>
              <div className="cards-grid">
                {openedCards.map((card, i) => (
                  <Card key={i} player={card} />
                ))}
              </div>
              <button className="btn mt-12 w-full max-w-sm" onClick={() => setGameState('lobby')}>
                ← Trở Về Sảnh Chính
              </button>
            </>
          )}
        </div>
      )}

      {gameState === 'teamBuilder' && (
        <div className="team-builder">
          <div className="flex justify-between items-center mb-4">
            <button className="btn !bg-gray-700" onClick={() => setGameState('lobby')}>← Về Sảnh</button>
            <h2>Xây Dựng Đội Hình</h2>
            <div className="flex gap-4 items-center">
              <span className="text-xl font-bold">{squad.length}/11</span>
            </div>
          </div>
          
          <div className="team-layout flex-col md:flex-row">
            <div className="collection">
              <h3>Bộ sưu tập của bạn</h3>
              <div className="mini-cards-grid">
                {collection.filter(p => !squad.find(s => s.id === p.id)).map(card => (
                  <Card 
                    key={card.id} 
                    player={card} 
                    isSelectable 
                    onClick={() => toggleSquad(card)} 
                  />
                ))}
              </div>
            </div>
            <div className="squad">
              <h3>Đội hình chính (11)</h3>
              <div className="mini-cards-grid">
                {squad.map(card => (
                  <Card 
                    key={card.id} 
                    player={card} 
                    isSelectable 
                    isSelected
                    onClick={() => toggleSquad(card)} 
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {gameState === 'matchEngine' && (
        <div className="match-engine w-full">
          
          {matchPhase === 'setup' && (
            <div className="flex flex-col items-center">
              <button className="btn !bg-gray-700 self-start mb-8" onClick={() => setGameState('lobby')}>← Về Sảnh</button>
              <h2>Đấu trường AI</h2>
              <div className="difficulty-selector mb-8">
                {['Easy', 'Medium', 'Hard'].map(diff => (
                  <button 
                    key={diff}
                    className={difficulty === diff ? 'active' : ''}
                    onClick={() => setDifficulty(diff)}
                  >
                    {diff}
                  </button>
                ))}
              </div>
              <button className="btn flex items-center gap-2" onClick={startMatch}>
                <Play /> BẮT ĐẦU TRẬN ĐẤU
              </button>
            </div>
          )}

          {(matchPhase === 'playing' || matchPhase === 'roundResult') && (
            <div className="flex flex-col items-center w-full">
              <div className="score-board mb-4 text-center">
                <span className={matchScore.player > matchScore.ai ? 'text-green-400' : ''}>{matchScore.player}</span>
                <div className="text-xl mx-4">TỈ SỐ</div>
                <span className={matchScore.ai > matchScore.player ? 'text-green-400' : ''}>{matchScore.ai}</span>
              </div>
              
              <div className="flex flex-col lg:flex-row gap-8 w-full">
                
                {/* Sân cỏ đội hình của bạn */}
                <div className="flex-1">
                  <h3 className="mb-4 text-center text-xl text-blue-300 font-bold tracking-widest drop-shadow-md">ĐỘI HÌNH RA SÂN CỦA BẠN</h3>
                  <div className="pitch-wrapper">
                    <div className="pitch-container">
                      <div className="pitch-lines">
                        <div className="penalty-box-top"></div>
                        <div className="penalty-box-bottom"></div>
                      </div>
                      {playerHand.map((player, index) => {
                        const pos = PITCH_POSITIONS[index] || { top: '50%', left: '50%' };
                        const isPlayed = playedCardIds.includes(player.id);
                        return (
                          <div 
                            key={player.id} 
                            className={`pitch-player-slot pitch-card-wrapper ${isPlayed ? 'played' : ''}`}
                            style={{ top: pos.top, left: pos.left }}
                          >
                            <Card 
                              player={player} 
                              isSelectable={!isPlayed && matchPhase === 'playing'} 
                              isSelected={selectedPlayerCard?.id === player.id}
                              onClick={(p) => {
                                if (!isPlayed && matchPhase === 'playing') setSelectedPlayerCard(p);
                              }}
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Bàn điều khiển đấu */}
                <div className="flex-1 flex flex-col items-center justify-center bg-gray-900/80 p-6 rounded-2xl border border-gray-700 h-fit">
                  <h3 className="mb-6 text-xl text-yellow-400 font-bold uppercase tracking-widest text-center">Bàn Điều Khiển</h3>
                  
                  {matchPhase === 'playing' && selectedPlayerCard && (
                    <div className="flex flex-col items-center animate-fade-in w-full">
                      <h4 className="mb-4 text-gray-300">Chọn 1 chỉ số để tấn công:</h4>
                      <div className="flex gap-4 mb-8">
                        <button className="btn !bg-red-600 !px-6" onClick={() => playRound('attack')}>ATK: {selectedPlayerCard.stats.attack}</button>
                        <button className="btn !bg-green-600 !px-6" onClick={() => playRound('control')}>CTRL: {selectedPlayerCard.stats.control}</button>
                        <button className="btn !bg-blue-600 !px-6" onClick={() => playRound('defense')}>DEF: {selectedPlayerCard.stats.defense}</button>
                      </div>
                      <div className="text-sm text-gray-500 max-w-sm text-center bg-black/30 p-4 rounded-lg">
                        Luật: <strong>ATK</strong> đấu DEF, <strong>DEF</strong> đấu ATK, <strong>CTRL</strong> đấu CTRL.
                      </div>
                    </div>
                  )}

                  {matchPhase === 'playing' && !selectedPlayerCard && (
                    <div className="text-center text-gray-400 py-12 px-6 border-2 border-dashed border-gray-600 rounded-xl bg-black/20 w-full">
                      <Sparkles size={48} className="mx-auto mb-4 opacity-30" />
                      Nhấp vào một cầu thủ trên sân cỏ<br/>để tung ra sân khấu.
                    </div>
                  )}

                  {matchPhase === 'roundResult' && (
                    <div className="round-result-panel animate-fade-in w-full flex flex-col items-center">
                      <div className="flex gap-12 justify-center items-center mb-8">
                        <div className="transform scale-125"><Card player={selectedPlayerCard} /></div>
                        <div className="text-6xl font-black text-yellow-500 drop-shadow-[0_0_15px_rgba(234,179,8,0.8)]">VS</div>
                        <div className="transform scale-125"><Card player={currentAiCard} /></div>
                      </div>
                      <div className="text-3xl font-black mb-8 px-8 py-3 bg-red-900/50 rounded-xl border-2 border-red-500 text-white uppercase italic tracking-wider">
                        {roundResultMsg}
                      </div>
                      <button className="btn !px-12 !py-4 text-xl" onClick={nextRound}>
                        HIỆP TIẾP THEO <ChevronRight className="inline" />
                      </button>
                    </div>
                  )}
                </div>

                {/* AI Side */}
                <div className="flex-1 flex flex-col items-center justify-center bg-gray-900/80 p-6 rounded-2xl border border-gray-700 h-fit">
                  <h3 className="mb-6 text-xl text-red-400 font-bold uppercase tracking-widest text-center">Đội Hình AI</h3>
                  <div className="flex gap-4 flex-wrap justify-center opacity-80 pointer-events-none">
                     {aiHand.map((_, i) => (
                       <div key={i} className="w-16 h-24 bg-gradient-to-br from-gray-700 to-gray-900 border-2 border-dashed border-gray-500 rounded-lg flex flex-col items-center justify-center">
                         <div className="text-2xl text-gray-500 font-black">?</div>
                       </div>
                     ))}
                  </div>
                  <div className="mt-6 text-gray-400 font-bold uppercase tracking-widest">
                    Số thẻ còn lại: <span className="text-red-400">{aiHand.length}</span>
                  </div>
                </div>

              </div>
            </div>
          )}

          {matchPhase === 'gameOver' && (
            <div className="flex flex-col items-center w-full">
              <div className="score-board mb-8 text-center">
                <span className={matchScore.player > matchScore.ai ? 'text-green-400' : ''}>{matchScore.player}</span>
                <div className="text-xl mx-4">-</div>
                <span className={matchScore.ai > matchScore.player ? 'text-green-400' : ''}>{matchScore.ai}</span>
              </div>
              <h3 className="text-3xl font-bold mb-4">
                {matchScore.player > matchScore.ai ? "BẠN ĐÃ CHIẾN THẮNG! 🏆" : matchScore.player < matchScore.ai ? "BẠN ĐÃ THUA! 💀" : "HÒA NHAU! 🤝"}
              </h3>
              <div className="bg-yellow-900/40 border border-yellow-500/50 px-6 py-3 rounded-xl mb-6 flex items-center gap-3">
                <Coins className="text-yellow-400" size={28} />
                <span className="text-2xl font-bold text-yellow-400">+{lastReward} Xu</span>
              </div>
              <div className="match-log">
                {matchLogs.map((log, i) => (
                  <div key={i} className="log-entry">{log}</div>
                ))}
              </div>
              <button className="btn mt-8" onClick={returnToLobby}>Trở Về Sảnh Chính</button>
            </div>
              )}
            </div>
          )}
        </div>
        </>
      )}
    </>
  );
}
