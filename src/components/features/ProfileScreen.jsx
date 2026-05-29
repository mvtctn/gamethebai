import React from 'react';
import playersData from '../../players.json';
import { 
  PITCH_POSITIONS, TIERS, AVATAR_PRESETS, BANNER_PRESETS, LEVEL_MILESTONES, 
  CARD_TYPE_BONUS, ACTIVITY_MILESTONES, RARITY_LABEL, CHECK_IN_REWARDS, 
  ENV_WEATHER, ENV_TIME, FORM_STATES, BANNERS 
} from '../../constants';
import { 
  hashPIN, triggerConfetti, getPlayerTier, getAvatarGradient, getCardTypeBonus, 
  playFx, getPlayerAttr, checkAttrAdvantage, generateCardForm, getNationEmoji, 
  getRelativeTime, getSquadChemistry, getPlayerChemistryBoost 
} from '../../utils';

import { useGameContext } from '../../context/GameContext';
import { PackageOpen, Users, Swords, ChevronRight, CheckCircle2, Lock, Coins, Sparkles, Play, Trophy, Shield, Target, Wifi, User, ChevronLeft, Send, MessageSquare, Mail, History } from 'lucide-react';
import { Card, AnimatedHeroPlayer, ShareModal } from '../ui/SharedComponents';
import { QRCodeSVG } from 'qrcode.react';

export function ProfileScreen() {
  const { setGameState, customBanner, setPreviewAvatar, customAvatar, setPreviewBanner, setIsCustomizingProfile, currentUser, level, squad, equippedTitle, xp, coins, freePacks, stats, setUserWallTarget, setSocialWallTab, quests, rewardedMilestones } = useGameContext();

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col items-center mt-2 sm:mt-8 animate-fade-in px-1 sm:px-4">
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between w-full gap-y-4 mb-8">
            <button className="btn !bg-gray-700 hover:!bg-gray-600 transition-colors flex items-center gap-2 text-xs font-black uppercase tracking-wider !py-2 rounded-full border border-white/10" onClick={() => {
      playFx('click');
      setGameState('lobby');
    }}>
              ← Về Sảnh
            </button>
            <h2 className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 uppercase tracking-widest text-center order-last sm:order-none w-full sm:w-auto mt-2 sm:mt-0">
              👤 Hồ Sơ HLV
            </h2>
            <button className="btn !bg-indigo-700 hover:!bg-indigo-600 transition-colors flex items-center gap-2 text-xs font-black uppercase tracking-wider !py-2 rounded-full border border-indigo-500/30 shadow-lg shadow-indigo-900/30" onClick={() => {
      playFx('click');
      setGameState('settings');
    }}>
              ⚙️ Cài Đặt
            </button>
          </div>

          {/* TWO-COLUMN Dashboard: Profile Info (5/12) + 3D Pitch (7/12) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full items-start">

            {/* COLUMN LEFT (5/12): HLV Info, Tier, Stats */}
            <div className="lg:col-span-5 flex flex-col gap-6">

              {/* === Profile Card === */}
              <div className="glass-panel rounded-3xl overflow-hidden border border-white/10 shadow-2xl relative bg-slate-950/40 ">
                {/* Cover Banner */}
                <div className="h-28 sm:h-36 relative overflow-hidden flex items-center justify-center group/banner cursor-pointer" style={{
          background: customBanner || 'linear-gradient(to right, #164e63, #1e1b4b, #4a044e)'
        }} onClick={() => {
          playFx('click');
          setPreviewAvatar(customAvatar);
          setPreviewBanner(customBanner);
          setIsCustomizingProfile(true);
        }}>
                  <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-black/20 pointer-events-none"></div>
                  <span className="text-white/10 font-black italic tracking-tighter text-4xl sm:text-6xl uppercase select-none pointer-events-none transform -rotate-6">THE BONG DA</span>
                  <div className="absolute top-2 right-2 bg-black/50 backdrop-blur-sm text-white text-xs font-bold px-2 py-1 rounded-lg opacity-0 group-hover/banner:opacity-100 transition-opacity flex items-center gap-1 border border-white/20">✏️ Đổi Banner</div>
                </div>
                <div className="px-6 pb-6 pt-1 flex flex-col items-center text-center relative">
                  {/* Avatar overlapping banner */}
                  <div className="relative group/avatar -mt-12 sm:-mt-14 z-10 cursor-pointer" onClick={() => {
            playFx('click');
            setPreviewAvatar(customAvatar);
            setPreviewBanner(customBanner);
            setIsCustomizingProfile(true);
          }}>
                    <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full flex items-center justify-center border-4 border-slate-950 shadow-2xl" style={{
              background: customAvatar || getAvatarGradient(currentUser),
              boxShadow: '0 0 30px rgba(244,63,94,0.35)'
            }}>
                      <span className="text-4xl sm:text-5xl font-black text-white">{(currentUser || '').charAt(0).toUpperCase()}</span>
                    </div>
                    <span className="absolute -bottom-1 -right-1 bg-gradient-to-r from-yellow-500 to-amber-600 text-slate-950 text-[11px] font-black px-2 py-0.5 rounded-full border-2 border-slate-950 shadow-md">Lv.{level}</span>
                    <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity"><span className="text-lg">✏️</span></div>
                  </div>

                  <h3 className="text-2xl font-black text-white uppercase mt-3 tracking-wider flex items-center gap-2">
                    {currentUser}
                    <span className="text-[9px] bg-fuchsia-950/40 text-fuchsia-400 border border-fuchsia-500/20 px-2 py-0.5 rounded-full uppercase tracking-wider font-extrabold">BẠN</span>
                  </h3>

                  {/* Tier & OVR badges */}
                  <div className="flex items-center gap-2 mt-2 flex-wrap justify-center">
                    {(() => {
              const tier = getPlayerTier(level);
              return <span className={`text-[10px] font-black uppercase px-3 py-1.5 rounded-full border ${tier.color} ${tier.glow}`}>
                          {tier.icon} {tier.name}
                        </span>;
            })()}
                    <span className="text-[10px] px-3 py-1.5 bg-cyan-900/30 text-cyan-400 border border-cyan-500/20 font-black rounded-full uppercase tracking-wider">
                      🔥 {squad.length === 11 ? Math.round(squad.reduce((acc, card) => acc + Math.max(card.stats.attack, card.stats.defense, card.stats.control), 0) / 11) : 0} OVR
                    </span>
                    {equippedTitle && <span className="text-[10px] px-3 py-1.5 bg-amber-950/30 text-amber-400 border border-amber-500/20 font-black rounded-full">
                        {equippedTitle}
                      </span>}
                  </div>

                  {/* XP Progress */}
                  <div className="w-full mt-4 mb-2">
                    <div className="flex justify-between text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 px-1">
                      <span>Cấp Độ HLV</span>
                      <span>{xp} / {level * 100} XP</span>
                    </div>
                    <div className="w-full bg-black/60 rounded-full h-2.5 border border-white/5 overflow-hidden relative">
                      <div className="bg-gradient-to-r from-cyan-400 via-indigo-500 to-purple-500 h-full rounded-full transition-all duration-1000" style={{
                width: `${Math.min(100, xp / (level * 100) * 100)}%`
              }}></div>
                    </div>
                  </div>

                  {/* Coins & Packs */}
                  <div className="w-full grid grid-cols-2 gap-3 border-t border-white/8 pt-4 mt-2">
                    <div className="bg-black/30 p-3 rounded-xl border border-white/5">
                      <div className="text-[9px] text-gray-500 font-bold uppercase tracking-wider mb-1">Ví Xu</div>
                      <div className="text-base font-black text-yellow-400 flex items-center justify-center gap-1"><Coins size={13} /> {coins}</div>
                    </div>
                    <div className="bg-black/30 p-3 rounded-xl border border-white/5">
                      <div className="text-[9px] text-gray-500 font-bold uppercase tracking-wider mb-1">Gói Quà</div>
                      <div className="text-base font-black text-fuchsia-400">🎁 {freePacks}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* === Battle Stats === */}
              <div className="glass-panel rounded-3xl p-6 border border-white/10 shadow-2xl bg-gradient-to-b from-indigo-950/10 to-slate-900/40">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 border-b border-white/5 pb-2 text-center">⚔️ Thống Kê Chiến Đấu</h4>
                <div className="grid grid-cols-2 gap-3 text-center">
                  <div className="bg-slate-900/60 border border-white/5 p-3 rounded-xl">
                    <div className="text-[9px] text-gray-400 font-semibold uppercase mb-1">Tổng Trận</div>
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
                <div className="mt-4 bg-black/40 border border-white/5 rounded-xl p-3 flex justify-between items-center text-xs">
                  <span className="text-gray-400 font-semibold">Tỉ lệ thắng:</span>
                  <span className="font-black text-emerald-400">{stats?.played > 0 ? Math.round(stats.wins / stats.played * 100) : 0}%</span>
                </div>
              </div>

              {/* Quick action buttons */}
              <div className="flex flex-col gap-3">
                <button className="btn !bg-gradient-to-r !from-fuchsia-600 !to-indigo-600 hover:!from-fuchsia-500 hover:!to-indigo-500 w-full !py-3 font-black text-sm tracking-wider rounded-xl shadow-lg shadow-fuchsia-900/30 cursor-pointer" onClick={() => {
          playFx('click');
          setGameState('userWall');
          setUserWallTarget(currentUser);
          setSocialWallTab('owner');
        }}>
                  🐦 Xem Tường X Của Tôi
                </button>
                <button className="btn !bg-gradient-to-r !from-amber-600 !to-yellow-600 hover:!from-amber-500 hover:!to-yellow-500 w-full !py-3 font-black text-sm tracking-wider rounded-xl shadow-lg shadow-amber-900/30 cursor-pointer" onClick={() => {
          playFx('click');
          setGameState('quests');
        }}>
                  📋 Nhiệm Vụ & Thành Tích
                </button>
              </div>
            </div>

            {/* COLUMN RIGHT (7/12): 3D Pitch — full height, spacious */}
            <div className="lg:col-span-7 flex flex-col gap-6">
              <div className="glass-panel rounded-3xl p-6 border border-white/10 shadow-2xl flex flex-col items-center h-full bg-gradient-to-b from-slate-950/50 via-slate-900/40 to-slate-950/50 min-h-[500px]">
                <div className="text-center w-full mb-4">
                  <h4 className="text-sm font-black text-gray-300 uppercase tracking-widest border-b border-white/5 pb-3 flex items-center justify-center gap-2">
                    🏟️ Đội Hình HLV 3D Sân Thi Đấu
                  </h4>
                  <div className="text-[10px] text-cyan-400 font-black uppercase mt-2">
                    {squad.length === 11 ? `OVR Trung Bình: ${Math.round(squad.reduce((acc, card) => acc + Math.max(card.stats.attack, card.stats.defense, card.stats.control), 0) / 11)}` : `Cần thêm ${11 - squad.length} cầu thủ`}
                  </div>
                </div>

                {/* Large Pitch */}
                <div className="w-full flex-1 flex items-center justify-center relative py-2">
                  <div className="pitch-3d-mini w-full max-w-sm sm:max-w-md aspect-[2/3] bg-gradient-to-b from-green-950/40 to-emerald-900/40 border-2 border-emerald-500/30 rounded-3xl relative shadow-[inset_0_0_50px_rgba(16,185,129,0.25)] overflow-hidden">
                    {/* Pitch markings */}
                    <div className="absolute top-1/2 left-0 w-full h-[1px] bg-emerald-500/20"></div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full border border-emerald-500/20"></div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-emerald-500/30"></div>
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-14 border border-t-0 border-emerald-500/20"></div>
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-28 h-14 border border-b-0 border-emerald-500/20"></div>
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-14 h-8 border border-t-0 border-emerald-500/15"></div>
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-14 h-8 border border-b-0 border-emerald-500/15"></div>

                    {/* Squad players */}
                    {squad.map((player, idx) => {
              const pos = PITCH_POSITIONS[idx] || {
                top: '50%',
                left: '50%'
              };
              const ovr = Math.max(player.stats.attack, player.stats.defense, player.stats.control);
              return <div key={player.id} className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group/mini cursor-default" style={{
                top: pos.top,
                left: pos.left,
                zIndex: 10
              }}>
                          <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 border-white/80 shadow-lg flex items-center justify-center text-[8px] font-black text-slate-900 ${player.type === 'Golden Baller' ? 'bg-gradient-to-br from-yellow-400 to-amber-500' : player.type === 'Icon' ? 'bg-gradient-to-br from-fuchsia-400 to-purple-600' : player.type === 'Platinum Edition' ? 'bg-gradient-to-br from-cyan-400 to-sky-500' : 'bg-gradient-to-br from-blue-400 to-cyan-500'}`} title={player.name}>
                            ⭐
                          </div>
                          <div className="bg-black/80 px-1.5 py-0.5 rounded text-[8px] font-bold text-white whitespace-nowrap border border-white/10 shadow-md mt-0.5">
                            {player.name.split(' ').pop()} {ovr}
                          </div>
                        </div>;
            })}

                    {squad.length === 0 && <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                        <div className="text-3xl mb-2">⚽</div>
                        <div className="text-xs text-gray-400 font-bold">Chưa có đội hình</div>
                        <div className="text-[10px] text-gray-500">Hãy xây dựng đội ngay!</div>
                      </div>}
                  </div>
                </div>

                <button className="w-full btn !bg-gradient-to-r !from-indigo-600 !to-blue-600 hover:!from-indigo-500 hover:!to-blue-500 !py-3 text-sm font-black tracking-widest uppercase rounded-xl transition-all cursor-pointer shadow-lg shadow-indigo-950/30 mt-4" onClick={() => {
          playFx('click');
          setGameState('teamBuilder');
        }}>
                  🛠️ Chỉnh Sửa Đội Hình
                </button>
              </div>

              {/* Active Quests mini panel */}
              <div className="glass-panel rounded-3xl p-6 border border-white/10 shadow-xl bg-gradient-to-r from-slate-900/50 to-indigo-950/10">
                <div className="flex justify-between items-center mb-4 border-b border-white/5 pb-2">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">📋 Nhiệm Vụ Đang Chạy</h4>
                  <button className="text-[10px] text-cyan-400 hover:underline uppercase font-bold tracking-widest cursor-pointer" onClick={() => {
            playFx('click');
            setGameState('quests');
          }}>Tất cả ➔</button>
                </div>
                <div className="flex flex-col gap-2">
                  {quests.filter(q => !q.isClaimed).slice(0, 3).map(q => <div key={q.id} className="p-3 bg-black/30 rounded-2xl border border-white/5 flex items-center justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <h5 className="font-extrabold text-xs text-white truncate mb-1">{q.title}</h5>
                        <div className="w-full h-1 bg-gray-800 rounded-full overflow-hidden">
                          <div className="h-full bg-cyan-500 transition-all" style={{
                  width: `${Math.min(100, q.progress / q.target * 100)}%`
                }}></div>
                        </div>
                        <div className="text-[9px] text-gray-500 mt-0.5">{q.progress}/{q.target}</div>
                      </div>
                      <div className="text-yellow-400 text-[10px] font-black shrink-0">+{q.reward}Xu</div>
                    </div>)}
                  {quests.filter(q => !q.isClaimed).length === 0 && <div className="text-center text-xs text-gray-500 py-3">🎉 Đã hoàn thành tất cả nhiệm vụ!</div>}
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
              {quests.map(q => <div key={q.id} className="p-4 bg-black/40 rounded-2xl border border-white/5 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <h5 className="font-extrabold text-xs text-white truncate mb-1">{q.title}</h5>
                    <div className="text-[9px] text-gray-500 font-semibold mb-2">Tiến độ: {q.progress} / {q.target}</div>
                    <div className="w-32 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                      <div className="h-full bg-cyan-500" style={{
              width: `${Math.min(100, q.progress / q.target * 100)}%`
            }}></div>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-yellow-400 text-[10px] font-black mb-1">+{q.reward} Xu</div>
                    {q.isClaimed ? <span className="text-[9px] text-gray-500 font-extrabold uppercase">Đã Nhận ✓</span> : q.isCompleted ? <span className="text-[9px] text-green-400 font-black uppercase animate-pulse">Xong 🎁</span> : <span className="text-[9px] text-gray-500 font-bold uppercase">Đang đá</span>}
                  </div>
                </div>)}
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
                  <div className="h-full bg-gradient-to-r from-fuchsia-500 to-indigo-500 transition-all duration-700" style={{
            width: `${Math.round(rewardedMilestones.length / ACTIVITY_MILESTONES.length * 100)}%`
          }}></div>
                </div>
              </div>
            </div>

            {/* Bonus explanation */}
            <div className="flex flex-wrap gap-2 mb-6 mt-4">
              {[{
        rarity: 'Bronze Edition',
        bonus: '+1',
        icon: '🥉',
        color: 'border-amber-600/40 text-amber-500'
      }, {
        rarity: 'Silver Edition',
        bonus: '+2',
        icon: '🥈',
        color: 'border-slate-400/40 text-slate-300'
      }, {
        rarity: 'Gold Edition',
        bonus: '+4',
        icon: '🥇',
        color: 'border-yellow-400/40 text-yellow-400'
      }, {
        rarity: 'Platinum Edition',
        bonus: '+6',
        icon: '💎',
        color: 'border-cyan-400/40 text-cyan-400'
      }, {
        rarity: 'Super Limited',
        bonus: '+8',
        icon: '👑',
        color: 'border-rose-400/40 text-rose-400 animate-pulse'
      }].map(item => <div key={item.rarity} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border bg-black/30 ${item.color} text-[10px] font-black`}>
                  <span>{item.icon}</span>
                  <span>{item.rarity}</span>
                  <span className="ml-1 bg-white/10 px-1.5 py-0.5 rounded-full">{item.bonus} điểm ưu tiên</span>
                </div>)}
            </div>

            {/* Milestones Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {ACTIVITY_MILESTONES.map(m => {
        const isDone = rewardedMilestones.includes(m.id);
        const currentVal = m.type === 'played' ? stats?.played || 0 : m.type === 'wins' ? stats?.wins || 0 : quests.filter(q => q.isClaimed).length;
        const progress = Math.min(currentVal, m.value);
        const pct = Math.round(progress / m.value * 100);
        const rarityInfo = RARITY_LABEL[m.rarity] || {
          label: m.rarity,
          color: 'text-gray-400',
          bg: 'bg-gray-900/40 border-gray-500/30'
        };
        const cardBonus = getCardTypeBonus(m.rarity);
        return <div key={m.id} className={`relative rounded-2xl p-4 border transition-all duration-300 overflow-hidden ${isDone ? 'bg-gradient-to-br from-emerald-950/40 to-green-900/20 border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.15)]' : 'bg-black/40 border-white/5 hover:border-white/10'}`}>
                    {isDone && <div className="absolute top-2 right-2 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center text-white text-[10px] font-black">✓</div>}
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
                      <div className={`h-full rounded-full transition-all duration-700 ${isDone ? 'bg-gradient-to-r from-emerald-400 to-green-500' : m.rarity === 'Super Limited' ? 'bg-gradient-to-r from-rose-500 to-fuchsia-500' : m.rarity === 'Platinum Edition' ? 'bg-gradient-to-r from-cyan-400 to-sky-500' : m.rarity === 'Gold Edition' || m.rarity === 'Golden Baller' ? 'bg-gradient-to-r from-yellow-400 to-amber-500' : m.rarity === 'Silver Edition' ? 'bg-gradient-to-r from-slate-300 to-slate-400' : 'bg-gradient-to-r from-amber-600 to-amber-700'}`} style={{
              width: `${pct}%`
            }}></div>
                    </div>
                  </div>;
      })}
            </div>
          </div>
        </div>
  );
}
