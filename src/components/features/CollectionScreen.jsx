import React from 'react';
import { useGameContext } from '../../context/GameContext';
import { Card } from '../ui/SharedComponents';
import { playFx } from '../../utils';
import { Trash2 } from 'lucide-react';

export function CollectionScreen() {
  const { setGameState, collection, setCollection, squad, setSquad, setSelectedUpgradeCard, showAlert, currentUser } = useGameContext();

  const handleQuickDelete = (e, card) => {
    e.stopPropagation(); // Prevent opening the profile modal
    playFx('click');
    if (window.confirm(`Bạn có chắc chắn muốn bỏ thẻ ${card.name} khỏi bộ sưu tập? Hành động này không thể hoàn tác!`)) {
      const newCollection = collection.filter(c => c.id !== card.id);
      setCollection(newCollection);
      
      const inSquad = squad.some(s => s.id === card.id);
      if (inSquad) {
        const newSquad = squad.filter(s => s.id !== card.id);
        setSquad(newSquad);
        localStorage.setItem(`panini_${currentUser}_squad`, JSON.stringify(newSquad));
      }
      
      showAlert("🗑️ Đã Bỏ Thẻ!", `Thẻ ${card.name} đã bị xóa khỏi bộ sưu tập.`);
    }
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
    </div>
  );
}
