import React, { useState } from 'react';
import { BANNERS } from '../../constants';

export const ShareModal = ({ data, currentUser, isConnectedToFirebase, showAlert, playFx, onClose }) => {
  if (!data) return null;
  const { type, result, myScore, opponentScore, opponentName } = data;
  const isWin = result === 'win';
  const isLose = result === 'lose';
  const isDraw = result === 'draw';

  let initialBannerIdx = 0;
  if (isWin) initialBannerIdx = 0;
  else if (isDraw) initialBannerIdx = 2;
  else initialBannerIdx = 4;
  
  const [selectedBannerIdx, setSelectedBannerIdx] = useState(initialBannerIdx);
  const [copied, setCopied] = useState(false);

  const generatePostText = () => {
    if (type === 'ai') {
      if (isWin) {
        return `🔥 KỶ LỤC MỚI ĐÃ ĐƯỢC THIẾT LẬP! Đội bóng siêu cấp của tôi vừa đánh bại AI trong Ultimate Card World Cup 2026 với tỷ số sát nút ${myScore} - ${opponentScore}! 🏆⚽ HLV [${currentUser}] đang bất bại! Bạn có dám thách đấu tôi không? Hãy tham gia mở gói thẻ Panini, xây dựng Dream Team của bạn ngay hôm nay! #PaniniWorldCup2026 #UltimateCard #DreamTeam #GameTheBai`;
      } else if (isDraw) {
        return `🤝 KỊCH TÍNH ĐẾN PHÚT CHÓT! Trận đấu nghẹt thở giữa tôi và AI trên Ultimate Card World Cup 2026 kết thúc với tỷ số hòa ${myScore} - ${opponentScore}! Một cuộc đối đầu chiến thuật đỉnh cao, rượt đuổi tỷ số từng lá bài! Hãy tham gia mở thẻ Panini và tự mình thử sức ngay! #PaniniWorldCup2026 #NgangTaiNgangSuc #UltimateCard`;
      } else {
        return `😤 THU KEO NÀY BÀY KEO KHÁC! Trận đấu đầy kịch tính vừa qua tôi đã để sảy chân trước AI với tỷ số sát nút ${myScore} - ${opponentScore}. Nhưng tôi sẽ trở lại mạnh mẽ hơn sau khi nâng cấp đội hình siêu sao! Mở gói thẻ ngay nào! #PaniniWorldCup2026 #UltimateCard #NeverGiveUp`;
      }
    } else {
      if (isWin) {
        return `⚔️ THÁCH THỨC ĐÃ ĐƯỢC GIẢI QUYẾT! Trong trận chiến PvP nghẹt thở trên Ultimate Card World Cup 2026, Dream Team của tôi vừa đè bẹp HLV [${opponentName}] với tỷ số vang dội ${myScore} - ${opponentScore}! 🏆🔥 Ai sẽ là đối thủ tiếp theo dám cản bước tôi? Xây đội hình và thách đấu ngay! #PaniniWorldCup2026 #PvPOnline #DreamTeam #BietKichSanCo`;
      } else if (isDraw) {
        return `🤝 NGANG TÀI NGANG SỨC! Trận đấu kinh điển giữa tôi và HLV [${opponentName}] trên Ultimate Card World Cup 2026 kết thúc với tỷ số hòa đẹp mắt ${myScore} - ${opponentScore}! Một cuộc đối đầu chiến thuật đỉnh cao giữa các HLV hàng đầu! Hãy tham gia mở thẻ Panini và thách đấu chéo ngay! #PaniniWorldCup2026 #DrawMatch #PvpOnline #UltimateCard`;
      } else {
        return `🔥 TRẬN ĐẤU CỰC KỲ MÃN NHÃN! Dù đã cố gắng hết sức chiến đấu từng lượt thẻ nhưng tôi đã tạm thời nhận thất bại trước HLV [${opponentName}] với tỷ số ${myScore} - ${opponentScore}. Tôi sẽ nâng cấp đội hình và phục thù sớm thôi! #PaniniWorldCup2026 #PvpOnline #NeverGiveUp #UltimateCard`;
      }
    }
  };

  const [postText, setPostText] = useState(generatePostText);

  const handleCopy = () => {
    navigator.clipboard.writeText(postText);
    setCopied(true);
    playFx('winPoint');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Ultimate Card World Cup 2026',
          text: postText,
          url: 'https://thebongda.vinhninh.com'
        });
      } catch (err) {
        console.log('User share error:', err);
      }
    } else {
      handleCopy();
      showAlert('📢 Sao chép thành công!', 'Hệ thống đã tự động sao chép mô tả. Hãy dán trực tiếp lên Mạng xã hội của bạn nhé!');
    }
  };

  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=https://thebongda.vinhninh.com&quote=${encodeURIComponent(postText)}`;
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(postText)}`;

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/90 p-4 animate-fade-in" onClick={onClose}>
      <div 
        className="glass-panel w-full max-w-xl rounded-[2.5rem] border border-white/10 shadow-[0_0_80px_rgba(16,185,129,0.2)] flex flex-col relative bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950/20 p-6 sm:p-8 gap-5 animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          className="absolute top-4 right-4 text-gray-400 hover:text-white bg-black/40 hover:bg-black/80 p-2 rounded-full w-8 h-8 flex items-center justify-center transition-colors z-[310] cursor-pointer border border-white/5"
          onClick={() => { playFx('click'); onClose(); }}
        >
          ✕
        </button>

        <div className="text-center">
          <span className="text-[10px] font-black uppercase text-emerald-400 tracking-[0.25em] pl-[0.25em] block mb-1">
            📢 CHIA SẺ CHIẾN TÍCH
          </span>
          <h2 className="text-xl sm:text-3xl font-black text-white italic uppercase tracking-wider">
            Khoe Kết Quả Trực Tuyến
          </h2>
          <p className="text-gray-400 text-xs mt-1 font-semibold">
            Tải banner cực chất kèm mô tả tự động siêu sinh động để chia sẻ lên các MXH!
          </p>
        </div>

        <div className="flex flex-col items-center gap-3">
          <div className="relative w-full aspect-[16/9] rounded-2xl overflow-hidden border border-white/15 shadow-xl group">
            <img 
              src={BANNERS[selectedBannerIdx]} 
              alt="Cartoon Banner" 
              className="w-full h-full object-cover transition-all group-hover:scale-105 duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex flex-col justify-end p-4">
              <span className="text-[9px] bg-emerald-500 text-black px-2 py-0.5 rounded-full font-black uppercase tracking-wider w-max shadow-md mb-1 animate-pulse">
                Banner Cartoon Siêu Cấp
              </span>
              <h3 className="text-white text-xs font-black drop-shadow-md">
                {type === 'ai' ? '🏆 Thách Đấu AI Đại Chiến' : '⚔️ PvP Online So Tài Đỉnh Cao'}
              </h3>
            </div>
          </div>

          <div className="flex gap-1.5 justify-center mt-1">
            {BANNERS.map((banner, idx) => (
              <button 
                key={idx}
                className={`h-2.5 rounded-full transition-all cursor-pointer ${selectedBannerIdx === idx ? 'w-6 bg-emerald-400' : 'w-2.5 bg-gray-600 hover:bg-gray-400'}`}
                onClick={() => { playFx('click'); setSelectedBannerIdx(idx); }}
                title={`Đổi banner ${idx + 1}`}
              />
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-1.5 w-full">
          <label className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Mô tả bài đăng (Tùy chỉnh tự do)</label>
          <textarea 
            value={postText}
            onChange={(e) => setPostText(e.target.value)}
            className="w-full bg-black/60 border border-white/10 rounded-xl p-3.5 text-xs text-gray-200 font-medium focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 h-28 resize-none leading-relaxed"
            maxLength={500}
          />
        </div>

        <div className="flex flex-col gap-3.5 w-full mt-1">
          <div className="flex gap-3">
            <button 
              className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs uppercase tracking-widest py-3.5 rounded-xl transition-all cursor-pointer active:scale-98 shadow-md border border-emerald-400/20"
              onClick={handleNativeShare}
            >
              🚀 {navigator.share ? 'Chia Sẻ Nhanh' : 'Sao Chép'}
            </button>
            
            <button 
              className={`flex-1 flex items-center justify-center gap-2 font-black text-xs uppercase tracking-widest py-3.5 rounded-xl border transition-all cursor-pointer active:scale-98 ${
                copied 
                  ? 'bg-green-900/30 border-green-500/50 text-green-400 shadow-[0_0_15px_rgba(74,222,128,0.2)]'
                  : 'bg-slate-800 hover:bg-slate-700 border-white/10 text-white'
              }`}
              onClick={handleCopy}
            >
              {copied ? '✓ Đã Sao Chép!' : '📋 Sao Chép'}
            </button>
          </div>

          <div className="flex gap-2 justify-center items-center">
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Chia sẻ trực tiếp:</span>
            <a 
              href={facebookUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-8 h-8 rounded-full bg-blue-900/50 text-blue-300 border border-blue-500/20 flex items-center justify-center hover:bg-blue-600 hover:text-white hover:border-transparent transition-all cursor-pointer text-sm font-black"
              onClick={() => playFx('click')}
              title="Khoe Facebook"
            >
              f
            </a>
            <a 
              href={twitterUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-8 h-8 rounded-full bg-slate-900/80 text-gray-300 border border-white/10 flex items-center justify-center hover:bg-black hover:text-white hover:border-transparent transition-all cursor-pointer text-sm font-black"
              onClick={() => playFx('click')}
              title="Khoe X (Twitter)"
            >
              𝕏
            </a>
            <a 
              href={BANNERS[selectedBannerIdx]} 
              download={`UltimateCard_Banner_${selectedBannerIdx + 1}.png`}
              target="_blank"
              className="w-8 h-8 rounded-full bg-yellow-900/50 text-yellow-300 border border-yellow-500/20 flex items-center justify-center hover:bg-yellow-500 hover:text-black hover:border-transparent transition-all cursor-pointer text-xs font-black uppercase"
              onClick={() => playFx('click')}
              title="Tải Banner Ảnh"
            >
              ⬇
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Main App Component ---
