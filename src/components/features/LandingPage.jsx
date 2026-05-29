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
import { AnimatedHeroPlayer } from '../ui/SharedComponents';

export function LandingPage() {
  const { setGameState, activeBannerIdx, authStep, authUsername, setAuthUsername, handleCheckUsername, authCheckingUser, handleVerifyPin, authPin, setAuthPin, setAuthStep, setAuthFoundUser, handleCreateAccount } = useGameContext();

  return (
    <div className="landing-page-wrapper">
          {/* Background */}
          <div className="landing-bg" />

          {/* Top Nav */}
          <nav className="landing-nav">
            <div className="landing-nav-logo">
              <img src="/favicon.png" alt="Logo" className="w-8 h-8 rounded-lg object-contain shadow-md mr-1.5" />
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
                {activeBannerIdx === 0 ? <AnimatedHeroPlayer /> : <div className="relative w-full h-full overflow-hidden select-none">
                    <style dangerouslySetInnerHTML={{
            __html: `
                      .ken-burns-banner {
                        width: 100%;
                        height: 100%;
                        object-fit: cover;
                      }
                      .stadium-spotlight-left-all {
                        display: none;
                      }
                      .stadium-spotlight-right-all {
                        display: none;
                      }
                      .falling-confetti-all {
                        display: none;
                      }
                    `
          }} />
                    
                    <img key={activeBannerIdx} src={BANNERS[activeBannerIdx]} alt="World Cup 2026 Banner" className="ken-burns-banner banner-fade-in" />

                    {/* Active Stadium spotlight beams sweeping across all slides */}
                    <div className="stadium-spotlight-left-all" />
                    <div className="stadium-spotlight-right-all" />

                    {/* Drifting star/confetti overlays for consistent theme energy */}
                    {Array.from({
            length: 15
          }).map((_, idx) => {
            const left = idx * 6.6 + Math.random() * 4;
            const delay = Math.random() * 8;
            const duration = 4.5 + Math.random() * 3.5;
            const size = 6 + Math.random() * 8;
            const colors = ['#fbbf24', '#38bdf8', '#f43f5e', '#10b981', '#a78bfa', '#c4f000'];
            const color = colors[idx % colors.length];
            const isStar = idx % 3 === 0;
            return <div key={idx} className="falling-confetti-all" style={{
              left: `${left}%`,
              animationDelay: `${delay}s`,
              animationDuration: `${duration}s`,
              width: `${size}px`,
              height: `${size}px`
            }}>
                          {isStar ? <svg viewBox="0 0 24 24" width="100%" height="100%" fill={color} className="drop-shadow-[0_0_3px_rgba(255,255,255,0.4)]">
                              <path d="M12 .587l3.668 7.431 8.2 1.192-5.934 5.787 1.4 8.168L12 18.896l-7.334 3.857 1.4-8.168L.132 9.21l8.2-1.192z" />
                            </svg> : <div className="w-full h-full rounded-full opacity-70" style={{
                backgroundColor: color
              }} />}
                        </div>;
          })}
                  </div>}
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
                  {authStep === 'enter_name' ? 'Vào Sân Ngay!' : authStep === 'enter_pin' ? `Chào lại, ${authUsername}!` : `Chào mừng, ${authUsername}!`}
                </h2>
                <p>
                  {authStep === 'enter_name' ? 'Đăng nhập hoặc tạo tài khoản mới để bắt đầu' : authStep === 'enter_pin' ? 'Nhập mã PIN để vào tài khoản của bạn' : 'Tài khoản mới • 3 gói thẻ + 200 xu miễn phí!'}
                </p>
              </div>

              <div className="landing-glass-panel">

                {/* STEP 1: Enter name */}
                {authStep === 'enter_name' && <div className="animate-scale-in">
                    <form onSubmit={handleCheckUsername} className="flex flex-col gap-4">
                      <div className="landing-form-group">
                        <label className="landing-label">🏟️ Tên HLV Của Bạn</label>
                        <input type="text" className="landing-input text-center text-lg font-black tracking-widest" value={authUsername} onChange={e => setAuthUsername(e.target.value)} placeholder="VD: TieuHoang_99..." maxLength={20} autoFocus />
                        <p className="text-[10px] text-gray-500 mt-1 text-center">Tên hiển thị với tất cả mọi người · Tối đa 20 ký tự</p>
                      </div>

                      <button type="submit" className="landing-btn-submit flex items-center justify-center gap-2" disabled={authCheckingUser}>
                        {authCheckingUser ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span> : '⚡'}
                        {authCheckingUser ? 'Đang kiểm tra...' : 'TIẾP THEO'}
                      </button>
                    </form>

                    {/* Auto-login hint */}
                    {(() => {
            const saved = localStorage.getItem('panini_currentUser');
            if (!saved) return null;
            return <div className="mt-4 p-3 bg-green-950/40 border border-green-500/30 rounded-xl text-center">
                          <p className="text-[11px] text-green-400 font-bold">💾 Thiết bị này đã lưu HLV:</p>
                          <button className="text-sm font-black text-white mt-1 hover:text-green-300 transition-colors cursor-pointer" onClick={() => {
                localStorage.setItem('panini_currentUser', saved);
                window.location.reload();
              }}>
                            👤 {saved} — Vào ngay!
                          </button>
                        </div>;
          })()}
                  </div>}

                {/* STEP 2A: Existing user → enter PIN */}
                {authStep === 'enter_pin' && <div className="animate-scale-in">
                    <form onSubmit={handleVerifyPin} className="flex flex-col gap-4">
                      <div className="landing-form-group">
                        <label className="landing-label">🔑 Mã PIN 4 Số</label>
                        <input type="number" inputMode="numeric" pattern="[0-9]*" maxLength={4} className="landing-input text-center text-2xl font-black tracking-[0.5em]" value={authPin} onChange={e => {
                if (e.target.value.length <= 4) setAuthPin(e.target.value);
              }} placeholder="••••" autoFocus />
                      </div>

                      <button type="submit" className="landing-btn-submit flex items-center justify-center gap-2" disabled={authCheckingUser}>
                        {authCheckingUser ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span> : '🚪'}
                        {authCheckingUser ? 'Đang xác minh...' : 'VÀO GAME'}
                      </button>

                      <button type="button" onClick={() => {
              setAuthStep('enter_name');
              setAuthPin('');
              setAuthFoundUser(null);
            }} className="text-[11px] text-gray-500 hover:text-white text-center font-bold uppercase tracking-wider mt-1 cursor-pointer bg-transparent border-0 w-full transition-colors">
                        ← Nhập tên khác
                      </button>
                    </form>
                  </div>}

                {/* STEP 2B: New user → set optional PIN */}
                {authStep === 'set_pin' && <div className="animate-scale-in">
                    <div className="p-3 bg-amber-950/40 border border-amber-500/30 rounded-xl mb-4">
                      <p className="text-[11px] text-amber-300 font-bold text-center leading-relaxed">
                        💡 <strong>Đặt Mã PIN 4 Số</strong> để bảo vệ tài khoản và đăng nhập lại trên mọi thiết bị.<br />
                        <span className="text-gray-400">Để trống nếu chỉ chơi trên thiết bị này.</span>
                      </p>
                    </div>

                    <form onSubmit={handleCreateAccount} className="flex flex-col gap-4">
                      <div className="landing-form-group">
                        <label className="landing-label">🔑 Mã PIN 4 Số (Tuỳ chọn)</label>
                        <input type="number" inputMode="numeric" pattern="[0-9]*" maxLength={4} className="landing-input text-center text-2xl font-black tracking-[0.5em]" value={authPin} onChange={e => {
                if (e.target.value.length <= 4) setAuthPin(e.target.value);
              }} placeholder="Ví dụ: 1234" />
                        <p className="text-[10px] text-gray-500 mt-1 text-center">Chọn số dễ nhớ như ngày sinh · Không cần email</p>
                      </div>

                      <button type="submit" className="landing-btn-submit flex items-center justify-center gap-2" style={{
              background: 'linear-gradient(135deg,#10b981,#059669)'
            }} disabled={authCheckingUser}>
                        {authCheckingUser ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span> : '🚀'}
                        {authCheckingUser ? 'Đang tạo tài khoản...' : 'BẮT ĐẦU HÀNH TRÌNH!'}
                      </button>

                      <button type="button" onClick={() => {
              setAuthStep('enter_name');
              setAuthPin('');
            }} className="text-[11px] text-gray-500 hover:text-white text-center font-bold uppercase tracking-wider mt-1 cursor-pointer bg-transparent border-0 w-full transition-colors">
                        ← Quay lại
                      </button>
                    </form>
                  </div>}

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
  );
}
