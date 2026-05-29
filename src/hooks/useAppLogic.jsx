
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { database, isConnectedToFirebase } from '../firebase';
import { ref, set, push, onValue, onDisconnect, serverTimestamp, get, update } from 'firebase/database';
import { QRCodeSVG } from 'qrcode.react';
import playersData from '../players.json';

import { 
  PITCH_POSITIONS, TIERS, AVATAR_PRESETS, BANNER_PRESETS, LEVEL_MILESTONES, 
  CARD_TYPE_BONUS, ACTIVITY_MILESTONES, RARITY_LABEL, CHECK_IN_REWARDS, 
  ENV_WEATHER, ENV_TIME, FORM_STATES, BANNERS 
} from '../constants';
import { 
  hashPIN, triggerConfetti, getPlayerTier, getAvatarGradient, getCardTypeBonus, 
  playFx, getPlayerAttr, checkAttrAdvantage, generateCardForm, getNationEmoji, 
  getRelativeTime, getSquadChemistry, getPlayerChemistryBoost 
} from '../utils';

export function useAppLogic() {
const currentUser = localStorage.getItem('panini_currentUser');

// Load state directly based on currentUser prefix — new users start EMPTY (must open packs to progress)

// Load state directly based on currentUser prefix — new users start EMPTY (must open packs to progress)
const [collection, setCollection] = useState(() => {
  if (!currentUser) return [];
  const saved = localStorage.getItem(`panini_${currentUser}_collection`);
  if (saved) return JSON.parse(saved);
  // Brand-new user: no cards yet — must open starter packs
  return [];
});

const [squad, setSquad] = useState(() => {
  if (!currentUser) return [];
  const saved = localStorage.getItem(`panini_${currentUser}_squad`);
  if (saved) return JSON.parse(saved);
  // Brand-new user: no squad yet — must build from opened packs
  return [];
});

const [coins, setCoins] = useState(() => {
  if (!currentUser) return 0;
  const saved = localStorage.getItem(`panini_${currentUser}_coins`);
  return saved !== null ? parseInt(saved) : 0; // New users start with 0 coins; earn through quests/levels
});

const [isDataLoaded, setIsDataLoaded] = useState(false);

const urlParams = new URLSearchParams(window.location.search);

const pvpTarget = urlParams.get('pvp');

const [gameState, setGameState] = useState(() => {
  const currentUser = localStorage.getItem('panini_currentUser');
  if (currentUser && pvpTarget) {
    const storedSquad = JSON.parse(localStorage.getItem(`panini_${currentUser}_squad`)) || [];
    const finalSquad = storedSquad.length === 11 ? storedSquad : playersData.filter(p => p.type === 'Base').slice(0, 11);
    if (finalSquad.length === 11) return 'multiplayer';
    const storedCollection = JSON.parse(localStorage.getItem(`panini_${currentUser}_collection`)) || [];
    const finalCollection = storedCollection.length >= 11 ? storedCollection : playersData.filter(p => p.type === 'Base').slice(0, 11);
    if (finalCollection.length < 11) return 'packOpening';
    return 'teamBuilder';
  }
  return 'lobby';
}); // 'lobby', 'packOpening', 'teamBuilder', 'matchEngine', 'quests', 'multiplayer'

// 'lobby', 'packOpening', 'teamBuilder', 'matchEngine', 'quests', 'multiplayer'

const [activePvpTarget, setActivePvpTarget] = useState(pvpTarget);

const [showPvpJoinModal, setShowPvpJoinModal] = useState(false);

const [pvpJoinInput, setPvpJoinInput] = useState('');

const [activeBannerIdx, setActiveBannerIdx] = useState(0);

// --- Referral & Share States ---

// --- Referral & Share States ---
const [referredBy, setReferredBy] = useState(() => {
  return localStorage.getItem(`panini_${currentUser}_referredBy`) || '';
});

const [referrals, setReferrals] = useState(() => {
  const saved = localStorage.getItem(`panini_${currentUser}_referrals`);
  if (saved) return JSON.parse(saved);
  return [{
    username: 'QuangVinh_Class5',
    level: 5,
    claimed: false
  }, {
    username: 'Minh_NghiaTan',
    level: 3,
    claimed: false
  }, {
    username: 'GiaBao_Gamer',
    level: 1,
    claimed: false
  }];
});

const [inviteInput, setInviteInput] = useState('');

const [refCodeInput, setRefCodeInput] = useState('');

const [showSharePoster, setShowSharePoster] = useState(null); // card data to show share poster, or null

// card data to show share poster, or null
const [selectedUpgradeCard, setSelectedUpgradeCard] = useState(null); // card data for upgrade modal

// card data for upgrade modal

const upgradeCard = cardId => {
  const card = collection.find(c => c.id === cardId);
  if (!card) return;
  const currentLvl = card.level || 1;
  if (currentLvl >= 10) {
    showAlert("🚫 Tối Đa Cấp Độ!", "Cầu thủ này đã đạt cấp độ tối đa (Lv.10)!");
    return;
  }
  const cost = currentLvl * 150;
  if (coins < cost) {
    showAlert("🪙 Thiếu Xu!", `Bạn cần ${cost} Xu để nâng cấp cầu thủ này (Hiện có: ${coins} Xu).`);
    return;
  }
  const nextCoins = coins - cost;
  setCoins(nextCoins);
  localStorage.setItem(`panini_${currentUser}_coins`, nextCoins.toString());
  const updatedCollection = collection.map(c => {
    if (c.id === cardId) {
      return {
        ...c,
        level: currentLvl + 1
      };
    }
    return c;
  });
  setCollection(updatedCollection);
  localStorage.setItem(`panini_${currentUser}_collection`, JSON.stringify(updatedCollection));
  const updatedSquad = squad.map(s => {
    if (s.id === cardId) {
      return {
        ...s,
        level: currentLvl + 1
      };
    }
    return s;
  });
  setSquad(updatedSquad);
  localStorage.setItem(`panini_${currentUser}_squad`, JSON.stringify(updatedSquad));
  setSelectedUpgradeCard({
    ...card,
    level: currentLvl + 1
  });
  playFx('winPoint');
  showAlert("⚡ Nâng Cấp Thành Công!", `${card.name} đã thăng cấp lên Lv.${currentLvl + 1}! Tất cả chỉ số được cộng +2!`);
};

const addReferralFriend = username => {
  if (!username.trim()) return;
  const cleanName = username.trim();
  if (cleanName === currentUser) {
    showAlert("🚫 Không Thể Tự Mời!", "Bạn không thể tự mời chính mình!");
    return;
  }
  if (referrals.some(r => r.username.toLowerCase() === cleanName.toLowerCase())) {
    showAlert("⚠️ HLV Đã Tồn Tại!", "HLV này đã có trong danh sách giới thiệu của bạn!");
    return;
  }
  const newRef = {
    username: cleanName,
    level: 1,
    claimed: false
  };
  const updated = [...referrals, newRef];
  setReferrals(updated);
  localStorage.setItem(`panini_${currentUser}_referrals`, JSON.stringify(updated));
  setInviteInput('');
  showAlert("📨 Gửi Lời Mời!", `Đã thêm HLV ${cleanName} vào danh sách mời. Nhận thưởng +100 Xu & +1 Gói quà khi bạn này đạt Level 5!`);
};

const submitReferralCode = code => {
  if (!code.trim()) return;
  const cleanCode = code.trim();
  if (cleanCode === currentUser) {
    showAlert("🚫 Không Thể Tự Giới Thiệu!", "Bạn không thể nhập mã giới thiệu của chính mình!");
    return;
  }
  setReferredBy(cleanCode);
  localStorage.setItem(`panini_${currentUser}_referredBy`, cleanCode);
  setCoins(c => c + 50);
  showAlert("🎉 Nhập Mã Thành Công!", `Bạn đã nhập mã giới thiệu của HLV ${cleanCode}. Nhận ngay +50 Xu làm quen!`);
};

const claimReferralReward = friendUsername => {
  setReferrals(prev => {
    const updated = prev.map(ref => {
      if (ref.username === friendUsername && ref.level >= 5 && !ref.claimed) {
        setCoins(c => c + 100);
        setFreePacks(f => f + 1); // 1 Free Pack
        showAlert("🎁 Nhận Thưởng Giới Thiệu!", `Chúc mừng! Bạn đã nhận thưởng +100 Xu & +1 Gói Thẻ Huyền Thoại từ HLV ${friendUsername}!`);
        return {
          ...ref,
          claimed: true
        };
      }
      return ref;
    });
    localStorage.setItem(`panini_${currentUser}_referrals`, JSON.stringify(updated));
    return updated;
  });
};

const performCheckIn = () => {
  if (!currentUser) return;
  const now = Date.now();
  const lastClaimed = checkInState.lastClaimed || 0;

  // Check if claimed today (less than 24h and same calendar day)
  const lastDate = new Date(lastClaimed).toDateString();
  const nowDate = new Date(now).toDateString();
  if (lastClaimed > 0 && lastDate === nowDate) {
    showAlert("🚫 Đã Điểm Danh!", "Hôm nay bạn đã điểm danh rồi. Hãy quay lại vào ngày mai nhé!");
    return;
  }

  // Check if the streak is consecutive. If the last claim was more than 48 hours ago, reset streak to 0.
  let newStreak = (checkInState.streak || 0) + 1;
  if (lastClaimed > 0 && now - lastClaimed > 48 * 60 * 60 * 1000) {
    newStreak = 1; // reset streak to 1 if broken
  }
  if (newStreak > 7) {
    newStreak = 1; // cycle back to 1 after Day 7
  }

  // Claim reward based on newStreak
  let rewardMsg = "";
  if (newStreak === 1) {
    const amt = 50;
    setCoins(c => c + amt);
    rewardMsg = `🎁 Bạn nhận được +${amt} Xu!`;
  } else if (newStreak === 2) {
    const amt = 80;
    setCoins(c => c + amt);
    rewardMsg = `🎁 Bạn nhận được +${amt} Xu!`;
  } else if (newStreak === 3) {
    setFreePacks(f => f + 1);
    rewardMsg = "🎁 Bạn nhận được +1 Gói Quà Miễn Phí!";
  } else if (newStreak === 4) {
    const amt = 120;
    setCoins(c => c + amt);
    rewardMsg = `🎁 Bạn nhận được +${amt} Xu!`;
  } else if (newStreak === 5) {
    const amt = 150;
    setCoins(c => c + amt);
    rewardMsg = `🎁 Bạn nhận được +${amt} Xu!`;
  } else if (newStreak === 6) {
    setFreePacks(f => f + 2);
    rewardMsg = "🎁 Bạn nhận được +2 Gói Quà Miễn Phí!";
  } else if (newStreak === 7) {
    // Day 7: random rare card! Let's pick a Legendary or Icon/Super Limited card.
    const rarePlayers = playersData.filter(p => ['Icon', 'Golden Baller', 'Super Limited', 'Platinum Edition'].includes(p.type));
    const chosenPlayer = rarePlayers[Math.floor(Math.random() * rarePlayers.length)] || playersData[0];

    // Add card to collection
    const newCard = {
      ...chosenPlayer,
      id: `${chosenPlayer.id}_checkin_${now}`,
      // unique id
      level: 1,
      _rarity: chosenPlayer.type === 'Icon' ? 'mythic' : 'legendary'
    };
    const updatedCollection = [...collection, newCard];
    setCollection(updatedCollection);
    localStorage.setItem(`panini_${currentUser}_collection`, JSON.stringify(updatedCollection));
    if (isConnectedToFirebase) {
      set(ref(database, `/users/${currentUser}/collection`), updatedCollection);
    }
    rewardMsg = `🌟 SIÊU CẤP ĐẶC BIỆT! Bạn đã hoàn thành 7 ngày điểm danh và nhận được thẻ ngôi sao [${chosenPlayer.name}] (${chosenPlayer.type})!`;
  }
  const nextState = {
    lastClaimed: now,
    streak: newStreak
  };
  setCheckInState(nextState);
  playFx('winPoint');

  // Add check-in message in Global Chat!
  if (isConnectedToFirebase) {
    const chatRef = ref(database, '/chat');
    push(chatRef, {
      sender: 'HỆ THỐNG 📣',
      text: `🎉 Chúc mừng HLV [${currentUser}] đã điểm danh thành công Ngày ${newStreak}/7 và nhận quà!`,
      timestamp: serverTimestamp()
    });
  }

  // Trigger confetti!
  triggerConfetti({
    particleCount: newStreak === 7 ? 300 : 100,
    spread: 80,
    origin: {
      y: 0.6
    }
  });
  showAlert(`📅 Điểm Danh Thành Công (Ngày ${newStreak}/7)`, `${rewardMsg} Hãy duy trì điểm danh liên tục nhé!`);
};

useEffect(() => {
  const timer = setInterval(() => {
    setActiveBannerIdx(prev => (prev + 1) % BANNERS.length);
  }, 7000);
  return () => clearInterval(timer);
}, []);

// Auth State — unified PIN system (no email/complex password)

// Auth State — unified PIN system (no email/complex password)
const [authMode, setAuthMode] = useState('play'); // 'play' only (unified)

// 'play' only (unified)
const [authUsername, setAuthUsername] = useState("");

const [authPassword, setAuthPassword] = useState(""); // kept for compat

// kept for compat
const [authPin, setAuthPin] = useState(""); // 4-digit PIN (optional)

// 4-digit PIN (optional)
const [authStep, setAuthStep] = useState('enter_name'); // 'enter_name' | 'enter_pin' | 'set_pin'

// 'enter_name' | 'enter_pin' | 'set_pin'
const [authCheckingUser, setAuthCheckingUser] = useState(false);

const [authFoundUser, setAuthFoundUser] = useState(null); // null | firebase user data

// null | firebase user data

const [isPackOpeningAnim, setIsPackOpeningAnim] = useState(false);

const [openedCards, setOpenedCards] = useState([]);

// Economy State

// Economy State
const [quests, setQuests] = useState(() => {
  if (!currentUser) return [{
    id: 'play1',
    title: 'Đá 1 trận với AI',
    target: 1,
    progress: 0,
    reward: 50,
    isCompleted: false,
    isClaimed: false
  }, {
    id: 'win1',
    title: 'Thắng 1 trận với AI',
    target: 1,
    progress: 0,
    reward: 100,
    isCompleted: false,
    isClaimed: false
  }, {
    id: 'collect20',
    title: 'Sưu tầm 20 thẻ khác nhau',
    target: 20,
    progress: 0,
    reward: 150,
    isCompleted: false,
    isClaimed: false
  }];
  const saved = localStorage.getItem(`panini_${currentUser}_quests`);
  return saved ? JSON.parse(saved) : [{
    id: 'play1',
    title: 'Đá 1 trận với AI',
    target: 1,
    progress: 0,
    reward: 50,
    isCompleted: false,
    isClaimed: false
  }, {
    id: 'win1',
    title: 'Thắng 1 trận với AI',
    target: 1,
    progress: 0,
    reward: 100,
    isCompleted: false,
    isClaimed: false
  }, {
    id: 'collect20',
    title: 'Sưu tầm 20 thẻ khác nhau',
    target: 20,
    progress: 0,
    reward: 150,
    isCompleted: false,
    isClaimed: false
  }];
});

const [lastReward, setLastReward] = useState(0);

useEffect(() => {
  const uniqueCards = new Set(collection.map(c => c.id)).size;
  setQuests(prev => prev.map(q => {
    if (q.id === 'collect20') {
      const isDone = uniqueCards >= 20;
      return {
        ...q,
        progress: Math.min(uniqueCards, 20),
        isCompleted: isDone || q.isCompleted
      };
    }
    return q;
  }));
}, [collection]);

// Level & XP State

// Level & XP State
const [level, setLevel] = useState(() => {
  if (!currentUser) return 1;
  const saved = localStorage.getItem(`panini_${currentUser}_level`);
  return saved ? parseInt(saved) : 1;
});

const [xp, setXp] = useState(() => {
  if (!currentUser) return 0;
  const saved = localStorage.getItem(`panini_${currentUser}_xp`);
  return saved ? parseInt(saved) : 0;
});

const [stats, setStats] = useState(() => {
  if (!currentUser) return {
    played: 0,
    wins: 0,
    draws: 0,
    losses: 0
  };
  const saved = localStorage.getItem(`panini_${currentUser}_stats`);
  return saved ? JSON.parse(saved) : {
    played: 0,
    wins: 0,
    draws: 0,
    losses: 0
  };
});

// Email recovery state

// Email recovery state
const [email, setEmail] = useState(() => {
  if (!currentUser) return "";
  const saved = localStorage.getItem(`panini_${currentUser}_email`);
  return saved || "";
});

// Forgot password inputs

// Forgot password inputs
const [forgotEmail, setForgotEmail] = useState("");

const [newPasswordReset, setNewPasswordReset] = useState("");

const [confirmPasswordReset, setConfirmPasswordReset] = useState("");

// Profile Change Password states

// Profile Change Password states
const [profileOldPassword, setProfileOldPassword] = useState("");

const [profileNewPassword, setProfileNewPassword] = useState("");

const [profileConfirmPassword, setProfileConfirmPassword] = useState("");

const [profileEmailInput, setProfileEmailInput] = useState("");

const [newUsernameInput, setNewUsernameInput] = useState("");

const [isRenaming, setIsRenaming] = useState(false);

// Level Up Modal State

// Level Up Modal State
const [showLevelUpModal, setShowLevelUpModal] = useState(null);

// Profile Inspector States

// Profile Inspector States
const [inspectingUser, setInspectingUser] = useState(null);

const [inspectedUserData, setInspectedUserData] = useState(null);

const [loadingInspectedUser, setLoadingInspectedUser] = useState(false);

// User Wall (X/Twitter) States

// User Wall (X/Twitter) States
const [userWallTarget, setUserWallTarget] = useState(null);

const [userWallData, setUserWallData] = useState(null);

const wallData = userWallData || {
  level: 1,
  xp: 0,
  stats: {
    played: 0,
    wins: 0,
    draws: 0,
    losses: 0
  },
  squad: []
};

const [userWallPosts, setUserWallPosts] = useState([]);

const [globalPosts, setGlobalPosts] = useState([]);

const [socialWallTab, setSocialWallTab] = useState('global'); // 'global' | 'owner'

// 'global' | 'owner'
const [mobileSubTab, setMobileSubTab] = useState('feed'); // 'feed' | 'search' | 'profile'

// 'feed' | 'search' | 'profile'
const [newPostText, setNewPostText] = useState("");

const [commentInputs, setCommentInputs] = useState({});

const [loadingWall, setLoadingWall] = useState(false);

// Gift Coins states

// Gift Coins states
const [showGiftModal, setShowGiftModal] = useState(false);

const [giftAmount, setGiftAmount] = useState(10);

const [giftLoading, setGiftLoading] = useState(false);

const [loadingGlobalPosts, setLoadingGlobalPosts] = useState(false);

// Gift Card states

// Gift Card states
const [showGiftCardModal, setShowGiftCardModal] = useState(false);

const [giftCardLoading, setGiftCardLoading] = useState(false);

const [giftCardSearch, setGiftCardSearch] = useState("");

const [selectedGiftCard, setSelectedGiftCard] = useState(null);

const [giftCardFilterRarity, setGiftCardFilterRarity] = useState("all");

// HLV Social Wall Search & Mention states

// HLV Social Wall Search & Mention states
const [socialSearchQuery, setSocialSearchQuery] = useState("");

const [showMentionDropdown, setShowMentionDropdown] = useState(false);

const [mentionQuery, setMentionQuery] = useState("");

// Private Chat States

// Private Chat States
const [activePrivatePartner, setActivePrivatePartner] = useState(null);

const [privateMessages, setPrivateMessages] = useState([]);

const [myPrivateChats, setMyPrivateChats] = useState([]);

const [privateChatInput, setPrivateChatInput] = useState('');

const [unreadPartners, setUnreadPartners] = useState({});

// Rewarded Activity Milestones (for auto-gifting special edition cards)

// Rewarded Activity Milestones (for auto-gifting special edition cards)
const [rewardedMilestones, setRewardedMilestones] = useState(() => {
  if (!currentUser) return [];
  const saved = localStorage.getItem(`panini_${currentUser}_rewardedMilestones`);
  return saved ? JSON.parse(saved) : [];
});

// Leaderboard & Levels States

// Leaderboard & Levels States
const [claimedLevelRewards, setClaimedLevelRewards] = useState(() => {
  if (!currentUser) return [];
  const saved = localStorage.getItem(`panini_${currentUser}_claimedLevelRewards`);
  return saved ? JSON.parse(saved) : [];
});

const [freePacks, setFreePacks] = useState(() => {
  if (!currentUser) return 0;
  const saved = localStorage.getItem(`panini_${currentUser}_freePacks`);
  return saved ? parseInt(saved) : 0;
});

const [pityCounter, setPityCounter] = useState(() => {
  if (!currentUser) return 0;
  const saved = localStorage.getItem(`panini_${currentUser}_pity`);
  return saved ? parseInt(saved) : 0;
});

const [userCreatedAt, setUserCreatedAt] = useState(() => {
  if (!currentUser) return 0;
  const saved = localStorage.getItem(`panini_${currentUser}_createdAt`);
  return saved ? parseInt(saved, 10) : 0;
});

const [revealingCards, setRevealingCards] = useState([]); // cards being revealed one by one

// cards being revealed one by one
const [revealIndex, setRevealIndex] = useState(0); // which card is currently revealed

// which card is currently revealed
const [packType, setPackType] = useState('standard'); // 'starter'|'standard'|'premium'|'ultimate'

// 'starter'|'standard'|'premium'|'ultimate'

const [leaderboardData, setLeaderboardData] = useState([]);

const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);

const [leaderboardTab, setLeaderboardTab] = useState('leaderboard'); // 'leaderboard', 'tiers', 'milestones'

// --- Daily Check-In & Achievements State ---

// 'leaderboard', 'tiers', 'milestones'

// --- Daily Check-In & Achievements State ---
const [checkInState, setCheckInState] = useState(() => {
  if (!currentUser) return {
    lastClaimed: 0,
    streak: 0
  };
  const saved = localStorage.getItem(`panini_${currentUser}_checkin`);
  return saved ? JSON.parse(saved) : {
    lastClaimed: 0,
    streak: 0
  };
});

const alreadyClaimedToday = React.useMemo(() => {
  if (!checkInState.lastClaimed) return false;
  const lastDate = new Date(checkInState.lastClaimed).toDateString();
  const nowDate = new Date().toDateString();
  return lastDate === nowDate;
}, [checkInState.lastClaimed]);

const [equippedTitle, setEquippedTitle] = useState(() => {
  if (!currentUser) return "";
  return localStorage.getItem(`panini_${currentUser}_equippedTitle`) || "";
});

const [claimedAchievements, setClaimedAchievements] = useState(() => {
  if (!currentUser) return [];
  const saved = localStorage.getItem(`panini_${currentUser}_claimedAchievements`);
  return saved ? JSON.parse(saved) : [];
});

// Profile Customization States

// Profile Customization States
const [customAvatar, setCustomAvatar] = useState(() => {
  if (!currentUser) return null;
  return localStorage.getItem(`panini_${currentUser}_customAvatar`) || null;
});

const [customBanner, setCustomBanner] = useState(() => {
  if (!currentUser) return null;
  return localStorage.getItem(`panini_${currentUser}_customBanner`) || null;
});

const [isCustomizingProfile, setIsCustomizingProfile] = useState(false);

const [previewAvatar, setPreviewAvatar] = useState(null);

const [previewBanner, setPreviewBanner] = useState(null);

const [showCheckInModal, setShowCheckInModal] = useState(false);

const [activeShareData, setActiveShareData] = useState(null);

// Showroom page state (must be here at top level - Rules of Hooks)

// Showroom page state (must be here at top level - Rules of Hooks)
const [showroomFilterState, setShowroomFilterState] = useState('mythic');

const [showroomHoverState, setShowroomHoverState] = useState(null);

// Global Escape Key Handler for Modals

// Global Escape Key Handler for Modals
useEffect(() => {
  const handleKeyDown = e => {
    if (e.key === 'Escape') {
      if (selectedUpgradeCard) setSelectedUpgradeCard(null);
      if (inspectingUser) {
        setInspectingUser(null);
        setInspectedUserData(null);
      }
      setShowCheckInModal(false);
      setActiveShareData(null);
    }
  };
  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, [selectedUpgradeCard, inspectingUser, activeShareData]);

// Sync rewardedMilestones to localStorage and Firebase

// Sync rewardedMilestones to localStorage and Firebase
useEffect(() => {
  if (isConnectedToFirebase && !isDataLoaded) return;
  if (currentUser) {
    localStorage.setItem(`panini_${currentUser}_rewardedMilestones`, JSON.stringify(rewardedMilestones));
    if (isConnectedToFirebase) {
      set(ref(database, `/users/${currentUser}/rewardedMilestones`), rewardedMilestones);
    }
  }
}, [rewardedMilestones, currentUser, isDataLoaded]);

useEffect(() => {
  if (isConnectedToFirebase && !isDataLoaded) return;
  if (currentUser) {
    localStorage.setItem(`panini_${currentUser}_claimedLevelRewards`, JSON.stringify(claimedLevelRewards));
    if (isConnectedToFirebase) {
      set(ref(database, `/users/${currentUser}/claimedLevelRewards`), claimedLevelRewards);
    }
  }
}, [claimedLevelRewards, currentUser, isDataLoaded]);

useEffect(() => {
  if (isConnectedToFirebase && !isDataLoaded) return;
  if (currentUser) {
    localStorage.setItem(`panini_${currentUser}_freePacks`, freePacks.toString());
    if (isConnectedToFirebase) {
      set(ref(database, `/users/${currentUser}/freePacks`), freePacks);
    }
  }
}, [freePacks, currentUser, isDataLoaded]);

useEffect(() => {
  if (isConnectedToFirebase && !isDataLoaded) return;
  if (currentUser && userCreatedAt) {
    localStorage.setItem(`panini_${currentUser}_createdAt`, userCreatedAt.toString());
    if (isConnectedToFirebase) {
      set(ref(database, `/users/${currentUser}/createdAt`), userCreatedAt);
    }
  }
}, [userCreatedAt, currentUser, isDataLoaded]);

useEffect(() => {
  if (isConnectedToFirebase && !isDataLoaded) return;
  if (currentUser) {
    localStorage.setItem(`panini_${currentUser}_checkin`, JSON.stringify(checkInState));
    if (isConnectedToFirebase) {
      set(ref(database, `/users/${currentUser}/checkIn`), checkInState);
    }
  }
}, [checkInState, currentUser, isDataLoaded]);

useEffect(() => {
  if (isConnectedToFirebase && !isDataLoaded) return;
  if (currentUser) {
    localStorage.setItem(`panini_${currentUser}_equippedTitle`, equippedTitle);
    if (isConnectedToFirebase) {
      set(ref(database, `/users/${currentUser}/equippedTitle`), equippedTitle);
      // Also update in leaderboard presence to make it public!
      update(ref(database, `/leaderboard/${currentUser}`), {
        equippedTitle
      });
    }
  }
}, [equippedTitle, currentUser, isDataLoaded]);

useEffect(() => {
  if (isConnectedToFirebase && !isDataLoaded) return;
  if (currentUser) {
    localStorage.setItem(`panini_${currentUser}_claimedAchievements`, JSON.stringify(claimedAchievements));
    if (isConnectedToFirebase) {
      set(ref(database, `/users/${currentUser}/claimedAchievements`), claimedAchievements);
    }
  }
}, [claimedAchievements, currentUser, isDataLoaded]);

useEffect(() => {
  if (isConnectedToFirebase && !isDataLoaded) return;
  if (currentUser) {
    if (customAvatar) localStorage.setItem(`panini_${currentUser}_customAvatar`, customAvatar);else localStorage.removeItem(`panini_${currentUser}_customAvatar`);
    if (isConnectedToFirebase) {
      set(ref(database, `/users/${currentUser}/customAvatar`), customAvatar || null);
    }
  }
}, [customAvatar, currentUser, isDataLoaded]);

useEffect(() => {
  if (isConnectedToFirebase && !isDataLoaded) return;
  if (currentUser) {
    if (customBanner) localStorage.setItem(`panini_${currentUser}_customBanner`, customBanner);else localStorage.removeItem(`panini_${currentUser}_customBanner`);
    if (isConnectedToFirebase) {
      set(ref(database, `/users/${currentUser}/customBanner`), customBanner || null);
    }
  }
}, [customBanner, currentUser, isDataLoaded]);

useEffect(() => {
  if (gameState === 'profile') {
    setProfileEmailInput(email);
  }
}, [gameState, email]);

// Helper to sync stats to the dedicated leaderboard node for performance

// Helper to sync stats to the dedicated leaderboard node for performance
const syncLeaderboard = async (username, stats) => {
  if (!isConnectedToFirebase || !username) return;
  try {
    await update(ref(database, `/leaderboard/${username}`), stats);
  } catch (error) {
    console.error('Failed to sync leaderboard stats:', error);
  }
};

// Fetch Global Leaderboard

// Fetch Global Leaderboard
useEffect(() => {
  if (gameState === 'leaderboard' || gameState === 'userWall') {
    setLoadingLeaderboard(true);
    const lbRef = ref(database, 'leaderboard');
    get(lbRef).then(snapshot => {
      if (snapshot.exists()) {
        const lbObj = snapshot.val();
        const list = Object.keys(lbObj).map(key => {
          const val = lbObj[key] || {};
          return {
            username: key,
            level: val.level || 1,
            xp: val.xp || 0,
            coins: val.coins || 0,
            wins: val.wins || 0,
            losses: val.losses || 0,
            draws: val.draws || 0,
            totalMatches: (val.wins || 0) + (val.losses || 0) + (val.draws || 0),
            cardCount: val.cardCount || 0,
            ovr: val.ovr || 0
          };
        });
        list.sort((a, b) => {
          if (b.level !== a.level) return b.level - a.level;
          if (b.xp !== a.xp) return b.xp - a.xp;
          return b.wins - a.wins;
        });
        setLeaderboardData(list);
        setLoadingLeaderboard(false);
      } else {
        // Fallback migration: if leaderboard node is empty, fetch from users and populate
        const usersRef = ref(database, 'users');
        get(usersRef).then(snap => {
          if (snap.exists()) {
            const usersObj = snap.val();
            const list = Object.keys(usersObj).map(key => {
              const userVal = usersObj[key] || {};
              const cardCount = userVal.collection ? Object.keys(userVal.collection).length : 0;
              const userOvr = userVal.squad ? Math.round(userVal.squad.reduce((acc, card) => acc + Math.max(card.stats.attack, card.stats.defense, card.stats.control), 0) / 11) : 0;
              const stats = {
                level: userVal.level || 1,
                xp: userVal.xp || 0,
                coins: userVal.coins || 0,
                wins: userVal.stats?.wins || 0,
                losses: userVal.stats?.losses || 0,
                draws: userVal.stats?.draws || 0,
                cardCount: cardCount,
                ovr: userOvr
              };
              syncLeaderboard(key, stats); // auto-migrate
              return {
                username: key,
                ...stats,
                totalMatches: (stats.wins || 0) + (stats.losses || 0) + (stats.draws || 0)
              };
            });
            list.sort((a, b) => {
              if (b.level !== a.level) return b.level - a.level;
              if (b.xp !== a.xp) return b.xp - a.xp;
              return b.wins - a.wins;
            });
            setLeaderboardData(list);
          }
          setLoadingLeaderboard(false);
        });
      }
    }).catch(err => {
      console.error(err);
      setLoadingLeaderboard(false);
    });
  }
}, [gameState]);

// Auto-save state to localStorage & Firebase when they change

// Auto-save state to localStorage & Firebase when they change
useEffect(() => {
  if (isConnectedToFirebase && !isDataLoaded) return;
  if (currentUser) {
    localStorage.setItem(`panini_${currentUser}_collection`, JSON.stringify(collection));
    if (isConnectedToFirebase) {
      set(ref(database, `/users/${currentUser}/collection`), collection);
    }
  }
}, [collection, currentUser, isDataLoaded]);

useEffect(() => {
  if (isConnectedToFirebase && !isDataLoaded) return;
  if (currentUser) {
    localStorage.setItem(`panini_${currentUser}_squad`, JSON.stringify(squad));
    if (isConnectedToFirebase) {
      set(ref(database, `/users/${currentUser}/squad`), squad);
    }
  }
}, [squad, currentUser, isDataLoaded]);

useEffect(() => {
  if (isConnectedToFirebase && !isDataLoaded) return;
  if (currentUser) {
    localStorage.setItem(`panini_${currentUser}_coins`, coins.toString());
    if (isConnectedToFirebase) {
      set(ref(database, `/users/${currentUser}/coins`), coins);
    }
  }
}, [coins, currentUser, isDataLoaded]);

useEffect(() => {
  if (isConnectedToFirebase && !isDataLoaded) return;
  if (currentUser) {
    localStorage.setItem(`panini_${currentUser}_quests`, JSON.stringify(quests));
    if (isConnectedToFirebase) {
      set(ref(database, `/users/${currentUser}/quests`), quests);
    }
  }
}, [quests, currentUser, isDataLoaded]);

useEffect(() => {
  if (isConnectedToFirebase && !isDataLoaded) return;
  if (currentUser) {
    localStorage.setItem(`panini_${currentUser}_level`, level.toString());
    if (isConnectedToFirebase) {
      set(ref(database, `/users/${currentUser}/level`), level);
    }
  }
}, [level, currentUser, isDataLoaded]);

useEffect(() => {
  if (isConnectedToFirebase && !isDataLoaded) return;
  if (currentUser) {
    localStorage.setItem(`panini_${currentUser}_xp`, xp.toString());
    if (isConnectedToFirebase) {
      set(ref(database, `/users/${currentUser}/xp`), xp);
    }
  }
}, [xp, currentUser, isDataLoaded]);

useEffect(() => {
  if (isConnectedToFirebase && !isDataLoaded) return;
  if (currentUser) {
    localStorage.setItem(`panini_${currentUser}_stats`, JSON.stringify(stats));
    if (isConnectedToFirebase) {
      set(ref(database, `/users/${currentUser}/stats`), stats);
    }
  }
}, [stats, currentUser, isDataLoaded]);

// Sync to Leaderboard node

// Sync to Leaderboard node
useEffect(() => {
  if (currentUser && isConnectedToFirebase) {
    const cardCount = Object.keys(collection).length;
    const userOvr = squad.length === 11 ? Math.round(squad.reduce((acc, card) => acc + Math.max(card.stats.attack, card.stats.defense, card.stats.control), 0) / 11) : 0;
    const lbStats = {
      level: level || 1,
      xp: xp || 0,
      coins: coins || 0,
      wins: stats?.wins || 0,
      losses: stats?.losses || 0,
      draws: stats?.draws || 0,
      cardCount: cardCount,
      ovr: userOvr,
      equippedTitle: equippedTitle || ""
    };
    syncLeaderboard(currentUser, lbStats);
  }
}, [currentUser, level, xp, coins, stats, collection, squad, equippedTitle, isConnectedToFirebase]);

useEffect(() => {
  if (isConnectedToFirebase && !isDataLoaded) return;
  if (currentUser) {
    localStorage.setItem(`panini_${currentUser}_email`, email);
    if (isConnectedToFirebase) {
      set(ref(database, `/users/${currentUser}/email`), email);
    }
  }
}, [email, currentUser, isDataLoaded]);

// Sync from Firebase on login/mount

// Sync from Firebase on login/mount
useEffect(() => {
  if (!currentUser || !isConnectedToFirebase) return;
  const userRef = ref(database, `/users/${currentUser}`);
  const unsubscribe = onValue(userRef, snapshot => {
    const data = snapshot.val();
    if (data) {
      // Cấp 200 xu khởi đầu 1 lần cho tất cả user chưa nhận (kể cả user cũ coins=0)
      if (!data.startingBonus) {
        const bonusCoins = (data.coins || 0) + 200;
        setCoins(bonusCoins);
        set(ref(database, `/users/${currentUser}/coins`), bonusCoins);
        set(ref(database, `/users/${currentUser}/startingBonus`), true);
      } else {
        if (data.coins !== undefined) setCoins(data.coins);
      }
      if (data.collection) setCollection(data.collection);
      if (data.squad) setSquad(data.squad);
      if (data.quests) setQuests(data.quests);
      if (data.level !== undefined) setLevel(data.level);
      if (data.xp !== undefined) setXp(data.xp);
      if (data.stats) setStats(data.stats);
      if (data.email !== undefined) setEmail(data.email);
      if (data.freePacks !== undefined) setFreePacks(data.freePacks);
      if (data.claimedLevelRewards) setClaimedLevelRewards(data.claimedLevelRewards);
      if (data.rewardedMilestones) setRewardedMilestones(data.rewardedMilestones);
      if (data.createdAt) setUserCreatedAt(data.createdAt);
      if (data.checkIn) setCheckInState(data.checkIn);
      if (data.equippedTitle !== undefined) setEquippedTitle(data.equippedTitle);
      if (data.claimedAchievements) setClaimedAchievements(data.claimedAchievements);
      if (data.customAvatar !== undefined) setCustomAvatar(data.customAvatar || null);
      if (data.customBanner !== undefined) setCustomBanner(data.customBanner || null);
      if (data.coinNotification) {
        showAlert("🎁 Chúc Mừng!", `Bạn vừa nhận được ${data.coinNotification.amount} xu từ HLV ${data.coinNotification.from}!`);
        set(ref(database, `/users/${currentUser}/coinNotification`), null);
      }
      if (data.cardNotification) {
        const rarityLabel = RARITY_TIERS[getCardRarity(data.cardNotification.card)]?.label || "THƯỜNG";
        showAlert("🎁 Thẻ Cầu Thủ Mới!", `Bạn vừa được HLV ${data.cardNotification.from} tặng thẻ cầu thủ [${data.cardNotification.card.name}] (${rarityLabel})!`);
        set(ref(database, `/users/${currentUser}/cardNotification`), null);
      }
      setIsDataLoaded(true);
    } else {
      // Initialize brand-new guest user — fresh start with 3 starter packs + 200 xu
      const initialData = {
        username: currentUser,
        password: "",
        email: "",
        pin: "",
        coins: 200,
        // 200 starting bonus for new users
        collection: [],
        squad: [],
        level: 1,
        xp: 0,
        freePacks: 3,
        startingBonus: true,
        // mark as received
        createdAt: Date.now(),
        checkIn: {
          lastClaimed: 0,
          streak: 0
        },
        equippedTitle: "",
        claimedAchievements: [],
        quests: [{
          id: 'open_pack1',
          title: 'Mở gói thẻ đầu tiên',
          target: 1,
          progress: 0,
          reward: 100,
          isCompleted: false,
          isClaimed: false
        }, {
          id: 'build_squad',
          title: 'Xây dựng đội hình 11 cầu thủ',
          target: 11,
          progress: 0,
          reward: 200,
          isCompleted: false,
          isClaimed: false
        }, {
          id: 'play1',
          title: 'Đá 1 trận với AI',
          target: 1,
          progress: 0,
          reward: 50,
          isCompleted: false,
          isClaimed: false
        }, {
          id: 'win1',
          title: 'Thắng 1 trận với AI',
          target: 1,
          progress: 0,
          reward: 100,
          isCompleted: false,
          isClaimed: false
        }, {
          id: 'collect20',
          title: 'Sưu tầm 20 thẻ khác nhau',
          target: 20,
          progress: 0,
          reward: 150,
          isCompleted: false,
          isClaimed: false
        }]
      };
      set(userRef, initialData);
      setCoins(200);
      setIsDataLoaded(true);
    }
  });
  return () => unsubscribe();
}, [currentUser, isConnectedToFirebase]);

// Gain XP function

// Gain XP function
const gainXp = amount => {
  setXp(currentXp => {
    let newXp = currentXp + amount;
    let currentLevel = level;
    let xpNeeded = currentLevel * 100;
    let leveledUp = false;
    while (newXp >= xpNeeded) {
      newXp -= xpNeeded;
      currentLevel += 1;
      xpNeeded = currentLevel * 100;
      leveledUp = true;
    }
    if (leveledUp) {
      setLevel(currentLevel);
      setCoins(c => c + 500); // 500 coins level-up reward
      setShowLevelUpModal({
        oldLevel: level,
        newLevel: currentLevel,
        reward: 500
      });
      playFx('winGame');
      setTimeout(() => {
        triggerConfetti({
          particleCount: 200,
          spread: 100,
          origin: {
            y: 0.5
          },
          colors: ['#3b82f6', '#10b981', '#fbbf24', '#ec4899']
        });
      }, 200);
    }
    return newXp;
  });
};

// --- Auto-Gift Activity Milestone Cards ---

// --- Auto-Gift Activity Milestone Cards ---
const checkActivityMilestones = (newStats, newQuests) => {
  if (!currentUser) return;
  const claimedQuests = (newQuests || quests).filter(q => q.isClaimed).length;
  const currentValues = {
    played: newStats?.played ?? stats?.played ?? 0,
    wins: newStats?.wins ?? stats?.wins ?? 0,
    quests: claimedQuests
  };
  const toReward = ACTIVITY_MILESTONES.filter(m => {
    if (rewardedMilestones.includes(m.id)) return false;
    return currentValues[m.type] >= m.value;
  });
  if (toReward.length === 0) return;
  const pool = playersData.filter(p => p.stats && Math.max(p.stats.attack, p.stats.defense, p.stats.control) >= 80);
  const newCards = [];
  const newMilestoneIds = [];
  toReward.forEach(m => {
    const base = pool[Math.floor(Math.random() * pool.length)];
    if (!base) return;
    const upgraded = JSON.parse(JSON.stringify(base));
    upgraded.id = `${base.id}_${m.id}`;
    upgraded.name = `${base.name} [${m.rarity}]`;
    upgraded.type = m.rarity;
    upgraded.stats = {
      attack: Math.min(99, base.stats.attack + m.bonus),
      defense: Math.min(99, base.stats.defense + m.bonus),
      control: Math.min(99, base.stats.control + m.bonus)
    };
    newCards.push(upgraded);
    newMilestoneIds.push(m.id);
  });
  if (newCards.length === 0) return;
  setCollection(prev => [...prev, ...newCards]);
  setRewardedMilestones(prev => [...prev, ...newMilestoneIds]);

  // Confetti celebration
  setTimeout(() => {
    triggerConfetti({
      particleCount: 200,
      spread: 90,
      origin: {
        y: 0.5
      },
      colors: ['#f59e0b', '#fbbf24', '#3b82f6', '#ec4899', '#10b981']
    });
  }, 300);
  const rarityLabels = toReward.map(m => m.rarity).join(', ');
  showAlert('🎁 Quà Hoạt Động Đặc Biệt!', `Chúc mừng! Bạn đã đạt mốc thành tích và nhận được ${newCards.length} thẻ đặc biệt: ${rarityLabels}. Kiểm tra bộ sưu tập ngay!`);
  playFx('winGame');
};

const claimMilestone = m => {
  if (level < m.level) return;
  const claimed = claimedLevelRewards || [];
  if (claimed.includes(m.level)) return;

  // Add rewards
  if (m.coins) setCoins(c => c + m.coins);
  if (m.packs) setFreePacks(f => f + m.packs);

  // Mark as claimed
  setClaimedLevelRewards(prev => [...(prev || []), m.level]);
  playFx('winPoint');

  // Show confetti
  triggerConfetti({
    particleCount: 120,
    spread: 70,
    origin: {
      y: 0.6
    },
    colors: ['#eab308', '#fbbf24', '#f59e0b', '#3b82f6']
  });
  showAlert("Nhận Quà Thành Công 🎁", `Chúc mừng! Bạn đã nhận được ${m.coins ? `${m.coins} Xu` : ''}${m.coins && m.packs ? ' + ' : ''}${m.packs ? `${m.packs} Gói Thẻ Miễn Phí` : ''} từ mốc Cấp Độ ${m.level}.`);
};

// --- HLV Social Wall Helpers (Search, Emojis, Autocomplete Tags) ---

// --- HLV Social Wall Helpers (Search, Emojis, Autocomplete Tags) ---
const renderPostText = text => {
  if (!text) return "";
  const mentionRegex = /@([a-zA-Z0-9_]+)/g;
  const parts = [];
  let lastIndex = 0;
  let match;
  while ((match = mentionRegex.exec(text)) !== null) {
    const matchIndex = match.index;
    const username = match[1];
    if (matchIndex > lastIndex) {
      parts.push(text.substring(lastIndex, matchIndex));
    }
    parts.push(<span key={matchIndex} className="text-cyan-400 font-extrabold cursor-pointer hover:underline hover:text-cyan-300 transition-colors" onClick={e => {
      e.stopPropagation();
      playFx('click');
      setUserWallTarget(username);
      setSocialWallTab('owner');
      setTimeout(() => {
        const el = document.getElementById('social-wall-panel');
        if (el) el.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }, 100);
    }}>
          @{username}
        </span>);
    lastIndex = mentionRegex.lastIndex;
  }
  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }
  return parts.length > 0 ? parts : text;
};

const handleComposerChange = e => {
  const val = e.target.value;
  setNewPostText(val);
  const lastWord = val.split(/[\s\n]+/).pop();
  if (lastWord && lastWord.startsWith('@')) {
    setMentionQuery(lastWord.slice(1));
    setShowMentionDropdown(true);
  } else {
    setShowMentionDropdown(false);
  }
};

const getAutocompleteSuggestions = () => {
  const uniqueUsernames = new Set();
  onlineUsers.forEach(u => u.username && uniqueUsernames.add(u.username));
  leaderboardData.forEach(u => u.username && uniqueUsernames.add(u.username));
  const list = Array.from(uniqueUsernames).filter(name => name !== currentUser);
  if (!mentionQuery) return list.slice(0, 5);
  return list.filter(name => name.toLowerCase().includes(mentionQuery.toLowerCase())).slice(0, 5);
};

const insertMention = username => {
  playFx('click');
  const words = newPostText.split(/[\s\n]+/);
  words.pop(); // Remove the typed mention fragment
  words.push(`@${username}`);
  setNewPostText(words.join(' ') + ' ');
  setShowMentionDropdown(false);
};

const insertEmoji = emoji => {
  playFx('click');
  setNewPostText(prev => prev + emoji);
};

// Create new Post — always writes to /global_posts for universal feed

// Create new Post — always writes to /global_posts for universal feed
const handleCreatePost = async () => {
  if (!newPostText.trim()) return;
  if (newPostText.length > 280) {
    showAlert("⚠️ Lỗi bài viết", "Bài viết của bạn vượt quá giới hạn 280 ký tự!");
    return;
  }
  playFx('upgrade');
  const postData = {
    author: currentUser,
    authorLevel: level,
    content: newPostText.trim(),
    timestamp: Date.now(),
    likes: {},
    comments: {}
  };
  if (isConnectedToFirebase) {
    try {
      // Write to /global_posts for the global feed
      const globalRef = ref(database, `/global_posts`);
      const newGlobalRef = push(globalRef);
      await set(newGlobalRef, postData);
      // Also keep legacy per-user wall path in sync
      const postsRef = ref(database, `/user_walls/${currentUser}/posts`);
      const newPostRef = push(postsRef);
      await set(newPostRef, postData);
      setNewPostText("");
    } catch (err) {
      console.error("Error creating post:", err);
      showAlert("❌ Thất bại", "Không thể gửi bài viết lên server.");
    }
  } else {
    // Offline: save to local global posts
    const fakeId = 'local_post_' + Date.now();
    const localGlobal = localStorage.getItem('thebongda_local_global_posts');
    const globalData = localGlobal ? JSON.parse(localGlobal) : {};
    globalData[fakeId] = postData;
    localStorage.setItem('thebongda_local_global_posts', JSON.stringify(globalData));
    const list = Object.values(globalData).sort((a, b) => b.timestamp - a.timestamp);
    setGlobalPosts(list.map((p, i) => ({
      ...p,
      id: Object.keys(globalData)[i]
    })));
    setUserWallPosts(list.filter(p => p.author === currentUser).map((p, i) => ({
      ...p,
      id: Object.keys(globalData).filter(k => globalData[k].author === currentUser)[i]
    })));
    setNewPostText("");
  }
};

// ================= TẶNG XU =================

// ================= TẶNG XU =================
const handleSendGift = async () => {
  if (!currentUser || !userWallTarget || currentUser === userWallTarget) return;
  if (level < 2) {
    showAlert("Cấp Độ Chưa Đạt", "Bạn phải đạt Cấp 2 trở lên mới có thể tặng Xu!");
    return;
  }
  if (giftAmount < 10 || giftAmount > 200) {
    showAlert("Lỗi Số Lượng", "Số lượng xu không hợp lệ (10 - 200).");
    return;
  }
  if (coins < giftAmount) {
    showAlert("Không Đủ Xu", "Bạn không đủ Xu để tặng!");
    return;
  }
  setGiftLoading(true);
  try {
    const today = new Date().toISOString().split('T')[0];
    const targetUserRef = ref(database, `/users/${userWallTarget}`);
    const meRef = ref(database, `/users/${currentUser}`);
    const [targetSnap, meSnap] = await Promise.all([get(targetUserRef), get(meRef)]);
    if (!targetSnap.exists() || !meSnap.exists()) {
      showAlert("Lỗi Hệ Thống", "Lỗi dữ liệu người dùng.");
      return;
    }
    const targetData = targetSnap.val();
    const meData = meSnap.val();
    const mySentToday = meData.giftLimits?.[today]?.sentCoins || 0;
    const targetReceivedToday = targetData.giftLimits?.[today]?.receivedCoins || 0;
    if (mySentToday + giftAmount > 500) {
      showAlert("Vượt Quá Giới Hạn", `Hôm nay bạn đã tặng ${mySentToday} xu. Giới hạn là 500 xu/ngày!`);
      return;
    }
    if (targetReceivedToday + giftAmount > 1000) {
      showAlert("Người Nhận Đã Đạt Giới Hạn", `Người này đã nhận ${targetReceivedToday} xu hôm nay. Giới hạn nhận của họ là 1000 xu/ngày để chống spam!`);
      return;
    }
    const updates = {};
    updates[`/users/${currentUser}/coins`] = (meData.coins || 0) - giftAmount;
    updates[`/users/${currentUser}/giftLimits/${today}/sentCoins`] = mySentToday + giftAmount;
    updates[`/users/${userWallTarget}/coins`] = (targetData.coins || 0) + giftAmount;
    updates[`/users/${userWallTarget}/giftLimits/${today}/receivedCoins`] = targetReceivedToday + giftAmount;
    updates[`/users/${userWallTarget}/coinNotification`] = {
      from: currentUser,
      amount: giftAmount,
      timestamp: Date.now()
    };
    await update(ref(database), updates);

    // Optimistic UI update
    setCoins(prev => prev - giftAmount);

    // Send a system message to global chat
    const chatRef = ref(database, '/chat');
    const newMsg = {
      sender: 'HỆ THỐNG',
      text: `🎁 ${currentUser} vừa hào phóng tặng cho ${userWallTarget} ${giftAmount} xu!`,
      timestamp: serverTimestamp(),
      type: 'gift'
    };
    push(chatRef, newMsg);
    showAlert("Thành Công", `Đã tặng ${giftAmount} xu cho ${userWallTarget} thành công!`);
    setShowGiftModal(false);
    setGiftAmount(10);
  } catch (error) {
    console.error("Gift error:", error);
    showAlert("Lỗi", "Có lỗi xảy ra khi tặng xu!");
  } finally {
    setGiftLoading(false);
  }
};

const getCardGiftFee = card => {
  const rarity = getCardRarity(card);
  const fees = {
    common: 20,
    rare: 50,
    epic: 100,
    legendary: 200,
    mythic: 400
  };
  return fees[rarity] || 20;
};

const handleSendCardGift = async () => {
  if (!currentUser || !userWallTarget || currentUser === userWallTarget) return;
  if (!selectedGiftCard) {
    showAlert("Chưa Chọn Thẻ", "Vui lòng chọn 1 thẻ cầu thủ để tặng!");
    return;
  }
  if (level < 5) {
    showAlert("Cấp Độ Người Gửi Chưa Đủ ⚠️", "Bạn phải đạt Cấp 5 trở lên mới có thể tặng thẻ cầu thủ!");
    return;
  }

  // Check squad requirement
  if (squad.some(s => s.id === selectedGiftCard.id)) {
    showAlert("Cầu Thể Đang Trong Squad ⚠️", "Không thể tặng cầu thủ đang thi đấu trong đội hình chính! Vui lòng gỡ cầu thủ này khỏi đội hình trước.");
    return;
  }
  const fee = getCardGiftFee(selectedGiftCard);
  if (coins < fee) {
    showAlert("Không Đủ Xu ⚠️", `Bạn không đủ Xu để tặng thẻ này! Lệ phí chuyển nhượng là ${fee} Xu.`);
    return;
  }
  if (!isConnectedToFirebase) {
    showAlert("Yêu Cầu Kết Nối ⚠️", "Tính năng tặng thẻ chỉ khả dụng ở chế độ trực tuyến!");
    return;
  }
  setGiftCardLoading(true);
  try {
    const today = new Date().toISOString().split('T')[0];
    const targetUserRef = ref(database, `/users/${userWallTarget}`);
    const meRef = ref(database, `/users/${currentUser}`);
    const [targetSnap, meSnap] = await Promise.all([get(targetUserRef), get(meRef)]);
    if (!targetSnap.exists() || !meSnap.exists()) {
      showAlert("Lỗi Hệ Thống", "Không thể tải dữ liệu người dùng.");
      setGiftCardLoading(false);
      return;
    }
    const targetData = targetSnap.val();
    const meData = meSnap.val();

    // Check receiver level >= 3
    const receiverLevel = targetData.level || 1;
    if (receiverLevel < 3) {
      showAlert("Cấp Độ Người Nhận Chưa Đủ ⚠️", `HLV ${userWallTarget} phải đạt tối thiểu Cấp 3 mới có thể nhận thẻ cầu thủ!`);
      setGiftCardLoading(false);
      return;
    }

    // Check daily limits
    const mySentToday = meData.giftCardLimits?.[today]?.sentCards || 0;
    const targetReceivedToday = targetData.giftCardLimits?.[today]?.receivedCards || 0;
    if (mySentToday >= 3) {
      showAlert("Vượt Quá Giới Hạn Gửi ⚠️", "Hôm nay bạn đã gửi tối đa 3 thẻ. Hãy quay lại vào ngày mai!");
      setGiftCardLoading(false);
      return;
    }
    if (targetReceivedToday >= 3) {
      showAlert("Đối Thủ Đạt Giới Hạn Nhận ⚠️", `HLV ${userWallTarget} đã nhận tối đa 3 thẻ trong ngày hôm nay!`);
      setGiftCardLoading(false);
      return;
    }

    // Check if receiver already has the card in collection
    const targetCollection = targetData.collection || [];
    if (targetCollection.some(c => c.id === selectedGiftCard.id)) {
      showAlert("Người Nhận Đã Sở Hữu ⚠️", `HLV ${userWallTarget} đã sở hữu cầu thủ [${selectedGiftCard.name}] trong bộ sưu tập!`);
      setGiftCardLoading(false);
      return;
    }

    // Perform transaction
    const updates = {};

    // Deduct coins from sender
    updates[`/users/${currentUser}/coins`] = (meData.coins || 0) - fee;
    updates[`/users/${currentUser}/giftCardLimits/${today}/sentCards`] = mySentToday + 1;

    // Remove card from sender collection
    const myUpdatedCollection = (meData.collection || []).filter(c => c.id !== selectedGiftCard.id);
    updates[`/users/${currentUser}/collection`] = myUpdatedCollection;

    // Add coins received limits to target, add card to target collection
    updates[`/users/${userWallTarget}/giftCardLimits/${today}/receivedCards`] = targetReceivedToday + 1;
    const targetUpdatedCollection = [...targetCollection, selectedGiftCard];
    updates[`/users/${userWallTarget}/collection`] = targetUpdatedCollection;

    // Add a popup card notification for target
    updates[`/users/${userWallTarget}/cardNotification`] = {
      from: currentUser,
      card: selectedGiftCard,
      timestamp: Date.now()
    };
    await update(ref(database), updates);

    // Optimistic UI updates for sender
    setCoins(prev => prev - fee);
    setCollection(prev => prev.filter(c => c.id !== selectedGiftCard.id));

    // Global chat announcement
    const rarityLabel = RARITY_TIERS[getCardRarity(selectedGiftCard)]?.label || "THƯỜNG";
    const chatRef = ref(database, '/chat');
    const newMsg = {
      sender: 'HỆ THỐNG',
      text: `🎁 HLV [${currentUser}] đã tặng thẻ [${selectedGiftCard.name}] (${rarityLabel}) cho HLV [${userWallTarget}]! 🎉`,
      timestamp: serverTimestamp(),
      type: 'gift'
    };
    push(chatRef, newMsg);
    showAlert("Tặng Thẻ Thành Công 🎉", `Đã gửi thẻ [${selectedGiftCard.name}] tới ${userWallTarget} với lệ phí ${fee} Xu!`);
    setShowGiftCardModal(false);
    setSelectedGiftCard(null);
  } catch (error) {
    console.error("Gift card error:", error);
    showAlert("Lỗi ❌", "Đã xảy ra lỗi khi tặng thẻ!");
  } finally {
    setGiftCardLoading(false);
  }
};

// Like / Unlike Post — operates on global_posts

// Like / Unlike Post — operates on global_posts
const handleLikePost = async postId => {
  playFx('click');
  // Search across global and per-user feed
  const post = globalPosts.find(p => p.id === postId) || userWallPosts.find(p => p.id === postId);
  if (!post) return;
  const likes = post.likes || {};
  const hasLiked = !!likes[currentUser];
  const updatedLikes = {
    ...likes
  };
  if (hasLiked) {
    delete updatedLikes[currentUser];
  } else {
    updatedLikes[currentUser] = true;
  }
  if (isConnectedToFirebase) {
    try {
      // Update global_posts
      const globalLikeRef = ref(database, `/global_posts/${postId}/likes`);
      await set(globalLikeRef, updatedLikes);
      // Also update legacy per-user path if applicable
      const likeRef = ref(database, `/user_walls/${post.author}/posts/${postId}/likes`);
      set(likeRef, updatedLikes).catch(() => {});
    } catch (err) {
      console.error("Error liking post:", err);
    }
  } else {
    const localGlobal = localStorage.getItem('thebongda_local_global_posts');
    const globalData = localGlobal ? JSON.parse(localGlobal) : {};
    if (globalData[postId]) {
      globalData[postId].likes = updatedLikes;
      localStorage.setItem('thebongda_local_global_posts', JSON.stringify(globalData));
      setGlobalPosts(prev => prev.map(p => p.id === postId ? {
        ...p,
        likes: updatedLikes
      } : p));
      setUserWallPosts(prev => prev.map(p => p.id === postId ? {
        ...p,
        likes: updatedLikes
      } : p));
    }
  }
};

// Create new Comment under a Post — operates on global_posts

// Create new Comment under a Post — operates on global_posts
const handleCreateComment = async postId => {
  const commentText = commentInputs[postId] || "";
  if (!commentText.trim()) return;
  if (commentText.length > 200) {
    showAlert("⚠️ Lỗi bình luận", "Bình luận của bạn vượt quá giới hạn 200 ký tự!");
    return;
  }
  playFx('cardSelect');
  const commentData = {
    author: currentUser,
    authorLevel: level,
    content: commentText.trim(),
    timestamp: Date.now()
  };
  if (isConnectedToFirebase) {
    try {
      // Write to global_posts
      const globalCommentsRef = ref(database, `/global_posts/${postId}/comments`);
      const newGlobalCommentRef = push(globalCommentsRef);
      await set(newGlobalCommentRef, commentData);
      // Also keep per-user wall in sync
      const post = globalPosts.find(p => p.id === postId) || userWallPosts.find(p => p.id === postId);
      if (post) {
        const commentsRef = ref(database, `/user_walls/${post.author}/posts/${postId}/comments`);
        push(commentsRef, commentData).catch(() => {});
      }
      setCommentInputs(prev => ({
        ...prev,
        [postId]: ""
      }));
    } catch (err) {
      console.error("Error creating comment:", err);
    }
  } else {
    const localGlobal = localStorage.getItem('thebongda_local_global_posts');
    const globalData = localGlobal ? JSON.parse(localGlobal) : {};
    if (globalData[postId]) {
      if (!globalData[postId].comments) globalData[postId].comments = {};
      const commentId = 'local_comment_' + Date.now();
      globalData[postId].comments[commentId] = commentData;
      localStorage.setItem('thebongda_local_global_posts', JSON.stringify(globalData));
      setGlobalPosts(prev => prev.map(p => {
        if (p.id === postId) {
          return {
            ...p,
            comments: {
              ...(p.comments || {}),
              [commentId]: commentData
            }
          };
        }
        return p;
      }));
      setUserWallPosts(prev => prev.map(p => {
        if (p.id === postId) {
          return {
            ...p,
            comments: {
              ...(p.comments || {}),
              [commentId]: commentData
            }
          };
        }
        return p;
      }));
      setCommentInputs(prev => ({
        ...prev,
        [postId]: ""
      }));
    }
  }
};

// Private Chats List effect

// Private Chats List effect
useEffect(() => {
  if (!currentUser || !isConnectedToFirebase) return;
  const myChatsRef = ref(database, `/users/${currentUser}/private_chats`);
  const unsubscribeChats = onValue(myChatsRef, snapshot => {
    const list = [];
    snapshot.forEach(child => {
      list.push({
        username: child.key,
        lastTimestamp: child.val()
      });
    });
    list.sort((a, b) => b.lastTimestamp - a.lastTimestamp);
    setMyPrivateChats(list);
  });
  return () => unsubscribeChats();
}, [currentUser, isConnectedToFirebase]);

// Active Private Room Message Listener

// Active Private Room Message Listener
useEffect(() => {
  if (!currentUser || !activePrivatePartner || !isConnectedToFirebase) {
    setPrivateMessages([]);
    return;
  }
  const chatId = [currentUser, activePrivatePartner].sort().join('_');
  const chatMessagesRef = ref(database, `/private_chats/${chatId}`);
  const unsubscribeMsgs = onValue(chatMessagesRef, snapshot => {
    const msgs = [];
    snapshot.forEach(child => {
      msgs.push({
        id: child.key,
        ...child.val()
      });
    });
    setPrivateMessages(msgs);
  });

  // Clear unread mark
  const unreadRef = ref(database, `/users/${currentUser}/unread/${activePrivatePartner}`);
  set(unreadRef, null);
  return () => unsubscribeMsgs();
}, [currentUser, activePrivatePartner, isConnectedToFirebase]);

// Unread badge listener

// Unread badge listener
useEffect(() => {
  if (!currentUser || !isConnectedToFirebase) return;
  const unreadRef = ref(database, `/users/${currentUser}/unread`);
  const unsubscribeUnread = onValue(unreadRef, snapshot => {
    const data = snapshot.val() || {};
    setUnreadPartners(data);
  });
  return () => unsubscribeUnread();
}, [currentUser, isConnectedToFirebase]);

const sendPrivateMessage = () => {
  if (!privateChatInput.trim() || !currentUser || !activePrivatePartner || !isConnectedToFirebase) return;
  const chatId = [currentUser, activePrivatePartner].sort().join('_');
  const chatRef = ref(database, `/private_chats/${chatId}`);
  const timestamp = Date.now();
  const newMsg = {
    sender: currentUser,
    senderLevel: level,
    senderTitle: equippedTitle || "",
    text: privateChatInput.trim(),
    timestamp: timestamp
  };
  push(chatRef, newMsg);

  // Update active chats for both users
  set(ref(database, `/users/${currentUser}/private_chats/${activePrivatePartner}`), timestamp);
  set(ref(database, `/users/${activePrivatePartner}/private_chats/${currentUser}`), timestamp);

  // Unread status for partner
  set(ref(database, `/users/${activePrivatePartner}/unread/${currentUser}`), true);
  setPrivateChatInput('');
  playFx('click');
};

// Real-time Chat, Presence, and PvP Invites States

// Real-time Chat, Presence, and PvP Invites States
const [onlineUsers, setOnlineUsers] = useState([]);

const [chatMessages, setChatMessages] = useState([]);

const [activeInvite, setActiveInvite] = useState(null);

const [chatTab, setChatTab] = useState('chat');

const [chatInput, setChatInput] = useState('');

const [pvpHistory, setPvpHistory] = useState([]);

// Local Match History Loader (Offline / Cache Fallback)

// Local Match History Loader (Offline / Cache Fallback)
useEffect(() => {
  if (!currentUser) return;
  const localHistory = localStorage.getItem(`thebongda_pvp_history_${currentUser}`);
  if (localHistory) {
    setPvpHistory(JSON.parse(localHistory));
  }
}, [currentUser]);

// Real-time Presence, Chat, and Invites Effect

// Real-time Presence, Chat, and Invites Effect
useEffect(() => {
  if (!currentUser || !isConnectedToFirebase) return;

  // 1. Establish Presence
  const userStatusDatabaseRef = ref(database, `/presence/${currentUser}`);
  const connectedRef = ref(database, '.info/connected');
  const squadRating = squad.length === 11 ? Math.round(squad.reduce((acc, card) => acc + Math.max(card.stats.attack, card.stats.defense, card.stats.control), 0) / 11) : 0;
  let peerInstanceId = sessionStorage.getItem('panini_room_code') || '';
  if (!peerInstanceId) {
    peerInstanceId = Math.floor(100000 + Math.random() * 900000).toString();
    sessionStorage.setItem('panini_room_code', peerInstanceId);
  }
  const presenceData = {
    username: currentUser,
    status: 'online',
    lastActive: serverTimestamp(),
    peerId: peerInstanceId,
    rating: squadRating,
    level: level // Dynamic level synced!
  };
  const unsubscribeConnected = onValue(connectedRef, snap => {
    if (snap.val() === true) {
      set(userStatusDatabaseRef, presenceData);
      onDisconnect(userStatusDatabaseRef).remove();
    }
  });

  // 2. Listen to all online users
  const presenceListRef = ref(database, '/presence');
  const unsubscribePresence = onValue(presenceListRef, snapshot => {
    const users = [];
    snapshot.forEach(childSnapshot => {
      const val = childSnapshot.val();
      if (val.username !== currentUser) {
        users.push(val);
      }
    });
    setOnlineUsers(users);
  });

  // 3. Listen to chat messages (limit to 50)
  const chatRef = ref(database, '/chat');
  const unsubscribeChat = onValue(chatRef, snapshot => {
    let msgs = [];
    snapshot.forEach(childSnapshot => {
      msgs.push({
        id: childSnapshot.key,
        ...childSnapshot.val()
      });
    });
    // Hide chats that occurred before the user created their account
    if (userCreatedAt) {
      msgs = msgs.filter(m => m.timestamp >= userCreatedAt);
    }
    setChatMessages(msgs.slice(-50)); // Last 50 messages
  });

  // 4. Listen to direct invitations
  const invitesRef = ref(database, `/invites/${currentUser}`);
  const unsubscribeInvites = onValue(invitesRef, snapshot => {
    const val = snapshot.val();
    if (val && val.status === 'pending') {
      setActiveInvite(val);
      playFx('winPoint'); // play victory horn sound for invite!
    } else if (!val) {
      setActiveInvite(null);
    }
  });

  // 5. Listen to pvp match history
  const historyRef = ref(database, `/pvp_history/${currentUser}`);
  const unsubscribeHistory = onValue(historyRef, snapshot => {
    const records = [];
    snapshot.forEach(childSnapshot => {
      records.push({
        id: childSnapshot.key,
        ...childSnapshot.val()
      });
    });
    records.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
    setPvpHistory(records);
  });
  return () => {
    unsubscribeConnected();
    unsubscribePresence();
    unsubscribeChat();
    unsubscribeInvites();
    unsubscribeHistory();
    set(userStatusDatabaseRef, null); // Clear presence on unmount
  };
}, [currentUser, squad, level, userCreatedAt]);

// Global Posts Feed (all HLV posts for the Explore tab)

// Global Posts Feed (all HLV posts for the Explore tab)
useEffect(() => {
  if (!isConnectedToFirebase) {
    const localGlobal = localStorage.getItem('thebongda_local_global_posts');
    const globalData = localGlobal ? JSON.parse(localGlobal) : {};
    const list = Object.keys(globalData).map(key => ({
      id: key,
      ...globalData[key]
    })).sort((a, b) => b.timestamp - a.timestamp);
    setGlobalPosts(list);
    return;
  }
  setLoadingGlobalPosts(true);
  const globalPostsRef = ref(database, '/global_posts');
  const unsubGlobal = onValue(globalPostsRef, snapshot => {
    const val = snapshot.val();
    if (val) {
      const list = Object.keys(val).map(key => ({
        id: key,
        ...val[key]
      })).sort((a, b) => b.timestamp - a.timestamp);
      setGlobalPosts(list.slice(0, 100)); // cap at 100 most recent
    } else {
      setGlobalPosts([]);
    }
    setLoadingGlobalPosts(false);
  }, () => setLoadingGlobalPosts(false));
  return () => unsubGlobal();
}, [isConnectedToFirebase]);

// User Wall (X/Twitter) Data Loading Effect — per-owner posts

// User Wall (X/Twitter) Data Loading Effect — per-owner posts
useEffect(() => {
  if (!userWallTarget) {
    setUserWallData(null);
    setUserWallPosts([]);
    return;
  }
  setLoadingWall(true);
  if (isConnectedToFirebase) {
    // 1. Fetch profile info
    const targetUserRef = ref(database, `/users/${userWallTarget}`);
    const unsubscribeUser = onValue(targetUserRef, snapshot => {
      const data = snapshot.val();
      setUserWallData(data);
    }, error => {
      console.error("Error fetching wall user info:", error);
    });

    // 2. Per-owner posts from /user_walls (for the HLV tab filter)
    const postsRef = ref(database, `/user_walls/${userWallTarget}/posts`);
    const unsubscribePosts = onValue(postsRef, snapshot => {
      const postsVal = snapshot.val();
      if (postsVal) {
        const list = Object.keys(postsVal).map(key => ({
          id: key,
          ...postsVal[key]
        })).sort((a, b) => b.timestamp - a.timestamp);
        setUserWallPosts(list);
      } else {
        // Fallback: filter from global posts
        setUserWallPosts(globalPosts.filter(p => p.author === userWallTarget));
      }
      setLoadingWall(false);
    }, error => {
      console.error("Error fetching wall posts:", error);
      setLoadingWall(false);
    });
    return () => {
      unsubscribeUser();
      unsubscribePosts();
    };
  } else {
    // Offline: build profile and per-user posts from local data
    let offlineProfile = null;
    if (userWallTarget === currentUser) {
      offlineProfile = {
        level,
        xp,
        stats,
        squad
      };
    } else {
      const matchingOnline = onlineUsers.find(u => u.username === userWallTarget);
      offlineProfile = matchingOnline ? {
        level: matchingOnline.level || 1,
        xp: 0,
        stats: {
          played: 0,
          wins: 0,
          draws: 0,
          losses: 0
        },
        squad: []
      } : {
        level: 1,
        xp: 0,
        stats: {
          played: 0,
          wins: 0,
          draws: 0,
          losses: 0
        },
        squad: []
      };
    }
    setUserWallData(offlineProfile);
    // Filter from local global posts
    const localGlobal = localStorage.getItem('thebongda_local_global_posts');
    const globalData = localGlobal ? JSON.parse(localGlobal) : {};
    const filtered = Object.keys(globalData).map(k => ({
      id: k,
      ...globalData[k]
    })).filter(p => p.author === userWallTarget).sort((a, b) => b.timestamp - a.timestamp);
    setUserWallPosts(filtered);
    setLoadingWall(false);
  }
}, [userWallTarget, isConnectedToFirebase, currentUser, level, xp, stats, squad, onlineUsers]);

// Scroll chat to bottom when messages update

// Scroll chat to bottom when messages update
useEffect(() => {
  const chatContainer = document.getElementById('lobby-chat-messages');
  if (chatContainer) {
    chatContainer.scrollTop = chatContainer.scrollHeight;
  }
}, [chatMessages, chatTab]);

const sendChatMessage = text => {
  if (!text.trim() || !currentUser || !isConnectedToFirebase) return;
  const chatRef = ref(database, '/chat');
  push(chatRef, {
    sender: currentUser,
    senderLevel: level,
    // Sync sender's level in message history
    senderTitle: equippedTitle || "",
    text: text.trim(),
    timestamp: serverTimestamp()
  });
};

const sendChallengeInvite = (targetUser, targetPeerId) => {
  if (!currentUser || !isConnectedToFirebase) return;
  playFx('click');
  const targetInviteRef = ref(database, `/invites/${targetUser}`);
  const myRating = squad.length === 11 ? Math.round(squad.reduce((acc, card) => acc + Math.max(card.stats.attack, card.stats.defense, card.stats.control), 0) / 11) : 0;
  const myPeerId = sessionStorage.getItem('panini_room_code') || '';
  set(targetInviteRef, {
    host: currentUser,
    hostPeerId: myPeerId,
    hostRating: myRating,
    status: 'pending'
  });
  const chatRef = ref(database, '/chat');
  push(chatRef, {
    sender: 'HỆ THỐNG 📣',
    text: `🔥 Cầu thủ [${currentUser}] đã gửi lời thách đấu kịch tính tới [${targetUser}]!`,
    timestamp: serverTimestamp()
  });
  showAlert("📨 Lời Mời Đã Gửi!", `Đã gửi lời mời thách đấu tới ${targetUser}! Vui lòng chờ đối thủ phản hồi...`);
  const statusRef = ref(database, `/invites/${targetUser}/status`);
  const unsubscribeStatus = onValue(statusRef, snap => {
    const status = snap.val();
    if (status === 'accepted') {
      unsubscribeStatus();
      set(targetInviteRef, null);
      setActivePvpTarget(targetPeerId);
      setGameState('multiplayer');
    } else if (status === 'declined') {
      unsubscribeStatus();
      set(targetInviteRef, null);
      showAlert("😢 Lời Mời Bị Từ Chối", `Đối thủ ${targetUser} đã từ chối lời mời thách đấu!`);
    }
  });
};

const acceptChallenge = invite => {
  if (!currentUser || !isConnectedToFirebase) return;
  playFx('click');
  const myInviteRef = ref(database, `/invites/${currentUser}`);
  set(myInviteRef, {
    ...invite,
    status: 'accepted'
  });
  setActivePvpTarget(invite.hostPeerId);
  setGameState('multiplayer');
  setTimeout(() => {
    set(myInviteRef, null);
  }, 1000);
};

const declineChallenge = () => {
  if (!currentUser || !isConnectedToFirebase) return;
  playFx('click');
  const myInviteRef = ref(database, `/invites/${currentUser}`);
  set(myInviteRef, {
    status: 'declined'
  });
  setTimeout(() => {
    set(myInviteRef, null);
  }, 1000);
};

// Match State

// Match State
const [difficulty, setDifficulty] = useState('Easy');

const [matchPhase, setMatchPhase] = useState('setup'); // setup, playing, roundResult, gameOver

// setup, playing, roundResult, gameOver
const [playerHand, setPlayerHand] = useState([]);

const [aiHand, setAiHand] = useState([]);

const [aiSquad, setAiSquad] = useState([]);

const [matchScore, setMatchScore] = useState({
  player: 0,
  ai: 0
});

const [matchLogs, setMatchLogs] = useState([]);

const [matchHistory, setMatchHistory] = useState([]);

const [showHistoryModal, setShowHistoryModal] = useState(false);

const [playerStatChoiceHistory, setPlayerStatChoiceHistory] = useState([]);

// Current Round State

// Current Round State
const [selectedPlayerCard, setSelectedPlayerCard] = useState(null);

const [selectedStat, setSelectedStat] = useState(null);

const [currentAiCard, setCurrentAiCard] = useState(null);

const [roundResultMsg, setRoundResultMsg] = useState("");

const [playedCardIds, setPlayedCardIds] = useState([]);

const [aiAttackCardIndex, setAiAttackCardIndex] = useState(0);

const [matchEnvironment, setMatchEnvironment] = useState({
  weather: ENV_WEATHER[4],
  time: ENV_TIME[1]
});

// ─── Unified Smart Auth Handler ─────────────────────────────────────────────
// Step 1: User enters name → check Firebase (Case-Insensitive)

// ─── Unified Smart Auth Handler ─────────────────────────────────────────────
// Step 1: User enters name → check Firebase (Case-Insensitive)
const handleCheckUsername = async e => {
  e.preventDefault();
  const name = authUsername.trim();
  if (!name || name.length < 2) {
    showAlert('Tên Quá Ngắn ⚠️', 'Tên HLV phải có ít nhất 2 ký tự!');
    return;
  }
  // Validate: only letters, numbers, underscores, Vietnamese chars, spaces
  if (!/^[\w\s\u00C0-\u024F\u1E00-\u1EFF]+$/.test(name)) {
    showAlert('Tên Không Hợp Lệ ⚠️', 'Tên HLV chỉ được dùng chữ cái, số, dấu cách. Không dùng ký tự đặc biệt!');
    return;
  }
  if (!isConnectedToFirebase) {
    // Offline: just log in directly
    localStorage.setItem('panini_currentUser', name);
    window.location.reload();
    return;
  }
  setAuthCheckingUser(true);
  try {
    const lowerName = name.toLowerCase();
    const nameIndexSnap = await get(ref(database, `/usernames/${lowerName}`));
    let actualName = name;
    let val = null;
    if (nameIndexSnap.exists()) {
      actualName = nameIndexSnap.val();
      setAuthUsername(actualName); // Normalize casing in state
      const userSnap = await get(ref(database, `/users/${actualName}`));
      val = userSnap.val();
    } else {
      // Fallback/auto-migrate for legacy users
      const legacyUserSnap = await get(ref(database, `/users/${name}`));
      if (legacyUserSnap.exists()) {
        val = legacyUserSnap.val();
        actualName = val.username || name;
        setAuthUsername(actualName);
        // Set index for future case-insensitive logins
        await set(ref(database, `/usernames/${lowerName}`), actualName);
      }
    }
    setAuthCheckingUser(false);
    if (!val) {
      // NEW user → go to optional PIN setting step
      setAuthFoundUser(null);
      setAuthStep('set_pin');
    } else {
      // EXISTING user
      setAuthFoundUser(val);
      const hasPin = val.pin && (val.pin.length === 4 || val.pin.length === 64);
      if (hasPin) {
        // Has PIN → ask for PIN
        setAuthStep('enter_pin');
      } else {
        // No PIN → login directly (open account)
        localStorage.setItem('panini_currentUser', actualName);
        window.location.reload();
      }
    }
  } catch (err) {
    setAuthCheckingUser(false);
    console.error(err);
    // Offline fallback
    localStorage.setItem('panini_currentUser', name);
    window.location.reload();
  }
};

// Step 2a: Existing user with PIN → verify (Case-Insensitive verified through handleCheckUsername)

// Step 2a: Existing user with PIN → verify (Case-Insensitive verified through handleCheckUsername)
const handleVerifyPin = async e => {
  e.preventDefault();
  const name = authUsername.trim();
  const pin = authPin.trim();
  if (pin.length !== 4 || !/^\d{4}$/.test(pin)) {
    showAlert('PIN Không Đúng ⚠️', 'Vui lòng nhập đúng 4 chữ số!');
    return;
  }
  setAuthCheckingUser(true);
  try {
    const snapshot = await get(ref(database, `/users/${name}/pin`));
    const storedPin = snapshot.val();
    setAuthCheckingUser(false);
    let isPinValid = false;
    let needsUpgrade = false;
    if (storedPin) {
      if (storedPin.length === 4) {
        // Legacy plain text PIN
        if (storedPin === pin) {
          isPinValid = true;
          needsUpgrade = true;
        }
      } else {
        // Hashed PIN
        const hashedInput = await hashPIN(pin);
        if (storedPin === hashedInput) {
          isPinValid = true;
        }
      }
    }
    if (isPinValid) {
      if (needsUpgrade) {
        const newHashedPin = await hashPIN(pin);
        await update(ref(database, `/users/${name}`), {
          pin: newHashedPin
        });
      }
      localStorage.setItem('panini_currentUser', name);
      window.location.reload();
    } else {
      showAlert('Sai PIN 🔑', 'Mã PIN không đúng! Hãy thử lại hoặc liên hệ admin.');
    }
  } catch {
    setAuthCheckingUser(false);
    showAlert('Lỗi Kết Nối ❌', 'Không thể xác minh PIN. Thử lại sau.');
  }
};

// Step 2b: New user → optionally set PIN, then create account

// Step 2b: New user → optionally set PIN, then create account
const handleCreateAccount = async e => {
  e.preventDefault();
  const name = authUsername.trim();
  const pin = authPin.trim();
  if (pin && (pin.length !== 4 || !/^\d{4}$/.test(pin))) {
    showAlert('PIN Không Hợp Lệ ⚠️', 'Mã PIN phải đúng 4 chữ số (hoặc để trống để bỏ qua)!');
    return;
  }
  const hashedPin = pin ? await hashPIN(pin) : '';
  const initialData = {
    username: name,
    pin: hashedPin,
    // optional hashed PIN
    email: '',
    coins: 200,
    // Thành viên mới được 200 Xu để bắt đầu mở thẻ
    startingBonus: true,
    collection: [],
    squad: [],
    level: 1,
    xp: 0,
    freePacks: 3,
    createdAt: Date.now(),
    claimedLevelRewards: [],
    rewardedMilestones: [],
    stats: {
      played: 0,
      wins: 0,
      draws: 0,
      losses: 0
    },
    quests: [{
      id: 'open_pack1',
      title: 'Mở gói thẻ đầu tiên',
      target: 1,
      progress: 0,
      reward: 100,
      isCompleted: false,
      isClaimed: false
    }, {
      id: 'build_squad',
      title: 'Xây dựng đội hình 11 cầu thủ',
      target: 11,
      progress: 0,
      reward: 200,
      isCompleted: false,
      isClaimed: false
    }, {
      id: 'play1',
      title: 'Đá 1 trận với AI',
      target: 1,
      progress: 0,
      reward: 50,
      isCompleted: false,
      isClaimed: false
    }, {
      id: 'win1',
      title: 'Thắng 1 trận với AI',
      target: 1,
      progress: 0,
      reward: 100,
      isCompleted: false,
      isClaimed: false
    }, {
      id: 'collect20',
      title: 'Sưu tầm 20 thẻ khác nhau',
      target: 20,
      progress: 0,
      reward: 150,
      isCompleted: false,
      isClaimed: false
    }]
  };
  setAuthCheckingUser(true);
  try {
    const lowerName = name.toLowerCase();
    // Set index first, then user data
    await Promise.all([set(ref(database, `/usernames/${lowerName}`), name), set(ref(database, `/users/${name}`), initialData)]);
    localStorage.setItem('panini_currentUser', name);
    window.location.reload();
  } catch {
    setAuthCheckingUser(false);
    // Create locally even if Firebase fails
    localStorage.setItem('panini_currentUser', name);
    window.location.reload();
  }
};

// Legacy compat stubs (auth flow now uses handleCheckUsername/handleVerifyPin/handleCreateAccount)

// Forgot password verify email handler (Case-Insensitive)

// Legacy compat stubs (auth flow now uses handleCheckUsername/handleVerifyPin/handleCreateAccount)

// Forgot password verify email handler (Case-Insensitive)
const handleForgotPassword = async e => {
  e.preventDefault();
  if (!authUsername.trim() || !forgotEmail.trim()) {
    showAlert("Thiếu Thông Tin 📋", "Vui lòng nhập đầy đủ Tên Đăng Nhập và Email khôi phục!");
    return;
  }
  const cleanUsername = authUsername.trim();
  try {
    let actualName = cleanUsername;
    const nameIndexSnap = await get(ref(database, `/usernames/${cleanUsername.toLowerCase()}`));
    if (nameIndexSnap.exists()) {
      actualName = nameIndexSnap.val();
      setAuthUsername(actualName); // Normalize
    }
    const snapshot = await get(ref(database, `/users/${actualName}`));
    const val = snapshot.val();
    if (!val) {
      showAlert("Không Tồn Tại ❌", "HLV này chưa được đăng ký!");
      return;
    }
    const storedEmail = val.email || "";
    if (!storedEmail) {
      showAlert("Chưa Thiết Lập 🔒", "HLV này chưa thiết lập Email khôi phục trong Hồ Sơ! Vui lòng liên hệ Admin để đặt lại mật khẩu.");
      return;
    }
    if (storedEmail.trim().toLowerCase() !== forgotEmail.trim().toLowerCase()) {
      showAlert("Không Khớp ❌", "Email khôi phục không trùng khớp với thông tin đã đăng ký!");
      return;
    }

    // Success, advance to reset phase
    setAuthMode('reset_password_phase');
    showAlert("Xác Minh Thành Công ✅", "Xác minh Email khôi phục thành công! Vui lòng nhập mật khẩu mới của bạn.");
  } catch (err) {
    showAlert("Lỗi Máy Chủ ❌", "Đã xảy ra lỗi khi kiểm tra email khôi phục.");
  }
};

const handleResetPasswordSubmit = async e => {
  e.preventDefault();
  if (!newPasswordReset || !confirmPasswordReset) {
    showAlert("Thiếu Thông Tin 🔒", "Vui lòng nhập đầy đủ mật khẩu mới và xác nhận mật khẩu mới!");
    return;
  }
  if (newPasswordReset !== confirmPasswordReset) {
    showAlert("Không Trùng Khớp ❌", "Mật khẩu mới và mật khẩu xác nhận không giống nhau!");
    return;
  }
  try {
    const cleanUsername = authUsername.trim();
    const hashedReset = await hashPIN(newPasswordReset);
    await update(ref(database, `/users/${cleanUsername}`), {
      pin: hashedReset,
      password: hashedReset
    });
    showAlert("Thành Công 🎉", "Đặt lại mật khẩu thành công! Bây giờ bạn có thể đăng nhập bằng mật khẩu mới.");
    setAuthMode('login');
    setAuthPassword("");
    setNewPasswordReset("");
    setConfirmPasswordReset("");
    setForgotEmail("");
  } catch (err) {
    showAlert("Lỗi Máy Chủ ❌", "Không thể ghi đè mật khẩu mới. Vui lòng thử lại sau.");
  }
};

// Profile Page Change Email and Password handlers

// Profile Page Change Email and Password handlers
const handleUpdateEmail = async e => {
  e.preventDefault();
  if (!profileEmailInput.trim()) {
    showAlert("Lỗi 📧", "Email không được để trống!");
    return;
  }
  setEmail(profileEmailInput.trim());
  showAlert("Thành Công 🎉", "Đã cập nhật Email khôi phục tài khoản thành công!");
};

const handleUpdatePassword = async e => {
  e.preventDefault();
  if (!profileOldPassword || !profileNewPassword || !profileConfirmPassword) {
    showAlert("Lỗi 🔒", "Vui lòng nhập đầy đủ mật khẩu cũ, mật khẩu mới và xác nhận mật khẩu!");
    return;
  }
  if (profileNewPassword !== profileConfirmPassword) {
    showAlert("Lỗi ❌", "Mật khẩu mới và xác nhận mật khẩu không giống nhau!");
    return;
  }
  try {
    const snapshot = await get(ref(database, `/users/${currentUser}/password`));
    let storedPassword = snapshot.val();

    // Fallback to check "pin" if "password" doesn't exist
    if (!storedPassword) {
      const pinSnap = await get(ref(database, `/users/${currentUser}/pin`));
      storedPassword = pinSnap.val() || "";
    }
    let isOldPasswordValid = false;
    if (!storedPassword) {
      // If there is no stored password/pin at all
      isOldPasswordValid = true;
    } else if (storedPassword.length === 4) {
      // Legacy plain text
      if (storedPassword === profileOldPassword) {
        isOldPasswordValid = true;
      }
    } else {
      // Hashed password
      const hashedOld = await hashPIN(profileOldPassword);
      if (storedPassword === hashedOld) {
        isOldPasswordValid = true;
      }
    }
    if (!isOldPasswordValid) {
      showAlert("Sai Mật Khẩu 🔑", "Mật khẩu cũ không chính xác!");
      return;
    }
    const hashedNew = await hashPIN(profileNewPassword);
    // We will unify storage to use "pin" field for auth, but update both to be safe during migration
    await update(ref(database, `/users/${currentUser}`), {
      pin: hashedNew,
      password: hashedNew
    });
    showAlert("Thành Công 🎉", "Đã đổi mật khẩu tài khoản thành công!");
    setProfileOldPassword("");
    setProfileNewPassword("");
    setProfileConfirmPassword("");
  } catch (err) {
    showAlert("Lỗi Máy Chủ ❌", "Không thể cập nhật mật khẩu mới.");
  }
};

const handleRenameUser = async e => {
  e.preventDefault();
  const newName = newUsernameInput.trim();
  if (!newName || newName.length < 2) {
    showAlert('Tên Quá Ngắn ⚠️', 'Tên HLV mới phải có ít nhất 2 ký tự!');
    return;
  }
  if (!/^[\w\s\u00C0-\u024F\u1E00-\u1EFF]+$/.test(newName)) {
    showAlert('Tên Không Hợp Lệ ⚠️', 'Tên HLV chỉ được dùng chữ cái, số, dấu cách. Không dùng ký tự đặc biệt!');
    return;
  }
  if (newName === currentUser) {
    showAlert('Không Có Thay Đổi ⚠️', 'Tên mới trùng với tên hiện tại!');
    return;
  }
  if (!isConnectedToFirebase) {
    // Offline mode: just migrate localStorage
    setIsRenaming(true);
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(`panini_${currentUser}_`)) {
          const suffix = key.replace(`panini_${currentUser}_`, '');
          const val = localStorage.getItem(key);
          localStorage.setItem(`panini_${newName}_${suffix}`, val);
          localStorage.removeItem(key);
        }
      });
      localStorage.setItem('panini_currentUser', newName);
      showAlert('Đổi Tên Thành Công 🎉', 'Đã đổi tên HLV thành công (Chế độ ngoại tuyến).');
      window.location.reload();
    } catch (err) {
      console.error(err);
      showAlert('Lỗi ❌', 'Không thể đổi tên ngoại tuyến.');
    } finally {
      setIsRenaming(false);
    }
    return;
  }
  setIsRenaming(true);
  try {
    const oldLower = currentUser.toLowerCase();
    const newLower = newName.toLowerCase();

    // Check if new name is taken
    if (oldLower !== newLower) {
      const checkSnap = await get(ref(database, `/usernames/${newLower}`));
      if (checkSnap.exists()) {
        showAlert('Tên Đã Được Sử Dụng ⚠️', 'Tên HLV này đã được người khác sử dụng!');
        setIsRenaming(false);
        return;
      }
    }

    // 1. Fetch old user data
    const userRef = ref(database, `/users/${currentUser}`);
    const userSnap = await get(userRef);
    if (!userSnap.exists()) {
      showAlert('Lỗi ❌', 'Không tìm thấy dữ liệu HLV hiện tại.');
      setIsRenaming(false);
      return;
    }
    const userData = userSnap.val();
    userData.username = newName; // Update internal username

    // 2. Fetch other related data
    const oldLeaderboardRef = ref(database, `/leaderboard/${currentUser}`);
    const oldHistoryRef = ref(database, `/pvp_history/${currentUser}`);
    const oldWallRef = ref(database, `/user_walls/${currentUser}`);
    const [leaderboardSnap, historySnap, wallSnap] = await Promise.all([get(oldLeaderboardRef), get(oldHistoryRef), get(oldWallRef)]);
    const updates = {};

    // Update user node
    updates[`/users/${newName}`] = userData;
    updates[`/users/${currentUser}`] = null;

    // Update username indexes
    updates[`/usernames/${newLower}`] = newName;
    if (oldLower !== newLower) {
      updates[`/usernames/${oldLower}`] = null;
    }

    // Update leaderboard
    if (leaderboardSnap.exists()) {
      updates[`/leaderboard/${newName}`] = leaderboardSnap.val();
      updates[`/leaderboard/${currentUser}`] = null;
    }

    // Update PVP History
    if (historySnap.exists()) {
      updates[`/pvp_history/${newName}`] = historySnap.val();
      updates[`/pvp_history/${currentUser}`] = null;
    }

    // Update User Wall
    if (wallSnap.exists()) {
      updates[`/user_walls/${newName}`] = wallSnap.val();
      updates[`/user_walls/${currentUser}`] = null;
    }

    // Migrate private chats
    const myPrivateChatsRef = ref(database, `/users/${currentUser}/private_chats`);
    const myChatsSnap = await get(myPrivateChatsRef);
    if (myChatsSnap.exists()) {
      const partners = Object.keys(myChatsSnap.val());
      for (const partner of partners) {
        const timestamp = myChatsSnap.val()[partner];
        const oldChatId = [currentUser, partner].sort().join('_');
        const newChatId = [newName, partner].sort().join('_');

        // Read old private chat messages
        const chatSnap = await get(ref(database, `/private_chats/${oldChatId}`));
        if (chatSnap.exists()) {
          updates[`/private_chats/${newChatId}`] = chatSnap.val();
          updates[`/private_chats/${oldChatId}`] = null;
        }

        // Update partner's references
        updates[`/users/${partner}/private_chats/${currentUser}`] = null;
        updates[`/users/${partner}/private_chats/${newName}`] = timestamp;

        // Migrate partner's unread marks
        const unreadSnap = await get(ref(database, `/users/${partner}/unread/${currentUser}`));
        if (unreadSnap.exists()) {
          updates[`/users/${partner}/unread/${currentUser}`] = null;
          updates[`/users/${partner}/unread/${newName}`] = unreadSnap.val();
        }
      }
    }

    // Execute all updates atomically!
    await update(ref(database), updates);

    // 3. Migrate LocalStorage
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith(`panini_${currentUser}_`)) {
        const suffix = key.replace(`panini_${currentUser}_`, '');
        const val = localStorage.getItem(key);
        localStorage.setItem(`panini_${newName}_${suffix}`, val);
        localStorage.removeItem(key);
      }
    });
    localStorage.setItem('panini_currentUser', newName);

    // Send a system message to global chat
    const chatRef = ref(database, '/chat');
    const newMsg = {
      sender: 'HỆ THỐNG',
      text: `📢 HLV [${currentUser}] đã đổi tên thành [${newName}]!`,
      timestamp: serverTimestamp(),
      type: 'system'
    };
    push(chatRef, newMsg);
    showAlert('Đổi Tên Thành Công 🎉', `Đã đổi tên HLV thành [${newName}] thành công!`);
    window.location.reload();
  } catch (err) {
    console.error("Rename error:", err);
    showAlert('Lỗi ❌', 'Đã xảy ra lỗi trong quá trình đổi tên.');
  } finally {
    setIsRenaming(false);
  }
};

const handleLogout = () => {
  localStorage.removeItem('panini_currentUser');
  window.location.reload();
};

// ─── RARITY TIER DEFINITIONS ──────────────────────────────────────────────────

// ─── RARITY TIER DEFINITIONS ──────────────────────────────────────────────────
const RARITY_TIERS = {
  common: {
    types: ['Base'],
    label: 'THƯỜNG',
    color: '#9ca3af',
    glow: 'rgba(156,163,175,0.4)',
    star: '★',
    prob: 0
  },
  rare: {
    types: ['Fan Favourite', 'Top Keeper'],
    label: 'HIẾM',
    color: '#60a5fa',
    glow: 'rgba(96,165,250,0.5)',
    star: '★★',
    prob: 0
  },
  epic: {
    types: ['Defensive Rock', 'Midfield Maestro', 'Goal Machine'],
    label: 'SỪU HIẾM',
    color: '#a78bfa',
    glow: 'rgba(167,139,250,0.5)',
    star: '★★★',
    prob: 0
  },
  legendary: {
    types: ['Icon'],
    label: 'HUYỀN THOẠI',
    color: '#f59e0b',
    glow: 'rgba(245,158,11,0.6)',
    star: '★★★★',
    prob: 0
  },
  mythic: {
    types: ['Golden Baller'],
    label: 'SIÊU SAO',
    color: '#f43f5e',
    glow: 'rgba(244,63,94,0.7)',
    star: '★★★★★',
    prob: 0
  }
};

const getCardRarity = card => {
  for (const [key, tier] of Object.entries(RARITY_TIERS)) {
    if (tier.types.includes(card.type)) return key;
  }
  return 'common';
};

// Pack configs: each pack costs X coins and has different pull probabilities

// Pack configs: each pack costs X coins and has different pull probabilities
const PACK_CONFIGS = {
  starter: {
    name: 'Gói Khởi Đầu',
    emoji: '🎁',
    cost: 0,
    isFree: true,
    cards: 5,
    common: 0.70,
    rare: 0.22,
    epic: 0.06,
    legendary: 0.015,
    mythic: 0.005,
    guaranteedRare: 1
  },
  standard: {
    name: 'Gói Tiêu Chuẩn',
    emoji: '📦',
    cost: 100,
    isFree: false,
    cards: 8,
    common: 0.60,
    rare: 0.25,
    epic: 0.10,
    legendary: 0.03,
    mythic: 0.02,
    guaranteedRare: 1
  },
  premium: {
    name: 'Gói Cao Cấp',
    emoji: '💫',
    cost: 300,
    isFree: false,
    cards: 12,
    common: 0.45,
    rare: 0.30,
    epic: 0.15,
    legendary: 0.06,
    mythic: 0.04,
    guaranteedRare: 2
  },
  ultimate: {
    name: 'Gói Tuyển Chọn',
    emoji: '👑',
    cost: 600,
    isFree: false,
    cards: 16,
    common: 0.30,
    rare: 0.30,
    epic: 0.20,
    legendary: 0.12,
    mythic: 0.08,
    guaranteedRare: 3
  },
  champion: {
    name: 'Gói Siêu Vô Địch',
    emoji: '🏆',
    cost: 1000,
    isFree: false,
    cards: 5,
    common: 0.00,
    rare: 0.10,
    epic: 0.30,
    legendary: 0.40,
    mythic: 0.20,
    guaranteedRare: 5
  }
};

// ─── ENHANCED GACHA ALGORITHM with Pity System ───────────────────────────────

// ─── ENHANCED GACHA ALGORITHM with Pity System ───────────────────────────────
const openPack = (type = packType) => {
  const cfg = PACK_CONFIGS[type];
  const isFree = freePacks > 0 && type === 'starter';
  if (isFree) {
    setFreePacks(f => f - 1);
  } else if (!isFree) {
    if (coins < cfg.cost) {
      showAlert('Đủ Xu ⚠️', `Bạn cần ${cfg.cost} Xu để mở ${cfg.name}! Hãy làm nhiệm vụ để kiếm thêm Xu nhé.`);
      return;
    }
    setCoins(c => c - cfg.cost);
  }
  gainXp(type === 'champion' ? 50 : type === 'ultimate' ? 30 : type === 'premium' ? 20 : type === 'standard' ? 10 : 5);
  setIsPackOpeningAnim(true);
  setOpenedCards([]);
  setRevealingCards([]);
  setRevealIndex(0);
  setTimeout(() => {
    const pools = {
      common: playersData.filter(p => RARITY_TIERS.common.types.includes(p.type)),
      rare: playersData.filter(p => RARITY_TIERS.rare.types.includes(p.type)),
      epic: playersData.filter(p => RARITY_TIERS.epic.types.includes(p.type)),
      legendary: playersData.filter(p => RARITY_TIERS.legendary.types.includes(p.type)),
      mythic: playersData.filter(p => RARITY_TIERS.mythic.types.includes(p.type))
    };
    const allPulled = [];
    let currentPity = pityCounter;
    let guaranteedLeft = cfg.guaranteedRare;
    const pullCard = (forcedRarity = null) => {
      let rarity = forcedRarity;
      if (!rarity) {
        const r = Math.random();
        // Pity: if pity >= 9, force legendary or mythic
        if (currentPity >= 9) {
          rarity = Math.random() < 0.4 ? 'mythic' : 'legendary';
          currentPity = 0;
        } else if (r < cfg.mythic) {
          rarity = 'mythic';
          currentPity = 0;
        } else if (r < cfg.mythic + cfg.legendary) {
          rarity = 'legendary';
          currentPity = 0;
        } else if (r < cfg.mythic + cfg.legendary + cfg.epic) {
          rarity = 'epic';
        } else if (r < cfg.mythic + cfg.legendary + cfg.epic + cfg.rare) {
          rarity = 'rare';
        } else {
          rarity = 'common';
          currentPity++;
        }
      } else {
        if (rarity === 'mythic' || rarity === 'legendary') currentPity = 0;
      }
      const pool = pools[rarity];
      if (!pool || pool.length === 0) return pullCard('common');

      // Avoid exact duplicates in same pack
      let card = pool[Math.floor(Math.random() * pool.length)];
      let attempts = 0;
      while (allPulled.find(c => c.id === card.id) && attempts < 20) {
        card = pool[Math.floor(Math.random() * pool.length)];
        attempts++;
      }
      return {
        ...card,
        _rarity: rarity
      };
    };
    for (let i = 0; i < cfg.cards; i++) {
      // Last N slots: guarantee rare+ if not yet met
      const remaining = cfg.cards - i;
      const needGuarantee = guaranteedLeft > 0 && remaining <= guaranteedLeft;
      if (needGuarantee) {
        const forcedRarity = Math.random() < 0.3 ? 'mythic' : Math.random() < 0.4 ? 'legendary' : 'epic';
        allPulled.push(pullCard(forcedRarity));
        guaranteedLeft--;
      } else {
        const card = pullCard();
        if (['rare', 'epic', 'legendary', 'mythic'].includes(card._rarity)) {
          guaranteedLeft = Math.max(0, guaranteedLeft - 1);
        }
        allPulled.push(card);
      }
    }

    // Sort: rarest last for dramatic reveal
    const rarityOrder = {
      common: 0,
      rare: 1,
      epic: 2,
      legendary: 3,
      mythic: 4
    };
    allPulled.sort((a, b) => rarityOrder[a._rarity] - rarityOrder[b._rarity]);

    // Update pity
    setPityCounter(currentPity);
    localStorage.setItem(`panini_${currentUser}_pity`, currentPity.toString());

    // Add to collection
    setCollection(prev => {
      const newCollection = [...prev];
      allPulled.forEach(c => {
        if (!newCollection.find(p => p.id === c.id)) newCollection.push(c);
      });
      return newCollection;
    });

    // Update quest: open_pack1
    setQuests(prev => prev.map(q => {
      if (q.id === 'open_pack1' && !q.isCompleted) {
        return {
          ...q,
          progress: Math.min(1, q.progress + 1),
          isCompleted: true
        };
      }
      return q;
    }));
    setRevealingCards(allPulled);
    setOpenedCards(allPulled);
    setIsPackOpeningAnim(false);
  }, 1200);
};

const generateAITeam = diff => {
  const pool = [...playersData];
  const filteredPool = pool.filter(p => {
    // Đánh giá sức mạnh thẻ dựa trên chỉ số tốt nhất của nó
    const maxStat = Math.max(p.stats.attack, p.stats.defense, p.stats.control);
    if (diff === 'Easy' || diff === 'Amateur') return maxStat <= 75; // Chỉ dùng thẻ yếu
    if (diff === 'Medium' || diff === 'Professional') return maxStat > 75 && maxStat <= 87; // Thẻ tầm trung
    if (diff === 'Hard' || diff === 'World Class') return maxStat > 87 && maxStat <= 94; // Thẻ tầm khá/giỏi
    if (diff === 'Legendary') return maxStat >= 95; // Siêu sao đỉnh cao
    if (diff === 'Ultimate') return maxStat >= 98; // Chỉ tuyển chọn các Icon, Golden Baller hàng đầu thế giới 98+
    return true;
  });
  const safePool = filteredPool.length >= 11 ? filteredPool : pool;

  // AI Nation Chemistry Stacking for Higher Difficulties
  const shouldStackNation = diff !== 'Easy' && diff !== 'Amateur' && (diff !== 'Medium' && diff !== 'Professional' ? true : Math.random() < 0.5);
  let chosenNation = '';
  if (shouldStackNation) {
    const nationFrequencies = {};
    safePool.forEach(p => {
      if (p.nation) {
        const nat = p.nation.toLowerCase();
        nationFrequencies[nat] = (nationFrequencies[nat] || 0) + 1;
      }
    });
    const viableNations = Object.keys(nationFrequencies).filter(nat => nationFrequencies[nat] >= 6);
    if (viableNations.length > 0) {
      chosenNation = viableNations[Math.floor(Math.random() * viableNations.length)];
    }
  }
  let shuffled;
  if (chosenNation) {
    const nationPlayers = safePool.filter(p => p.nation && p.nation.toLowerCase() === chosenNation).sort(() => 0.5 - Math.random());
    const otherPlayers = safePool.filter(p => !p.nation || p.nation.toLowerCase() !== chosenNation).sort(() => 0.5 - Math.random());
    const nationCount = Math.min(8, nationPlayers.length);
    const selectedNation = nationPlayers.slice(0, nationCount);
    const selectedOthers = otherPlayers.slice(0, 11 - nationCount);
    shuffled = [...selectedNation, ...selectedOthers].sort(() => 0.5 - Math.random());
  } else {
    shuffled = safePool.sort(() => 0.5 - Math.random());
  }

  // Deep clone the shuffled cards so we don't mutate the original playersData pool!
  const aiSelectedTeam = shuffled.slice(0, 11).map(card => {
    const clonedCard = JSON.parse(JSON.stringify(card));

    // Dynamic AI Card Levels based on difficulty
    let aiLevel = 1;
    if (diff === 'Medium' || diff === 'Professional') {
      aiLevel = Math.random() < 0.3 ? 2 : 1;
    } else if (diff === 'Hard' || diff === 'World Class') {
      aiLevel = Math.random() < 0.5 ? 3 : 2;
    } else if (diff === 'Legendary') {
      aiLevel = Math.random() < 0.5 ? 4 : 3;
    } else if (diff === 'Ultimate') {
      aiLevel = Math.random() < 0.5 ? 5 : 4;
    }
    clonedCard.level = aiLevel;
    let boost = 0;
    if (diff === 'Legendary') boost = 3;else if (diff === 'Ultimate') boost = 6;
    if (boost > 0) {
      // competitive stat scaling up to 115 OVR limit
      clonedCard.stats.attack = Math.min(115, clonedCard.stats.attack + boost);
      clonedCard.stats.defense = Math.min(115, clonedCard.stats.defense + boost);
      clonedCard.stats.control = Math.min(115, clonedCard.stats.control + boost);
    }
    return clonedCard;
  });
  return aiSelectedTeam;
};

const startMatch = () => {
  const weather = ENV_WEATHER[Math.floor(Math.random() * ENV_WEATHER.length)];
  const time = ENV_TIME[Math.floor(Math.random() * ENV_TIME.length)];
  setMatchEnvironment({
    weather,
    time
  });
  setPlayerHand([...squad]);
  const aiTeam = generateAITeam(difficulty);
  setAiHand(aiTeam);
  setAiSquad(aiTeam);
  setMatchScore({
    player: 0,
    ai: 0
  });
  setMatchLogs([]);
  setMatchHistory([]);
  setPlayedCardIds([]);
  setPlayerStatChoiceHistory([]);
  setMatchPhase('playing');
  setSelectedPlayerCard(null);
  setSelectedStat(null);
  setCurrentAiCard(null);
};

const triggerAiTurn = (updatedPlayedCardIds = playedCardIds, updatedAiHand = aiHand) => {
  if (updatedPlayedCardIds.length >= 11) return;

  // Smart card selection for AI turn
  let cardIndex = 0;
  if (difficulty === 'Easy' || difficulty === 'Amateur') {
    cardIndex = Math.floor(Math.random() * updatedAiHand.length);
  } else {
    // Find AI card with the highest single stat
    let maxOverallStatVal = -1;
    updatedAiHand.forEach((c, idx) => {
      const bestStatOfCard = Math.max(c.stats.attack, c.stats.defense, c.stats.control);
      if (bestStatOfCard > maxOverallStatVal) {
        maxOverallStatVal = bestStatOfCard;
        cardIndex = idx;
      }
    });
  }
  const chosenCard = updatedAiHand[cardIndex];

  // Determine the highest stat on the card
  let chosenStat = 'attack';
  let maxVal = chosenCard.stats.attack;
  if (chosenCard.stats.control > maxVal) {
    maxVal = chosenCard.stats.control;
    chosenStat = 'control';
  }
  if (chosenCard.stats.defense > maxVal) {
    maxVal = chosenCard.stats.defense;
    chosenStat = 'defense';
  }
  setCurrentAiCard(chosenCard);
  setSelectedStat(chosenStat);
  setAiAttackCardIndex(cardIndex);
};

const playRoundAiTurn = playerCard => {
  if (!currentAiCard || !selectedStat) return;

  // Defend counter stats
  let playerDefendStat = 'defense';
  if (selectedStat === 'defense') playerDefendStat = 'attack';else if (selectedStat === 'control') playerDefendStat = 'control';
  const lvlBonus1 = ((playerCard.level || 1) - 1) * 2;
  const lvlBonus2 = ((currentAiCard.level || 1) - 1) * 2;
  const chemBonus1 = getPlayerChemistryBoost(playerCard, squad);
  const chemBonus2 = getPlayerChemistryBoost(currentAiCard, aiSquad);
  const capBonus1 = squad.length > 0 && playerCard.id === squad[0].id ? 3 : 0;
  const capBonus2 = aiSquad.length > 0 && currentAiCard.id === aiSquad[0].id ? 3 : 0;
  let baseV1 = playerCard.stats[playerDefendStat] + lvlBonus1;
  let baseV2 = currentAiCard.stats[selectedStat] + lvlBonus2;
  const formResult1 = generateCardForm(playerCard, currentAiCard, matchEnvironment);
  const formResult2 = generateCardForm(currentAiCard, playerCard, matchEnvironment);
  const formBonus1 = formResult1.bonus;
  const formBonus2 = formResult2.bonus;
  const envBonus1 = formResult1.envBonus || 0;
  const envBonus2 = formResult2.envBonus || 0;
  const bonus1 = getCardTypeBonus(playerCard.type);
  const bonus2 = getCardTypeBonus(currentAiCard.type);
  const attr1 = getPlayerAttr(playerCard);
  const attr2 = getPlayerAttr(currentAiCard);
  let attrBonus1 = 0;
  let attrBonus2 = 0;
  if (checkAttrAdvantage(attr1.key, attr2.key)) {
    attrBonus1 = 10;
  } else if (checkAttrAdvantage(attr2.key, attr1.key)) {
    attrBonus2 = 10;
  }

  // --- CRITICAL STRIKE (Đột Biến / Bạo Kích) ---
  const rawVal1 = baseV1 + attrBonus1;
  const rawVal2 = baseV2 + attrBonus2;
  let myCritChance = rawVal1 <= rawVal2 - 10 ? 0.35 : 0.10;
  let aiCritChance = rawVal2 <= rawVal1 - 10 ? 0.35 : 0.10;
  let myCritBonus = 0;
  if (Math.random() < myCritChance) {
    myCritBonus = rawVal1 <= rawVal2 - 10 ? Math.floor(Math.random() * 6) + 15 : Math.floor(Math.random() * 6) + 10;
  }
  let aiCritBonus = 0;
  if (Math.random() < aiCritChance) {
    aiCritBonus = rawVal2 <= rawVal1 - 10 ? Math.floor(Math.random() * 6) + 15 : Math.floor(Math.random() * 6) + 10;
  }
  const v1 = baseV1 + bonus1 + attrBonus1 + formBonus1 + envBonus1 + chemBonus1 + capBonus1 + myCritBonus;
  const v2 = baseV2 + bonus2 + attrBonus2 + formBonus2 + envBonus2 + chemBonus2 + capBonus2 + aiCritBonus;
  let pScore = matchScore.player;
  let aScore = matchScore.ai;
  let msg = "";
  const bonusPart = (b, ab, emoji, lb, fb, fs, env, chem, cap, crit) => {
    let parts = [];
    if (crit > 0) parts.push(`+${crit} BẠO KÍCH 💥`);
    if (lb > 0) parts.push(`+${lb} Lv`);
    if (b > 0) parts.push(`+${b} Rarity`);
    if (ab > 0) parts.push(`+${ab} Khắc chế ${emoji}`);
    if (fb !== 0) {
      const sign = fb > 0 ? '+' : '';
      parts.push(`${sign}${fb} Phong độ ${fs.emoji}`);
    } else {
      parts.push(`+0 Phong độ ➡️`);
    }
    if (env !== 0) {
      const sign = env > 0 ? '+' : '';
      parts.push(`${sign}${env} Khí hậu`);
    }
    if (chem > 0) parts.push(`+${chem} Duyên 🤝`);
    if (cap > 0) parts.push(`+${cap} Đội trưởng 👑`);
    return parts.length > 0 ? ` [${parts.join(' & ')}]` : '';
  };
  const myBonusDetails = bonusPart(bonus1, attrBonus1, attr1.emoji, lvlBonus1, formBonus1, formResult1.state, envBonus1, chemBonus1, capBonus1, myCritBonus);
  const opBonusDetails = bonusPart(bonus2, attrBonus2, attr2.emoji, lvlBonus2, formBonus2, formResult2.state, envBonus2, chemBonus2, capBonus2, aiCritBonus);
  if (v1 > v2) {
    pScore++;
    msg = `THẮNG! ${v1}${myBonusDetails} > ${v2}${opBonusDetails}`;
  } else if (v2 > v1) {
    aScore++;
    msg = `THUA! ${v1}${myBonusDetails} < ${v2}${opBonusDetails}`;
  } else {
    msg = `HÒA! ${v1}${myBonusDetails} = ${v2}${opBonusDetails}`;
  }
  setMatchScore({
    player: pScore,
    ai: aScore
  });
  setRoundResultMsg(msg);
  setSelectedPlayerCard(playerCard);
  setMatchLogs([...matchLogs, `Lượt ${playedCardIds.length + 1}: ${playerCard.name} (${playerDefendStat.toUpperCase()}${myBonusDetails}) vs ${currentAiCard.name} (${selectedStat.toUpperCase()}${opBonusDetails}) -> ${msg}`]);
  setMatchHistory([...matchHistory, {
    myStat: playerDefendStat,
    myCardName: playerCard.name,
    myBonusDetails,
    myFinalVal: v1,
    opStat: selectedStat,
    opCardName: currentAiCard.name,
    opBonusDetails,
    opFinalVal: v2,
    result: v1 > v2 ? 'win' : v1 < v2 ? 'loss' : 'draw'
  }]);
  setMatchPhase('roundResult');

  // Remove cards from hands
  setPlayedCardIds([...playedCardIds, playerCard.id]);
  setAiHand(aiHand.filter((_, i) => i !== aiAttackCardIndex));
};

const playRound = stat => {
  if (!selectedPlayerCard) return;
  setSelectedStat(stat);
  setPlayerStatChoiceHistory([...playerStatChoiceHistory, stat]);

  // AI picks a card based on difficulty level
  let aiIndex = 0;
  if (difficulty === 'Easy' || difficulty === 'Amateur') {
    // 100% random choice
    aiIndex = Math.floor(Math.random() * aiHand.length);
  } else {
    // Determine what stat we are comparing against on the AI card
    let targetStat = '';
    if (stat === 'attack') targetStat = 'defense';else if (stat === 'defense') targetStat = 'attack';else targetStat = 'control';
    const lvlBonus1 = ((selectedPlayerCard.level || 1) - 1) * 2;
    const chemBonus1 = getPlayerChemistryBoost(selectedPlayerCard, squad);
    const capBonus1 = squad.length > 0 && selectedPlayerCard.id === squad[0].id ? 3 : 0;
    const playerVal = selectedPlayerCard.stats[stat] + lvlBonus1 + chemBonus1 + capBonus1;

    // Smart AI Card Selection logic
    const aiCardsWithIndex = aiHand.map((card, idx) => ({
      card,
      idx
    }));
    const pAttr = getPlayerAttr(selectedPlayerCard).key;

    // Calculate pseudo-final value for each AI card to see if it wins
    aiCardsWithIndex.forEach(item => {
      let cardBase = item.card.stats[targetStat] + ((item.card.level || 1) - 1) * 2;
      let cAttr = getPlayerAttr(item.card).key;
      let cBonus = checkAttrAdvantage(cAttr, pAttr) ? 10 : checkAttrAdvantage(pAttr, cAttr) ? -10 : 0;
      item.pseudoVal = cardBase + cBonus;
    });

    // Separate cards into winning, drawing, and losing groups
    const winners = aiCardsWithIndex.filter(item => item.pseudoVal > playerVal);
    const drawers = aiCardsWithIndex.filter(item => item.pseudoVal === playerVal);
    const losers = aiCardsWithIndex.filter(item => item.pseudoVal < playerVal);

    // Determine smart selection probability based on difficulty
    let isSmart = false;
    const rand = Math.random();
    if (difficulty === 'Medium' || difficulty === 'Professional') {
      isSmart = rand < 0.50; // 50% smart
    } else if (difficulty === 'Hard' || difficulty === 'World Class') {
      isSmart = rand < 0.75; // 75% smart
    } else if (difficulty === 'Legendary') {
      isSmart = rand < 0.90; // 90% smart
    } else if (difficulty === 'Ultimate') {
      isSmart = true; // 100% smart
    }
    if (isSmart) {
      const bluffRand = Math.random();
      const canBluff = difficulty === 'Legendary' || difficulty === 'Ultimate';
      if (canBluff && bluffRand < 0.20 && losers.length > 0) {
        // Bluff / Sacrifice / "Cắn trộm" Bạo Kích! Play the weakest card to conserve or hope for Underdog Critical Strike!
        losers.sort((a, b) => a.pseudoVal - b.pseudoVal);
        aiIndex = losers[0].idx;
      } else if (canBluff && winners.length > 0 && bluffRand >= 0.85) {
        // Overkill: Play the absolutely strongest card to crush the player's selection!
        winners.sort((a, b) => b.pseudoVal - a.pseudoVal);
        aiIndex = winners[0].idx;
      } else if (winners.length > 0) {
        // Normal smart play: lowest winning card to conserve cards
        winners.sort((a, b) => a.pseudoVal - b.pseudoVal);
        aiIndex = winners[0].idx;
      } else if (drawers.length > 0) {
        // Draw
        aiIndex = drawers[Math.floor(Math.random() * drawers.length)].idx;
      } else {
        // Sacrificial play
        losers.sort((a, b) => a.pseudoVal - b.pseudoVal);
        aiIndex = losers[0].idx;
      }
    } else {
      // Normal random choice
      aiIndex = Math.floor(Math.random() * aiHand.length);
    }
  }
  const aiCard = aiHand[aiIndex];
  setCurrentAiCard(aiCard);

  // Compare logic
  const lvlBonus1 = ((selectedPlayerCard.level || 1) - 1) * 2;
  const lvlBonus2 = ((aiCard.level || 1) - 1) * 2;

  // Squad Chemistry Boost
  const chemBonus1 = getPlayerChemistryBoost(selectedPlayerCard, squad);
  const chemBonus2 = getPlayerChemistryBoost(aiCard, aiSquad);

  // Captain Boost (+3 OVR)
  const capBonus1 = squad.length > 0 && selectedPlayerCard.id === squad[0].id ? 3 : 0;
  const capBonus2 = aiSquad.length > 0 && aiCard.id === aiSquad[0].id ? 3 : 0;
  let baseV1 = selectedPlayerCard.stats[stat] + lvlBonus1;
  let baseV2;
  let stat2Name;
  if (stat === 'attack') {
    baseV2 = aiCard.stats.defense + lvlBonus2;
    stat2Name = 'defense';
  } else if (stat === 'defense') {
    baseV2 = aiCard.stats.attack + lvlBonus2;
    stat2Name = 'attack';
  } else {
    baseV2 = aiCard.stats.control + lvlBonus2;
    stat2Name = 'control';
  }

  // Environment Form
  const formResult1 = generateCardForm(selectedPlayerCard, aiCard, matchEnvironment);
  const formResult2 = generateCardForm(aiCard, selectedPlayerCard, matchEnvironment);
  const formBonus1 = formResult1.bonus;
  const formBonus2 = formResult2.bonus;
  const envBonus1 = formResult1.envBonus || 0;
  const envBonus2 = formResult2.envBonus || 0;

  // Card rarity boost
  const bonus1 = getCardTypeBonus(selectedPlayerCard.type);
  const bonus2 = getCardTypeBonus(aiCard.type);

  // Attribute System counter bonus (+10 OVR)
  const attr1 = getPlayerAttr(selectedPlayerCard);
  const attr2 = getPlayerAttr(aiCard);
  let attrBonus1 = 0;
  let attrBonus2 = 0;
  if (checkAttrAdvantage(attr1.key, attr2.key)) {
    attrBonus1 = 10;
  } else if (checkAttrAdvantage(attr2.key, attr1.key)) {
    attrBonus2 = 10;
  }

  // --- CRITICAL STRIKE (Đột Biến / Bạo Kích) ---
  const rawVal1 = baseV1 + attrBonus1;
  const rawVal2 = baseV2 + attrBonus2;
  let myCritChance = rawVal1 <= rawVal2 - 10 ? 0.35 : 0.10;
  let aiCritChance = rawVal2 <= rawVal1 - 10 ? 0.35 : 0.10;
  let myCritBonus = 0;
  if (Math.random() < myCritChance) {
    myCritBonus = rawVal1 <= rawVal2 - 10 ? Math.floor(Math.random() * 6) + 15 : Math.floor(Math.random() * 6) + 10;
  }
  let aiCritBonus = 0;
  if (Math.random() < aiCritChance) {
    aiCritBonus = rawVal2 <= rawVal1 - 10 ? Math.floor(Math.random() * 6) + 15 : Math.floor(Math.random() * 6) + 10;
  }

  // Final OVR value calculations
  const v1 = baseV1 + bonus1 + attrBonus1 + formBonus1 + envBonus1 + chemBonus1 + capBonus1 + myCritBonus;
  const v2 = baseV2 + bonus2 + attrBonus2 + formBonus2 + envBonus2 + chemBonus2 + capBonus2 + aiCritBonus;
  const bonusPart = (b, ab, emoji, lb, fb, fs, env, chem, cap, crit) => {
    let parts = [];
    if (crit > 0) parts.push(`+${crit} BẠO KÍCH 💥`);
    if (lb > 0) parts.push(`+${lb} Lv`);
    if (b > 0) parts.push(`+${b} Rarity`);
    if (ab > 0) parts.push(`+${ab} Khắc chế ${emoji}`);
    if (fb !== 0) {
      const sign = fb > 0 ? '+' : '';
      parts.push(`${sign}${fb} Phong độ ${fs.emoji}`);
    } else {
      parts.push(`+0 Phong độ ➡️`);
    }
    if (env !== 0) {
      const sign = env > 0 ? '+' : '';
      parts.push(`${sign}${env} Khí hậu`);
    }
    if (chem > 0) parts.push(`+${chem} Duyên 🤝`);
    if (cap > 0) parts.push(`+${cap} Đội trưởng 👑`);
    return parts.length > 0 ? ` [${parts.join(' & ')}]` : '';
  };
  let pScore = matchScore.player;
  let aScore = matchScore.ai;
  let msg;
  const myBonusDetails = bonusPart(bonus1, attrBonus1, attr1.emoji, lvlBonus1, formBonus1, formResult1.state, envBonus1, chemBonus1, capBonus1, myCritBonus);
  const opBonusDetails = bonusPart(bonus2, attrBonus2, attr2.emoji, lvlBonus2, formBonus2, formResult2.state, envBonus2, chemBonus2, capBonus2, aiCritBonus);
  if (v1 > v2) {
    pScore++;
    msg = `THẮNG! ${v1}${myBonusDetails} > ${v2}${opBonusDetails}`;
  } else if (v2 > v1) {
    aScore++;
    msg = `THUA! ${v1}${myBonusDetails} < ${v2}${opBonusDetails}`;
  } else {
    msg = `HÒA! ${v1}${myBonusDetails} = ${v2}${opBonusDetails}`;
  }
  setMatchScore({
    player: pScore,
    ai: aScore
  });
  setRoundResultMsg(msg);
  setMatchLogs([...matchLogs, `Lượt ${playedCardIds.length + 1}: ${selectedPlayerCard.name} (${stat.toUpperCase()}${myBonusDetails}) vs ${aiCard.name} (${stat2Name.toUpperCase()}${opBonusDetails}) -> ${msg}`]);
  setMatchHistory([...matchHistory, {
    myStat: stat,
    myCardName: selectedPlayerCard.name,
    myBonusDetails,
    myFinalVal: v1,
    opStat: stat2Name,
    opCardName: aiCard.name,
    opBonusDetails,
    opFinalVal: v2,
    result: v1 > v2 ? 'win' : v1 < v2 ? 'loss' : 'draw'
  }]);
  setMatchPhase('roundResult');

  // Remove cards from hands
  setPlayedCardIds([...playedCardIds, selectedPlayerCard.id]);
  setAiHand(aiHand.filter((_, i) => i !== aiIndex));
};

const nextRound = () => {
  if (playedCardIds.length >= 11) {
    // Đã đánh 11 lá (0 đến 11 là 11 lá, check sau khi cộng)
    // Trận đấu kết thúc -> Tính thưởng theo độ khó
    let reward = 10;
    const isWin = matchScore.player > matchScore.ai;
    const isDraw = matchScore.player === matchScore.ai;

    // Tính phần thưởng theo độ khó — thua cũng có thưởng để khuyến khích tích lũy
    if (difficulty === 'Easy' || difficulty === 'Amateur') {
      reward = isWin ? 40 : isDraw ? 20 : 12;
    } else if (difficulty === 'Medium' || difficulty === 'Professional') {
      reward = isWin ? 60 : isDraw ? 25 : 15;
    } else if (difficulty === 'Hard' || difficulty === 'World Class') {
      reward = isWin ? 100 : isDraw ? 35 : 20;
    } else if (difficulty === 'Legendary') {
      reward = isWin ? 150 : isDraw ? 55 : 30;
    } else if (difficulty === 'Ultimate') {
      reward = isWin ? 220 : isDraw ? 75 : 40;
    }
    setCoins(c => c + reward);
    setLastReward(reward);

    // Cập nhật Nhiệm vụ
    setQuests(prev => prev.map(q => {
      if (q.id === 'play1') return {
        ...q,
        progress: 1,
        isCompleted: true
      };
      if (q.id === 'win1' && matchScore.player > matchScore.ai) return {
        ...q,
        progress: 1,
        isCompleted: true
      };
      return q;
    }));

    // Update XP & Stats — thua vẫn nhận XP để khuyến khích chơi
    let xpEarned;
    if (isWin) {
      xpEarned = 60;
      gainXp(xpEarned);
      setStats(s => ({
        ...s,
        played: s.played + 1,
        wins: s.wins + 1
      }));
    } else if (isDraw) {
      xpEarned = 30;
      gainXp(xpEarned);
      setStats(s => ({
        ...s,
        played: s.played + 1,
        draws: s.draws + 1
      }));
    } else {
      xpEarned = 15;
      gainXp(xpEarned);
      setStats(s => ({
        ...s,
        played: s.played + 1,
        losses: s.losses + 1
      }));
    }

    // Hiển thị alert kết quả với thưởng rõ ràng
    if (isWin) {
      showAlert('🏆 Chiến Thắng!', `Xuất sắc! Bạn thắng ${matchScore.player}-${matchScore.ai}. Nhận: +${reward} Xu & +${xpEarned} XP.`);
    } else if (isDraw) {
      showAlert('🤝 Hòa Trận!', `Tỉ số cân bằng ${matchScore.player}-${matchScore.ai}. Nhận: +${reward} Xu & +${xpEarned} XP.`);
    } else {
      showAlert('😤 Thất Bại — Nhưng Bạn Vẫn Nhận Thưởng!', `Kết quả ${matchScore.player}-${matchScore.ai}. Nhận: +${reward} Xu & +${xpEarned} XP. Tiếp tục cố lên!`);
    }
    setMatchPhase('gameOver');
  } else {
    setSelectedPlayerCard(null);
    setSelectedStat(null);
    setCurrentAiCard(null);
    setMatchPhase('playing');

    // If the next round is an AI-initiated turn (even rounds), pre-trigger AI attack selection
    const nextRoundPlayedCount = playedCardIds.length;
    if (nextRoundPlayedCount % 2 !== 0 && nextRoundPlayedCount < 11) {
      triggerAiTurn(playedCardIds, aiHand);
    }
  }
};

useEffect(() => {
  if (matchPhase === 'roundResult') {
    if (roundResultMsg.includes('THẮNG')) {
      playFx('winPoint');
      triggerConfetti({
        particleCount: 150,
        spread: 80,
        origin: {
          y: 0.6
        },
        colors: ['#22c55e', '#3b82f6', '#fbbf24']
      });
    } else if (roundResultMsg.includes('THUA')) {
      playFx('losePoint');
    }
  } else if (matchPhase === 'gameOver') {
    if (matchScore.player > matchScore.ai) {
      playFx('winGame');
    }
  }
}, [matchPhase, roundResultMsg, matchScore.player, matchScore.ai]);

// Auto-hide round result overlay after 6 seconds in AI Match

// Auto-hide round result overlay after 6 seconds in AI Match
useEffect(() => {
  if (gameState === 'matchEngine' && matchPhase === 'roundResult' && playedCardIds.length < 11) {
    const timer = setTimeout(() => {
      setMatchPhase('playing');
      setSelectedPlayerCard(null);
      setSelectedStat(null);
      setCurrentAiCard(null);

      // If the next round is an AI-initiated turn (odd rounds), pre-trigger AI attack selection
      const nextRoundPlayedCount = playedCardIds.length;
      if (nextRoundPlayedCount % 2 !== 0) {
        triggerAiTurn(playedCardIds, aiHand);
      }
    }, 6000);
    return () => clearTimeout(timer);
  }
}, [gameState, matchPhase, playedCardIds.length, aiHand]);

const dismissRoundResult = () => {
  if (matchPhase === 'roundResult' && playedCardIds.length < 11) {
    playFx('click');
    setMatchPhase('playing');
    setSelectedPlayerCard(null);
    setSelectedStat(null);
    setCurrentAiCard(null);

    // If the next round is an AI-initiated turn (even rounds), pre-trigger AI attack selection
    const nextRoundPlayedCount = playedCardIds.length;
    if (nextRoundPlayedCount % 2 !== 0 && nextRoundPlayedCount < 11) {
      triggerAiTurn(playedCardIds, aiHand);
    }
  }
};

const returnToLobby = () => {
  setGameState('lobby');
  setMatchPhase('setup');
  setPlayerHand([]);
  setAiHand([]);
  setSelectedPlayerCard(null);
  setSelectedStat(null);
  setCurrentAiCard(null);
};

const [gameAlert, setGameAlert] = useState(null); // Custom in-game dialog alert: { title, message }

// Custom in-game dialog alert: { title, message }
const showAlert = (title, message) => {
  setGameAlert({
    title,
    message
  });
};

const logLocalPvpMatch = (result, opponentName, myScore, opponentScore) => {
  const newRecord = {
    id: Date.now().toString(),
    opponent: opponentName || 'Đối Thủ Vô Danh',
    myScore: myScore || 0,
    opponentScore: opponentScore || 0,
    result: result,
    timestamp: Date.now()
  };
  const localHistory = localStorage.getItem(`thebongda_pvp_history_${currentUser}`) ? JSON.parse(localStorage.getItem(`thebongda_pvp_history_${currentUser}`)) : [];
  const updated = [newRecord, ...localHistory];
  localStorage.setItem(`thebongda_pvp_history_${currentUser}`, JSON.stringify(updated));
  setPvpHistory(updated);
};

const handlePvpEnd = (result, opponentName = null, myScore = null, opponentScore = null) => {
  if (result === 'win') {
    setCoins(c => c + 120);
    gainXp(120);
    setStats(s => ({
      ...s,
      played: s.played + 1,
      wins: s.wins + 1
    }));
    showAlert("🏆 Chiến Thắng PvP!", "Xuất sắc! Bạn đánh bại đối thủ thật sự. Nhận: +120 Xu & +120 XP.");
  } else if (result === 'draw') {
    setCoins(c => c + 40);
    gainXp(50);
    setStats(s => ({
      ...s,
      played: s.played + 1,
      draws: s.draws + 1
    }));
    showAlert("🤝 Hòa Trận PvP!", "Cuộc chiến ngang tài ngang sức! Nhận: +40 Xu & +50 XP.");
  } else if (result === 'lose') {
    setCoins(c => c + 25);
    gainXp(30);
    setStats(s => ({
      ...s,
      played: s.played + 1,
      losses: s.losses + 1
    }));
    showAlert("😤 Thất Bại PvP — Vẫn Có Thưởng!", "Bạn thua trận này nhưng đã cố gắng! Nhận: +25 Xu & +30 XP. Tập luyện thêm và thử lại!");
  }
  if (opponentName && result) {
    const actualMyScore = myScore !== null ? myScore : 0;
    const actualOpponentScore = opponentScore !== null ? opponentScore : 0;
    if (isConnectedToFirebase && currentUser) {
      const historyRef = ref(database, `/pvp_history/${currentUser}`);
      push(historyRef, {
        opponent: opponentName,
        myScore: actualMyScore,
        opponentScore: actualOpponentScore,
        result: result,
        timestamp: serverTimestamp()
      }).catch(err => {
        console.error("Error logging Firebase PVP match:", err);
      });
    }
    logLocalPvpMatch(result, opponentName, actualMyScore, actualOpponentScore);
  }

  // Return to the PvP Online Lobby
  setGameState('pvpOnlineLobby');
  setMatchPhase('setup');
  setPlayerHand([]);
  setAiHand([]);
  setSelectedPlayerCard(null);
  setSelectedStat(null);
  setCurrentAiCard(null);
};

return { currentUser, collection, squad, setSquad, coins, setCoins, gameState, setGameState, activePvpTarget, setActivePvpTarget, showPvpJoinModal, setShowPvpJoinModal, pvpJoinInput, setPvpJoinInput, activeBannerIdx, referredBy, referrals, refCodeInput, setRefCodeInput, showSharePoster, setShowSharePoster, selectedUpgradeCard, setSelectedUpgradeCard, upgradeCard, submitReferralCode, claimReferralReward, performCheckIn, authUsername, setAuthUsername, authPin, setAuthPin, authStep, setAuthStep, authCheckingUser, setAuthFoundUser, isPackOpeningAnim, openedCards, setOpenedCards, quests, setQuests, lastReward, level, xp, stats, email, profileOldPassword, setProfileOldPassword, profileNewPassword, setProfileNewPassword, profileConfirmPassword, setProfileConfirmPassword, profileEmailInput, setProfileEmailInput, newUsernameInput, setNewUsernameInput, isRenaming, showLevelUpModal, setShowLevelUpModal, userWallTarget, setUserWallTarget, wallData, userWallPosts, globalPosts, socialWallTab, setSocialWallTab, mobileSubTab, setMobileSubTab, newPostText, commentInputs, setCommentInputs, loadingWall, showGiftModal, setShowGiftModal, giftAmount, setGiftAmount, giftLoading, loadingGlobalPosts, showGiftCardModal, setShowGiftCardModal, giftCardLoading, giftCardSearch, setGiftCardSearch, selectedGiftCard, setSelectedGiftCard, giftCardFilterRarity, setGiftCardFilterRarity, socialSearchQuery, setSocialSearchQuery, showMentionDropdown, activePrivatePartner, setActivePrivatePartner, privateMessages, myPrivateChats, privateChatInput, setPrivateChatInput, unreadPartners, rewardedMilestones, claimedLevelRewards, freePacks, pityCounter, setRevealingCards, packType, setPackType, leaderboardData, loadingLeaderboard, leaderboardTab, setLeaderboardTab, checkInState, alreadyClaimedToday, equippedTitle, setEquippedTitle, claimedAchievements, setClaimedAchievements, customAvatar, setCustomAvatar, customBanner, setCustomBanner, isCustomizingProfile, setIsCustomizingProfile, previewAvatar, setPreviewAvatar, previewBanner, setPreviewBanner, showCheckInModal, setShowCheckInModal, activeShareData, setActiveShareData, showroomFilterState, setShowroomFilterState, showroomHoverState, setShowroomHoverState, claimMilestone, renderPostText, handleComposerChange, getAutocompleteSuggestions, insertMention, insertEmoji, handleCreatePost, handleSendGift, getCardGiftFee, handleSendCardGift, handleLikePost, handleCreateComment, sendPrivateMessage, onlineUsers, chatMessages, activeInvite, chatTab, setChatTab, chatInput, setChatInput, pvpHistory, sendChatMessage, sendChallengeInvite, acceptChallenge, declineChallenge, difficulty, setDifficulty, matchPhase, setMatchPhase, playerHand, aiHand, matchScore, matchHistory, showHistoryModal, setShowHistoryModal, selectedPlayerCard, setSelectedPlayerCard, selectedStat, setSelectedStat, currentAiCard, setCurrentAiCard, playedCardIds, matchEnvironment, handleCheckUsername, handleVerifyPin, handleCreateAccount, handleUpdateEmail, handleUpdatePassword, handleRenameUser, handleLogout, RARITY_TIERS, getCardRarity, PACK_CONFIGS, openPack, startMatch, triggerAiTurn, playRoundAiTurn, playRound, nextRound, dismissRoundResult, returnToLobby, gameAlert, setGameAlert, showAlert, handlePvpEnd };
}
