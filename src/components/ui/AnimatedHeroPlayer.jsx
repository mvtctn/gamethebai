import React from 'react';

export const AnimatedHeroPlayer = () => {
  return (
    <div className="relative w-full h-full overflow-hidden select-none" style={{
      backgroundImage: "url('/wc2026_banner.png')",
      backgroundSize: "cover",
      backgroundPosition: "center"
    }}>
      <style dangerouslySetInnerHTML={{__html: `
        .banner-card-float {
          width: 100%;
          height: 100%;
          position: absolute;
          inset: 0;
          animation: bannerCardFloat 6s ease-in-out infinite;
        }
        @keyframes bannerCardFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
      `}} />
      <div className="banner-card-float w-full h-full relative" />
    </div>
  );
};
