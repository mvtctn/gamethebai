import React from 'react';
import { getPlayerAttr } from '../../utils';

export const Card = ({ player, onClick, isSelectable, isSelected, hideStats }) => {
  if (!player) return null;
  const levelBonus = ((player.level || 1) - 1) * 2;
  const maxStat = Math.max(player.stats.attack, player.stats.defense, player.stats.control) + levelBonus;
  const isSuper = ['Icon', 'Golden Baller'].includes(player.type);
  const attr = getPlayerAttr(player);

  return (
    <div 
      className={`card-container group relative w-full aspect-[5/7] ${isSelectable ? 'cursor-pointer' : ''} ${isSelected ? 'scale-105 z-50' : ''}`}
      onClick={() => onClick && onClick(player)}
    >
      {isSelected && <div className="absolute inset-0 bg-blue-500 blur-md rounded-xl opacity-50 z-[-1]"></div>}
      
      <div className="card w-full h-full" data-rarity={player.type}>
        {/* Background texture */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 mix-blend-overlay"></div>
        <div className="card-glow absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

        {/* Dynamic Holographic Rainbow effect for Superstar/rare cards */}
        {isSuper && <div className="card-holo absolute inset-0 rounded-2xl pointer-events-none z-30 opacity-40 mix-blend-color-dodge transition-opacity duration-300"></div>}

        {/* Top left info: Overall Rating, Type */}
        <div className="absolute top-2 left-2 flex flex-col items-center z-20 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
          <span className="text-xl sm:text-2xl font-black italic text-white tracking-tighter leading-none mb-0.5">
            {maxStat}
          </span>
          <span className="text-[0.55rem] sm:text-[0.65rem] font-bold uppercase tracking-widest text-white/90 mb-1">
            {player.type.split(' ')[0]}
          </span>
          {player.nation && player.nation !== 'World' && (
            <img src={`https://flagcdn.com/w20/${player.nation}.png`} alt={player.nation} className="w-5 h-auto rounded-sm drop-shadow-md border border-white/30" title={player.nation.toUpperCase()} />
          )}
        </div>

        {/* Level badge for upgraded players */}
        {player.level && player.level > 1 && (
          <div className="absolute top-[61%] left-2 bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 px-1.5 py-0.5 rounded text-[8px] sm:text-[9px] font-black uppercase tracking-wider z-20 shadow-md border border-yellow-300/30">
            Lv.{player.level}
          </div>
        )}

        {/* Top right info: Attribute style badge */}
        <div className={`absolute top-2 right-2 px-1.5 py-0.5 rounded-full border  z-20 flex items-center gap-1 ${attr.bg} shadow-md`}>
          <span className="text-[9px] sm:text-[10px]">{attr.emoji}</span>
          <span className={`text-[7px] sm:text-[8px] font-black uppercase tracking-wider ${attr.color}`}>{attr.name}</span>
        </div>
        <div className="absolute top-0 left-0 w-full h-[65%] z-10 flex items-end justify-center overflow-hidden rounded-t-lg">
          <img 
            src={player.image} 
            alt={player.name} 
            className="w-full h-full object-cover object-top drop-shadow-[0_5px_10px_rgba(0,0,0,0.6)] transition-transform duration-500 group-hover:scale-110" 
          />
        </div>

        {/* Bottom Info Area with gradient overlay */}
        <div className="absolute bottom-0 w-full h-[45%] bg-gradient-to-t from-black via-black/90 to-transparent z-20 flex flex-col items-center justify-end pb-2 sm:pb-3 px-1 sm:px-2 pointer-events-none">
          {/* Name */}
          <div className="text-center w-[90%] mb-1 sm:mb-2 border-b-2 border-white/20 pb-0.5 sm:pb-1">
            <h3 className="text-xs sm:text-sm font-black italic uppercase text-white truncate drop-shadow-[0_2px_2px_rgba(0,0,0,1)] tracking-wider">
              {player.name}
            </h3>
          </div>
          
          {/* Stats Grid */}
          <div className="flex justify-around w-[90%]">
            <div className="flex flex-col items-center">
               <span className="text-xs sm:text-sm font-black text-white">{hideStats ? '?' : player.stats.attack + levelBonus}</span>
               <span className="text-[0.45rem] sm:text-[0.55rem] font-bold text-gray-400">ATK</span>
            </div>
            <div className="w-[1px] bg-white/20 mx-0.5"></div>
            <div className="flex flex-col items-center">
               <span className="text-xs sm:text-sm font-black text-white">{hideStats ? '?' : player.stats.control + levelBonus}</span>
               <span className="text-[0.45rem] sm:text-[0.55rem] font-bold text-gray-400">CTRL</span>
            </div>
            <div className="w-[1px] bg-white/20 mx-0.5"></div>
            <div className="flex flex-col items-center">
               <span className="text-xs sm:text-sm font-black text-white">{hideStats ? '?' : player.stats.defense + levelBonus}</span>
               <span className="text-[0.45rem] sm:text-[0.55rem] font-bold text-gray-400">DEF</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

