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

export function ShowroomScreen() {
  const { showroomFilterState, setShowroomFilterState, showroomHoverState, setShowroomHoverState, setGameState } = useGameContext();

  return (
    (() => {
  const SHOWROOM_RARITY_ORDER = ['mythic', 'legendary', 'epic', 'rare', 'common'];
  const rarityConfig = {
    mythic: {
      label: 'SIÊU SAO ⭐⭐⭐⭐⭐',
      color: '#f43f5e',
      glow: 'rgba(244,63,94,0.8)',
      bg: 'from-rose-950/60 to-red-900/40',
      border: 'border-rose-500/60',
      badge: 'bg-rose-500/20 text-rose-300 border-rose-400/40',
      particle: '✦'
    },
    legendary: {
      label: 'HUYỀN THOẠI ⭐⭐⭐⭐',
      color: '#f59e0b',
      glow: 'rgba(245,158,11,0.8)',
      bg: 'from-amber-950/60 to-yellow-900/40',
      border: 'border-amber-500/60',
      badge: 'bg-amber-500/20 text-amber-300 border-amber-400/40',
      particle: '★'
    },
    epic: {
      label: 'SIÊU HIẾM ⭐⭐⭐',
      color: '#a78bfa',
      glow: 'rgba(167,139,250,0.7)',
      bg: 'from-purple-950/60 to-violet-900/40',
      border: 'border-violet-500/50',
      badge: 'bg-violet-500/20 text-violet-300 border-violet-400/40',
      particle: '◆'
    },
    rare: {
      label: 'HIẾM ⭐⭐',
      color: '#60a5fa',
      glow: 'rgba(96,165,250,0.6)',
      bg: 'from-blue-950/60 to-blue-900/30',
      border: 'border-blue-500/40',
      badge: 'bg-blue-500/20 text-blue-300 border-blue-400/40',
      particle: '●'
    },
    common: {
      label: 'THƯỜNG ⭐',
      color: '#9ca3af',
      glow: 'rgba(156,163,175,0.4)',
      bg: 'from-slate-900/60 to-slate-800/30',
      border: 'border-gray-500/30',
      badge: 'bg-gray-700/30 text-gray-400 border-gray-500/30',
      particle: '·'
    }
  };
  const RARITY_TYPE_MAP = {
    mythic: ['Golden Baller'],
    legendary: ['Icon'],
    epic: ['Defensive Rock', 'Midfield Maestro', 'Goal Machine'],
    rare: ['Fan Favourite', 'Top Keeper'],
    common: ['Base']
  };
  const [showroomFilter, setShowroomFilter] = [showroomFilterState, setShowroomFilterState];
  const [showroomHover, setShowroomHover] = [showroomHoverState, setShowroomHoverState];
  const filterTypes = RARITY_TYPE_MAP[showroomFilter] || [];
  const showcasePlayers = playersData.filter(p => filterTypes.includes(p.type)).sort((a, b) => Math.max(b.stats.attack, b.stats.defense, b.stats.control) - Math.max(a.stats.attack, a.stats.defense, a.stats.control));
  const cfg = rarityConfig[showroomFilter] || rarityConfig.mythic;
  return <div className="min-h-screen relative overflow-hidden" style={{
    background: 'radial-gradient(ellipse at top, #0f0c29 0%, #302b63 40%, #0a0a0f 100%)'
  }}>
            {/* Animated star particles background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {[...Array(60)].map((_, i) => <div key={i} className="absolute rounded-full animate-pulse" style={{
        width: Math.random() * 3 + 1 + 'px',
        height: Math.random() * 3 + 1 + 'px',
        top: Math.random() * 100 + '%',
        left: Math.random() * 100 + '%',
        background: ['#f43f5e', '#f59e0b', '#a78bfa', '#60a5fa', '#34d399'][Math.floor(Math.random() * 5)],
        animationDelay: Math.random() * 3 + 's',
        animationDuration: Math.random() * 3 + 2 + 's',
        opacity: Math.random() * 0.8 + 0.2
      }} />)}
            </div>
            {/* Top glow orbs */}
            <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full pointer-events-none" style={{
      background: `radial-gradient(circle, ${cfg.glow} 0%, transparent 70%)`,
      filter: 'blur(60px)',
      opacity: 0.4
    }} />
            <div className="absolute top-0 right-1/4 w-96 h-96 rounded-full pointer-events-none" style={{
      background: `radial-gradient(circle, rgba(167,139,250,0.5) 0%, transparent 70%)`,
      filter: 'blur(60px)',
      opacity: 0.3
    }} />

            <div className="relative z-10 max-w-7xl mx-auto px-4 pt-6 pb-16 sm:pt-10">
              {/* Header */}
              <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
                <button className="btn !bg-white/10 hover:!bg-white/20 border border-white/20 flex items-center gap-2 text-sm" onClick={() => {
          playFx('click');
          setGameState('lobby');
        }}>
                  ← Về Sảnh
                </button>
                <div className="text-center flex-1">
                  <div className="text-xs font-bold uppercase tracking-[0.4em] text-fuchsia-400 mb-1">✦ Bộ Sưu Tập Đỉnh Cao ✦</div>
                  <h1 className="text-3xl sm:text-5xl font-black italic tracking-tight text-transparent bg-clip-text uppercase" style={{
            backgroundImage: `linear-gradient(135deg, #fff 0%, ${cfg.color} 50%, #fff 100%)`
          }}>
                    Phòng Trưng Bày
                  </h1>
                  <p className="text-gray-400 text-xs sm:text-sm mt-1 font-medium">Những thẻ cầu thủ đẳng cấp nhất thế giới ✨</p>
                </div>
                <div className="text-right text-xs text-gray-500 font-bold">
                  <div className="text-fuchsia-400 font-black text-lg">{showcasePlayers.length}</div>
                  <div className="uppercase tracking-wider">Thẻ</div>
                </div>
              </div>

              {/* Rarity Filter Tabs */}
              <div className="flex gap-2 sm:gap-3 justify-center mb-10 flex-wrap">
                {SHOWROOM_RARITY_ORDER.map(rarity => {
          const rc = rarityConfig[rarity];
          const count = playersData.filter(p => (RARITY_TYPE_MAP[rarity] || []).includes(p.type)).length;
          const isActive = showroomFilter === rarity;
          return <button key={rarity} onClick={() => {
            playFx('click');
            setShowroomFilter(rarity);
          }} className={`px-3 sm:px-5 py-2 sm:py-2.5 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-wider border transition-all duration-300 flex items-center gap-1.5 cursor-pointer ${isActive ? 'scale-110 shadow-2xl' : 'opacity-60 hover:opacity-90 hover:scale-105'}`} style={isActive ? {
            background: `rgba(${rc.color.replace('#', '').match(/.{2}/g).map(h => parseInt(h, 16)).join(',')}, 0.2)`,
            borderColor: rc.color,
            color: rc.color,
            boxShadow: `0 0 25px ${rc.glow}`
          } : {
            borderColor: 'rgba(255,255,255,0.15)',
            color: '#9ca3af',
            background: 'rgba(255,255,255,0.05)'
          }}>
                      {rc.particle} {rarity === 'mythic' ? 'Siêu Sao' : rarity === 'legendary' ? 'Huyền Thoại' : rarity === 'epic' ? 'Siêu Hiếm' : rarity === 'rare' ? 'Hiếm' : 'Thường'}
                      <span className="bg-white/10 px-1.5 py-0.5 rounded-full text-[9px]">{count}</span>
                    </button>;
        })}
              </div>

              {/* Rarity Title Banner */}
              <div className="text-center mb-8">
                <div className={`inline-block px-6 py-2 rounded-full border text-sm font-black uppercase tracking-widest ${cfg.badge}`} style={{
          boxShadow: `0 0 30px ${cfg.glow}`
        }}>
                  {cfg.label}
                </div>
              </div>

              {/* Cards Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-5">
                {showcasePlayers.map((player, idx) => {
          const levelBonus = ((player.level || 1) - 1) * 2;
          const maxStat = Math.max(player.stats.attack, player.stats.defense, player.stats.control) + levelBonus;
          const isHovered = showroomHover === (player.id || idx);
          return <div key={player.id || idx} className="relative group cursor-pointer transition-all duration-500" style={{
            transform: isHovered ? 'scale(1.08) translateY(-8px)' : 'scale(1) translateY(0)'
          }} onMouseEnter={() => setShowroomHover(player.id || idx)} onMouseLeave={() => setShowroomHover(null)}>
                      {/* Glow halo behind card */}
                      <div className="absolute inset-0 rounded-2xl transition-all duration-500 pointer-events-none" style={{
              boxShadow: isHovered ? `0 0 50px ${cfg.glow}, 0 20px 60px rgba(0,0,0,0.6)` : `0 0 20px ${cfg.glow.replace('0.8', '0.3')}`,
              background: isHovered ? `radial-gradient(circle at center, ${cfg.glow} 0%, transparent 70%)` : 'transparent',
              filter: 'blur(8px)',
              zIndex: -1,
              transform: 'scale(1.1)'
            }} />

                      {/* Card wrapper */}
                      <div className={`rounded-2xl overflow-hidden border-2 relative ${cfg.border} bg-gradient-to-b ${cfg.bg} backdrop-blur-sm`} style={{
              boxShadow: isHovered ? `0 0 40px ${cfg.glow}, inset 0 0 20px rgba(255,255,255,0.05)` : `0 4px 20px rgba(0,0,0,0.5)`
            }}>

                        {/* Holographic shimmer on hover */}
                        {isHovered && <div className="absolute inset-0 pointer-events-none z-30 rounded-2xl" style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 40%, rgba(255,255,255,0.08) 100%)',
                animation: 'shimmer 1.5s ease-in-out infinite alternate'
              }} />}

                        {/* Rank badge */}
                        {idx < 3 && <div className="absolute top-2 right-2 z-30 text-xs font-black w-6 h-6 rounded-full flex items-center justify-center" style={{
                background: idx === 0 ? 'linear-gradient(135deg, #f59e0b, #d97706)' : idx === 1 ? 'linear-gradient(135deg, #9ca3af, #6b7280)' : 'linear-gradient(135deg, #b45309, #92400e)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.5)'
              }}>
                            {idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉'}
                          </div>}

                        {/* Player image */}
                        <div className="aspect-[4/5] relative overflow-hidden">
                          <div className="absolute inset-0 z-10" style={{
                  background: `linear-gradient(to bottom, transparent 40%, ${showroomFilter === 'mythic' ? '#1a0000' : showroomFilter === 'legendary' ? '#1a1000' : showroomFilter === 'epic' ? '#1a0033' : '#001a33'} 100%)`
                }} />
                          <img src={player.image} alt={player.name} className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-115" onError={e => {
                  e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(player.name)}&background=1e1b4b&color=fff&size=200`;
                }} />
                          {/* Stat overlay bottom */}
                          <div className="absolute bottom-0 left-0 right-0 z-20 p-2">
                            <div className="text-center">
                              <div className="text-3xl font-black text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]" style={{
                      textShadow: `0 0 15px ${cfg.color}`
                    }}>
                                {maxStat}
                              </div>
                              <div className="text-[9px] font-bold text-white/70 uppercase tracking-widest">OVR</div>
                            </div>
                          </div>
                          {/* Nation flag top-left */}
                          {player.nation && player.nation !== 'World' && <div className="absolute top-2 left-2 z-20">
                              <img src={`https://flagcdn.com/w20/${player.nation}.png`} alt={player.nation} className="w-6 h-auto rounded-sm shadow-lg border border-white/30" />
                            </div>}
                        </div>

                        {/* Card footer info */}
                        <div className="p-2 pb-3">
                          <div className="text-[11px] sm:text-xs font-black text-white uppercase tracking-wide text-center truncate leading-tight mb-1">
                            {player.name}
                          </div>
                          <div className="flex justify-around text-center">
                            <div>
                              <div className="text-[10px] font-black text-white">{player.stats.attack + levelBonus}</div>
                              <div className="text-[7px] font-bold text-white/50 uppercase">ATK</div>
                            </div>
                            <div className="w-px bg-white/15" />
                            <div>
                              <div className="text-[10px] font-black text-white">{player.stats.control + levelBonus}</div>
                              <div className="text-[7px] font-bold text-white/50 uppercase">CTRL</div>
                            </div>
                            <div className="w-px bg-white/15" />
                            <div>
                              <div className="text-[10px] font-black text-white">{player.stats.defense + levelBonus}</div>
                              <div className="text-[7px] font-bold text-white/50 uppercase">DEF</div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Floating particles on hover */}
                      {isHovered && <div className="absolute -top-4 left-1/2 -translate-x-1/2 text-lg animate-bounce pointer-events-none z-40" style={{
              color: cfg.color,
              textShadow: `0 0 10px ${cfg.color}`
            }}>
                          {cfg.particle}
                        </div>}
                    </div>;
        })}
              </div>

              {showcasePlayers.length === 0 && <div className="text-center py-20 text-gray-500">
                  <div className="text-5xl mb-4">🎴</div>
                  <div className="font-bold">Chưa có thẻ nào trong hạng mục này.</div>
                </div>}

              {/* Bottom decoration */}
              <div className="text-center mt-16 opacity-30">
                <div className="text-4xl">💎</div>
                <div className="text-xs font-bold uppercase tracking-[0.5em] text-gray-500 mt-2">WC 2026 Ultimate Collection</div>
              </div>
            </div>
          </div>;
})()
  );
}
