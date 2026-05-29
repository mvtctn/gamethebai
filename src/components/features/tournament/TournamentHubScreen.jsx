import React, { useState } from 'react';
import { Trophy, ChevronLeft, Plus, LogIn, Users } from 'lucide-react';
import { useGameContext } from '../../../context/GameContext';

export function TournamentHubScreen() {
  const {
    setGameState,
    createTournament,
    joinTournament,
    loading,
    activeTournamentId
  } = useGameContext();

  const [joinId, setJoinId] = useState('');
  const [createName, setCreateName] = useState('');
  const [createFormat, setCreateFormat] = useState('single');
  const [activeTab, setActiveTab] = useState('join'); // 'join' or 'create'

  // If already in a tournament, automatically route to dashboard
  React.useEffect(() => {
    if (activeTournamentId) {
      setGameState('tournamentDashboard');
    }
  }, [activeTournamentId, setGameState]);

  return (
    <div className="relative z-10 p-4 sm:p-8 pt-20 min-h-screen flex flex-col max-w-4xl mx-auto w-full animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-center mb-8 gap-4 bg-black/60 p-5 rounded-3xl border border-white/10 shadow-lg">
        <button 
          className="btn !bg-blue-600 hover:!bg-blue-500 !py-2 !px-4 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 rounded-full"
          onClick={() => setGameState('lobby')}
        >
          <ChevronLeft size={16} /> Về Sảnh
        </button>
        <h2 className="text-xl sm:text-3xl font-black uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-600 flex items-center gap-3">
          <Trophy className="text-yellow-500" /> GIẢI ĐẤU
        </h2>
        <div className="w-[100px]"></div> {/* Spacer for centering */}
      </div>

      <div className="glass-panel p-6 sm:p-10 rounded-3xl border border-white/10 flex flex-col gap-6 relative overflow-hidden bg-gradient-to-b from-slate-900 to-black">
        {/* Tabs */}
        <div className="flex gap-2 p-1 bg-black/40 rounded-2xl border border-white/5">
          <button
            className={`flex-1 py-3 font-bold text-sm sm:text-base uppercase tracking-widest rounded-xl transition-all ${activeTab === 'join' ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}
            onClick={() => setActiveTab('join')}
          >
            <LogIn size={18} className="inline-block mr-2" /> Tham Gia Giải
          </button>
          <button
            className={`flex-1 py-3 font-bold text-sm sm:text-base uppercase tracking-widest rounded-xl transition-all ${activeTab === 'create' ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}
            onClick={() => setActiveTab('create')}
          >
            <Plus size={18} className="inline-block mr-2" /> Tạo Giải Mới
          </button>
        </div>

        {/* Tab Content */}
        <div className="mt-4">
          {activeTab === 'join' && (
            <div className="flex flex-col gap-5 items-center max-w-md mx-auto w-full animate-slide-up">
              <Users size={64} className="text-blue-400 mb-2 opacity-80" />
              <p className="text-gray-400 text-center text-sm">Nhập mã giải đấu do bạn bè hoặc Host cung cấp để tham gia tranh tài.</p>
              <input
                type="text"
                className="w-full bg-black/50 border border-white/20 rounded-2xl p-4 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-center font-mono text-xl uppercase tracking-widest"
                placeholder="VD: T-ABCDEF"
                value={joinId}
                onChange={e => setJoinId(e.target.value)}
              />
              <button 
                className="btn !bg-blue-600 hover:!bg-blue-500 w-full py-4 text-lg font-black uppercase tracking-widest rounded-2xl shadow-blue-500/20 disabled:opacity-50"
                onClick={() => joinTournament(joinId.trim())}
                disabled={loading || !joinId.trim()}
              >
                {loading ? 'Đang xử lý...' : 'Tham Gia Ngay'}
              </button>
            </div>
          )}

          {activeTab === 'create' && (
            <div className="flex flex-col gap-5 items-center max-w-md mx-auto w-full animate-slide-up">
              <Trophy size={64} className="text-emerald-400 mb-2 opacity-80" />
              <p className="text-gray-400 text-center text-sm">Tạo một giải đấu mới và mời bạn bè cùng tham gia tranh ngôi vô địch.</p>
              
              <div className="w-full space-y-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block ml-1">Tên Giải Đấu</label>
                  <input
                    type="text"
                    className="w-full bg-black/50 border border-white/20 rounded-2xl p-4 text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-center font-bold"
                    placeholder="Giải Ngoại Hạng Nhí"
                    value={createName}
                    onChange={e => setCreateName(e.target.value)}
                    maxLength={30}
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block ml-1">Thể Thức Thi Đấu</label>
                  <div className="flex gap-2">
                    <button 
                      className={`flex-1 py-3 rounded-xl font-bold text-sm border ${createFormat === 'single' ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' : 'bg-black/40 border-white/10 text-gray-400'}`}
                      onClick={() => setCreateFormat('single')}
                    >
                      Đá 1 Lượt
                    </button>
                    <button 
                      className={`flex-1 py-3 rounded-xl font-bold text-sm border ${createFormat === 'double' ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' : 'bg-black/40 border-white/10 text-gray-400'}`}
                      onClick={() => setCreateFormat('double')}
                    >
                      Đá 2 Lượt (Đi & Về)
                    </button>
                  </div>
                </div>
              </div>

              <button 
                className="btn !bg-emerald-600 hover:!bg-emerald-500 w-full py-4 text-lg font-black uppercase tracking-widest rounded-2xl shadow-emerald-500/20 disabled:opacity-50 mt-2"
                onClick={() => createTournament(createName.trim() || 'Giải Đấu Mới', createFormat)}
                disabled={loading}
              >
                {loading ? 'Đang tạo...' : 'Tạo Giải Đấu'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
