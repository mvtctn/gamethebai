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

export function TeamBuilderScreen() {
  const { setGameState, squad, collection, setSelectedUpgradeCard } = useGameContext();

  return (
    <div className="team-builder relative z-10 p-4 sm:p-8 pt-20 min-h-screen flex flex-col">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4 bg-black/50 p-4 rounded-2xl  border border-white/10">
            <div className="flex flex-wrap gap-2 sm:gap-4 items-center">
              <button className="btn !bg-blue-600 hover:!bg-blue-500 !py-2 !px-4 text-sm whitespace-nowrap" onClick={() => setGameState('lobby')}>← Về Sảnh</button>
              <button className={`btn !bg-amber-600 hover:!bg-amber-500 !py-2 !px-4 text-sm whitespace-nowrap ${squad.length < 11 ? 'opacity-50 cursor-not-allowed' : ''}`} onClick={() => squad.length === 11 && setGameState('matchEngine')}>
                Đấu AI
              </button>
              <button className={`btn !bg-red-600 hover:!bg-red-500 !py-2 !px-4 text-sm whitespace-nowrap ${squad.length < 11 ? 'opacity-50 cursor-not-allowed' : ''}`} onClick={() => {
        if (squad.length === 11) {
          playFx('click');
          setGameState('pvpOnlineLobby');
        }
      }}>
                PVP Online
              </button>
            </div>

            <h2 className="text-xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-gray-100 to-gray-400 drop-shadow-[0_2px_10px_rgba(255,255,255,0.3)]">Xây Dựng Đội Hình</h2>
            <div className="flex gap-4 items-center bg-black/60 px-4 py-2 rounded-xl border border-white/10">
              <span className="text-lg sm:text-xl font-bold text-blue-400">{squad.length}<span className="text-gray-500">/11</span></span>
            </div>
          </div>
          
          <div className="bg-black/40 rounded-[2rem] border border-white/10 p-6 flex-1 min-h-[500px]">
            <h3 className="text-xl font-bold text-white mb-6 uppercase tracking-widest text-center border-b border-white/10 pb-4">Đội hình chính (11)</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 justify-center max-w-6xl mx-auto">
              {squad.map(card => <Card key={card.id} player={card} isSelectable isSelected onClick={() => setSelectedUpgradeCard(card)} />)}
              {Array.from({ length: 11 - squad.length }).map((_, i) => (
                <div key={`empty-${i}`} className="aspect-[2/3] rounded-2xl border-2 border-dashed border-white/20 bg-black/20 flex flex-col items-center justify-center text-white/30 cursor-pointer hover:bg-white/5 hover:border-white/40 transition-colors" onClick={() => {
                  playFx('click');
                  setGameState('collection');
                }}>
                  <div className="text-4xl mb-2">+</div>
                  <div className="text-xs font-bold uppercase tracking-widest text-center px-2">Thêm từ Bộ Sưu Tập</div>
                </div>
              ))}
            </div>
          </div>

        </div>
  );
}
