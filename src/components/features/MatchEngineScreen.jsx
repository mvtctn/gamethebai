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

export function MatchEngineScreen() {
  const { matchPhase, playedCardIds, matchEnvironment, dismissRoundResult, setGameState, difficulty, setDifficulty, startMatch, matchScore, lastReward, setActiveShareData, setShowHistoryModal, returnToLobby, showHistoryModal, matchHistory, selectedPlayerCard, setSelectedPlayerCard, playRound, currentAiCard, nextRound, currentUser, playerHand, squad, playRoundAiTurn, setMatchPhase, setSelectedStat, setCurrentAiCard, triggerAiTurn, aiHand, selectedStat } = useGameContext();

  return (
    <div className={`w-full h-[100dvh] flex flex-col overflow-hidden animate-fade-in relative z-10 ${matchPhase === 'roundResult' && playedCardIds.length < 11 ? 'cursor-pointer' : ''}`} style={{
  background: (() => {
    switch (matchEnvironment.time.key) {
      case 'Night':
        return 'radial-gradient(circle at 50% -20%, rgba(96, 165, 250, 0.18) 0%, transparent 60%), linear-gradient(180deg, #090a1b 0%, #050510 50%, #010207 100%)';
      case 'Noon':
        return 'radial-gradient(circle at 50% -20%, rgba(52, 211, 153, 0.18) 0%, transparent 60%), linear-gradient(180deg, #041a12 0%, #020f0a 50%, #010604 100%)';
      case 'Sunset':
        return 'radial-gradient(circle at 50% -20%, rgba(251, 191, 36, 0.15) 0%, transparent 60%), linear-gradient(180deg, #1a0815 0%, #0f030c 50%, #060108 100%)';
      default:
        return 'radial-gradient(circle at 50% -20%, rgba(96, 165, 250, 0.18) 0%, transparent 60%), linear-gradient(180deg, #090a1b 0%, #050510 50%, #010207 100%)';
    }
  })()
}} onClick={dismissRoundResult}>
          
          {matchPhase === 'setup' && <div className="flex-1 flex flex-col items-center justify-center p-4 overflow-y-auto hide-scrollbar z-20">
              <div className="glass-panel p-6 sm:p-10 rounded-3xl text-center w-full max-w-xl bg-gradient-to-t from-slate-950 to-slate-900/90 shadow-[0_0_50px_rgba(0,0,0,0.8)] border border-white/10 relative">
                <button className="absolute top-4 left-4 text-gray-400 hover:text-white bg-black/40 hover:bg-black/80 px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1 border border-white/10" onClick={() => setGameState('lobby')}>
                  ← Về Sảnh
                </button>
                
                <h2 className="text-2xl sm:text-3xl font-black uppercase text-amber-400 mt-6 mb-2 tracking-widest drop-shadow-[0_2px_10px_rgba(251,191,36,0.3)]">
                  Đấu trường AI
                </h2>
                <p className="text-xs text-gray-400 mb-6 font-medium">Chọn độ khó để bắt đầu trận đấu 11 vòng đầy kịch tính</p>
                
                <div className="flex flex-col gap-3 mb-8 w-full">
                  {[{
          id: 'Amateur',
          name: 'Nghiệp Dư',
          emoji: '🟢',
          color: 'border-emerald-500/30 hover:border-emerald-400 text-emerald-400 shadow-emerald-500/5',
          bg: 'bg-emerald-500/10 border-emerald-400 text-emerald-300 shadow-emerald-500/20',
          reward: '+30 Xu',
          desc: 'AI chọn bài ngẫu nhiên 100%, thích hợp làm quen.'
        }, {
          id: 'Professional',
          name: 'Chuyên Nghiệp',
          emoji: '🔵',
          color: 'border-blue-500/30 hover:border-blue-400 text-blue-400 shadow-blue-500/5',
          bg: 'bg-blue-500/10 border-blue-400 text-blue-300 shadow-blue-500/20',
          reward: '+50 Xu',
          desc: 'AI có 50% tính toán phản công, biết chặn đòn vừa phải.'
        }, {
          id: 'World Class',
          name: 'Thế Giới',
          emoji: '🟡',
          color: 'border-yellow-500/30 hover:border-yellow-400 text-yellow-400 shadow-yellow-500/5',
          bg: 'bg-yellow-500/10 border-yellow-400 text-yellow-300 shadow-yellow-500/20',
          reward: '+80 Xu',
          desc: 'AI có 75% phản công mạnh mẽ, yêu cầu đội hình tốt.'
        }, {
          id: 'Legendary',
          name: 'Huyền Thoại',
          emoji: '🟣',
          color: 'border-purple-500/30 hover:border-purple-400 text-purple-400 shadow-purple-500/5',
          bg: 'bg-purple-500/10 border-purple-400 text-purple-300 shadow-purple-500/20',
          reward: '+120 Xu',
          desc: 'AI 90% siêu thông minh, toàn siêu sao và được cộng +2 tất cả chỉ số!'
        }, {
          id: 'Ultimate',
          name: 'Vô Địch',
          emoji: '🔴',
          color: 'border-red-500/30 hover:border-red-400 text-red-400 shadow-red-500/5',
          bg: 'bg-red-500/10 border-red-400 text-red-300 shadow-red-500/20',
          reward: '+180 Xu',
          desc: 'Ác mộng thực sự! AI 100% hoàn hảo và được cộng +5 tất cả chỉ số!'
        }].map(diff => {
          const isSelected = difficulty === diff.id;
          return <div key={diff.id} className={`p-3 rounded-2xl border text-left cursor-pointer transition-all duration-200 flex items-center justify-between gap-3 ${isSelected ? diff.bg + ' scale-[1.01] shadow-lg ring-1 ring-white/10' : diff.color + ' bg-black/40 hover:bg-black/60'}`} onClick={() => {
            playFx('click');
            setDifficulty(diff.id);
          }}>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-lg">{diff.emoji}</span>
                            <span className="font-extrabold text-sm sm:text-base text-white">{diff.name}</span>
                            <span className="text-[10px] px-2 py-0.5 bg-yellow-400/20 text-yellow-400 border border-yellow-400/30 font-black rounded-full uppercase tracking-wider">{diff.reward}</span>
                          </div>
                          <p className="text-[10px] sm:text-xs text-gray-400 leading-snug font-medium">{diff.desc}</p>
                        </div>
                        {isSelected && <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center shadow-md animate-scale-in shrink-0">
                            <span className="text-[10px] text-slate-900 font-bold">✓</span>
                          </div>}
                      </div>;
        })}
                </div>
                
                <button className="btn w-full flex items-center justify-center gap-2 !bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 font-black tracking-widest text-lg py-4 rounded-2xl shadow-[0_4px_20px_rgba(239,68,68,0.3)] hover:scale-[1.02] transition-all cursor-pointer " onClick={() => {
        playFx('click');
        startMatch();
      }}>
                  <Play size={20} fill="currentColor" /> BẮT ĐẦU TRẬN ĐẤU
                </button>
              </div>
            </div>}

          {matchPhase === 'gameOver' && <div className="flex-1 flex flex-col items-center justify-center p-4">
              <div className="glass-panel p-6 sm:p-10 rounded-3xl text-center w-full max-w-md border border-white/10 shadow-2xl relative overflow-hidden">
                {/* Background glow effects based on result */}
                <div className={`absolute -inset-4 opacity-20 blur-2xl z-0 ${matchScore.player > matchScore.ai ? 'bg-green-500' : matchScore.player < matchScore.ai ? 'bg-red-500' : 'bg-blue-500'}`}></div>
                
                <div className="relative z-10">
                  <div className="text-xs tracking-widest text-gray-400 font-black uppercase mb-4 opacity-80">Tỉ số chung cuộc</div>
                  
                  <div className="score-board mb-6 flex justify-center items-center gap-6 text-6xl font-black">
                    <div className={`w-20 h-24 sm:w-24 sm:h-28 flex items-center justify-center rounded-2xl border ${matchScore.player > matchScore.ai ? 'bg-green-950/40 text-green-400 border-green-500/30 shadow-[0_0_20px_rgba(74,222,128,0.2)]' : 'bg-slate-900/50 text-white border-white/10'}`}>
                      {matchScore.player}
                    </div>
                    <span className="text-gray-600 text-3xl font-black">:</span>
                    <div className={`w-20 h-24 sm:w-24 sm:h-28 flex items-center justify-center rounded-2xl border ${matchScore.ai > matchScore.player ? 'bg-red-950/40 text-red-400 border-red-500/30 shadow-[0_0_20px_rgba(248,113,113,0.2)]' : 'bg-slate-900/50 text-white border-white/10'}`}>
                      {matchScore.ai}
                    </div>
                  </div>
                  
                  <h3 className={`text-2xl sm:text-3xl font-black mb-6 uppercase drop-shadow-lg ${matchScore.player > matchScore.ai ? "text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-yellow-500" : matchScore.player < matchScore.ai ? "text-red-400" : "text-blue-400"}`}>
                    {matchScore.player > matchScore.ai ? "BẠN ĐÃ CHIẾN THẮNG! 🏆" : matchScore.player < matchScore.ai ? "BẠN ĐÃ THUA! 💀" : "HÒA NHAU! 🤝"}
                  </h3>
                  
                  {matchScore.player > matchScore.ai && <div className="bg-yellow-950/40 border border-yellow-500/30 px-4 py-2 rounded-xl mb-6 inline-flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(234,179,8,0.15)]">
                      <Coins className="text-yellow-400" size={20} />
                      <span className="text-lg font-black text-yellow-400">+{lastReward} Xu</span>
                    </div>}
                  
                  <div className="flex flex-col gap-3 mt-4 w-full">
                    <button className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-black uppercase tracking-wider text-xs sm:text-sm py-3.5 px-4 rounded-xl border border-emerald-400/20 shadow-[0_0_15px_rgba(16,185,129,0.25)] transition-all cursor-pointer active:scale-95 animate-pulse" onClick={() => {
            playFx('click');
            setActiveShareData({
              type: 'ai',
              result: matchScore.player > matchScore.ai ? 'win' : matchScore.player < matchScore.ai ? 'lose' : 'draw',
              myScore: matchScore.player,
              opponentScore: matchScore.ai,
              opponentName: 'Máy Siêu Cấp AI'
            });
          }}>
                      📢 KHOE CHIẾN TÍCH SIÊU CẤP
                    </button>
                    
                    <div className="flex gap-3">
                      <button className="flex-1 flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-white font-bold tracking-wide text-xs sm:text-sm py-3 px-4 rounded-xl border border-white/10 transition-colors cursor-pointer active:scale-95" onClick={() => setShowHistoryModal(true)}>
                        <History size={16} /> Diễn Biến
                      </button>
                      <button className="flex-1 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-black uppercase tracking-wider text-xs sm:text-sm py-3 px-4 rounded-xl shadow-lg shadow-indigo-900/30 transition-all cursor-pointer active:scale-95" onClick={returnToLobby}>
                        Sảnh Chính
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>}

          {showHistoryModal && <MatchHistoryModal history={matchHistory} onClose={() => setShowHistoryModal(false)} />}

          {(matchPhase === 'playing' || matchPhase === 'roundResult') && <div className="flex-1 w-full flex flex-col p-2 gap-2 overflow-hidden relative z-20">
              
              {/* Stat Selection Modal */}
              {selectedPlayerCard && matchPhase === 'playing' && <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80  p-4 animate-fade-in">
                  <div className="glass-panel p-6 sm:p-8 rounded-[2rem] max-w-sm w-full flex flex-col items-center bg-gradient-to-t from-blue-900/60 to-slate-900 shadow-[0_0_50px_rgba(0,0,0,0.8)] relative border border-white/10">
                    <button className="absolute top-4 right-4 text-gray-400 hover:text-white bg-black/40 hover:bg-black/80 p-2 rounded-full w-8 h-8 flex items-center justify-center transition-colors" onClick={() => setSelectedPlayerCard(null)}>
                      ✕
                    </button>

                    <h2 className="text-sm sm:text-base font-black text-amber-400 mb-6 uppercase tracking-widest text-center">Chọn Chỉ Số Tấn Công</h2>
                    
                    <div className="w-40 sm:w-48 mb-8 scale-110 drop-shadow-2xl">
                      <Card player={selectedPlayerCard} hideStats={false} />
                    </div>

                    <div className="flex gap-3 sm:gap-4 w-full">
                      <button className="flex-1 flex flex-col items-center bg-black/60 hover:bg-red-900/50 border border-red-500/50 hover:border-red-400 rounded-xl py-3 transition-all group shadow-[0_0_15px_rgba(239,68,68,0.3)] hover:-translate-y-2 hover:shadow-[0_0_30px_rgba(239,68,68,0.6)]" onClick={() => playRound('attack')}>
                          <span className="text-[10px] sm:text-xs font-bold text-red-400 tracking-widest uppercase group-hover:text-white transition-colors">ATK</span>
                          <span className="text-2xl sm:text-3xl font-black text-white">{selectedPlayerCard.stats.attack}</span>
                      </button>
                      <button className="flex-1 flex flex-col items-center bg-black/60 hover:bg-green-900/50 border border-green-500/50 hover:border-green-400 rounded-xl py-3 transition-all group shadow-[0_0_15px_rgba(34,197,94,0.3)] hover:-translate-y-2 hover:shadow-[0_0_30px_rgba(34,197,94,0.6)]" onClick={() => playRound('control')}>
                          <span className="text-[10px] sm:text-xs font-bold text-green-400 tracking-widest uppercase group-hover:text-white transition-colors">CTRL</span>
                          <span className="text-2xl sm:text-3xl font-black text-white">{selectedPlayerCard.stats.control}</span>
                      </button>
                      <button className="flex-1 flex flex-col items-center bg-black/60 hover:bg-blue-900/50 border border-blue-500/50 hover:border-blue-400 rounded-xl py-3 transition-all group shadow-[0_0_15px_rgba(59,130,246,0.3)] hover:-translate-y-2 hover:shadow-[0_0_30px_rgba(59,130,246,0.6)]" onClick={() => playRound('defense')}>
                          <span className="text-[10px] sm:text-xs font-bold text-blue-400 tracking-widest uppercase group-hover:text-white transition-colors">DEF</span>
                          <span className="text-2xl sm:text-3xl font-black text-white">{selectedPlayerCard.stats.defense}</span>
                      </button>
                    </div>

                    <button className="mt-6 w-full py-2.5 bg-white/5 hover:bg-white/10 text-white font-bold text-xs uppercase tracking-widest rounded-xl transition-all cursor-pointer border border-white/10 hover:border-white/20 active:scale-[0.98]" onClick={() => {
          playFx('click');
          setSelectedPlayerCard(null);
        }}>
                      ↺ Chọn Cầu Thủ Khác
                    </button>
                  </div>
                </div>}

              {/* Round Result Overlay */}
              {matchPhase === 'roundResult' && <div className="fixed inset-0 z-[90] flex flex-col items-center justify-center pointer-events-none p-4">
                  {matchHistory.length > 0 && (() => {
        const lastRound = matchHistory[matchHistory.length - 1];
        const isWin = lastRound.result === 'win';
        const isLoss = lastRound.result === 'loss';
        const borderColor = isWin ? 'border-emerald-500/50 shadow-[0_0_30px_rgba(16,185,129,0.35)]' : isLoss ? 'border-rose-500/50 shadow-[0_0_30px_rgba(244,63,94,0.35)]' : 'border-amber-500/50 shadow-[0_0_30px_rgba(245,158,11,0.35)]';
        const badgeBg = isWin ? 'bg-emerald-950/80 text-emerald-400 border-emerald-500/30' : isLoss ? 'bg-rose-950/80 text-rose-400 border-rose-500/30' : 'bg-amber-950/80 text-amber-400 border-amber-500/30';
        const resultText = isWin ? 'CHIẾN THẮNG! 🏆' : isLoss ? 'THẤT BẠI! 💔' : 'HÒA! 🤝';
        return <div className={`w-full max-w-[95vw] sm:max-w-xl md:max-w-2xl glass-panel p-4 sm:p-6 rounded-3xl bg-slate-950/95 border flex flex-col items-center gap-4 animate-scale-in pointer-events-auto transition-all ${borderColor}`}>
                        {/* Result Badge */}
                        <div className={`px-5 py-2 rounded-full border text-[11px] sm:text-xs font-black tracking-widest uppercase shadow-md ${badgeBg}`}>{resultText}</div>
                        
                        {/* Side-by-Side Cards and Comparison */}
                        <div className="w-full flex items-center justify-center gap-4 sm:gap-8 my-2">
                          
                          {/* Player's Card Side */}
                          <div className="flex flex-col items-center gap-2 w-[100px] sm:w-[130px] md:w-[150px]">
                            <span className="text-[10px] sm:text-xs text-blue-400 font-extrabold uppercase tracking-widest leading-none">Bạn</span>
                            <div className="w-full aspect-[5/7] drop-shadow-2xl">
                              <Card player={selectedPlayerCard} />
                            </div>
                            <div className="text-center mt-1">
                              <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wider block leading-none">Chỉ số đấu</span>
                              <span className="text-xl sm:text-2xl font-black text-white">{lastRound.myFinalVal}</span>
                            </div>
                          </div>

                          {/* Versus / Comparison Sign */}
                          <div className="flex flex-col items-center justify-center gap-1 shrink-0">
                            <span className="text-[8px] sm:text-[9px] font-black text-gray-500 uppercase tracking-widest leading-none">So tài</span>
                            <span className={`text-3xl sm:text-5xl font-black italic select-none drop-shadow-lg leading-none ${isWin ? 'text-emerald-400 animate-pulse' : isLoss ? 'text-rose-400' : 'text-amber-400'}`}>
                              {isWin ? '＞' : isLoss ? '＜' : '＝'}
                            </span>
                            <span className="text-[8px] sm:text-[9px] font-bold text-gray-600 bg-white/5 border border-white/10 px-2 py-0.5 rounded uppercase leading-none mt-1">
                              {lastRound.myStat.toUpperCase()}
                            </span>
                          </div>

                          {/* AI's Card Side */}
                          <div className="flex flex-col items-center gap-2 w-[100px] sm:w-[130px] md:w-[150px]">
                            <span className="text-[10px] sm:text-xs text-red-400 font-extrabold uppercase tracking-widest leading-none">Đối thủ (AI)</span>
                            <div className="w-full aspect-[5/7] drop-shadow-2xl">
                              <Card player={currentAiCard} />
                            </div>
                            <div className="text-center mt-1">
                              <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wider block leading-none">Chỉ số đấu</span>
                              <span className="text-xl sm:text-2xl font-black text-white">{lastRound.opFinalVal}</span>
                            </div>
                          </div>

                        </div>

                        {/* Breakdown text */}
                        <div className="text-[9px] sm:text-[10px] text-gray-400 text-center font-medium max-w-sm sm:max-w-md bg-black/30 border border-white/5 px-4 py-2.5 rounded-2xl leading-normal">
                          <div className="mb-1"><span className="text-blue-400 font-extrabold">Bạn</span>:{lastRound.myBonusDetails || ' [Chỉ số gốc]'}</div>
                          <div><span className="text-red-400 font-extrabold">AI</span>:{lastRound.opBonusDetails || ' [Chỉ số gốc]'}</div>
                        </div>
                      </div>;
      })()}
                  {playedCardIds.length >= 11 ? <button className="mt-4 px-6 py-3 bg-yellow-400 hover:bg-yellow-500 text-slate-950 font-black tracking-widest uppercase rounded-full shadow-lg pointer-events-auto cursor-pointer" onClick={e => {
        e.stopPropagation();
        playFx('click');
        nextRound();
      }}>XEM KẾT QUẢ 🏆</button> : <div className="mt-4 text-amber-400 text-[10px] font-bold tracking-widest uppercase bg-black/85 px-6 py-2.5 rounded-full border border-amber-500/30 shadow-lg pointer-events-auto cursor-pointer animate-pulse" onClick={e => {
        e.stopPropagation();
        dismissRoundResult();
      }}>CHẠM ĐỂ TIẾP TỤC ⚽</div>}
                </div>}

              {/* ===== LAYOUT MỚI: SÂN 3D USER ở trên, AI BAR nhỏ ở dưới ===== */}
              <div className="flex-1 flex flex-col gap-2 w-full min-h-0">

                {/* HUD Score + Environment — gọn trên cùng */}
                <div className="flex items-center gap-2 px-1">
                  <div className="flex items-center gap-2 bg-black/60 border border-white/10 rounded-2xl px-3 py-1.5 shrink-0">
                    <div className="text-center">
                      <div className="text-[9px] text-blue-400 font-bold uppercase tracking-widest leading-none">{currentUser}</div>
                      <div className="text-xl font-black text-white leading-none">{matchScore.player}</div>
                    </div>
                    <div className="text-base font-black italic text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-red-400 px-1">VS</div>
                    <div className="text-center">
                      <div className="text-[9px] text-red-400 font-bold uppercase tracking-widest leading-none">AI</div>
                      <div className="text-xl font-black text-white leading-none">{matchScore.ai}</div>
                    </div>
                  </div>

                  <div className="flex-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 bg-black/40 border border-white/5 rounded-2xl px-3 py-1.5 text-[9px] min-w-0">
                    <span className="text-gray-500 font-bold">⛅ {matchEnvironment.weather.name}</span>
                    <span className="text-gray-600">·</span>
                    <span className="text-gray-500 font-bold">🕐 {matchEnvironment.time.name}</span>
                    <span className="text-gray-600 hidden sm:inline">·</span>
                    <span className={`font-black text-[9px] hidden sm:inline px-1.5 py-0.5 rounded-full border ${playedCardIds.length % 2 === 0 ? 'bg-blue-950/60 text-blue-400 border-blue-500/20' : 'bg-amber-950/60 text-amber-400 border-amber-500/20'}`}>
                      {playedCardIds.length % 2 === 0 ? '⚔️ LƯỢT TẤN CÔNG' : '🛡️ LƯỢT PHÒNG THỦ'}
                    </span>
                  </div>

                  <button className="shrink-0 text-gray-500 hover:text-white bg-black/60 hover:bg-red-950/60 border border-white/10 hover:border-red-500/30 text-[9px] font-bold uppercase tracking-widest px-2.5 py-1.5 rounded-xl transition-all cursor-pointer" onClick={() => setGameState('lobby')}>
                    Thoát
                  </button>
                </div>

                <div className="flex items-center justify-center gap-1.5 text-[8px] sm:text-[9px] font-bold text-gray-500 tracking-wide select-none">
                  <span className="text-yellow-500">⚡ Tốc độ</span><span className="text-gray-600">→</span>
                  <span className="text-cyan-500">🌀 Kỹ thuật</span><span className="text-gray-600">→</span>
                  <span className="text-red-500">💪 Sức mạnh</span><span className="text-gray-600">→</span>
                  <span className="text-yellow-500">⚡ Tốc độ</span>
                  <span className="text-gray-600 ml-1">(+10 OVR khắc chế)</span>
                </div>

                {/* SÂN 3D */}
                <div className="glass-panel p-2 pb-4 rounded-2xl flex-1 flex flex-col relative bg-black/30 border border-white/10 min-h-0">
                  <h3 className="text-[9px] font-bold tracking-widest uppercase mb-1 text-center text-gray-400">ĐỘI HÌNH RA SÂN CỦA BẠN</h3>
                  
                  <div className="pitch-wrapper flex-1 mt-1 min-h-0">
                    <div className="pitch-container">
                      <div className="pitch-lines"></div>
                      <div className="penalty-box-top"></div>
                      <div className="penalty-box-bottom"></div>
                      
                      {playerHand.map((player, idx) => {
              const isPlayed = playedCardIds.includes(player.id);
              const isSelected = selectedPlayerCard?.id === player.id;
              const pos = PITCH_POSITIONS[idx] || {
                top: '50%',
                left: '50%'
              };
              if (isPlayed) return null;
              const chemBoost = getPlayerChemistryBoost(player, squad);
              const isCap = squad.length > 0 && player.id === squad[0].id;
              return <div key={player.id} className={`pitch-player-slot cursor-pointer ${isSelected ? 'selected' : ''}`} style={{
                top: pos.top,
                left: pos.left,
                zIndex: Math.round(parseFloat(pos.top))
              }} onClick={() => {
                if (!isPlayed) {
                  playFx('click');
                  if (matchPhase === 'playing') {
                    const isPlayerTurn = playedCardIds.length % 2 === 0;
                    if (isPlayerTurn) {
                      setSelectedPlayerCard(player);
                    } else {
                      // AI Turn: Player clicks to select defending card and immediately play!
                      playRoundAiTurn(player);
                    }
                  } else if (matchPhase === 'roundResult') {
                    if (playedCardIds.length >= 11) {
                      nextRound(); // Xử lý GameOver
                    } else {
                      const nextRoundPlayedCount = playedCardIds.length;
                      setMatchPhase('playing');
                      setSelectedStat(null);
                      setCurrentAiCard(null);
                      if (nextRoundPlayedCount % 2 === 0) {
                        setSelectedPlayerCard(player);
                      } else {
                        // AI initiated turn triggered
                        triggerAiTurn(playedCardIds, aiHand);
                      }
                    }
                  }
                }
              }}>
                            <Card player={player} hideStats={false} />
                            
                            {/* Badges overlay on the pitch */}
                            <div className="absolute -top-3 -right-3 z-30 flex flex-col gap-1 pointer-events-none select-none">
                              {isCap && <span className="bg-gradient-to-r from-yellow-500 to-amber-600 text-slate-950 text-[9px] font-black px-1.5 py-0.5 rounded-full border border-yellow-400/50 shadow-md flex items-center gap-0.5">
                                  👑 C
                                </span>}
                              {chemBoost > 0 && <span className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full border border-cyan-400/50 shadow-md flex items-center gap-0.5">
                                  🤝 +{chemBoost}
                                </span>}
                            </div>
                          </div>;
            })}
                    </div>
                  </div>
                </div>

                {/* ===== AI COMPACT BAR — nhỏ gọn ở phía dưới ===== */}
                <div className="shrink-0 bg-slate-950/85 border border-red-900/40 rounded-2xl px-3 py-2.5 flex items-center gap-3 shadow-lg">
                  {/* AI Label */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <div className="w-8 h-8 bg-gradient-to-br from-red-800 to-red-950 rounded-xl flex items-center justify-center border border-red-500/40 shadow-[0_0_10px_rgba(239,68,68,0.3)]">
                      <span className="text-red-400 font-black text-[9px] tracking-wider">AI</span>
                    </div>
                    <div>
                      <div className="text-[9px] font-black text-red-400 uppercase tracking-widest leading-none">HLV Đối Thủ</div>
                      <div className="text-[8px] text-gray-500 font-extrabold leading-none mt-1">Còn {aiHand.length} lá</div>
                    </div>
                  </div>

                  {/* Separator */}
                  <div className="w-px h-8 bg-white/10 shrink-0"></div>

                  {/* AI card played / waiting */}
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {currentAiCard ? <>
                        <div className="w-14 sm:w-16 aspect-[5/7] shrink-0 drop-shadow-[0_0_10px_rgba(239,68,68,0.4)] hover:scale-105 transition-transform duration-200">
                          <Card player={currentAiCard} />
                        </div>
                        <div className="min-w-0">
                          <div className="text-[9px] text-red-400 font-black uppercase tracking-wider flex items-center gap-1.5 leading-none">
                            {matchPhase === 'roundResult' ? <span>🤖 AI đã ra:</span> : <span className="flex items-center gap-1 text-yellow-400 animate-pulse">
                                ⚔️ AI tấn công bằng <span className="bg-yellow-400/20 text-yellow-400 border border-yellow-400/30 px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider">{selectedStat}</span>:
                              </span>}
                          </div>
                          <div className="text-xs font-black text-white truncate leading-tight mt-1">{currentAiCard.name}</div>
                          {matchPhase === 'playing' && <div className="text-[8px] text-gray-400 font-semibold leading-none mt-1">Chọn cầu thủ phòng thủ ({selectedStat === 'defense' ? 'ATK' : selectedStat === 'control' ? 'CTRL' : 'DEF'})</div>}
                        </div>
                      </> : <div className="flex items-center gap-2 text-red-400/50">
                        <div className="w-2 h-2 rounded-full bg-red-500/50 animate-ping"></div>
                        <span className="text-[9px] font-extrabold uppercase tracking-widest text-gray-600">AI đang suy tính nước đi...</span>
                      </div>}
                  </div>

                  {/* Mini face-down count chips */}
                  <div className="flex items-center gap-1 shrink-0">
                    {Array.from({
            length: Math.min(aiHand.length, 6)
          }).map((_, i) => <div key={i} className="w-3.5 h-5 bg-gradient-to-b from-slate-700 to-slate-800 border border-slate-600 rounded-sm flex items-center justify-center opacity-50 shadow-sm">
                        <span className="text-[6px] text-slate-500 font-black">?</span>
                      </div>)}
                    {aiHand.length > 6 && <span className="text-[8px] text-gray-500 font-black ml-0.5">+{aiHand.length - 6}</span>}
                  </div>
                </div>

              </div>
            </div>}
        </div>
  );
}
