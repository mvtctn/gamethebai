import React from 'react';
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

export function PvpOnlineLobbyScreen() {
  const { setGameState, coins, level, onlineUsers, setUserWallTarget, setActivePrivatePartner, setChatTab, squad, sendChallengeInvite, chatTab, unreadPartners, chatMessages, currentUser, chatInput, sendChatMessage, setChatInput, activePrivatePartner, privateMessages, sendPrivateMessage, privateChatInput, setPrivateChatInput, myPrivateChats, pvpHistory } = useGameContext();

  return (
    <div className="pvp-lobby relative z-10 p-4 sm:p-8 pt-20 min-h-screen flex flex-col max-w-7xl mx-auto w-full">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 bg-black/60 p-5 rounded-3xl border border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
            <div className="flex flex-wrap gap-3 items-center">
              <button className="btn !bg-blue-600 hover:!bg-blue-500 !py-2 !px-4 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 rounded-full border border-white/10 cursor-pointer shadow-md" onClick={() => {
        playFx('click');
        setGameState('lobby');
      }}>
                <ChevronLeft size={16} /> Về Sảnh
              </button>
            </div>
            
            <h2 className="text-xl sm:text-3xl font-black uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-amber-400 to-yellow-500 drop-shadow-[0_2px_15px_rgba(239,68,68,0.3)] text-center flex items-center gap-3 animate-pulse">
              ⚔️ ĐẤU TRƯỜNG PVP ONLINE ⚔️
            </h2>
            
            <div className="flex items-center gap-3 bg-black/40 px-4 py-2 rounded-2xl border border-white/10 shadow-inner">
              <div className="flex items-center gap-1.5 text-xs text-yellow-400 font-bold border-r border-white/10 pr-3 mr-1">
                <Coins size={14} className="animate-spin-slow" />
                <span>{coins} Xu</span>
              </div>
              <div className="flex items-center gap-1 text-[10px] bg-white/5 border border-white/10 px-2 py-0.5 rounded-md font-bold text-gray-300">
                <span>Lv.{level}</span>
                {(() => {
          const tier = getPlayerTier(level);
          return <span className={`text-[8px] font-black uppercase ml-1 px-1 rounded-sm border ${tier.color} ${tier.glow}`}>
                      {tier.icon} {tier.name.split(' ')[0]}
                    </span>;
        })()}
              </div>
            </div>
          </div>

          {/* Three-column Dashboard Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full flex-1">
            
            {/* Column 1: Online HLV */}
            <div className="glass-panel p-5 rounded-3xl flex flex-col h-[580px] border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.4)] bg-slate-950/40 overflow-hidden relative">
              <div className="flex items-center justify-between border-b border-white/15 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <Users className="text-cyan-400 w-5 h-5 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]" />
                  <span className="font-black text-sm uppercase tracking-wider text-white">HLV Trực Tuyến ({onlineUsers.length})</span>
                </div>
                <span className="h-2 w-2 rounded-full bg-green-500 animate-ping"></span>
              </div>
              
              <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-3.5 hide-scrollbar">
                {onlineUsers.length === 0 ? <div className="flex-1 flex flex-col items-center justify-center text-gray-500 text-xs text-center gap-3 py-12 italic leading-relaxed">
                     ⏳ Đang tìm đối thủ...
                     <br />
                     <span className="text-[10px] text-gray-600 font-medium">Mẹo: Mở game ở tab ẩn danh hoặc thiết bị khác để thử thách đấu chéo!</span>
                  </div> : onlineUsers.map(user => {
          const userTier = getPlayerTier(user.level || 1);
          return <div key={user.username} className="p-4 bg-black/40 rounded-2xl border border-white/5 flex flex-col gap-3 hover:border-cyan-500/30 hover:bg-black/60 transition-all duration-300 relative overflow-hidden group shadow-md">
                        {/* Profile Info Row */}
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="h-2 w-2 rounded-full bg-green-500 shadow-[0_0_6px_rgba(34,197,94,0.9)] shrink-0"></span>
                            <span className="font-extrabold text-xs text-white truncate hover:underline hover:text-cyan-400 cursor-pointer" onClick={() => {
                  playFx('click');
                  setGameState('userWall');
                  setUserWallTarget(user.username);
                }}>
                              {user.username}
                            </span>
                            <span className="text-[9px] bg-white/10 text-gray-300 px-1.5 py-0.2 rounded border border-white/10 font-bold shrink-0">Lv.{user.level || 1}</span>
                          </div>
                          
                          <span className="text-[9px] px-1.5 py-0.5 bg-cyan-900/30 text-cyan-400 border border-cyan-500/20 font-black rounded uppercase tracking-wider shrink-0">{user.rating} OVR</span>
                        </div>

                        {/* Badges Row */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full border shrink-0 ${userTier.color} ${userTier.glow}`}>
                            {userTier.icon} {userTier.name}
                          </span>
                          <span className="text-[8px] text-gray-500 font-mono shrink-0">ID: {user.peerId}</span>
                        </div>

                        {/* Interactive Actions Row */}
                        <div className="flex items-center gap-2 mt-1">
                          <button className="flex-1 btn !py-2 !px-3 text-[10px] flex items-center justify-center gap-1 bg-slate-800 hover:bg-slate-700 text-white shadow-md transition-all uppercase font-black tracking-widest cursor-pointer border border-white/10 rounded-xl" onClick={() => {
                playFx('click');
                setActivePrivatePartner(user.username);
                setChatTab('private');
                setTimeout(() => {
                  const inputEl = document.getElementById('pvp-lobby-private-chat-input');
                  if (inputEl) inputEl.focus();
                }, 100);
              }}>
                            <MessageSquare size={12} /> Chat
                          </button>
                          
                          <button className={`flex-1 btn !py-2 !px-3 text-[10px] flex items-center justify-center gap-1 shadow-md transition-all uppercase font-black tracking-widest cursor-pointer rounded-xl ${squad.length < 11 ? 'opacity-40 !bg-gray-700 cursor-not-allowed text-gray-400 border border-transparent' : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white hover:scale-[1.03] border border-emerald-400/20 shadow-[0_0_15px_rgba(16,185,129,0.25)]'}`} disabled={squad.length < 11} onClick={() => {
                if (squad.length === 11) {
                  sendChallengeInvite(user.username, user.peerId);
                }
              }}>
                            <Swords size={12} /> Thách Đấu
                          </button>
                        </div>
                      </div>;
        })}
              </div>
            </div>

            {/* Column 2: Embedded Lobby Chat */}
            <div className="glass-panel p-0 rounded-3xl flex flex-col h-[580px] border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.4)] bg-slate-950/40 overflow-hidden relative">
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
              </div>

              <div className="flex-1 overflow-hidden flex flex-col">
                {/* TAB 1: Global Chat Room */}
                {chatTab === 'chat' && <div className="flex-1 flex flex-col overflow-hidden p-3 sm:p-4 animate-fade-in">
                    <div id="pvp-lobby-chat-messages" className="flex-1 overflow-y-auto flex flex-col gap-2 mb-3 pr-1 scroll-smooth hide-scrollbar">
                      {!isConnectedToFirebase && <div className="p-3 bg-red-950/40 border border-red-500/30 text-red-300 rounded-xl text-center text-xs leading-normal animate-pulse mb-2">
                          ⚠️ Lỗi kết nối Máy chủ. Chế độ Ngoại tuyến đang hoạt động. Sử dụng mã phòng để đấu PVP.
                        </div>}
                      {chatMessages.length === 0 ? <div className="flex-1 flex flex-col items-center justify-center text-gray-500 text-xs text-center gap-2 py-8 italic">
                           Hãy là người đầu tiên gửi tin nhắn! 💬
                        </div> : chatMessages.map(msg => {
              const isSystem = msg.sender === 'HỆ THỐNG 📣';
              const isMe = msg.sender === currentUser;
              return <div key={msg.id} className={`flex items-start gap-2.5 max-w-[85%] ${isMe ? 'self-end flex-row-reverse' : 'self-start'}`}>
                              {isSystem ? <div className="w-7 h-7 rounded-full shrink-0 flex items-center justify-center text-[10px] bg-gradient-to-br from-amber-500 to-yellow-600 border border-amber-500/30 shadow-md select-none animate-scale-in">📣</div> : <div className="w-7 h-7 rounded-full shrink-0 flex items-center justify-center text-[10px] font-black text-white border border-white/10 shadow-md cursor-pointer transition-all hover:scale-105 active:scale-95 select-none animate-scale-in" style={{
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

                {/* TAB 2: Private Messages */}
                {chatTab === 'private' && <div className="flex-1 flex flex-col overflow-hidden p-3 sm:p-4 animate-fade-in">
                    {activePrivatePartner ? <div className="flex-1 flex flex-col overflow-hidden">
                        <div className="flex items-center justify-between border-b border-white/5 pb-2 mb-2">
                          <button className="flex items-center gap-0.5 text-[10px] font-bold text-violet-400 hover:text-violet-300 cursor-pointer animate-pulse" onClick={() => setActivePrivatePartner(null)}>
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
                          <input id="pvp-lobby-private-chat-input" type="text" className="flex-1 bg-transparent border-0 focus:outline-none focus:ring-0 text-xs px-3 text-white" placeholder={`Nhắn cho ${activePrivatePartner}...`} value={privateChatInput} onChange={e => setPrivateChatInput(e.target.value)} />
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
              </div>
            </div>

            {/* Column 3: Personal Match History */}
            <div className="glass-panel p-5 rounded-3xl flex flex-col h-[580px] border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.4)] bg-slate-950/40 overflow-hidden relative">
              <div className="flex items-center justify-between border-b border-white/15 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <History className="text-yellow-400 w-5 h-5 drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]" />
                  <span className="font-black text-sm uppercase tracking-wider text-white">Lịch Sử Thi Đấu ({pvpHistory.length})</span>
                </div>
                <Trophy className="text-amber-500 w-4 h-4 animate-bounce-subtle" />
              </div>

              <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-3.5 hide-scrollbar">
                {pvpHistory.length === 0 ? <div className="flex-1 flex flex-col items-center justify-center text-gray-500 text-xs py-12 italic text-center leading-relaxed">
                    🏆 Bạn chưa thi đấu trận PvP nào.
                    <br />
                    <span className="text-[10px] text-gray-600 mt-2 font-medium">Hãy thách đấu những HLV online ở cột trái để ghi danh bảng vàng!</span>
                  </div> : pvpHistory.map(record => {
          const isWin = record.result === 'win';
          const isLose = record.result === 'lose';
          const isDraw = record.result === 'draw';
          const badgeStyle = isWin ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.3)] font-black' : isLose ? 'bg-rose-950/40 border-rose-500/30 text-rose-400 drop-shadow-[0_0_8px_rgba(244,63,94,0.3)] font-black' : 'bg-blue-950/40 border-blue-500/30 text-blue-400 drop-shadow-[0_0_8px_rgba(59,130,246,0.3)] font-black';
          const badgeText = isWin ? '🏆 THẮNG' : isLose ? '😤 THUA' : '⚖️ HÒA';
          return <div key={record.id} className={`p-4 rounded-2xl border flex flex-col gap-3.5 transition-all duration-300 hover:scale-[1.02] bg-black/40 border-white/5 shadow-sm hover:border-white/10`}>
                        <div className="flex items-center justify-between">
                          <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border uppercase ${badgeStyle}`}>
                            {badgeText}
                          </span>
                          <span className="text-[9px] text-gray-500 font-semibold font-mono">
                            {record.timestamp ? new Date(record.timestamp).toLocaleString('vi-VN', {
                  hour: '2-digit',
                  minute: '2-digit',
                  day: '2-digit',
                  month: '2-digit'
                }) : 'Vừa xong'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs gap-2">
                          <span className="font-extrabold text-white truncate max-w-[90px] uppercase tracking-wide" title={currentUser}>{currentUser}</span>
                          <span className="font-black text-white text-base bg-black/70 px-3 py-1.5 rounded-xl border border-white/10 font-mono shadow-inner">
                            {record.myScore} - {record.opponentScore}
                          </span>
                          <span className="font-extrabold text-white truncate max-w-[90px] text-right uppercase tracking-wide" title={record.opponent}>{record.opponent}</span>
                        </div>
                      </div>;
        })}
              </div>
            </div>
            
          </div>
        </div>
  );
}
