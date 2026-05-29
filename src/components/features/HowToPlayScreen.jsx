import React from 'react';
import { isConnectedToFirebase } from '../../firebase';

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

export function HowToPlayScreen() {
  const { setGameState, currentUser } = useGameContext();

  return (
    <div className="how-to-play-wrapper" style={{
  position: 'fixed',
  inset: 0,
  zIndex: 200,
  overflowY: 'auto'
}}>
          <div className="htp-content">
            <button className="htp-back-btn" onClick={() => setGameState(currentUser ? 'lobby' : 'lobby')}>
              ← Quay Lại
            </button>

            {/* Header */}
            <div className="htp-header">
              <div className="htp-eyebrow">⚽ World Cup 2026 · Ultimate Card Champions</div>
              <h1 className="htp-title">Hướng Dẫn Chơi</h1>
              <p className="htp-desc">
                Sưu tầm thẻ cầu thủ, xây dựng đội hình mơ ước và chinh phục mọi đối thủ trong
                trò chơi thẻ bài bóng đá hấp dẫn nhất mùa World Cup 2026!
              </p>
            </div>

            {/* Steps */}
            <div className="htp-steps">

              <div className="htp-step-card">
                <div className="htp-step-num">🎁</div>
                <div className="htp-step-body">
                  <h3>Bước 1 — Đăng Ký & Nhận Quà</h3>
                  <p>
                    Tạo tài khoản miễn phí bằng tên HLV và mã PIN tuỳ chọn. Mỗi tài khoản mới
                    nhận ngay <strong style={{
              color: '#c4f000'
            }}>200 Xu + 3 Gói Thẻ Miễn Phí</strong> để bắt đầu hành trình!
                  </p>
                  <span className="htp-tip">💡 Đặt PIN để đăng nhập lại trên mọi thiết bị</span>
                </div>
              </div>

              <div className="htp-step-card">
                <div className="htp-step-num">📦</div>
                <div className="htp-step-body">
                  <h3>Bước 2 — Mở Gói Thẻ Cầu Thủ</h3>
                  <p>
                    Dùng Xu mở các gói thẻ để sưu tập cầu thủ. Có 4 loại gói:
                    <strong style={{
              color: '#38bdf8'
            }}> Tiêu Chuẩn (100 xu), Cao Cấp (300 xu),
                    Siêu Cấp (600 xu), Tối Thượng (1200 xu)</strong>.
                    Gói càng xịn, cơ hội nhận thẻ hiếm càng cao!
                  </p>
                  <span className="htp-tip">🎰 Hệ thống pity đảm bảo sau 10 gói có thẻ siêu sao</span>
                </div>
              </div>

              <div className="htp-step-card">
                <div className="htp-step-num">⚽</div>
                <div className="htp-step-body">
                  <h3>Bước 3 — Xây Dựng Đội Hình 11 Người</h3>
                  <p>
                    Vào mục <strong style={{
              color: '#c4f000'
            }}>Đội Hình</strong> để chọn 11 cầu thủ
                    xuất sắc nhất từ bộ sưu tập. Mỗi thẻ có 3 chỉ số:
                    <strong style={{
              color: '#f472b6'
            }}> ATK (Tấn Công), CTRL (Kiểm Soát), DEF (Phòng Thủ)</strong>.
                    Số cao nhất trong 3 chỉ số là OVR — chọn đội hình có OVR tổng cao nhất!
                  </p>
                  <span className="htp-tip">🏆 Thẻ hiếm có chỉ số cao hơn thẻ thường nhiều</span>
                </div>
              </div>

              <div className="htp-step-card">
                <div className="htp-step-num">🤖</div>
                <div className="htp-step-body">
                  <h3>Bước 4 — Cách Đấu Thẻ</h3>
                  <p>
                    Mỗi lượt bạn chọn 1 thẻ cầu thủ và 1 chỉ số (ATK/CTRL/DEF) để so sánh với thẻ của đối thủ.
                    Chỉ số nào cao hơn sẽ <strong style={{
              color: '#4ade80'
            }}>THẮNG</strong> lượt đó.
                    Đội thắng nhiều lượt nhất trong 11 thẻ giành chiến thắng!
                  </p>
                  <span className="htp-tip">🎯 Bonus: Thẻ Edition đặc biệt có thêm điểm cộng khi so sánh</span>
                </div>
              </div>

              <div className="htp-step-card">
                <div className="htp-step-num">⚡</div>
                <div className="htp-step-body">
                  <h3>Bước 5 — Khắc Chế Hệ Kỹ Năng</h3>
                  <p>
                    Cầu thủ chia làm 3 hệ nguyên tố: <strong style={{
              color: '#facc15'
            }}>Tốc Độ ⚡</strong> (khắc chế) <strong style={{
              color: '#22d3ee'
            }}>Kỹ Thuật 🌀</strong> (khắc chế) <strong style={{
              color: '#f87171'
            }}>Sức Mạnh 💪</strong> (khắc chế) <strong style={{
              color: '#facc15'
            }}>Tốc Độ ⚡</strong>.
                    Khi so tài, nếu cầu thủ của bạn có hệ khắc chế đối thủ, bạn được <strong style={{
              color: '#4ade80'
            }}>cộng ngay +10 điểm</strong> vào chỉ số thi đấu! Sắp xếp bài khắc chế thay vì chỉ nhìn vào chỉ số cao thấp.
                  </p>
                  <p>
                    <strong className="text-white">Bạo Kích (Critical Strike) 💥 & Bùng Nổ Ngược Dòng</strong>:
                    <br />
                    Trong lúc thi đấu, mọi thẻ bài đều có 10% cơ hội tung đòn <strong>Bạo kích (+10 đến +15 OVR)</strong>. Đặc biệt, nếu thẻ bài của bạn đang <strong>thua thiệt đối thủ từ 10 chỉ số gốc trở lên</strong>, tinh thần chiến đấu sẽ bùng nổ, tăng tỷ lệ xuất hiện Bạo Kích lên tới <strong>35%</strong> (cộng tới +20 OVR). Nhờ vậy, thẻ thấp điểm hoàn toàn có cơ hội lật kèo ngoạn mục!
                  </p>
                  <span className="htp-tip">💡 Quan sát kỹ biểu tượng hệ nguyên tố ở góc trên bên phải của mỗi chiếc thẻ!</span>
                </div>
              </div>

              <div className="htp-step-card">
                <div className="htp-step-num">🌦️</div>
                <div className="htp-step-body">
                  <h3>Bước 6 — Thời Tiết & Môi Trường</h3>
                  <p>
                    Kết quả trận đấu bị tác động <strong>trực tiếp</strong> bởi <strong style={{
              color: '#38bdf8'
            }}>Thời Tiết (Nắng, Mưa, Tuyết...)</strong> và <strong style={{
              color: '#f472b6'
            }}>Giờ Thi Đấu</strong>. Trời bão tuyết sẽ trừ thẳng tới -12 OVR vào Tốc Độ của cả hai bên, trong khi Sức Mạnh lại được cộng thêm +6 OVR. Bạn phải luôn theo dõi thời tiết góc trên cùng màn hình để chọn bài có hệ phù hợp nhất!
                    Ngoài ra, mỗi thẻ sẽ có trạng thái <strong style={{
              color: '#4ade80'
            }}>Phong Độ (Form)</strong> ngẫu nhiên.
                  </p>
                  <span className="htp-tip">💡 Phải luôn chú ý bảng điều kiện môi trường góc trên khi đấu PvP!</span>
                </div>
              </div>

              <div className="htp-step-card">
                <div className="htp-step-num">🌐</div>
                <div className="htp-step-body">
                  <h3>Bước 7 — PvP Online & Tích Luỹ</h3>
                  <p>
                    Thách đấu bạn bè qua <strong style={{
              color: '#38bdf8'
            }}>PvP Online</strong> bằng cách chia sẻ mã phòng.
                    Mọi trận đều nhận Xu và XP:
                    <strong style={{
              color: '#c4f000'
            }}> Thắng nhiều hơn, Hòa vừa, Thua cũng có!</strong>
                    Tích đủ XP để lên cấp và nhận thêm phần thưởng lớn.
                  </p>
                  <span className="htp-tip">⚡ Lên cấp nhận thẻ và xu miễn phí!</span>
                </div>
              </div>

              <div className="htp-step-card">
                <div className="htp-step-num">📊</div>
                <div className="htp-step-body">
                  <h3>Bước 8 — Nhiệm Vụ & Bảng Xếp Hạng</h3>
                  <p>
                    Hoàn thành <strong style={{
              color: '#f472b6'
            }}>Nhiệm Vụ Hàng Ngày</strong> để nhận thêm Xu và XP.
                    Kiểm tra <strong style={{
              color: '#c4f000'
            }}>Bảng Xếp Hạng</strong> để đua top với các HLV toàn server. Đạt mốc hoạt động để nhận thẻ Edition đặc biệt!
                  </p>
                  <span className="htp-tip">🎖️ Thẻ Icon & Super Limited cực hiếm chỉ có thể nhận qua mốc thành tích</span>
                </div>
              </div>

              <div className="htp-step-card">
                <div className="htp-step-num">🎲</div>
                <div className="htp-step-body">
                  <h3>Bước 9 — Đấu Random PVP</h3>
                  <p>
                    Ở sảnh PVP Online, bạn có thể chọn <strong style={{
              color: '#c084fc'
            }}>Đấu Random 🎲</strong>. Hệ thống sẽ trộn chung toàn bộ thẻ của bạn và chọn ra 11 thẻ ngẫu nhiên theo công thức cân bằng.
                    Chế độ này đòi hỏi kỹ năng chiến thuật cực cao và không phụ thuộc vào độ hiếm thẻ gốc của bạn!
                  </p>
                  <span className="htp-tip text-fuchsia-300">💡 Lời mời Random PVP có màu tím đặc trưng</span>
                </div>
              </div>

              <div className="htp-step-card" style={{
        border: '1px solid rgba(239, 68, 68, 0.4)',
        background: 'linear-gradient(to right, rgba(0,0,0,0.8), rgba(239,68,68,0.15))'
      }}>
                <div className="htp-step-num" style={{
          background: '#ef4444',
          color: 'white'
        }}>🧠</div>
                <div className="htp-step-body">
                  <h3 style={{
            color: '#f87171'
          }}>Chiến Thuật Tối Thượng</h3>
                  <p>
                    <strong>Đừng bao giờ ném thẻ tùy tiện!</strong> Bí quyết làm chủ game:
                    <br /><br />
                    1. <strong>"Dùng mồi nhử"</strong>: Đối thủ thường dùng thẻ cực mạnh ở các lượt đầu. Hãy "cắn trộm" bằng cách vứt 1 thẻ thật yếu ra. Bạn sẽ bị dẫn trước, nhưng thẻ yếu đó có tới <strong>35% tỷ lệ Bạo Kích Lật kèo</strong>. Nếu Bạo Kích nổ, bạn vừa thắng lượt, vừa giữ được bài mạnh cho cuối game!<br />
                    2. <strong>Bắt bài Khắc Chế</strong>: Quan sát điểm sáng nhất của đối thủ. Nếu họ toàn bài Sức Mạnh, hãy ưu tiên dùng bài Kỹ Thuật (🌀) để ẵm trọn <strong>+10 OVR Khắc chế</strong>.<br />
                    3. <strong>Tận dụng Thời Tiết</strong>: Bão tuyết (❄️) phế võ công của hệ Tốc Độ (-12 OVR). Đừng dại ném thẻ Tốc Độ vào lúc này! Ngược lại, Nắng gắt (☀️) biến Tốc độ thành quái vật (+5 OVR).
                  </p>
                  <span className="htp-tip" style={{
            color: '#fca5a5'
          }}>💡 Người chơi giỏi không thắng bằng OVR cao, họ thắng bằng Khắc chế và Mồi nhử!</span>
                </div>
              </div>

            </div>

            {/* Feature grid */}
            <h2 style={{
      fontSize: '1.1rem',
      fontWeight: 900,
      textTransform: 'uppercase',
      letterSpacing: '2px',
      color: 'white',
      marginBottom: '1rem',
      textAlign: 'center'
    }}>Tính Năng Nổi Bật</h2>
            <div className="htp-features-grid">
              {[{
        icon: '🃏',
        name: '800+ Cầu Thủ',
        desc: 'Thẻ từ 32 đội tuyển World Cup 2026 thực tế'
      }, {
        icon: '💎',
        name: '7 Cấp Độ Hiếm',
        desc: 'Base → Bronze → Silver → Gold → Platinum → Super → Icon'
      }, {
        icon: '⚔️',
        name: 'Đấu AI',
        desc: '5 mức độ khó từ Amateur đến Ultimate'
      }, {
        icon: '🌐',
        name: 'PvP Online',
        desc: 'Thách đấu thời gian thực qua mã phòng'
      }, {
        icon: '📈',
        name: 'Hệ Thống Cấp',
        desc: '30 cấp với phần thưởng đặc biệt mỗi mốc'
      }, {
        icon: '🎯',
        name: 'Nhiệm Vụ',
        desc: 'Nhiệm vụ hàng ngày và thành tích dài hạn'
      }, {
        icon: '💬',
        name: 'Chat Sảnh',
        desc: 'Chat toàn server và tin nhắn riêng tư'
      }, {
        icon: '🏆',
        name: 'Bảng Xếp Hạng',
        desc: 'Top HLV mạnh nhất toàn server theo cấp độ'
      }, {
        icon: '🎰',
        name: 'Hệ Pity',
        desc: 'Đảm bảo thẻ siêu sao sau tối đa 10 gói liên tiếp'
      }].map((f, i) => <div className="htp-feature-card" key={i}>
                  <span className="htp-feature-icon">{f.icon}</span>
                  <div className="htp-feature-name">{f.name}</div>
                  <div className="htp-feature-desc">{f.desc}</div>
                </div>)}
            </div>

            {/* Reward table */}
            <div style={{
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: '1.25rem',
      padding: '1.5rem',
      marginBottom: '2rem'
    }}>
              <h3 style={{
        fontSize: '0.9rem',
        fontWeight: 900,
        textTransform: 'uppercase',
        letterSpacing: '2px',
        color: 'white',
        marginBottom: '1rem',
        textAlign: 'center'
      }}>💰 Bảng Phần Thưởng Trận Đấu</h3>
              <div style={{
        overflowX: 'auto'
      }}>
                <table style={{
          width: '100%',
          borderCollapse: 'collapse',
          fontSize: '0.8rem'
        }}>
                  <thead>
                    <tr style={{
              borderBottom: '1px solid rgba(255,255,255,0.1)'
            }}>
                      <th style={{
                padding: '0.6rem 1rem',
                textAlign: 'left',
                color: 'rgba(255,255,255,0.5)',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '1px'
              }}>Kết Quả</th>
                      <th style={{
                padding: '0.6rem 1rem',
                textAlign: 'center',
                color: 'rgba(255,255,255,0.5)',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '1px'
              }}>Xu</th>
                      <th style={{
                padding: '0.6rem 1rem',
                textAlign: 'center',
                color: 'rgba(255,255,255,0.5)',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '1px'
              }}>XP</th>
                      <th style={{
                padding: '0.6rem 1rem',
                textAlign: 'center',
                color: 'rgba(255,255,255,0.5)',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '1px'
              }}>Ghi Chú</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[{
              res: '🏆 Thắng AI (Easy)',
              xu: '+40',
              xp: '+60 XP',
              note: 'Amateur/Easy'
            }, {
              res: '🏆 Thắng AI (Medium)',
              xu: '+60',
              xp: '+60 XP',
              note: 'Professional/Medium'
            }, {
              res: '🏆 Thắng AI (Hard)',
              xu: '+100',
              xp: '+60 XP',
              note: 'World Class/Hard'
            }, {
              res: '🏆 Thắng AI (Legend)',
              xu: '+150',
              xp: '+60 XP',
              note: 'Legendary'
            }, {
              res: '🏆 Thắng AI (Ultimate)',
              xu: '+220',
              xp: '+60 XP',
              note: 'Khó nhất'
            }, {
              res: '🤝 Hòa AI',
              xu: '+20~75',
              xp: '+30 XP',
              note: 'Theo độ khó'
            }, {
              res: '😤 Thua AI',
              xu: '+12~40',
              xp: '+15 XP',
              note: 'Vẫn có thưởng!'
            }, {
              res: '🌐 Thắng PvP',
              xu: '+120',
              xp: '+120 XP',
              note: 'Vs người thật'
            }, {
              res: '🌐 Hòa PvP',
              xu: '+40',
              xp: '+50 XP',
              note: 'Vs người thật'
            }, {
              res: '🌐 Thua PvP',
              xu: '+25',
              xp: '+30 XP',
              note: 'Vẫn có thưởng!'
            }].map((row, i) => <tr key={i} style={{
              borderBottom: '1px solid rgba(255,255,255,0.05)',
              transition: 'background 0.2s'
            }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                        <td style={{
                padding: '0.6rem 1rem',
                color: 'white',
                fontWeight: 600
              }}>{row.res}</td>
                        <td style={{
                padding: '0.6rem 1rem',
                textAlign: 'center',
                color: '#c4f000',
                fontWeight: 800
              }}>{row.xu}</td>
                        <td style={{
                padding: '0.6rem 1rem',
                textAlign: 'center',
                color: '#38bdf8',
                fontWeight: 700
              }}>{row.xp}</td>
                        <td style={{
                padding: '0.6rem 1rem',
                textAlign: 'center',
                color: 'rgba(255,255,255,0.4)',
                fontSize: '0.72rem'
              }}>{row.note}</td>
                      </tr>)}
                  </tbody>
                </table>
              </div>
            </div>

            {/* CTA */}
            <div className="htp-cta-box">
              <h3>🚀 Sẵn Sàng Chiến Chưa?</h3>
              <p>Tạo tài khoản ngay hôm nay, nhận 200 Xu + 3 gói thẻ miễn phí và bắt đầu hành trình chinh phục World Cup 2026!</p>
              <button className="htp-cta-btn" onClick={() => {
        setGameState('lobby');
      }}>
                ⚡ {currentUser ? 'Về Trang Chủ' : 'Đăng Ký Ngay'}
              </button>
            </div>

            {/* About Section */}
            <div className="mt-8 pt-8 border-t border-white/10 text-center flex flex-col items-center justify-center gap-2 pb-4">
              <h3 className="text-sm font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400 uppercase tracking-widest mb-1">
                Bản Quyền & Tác Giả
              </h3>
              <p className="text-xs text-gray-400 max-w-sm leading-relaxed">
                Bản quyền, ý tưởng game thuộc về <strong className="text-white">Mai Quang Vinh</strong><br />
                Tiểu học Nghĩa Tân, Phường Nghĩa Đô, TP Hà Nội
              </p>
              <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest bg-white/5 px-3 py-1 rounded-full border border-white/5 mt-2">
                Vibecoding với Antigravity
              </div>
            </div>

          </div>
        </div>
  );
}
