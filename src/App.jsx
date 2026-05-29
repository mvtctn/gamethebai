import React, { Suspense } from 'react';
import { database, isConnectedToFirebase } from './firebase';
import { PackageOpen, Users, Swords, ChevronRight, CheckCircle2, Lock, Coins, Sparkles, Play, Trophy, Shield, Target, Wifi, User, ChevronLeft, Send, MessageSquare, Mail, History } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import playersData from './players.json';
import { PITCH_POSITIONS, TIERS, AVATAR_PRESETS, BANNER_PRESETS, LEVEL_MILESTONES, CARD_TYPE_BONUS, ACTIVITY_MILESTONES, RARITY_LABEL, CHECK_IN_REWARDS, ENV_WEATHER, ENV_TIME, FORM_STATES, BANNERS } from './constants';
import { hashPIN, triggerConfetti, getPlayerTier, getAvatarGradient, getCardTypeBonus, playFx, getPlayerAttr, checkAttrAdvantage, generateCardForm, getNationEmoji, getRelativeTime, getSquadChemistry, getPlayerChemistryBoost } from './utils';
import { useAppLogic } from './hooks/useAppLogic';
import { GameProvider } from './context/GameContext';
const HowToPlayScreen = React.lazy(() => import('./components/features/HowToPlayScreen').then(module => ({ default: module.HowToPlayScreen })));
const LobbyScreen = React.lazy(() => import('./components/features/LobbyScreen').then(module => ({ default: module.LobbyScreen })));
const PvpOnlineLobbyScreen = React.lazy(() => import('./components/features/PvpOnlineLobbyScreen').then(module => ({ default: module.PvpOnlineLobbyScreen })));
const MultiplayerScreen = React.lazy(() => import('./components/features/MultiplayerScreen').then(module => ({ default: module.MultiplayerScreen })));
const QuestsScreen = React.lazy(() => import('./components/features/QuestsScreen').then(module => ({ default: module.QuestsScreen })));
const SettingsScreen = React.lazy(() => import('./components/features/SettingsScreen').then(module => ({ default: module.SettingsScreen })));
const ProfileScreen = React.lazy(() => import('./components/features/ProfileScreen').then(module => ({ default: module.ProfileScreen })));
const UserWallScreen = React.lazy(() => import('./components/features/UserWallScreen').then(module => ({ default: module.UserWallScreen })));
const LeaderboardScreen = React.lazy(() => import('./components/features/LeaderboardScreen').then(module => ({ default: module.LeaderboardScreen })));
const ShowroomScreen = React.lazy(() => import('./components/features/ShowroomScreen').then(module => ({ default: module.ShowroomScreen })));
const PackOpeningScreen = React.lazy(() => import('./components/features/PackOpeningScreen').then(module => ({ default: module.PackOpeningScreen })));
const TeamBuilderScreen = React.lazy(() => import('./components/features/TeamBuilderScreen').then(module => ({ default: module.TeamBuilderScreen })));
const MatchEngineScreen = React.lazy(() => import('./components/features/MatchEngineScreen').then(module => ({ default: module.MatchEngineScreen })));
const LandingPage = React.lazy(() => import('./components/features/LandingPage').then(module => ({ default: module.LandingPage })));
const AdminScreen = React.lazy(() => import('./components/features/AdminScreen').then(module => ({ default: module.AdminScreen })));
const MultiplayerEngine = React.lazy(() => import('./MultiplayerEngine'));
import { MatchHistoryModal } from './MatchHistoryModal';
import { Card, AnimatedHeroPlayer, ShareModal } from './components/ui/SharedComponents';
export default function App() {
  const appLogic = useAppLogic();
  const {
    currentUser,
    collection,
    squad,
    setSquad,
    coins,
    setCoins,
    gameState,
    setGameState,
    activePvpTarget,
    setActivePvpTarget,
    showPvpJoinModal,
    setShowPvpJoinModal,
    pvpJoinInput,
    setPvpJoinInput,
    activeBannerIdx,
    referredBy,
    referrals,
    refCodeInput,
    setRefCodeInput,
    showSharePoster,
    setShowSharePoster,
    selectedUpgradeCard,
    setSelectedUpgradeCard,
    upgradeCard,
    submitReferralCode,
    claimReferralReward,
    performCheckIn,
    authUsername,
    setAuthUsername,
    authPin,
    setAuthPin,
    authStep,
    setAuthStep,
    authCheckingUser,
    setAuthFoundUser,
    isPackOpeningAnim,
    openedCards,
    setOpenedCards,
    quests,
    setQuests,
    lastReward,
    level,
    xp,
    stats,
    email,
    profileOldPassword,
    setProfileOldPassword,
    profileNewPassword,
    setProfileNewPassword,
    profileConfirmPassword,
    setProfileConfirmPassword,
    profileEmailInput,
    setProfileEmailInput,
    newUsernameInput,
    setNewUsernameInput,
    isRenaming,
    showLevelUpModal,
    setShowLevelUpModal,
    userWallTarget,
    setUserWallTarget,
    wallData,
    userWallPosts,
    globalPosts,
    socialWallTab,
    setSocialWallTab,
    mobileSubTab,
    setMobileSubTab,
    newPostText,
    commentInputs,
    setCommentInputs,
    loadingWall,
    showGiftModal,
    setShowGiftModal,
    giftAmount,
    setGiftAmount,
    giftLoading,
    loadingGlobalPosts,
    showGiftCardModal,
    setShowGiftCardModal,
    giftCardLoading,
    giftCardSearch,
    setGiftCardSearch,
    selectedGiftCard,
    setSelectedGiftCard,
    giftCardFilterRarity,
    setGiftCardFilterRarity,
    socialSearchQuery,
    setSocialSearchQuery,
    showMentionDropdown,
    activePrivatePartner,
    setActivePrivatePartner,
    privateMessages,
    myPrivateChats,
    privateChatInput,
    setPrivateChatInput,
    unreadPartners,
    rewardedMilestones,
    claimedLevelRewards,
    freePacks,
    pityCounter,
    setRevealingCards,
    packType,
    setPackType,
    leaderboardData,
    loadingLeaderboard,
    leaderboardTab,
    setLeaderboardTab,
    checkInState,
    alreadyClaimedToday,
    equippedTitle,
    setEquippedTitle,
    claimedAchievements,
    setClaimedAchievements,
    customAvatar,
    setCustomAvatar,
    customBanner,
    setCustomBanner,
    isCustomizingProfile,
    setIsCustomizingProfile,
    previewAvatar,
    setPreviewAvatar,
    previewBanner,
    setPreviewBanner,
    showCheckInModal,
    setShowCheckInModal,
    activeShareData,
    setActiveShareData,
    showroomFilterState,
    setShowroomFilterState,
    showroomHoverState,
    setShowroomHoverState,
    claimMilestone,
    renderPostText,
    handleComposerChange,
    getAutocompleteSuggestions,
    insertMention,
    insertEmoji,
    handleCreatePost,
    handleSendGift,
    getCardGiftFee,
    handleSendCardGift,
    handleLikePost,
    handleCreateComment,
    sendPrivateMessage,
    onlineUsers,
    chatMessages,
    activeInvite,
    chatTab,
    setChatTab,
    chatInput,
    setChatInput,
    pvpHistory,
    sendChatMessage,
    sendChallengeInvite,
    acceptChallenge,
    declineChallenge,
    difficulty,
    setDifficulty,
    matchPhase,
    setMatchPhase,
    playerHand,
    aiHand,
    matchScore,
    matchHistory,
    showHistoryModal,
    setShowHistoryModal,
    selectedPlayerCard,
    setSelectedPlayerCard,
    selectedStat,
    setSelectedStat,
    currentAiCard,
    setCurrentAiCard,
    playedCardIds,
    matchEnvironment,
    handleCheckUsername,
    handleVerifyPin,
    handleCreateAccount,
    handleUpdateEmail,
    handleUpdatePassword,
    handleRenameUser,
    handleLogout,
    RARITY_TIERS,
    getCardRarity,
    PACK_CONFIGS,
    openPack,
    startMatch,
    triggerAiTurn,
    playRoundAiTurn,
    playRound,
    nextRound,
    dismissRoundResult,
    returnToLobby,
    gameAlert,
    setGameAlert,
    showAlert,
    handlePvpEnd
  } = appLogic;
  return <GameProvider value={appLogic}><>
      {/* ═══ NEW LANDING PAGE — 2-column split ═══ */}
      {!currentUser && <LandingPage />}

      {/* ═══ TRANG HƯỚNG DẪN CHƠI — hiển thị cho mọi trạng thái ═══ */}
      {gameState === 'howToPlay' && <HowToPlayScreen />}

      {currentUser && <>
          {activeInvite && <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/95  p-4 animate-fade-in ">
              <div className="glass-panel p-8 sm:p-10 rounded-[2.5rem] max-w-sm w-full flex flex-col items-center bg-gradient-to-b from-red-950/80 via-slate-900 to-black shadow-[0_0_80px_rgba(239,68,68,0.4)] border border-red-500/30 text-center relative">
                <div className="w-20 h-20 bg-red-900/60 rounded-full flex items-center justify-center border-4 border-red-500 shadow-[0_0_30px_rgba(239,68,68,0.6)] mb-6 animate-bounce">
                  <Swords size={40} className="text-red-400" />
                </div>
                
                <h3 className="text-sm font-black text-red-500 tracking-widest uppercase mb-1">Thử Thách PVP Tuyệt Đối ⚔️</h3>
                <h2 className="text-2xl font-black text-white mb-4 uppercase tracking-wider">LỜI THÁCH ĐẤU!</h2>
                
                <p className="text-gray-300 text-sm leading-relaxed mb-6 font-semibold">
                  HLV <span className="text-amber-400 font-extrabold">{activeInvite.host}</span> (Đội hình: <span className="text-cyan-400 font-black">{activeInvite.hostRating} OVR</span>) muốn thách đấu PVP với bạn! Bạn có dám chấp nhận?
                </p>
                
                <div className="flex gap-4 w-full mt-2">
                  <button className="flex-1 flex items-center justify-center gap-2 py-3 px-5 rounded-full border border-emerald-500/40 bg-emerald-950/20 text-emerald-300 hover:text-white hover:bg-gradient-to-r hover:from-emerald-600 hover:to-green-500 hover:border-transparent hover:shadow-[0_0_25px_rgba(16,185,129,0.5)] active:scale-95 transition-all duration-300 font-extrabold uppercase text-xs tracking-widest cursor-pointer " onClick={() => acceptChallenge(activeInvite)}>
                    🤝 Đồng Ý
                  </button>
                  <button className="flex-1 flex items-center justify-center gap-2 py-3 px-5 rounded-full border border-red-500/40 bg-red-950/20 text-red-300 hover:text-white hover:bg-gradient-to-r hover:from-red-600 hover:to-rose-500 hover:border-transparent hover:shadow-[0_0_25px_rgba(239,68,68,0.5)] active:scale-95 transition-all duration-300 font-extrabold uppercase text-xs tracking-widest cursor-pointer " onClick={declineChallenge}>
                    ✕ Từ Chối
                  </button>
                </div>
              </div>
            </div>}

          <div className="bg-stadium"></div>
          <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,_transparent_0%,_rgba(0,0,0,0.8)_100%)] z-50 mix-blend-overlay"></div>
          <div className="fixed inset-0 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20 z-50"></div>
          
          {/* Native flow footer used at the bottom of app-container instead */}

          {/* User Header Profile */}
          <div className="absolute top-2 sm:top-4 right-2 sm:right-4 z-50 flex items-center gap-1.5 sm:gap-3 bg-black/50 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-full border border-white/10 shadow-lg whitespace-nowrap max-w-[95vw] overflow-hidden">
            <button onClick={() => {
            playFx('click');
            setGameState('userWall');
            setUserWallTarget(currentUser);
            setSocialWallTab('global');
          }} className="text-xs text-cyan-400 hover:text-cyan-300 font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer select-none transition-all hover:scale-105 active:scale-95 shrink-0" title="Xem Tường nhà cá nhân">
              🐦 <span className="hidden sm:inline">Tường</span>
            </button>
            <div className="w-[1px] h-3 sm:h-4 bg-white/20 shrink-0"></div>
            <button onClick={() => {
            playFx('click');
            setGameState('howToPlay');
          }} className="text-xs text-yellow-400 hover:text-yellow-300 font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer select-none transition-all hover:scale-105 active:scale-95 shrink-0" title="Xem hướng dẫn chơi game">
              📖 <span className="hidden sm:inline">Hướng Dẫn</span>
            </button>
            <div className="w-[1px] h-3 sm:h-4 bg-white/20 shrink-0"></div>
            <div className="text-xs sm:text-sm flex items-center gap-1 sm:gap-2 cursor-pointer hover:text-cyan-400 hover:scale-105 transition-all duration-300 select-none shrink-0" onClick={() => {
            playFx('click');
            setGameState('profile');
          }} title="Xem hồ sơ và cài đặt HLV">
              <span className="hidden sm:inline text-gray-400">HLV: </span>
              <span className="font-bold text-fuchsia-400 truncate max-w-[80px] sm:max-w-none">{currentUser}</span>
              <span className="text-[9px] sm:text-[10px] bg-white/10 text-gray-300 px-1.5 sm:px-2 py-0.5 rounded-full border border-white/10 font-bold">Lv.{level}</span>
              {(() => {
              const tier = getPlayerTier(level);
              return <span className={`text-[8px] sm:text-[9px] font-black uppercase px-1.5 sm:px-2 py-0.5 rounded-full border flex items-center gap-1 ${tier.color} ${tier.glow}`}>
                    {tier.icon} <span className="hidden sm:inline">{tier.name}</span>
                  </span>;
            })()}
            </div>
            <div className="w-[1px] h-3 sm:h-4 bg-white/20 shrink-0"></div>
            <button onClick={handleLogout} className="text-xs text-red-400 hover:text-red-300 font-bold uppercase tracking-wider flex items-center gap-1 shrink-0" title="Thoát">
              <span className="sm:hidden text-sm">🚪</span>
              <span className="hidden sm:inline">Thoát</span>
            </button>
          </div>

          <div className={`app-container relative z-10 ${gameState === 'lobby' ? 'lg:max-w-none lg:w-full lg:mx-0 lg:pr-0 lg:pl-8' : ''}`}>
            {gameState !== 'lobby' && <h1 className="text-3xl md:text-5xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-gray-100 to-gray-400 drop-shadow-[0_5px_15px_rgba(0,0,0,0.8)] text-center mb-8 uppercase cursor-pointer flex items-center justify-center gap-3" onClick={() => setGameState('lobby')}>
                <img src="/favicon.png" alt="Logo" className="w-8 h-8 md:w-10 md:h-10 rounded-lg object-contain shadow-[0_0_10px_rgba(255,255,255,0.15)] border border-white/10" />
                <span>WC 2026 PANINI</span>
              </h1>}

            {gameState === 'lobby' && <LobbyScreen />}

      {gameState === 'pvpOnlineLobby' && <PvpOnlineLobbyScreen />}

      {gameState === 'multiplayer' && <MultiplayerScreen />}

      {gameState === 'quests' && <QuestsScreen />}

      {/* ============== SETTINGS PAGE ============== */}
      {gameState === 'settings' && <SettingsScreen />}

      {/* ============== PROFILE PAGE (2-column, no settings) ============== */}
      {gameState === 'profile' && <ProfileScreen />}

      {/* ============== USER WALL / X SOCIAL NETWORK ============== */}
      {gameState === 'userWall' && <UserWallScreen />}

      {gameState === 'leaderboard' && <LeaderboardScreen />}

      {gameState === 'showroom' && <ShowroomScreen />}

      {gameState === 'packOpening' && <PackOpeningScreen />}

      {gameState === 'teamBuilder' && <TeamBuilderScreen />}

      {gameState === 'matchEngine' && <MatchEngineScreen />}
      
      {gameState === 'admin' && <AdminScreen />}
        </div>
        </>}

      {/* ================= MODALS & CELEBRATIONS ================= */}

      {/* 1. CARD DETAILS & UPGRADE MODAL (GLOBAL) */}
      {selectedUpgradeCard && (() => {
        const cardInCollection = collection.find(c => c.id === selectedUpgradeCard.id);
        const inSquad = squad.some(s => s.id === selectedUpgradeCard.id);
        const lvl = cardInCollection ? cardInCollection.level || 1 : 1;
        const upgradeCost = lvl * 150;
        const isMaxLvl = lvl >= 10;
        return <div className="fixed inset-0 z-[190] flex items-center justify-center bg-black/85  p-4 animate-fade-in" onClick={() => setSelectedUpgradeCard(null)}>
            <div className="glass-panel p-6 sm:p-8 rounded-[2.5rem] max-w-lg w-full flex flex-col md:flex-row items-center gap-6 bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950/80 shadow-[0_0_80px_rgba(30,58,138,0.5)] relative border border-white/10" onClick={e => e.stopPropagation()}>
              <button className="absolute top-4 right-4 text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 p-2 rounded-full w-8 h-8 flex items-center justify-center transition-colors border border-white/10 z-50 cursor-pointer" onClick={() => setSelectedUpgradeCard(null)}>
                ✕
              </button>

              {/* Left Column: Big Card Visual */}
              <div className="w-44 sm:w-56 shrink-0 drop-shadow-[0_10px_30px_rgba(0,0,0,0.8)] relative group">
                <Card player={cardInCollection || selectedUpgradeCard} hideStats={false} />
              </div>

              {/* Right Column: Level Up Controls */}
              <div className="flex-1 flex flex-col justify-between w-full h-full text-left">
                <div>
                  <span className="text-[10px] sm:text-xs font-black uppercase text-cyan-400 tracking-widest block mb-1">HỒ SƠ CẦU THỦ</span>
                  <h3 className="text-xl sm:text-2xl font-black italic uppercase tracking-wide text-white mb-2 leading-none">{selectedUpgradeCard.name}</h3>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-white/10 rounded-full text-white/80 border border-white/10">{selectedUpgradeCard.type}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-yellow-500/20 text-yellow-400 rounded-full border border-yellow-500/30">Cấp Độ {lvl}</span>
                  </div>

                  <div className="bg-black/40 border border-white/5 rounded-2xl p-4 mb-4">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Chỉ số thuộc tính (+2/Lv):</h4>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-2">
                         <div className="text-[9px] font-extrabold text-red-400 tracking-wider">ATK</div>
                         <div className="text-base sm:text-lg font-black text-white">{selectedUpgradeCard.stats.attack + (lvl - 1) * 2}</div>
                      </div>
                      <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-2">
                         <div className="text-[9px] font-extrabold text-green-400 tracking-wider">CTRL</div>
                         <div className="text-base sm:text-lg font-black text-white">{selectedUpgradeCard.stats.control + (lvl - 1) * 2}</div>
                      </div>
                      <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-2">
                         <div className="text-[9px] font-extrabold text-blue-400 tracking-wider">DEF</div>
                         <div className="text-base sm:text-lg font-black text-white">{selectedUpgradeCard.stats.defense + (lvl - 1) * 2}</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2 mt-2">
                  <button className={`w-full py-3 px-4 rounded-xl font-black text-xs uppercase tracking-widest transition-all cursor-pointer flex justify-between items-center ${isMaxLvl ? 'bg-gray-800 text-gray-500 border border-gray-700 cursor-not-allowed' : coins >= upgradeCost ? 'bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 text-slate-950 font-black shadow-lg shadow-yellow-950/20 hover:scale-[1.02]' : 'bg-red-950/40 text-red-400 border border-red-500/20 cursor-not-allowed'}`} disabled={isMaxLvl} onClick={() => {
                  playFx('click');
                  upgradeCard(selectedUpgradeCard.id);
                }}>
                    <span>{isMaxLvl ? "ĐÃ ĐẠT CẤP ĐỘ MAX" : `⚡ CƯỜNG HÓA (+2 CHỈ SỐ)`}</span>
                    {!isMaxLvl && <span className="text-[10px] font-bold px-2 py-1 bg-black/20 rounded-lg text-white">
                        🪙 {upgradeCost} Xu
                      </span>}
                  </button>

                  <button className={`w-full py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-widest transition-all cursor-pointer border ${inSquad ? 'bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20' : squad.length >= 11 ? 'bg-gray-800 border-gray-700 text-gray-500 cursor-not-allowed' : 'bg-blue-500/10 border-blue-500/30 text-blue-400 hover:bg-blue-500/20'}`} onClick={() => {
                  playFx('click');
                  if (inSquad) {
                    setSquad(squad.filter(s => s.id !== selectedUpgradeCard.id));
                    localStorage.setItem(`panini_${currentUser}_squad`, JSON.stringify(squad.filter(s => s.id !== selectedUpgradeCard.id)));
                    setSelectedUpgradeCard(null);
                  } else {
                    if (squad.length < 11) {
                      const cardToInsert = cardInCollection || selectedUpgradeCard;
                      setSquad([...squad, cardToInsert]);
                      localStorage.setItem(`panini_${currentUser}_squad`, JSON.stringify([...squad, cardToInsert]));
                      setSelectedUpgradeCard(null);
                    } else {
                      showAlert("🚫 Đội Hình Đầy!", "Đội hình chính đã đủ 11 cầu thủ!");
                    }
                  }
                }}>
                    {inSquad ? "❌ Rút Khỏi Đội Hình" : squad.length >= 11 ? "🚫 Đội Hình Chính Đầy (11/11)" : "⚽ Đưa Vào Đội Hình Chính"}
                  </button>
                </div>
              </div>
            </div>
          </div>;
      })()}

      {/* 2. LEVEL UP CELEBRATION MODAL */}
      {showLevelUpModal && <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90  p-4 animate-fade-in">
          <div className="glass-panel p-8 sm:p-12 rounded-[2.5rem] text-center w-full max-w-md bg-gradient-to-t from-yellow-950/30 via-slate-900 to-slate-950 border border-yellow-500/30 shadow-[0_0_80px_rgba(251,191,36,0.3)] animate-scale-in flex flex-col items-center">
            <div className="text-7xl mb-4 animate-bounce-subtle">🏆</div>
            
            <h2 className="text-xs sm:text-sm font-black text-yellow-500 uppercase tracking-widest mb-2">Đạt Cấp Độ Mới</h2>
            <h3 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-600 mb-6 drop-shadow-md">
              HLV LÊN CẤP!
            </h3>

            <div className="flex items-center gap-6 mb-8">
              <div className="flex flex-col items-center">
                <span className="text-[10px] text-gray-500 font-bold uppercase">Cấp cũ</span>
                <span className="text-2xl font-black text-gray-400">{showLevelUpModal.oldLevel}</span>
              </div>
              <div className="text-2xl text-yellow-500 font-black">➔</div>
              <div className="flex flex-col items-center">
                <span className="text-[10px] text-amber-400 font-bold uppercase">Cấp mới</span>
                <span className="text-4xl font-black text-yellow-400 animate-scale-in">{showLevelUpModal.newLevel}</span>
              </div>
            </div>

            <div className="bg-yellow-950/40 border border-yellow-500/30 px-6 py-4 rounded-2xl mb-8 flex items-center justify-center gap-3 w-full shadow-[0_0_20px_rgba(251,191,36,0.1)]">
              <Coins className="text-yellow-400" size={24} />
              <div className="text-left">
                <div className="text-[9px] text-yellow-500 font-bold uppercase tracking-wider">Phần thưởng lên cấp</div>
                <div className="text-lg font-black text-yellow-400">+{showLevelUpModal.reward} Xu</div>
              </div>
            </div>

            <button className="btn w-full !bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 text-black font-black py-4 rounded-xl shadow-lg active:scale-95 transition-all cursor-pointer" onClick={() => {
            playFx('click');
            setShowLevelUpModal(null);
          }}>
              🤝 Tuyệt Vời! Nhận Xu
            </button>
          </div>
        </div>}

      {/* 2.0 DAILY CHECK-IN MODAL */}
      {showCheckInModal && (() => {
        const streak = checkInState.streak || 0;
        return <div className="fixed inset-0 z-[220] flex items-center justify-center bg-black/80 p-4 animate-fade-in" onClick={() => setShowCheckInModal(false)}>
            <div className="glass-panel w-full max-w-2xl rounded-[2.5rem] border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.8)] flex flex-col relative bg-gradient-to-br from-slate-950 via-slate-900 to-amber-950/40 p-6 sm:p-8 gap-5 animate-scale-in max-h-[92vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <button className="absolute top-4 right-4 text-gray-400 hover:text-white bg-black/40 hover:bg-black/80 p-2 rounded-full w-8 h-8 flex items-center justify-center transition-colors z-[230] cursor-pointer" onClick={() => {
              playFx('click');
              setShowCheckInModal(false);
            }}>
                ✕
              </button>

              <div className="text-center">
                <span className="text-[10px] font-black uppercase text-amber-400 tracking-[0.25em] pl-[0.25em] block mb-1">
                  📅 QUÀ TẶNG HẰNG NGÀY
                </span>
                <h2 className="text-2xl sm:text-4xl font-black text-white italic uppercase tracking-wider">
                  Điểm Danh Nhận Quà
                </h2>
                <p className="text-gray-400 text-xs mt-1 font-semibold">
                  Chuỗi điểm danh hiện tại: <span className="text-yellow-400 font-extrabold text-sm">{streak} Ngày</span>
                  {streak > 0 && " 🔥"} (Nhận thẻ Siêu sao ngẫu nhiên vào Ngày 7!)
                </p>
              </div>

              {/* Day Selection Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 mt-2">
                {CHECK_IN_REWARDS.map(reward => {
                const isClaimed = reward.day <= streak;
                const isToday = reward.day === streak + 1 && !alreadyClaimedToday;
                return <div key={reward.day} className={`relative rounded-2xl p-3 flex flex-col items-center justify-between aspect-[5/7] border transition-all ${isClaimed ? 'bg-slate-950/80 border-green-500/30 opacity-60 shadow-[inset_0_0_10px_rgba(16,185,129,0.1)]' : isToday ? 'bg-yellow-500/10 border-yellow-400 shadow-[0_0_20px_rgba(234,179,8,0.3)] scale-102 cursor-pointer hover:scale-105' : 'bg-black/40 border-white/5 opacity-40'}`} onClick={() => {
                  if (isToday) {
                    performCheckIn();
                  }
                }}>
                      {/* Day Label */}
                      <span className={`text-[9px] font-black uppercase tracking-wider ${isClaimed ? 'text-green-400' : isToday ? 'text-yellow-400' : 'text-gray-500'}`}>
                        Ngày {reward.day}
                      </span>

                      {/* Icon & Details */}
                      <div className="flex flex-col items-center gap-1 my-2">
                        <span className={`text-3xl ${isToday ? 'scale-110 animate-bounce-subtle' : ''}`}>{reward.icon}</span>
                        <span className="text-[10px] font-black text-white text-center leading-tight">
                          {reward.name}
                        </span>
                      </div>

                      {/* Claim Status Badge */}
                      {isClaimed ? <span className="text-[8px] font-black bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full border border-green-500/30 uppercase tracking-widest">
                          ✓ Nhận
                        </span> : isToday ? <span className="text-[8px] font-black bg-yellow-500 text-black px-2 py-0.5 rounded-full uppercase tracking-widest animate-bounce">
                          Nhận!
                        </span> : <span className="text-[8px] font-black bg-white/5 text-gray-500 px-2 py-0.5 rounded-full uppercase tracking-widest">
                          Khóa 🔒
                        </span>}

                      {/* Sparkle background for Day 7 */}
                      {reward.day === 7 && <div className="absolute inset-0 bg-gradient-to-t from-yellow-500/15 to-amber-500/10 opacity-70 rounded-2xl pointer-events-none z-[-1]" />}
                    </div>;
              })}
              </div>

              {/* Action Button */}
              <div className="flex flex-col items-center mt-3 gap-2">
                <button className={`btn w-full font-black py-4 rounded-xl shadow-lg transition-all active:scale-95 text-base uppercase tracking-widest cursor-pointer ${alreadyClaimedToday ? '!bg-slate-800 text-gray-400 border border-white/5 cursor-not-allowed' : '!bg-gradient-to-r from-yellow-500 to-amber-600 text-black shadow-yellow-500/10 hover:shadow-yellow-500/20 hover:from-yellow-400 hover:to-amber-500'}`} onClick={() => {
                if (!alreadyClaimedToday) {
                  performCheckIn();
                } else {
                  showAlert("📅 Ngày Mai Quay Lại!", "Hôm nay bạn đã điểm danh rồi. Hãy quay lại vào ngày mai để nhận quà tiếp theo nhé!");
                }
              }}>
                  {alreadyClaimedToday ? "✓ Hôm Nay Đã Điểm Danh" : "📅 Điểm Danh Nhận Quà Ngay"}
                </button>
                
                <button type="button" className="btn w-full !bg-slate-800/80 hover:!bg-slate-700 text-gray-300 hover:text-white font-extrabold py-3 rounded-xl transition-all active:scale-95 text-xs sm:text-sm uppercase tracking-wider cursor-pointer border border-white/5" onClick={() => {
                playFx('click');
                setShowCheckInModal(false);
              }}>
                  ✕ Đóng Cửa Sổ / Về Sảnh
                </button>

                <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest text-center mt-1">
                  Đừng bỏ lỡ ngày nào để duy trì chuỗi điểm danh nhé!
                </p>
              </div>

            </div>
          </div>;
      })()}

      {/* 2.5 KHOE THẺ XỊN SHOWCASE POSTER MODAL */}
      {showSharePoster && (() => {
        const card = showSharePoster;
        const rarity = card._rarity || 'common';
        const tier = RARITY_TIERS[rarity] || {
          color: '#ffffff',
          glow: 'rgba(255,255,255,0.4)',
          star: '★',
          label: 'SIÊU SAO'
        };
        return <div className="fixed inset-0 z-[220] flex items-center justify-center bg-black/95  p-4 overflow-y-auto animate-fade-in">
            <div className="relative w-full max-w-lg bg-gradient-to-b from-slate-900 via-slate-950 to-black border-2 border-yellow-500/40 rounded-[2.5rem] p-6 sm:p-8 text-center shadow-[0_0_80px_rgba(251,191,36,0.35)] flex flex-col items-center gap-6 overflow-hidden">
              
              {/* Decorative glows */}
              <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-red-500 via-yellow-500 to-cyan-500"></div>
              {/* Decorative gradient lines only - no blur for GPU perf */}
              {/* removed */}

              {/* Header Title */}
              <div>
                <span className="text-[10px] font-black uppercase text-amber-400 tracking-[0.25em] pl-[0.25em] block mb-1">
                  ✨ NHÀ VÔ ĐỊCH MỞ GÓI THẺ ✨
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-yellow-300 to-amber-500 uppercase tracking-wide">
                  ĐÃ MỞ ĐƯỢC SIÊU CẦU THỦ!
                </h2>
              </div>

              {/* Poster frame that players screenshot */}
              <div className="w-full bg-gradient-to-b from-slate-950 to-slate-900 border border-white/10 rounded-3xl p-5 relative overflow-hidden flex flex-col items-center shadow-inner">
                {/* Diagonal strip background */}
                <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(0,0,0,0.85)_25%,transparent_25%,transparent_50%,rgba(0,0,0,0.85)_50%,rgba(0,0,0,0.85)_75%,transparent_75%,transparent)] bg-[length:40px_40px] opacity-10 pointer-events-none"></div>

                {/* Overall Rating & Headline */}
                <div className="text-center z-10 mb-4">
                  <h3 className="text-lg sm:text-xl font-black italic uppercase tracking-wider text-white">
                    HLV <span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-cyan-400 font-black">{currentUser}</span>
                  </h3>
                  <div className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">Sở hữu thẻ Siêu Cấp Mùa giải 2026</div>
                </div>

                {/* The card itself */}
                <div className="w-44 sm:w-56 aspect-[5/7] mb-5 relative group animate-bounce-subtle z-10">
                  <div className="absolute -inset-1 rounded-[1.5rem] blur-md opacity-60 animate-pulse" style={{
                  background: tier.glow
                }}></div>
                  <div className="relative rounded-2xl overflow-hidden" style={{
                  boxShadow: `0 0 25px ${tier.glow}`
                }}>
                    <Card player={card} hideStats={false} />
                  </div>
                </div>

                {/* QR Code and link strip */}
                <div className="w-full flex items-center justify-between gap-4 border-t border-white/10 pt-4 z-10 bg-black/40 px-4 py-2.5 rounded-2xl mt-1">
                  <div className="text-left">
                    <div className="text-[9px] font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-500 uppercase tracking-wider">Chơi Game Miễn Phí Tại</div>
                    <div className="text-xs font-black text-white tracking-wide">thebongda.vinhninh.com</div>
                    <div className="text-[7px] text-gray-500 font-bold uppercase tracking-widest mt-0.5">
                      Nhập mã giới thiệu: <span className="text-amber-400 font-black">{currentUser}</span>
                    </div>
                  </div>
                  <div className="bg-white p-1 rounded-lg shrink-0 shadow-lg border border-yellow-500/30">
                    <QRCodeSVG value={`${window.location.origin}?ref=${currentUser}`} size={52} bgColor="#ffffff" fgColor="#000000" level="L" />
                  </div>
                </div>
              </div>

              {/* Instructions and CTA */}
              <div className="text-xs text-gray-400 font-semibold px-4">
                📸 <span className="text-white">Hãy Chụp Ảnh Màn Hình điện thoại/máy tính ngay</span> để khoe thẻ siêu sao lấp lánh này lên Zalo cho bố mẹ hoặc gửi vào nhóm chat lớp để thách đấu cùng bạn bè nhé!
              </div>

              <div className="flex gap-4 w-full">
                <button type="button" className="flex-1 btn !bg-yellow-500 text-black font-black py-3 text-sm rounded-xl transition-all active:scale-[0.98] shadow-lg shadow-yellow-500/20" onClick={() => {
                playFx('click');
                showAlert("📤 Link Đã Sẵn Sàng!", "Đã tạo link chia sẻ của bạn! Bạn chỉ cần chụp ảnh màn hình này hoặc gửi link này cho bạn bè nhé!");
              }}>
                  📤 Tạo Link Chia Sẻ
                </button>
                <button type="button" className="flex-1 btn !bg-gray-700 hover:!bg-gray-600 text-white font-bold py-3 text-sm rounded-xl transition-all active:scale-[0.98]" onClick={() => {
                playFx('click');
                setShowSharePoster(null);
              }}>
                  Đóng
                </button>
              </div>

            </div>
          </div>;
      })()}

      {/* PROFILE CUSTOMIZER MODAL */}
      {isCustomizingProfile && <div className="fixed inset-0 z-[150] flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fade-in" onClick={e => {
        if (e.target === e.currentTarget) setIsCustomizingProfile(false);
      }}>
          <div className="glass-panel rounded-3xl w-full max-w-xl border border-white/15 shadow-[0_0_60px_rgba(167,139,250,0.3)] flex flex-col overflow-hidden" style={{
          maxHeight: '92vh',
          background: 'linear-gradient(180deg, #0f0c29 0%, #1e1b4b 100%)'
        }}>
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-black/20 shrink-0">
              <div>
                <h2 className="text-lg font-black text-white uppercase tracking-wider">✏️ Tuỳ Chỉnh Hồ Sơ</h2>
                <p className="text-xs text-gray-400 mt-0.5">Chọn màu nền avatar và banner cá nhân</p>
              </div>
              <button className="text-gray-400 hover:text-white text-xl leading-none w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10 transition-all" onClick={() => setIsCustomizingProfile(false)}>✕</button>
            </div>

            <div className="overflow-y-auto flex-1 p-5 space-y-6">
              {/* Live Preview Card */}
              <div>
                <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 text-center">Xem Trước Thẻ Hồ Sơ</div>
                <div className="glass-panel rounded-2xl overflow-hidden border border-white/10 max-w-[280px] mx-auto shadow-2xl">
                  <div className="h-20 relative overflow-hidden flex items-center justify-center" style={{
                  background: previewBanner || customBanner || 'linear-gradient(to right, #164e63, #1e1b4b, #4a044e)'
                }}>
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-black/20" />
                    <span className="text-white/10 font-black italic text-2xl uppercase select-none">THE BONG DA</span>
                  </div>
                  <div className="px-4 pb-4 pt-1 flex flex-col items-center text-center">
                    <div className="w-16 h-16 rounded-full flex items-center justify-center border-4 border-slate-900 shadow-2xl -mt-8 z-10 relative" style={{
                    background: previewAvatar || customAvatar || getAvatarGradient(currentUser),
                    boxShadow: '0 0 20px rgba(244,63,94,0.4)'
                  }}>
                      <span className="text-2xl font-black text-white">{(currentUser || '').charAt(0).toUpperCase()}</span>
                    </div>
                    <div className="text-sm font-black text-white uppercase mt-2 tracking-wider">{currentUser}</div>
                    <div className="text-[10px] text-gray-500 mt-0.5">HLV • Cấp {level}</div>
                  </div>
                </div>
              </div>

              {/* Avatar Color Selector */}
              <div>
                <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">🎨 Màu Nền Avatar</div>
                <div className="grid grid-cols-9 gap-2">
                  {AVATAR_PRESETS.map(preset => {
                  const isSelected = (previewAvatar !== undefined ? previewAvatar : customAvatar) === preset.value;
                  return <button key={preset.id} title={preset.label} className={`w-full aspect-square rounded-full border-2 transition-all duration-200 cursor-pointer hover:scale-110 ${isSelected ? 'border-white scale-115 shadow-[0_0_12px_rgba(255,255,255,0.5)]' : 'border-white/20 hover:border-white/50'}`} style={{
                    background: preset.value || getAvatarGradient(currentUser)
                  }} onClick={() => setPreviewAvatar(preset.value)}>
                        {isSelected && <span className="text-white text-xs font-black drop-shadow">✓</span>}
                      </button>;
                })}
                </div>
              </div>

              {/* Banner Selector */}
              <div>
                <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">🖼️ Nền Banner</div>
                <div className="grid grid-cols-3 gap-2">
                  {BANNER_PRESETS.map(preset => {
                  const isSelected = (previewBanner !== undefined ? previewBanner : customBanner) === preset.value;
                  return <button key={preset.id} title={preset.label} className={`h-12 rounded-xl border-2 transition-all duration-200 cursor-pointer hover:scale-105 flex items-center justify-center text-[10px] font-bold text-white/70 ${isSelected ? 'border-white shadow-[0_0_12px_rgba(255,255,255,0.4)]' : 'border-white/15 hover:border-white/40'}`} style={{
                    background: preset.value || 'linear-gradient(to right, #164e63, #1e1b4b, #4a044e)'
                  }} onClick={() => setPreviewBanner(preset.value)}>
                        {isSelected ? '✓' : preset.label}
                      </button>;
                })}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="px-5 py-4 border-t border-white/10 bg-black/20 flex gap-3 shrink-0">
              <button className="flex-1 py-3 rounded-xl text-sm font-black uppercase tracking-wider text-gray-400 border border-white/15 hover:bg-white/10 transition-all cursor-pointer" onClick={() => {
              setPreviewAvatar(null);
              setPreviewBanner(null);
              setIsCustomizingProfile(false);
            }}>
                Huỷ
              </button>
              <button className="flex-1 py-3 rounded-xl text-sm font-black uppercase tracking-wider text-white border border-fuchsia-500/40 transition-all cursor-pointer hover:scale-105" style={{
              background: 'linear-gradient(135deg, #7c3aed, #db2777)',
              boxShadow: '0 0 20px rgba(167,139,250,0.3)'
            }} onClick={() => {
              playFx('click');
              if (previewAvatar !== null) setCustomAvatar(previewAvatar);
              if (previewBanner !== null) setCustomBanner(previewBanner);
              setPreviewAvatar(null);
              setPreviewBanner(null);
              setIsCustomizingProfile(false);
              showAlert('✅ Đã Lưu!', 'Hồ sơ HLV của bạn đã được cập nhật thành công!');
            }}>
                ✨ Áp Dụng
              </button>
            </div>
          </div>
        </div>}

      {/* 2. GIFT COIN MODAL */}

      {showGiftModal && <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="glass-panel p-6 rounded-2xl max-w-sm w-full border border-yellow-500/30 flex flex-col items-center relative animate-in fade-in zoom-in duration-200">
            <button className="absolute top-3 right-3 text-gray-400 hover:text-white" onClick={() => setShowGiftModal(false)}>
              ✕
            </button>
            <div className="text-4xl mb-2">🎁</div>
            <h2 className="text-xl font-black text-yellow-400 mb-2 uppercase text-center">Tặng Xu Cho {userWallTarget}</h2>
            <p className="text-xs text-gray-400 text-center mb-6">
              Mỗi ngày bạn có thể tặng tối đa <strong className="text-white">500 xu</strong>. Người nhận có thể nhận tối đa <strong className="text-white">1000 xu</strong>. 
            </p>
            
            <div className="w-full flex flex-col items-center gap-4 mb-6">
              <div className="text-3xl font-black text-white flex items-center gap-2">
                <Coins className="text-yellow-400" /> {giftAmount}
              </div>
              <input type="range" min="10" max="200" step="10" value={giftAmount} onChange={e => setGiftAmount(parseInt(e.target.value))} className="w-full accent-yellow-500" />
              <div className="flex justify-between w-full text-[10px] text-gray-500 font-bold">
                <span>10 xu</span>
                <span>200 xu</span>
              </div>
            </div>

            <button onClick={handleSendGift} disabled={giftLoading || level < 2} className={`btn w-full !py-3 rounded-xl font-bold uppercase tracking-wider flex items-center justify-center gap-2 ${giftLoading || level < 2 ? 'bg-gray-600 cursor-not-allowed opacity-50' : 'bg-gradient-to-r from-yellow-600 to-amber-500 hover:from-yellow-500 hover:to-amber-400 text-white shadow-lg shadow-yellow-900/50'}`}>
              {giftLoading ? 'Đang Xử Lý...' : level < 2 ? 'Cần Level 2' : 'Xác Nhận Tặng'}
            </button>
          </div>
        </div>}

      {/* 2.1 GIFT CARD MODAL */}
      {showGiftCardModal && (() => {
        // Filter collection by search query and rarity filter
        const filteredCollection = collection.filter(card => {
          const matchesSearch = card.name.toLowerCase().includes(giftCardSearch.toLowerCase()) || card.nation && card.nation.toLowerCase().includes(giftCardSearch.toLowerCase()) || card.club && card.club.toLowerCase().includes(giftCardSearch.toLowerCase());
          const matchesRarity = giftCardFilterRarity === "all" || getCardRarity(card) === giftCardFilterRarity;
          return matchesSearch && matchesRarity;
        });
        return <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fade-in" onClick={() => setShowGiftCardModal(false)}>
            <div className="glass-panel p-6 sm:p-8 rounded-[2rem] border border-emerald-500/30 max-w-2xl w-full flex flex-col relative bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950/20 shadow-[0_0_50px_rgba(0,0,0,0.8)] max-h-[90vh] overflow-y-auto animate-scale-in" onClick={e => e.stopPropagation()}>
              <button className="absolute top-4 right-4 text-gray-400 hover:text-white bg-black/40 hover:bg-black/80 p-2 rounded-full w-8 h-8 flex items-center justify-center transition-colors z-[130] cursor-pointer" onClick={() => setShowGiftCardModal(false)}>
                ✕
              </button>

              <div className="text-center mb-5">
                <span className="text-[9px] font-black uppercase text-emerald-400 tracking-[0.2em] pl-[0.2em] block mb-1">
                  🎁 CHUYỂN NHƯỢNG THÊ CẦU THỦ
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-wider">
                  Tặng Thẻ Cho HLV {userWallTarget}
                </h2>
                <p className="text-[10px] text-gray-400 mt-1 leading-relaxed">
                  Yêu cầu: <span className="text-emerald-400 font-extrabold">Cấp gửi ≥ 5</span> | <span className="text-emerald-400 font-extrabold">Cấp nhận ≥ 3</span> | <span className="text-emerald-400 font-extrabold">Gửi tối đa 3 thẻ/ngày</span>.
                  <br />
                  Phí Xu theo Rarity: Thường <span className="text-white font-extrabold">20</span> | Hiếm <span className="text-white font-extrabold">50</span> | Siêu Hiếm <span className="text-white font-extrabold">100</span> | Huyền Thoại <span className="text-white font-extrabold">200</span> | Siêu Sao <span className="text-white font-extrabold">400</span>.
                </p>
              </div>

              {/* Sender Level check warning */}
              {level < 5 && <div className="bg-rose-950/30 border border-rose-500/20 text-rose-400 text-[10px] font-bold p-3 rounded-xl mb-4 text-center">
                  ⚠️ Cấp độ của bạn là {level}. Bạn cần đạt tối thiểu Cấp 5 để mở khóa tính năng tặng thẻ cầu thủ!
                </div>}

              {/* Search & Filter bar */}
              <div className="flex flex-col sm:flex-row gap-2.5 mb-4">
                <input type="text" placeholder="Tìm cầu thủ, quốc gia, CLB..." value={giftCardSearch} onChange={e => setGiftCardSearch(e.target.value)} className="bg-black/50 border border-white/10 px-4 py-2 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 flex-1" />
                <select value={giftCardFilterRarity} onChange={e => setGiftCardFilterRarity(e.target.value)} className="bg-black/50 border border-white/10 px-3 py-2 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500 font-bold">
                  <option value="all">Tất Cả Rarity</option>
                  <option value="common">Thường (Base)</option>
                  <option value="rare">Hiếm (Rare)</option>
                  <option value="epic">Siêu Hiếm (Epic)</option>
                  <option value="legendary">Huyền Thoại (Legendary)</option>
                  <option value="mythic">Siêu Sao (Mythic)</option>
                </select>
              </div>

              {/* Cards Grid */}
              <div className="flex-1 min-h-[220px] max-h-[340px] overflow-y-auto bg-black/30 border border-white/5 rounded-2xl p-4 mb-5 scrollbar-thin">
                {filteredCollection.length === 0 ? <div className="flex flex-col items-center justify-center py-12 text-gray-500 text-xs italic">
                    📭 Không tìm thấy thẻ cầu thủ nào hợp lệ trong kho.
                  </div> : <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {filteredCollection.map(card => {
                  const rarity = getCardRarity(card);
                  const tier = RARITY_TIERS[rarity] || RARITY_TIERS.common;
                  const isInSquad = squad.some(s => s.id === card.id);

                  // Check if receiver wall target already has it (we can inspect via wallData.collection or matching)
                  const receiverHasIt = (wallData.collection || []).some(c => c.id === card.id);
                  const isSelected = selectedGiftCard && selectedGiftCard.id === card.id;
                  let statusOverlay = null;
                  if (isInSquad) {
                    statusOverlay = "Trong Squad 🛡️";
                  } else if (receiverHasIt) {
                    statusOverlay = "HLV đã có ✓";
                  }
                  return <div key={card.id} onClick={() => {
                    if (isInSquad || receiverHasIt || level < 5) return;
                    playFx('click');
                    setSelectedGiftCard(isSelected ? null : card);
                  }} className={`relative p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all select-none ${statusOverlay ? 'opacity-40 cursor-not-allowed bg-black/40 border-white/5' : isSelected ? 'bg-emerald-950/40 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)] scale-[1.03] cursor-pointer' : 'bg-black/50 border-white/5 hover:border-emerald-500/40 cursor-pointer hover:scale-[1.01]'}`} style={{
                    boxShadow: isSelected ? `inset 0 0 10px ${tier.glow}` : 'none'
                  }}>
                          {/* Status Overlay Ribbon */}
                          {statusOverlay && <span className="absolute top-2 left-2 z-10 text-[8px] font-black uppercase tracking-wider bg-black/90 text-yellow-500 px-1.5 py-0.5 rounded border border-yellow-500/20">
                              {statusOverlay}
                            </span>}

                          {/* Card Photo (Emoji or avatar placeholder) */}
                          <div className="w-12 h-12 rounded-full flex items-center justify-center text-2xl relative shadow-md" style={{
                      background: tier.glow
                    }}>
                            ⚽
                          </div>

                          <div className="text-center w-full">
                            <div className="font-extrabold text-[11px] text-white truncate uppercase tracking-wide">{card.name}</div>
                            <div className="text-[8px] font-bold mt-0.5" style={{
                        color: tier.color
                      }}>
                              {tier.label} {tier.star}
                            </div>
                            <div className="text-[8px] text-gray-500 truncate mt-0.5">{card.club || ""} | {card.nation || ""}</div>
                          </div>

                          {/* Stat Highlights */}
                          <div className="flex gap-1.5 mt-1 text-[9px] font-bold text-gray-400">
                            <span className="text-red-400">ATK {card.stats.attack}</span>
                            <span className="text-blue-400">DEF {card.stats.defense}</span>
                          </div>
                        </div>;
                })}
                  </div>}
              </div>

              {/* Selected Card Info & Confirmation */}
              {selectedGiftCard ? (() => {
              const fee = getCardGiftFee(selectedGiftCard);
              const rarity = getCardRarity(selectedGiftCard);
              const tier = RARITY_TIERS[rarity];
              const canAfford = coins >= fee;
              return <div className="bg-emerald-950/20 border border-emerald-500/20 p-4 rounded-2xl flex flex-col gap-3 animate-fade-in">
                    <div className="flex justify-between items-center text-xs">
                      <div>
                        <span className="text-[10px] text-gray-400 font-bold uppercase block">Thẻ Được Chọn</span>
                        <span className="font-black text-white uppercase">{selectedGiftCard.name}</span>
                        <span className="ml-1 text-[10px] font-extrabold" style={{
                      color: tier.color
                    }}>({tier.label})</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-gray-400 font-bold uppercase block">Phí Gửi (Xu)</span>
                        <span className={`font-black flex items-center gap-1 justify-end ${canAfford ? 'text-yellow-400' : 'text-rose-400 font-blink'}`}>
                          <Coins size={12} /> {fee} Xu
                        </span>
                      </div>
                    </div>
                    
                    {!canAfford && <p className="text-[10px] text-rose-400 font-semibold text-center bg-rose-950/20 border border-rose-500/10 p-2 rounded-lg">
                        ⚠️ Bạn không đủ Xu để trả phí giao dịch! Cần thêm {fee - coins} Xu.
                      </p>}

                    <button onClick={handleSendCardGift} disabled={giftCardLoading || !canAfford || level < 5} className={`btn w-full !py-3 rounded-xl font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all active:scale-[0.98] ${giftCardLoading || !canAfford || level < 5 ? 'bg-gray-600 text-gray-400 cursor-not-allowed opacity-50' : 'bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white shadow-lg shadow-emerald-900/40 cursor-pointer'}`}>
                      {giftCardLoading ? "Đang Gửi..." : "🤝 Xác Nhận Tặng Thẻ"}
                    </button>
                  </div>;
            })() : <div className="bg-slate-950/40 border border-white/5 p-4 rounded-2xl text-center text-xs text-gray-500 font-bold">
                  👆 Vui lòng chọn một thẻ cầu thủ từ danh sách trên để xem chi tiết và phí gửi.
                </div>}

            </div>
          </div>;
      })()}

      {/* 3.0 SHARE ACHIEVEMENT MODAL */}
      {activeShareData && <ShareModal data={activeShareData} currentUser={currentUser} isConnectedToFirebase={isConnectedToFirebase} showAlert={showAlert} playFx={playFx} onClose={() => setActiveShareData(null)} />}

      {/* 3. IN-GAME CUSTOM ALERT MODAL */}
      {gameAlert && <div className="fixed inset-0 z-[250] flex items-center justify-center bg-black/80  p-4 animate-fade-in">
          <div className="glass-panel p-6 sm:p-8 rounded-[2rem] max-w-sm w-full text-center flex flex-col items-center bg-gradient-to-t from-slate-900 via-slate-950 to-slate-900 border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.8)] relative animate-scale-in">
            <h3 className="text-base font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400 mb-4 uppercase tracking-widest">
              {gameAlert.title || 'Thông Báo'}
            </h3>
            <p className="text-xs sm:text-sm font-semibold text-gray-200 mb-6 leading-relaxed">
              {gameAlert.message}
            </p>
            <button className="btn w-full !bg-cyan-600 hover:!bg-cyan-500 text-white font-bold py-3 rounded-xl transition-all active:scale-[0.98] cursor-pointer" onClick={() => {
            playFx('click');
            setGameAlert(null);
          }}>
              Đồng Ý
            </button>
          </div>
        </div>}
    </></GameProvider>;
}