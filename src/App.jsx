import React, { useState, useEffect } from 'react';
import { PackageOpen, Users, Swords, ChevronRight, CheckCircle2, Lock, Coins, Sparkles, Play, Trophy, Shield, Target, Wifi, User, ChevronLeft, Send, MessageSquare, Mail } from 'lucide-react';
import confetti from 'canvas-confetti';
import playersData from './players.json';
import MultiplayerEngine from './MultiplayerEngine';
import { database, isConnectedToFirebase } from './firebase';
import { ref, set, push, onValue, onDisconnect, serverTimestamp, get } from 'firebase/database';

const PITCH_POSITIONS = [
  { top: '80%', left: '50%' }, // GK
  { top: '60%', left: '15%' }, // LB
  { top: '65%', left: '35%' }, // CB1
  { top: '65%', left: '65%' }, // CB2
  { top: '60%', left: '85%' }, // RB
  { top: '40%', left: '25%' }, // CM1
  { top: '45%', left: '50%' }, // CM2
  { top: '40%', left: '75%' }, // CM3
  { top: '20%', left: '25%' }, // LW
  { top: '15%', left: '50%' }, // ST
  { top: '20%', left: '75%' }, // RW
];

const TIERS = [
  { name: 'Hạng Đồng', minLevel: 1, maxLevel: 5, color: 'text-amber-500 border-amber-500/30 bg-amber-950/20', glow: 'shadow-[0_0_15px_rgba(245,158,11,0.3)]', icon: '🥉' },
  { name: 'Hạng Bạc', minLevel: 6, maxLevel: 10, color: 'text-slate-300 border-slate-300/30 bg-slate-800/20', glow: 'shadow-[0_0_15px_rgba(203,213,225,0.3)]', icon: '🥈' },
  { name: 'Hạng Vàng', minLevel: 11, maxLevel: 15, color: 'text-yellow-400 border-yellow-400/30 bg-yellow-950/20', glow: 'shadow-[0_0_15px_rgba(234,179,8,0.4)]', icon: '🥇' },
  { name: 'Bạch Kim', minLevel: 16, maxLevel: 20, color: 'text-cyan-400 border-cyan-400/30 bg-cyan-950/20', glow: 'shadow-[0_0_15px_rgba(34,211,238,0.4)]', icon: '💎' },
  { name: 'Kim Cương', minLevel: 21, maxLevel: 25, color: 'text-purple-400 border-purple-400/30 bg-purple-950/20', glow: 'shadow-[0_0_15px_rgba(168,85,247,0.4)]', icon: '💠' },
  { name: 'Cao Thủ', minLevel: 26, maxLevel: 30, color: 'text-pink-500 border-pink-500/30 bg-pink-950/20', glow: 'shadow-[0_0_15px_rgba(236,72,153,0.5)]', icon: '👑' },
  { name: 'Thách Đấu', minLevel: 31, maxLevel: 999, color: 'text-rose-500 border-rose-500/30 bg-rose-950/20 animate-pulse', glow: 'shadow-[0_0_20px_rgba(244,63,94,0.6)]', icon: '🔥' },
];

const getPlayerTier = (lvl) => {
  const tier = TIERS.find(t => lvl >= t.minLevel && lvl <= t.maxLevel);
  return tier || TIERS[0];
};

const LEVEL_MILESTONES = [
  { level: 2, coins: 200, packs: 0, desc: 'Tiền thưởng thăng cấp 2 khởi đầu' },
  { level: 3, coins: 300, packs: 0, desc: 'Tiền thưởng thăng cấp 3' },
  { level: 4, coins: 200, packs: 1, desc: 'Tặng thêm 1 Gói Thẻ Miễn Phí' },
  { level: 5, coins: 500, packs: 1, desc: 'Đạt mốc lớn Cấp 5!' },
  { level: 8, coins: 500, packs: 1, desc: 'Tặng thêm 1 Gói Thẻ Miễn Phí' },
  { level: 10, coins: 1500, packs: 2, desc: 'Cột mốc Cấp 10 huyền thoại!' },
  { level: 15, coins: 2000, packs: 2, desc: 'Bứt phá Cấp 15 siêu phàm!' },
  { level: 20, coins: 3000, packs: 3, desc: 'Bạch Kim Cấp 20 đỉnh giới!' },
  { level: 25, coins: 4000, packs: 4, desc: 'Kim Cương Cấp 25 bá chủ!' },
  { level: 30, coins: 5000, packs: 5, desc: 'Thần thoại Cao Thủ tối thượng!' },
];

// --- Card Type Bonus for duel comparisons ---
const CARD_TYPE_BONUS = {
  'Base': 0,
  // Standard positional types
  'Top Keeper': 0,
  'Defensive Rock': 0,
  'Midfield Maestro': 0,
  'Goal Machine': 0,
  // Fan favourites / commons
  'Fan Favourite': 1,
  // Special activity-reward rarities (awarded via milestones)
  'Bronze Edition': 1,
  'Silver Edition': 2,
  'Golden Baller': 4,
  'Gold Edition': 4,
  'Platinum Edition': 6,
  'Super Limited': 8,
  'Icon': 8,
};

export const getCardTypeBonus = (type = '') => {
  if (!type) return 0;
  // Exact match first
  if (CARD_TYPE_BONUS[type] !== undefined) return CARD_TYPE_BONUS[type];
  // Prefix match fallback (e.g. "Attacker ARG" etc.)
  if (type.startsWith('Attacker') || type.startsWith('Midfielder') || type.startsWith('Defender')) return 0;
  return 0;
};

// --- Activity Milestones for auto-gifting special edition cards ---
const ACTIVITY_MILESTONES = [
  { id: 'played_5',    type: 'played', value: 5,   rarity: 'Bronze Edition',   bonus: 3,  desc: 'Đã chơi 5 trận đầu tiên',         icon: '🥉' },
  { id: 'played_20',   type: 'played', value: 20,  rarity: 'Silver Edition',   bonus: 5,  desc: 'Đã chơi 20 trận',                  icon: '🥈' },
  { id: 'played_50',   type: 'played', value: 50,  rarity: 'Gold Edition',     bonus: 8,  desc: 'Chiến binh 50 trận',               icon: '🥇' },
  { id: 'played_100',  type: 'played', value: 100, rarity: 'Platinum Edition', bonus: 10, desc: 'Huyền thoại 100 trận',             icon: '💎' },
  { id: 'played_200',  type: 'played', value: 200, rarity: 'Super Limited',    bonus: 12, desc: 'ICON: 200 Trận Không Nghỉ',         icon: '👑' },
  { id: 'wins_3',      type: 'wins',   value: 3,   rarity: 'Bronze Edition',   bonus: 3,  desc: 'Đã thắng 3 trận đầu tiên',        icon: '🥉' },
  { id: 'wins_10',     type: 'wins',   value: 10,  rarity: 'Silver Edition',   bonus: 5,  desc: 'Đã thắng 10 trận',                icon: '🥈' },
  { id: 'wins_30',     type: 'wins',   value: 30,  rarity: 'Gold Edition',     bonus: 8,  desc: 'Thắng 30 trận - Chiến Thần',      icon: '🥇' },
  { id: 'wins_60',     type: 'wins',   value: 60,  rarity: 'Platinum Edition', bonus: 10, desc: 'Bạch Kim: 60 Chiến Thắng',        icon: '💎' },
  { id: 'wins_100',    type: 'wins',   value: 100, rarity: 'Super Limited',    bonus: 12, desc: 'ICON: 100 Chiến Thắng Siêu Cấp',  icon: '👑' },
  { id: 'quests_1',    type: 'quests', value: 1,   rarity: 'Bronze Edition',   bonus: 3,  desc: 'Hoàn thành nhiệm vụ đầu tiên',   icon: '🥉' },
  { id: 'quests_5',    type: 'quests', value: 5,   rarity: 'Silver Edition',   bonus: 5,  desc: 'Hoàn thành 5 nhiệm vụ',           icon: '🥈' },
  { id: 'quests_15',   type: 'quests', value: 15,  rarity: 'Gold Edition',     bonus: 8,  desc: 'Hoàn thành 15 nhiệm vụ - Xạ Thủ', icon: '🥇' },
];

const RARITY_LABEL = {
  'Bronze Edition':   { label: 'THẺ ĐỒNG',    color: 'text-amber-600',    bg: 'bg-amber-950/40  border-amber-600/40' },
  'Silver Edition':   { label: 'THẺ BẠC',     color: 'text-slate-300',    bg: 'bg-slate-800/40  border-slate-400/30' },
  'Gold Edition':     { label: 'THẺ VÀNG',    color: 'text-yellow-400',   bg: 'bg-yellow-950/40 border-yellow-400/40' },
  'Golden Baller':    { label: 'THẺ VÀNG',    color: 'text-yellow-400',   bg: 'bg-yellow-950/40 border-yellow-400/40' },
  'Platinum Edition': { label: 'BẠCH KIM',    color: 'text-cyan-400',     bg: 'bg-cyan-950/40   border-cyan-400/40' },
  'Super Limited':    { label: 'SIÊU CẤP ✨', color: 'text-rose-400',     bg: 'bg-rose-950/40   border-rose-400/40' },
  'Icon':             { label: 'SIÊU CẤP ✨', color: 'text-rose-400',     bg: 'bg-rose-950/40   border-rose-400/40' },
};

const _LEVEL_MILESTONES_TAIL = [
];

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
      oscillator.type = 'triangle';
      oscillator.frequency.setValueAtTime(400, now);
      oscillator.frequency.setValueAtTime(600, now + 0.1);
      oscillator.frequency.setValueAtTime(800, now + 0.2);
      gainNode.gain.setValueAtTime(0.1, now);
      gainNode.gain.linearRampToValueAtTime(0, now + 0.3);
      oscillator.start(now);
      oscillator.stop(now + 0.3);
      new Audio('https://actions.google.com/sounds/v1/crowds/crowd_cheer.ogg').play().catch(()=>{});
    } else if (type === 'losePoint') {
      oscillator.type = 'sawtooth';
      oscillator.frequency.setValueAtTime(300, now);
      oscillator.frequency.exponentialRampToValueAtTime(100, now + 0.3);
      gainNode.gain.setValueAtTime(0.1, now);
      gainNode.gain.linearRampToValueAtTime(0, now + 0.3);
      oscillator.start(now);
      oscillator.stop(now + 0.3);
      new Audio('https://actions.google.com/sounds/v1/weather/thunder_crack.ogg').play().catch(()=>{});
    } else if (type === 'winGame') {
      oscillator.type = 'square';
      oscillator.frequency.setValueAtTime(440, now);
      oscillator.frequency.setValueAtTime(554, now + 0.2);
      oscillator.frequency.setValueAtTime(659, now + 0.4);
      oscillator.frequency.setValueAtTime(880, now + 0.6);
      gainNode.gain.setValueAtTime(0.1, now);
      gainNode.gain.linearRampToValueAtTime(0, now + 1.0);
      oscillator.start(now);
      oscillator.stop(now + 1.0);
      confetti({ particleCount: 300, spread: 100, origin: { y: 0.6 } });
    }
  } catch (e) {
    console.error('Audio play error:', e);
  }
};

        
// --- Attribute System Helpers ---
export const getPlayerAttr = (player) => {
  if (!player || !player.stats) return { key: 'speed', name: 'Tốc Độ', emoji: '⚡', color: 'text-yellow-400', bg: 'bg-yellow-500/20 border-yellow-500/40' };
  const stats = player.stats;
  // If control is highest
  if (stats.control >= stats.attack && stats.control >= stats.defense) {
    return { key: 'tech', name: 'Kỹ Thuật', emoji: '🌀', color: 'text-cyan-400', bg: 'bg-cyan-500/20 border-cyan-500/40' };
  }
  // If attack is highest
  if (stats.attack >= stats.defense) {
    return { key: 'power', name: 'Sức Mạnh', emoji: '💪', color: 'text-red-400', bg: 'bg-red-500/20 border-red-500/40' };
  }
  // Default is speed
  return { key: 'speed', name: 'Tốc Độ', emoji: '⚡', color: 'text-yellow-400', bg: 'bg-yellow-500/20 border-yellow-500/40' };
};

export const checkAttrAdvantage = (attrKey1, attrKey2) => {
  if (attrKey1 === 'speed' && attrKey2 === 'tech') return true;
  if (attrKey1 === 'tech' && attrKey2 === 'power') return true;
  if (attrKey1 === 'power' && attrKey2 === 'speed') return true;
  return false;
};

// --- Environment & Form System ---
export const ENV_WEATHER = [
  { key: 'Sunny', name: 'Nắng Rực Rỡ ☀️', desc: 'Tăng phong độ Tốc độ ⚡, giảm nhẹ Sức mạnh 💪' },
  { key: 'Rainy', name: 'Mưa Tầm Tã 🌧️', desc: 'Giảm phong độ Tốc độ ⚡, tăng phong độ Sức mạnh 💪' },
  { key: 'Snowy', name: 'Tuyết Rơi ❄️', desc: 'Giảm mạnh Tốc độ ⚡, tăng phong độ Sức mạnh 💪' },
  { key: 'Windy', name: 'Gió Thổi Mạnh 🌬️', desc: 'Giảm phong độ Kỹ thuật 🌀' },
  { key: 'Balanced', name: 'Lặng Gió 🍃', desc: 'Phong độ ổn định cho mọi hệ' }
];

export const ENV_TIME = [
  { key: 'Night', name: 'Đêm Trăng 🌙', desc: 'Tăng phong độ Kỹ thuật 🌀 (Ánh đèn sân khấu)' },
  { key: 'Sunset', name: 'Chiều Tà 🌇', desc: 'Phong độ cân bằng' },
  { key: 'Noon', name: 'Giữa Trưa ☀️', desc: 'Thời tiết nắng nóng nhẹ' }
];

export const FORM_STATES = [
  { key: 'excellent', name: 'Cực Đỉnh', emoji: '🔥', min: 4, max: 6, color: 'text-amber-400' },
  { key: 'good', name: 'Sung Sức', emoji: '📈', min: 1, max: 3, color: 'text-emerald-400' },
  { key: 'normal', name: 'Ổn Định', emoji: '➡️', min: 0, max: 0, color: 'text-gray-300' },
  { key: 'poor', name: 'Sa Sút', emoji: '📉', min: -3, max: -1, color: 'text-orange-400' },
  { key: 'bad', name: 'Tồi Tệ', emoji: '❄️', min: -6, max: -4, color: 'text-cyan-400' }
];

export const generateCardForm = (card, opponentCard, env) => {
  if (!card) return { state: FORM_STATES[2], bonus: 0 };
  const attr = getPlayerAttr(card).key;
  const rating = Math.max(card.stats.attack, card.stats.defense, card.stats.control) + ((card.level || 1) - 1) * 2;
  
  let weights = [0.10, 0.25, 0.35, 0.20, 0.10];

  if (env) {
    if (env.weather === 'Sunny') {
      if (attr === 'speed') { weights[0] += 0.15; weights[1] += 0.15; }
      if (attr === 'power') { weights[3] += 0.10; weights[4] += 0.05; }
    } else if (env.weather === 'Rainy' || env.weather === 'Snowy') {
      const penalty = env.weather === 'Snowy' ? 0.30 : 0.15;
      if (attr === 'speed') { weights[3] += penalty; weights[4] += penalty / 2; }
      if (attr === 'power') { weights[0] += 0.15; weights[1] += 0.15; }
    } else if (env.weather === 'Windy') {
      if (attr === 'tech') { weights[3] += 0.20; weights[4] += 0.10; }
    }

    if (env.time === 'Night') {
      if (attr === 'tech') { weights[0] += 0.20; weights[1] += 0.10; }
    }
  }

  if (opponentCard) {
    const oppRating = Math.max(opponentCard.stats.attack, opponentCard.stats.defense, opponentCard.stats.control) + ((opponentCard.level || 1) - 1) * 2;
    if (rating <= oppRating - 5) {
      if (Math.random() < 0.25) {
        weights = [0.90, 0.10, 0.0, 0.0, 0.0];
      }
    }
  }

  const total = weights.reduce((a, b) => a + b, 0);
  const normalized = weights.map(w => w / total);

  const roll = Math.random();
  let cumulative = 0;
  let chosenIdx = 2;
  for (let i = 0; i < normalized.length; i++) {
    cumulative += normalized[i];
    if (roll <= cumulative) {
      chosenIdx = i;
      break;
    }
  }

  const state = FORM_STATES[chosenIdx];
  let bonus = 0;
  if (state.min !== state.max) {
    bonus = Math.floor(Math.random() * (state.max - state.min + 1)) + state.min;
  } else {
    bonus = state.min;
  }

  return { state, bonus };
};

// --- Card Component ---
export const Card = ({ player, onClick, isSelectable, isSelected, hideStats }) => {
  if (!player) return null;
  const levelBonus = ((player.level || 1) - 1) * 2;
  const maxStat = Math.max(player.stats.attack, player.stats.defense, player.stats.control) + levelBonus;
  const isSuper = ['Icon', 'Golden Baller'].includes(player.type);
  const attr = getPlayerAttr(player);

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

        {/* Dynamic Holographic Rainbow effect for Superstar/rare cards */}
        {isSuper && <div className="card-holo absolute inset-0 rounded-2xl pointer-events-none z-30 opacity-40 mix-blend-color-dodge transition-opacity duration-300"></div>}

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

        {/* Level badge for upgraded players */}
        {player.level && player.level > 1 && (
          <div className="absolute top-[61%] left-2 bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 px-1.5 py-0.5 rounded text-[8px] sm:text-[9px] font-black uppercase tracking-wider z-20 shadow-md border border-yellow-300/30">
            Lv.{player.level}
          </div>
        )}

        {/* Top right info: Attribute style badge */}
        <div className={`absolute top-2 right-2 px-1.5 py-0.5 rounded-full border backdrop-blur-md z-20 flex items-center gap-1 ${attr.bg} shadow-md`}>
          <span className="text-[9px] sm:text-[10px]">{attr.emoji}</span>
          <span className={`text-[7px] sm:text-[8px] font-black uppercase tracking-wider ${attr.color}`}>{attr.name}</span>
        </div>
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
               <span className="text-xs sm:text-sm font-black text-white">{hideStats ? '?' : player.stats.attack + levelBonus}</span>
               <span className="text-[0.45rem] sm:text-[0.55rem] font-bold text-gray-400">ATK</span>
            </div>
            <div className="w-[1px] bg-white/20 mx-0.5"></div>
            <div className="flex flex-col items-center">
               <span className="text-xs sm:text-sm font-black text-white">{hideStats ? '?' : player.stats.control + levelBonus}</span>
               <span className="text-[0.45rem] sm:text-[0.55rem] font-bold text-gray-400">CTRL</span>
            </div>
            <div className="w-[1px] bg-white/20 mx-0.5"></div>
            <div className="flex flex-col items-center">
               <span className="text-xs sm:text-sm font-black text-white">{hideStats ? '?' : player.stats.defense + levelBonus}</span>
               <span className="text-[0.45rem] sm:text-[0.55rem] font-bold text-gray-400">DEF</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const BANNERS = [
  "/wc2026_kids_banner.png",
  "/wc2026_banner_2.png",
  "/wc2026_banner_3.png",
  "/wc2026_banner_4.png"
];

// --- Main App Component ---
export default function App() {
  const currentUser = localStorage.getItem('panini_currentUser');

  // Load state directly based on currentUser prefix — new users start EMPTY (must open packs to progress)
  const [collection, setCollection] = useState(() => {
    if (!currentUser) return [];
    const saved = localStorage.getItem(`panini_${currentUser}_collection`);
    if (saved) return JSON.parse(saved);
    // Brand-new user: no cards yet — must open starter packs
    return [];
  });

  const [squad, setSquad] = useState(() => {
    if (!currentUser) return [];
    const saved = localStorage.getItem(`panini_${currentUser}_squad`);
    if (saved) return JSON.parse(saved);
    // Brand-new user: no squad yet — must build from opened packs
    return [];
  });

  const [coins, setCoins] = useState(() => {
    if (!currentUser) return 0;
    const saved = localStorage.getItem(`panini_${currentUser}_coins`);
    return saved !== null ? parseInt(saved) : 0; // New users start with 0 coins; earn through quests/levels
  });

  const urlParams = new URLSearchParams(window.location.search);
  const pvpTarget = urlParams.get('pvp');

  const [gameState, setGameState] = useState(() => {
    const currentUser = localStorage.getItem('panini_currentUser');
    if (currentUser && pvpTarget) {
      const storedSquad = JSON.parse(localStorage.getItem(`panini_${currentUser}_squad`)) || [];
      const finalSquad = storedSquad.length === 11 ? storedSquad : playersData.filter(p => p.type === 'Base').slice(0, 11);
      if (finalSquad.length === 11) return 'multiplayer';
      
      const storedCollection = JSON.parse(localStorage.getItem(`panini_${currentUser}_collection`)) || [];
      const finalCollection = storedCollection.length >= 11 ? storedCollection : playersData.filter(p => p.type === 'Base').slice(0, 11);
      if (finalCollection.length < 11) return 'packOpening';
      return 'teamBuilder';
    }
    return 'lobby';
  }); // 'lobby', 'packOpening', 'teamBuilder', 'matchEngine', 'quests', 'multiplayer'
  
  const [activePvpTarget, setActivePvpTarget] = useState(pvpTarget);
  const [showPvpJoinModal, setShowPvpJoinModal] = useState(false);
  const [pvpJoinInput, setPvpJoinInput] = useState('');
  const [activeBannerIdx, setActiveBannerIdx] = useState(0);

  // --- Referral & Share States ---
  const [referredBy, setReferredBy] = useState(() => {
    return localStorage.getItem(`panini_${currentUser}_referredBy`) || '';
  });
  
  const [referrals, setReferrals] = useState(() => {
    const saved = localStorage.getItem(`panini_${currentUser}_referrals`);
    if (saved) return JSON.parse(saved);
    return [
      { username: 'QuangVinh_Class5', level: 5, claimed: false },
      { username: 'Minh_NghiaTan', level: 3, claimed: false },
      { username: 'GiaBao_Gamer', level: 1, claimed: false }
    ];
  });

  const [inviteInput, setInviteInput] = useState('');
  const [refCodeInput, setRefCodeInput] = useState('');
  
  const [showSharePoster, setShowSharePoster] = useState(null); // card data to show share poster, or null
  const [selectedUpgradeCard, setSelectedUpgradeCard] = useState(null); // card data for upgrade modal

  const upgradeCard = (cardId) => {
    const card = collection.find(c => c.id === cardId);
    if (!card) return;
    const currentLvl = card.level || 1;
    if (currentLvl >= 10) {
      showAlert("🚫 Tối Đa Cấp Độ!", "Cầu thủ này đã đạt cấp độ tối đa (Lv.10)!");
      return;
    }
    const cost = currentLvl * 150;
    if (coins < cost) {
      showAlert("🪙 Thiếu Xu!", `Bạn cần ${cost} Xu để nâng cấp cầu thủ này (Hiện có: ${coins} Xu).`);
      return;
    }

    const nextCoins = coins - cost;
    setCoins(nextCoins);
    localStorage.setItem(`panini_${currentUser}_coins`, nextCoins.toString());

    const updatedCollection = collection.map(c => {
      if (c.id === cardId) {
        return { ...c, level: currentLvl + 1 };
      }
      return c;
    });
    setCollection(updatedCollection);
    localStorage.setItem(`panini_${currentUser}_collection`, JSON.stringify(updatedCollection));

    const updatedSquad = squad.map(s => {
      if (s.id === cardId) {
        return { ...s, level: currentLvl + 1 };
      }
      return s;
    });
    setSquad(updatedSquad);
    localStorage.setItem(`panini_${currentUser}_squad`, JSON.stringify(updatedSquad));

    setSelectedUpgradeCard({ ...card, level: currentLvl + 1 });
    playFx('winPoint');
    showAlert("⚡ Nâng Cấp Thành Công!", `${card.name} đã thăng cấp lên Lv.${currentLvl + 1}! Tất cả chỉ số được cộng +2!`);
  };

  const addReferralFriend = (username) => {
    if (!username.trim()) return;
    const cleanName = username.trim();
    if (cleanName === currentUser) {
      showAlert("🚫 Không Thể Tự Mời!", "Bạn không thể tự mời chính mình!");
      return;
    }
    if (referrals.some(r => r.username.toLowerCase() === cleanName.toLowerCase())) {
      showAlert("⚠️ HLV Đã Tồn Tại!", "HLV này đã có trong danh sách giới thiệu của bạn!");
      return;
    }
    const newRef = { username: cleanName, level: 1, claimed: false };
    const updated = [...referrals, newRef];
    setReferrals(updated);
    localStorage.setItem(`panini_${currentUser}_referrals`, JSON.stringify(updated));
    setInviteInput('');
    showAlert("📨 Gửi Lời Mời!", `Đã thêm HLV ${cleanName} vào danh sách mời. Nhận thưởng +100 Xu & +1 Gói quà khi bạn này đạt Level 5!`);
  };

  const submitReferralCode = (code) => {
    if (!code.trim()) return;
    const cleanCode = code.trim();
    if (cleanCode === currentUser) {
      showAlert("🚫 Không Thể Tự Giới Thiệu!", "Bạn không thể nhập mã giới thiệu của chính mình!");
      return;
    }
    setReferredBy(cleanCode);
    localStorage.setItem(`panini_${currentUser}_referredBy`, cleanCode);
    setCoins(c => c + 50);
    showAlert("🎉 Nhập Mã Thành Công!", `Bạn đã nhập mã giới thiệu của HLV ${cleanCode}. Nhận ngay +50 Xu làm quen!`);
  };

  const claimReferralReward = (friendUsername) => {
    setReferrals(prev => {
      const updated = prev.map(ref => {
        if (ref.username === friendUsername && ref.level >= 5 && !ref.claimed) {
          setCoins(c => c + 100);
          setFreePacks(f => f + 1); // 1 Free Pack
          showAlert("🎁 Nhận Thưởng Giới Thiệu!", `Chúc mừng! Bạn đã nhận thưởng +100 Xu & +1 Gói Thẻ Huyền Thoại từ HLV ${friendUsername}!`);
          return { ...ref, claimed: true };
        }
        return ref;
      });
      localStorage.setItem(`panini_${currentUser}_referrals`, JSON.stringify(updated));
      return updated;
    });
  };
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveBannerIdx(prev => (prev + 1) % BANNERS.length);
    }, 7000);
    return () => clearInterval(timer);
  }, []);

  // Auth State — unified PIN system (no email/complex password)
  const [authMode, setAuthMode] = useState('play'); // 'play' only (unified)
  const [authUsername, setAuthUsername] = useState("");
  const [authPassword, setAuthPassword] = useState(""); // kept for compat
  const [authPin, setAuthPin] = useState(""); // 4-digit PIN (optional)
  const [authStep, setAuthStep] = useState('enter_name'); // 'enter_name' | 'enter_pin' | 'set_pin'
  const [authCheckingUser, setAuthCheckingUser] = useState(false);
  const [authFoundUser, setAuthFoundUser] = useState(null); // null | firebase user data
  
  const [isPackOpeningAnim, setIsPackOpeningAnim] = useState(false);
  const [openedCards, setOpenedCards] = useState([]);

  // Economy State
  const [quests, setQuests] = useState(() => {
    if (!currentUser) return [
      { id: 'play1', title: 'Đá 1 trận với AI', target: 1, progress: 0, reward: 50, isCompleted: false, isClaimed: false },
      { id: 'win1', title: 'Thắng 1 trận với AI', target: 1, progress: 0, reward: 100, isCompleted: false, isClaimed: false },
      { id: 'collect20', title: 'Sưu tầm 20 thẻ khác nhau', target: 20, progress: 0, reward: 150, isCompleted: false, isClaimed: false }
    ];
    const saved = localStorage.getItem(`panini_${currentUser}_quests`);
    return saved ? JSON.parse(saved) : [
      { id: 'play1', title: 'Đá 1 trận với AI', target: 1, progress: 0, reward: 50, isCompleted: false, isClaimed: false },
      { id: 'win1', title: 'Thắng 1 trận với AI', target: 1, progress: 0, reward: 100, isCompleted: false, isClaimed: false },
      { id: 'collect20', title: 'Sưu tầm 20 thẻ khác nhau', target: 20, progress: 0, reward: 150, isCompleted: false, isClaimed: false }
    ];
  });
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

  // Level & XP State
  const [level, setLevel] = useState(() => {
    if (!currentUser) return 1;
    const saved = localStorage.getItem(`panini_${currentUser}_level`);
    return saved ? parseInt(saved) : 1;
  });

  const [xp, setXp] = useState(() => {
    if (!currentUser) return 0;
    const saved = localStorage.getItem(`panini_${currentUser}_xp`);
    return saved ? parseInt(saved) : 0;
  });

  const [stats, setStats] = useState(() => {
    if (!currentUser) return { played: 0, wins: 0, draws: 0, losses: 0 };
    const saved = localStorage.getItem(`panini_${currentUser}_stats`);
    return saved ? JSON.parse(saved) : { played: 0, wins: 0, draws: 0, losses: 0 };
  });

  // Email recovery state
  const [email, setEmail] = useState(() => {
    if (!currentUser) return "";
    const saved = localStorage.getItem(`panini_${currentUser}_email`);
    return saved || "";
  });

  // Forgot password inputs
  const [forgotEmail, setForgotEmail] = useState("");
  const [newPasswordReset, setNewPasswordReset] = useState("");
  const [confirmPasswordReset, setConfirmPasswordReset] = useState("");

  // Profile Change Password states
  const [profileOldPassword, setProfileOldPassword] = useState("");
  const [profileNewPassword, setProfileNewPassword] = useState("");
  const [profileConfirmPassword, setProfileConfirmPassword] = useState("");
  const [profileEmailInput, setProfileEmailInput] = useState("");

  // Level Up Modal State
  const [showLevelUpModal, setShowLevelUpModal] = useState(null);

  // Profile Inspector States
  const [inspectingUser, setInspectingUser] = useState(null);
  const [inspectedUserData, setInspectedUserData] = useState(null);
  const [loadingInspectedUser, setLoadingInspectedUser] = useState(false);

  // Private Chat States
  const [activePrivatePartner, setActivePrivatePartner] = useState(null);
  const [privateMessages, setPrivateMessages] = useState([]);
  const [myPrivateChats, setMyPrivateChats] = useState([]);
  const [privateChatInput, setPrivateChatInput] = useState('');
  const [unreadPartners, setUnreadPartners] = useState({});

  // Rewarded Activity Milestones (for auto-gifting special edition cards)
  const [rewardedMilestones, setRewardedMilestones] = useState(() => {
    if (!currentUser) return [];
    const saved = localStorage.getItem(`panini_${currentUser}_rewardedMilestones`);
    return saved ? JSON.parse(saved) : [];
  });

  // Leaderboard & Levels States
  const [claimedLevelRewards, setClaimedLevelRewards] = useState(() => {
    if (!currentUser) return [];
    const saved = localStorage.getItem(`panini_${currentUser}_claimedLevelRewards`);
    return saved ? JSON.parse(saved) : [];
  });

  const [freePacks, setFreePacks] = useState(() => {
    if (!currentUser) return 0;
    const saved = localStorage.getItem(`panini_${currentUser}_freePacks`);
    return saved ? parseInt(saved) : 0;
  });

  // Gacha pity counter — guarantees superstar every 10 packs max
  const [pityCounter, setPityCounter] = useState(() => {
    if (!currentUser) return 0;
    const saved = localStorage.getItem(`panini_${currentUser}_pity`);
    return saved ? parseInt(saved) : 0;
  });
  const [revealingCards, setRevealingCards] = useState([]); // cards being revealed one by one
  const [revealIndex, setRevealIndex] = useState(0);        // which card is currently revealed
  const [packType, setPackType] = useState('standard');     // 'starter'|'standard'|'premium'|'ultimate'

  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);
  const [leaderboardTab, setLeaderboardTab] = useState('leaderboard'); // 'leaderboard', 'tiers', 'milestones'

  // Sync rewardedMilestones to localStorage and Firebase
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(`panini_${currentUser}_rewardedMilestones`, JSON.stringify(rewardedMilestones));
      if (isConnectedToFirebase) {
        set(ref(database, `/users/${currentUser}/rewardedMilestones`), rewardedMilestones);
      }
    }
  }, [rewardedMilestones, currentUser]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(`panini_${currentUser}_claimedLevelRewards`, JSON.stringify(claimedLevelRewards));
      if (isConnectedToFirebase) {
        set(ref(database, `/users/${currentUser}/claimedLevelRewards`), claimedLevelRewards);
      }
    }
  }, [claimedLevelRewards, currentUser]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(`panini_${currentUser}_freePacks`, freePacks.toString());
      if (isConnectedToFirebase) {
        set(ref(database, `/users/${currentUser}/freePacks`), freePacks);
      }
    }
  }, [freePacks, currentUser]);

  useEffect(() => {
    if (gameState === 'profile') {
      setProfileEmailInput(email);
    }
  }, [gameState, email]);

  // Fetch Global Leaderboard
  useEffect(() => {
    if (gameState === 'leaderboard') {
      setLoadingLeaderboard(true);
      const usersRef = ref(database, 'users');
      get(usersRef).then((snapshot) => {
        if (snapshot.exists()) {
          const usersObj = snapshot.val();
          const list = Object.keys(usersObj).map((key) => {
            const userVal = usersObj[key];
            const cardCount = userVal.collection ? Object.keys(userVal.collection).length : 0;
            const userOvr = userVal.squad ? Math.round(userVal.squad.reduce((acc, card) => acc + Math.max(card.stats.attack, card.stats.defense, card.stats.control), 0) / 11) : 0;
            return {
              username: key,
              level: userVal.level || 1,
              xp: userVal.xp || 0,
              coins: userVal.coins || 0,
              wins: userVal.stats?.wins || 0,
              losses: userVal.stats?.losses || 0,
              draws: userVal.stats?.draws || 0,
              totalMatches: (userVal.stats?.wins || 0) + (userVal.stats?.losses || 0) + (userVal.stats?.draws || 0),
              cardCount: cardCount,
              ovr: userOvr,
            };
          });

          // Sort by Level DESC, then XP DESC, then Wins DESC
          list.sort((a, b) => {
            if (b.level !== a.level) return b.level - a.level;
            if (b.xp !== a.xp) return b.xp - a.xp;
            return b.wins - a.wins;
          });

          setLeaderboardData(list);
        }
        setLoadingLeaderboard(false);
      }).catch((err) => {
        console.error(err);
        setLoadingLeaderboard(false);
      });
    }
  }, [gameState]);

  // Auto-save state to localStorage & Firebase when they change
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(`panini_${currentUser}_collection`, JSON.stringify(collection));
      if (isConnectedToFirebase) {
        set(ref(database, `/users/${currentUser}/collection`), collection);
      }
    }
  }, [collection, currentUser]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(`panini_${currentUser}_squad`, JSON.stringify(squad));
      if (isConnectedToFirebase) {
        set(ref(database, `/users/${currentUser}/squad`), squad);
      }
    }
  }, [squad, currentUser]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(`panini_${currentUser}_coins`, coins.toString());
      if (isConnectedToFirebase) {
        set(ref(database, `/users/${currentUser}/coins`), coins);
      }
    }
  }, [coins, currentUser]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(`panini_${currentUser}_quests`, JSON.stringify(quests));
      if (isConnectedToFirebase) {
        set(ref(database, `/users/${currentUser}/quests`), quests);
      }
    }
  }, [quests, currentUser]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(`panini_${currentUser}_level`, level.toString());
      if (isConnectedToFirebase) {
        set(ref(database, `/users/${currentUser}/level`), level);
      }
    }
  }, [level, currentUser]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(`panini_${currentUser}_xp`, xp.toString());
      if (isConnectedToFirebase) {
        set(ref(database, `/users/${currentUser}/xp`), xp);
      }
    }
  }, [xp, currentUser]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(`panini_${currentUser}_stats`, JSON.stringify(stats));
      if (isConnectedToFirebase) {
        set(ref(database, `/users/${currentUser}/stats`), stats);
      }
    }
  }, [stats, currentUser]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(`panini_${currentUser}_email`, email);
      if (isConnectedToFirebase) {
        set(ref(database, `/users/${currentUser}/email`), email);
      }
    }
  }, [email, currentUser]);

  // Sync from Firebase on login/mount
  useEffect(() => {
    if (!currentUser || !isConnectedToFirebase) return;

    const userRef = ref(database, `/users/${currentUser}`);
    onValue(userRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        // Cấp 200 xu khởi đầu 1 lần cho tất cả user chưa nhận (kể cả user cũ coins=0)
        if (!data.startingBonus) {
          const bonusCoins = (data.coins || 0) + 200;
          setCoins(bonusCoins);
          set(ref(database, `/users/${currentUser}/coins`), bonusCoins);
          set(ref(database, `/users/${currentUser}/startingBonus`), true);
        } else {
          if (data.coins !== undefined) setCoins(data.coins);
        }
        if (data.collection) setCollection(data.collection);
        if (data.squad) setSquad(data.squad);
        if (data.quests) setQuests(data.quests);
        if (data.level !== undefined) setLevel(data.level);
        if (data.xp !== undefined) setXp(data.xp);
        if (data.stats) setStats(data.stats);
        if (data.email !== undefined) setEmail(data.email);
        if (data.freePacks !== undefined) setFreePacks(data.freePacks);
        if (data.claimedLevelRewards) setClaimedLevelRewards(data.claimedLevelRewards);
        if (data.rewardedMilestones) setRewardedMilestones(data.rewardedMilestones);
      } else {
        // Initialize brand-new guest user — fresh start with 3 starter packs + 200 xu
        const initialData = {
          username: currentUser,
          password: "",
          email: "",
          coins: 200, // Thành viên mới được 200 Xu để bắt đầu mở thẻ
          startingBonus: true,
          collection: [],
          squad: [],
          level: 1,
          xp: 0,
          freePacks: 3,
          claimedLevelRewards: [],
          rewardedMilestones: [],
          stats: { played: 0, wins: 0, draws: 0, losses: 0 },
          quests: [
            { id: 'open_pack1', title: 'Mở gói thẻ đầu tiên', target: 1, progress: 0, reward: 100, isCompleted: false, isClaimed: false },
            { id: 'build_squad', title: 'Xây dựng đội hình 11 cầu thủ', target: 11, progress: 0, reward: 200, isCompleted: false, isClaimed: false },
            { id: 'play1', title: 'Đá 1 trận với AI', target: 1, progress: 0, reward: 50, isCompleted: false, isClaimed: false },
            { id: 'win1', title: 'Thắng 1 trận với AI', target: 1, progress: 0, reward: 100, isCompleted: false, isClaimed: false },
            { id: 'collect20', title: 'Sưu tầm 20 thẻ khác nhau', target: 20, progress: 0, reward: 150, isCompleted: false, isClaimed: false }
          ]
        };
        set(userRef, initialData);
        setCoins(200);
      }
    }, { onlyOnce: true });
  }, [currentUser, isConnectedToFirebase]);

  // Gain XP function
  const gainXp = (amount) => {
    setXp(currentXp => {
      let newXp = currentXp + amount;
      let currentLevel = level;
      let xpNeeded = currentLevel * 100;
      let leveledUp = false;
      
      while (newXp >= xpNeeded) {
        newXp -= xpNeeded;
        currentLevel += 1;
        xpNeeded = currentLevel * 100;
        leveledUp = true;
      }
      
      if (leveledUp) {
        setLevel(currentLevel);
        setCoins(c => c + 500); // 500 coins level-up reward
        setShowLevelUpModal({
          oldLevel: level,
          newLevel: currentLevel,
          reward: 500
        });
        playFx('winGame');
        
        setTimeout(() => {
          confetti({
            particleCount: 200,
            spread: 100,
            origin: { y: 0.5 },
            colors: ['#3b82f6', '#10b981', '#fbbf24', '#ec4899']
          });
        }, 200);
      }
      
      return newXp;
    });
  };

  // --- Auto-Gift Activity Milestone Cards ---
  const checkActivityMilestones = (newStats, newQuests) => {
    if (!currentUser) return;

    const claimedQuests = (newQuests || quests).filter(q => q.isClaimed).length;
    const currentValues = {
      played: newStats?.played ?? stats?.played ?? 0,
      wins:   newStats?.wins   ?? stats?.wins   ?? 0,
      quests: claimedQuests,
    };

    const toReward = ACTIVITY_MILESTONES.filter(m => {
      if (rewardedMilestones.includes(m.id)) return false;
      return currentValues[m.type] >= m.value;
    });

    if (toReward.length === 0) return;

    const pool = playersData.filter(p => p.stats &&
      Math.max(p.stats.attack, p.stats.defense, p.stats.control) >= 80
    );

    const newCards = [];
    const newMilestoneIds = [];

    toReward.forEach(m => {
      const base = pool[Math.floor(Math.random() * pool.length)];
      if (!base) return;
      const upgraded = JSON.parse(JSON.stringify(base));
      upgraded.id   = `${base.id}_${m.id}`;
      upgraded.name = `${base.name} [${m.rarity}]`;
      upgraded.type = m.rarity;
      upgraded.stats = {
        attack:  Math.min(99, base.stats.attack  + m.bonus),
        defense: Math.min(99, base.stats.defense + m.bonus),
        control: Math.min(99, base.stats.control + m.bonus),
      };
      newCards.push(upgraded);
      newMilestoneIds.push(m.id);
    });

    if (newCards.length === 0) return;

    setCollection(prev => [...prev, ...newCards]);
    setRewardedMilestones(prev => [...prev, ...newMilestoneIds]);

    // Confetti celebration
    setTimeout(() => {
      confetti({ particleCount: 200, spread: 90, origin: { y: 0.5 },
        colors: ['#f59e0b','#fbbf24','#3b82f6','#ec4899','#10b981'] });
    }, 300);

    const rarityLabels = toReward.map(m => m.rarity).join(', ');
    showAlert(
      '🎁 Quà Hoạt Động Đặc Biệt!',
      `Chúc mừng! Bạn đã đạt mốc thành tích và nhận được ${newCards.length} thẻ đặc biệt: ${rarityLabels}. Kiểm tra bộ sưu tập ngay!`
    );
    playFx('winGame');
  };

  const claimMilestone = (m) => {
    if (level < m.level) return;
    const claimed = claimedLevelRewards || [];
    if (claimed.includes(m.level)) return;
    
    // Add rewards
    if (m.coins) setCoins(c => c + m.coins);
    if (m.packs) setFreePacks(f => f + m.packs);
    
    // Mark as claimed
    setClaimedLevelRewards(prev => [...(prev || []), m.level]);
    playFx('winPoint');
    
    // Show confetti
    confetti({
      particleCount: 120,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#eab308', '#fbbf24', '#f59e0b', '#3b82f6']
    });
    
    showAlert("Nhận Quà Thành Công 🎁", `Chúc mừng! Bạn đã nhận được ${m.coins ? `${m.coins} Xu` : ''}${m.coins && m.packs ? ' + ' : ''}${m.packs ? `${m.packs} Gói Thẻ Miễn Phí` : ''} từ mốc Cấp Độ ${m.level}.`);
  };

  // Inspect User effect
  useEffect(() => {
    if (!inspectingUser || !isConnectedToFirebase) {
      setInspectedUserData(null);
      return;
    }

    setLoadingInspectedUser(true);
    const targetUserRef = ref(database, `/users/${inspectingUser}`);
    onValue(targetUserRef, (snapshot) => {
      const data = snapshot.val();
      setInspectedUserData(data);
      setLoadingInspectedUser(false);
    }, { onlyOnce: true });
  }, [inspectingUser, isConnectedToFirebase]);

  // Private Chats List effect
  useEffect(() => {
    if (!currentUser || !isConnectedToFirebase) return;

    const myChatsRef = ref(database, `/users/${currentUser}/private_chats`);
    const unsubscribeChats = onValue(myChatsRef, (snapshot) => {
      const list = [];
      snapshot.forEach((child) => {
        list.push({
          username: child.key,
          lastTimestamp: child.val()
        });
      });
      list.sort((a, b) => b.lastTimestamp - a.lastTimestamp);
      setMyPrivateChats(list);
    });

    return () => unsubscribeChats();
  }, [currentUser, isConnectedToFirebase]);

  // Active Private Room Message Listener
  useEffect(() => {
    if (!currentUser || !activePrivatePartner || !isConnectedToFirebase) {
      setPrivateMessages([]);
      return;
    }

    const chatId = [currentUser, activePrivatePartner].sort().join('_');
    const chatMessagesRef = ref(database, `/private_chats/${chatId}`);

    const unsubscribeMsgs = onValue(chatMessagesRef, (snapshot) => {
      const msgs = [];
      snapshot.forEach((child) => {
        msgs.push({
          id: child.key,
          ...child.val()
        });
      });
      setPrivateMessages(msgs);
    });

    // Clear unread mark
    const unreadRef = ref(database, `/users/${currentUser}/unread/${activePrivatePartner}`);
    set(unreadRef, null);

    return () => unsubscribeMsgs();
  }, [currentUser, activePrivatePartner, isConnectedToFirebase]);

  // Unread badge listener
  useEffect(() => {
    if (!currentUser || !isConnectedToFirebase) return;

    const unreadRef = ref(database, `/users/${currentUser}/unread`);
    const unsubscribeUnread = onValue(unreadRef, (snapshot) => {
      const data = snapshot.val() || {};
      setUnreadPartners(data);
    });

    return () => unsubscribeUnread();
  }, [currentUser, isConnectedToFirebase]);

  const sendPrivateMessage = () => {
    if (!privateChatInput.trim() || !currentUser || !activePrivatePartner || !isConnectedToFirebase) return;

    const chatId = [currentUser, activePrivatePartner].sort().join('_');
    const chatRef = ref(database, `/private_chats/${chatId}`);
    
    const timestamp = Date.now();
    const newMsg = {
      sender: currentUser,
      text: privateChatInput.trim(),
      timestamp: timestamp
    };

    push(chatRef, newMsg);

    // Update active chats for both users
    set(ref(database, `/users/${currentUser}/private_chats/${activePrivatePartner}`), timestamp);
    set(ref(database, `/users/${activePrivatePartner}/private_chats/${currentUser}`), timestamp);

    // Unread status for partner
    set(ref(database, `/users/${activePrivatePartner}/unread/${currentUser}`), true);

    setPrivateChatInput('');
    playFx('click');
  };

  // Real-time Chat, Presence, and PvP Invites States
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const [activeInvite, setActiveInvite] = useState(null);
  const [chatTab, setChatTab] = useState('chat');
  const [chatInput, setChatInput] = useState('');

  // Real-time Presence, Chat, and Invites Effect
  useEffect(() => {
    if (!currentUser || !isConnectedToFirebase) return;

    // 1. Establish Presence
    const userStatusDatabaseRef = ref(database, `/presence/${currentUser}`);
    const connectedRef = ref(database, '.info/connected');

    const squadRating = squad.length === 11 
      ? Math.round(squad.reduce((acc, card) => acc + Math.max(card.stats.attack, card.stats.defense, card.stats.control), 0) / 11)
      : 0;

    let peerInstanceId = sessionStorage.getItem('panini_room_code') || '';
    if (!peerInstanceId) {
      peerInstanceId = Math.floor(100000 + Math.random() * 900000).toString();
      sessionStorage.setItem('panini_room_code', peerInstanceId);
    }

    const presenceData = {
      username: currentUser,
      status: 'online',
      lastActive: serverTimestamp(),
      peerId: peerInstanceId,
      rating: squadRating,
      level: level // Dynamic level synced!
    };

    const unsubscribeConnected = onValue(connectedRef, (snap) => {
      if (snap.val() === true) {
        set(userStatusDatabaseRef, presenceData);
        onDisconnect(userStatusDatabaseRef).remove();
      }
    });

    // 2. Listen to all online users
    const presenceListRef = ref(database, '/presence');
    const unsubscribePresence = onValue(presenceListRef, (snapshot) => {
      const users = [];
      snapshot.forEach((childSnapshot) => {
        const val = childSnapshot.val();
        if (val.username !== currentUser) {
          users.push(val);
        }
      });
      setOnlineUsers(users);
    });

    // 3. Listen to chat messages (limit to 50)
    const chatRef = ref(database, '/chat');
    const unsubscribeChat = onValue(chatRef, (snapshot) => {
      const msgs = [];
      snapshot.forEach((childSnapshot) => {
        msgs.push({ id: childSnapshot.key, ...childSnapshot.val() });
      });
      setChatMessages(msgs.slice(-50)); // Last 50 messages
    });

    // 4. Listen to direct invitations
    const invitesRef = ref(database, `/invites/${currentUser}`);
    const unsubscribeInvites = onValue(invitesRef, (snapshot) => {
      const val = snapshot.val();
      if (val && val.status === 'pending') {
        setActiveInvite(val);
        playFx('winPoint'); // play victory horn sound for invite!
      } else if (!val) {
        setActiveInvite(null);
      }
    });

    return () => {
      unsubscribeConnected();
      unsubscribePresence();
      unsubscribeChat();
      unsubscribeInvites();
      set(userStatusDatabaseRef, null); // Clear presence on unmount
    };
  }, [currentUser, squad, level]);

  // Scroll chat to bottom when messages update
  useEffect(() => {
    const chatContainer = document.getElementById('lobby-chat-messages');
    if (chatContainer) {
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }
  }, [chatMessages, chatTab]);

  const sendChatMessage = (text) => {
    if (!text.trim() || !currentUser || !isConnectedToFirebase) return;
    const chatRef = ref(database, '/chat');
    push(chatRef, {
      sender: currentUser,
      senderLevel: level, // Sync sender's level in message history
      text: text.trim(),
      timestamp: serverTimestamp()
    });
  };

  const sendChallengeInvite = (targetUser, targetPeerId) => {
    if (!currentUser || !isConnectedToFirebase) return;
    
    playFx('click');
    const targetInviteRef = ref(database, `/invites/${targetUser}`);
    
    const myRating = squad.length === 11 
      ? Math.round(squad.reduce((acc, card) => acc + Math.max(card.stats.attack, card.stats.defense, card.stats.control), 0) / 11)
      : 0;
      
    const myPeerId = sessionStorage.getItem('panini_room_code') || '';

    set(targetInviteRef, {
      host: currentUser,
      hostPeerId: myPeerId,
      hostRating: myRating,
      status: 'pending'
    });

    const chatRef = ref(database, '/chat');
    push(chatRef, {
      sender: 'HỆ THỐNG 📣',
      text: `🔥 Cầu thủ [${currentUser}] đã gửi lời thách đấu kịch tính tới [${targetUser}]!`,
      timestamp: serverTimestamp()
    });

    showAlert("📨 Lời Mời Đã Gửi!", `Đã gửi lời mời thách đấu tới ${targetUser}! Vui lòng chờ đối thủ phản hồi...`);

    const statusRef = ref(database, `/invites/${targetUser}/status`);
    const unsubscribeStatus = onValue(statusRef, (snap) => {
      const status = snap.val();
      if (status === 'accepted') {
        unsubscribeStatus();
        set(targetInviteRef, null);
        setActivePvpTarget(targetPeerId);
        setGameState('multiplayer');
      } else if (status === 'declined') {
        unsubscribeStatus();
        set(targetInviteRef, null);
        showAlert("😢 Lời Mời Bị Từ Chối", `Đối thủ ${targetUser} đã từ chối lời mời thách đấu!`);
      }
    });
  };

  const acceptChallenge = (invite) => {
    if (!currentUser || !isConnectedToFirebase) return;
    playFx('click');
    
    const myInviteRef = ref(database, `/invites/${currentUser}`);
    set(myInviteRef, {
      ...invite,
      status: 'accepted'
    });
    
    setActivePvpTarget(invite.hostPeerId);
    setGameState('multiplayer');
    
    setTimeout(() => {
      set(myInviteRef, null);
    }, 1000);
  };

  const declineChallenge = () => {
    if (!currentUser || !isConnectedToFirebase) return;
    playFx('click');
    
    const myInviteRef = ref(database, `/invites/${currentUser}`);
    set(myInviteRef, {
      status: 'declined'
    });
    
    setTimeout(() => {
      set(myInviteRef, null);
    }, 1000);
  };

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
  const [matchEnvironment, setMatchEnvironment] = useState({ weather: ENV_WEATHER[4], time: ENV_TIME[1] });

  // ─── Unified Smart Auth Handler ─────────────────────────────────────────────
  // Step 1: User enters name → check Firebase
  const handleCheckUsername = async (e) => {
    e.preventDefault();
    const name = authUsername.trim();
    if (!name || name.length < 2) {
      showAlert('Tên Quá Ngắn ⚠️', 'Tên HLV phải có ít nhất 2 ký tự!');
      return;
    }
    // Validate: only letters, numbers, underscores, Vietnamese chars, spaces
    if (!/^[\w\s\u00C0-\u024F\u1E00-\u1EFF]+$/.test(name)) {
      showAlert('Tên Không Hợp Lệ ⚠️', 'Tên HLV chỉ được dùng chữ cái, số, dấu cách. Không dùng ký tự đặc biệt!');
      return;
    }

    if (!isConnectedToFirebase) {
      // Offline: just log in directly
      localStorage.setItem('panini_currentUser', name);
      window.location.reload();
      return;
    }

    setAuthCheckingUser(true);
    try {
      const snapshot = await get(ref(database, `/users/${name}`));
      const val = snapshot.val();
      setAuthCheckingUser(false);

      if (!val) {
        // NEW user → go to optional PIN setting step
        setAuthFoundUser(null);
        setAuthStep('set_pin');
      } else {
        // EXISTING user
        setAuthFoundUser(val);
        const hasPin = val.pin && val.pin.length === 4;
        if (hasPin) {
          // Has PIN → ask for PIN
          setAuthStep('enter_pin');
        } else {
          // No PIN → login directly (open account)
          localStorage.setItem('panini_currentUser', name);
          window.location.reload();
        }
      }
    } catch (err) {
      setAuthCheckingUser(false);
      console.error(err);
      // Offline fallback
      localStorage.setItem('panini_currentUser', name);
      window.location.reload();
    }
  };

  // Step 2a: Existing user with PIN → verify
  const handleVerifyPin = async (e) => {
    e.preventDefault();
    const name = authUsername.trim();
    const pin = authPin.trim();
    if (pin.length !== 4 || !/^\d{4}$/.test(pin)) {
      showAlert('PIN Không Đúng ⚠️', 'Vui lòng nhập đúng 4 chữ số!');
      return;
    }
    setAuthCheckingUser(true);
    try {
      const snapshot = await get(ref(database, `/users/${name}/pin`));
      const storedPin = snapshot.val();
      setAuthCheckingUser(false);
      if (storedPin && storedPin === pin) {
        localStorage.setItem('panini_currentUser', name);
        window.location.reload();
      } else {
        showAlert('Sai PIN 🔑', 'Mã PIN không đúng! Hãy thử lại hoặc liên hệ admin.');
      }
    } catch {
      setAuthCheckingUser(false);
      showAlert('Lỗi Kết Nối ❌', 'Không thể xác minh PIN. Thử lại sau.');
    }
  };

  // Step 2b: New user → optionally set PIN, then create account
  const handleCreateAccount = async (e) => {
    e.preventDefault();
    const name = authUsername.trim();
    const pin = authPin.trim();

    if (pin && (pin.length !== 4 || !/^\d{4}$/.test(pin))) {
      showAlert('PIN Không Hợp Lệ ⚠️', 'Mã PIN phải đúng 4 chữ số (hoặc để trống để bỏ qua)!');
      return;
    }

    const initialData = {
      username: name,
      pin: pin || '', // optional 4-digit PIN
      email: '',
      coins: 200, // Thành viên mới được 200 Xu để bắt đầu mở thẻ
      collection: [],
      squad: [],
      level: 1,
      xp: 0,
      freePacks: 3,
      claimedLevelRewards: [],
      rewardedMilestones: [],
      stats: { played: 0, wins: 0, draws: 0, losses: 0 },
      quests: [
        { id: 'open_pack1', title: 'Mở gói thẻ đầu tiên', target: 1, progress: 0, reward: 100, isCompleted: false, isClaimed: false },
        { id: 'build_squad', title: 'Xây dựng đội hình 11 cầu thủ', target: 11, progress: 0, reward: 200, isCompleted: false, isClaimed: false },
        { id: 'play1', title: 'Đá 1 trận với AI', target: 1, progress: 0, reward: 50, isCompleted: false, isClaimed: false },
        { id: 'win1', title: 'Thắng 1 trận với AI', target: 1, progress: 0, reward: 100, isCompleted: false, isClaimed: false },
        { id: 'collect20', title: 'Sưu tầm 20 thẻ khác nhau', target: 20, progress: 0, reward: 150, isCompleted: false, isClaimed: false }
      ]
    };

    setAuthCheckingUser(true);
    try {
      await set(ref(database, `/users/${name}`), initialData);
      localStorage.setItem('panini_currentUser', name);
      window.location.reload();
    } catch {
      setAuthCheckingUser(false);
      // Create locally even if Firebase fails
      localStorage.setItem('panini_currentUser', name);
      window.location.reload();
    }
  };


  // Legacy compat stubs (auth flow now uses handleCheckUsername/handleVerifyPin/handleCreateAccount)

  // Forgot password verify email handler
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!authUsername.trim() || !forgotEmail.trim()) {
      showAlert("Thiếu Thông Tin 📋", "Vui lòng nhập đầy đủ Tên Đăng Nhập và Email khôi phục!");
      return;
    }
    const cleanUsername = authUsername.trim();

    try {
      const snapshot = await get(ref(database, `/users/${cleanUsername}`));
      const val = snapshot.val();
      if (!val) {
        showAlert("Không Tồn Tại ❌", "HLV này chưa được đăng ký!");
        return;
      }

      const storedEmail = val.email || "";
      if (!storedEmail) {
        showAlert("Chưa Thiết Lập 🔒", "HLV này chưa thiết lập Email khôi phục trong Hồ Sơ! Vui lòng liên hệ Admin để đặt lại mật khẩu.");
        return;
      }

      if (storedEmail.trim().toLowerCase() !== forgotEmail.trim().toLowerCase()) {
        showAlert("Không Khớp ❌", "Email khôi phục không trùng khớp với thông tin đã đăng ký!");
        return;
      }

      // Success, advance to reset phase
      setAuthMode('reset_password_phase');
      showAlert("Xác Minh Thành Công ✅", "Xác minh Email khôi phục thành công! Vui lòng nhập mật khẩu mới của bạn.");
    } catch (err) {
      showAlert("Lỗi Máy Chủ ❌", "Đã xảy ra lỗi khi kiểm tra email khôi phục.");
    }
  };

  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    if (!newPasswordReset || !confirmPasswordReset) {
      showAlert("Thiếu Thông Tin 🔒", "Vui lòng nhập đầy đủ mật khẩu mới và xác nhận mật khẩu mới!");
      return;
    }
    if (newPasswordReset !== confirmPasswordReset) {
      showAlert("Không Trùng Khớp ❌", "Mật khẩu mới và mật khẩu xác nhận không giống nhau!");
      return;
    }

    try {
      const cleanUsername = authUsername.trim();
      await set(ref(database, `/users/${cleanUsername}/password`), newPasswordReset);
      showAlert("Thành Công 🎉", "Đặt lại mật khẩu thành công! Bây giờ bạn có thể đăng nhập bằng mật khẩu mới.");
      setAuthMode('login');
      setAuthPassword("");
      setNewPasswordReset("");
      setConfirmPasswordReset("");
      setForgotEmail("");
    } catch (err) {
      showAlert("Lỗi Máy Chủ ❌", "Không thể ghi đè mật khẩu mới. Vui lòng thử lại sau.");
    }
  };

  // Profile Page Change Email and Password handlers
  const handleUpdateEmail = async (e) => {
    e.preventDefault();
    if (!profileEmailInput.trim()) {
      showAlert("Lỗi 📧", "Email không được để trống!");
      return;
    }
    setEmail(profileEmailInput.trim());
    showAlert("Thành Công 🎉", "Đã cập nhật Email khôi phục tài khoản thành công!");
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (!profileOldPassword || !profileNewPassword || !profileConfirmPassword) {
      showAlert("Lỗi 🔒", "Vui lòng nhập đầy đủ mật khẩu cũ, mật khẩu mới và xác nhận mật khẩu!");
      return;
    }
    if (profileNewPassword !== profileConfirmPassword) {
      showAlert("Lỗi ❌", "Mật khẩu mới và xác nhận mật khẩu không giống nhau!");
      return;
    }

    try {
      const snapshot = await get(ref(database, `/users/${currentUser}/password`));
      const storedPassword = snapshot.val() || "";
      
      if (storedPassword && storedPassword !== profileOldPassword) {
        showAlert("Sai Mật Khẩu 🔑", "Mật khẩu cũ không chính xác!");
        return;
      }

      await set(ref(database, `/users/${currentUser}/password`), profileNewPassword);
      showAlert("Thành Công 🎉", "Đã đổi mật khẩu tài khoản thành công!");
      setProfileOldPassword("");
      setProfileNewPassword("");
      setProfileConfirmPassword("");
    } catch (err) {
      showAlert("Lỗi Máy Chủ ❌", "Không thể cập nhật mật khẩu mới.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('panini_currentUser');
    window.location.reload();
  };

  // ─── RARITY TIER DEFINITIONS ──────────────────────────────────────────────────
  const RARITY_TIERS = {
    common:    { types: ['Base'],                                            label: 'THƯỜNG',    color: '#9ca3af', glow: 'rgba(156,163,175,0.4)',  star: '★',     prob: 0 },
    rare:      { types: ['Fan Favourite', 'Top Keeper'],                     label: 'HIẾM',      color: '#60a5fa', glow: 'rgba(96,165,250,0.5)',  star: '★★',    prob: 0 },
    epic:      { types: ['Defensive Rock', 'Midfield Maestro', 'Goal Machine'], label: 'SỪU HIẾM', color: '#a78bfa', glow: 'rgba(167,139,250,0.5)', star: '★★★',  prob: 0 },
    legendary: { types: ['Icon'],                                            label: 'HUYỀN THOẠI', color: '#f59e0b', glow: 'rgba(245,158,11,0.6)', star: '★★★★', prob: 0 },
    mythic:    { types: ['Golden Baller'],                                   label: 'SIÊU SAO',   color: '#f43f5e', glow: 'rgba(244,63,94,0.7)',  star: '★★★★★', prob: 0 },
  };

  const getCardRarity = (card) => {
    for (const [key, tier] of Object.entries(RARITY_TIERS)) {
      if (tier.types.includes(card.type)) return key;
    }
    return 'common';
  };

  // Pack configs: each pack costs X coins and has different pull probabilities
  const PACK_CONFIGS = {
    starter:  { name: 'Gói Khởi Đầu', emoji: '🎁', cost: 0,   isFree: true,  cards: 5,  common: 0.70, rare: 0.22, epic: 0.06, legendary: 0.015, mythic: 0.005, guaranteedRare: 1 },
    standard: { name: 'Gói Tiêu Chuẩn', emoji: '📦', cost: 100, isFree: false, cards: 8,  common: 0.60, rare: 0.25, epic: 0.10, legendary: 0.03,  mythic: 0.02,  guaranteedRare: 1 },
    premium:  { name: 'Gói Cao Cấp',    emoji: '💫', cost: 300, isFree: false, cards: 12, common: 0.45, rare: 0.30, epic: 0.15, legendary: 0.06,  mythic: 0.04,  guaranteedRare: 2 },
    ultimate: { name: 'Gói Tuyển Chọn', emoji: '👑', cost: 600, isFree: false, cards: 16, common: 0.30, rare: 0.30, epic: 0.20, legendary: 0.12,  mythic: 0.08,  guaranteedRare: 3 },
  };

  // ─── ENHANCED GACHA ALGORITHM with Pity System ───────────────────────────────
  const openPack = (type = packType) => {
    const cfg = PACK_CONFIGS[type];
    const isFree = freePacks > 0 && type === 'starter';

    if (isFree) {
      setFreePacks(f => f - 1);
    } else if (!isFree) {
      if (coins < cfg.cost) {
        showAlert('Đủ Xu ⚠️', `Bạn cần ${cfg.cost} Xu để mở ${cfg.name}! Hãy làm nhiệm vụ để kiếm thêm Xu nhé.`);
        return;
      }
      setCoins(c => c - cfg.cost);
    }

    gainXp(type === 'ultimate' ? 30 : type === 'premium' ? 20 : type === 'standard' ? 10 : 5);
    setIsPackOpeningAnim(true);
    setOpenedCards([]);
    setRevealingCards([]);
    setRevealIndex(0);

    setTimeout(() => {
      const pools = {
        common:    playersData.filter(p => RARITY_TIERS.common.types.includes(p.type)),
        rare:      playersData.filter(p => RARITY_TIERS.rare.types.includes(p.type)),
        epic:      playersData.filter(p => RARITY_TIERS.epic.types.includes(p.type)),
        legendary: playersData.filter(p => RARITY_TIERS.legendary.types.includes(p.type)),
        mythic:    playersData.filter(p => RARITY_TIERS.mythic.types.includes(p.type)),
      };

      const allPulled = [];
      let currentPity = pityCounter;
      let guaranteedLeft = cfg.guaranteedRare;

      const pullCard = (forcedRarity = null) => {
        let rarity = forcedRarity;
        if (!rarity) {
          const r = Math.random();
          // Pity: if pity >= 9, force legendary or mythic
          if (currentPity >= 9) {
            rarity = Math.random() < 0.4 ? 'mythic' : 'legendary';
            currentPity = 0;
          } else if (r < cfg.mythic) {
            rarity = 'mythic'; currentPity = 0;
          } else if (r < cfg.mythic + cfg.legendary) {
            rarity = 'legendary'; currentPity = 0;
          } else if (r < cfg.mythic + cfg.legendary + cfg.epic) {
            rarity = 'epic';
          } else if (r < cfg.mythic + cfg.legendary + cfg.epic + cfg.rare) {
            rarity = 'rare';
          } else {
            rarity = 'common';
            currentPity++;
          }
        } else {
          if (rarity === 'mythic' || rarity === 'legendary') currentPity = 0;
        }

        const pool = pools[rarity];
        if (!pool || pool.length === 0) return pullCard('common');

        // Avoid exact duplicates in same pack
        let card = pool[Math.floor(Math.random() * pool.length)];
        let attempts = 0;
        while (allPulled.find(c => c.id === card.id) && attempts < 20) {
          card = pool[Math.floor(Math.random() * pool.length)];
          attempts++;
        }
        return { ...card, _rarity: rarity };
      };

      for (let i = 0; i < cfg.cards; i++) {
        // Last N slots: guarantee rare+ if not yet met
        const remaining = cfg.cards - i;
        const needGuarantee = guaranteedLeft > 0 && remaining <= guaranteedLeft;
        if (needGuarantee) {
          const forcedRarity = Math.random() < 0.3 ? 'mythic' : Math.random() < 0.4 ? 'legendary' : 'epic';
          allPulled.push(pullCard(forcedRarity));
          guaranteedLeft--;
        } else {
          const card = pullCard();
          if (['rare','epic','legendary','mythic'].includes(card._rarity)) {
            guaranteedLeft = Math.max(0, guaranteedLeft - 1);
          }
          allPulled.push(card);
        }
      }

      // Sort: rarest last for dramatic reveal
      const rarityOrder = { common: 0, rare: 1, epic: 2, legendary: 3, mythic: 4 };
      allPulled.sort((a, b) => rarityOrder[a._rarity] - rarityOrder[b._rarity]);

      // Update pity
      setPityCounter(currentPity);
      localStorage.setItem(`panini_${currentUser}_pity`, currentPity.toString());

      // Add to collection
      setCollection(prev => {
        const newCollection = [...prev];
        allPulled.forEach(c => {
          if (!newCollection.find(p => p.id === c.id)) newCollection.push(c);
        });
        return newCollection;
      });

      // Update quest: open_pack1
      setQuests(prev => prev.map(q => {
        if (q.id === 'open_pack1' && !q.isCompleted) {
          return { ...q, progress: Math.min(1, q.progress + 1), isCompleted: true };
        }
        return q;
      }));

      setRevealingCards(allPulled);
      setOpenedCards(allPulled);
      setIsPackOpeningAnim(false);
    }, 1200);
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
      
      if (diff === 'Easy' || diff === 'Amateur') return maxStat <= 75; // Chỉ dùng thẻ yếu
      if (diff === 'Medium' || diff === 'Professional') return maxStat > 75 && maxStat <= 87; // Thẻ tầm trung
      if (diff === 'Hard' || diff === 'World Class') return maxStat > 87 && maxStat <= 94; // Thẻ tầm khá/giỏi
      if (diff === 'Legendary') return maxStat >= 95; // Siêu sao đỉnh cao
      if (diff === 'Ultimate') return maxStat >= 98; // Chỉ tuyển chọn các Icon, Golden Baller hàng đầu thế giới 98+
      return true;
    });

    const safePool = filteredPool.length >= 11 ? filteredPool : pool;
    const shuffled = safePool.sort(() => 0.5 - Math.random());
    
    // Deep clone the shuffled cards so we don't mutate the original playersData pool!
    const aiSelectedTeam = shuffled.slice(0, 11).map(card => {
      const clonedCard = JSON.parse(JSON.stringify(card));
      let boost = 0;
      if (diff === 'Legendary') boost = 2;
      else if (diff === 'Ultimate') boost = 5;
      
      if (boost > 0) {
        clonedCard.stats.attack = Math.min(100, clonedCard.stats.attack + boost);
        clonedCard.stats.defense = Math.min(100, clonedCard.stats.defense + boost);
        clonedCard.stats.control = Math.min(100, clonedCard.stats.control + boost);
      }
      return clonedCard;
    });
    return aiSelectedTeam;
  };

  const startMatch = () => {
    const weather = ENV_WEATHER[Math.floor(Math.random() * ENV_WEATHER.length)];
    const time = ENV_TIME[Math.floor(Math.random() * ENV_TIME.length)];
    setMatchEnvironment({ weather, time });

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
    
    // AI picks a card based on difficulty level
    let aiIndex = 0;
    
    if (difficulty === 'Easy' || difficulty === 'Amateur') {
      // 100% random choice
      aiIndex = Math.floor(Math.random() * aiHand.length);
    } else {
      // Determine what stat we are comparing against on the AI card
      let targetStat = '';
      if (stat === 'attack') targetStat = 'defense';
      else if (stat === 'defense') targetStat = 'attack';
      else targetStat = 'control';

      const lvlBonus1 = ((selectedPlayerCard.level || 1) - 1) * 2;
      const playerVal = selectedPlayerCard.stats[stat] + lvlBonus1;

      // Smart AI Card Selection logic
      // We want to find a card in aiHand that wins, draws, or minimizes loss
      const aiCardsWithIndex = aiHand.map((card, idx) => ({ card, idx }));
      
      // Separate cards into winning, drawing, and losing groups
      const winners = aiCardsWithIndex.filter(item => item.card.stats[targetStat] > playerVal);
      const drawers = aiCardsWithIndex.filter(item => item.card.stats[targetStat] === playerVal);
      const losers = aiCardsWithIndex.filter(item => item.card.stats[targetStat] < playerVal);

      // Determine smart selection probability based on difficulty
      let isSmart = false;
      const rand = Math.random();
      if (difficulty === 'Medium' || difficulty === 'Professional') {
        isSmart = rand < 0.50; // 50% smart
      } else if (difficulty === 'Hard' || difficulty === 'World Class') {
        isSmart = rand < 0.75; // 75% smart
      } else if (difficulty === 'Legendary') {
        isSmart = rand < 0.90; // 90% smart
      } else if (difficulty === 'Ultimate') {
        isSmart = true; // 100% smart
      }

      if (isSmart) {
        if (winners.length > 0) {
          // A smart AI chooses the lowest winning card to conserve its super cards!
          winners.sort((a, b) => a.card.stats[targetStat] - b.card.stats[targetStat]);
          aiIndex = winners[0].idx;
        } else if (drawers.length > 0) {
          // If it can't win, try to draw
          aiIndex = drawers[Math.floor(Math.random() * drawers.length)].idx;
        } else {
          // If it must lose, play the card with the lowest stat in this category to conserve strong cards!
          losers.sort((a, b) => a.card.stats[targetStat] - b.card.stats[targetStat]);
          aiIndex = losers[0].idx; // Sacrificial play
        }
      } else {
        // Normal random choice
        aiIndex = Math.floor(Math.random() * aiHand.length);
      }
    }

    const aiCard = aiHand[aiIndex];
    setCurrentAiCard(aiCard);

    // Compare logic:
    // If player picks Attack, compare with AI's Defense
    // If player picks Defense, compare with AI's Attack
    // If player picks Control, compare with AI's Control
    const lvlBonus1 = ((selectedPlayerCard.level || 1) - 1) * 2;
    const lvlBonus2 = ((aiCard.level || 1) - 1) * 2;
    let baseV1 = selectedPlayerCard.stats[stat] + lvlBonus1;
    let baseV2 = 0;
    let stat2Name = '';

    if (stat === 'attack') {
      baseV2 = aiCard.stats.defense + lvlBonus2;
      stat2Name = 'defense';
    } else if (stat === 'defense') {
      baseV2 = aiCard.stats.attack + lvlBonus2;
      stat2Name = 'attack';
    } else {
      baseV2 = aiCard.stats.control + lvlBonus2;
      stat2Name = 'control';
    }

    // Generate Form/Condition based on weather, elements, underdog logic
    const formResult1 = generateCardForm(selectedPlayerCard, aiCard, matchEnvironment);
    const formResult2 = generateCardForm(aiCard, selectedPlayerCard, matchEnvironment);
    const formBonus1 = formResult1.bonus;
    const formBonus2 = formResult2.bonus;

    // Apply card rarity priority bonus
    const bonus1 = getCardTypeBonus(selectedPlayerCard.type);
    const bonus2 = getCardTypeBonus(aiCard.type);

    // Apply attribute system element advantage (Speed ⚡, Tech 🌀, Power 💪)
    const attr1 = getPlayerAttr(selectedPlayerCard);
    const attr2 = getPlayerAttr(aiCard);
    let attrBonus1 = 0;
    let attrBonus2 = 0;

    if (checkAttrAdvantage(attr1.key, attr2.key)) {
      attrBonus1 = 5;
    } else if (checkAttrAdvantage(attr2.key, attr1.key)) {
      attrBonus2 = 5;
    }

    const v1 = baseV1 + bonus1 + attrBonus1 + formBonus1;
    const v2 = baseV2 + bonus2 + attrBonus2 + formBonus2;

    const bonusPart = (b, ab, emoji, lb, fb, fs) => {
      let parts = [];
      if (lb > 0) parts.push(`+${lb} Lv`);
      if (b > 0) parts.push(`+${b} Rarity`);
      if (ab > 0) parts.push(`+${ab} Khắc chế ${emoji}`);
      if (fb !== 0) {
        const sign = fb > 0 ? '+' : '';
        parts.push(`${sign}${fb} Phong độ ${fs.emoji}`);
      } else {
        parts.push(`+0 Phong độ ➡️`);
      }
      return parts.length > 0 ? ` [${parts.join(' & ')}]` : '';
    };

    let pScore = matchScore.player;
    let aScore = matchScore.ai;
    let msg = '';

    if (v1 > v2) {
      pScore++;
      msg = `THẮNG! ${baseV1}${bonusPart(bonus1, attrBonus1, attr1.emoji, lvlBonus1, formBonus1, formResult1.state)} > ${baseV2}${bonusPart(bonus2, attrBonus2, attr2.emoji, lvlBonus2, formBonus2, formResult2.state)}`;
    } else if (v2 > v1) {
      aScore++;
      msg = `THUA! ${baseV1}${bonusPart(bonus1, attrBonus1, attr1.emoji, lvlBonus1, formBonus1, formResult1.state)} < ${baseV2}${bonusPart(bonus2, attrBonus2, attr2.emoji, lvlBonus2, formBonus2, formResult2.state)}`;
    } else {
      msg = `HÒA! ${baseV1}${bonusPart(bonus1, attrBonus1, attr1.emoji, lvlBonus1, formBonus1, formResult1.state)} = ${baseV2}${bonusPart(bonus2, attrBonus2, attr2.emoji, lvlBonus2, formBonus2, formResult2.state)}`;
    }
    setMatchScore({ player: pScore, ai: aScore });
    setRoundResultMsg(msg);
    setMatchLogs([...matchLogs, `Lượt ${playedCardIds.length + 1}: ${selectedPlayerCard.name} (${stat.toUpperCase()}${bonusPart(bonus1)}) vs ${aiCard.name} (${stat2Name.toUpperCase()}${bonusPart(bonus2)}) -> ${msg}`]);
    setMatchPhase('roundResult');

    // Remove cards from hands
    setPlayedCardIds([...playedCardIds, selectedPlayerCard.id]);
    setAiHand(aiHand.filter((_, i) => i !== aiIndex));
  };

  const nextRound = () => {
    if (playedCardIds.length >= 11) { // Đã đánh 11 lá (0 đến 11 là 11 lá, check sau khi cộng)
      // Trận đấu kết thúc -> Tính thưởng theo độ khó
      let reward = 10;
      const isWin = matchScore.player > matchScore.ai;
      const isDraw = matchScore.player === matchScore.ai;

      // Tính phần thưởng theo độ khó — thua cũng có thưởng để khuyến khích tích lũy
      if (difficulty === 'Easy' || difficulty === 'Amateur') {
        reward = isWin ? 40 : isDraw ? 20 : 12;
      } else if (difficulty === 'Medium' || difficulty === 'Professional') {
        reward = isWin ? 60 : isDraw ? 25 : 15;
      } else if (difficulty === 'Hard' || difficulty === 'World Class') {
        reward = isWin ? 100 : isDraw ? 35 : 20;
      } else if (difficulty === 'Legendary') {
        reward = isWin ? 150 : isDraw ? 55 : 30;
      } else if (difficulty === 'Ultimate') {
        reward = isWin ? 220 : isDraw ? 75 : 40;
      }
      
      setCoins(c => c + reward);
      setLastReward(reward);
      
      // Cập nhật Nhiệm vụ
      setQuests(prev => prev.map(q => {
         if (q.id === 'play1') return { ...q, progress: 1, isCompleted: true };
         if (q.id === 'win1' && matchScore.player > matchScore.ai) return { ...q, progress: 1, isCompleted: true };
         return q;
      }));

      // Update XP & Stats — thua vẫn nhận XP để khuyến khích chơi
      let xpEarned = 0;
      if (isWin) {
        xpEarned = 60;
        gainXp(xpEarned);
        setStats(s => ({ ...s, played: s.played + 1, wins: s.wins + 1 }));
      } else if (isDraw) {
        xpEarned = 30;
        gainXp(xpEarned);
        setStats(s => ({ ...s, played: s.played + 1, draws: s.draws + 1 }));
      } else {
        xpEarned = 15;
        gainXp(xpEarned);
        setStats(s => ({ ...s, played: s.played + 1, losses: s.losses + 1 }));
      }

      // Hiển thị alert kết quả với thưởng rõ ràng
      if (isWin) {
        showAlert('🏆 Chiến Thắng!', `Xuất sắc! Bạn thắng ${matchScore.player}-${matchScore.ai}. Nhận: +${reward} Xu & +${xpEarned} XP.`);
      } else if (isDraw) {
        showAlert('🤝 Hòa Trận!', `Tỉ số cân bằng ${matchScore.player}-${matchScore.ai}. Nhận: +${reward} Xu & +${xpEarned} XP.`);
      } else {
        showAlert('😤 Thất Bại — Nhưng Bạn Vẫn Nhận Thưởng!', `Kết quả ${matchScore.player}-${matchScore.ai}. Nhận: +${reward} Xu & +${xpEarned} XP. Tiếp tục cố lên!`);
      }

      setMatchPhase('gameOver');
    } else {
      setSelectedPlayerCard(null);
      setSelectedStat(null);
      setCurrentAiCard(null);
      setMatchPhase('playing');
    }
  };

  useEffect(() => {
    if (matchPhase === 'roundResult') {
      if (roundResultMsg.includes('THẮNG')) {
        playFx('winPoint');
        confetti({
          particleCount: 150,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#22c55e', '#3b82f6', '#fbbf24']
        });
      } else if (roundResultMsg.includes('THUA')) {
        playFx('losePoint');
      }
    } else if (matchPhase === 'gameOver') {
      if (matchScore.player > matchScore.ai) {
        playFx('winGame');
      }
    }
  }, [matchPhase, roundResultMsg, matchScore.player, matchScore.ai]);

  // Auto-hide round result overlay after 3 seconds in AI Match
  useEffect(() => {
    if (gameState === 'matchEngine' && matchPhase === 'roundResult' && playedCardIds.length < 11) {
      const timer = setTimeout(() => {
        setMatchPhase('playing');
        setSelectedPlayerCard(null);
        setSelectedStat(null);
        setCurrentAiCard(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [gameState, matchPhase, playedCardIds.length]);

  const returnToLobby = () => {
    setGameState('lobby');
    setMatchPhase('setup');
    setPlayerHand([]);
    setAiHand([]);
    setSelectedPlayerCard(null);
    setSelectedStat(null);
    setCurrentAiCard(null);
  };

  const [gameAlert, setGameAlert] = useState(null); // Custom in-game dialog alert: { title, message }
  const showAlert = (title, message) => {
    setGameAlert({ title, message });
  };

  const handlePvpEnd = (result) => {
    if (result === 'win') {
      setCoins(c => c + 120);
      gainXp(120);
      setStats(s => ({ ...s, played: s.played + 1, wins: s.wins + 1 }));
      showAlert("🏆 Chiến Thắng PvP!", "Xuất sắc! Bạn đánh bại đối thủ thật sự. Nhận: +120 Xu & +120 XP.");
    } else if (result === 'draw') {
      setCoins(c => c + 40);
      gainXp(50);
      setStats(s => ({ ...s, played: s.played + 1, draws: s.draws + 1 }));
      showAlert("🤝 Hòa Trận PvP!", "Cuộc chiến ngang tài ngang sức! Nhận: +40 Xu & +50 XP.");
    } else if (result === 'lose') {
      setCoins(c => c + 25);
      gainXp(30);
      setStats(s => ({ ...s, played: s.played + 1, losses: s.losses + 1 }));
      showAlert("😤 Thất Bại PvP — Vẫn Có Thưởng!", "Bạn thua trận này nhưng đã cố gắng! Nhận: +25 Xu & +30 XP. Tập luyện thêm và thử lại!");
    }
    returnToLobby();
  };

  return (
    <>
      {/* ═══ NEW LANDING PAGE — 2-column split ═══ */}
      {!currentUser && (
        <div className="landing-page-wrapper">
          {/* Background */}
          <div className="landing-bg" />

          {/* Top Nav */}
          <nav className="landing-nav">
            <div className="landing-nav-logo">
              <div className="landing-nav-logo-badge">⚽</div>
              <div>
                <span className="landing-nav-logo-text">Ultimate Card</span>
                <span className="landing-nav-logo-sub">World Cup 2026</span>
              </div>
            </div>
            <div className="landing-nav-links">
              <button className="landing-nav-btn" onClick={() => setGameState('howToPlay')}>📖 Hướng Dẫn</button>
            </div>
          </nav>

          {/* Main: Banner left + Login right */}
          <div className="landing-main">

            {/* ── LEFT: Banner Column ── */}
            <div className="landing-banner-col">
              <div className="landing-banner-card">
                <img 
                  key={activeBannerIdx}
                  src={BANNERS[activeBannerIdx]} 
                  alt="World Cup 2026 Banner" 
                  className="banner-fade-in"
                />
              </div>

              {/* Info section underneath the banner card */}
              <div className="landing-banner-info">
                <div className="landing-hero-subtitle">🏆 Ultimate Card Champions 🏆</div>
                <div className="landing-badges">
                  <span className="landing-badge green">⚽ 800+ Cầu Thủ</span>
                  <span className="landing-badge blue">🌐 PvP Online</span>
                  <span className="landing-badge pink">🏆 Bảng Xếp Hạng</span>
                  <span className="landing-badge green">🎁 200 Xu Khởi Đầu</span>
                </div>
              </div>
            </div>

            {/* ── RIGHT: Auth Panel ── */}
            <div className="landing-login-col">
              <div className="landing-login-header">
                <h2>
                  {authStep === 'enter_name' ? 'Vào Sân Ngay!' :
                   authStep === 'enter_pin'  ? `Chào lại, ${authUsername}!` :
                                               `Chào mừng, ${authUsername}!`}
                </h2>
                <p>
                  {authStep === 'enter_name' ? 'Đăng nhập hoặc tạo tài khoản mới để bắt đầu' :
                   authStep === 'enter_pin'  ? 'Nhập mã PIN để vào tài khoản của bạn' :
                                               'Tài khoản mới • 3 gói thẻ + 200 xu miễn phí!'}
                </p>
              </div>

              <div className="landing-glass-panel">

                {/* STEP 1: Enter name */}
                {authStep === 'enter_name' && (
                  <div className="animate-scale-in">
                    <form onSubmit={handleCheckUsername} className="flex flex-col gap-4">
                      <div className="landing-form-group">
                        <label className="landing-label">🏟️ Tên HLV Của Bạn</label>
                        <input
                          type="text"
                          className="landing-input text-center text-lg font-black tracking-widest"
                          value={authUsername}
                          onChange={(e) => setAuthUsername(e.target.value)}
                          placeholder="VD: TieuHoang_99..."
                          maxLength={20}
                          autoFocus
                        />
                        <p className="text-[10px] text-gray-500 mt-1 text-center">Tên hiển thị với tất cả mọi người · Tối đa 20 ký tự</p>
                      </div>

                      <button
                        type="submit"
                        className="landing-btn-submit flex items-center justify-center gap-2"
                        disabled={authCheckingUser}
                      >
                        {authCheckingUser ? (
                          <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                        ) : '⚡'}
                        {authCheckingUser ? 'Đang kiểm tra...' : 'TIẾP THEO'}
                      </button>
                    </form>

                    {/* Auto-login hint */}
                    {(() => {
                      const saved = localStorage.getItem('panini_currentUser');
                      if (!saved) return null;
                      return (
                        <div className="mt-4 p-3 bg-green-950/40 border border-green-500/30 rounded-xl text-center">
                          <p className="text-[11px] text-green-400 font-bold">💾 Thiết bị này đã lưu HLV:</p>
                          <button
                            className="text-sm font-black text-white mt-1 hover:text-green-300 transition-colors cursor-pointer"
                            onClick={() => { localStorage.setItem('panini_currentUser', saved); window.location.reload(); }}
                          >
                            👤 {saved} — Vào ngay!
                          </button>
                        </div>
                      );
                    })()}
                  </div>
                )}

                {/* STEP 2A: Existing user → enter PIN */}
                {authStep === 'enter_pin' && (
                  <div className="animate-scale-in">
                    <form onSubmit={handleVerifyPin} className="flex flex-col gap-4">
                      <div className="landing-form-group">
                        <label className="landing-label">🔑 Mã PIN 4 Số</label>
                        <input
                          type="number"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          maxLength={4}
                          className="landing-input text-center text-2xl font-black tracking-[0.5em]"
                          value={authPin}
                          onChange={(e) => { if (e.target.value.length <= 4) setAuthPin(e.target.value); }}
                          placeholder="••••"
                          autoFocus
                        />
                      </div>

                      <button type="submit" className="landing-btn-submit flex items-center justify-center gap-2" disabled={authCheckingUser}>
                        {authCheckingUser ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span> : '🚪'}
                        {authCheckingUser ? 'Đang xác minh...' : 'VÀO GAME'}
                      </button>

                      <button
                        type="button"
                        onClick={() => { setAuthStep('enter_name'); setAuthPin(''); setAuthFoundUser(null); }}
                        className="text-[11px] text-gray-500 hover:text-white text-center font-bold uppercase tracking-wider mt-1 cursor-pointer bg-transparent border-0 w-full transition-colors"
                      >
                        ← Nhập tên khác
                      </button>
                    </form>
                  </div>
                )}

                {/* STEP 2B: New user → set optional PIN */}
                {authStep === 'set_pin' && (
                  <div className="animate-scale-in">
                    <div className="p-3 bg-amber-950/40 border border-amber-500/30 rounded-xl mb-4">
                      <p className="text-[11px] text-amber-300 font-bold text-center leading-relaxed">
                        💡 <strong>Đặt Mã PIN 4 Số</strong> để bảo vệ tài khoản và đăng nhập lại trên mọi thiết bị.<br/>
                        <span className="text-gray-400">Để trống nếu chỉ chơi trên thiết bị này.</span>
                      </p>
                    </div>

                    <form onSubmit={handleCreateAccount} className="flex flex-col gap-4">
                      <div className="landing-form-group">
                        <label className="landing-label">🔑 Mã PIN 4 Số (Tuỳ chọn)</label>
                        <input
                          type="number"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          maxLength={4}
                          className="landing-input text-center text-2xl font-black tracking-[0.5em]"
                          value={authPin}
                          onChange={(e) => { if (e.target.value.length <= 4) setAuthPin(e.target.value); }}
                          placeholder="Ví dụ: 1234"
                        />
                        <p className="text-[10px] text-gray-500 mt-1 text-center">Chọn số dễ nhớ như ngày sinh · Không cần email</p>
                      </div>

                      <button type="submit" className="landing-btn-submit flex items-center justify-center gap-2" style={{background:'linear-gradient(135deg,#10b981,#059669)'}} disabled={authCheckingUser}>
                        {authCheckingUser ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span> : '🚀'}
                        {authCheckingUser ? 'Đang tạo tài khoản...' : 'BẮT ĐẦU HÀNH TRÌNH!'}
                      </button>

                      <button
                        type="button"
                        onClick={() => { setAuthStep('enter_name'); setAuthPin(''); }}
                        className="text-[11px] text-gray-500 hover:text-white text-center font-bold uppercase tracking-wider mt-1 cursor-pointer bg-transparent border-0 w-full transition-colors"
                      >
                        ← Quay lại
                      </button>
                    </form>
                  </div>
                )}

              </div>

              {/* Stats strip */}
              <div className="landing-stats-strip">
                <div className="landing-stat-item">
                  <span className="landing-stat-val">800+</span>
                  <span className="landing-stat-label">Cầu Thủ</span>
                </div>
                <div className="landing-stat-item">
                  <span className="landing-stat-val">32</span>
                  <span className="landing-stat-label">Đội Tuyển</span>
                </div>
                <div className="landing-stat-item">
                  <span className="landing-stat-val">200⭐</span>
                  <span className="landing-stat-label">Xu Tặng</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══ TRANG HƯỚNG DẪN CHƠI — hiển thị cho mọi trạng thái ═══ */}
      {gameState === 'howToPlay' && (
        <div className="how-to-play-wrapper" style={{position:'fixed',inset:0,zIndex:200,overflowY:'auto'}}>
          <div className="htp-content">
            <button
              className="htp-back-btn"
              onClick={() => setGameState(currentUser ? 'lobby' : 'lobby')}
            >
              ← Quay Lại
            </button>

            {/* Header */}
            <div className="htp-header">
              <div className="htp-eyebrow">⚽ World Cup 2026 · Ultimate Card Champions</div>
              <h1 className="htp-title">Hướng Dẫn Chơi</h1>
              <p className="htp-desc">
                Sưu tầm thẻ cầu thủ, xây dựng đội hình mơ ước và chinh phục mọi đối thủ trong
                trò chơi thẻ bài bóng đá hấp dẫn nhất mùa World Cup 2026!
              </p>
            </div>

            {/* Steps */}
            <div className="htp-steps">

              <div className="htp-step-card">
                <div className="htp-step-num">🎁</div>
                <div className="htp-step-body">
                  <h3>Bước 1 — Đăng Ký & Nhận Quà</h3>
                  <p>
                    Tạo tài khoản miễn phí bằng tên HLV và mã PIN tuỳ chọn. Mỗi tài khoản mới
                    nhận ngay <strong style={{color:'#c4f000'}}>200 Xu + 3 Gói Thẻ Miễn Phí</strong> để bắt đầu hành trình!
                  </p>
                  <span className="htp-tip">💡 Đặt PIN để đăng nhập lại trên mọi thiết bị</span>
                </div>
              </div>

              <div className="htp-step-card">
                <div className="htp-step-num">📦</div>
                <div className="htp-step-body">
                  <h3>Bước 2 — Mở Gói Thẻ Cầu Thủ</h3>
                  <p>
                    Dùng Xu mở các gói thẻ để sưu tập cầu thủ. Có 4 loại gói:
                    <strong style={{color:'#38bdf8'}}> Tiêu Chuẩn (100 xu), Cao Cấp (300 xu),
                    Siêu Cấp (600 xu), Tối Thượng (1200 xu)</strong>.
                    Gói càng xịn, cơ hội nhận thẻ hiếm càng cao!
                  </p>
                  <span className="htp-tip">🎰 Hệ thống pity đảm bảo sau 10 gói có thẻ siêu sao</span>
                </div>
              </div>

              <div className="htp-step-card">
                <div className="htp-step-num">⚽</div>
                <div className="htp-step-body">
                  <h3>Bước 3 — Xây Dựng Đội Hình 11 Người</h3>
                  <p>
                    Vào mục <strong style={{color:'#c4f000'}}>Đội Hình</strong> để chọn 11 cầu thủ
                    xuất sắc nhất từ bộ sưu tập. Mỗi thẻ có 3 chỉ số:
                    <strong style={{color:'#f472b6'}}> ATK (Tấn Công), CTRL (Kiểm Soát), DEF (Phòng Thủ)</strong>.
                    Số cao nhất trong 3 chỉ số là OVR — chọn đội hình có OVR tổng cao nhất!
                  </p>
                  <span className="htp-tip">🏆 Thẻ hiếm có chỉ số cao hơn thẻ thường nhiều</span>
                </div>
              </div>

              <div className="htp-step-card">
                <div className="htp-step-num">🤖</div>
                <div className="htp-step-body">
                  <h3>Bước 4 — Cách Đấu Thẻ</h3>
                  <p>
                    Mỗi lượt bạn chọn 1 thẻ cầu thủ và 1 chỉ số (ATK/CTRL/DEF) để so sánh với thẻ của đối thủ.
                    Chỉ số nào cao hơn sẽ <strong style={{color:'#4ade80'}}>THẮNG</strong> lượt đó.
                    Đội thắng nhiều lượt nhất trong 11 thẻ giành chiến thắng!
                  </p>
                  <span className="htp-tip">🎯 Bonus: Thẻ Edition đặc biệt có thêm điểm cộng khi so sánh</span>
                </div>
              </div>

              <div className="htp-step-card">
                <div className="htp-step-num">⚡</div>
                <div className="htp-step-body">
                  <h3>Bước 5 — Khắc Chế Hệ Kỹ Năng</h3>
                  <p>
                    Cầu thủ chia làm 3 hệ nguyên tố: <strong style={{color:'#facc15'}}>Tốc Độ ⚡</strong> (khắc chế) <strong style={{color:'#22d3ee'}}>Kỹ Thuật 🌀</strong> (khắc chế) <strong style={{color:'#f87171'}}>Sức Mạnh 💪</strong> (khắc chế) <strong style={{color:'#facc15'}}>Tốc Độ ⚡</strong>.
                    Khi so tài, nếu cầu thủ của bạn có hệ khắc chế đối thủ, bạn được <strong style={{color:'#4ade80'}}>cộng ngay +5 điểm</strong> vào chỉ số thi đấu! Sắp xếp bài khắc chế thay vì chỉ nhìn vào chỉ số cao thấp.
                  </p>
                  <span className="htp-tip">💡 Quan sát kỹ biểu tượng hệ nguyên tố ở góc trên bên phải của mỗi chiếc thẻ!</span>
                </div>
              </div>

              <div className="htp-step-card">
                <div className="htp-step-num">🌐</div>
                <div className="htp-step-body">
                  <h3>Bước 6 — PvP Online & Tích Luỹ</h3>
                  <p>
                    Thách đấu bạn bè qua <strong style={{color:'#38bdf8'}}>PvP Online</strong> bằng cách chia sẻ mã phòng.
                    Mọi trận đều nhận Xu và XP:
                    <strong style={{color:'#c4f000'}}> Thắng nhiều hơn, Hòa vừa, Thua cũng có!</strong>
                    Tích đủ XP để lên cấp và nhận thêm phần thưởng lớn.
                  </p>
                  <span className="htp-tip">⚡ Lên cấp nhận 500 Xu mỗi lần!</span>
                </div>
              </div>

              <div className="htp-step-card">
                <div className="htp-step-num">📊</div>
                <div className="htp-step-body">
                  <h3>Bước 7 — Nhiệm Vụ & Bảng Xếp Hạng</h3>
                  <p>
                    Hoàn thành <strong style={{color:'#f472b6'}}>Nhiệm Vụ Hàng Ngày</strong> để nhận thêm Xu và XP.
                    Kiểm tra <strong style={{color:'#c4f000'}}>Bảng Xếp Hạng</strong> để so sánh với
                    các HLV khác toàn server. Đạt mốc hoạt động để nhận thẻ Edition đặc biệt tự động!
                  </p>
                  <span className="htp-tip">🎖️ Thẻ Icon & Super Limited chỉ nhận qua mốc thành tích</span>
                </div>
              </div>

            </div>

            {/* Feature grid */}
            <h2 style={{
              fontSize:'1.1rem', fontWeight:900, textTransform:'uppercase',
              letterSpacing:'2px', color:'white', marginBottom:'1rem', textAlign:'center'
            }}>Tính Năng Nổi Bật</h2>
            <div className="htp-features-grid">
              {[
                { icon:'🃏', name:'800+ Cầu Thủ', desc:'Thẻ từ 32 đội tuyển World Cup 2026 thực tế' },
                { icon:'💎', name:'7 Cấp Độ Hiếm', desc:'Base → Bronze → Silver → Gold → Platinum → Super → Icon' },
                { icon:'⚔️', name:'Đấu AI', desc:'5 mức độ khó từ Amateur đến Ultimate' },
                { icon:'🌐', name:'PvP Online', desc:'Thách đấu thời gian thực qua mã phòng' },
                { icon:'📈', name:'Hệ Thống Cấp', desc:'30 cấp với phần thưởng đặc biệt mỗi mốc' },
                { icon:'🎯', name:'Nhiệm Vụ', desc:'Nhiệm vụ hàng ngày và thành tích dài hạn' },
                { icon:'💬', name:'Chat Sảnh', desc:'Chat toàn server và tin nhắn riêng tư' },
                { icon:'🏆', name:'Bảng Xếp Hạng', desc:'Top HLV mạnh nhất toàn server theo cấp độ' },
                { icon:'🎰', name:'Hệ Pity', desc:'Đảm bảo thẻ siêu sao sau tối đa 10 gói liên tiếp' },
              ].map((f, i) => (
                <div className="htp-feature-card" key={i}>
                  <span className="htp-feature-icon">{f.icon}</span>
                  <div className="htp-feature-name">{f.name}</div>
                  <div className="htp-feature-desc">{f.desc}</div>
                </div>
              ))}
            </div>

            {/* Reward table */}
            <div style={{
              background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.08)',
              borderRadius:'1.25rem', padding:'1.5rem', marginBottom:'2rem'
            }}>
              <h3 style={{
                fontSize:'0.9rem', fontWeight:900, textTransform:'uppercase',
                letterSpacing:'2px', color:'white', marginBottom:'1rem', textAlign:'center'
              }}>💰 Bảng Phần Thưởng Trận Đấu</h3>
              <div style={{overflowX:'auto'}}>
                <table style={{width:'100%', borderCollapse:'collapse', fontSize:'0.8rem'}}>
                  <thead>
                    <tr style={{borderBottom:'1px solid rgba(255,255,255,0.1)'}}>
                      <th style={{padding:'0.6rem 1rem', textAlign:'left', color:'rgba(255,255,255,0.5)', fontWeight:700, textTransform:'uppercase', letterSpacing:'1px'}}>Kết Quả</th>
                      <th style={{padding:'0.6rem 1rem', textAlign:'center', color:'rgba(255,255,255,0.5)', fontWeight:700, textTransform:'uppercase', letterSpacing:'1px'}}>Xu</th>
                      <th style={{padding:'0.6rem 1rem', textAlign:'center', color:'rgba(255,255,255,0.5)', fontWeight:700, textTransform:'uppercase', letterSpacing:'1px'}}>XP</th>
                      <th style={{padding:'0.6rem 1rem', textAlign:'center', color:'rgba(255,255,255,0.5)', fontWeight:700, textTransform:'uppercase', letterSpacing:'1px'}}>Ghi Chú</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { res:'🏆 Thắng AI (Easy)', xu:'+40', xp:'+60 XP', note:'Amateur/Easy' },
                      { res:'🏆 Thắng AI (Medium)', xu:'+60', xp:'+60 XP', note:'Professional/Medium' },
                      { res:'🏆 Thắng AI (Hard)', xu:'+100', xp:'+60 XP', note:'World Class/Hard' },
                      { res:'🏆 Thắng AI (Legend)', xu:'+150', xp:'+60 XP', note:'Legendary' },
                      { res:'🏆 Thắng AI (Ultimate)', xu:'+220', xp:'+60 XP', note:'Khó nhất' },
                      { res:'🤝 Hòa AI', xu:'+20~75', xp:'+30 XP', note:'Theo độ khó' },
                      { res:'😤 Thua AI', xu:'+12~40', xp:'+15 XP', note:'Vẫn có thưởng!' },
                      { res:'🌐 Thắng PvP', xu:'+120', xp:'+120 XP', note:'Vs người thật' },
                      { res:'🌐 Hòa PvP', xu:'+40', xp:'+50 XP', note:'Vs người thật' },
                      { res:'🌐 Thua PvP', xu:'+25', xp:'+30 XP', note:'Vẫn có thưởng!' },
                    ].map((row, i) => (
                      <tr key={i} style={{borderBottom:'1px solid rgba(255,255,255,0.05)', transition:'background 0.2s'}}
                        onMouseEnter={e => e.currentTarget.style.background='rgba(255,255,255,0.04)'}
                        onMouseLeave={e => e.currentTarget.style.background='transparent'}
                      >
                        <td style={{padding:'0.6rem 1rem', color:'white', fontWeight:600}}>{row.res}</td>
                        <td style={{padding:'0.6rem 1rem', textAlign:'center', color:'#c4f000', fontWeight:800}}>{row.xu}</td>
                        <td style={{padding:'0.6rem 1rem', textAlign:'center', color:'#38bdf8', fontWeight:700}}>{row.xp}</td>
                        <td style={{padding:'0.6rem 1rem', textAlign:'center', color:'rgba(255,255,255,0.4)', fontSize:'0.72rem'}}>{row.note}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* CTA */}
            <div className="htp-cta-box">
              <h3>🚀 Sẵn Sàng Chiến Chưa?</h3>
              <p>Tạo tài khoản ngay hôm nay, nhận 200 Xu + 3 gói thẻ miễn phí và bắt đầu hành trình chinh phục World Cup 2026!</p>
              <button
                className="htp-cta-btn"
                onClick={() => {
                  setGameState('lobby');
                  if (!currentUser) {
                    // scroll to login - just go back to landing
                  }
                }}
              >
                ⚡ {currentUser ? 'Về Trang Chủ' : 'Đăng Ký Ngay'}
              </button>
            </div>

          </div>
        </div>
      )}

      {currentUser && (
        <>
          {activeInvite && (
            <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/95 backdrop-blur-md p-4 animate-fade-in animate-pulse-subtle">
              <div className="glass-panel p-8 sm:p-10 rounded-[2.5rem] max-w-sm w-full flex flex-col items-center bg-gradient-to-b from-red-950/80 via-slate-900 to-black shadow-[0_0_80px_rgba(239,68,68,0.4)] border border-red-500/30 text-center relative">
                <div className="w-20 h-20 bg-red-900/60 rounded-full flex items-center justify-center border-4 border-red-500 shadow-[0_0_30px_rgba(239,68,68,0.6)] mb-6 animate-bounce">
                  <Swords size={40} className="text-red-400" />
                </div>
                
                <h3 className="text-sm font-black text-red-500 tracking-widest uppercase mb-1">Thử Thách PVP Tuyệt Đối ⚔️</h3>
                <h2 className="text-2xl font-black text-white mb-4 uppercase tracking-wider">LỜI THÁCH ĐẤU!</h2>
                
                <p className="text-gray-300 text-sm leading-relaxed mb-6 font-semibold">
                  HLV <span className="text-amber-400 font-extrabold">{activeInvite.host}</span> (Đội hình: <span className="text-cyan-400 font-black">{activeInvite.hostRating} OVR</span>) muốn thách đấu PVP với bạn! Bạn có dám chấp nhận?
                </p>
                
                <div className="flex gap-4 w-full mt-2">
                  <button 
                    className="flex-1 flex items-center justify-center gap-2 py-3 px-5 rounded-full border border-emerald-500/40 bg-emerald-950/20 text-emerald-300 hover:text-white hover:bg-gradient-to-r hover:from-emerald-600 hover:to-green-500 hover:border-transparent hover:shadow-[0_0_25px_rgba(16,185,129,0.5)] active:scale-95 transition-all duration-300 font-extrabold uppercase text-xs tracking-widest cursor-pointer backdrop-blur-sm"
                    onClick={() => acceptChallenge(activeInvite)}
                  >
                    🤝 Đồng Ý
                  </button>
                  <button 
                    className="flex-1 flex items-center justify-center gap-2 py-3 px-5 rounded-full border border-red-500/40 bg-red-950/20 text-red-300 hover:text-white hover:bg-gradient-to-r hover:from-red-600 hover:to-rose-500 hover:border-transparent hover:shadow-[0_0_25px_rgba(239,68,68,0.5)] active:scale-95 transition-all duration-300 font-extrabold uppercase text-xs tracking-widest cursor-pointer backdrop-blur-sm"
                    onClick={declineChallenge}
                  >
                    ✕ Từ Chối
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="bg-stadium"></div>
          <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,_transparent_0%,_rgba(0,0,0,0.8)_100%)] z-50 mix-blend-overlay"></div>
          <div className="fixed inset-0 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20 z-50"></div>
          
          {/* Native flow footer used at the bottom of app-container instead */}

          {/* User Header Profile */}
          <div className="absolute top-4 right-4 z-50 flex items-center gap-4 bg-black/50 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 shadow-lg">
            <div className="text-sm flex items-center gap-2 cursor-pointer hover:text-cyan-400 hover:scale-105 transition-all duration-300 select-none" onClick={() => { playFx('click'); setGameState('profile'); }} title="Xem hồ sơ và cài đặt HLV">
              <span className="text-gray-400">HLV: </span>
              <span className="font-bold text-fuchsia-400">{currentUser}</span>
              <span className="text-[10px] bg-white/10 text-gray-300 px-2 py-0.5 rounded-full border border-white/10 font-bold">Lv.{level}</span>
              {(() => {
                const tier = getPlayerTier(level);
                return (
                  <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border flex items-center gap-1 ${tier.color} ${tier.glow}`}>
                    {tier.icon} {tier.name}
                  </span>
                );
              })()}
            </div>
            <div className="w-[1px] h-4 bg-white/20"></div>
            <button onClick={handleLogout} className="text-xs text-red-400 hover:text-red-300 font-bold uppercase tracking-wider">Thoát</button>
          </div>

          <div className={`app-container relative z-10 ${gameState === 'lobby' ? 'lg:max-w-none lg:w-full lg:mx-0 lg:pr-0 lg:pl-8' : ''}`}>
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
                <div className="flex flex-col lg:flex-row items-stretch justify-between min-h-[80vh] w-full max-w-full gap-8 px-4 lg:pl-0 lg:pr-0 pt-12 animate-fade-in relative z-10">
                  
                  {/* LEFT COLUMN: Main Game Lobby */}
                  <div className="flex-1 flex flex-col items-center justify-center max-w-5xl mx-auto w-full">
                    
                    {/* Hero Section */}
                    <div className="relative flex flex-col items-center mb-12 sm:mb-16">
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-yellow-500/20 rounded-full blur-[100px] pointer-events-none"></div>
                      
                      <Trophy size={150} className="text-yellow-400 trophy-hero mb-4 drop-shadow-[0_0_40px_rgba(251,191,36,0.8)]" />
                      
                      <h1 className="text-6xl md:text-8xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-blue-100 to-blue-400 drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)] mb-2 uppercase text-center leading-none pr-4">
                        World Cup
                      </h1>
                      <h2 className="text-3xl md:text-5xl font-black italic tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-500 to-cyan-500 drop-shadow-[0_5px_15px_rgba(0,0,0,0.9)] mb-8 uppercase text-center pr-2">
                        2026 Ultimate
                      </h2>
                      
                      <div className="glass-panel px-8 py-4 rounded-full flex gap-8 mb-4 mt-2">
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 w-full z-20">
                      <button className="glass-menu-card p-6 rounded-3xl flex flex-col items-center group cursor-pointer" onClick={() => {
                          if (freePacks > 0 || coins >= 100) {
                            setOpenedCards([]);
                            setGameState('packOpening');
                          } else {
                            showAlert("🪙 Thiếu Xu!", "Bạn không đủ Xu để mở gói thẻ. Hãy đi nhận quà thăng cấp hoặc làm nhiệm vụ nhé!");
                          }
                        }}>
                        <PackageOpen size={48} className="text-fuchsia-400 mb-3 group-hover:scale-110 group-hover:-rotate-6 transition-transform duration-300 drop-shadow-[0_0_15px_rgba(232,121,249,0.6)]" />
                        <h3 className="text-lg sm:text-xl font-black italic uppercase tracking-wider mb-1 text-white">Mở Gói Thẻ</h3>
                        <p className="text-gray-300 text-center font-medium text-xs">
                          {freePacks > 0 ? `Miễn phí: ${freePacks} Gói 🎁` : '100 Xu • Nhận siêu sao.'}
                        </p>
                      </button>

                      <button className={`glass-menu-card p-6 rounded-3xl flex flex-col items-center group cursor-pointer ${collection.length === 0 ? 'opacity-50 grayscale' : ''}`} onClick={() => collection.length > 0 && setGameState('teamBuilder')}>
                        <Users size={48} className="text-blue-400 mb-3 group-hover:scale-110 transition-transform duration-300 drop-shadow-[0_0_15px_rgba(96,165,250,0.6)]" />
                        <h3 className="text-lg sm:text-xl font-black italic uppercase tracking-wider mb-1 text-white">Đội Hình</h3>
                        <p className="text-gray-300 text-center font-medium text-xs">Chọn 11 cầu thủ xuất sắc.</p>
                      </button>

                      <button className={`glass-menu-card p-6 rounded-3xl flex flex-col items-center group cursor-pointer ${squad.length < 11 ? 'opacity-50 grayscale' : ''}`} onClick={() => squad.length === 11 && setGameState('matchEngine')}>
                        <Swords size={48} className="text-amber-400 mb-3 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300 drop-shadow-[0_0_15px_rgba(251,191,36,0.6)]" />
                        <h3 className="text-lg sm:text-xl font-black italic uppercase tracking-wider mb-1 text-white">Đấu AI</h3>
                        <p className="text-gray-300 text-center font-medium text-xs">Đấu với Máy nhận phần thưởng.</p>
                      </button>

                      <button className={`glass-menu-card p-6 rounded-3xl flex flex-col items-center group cursor-pointer ${squad.length < 11 ? 'opacity-50 grayscale' : ''}`} onClick={() => {
                          if (squad.length === 11) {
                            setShowPvpJoinModal(true);
                          }
                        }}>
                        <div className="relative mb-3">
                          <Wifi size={48} className="text-red-400 group-hover:scale-110 transition-transform duration-300 drop-shadow-[0_0_15px_rgba(248,113,113,0.6)]" />
                          <span className="absolute -top-1.5 -right-1.5 bg-red-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full animate-pulse">HOT</span>
                        </div>
                        <h3 className="text-lg sm:text-xl font-black italic uppercase tracking-wider mb-1 text-white">PVP ONLINE</h3>
                        <p className="text-gray-300 text-center font-medium text-xs">Đấu với bạn bè qua mạng.</p>
                      </button>

                      <button className="glass-menu-card p-6 rounded-3xl flex flex-col items-center group cursor-pointer" onClick={() => {
                          playFx('click');
                          setGameState('leaderboard');
                        }}>
                        <Trophy size={48} className="text-yellow-400 mb-3 group-hover:scale-110 group-hover:rotate-12 transition-transform duration-300 drop-shadow-[0_0_15px_rgba(234,179,8,0.6)]" />
                        <h3 className="text-lg sm:text-xl font-black italic uppercase tracking-wider mb-1 text-white">BXH & Cấp Hạng</h3>
                        <p className="text-gray-300 text-center font-medium text-xs">BXH • Cấp hạng • Nhận quà.</p>
                      </button>
                    </div>

                    {/* Quests Quick Button */}
                    <div className="mt-8 mb-4">
                       <button className="glass-panel px-6 py-2.5 rounded-full text-sm font-bold uppercase tracking-widest text-emerald-400 hover:text-emerald-300 hover:bg-white/10 transition-colors flex items-center gap-2 cursor-pointer border border-emerald-500/20" onClick={() => setGameState('quests')}>
                          Nhiệm Vụ Hàng Ngày <ChevronRight size={16}/>
                       </button>
                    </div>
                  </div>

                  {/* RIGHT COLUMN: Real-time Global Chat & Online Panel */}
                  <div className="w-full lg:w-96 flex flex-col z-20 shrink-0">
                    {/* Inline LobbyChatPanel rendering */}
                    <div className="glass-panel w-full h-[450px] lg:h-[580px] rounded-3xl lg:rounded-r-none flex flex-col overflow-hidden border border-white/10 lg:border-r-0 shadow-[0_4px_30px_rgba(0,0,0,0.4)] backdrop-blur-md bg-slate-950/40 relative">
                      {/* Header Tabs */}
                      <div className="flex border-b border-white/10 bg-black/40">
                        <button 
                          className={`flex-1 py-3.5 text-[10px] sm:text-xs font-black uppercase tracking-widest flex items-center justify-center gap-1.5 border-b-2 transition-all ${
                            chatTab === 'chat' 
                              ? 'border-fuchsia-500 text-fuchsia-400 bg-white/5' 
                              : 'border-transparent text-gray-400 hover:text-white'
                          }`}
                          onClick={() => { playFx('click'); setChatTab('chat'); }}
                        >
                          <MessageSquare size={14} /> Sảnh Chat
                        </button>
                        <button 
                          className={`flex-1 py-3.5 text-[10px] sm:text-xs font-black uppercase tracking-widest flex items-center justify-center gap-1.5 border-b-2 transition-all relative ${
                            chatTab === 'private' 
                              ? 'border-violet-500 text-violet-400 bg-white/5' 
                              : 'border-transparent text-gray-400 hover:text-white'
                          }`}
                          onClick={() => { playFx('click'); setChatTab('private'); }}
                        >
                          <Mail size={14} /> Tin Nhắn
                          {Object.keys(unreadPartners).length > 0 && (
                            <span className="absolute top-2.5 right-4 flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                            </span>
                          )}
                        </button>
                        <button 
                          className={`flex-1 py-3.5 text-[10px] sm:text-xs font-black uppercase tracking-widest flex items-center justify-center gap-1.5 border-b-2 transition-all relative ${
                            chatTab === 'online' 
                              ? 'border-cyan-500 text-cyan-400 bg-white/5' 
                              : 'border-transparent text-gray-400 hover:text-white'
                          }`}
                          onClick={() => { playFx('click'); setChatTab('online'); }}
                        >
                          <Users size={14} /> Online
                          {onlineUsers.length > 0 && (
                            <span className="absolute top-2.5 right-6 flex h-2.5 w-2.5">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500"></span>
                            </span>
                          )}
                        </button>
                      </div>

                      {/* Tab Content Container */}
                      <div className="flex-1 overflow-hidden flex flex-col">
                        {/* TAB 1: Phòng Chat */}
                        {chatTab === 'chat' && (
                          <div className="flex-1 flex flex-col overflow-hidden p-3 sm:p-4 animate-fade-in">
                            <div 
                              id="lobby-chat-messages"
                              className="flex-1 overflow-y-auto flex flex-col gap-2 mb-3 pr-1 scroll-smooth hide-scrollbar"
                            >
                              {!isConnectedToFirebase && (
                                <div className="p-3 bg-red-950/40 border border-red-500/30 text-red-300 rounded-xl text-center text-xs leading-normal animate-pulse mb-2">
                                  ⚠️ Lỗi kết nối Máy chủ. Chế độ Ngoại tuyến đang hoạt động. Sử dụng mã phòng để đấu PVP.
                                </div>
                              )}
                              {chatMessages.length === 0 ? (
                                <div className="flex-1 flex flex-col items-center justify-center text-gray-500 text-xs text-center gap-2 py-8 italic">
                                   Hãy là người đầu tiên gửi tin nhắn! 💬
                                </div>
                              ) : (
                                chatMessages.map((msg) => {
                                  const isSystem = msg.sender === 'HỆ THỐNG 📣';
                                  const isMe = msg.sender === currentUser;
                                  return (
                                    <div 
                                      key={msg.id} 
                                      className={`flex flex-col max-w-[85%] ${
                                        isMe ? 'self-end items-end' : 'self-start items-start'
                                      }`}
                                    >
                                      <span 
                                        className={`text-[9px] font-black mb-0.5 px-1 flex items-center flex-wrap gap-1.5 ${
                                          isSystem ? 'text-amber-400' : isMe ? 'text-fuchsia-400' : 'text-blue-400'
                                        } ${(!isSystem && !isMe) ? 'cursor-pointer hover:underline hover:text-cyan-400' : ''}`}
                                        onClick={() => {
                                          if (!isSystem && !isMe) {
                                            playFx('click');
                                            setInspectingUser(msg.sender);
                                          }
                                        }}
                                      >
                                        {isSystem ? msg.sender : (
                                          <>
                                            <span>{msg.sender}</span>
                                            <span className="text-[8px] bg-white/10 text-gray-300 px-1.5 py-0.2 rounded border border-white/10">Lv.{msg.senderLevel || 1}</span>
                                            {(() => {
                                              const tier = getPlayerTier(msg.senderLevel || 1);
                                              return (
                                                <span className={`text-[8px] font-extrabold px-1.5 py-0.2 rounded border shrink-0 ${tier.color} ${tier.glow}`}>
                                                  {tier.icon} {tier.name.split(' ')[1] || tier.name}
                                                </span>
                                              );
                                            })()}
                                          </>
                                        )}
                                      </span>
                                      <div className={`p-2.5 rounded-2xl text-xs font-semibold leading-relaxed border ${
                                        isSystem 
                                          ? 'bg-amber-950/30 border-amber-500/30 text-amber-300' 
                                          : isMe 
                                          ? 'bg-fuchsia-950/20 border-fuchsia-500/25 text-fuchsia-100 rounded-tr-none' 
                                          : 'bg-slate-900/60 border-white/10 text-gray-100 rounded-tl-none'
                                      }`}>
                                        {msg.text}
                                      </div>
                                    </div>
                                  );
                                })
                              )}
                            </div>

                            {/* Chat Input form */}
                            <form 
                              onSubmit={(e) => {
                                e.preventDefault();
                                if (chatInput.trim()) {
                                  playFx('click');
                                  sendChatMessage(chatInput);
                                  setChatInput('');
                                }
                              }}
                              className="flex gap-2 bg-black/40 p-1.5 rounded-2xl border border-white/10"
                            >
                              <input 
                                type="text" 
                                value={chatInput}
                                onChange={(e) => setChatInput(e.target.value)}
                                placeholder="Nhập nội dung chat..."
                                className="flex-1 bg-transparent border-0 focus:outline-none focus:ring-0 text-xs px-3 text-white"
                                maxLength={100}
                              />
                              <button 
                                type="submit" 
                                className="w-8 h-8 rounded-xl bg-gradient-to-r from-fuchsia-600 to-indigo-600 hover:from-fuchsia-500 hover:to-indigo-500 text-white flex items-center justify-center transition-all cursor-pointer shrink-0"
                              >
                                <Send size={14} fill="currentColor" />
                              </button>
                            </form>
                          </div>
                        )}

                        {/* TAB 2: Tin Nhắn Riêng (DMs) */}
                        {chatTab === 'private' && (
                          <div className="flex-1 flex flex-col overflow-hidden p-3 sm:p-4 animate-fade-in">
                            {activePrivatePartner ? (
                              <div className="flex-1 flex flex-col overflow-hidden">
                                <div className="flex items-center justify-between border-b border-white/5 pb-2 mb-2">
                                  <button 
                                    className="flex items-center gap-0.5 text-[10px] font-bold text-violet-400 hover:text-violet-300 cursor-pointer"
                                    onClick={() => setActivePrivatePartner(null)}
                                  >
                                    <ChevronLeft size={14} /> Trở lại
                                  </button>
                                  <span className="font-extrabold text-[11px] text-white truncate max-w-[120px]">Chat: {activePrivatePartner}</span>
                                  <button 
                                    className="text-[9px] px-2 py-0.5 bg-cyan-900/30 text-cyan-400 border border-cyan-500/20 rounded hover:bg-cyan-900/50 font-bold cursor-pointer"
                                    onClick={() => setInspectingUser(activePrivatePartner)}
                                  >
                                    Hồ sơ
                                  </button>
                                </div>

                                <div className="flex-1 overflow-y-auto flex flex-col gap-2 mb-3 pr-1 scroll-smooth hide-scrollbar">
                                  {privateMessages.length === 0 ? (
                                    <div className="flex-1 flex flex-col items-center justify-center text-gray-500 text-xs text-center py-8 italic">
                                      Hãy gửi tin nhắn riêng cho {activePrivatePartner}! ✉️
                                    </div>
                                  ) : (
                                    privateMessages.map((msg) => {
                                      const isMe = msg.sender === currentUser;
                                      return (
                                        <div 
                                          key={msg.id} 
                                          className={`flex flex-col max-w-[85%] ${
                                            isMe ? 'self-end items-end' : 'self-start items-start'
                                          }`}
                                        >
                                          <div className={`p-2.5 rounded-2xl text-xs font-semibold leading-relaxed border ${
                                            isMe 
                                              ? 'bg-violet-950/20 border-violet-500/25 text-violet-100 rounded-tr-none' 
                                              : 'bg-slate-900/60 border-white/10 text-gray-100 rounded-tl-none'
                                          }`}>
                                            {msg.text}
                                          </div>
                                        </div>
                                      );
                                    })
                                  )}
                                </div>

                                <form 
                                  onSubmit={(e) => {
                                    e.preventDefault();
                                    sendPrivateMessage();
                                  }}
                                  className="flex gap-2 bg-black/40 p-1.5 rounded-2xl border border-white/10"
                                >
                                  <input 
                                    type="text" 
                                    className="flex-1 bg-transparent border-0 focus:outline-none focus:ring-0 text-xs px-3 text-white"
                                    placeholder={`Nhắn cho ${activePrivatePartner}...`}
                                    value={privateChatInput}
                                    onChange={(e) => setPrivateChatInput(e.target.value)}
                                  />
                                  <button 
                                    type="submit" 
                                    className="w-8 h-8 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white flex items-center justify-center transition-all cursor-pointer shrink-0"
                                  >
                                    <Send size={14} fill="currentColor" />
                                  </button>
                                </form>
                              </div>
                            ) : (
                              <div className="flex-1 overflow-y-auto flex flex-col gap-2 hide-scrollbar">
                                <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest border-b border-white/5 pb-2">
                                  Hộp thư riêng
                                </div>
                                {myPrivateChats.length === 0 ? (
                                  <div className="flex-1 flex flex-col items-center justify-center text-gray-500 text-xs text-center py-12 italic">
                                    Chưa có cuộc trò chuyện nào.
                                    <br />
                                    <span className="text-[9px] text-gray-600 mt-2">Mẹo: Click vào thành viên trong danh sách Online và chọn "Nhắn Tin"!</span>
                                  </div>
                                ) : (
                                  myPrivateChats.map((chat) => {
                                    const hasUnread = unreadPartners[chat.username] === true;
                                    const isPartnerOnline = onlineUsers.some(o => o.username === chat.username);

                                    return (
                                      <div 
                                        key={chat.username}
                                        className="p-3 bg-black/30 rounded-2xl border border-white/5 flex items-center justify-between hover:border-violet-500/30 hover:bg-black/50 transition-all cursor-pointer"
                                        onClick={() => {
                                          playFx('click');
                                          setActivePrivatePartner(chat.username);
                                        }}
                                      >
                                        <div className="flex items-center gap-2">
                                          <span className={`h-2.5 w-2.5 rounded-full shrink-0 ${isPartnerOnline ? 'bg-green-500' : 'bg-gray-600'}`}></span>
                                          <span className="font-extrabold text-xs text-white">{chat.username}</span>
                                          {hasUnread && (
                                            <span className="bg-red-500 text-white text-[8px] px-1.5 py-0.5 rounded-full font-black animate-pulse">MỚI</span>
                                          )}
                                        </div>
                                        <ChevronRight size={14} className="text-gray-500" />
                                      </div>
                                    );
                                  })
                                )}
                              </div>
                            )}
                          </div>
                        )}

                        {/* TAB 3: Danh sách Online */}
                        {chatTab === 'online' && (
                          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 hide-scrollbar animate-fade-in">
                            <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest border-b border-white/5 pb-2 flex justify-between items-center">
                              <span>HLV Trực Tuyến ({onlineUsers.length})</span>
                              <span className="flex items-center gap-1 text-[8px] bg-green-500/20 text-green-400 border border-green-500/30 px-2 py-0.5 rounded-full uppercase tracking-wider font-extrabold animate-pulse">Lobby Trực Tuyến</span>
                            </div>

                            {onlineUsers.length === 0 ? (
                              <div className="flex-1 flex flex-col items-center justify-center text-gray-500 text-xs text-center gap-3 py-12 italic leading-relaxed">
                                 ⏳ Đang chờ người chơi khác...
                                 <br />
                                 <span className="text-[10px] text-gray-600 font-medium">Mẹo: Mở game ở tab ẩn danh hoặc thiết bị khác để thử thách đấu chéo!</span>
                              </div>
                            ) : (
                              onlineUsers.map((user) => (
                                <div 
                                  key={user.username}
                                  className="p-3 bg-black/40 rounded-2xl border border-white/5 flex items-center justify-between gap-3 hover:border-cyan-500/30 hover:bg-black/60 transition-all group"
                                >
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center flex-wrap gap-2 mb-0.5">
                                      <span className="h-2 w-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)] shrink-0 animate-pulse"></span>
                                      <span 
                                        className="font-extrabold text-xs text-white truncate hover:underline hover:text-cyan-400 cursor-pointer"
                                        onClick={() => { playFx('click'); setInspectingUser(user.username); }}
                                      >
                                        {user.username}
                                      </span>
                                      <span className="text-[10px] bg-white/10 text-gray-300 px-1.5 py-0.5 rounded-full border border-white/10 font-bold shrink-0">Lv.{user.level || 1}</span>
                                      {(() => {
                                        const tier = getPlayerTier(user.level || 1);
                                        return (
                                          <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full border shrink-0 ${tier.color} ${tier.glow}`}>
                                            {tier.icon} {tier.name}
                                          </span>
                                        );
                                      })()}
                                      <span className="text-[9px] px-1.5 py-0.5 bg-cyan-900/30 text-cyan-400 border border-cyan-500/20 font-black rounded uppercase tracking-wider shrink-0">{user.rating} OVR</span>
                                    </div>
                                    <p className="text-[9px] text-gray-500 font-mono truncate">ID: {user.peerId}</p>
                                  </div>

                                  <button 
                                    className={`btn !py-2 !px-3 text-[10px] flex items-center gap-1 shadow-md transition-all uppercase font-black tracking-widest shrink-0 cursor-pointer ${
                                      squad.length < 11
                                        ? 'opacity-40 !bg-gray-700 cursor-not-allowed text-gray-400' 
                                        : 'bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white shadow-red-900/40 group-hover:scale-105 hover:shadow-lg'
                                    }`}
                                    disabled={squad.length < 11}
                                    onClick={() => {
                                      if (squad.length === 11) {
                                        sendChallengeInvite(user.username, user.peerId);
                                      }
                                    }}
                                    title={squad.length < 11 ? 'Đội hình cần đủ 11 người để thách đấu' : `Thách đấu ngay với ${user.username}`}
                                  >
                                    <Swords size={10} /> Đấu
                                  </button>
                                </div>
                              ))
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* PVP Join Modal */}
                  {showPvpJoinModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
                      <div className="glass-panel p-8 sm:p-10 rounded-[2rem] max-w-sm w-full flex flex-col items-center bg-gradient-to-t from-red-900/40 to-slate-900 shadow-[0_0_50px_rgba(0,0,0,0.8)] relative border border-white/10">
                        <button 
                          className="absolute top-4 right-4 text-gray-400 hover:text-white bg-black/40 hover:bg-black/80 p-2 rounded-full w-8 h-8 flex items-center justify-center transition-colors"
                          onClick={() => setShowPvpJoinModal(false)}
                        >
                          ✕
                        </button>
                        <Wifi size={48} className="text-red-400 mb-6 drop-shadow-[0_0_15px_rgba(248,113,113,0.8)]" />
                        <h2 className="text-2xl font-black text-white mb-2 uppercase tracking-widest text-center">Đấu PVP</h2>
                        <p className="text-sm text-gray-400 text-center mb-6">Tạo trận mới hoặc nhập mã để tham gia trận của bạn bè.</p>
                        
                        <input 
                          type="text"
                          className="w-full bg-black/50 border border-white/20 rounded-xl p-3 text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 mb-4 text-center font-mono text-lg"
                          placeholder="Nhập mã trận đấu..."
                          value={pvpJoinInput}
                          onChange={(e) => setPvpJoinInput(e.target.value)}
                        />
                        
                        <div className="flex flex-col gap-3 w-full">
                          <button 
                            className="btn !bg-red-600 hover:!bg-red-500 w-full"
                            onClick={() => {
                              if (pvpJoinInput.trim()) {
                                setActivePvpTarget(pvpJoinInput.trim());
                              } else {
                                setActivePvpTarget(null); // Tạo trận mới
                              }
                              setGameState('multiplayer');
                              setShowPvpJoinModal(false);
                            }}
                          >
                            {pvpJoinInput.trim() ? 'Tham Gia Trận' : 'Tạo Trận Mới'}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}

      {gameState === 'multiplayer' && (
        <MultiplayerEngine 
          squad={squad} 
          currentUser={currentUser} 
          initialJoinId={activePvpTarget}
          CardComponent={Card}
          onExit={handlePvpEnd}
          onWin={() => {
            setCoins(c => c + 100);
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

      {gameState === 'profile' && (
        <div className="w-full max-w-6xl mx-auto flex flex-col items-center mt-2 sm:mt-8 animate-fade-in px-1 sm:px-4">
          {/* Header */}
          <div className="flex justify-between items-center w-full mb-8">
            <button className="btn !bg-gray-700 hover:!bg-gray-600 transition-colors flex items-center gap-2" onClick={() => setGameState('lobby')}>
              ← Về Sảnh
            </button>
            <h2 className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 uppercase tracking-widest text-center">
              Hồ Sơ HLV & Cài Đặt ⚙️
            </h2>
            <div className="flex items-center gap-2 bg-black/40 px-4 py-2 rounded-full border border-yellow-500/30">
              <Coins className="text-yellow-400" size={16} />
              <span className="font-bold text-yellow-400 text-sm">{coins} Xu</span>
            </div>
          </div>

          {/* Three-Column Dashboard */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full items-stretch">
            
            {/* COLUMN 1 (4/12): HLV Info & Stats */}
            <div className="lg:col-span-4 flex flex-col gap-6">
              {/* Profile Card */}
              <div className="glass-panel rounded-3xl p-6 border border-white/10 flex flex-col items-center text-center shadow-2xl relative overflow-hidden bg-gradient-to-b from-indigo-950/20 to-slate-900/60">
                <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-full blur-[30px] pointer-events-none"></div>
                
                {/* Level Circle */}
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-cyan-400 via-indigo-500 to-purple-600 flex items-center justify-center border-2 border-white/20 shadow-lg mb-3 animate-pulse-subtle">
                  <span className="text-2xl font-black text-white">Lv.{level}</span>
                </div>
                
                <h3 className="text-2xl font-black text-white uppercase mb-1">{currentUser}</h3>
                
                <div className="flex items-center gap-2 mb-4">
                  {(() => {
                    const tier = getPlayerTier(level);
                    return (
                      <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-full border ${tier.color} ${tier.glow}`}>
                        {tier.icon} {tier.name}
                      </span>
                    );
                  })()}
                  <span className="text-xs px-2.5 py-0.5 bg-cyan-900/30 text-cyan-400 border border-cyan-500/20 font-black rounded-full uppercase tracking-wider">
                    {squad ? Math.round(squad.reduce((acc, card) => acc + Math.max(card.stats.attack, card.stats.defense, card.stats.control), 0) / 11) : 0} OVR
                  </span>
                </div>

                {/* XP Bar */}
                <div className="w-full bg-black/60 rounded-full h-3 border border-white/5 overflow-hidden mb-1 relative">
                  <div 
                    className="bg-gradient-to-r from-cyan-400 via-indigo-500 to-purple-500 h-full rounded-full transition-all duration-1000"
                    style={{ width: `${Math.min(100, (xp / (level * 100)) * 100)}%` }}
                  ></div>
                </div>
                <div className="text-[10px] text-gray-500 font-semibold mb-6">{xp} / {level * 100} XP</div>

                {/* Free packs & coins quick info */}
                <div className="w-full grid grid-cols-2 gap-3 border-t border-white/10 pt-4 mt-2">
                  <div className="bg-black/30 p-2.5 rounded-xl border border-white/5">
                    <div className="text-[9px] text-gray-500 font-bold uppercase tracking-wider mb-0.5">Tiền sở hữu</div>
                    <div className="text-sm font-black text-yellow-400 flex items-center justify-center gap-1">
                      <Coins size={12} /> {coins} Xu
                    </div>
                  </div>
                  <div className="bg-black/30 p-2.5 rounded-xl border border-white/5">
                    <div className="text-[9px] text-gray-500 font-bold uppercase tracking-wider mb-0.5">Gói quà tích lũy</div>
                    <div className="text-sm font-black text-fuchsia-400">
                      🎁 {freePacks} Gói
                    </div>
                  </div>
                </div>
              </div>

              {/* Battle Stats */}
              <div className="glass-panel rounded-3xl p-6 border border-white/10 shadow-2xl bg-gradient-to-b from-indigo-950/10 to-slate-900/40">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 border-b border-white/5 pb-2 text-center">Thống Kê Chiến Đấu</h4>
                <div className="grid grid-cols-2 gap-3 text-center">
                  <div className="bg-slate-900/60 border border-white/5 p-3 rounded-xl">
                    <div className="text-[9px] text-gray-400 font-semibold uppercase mb-1">Tổng Số Trận</div>
                    <div className="text-2xl font-black text-white">{stats?.played || 0}</div>
                  </div>
                  <div className="bg-green-950/20 border border-green-500/10 p-3 rounded-xl">
                    <div className="text-[9px] text-green-400 font-semibold uppercase mb-1">Chiến Thắng</div>
                    <div className="text-2xl font-black text-green-400">{stats?.wins || 0}</div>
                  </div>
                  <div className="bg-yellow-950/20 border border-yellow-500/10 p-3 rounded-xl">
                    <div className="text-[9px] text-yellow-400 font-semibold uppercase mb-1">Hòa Trận</div>
                    <div className="text-2xl font-black text-yellow-400">{stats?.draws || 0}</div>
                  </div>
                  <div className="bg-red-950/20 border border-red-500/10 p-3 rounded-xl">
                    <div className="text-[9px] text-red-400 font-semibold uppercase mb-1">Thất Bại</div>
                    <div className="text-2xl font-black text-red-400">{stats?.losses || 0}</div>
                  </div>
                </div>
                
                {/* Win rate indicator */}
                <div className="mt-4 bg-black/40 border border-white/5 rounded-xl p-3 flex justify-between items-center text-xs">
                  <span className="text-gray-400 font-semibold">Tỉ lệ thắng:</span>
                  <span className="font-black text-emerald-400">
                    {stats?.played > 0 ? Math.round((stats.wins / stats.played) * 100) : 0}%
                  </span>
                </div>
              </div>
            </div>

            {/* COLUMN 2 (4/12): 3D Pitch Lineup View */}
            <div className="lg:col-span-4 flex flex-col gap-6">
              <div className="glass-panel rounded-3xl p-6 border border-white/10 shadow-2xl flex flex-col items-center justify-between h-full bg-gradient-to-b from-slate-950/50 via-slate-900/40 to-slate-950/50">
                <div className="text-center w-full mb-3">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-white/5 pb-2">Đội Hình HLV 3D</h4>
                  <div className="text-[10px] text-cyan-400 font-black uppercase mt-1">Sân thi đấu 11 cầu thủ hiện tại</div>
                </div>
                
                {/* Miniature Pitch container */}
                <div className="w-full flex-1 min-h-[360px] flex items-center justify-center relative py-4">
                  <div className="pitch-3d-mini w-full max-w-[280px] aspect-[2/3] bg-gradient-to-b from-green-950/30 to-emerald-900/30 border border-emerald-500/30 rounded-2xl relative shadow-[inset_0_0_30px_rgba(16,185,129,0.2)] overflow-hidden">
                    {/* Pitch line markings */}
                    <div className="absolute top-1/2 left-0 w-full h-[1px] bg-emerald-500/20"></div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full border border-emerald-500/20"></div>
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-10 border border-t-0 border-emerald-500/20"></div>
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-20 h-10 border border-b-0 border-emerald-500/20"></div>
                    
                    {/* Render active squad players */}
                    {squad.map((player, idx) => {
                      const pos = PITCH_POSITIONS[idx] || { top: '50%', left: '50%' };
                      return (
                        <div 
                          key={player.id} 
                          className="absolute w-8 h-8 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group/mini"
                          style={{ top: pos.top, left: pos.left, zIndex: 10 }}
                        >
                          {/* Mini Card Dot */}
                          <div 
                            className={`w-3.5 h-3.5 rounded-full border border-white/80 shadow-md flex items-center justify-center text-[6px] font-black text-slate-900 ${
                              player.type === 'Golden Baller' 
                                ? 'bg-gradient-to-br from-yellow-400 to-amber-500' 
                                : player.type === 'Icon' 
                                ? 'bg-gradient-to-br from-fuchsia-400 to-purple-600' 
                                : 'bg-gradient-to-br from-blue-400 to-cyan-500'
                            }`}
                            title={player.name}
                          >
                            ⭐
                          </div>
                          
                          {/* Floating name tag */}
                          <div className="absolute top-4 bg-black/80 px-1 py-0.2 rounded text-[6px] font-bold text-white whitespace-nowrap opacity-0 group-hover/mini:opacity-100 transition-opacity border border-white/10 pointer-events-none">
                            {player.name.split(' ').pop()} ({Math.max(player.stats.attack, player.stats.defense, player.stats.control)})
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <button className="w-full btn !bg-indigo-600 hover:!bg-indigo-500 !py-2.5 text-xs font-black tracking-widest uppercase rounded-xl transition-all cursor-pointer shadow-lg shadow-indigo-950/30" onClick={() => setGameState('teamBuilder')}>
                  Chỉnh Sửa Đội Hình 🛠️
                </button>
              </div>
            </div>

            {/* COLUMN 3 (4/12): Account & Settings */}
            <div className="lg:col-span-4 flex flex-col gap-6">
              {/* Recovery Email Card */}
              <div className="glass-panel rounded-3xl p-6 border border-white/10 shadow-2xl bg-gradient-to-b from-indigo-950/10 to-slate-900/40">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 border-b border-white/5 pb-2 text-center">Cài Đặt Bảo Mật HLV</h4>
                
                <form onSubmit={handleUpdateEmail} className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Email Khôi Phục Tài Khoản</label>
                    <input 
                      type="email" 
                      className="bg-black/50 border border-white/15 px-4 py-2.5 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-colors w-full font-medium"
                      placeholder="Nhập email của bạn..."
                      value={profileEmailInput}
                      onChange={(e) => setProfileEmailInput(e.target.value)}
                    />
                  </div>
                  <button 
                    type="submit" 
                    className="btn !bg-cyan-600 hover:!bg-cyan-500 !py-2 text-xs font-black tracking-widest uppercase rounded-xl transition-all cursor-pointer shadow-md shadow-cyan-900/20"
                  >
                    Lưu Email 📧
                  </button>
                </form>
              </div>

              {/* Change Password Card */}
              <div className="glass-panel rounded-3xl p-6 border border-white/10 shadow-2xl bg-gradient-to-b from-indigo-950/10 to-slate-900/40 flex-1">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 border-b border-white/5 pb-2 text-center">Đổi Mật Khẩu HLV</h4>
                
                <form onSubmit={handleUpdatePassword} className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Mật Khẩu Hiện Tại</label>
                    <input 
                      type="password" 
                      className="bg-black/50 border border-white/15 px-4 py-2.5 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500 transition-colors w-full"
                      value={profileOldPassword}
                      onChange={(e) => setProfileOldPassword(e.target.value)}
                      placeholder="••••••••"
                    />
                  </div>
                  
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Mật Khẩu Mới</label>
                    <input 
                      type="password" 
                      className="bg-black/50 border border-white/15 px-4 py-2.5 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500 transition-colors w-full"
                      value={profileNewPassword}
                      onChange={(e) => setProfileNewPassword(e.target.value)}
                      placeholder="••••••••"
                    />
                  </div>
                  
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Xác Nhận Mật Khẩu Mới</label>
                    <input 
                      type="password" 
                      className="bg-black/50 border border-white/15 px-4 py-2.5 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500 transition-colors w-full"
                      value={profileConfirmPassword}
                      onChange={(e) => setProfileConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                    />
                  </div>
                  
                  <button 
                    type="submit" 
                    className="btn !bg-purple-600 hover:!bg-purple-500 !py-2.5 text-xs font-black tracking-widest uppercase rounded-xl transition-all cursor-pointer shadow-md shadow-purple-900/20 mt-2"
                  >
                    Đổi Mật Khẩu 🔒
                  </button>
                </form>
              </div>

              {/* Referral Panel */}
              <div className="glass-panel rounded-3xl p-6 border border-white/10 shadow-2xl bg-gradient-to-b from-indigo-950/10 to-slate-900/40 mt-6">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 border-b border-white/5 pb-2 text-center flex items-center justify-center gap-1.5">
                  🎁 GIỚI THIỆU BẠN BÈ (REFERRAL)
                </h4>
                
                {/* Your Referral Code */}
                <div className="bg-black/50 border border-amber-500/30 rounded-2xl p-3 text-center mb-4 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-amber-500/5 rounded-full blur-xl"></div>
                  <div className="text-[9px] text-amber-400 font-bold uppercase tracking-widest mb-1">Mã Giới Thiệu Của Bạn</div>
                  <div 
                    className="text-lg font-black text-white cursor-pointer select-all tracking-wider hover:text-amber-300 transition-colors"
                    onClick={() => {
                      navigator.clipboard.writeText(currentUser);
                      showAlert("📋 Đã Sao Chép!", "Đã copy mã giới thiệu của bạn! Hãy gửi cho bạn bè để cùng nhận quà nhé!");
                    }}
                    title="Click để copy mã nhanh"
                  >
                    {currentUser} 📋
                  </div>
                </div>

                {/* Submit Friend's Referral Code */}
                {!referredBy ? (
                  <div className="bg-slate-950/40 border border-white/5 p-3 rounded-2xl mb-4 text-left">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Nhập Mã Của Bạn Bè</label>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        placeholder="Nhập tên HLV giới thiệu..."
                        className="bg-black/50 border border-white/15 px-3 py-1.5 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 flex-1 font-semibold"
                        value={refCodeInput}
                        onChange={(e) => setRefCodeInput(e.target.value)}
                      />
                      <button 
                        type="button"
                        className="btn !bg-cyan-600 hover:!bg-cyan-500 !py-1.5 !px-4 text-xs font-black uppercase rounded-xl transition-all cursor-pointer"
                        onClick={() => {
                          if (refCodeInput.trim()) {
                            submitReferralCode(refCodeInput);
                            setRefCodeInput('');
                          }
                        }}
                      >
                        Nhập
                      </button>
                    </div>
                    <div className="text-[8px] text-gray-500 font-semibold mt-1">Nhận ngay +50 Xu (Chỉ dành cho tài khoản mới dưới Level 5)</div>
                  </div>
                ) : (
                  <div className="bg-emerald-950/20 border border-emerald-500/20 p-3 rounded-2xl mb-4 text-center">
                    <span className="text-[10px] font-bold text-emerald-400">
                      ✓ Đã nhập mã giới thiệu từ HLV: <span className="underline font-black">{referredBy}</span>
                    </span>
                  </div>
                )}

                {/* Invite New Friend Input */}
                <div className="bg-slate-950/40 border border-white/5 p-3 rounded-2xl mb-4 text-left">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Mời Bạn Mới Thi Đấu</label>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="Nhập tên HLV bạn muốn mời..."
                      className="bg-black/50 border border-white/15 px-3 py-1.5 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 flex-1 font-semibold"
                      value={inviteInput}
                      onChange={(e) => setInviteInput(e.target.value)}
                    />
                    <button 
                      type="button"
                      className="btn !bg-purple-600 hover:!bg-purple-500 !py-1.5 !px-4 text-xs font-black uppercase rounded-xl transition-all cursor-pointer"
                      onClick={() => {
                        if (inviteInput.trim()) {
                          addReferralFriend(inviteInput);
                        }
                      }}
                    >
                      Thêm
                    </button>
                  </div>
                </div>

                {/* Friend Invitation List */}
                <div className="w-full">
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 text-left">HLV Bạn Đã Mời ({referrals.length})</div>
                  <div className="flex flex-col gap-2 max-h-[140px] overflow-y-auto pr-1">
                    {referrals.map(ref => {
                      const canClaim = ref.level >= 5 && !ref.claimed;
                      return (
                        <div key={ref.username} className="flex justify-between items-center bg-black/40 border border-white/5 p-2 rounded-xl text-xs">
                          <div className="text-left">
                            <div className="font-extrabold text-white">{ref.username}</div>
                            <div className="text-[9px] text-gray-500 font-bold uppercase tracking-wider">
                              Level {ref.level} {ref.level >= 5 ? '🎯 Hoàn Thành' : '⏳ Cần cày Cấp 5'}
                            </div>
                          </div>
                          {ref.claimed ? (
                            <span className="text-[9px] bg-white/5 text-gray-500 px-2 py-1 rounded-full font-black border border-white/5">ĐÃ NHẬN 🎁</span>
                          ) : canClaim ? (
                            <button 
                              type="button"
                              className="btn !bg-yellow-500 text-black font-black text-[9px] px-2.5 py-1 rounded-full animate-bounce"
                              onClick={() => claimReferralReward(ref.username)}
                            >
                              Nhận Quà 🎁
                            </button>
                          ) : (
                            <span className="text-[9px] text-gray-400 font-black">Chờ Cấp 5</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
            
          </div>

          {/* Active Quests Showcase (Bottom full-width row) */}
          <div className="w-full mt-8 glass-panel rounded-[2rem] p-6 border border-white/10 shadow-2xl bg-gradient-to-r from-slate-900/50 to-indigo-950/10 animate-fade-in">
            <div className="flex justify-between items-center mb-6 border-b border-white/5 pb-3">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Tiến Độ Nhiệm Vụ Hoạt Động</h4>
              <button className="text-[10px] text-cyan-400 hover:underline uppercase font-bold tracking-widest cursor-pointer" onClick={() => setGameState('quests')}>
                Tất cả Nhiệm Vụ ➔
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {quests.map(q => (
                <div key={q.id} className="p-4 bg-black/40 rounded-2xl border border-white/5 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <h5 className="font-extrabold text-xs text-white truncate mb-1">{q.title}</h5>
                    <div className="text-[9px] text-gray-500 font-semibold mb-2">Tiến độ: {q.progress} / {q.target}</div>
                    <div className="w-32 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                      <div className="h-full bg-cyan-500" style={{ width: `${Math.min(100, (q.progress/q.target)*100)}%` }}></div>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-yellow-400 text-[10px] font-black mb-1">+{q.reward} Xu</div>
                    {q.isClaimed ? (
                      <span className="text-[9px] text-gray-500 font-extrabold uppercase">Đã Nhận ✓</span>
                    ) : q.isCompleted ? (
                      <span className="text-[9px] text-green-400 font-black uppercase animate-pulse">Xong 🎁</span>
                    ) : (
                      <span className="text-[9px] text-gray-500 font-bold uppercase">Đang đá</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* HLV Achievement Milestones Tracker */}
          <div className="w-full mt-8 glass-panel rounded-[2rem] p-6 border border-white/10 shadow-2xl bg-gradient-to-br from-slate-900/60 via-indigo-950/20 to-slate-900/60 animate-fade-in">
            <div className="flex justify-between items-center mb-2 border-b border-white/5 pb-3">
              <div>
                <h4 className="text-xs font-bold text-gray-300 uppercase tracking-widest">🏆 Mốc Thành Tích HLV — Thẻ Đặc Biệt</h4>
                <p className="text-[10px] text-gray-500 mt-1">Chơi nhiều, thắng nhiều, hoàn thành nhiệm vụ để nhận thẻ ưu tiên hiếm!</p>
              </div>
              <div className="text-right">
                <div className="text-[10px] font-black text-fuchsia-400">{rewardedMilestones.length} / {ACTIVITY_MILESTONES.length} đã nhận</div>
                <div className="w-28 h-1.5 bg-black/60 rounded-full overflow-hidden mt-1">
                  <div className="h-full bg-gradient-to-r from-fuchsia-500 to-indigo-500 transition-all duration-700"
                    style={{ width: `${Math.round((rewardedMilestones.length / ACTIVITY_MILESTONES.length) * 100)}%` }}></div>
                </div>
              </div>
            </div>

            {/* Bonus explanation */}
            <div className="flex flex-wrap gap-2 mb-6 mt-4">
              {[
                { rarity: 'Bronze Edition',   bonus: '+1',  icon: '🥉', color: 'border-amber-600/40 text-amber-500' },
                { rarity: 'Silver Edition',    bonus: '+2',  icon: '🥈', color: 'border-slate-400/40 text-slate-300' },
                { rarity: 'Gold Edition',      bonus: '+4',  icon: '🥇', color: 'border-yellow-400/40 text-yellow-400' },
                { rarity: 'Platinum Edition',  bonus: '+6',  icon: '💎', color: 'border-cyan-400/40 text-cyan-400' },
                { rarity: 'Super Limited',     bonus: '+8',  icon: '👑', color: 'border-rose-400/40 text-rose-400 animate-pulse' },
              ].map(item => (
                <div key={item.rarity} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border bg-black/30 ${item.color} text-[10px] font-black`}>
                  <span>{item.icon}</span>
                  <span>{item.rarity}</span>
                  <span className="ml-1 bg-white/10 px-1.5 py-0.5 rounded-full">{item.bonus} điểm ưu tiên</span>
                </div>
              ))}
            </div>

            {/* Milestones Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {ACTIVITY_MILESTONES.map(m => {
                const isDone = rewardedMilestones.includes(m.id);
                const currentVal = m.type === 'played' ? (stats?.played || 0)
                  : m.type === 'wins' ? (stats?.wins || 0)
                  : quests.filter(q => q.isClaimed).length;
                const progress = Math.min(currentVal, m.value);
                const pct = Math.round((progress / m.value) * 100);
                const rarityInfo = RARITY_LABEL[m.rarity] || { label: m.rarity, color: 'text-gray-400', bg: 'bg-gray-900/40 border-gray-500/30' };
                const cardBonus = getCardTypeBonus(m.rarity);

                return (
                  <div key={m.id} className={`relative rounded-2xl p-4 border transition-all duration-300 overflow-hidden ${
                    isDone
                      ? 'bg-gradient-to-br from-emerald-950/40 to-green-900/20 border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.15)]'
                      : 'bg-black/40 border-white/5 hover:border-white/10'
                  }`}>
                    {isDone && (
                      <div className="absolute top-2 right-2 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center text-white text-[10px] font-black">✓</div>
                    )}
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">{m.icon}</span>
                      <div>
                        <div className={`text-[9px] font-black uppercase tracking-wider ${rarityInfo.color}`}>{rarityInfo.label}</div>
                        <div className="text-[8px] text-gray-500 font-semibold">+{cardBonus} điểm đấu</div>
                      </div>
                    </div>
                    <p className="text-[10px] text-white/80 font-semibold mb-2 leading-tight">{m.desc}</p>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[9px] text-gray-500">{m.type === 'played' ? 'Trận đã đá' : m.type === 'wins' ? 'Trận thắng' : 'Nhiệm vụ'}</span>
                      <span className={`text-[9px] font-black ${isDone ? 'text-emerald-400' : 'text-white/60'}`}>{progress} / {m.value}</span>
                    </div>
                    <div className="w-full h-1.5 bg-black/60 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${
                          isDone ? 'bg-gradient-to-r from-emerald-400 to-green-500'
                            : m.rarity === 'Super Limited' ? 'bg-gradient-to-r from-rose-500 to-fuchsia-500'
                            : m.rarity === 'Platinum Edition' ? 'bg-gradient-to-r from-cyan-400 to-sky-500'
                            : m.rarity === 'Gold Edition' || m.rarity === 'Golden Baller' ? 'bg-gradient-to-r from-yellow-400 to-amber-500'
                            : m.rarity === 'Silver Edition' ? 'bg-gradient-to-r from-slate-300 to-slate-400'
                            : 'bg-gradient-to-r from-amber-600 to-amber-700'
                        }`}
                        style={{ width: `${pct}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {gameState === 'leaderboard' && (
        <div className="w-full max-w-4xl mx-auto flex flex-col items-center mt-2 sm:mt-8 animate-fade-in px-1 sm:px-4">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-center w-full gap-4 mb-8">
            <button className="btn !bg-gray-700 hover:!bg-gray-600 transition-colors flex items-center gap-2" onClick={() => setGameState('lobby')}>
              ← Về Sảnh
            </button>
            <h2 className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 uppercase tracking-widest text-center">
              BXH & Cấp Hạng 🏆
            </h2>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 bg-black/40 px-4 py-2 rounded-full border border-yellow-500/30">
                <Coins className="text-yellow-400" size={16} />
                <span className="font-bold text-yellow-400 text-sm">{coins} Xu</span>
              </div>
              {freePacks > 0 && (
                <div className="flex items-center gap-1.5 bg-fuchsia-950/20 px-4 py-2 rounded-full border border-fuchsia-500/30 animate-pulse">
                  <span className="text-sm">🎁</span>
                  <span className="font-bold text-fuchsia-400 text-sm">{freePacks} Gói</span>
                </div>
              )}
            </div>
          </div>

          {/* Sub Tab Buttons */}
          <div className="flex border border-white/10 rounded-2xl overflow-hidden bg-black/40 mb-8 w-full max-w-xl">
            <button 
              className={`flex-1 py-3 text-xs sm:text-sm font-black uppercase tracking-wider flex items-center justify-center gap-2 border-b-2 transition-all ${
                leaderboardTab === 'leaderboard' 
                  ? 'border-yellow-500 text-yellow-400 bg-white/5 font-extrabold' 
                  : 'border-transparent text-gray-400 hover:text-white hover:bg-white/5'
              }`}
              onClick={() => { playFx('click'); setLeaderboardTab('leaderboard'); }}
            >
              🏆 Bảng Xếp Hạng
            </button>
            <button 
              className={`flex-1 py-3 text-xs sm:text-sm font-black uppercase tracking-wider flex items-center justify-center gap-2 border-b-2 transition-all ${
                leaderboardTab === 'tiers' 
                  ? 'border-cyan-500 text-cyan-400 bg-white/5 font-extrabold' 
                  : 'border-transparent text-gray-400 hover:text-white hover:bg-white/5'
              }`}
              onClick={() => { playFx('click'); setLeaderboardTab('tiers'); }}
            >
              🛡️ Cấp Hạng
            </button>
            <button 
              className={`flex-1 py-3 text-xs sm:text-sm font-black uppercase tracking-wider flex items-center justify-center gap-2 border-b-2 transition-all ${
                leaderboardTab === 'milestones' 
                  ? 'border-fuchsia-500 text-fuchsia-400 bg-white/5 font-extrabold' 
                  : 'border-transparent text-gray-400 hover:text-white hover:bg-white/5'
              }`}
              onClick={() => { playFx('click'); setLeaderboardTab('milestones'); }}
            >
              🎁 Quà Cấp Độ
            </button>
          </div>

          {/* TAB 1: Global Leaderboard */}
          {leaderboardTab === 'leaderboard' && (
            <div className="w-full glass-panel rounded-3xl overflow-hidden border border-white/10 shadow-2xl animate-fade-in p-6">
              <h3 className="text-xl font-black italic uppercase tracking-wider text-center text-white mb-6">HLV Xuất Sắc Nhất Lục Địa 🌍</h3>
              
              {loadingLeaderboard ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                  <div className="w-12 h-12 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
                  <div className="text-yellow-400 font-extrabold tracking-widest text-xs uppercase animate-pulse">Đang tải bảng xếp hạng...</div>
                </div>
              ) : leaderboardData.length === 0 ? (
                <div className="text-center py-12 text-gray-500 italic">Chưa có dữ liệu người chơi.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-white/10 text-gray-400 text-[9px] sm:text-xs font-black uppercase tracking-widest pb-3">
                        <th className="py-2 px-1 sm:py-3 sm:px-4 text-center">Hạng</th>
                        <th className="py-2 px-1 sm:py-3 sm:px-4">HLV</th>
                        <th className="py-2 px-1 sm:py-3 sm:px-4 text-center">Hạng Cấp</th>
                        <th className="py-2 px-1 sm:py-3 sm:px-4 text-center">Cấp Độ</th>
                        <th className="py-2 px-1 sm:py-3 sm:px-4 text-center">Đội</th>
                        <th className="py-2 px-1 sm:py-3 sm:px-4 text-center">T/H/B</th>
                        <th className="py-2 px-1 sm:py-3 sm:px-4 text-center">Thẻ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-[10px] sm:text-sm font-semibold">
                      {leaderboardData.map((user, index) => {
                        const isMe = user.username === currentUser;
                        const rank = index + 1;
                        const tier = getPlayerTier(user.level);
                        const isTop3 = rank <= 3;
                        
                        return (
                          <tr 
                            key={user.username} 
                            className={`transition-colors border-b border-white/5 ${
                              isMe 
                                ? 'bg-fuchsia-950/20 hover:bg-fuchsia-950/30 border-l-2 sm:border-l-4 border-l-fuchsia-500' 
                                : 'hover:bg-white/5'
                            }`}
                          >
                            <td className="py-1.5 px-1 sm:py-4 sm:px-4 text-center font-black">
                              {rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : rank}
                            </td>
                            <td className="py-1.5 px-1 sm:py-4 sm:px-4">
                              <span 
                                className={`font-extrabold hover:underline hover:text-cyan-400 cursor-pointer ${
                                  rank === 1 ? 'text-yellow-400 drop-shadow-[0_0_8px_rgba(234,179,8,0.5)]' : isMe ? 'text-fuchsia-400' : 'text-white'
                                }`}
                                onClick={() => { playFx('click'); setInspectingUser(user.username); }}
                              >
                                {user.username} {isMe && ' (BẠN)'}
                              </span>
                            </td>
                            <td className="py-1.5 px-1 sm:py-4 sm:px-4 text-center">
                              <span className={`text-[8px] sm:text-[9px] font-black uppercase px-1 sm:px-2 py-0.5 rounded-full border ${tier.color} ${tier.glow}`}>
                                <span className="hidden sm:inline">{tier.icon} </span>{tier.name}
                              </span>
                            </td>
                            <td className="py-1.5 px-1 sm:py-4 sm:px-4 text-center font-black text-cyan-400">
                              {user.level} <span className="text-[8px] sm:text-[10px] text-gray-500 font-medium block sm:inline">({user.xp} XP)</span>
                            </td>
                            <td className="py-1.5 px-1 sm:py-4 sm:px-4 text-center font-black text-emerald-400">{user.ovr}</td>
                            <td className="py-1.5 px-1 sm:py-4 sm:px-4 text-center text-gray-300 whitespace-nowrap">
                              <span className="text-green-400">{user.wins}</span>-<span className="text-yellow-400">{user.draws}</span>-<span className="text-red-400">{user.losses}</span>
                            </td>
                            <td className="py-1.5 px-1 sm:py-4 sm:px-4 text-center font-black text-purple-400 whitespace-nowrap">{user.cardCount}/{playersData.length}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Rank Tiers System */}
          {leaderboardTab === 'tiers' && (
            <div className="w-full glass-panel rounded-3xl border border-white/10 shadow-2xl animate-fade-in p-6">
              <div className="flex flex-col items-center mb-8 text-center">
                <h3 className="text-xl font-black italic uppercase tracking-wider text-white mb-2">Hệ Thống Phân Cấp HLV 🛡️</h3>
                <p className="text-gray-400 text-xs sm:text-sm max-w-lg">Cấp Hạng phản ánh thực lực, trình độ và thời gian cống hiến của mỗi HLV. Cày cấp để mở khóa các Cấp Hạng phát sáng rực rỡ và nhận nhiều quà tặng thăng cấp hơn!</p>
              </div>

              {/* Current user's tier showcase */}
              <div className="bg-slate-950/60 rounded-3xl border border-white/10 p-6 flex flex-col md:flex-row items-center justify-between gap-6 mb-8 w-full max-w-2xl mx-auto shadow-inner relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-[40px] pointer-events-none"></div>
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500/30 to-purple-600/30 flex items-center justify-center border-2 border-white/20 shadow-lg relative">
                    <span className="text-4xl">{getPlayerTier(level).icon}</span>
                  </div>
                  <div>
                    <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-0.5">HLV Hiện Tại</div>
                    <h4 className="text-2xl font-black text-white leading-tight mb-1">{currentUser}</h4>
                    <div className="flex items-center gap-2">
                      <span className="text-xs bg-white/10 text-gray-300 px-2 py-0.5 rounded border border-white/5 font-extrabold">Cấp {level}</span>
                      <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border ${getPlayerTier(level).color} ${getPlayerTier(level).glow}`}>
                        {getPlayerTier(level).icon} {getPlayerTier(level).name}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="text-center md:text-right">
                  {level < 31 ? (
                    (() => {
                      const currentTier = getPlayerTier(level);
                      const currentTierIdx = TIERS.findIndex(t => t.name === currentTier.name);
                      const nextTier = TIERS[currentTierIdx + 1];
                      if (nextTier) {
                        const lvlNeeded = nextTier.minLevel - level;
                        return (
                          <>
                            <div className="text-sm font-bold text-gray-300">Cần thăng thêm <span className="text-cyan-400 font-black">{lvlNeeded} Cấp</span></div>
                            <div className="text-[10px] text-gray-500 font-medium mt-1">Để đột phá lên Cấp Hạng <span className="font-extrabold text-white">{nextTier.icon} {nextTier.name}</span></div>
                          </>
                        );
                      }
                      return null;
                    })()
                  ) : (
                    <div className="text-sm font-black text-rose-500 animate-pulse flex items-center gap-1.5 justify-center md:justify-end">
                      🔥 BẠN ĐÃ ĐẠT CẤP HẠNG TỐI CAO!
                    </div>
                  )}
                </div>
              </div>

              {/* Tiers List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {TIERS.map((tier) => {
                  const isCurrent = level >= tier.minLevel && level <= tier.maxLevel;
                  return (
                    <div 
                      key={tier.name}
                      className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                        isCurrent 
                          ? 'bg-slate-900 border-white/20 shadow-xl relative overflow-hidden ring-2 ring-cyan-500/40' 
                          : 'bg-black/40 border-white/5 opacity-70 hover:opacity-100 hover:border-white/10'
                      }`}
                    >
                      {isCurrent && (
                        <span className="absolute -top-1 -right-1 bg-cyan-600 text-white text-[8px] font-black px-2 py-0.5 rounded-bl-lg uppercase tracking-wider animate-pulse">
                          CỦA BẠN
                        </span>
                      )}
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-3xl">{tier.icon}</span>
                          <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest font-mono">
                            {tier.maxLevel === 999 ? `Cấp ${tier.minLevel}+` : `Cấp ${tier.minLevel} - ${tier.maxLevel}`}
                          </span>
                        </div>
                        <h4 className={`text-lg font-black uppercase italic ${tier.color.split(' ')[0]} mb-1`}>{tier.name}</h4>
                        <p className="text-[11px] text-gray-400 font-medium leading-normal">
                          {tier.name === 'Hạng Đồng' && 'Cấp bậc sơ khai của các HLV tập sự.'}
                          {tier.name === 'Hạng Bạc' && 'Bắt đầu có kinh nghiệm và sở hữu một vài siêu sao.'}
                          {tier.name === 'Hạng Vàng' && 'HLV cứng tay, đội hình có chiều sâu ổn định.'}
                          {tier.name === 'Bạch Kim' && 'Cao thủ tầm cỡ, sở hữu nhiều thẻ hiếm nâng cấp.'}
                          {tier.name === 'Kim Cương' && 'Đẳng cấp thượng lưu, thách thức mọi danh hiệu.'}
                          {tier.name === 'Cao Thủ' && 'Thần thoại đương đại, nỗi khiếp sợ của mọi đối thủ.'}
                          {tier.name === 'Thách Đấu' && 'HLV vĩ đại nhất, thống trị toàn bộ lục địa game!'}
                        </p>
                      </div>
                      
                      <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
                        <span className="text-[9px] text-gray-500 font-bold uppercase">Mức độ lấp lánh</span>
                        <span className={`h-2 w-2 rounded-full ${isCurrent ? 'bg-green-500' : 'bg-gray-700'}`}></span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: Milestone Rewards */}
          {leaderboardTab === 'milestones' && (
            <div className="w-full glass-panel rounded-3xl border border-white/10 shadow-2xl animate-fade-in p-6">
              <div className="flex flex-col items-center mb-8 text-center">
                <h3 className="text-xl font-black italic uppercase tracking-wider text-white mb-2">Quà Tặng Cột Mốc Cấp Độ 🎁</h3>
                <p className="text-gray-400 text-xs sm:text-sm max-w-lg">Nhận các phần quà vô cùng giá trị bao gồm Xu và Gói Thẻ Miễn Phí khi HLV của bạn thăng tiến đạt các cột mốc cấp độ dưới đây!</p>
              </div>

              {/* Progress bar info */}
              <div className="bg-slate-950/40 rounded-2xl border border-white/5 p-5 mb-8 w-full max-w-md mx-auto text-center">
                <div className="text-xs text-gray-400 font-bold uppercase mb-2">Tiến Trình Cấp Độ Của Bạn</div>
                <div className="text-2xl font-black text-white mb-3">Cấp HLV: {level}</div>
                <div className="w-full bg-black/60 rounded-full h-3 border border-white/5 overflow-hidden relative mb-1">
                  <div 
                    className="bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 h-full rounded-full transition-all duration-1000"
                    style={{ width: `${Math.min(100, (xp / (level * 100)) * 100)}%` }}
                  ></div>
                </div>
                <div className="text-[10px] text-gray-500 font-semibold">{xp} / {level * 100} XP</div>
              </div>

              {/* Milestone list */}
              <div className="flex flex-col gap-4 w-full max-w-2xl mx-auto">
                {LEVEL_MILESTONES.map((m) => {
                  const hasReached = level >= m.level;
                  const isClaimed = (claimedLevelRewards || []).includes(m.level);
                  
                  return (
                    <div 
                      key={m.level}
                      className={`p-5 rounded-2xl border flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 transition-all ${
                        isClaimed 
                          ? 'bg-black/50 border-gray-700 opacity-60' 
                          : hasReached 
                          ? 'bg-gradient-to-r from-yellow-950/20 to-slate-900 border-yellow-500/40 shadow-xl shadow-yellow-950/10' 
                          : 'bg-black/40 border-white/5'
                      }`}
                    >
                      {/* Left side: milestone info */}
                      <div className="flex items-center gap-4">
                        <div className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center font-black text-lg border shadow-lg shrink-0 ${
                          isClaimed 
                            ? 'bg-gray-800 text-gray-500 border-gray-700' 
                            : hasReached 
                            ? 'bg-gradient-to-br from-yellow-400 to-amber-500 text-black border-yellow-300 shadow-yellow-900/30' 
                            : 'bg-slate-900 text-gray-300 border-white/10'
                        }`}>
                          <span className="text-[9px] uppercase tracking-wider font-bold mb-0.5 leading-none">Cấp</span>
                          <span className="leading-none">{m.level}</span>
                        </div>
                        <div>
                          <h4 className="text-sm sm:text-base font-extrabold text-white mb-0.5">{m.desc}</h4>
                          <div className="flex items-center gap-3">
                            {m.coins > 0 && (
                              <span className="text-xs text-yellow-400 font-bold flex items-center gap-1">
                                <Coins size={12} /> +{m.coins} Xu
                              </span>
                            )}
                            {m.packs > 0 && (
                              <span className="text-xs text-fuchsia-400 font-bold flex items-center gap-1">
                                🎁 +{m.packs} Gói Thẻ Miễn Phí
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right side: action buttons */}
                      <div className="flex items-center justify-end">
                        {isClaimed ? (
                          <button 
                            className="btn !bg-gray-700 text-gray-500 !py-2 !px-5 rounded-xl font-bold uppercase tracking-wider text-xs cursor-not-allowed"
                            disabled
                          >
                            Đã Nhận ✓
                          </button>
                        ) : hasReached ? (
                          <button 
                            className="btn !bg-gradient-to-r !from-green-500 !to-emerald-500 hover:!from-green-600 hover:!to-emerald-600 text-white !py-2.5 !px-6 rounded-xl font-black uppercase tracking-widest text-xs animate-bounce-subtle cursor-pointer shadow-lg shadow-green-900/30 transition-all hover:scale-105 active:scale-95"
                            onClick={() => claimMilestone(m)}
                          >
                            Nhận Quà 🎁
                          </button>
                        ) : (
                          <button 
                            className="btn !bg-gray-800 text-gray-600 !py-2 !px-5 rounded-xl font-bold uppercase tracking-wider text-xs cursor-not-allowed"
                            disabled
                          >
                            Chưa Đạt 🔒
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {gameState === 'packOpening' && (
        <div className="min-h-screen bg-gradient-to-b from-slate-950 via-purple-950/20 to-slate-950 p-4 sm:p-8 pt-20 overflow-y-auto">
          <div className="max-w-4xl mx-auto">

            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <button
                className="text-gray-400 hover:text-white bg-black/40 hover:bg-black/80 px-3 py-1.5 rounded-full text-xs font-bold border border-white/10 transition-all"
                onClick={() => { setOpenedCards([]); setRevealingCards([]); setGameState('lobby'); }}
              >
                ← Về Sảnh
              </button>
              <h2 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-cyan-400 uppercase tracking-widest">Mở Gói Thẻ</h2>
              <div className="flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded-full border border-yellow-500/20">
                <span className="text-yellow-400 text-sm">💰</span>
                <span className="text-white font-black text-sm">{coins} Xu</span>
              </div>
            </div>

            {/* Pity bar */}
            <div className="mb-6 p-3 bg-black/40 rounded-2xl border border-fuchsia-500/20">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-bold text-fuchsia-300 uppercase tracking-wider">✎ Bảo đảm Siêu Sao</span>
                <span className="text-[10px] font-black text-white">{pityCounter}/10</span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${(pityCounter / 10) * 100}%`,
                    background: pityCounter >= 8 ? 'linear-gradient(90deg,#f43f5e,#fbbf24)' : 'linear-gradient(90deg,#a855f7,#6366f1)'
                  }}
                />
              </div>
              <p className="text-[9px] text-gray-500 mt-1">
                {pityCounter >= 9 ? '🔥 Gói tiếp theo BẢO ĐẢM ra Siêu Sao!' : `Còn ${10 - pityCounter} gói nữa để bảo đảm Siêu Sao`}
              </p>
            </div>

            {/* Pack type selector */}
            {openedCards.length === 0 && !isPackOpeningAnim && (
              <div className="mb-6">
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">📦 Chọn Loại Gói</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {Object.entries(PACK_CONFIGS).map(([key, cfg]) => {
                    const isSelected = packType === key;
                    const canAfford = key === 'starter' ? freePacks > 0 : coins >= cfg.cost;
                    return (
                      <button
                        key={key}
                        className={`p-3 rounded-2xl border flex flex-col items-center gap-1 transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-fuchsia-900/40 border-fuchsia-500/60 shadow-[0_0_20px_rgba(217,70,239,0.2)]'
                            : canAfford ? 'bg-black/40 border-white/10 hover:border-white/30' : 'bg-black/20 border-white/5 opacity-40'
                        }`}
                        onClick={() => canAfford && setPackType(key)}
                        disabled={!canAfford}
                      >
                        <span className="text-2xl">{cfg.emoji}</span>
                        <span className="text-[11px] font-black text-white">{cfg.name}</span>
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                          key === 'starter' ? 'bg-green-900/50 text-green-400 border border-green-500/30' :
                          key === 'ultimate' ? 'bg-rose-900/50 text-rose-400 border border-rose-500/30' :
                          'bg-yellow-900/50 text-yellow-400 border border-yellow-500/30'
                        }`}>
                          {key === 'starter' ? (freePacks > 0 ? `${freePacks} miễn phí` : 'Hết gói') : `${cfg.cost} Xu`}
                        </span>
                        <span className="text-[8px] text-gray-500">{cfg.cards} thẻ · đảm {cfg.guaranteedRare} hiếm+</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Rarity legend */}
            {openedCards.length === 0 && !isPackOpeningAnim && (
              <div className="mb-6 p-3 bg-black/30 rounded-2xl border border-white/5">
                <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-2">Phân Hạng Thẻ</p>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(RARITY_TIERS).map(([key, tier]) => (
                    <span key={key} className="text-[9px] font-bold px-2 py-1 rounded-full border" style={{ color: tier.color, borderColor: tier.color + '40', background: tier.color + '15' }}>
                      {tier.star} {tier.label}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Pack visual / open button */}
            {openedCards.length === 0 && (
              <div className="flex flex-col items-center gap-4 mb-8">
                {isPackOpeningAnim ? (
                  <div className="flex flex-col items-center gap-4 py-12">
                    <div className="w-24 h-24 border-4 border-fuchsia-500 border-t-transparent rounded-full animate-spin" />
                    <p className="text-white font-black text-lg animate-pulse">Khủ đang xổ thẻ...</p>
                    <div className="flex gap-1">
                      {['🌟','✨','💫','🌟','✨'].map((s,i) => (
                        <span key={i} className="text-xl animate-bounce" style={{ animationDelay: `${i*150}ms` }}>{s}</span>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div
                    className="relative cursor-pointer group"
                    onClick={() => openPack(packType)}
                  >
                    <div className="absolute inset-0 bg-fuchsia-500/20 rounded-3xl blur-2xl group-hover:bg-fuchsia-500/40 transition-all duration-500" />
                    <div className="relative w-48 h-64 bg-gradient-to-b from-fuchsia-900/60 to-purple-950/80 rounded-3xl border-2 border-fuchsia-500/50 group-hover:border-fuchsia-400 shadow-[0_0_60px_rgba(217,70,239,0.3)] group-hover:shadow-[0_0_80px_rgba(217,70,239,0.5)] transition-all duration-300 group-hover:scale-105 flex flex-col items-center justify-center gap-3">
                      <span className="text-6xl group-hover:scale-110 transition-transform duration-300">{PACK_CONFIGS[packType].emoji}</span>
                      <span className="text-sm font-black text-white uppercase tracking-widest">{PACK_CONFIGS[packType].name}</span>
                      <span className="text-xs text-fuchsia-300 font-bold">👆 Nhấn để mở</span>
                      {pityCounter >= 8 && (
                        <span className="absolute -top-2 -right-2 bg-rose-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full animate-bounce">🔥 GẦN!</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Cards reveal grid */}
            {openedCards.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-black text-white">Kết quả ({openedCards.length} thẻ)</h3>
                  <div className="flex gap-2">
                    {['mythic','legendary','epic','rare'].map(r => {
                      const count = openedCards.filter(c => c._rarity === r).length;
                      if (count === 0) return null;
                      const tier = RARITY_TIERS[r];
                      return (
                        <span key={r} className="text-[9px] font-black px-2 py-1 rounded-full border" style={{ color: tier.color, borderColor: tier.color + '40', background: tier.color + '15' }}>
                          {tier.star} ×{count}
                        </span>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-8">
                  {openedCards.map((card, i) => {
                    const rarity = card._rarity || 'common';
                    const tier = RARITY_TIERS[rarity];
                    const isSuperstar = rarity === 'mythic' || rarity === 'legendary';
                    return (
                      <div
                        key={i}
                        className="relative animate-scale-in"
                        style={{ animationDelay: `${i * 80}ms` }}
                      >
                        {/* Rarity glow */}
                        {isSuperstar && (
                          <div
                            className="absolute -inset-2 rounded-3xl blur-lg opacity-70 animate-pulse"
                            style={{ background: tier.glow }}
                          />
                        )}
                        <div
                          className="relative rounded-2xl overflow-hidden"
                          style={isSuperstar ? { boxShadow: `0 0 30px ${tier.glow}, 0 0 60px ${tier.glow}` } : {}}
                        >
                          <Card player={card} />
                        </div>
                        {/* Rarity badge */}
                        <div
                          className="absolute top-1.5 right-1.5 text-[8px] font-black px-1.5 py-0.5 rounded-full border backdrop-blur-sm z-30"
                          style={{ color: tier.color, borderColor: tier.color + '60', background: 'rgba(0,0,0,0.7)' }}
                        >
                          {tier.star} {tier.label}
                        </div>
                        {isSuperstar && (
                          <div className="absolute inset-0 pointer-events-none z-20 rounded-2xl overflow-hidden">
                            <div
                              className="absolute inset-0 opacity-30 animate-pulse"
                              style={{ background: `linear-gradient(135deg, transparent 30%, ${tier.color}60 50%, transparent 70%)`, backgroundSize: '200% 200%' }}
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Superstar highlight */}
                {openedCards.some(c => ['mythic','legendary'].includes(c._rarity)) && (
                  <div className="mb-6 p-4 bg-gradient-to-r from-rose-950/60 to-amber-950/60 border border-yellow-500/30 rounded-2xl text-center">
                    <p className="text-yellow-400 font-black text-sm mb-1">🌟🌟🌟 CHÚC MỮNG! Bạn nhận được SIÊU SAO! 🌟🌟🌟</p>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {openedCards.filter(c => ['mythic','legendary'].includes(c._rarity)).map((c, i) => (
                        <span key={i} className="text-white font-bold text-xs px-3 py-1 bg-yellow-500/20 border border-yellow-500/30 rounded-full">
                          ✨ {c.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-fuchsia-700 to-purple-700 hover:from-fuchsia-600 hover:to-purple-600 text-white font-black text-sm uppercase tracking-widest transition-all cursor-pointer"
                    onClick={() => { setOpenedCards([]); setRevealingCards([]); }}
                  >
                    🌀 Mở Tiếp
                  </button>
                  <button
                    className="flex-1 py-3.5 rounded-2xl bg-black/60 border border-white/20 hover:border-white/40 text-white font-black text-sm uppercase tracking-widest transition-all cursor-pointer"
                    onClick={() => { setOpenedCards([]); setRevealingCards([]); setGameState('lobby'); }}
                  >
                    ← Về Sảnh
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {gameState === 'teamBuilder' && (
        <div className="team-builder relative z-10 p-4 sm:p-8 pt-20 min-h-screen flex flex-col">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4 bg-black/50 p-4 rounded-2xl backdrop-blur-md border border-white/10">
            <div className="flex flex-wrap gap-2 sm:gap-4 items-center">
              <button className="btn !bg-blue-600 hover:!bg-blue-500 !py-2 !px-4 text-sm whitespace-nowrap" onClick={() => setGameState('lobby')}>← Về Sảnh</button>
              <button 
                className={`btn !bg-amber-600 hover:!bg-amber-500 !py-2 !px-4 text-sm whitespace-nowrap ${squad.length < 11 ? 'opacity-50 cursor-not-allowed' : ''}`} 
                onClick={() => squad.length === 11 && setGameState('matchEngine')}
              >
                Đấu AI
              </button>
              <button 
                className={`btn !bg-red-600 hover:!bg-red-500 !py-2 !px-4 text-sm whitespace-nowrap ${squad.length < 11 ? 'opacity-50 cursor-not-allowed' : ''}`} 
                onClick={() => squad.length === 11 && setGameState('multiplayer')}
              >
                PVP Online
              </button>
            </div>
            <h2 className="text-xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-gray-100 to-gray-400 drop-shadow-[0_2px_10px_rgba(255,255,255,0.3)]">Xây Dựng Đội Hình</h2>
            <div className="flex gap-4 items-center bg-black/60 px-4 py-2 rounded-xl border border-white/10">
              <span className="text-lg sm:text-xl font-bold text-blue-400">{squad.length}<span className="text-gray-500">/11</span></span>
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
                    onClick={() => setSelectedUpgradeCard(card)} 
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
                    onClick={() => setSelectedUpgradeCard(card)} 
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Card Details & Upgrade Modal */}
          {selectedUpgradeCard && (() => {
            const cardInCollection = collection.find(c => c.id === selectedUpgradeCard.id);
            const inSquad = squad.some(s => s.id === selectedUpgradeCard.id);
            const lvl = cardInCollection ? (cardInCollection.level || 1) : 1;
            const upgradeCost = lvl * 150;
            const isMaxLvl = lvl >= 10;
            return (
              <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fade-in">
                <div className="glass-panel p-6 sm:p-8 rounded-[2.5rem] max-w-lg w-full flex flex-col md:flex-row items-center gap-6 bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950/80 shadow-[0_0_80px_rgba(30,58,138,0.5)] relative border border-white/10">
                  <button 
                    className="absolute top-4 right-4 text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 p-2 rounded-full w-8 h-8 flex items-center justify-center transition-colors border border-white/10 z-50 cursor-pointer"
                    onClick={() => setSelectedUpgradeCard(null)}
                  >
                    ✕
                  </button>

                  {/* Left Column: Big Card Visual */}
                  <div className="w-44 sm:w-56 shrink-0 drop-shadow-[0_10px_30px_rgba(0,0,0,0.8)] relative group">
                    <Card player={cardInCollection} hideStats={false} />
                  </div>

                  {/* Right Column: Level Up Controls */}
                  <div className="flex-1 flex flex-col justify-between w-full h-full text-left">
                    <div>
                      <span className="text-[10px] sm:text-xs font-black uppercase text-cyan-400 tracking-widest block mb-1">HỒ SƠ CẦU THỦ</span>
                      <h3 className="text-xl sm:text-2xl font-black italic uppercase tracking-wide text-white mb-2 leading-none">{selectedUpgradeCard.name}</h3>
                      <div className="flex flex-wrap gap-2 mb-4">
                        <span className="text-[10px] font-bold px-2 py-0.5 bg-white/10 rounded-full text-white/80 border border-white/10">{selectedUpgradeCard.type}</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 bg-yellow-500/20 text-yellow-400 rounded-full border border-yellow-500/30">Cấp Độ {lvl}</span>
                      </div>

                      <div className="bg-black/40 border border-white/5 rounded-2xl p-4 mb-4">
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Chỉ số thuộc tính (+2/Lv):</h4>
                        <div className="grid grid-cols-3 gap-2 text-center">
                          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-2">
                            <div className="text-[9px] font-extrabold text-red-400 tracking-wider">ATK</div>
                            <div className="text-base sm:text-lg font-black text-white">{selectedUpgradeCard.stats.attack + (lvl - 1) * 2}</div>
                          </div>
                          <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-2">
                            <div className="text-[9px] font-extrabold text-green-400 tracking-wider">CTRL</div>
                            <div className="text-base sm:text-lg font-black text-white">{selectedUpgradeCard.stats.control + (lvl - 1) * 2}</div>
                          </div>
                          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-2">
                            <div className="text-[9px] font-extrabold text-blue-400 tracking-wider">DEF</div>
                            <div className="text-base sm:text-lg font-black text-white">{selectedUpgradeCard.stats.defense + (lvl - 1) * 2}</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 mt-2">
                      <button
                        className={`w-full py-3 px-4 rounded-xl font-black text-xs uppercase tracking-widest transition-all cursor-pointer flex justify-between items-center ${
                          isMaxLvl ? 'bg-gray-800 text-gray-500 border border-gray-700 cursor-not-allowed' :
                          coins >= upgradeCost ? 'bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 text-slate-950 font-black shadow-lg shadow-yellow-950/20 hover:scale-[1.02]' :
                          'bg-red-950/40 text-red-400 border border-red-500/20 cursor-not-allowed'
                        }`}
                        disabled={isMaxLvl}
                        onClick={() => {
                          playFx('click');
                          upgradeCard(selectedUpgradeCard.id);
                        }}
                      >
                        <span>{isMaxLvl ? "ĐÃ ĐẠT CẤP ĐỘ MAX" : `⚡ CƯỜNG HÓA (+2 CHỈ SỐ)`}</span>
                        {!isMaxLvl && (
                          <span className="text-[10px] font-bold px-2 py-1 bg-black/20 rounded-lg text-white">
                            🪙 {upgradeCost} Xu
                          </span>
                        )}
                      </button>

                      <button
                        className={`w-full py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-widest transition-all cursor-pointer border ${
                          inSquad ? 'bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20' :
                          squad.length >= 11 ? 'bg-gray-800 border-gray-700 text-gray-500 cursor-not-allowed' :
                          'bg-blue-500/10 border-blue-500/30 text-blue-400 hover:bg-blue-500/20'
                        }`}
                        onClick={() => {
                          playFx('click');
                          if (inSquad) {
                            setSquad(squad.filter(s => s.id !== selectedUpgradeCard.id));
                            localStorage.setItem(`panini_${currentUser}_squad`, JSON.stringify(squad.filter(s => s.id !== selectedUpgradeCard.id)));
                          } else {
                            if (squad.length < 11) {
                              setSquad([...squad, cardInCollection]);
                              localStorage.setItem(`panini_${currentUser}_squad`, JSON.stringify([...squad, cardInCollection]));
                            } else {
                              showAlert("🚫 Đội Hình Đầy!", "Đội hình chính đã đủ 11 cầu thủ!");
                            }
                          }
                        }}
                      >
                        {inSquad ? "❌ Rút Khỏi Đội Hình" : squad.length >= 11 ? "🚫 Đội Hình Chính Đầy (11/11)" : "⚽ Đưa Vào Đội Hình Chính"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {gameState === 'matchEngine' && (
        <div className="w-full h-[100dvh] flex flex-col overflow-hidden bg-black/50 animate-fade-in relative z-10">
          
          {matchPhase === 'setup' && (
            <div className="flex-1 flex flex-col items-center justify-center p-4 overflow-y-auto hide-scrollbar z-20">
              <div className="glass-panel p-6 sm:p-10 rounded-3xl text-center w-full max-w-xl bg-gradient-to-t from-slate-950 to-slate-900/90 shadow-[0_0_50px_rgba(0,0,0,0.8)] border border-white/10 relative">
                <button 
                  className="absolute top-4 left-4 text-gray-400 hover:text-white bg-black/40 hover:bg-black/80 px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1 border border-white/10" 
                  onClick={() => setGameState('lobby')}
                >
                  ← Về Sảnh
                </button>
                
                <h2 className="text-2xl sm:text-3xl font-black uppercase text-amber-400 mt-6 mb-2 tracking-widest drop-shadow-[0_2px_10px_rgba(251,191,36,0.3)]">
                  Đấu trường AI
                </h2>
                <p className="text-xs text-gray-400 mb-6 font-medium">Chọn độ khó để bắt đầu trận đấu 11 vòng đầy kịch tính</p>
                
                <div className="flex flex-col gap-3 mb-8 w-full">
                  {[
                    { id: 'Amateur', name: 'Nghiệp Dư', emoji: '🟢', color: 'border-emerald-500/30 hover:border-emerald-400 text-emerald-400 shadow-emerald-500/5', bg: 'bg-emerald-500/10 border-emerald-400 text-emerald-300 shadow-emerald-500/20', reward: '+30 Xu', desc: 'AI chọn bài ngẫu nhiên 100%, thích hợp làm quen.' },
                    { id: 'Professional', name: 'Chuyên Nghiệp', emoji: '🔵', color: 'border-blue-500/30 hover:border-blue-400 text-blue-400 shadow-blue-500/5', bg: 'bg-blue-500/10 border-blue-400 text-blue-300 shadow-blue-500/20', reward: '+50 Xu', desc: 'AI có 50% tính toán phản công, biết chặn đòn vừa phải.' },
                    { id: 'World Class', name: 'Thế Giới', emoji: '🟡', color: 'border-yellow-500/30 hover:border-yellow-400 text-yellow-400 shadow-yellow-500/5', bg: 'bg-yellow-500/10 border-yellow-400 text-yellow-300 shadow-yellow-500/20', reward: '+80 Xu', desc: 'AI có 75% phản công mạnh mẽ, yêu cầu đội hình tốt.' },
                    { id: 'Legendary', name: 'Huyền Thoại', emoji: '🟣', color: 'border-purple-500/30 hover:border-purple-400 text-purple-400 shadow-purple-500/5', bg: 'bg-purple-500/10 border-purple-400 text-purple-300 shadow-purple-500/20', reward: '+120 Xu', desc: 'AI 90% siêu thông minh, toàn siêu sao và được cộng +2 tất cả chỉ số!' },
                    { id: 'Ultimate', name: 'Vô Địch', emoji: '🔴', color: 'border-red-500/30 hover:border-red-400 text-red-400 shadow-red-500/5', bg: 'bg-red-500/10 border-red-400 text-red-300 shadow-red-500/20', reward: '+180 Xu', desc: 'Ác mộng thực sự! AI 100% hoàn hảo và được cộng +5 tất cả chỉ số!' }
                  ].map(diff => {
                    const isSelected = difficulty === diff.id;
                    return (
                      <div 
                        key={diff.id}
                        className={`p-3 rounded-2xl border text-left cursor-pointer transition-all duration-200 flex items-center justify-between gap-3 ${
                          isSelected ? diff.bg + ' scale-[1.01] shadow-lg ring-1 ring-white/10' : diff.color + ' bg-black/40 hover:bg-black/60'
                        }`}
                        onClick={() => {
                          playFx('click');
                          setDifficulty(diff.id);
                        }}
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-lg">{diff.emoji}</span>
                            <span className="font-extrabold text-sm sm:text-base text-white">{diff.name}</span>
                            <span className="text-[10px] px-2 py-0.5 bg-yellow-400/20 text-yellow-400 border border-yellow-400/30 font-black rounded-full uppercase tracking-wider">{diff.reward}</span>
                          </div>
                          <p className="text-[10px] sm:text-xs text-gray-400 leading-snug font-medium">{diff.desc}</p>
                        </div>
                        {isSelected && (
                          <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center shadow-md animate-scale-in shrink-0">
                            <span className="text-[10px] text-slate-900 font-bold">✓</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                
                <button 
                  className="btn w-full flex items-center justify-center gap-2 !bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 font-black tracking-widest text-lg py-4 rounded-2xl shadow-[0_4px_20px_rgba(239,68,68,0.3)] hover:scale-[1.02] transition-all cursor-pointer animate-pulse-subtle" 
                  onClick={() => {
                    playFx('click');
                    startMatch();
                  }}
                >
                  <Play size={20} fill="currentColor" /> BẮT ĐẦU TRẬN ĐẤU
                </button>
              </div>
            </div>
          )}

          {matchPhase === 'gameOver' && (
            <div className="flex-1 flex flex-col items-center justify-center p-4">
              <div className="glass-panel p-8 sm:p-12 rounded-3xl text-center w-full max-w-lg">
                <div className="text-xl mx-4 text-gray-400 font-bold mb-2">TỈ SỐ CHUNG CUỘC</div>
                <div className="score-board mb-8 text-center flex justify-center items-center gap-4 text-5xl font-black">
                  <span className={matchScore.player > matchScore.ai ? 'text-green-400' : ''}>{matchScore.player}</span>
                  <span className="text-gray-500">-</span>
                  <span className={matchScore.ai > matchScore.player ? 'text-green-400' : ''}>{matchScore.ai}</span>
                </div>
                <h3 className="text-3xl font-black mb-8 uppercase text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-yellow-600 drop-shadow-md">
                  {matchScore.player > matchScore.ai ? "BẠN ĐÃ CHIẾN THẮNG! 🏆" : matchScore.player < matchScore.ai ? "BẠN ĐÃ THUA! 💀" : "HÒA NHAU! 🤝"}
                </h3>
                {matchScore.player > matchScore.ai && (
                  <div className="bg-yellow-900/40 border border-yellow-500/50 px-6 py-3 rounded-xl mb-6 flex items-center justify-center gap-3">
                    <Coins className="text-yellow-400" size={28} />
                    <span className="text-2xl font-bold text-yellow-400">+{lastReward} Xu</span>
                  </div>
                )}
                <button className="btn w-full" onClick={returnToLobby}>Trở Về Sảnh Chính</button>
              </div>
            </div>
          )}

          {(matchPhase === 'playing' || matchPhase === 'roundResult') && (
            <div className="flex-1 w-full flex flex-col md:flex-row p-2 sm:p-4 gap-4 overflow-y-auto hide-scrollbar z-20 relative">
              
              {/* Battle Overlay for Effects */}
              {matchPhase === 'roundResult' && (
                <div className={`battle-overlay active ${
                  roundResultMsg.includes('THẮNG') ? '' : 
                  roundResultMsg.includes('THUA') ? 'cloud-overlay' : 'draw-overlay'
                }`}></div>
              )}

              {/* Stat Selection Modal */}
              {selectedPlayerCard && matchPhase === 'playing' && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
                  <div className="glass-panel p-6 sm:p-8 rounded-[2rem] max-w-sm w-full flex flex-col items-center bg-gradient-to-t from-blue-900/60 to-slate-900 shadow-[0_0_50px_rgba(0,0,0,0.8)] relative border border-white/10">
                    <button 
                      className="absolute top-4 right-4 text-gray-400 hover:text-white bg-black/40 hover:bg-black/80 p-2 rounded-full w-8 h-8 flex items-center justify-center transition-colors"
                      onClick={() => setSelectedPlayerCard(null)}
                    >
                      ✕
                    </button>

                    <h2 className="text-sm sm:text-base font-black text-amber-400 mb-6 uppercase tracking-widest text-center">Chọn Chỉ Số Tấn Công</h2>
                    
                    <div className="w-40 sm:w-48 mb-8 scale-110 drop-shadow-2xl">
                      <Card player={selectedPlayerCard} hideStats={false} />
                    </div>

                    <div className="flex gap-3 sm:gap-4 w-full">
                      <button className="flex-1 flex flex-col items-center bg-black/60 hover:bg-red-900/50 border border-red-500/50 hover:border-red-400 rounded-xl py-3 transition-all group shadow-[0_0_15px_rgba(239,68,68,0.3)] hover:-translate-y-2 hover:shadow-[0_0_30px_rgba(239,68,68,0.6)]" onClick={() => playRound('attack')}>
                          <span className="text-[10px] sm:text-xs font-bold text-red-400 tracking-widest uppercase group-hover:text-white transition-colors">ATK</span>
                          <span className="text-2xl sm:text-3xl font-black text-white">{selectedPlayerCard.stats.attack}</span>
                      </button>
                      <button className="flex-1 flex flex-col items-center bg-black/60 hover:bg-green-900/50 border border-green-500/50 hover:border-green-400 rounded-xl py-3 transition-all group shadow-[0_0_15px_rgba(34,197,94,0.3)] hover:-translate-y-2 hover:shadow-[0_0_30px_rgba(34,197,94,0.6)]" onClick={() => playRound('control')}>
                          <span className="text-[10px] sm:text-xs font-bold text-green-400 tracking-widest uppercase group-hover:text-white transition-colors">CTRL</span>
                          <span className="text-2xl sm:text-3xl font-black text-white">{selectedPlayerCard.stats.control}</span>
                      </button>
                      <button className="flex-1 flex flex-col items-center bg-black/60 hover:bg-blue-900/50 border border-blue-500/50 hover:border-blue-400 rounded-xl py-3 transition-all group shadow-[0_0_15px_rgba(59,130,246,0.3)] hover:-translate-y-2 hover:shadow-[0_0_30px_rgba(59,130,246,0.6)]" onClick={() => playRound('defense')}>
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
                      ↺ Chọn Cầu Thủ Khác
                    </button>
                  </div>
                </div>
              )}

              {/* Round Result Overlay */}
              {matchPhase === 'roundResult' && (
                <div className="fixed inset-0 z-[90] flex flex-col items-center justify-center pointer-events-none p-4">
                  <div className="text-2xl sm:text-4xl font-black uppercase tracking-widest text-center text-white drop-shadow-[0_0_30px_rgba(255,255,255,1)] bg-black/60 backdrop-blur-md px-8 sm:px-12 py-6 rounded-3xl border border-white/20 animate-fade-in shadow-2xl flex flex-col items-center gap-2 pointer-events-auto">
                    {roundResultMsg}
                    {playedCardIds.length >= 11 && (
                      <button
                        className="mt-6 px-8 py-3 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-600 hover:to-yellow-500 text-slate-950 font-black tracking-widest uppercase rounded-full shadow-[0_0_30px_rgba(251,191,36,0.5)] transition-all hover:scale-105 pointer-events-auto cursor-pointer"
                        onClick={() => {
                          playFx('click');
                          nextRound();
                        }}
                      >
                        Xem Kết Quả Trận Đấu 🏆
                      </button>
                    )}
                  </div>
                  {playedCardIds.length < 11 ? (
                    <div className="mt-8 text-amber-400 text-[10px] sm:text-xs font-bold tracking-widest uppercase animate-pulse bg-black/50 px-6 py-2 rounded-full border border-amber-400/30">
                       Chạm vào thẻ bất kỳ trên sân 3D để chơi tiếp
                    </div>
                  ) : (
                    <div className="mt-8 text-green-400 text-[10px] sm:text-xs font-bold tracking-widest uppercase animate-pulse bg-black/50 px-6 py-2 rounded-full border border-green-400/30">
                       Nhấp nút phía trên để kết thúc trận đấu
                    </div>
                  )}
                </div>
              )}

              {/* Màn hình 1: Sân vận động 3D (Cột Trái) */}
              <div className="flex-1 flex flex-col gap-2 h-full justify-between">
                
                {/* HUD Score */}
                <div className="glass-panel px-6 py-3 rounded-2xl flex justify-between items-center bg-black/40 border border-white/10 shadow-lg">
                  <div className="flex items-center gap-3 w-1/3">
                     <div className="w-10 h-10 bg-blue-900/50 rounded-full flex items-center justify-center border border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]">
                       <User className="text-blue-400"/>
                     </div>
                     <div>
                       <div className="text-[10px] text-blue-400 font-bold uppercase tracking-widest">{currentUser}</div>
                       <div className="text-2xl font-black text-white">{matchScore.player}</div>
                     </div>
                  </div>
                  
                  <div className="text-3xl font-black italic text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-red-400 drop-shadow-lg shrink-0">
                    VS
                  </div>
                  
                  <div className="flex items-center gap-3 w-1/3 justify-end text-right">
                     <div>
                       <div className="text-[10px] text-red-400 font-bold uppercase tracking-widest">AI</div>
                       <div className="text-2xl font-black text-white">{matchScore.ai}</div>
                     </div>
                     <div className="w-10 h-10 bg-red-900/50 rounded-full flex items-center justify-center border border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)]">
                       <span className="text-red-400 font-black text-xs">AI</span>
                     </div>
                  </div>
                </div>

                {/* Weather & Environment HUD */}
                <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 bg-slate-950/80 border border-white/10 p-2.5 rounded-2xl mx-auto select-none mt-1 shadow-lg max-w-xl w-full text-center">
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
                <div className="flex items-center justify-center gap-2 sm:gap-4 bg-slate-900/60 border border-white/5 py-1.5 px-4 rounded-full text-[9px] sm:text-xs font-semibold tracking-wide mx-auto select-none mt-1 shadow-md">
                  <span className="text-gray-400 font-bold uppercase text-[8px] sm:text-[10px]">Khắc chế (+5 OVR):</span>
                  <span className="flex items-center gap-1 font-bold text-yellow-400">Tốc độ ⚡</span>
                  <span className="text-gray-500 font-black">➔</span>
                  <span className="flex items-center gap-1 font-bold text-cyan-400">Kỹ thuật 🌀</span>
                  <span className="text-gray-500 font-black">➔</span>
                  <span className="flex items-center gap-1 font-bold text-red-400">Sức mạnh 💪</span>
                  <span className="text-gray-500 font-black">➔</span>
                  <span className="flex items-center gap-1 font-bold text-yellow-400">Tốc độ ⚡</span>
                </div>

                {/* Sân 3D */}
                <div className="glass-panel p-2 pb-6 rounded-3xl flex-1 flex flex-col relative bg-black/30 border border-white/10">
                  <h3 className="text-xs font-bold text-blue-400 tracking-widest uppercase mb-1 text-center w-full z-20">Đội hình ra sân của bạn</h3>
                  
                  <div className="pitch-wrapper flex-1 mt-1">
                    <div className="pitch-container">
                      <div className="pitch-lines"></div>
                      <div className="penalty-box-top"></div>
                      <div className="penalty-box-bottom"></div>
                      
                      {playerHand.map((player, idx) => {
                        const isPlayed = playedCardIds.includes(player.id);
                        const isSelected = selectedPlayerCard?.id === player.id;
                        const pos = PITCH_POSITIONS[idx] || { top: '50%', left: '50%' };
                        
                        if (isPlayed) return null; // Ẩn thẻ đã đánh
                        
                        return (
                          <div 
                            key={player.id}
                            className={`pitch-player-slot cursor-pointer ${isSelected ? 'selected' : ''}`}
                            style={{ top: pos.top, left: pos.left, zIndex: Math.round(parseFloat(pos.top)) }}
                            onClick={() => {
                              if (!isPlayed) {
                                playFx('click');
                                if (matchPhase === 'playing') {
                                  setSelectedPlayerCard(player);
                                } else if (matchPhase === 'roundResult') {
                                  if (playedCardIds.length >= 11) {
                                    nextRound(); // Xử lý GameOver
                                  } else {
                                    setMatchPhase('playing');
                                    setSelectedStat(null);
                                    setCurrentAiCard(null);
                                    setSelectedPlayerCard(player);
                                  }
                                }
                              }
                            }}
                          >
                            <Card player={player} hideStats={false} />
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Màn hình 2: Đội hình đối thủ (Cột Phải) */}
              <div className="flex-1 glass-panel p-4 rounded-3xl flex flex-col justify-between bg-black/40 border border-white/5 relative">
                 <button className="absolute top-4 right-4 z-50 text-gray-500 hover:text-white bg-black/50 p-2 rounded-full border border-white/10 transition-colors" onClick={() => setGameState('lobby')} title="Thoát trận">
                    <Lock size={16} className="opacity-0 hidden" /> {/* Dummy icon if needed */}
                    Thoát
                 </button>
                 
                 <div className="flex justify-between items-center mb-6 pr-12">
                    <h3 className="text-sm font-bold text-red-400 tracking-widest uppercase">Đội Hình AI</h3>
                    <div className="text-xs text-gray-400 uppercase font-bold tracking-widest bg-black/50 px-3 py-1 rounded-full border border-white/10">Còn lại: {aiHand.length}/11</div>
                 </div>

                 {/* Sàn đấu trung tâm (Thẻ đang đánh của AI) */}
                 <div className="flex-1 flex flex-col items-center justify-center relative my-2">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-red-600/10 rounded-full blur-[50px] pointer-events-none"></div>
                    <div className="w-40 sm:w-52 aspect-[5/7] relative z-10 transition-all duration-500">
                      {matchPhase === 'roundResult' && currentAiCard ? (
                        <div className="w-full h-full animate-fade-in drop-shadow-[0_0_30px_rgba(239,68,68,0.5)] scale-110">
                           <Card player={currentAiCard} />
                        </div>
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-red-400/30 border-2 border-dashed border-red-900/30 rounded-2xl bg-black/50 backdrop-blur-sm shadow-inner">
                           <div className="w-3 h-3 rounded-full bg-red-500/50 animate-ping mb-3"></div>
                           <span className="text-[10px] font-bold uppercase tracking-widest text-center px-2">Đang chờ<br/>phản hồi</span>
                        </div>
                      )}
                    </div>
                 </div>

                 {/* Các lá bài chưa đánh của AI xếp dạng Grid nhỏ ở dưới */}
                 <div className="bg-black/60 p-4 rounded-2xl border border-white/5">
                   <h4 className="text-[10px] font-bold text-gray-500 tracking-widest uppercase text-center mb-3">Thẻ chưa lật</h4>
                   <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 sm:gap-3 place-items-center">
                      {aiHand.map((_, i) => (
                         <div key={i} className="w-full aspect-[5/7] bg-gradient-to-b from-gray-800 to-gray-900 border border-gray-700 rounded-lg flex items-center justify-center shadow-[inset_0_0_10px_rgba(0,0,0,0.8)] opacity-60">
                            <span className="text-gray-600 font-black text-xs">?</span>
                         </div>
                      ))}
                   </div>
                 </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Professional Footer */}
      <footer className="mt-auto pt-12 pb-4 border-t border-white/5 text-center flex flex-col sm:flex-row items-center justify-between gap-4 w-full relative z-20">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_#22c55e]"></span>
          <span className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-widest">Máy Chủ Trực Tuyến Hợp Lệ</span>
        </div>
        <div className="text-[10px] sm:text-xs font-bold text-gray-400 tracking-wider">
          © 2026 WC Ultimate Card - Bản quyền thuộc về <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400 font-extrabold">Mai Quang Vinh</span> (Tiểu học Nghĩa Tân)
        </div>
        <div className="text-[9px] sm:text-[10px] font-bold text-gray-500 uppercase tracking-widest bg-white/5 px-3 py-1 rounded-full border border-white/5">
          Vibecoding với Antigravity
        </div>
      </footer>
    </div>
        </>
      )}

      {/* ================= MODALS & CELEBRATIONS ================= */}

      {/* 1. INSPECT PROFILE MODAL */}
      {inspectingUser && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in">
          <div className="glass-panel w-full max-w-sm max-h-[90vh] overflow-y-auto rounded-[2.5rem] border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.8)] flex flex-col relative bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950/80 p-8 gap-6 hide-scrollbar">
            
            <button 
              className="absolute top-4 right-4 text-gray-400 hover:text-white bg-black/40 hover:bg-black/80 p-2 rounded-full w-8 h-8 flex items-center justify-center transition-colors z-[160] cursor-pointer"
              onClick={() => { playFx('click'); setInspectingUser(null); setInspectedUserData(null); }}
            >
              ✕
            </button>

            {loadingInspectedUser ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4 w-full">
                <div className="w-12 h-12 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
                <div className="text-cyan-400 font-extrabold tracking-widest text-xs uppercase animate-pulse">Đang tải hồ sơ HLV...</div>
              </div>
            ) : !inspectedUserData ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4 w-full text-center">
                <div className="text-red-400 text-lg font-black uppercase mb-2">Không tìm thấy thông tin HLV ❌</div>
                <p className="text-gray-400 text-sm max-w-xs">Dữ liệu HLV chưa sẵn sàng hoặc HLV đang chơi ở chế độ ngoại tuyến.</p>
              </div>
            ) : (
              <div className="w-full flex flex-col gap-4">
                <div className="flex flex-col items-center text-center">
                  {/* Level Badge */}
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 flex items-center justify-center border-2 border-white/20 shadow-lg shadow-purple-900/50 mb-3 relative animate-pulse-subtle">
                    <span className="text-xl font-black text-white">Lv.{inspectedUserData.level || 1}</span>
                  </div>

                  <h2 className="text-2xl font-black text-white mb-1 uppercase tracking-wider">{inspectingUser}</h2>
                  <span className="text-xs px-3 py-1 bg-cyan-900/40 text-cyan-400 border border-cyan-500/20 font-black rounded-full uppercase tracking-widest mb-4">
                    {inspectedUserData.squad ? Math.round(inspectedUserData.squad.reduce((acc, card) => acc + Math.max(card.stats.attack, card.stats.defense, card.stats.control), 0) / 11) : 0} OVR
                  </span>
                  
                  {/* XP Progress Bar */}
                  <div className="w-full bg-black/60 rounded-full h-2.5 border border-white/5 overflow-hidden mb-6 relative">
                    <div 
                      className="bg-gradient-to-r from-cyan-400 via-indigo-500 to-purple-500 h-full rounded-full transition-all duration-1000"
                      style={{ width: `${Math.min(100, ((inspectedUserData.xp || 0) / ((inspectedUserData.level || 1) * 100)) * 100)}%` }}
                    ></div>
                  </div>
                </div>

                {/* Battle Stats Grid */}
                <div className="bg-black/30 border border-white/5 rounded-2xl p-4 flex flex-col gap-3">
                  <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest border-b border-white/5 pb-2 text-center">Thống Kê Trận Đấu</div>
                  
                  <div className="grid grid-cols-2 gap-3 text-center">
                    <div className="bg-slate-900/50 border border-white/5 p-2 rounded-xl">
                      <div className="text-[9px] text-gray-400 font-bold uppercase">Trận đã đấu</div>
                      <div className="text-lg font-black text-white">{inspectedUserData.stats?.played || 0}</div>
                    </div>
                    <div className="bg-green-950/20 border border-green-500/10 p-2 rounded-xl">
                      <div className="text-[9px] text-green-400 font-bold uppercase">Chiến Thắng</div>
                      <div className="text-lg font-black text-green-400">{inspectedUserData.stats?.wins || 0}</div>
                    </div>
                    <div className="bg-yellow-950/20 border border-yellow-500/10 p-2 rounded-xl">
                      <div className="text-[9px] text-yellow-400 font-bold uppercase">Hòa</div>
                      <div className="text-lg font-black text-yellow-400">{inspectedUserData.stats?.draws || 0}</div>
                    </div>
                    <div className="bg-red-950/20 border border-red-500/10 p-2 rounded-xl">
                      <div className="text-[9px] text-red-400 font-bold uppercase">Thất bại</div>
                      <div className="text-lg font-black text-red-400">{inspectedUserData.stats?.losses || 0}</div>
                    </div>
                  </div>
                </div>

                {/* Interactivity Buttons */}
                <div className="flex flex-col gap-2 mt-4">
                  <button 
                    className="btn !bg-violet-600 hover:!bg-violet-500 w-full flex items-center justify-center gap-2 !py-3 font-bold text-sm tracking-wider rounded-xl transition-all active:scale-[0.98] cursor-pointer shadow-lg shadow-violet-900/30"
                    onClick={() => {
                      playFx('click');
                      setActivePrivatePartner(inspectingUser);
                      setChatTab('private');
                      setInspectingUser(null);
                    }}
                  >
                    <MessageSquare size={16} /> Nhắn Tin Riêng
                  </button>
                  
                  <button 
                    className={`btn w-full flex items-center justify-center gap-2 !py-3 font-bold text-sm tracking-wider rounded-xl transition-all active:scale-[0.98] cursor-pointer shadow-lg ${
                      squad.length < 11
                        ? 'opacity-40 !bg-gray-700 cursor-not-allowed text-gray-400' 
                        : 'bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white shadow-red-900/30'
                    }`}
                    disabled={squad.length < 11}
                    onClick={() => {
                      if (squad.length === 11) {
                        const activeObj = onlineUsers.find(o => o.username === inspectingUser);
                        if (activeObj) {
                          sendChallengeInvite(activeObj.username, activeObj.peerId);
                          setInspectingUser(null);
                        } else {
                          showAlert("Ngoại Tuyến ⚪", "HLV này đã ngoại tuyến hoặc không khả dụng để thách đấu pvp trực tiếp.");
                        }
                      }
                    }}
                  >
                    <Swords size={16} /> Gửi Lời Thách Đấu
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. LEVEL UP CELEBRATION MODAL */}
      {showLevelUpModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-fade-in">
          <div className="glass-panel p-8 sm:p-12 rounded-[2.5rem] text-center w-full max-w-md bg-gradient-to-t from-yellow-950/30 via-slate-900 to-slate-950 border border-yellow-500/30 shadow-[0_0_80px_rgba(251,191,36,0.3)] animate-scale-in flex flex-col items-center">
            <div className="text-7xl mb-4 animate-bounce-subtle">🏆</div>
            
            <h2 className="text-xs sm:text-sm font-black text-yellow-500 uppercase tracking-widest mb-2">Đạt Cấp Độ Mới</h2>
            <h3 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-600 mb-6 drop-shadow-md">
              HLV LÊN CẤP!
            </h3>

            <div className="flex items-center gap-6 mb-8">
              <div className="flex flex-col items-center">
                <span className="text-[10px] text-gray-500 font-bold uppercase">Cấp cũ</span>
                <span className="text-2xl font-black text-gray-400">{showLevelUpModal.oldLevel}</span>
              </div>
              <div className="text-2xl text-yellow-500 font-black">➔</div>
              <div className="flex flex-col items-center">
                <span className="text-[10px] text-amber-400 font-bold uppercase">Cấp mới</span>
                <span className="text-4xl font-black text-yellow-400 animate-scale-in">{showLevelUpModal.newLevel}</span>
              </div>
            </div>

            <div className="bg-yellow-950/40 border border-yellow-500/30 px-6 py-4 rounded-2xl mb-8 flex items-center justify-center gap-3 w-full shadow-[0_0_20px_rgba(251,191,36,0.1)]">
              <Coins className="text-yellow-400" size={24} />
              <div className="text-left">
                <div className="text-[9px] text-yellow-500 font-bold uppercase tracking-wider">Phần thưởng lên cấp</div>
                <div className="text-lg font-black text-yellow-400">+{showLevelUpModal.reward} Xu</div>
              </div>
            </div>

            <button 
              className="btn w-full !bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 text-black font-black py-4 rounded-xl shadow-lg active:scale-95 transition-all cursor-pointer"
              onClick={() => { playFx('click'); setShowLevelUpModal(null); }}
            >
              🤝 Tuyệt Vời! Nhận Xu
            </button>
          </div>
        </div>
      )}


      {/* 2.5 KHOE THẺ XỊN SHOWCASE POSTER MODAL */}
      {showSharePoster && (() => {
        const card = showSharePoster;
        const rarity = card._rarity || 'common';
        const tier = RARITY_TIERS[rarity] || { color: '#ffffff', glow: 'rgba(255,255,255,0.4)', star: '★', label: 'SIÊU SAO' };
        
        return (
          <div className="fixed inset-0 z-[220] flex items-center justify-center bg-black/95 backdrop-blur-md p-4 overflow-y-auto animate-fade-in">
            <div className="relative w-full max-w-lg bg-gradient-to-b from-slate-900 via-slate-950 to-black border-2 border-yellow-500/40 rounded-[2.5rem] p-6 sm:p-8 text-center shadow-[0_0_80px_rgba(251,191,36,0.35)] flex flex-col items-center gap-6 overflow-hidden">
              
              {/* Decorative glows */}
              <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-red-500 via-yellow-500 to-cyan-500"></div>
              <div className="absolute -top-20 -left-20 w-48 h-48 bg-cyan-500/10 rounded-full blur-[80px]"></div>
              <div className="absolute -bottom-20 -right-20 w-48 h-48 bg-yellow-500/10 rounded-full blur-[80px]"></div>

              {/* Header Title */}
              <div>
                <span className="text-[10px] font-black uppercase text-amber-400 tracking-[0.25em] pl-[0.25em] block mb-1">
                  ✨ NHÀ VÔ ĐỊCH MỞ GÓI THẺ ✨
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-yellow-300 to-amber-500 uppercase tracking-wide">
                  ĐÃ MỞ ĐƯỢC SIÊU CẦU THỦ!
                </h2>
              </div>

              {/* Poster frame that players screenshot */}
              <div className="w-full bg-gradient-to-b from-slate-950 to-slate-900 border border-white/10 rounded-3xl p-5 relative overflow-hidden flex flex-col items-center shadow-inner">
                {/* Diagonal strip background */}
                <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(0,0,0,0.85)_25%,transparent_25%,transparent_50%,rgba(0,0,0,0.85)_50%,rgba(0,0,0,0.85)_75%,transparent_75%,transparent)] bg-[length:40px_40px] opacity-10 pointer-events-none"></div>

                {/* Overall Rating & Headline */}
                <div className="text-center z-10 mb-4">
                  <h3 className="text-lg sm:text-xl font-black italic uppercase tracking-wider text-white">
                    HLV <span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-cyan-400 font-black">{currentUser}</span>
                  </h3>
                  <div className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">Sở hữu thẻ Siêu Cấp Mùa giải 2026</div>
                </div>

                {/* The card itself */}
                <div className="w-44 sm:w-56 aspect-[5/7] mb-5 relative group animate-bounce-subtle z-10">
                  <div className="absolute -inset-1 rounded-[1.5rem] blur-md opacity-60 animate-pulse" style={{ background: tier.glow }}></div>
                  <div className="relative rounded-2xl overflow-hidden" style={{ boxShadow: `0 0 25px ${tier.glow}` }}>
                    <Card player={card} hideStats={false} />
                  </div>
                </div>

                {/* QR Code and link strip */}
                <div className="w-full flex items-center justify-between gap-4 border-t border-white/10 pt-4 z-10 bg-black/40 px-4 py-2.5 rounded-2xl mt-1">
                  <div className="text-left">
                    <div className="text-[9px] font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-500 uppercase tracking-wider">Chơi Game Miễn Phí Tại</div>
                    <div className="text-xs font-black text-white tracking-wide">thebongda.vinhninh.com</div>
                    <div className="text-[7px] text-gray-500 font-bold uppercase tracking-widest mt-0.5">
                      Nhập mã giới thiệu: <span className="text-amber-400 font-black">{currentUser}</span>
                    </div>
                  </div>
                  <div className="bg-white p-1 rounded-lg shrink-0 shadow-lg border border-yellow-500/30">
                    <QRCodeSVG value={`${window.location.origin}?ref=${currentUser}`} size={52} bgColor="#ffffff" fgColor="#000000" level="L" />
                  </div>
                </div>
              </div>

              {/* Instructions and CTA */}
              <div className="text-xs text-gray-400 font-semibold px-4">
                📸 <span className="text-white">Hãy Chụp Ảnh Màn Hình điện thoại/máy tính ngay</span> để khoe thẻ siêu sao lấp lánh này lên Zalo cho bố mẹ hoặc gửi vào nhóm chat lớp để thách đấu cùng bạn bè nhé!
              </div>

              <div className="flex gap-4 w-full">
                <button 
                  type="button"
                  className="flex-1 btn !bg-yellow-500 text-black font-black py-3 text-sm rounded-xl transition-all active:scale-[0.98] shadow-lg shadow-yellow-500/20"
                  onClick={() => {
                    playFx('click');
                    showAlert("📤 Link Đã Sẵn Sàng!", "Đã tạo link chia sẻ của bạn! Bạn chỉ cần chụp ảnh màn hình này hoặc gửi link này cho bạn bè nhé!");
                  }}
                >
                  📤 Tạo Link Chia Sẻ
                </button>
                <button 
                  type="button"
                  className="flex-1 btn !bg-gray-700 hover:!bg-gray-600 text-white font-bold py-3 text-sm rounded-xl transition-all active:scale-[0.98]"
                  onClick={() => {
                    playFx('click');
                    setShowSharePoster(null);
                  }}
                >
                  Đóng
                </button>
              </div>

            </div>
          </div>
        );
      })()}

      {/* 3. IN-GAME CUSTOM ALERT MODAL */}
      {gameAlert && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
          <div className="glass-panel p-6 sm:p-8 rounded-[2rem] max-w-sm w-full text-center flex flex-col items-center bg-gradient-to-t from-slate-900 via-slate-950 to-slate-900 border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.8)] relative animate-scale-in">
            <h3 className="text-base font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400 mb-4 uppercase tracking-widest">
              {gameAlert.title || 'Thông Báo'}
            </h3>
            <p className="text-xs sm:text-sm font-semibold text-gray-200 mb-6 leading-relaxed">
              {gameAlert.message}
            </p>
            <button 
              className="btn w-full !bg-cyan-600 hover:!bg-cyan-500 text-white font-bold py-3 rounded-xl transition-all active:scale-[0.98] cursor-pointer"
              onClick={() => {
                playFx('click');
                setGameAlert(null);
              }}
            >
              Đồng Ý
            </button>
          </div>
        </div>
      )}
    </>
  );
}
