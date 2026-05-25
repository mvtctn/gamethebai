import React, { useEffect } from 'react';

export const MatchHistoryModal = ({ history, onClose }) => {
  // Global Escape Key Handler for this Modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!history || history.length === 0) return null;

  const wins = history.filter(h => h.result === 'win').length;
  const losses = history.filter(h => h.result === 'loss').length;
  const draws = history.filter(h => h.result === 'draw').length;

  return (
    <div 
      className="fixed inset-0 z-[250] flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="glass-panel p-6 sm:p-8 rounded-[2.5rem] w-full max-w-4xl max-h-[90vh] flex flex-col relative bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950/80 shadow-[0_0_80px_rgba(30,58,138,0.5)] border border-white/10 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          className="absolute top-4 right-4 text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 p-2 rounded-full w-8 h-8 flex items-center justify-center transition-colors border border-white/10 z-[260] cursor-pointer"
          onClick={onClose}
        >
          ✕
        </button>

        <div className="text-center mb-6">
          <h2 className="text-2xl sm:text-3xl font-black uppercase text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 tracking-widest drop-shadow-md">Lịch Sử Trận Đấu</h2>
          <div className="flex items-center justify-center gap-4 mt-2 font-bold text-sm sm:text-base">
            <span className="text-green-400">Thắng: {wins}</span>
            <span className="text-gray-500">Hòa: {draws}</span>
            <span className="text-red-400">Thua: {losses}</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar flex flex-col gap-3">
          {history.map((round, idx) => (
            <div key={idx} className={`p-4 rounded-2xl border ${round.result === 'win' ? 'border-green-500/30 bg-green-950/20' : round.result === 'loss' ? 'border-red-500/30 bg-red-950/20' : 'border-gray-500/30 bg-gray-900/40'} flex flex-col sm:flex-row items-center gap-4`}>
              {/* Round number */}
              <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center bg-black/40 rounded-full font-black text-xl text-gray-400">
                {idx + 1}
              </div>

              {/* Matchup */}
              <div className="flex-1 flex w-full justify-between items-center gap-2">
                {/* My Side */}
                <div className="flex flex-col items-center sm:items-start text-center sm:text-left flex-1 min-w-0">
                  <div className="text-xs sm:text-sm font-bold text-gray-400 uppercase truncate w-full">{round.myStat}</div>
                  <div className="font-black text-white text-base sm:text-lg truncate w-full">{round.myCardName}</div>
                  <div className="text-[10px] sm:text-xs text-blue-300 mt-1 whitespace-pre-wrap">{round.myBonusDetails}</div>
                </div>

                {/* Score */}
                <div className="flex-shrink-0 flex flex-col items-center justify-center px-2">
                  <div className="flex items-center gap-3 font-black text-2xl sm:text-3xl">
                    <span className={round.result === 'win' ? 'text-green-400 drop-shadow-[0_0_10px_rgba(74,222,128,0.8)]' : 'text-gray-300'}>{round.myFinalVal}</span>
                    <span className="text-gray-600 text-lg">VS</span>
                    <span className={round.result === 'loss' ? 'text-red-400 drop-shadow-[0_0_10px_rgba(248,113,113,0.8)]' : 'text-gray-300'}>{round.opFinalVal}</span>
                  </div>
                  <div className={`text-xs font-black uppercase tracking-widest mt-1 ${round.result === 'win' ? 'text-green-500' : round.result === 'loss' ? 'text-red-500' : 'text-gray-500'}`}>
                    {round.result === 'win' ? 'Thắng' : round.result === 'loss' ? 'Thua' : 'Hòa'}
                  </div>
                </div>

                {/* Op Side */}
                <div className="flex flex-col items-center sm:items-end text-center sm:text-right flex-1 min-w-0">
                  <div className="text-xs sm:text-sm font-bold text-gray-400 uppercase truncate w-full">{round.opStat}</div>
                  <div className="font-black text-white text-base sm:text-lg truncate w-full">{round.opCardName}</div>
                  <div className="text-[10px] sm:text-xs text-red-300 mt-1 whitespace-pre-wrap">{round.opBonusDetails}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
