import React, { useState, useEffect } from 'react';
import { database, isConnectedToFirebase } from '../../firebase';
import { ref, get, set, update } from 'firebase/database';
import { useGameContext } from '../../context/GameContext';
import { Users, Settings, Ban, CheckCircle, Save, Edit, Key, Shield, Coins, Gift, TrendingUp, User, X } from 'lucide-react';
import { playFx, hashPIN } from '../../utils';

export function AdminScreen() {
  const { currentUser, setGameState, showAlert, gameConfig } = useGameContext();
  const [activeTab, setActiveTab] = useState('users'); 
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null); // For Modal
  
  // Search and Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'active', 'banned'

  // Config state
  const [configForm, setConfigForm] = useState({
    initialCoins: 500,
    checkInRewardBase: 50,
    matchWinCoins: 120,
    matchWinXp: 120,
    matchDrawCoins: 40,
    matchDrawXp: 50,
    matchLoseCoins: 25,
    matchLoseXp: 30,
    packCostStandard: 100,
    packCostPremium: 300,
    packCostUltimate: 600,
    packCostChampion: 1000
  });

  useEffect(() => {
    if (currentUser !== 'Solomon') {
      setGameState('lobby');
      return;
    }
    if (gameConfig) {
      setConfigForm({
        initialCoins: gameConfig.initialCoins || 500,
        checkInRewardBase: gameConfig.checkInRewardBase || 50,
        matchWinCoins: gameConfig.matchWinCoins || 120,
        matchWinXp: gameConfig.matchWinXp || 120,
        matchDrawCoins: gameConfig.matchDrawCoins || 40,
        matchDrawXp: gameConfig.matchDrawXp || 50,
        matchLoseCoins: gameConfig.matchLoseCoins || 25,
        matchLoseXp: gameConfig.matchLoseXp || 30,
        packCostStandard: gameConfig.packCostStandard || 100,
        packCostPremium: gameConfig.packCostPremium || 300,
        packCostUltimate: gameConfig.packCostUltimate || 600,
        packCostChampion: gameConfig.packCostChampion || 1000
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
      await update(ref(database, `/users/${user.username}`), { banned: newBannedState });
      showAlert('Thành Công', `Đã ${newBannedState ? 'KHÓA' : 'MỞ KHÓA'} tài khoản ${user.username}.`);
      fetchUsers();
    } catch (err) {
      showAlert('Lỗi', 'Có lỗi xảy ra khi cập nhật trạng thái.');
    }
  };

  const handleSaveConfig = async () => {
    try {
      await update(ref(database, '/config'), {
        initialCoins: Number(configForm.initialCoins),
        checkInRewardBase: Number(configForm.checkInRewardBase),
        matchWinCoins: Number(configForm.matchWinCoins),
        matchWinXp: Number(configForm.matchWinXp),
        matchDrawCoins: Number(configForm.matchDrawCoins),
        matchDrawXp: Number(configForm.matchDrawXp),
        matchLoseCoins: Number(configForm.matchLoseCoins),
        matchLoseXp: Number(configForm.matchLoseXp),
        packCostStandard: Number(configForm.packCostStandard),
        packCostPremium: Number(configForm.packCostPremium),
        packCostUltimate: Number(configForm.packCostUltimate),
        packCostChampion: Number(configForm.packCostChampion)
      });
      showAlert('Thành Công', 'Đã lưu cấu hình Game mới!');
    } catch (err) {
      showAlert('Lỗi', 'Lỗi khi lưu cấu hình.');
    }
  };

  const filteredUsers = users.filter(u => {
    if (filterStatus === 'banned' && !u.banned) return false;
    if (filterStatus === 'active' && u.banned) return false;
    if (searchQuery && !u.username.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

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
        <div className="w-24"></div> 
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
      <div className="glass-panel w-full p-6 rounded-3xl border border-white/10 shadow-2xl bg-black/40 relative">
        
        {activeTab === 'users' && (
          <div className="w-full flex flex-col gap-4">
            {/* Filter & Search Bar */}
            <div className="flex flex-col sm:flex-row gap-4 items-center bg-black/30 p-4 rounded-2xl border border-white/5">
              <input 
                type="text" 
                placeholder="🔍 Tìm tên HLV..." 
                className="w-full sm:w-64 bg-slate-900 border border-slate-700 text-white p-2.5 rounded-xl focus:border-red-500 text-sm"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
              <select 
                className="w-full sm:w-auto bg-slate-900 border border-slate-700 text-white p-2.5 rounded-xl focus:border-red-500 text-sm"
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="active">Bình thường</option>
                <option value="banned">Đã bị khóa</option>
              </select>
              <div className="text-xs text-gray-400 font-bold ml-auto">
                Hiển thị: {filteredUsers.length} HLV
              </div>
            </div>

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
                      <th className="pb-3 px-4 font-black text-center">Trạng Thái</th>
                      <th className="pb-3 px-4 font-black text-center">Hành Động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user, idx) => (
                    <tr key={user.username} className={`border-b border-white/5 hover:bg-white/5 transition-colors ${user.banned ? 'opacity-50' : ''}`}>
                      <td className="py-3 px-4 font-bold text-white flex items-center gap-2">
                        <span className="text-gray-500 w-4">{idx + 1}.</span> 
                        {user.username}
                        {user.username === 'Solomon' && <span className="bg-red-900 text-red-200 text-[8px] px-2 py-0.5 rounded-full ml-2 uppercase tracking-wider">Super Admin</span>}
                      </td>
                      <td className="py-3 px-4 text-center font-bold text-cyan-400">Lv.{user.level || 1}</td>
                      <td className="py-3 px-4 text-center font-bold text-yellow-400">{user.coins || 0}</td>
                      <td className="py-3 px-4 text-center">
                        {user.banned ? (
                          <span className="bg-red-900/50 text-red-400 border border-red-500/30 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider">Bị Khóa</span>
                        ) : (
                          <span className="bg-green-900/50 text-green-400 border border-green-500/30 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider">Bình Thường</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center flex justify-center gap-2">
                        <button 
                          className="btn !py-1 !px-3 text-[10px] rounded border uppercase font-bold tracking-widest !bg-blue-700 hover:!bg-blue-600 border-blue-500/50"
                          onClick={() => setSelectedUser(user)}
                        >
                          <Edit size={12} className="inline mr-1 -mt-0.5"/> Quản Lý
                        </button>
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
          </div>
        )}

        {activeTab === 'config' && (
          <div className="w-full max-w-4xl mx-auto flex flex-col gap-6 py-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* General Config */}
              <div className="bg-black/30 p-6 rounded-2xl border border-white/5">
                <h3 className="text-sm font-black text-white uppercase tracking-wider mb-4 border-b border-white/10 pb-2">Hệ Thống Cơ Bản</h3>
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Xu Khởi Tạo</label>
                    <input type="number" className="auth-input !bg-slate-900 !border-slate-700 !text-white !p-2 rounded-xl" value={configForm.initialCoins} onChange={e => setConfigForm({...configForm, initialCoins: e.target.value})} />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Thưởng Điểm Danh</label>
                    <input type="number" className="auth-input !bg-slate-900 !border-slate-700 !text-white !p-2 rounded-xl" value={configForm.checkInRewardBase} onChange={e => setConfigForm({...configForm, checkInRewardBase: e.target.value})} />
                  </div>
                </div>
              </div>

              {/* Pack Prices */}
              <div className="bg-black/30 p-6 rounded-2xl border border-fuchsia-500/20">
                <h3 className="text-sm font-black text-fuchsia-400 uppercase tracking-wider mb-4 border-b border-fuchsia-500/20 pb-2">Giá Mua Thẻ (Xu)</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Tiêu Chuẩn</label>
                    <input type="number" className="auth-input !bg-slate-900 !border-slate-700 !text-white !p-2 rounded-xl" value={configForm.packCostStandard} onChange={e => setConfigForm({...configForm, packCostStandard: e.target.value})} />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Cao Cấp</label>
                    <input type="number" className="auth-input !bg-slate-900 !border-slate-700 !text-white !p-2 rounded-xl" value={configForm.packCostPremium} onChange={e => setConfigForm({...configForm, packCostPremium: e.target.value})} />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Tuyển Chọn</label>
                    <input type="number" className="auth-input !bg-slate-900 !border-slate-700 !text-white !p-2 rounded-xl" value={configForm.packCostUltimate} onChange={e => setConfigForm({...configForm, packCostUltimate: e.target.value})} />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Vô Địch</label>
                    <input type="number" className="auth-input !bg-slate-900 !border-slate-700 !text-white !p-2 rounded-xl" value={configForm.packCostChampion} onChange={e => setConfigForm({...configForm, packCostChampion: e.target.value})} />
                  </div>
                </div>
              </div>

              {/* Match Rewards */}
              <div className="bg-black/30 p-6 rounded-2xl border border-blue-500/20 md:col-span-2">
                <h3 className="text-sm font-black text-blue-400 uppercase tracking-wider mb-4 border-b border-blue-500/20 pb-2">Thưởng Đá Trận PvP (Xu / XP)</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  
                  {/* Win */}
                  <div className="flex flex-col gap-3 bg-green-950/20 p-4 rounded-xl border border-green-500/20">
                    <div className="font-bold text-green-400 text-sm uppercase text-center mb-2">Thắng Trận</div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold w-6 text-yellow-400">Xu:</span>
                      <input type="number" className="w-full bg-slate-900 border border-slate-700 text-white p-2 rounded-lg text-sm" value={configForm.matchWinCoins} onChange={e => setConfigForm({...configForm, matchWinCoins: e.target.value})} />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold w-6 text-indigo-400">XP:</span>
                      <input type="number" className="w-full bg-slate-900 border border-slate-700 text-white p-2 rounded-lg text-sm" value={configForm.matchWinXp} onChange={e => setConfigForm({...configForm, matchWinXp: e.target.value})} />
                    </div>
                  </div>

                  {/* Draw */}
                  <div className="flex flex-col gap-3 bg-yellow-950/20 p-4 rounded-xl border border-yellow-500/20">
                    <div className="font-bold text-yellow-400 text-sm uppercase text-center mb-2">Hòa Trận</div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold w-6 text-yellow-400">Xu:</span>
                      <input type="number" className="w-full bg-slate-900 border border-slate-700 text-white p-2 rounded-lg text-sm" value={configForm.matchDrawCoins} onChange={e => setConfigForm({...configForm, matchDrawCoins: e.target.value})} />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold w-6 text-indigo-400">XP:</span>
                      <input type="number" className="w-full bg-slate-900 border border-slate-700 text-white p-2 rounded-lg text-sm" value={configForm.matchDrawXp} onChange={e => setConfigForm({...configForm, matchDrawXp: e.target.value})} />
                    </div>
                  </div>

                  {/* Lose */}
                  <div className="flex flex-col gap-3 bg-red-950/20 p-4 rounded-xl border border-red-500/20">
                    <div className="font-bold text-red-400 text-sm uppercase text-center mb-2">Thua Trận</div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold w-6 text-yellow-400">Xu:</span>
                      <input type="number" className="w-full bg-slate-900 border border-slate-700 text-white p-2 rounded-lg text-sm" value={configForm.matchLoseCoins} onChange={e => setConfigForm({...configForm, matchLoseCoins: e.target.value})} />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold w-6 text-indigo-400">XP:</span>
                      <input type="number" className="w-full bg-slate-900 border border-slate-700 text-white p-2 rounded-lg text-sm" value={configForm.matchLoseXp} onChange={e => setConfigForm({...configForm, matchLoseXp: e.target.value})} />
                    </div>
                  </div>

                </div>
              </div>

            </div>

            <div className="mt-4">
              <button 
                className="btn !bg-red-600 hover:!bg-red-500 w-full !py-3 font-black text-sm uppercase tracking-widest rounded-xl shadow-lg shadow-red-900/40"
                onClick={handleSaveConfig}
              >
                <Save size={18} className="inline mr-2 -mt-1" /> Cập Nhật Cấu Hình Game
              </button>
            </div>
          </div>
        )}

      </div>

      {/* User Management Modal */}
      {selectedUser && (
        <AdminUserModal 
          user={selectedUser} 
          onClose={() => { setSelectedUser(null); fetchUsers(); }} 
          showAlert={showAlert} 
        />
      )}
    </div>
  );
}

// -------------------------------------------------------------
// Helper Component: Admin User Management Modal
// -------------------------------------------------------------
function AdminUserModal({ user, onClose, showAlert }) {
  const [coins, setCoins] = useState(user.coins || 0);
  const [level, setLevel] = useState(user.level || 1);
  const [xp, setXp] = useState(user.xp || 0);
  const [freePacks, setFreePacks] = useState(user.freePacks || 0);
  const [newPassword, setNewPassword] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleUpdateStats = async () => {
    setIsProcessing(true);
    try {
      await update(ref(database, `/users/${user.username}`), {
        coins: Number(coins),
        level: Number(level),
        xp: Number(xp),
        freePacks: Number(freePacks)
      });
      showAlert('Thành Công', `Đã cập nhật chỉ số cho ${user.username}`);
    } catch (err) {
      showAlert('Lỗi', 'Không thể cập nhật chỉ số.');
    }
    setIsProcessing(false);
  };

  const handleResetPassword = async () => {
    if (!newPassword || newPassword.length < 4) {
      showAlert('Lỗi', 'Mật khẩu phải có ít nhất 4 ký tự!');
      return;
    }
    setIsProcessing(true);
    try {
      const hashedNew = await hashPIN(newPassword);
      await update(ref(database, `/users/${user.username}`), {
        pin: hashedNew,
        password: hashedNew
      });
      showAlert('Thành Công', `Đã đổi mật khẩu cho HLV ${user.username}.`);
      setNewPassword('');
    } catch (err) {
      showAlert('Lỗi', 'Không thể đổi mật khẩu.');
    }
    setIsProcessing(false);
  };

  const handleRename = async () => {
    if (user.username === 'Solomon') {
      showAlert('Lỗi', 'Không thể đổi tên Super Admin!');
      return;
    }
    const targetName = newUsername.trim();
    if (!targetName || targetName.length < 2) {
      showAlert('Lỗi', 'Tên quá ngắn!');
      return;
    }
    if (targetName === user.username) return;
    
    setIsProcessing(true);
    try {
      const oldLower = user.username.toLowerCase();
      const newLower = targetName.toLowerCase();
      
      const checkSnap = await get(ref(database, `/usernames/${newLower}`));
      if (checkSnap.exists()) {
        showAlert('Lỗi', 'Tên này đã có người sử dụng!');
        setIsProcessing(false);
        return;
      }

      // Fetch all related data
      const oldUserRef = ref(database, `/users/${user.username}`);
      const oldLeaderboardRef = ref(database, `/leaderboard/${user.username}`);
      const oldHistoryRef = ref(database, `/pvp_history/${user.username}`);
      const oldWallRef = ref(database, `/user_walls/${user.username}`);
      
      const [userSnap, leaderboardSnap, historySnap, wallSnap] = await Promise.all([
        get(oldUserRef), get(oldLeaderboardRef), get(oldHistoryRef), get(oldWallRef)
      ]);
      
      if (!userSnap.exists()) {
        showAlert('Lỗi', 'Dữ liệu HLV không tồn tại.');
        setIsProcessing(false);
        return;
      }
      
      const userData = userSnap.val();
      userData.username = targetName;
      
      const updates = {};
      updates[`/users/${targetName}`] = userData;
      updates[`/users/${user.username}`] = null;
      updates[`/usernames/${newLower}`] = targetName;
      updates[`/usernames/${oldLower}`] = null;
      
      if (leaderboardSnap.exists()) {
        updates[`/leaderboard/${targetName}`] = leaderboardSnap.val();
        updates[`/leaderboard/${user.username}`] = null;
      }
      if (historySnap.exists()) {
        updates[`/pvp_history/${targetName}`] = historySnap.val();
        updates[`/pvp_history/${user.username}`] = null;
      }
      if (wallSnap.exists()) {
        updates[`/user_walls/${targetName}`] = wallSnap.val();
        updates[`/user_walls/${user.username}`] = null;
      }

      await update(ref(database), updates);
      showAlert('Thành Công', `Đã đổi tên HLV từ ${user.username} thành ${targetName}`);
      onClose();
    } catch (err) {
      console.error(err);
      showAlert('Lỗi', 'Có lỗi khi đổi tên HLV.');
    }
    setIsProcessing(false);
  };

  const joinDate = user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Không rõ';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="glass-panel w-full max-w-3xl rounded-3xl border border-white/10 shadow-2xl bg-slate-950 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-black/40 rounded-t-3xl">
          <h3 className="font-black text-xl text-white uppercase tracking-wider flex items-center gap-2">
            <User className="text-blue-400" /> Quản Lý HLV: <span className="text-cyan-400">{user.username}</span>
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto flex-1 custom-scrollbar space-y-6">
          
          {/* Section 1: Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-black/30 p-4 rounded-2xl border border-white/5 text-center">
              <div className="text-[10px] text-gray-500 font-bold uppercase mb-1">Ngày Tham Gia</div>
              <div className="font-black text-sm text-white">{joinDate}</div>
            </div>
            <div className="bg-black/30 p-4 rounded-2xl border border-white/5 text-center">
              <div className="text-[10px] text-gray-500 font-bold uppercase mb-1">Tổng Trận</div>
              <div className="font-black text-xl text-white">{user.stats?.played || 0}</div>
            </div>
            <div className="bg-black/30 p-4 rounded-2xl border border-white/5 text-center">
              <div className="text-[10px] text-gray-500 font-bold uppercase mb-1">Tỉ Lệ Thắng</div>
              <div className="font-black text-xl text-green-400">
                {user.stats?.played > 0 ? Math.round((user.stats.wins / user.stats.played) * 100) : 0}%
              </div>
            </div>
            <div className="bg-black/30 p-4 rounded-2xl border border-white/5 text-center">
              <div className="text-[10px] text-gray-500 font-bold uppercase mb-1">Tổng Thẻ</div>
              <div className="font-black text-xl text-fuchsia-400">{(user.collection || []).length}</div>
            </div>
          </div>

          {/* Section 2: Update Resources */}
          <div className="bg-slate-900/50 p-6 rounded-2xl border border-blue-500/20 shadow-[inset_0_0_20px_rgba(59,130,246,0.1)]">
            <h4 className="font-black uppercase text-xs text-blue-400 tracking-widest border-b border-blue-500/20 pb-2 mb-4 flex items-center gap-2">
              <TrendingUp size={14} /> Chỉnh Sửa Tài Nguyên
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div>
                <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1 block">Xu (Coins)</label>
                <div className="flex items-center gap-2 bg-black/50 p-1.5 rounded-lg border border-white/10">
                  <Coins size={14} className="text-yellow-400 ml-2" />
                  <input type="number" className="bg-transparent text-white font-bold w-full focus:outline-none" value={coins} onChange={e => setCoins(e.target.value)} />
                </div>
              </div>
              <div>
                <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1 block">Gói Quà (Packs)</label>
                <div className="flex items-center gap-2 bg-black/50 p-1.5 rounded-lg border border-white/10">
                  <Gift size={14} className="text-fuchsia-400 ml-2" />
                  <input type="number" className="bg-transparent text-white font-bold w-full focus:outline-none" value={freePacks} onChange={e => setFreePacks(e.target.value)} />
                </div>
              </div>
              <div>
                <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1 block">Cấp Độ (Level)</label>
                <div className="flex items-center gap-2 bg-black/50 p-1.5 rounded-lg border border-white/10">
                  <Shield size={14} className="text-cyan-400 ml-2" />
                  <input type="number" className="bg-transparent text-white font-bold w-full focus:outline-none" value={level} onChange={e => setLevel(e.target.value)} />
                </div>
              </div>
              <div>
                <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1 block">Điểm XP</label>
                <div className="flex items-center gap-2 bg-black/50 p-1.5 rounded-lg border border-white/10">
                  <span className="text-indigo-400 ml-2 font-black text-[10px]">XP</span>
                  <input type="number" className="bg-transparent text-white font-bold w-full focus:outline-none" value={xp} onChange={e => setXp(e.target.value)} />
                </div>
              </div>
            </div>
            <button 
              className="btn !bg-blue-600 hover:!bg-blue-500 w-full !py-2.5 text-xs font-black uppercase tracking-widest rounded-xl"
              onClick={handleUpdateStats} disabled={isProcessing}
            >
              Lưu Tài Nguyên
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Section 3: Reset Password */}
            <div className="bg-red-950/20 p-6 rounded-2xl border border-red-500/20">
              <h4 className="font-black uppercase text-xs text-red-400 tracking-widest border-b border-red-500/20 pb-2 mb-4 flex items-center gap-2">
                <Key size={14} /> Đổi Mật Khẩu / PIN
              </h4>
              <div className="flex flex-col gap-3">
                <input 
                  type="text" 
                  placeholder="Nhập PIN hoặc Mật Khẩu mới" 
                  className="auth-input !bg-black/50 !border-red-500/30 !text-white !p-3 rounded-xl focus:!border-red-500"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                />
                <button 
                  className="btn !bg-red-700 hover:!bg-red-600 w-full !py-2.5 text-xs font-black uppercase tracking-widest rounded-xl"
                  onClick={handleResetPassword} disabled={isProcessing}
                >
                  Đổi Mật Khẩu
                </button>
              </div>
            </div>

            {/* Section 4: Rename User */}
            <div className="bg-amber-950/20 p-6 rounded-2xl border border-amber-500/20">
              <h4 className="font-black uppercase text-xs text-amber-400 tracking-widest border-b border-amber-500/20 pb-2 mb-4 flex items-center gap-2">
                <Edit size={14} /> Đổi Tên HLV
              </h4>
              <div className="flex flex-col gap-3">
                <input 
                  type="text" 
                  placeholder="Nhập tên mới..." 
                  className="auth-input !bg-black/50 !border-amber-500/30 !text-white !p-3 rounded-xl focus:!border-amber-500"
                  value={newUsername}
                  onChange={e => setNewUsername(e.target.value)}
                />
                <button 
                  className="btn !bg-amber-700 hover:!bg-amber-600 w-full !py-2.5 text-xs font-black uppercase tracking-widest rounded-xl"
                  onClick={handleRename} disabled={isProcessing}
                >
                  Xác Nhận Đổi Tên
                </button>
              </div>
              <p className="text-[9px] text-gray-500 mt-2 leading-tight">Lưu ý: Quá trình này sẽ dời toàn bộ dữ liệu của HLV sang tên mới. HLV có thể bị văng khỏi game nếu đang online.</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
