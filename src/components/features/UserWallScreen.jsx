import React from 'react';
import { useGameContext } from '../../context/GameContext';
import { PackageOpen, Users, Swords, ChevronRight, CheckCircle2, Lock, Coins, Sparkles, Play, Trophy, Shield, Target, Wifi, User, ChevronLeft, Send, MessageSquare, Mail, History } from 'lucide-react';
import { Card, AnimatedHeroPlayer, ShareModal } from '../ui/SharedComponents';
import { QRCodeSVG } from 'qrcode.react';

export function UserWallScreen() {
  const { setGameState, setUserWallTarget, userWallTarget, currentUser, setSocialWallTab, socialWallTab, setMobileSubTab, mobileSubTab, loadingWall, loadingGlobalPosts, wallData, setPreviewAvatar, customAvatar, setPreviewBanner, customBanner, setIsCustomizingProfile, setActivePrivatePartner, setChatTab, setShowGiftModal, setShowGiftCardModal, setSelectedGiftCard, setGiftCardSearch, setGiftCardFilterRarity, squad, onlineUsers, sendChallengeInvite, showAlert, socialSearchQuery, setSocialSearchQuery, leaderboardData, newPostText, handleComposerChange, showMentionDropdown, getAutocompleteSuggestions, insertMention, insertEmoji, handleCreatePost, globalPosts, userWallPosts, renderPostText, handleLikePost, handleCreateComment, commentInputs, setCommentInputs } = useGameContext();

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col mt-2 sm:mt-8 animate-fade-in px-2 sm:px-4 text-white">
          {/* Header */}
          <div className="flex items-center justify-between w-full mb-3">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <button className="w-8 h-8 sm:w-auto sm:h-auto sm:px-4 sm:py-2 bg-slate-800/50 hover:bg-slate-700/80 transition-colors flex items-center justify-center gap-1.5 cursor-pointer text-[10px] sm:text-xs font-black uppercase tracking-wider rounded-full border border-white/10 shrink-0" onClick={() => {
        playFx('click');
        setGameState('lobby');
        setUserWallTarget(null);
      }}>
                <span>←</span>
                <span className="hidden sm:inline">Sảnh</span>
              </button>
              {userWallTarget && userWallTarget !== currentUser && <button className="w-8 h-8 sm:w-auto sm:h-auto sm:px-4 sm:py-2 bg-indigo-900/40 hover:bg-indigo-800/60 transition-colors flex items-center justify-center gap-1.5 cursor-pointer text-[10px] sm:text-xs font-black uppercase tracking-wider rounded-full border border-indigo-500/20 shrink-0" onClick={() => {
        playFx('click');
        setUserWallTarget(currentUser);
        setSocialWallTab('owner');
      }} title="Tường Của Tôi">
                  <span>👤</span>
                  <span className="hidden sm:inline">Của Tôi</span>
                </button>}
            </div>
            
            <h2 className="text-sm sm:text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400 uppercase tracking-widest text-center truncate px-2">
              🐦 Mạng Xã Hội
            </h2>
            
            <button className="w-8 h-8 sm:w-auto sm:h-auto sm:px-4 sm:py-2 bg-cyan-900/40 hover:bg-cyan-800/60 transition-colors flex items-center justify-center gap-1.5 cursor-pointer text-[10px] sm:text-xs font-black uppercase tracking-wider rounded-full border border-cyan-500/20 shrink-0 text-cyan-300" onClick={() => {
      playFx('click');
      setUserWallTarget(currentUser);
      setSocialWallTab('global');
    }} title="Khám Phá">
              <span>🌍</span>
              <span className="hidden sm:inline">Khám Phá</span>
            </button>
          </div>

          {/* TAB FILTER — Minimalist Underline Style */}
          {userWallTarget && <div className="flex justify-center gap-6 w-full max-w-md mx-auto mb-4 border-b border-white/10">
              <button onClick={() => {
      playFx('click');
      setSocialWallTab('global');
    }} className={`pb-2 text-[10px] sm:text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 border-b-2 ${socialWallTab === 'global' ? 'border-cyan-400 text-cyan-400' : 'border-transparent text-gray-500 hover:text-gray-300'}`}>
                🌍 Khám Phá
              </button>
              <button onClick={() => {
      playFx('click');
      setSocialWallTab('owner');
    }} className={`pb-2 text-xs sm:text-sm font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 border-b-2 ${socialWallTab === 'owner' ? 'border-fuchsia-400 text-fuchsia-400' : 'border-transparent text-gray-500 hover:text-gray-300'}`}>
                👤 {userWallTarget === currentUser ? 'Của Tôi' : userWallTarget}
              </button>
            </div>}

          {/* Mobile sub-tabs — Slimmer Pill Style */}
          {userWallTarget && <div className="flex lg:hidden gap-1 w-full bg-slate-900/40 rounded-lg p-0.5 border border-white/5 mb-4">
              <button onClick={() => {
      playFx('click');
      setMobileSubTab('feed');
    }} className={`flex-1 py-1.5 rounded-md text-[11px] sm:text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1 ${mobileSubTab === 'feed' ? 'bg-white/15 text-white' : 'text-gray-500 hover:text-gray-300'}`}>
                📰 Bản tin
              </button>
              <button onClick={() => {
      playFx('click');
      setMobileSubTab('search');
    }} className={`flex-1 py-1.5 rounded-md text-[11px] sm:text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1 ${mobileSubTab === 'search' ? 'bg-white/15 text-white' : 'text-gray-500 hover:text-gray-300'}`}>
                🔍 Tìm HLV
              </button>
              <button onClick={() => {
      playFx('click');
      setMobileSubTab('profile');
    }} className={`flex-1 py-1.5 rounded-md text-[11px] sm:text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1 ${mobileSubTab === 'profile' ? 'bg-white/15 text-white' : 'text-gray-500 hover:text-gray-300'}`}>
                👤 Cá nhân
              </button>
            </div>}

          {loadingWall || loadingGlobalPosts ? <div className="glass-panel w-full rounded-2xl p-12 sm:p-20 flex flex-col items-center justify-center gap-4 border border-white/10">
              <div className="w-10 h-10 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
              <div className="text-cyan-400 font-extrabold tracking-widest text-[10px] uppercase animate-pulse">Đang tải dữ liệu mạng xã hội...</div>
            </div> : !userWallTarget ? <div className="glass-panel w-full rounded-2xl p-8 sm:p-16 flex flex-col items-center justify-center text-center gap-4 border border-white/10">
              <div className="text-3xl mb-1">🐦</div>
              <div className="text-cyan-400 text-base font-black uppercase mb-1">Mạng Xã Hội HLV</div>
              <p className="text-gray-400 text-xs max-w-xs mb-1">Chọn một HLV để xem tường cá nhân hoặc nhấn Khám Phá bên dưới để xem feed toàn cầu.</p>
              <button className="btn !bg-gradient-to-r !from-cyan-700 !to-indigo-700 hover:!from-cyan-600 hover:!to-indigo-600 text-xs font-black uppercase tracking-wider !py-2.5 !px-6 rounded-full border border-cyan-500/30 shadow-md cursor-pointer transition-all hover:scale-105" onClick={() => {
      playFx('click');
      setUserWallTarget(currentUser);
      setSocialWallTab('global');
    }}>
                🌍 Khám Phá Feed Toàn Cầu
              </button>
            </div> : <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 w-full items-start">
              
              {/* LEFT PROFILE CARD (5/12 cols): Cover, stats, and fast actions */}
              <div className={`lg:col-span-5 flex-col gap-4 lg:flex w-full ${mobileSubTab === 'profile' || mobileSubTab === 'search' ? 'flex' : 'hidden'}`}>
                <div className={`glass-panel rounded-2xl border border-white/10 shadow-2xl overflow-hidden bg-slate-950/40 relative flex flex-col ${mobileSubTab === 'profile' ? 'flex' : 'hidden lg:flex'}`}>
                  {/* Premium Cover Banner */}
                  <div className="h-16 sm:h-32 relative overflow-hidden flex items-center justify-center" style={{
          background: wallData.customBanner || 'linear-gradient(to right, #164e63, #1e1b4b, #4a044e)'
        }}>
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-black/20 pointer-events-none"></div>
                    <span className="text-white/10 font-black italic tracking-tighter text-2xl sm:text-4xl uppercase select-none pointer-events-none transform -rotate-6">THE BONG DA</span>
                    {userWallTarget === currentUser && <button className="absolute top-2 right-2 bg-black/50 backdrop-blur-sm text-white text-xs font-bold px-2 py-1 rounded-lg transition-opacity flex items-center gap-1 border border-white/20 hover:bg-black/70" onClick={() => {
            playFx('click');
            setPreviewAvatar(customAvatar);
            setPreviewBanner(customBanner);
            setIsCustomizingProfile(true);
          }}>✏️ Đổi Banner</button>}
                  </div>

                  {/* Profile Overlay details */}
                  <div className="px-4 pb-4 pt-1 sm:px-6 sm:pb-6 flex flex-col items-center text-center relative">
                    {/* Avatar circle overlapping banner */}
                    <div className="relative z-10 -mt-8 sm:-mt-10">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center border-4 border-slate-950 shadow-2xl select-none" style={{
              background: wallData.customAvatar || getAvatarGradient(userWallTarget),
              boxShadow: `0 0 20px rgba(${userWallTarget === currentUser ? '244,63,94' : '59,130,246'}, 0.35)`
            }}>
                        <span className="text-2xl sm:text-3xl font-black text-white">{(userWallTarget || '').charAt(0).toUpperCase()}</span>
                      </div>
                      <span className="absolute -bottom-1 -right-1 bg-gradient-to-r from-yellow-500 to-amber-600 text-slate-950 text-[9px] font-black px-1.5 py-0.5 rounded-full border border-slate-950 shadow-md">
                        Lv.{wallData.level || 1}
                      </span>
                      {userWallTarget === currentUser && <button className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity" onClick={() => {
              playFx('click');
              setPreviewAvatar(customAvatar);
              setPreviewBanner(customBanner);
              setIsCustomizingProfile(true);
            }}><span className="text-base">✏️</span></button>}
                    </div>

                    <h3 className="text-lg sm:text-xl font-black text-white mt-2 uppercase tracking-wider flex items-center gap-1.5 justify-center">
                      {userWallTarget}
                      {userWallTarget === currentUser && <span className="text-[8px] bg-fuchsia-950/40 text-fuchsia-400 border border-fuchsia-500/20 px-1.5 py-0.5 rounded-full uppercase tracking-wider font-extrabold">BẠN</span>}
                    </h3>
                    
                    {/* Squad OVR badge */}
                    <div className="mt-1 mb-3 flex items-center gap-1">
                      {(() => {
              const ovrVal = wallData.squad ? Math.round(wallData.squad.reduce((acc, card) => acc + Math.max(card.stats.attack, card.stats.defense, card.stats.control), 0) / 11) : 0;
              return <span className="text-[10px] px-2.5 py-0.5 bg-cyan-950/40 text-cyan-400 border border-cyan-500/20 font-black rounded-full uppercase tracking-wider">
                            🔥 {ovrVal || 0} OVR Đội Hình
                          </span>;
            })()}
                    </div>

                    {/* XP Progress */}
                    <div className="w-full mb-4">
                      <div className="flex justify-between text-[8px] font-bold text-gray-400 uppercase tracking-widest mb-1 px-1">
                        <span>Cấp Độ HLV</span>
                        <span>{wallData.xp || 0} / {(wallData.level || 1) * 100} XP</span>
                      </div>
                      <div className="w-full bg-black/60 rounded-full h-1.5 border border-white/5 overflow-hidden relative">
                        <div className="bg-gradient-to-r from-cyan-400 via-indigo-500 to-purple-500 h-full rounded-full transition-all duration-1000" style={{
                width: `${Math.min(100, (wallData.xp || 0) / ((wallData.level || 1) * 100) * 100)}%`
              }}></div>
                      </div>
                    </div>

                    {/* Battle Stats Dashboard */}
                    <div className="w-full bg-black/30 border border-white/5 rounded-xl p-3 flex flex-col gap-2 mb-4 text-center">
                      <div className="text-[9px] font-black text-gray-500 uppercase tracking-widest border-b border-white/5 pb-1.5">Thống Kê Chiến Tích 🏆</div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="bg-slate-900/50 border border-white/5 p-1.5 rounded-lg">
                          <div className="text-[8px] text-gray-400 font-bold uppercase">Đã đấu</div>
                          <div className="text-sm font-black text-white">{wallData.stats?.played || 0}</div>
                        </div>
                        <div className="bg-green-950/20 border border-green-500/10 p-1.5 rounded-lg">
                          <div className="text-[8px] text-green-400 font-bold uppercase">Thắng</div>
                          <div className="text-sm font-black text-green-400">{wallData.stats?.wins || 0}</div>
                        </div>
                        <div className="bg-yellow-950/20 border border-yellow-500/10 p-1.5 rounded-lg">
                          <div className="text-[8px] text-yellow-400 font-bold uppercase">Hòa</div>
                          <div className="text-sm font-black text-yellow-400">{wallData.stats?.draws || 0}</div>
                        </div>
                        <div className="bg-red-950/20 border border-red-500/10 p-1.5 rounded-lg">
                          <div className="text-[8px] text-red-400 font-bold uppercase">Thua</div>
                          <div className="text-sm font-black text-red-400">{wallData.stats?.losses || 0}</div>
                        </div>
                      </div>
                    </div>

                    {/* Quick Interactive Actions */}
                    <div className="w-full mt-auto">
                      {userWallTarget !== currentUser ? <div className="grid grid-cols-3 gap-2">
                          <button className="btn !bg-violet-600 hover:!bg-violet-500 flex items-center justify-center gap-1 !py-3 font-bold text-[9px] sm:text-xs tracking-wider rounded-xl transition-all active:scale-[0.98] cursor-pointer shadow-lg shadow-violet-900/30" onClick={() => {
                playFx('click');
                setGameState('lobby');
                setActivePrivatePartner(userWallTarget);
                setChatTab('private');
                setUserWallTarget(null);
                setTimeout(() => {
                  const el = document.getElementById('lobby-chat-panel');
                  if (el) el.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center'
                  });
                  const inputEl = document.getElementById('private-chat-input');
                  if (inputEl) inputEl.focus();
                }, 300);
              }}>
                            <MessageSquare size={12} /> Chat
                          </button>

                          <button className="btn !bg-yellow-600 hover:!bg-yellow-500 flex items-center justify-center gap-1 !py-3 font-bold text-[9px] sm:text-xs tracking-wider rounded-xl transition-all active:scale-[0.98] cursor-pointer shadow-lg shadow-yellow-900/30" onClick={() => {
                playFx('click');
                setShowGiftModal(true);
              }}>
                            🪙 Tặng Xu
                          </button>

                          <button className="btn !bg-emerald-600 hover:!bg-emerald-500 flex items-center justify-center gap-1 !py-3 font-bold text-[9px] sm:text-xs tracking-wider rounded-xl transition-all active:scale-[0.98] cursor-pointer shadow-lg shadow-emerald-900/30" onClick={() => {
                playFx('click');
                setShowGiftCardModal(true);
                setSelectedGiftCard(null);
                setGiftCardSearch("");
                setGiftCardFilterRarity("all");
              }}>
                            🎁 Tặng Thẻ
                          </button>
                          
                          <button className={`btn col-span-3 flex items-center justify-center gap-2 !py-3 font-black text-xs sm:text-sm tracking-wider rounded-xl transition-all active:scale-[0.98] cursor-pointer shadow-lg ${squad.length < 11 ? 'opacity-40 !bg-gray-700 cursor-not-allowed text-gray-400' : 'bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white shadow-red-900/30'}`} disabled={squad.length < 11} onClick={() => {
                if (squad.length === 11) {
                  const activeObj = onlineUsers.find(o => o.username === userWallTarget);
                  if (activeObj) {
                    sendChallengeInvite(activeObj.username, activeObj.peerId);
                    setGameState('lobby');
                    setUserWallTarget(null);
                  } else {
                    showAlert("Ngoại Tuyến ⚪", "HLV này đã ngoại tuyến hoặc không khả dụng để thách đấu pvp trực tiếp.");
                  }
                }
              }}>
                            <Swords size={16} /> Thách Đấu Ngay
                          </button>
                        </div> : <button className="btn !bg-indigo-600 hover:!bg-indigo-500 w-full flex items-center justify-center gap-2 !py-2.5 font-bold text-xs tracking-wider rounded-xl transition-all active:scale-[0.98] cursor-pointer shadow-lg hidden sm:flex" onClick={() => {
              playFx('click');
              setGameState('profile');
            }}>
                          Cấu Hình PIN & Email ⚙️
                        </button>}
                    </div>
                  </div>
                </div>

                {/* HLV Search & Discovery Directory */}
                <div className={`glass-panel rounded-2xl border border-white/10 p-4 shadow-2xl bg-slate-950/40  flex-col gap-4 w-full ${mobileSubTab === 'search' ? 'flex' : 'hidden lg:flex'}`}>
                  <div>
                    <h4 className="text-xs font-black text-cyan-400 uppercase tracking-widest flex items-center gap-1.5">
                      <span>🔍</span> Tìm Kiếm & Khám Phá HLV
                    </h4>
                    <p className="text-[10px] text-gray-500 font-bold mt-1">Tìm kiếm bạn bè, xem đội hình, chỉ số & thách đấu</p>
                  </div>

                  {/* Search Input */}
                  <div className="relative w-full">
                    <input type="text" placeholder="Nhập tên HLV cần tìm..." value={socialSearchQuery} onChange={e => setSocialSearchQuery(e.target.value)} className="w-full bg-black/40 border border-white/5 focus:border-cyan-500/50 rounded-xl px-3 py-2 text-xs font-semibold placeholder-gray-500 focus:outline-none transition-colors text-white" />
                    <span className="absolute left-3 top-[10px] text-[10px] text-gray-500 pointer-events-none">🔍</span>
                    {socialSearchQuery && <button onClick={() => setSocialSearchQuery("")} className="absolute right-3 top-[8px] text-gray-500 hover:text-white text-xs font-bold transition-colors">
                        ✕
                      </button>}
                  </div>

                  {/* Search Results / Active Directory */}
                  <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto pr-1 hide-scrollbar">
                    {(() => {
            const allCoachesMap = new Map();
            leaderboardData.forEach(u => {
              if (u.username) {
                allCoachesMap.set(u.username, {
                  username: u.username,
                  level: u.level || 1,
                  ovr: u.ovr || 0,
                  isOnline: false
                });
              }
            });
            onlineUsers.forEach(u => {
              if (u.username) {
                allCoachesMap.set(u.username, {
                  username: u.username,
                  level: u.level || 1,
                  ovr: u.rating || 0,
                  isOnline: true
                });
              }
            });
            let coachesList = Array.from(allCoachesMap.values()).filter(c => c.username !== currentUser);
            if (socialSearchQuery.trim()) {
              coachesList = coachesList.filter(c => c.username.toLowerCase().includes(socialSearchQuery.toLowerCase().trim()));
            } else {
              coachesList.sort((a, b) => {
                if (a.isOnline !== b.isOnline) return b.isOnline ? 1 : -1;
                return b.level - a.level;
              });
              coachesList = coachesList.slice(0, 4);
            }
            if (coachesList.length === 0) {
              return <div className="text-center py-6 text-gray-500 text-[10px] italic font-semibold">
                            Không tìm thấy HLV nào khớp 📭
                          </div>;
            }
            return coachesList.map(coach => {
              const tier = getPlayerTier(coach.level);
              return <div key={coach.username} onClick={() => {
                playFx('click');
                setUserWallTarget(coach.username);
                setSocialWallTab('owner');
                setMobileSubTab('feed'); // Quay lại feed để xem tường HLV
                setTimeout(() => {
                  const el = document.getElementById('social-wall-panel');
                  if (el) el.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                  });
                }, 100);
              }} className={`p-2 rounded-xl border flex items-center justify-between gap-3 hover:scale-[1.01] hover:border-cyan-500/30 hover:bg-cyan-950/10 cursor-pointer transition-all duration-200 ${userWallTarget === coach.username ? 'bg-cyan-950/20 border-cyan-500/40 ring-1 ring-cyan-500/20' : 'bg-black/20 border-white/5'}`}>
                            <div className="flex items-center gap-2 min-w-0">
                              <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black text-white shrink-0 border border-white/10" style={{
                    background: getAvatarGradient(coach.username)
                  }}>
                                {(coach.username || '').charAt(0).toUpperCase()}
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <span className="font-extrabold text-xs text-white truncate">{coach.username}</span>
                                  <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${coach.isOnline ? 'bg-green-500 shadow-[0_0_6px_rgba(34,197,94,0.6)] animate-pulse' : 'bg-gray-600'}`}></span>
                                </div>
                                <div className="flex items-center gap-1 mt-0.5">
                                  <span className="text-[8px] text-gray-400 font-bold">Cấp {coach.level}</span>
                                  <span className={`text-[7px] font-black uppercase px-1 rounded border shrink-0 ${tier.color}`}>
                                    {tier.icon} {tier.name}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="text-right shrink-0">
                              <span className="text-[9px] bg-cyan-900/30 text-cyan-400 border border-cyan-500/10 px-1.5 py-0.5 rounded font-black uppercase tracking-wider">{coach.ovr || 80} OVR</span>
                            </div>
                          </div>;
            });
          })()}
                  </div>
                </div>
              </div>

              {/* RIGHT FEED PANEL (7/12 cols): Composer and post feed timeline */}
              <div className={`lg:col-span-7 flex-col gap-4 h-full max-h-[85vh] overflow-y-auto pr-1 hide-scrollbar w-full ${mobileSubTab === 'feed' ? 'flex' : 'hidden lg:flex'}`}>
                
                {/* 1. Composer (Only for the wall owner, when not on global feed tab) */}
                {userWallTarget === currentUser && socialWallTab !== 'global' && <div className="glass-panel rounded-2xl p-3 border border-white/10 shadow-xl bg-slate-950/40 flex gap-2 sm:gap-3">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full shrink-0 flex items-center justify-center font-black border border-white/10 select-none text-[11px] sm:text-xs" style={{
          background: getAvatarGradient(currentUser)
        }}>
                      {(currentUser || '').charAt(0).toUpperCase()}
                    </div>
                    
                    <div className="flex-1 flex flex-col gap-2">
                      <textarea value={newPostText} onChange={handleComposerChange} placeholder="Chia sẻ đội hình, chiến thuật... ⚽" maxLength={280} rows={2} className="w-full bg-black/40 border border-white/5 focus:border-cyan-500/50 rounded-xl p-2 text-sm sm:text-[15px] font-semibold placeholder-gray-500 focus:outline-none resize-none transition-colors leading-relaxed text-white" />

                      {/* Mention Autocomplete Dropdown */}
                      {showMentionDropdown && <div className="relative">
                          <div className="absolute top-0 left-0 z-[60] bg-slate-900/95 border border-white/10 rounded-xl p-1.5 flex flex-col gap-1 w-44 shadow-2xl animate-fade-in">
                            <div className="text-[8px] font-black text-gray-500 uppercase tracking-widest px-1.5 py-0.5 border-b border-white/5">Nhắc tên HLV:</div>
                            {getAutocompleteSuggestions().map(name => <button key={name} type="button" onClick={() => insertMention(name)} className="w-full text-left px-2 py-1 rounded-lg text-xs font-bold text-gray-300 hover:text-white hover:bg-white/5 transition-all flex items-center gap-1.5 cursor-pointer">
                                👤 @{name}
                              </button>)}
                            {getAutocompleteSuggestions().length === 0 && <span className="text-[9px] text-gray-500 italic px-2 py-1">Không tìm thấy HLV</span>}
                          </div>
                        </div>}

                      {/* Emoji & Quick Toolbar */}
                      <div className="flex items-center gap-1 flex-wrap pt-1 border-t border-white/5">
                        {['⚽', '🏆', '👑', '🔥', '🎯', '🤝', '💬', '🚀'].map(emoji => <button key={emoji} type="button" onClick={() => insertEmoji(emoji)} className="w-5 h-5 sm:w-6 sm:h-6 rounded hover:bg-white/10 text-[10px] sm:text-xs flex items-center justify-center transition-all hover:scale-110 cursor-pointer">
                            {emoji}
                          </button>)}
                      </div>
                      
                      <div className="flex items-center justify-between mt-1">
                        <span className={`text-[9px] font-bold tracking-wider ${newPostText.length > 250 ? 'text-red-400' : newPostText.length > 200 ? 'text-yellow-400' : 'text-gray-500'}`}>
                          {newPostText.length} / 280
                        </span>

                        <button onClick={handleCreatePost} disabled={!newPostText.trim() || newPostText.length > 280} className={`btn !py-1 !px-3 text-[9px] sm:text-[10px] font-black uppercase tracking-wider rounded-full shadow-md transition-all active:scale-95 cursor-pointer ${!newPostText.trim() || newPostText.length > 280 ? 'opacity-40 !bg-gray-800 cursor-not-allowed text-gray-500 shadow-none' : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-cyan-900/30'}`}>
                          Đăng Bài
                        </button>
                      </div>
                    </div>
                  </div>}

                {/* 2. Composer for global tab (everyone can post globally) */}
                {socialWallTab === 'global' && <div className="glass-panel rounded-2xl p-3 border border-white/10 shadow-xl bg-slate-950/40 flex gap-2 sm:gap-3">
                    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full shrink-0 flex items-center justify-center font-black border border-white/10 select-none text-[10px] sm:text-xs" style={{
          background: getAvatarGradient(currentUser)
        }}>
                      {(currentUser || '').charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 flex flex-col gap-2">
                       <textarea value={newPostText} onChange={handleComposerChange} placeholder="Chia sẻ với cộng đồng HLV toàn cầu... 🌍" maxLength={280} rows={2} className="w-full bg-black/40 border border-white/5 focus:border-cyan-500/50 rounded-xl p-2 text-sm font-semibold placeholder-gray-500 focus:outline-none resize-none transition-colors leading-relaxed text-white" />

                      {/* Mention Autocomplete Dropdown */}
                      {showMentionDropdown && <div className="relative">
                          <div className="absolute top-0 left-0 z-[60] bg-slate-900/95 border border-white/10 rounded-xl p-1.5 flex flex-col gap-1 w-44 shadow-2xl animate-fade-in">
                            <div className="text-[8px] font-black text-gray-500 uppercase tracking-widest px-1.5 py-0.5 border-b border-white/5">Nhắc tên HLV:</div>
                            {getAutocompleteSuggestions().map(name => <button key={name} type="button" onClick={() => insertMention(name)} className="w-full text-left px-2 py-1 rounded-lg text-xs font-bold text-gray-300 hover:text-white hover:bg-white/5 transition-all flex items-center gap-1.5 cursor-pointer">
                                👤 @{name}
                              </button>)}
                            {getAutocompleteSuggestions().length === 0 && <span className="text-[9px] text-gray-500 italic px-2 py-1">Không tìm thấy HLV</span>}
                          </div>
                        </div>}

                      {/* Emoji & Quick Toolbar */}
                      <div className="flex items-center gap-1 flex-wrap pt-1 border-t border-white/5">
                        {['⚽', '🏆', '👑', '🔥', '🎯', '🤝', '💬', '🚀'].map(emoji => <button key={emoji} type="button" onClick={() => insertEmoji(emoji)} className="w-5 h-5 sm:w-6 sm:h-6 rounded hover:bg-white/10 text-[10px] sm:text-xs flex items-center justify-center transition-all hover:scale-110 cursor-pointer">
                            {emoji}
                          </button>)}
                      </div>
                      
                      <div className="flex items-center justify-between mt-1">
                        <span className={`text-[9px] font-bold tracking-wider ${newPostText.length > 250 ? 'text-red-400' : newPostText.length > 200 ? 'text-yellow-400' : 'text-gray-500'}`}>{newPostText.length} / 280</span>
                        <button onClick={handleCreatePost} disabled={!newPostText.trim() || newPostText.length > 280} className={`btn !py-1 !px-3 text-[9px] sm:text-[10px] font-black uppercase tracking-wider rounded-full shadow-md transition-all active:scale-95 cursor-pointer ${!newPostText.trim() || newPostText.length > 280 ? 'opacity-40 !bg-gray-800 cursor-not-allowed text-gray-500 shadow-none' : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-cyan-900/30'}`}>
                          Đăng Bài
                        </button>
                      </div>
                    </div>
                  </div>}

                {/* 2b. Timeline Feed */}
                <div className="flex flex-col gap-3">
                  <div className="text-[9px] font-black text-gray-500 uppercase tracking-widest border-b border-white/5 pb-1.5 px-2 flex justify-between items-center mt-2">
                    {socialWallTab === 'global' ? <><span>🌍 Khám Phá — Feed</span><span>{globalPosts.length} bài</span></> : <><span>👤 Bài Đăng Của {userWallTarget}</span><span>{userWallPosts.length} bài</span></>}
                  </div>

                  {(() => {
          const displayPosts = socialWallTab === 'global' ? globalPosts : userWallPosts;
          if (displayPosts.length === 0) return <div className="glass-panel rounded-xl p-6 text-center border border-white/5 bg-slate-900/10">
                        <div className="text-xl mb-1">{socialWallTab === 'global' ? '🌍' : '📭'}</div>
                        <div className="text-[10px] text-gray-400 font-bold uppercase mb-1">{socialWallTab === 'global' ? 'Feed toàn cầu trống' : 'HLV chưa đăng bài'}</div>
                      </div>;
          return displayPosts.map(post => {
            const likesCount = post.likes ? Object.keys(post.likes).length : 0;
            const hasLiked = post.likes ? !!post.likes[currentUser] : false;
            const commentsList = post.comments ? Object.keys(post.comments).map(k => ({
              id: k,
              ...post.comments[k]
            })).sort((a, b) => a.timestamp - b.timestamp) : [];
            const isMyPost = post.author === currentUser;
            return <div key={post.id} className={`glass-panel rounded-xl p-3 sm:p-5 flex flex-col gap-3 hover:border-white/15 transition-all duration-300 shadow-sm ${isMyPost ? 'border border-cyan-500/20 bg-cyan-950/10' : 'border border-white/5 bg-slate-950/20'}`}>
                          <div className="flex items-center gap-2.5">
                            <button className="w-9 h-9 sm:w-10 sm:h-10 rounded-full shrink-0 flex items-center justify-center text-xs sm:text-sm font-black border border-white/5 select-none cursor-pointer hover:opacity-80 transition-opacity" style={{
                  background: getAvatarGradient(post.author)
                }} onClick={() => {
                  if (post.author !== userWallTarget) {
                    setUserWallTarget(post.author);
                    setSocialWallTab('owner');
                  }
                }} title={`Xem tường của ${post.author}`}>
                              {(post.author || '').charAt(0).toUpperCase()}
                            </button>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <button className="font-extrabold text-[13px] sm:text-sm text-white hover:text-cyan-400 transition-colors cursor-pointer" onClick={() => {
                      setUserWallTarget(post.author);
                      setSocialWallTab('owner');
                    }}>
                                  {post.author}
                                </button>
                                <span className="text-[8px] sm:text-[9px] bg-white/10 text-gray-400 px-1.5 py-0.5 rounded border border-white/10 font-bold shrink-0">Lv.{post.authorLevel || 1}</span>
                                {isMyPost && <span className="text-[8px] sm:text-[9px] bg-cyan-950/40 text-cyan-400 border border-cyan-500/20 px-1.5 py-0.5 rounded font-extrabold">Bạn</span>}
                              </div>
                              <span className="text-[9px] sm:text-[10px] text-gray-500 font-bold font-mono block mt-0.5">{getRelativeTime(post.timestamp)}</span>
                            </div>
                          </div>

                          <p className="text-[14px] sm:text-[15px] md:text-[16px] text-gray-100 font-medium leading-relaxed whitespace-pre-wrap px-0.5">
                            {renderPostText(post.content)}
                          </p>

                          <div className="flex items-center gap-4 border-t border-b border-white/5 py-2 px-0.5 mt-1">
                            <button onClick={() => handleLikePost(post.id)} className={`flex items-center gap-1.5 font-bold transition-all active:scale-75 hover:opacity-80 cursor-pointer ${hasLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-400'}`}>
                              <span className="text-xs sm:text-sm select-none">{hasLiked ? '❤️' : '🤍'}</span>
                              <span className="text-[10px] sm:text-[11px] font-extrabold">{likesCount} Thích</span>
                            </button>
                            <div className="flex items-center gap-1.5 font-bold text-gray-500">
                              <span className="text-xs sm:text-sm select-none">💬</span>
                              <span className="text-[10px] sm:text-[11px] font-extrabold">{commentsList.length} Bình luận</span>
                            </div>
                          </div>

                          {commentsList.length > 0 && <div className="flex flex-col gap-2.5 pl-3 sm:pl-4 border-l border-white/10 mt-1">
                              {commentsList.map(comm => <div key={comm.id} className="flex gap-2 items-start bg-black/10 p-2.5 rounded-lg border border-white/5 animate-fade-in">
                                  <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full shrink-0 flex items-center justify-center text-[9px] sm:text-[10px] font-black border border-white/5 select-none" style={{
                    background: getAvatarGradient(comm.author)
                  }}>
                                    {(comm.author || '').charAt(0).toUpperCase()}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                      <span className="font-extrabold text-[11px] sm:text-xs text-white">{comm.author}</span>
                                      <span className="text-[8px] sm:text-[9px] text-gray-500 font-bold font-mono ml-auto">{getRelativeTime(comm.timestamp)}</span>
                                    </div>
                                    <p className="text-xs sm:text-[13px] text-gray-200 font-medium leading-relaxed mt-0.5 whitespace-pre-wrap">{renderPostText(comm.content)}</p>
                                  </div>
                                </div>)}
                            </div>}

                          <div className="flex gap-2 items-center mt-1 pt-1">
                            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full shrink-0 flex items-center justify-center text-[9px] sm:text-[10px] font-black border border-white/5 select-none" style={{
                  background: getAvatarGradient(currentUser)
                }}>
                              {(currentUser || '').charAt(0).toUpperCase()}
                            </div>
                            <form onSubmit={e => {
                  e.preventDefault();
                  handleCreateComment(post.id);
                }} className="flex-1 flex gap-2">
                              <input type="text" value={commentInputs[post.id] || ""} onChange={e => setCommentInputs(prev => ({
                    ...prev,
                    [post.id]: e.target.value
                  }))} placeholder="Bình luận... ✍️" maxLength={200} className="flex-1 bg-black/40 border border-white/5 focus:border-cyan-500/50 rounded-full px-3 py-1.5 text-xs sm:text-[13px] font-semibold focus:outline-none placeholder-gray-500 transition-colors text-white" />
                              <button type="submit" disabled={!(commentInputs[post.id] || "").trim()} className={`btn !py-2 !px-4 text-xs font-black uppercase tracking-wider rounded-full shrink-0 cursor-pointer ${!(commentInputs[post.id] || "").trim() ? 'opacity-40 !bg-gray-800 text-gray-500' : 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-md'}`}>
                                Gửi
                              </button>
                            </form>
                          </div>
                        </div>;
          });
        })()}
                </div>
              </div>

            </div>}
        </div>
  );
}
