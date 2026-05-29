export const PITCH_POSITIONS = [
  { top: '80%', left: '50%' }, // GK
  { top: '60%', left: '18%' }, // LB
  { top: '65%', left: '38%' }, // CB1
  { top: '65%', left: '62%' }, // CB2
  { top: '60%', left: '82%' }, // RB
  { top: '40%', left: '28%' }, // CM1
  { top: '45%', left: '50%' }, // CM2
  { top: '40%', left: '72%' }, // CM3
  { top: '20%', left: '25%' }, // LW
  { top: '15%', left: '50%' }, // ST
  { top: '20%', left: '75%' }, // RW
];

export const TIERS = [
  { name: 'Hạng Đồng', minLevel: 1, maxLevel: 5, color: 'text-amber-500 border-amber-500/30 bg-amber-950/20', glow: 'shadow-[0_0_15px_rgba(245,158,11,0.3)]', icon: '🥉' },
  { name: 'Hạng Bạc', minLevel: 6, maxLevel: 10, color: 'text-slate-300 border-slate-300/30 bg-slate-800/20', glow: 'shadow-[0_0_15px_rgba(203,213,225,0.3)]', icon: '🥈' },
  { name: 'Hạng Vàng', minLevel: 11, maxLevel: 15, color: 'text-yellow-400 border-yellow-400/30 bg-yellow-950/20', glow: 'shadow-[0_0_15px_rgba(234,179,8,0.4)]', icon: '🥇' },
  { name: 'Bạch Kim', minLevel: 16, maxLevel: 20, color: 'text-cyan-400 border-cyan-400/30 bg-cyan-950/20', glow: 'shadow-[0_0_15px_rgba(34,211,238,0.4)]', icon: '💎' },
  { name: 'Kim Cương', minLevel: 21, maxLevel: 25, color: 'text-purple-400 border-purple-400/30 bg-purple-950/20', glow: 'shadow-[0_0_15px_rgba(168,85,247,0.4)]', icon: '💠' },
  { name: 'Cao Thủ', minLevel: 26, maxLevel: 30, color: 'text-pink-500 border-pink-500/30 bg-pink-950/20', glow: 'shadow-[0_0_15px_rgba(236,72,153,0.5)]', icon: '👑' },
  { name: 'Thách Đấu', minLevel: 31, maxLevel: 999, color: 'text-rose-500 border-rose-500/30 bg-rose-950/20 animate-pulse', glow: 'shadow-[0_0_20px_rgba(244,63,94,0.6)]', icon: '🔥' },
];

export const AVATAR_PRESETS = [
  { id: 'auto',    label: 'Mặc Định', value: null },
  { id: 'img_boy', label: 'Cậu Bé Vàng', value: 'url(/assets/custom/avatar_cool_boy.png) center/cover no-repeat' },
  { id: 'img_girl',label: 'Bóng Hồng', value: 'url(/assets/custom/avatar_anime_girl.png) center/cover no-repeat' },
  { id: 'img_pro', label: 'Huyền Thoại', value: 'url(/assets/custom/avatar_pro.png) center/cover no-repeat' },
  { id: 'img_masc',label: 'Linh Vật', value: 'url(/assets/custom/avatar_mascot.png) center/cover no-repeat' },
  { id: 'cyblue',  label: 'Xanh Điện', value: 'linear-gradient(135deg, #06b6d4, #2563eb)' },
  { id: 'purpink', label: 'Tím Hồng',  value: 'linear-gradient(135deg, #a855f7, #ec4899)' },
  { id: 'obsidian',label: 'Hắc Diệu',  value: 'linear-gradient(135deg, #1e293b, #0f172a)' }
];

export const BANNER_PRESETS = [
  { id: 'default', label: 'Mặc Định',    value: null },
  { id: 'img_stad',label: '🏟️ Sân Vận Động', value: 'url(/assets/custom/banner_stadium.png) center/cover no-repeat' },
  { id: 'img_cyb', label: '👾 Cyberpunk', value: 'url(/assets/custom/banner_cyberpunk.png) center/cover no-repeat' },
  { id: 'img_champ',label:'🏆 Vô Địch', value: 'url(/assets/custom/banner_champions.png) center/cover no-repeat' },
  { id: 'galaxy',  label: '🌌 Dải Ngân Hà', value: 'linear-gradient(135deg, #0f0c29 0%, #302b63 40%, #24243e 100%)' },
  { id: 'neongrn', label: '💚 Xanh Neon', value: 'linear-gradient(135deg, #064e3b 0%, #065f46 30%, #0d9488 60%, #0f766e 100%)' },
  { id: 'sunset',  label: '🌅 Hoàng Hôn', value: 'linear-gradient(135deg, #0c4a6e 0%, #1e40af 25%, #7c3aed 50%, #db2777 75%, #f97316 100%)' },
  { id: 'aurora',  label: '🎇 Aurora',    value: 'linear-gradient(135deg, #042f2e 0%, #134e4a 25%, #0e7490 50%, #1e3a5f 75%, #312e81 100%)' },
  { id: 'midnite', label: '🌃 Đêm Đen',  value: 'linear-gradient(180deg, #020617 0%, #0f172a 50%, #1e1b4b 100%)' },
];

export const LEVEL_MILESTONES = [
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
export const CARD_TYPE_BONUS = {
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

export const ACTIVITY_MILESTONES = [
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

export const RARITY_LABEL = {
  'Bronze Edition':   { label: 'THẺ ĐỒNG',    color: 'text-amber-600',    bg: 'bg-amber-950/40  border-amber-600/40' },
  'Silver Edition':   { label: 'THẺ BẠC',     color: 'text-slate-300',    bg: 'bg-slate-800/40  border-slate-400/30' },
  'Gold Edition':     { label: 'THẺ VÀNG',    color: 'text-yellow-400',   bg: 'bg-yellow-950/40 border-yellow-400/40' },
  'Golden Baller':    { label: 'THẺ VÀNG',    color: 'text-yellow-400',   bg: 'bg-yellow-950/40 border-yellow-400/40' },
  'Platinum Edition': { label: 'BẠCH KIM',    color: 'text-cyan-400',     bg: 'bg-cyan-950/40   border-cyan-400/40' },
  'Super Limited':    { label: 'SIÊU CẤP ✨', color: 'text-rose-400',     bg: 'bg-rose-950/40   border-rose-400/40' },
  'Icon':             { label: 'SIÊU CẤP ✨', color: 'text-rose-400',     bg: 'bg-rose-950/40   border-rose-400/40' },
};

export const CHECK_IN_REWARDS = [
  { day: 1, name: "50 Xu", icon: "🪙", type: "coins", amount: 50 },
  { day: 2, name: "80 Xu", icon: "🪙", type: "coins", amount: 80 },
  { day: 3, name: "1 Gói Quà", icon: "🎁", type: "pack", amount: 1 },
  { day: 4, name: "120 Xu", icon: "🪙", type: "coins", amount: 120 },
  { day: 5, name: "150 Xu", icon: "🪙", type: "coins", amount: 150 },
  { day: 6, name: "2 Gói Quà", icon: "🎁", type: "pack", amount: 2 },
  { day: 7, name: "Thẻ Siêu Sao", icon: "🌟", type: "card", amount: 1 }
];

export const _LEVEL_MILESTONES_TAIL = [
];

export const ENV_WEATHER = [
  { key: 'Sunny', name: 'Nắng Rực Rỡ ☀️', desc: 'Tốc độ ⚡ +5, Kỹ thuật 🌀 +2' },
  { key: 'Rainy', name: 'Mưa Tầm Tã 🌧️', desc: 'Tốc độ ⚡ -4, Sức mạnh 💪 +3' },
  { key: 'Snowy', name: 'Tuyết Rơi ❄️', desc: 'Tốc độ ⚡ -8, Sức mạnh 💪 +4' },
  { key: 'Windy', name: 'Gió Thổi Mạnh 🌬️', desc: 'Kỹ thuật 🌀 -5' },
  { key: 'Balanced', name: 'Lặng Gió 🍃', desc: 'Phong độ ổn định cho mọi hệ' },
  { key: 'DesertStorm', name: 'Bão Cát Sa Mạc 🏜️', desc: 'Tốc độ ⚡ -6, Kỹ thuật 🌀 -6, Sức mạnh 💪 +8' },
  { key: 'DenseFog', name: 'Sương Mù Dày Đặc 🌫️', desc: 'Tốc độ ⚡ -5, Sức mạnh 💪 -5, Kỹ thuật 🌀 +6' },
  { key: 'Blizzard', name: 'Mưa Tuyết Băng Giá 🌨️', desc: 'Tốc độ ⚡ -12, Sức mạnh 💪 +6' }
];

export const ENV_TIME = [
  { key: 'Night', name: 'Đêm Trăng 🌙', desc: 'Kỹ thuật 🌀 +3 (Ánh đèn sân khấu)' },
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


export const BANNERS = [
  "/wc2026_banner.png",
  "/wc2026_banner_2.png",
  "/wc2026_banner_3.png",
  "/wc2026_banner_4.png",
  "/wc2026_banner_5.png",
  "/wc2026_banner_6.png",
  "/wc2026_banner_7.png",
  "/wc2026_banner_8.png",
  "/wc2026_banner_9.png"
];
