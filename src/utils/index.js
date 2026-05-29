import { TIERS, FORM_STATES, CARD_TYPE_BONUS, ENV_WEATHER } from '../constants';

export const hashPIN = async (pin) => {
  if (!pin) return "";
  const encoder = new TextEncoder();
  const data = encoder.encode(pin);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
};

export const triggerConfetti = async (options) => {
  const module = await import('canvas-confetti');
  const confetti = module.default;
  confetti(options);
};

export const getPlayerTier = (lvl) => {
  const tier = TIERS.find(t => lvl >= t.minLevel && lvl <= t.maxLevel);
  return tier || TIERS[0];
};

export const getAvatarGradient = (username) => {
  if (!username) return 'linear-gradient(135deg, #6b7280, #374151)';
  if (username === 'HỆ THỐNG 📣') {
    return 'linear-gradient(135deg, #f59e0b, #d97706)';
  }
  let hash = 0;
  for (let i = 0; i < username.length; i++) {
    hash = username.charCodeAt(i) + ((hash << 5) - hash);
  }
  const colors = [
    'linear-gradient(135deg, #3b82f6, #4f46e5)',
    'linear-gradient(135deg, #a855f7, #ec4899)',
    'linear-gradient(135deg, #10b981, #0d9488)',
    'linear-gradient(135deg, #f43f5e, #f97316)',
    'linear-gradient(135deg, #06b6d4, #2563eb)',
    'linear-gradient(135deg, #d946ef, #9333ea)',
    'linear-gradient(135deg, #f59e0b, #eab308)',
  ];
  const index = Math.abs(hash) % colors.length;
  return colors[index];
};

// --- Profile Customization Presets ---
export const getCardTypeBonus = (type = '') => {
  if (!type) return 0;
  // Exact match first
  if (CARD_TYPE_BONUS[type] !== undefined) return CARD_TYPE_BONUS[type];
  // Prefix match fallback (e.g. "Attacker ARG" etc.)
  if (type.startsWith('Attacker') || type.startsWith('Midfielder') || type.startsWith('Defender')) return 0;
  return 0;
};

// --- Activity Milestones for auto-gifting special edition cards ---
export const playFx = (type) => {
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
      triggerConfetti({ particleCount: 300, spread: 100, origin: { y: 0.6 } });
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
export const generateCardForm = (card, opponentCard, env, rng = Math.random) => {
  if (!card) return { state: FORM_STATES[2], bonus: 0 };
  const attr = getPlayerAttr(card).key;
  const rating = Math.max(card.stats.attack, card.stats.defense, card.stats.control) + ((card.level || 1) - 1) * 2;
  
  let weights = [0.10, 0.25, 0.35, 0.20, 0.10];

  let envBonus = 0;
  if (env) {
    if (env.weather === 'Sunny') {
      if (attr === 'speed') { weights[0] += 0.15; weights[1] += 0.15; envBonus += 5; }
      if (attr === 'tech') envBonus += 2;
      if (attr === 'power') { weights[3] += 0.10; weights[4] += 0.05; }
    } else if (env.weather === 'Rainy') {
      if (attr === 'speed') { weights[3] += 0.15; weights[4] += 0.07; envBonus -= 4; }
      if (attr === 'power') { weights[0] += 0.15; weights[1] += 0.15; envBonus += 3; }
    } else if (env.weather === 'Snowy') {
      if (attr === 'speed') { weights[3] += 0.30; weights[4] += 0.15; envBonus -= 8; }
      if (attr === 'power') { weights[0] += 0.15; weights[1] += 0.15; envBonus += 4; }
    } else if (env.weather === 'Windy') {
      if (attr === 'tech') { weights[3] += 0.20; weights[4] += 0.10; envBonus -= 5; }
    } else if (env.weather === 'DesertStorm') {
      if (attr === 'speed' || attr === 'tech') { weights[3] += 0.25; weights[4] += 0.15; envBonus -= 6; }
      if (attr === 'power') { weights[0] += 0.30; weights[1] += 0.15; envBonus += 8; }
    } else if (env.weather === 'DenseFog') {
      if (attr === 'speed' || attr === 'power') { weights[3] += 0.20; weights[4] += 0.10; envBonus -= 5; }
      if (attr === 'tech') { weights[0] += 0.25; weights[1] += 0.15; envBonus += 6; }
    } else if (env.weather === 'Blizzard') {
      if (attr === 'speed') { weights[3] += 0.40; weights[4] += 0.20; envBonus -= 12; }
      if (attr === 'power') { weights[0] += 0.15; weights[1] += 0.10; envBonus += 6; }
    }

    if (env.time === 'Night') {
      if (attr === 'tech') { weights[0] += 0.20; weights[1] += 0.10; envBonus += 3; }
    }
  }

  if (opponentCard) {
    const oppRating = Math.max(opponentCard.stats.attack, opponentCard.stats.defense, opponentCard.stats.control) + ((opponentCard.level || 1) - 1) * 2;
    if (rating <= oppRating - 5) {
      if (rng() < 0.25) {
        weights = [0.90, 0.10, 0.0, 0.0, 0.0];
      }
    }
  }

  const total = weights.reduce((a, b) => a + b, 0);
  const normalized = weights.map(w => w / total);

  const roll = rng();
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
    bonus = Math.floor(rng() * (state.max - state.min + 1)) + state.min;
  } else {
    bonus = state.min;
  }

  return { state, bonus, envBonus };
};

// --- Tactical Synergy & Chemistry Helpers ---
export const getNationEmoji = (nation) => {
  if (!nation) return '🏳️';
  const mapping = {
    'ar': '🇦🇷', 'fr': '🇫🇷', 'no': '🇳🇴', 'gb-eng': '🏴\u200d󠁢󠁥󠁮󠁧󠁿', 'eg': '🇪🇬', 
    'pt': '🇵🇹', 'br': '🇧🇷', 'be': '🇧🇪', 'hr': '🇭🇷', 'sn': '🇸🇳', 
    'dz': '🇩🇿', 'gb-sct': '🏴\u200d󠁢󠁳󠁣󠁴󠁿', 'ca': '🇨🇦', 'ma': '🇲🇦', 'co': '🇨🇴', 
    'us': '🇺🇸', 'mx': '🇲🇽', 'cr': '🇨🇷', 'dk': '🇩🇰', 'ch': '🇨🇭', 
    'gb-wls': '🏴\u200d󠁢󠁷󠁬󠁳󠁿', 'it': '🇮🇹', 'de': '🇩🇪', 'es': '🇪🇸', 'nl': '🇳🇱',
    'uy': '🇺🇾', 'se': '🇸🇪', 'pl': '🇵🇱', 'kr': '🇰🇷', 'jp': '🇯🇵'
  };
  return mapping[nation.toLowerCase()] || '🏳️';
};

export const getRelativeTime = (timestamp) => {
  if (!timestamp) return "";
  const now = Date.now();
  const diffMs = now - timestamp;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffSec < 60) return "vừa xong";
  if (diffMin < 60) return `${diffMin} phút trước`;
  if (diffHr < 24) return `${diffHr} giờ trước`;
  return `${diffDay} ngày trước`;
};

export const getSquadChemistry = (squad) => {
  if (!squad || squad.length === 0) return {};
  const nationCounts = {};
  squad.forEach(p => {
    if (p && p.nation) {
      const nat = p.nation.toLowerCase();
      nationCounts[nat] = (nationCounts[nat] || 0) + 1;
    }
  });
  return nationCounts;
};

export const getPlayerChemistryBoost = (player, squad) => {
  if (!player || !squad || squad.length === 0) return 0;
  const nationCounts = getSquadChemistry(squad);
  const count = nationCounts[player.nation ? player.nation.toLowerCase() : ''] || 0;
  if (count >= 8) return 6;
  if (count >= 5) return 4;
  if (count >= 3) return 2;
  return 0;
};

