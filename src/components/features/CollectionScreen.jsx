import React from 'react';
import { useGameContext } from '../../context/GameContext';
import { Card } from '../ui/SharedComponents';
import { playFx } from '../../utils';
import { Trash2 } from 'lucide-react';

export function CollectionScreen() {
  const { setGameState, collection, setCollection, squad, setSquad, setSelectedUpgradeCard, showAlert, currentUser } = useGameContext();

  const [confirmDeleteCard, setConfirmDeleteCard] = React.useState(null);

  const handleQuickDelete = (e, card) => {
    e.stopPropagation(); // Prevent opening the profile modal
    playFx('click');
    setConfirmDeleteCard(card);
  };

  const executeDelete = () => {
    if (!confirmDeleteCard) return;
    const card = confirmDeleteCard;
    const newCollection = collection.filter(c => c.id !== card.id);
    setCollection(newCollection);
    
    const inSquad = squad.some(s => s.id === card.id);
    if (inSquad) {
      const newSquad = squad.filter(s => s.id !== card.id);
      setSquad(newSquad);
      localStorage.setItem(`panini_${currentUser}_squad`, JSON.stringify(newSquad));
    }
    
    showAlert("🗑️ Đã Bỏ Thẻ!", `Thẻ ${card.name} đã bị xóa khỏi bộ sưu tập.`);
    setConfirmDeleteCard(null);
  };

  return (
    <div className="collection-screen relative z-10 p-4 sm:p-8 pt-20 min-h-screen flex flex-col">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4 bg-black/50 p-4 rounded-2xl border border-white/10">
        <button className="btn !bg-fuchsia-600 hover:!bg-fuchsia-500 !py-2 !px-4 text-sm whitespace-nowrap" onClick={() => {
          playFx('click');
          setGameState('lobby');
        }}>
          ← Về Sảnh
        </button>
        <h2 className="text-xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-300 to-fuchsia-500 drop-shadow-[0_2px_10px_rgba(217,70,239,0.3)]">Bộ Sưu Tập Của Bạn</h2>
        <div className="flex gap-4 items-center bg-black/60 px-4 py-2 rounded-xl border border-white/10">
          <span className="text-lg sm:text-xl font-bold text-fuchsia-400">Tổng thẻ: <span className="text-white">{collection.length}</span></span>
        </div>
      </div>
      
      <div className="bg-black/40 rounded-[2rem] border border-white/10 p-6 flex-1 min-h-[500px]">
        {collection.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <div className="text-6xl mb-4">📭</div>
            <h3 className="text-2xl font-bold text-white mb-2">Bộ sưu tập trống</h3>
            <p className="text-gray-400 max-w-md">Bạn chưa có thẻ cầu thủ nào. Hãy quay lại Sảnh và mở thẻ để bắt đầu xây dựng đội hình nhé!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 overflow-y-auto max-h-[70vh] pr-2 custom-scrollbar pb-12">
            {collection.map(card => {
              const inSquad = squad.some(s => s.id === card.id);
              return (
                <div key={card.id} className="relative group">
                  <Card player={card} isSelectable onClick={() => setSelectedUpgradeCard(card)} />
                  {inSquad && (
                    <div className="absolute top-2 right-2 bg-blue-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full z-10 shadow-lg border border-blue-300">
                      ĐANG ĐÁ
                    </div>
                  )}
                  {/* Quick Delete Button */}
                  <button 
                    onClick={(e) => handleQuickDelete(e, card)}
                    className="absolute top-2 left-2 bg-red-600/80 hover:bg-red-500 text-white p-1.5 rounded-full z-10 shadow-lg border border-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Xóa thẻ này"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {confirmDeleteCard && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 animate-fade-in backdrop-blur-sm">
          <div className="bg-white rounded-[2rem] p-8 max-w-sm w-full shadow-[0_0_50px_rgba(255,255,255,0.1)] transform animate-scale-in">
            <h3 className="text-lg font-bold text-gray-900 mb-2">thebongda.vinhninh.com cho biết</h3>
            <p className="text-gray-700 text-sm leading-relaxed mb-8">
              Bạn có chắc chắn muốn bỏ thẻ {confirmDeleteCard.name} khỏi bộ sưu tập? Hành động này không thể hoàn tác!
            </p>
            <div className="flex justify-end gap-3 mt-4">
              <button 
                onClick={executeDelete}
                className="px-8 py-2.5 rounded-full bg-[#1a56db] text-white font-bold text-sm hover:bg-blue-700 transition-colors outline outline-2 outline-offset-2 outline-[#1a56db]"
              >
                OK
              </button>
              <button 
                onClick={() => setConfirmDeleteCard(null)}
                className="px-6 py-2.5 rounded-full bg-[#dce4fb] text-[#1e3a8a] font-bold text-sm hover:bg-[#c6d3f8] transition-colors"
              >
                Huỷ
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
