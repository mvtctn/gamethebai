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

export function MultiplayerScreen() {
  const { squad, currentUser, activePvpTarget, handlePvpEnd, setCoins, setActiveShareData } = useGameContext();

  return (
    <Suspense fallback={<div className="flex flex-col items-center justify-center py-20 gap-4 w-full h-full text-cyan-400 font-extrabold tracking-widest text-xs uppercase animate-pulse"><div className="w-12 h-12 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>Đang tải Đấu trường...</div>}>
          <MultiplayerEngine squad={squad} currentUser={currentUser} initialJoinId={activePvpTarget} CardComponent={Card} onExit={handlePvpEnd} onWin={() => {
    setCoins(c => c + 100);
  }} onShare={(result, opponentName, myScore, opponentScore) => {
    setActiveShareData({
      type: 'pvp',
      result: result,
      myScore: myScore,
      opponentScore: opponentScore,
      opponentName: opponentName
    });
  }} />
        </Suspense>
  );
}
