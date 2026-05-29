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

export function QuestsScreen() {
  const { setGameState, coins, quests, setCoins, setQuests } = useGameContext();

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col items-center mt-8">
          <div className="flex flex-wrap items-center justify-between w-full gap-y-4 mb-8">
            <button className="btn !bg-gray-700" onClick={() => setGameState('lobby')}>← Về Sảnh</button>
            <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500 uppercase order-last sm:order-none w-full sm:w-auto text-center mt-2 sm:mt-0">
              Nhiệm Vụ
            </h2>
            <div className="flex items-center gap-2 bg-black/40 px-4 py-2 rounded-lg border border-yellow-500/30">
              <Coins className="text-yellow-400" />
              <span className="font-bold text-yellow-400 text-xl">{coins} Xu</span>
            </div>
          </div>

          <div className="w-full flex flex-col gap-4">
            {quests.map(q => <div key={q.id} className={`p-6 rounded-xl border flex items-center justify-between ${q.isClaimed ? 'bg-black/50 border-gray-700 opacity-50' : 'bg-gradient-to-r from-indigo-900/40 to-slate-900 border-indigo-500/50 shadow-lg'}`}>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">{q.title}</h3>
                  <div className="text-sm text-gray-400 mb-2">Tiến độ: {q.progress} / {q.target}</div>
                  <div className="w-48 h-2 bg-gray-800 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500" style={{
            width: `${Math.min(100, q.progress / q.target * 100)}%`
          }}></div>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <div className="text-yellow-400 font-bold mb-2 flex items-center gap-1">
                    <Coins size={16} /> +{q.reward} Xu
                  </div>
                  {q.isClaimed ? <button className="btn !bg-gray-600 !px-4 !py-1" disabled>Đã Nhận</button> : q.isCompleted ? <button className="btn !bg-yellow-500 !text-black !px-4 !py-1 font-bold animate-pulse" onClick={() => {
          setCoins(c => c + q.reward);
          setQuests(prev => prev.map(p => p.id === q.id ? {
            ...p,
            isClaimed: true
          } : p));
        }}>
                      Nhận Thưởng
                    </button> : <button className="btn !bg-gray-700 !px-4 !py-1" disabled>Chưa Đạt</button>}
                </div>
              </div>)}
          </div>
        </div>
  );
}
