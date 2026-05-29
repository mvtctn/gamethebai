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

export function SettingsScreen() {
  const { setGameState, coins, handleUpdateEmail, profileEmailInput, setProfileEmailInput, email, handleUpdatePassword, profileOldPassword, setProfileOldPassword, profileNewPassword, setProfileNewPassword, profileConfirmPassword, setProfileConfirmPassword, handleRenameUser, currentUser, newUsernameInput, setNewUsernameInput, isRenaming, showAlert, referredBy, refCodeInput, setRefCodeInput, submitReferralCode, referrals, claimReferralReward } = useGameContext();

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col items-center mt-2 sm:mt-8 animate-fade-in px-2 sm:px-4">
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between w-full gap-y-3 mb-8">
            <div className="flex items-center gap-2">
              <button className="btn !bg-gray-800 hover:!bg-gray-700 transition-colors flex items-center gap-2 text-xs font-black uppercase tracking-wider !py-2 rounded-full border border-white/10" onClick={() => {
        playFx('click');
        setGameState('profile');
      }}>
                ← Hồ Sơ
              </button>
              <button className="btn !bg-slate-800 hover:!bg-slate-700 transition-colors flex items-center gap-2 text-xs font-black uppercase tracking-wider !py-2 rounded-full border border-white/10" onClick={() => {
        playFx('click');
        setGameState('lobby');
      }}>
                🏠 Sảnh
              </button>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400 uppercase tracking-widest text-center">
              ⚙️ Cài Đặt HLV
            </h2>
            <div className="flex items-center gap-2 bg-black/40 px-4 py-2 rounded-full border border-yellow-500/30">
              <Coins className="text-yellow-400" size={14} />
              <span className="font-bold text-yellow-400 text-xs">{coins} Xu</span>
            </div>
          </div>

          {/* Settings Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">

            {/* Recovery Email Card */}
            <div className="glass-panel rounded-3xl p-7 border border-purple-500/20 shadow-2xl bg-gradient-to-b from-purple-950/20 to-slate-900/60 flex flex-col gap-5 relative overflow-hidden">
              {/* Decorative accent removed for GPU perf */}
              <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg">
                  <Mail size={18} className="text-white" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-white uppercase tracking-wider">Bảo Mật Tài Khoản</h4>
                  <p className="text-[10px] text-gray-400 font-semibold mt-0.5">Email khôi phục khi quên mật khẩu</p>
                </div>
              </div>
              <form onSubmit={handleUpdateEmail} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Email Khôi Phục</label>
                  <input type="email" className="bg-black/50 border border-white/10 px-4 py-3 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-colors w-full font-medium" placeholder="your@email.com" value={profileEmailInput} onChange={e => setProfileEmailInput(e.target.value)} />
                </div>
                <button type="submit" className="btn !bg-gradient-to-r !from-cyan-600 !to-blue-600 hover:!from-cyan-500 hover:!to-blue-500 !py-2.5 text-xs font-black tracking-widest uppercase rounded-xl transition-all cursor-pointer shadow-lg shadow-cyan-900/20">
                  💾 Lưu Email
                </button>
              </form>
              {email && <div className="text-[10px] text-emerald-400 font-bold flex items-center gap-1.5 bg-emerald-950/30 border border-emerald-500/20 px-3 py-2 rounded-xl">
                  <CheckCircle2 size={12} /> Email hiện tại: {email}
                </div>}
            </div>

            {/* Change Password Card */}
            <div className="glass-panel rounded-3xl p-7 border border-indigo-500/20 shadow-2xl bg-gradient-to-b from-indigo-950/20 to-slate-900/60 flex flex-col gap-5 relative overflow-hidden">
              {/* Decorative accent removed for GPU perf */}
              <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg">
                  <Lock size={18} className="text-white" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-white uppercase tracking-wider">Đổi Mật Khẩu</h4>
                  <p className="text-[10px] text-gray-400 font-semibold mt-0.5">Bảo vệ tài khoản HLV của bạn</p>
                </div>
              </div>
              <form onSubmit={handleUpdatePassword} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Mật Khẩu Hiện Tại</label>
                  <input type="password" className="bg-black/50 border border-white/10 px-4 py-3 rounded-xl text-sm text-white focus:outline-none focus:border-purple-500 transition-colors w-full" value={profileOldPassword} onChange={e => setProfileOldPassword(e.target.value)} placeholder="••••••••" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Mật Khẩu Mới</label>
                  <input type="password" className="bg-black/50 border border-white/10 px-4 py-3 rounded-xl text-sm text-white focus:outline-none focus:border-purple-500 transition-colors w-full" value={profileNewPassword} onChange={e => setProfileNewPassword(e.target.value)} placeholder="••••••••" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Xác Nhận Mật Khẩu Mới</label>
                  <input type="password" className="bg-black/50 border border-white/10 px-4 py-3 rounded-xl text-sm text-white focus:outline-none focus:border-purple-500 transition-colors w-full" value={profileConfirmPassword} onChange={e => setProfileConfirmPassword(e.target.value)} placeholder="••••••••" />
                </div>
                <button type="submit" className="btn !bg-gradient-to-r !from-purple-600 !to-indigo-600 hover:!from-purple-500 hover:!to-indigo-500 !py-2.5 text-xs font-black tracking-widest uppercase rounded-xl transition-all cursor-pointer shadow-lg shadow-purple-900/20">
                  🔒 Đổi Mật Khẩu
                </button>
              </form>
            </div>

            {/* Rename HLV Card */}
            <div className="glass-panel rounded-3xl p-7 border border-emerald-500/20 shadow-2xl bg-gradient-to-b from-emerald-950/20 to-slate-900/60 flex flex-col gap-5 relative overflow-hidden">
              <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg">
                  <User size={18} className="text-white" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-white uppercase tracking-wider">Đổi Tên HLV</h4>
                  <p className="text-[10px] text-gray-400 font-semibold mt-0.5">Thay đổi danh tính nhà cầm quân</p>
                </div>
              </div>
              <form onSubmit={handleRenameUser} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Tên HLV Hiện Tại</label>
                  <div className="bg-black/30 border border-white/5 px-4 py-2.5 rounded-xl text-xs text-gray-400 font-extrabold select-none">
                    {currentUser}
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Tên HLV Mới</label>
                  <input type="text" className="bg-black/50 border border-white/10 px-4 py-3 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors w-full font-medium" value={newUsernameInput} onChange={e => setNewUsernameInput(e.target.value)} placeholder="Nhập tên HLV mới..." required />
                </div>
                <button type="submit" disabled={isRenaming} className="btn !bg-gradient-to-r !from-emerald-600 !to-teal-600 hover:!from-emerald-500 hover:!to-teal-500 !py-2.5 text-xs font-black tracking-widest uppercase rounded-xl transition-all cursor-pointer shadow-lg shadow-emerald-900/20">
                  {isRenaming ? 'Đang Xử Lý...' : '🔄 Đổi Tên HLV'}
                </button>
              </form>
            </div>

            {/* Referral Panel — full width */}
            <div className="lg:col-span-3 glass-panel rounded-3xl p-7 border border-amber-500/20 shadow-2xl bg-gradient-to-b from-amber-950/10 to-slate-900/40 flex flex-col gap-5 relative overflow-hidden">
              {/* Decorative accent removed for GPU perf */}
              <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center shadow-lg">
                  <Sparkles size={18} className="text-slate-900" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-white uppercase tracking-wider">🎁 Giới Thiệu Bạn Bè</h4>
                  <p className="text-[10px] text-gray-400 font-semibold mt-0.5">Mời bạn bè – nhận phần thưởng hấp dẫn</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Referral Code */}
                <div className="bg-black/50 border border-amber-500/30 rounded-2xl p-4 text-center relative overflow-hidden cursor-pointer group" onClick={() => {
          navigator.clipboard.writeText(currentUser);
          showAlert('📋 Đã Sao Chép!', 'Hãy gửi mã cho bạn bè!');
        }}>
                  <div className="text-[9px] text-amber-400 font-bold uppercase tracking-widest mb-1">Mã Giới Thiệu Của Bạn</div>
                  <div className="text-lg font-black text-white group-hover:text-amber-300 transition-colors">{currentUser} 📋</div>
                  <div className="text-[9px] text-gray-500 mt-1">Click để copy</div>
                </div>
                {/* Submit referral */}
                {!referredBy ? <div className="bg-slate-950/40 border border-white/5 p-4 rounded-2xl flex flex-col gap-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Nhập Mã Bạn Bè</label>
                    <div className="flex gap-2">
                      <input type="text" placeholder="Tên HLV giới thiệu..." className="bg-black/50 border border-white/10 px-3 py-2 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 flex-1" value={refCodeInput} onChange={e => setRefCodeInput(e.target.value)} />
                      <button type="button" className="btn !bg-cyan-600 hover:!bg-cyan-500 !py-2 !px-3 text-xs font-black rounded-xl cursor-pointer" onClick={() => {
              if (refCodeInput.trim()) {
                submitReferralCode(refCodeInput);
                setRefCodeInput('');
              }
            }}>Nhập</button>
                    </div>
                    <div className="text-[9px] text-gray-500">+50 Xu cho tài khoản mới &lt; Cấp 5</div>
                  </div> : <div className="bg-emerald-950/20 border border-emerald-500/20 p-4 rounded-2xl text-center flex items-center justify-center">
                    <span className="text-[11px] font-bold text-emerald-400">✓ Đã nhập mã từ HLV: <span className="underline font-black">{referredBy}</span></span>
                  </div>}
              </div>
              {/* Friends list */}
              <div>
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">HLV Đã Mời ({referrals.length})</div>
                <div className="flex flex-col gap-2 max-h-32 overflow-y-auto pr-1">
                  {referrals.map(refItem => {
            const canClaim = refItem.level >= 5 && !refItem.claimed;
            return <div key={refItem.username} className="flex justify-between items-center bg-black/40 border border-white/5 p-2.5 rounded-xl text-xs">
                        <div>
                          <div className="font-extrabold text-white">{refItem.username}</div>
                          <div className="text-[9px] text-gray-500 uppercase tracking-wider">Level {refItem.level} {refItem.level >= 5 ? '🎯 Hoàn Thành' : '⏳ Cần Cấp 5'}</div>
                        </div>
                        {refItem.claimed ? <span className="text-[9px] bg-white/5 text-gray-500 px-2 py-1 rounded-full font-black border border-white/5">ĐÃ NHẬN 🎁</span> : canClaim ? <button type="button" className="btn !bg-yellow-500 text-black font-black text-[9px] px-2.5 py-1 rounded-full animate-bounce" onClick={() => claimReferralReward(refItem.username)}>Nhận 🎁</button> : <span className="text-[9px] text-gray-400 font-black">Chờ Cấp 5</span>}
                      </div>;
          })}
                </div>
              </div>
            </div>

          </div>
        </div>
  );
}
