import React from 'react';
import { useGameContext } from '../../context/GameContext';
import { PackageOpen, Users, Swords, ChevronRight, CheckCircle2, Lock, Coins, Sparkles, Play, Trophy, Shield, Target, Wifi, User, ChevronLeft, Send, MessageSquare, Mail, History } from 'lucide-react';
import { Card, AnimatedHeroPlayer, ShareModal } from '../ui/SharedComponents';
import { QRCodeSVG } from 'qrcode.react';

export function PackOpeningScreen() {
  const { setOpenedCards, setRevealingCards, setGameState, coins, pityCounter, openedCards, isPackOpeningAnim, PACK_CONFIGS, packType, freePacks, setPackType, RARITY_TIERS, openPack, setSelectedUpgradeCard } = useGameContext();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-purple-950/20 to-slate-950 p-4 sm:p-8 pt-20 overflow-y-auto">
          <div className="max-w-4xl mx-auto">

            {/* Header */}
            <div className="flex flex-wrap items-center justify-between w-full gap-y-4 mb-6">
              <button className="text-gray-400 hover:text-white bg-black/40 hover:bg-black/80 px-3 py-1.5 rounded-full text-xs font-bold border border-white/10 transition-all" onClick={() => {
        setOpenedCards([]);
        setRevealingCards([]);
        setGameState('lobby');
      }}>
                ← Về Sảnh
              </button>
              <h2 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-cyan-400 uppercase tracking-widest text-center order-last sm:order-none w-full sm:w-auto mt-2 sm:mt-0">Mở Gói Thẻ</h2>
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
                <div className="h-full rounded-full transition-all duration-500" style={{
          width: `${pityCounter / 10 * 100}%`,
          background: pityCounter >= 8 ? 'linear-gradient(90deg,#f43f5e,#fbbf24)' : 'linear-gradient(90deg,#a855f7,#6366f1)'
        }} />
              </div>
              <p className="text-[9px] text-gray-500 mt-1">
                {pityCounter >= 9 ? '🔥 Gói tiếp theo BẢO ĐẢM ra Siêu Sao!' : `Còn ${10 - pityCounter} gói nữa để bảo đảm Siêu Sao`}
              </p>
            </div>

            {/* Pack type selector */}
            {openedCards.length === 0 && !isPackOpeningAnim && <div className="mb-6">
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">📦 Chọn Loại Gói</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                  {Object.entries(PACK_CONFIGS).map(([key, cfg]) => {
          const isSelected = packType === key;
          const canAfford = key === 'starter' ? freePacks > 0 : coins >= cfg.cost;
          return <button key={key} className={`p-3 rounded-2xl border flex flex-col items-center gap-1 transition-all cursor-pointer ${isSelected ? key === 'champion' ? 'bg-cyan-950/60 border-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.4)]' : 'bg-fuchsia-900/40 border-fuchsia-500/60 shadow-[0_0_20px_rgba(217,70,239,0.2)]' : canAfford ? 'bg-black/40 border-white/10 hover:border-white/30' : 'bg-black/20 border-white/5 opacity-40'}`} onClick={() => canAfford && setPackType(key)} disabled={!canAfford}>
                        <span className="text-2xl">{cfg.emoji}</span>
                        <span className="text-[11px] font-black text-white">{cfg.name}</span>
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${key === 'starter' ? 'bg-green-900/50 text-green-400 border border-green-500/30' : key === 'champion' ? 'bg-cyan-900/50 text-cyan-300 border border-cyan-500/30' : key === 'ultimate' ? 'bg-rose-900/50 text-rose-400 border border-rose-500/30' : 'bg-yellow-900/50 text-yellow-400 border border-yellow-500/30'}`}>
                          {key === 'starter' ? freePacks > 0 ? `${freePacks} miễn phí` : 'Hết gói' : `${cfg.cost} Xu`}
                        </span>
                        <span className="text-[8px] text-gray-500">{cfg.cards} thẻ · đảm {cfg.guaranteedRare} hiếm+</span>
                      </button>;
        })}
                </div>
              </div>}

            {/* Rarity legend */}
            {openedCards.length === 0 && !isPackOpeningAnim && <div className="mb-6 p-3 bg-black/30 rounded-2xl border border-white/5">
                <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-2">Phân Hạng Thẻ</p>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(RARITY_TIERS).map(([key, tier]) => <span key={key} className="text-[9px] font-bold px-2 py-1 rounded-full border" style={{
          color: tier.color,
          borderColor: tier.color + '40',
          background: tier.color + '15'
        }}>
                      {tier.star} {tier.label}
                    </span>)}
                </div>
              </div>}

            {/* Pack visual / open button */}
            {openedCards.length === 0 && <div className="flex flex-col items-center gap-4 mb-8">
                {isPackOpeningAnim ? <div className="flex flex-col items-center gap-4 py-12">
                    <div className="w-24 h-24 border-4 border-fuchsia-500 border-t-transparent rounded-full animate-spin" />
                    <p className="text-white font-black text-lg animate-pulse">Khủ đang xổ thẻ...</p>
                    <div className="flex gap-1">
                      {['🌟', '✨', '💫', '🌟', '✨'].map((s, i) => <span key={i} className="text-xl animate-bounce" style={{
            animationDelay: `${i * 150}ms`
          }}>{s}</span>)}
                    </div>
                  </div> : <div className="relative cursor-pointer group" onClick={() => openPack(packType)}>
                    <div className="absolute inset-0 bg-fuchsia-500/20 rounded-3xl blur-2xl group-hover:bg-fuchsia-500/40 transition-all duration-500" />
                    <div className="relative w-48 h-64 bg-gradient-to-b from-fuchsia-900/60 to-purple-950/80 rounded-3xl border-2 border-fuchsia-500/50 group-hover:border-fuchsia-400 shadow-[0_0_60px_rgba(217,70,239,0.3)] group-hover:shadow-[0_0_80px_rgba(217,70,239,0.5)] transition-all duration-300 group-hover:scale-105 flex flex-col items-center justify-center gap-3">
                      <span className="text-6xl group-hover:scale-110 transition-transform duration-300">{PACK_CONFIGS[packType].emoji}</span>
                      <span className="text-sm font-black text-white uppercase tracking-widest">{PACK_CONFIGS[packType].name}</span>
                      <span className="text-xs text-fuchsia-300 font-bold">👆 Nhấn để mở</span>
                      {pityCounter >= 8 && <span className="absolute -top-2 -right-2 bg-rose-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full animate-bounce">🔥 GẦN!</span>}
                    </div>
                  </div>}
              </div>}

            {/* Cards reveal grid */}
            {openedCards.length > 0 && <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-black text-white">Kết quả ({openedCards.length} thẻ)</h3>
                  <div className="flex gap-2">
                    {['mythic', 'legendary', 'epic', 'rare'].map(r => {
            const count = openedCards.filter(c => c._rarity === r).length;
            if (count === 0) return null;
            const tier = RARITY_TIERS[r];
            return <span key={r} className="text-[9px] font-black px-2 py-1 rounded-full border" style={{
              color: tier.color,
              borderColor: tier.color + '40',
              background: tier.color + '15'
            }}>
                          {tier.star} ×{count}
                        </span>;
          })}
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-8">
                  {openedCards.map((card, i) => {
          const rarity = card._rarity || 'common';
          const tier = RARITY_TIERS[rarity];
          const isSuperstar = rarity === 'mythic' || rarity === 'legendary';
          return <div key={i} className="relative animate-scale-in" style={{
            animationDelay: `${i * 80}ms`
          }}>
                        {/* Rarity glow */}
                        {isSuperstar && <div className="absolute -inset-2 rounded-3xl blur-lg opacity-70 animate-pulse" style={{
              background: tier.glow
            }} />}
                        <div className="relative rounded-2xl overflow-hidden cursor-pointer hover:scale-[1.03] transition-transform duration-200" style={isSuperstar ? {
              boxShadow: `0 0 30px ${tier.glow}, 0 0 60px ${tier.glow}`
            } : {}} onClick={() => setSelectedUpgradeCard(card)}>
                          <Card player={card} />
                        </div>
                        {/* Rarity badge */}
                        <div className="absolute top-1.5 right-1.5 text-[8px] font-black px-1.5 py-0.5 rounded-full border  z-30" style={{
              color: tier.color,
              borderColor: tier.color + '60',
              background: 'rgba(0,0,0,0.7)'
            }}>
                          {tier.star} {tier.label}
                        </div>
                        {isSuperstar && <div className="absolute inset-0 pointer-events-none z-20 rounded-2xl overflow-hidden">
                            <div className="absolute inset-0 opacity-30 animate-pulse" style={{
                background: `linear-gradient(135deg, transparent 30%, ${tier.color}60 50%, transparent 70%)`,
                backgroundSize: '200% 200%'
              }} />
                          </div>}
                      </div>;
        })}
                </div>

                {/* Superstar highlight */}
                {openedCards.some(c => ['mythic', 'legendary'].includes(c._rarity)) && <div className="mb-6 p-4 bg-gradient-to-r from-rose-950/60 to-amber-950/60 border border-yellow-500/30 rounded-2xl text-center">
                    <p className="text-yellow-400 font-black text-sm mb-1">🌟🌟🌟 CHÚC MỮNG! Bạn nhận được SIÊU SAO! 🌟🌟🌟</p>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {openedCards.filter(c => ['mythic', 'legendary'].includes(c._rarity)).map((c, i) => <span key={i} className="text-white font-bold text-xs px-3 py-1 bg-yellow-500/20 border border-yellow-500/30 rounded-full">
                          ✨ {c.name}
                        </span>)}
                    </div>
                  </div>}

                <div className="flex gap-3">
                  <button className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-fuchsia-700 to-purple-700 hover:from-fuchsia-600 hover:to-purple-600 text-white font-black text-sm uppercase tracking-widest transition-all cursor-pointer" onClick={() => {
          setOpenedCards([]);
          setRevealingCards([]);
        }}>
                    🌀 Mở Tiếp
                  </button>
                  <button className="flex-1 py-3.5 rounded-2xl bg-black/60 border border-white/20 hover:border-white/40 text-white font-black text-sm uppercase tracking-widest transition-all cursor-pointer" onClick={() => {
          setOpenedCards([]);
          setRevealingCards([]);
          setGameState('lobby');
        }}>
                    ← Về Sảnh
                  </button>
                </div>
              </div>}
          </div>
        </div>
  );
}
