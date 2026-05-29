import React from 'react';
import { triggerConfetti } from '../../utils';

export const AnimatedHeroPlayer = () => {
  const confettiCount = 30;
  const particles = Array.from({ length: confettiCount }).map((_, idx) => {
    const left = (idx * 3.3) + Math.random() * 5;
    const delay = Math.random() * 8;
    const duration = 4 + Math.random() * 3;
    const size = 6 + Math.random() * 10;
    const colors = ['#fbbf24', '#38bdf8', '#f43f5e', '#10b981', '#a78bfa', '#c4f000'];
    const color = colors[idx % colors.length];
    const isStar = idx % 3 === 0;
    return { left, delay, duration, size, color, isStar };
  });

  return (
    <div className="relative w-full h-full overflow-hidden select-none" style={{
      backgroundImage: "url('/wc2026_banner.png')",
      backgroundSize: "cover",
      backgroundPosition: "center"
    }}>
      <style dangerouslySetInnerHTML={{__html: `
        .stadium-spotlight-left {
          position: absolute;
          bottom: 0;
          left: 10%;
          width: 80px;
          height: 100%;
          background: linear-gradient(to right, transparent, rgba(56,189,248,0.25), transparent);
          transform-origin: bottom center;
          animation: sweepLightLeft 7s ease-in-out infinite;
          pointer-events: none;
          mix-blend-mode: screen;
          filter: blur(8px);
        }
        .stadium-spotlight-right {
          position: absolute;
          bottom: 0;
          right: 10%;
          width: 80px;
          height: 100%;
          background: linear-gradient(to right, transparent, rgba(56,189,248,0.25), transparent);
          transform-origin: bottom center;
          animation: sweepLightRight 7s ease-in-out infinite;
          pointer-events: none;
          mix-blend-mode: screen;
          filter: blur(8px);
        }
        .trophy-glint {
          position: absolute;
          top: 38%;
          left: 72%;
          transform: translate(-50%, -50%);
          width: 60px;
          height: 60px;
          background: radial-gradient(circle, rgba(255,255,255,0.8) 0%, rgba(251,191,36,0.3) 40%, transparent 70%);
          mix-blend-mode: screen;
          animation: glintPulse 3.5s ease-in-out infinite;
          pointer-events: none;
        }
        .trophy-glint-flare {
          position: absolute;
          top: 38%;
          left: 72%;
          transform: translate(-50%, -50%) rotate(45deg);
          width: 100px;
          height: 2px;
          background: linear-gradient(to right, transparent, #fff, transparent);
          mix-blend-mode: screen;
          animation: flareRotate 3.5s ease-in-out infinite;
          pointer-events: none;
        }
        .falling-confetti {
          position: absolute;
          top: -20px;
          animation: driftDown linear infinite;
          pointer-events: none;
        }
        .banner-card-float {
          width: 100%;
          height: 100%;
          position: absolute;
          inset: 0;
          animation: bannerCardFloat 6s ease-in-out infinite;
        }
        @keyframes sweepLightLeft {
          0%, 100% { transform: rotate(-20deg) scaleX(0.8); }
          50% { transform: rotate(15deg) scaleX(1.3); }
        }
        @keyframes sweepLightRight {
          0%, 100% { transform: rotate(20deg) scaleX(0.8); }
          50% { transform: rotate(-15deg) scaleX(1.3); }
        }
        @keyframes glintPulse {
          0%, 100% { transform: translate(-50%, -50%) scale(0.6); opacity: 0.3; }
          50% { transform: translate(-50%, -50%) scale(1.1); opacity: 0.95; }
        }
        @keyframes flareRotate {
          0%, 100% { transform: translate(-50%, -50%) rotate(0deg) scaleX(0.5); opacity: 0.2; }
          50% { transform: translate(-50%, -50%) rotate(180deg) scaleX(1.2); opacity: 0.8; }
        }
        @keyframes driftDown {
          0% { transform: translateY(-20px) rotate(0deg); opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(520px) rotate(360deg); opacity: 0; }
        }
        @keyframes bannerCardFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
      `}} />

      <div className="banner-card-float w-full h-full relative">
        <div className="stadium-spotlight-left" />
        <div className="stadium-spotlight-right" />

        <div className="trophy-glint" />
        <div className="trophy-glint-flare" />

        {particles.map((p, idx) => (
          <div
            key={idx}
            className="falling-confetti"
            style={{
              left: `${p.left}%`,
              animationDelay: `${p.delay}s`,
              animationDuration: `${p.duration}s`,
              width: `${p.size}px`,
              height: `${p.size}px`,
            }}
          >
            {p.isStar ? (
              <svg viewBox="0 0 24 24" width="100%" height="100%" fill={p.color} className="drop-shadow-[0_0_4px_rgba(251,191,36,0.6)]">
                <path d="M12 .587l3.668 7.431 8.2 1.192-5.934 5.787 1.4 8.168L12 18.896l-7.334 3.857 1.4-8.168L.132 9.21l8.2-1.192z" />
              </svg>
            ) : (
              <div className="w-full h-full rounded-full opacity-80" style={{ backgroundColor: p.color }} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};


