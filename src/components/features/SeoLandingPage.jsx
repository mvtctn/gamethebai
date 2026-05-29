import React from 'react';
import { useGameContext } from '../../context/GameContext';
import { ChevronRight, Play, Star, Shield, Zap } from 'lucide-react';

export function SeoLandingPage() {
  const { setGameState } = useGameContext();
  const path = window.location.pathname;

  let title = "Game Thẻ Bài Bóng Đá VibeCoding";
  let content = (
    <p className="text-gray-300 leading-relaxed text-lg mb-6">
      Hãy trải nghiệm tựa game bóng đá thẻ bài trực tuyến hấp dẫn nhất! Xây dựng đội hình, thu thập thẻ bài siêu hiếm và so tài cùng hàng ngàn HLV khác trên toàn thế giới.
    </p>
  );

  if (path === '/gioi-thieu-game') {
    title = "Giới Thiệu: Game Thẻ Bài Bóng Đá World Cup 2026";
    content = (
      <>
        <h2 className="text-2xl font-bold text-white mb-4">Sưu tập thẻ bài cầu thủ yêu thích của bạn</h2>
        <p className="text-gray-300 leading-relaxed text-lg mb-6">
          Trải nghiệm cảm giác hồi hộp khi mở những gói thẻ Panini chứa đựng những ngôi sao bóng đá hàng đầu thế giới. Từ thẻ Base, Bronze, Silver, Gold cho tới siêu thẻ Platinum, Super Limited và Huyền Thoại Icon. Mỗi thẻ đều mang trong mình những chỉ số đặc biệt giúp bạn lật kèo ở mọi trận đấu.
        </p>

        <h2 className="text-2xl font-bold text-white mb-4">Hệ thống khắc chế thẻ độc đáo</h2>
        <p className="text-gray-300 leading-relaxed text-lg mb-6">
          Khác với những game thẻ bài thông thường chỉ dựa vào chỉ số sức mạnh, ở tựa game này chúng tôi đem đến hệ thống Kéo-Búa-Bao: Tốc Độ ⚡ khắc chế Kỹ Thuật 🌀, Kỹ Thuật khắc chế Sức Mạnh 💪, Sức Mạnh khắc Tốc Độ. Thêm vào đó, điều kiện thời tiết (Nắng, Mưa, Tuyết) ảnh hưởng trực tiếp tới chỉ số thi đấu.
        </p>

        <h2 className="text-2xl font-bold text-white mb-4">Chế độ Thách Đấu PVP & Random PVP Online</h2>
        <p className="text-gray-300 leading-relaxed text-lg mb-6">
          Mời bạn bè và cùng so tài chiến thuật qua thời gian thực. Chế độ Random PVP đặc biệt cân bằng, nơi cả hai người chơi sẽ phải sử dụng những thẻ bài ngẫu nhiên để thể hiện IQ chiến thuật thay vì "nạp tiền để thắng".
        </p>
      </>
    );
  } else if (path === '/cam-nang-doi-hinh') {
    title = "Cẩm Nang: Cách Xây Dựng Đội Hình Bóng Đá Vô Địch";
    content = (
      <>
        <h2 className="text-2xl font-bold text-white mb-4">11 Cầu Thủ - 1 Khát Vọng</h2>
        <p className="text-gray-300 leading-relaxed text-lg mb-6">
          Để tham gia PVP và Đấu AI, bạn cần chọn ra 11 thẻ bài tốt nhất từ Bộ Sưu Tập. Đừng chỉ chọn thẻ có chỉ số tổng (OVR) cao nhất. Hãy cân đối 3 yếu tố: ATK (Tấn công), DEF (Phòng thủ) và CTRL (Kiểm soát).
        </p>
        <h2 className="text-2xl font-bold text-white mb-4">Bí Kíp "Mồi Nhử"</h2>
        <p className="text-gray-300 leading-relaxed text-lg mb-6">
          Bạn đang có một thẻ rất yếu? Đừng lo! Hệ thống Bạo Kích (Critical Strike) cho phép thẻ đang bị dẫn trước 10 điểm có tới 35% khả năng lật kèo. Bạn có thể thả thẻ yếu ra để đối phương lãng phí thẻ mạnh, bảo toàn sức mạnh cho những lượt đấu cuối.
        </p>
      </>
    );
  }

  return (
    <div className="min-h-screen bg-[#080818] overflow-y-auto relative pb-20">
      {/* Background Elements */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-600/20 blur-[150px] rounded-full" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-fuchsia-600/20 blur-[150px] rounded-full" />
        <div className="absolute inset-0 bg-[url('/bg-stars.png')] opacity-20 bg-repeat animate-pulse-slow" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto pt-12 px-6">
        {/* Header */}
        <header className="flex items-center justify-between border-b border-white/10 pb-6 mb-12">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-fuchsia-500 rounded-xl flex items-center justify-center font-black text-xl text-white shadow-lg shadow-blue-500/20 border border-white/20">
              TBĐ
            </div>
            <h1 className="text-3xl font-black italic tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">
              WC 2026 PANINI
            </h1>
          </div>
          <button 
            onClick={() => {
              playFx('click');
              setGameState('landing');
            }}
            className="px-6 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full font-bold text-white transition-all hover:scale-105 active:scale-95"
          >
            Trang Chủ
          </button>
        </header>

        {/* Content Box */}
        <article className="glass-panel p-8 sm:p-12 rounded-[2.5rem] border border-white/10 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-fuchsia-500/10 blur-[100px] rounded-full" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 blur-[100px] rounded-full" />

          <h1 className="text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-fuchsia-400 mb-8 leading-tight">
            {title}
          </h1>

          <div className="relative z-10 prose prose-invert max-w-none">
            {content}
          </div>

          {/* Call to action */}
          <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-6 relative z-10">
            <div>
              <h3 className="text-xl font-bold text-white mb-2">Đã sẵn sàng tham gia trận đấu?</h3>
              <p className="text-gray-400">Đăng ký tài khoản miễn phí và nhận ngay 200 Xu cùng 3 Gói thẻ để bắt đầu.</p>
            </div>
            <button 
              onClick={() => {
                playFx('click');
                setGameState('landing');
              }}
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-black rounded-2xl flex items-center gap-3 transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(37,99,235,0.4)] whitespace-nowrap"
            >
              Vào Game Ngay <Play size={20} fill="currentColor" />
            </button>
          </div>
        </article>

        {/* Features Preview */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-12 mb-20">
          <div className="glass-panel p-6 rounded-3xl border border-white/10 text-center">
            <Star className="w-10 h-10 mx-auto text-yellow-400 mb-4 drop-shadow-[0_0_10px_rgba(250,204,21,0.5)]" />
            <h4 className="font-bold text-white mb-2">Hơn 800+ Cầu thủ</h4>
            <p className="text-sm text-gray-400">Sưu tầm đủ mọi siêu sao của 32 quốc gia</p>
          </div>
          <div className="glass-panel p-6 rounded-3xl border border-white/10 text-center">
            <Shield className="w-10 h-10 mx-auto text-blue-400 mb-4 drop-shadow-[0_0_10px_rgba(96,165,250,0.5)]" />
            <h4 className="font-bold text-white mb-2">Bảo mật tuyệt đối</h4>
            <p className="text-sm text-gray-400">Hệ thống lưu trữ đám mây thời gian thực</p>
          </div>
          <div className="glass-panel p-6 rounded-3xl border border-white/10 text-center">
            <Zap className="w-10 h-10 mx-auto text-fuchsia-400 mb-4 drop-shadow-[0_0_10px_rgba(232,121,249,0.5)]" />
            <h4 className="font-bold text-white mb-2">PVP Đỉnh Cao</h4>
            <p className="text-sm text-gray-400">Đấu trực tiếp thời gian thực, leo top rank</p>
          </div>
        </div>

      </div>
    </div>
  );
}
