import React, { useState, useEffect, useRef } from 'react';
import { Trophy, ChevronLeft, Users, Calendar, MessageSquare, Settings, Play, LogOut, CheckCircle2, Copy, Send, Flag } from 'lucide-react';
import { getAvatarGradient, getRelativeTime, playFx } from '../../../utils';
import { QRCodeSVG } from 'qrcode.react';
import { useGameContext } from '../../../context/GameContext';

export function TournamentDashboardScreen() {
  const {
    currentUser,
    setGameState,
    tournamentData,
    tournamentChat,
    leaveTournament,
    startTournament,
    sendTournamentChat,
    setActivePvpTarget,
    activeTournamentId,
    showAlert,
    handleCreatePost
  } = useGameContext();

  const [activeTab, setActiveTab] = useState('rankings');
  const [chatInput, setChatInput] = useState('');
  const chatRef = useRef(null);

  // Auto scroll chat
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [tournamentChat, activeTab]);

  if (!tournamentData) {
    return (
      <div className="flex items-center justify-center min-h-screen text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
      </div>
    );
  }

  const isHost = tournamentData.host === currentUser;
  const status = tournamentData.status; // gathering, playing, finished

  const participants = Object.values(tournamentData.participants || {}).sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    const gdA = (a.gf || 0) - (a.ga || 0);
    const gdB = (b.gf || 0) - (b.ga || 0);
    if (gdB !== gdA) return gdB - gdA;
    return (b.gf || 0) - (a.gf || 0);
  });

  const matches = Object.entries(tournamentData.matches || {}).map(([id, m]) => ({ id, ...m }));

  const copyRoomCode = () => {
    navigator.clipboard.writeText(activeTournamentId);
    showAlert("Thành công", "Đã sao chép mã giải đấu vào khay nhớ tạm!");
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (chatInput.trim()) {
      sendTournamentChat(currentUser, chatInput);
      setChatInput('');
    }
  };

  const handleEndTournament = () => {
    if (status !== 'playing' || !isHost) return;
    // Tự động kết thúc giải và vinh danh
    const winner = participants[0];
    if (winner) {
      const text = `🏆 Chúc mừng nhà vô địch [${winner.name}] đã xuất sắc đăng quang giải đấu [${tournamentData.name}] với ${winner.points} điểm bất bại!`;
      handleCreatePost(text, null);
    }
    showAlert("Thành công", "Đã kết thúc giải đấu và vinh danh nhà vô địch lên Tường!");
    leaveTournament(); // Host leaves and deletes the tournament or keeps it finished. For now, let's keep it simple.
  };

  return (
    <div className="relative z-10 p-2 sm:p-4 md:p-8 pt-20 min-h-screen flex flex-col max-w-5xl mx-auto w-full animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4 bg-black/60 p-4 sm:p-5 rounded-3xl border border-white/10 shadow-lg">
        <button 
          className="btn !bg-slate-700 hover:!bg-slate-600 !py-2 !px-4 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 rounded-full"
          onClick={() => setGameState('tournamentHub')}
        >
          <ChevronLeft size={16} /> Thoát
        </button>
        
        <div className="flex flex-col items-center">
          <h2 className="text-xl sm:text-2xl font-black uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-600 flex items-center gap-2">
            <Trophy className="text-yellow-500" size={24} /> {tournamentData.name}
          </h2>
          <span className="text-[10px] text-gray-400 uppercase tracking-widest font-bold bg-white/5 px-3 py-1 rounded-full mt-2">
            Host: <span className="text-emerald-400">{tournamentData.host}</span> • {tournamentData.format === 'single' ? 'Đá 1 Lượt' : 'Đá Lượt Đi & Về'}
          </span>
        </div>

        {status === 'gathering' && (
          <button 
            className="btn !bg-blue-600/20 text-blue-400 border border-blue-500/50 hover:!bg-blue-600/40 !py-2 !px-4 text-xs font-black uppercase tracking-wider flex items-center gap-2 rounded-full"
            onClick={copyRoomCode}
          >
            Mã: <span className="text-white bg-blue-600 px-2 py-0.5 rounded">{activeTournamentId}</span> <Copy size={14}/>
          </button>
        )}
        {status !== 'gathering' && <div className="w-[100px] hidden md:block"></div>}
      </div>

      {/* Main Content Area */}
      <div className="flex flex-col lg:flex-row gap-6">
        
        {/* Left Sidebar - Tabs */}
        <div className="lg:w-64 flex flex-row lg:flex-col gap-2 shrink-0 overflow-x-auto pb-2 lg:pb-0 hide-scrollbar">
          <button
            className={`flex items-center gap-3 px-4 py-3 sm:py-4 rounded-2xl font-bold uppercase tracking-widest text-xs sm:text-sm transition-all shrink-0 ${activeTab === 'rankings' ? 'bg-gradient-to-r from-yellow-600 to-amber-600 text-white shadow-[0_0_15px_rgba(217,119,6,0.4)] border border-yellow-500/50' : 'bg-black/40 text-gray-400 border border-white/5 hover:bg-white/5'}`}
            onClick={() => setActiveTab('rankings')}
          >
            <Trophy size={18} /> BXH
          </button>
          
          <button
            className={`flex items-center gap-3 px-4 py-3 sm:py-4 rounded-2xl font-bold uppercase tracking-widest text-xs sm:text-sm transition-all shrink-0 ${activeTab === 'schedule' ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)] border border-blue-500/50' : 'bg-black/40 text-gray-400 border border-white/5 hover:bg-white/5'}`}
            onClick={() => setActiveTab('schedule')}
          >
            <Calendar size={18} /> Lịch Thi Đấu
          </button>

          <button
            className={`flex items-center gap-3 px-4 py-3 sm:py-4 rounded-2xl font-bold uppercase tracking-widest text-xs sm:text-sm transition-all shrink-0 ${activeTab === 'chat' ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-[0_0_15px_rgba(5,150,105,0.4)] border border-emerald-500/50' : 'bg-black/40 text-gray-400 border border-white/5 hover:bg-white/5'}`}
            onClick={() => setActiveTab('chat')}
          >
            <MessageSquare size={18} /> Chat Box
          </button>

          <button
            className={`flex items-center gap-3 px-4 py-3 sm:py-4 rounded-2xl font-bold uppercase tracking-widest text-xs sm:text-sm transition-all shrink-0 ${activeTab === 'settings' ? 'bg-gradient-to-r from-slate-600 to-slate-500 text-white shadow-[0_0_15px_rgba(100,116,139,0.4)] border border-slate-400/50' : 'bg-black/40 text-gray-400 border border-white/5 hover:bg-white/5'}`}
            onClick={() => setActiveTab('settings')}
          >
            <Settings size={18} /> Tùy Chọn
          </button>
        </div>

        {/* Right Content Area */}
        <div className="flex-1 glass-panel rounded-3xl border border-white/10 bg-black/60 overflow-hidden flex flex-col min-h-[500px]">
          
          {/* TAB: RANKINGS */}
          {activeTab === 'rankings' && (
            <div className="p-4 sm:p-6 flex flex-col h-full animate-fade-in">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-black uppercase tracking-widest text-yellow-500">Bảng Xếp Hạng</h3>
                {status === 'gathering' && (
                  <span className="text-xs bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full border border-blue-500/30 uppercase tracking-widest animate-pulse font-bold">
                    Đang gom người ({participants.length})
                  </span>
                )}
                {status === 'playing' && (
                  <span className="text-xs bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full border border-emerald-500/30 uppercase tracking-widest animate-pulse font-bold">
                    Đang diễn ra
                  </span>
                )}
              </div>

              <div className="overflow-x-auto w-full flex-1">
                <table className="w-full text-left border-collapse min-w-[500px]">
                  <thead>
                    <tr className="bg-white/5 border-b border-white/10 text-xs sm:text-sm text-gray-400 uppercase tracking-wider font-black">
                      <th className="p-3 w-10 text-center">#</th>
                      <th className="p-3">HLV</th>
                      <th className="p-3 text-center">Trận</th>
                      <th className="p-3 text-center text-emerald-400">T</th>
                      <th className="p-3 text-center text-yellow-400">H</th>
                      <th className="p-3 text-center text-red-400">B</th>
                      <th className="p-3 text-center">HS</th>
                      <th className="p-3 text-center text-xl text-yellow-500 w-16">Điểm</th>
                    </tr>
                  </thead>
                  <tbody>
                    {participants.map((p, idx) => {
                      const gd = (p.gf || 0) - (p.ga || 0);
                      const isMe = p.name === currentUser;
                      return (
                        <tr key={p.name} className={`border-b border-white/5 transition-colors hover:bg-white/5 ${isMe ? 'bg-blue-900/20' : ''}`}>
                          <td className="p-3 text-center font-bold text-gray-500">
                            {idx === 0 ? <span className="text-yellow-500">🥇</span> : idx === 1 ? <span className="text-gray-400">🥈</span> : idx === 2 ? <span className="text-amber-600">🥉</span> : idx + 1}
                          </td>
                          <td className="p-3 flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full ${getAvatarGradient(p.name)} shadow-inner border border-white/10 shrink-0`}></div>
                            <span className={`font-bold ${isMe ? 'text-blue-400' : 'text-white'} ${p.hasLeft ? 'line-through text-gray-600' : ''}`}>
                              {p.name} {p.hasLeft && '(Bỏ)'}
                            </span>
                          </td>
                          <td className="p-3 text-center text-gray-300 font-mono">{p.played || 0}</td>
                          <td className="p-3 text-center text-emerald-400/80 font-mono">{p.won || 0}</td>
                          <td className="p-3 text-center text-yellow-400/80 font-mono">{p.draw || 0}</td>
                          <td className="p-3 text-center text-red-400/80 font-mono">{p.lost || 0}</td>
                          <td className="p-3 text-center text-gray-400 font-mono">{gd > 0 ? `+${gd}` : gd}</td>
                          <td className="p-3 text-center font-black text-yellow-500 text-lg">{p.points || 0}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB: SCHEDULE */}
          {activeTab === 'schedule' && (
            <div className="p-4 sm:p-6 flex flex-col h-full animate-fade-in">
              <h3 className="text-lg font-black uppercase tracking-widest text-blue-400 mb-4">Lịch Thi Đấu</h3>
              
              {status === 'gathering' ? (
                <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
                  <Calendar size={48} className="mb-4 opacity-30" />
                  <p>Lịch thi đấu sẽ được tạo khi Host ấn Bắt Đầu.</p>
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                  {matches.length === 0 && <p className="text-center text-gray-500 mt-10">Không có trận đấu nào.</p>}
                  {matches.map(m => {
                    const isMyMatch = m.p1 === currentUser || m.p2 === currentUser;
                    return (
                      <div key={m.id} className={`p-4 rounded-2xl border ${isMyMatch ? 'bg-blue-900/10 border-blue-500/30' : 'bg-black/40 border-white/5'} flex flex-col sm:flex-row items-center justify-between gap-4`}>
                        
                        <div className="flex items-center justify-center gap-6 w-full sm:w-auto flex-1">
                          {/* P1 */}
                          <div className="flex flex-col items-center gap-1 w-24">
                            <div className={`w-10 h-10 rounded-full ${getAvatarGradient(m.p1)} border-2 ${m.status === 'completed' && m.score1 > m.score2 ? 'border-yellow-500' : 'border-white/10'}`}></div>
                            <span className="text-xs font-bold text-gray-300 text-center truncate w-full">{m.p1}</span>
                          </div>

                          {/* Score / Status */}
                          <div className="flex flex-col items-center">
                            {m.status === 'completed' ? (
                              <div className="bg-black/60 px-4 py-2 rounded-xl font-black text-xl tracking-widest text-white border border-white/10">
                                {m.score1} - {m.score2}
                              </div>
                            ) : m.status === 'forfeited' ? (
                              <div className="bg-red-900/30 px-3 py-1 rounded-full text-xs font-bold text-red-400 border border-red-500/30 uppercase">
                                Bỏ cuộc
                              </div>
                            ) : (
                              <div className="text-gray-500 font-black text-xl">VS</div>
                            )}
                            <span className="text-[10px] text-gray-500 uppercase mt-1">Vòng {m.round}</span>
                          </div>

                          {/* P2 */}
                          <div className="flex flex-col items-center gap-1 w-24">
                            <div className={`w-10 h-10 rounded-full ${getAvatarGradient(m.p2)} border-2 ${m.status === 'completed' && m.score2 > m.score1 ? 'border-yellow-500' : 'border-white/10'}`}></div>
                            <span className="text-xs font-bold text-gray-300 text-center truncate w-full">{m.p2}</span>
                          </div>
                        </div>

                        {/* Action */}
                        <div className="shrink-0">
                          {m.status === 'pending' && isMyMatch && (
                            <button 
                              className="btn !bg-emerald-600 hover:!bg-emerald-500 !py-2 !px-4 text-xs font-black uppercase tracking-wider rounded-xl shadow-[0_0_15px_rgba(16,185,129,0.3)] animate-pulse flex items-center gap-1.5"
                              onClick={() => {
                                playFx('click');
                                // In a real flow, this would send an invite to the opponent or wait for them.
                                // Since we already have sendChallengeInvite, we can just use that mechanism.
                                // For simplicity, we just copy their name and go to Lobby to invite.
                                showAlert("Thách đấu", `Hãy Chat hẹn giờ và ấn vào tên ${m.p1 === currentUser ? m.p2 : m.p1} ở Kênh Chat Nhóm để gửi lời mời thách đấu!`);
                              }}
                            >
                              <Play size={14} /> Tới Lượt
                            </button>
                          )}
                          {m.status === 'completed' && <CheckCircle2 className="text-emerald-500 opacity-50" />}
                        </div>

                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB: CHAT */}
          {activeTab === 'chat' && (
            <div className="flex flex-col h-full animate-fade-in bg-black/40">
              <div className="p-4 border-b border-white/5 bg-black/60 flex items-center gap-3">
                <MessageSquare className="text-emerald-400" />
                <div>
                  <h3 className="font-bold text-white leading-tight">Phòng Thay Đồ</h3>
                  <p className="text-[10px] text-gray-500 uppercase">Kênh chat riêng của giải</p>
                </div>
              </div>

              <div 
                ref={chatRef}
                className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar"
              >
                {tournamentChat.length === 0 && (
                  <p className="text-center text-gray-600 text-sm italic mt-10">Hãy là người đầu tiên gửi tin nhắn...</p>
                )}
                {tournamentChat.map(msg => (
                  <div key={msg.id} className={`flex flex-col ${msg.sender === currentUser ? 'items-end' : msg.sender === 'HỆ THỐNG' ? 'items-center' : 'items-start'}`}>
                    {msg.sender === 'HỆ THỐNG' ? (
                      <span className="text-[10px] bg-yellow-500/10 text-yellow-500 px-3 py-1 rounded-full uppercase tracking-widest font-bold my-2 border border-yellow-500/20 text-center">
                        {msg.text}
                      </span>
                    ) : (
                      <>
                        <span className="text-[10px] text-gray-500 font-bold mb-0.5 ml-1">{msg.sender} • {getRelativeTime(msg.timestamp)}</span>
                        <div className={`px-4 py-2 rounded-2xl max-w-[80%] text-sm ${msg.sender === currentUser ? 'bg-emerald-600 text-white rounded-tr-sm' : 'bg-slate-800 text-gray-200 rounded-tl-sm border border-white/5'}`}>
                          {msg.text}
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>

              <form onSubmit={handleSendMessage} className="p-3 bg-black/60 border-t border-white/10 flex gap-2">
                <input
                  type="text"
                  className="flex-1 bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm"
                  placeholder="Nhắn tin cho nhóm giải..."
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                />
                <button 
                  type="submit"
                  disabled={!chatInput.trim()}
                  className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white w-10 h-10 rounded-xl flex items-center justify-center transition-colors shrink-0"
                >
                  <Send size={16} />
                </button>
              </form>
            </div>
          )}

          {/* TAB: SETTINGS */}
          {activeTab === 'settings' && (
            <div className="p-4 sm:p-6 flex flex-col h-full animate-fade-in">
              <h3 className="text-lg font-black uppercase tracking-widest text-slate-300 mb-6 flex items-center gap-2">
                <Settings size={20} className="text-slate-400" /> Quản lý giải đấu
              </h3>

              <div className="space-y-4 max-w-lg mx-auto w-full">
                {isHost && status === 'gathering' && (
                  <div className="p-5 bg-blue-900/20 border border-blue-500/30 rounded-2xl flex flex-col items-center text-center gap-3">
                    <Calendar className="text-blue-400" size={32} />
                    <div>
                      <h4 className="font-bold text-white">Chốt Danh Sách & Xếp Lịch</h4>
                      <p className="text-xs text-gray-400 mt-1">Sau khi bấm, giải đấu sẽ khóa danh sách tham gia và tạo lịch thi đấu vòng tròn.</p>
                    </div>
                    <button 
                      className="btn !bg-blue-600 hover:!bg-blue-500 w-full mt-2"
                      onClick={startTournament}
                    >
                      BẮT ĐẦU GIẢI ĐẤU
                    </button>
                  </div>
                )}

                {isHost && status === 'playing' && (
                  <div className="p-5 bg-yellow-900/20 border border-yellow-500/30 rounded-2xl flex flex-col items-center text-center gap-3">
                    <Trophy className="text-yellow-400" size={32} />
                    <div>
                      <h4 className="font-bold text-white">Kết Thúc & Trao Thưởng</h4>
                      <p className="text-xs text-gray-400 mt-1">Kết thúc giải ngay lập tức, vinh danh người đứng đầu bảng xếp hạng lên Tường.</p>
                    </div>
                    <button 
                      className="btn !bg-gradient-to-r from-yellow-600 to-amber-600 hover:from-yellow-500 hover:to-amber-500 text-white w-full mt-2"
                      onClick={handleEndTournament}
                    >
                      TRAO CÚP VÔ ĐỊCH
                    </button>
                  </div>
                )}

                <div className="p-5 bg-red-900/10 border border-red-500/20 rounded-2xl flex flex-col items-center text-center gap-3 mt-8">
                  <LogOut className="text-red-400" size={32} />
                  <div>
                    <h4 className="font-bold text-red-400">Rời Khỏi Giải</h4>
                    <p className="text-[10px] text-gray-500 mt-1 uppercase">
                      {status === 'playing' ? 'Cảnh báo: Rời giải bây giờ bạn sẽ bị xử thua 0-3 tất cả các trận còn lại!' : (isHost ? 'Cảnh báo: Bạn là Host, rời đi sẽ HỦY toàn bộ giải!' : 'Bạn có thể rời giải một cách an toàn lúc này.')}
                    </p>
                  </div>
                  <button 
                    className="btn !bg-red-900/50 hover:!bg-red-800 text-red-300 border border-red-500/30 w-full mt-2"
                    onClick={() => {
                      if (confirm("Bạn có chắc chắn muốn rời giải đấu này không?")) {
                        leaveTournament();
                        setGameState('lobby');
                      }
                    }}
                  >
                    Xác Nhận Rời Giải
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
