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

export function LobbyScreen() {
  const { collection, coins, freePacks, setOpenedCards, setGameState, showAlert, squad, setShowCheckInModal, chatTab, setChatTab, unreadPartners, onlineUsers, chatMessages, currentUser, setUserWallTarget, chatInput, sendChatMessage, setChatInput, activePrivatePartner, setActivePrivatePartner, privateMessages, sendPrivateMessage, privateChatInput, setPrivateChatInput, myPrivateChats, sendChallengeInvite, sendRandomChallengeInvite, showPvpJoinModal, setShowPvpJoinModal, pvpJoinInput, setPvpJoinInput, setActivePvpTarget } = useGameContext();

  return (
    (() => {
  const [randomCartoon, setRandomCartoon] = React.useState(1);
  React.useEffect(() => {
    setRandomCartoon(Math.floor(Math.random() * 5) + 1);
  }, []);

  const uniqueCards = new Set(collection.map(c => c.id)).size;
  const totalCards = playersData.length;
  const completionPercent = Math.round(uniqueCards / totalCards * 100) || 0;
  return <div className="flex flex-col lg:flex-row items-stretch justify-between min-h-[80vh] w-full max-w-full gap-8 px-4 lg:pl-0 lg:pr-0 pt-12 animate-fade-in relative z-10">
                  
                  {/* LEFT COLUMN: Main Game Lobby */}
                  <div className="flex-1 flex flex-col items-center justify-center max-w-5xl mx-auto w-full">
                    
                    {/* Hero Section */}
                    <div className="relative flex flex-col items-center mb-12 sm:mb-16">
                      {/* Decorative glow removed for GPU perf - using radial bg on parent instead */}
                      
                      <div className="relative mb-4 group cursor-pointer" onClick={() => setRandomCartoon(Math.floor(Math.random() * 5) + 1)}>
                         <img 
                            src={`/cartoons/${randomCartoon}.png`} 
                            alt="Cartoon Player" 
                            className="w-[180px] h-[180px] object-cover rounded-full mix-blend-screen drop-shadow-[0_0_40px_rgba(251,191,36,0.8)] hero-cartoon-anim" 
                         />
                      </div>
                      
                      <h1 className="text-6xl md:text-8xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-blue-100 to-blue-400 drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)] mb-2 uppercase text-center leading-none pr-4">
                        World Cup
                      </h1>
                      <h2 className="text-3xl md:text-5xl font-black italic tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-500 to-cyan-500 drop-shadow-[0_5px_15px_rgba(0,0,0,0.9)] mb-8 uppercase text-center pr-2">
                        2026 Ultimate
                      </h2>
                      
                      <div className="glass-panel px-8 py-4 rounded-full flex gap-8 mb-4 mt-2">
                        <div className="flex items-center gap-3">
                          <Coins className="text-yellow-400" size={28} /> 
                          <span className="text-2xl font-black text-white drop-shadow-md">{coins} Xu</span>
                        </div>
                        <div className="w-[1px] bg-white/20"></div>
                        <div className="flex items-center gap-3">
                          <span className="text-2xl font-black text-cyan-400 drop-shadow-md">Tiến độ: {completionPercent}%</span>
                        </div>
                      </div>
                    </div>

                    {/* Glass Menu */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 w-full z-20">
                      <button className="glass-menu-card p-6 rounded-3xl flex flex-col items-center group cursor-pointer" onClick={() => {
          if (freePacks > 0 || coins >= 100) {
            setOpenedCards([]);
            setGameState('packOpening');
          } else {
            showAlert("🪙 Thiếu Xu!", "Bạn không đủ Xu để mở gói thẻ. Hãy đi nhận quà thăng cấp hoặc làm nhiệm vụ nhé!");
          }
        }}>
                        <PackageOpen size={48} className="text-fuchsia-400 mb-3 group-hover:scale-110 group-hover:-rotate-6 transition-transform duration-300 drop-shadow-[0_0_15px_rgba(232,121,249,0.6)]" />
                        <h3 className="text-lg sm:text-xl font-black italic uppercase tracking-wider mb-1 text-white">Mở Gói Thẻ</h3>
                        <p className="text-gray-300 text-center font-medium text-xs">
                          {freePacks > 0 ? `Miễn phí: ${freePacks} Gói 🎁` : '100 Xu • Nhận siêu sao.'}
                        </p>
                      </button>

                      <button className={`glass-menu-card p-6 rounded-3xl flex flex-col items-center group cursor-pointer ${collection.length === 0 ? 'opacity-50 grayscale' : ''}`} onClick={() => collection.length > 0 && setGameState('teamBuilder')}>
                        <Users size={48} className="text-blue-400 mb-3 group-hover:scale-110 transition-transform duration-300 drop-shadow-[0_0_15px_rgba(96,165,250,0.6)]" />
                        <h3 className="text-lg sm:text-xl font-black italic uppercase tracking-wider mb-1 text-white">Đội Hình</h3>
                        <p className="text-gray-300 text-center font-medium text-xs">Quản lý đội hình 11 cầu thủ.</p>
                      </button>

                      <button className="glass-menu-card p-6 rounded-3xl flex flex-col items-center group cursor-pointer" onClick={() => setGameState('collection')}>
                        <div className="relative mb-3">
                           <div className="absolute inset-0 bg-fuchsia-500/20 blur-xl rounded-full scale-150 group-hover:scale-110 transition-transform" />
                           <span className="text-5xl group-hover:scale-110 transition-transform duration-300 inline-block drop-shadow-[0_0_15px_rgba(217,70,239,0.5)]">🗃️</span>
                        </div>
                        <h3 className="text-lg sm:text-xl font-black italic uppercase tracking-wider mb-1 text-white">Bộ Sưu Tập</h3>
                        <p className="text-gray-300 text-center font-medium text-xs">Xem & xóa thẻ hiện có.</p>
                      </button>

                      <button className={`glass-menu-card p-6 rounded-3xl flex flex-col items-center group cursor-pointer ${squad.length < 11 ? 'opacity-50 grayscale' : ''}`} onClick={() => squad.length === 11 && setGameState('matchEngine')}>
                        <Swords size={48} className="text-amber-400 mb-3 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300 drop-shadow-[0_0_15px_rgba(251,191,36,0.6)]" />
                        <h3 className="text-lg sm:text-xl font-black italic uppercase tracking-wider mb-1 text-white">Đấu AI</h3>
                        <p className="text-gray-300 text-center font-medium text-xs">Đấu với Máy nhận phần thưởng.</p>
                      </button>

                      <button className={`glass-menu-card p-6 rounded-3xl flex flex-col items-center group cursor-pointer ${squad.length < 11 ? 'opacity-50 grayscale' : ''}`} onClick={() => {
          if (squad.length === 11) {
            playFx('click');
            setGameState('pvpOnlineLobby');
          } else {
            showAlert("⚽ Đội hình chưa đủ!", "Bạn cần chọn đủ 11 cầu thủ xuất sắc trong đội hình trước khi tham chiến PvP Online!");
          }
        }}>
                        <div className="relative mb-3">
                          <Wifi size={48} className="text-red-400 group-hover:scale-110 transition-transform duration-300 drop-shadow-[0_0_15px_rgba(248,113,113,0.6)]" />
                          <span className="absolute -top-1.5 -right-1.5 bg-red-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full animate-pulse">HOT</span>
                        </div>
                        <h3 className="text-lg sm:text-xl font-black italic uppercase tracking-wider mb-1 text-white">PVP ONLINE</h3>
                        <p className="text-gray-300 text-center font-medium text-xs">Đấu với bạn bè qua mạng.</p>
                      </button>

                      <button className="glass-menu-card p-6 rounded-3xl flex flex-col items-center group cursor-pointer" onClick={() => {
          playFx('click');
          setGameState('leaderboard');
        }}>
                        <Trophy size={48} className="text-yellow-400 mb-3 group-hover:scale-110 group-hover:rotate-12 transition-transform duration-300 drop-shadow-[0_0_15px_rgba(234,179,8,0.6)]" />
                        <h3 className="text-lg sm:text-xl font-black italic uppercase tracking-wider mb-1 text-white">BXH & Cấp Hạng</h3>
                        <p className="text-gray-300 text-center font-medium text-xs">BXH • Cấp hạng • Nhận quà.</p>
                      </button>
                    </div>

                     {/* Quests & Checkin Quick Buttons */}
                     <div className="mt-8 mb-4 flex gap-4 items-center justify-center flex-wrap">
                        <button className="glass-panel px-6 py-2.5 rounded-full text-xs sm:text-sm font-bold uppercase tracking-widest text-emerald-400 hover:text-emerald-300 hover:bg-white/10 transition-colors flex items-center gap-2 cursor-pointer border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.15)]" onClick={() => {
          playFx('click');
          setGameState('quests');
        }}>
                           Nhiệm Vụ Hàng Ngày <ChevronRight size={16} />
                        </button>
                        <button className="glass-panel px-6 py-2.5 rounded-full text-xs sm:text-sm font-bold uppercase tracking-widest text-yellow-400 hover:text-yellow-300 hover:bg-white/10 transition-colors flex items-center gap-2 cursor-pointer border border-yellow-500/20 shadow-[0_0_15px_rgba(234,179,8,0.15)] animate-pulse" onClick={() => {
          playFx('click');
          setShowCheckInModal(true);
        }}>
                           📅 Điểm Danh Nhận Quà <ChevronRight size={16} />
                        </button>
                        <button className="glass-panel px-6 py-2.5 rounded-full text-xs sm:text-sm font-bold uppercase tracking-widest text-fuchsia-400 hover:text-fuchsia-300 hover:bg-white/10 transition-all flex items-center gap-2 cursor-pointer border border-fuchsia-500/30 shadow-[0_0_20px_rgba(217,70,239,0.25)] hover:shadow-[0_0_30px_rgba(217,70,239,0.5)] hover:scale-105" onClick={() => {
          playFx('click');
          setGameState('showroom');
        }}>
                           💎 Phòng Trưng Bày <ChevronRight size={16} />
                        </button>
                     </div>

                  </div>

                  {/* RIGHT COLUMN: Real-time Global Chat & Online Panel */}
                  <div className="w-full lg:w-96 flex flex-col z-20 shrink-0">
                    {/* Inline LobbyChatPanel rendering */}
                    <div id="lobby-chat-panel" className="glass-panel w-full h-[450px] lg:h-[580px] rounded-3xl lg:rounded-r-none flex flex-col overflow-hidden border border-white/10 lg:border-r-0 shadow-[0_4px_30px_rgba(0,0,0,0.4)]  bg-slate-950/40 relative">
                      {/* Header Tabs */}
                      <div className="flex border-b border-white/10 bg-black/40">
                        <button className={`flex-1 py-3.5 text-[10px] sm:text-xs font-black uppercase tracking-widest flex items-center justify-center gap-1.5 border-b-2 transition-all ${chatTab === 'chat' ? 'border-fuchsia-500 text-fuchsia-400 bg-white/5' : 'border-transparent text-gray-400 hover:text-white'}`} onClick={() => {
            playFx('click');
            setChatTab('chat');
          }}>
                          <MessageSquare size={14} /> Sảnh Chat
                        </button>
                        <button className={`flex-1 py-3.5 text-[10px] sm:text-xs font-black uppercase tracking-widest flex items-center justify-center gap-1.5 border-b-2 transition-all relative ${chatTab === 'private' ? 'border-violet-500 text-violet-400 bg-white/5' : 'border-transparent text-gray-400 hover:text-white'}`} onClick={() => {
            playFx('click');
            setChatTab('private');
          }}>
                          <Mail size={14} /> Tin Nhắn
                          {Object.keys(unreadPartners).length > 0 && <span className="absolute top-2.5 right-4 flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                            </span>}
                        </button>
                        <button className={`flex-1 py-3.5 text-[10px] sm:text-xs font-black uppercase tracking-widest flex items-center justify-center gap-1.5 border-b-2 transition-all relative ${chatTab === 'online' ? 'border-cyan-500 text-cyan-400 bg-white/5' : 'border-transparent text-gray-400 hover:text-white'}`} onClick={() => {
            playFx('click');
            setChatTab('online');
          }}>
                          <Users size={14} /> Online
                          {onlineUsers.length > 0 && <span className="absolute top-2.5 right-6 flex h-2.5 w-2.5">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500"></span>
                            </span>}
                        </button>
                      </div>

                      {/* Tab Content Container */}
                      <div className="flex-1 overflow-hidden flex flex-col">
                        {/* TAB 1: Phòng Chat */}
                        {chatTab === 'chat' && <div className="flex-1 flex flex-col overflow-hidden p-3 sm:p-4 animate-fade-in">
                            <div id="lobby-chat-messages" className="flex-1 overflow-y-auto flex flex-col gap-2 mb-3 pr-1 scroll-smooth hide-scrollbar">
                              {!isConnectedToFirebase && <div className="p-3 bg-red-950/40 border border-red-500/30 text-red-300 rounded-xl text-center text-xs leading-normal animate-pulse mb-2">
                                  ⚠️ Lỗi kết nối Máy chủ. Chế độ Ngoại tuyến đang hoạt động. Sử dụng mã phòng để đấu PVP.
                                </div>}
                              {chatMessages.length === 0 ? <div className="flex-1 flex flex-col items-center justify-center text-gray-500 text-xs text-center gap-2 py-8 italic">
                                   Hãy là người đầu tiên gửi tin nhắn! 💬
                                </div> : chatMessages.map(msg => {
                const isSystem = msg.sender === 'HỆ THỐNG 📣';
                const isMe = msg.sender === currentUser;
                return <div key={msg.id} className={`flex items-start gap-2.5 max-w-[85%] ${isMe ? 'self-end flex-row-reverse' : 'self-start'}`}>
                                      {/* Clickable Avatar */}
                                      {isSystem ? <div className="w-7 h-7 rounded-full shrink-0 flex items-center justify-center text-[10px] bg-gradient-to-br from-amber-500 to-yellow-600 border border-amber-500/30 shadow-md select-none animate-scale-in">
                                          📣
                                        </div> : <div className="w-7 h-7 rounded-full shrink-0 flex items-center justify-center text-[10px] font-black text-white border border-white/10 shadow-md cursor-pointer transition-all hover:scale-105 active:scale-95 select-none animate-scale-in" style={{
                    background: getAvatarGradient(msg.sender)
                  }} onClick={() => {
                    playFx('click');
                    setGameState('userWall');
                    setUserWallTarget(msg.sender);
                  }} title={`Xem Tường nhà ${msg.sender}`}>
                                          {(msg.sender || '').charAt(0).toUpperCase()}
                                        </div>}

                                      <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                        <span className={`text-[9px] font-black mb-0.5 px-1 flex items-center flex-wrap gap-1.5 ${isSystem ? 'text-amber-400' : isMe ? 'text-fuchsia-400' : 'text-blue-400'} ${!isSystem && !isMe ? 'cursor-pointer hover:underline hover:text-cyan-400' : ''}`} onClick={() => {
                      if (!isSystem && !isMe) {
                        playFx('click');
                        setGameState('userWall');
                        setUserWallTarget(msg.sender);
                      }
                    }}>
                                          {isSystem ? msg.sender : <>
                                              <span>{msg.sender}</span>
                                              <span className="text-[8px] bg-white/10 text-gray-300 px-1.5 py-0.2 rounded border border-white/10">Lv.{msg.senderLevel || 1}</span>
                                              {(() => {
                          const tier = getPlayerTier(msg.senderLevel || 1);
                          return <span className={`text-[8px] font-extrabold px-1.5 py-0.2 rounded border shrink-0 ${tier.color} ${tier.glow}`}>
                                                    {tier.icon} {tier.name.split(' ')[1] || tier.name}
                                                  </span>;
                        })()}
                                              {msg.senderTitle && <span className="text-[8px] font-black px-1.5 py-0.2 rounded bg-gradient-to-r from-yellow-500 to-amber-500 text-black border border-yellow-400/40 shrink-0 shadow-[0_0_8px_rgba(234,179,8,0.3)] animate-pulse">
                                                  {msg.senderTitle}
                                                </span>}
                                            </>}
                                        </span>
                                        <div className={`p-2.5 rounded-2xl text-xs font-semibold leading-relaxed border ${isSystem ? 'bg-amber-950/30 border-amber-500/30 text-amber-300' : isMe ? 'bg-fuchsia-950/20 border-fuchsia-500/25 text-fuchsia-100 rounded-tr-none' : 'bg-slate-900/60 border-white/10 text-gray-100 rounded-tl-none'}`}>
                                          {msg.text}
                                        </div>
                                      </div>
                                    </div>;
              })}
                            </div>

                            {/* Chat Input form */}
                            <form onSubmit={e => {
              e.preventDefault();
              if (chatInput.trim()) {
                playFx('click');
                sendChatMessage(chatInput);
                setChatInput('');
              }
            }} className="flex gap-2 bg-black/40 p-1.5 rounded-2xl border border-white/10">
                              <input type="text" value={chatInput} onChange={e => setChatInput(e.target.value)} placeholder="Nhập nội dung chat..." className="flex-1 bg-transparent border-0 focus:outline-none focus:ring-0 text-xs px-3 text-white" maxLength={100} />
                              <button type="submit" className="w-8 h-8 rounded-xl bg-gradient-to-r from-fuchsia-600 to-indigo-600 hover:from-fuchsia-500 hover:to-indigo-500 text-white flex items-center justify-center transition-all cursor-pointer shrink-0">
                                <Send size={14} fill="currentColor" />
                              </button>
                            </form>
                          </div>}

                        {/* TAB 2: Tin Nhắn Riêng (DMs) */}
                        {chatTab === 'private' && <div className="flex-1 flex flex-col overflow-hidden p-3 sm:p-4 animate-fade-in">
                            {activePrivatePartner ? <div className="flex-1 flex flex-col overflow-hidden">
                                <div className="flex items-center justify-between border-b border-white/5 pb-2 mb-2">
                                  <button className="flex items-center gap-0.5 text-[10px] font-bold text-violet-400 hover:text-violet-300 cursor-pointer" onClick={() => setActivePrivatePartner(null)}>
                                    <ChevronLeft size={14} /> Trở lại
                                  </button>
                                  <span className="font-extrabold text-[11px] text-white truncate max-w-[120px]">Chat: {activePrivatePartner}</span>
                                  <button className="text-[9px] px-2 py-0.5 bg-cyan-900/30 text-cyan-400 border border-cyan-500/20 rounded hover:bg-cyan-900/50 font-bold cursor-pointer" onClick={() => {
                  playFx('click');
                  setGameState('userWall');
                  setUserWallTarget(activePrivatePartner);
                }}>
                                    Tường
                                  </button>
                                </div>

                                <div className="flex-1 overflow-y-auto flex flex-col gap-2 mb-3 pr-1 scroll-smooth hide-scrollbar">
                                  {privateMessages.length === 0 ? <div className="flex-1 flex flex-col items-center justify-center text-gray-500 text-xs text-center py-8 italic">
                                      Hãy gửi tin nhắn riêng cho {activePrivatePartner}! ✉️
                                    </div> : privateMessages.map(msg => {
                  const isMe = msg.sender === currentUser;
                  return <div key={msg.id} className={`flex items-start gap-2.5 max-w-[85%] ${isMe ? 'self-end flex-row-reverse' : 'self-start'}`}>
                                          {/* Clickable DM Avatar */}
                                          <div className="w-7 h-7 rounded-full shrink-0 flex items-center justify-center text-[10px] font-black text-white border border-white/10 shadow-md cursor-pointer transition-all hover:scale-105 active:scale-95 select-none animate-scale-in" style={{
                      background: getAvatarGradient(msg.sender)
                    }} onClick={() => {
                      playFx('click');
                      setGameState('userWall');
                      setUserWallTarget(msg.sender);
                    }} title={`Xem Tường nhà ${msg.sender}`}>
                                            {(msg.sender || '').charAt(0).toUpperCase()}
                                          </div>
                                          <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                            {msg.senderTitle && <span className="text-[7px] sm:text-[8px] font-black mb-0.5 px-1.5 py-0.2 rounded bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white border border-violet-400/30 shrink-0">
                                                {msg.senderTitle}
                                              </span>}
                                            <div className={`p-2.5 rounded-2xl text-xs font-semibold leading-relaxed border ${isMe ? 'bg-violet-950/20 border-violet-500/25 text-violet-100 rounded-tr-none' : 'bg-slate-900/60 border-white/10 text-gray-100 rounded-tl-none'}`}>
                                              {msg.text}
                                            </div>
                                          </div>
                                        </div>;
                })}
                                </div>

                                <form onSubmit={e => {
                e.preventDefault();
                sendPrivateMessage();
              }} className="flex gap-2 bg-black/40 p-1.5 rounded-2xl border border-white/10">
                                  <input id="private-chat-input" type="text" className="flex-1 bg-transparent border-0 focus:outline-none focus:ring-0 text-xs px-3 text-white" placeholder={`Nhắn cho ${activePrivatePartner}...`} value={privateChatInput} onChange={e => setPrivateChatInput(e.target.value)} />
                                  <button type="submit" className="w-8 h-8 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white flex items-center justify-center transition-all cursor-pointer shrink-0">
                                    <Send size={14} fill="currentColor" />
                                  </button>
                                </form>
                              </div> : <div className="flex-1 overflow-y-auto flex flex-col gap-2 hide-scrollbar">
                                <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest border-b border-white/5 pb-2">
                                  Hộp thư riêng
                                </div>
                                {myPrivateChats.length === 0 ? <div className="flex-1 flex flex-col items-center justify-center text-gray-500 text-xs text-center py-12 italic">
                                    Chưa có cuộc trò chuyện nào.
                                    <br />
                                    <span className="text-[9px] text-gray-600 mt-2">Mẹo: Click vào thành viên trong danh sách Online và chọn "Nhắn Tin"!</span>
                                  </div> : myPrivateChats.map(chat => {
                const hasUnread = unreadPartners[chat.username] === true;
                const isPartnerOnline = onlineUsers.some(o => o.username === chat.username);
                return <div key={chat.username} className="p-3 bg-black/30 rounded-2xl border border-white/5 flex items-center justify-between hover:border-violet-500/30 hover:bg-black/50 transition-all cursor-pointer" onClick={() => {
                  playFx('click');
                  setActivePrivatePartner(chat.username);
                }}>
                                        <div className="flex items-center gap-2">
                                          <span className={`h-2.5 w-2.5 rounded-full shrink-0 ${isPartnerOnline ? 'bg-green-500' : 'bg-gray-600'}`}></span>
                                          <span className="font-extrabold text-xs text-white">{chat.username}</span>
                                          {hasUnread && <span className="bg-red-500 text-white text-[8px] px-1.5 py-0.5 rounded-full font-black animate-pulse">MỚI</span>}
                                        </div>
                                        <ChevronRight size={14} className="text-gray-500" />
                                      </div>;
              })}
                              </div>}
                          </div>}

                        {/* TAB 3: Danh sách Online */}
                        {chatTab === 'online' && <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 hide-scrollbar animate-fade-in">
                            <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest border-b border-white/5 pb-2 flex justify-between items-center">
                              <span>HLV Trực Tuyến ({onlineUsers.length})</span>
                              <span className="flex items-center gap-1 text-[8px] bg-green-500/20 text-green-400 border border-green-500/30 px-2 py-0.5 rounded-full uppercase tracking-wider font-extrabold animate-pulse">Lobby Trực Tuyến</span>
                            </div>

                            {onlineUsers.length === 0 ? <div className="flex-1 flex flex-col items-center justify-center text-gray-500 text-xs text-center gap-3 py-12 italic leading-relaxed">
                                 ⏳ Đang chờ người chơi khác...
                                 <br />
                                 <span className="text-[10px] text-gray-600 font-medium">Mẹo: Mở game ở tab ẩn danh hoặc thiết bị khác để thử thách đấu chéo!</span>
                              </div> : onlineUsers.map(user => <div key={user.username} className="p-3 bg-black/40 rounded-2xl border border-white/5 flex items-center justify-between gap-3 hover:border-cyan-500/30 hover:bg-black/60 transition-all group">
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center flex-wrap gap-2 mb-0.5">
                                      <span className="h-2 w-2 rounded-full bg-green-500 shadow-[0_0_6px_rgba(34,197,94,0.9)] shrink-0"></span>
                                      <span className="font-extrabold text-xs text-white truncate hover:underline hover:text-cyan-400 cursor-pointer" onClick={() => {
                    playFx('click');
                    setGameState('userWall');
                    setUserWallTarget(user.username);
                  }}>
                                        {user.username}
                                      </span>
                                      <span className="text-[10px] bg-white/10 text-gray-300 px-1.5 py-0.5 rounded-full border border-white/10 font-bold shrink-0">Lv.{user.level || 1}</span>
                                      {(() => {
                    const tier = getPlayerTier(user.level || 1);
                    return <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full border shrink-0 ${tier.color} ${tier.glow}`}>
                                            {tier.icon} {tier.name}
                                          </span>;
                  })()}
                                      <span className="text-[9px] px-1.5 py-0.5 bg-cyan-900/30 text-cyan-400 border border-cyan-500/20 font-black rounded uppercase tracking-wider shrink-0">{user.rating} OVR</span>
                                    </div>
                                    <p className="text-[9px] text-gray-500 font-mono truncate">ID: {user.peerId}</p>
                                  </div>

                                  <div className="flex items-center gap-2 shrink-0">
                                    <button className="btn !py-2 !px-3 text-[10px] flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-white shadow-md transition-all uppercase font-black tracking-widest cursor-pointer border border-white/10" onClick={() => {
                  playFx('click');
                  setActivePrivatePartner(user.username);
                  setChatTab('private');
                  setTimeout(() => {
                    const inputEl = document.getElementById('private-chat-input');
                    if (inputEl) inputEl.focus();
                  }, 100);
                }} title={`Nhắn tin riêng cho ${user.username}`}>
                                      <MessageSquare size={10} /> Nhắn Tin
                                    </button>
                                    <button className={`btn !py-2 !px-3 text-[10px] flex items-center gap-1 shadow-md transition-all uppercase font-black tracking-widest cursor-pointer ${squad.length < 11 ? 'opacity-40 !bg-gray-700 cursor-not-allowed text-gray-400' : 'bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white shadow-red-900/40 hover:scale-105 hover:shadow-lg'}`} disabled={squad.length < 11} onClick={() => {
                  if (squad.length === 11) {
                    sendChallengeInvite(user.username, user.peerId);
                  }
                }} title={squad.length < 11 ? 'Đội hình cần đủ 11 người để thách đấu' : `Thách đấu ngay với ${user.username}`}>
                                      <Swords size={10} /> Đấu
                                    </button>
                                    <button className={`btn !py-2 !px-3 text-[10px] flex items-center gap-1 shadow-md transition-all uppercase font-black tracking-widest cursor-pointer ${collection.length < 11 ? 'opacity-40 !bg-gray-700 cursor-not-allowed text-gray-400' : 'bg-gradient-to-r from-fuchsia-700 to-purple-700 hover:from-fuchsia-600 hover:to-purple-600 text-white border border-fuchsia-400/20 hover:scale-105'}`} disabled={collection.length < 11} onClick={() => {
                  if (collection.length >= 11) {
                    sendRandomChallengeInvite(user.username, user.peerId);
                  }
                }} title={collection.length < 11 ? 'Cần ít nhất 11 thẻ để Đấu Random' : `Thách đấu Random với ${user.username}`}>
                                      🎲 Random
                                    </button>
                                  </div>
                                </div>)}
                          </div>}
                      </div>
                    </div>
                  </div>

                  {showPvpJoinModal && <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80  p-4 animate-fade-in">
                      <div className="glass-panel p-8 sm:p-10 rounded-[2rem] max-w-sm w-full flex flex-col items-center bg-gradient-to-t from-red-900/40 to-slate-900 shadow-[0_0_50px_rgba(0,0,0,0.8)] relative border border-white/10">
                        <button className="absolute top-4 right-4 text-gray-400 hover:text-white bg-black/40 hover:bg-black/80 p-2 rounded-full w-8 h-8 flex items-center justify-center transition-colors" onClick={() => setShowPvpJoinModal(false)}>
                          ✕
                        </button>
                        <Wifi size={48} className="text-red-400 mb-6 drop-shadow-[0_0_15px_rgba(248,113,113,0.8)]" />
                        <h2 className="text-2xl font-black text-white mb-2 uppercase tracking-widest text-center">Đấu PVP</h2>
                        <p className="text-sm text-gray-400 text-center mb-6">Tạo trận mới hoặc nhập mã để tham gia trận của bạn bè.</p>
                        
                        <input type="text" className="w-full bg-black/50 border border-white/20 rounded-xl p-3 text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 mb-4 text-center font-mono text-lg" placeholder="Nhập mã trận đấu..." value={pvpJoinInput} onChange={e => setPvpJoinInput(e.target.value)} />
                        
                        <div className="flex flex-col gap-3 w-full">
                          <button className="btn !bg-red-600 hover:!bg-red-500 w-full" onClick={() => {
            if (pvpJoinInput.trim()) {
              setActivePvpTarget(pvpJoinInput.trim());
            } else {
              setActivePvpTarget(null); // Tạo trận mới
            }
            setGameState('multiplayer');
            setShowPvpJoinModal(false);
          }}>
                            {pvpJoinInput.trim() ? 'Tham Gia Trận' : 'Tạo Trận Mới'}
                          </button>
                        </div>
                      </div>
                    </div>}
                </div>;
})()
  );
}
