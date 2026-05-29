import React from 'react';
import { isConnectedToFirebase } from '../../firebase';

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

export function LeaderboardScreen() {
  const { setGameState, coins, freePacks, leaderboardTab, setLeaderboardTab, loadingLeaderboard, leaderboardData, currentUser, setUserWallTarget, level, xp, claimedLevelRewards, claimMilestone, equippedTitle, setEquippedTitle, collection, stats, checkInState, claimedAchievements, showAlert, setCoins, setClaimedAchievements } = useGameContext();

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center mt-2 sm:mt-8 animate-fade-in px-1 sm:px-4">
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between w-full gap-y-4 mb-8">
            <button className="btn !bg-gray-700 hover:!bg-gray-600 transition-colors flex items-center gap-2" onClick={() => setGameState('lobby')}>
              ← Về Sảnh
            </button>
            <h2 className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 uppercase tracking-widest text-center order-last sm:order-none w-full sm:w-auto mt-2 sm:mt-0">
              BXH & Cấp Hạng 🏆
            </h2>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 bg-black/40 px-4 py-2 rounded-full border border-yellow-500/30">
                <Coins className="text-yellow-400" size={16} />
                <span className="font-bold text-yellow-400 text-sm">{coins} Xu</span>
              </div>
              {freePacks > 0 && <div className="flex items-center gap-1.5 bg-fuchsia-950/20 px-4 py-2 rounded-full border border-fuchsia-500/30 animate-pulse">
                  <span className="text-sm">🎁</span>
                  <span className="font-bold text-fuchsia-400 text-sm">{freePacks} Gói</span>
                </div>}
            </div>
          </div>

          {/* Sub Tab Buttons */}
          <div className="flex bg-slate-900/80 p-1.5 rounded-2xl border border-white/10 w-full max-w-2xl mx-auto mb-8 overflow-x-auto snap-x hide-scrollbar shadow-inner gap-1">
            <button className={`flex-1 min-w-[100px] snap-center py-2.5 px-2 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-widest flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 transition-all duration-300 ${leaderboardTab === 'leaderboard' ? 'bg-gradient-to-r from-yellow-500 to-amber-500 text-black shadow-[0_0_15px_rgba(234,179,8,0.4)]' : 'text-gray-400 hover:text-white hover:bg-white/5'}`} onClick={() => {
      playFx('click');
      setLeaderboardTab('leaderboard');
    }}>
              <span className="text-base sm:text-lg">🏆</span>
              <span className="whitespace-nowrap">Xếp Hạng</span>
            </button>
            <button className={`flex-1 min-w-[100px] snap-center py-2.5 px-2 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-widest flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 transition-all duration-300 ${leaderboardTab === 'tiers' ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-black shadow-[0_0_15px_rgba(6,182,212,0.4)]' : 'text-gray-400 hover:text-white hover:bg-white/5'}`} onClick={() => {
      playFx('click');
      setLeaderboardTab('tiers');
    }}>
              <span className="text-base sm:text-lg">🛡️</span>
              <span className="whitespace-nowrap">Cấp Hạng</span>
            </button>
            <button className={`flex-1 min-w-[100px] snap-center py-2.5 px-2 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-widest flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 transition-all duration-300 ${leaderboardTab === 'milestones' ? 'bg-gradient-to-r from-fuchsia-500 to-pink-500 text-white shadow-[0_0_15px_rgba(217,70,239,0.4)]' : 'text-gray-400 hover:text-white hover:bg-white/5'}`} onClick={() => {
      playFx('click');
      setLeaderboardTab('milestones');
    }}>
              <span className="text-base sm:text-lg">🎁</span>
              <span className="whitespace-nowrap">Quà Cấp Độ</span>
            </button>
            <button className={`flex-1 min-w-[100px] snap-center py-2.5 px-2 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-widest flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 transition-all duration-300 ${leaderboardTab === 'achievements' ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-black shadow-[0_0_15px_rgba(250,204,21,0.4)]' : 'text-gray-400 hover:text-white hover:bg-white/5'}`} onClick={() => {
      playFx('click');
      setLeaderboardTab('achievements');
    }}>
              <span className="text-base sm:text-lg">🏅</span>
              <span className="whitespace-nowrap">Thành Tựu</span>
            </button>
          </div>

          {/* TAB 1: Global Leaderboard */}
          {leaderboardTab === 'leaderboard' && <div className="w-full glass-panel rounded-[2rem] border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] animate-fade-in p-4 sm:p-8">
              <div className="flex flex-col items-center mb-8 text-center">
                <h3 className="text-2xl sm:text-3xl font-black italic uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 mb-2">
                  HLV Xuất Sắc Nhất Lục Địa
                </h3>
                <div className="w-16 h-1 bg-yellow-500 rounded-full shadow-[0_0_10px_#eab308]"></div>
              </div>
              
              {loadingLeaderboard ? <div className="flex flex-col items-center justify-center py-20 gap-4">
                  <div className="w-12 h-12 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
                  <div className="text-yellow-400 font-extrabold tracking-widest text-xs uppercase animate-pulse">Đang tải bảng xếp hạng...</div>
                </div> : leaderboardData.length === 0 ? <div className="text-center py-12 text-gray-500 italic">Chưa có dữ liệu người chơi.</div> : <div className="flex flex-col gap-3">
                  {/* Header Row (Hidden on very small screens) */}
                  <div className="hidden sm:flex items-center justify-between px-6 pb-2 text-[10px] font-black text-gray-500 uppercase tracking-widest border-b border-white/10">
                    <div className="w-12 text-center">Hạng</div>
                    <div className="flex-1 pl-4">Huấn Luyện Viên</div>
                    <div className="w-24 text-center">Đội Hình</div>
                    <div className="w-32 text-center">Thành Tích</div>
                    <div className="w-24 text-right">Bộ Sưu Tập</div>
                  </div>

                  {leaderboardData.map((user, index) => {
        const isMe = user.username === currentUser;
        const rank = index + 1;
        const tier = getPlayerTier(user.level);
        let bgClass = isMe ? 'bg-fuchsia-950/40 border-fuchsia-500/50 shadow-[0_0_20px_rgba(217,70,239,0.15)]' : 'bg-black/40 border-white/5 hover:bg-white/10 hover:border-white/20';
        if (rank === 1) bgClass = 'bg-gradient-to-r from-yellow-950/60 to-black border-yellow-500/50 shadow-[0_0_20px_rgba(234,179,8,0.15)]';else if (rank === 2) bgClass = 'bg-gradient-to-r from-gray-800/60 to-black border-gray-400/50 shadow-[0_0_20px_rgba(156,163,175,0.15)]';else if (rank === 3) bgClass = 'bg-gradient-to-r from-orange-950/60 to-black border-orange-500/50 shadow-[0_0_20px_rgba(249,115,22,0.15)]';
        return <div key={user.username} className={`relative flex items-center justify-between p-3 sm:p-4 rounded-2xl border transition-all duration-300 ${bgClass}`}>
                        {/* Rank Badge */}
                        <div className="w-10 sm:w-14 shrink-0 flex justify-center">
                          {rank === 1 ? <div className="text-3xl sm:text-4xl drop-shadow-[0_0_10px_rgba(234,179,8,0.8)]">🥇</div> : rank === 2 ? <div className="text-3xl sm:text-4xl drop-shadow-[0_0_10px_rgba(156,163,175,0.8)]">🥈</div> : rank === 3 ? <div className="text-3xl sm:text-4xl drop-shadow-[0_0_10px_rgba(249,115,22,0.8)]">🥉</div> : <div className="text-lg sm:text-xl font-black text-gray-500 w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">{rank}</div>}
                        </div>

                        {/* Player Info */}
                        <div className="flex-1 flex flex-col justify-center pl-2 sm:pl-4 overflow-hidden">
                          <div className={`font-black text-sm sm:text-lg truncate cursor-pointer hover:underline ${rank === 1 ? 'text-yellow-400' : rank === 2 ? 'text-gray-300' : rank === 3 ? 'text-orange-400' : isMe ? 'text-fuchsia-400' : 'text-white'}`} onClick={() => {
              playFx('click');
              setGameState('userWall');
              setUserWallTarget(user.username);
            }}>
                            {user.username} {isMe && <span className="text-[9px] sm:text-[10px] ml-1 bg-fuchsia-500/20 text-fuchsia-300 px-1.5 py-0.5 rounded uppercase align-middle">Bạn</span>}
                          </div>
                          <div className="flex items-center gap-1.5 mt-1 sm:mt-1.5 flex-wrap">
                            <span className="text-[9px] sm:text-[10px] font-black text-white bg-white/10 px-2 py-0.5 rounded-full border border-white/10 shadow-sm">
                              Lv.{user.level}
                            </span>
                            <span className={`text-[8px] sm:text-[9px] font-black uppercase px-2 py-0.5 rounded-full border shadow-sm ${tier.color} ${tier.glow}`}>
                              {tier.name}
                            </span>
                          </div>
                        </div>

                        {/* Stats - Mobile Stacks, Desktop Rows */}
                        <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 sm:gap-6 shrink-0 text-right sm:text-center ml-2">
                          <div className="flex flex-col items-center justify-center sm:w-24 bg-black/40 px-2 sm:px-0 py-1 sm:py-2 rounded-xl border border-white/5">
                            <span className="text-[8px] font-bold text-gray-500 uppercase tracking-widest hidden sm:block mb-0.5">OVR</span>
                            <span className="font-black text-xs sm:text-base text-emerald-400">{user.ovr}</span>
                          </div>
                          
                          <div className="hidden sm:flex flex-col items-center justify-center w-32 bg-black/40 py-2 rounded-xl border border-white/5">
                            <span className="text-[8px] font-bold text-gray-500 uppercase tracking-widest mb-0.5">Thắng / Hòa / Thua</span>
                            <div className="text-xs font-black text-gray-300">
                              <span className="text-green-400">{user.wins}</span> - <span className="text-yellow-400">{user.draws}</span> - <span className="text-red-400">{user.losses}</span>
                            </div>
                          </div>

                          <div className="flex flex-col items-center justify-center sm:w-24 bg-black/40 px-2 sm:px-0 py-1 sm:py-2 rounded-xl border border-white/5">
                            <span className="text-[8px] font-bold text-gray-500 uppercase tracking-widest hidden sm:block mb-0.5">Thẻ</span>
                            <span className="font-black text-xs sm:text-base text-purple-400">{user.cardCount}<span className="text-[9px] sm:text-xs text-gray-600">/254</span></span>
                          </div>
                        </div>
                      </div>;
      })}
                </div>}
            </div>}

          {/* TAB 2: Rank Tiers System */}
          {leaderboardTab === 'tiers' && <div className="w-full glass-panel rounded-3xl border border-white/10 shadow-2xl animate-fade-in p-6">
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
                  {level < 31 ? (() => {
          const currentTier = getPlayerTier(level);
          const currentTierIdx = TIERS.findIndex(t => t.name === currentTier.name);
          const nextTier = TIERS[currentTierIdx + 1];
          if (nextTier) {
            const lvlNeeded = nextTier.minLevel - level;
            return <>
                            <div className="text-sm font-bold text-gray-300">Cần thăng thêm <span className="text-cyan-400 font-black">{lvlNeeded} Cấp</span></div>
                            <div className="text-[10px] text-gray-500 font-medium mt-1">Để đột phá lên Cấp Hạng <span className="font-extrabold text-white">{nextTier.icon} {nextTier.name}</span></div>
                          </>;
          }
          return null;
        })() : <div className="text-sm font-black text-rose-500 animate-pulse flex items-center gap-1.5 justify-center md:justify-end">
                      🔥 BẠN ĐÃ ĐẠT CẤP HẠNG TỐI CAO!
                    </div>}
                </div>
              </div>

              {/* Tiers List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {TIERS.map(tier => {
        const isCurrent = level >= tier.minLevel && level <= tier.maxLevel;
        return <div key={tier.name} className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${isCurrent ? 'bg-slate-900 border-white/20 shadow-xl relative overflow-hidden ring-2 ring-cyan-500/40' : 'bg-black/40 border-white/5 opacity-70 hover:opacity-100 hover:border-white/10'}`}>
                      {isCurrent && <span className="absolute -top-1 -right-1 bg-cyan-600 text-white text-[8px] font-black px-2 py-0.5 rounded-bl-lg uppercase tracking-wider animate-pulse">
                          CỦA BẠN
                        </span>}
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
                    </div>;
      })}
              </div>
            </div>}

          {/* TAB 3: Milestone Rewards */}
          {leaderboardTab === 'milestones' && <div className="w-full glass-panel rounded-3xl border border-white/10 shadow-2xl animate-fade-in p-6">
              <div className="flex flex-col items-center mb-8 text-center">
                <h3 className="text-xl font-black italic uppercase tracking-wider text-white mb-2">Quà Tặng Cột Mốc Cấp Độ 🎁</h3>
                <p className="text-gray-400 text-xs sm:text-sm max-w-lg">Nhận các phần quà vô cùng giá trị bao gồm Xu và Gói Thẻ Miễn Phí khi HLV của bạn thăng tiến đạt các cột mốc cấp độ dưới đây!</p>
              </div>

              {/* Progress bar info */}
              <div className="bg-slate-950/40 rounded-2xl border border-white/5 p-5 mb-8 w-full max-w-md mx-auto text-center">
                <div className="text-xs text-gray-400 font-bold uppercase mb-2">Tiến Trình Cấp Độ Của Bạn</div>
                <div className="text-2xl font-black text-white mb-3">Cấp HLV: {level}</div>
                <div className="w-full bg-black/60 rounded-full h-3 border border-white/5 overflow-hidden relative mb-1">
                  <div className="bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 h-full rounded-full transition-all duration-1000" style={{
          width: `${Math.min(100, xp / (level * 100) * 100)}%`
        }}></div>
                </div>
                <div className="text-[10px] text-gray-500 font-semibold">{xp} / {level * 100} XP</div>
              </div>

              {/* Milestone list */}
              <div className="flex flex-col gap-4 w-full max-w-2xl mx-auto">
                {LEVEL_MILESTONES.map(m => {
        const hasReached = level >= m.level;
        const isClaimed = (claimedLevelRewards || []).includes(m.level);
        return <div key={m.level} className={`p-5 rounded-2xl border flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 transition-all ${isClaimed ? 'bg-black/50 border-gray-700 opacity-60' : hasReached ? 'bg-gradient-to-r from-yellow-950/20 to-slate-900 border-yellow-500/40 shadow-xl shadow-yellow-950/10' : 'bg-black/40 border-white/5'}`}>
                      {/* Left side: milestone info */}
                      <div className="flex items-center gap-4">
                        <div className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center font-black text-lg border shadow-lg shrink-0 ${isClaimed ? 'bg-gray-800 text-gray-500 border-gray-700' : hasReached ? 'bg-gradient-to-br from-yellow-400 to-amber-500 text-black border-yellow-300 shadow-yellow-900/30' : 'bg-slate-900 text-gray-300 border-white/10'}`}>
                          <span className="text-[9px] uppercase tracking-wider font-bold mb-0.5 leading-none">Cấp</span>
                          <span className="leading-none">{m.level}</span>
                        </div>
                        <div>
                          <h4 className="text-sm sm:text-base font-extrabold text-white mb-0.5">{m.desc}</h4>
                          <div className="flex items-center gap-3">
                            {m.coins > 0 && <span className="text-xs text-yellow-400 font-bold flex items-center gap-1">
                                <Coins size={12} /> +{m.coins} Xu
                              </span>}
                            {m.packs > 0 && <span className="text-xs text-fuchsia-400 font-bold flex items-center gap-1">
                                🎁 +{m.packs} Gói Thẻ Miễn Phí
                              </span>}
                          </div>
                        </div>
                      </div>

                      {/* Right side: action buttons */}
                      <div className="flex items-center justify-end">
                        {isClaimed ? <button className="btn !bg-gray-700 text-gray-500 !py-2 !px-5 rounded-xl font-bold uppercase tracking-wider text-xs cursor-not-allowed" disabled>
                            Đã Nhận ✓
                          </button> : hasReached ? <button className="btn !bg-gradient-to-r !from-green-500 !to-emerald-500 hover:!from-green-600 hover:!to-emerald-600 text-white !py-2.5 !px-6 rounded-xl font-black uppercase tracking-widest text-xs animate-bounce-subtle cursor-pointer shadow-lg shadow-green-900/30 transition-all hover:scale-105 active:scale-95" onClick={() => claimMilestone(m)}>
                            Nhận Quà 🎁
                          </button> : <button className="btn !bg-gray-800 text-gray-600 !py-2 !px-5 rounded-xl font-bold uppercase tracking-wider text-xs cursor-not-allowed" disabled>
                            Chưa Đạt 🔒
                          </button>}
                      </div>
                    </div>;
      })}
              </div>
            </div>}

          {/* TAB 4: Achievements & Titles */}
          {leaderboardTab === 'achievements' && <div className="w-full glass-panel rounded-3xl border border-white/10 shadow-2xl animate-fade-in p-6">
              <div className="flex flex-col items-center mb-8 text-center">
                <h3 className="text-xl font-black italic uppercase tracking-wider text-white mb-2">Thành Tựu & Danh Hiệu 🏆</h3>
                <p className="text-gray-400 text-xs sm:text-sm max-w-lg">Hoàn thành các thành tựu để nhận Xu thưởng và mở khóa các **Danh hiệu Chat** lấp lánh để thể hiện đẳng cấp!</p>
              </div>

              {/* Equipped Title Display */}
              <div className="bg-slate-950/40 rounded-2xl border border-white/5 p-4 mb-8 w-full max-w-md mx-auto text-center flex flex-col items-center gap-2">
                <div className="text-xs text-gray-400 font-bold uppercase">Danh Hiệu Đang Sử Dụng</div>
                {equippedTitle ? <div className="flex items-center gap-2">
                    <span className="text-sm font-black px-3 py-1 rounded-full bg-gradient-to-r from-yellow-500 to-amber-500 text-black border border-yellow-400/40 shadow-[0_0_15px_rgba(234,179,8,0.4)] animate-pulse">
                      {equippedTitle}
                    </span>
                    <button className="text-xs text-red-400 hover:text-red-300 font-bold hover:underline" onClick={() => {
          playFx('click');
          setEquippedTitle("");
        }}>
                      Tháo bỏ
                    </button>
                  </div> : <span className="text-xs text-gray-500 italic">Chưa trang bị danh hiệu nào</span>}
              </div>

              {/* Achievements list */}
              <div className="flex flex-col gap-4 w-full max-w-2xl mx-auto">
                {(() => {
        const uniqueCards = new Set(collection.map(c => c.id)).size;
        const achievementsList = [{
          id: 'played_10_ai',
          title: 'Chinh Phục AI',
          desc: 'Chơi 10 trận với AI',
          target: 10,
          current: stats?.played || 0,
          rewardCoins: 200,
          rewardTitle: '🏆 Vua Đấu Tập'
        }, {
          id: 'wins_15_ai',
          title: 'Khủng Bố Máy Tập',
          desc: 'Thắng 15 trận với AI',
          target: 15,
          current: stats?.wins || 0,
          rewardCoins: 300,
          rewardTitle: '✨ Thợ Săn AI'
        }, {
          id: 'collection_30',
          title: 'Nhà Sưu Tầm',
          desc: 'Sở hữu 30 thẻ cầu thủ khác nhau',
          target: 30,
          current: uniqueCards,
          rewardCoins: 250,
          rewardTitle: '👑 Nhà Sưu Tầm'
        }, {
          id: 'level_10',
          title: 'HLV Trưởng Thành',
          desc: 'Đạt HLV Cấp độ 10',
          target: 10,
          current: level,
          rewardCoins: 300,
          rewardTitle: '⚡ HLV Lão Luyện'
        }, {
          id: 'streak_checkin_5',
          title: 'HLV Chuyên Cần',
          desc: 'Điểm danh đạt chuỗi 5 ngày',
          target: 5,
          current: checkInState.streak || 0,
          rewardCoins: 150,
          rewardTitle: '📅 Trọng Tài Siêu Cấp'
        }];
        return achievementsList.map(ach => {
          const isCompleted = ach.current >= ach.target;
          const isClaimed = claimedAchievements.includes(ach.id);
          const isEquipped = equippedTitle === ach.rewardTitle;
          return <div key={ach.id} className={`p-5 rounded-2xl border flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 transition-all ${isClaimed ? 'bg-black/50 border-gray-700 opacity-60' : isCompleted ? 'bg-gradient-to-r from-yellow-950/20 to-slate-900 border-yellow-500/40 shadow-xl shadow-yellow-950/10' : 'bg-black/40 border-white/5'}`}>
                        {/* Info details */}
                        <div className="flex items-center gap-4">
                          <div className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center font-black text-xl border shadow-lg shrink-0 ${isClaimed ? 'bg-gray-800 text-gray-500 border-gray-700' : isCompleted ? 'bg-gradient-to-br from-yellow-400 to-amber-500 text-black border-yellow-300 shadow-yellow-900/30' : 'bg-slate-900 text-gray-300 border-white/10'}`}>
                            🏆
                          </div>
                          <div>
                            <h4 className="text-sm sm:text-base font-extrabold text-white mb-0.5">
                              {ach.title} ({Math.min(ach.current, ach.target)}/{ach.target})
                            </h4>
                            <p className="text-xs text-gray-400 font-semibold mb-1.5">{ach.desc}</p>
                            <div className="flex items-center gap-3">
                              <span className="text-xs text-yellow-400 font-bold flex items-center gap-1">
                                <Coins size={12} /> +{ach.rewardCoins} Xu
                              </span>
                              <span className="text-xs text-cyan-400 font-bold flex items-center gap-1">
                                🏷️ Danh hiệu: <span className="text-yellow-400 underline font-extrabold">{ach.rewardTitle}</span>
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Action Area */}
                        <div className="flex items-center justify-end gap-2">
                          {isClaimed ? isEquipped ? <button className="btn !bg-yellow-500 text-black !py-2.5 !px-5 rounded-xl font-black uppercase tracking-widest text-xs cursor-pointer active:scale-95 shadow-md shadow-yellow-900/30" onClick={() => {
                playFx('click');
                setEquippedTitle("");
              }}>
                                Đang Dùng ✓
                              </button> : <button className="btn !bg-slate-800 text-yellow-400 border border-yellow-500/20 hover:border-yellow-500/50 !py-2.5 !px-5 rounded-xl font-bold uppercase tracking-widest text-xs cursor-pointer active:scale-95 transition-all" onClick={() => {
                playFx('click');
                setEquippedTitle(ach.rewardTitle);
                showAlert("🏷️ Danh Hiệu Đã Đeo!", `Bạn đã đeo danh hiệu [${ach.rewardTitle}] thành công! Danh hiệu này sẽ hiển thị bên cạnh tên của bạn trong Sảnh Chat và Tin nhắn.`);
              }}>
                                Sử Dụng
                              </button> : isCompleted ? <button className="btn !bg-gradient-to-r !from-green-500 !to-emerald-500 hover:!from-green-600 hover:!to-emerald-600 text-white !py-2.5 !px-6 rounded-xl font-black uppercase tracking-widest text-xs animate-bounce-subtle cursor-pointer shadow-lg shadow-green-900/30 transition-all hover:scale-105 active:scale-95" onClick={() => {
                playFx('winGame');
                setCoins(c => c + ach.rewardCoins);
                const nextClaimed = [...claimedAchievements, ach.id];
                setClaimedAchievements(nextClaimed);
                // Also auto-equip for immediate delight!
                setEquippedTitle(ach.rewardTitle);
                triggerConfetti({
                  particleCount: 200,
                  spread: 80
                });
                showAlert("🎉 Hoàn Thành Thành Tựu!", `Chúc mừng! Bạn nhận được +${ach.rewardCoins} Xu & Đã mở khóa + Trang bị danh hiệu [${ach.rewardTitle}]!`);
              }}>
                              Nhận 🎁
                            </button> : <button className="btn !bg-gray-800 text-gray-600 !py-2 !px-5 rounded-xl font-bold uppercase tracking-wider text-xs cursor-not-allowed" disabled>
                              Chưa Đạt 🔒
                            </button>}
                        </div>
                      </div>;
        });
      })()}
              </div>
            </div>}
        </div>
  );
}
