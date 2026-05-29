import React, { useState, useEffect } from 'react';
import { database, isConnectedToFirebase } from '../../firebase';
import { ref, get, set, update } from 'firebase/database';
import { useGameContext } from '../../context/GameContext';
import { Users, Settings, Ban, CheckCircle, Save } from 'lucide-react';
import { playFx } from '../../utils';

export function AdminScreen() {
  const { currentUser, setGameState, showAlert, gameConfig } = useGameContext();
  const [activeTab, setActiveTab] = useState('users'); // 'users' or 'config'
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Config state
  const [configForm, setConfigForm] = useState({
    initialCoins: 500,
    checkInRewardBase: 50
  });

  useEffect(() => {
    if (currentUser !== 'Solomon') {
      setGameState('lobby');
      return;
    }
    
    if (gameConfig) {
      setConfigForm({
        initialCoins: gameConfig.initialCoins || 500,
        checkInRewardBase: gameConfig.checkInRewardBase || 50
      });
    }

    fetchUsers();
  }, [currentUser, gameConfig]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const usersRef = ref(database, 'users');
      const snapshot = await get(usersRef);
      if (snapshot.exists()) {
        const data = snapshot.val();
        const usersList = Object.keys(data).map(key => ({
          username: key,
          ...data[key]
        }));
        // Sort by level descending
        usersList.sort((a, b) => (b.level || 0) - (a.level || 0));
        setUsers(usersList);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handleToggleBan = async (user) => {
    if (user.username === 'Solomon') {
      showAlert('Lỗi', 'Không thể khóa Super Admin!');
      return;
    }
    const isBanned = user.banned || false;
    const newBannedState = !isBanned;
    
    try {
      await update(ref(database, `/users/${user.username}`), {
        banned: newBannedState
      });
      showAlert('Thành Công', `Đã ${newBannedState ? 'KHÓA' : 'MỞ KHÓA'} tài khoản ${user.username}.`);
      fetchUsers(); // refresh list
    } catch (err) {
      showAlert('Lỗi', 'Có lỗi xảy ra khi cập nhật trạng thái.');
    }
  };

  const handleSaveConfig = async () => {
    try {
      await update(ref(database, '/config'), {
        initialCoins: Number(configForm.initialCoins),
        checkInRewardBase: Number(configForm.checkInRewardBase)
      });
      showAlert('Thành Công', 'Đã lưu cấu hình Game mới!');
    } catch (err) {
      showAlert('Lỗi', 'Lỗi khi lưu cấu hình.');
    }
  };

  if (currentUser !== 'Solomon') return null;

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col items-center mt-2 sm:mt-8 animate-fade-in px-1 sm:px-4 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between w-full mb-8">
        <button 
          className="btn !bg-gray-700 hover:!bg-gray-600 flex items-center gap-2 text-xs font-black uppercase tracking-wider !py-2 rounded-full border border-white/10" 
          onClick={() => { playFx('click'); setGameState('profile'); }}
        >
          ← Về Hồ Sơ
        </button>
        <h2 className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-rose-600 uppercase tracking-widest text-center">
          🛡️ Admin Panel
        </h2>
        <div className="w-24"></div> {/* spacer */}
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6">
        <button 
          className={`px-6 py-2 rounded-xl font-bold uppercase tracking-wider text-sm transition-all ${activeTab === 'users' ? 'bg-red-600 text-white shadow-lg shadow-red-900/50' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
          onClick={() => setActiveTab('users')}
        >
          <Users size={16} className="inline mr-2 -mt-1" /> Quản Lý User
        </button>
        <button 
          className={`px-6 py-2 rounded-xl font-bold uppercase tracking-wider text-sm transition-all ${activeTab === 'config' ? 'bg-red-600 text-white shadow-lg shadow-red-900/50' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
          onClick={() => setActiveTab('config')}
        >
          <Settings size={16} className="inline mr-2 -mt-1" /> Cấu Hình Game
        </button>
      </div>

      {/* Content */}
      <div className="glass-panel w-full p-6 rounded-3xl border border-white/10 shadow-2xl bg-black/40">
        
        {activeTab === 'users' && (
          <div className="w-full overflow-x-auto">
            {loading ? (
              <div className="text-center text-gray-400 py-10 animate-pulse">Đang tải dữ liệu...</div>
            ) : (
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-gray-400 uppercase tracking-widest text-[10px]">
                    <th className="pb-3 px-4 font-black">Tài Khoản</th>
                    <th className="pb-3 px-4 font-black text-center">Cấp Độ</th>
                    <th className="pb-3 px-4 font-black text-center">Xu</th>
                    <th className="pb-3 px-4 font-black text-center">Số Thẻ</th>
                    <th className="pb-3 px-4 font-black text-center">Trạng Thái</th>
                    <th className="pb-3 px-4 font-black text-center">Hành Động</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user, idx) => (
                    <tr key={user.username} className={`border-b border-white/5 hover:bg-white/5 transition-colors ${user.banned ? 'opacity-50' : ''}`}>
                      <td className="py-3 px-4 font-bold text-white flex items-center gap-2">
                        <span className="text-gray-500 w-4">{idx + 1}.</span> 
                        {user.username}
                        {user.username === 'Solomon' && <span className="bg-red-900 text-red-200 text-[8px] px-2 py-0.5 rounded-full ml-2 uppercase tracking-wider">Super Admin</span>}
                      </td>
                      <td className="py-3 px-4 text-center font-bold text-cyan-400">Lv.{user.level || 1}</td>
                      <td className="py-3 px-4 text-center font-bold text-yellow-400">{user.coins || 0}</td>
                      <td className="py-3 px-4 text-center font-bold text-fuchsia-400">{(user.collection || []).length} thẻ</td>
                      <td className="py-3 px-4 text-center">
                        {user.banned ? (
                          <span className="bg-red-900/50 text-red-400 border border-red-500/30 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider">Bị Khóa</span>
                        ) : (
                          <span className="bg-green-900/50 text-green-400 border border-green-500/30 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider">Bình Thường</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {user.username !== 'Solomon' && (
                          <button 
                            className={`btn !py-1 !px-3 text-[10px] rounded border uppercase font-bold tracking-widest ${user.banned ? '!bg-green-700 hover:!bg-green-600 border-green-500/50' : '!bg-red-700 hover:!bg-red-600 border-red-500/50'}`}
                            onClick={() => handleToggleBan(user)}
                          >
                            {user.banned ? <><CheckCircle size={12} className="inline mr-1 -mt-0.5"/> Mở Khóa</> : <><Ban size={12} className="inline mr-1 -mt-0.5"/> Khóa</>}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {activeTab === 'config' && (
          <div className="w-full max-w-2xl mx-auto flex flex-col gap-6 py-6">
            <div className="bg-black/30 p-6 rounded-2xl border border-white/5">
              <h3 className="text-lg font-black text-white uppercase tracking-wider mb-4 border-b border-white/10 pb-2">Tham Số Mặc Định</h3>
              
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Xu Khởi Tạo (Cho User Mới)</label>
                  <input 
                    type="number" 
                    className="auth-input !bg-slate-900 !border-slate-700 !text-white !p-3 rounded-xl focus:!border-red-500"
                    value={configForm.initialCoins}
                    onChange={e => setConfigForm({...configForm, initialCoins: e.target.value})}
                  />
                  <p className="text-[10px] text-gray-500">Số lượng Xu mặc định tặng cho người chơi khi họ mới tạo tài khoản.</p>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Thưởng Check-in (Xu Cơ Bản)</label>
                  <input 
                    type="number" 
                    className="auth-input !bg-slate-900 !border-slate-700 !text-white !p-3 rounded-xl focus:!border-red-500"
                    value={configForm.checkInRewardBase}
                    onChange={e => setConfigForm({...configForm, checkInRewardBase: e.target.value})}
                  />
                  <p className="text-[10px] text-gray-500">Mức Xu cơ bản cho phần thưởng điểm danh hàng ngày.</p>
                </div>
              </div>

              <div className="mt-8">
                <button 
                  className="btn !bg-red-600 hover:!bg-red-500 w-full !py-3 font-black text-sm uppercase tracking-widest rounded-xl shadow-lg shadow-red-900/40"
                  onClick={handleSaveConfig}
                >
                  <Save size={18} className="inline mr-2 -mt-1" /> Cập Nhật Cấu Hình Game
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
