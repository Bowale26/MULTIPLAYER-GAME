import React, { useState, useEffect } from 'react';
import { 
  Trophy, 
  Crown, 
  Flame, 
  Zap, 
  Medal, 
  RefreshCw, 
  Search, 
  X, 
  Award, 
  TrendingUp, 
  Users, 
  CheckCircle2, 
  Gamepad2,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { GlobalLeaderboardEntry, UserProfile } from '../types/game';
import { soundManager } from '../utils/sound';

interface GlobalLeaderboardProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
  onPlayGame?: () => void;
  onOpenAchievements?: () => void;
}

type SortMetric = 'totalPoints' | 'winRate' | 'gamesWon' | 'highScore';

export const GlobalLeaderboard: React.FC<GlobalLeaderboardProps> = ({
  isOpen,
  onClose,
  currentUser,
  onPlayGame,
  onOpenAchievements,
}) => {
  const [leaderboard, setLeaderboard] = useState<GlobalLeaderboardEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortMetric, setSortMetric] = useState<SortMetric>('totalPoints');
  const [lastUpdated, setLastUpdated] = useState<number>(Date.now());

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/leaderboard');
      const data = await res.json();
      if (data.success && data.leaderboard) {
        setLeaderboard(data.leaderboard);
        setLastUpdated(data.updatedAt || Date.now());
      }
    } catch (err) {
      console.error('Failed to fetch leaderboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchLeaderboard();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleRefresh = () => {
    soundManager.playClick();
    fetchLeaderboard();
  };

  // Sort and filter entries
  const sortedEntries = [...leaderboard].sort((a, b) => {
    if (sortMetric === 'totalPoints') return b.totalPoints - a.totalPoints;
    if (sortMetric === 'winRate') return b.winRate - a.winRate;
    if (sortMetric === 'gamesWon') return b.gamesWon - a.gamesWon;
    if (sortMetric === 'highScore') return b.highScore - a.highScore;
    return b.totalPoints - a.totalPoints;
  });

  const filteredEntries = sortedEntries.filter((p) =>
    p.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const top1 = sortedEntries[0];
  const top2 = sortedEntries[1];
  const top3 = sortedEntries[2];
  const restEntries = filteredEntries.filter(
    (p) => searchTerm || (p.id !== top1?.id && p.id !== top2?.id && p.id !== top3?.id)
  );

  const avatarGradients = [
    'from-blue-500 to-cyan-500',
    'from-purple-500 to-indigo-600',
    'from-pink-500 to-rose-600',
    'from-amber-400 to-orange-500',
    'from-emerald-400 to-teal-600',
    'from-fuchsia-500 to-purple-600',
  ];

  // User's rank if present
  const userEntry = leaderboard.find(
    (p) => p.id === currentUser?.id || p.username.toLowerCase() === currentUser?.username.toLowerCase()
  );
  const userRank = userEntry ? leaderboard.indexOf(userEntry) + 1 : null;
  const pointsBehindTop = top1 && userEntry ? Math.max(0, top1.totalPoints - userEntry.totalPoints) : 0;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 select-none">
      <div className="w-full max-w-4xl bg-[#070b1a] border border-[#1f2d57] rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-5 py-3.5 bg-[#0b122c] border-b border-[#1b274e] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-yellow-400 to-orange-500 p-0.5 shadow-lg shadow-amber-500/20">
              <div className="w-full h-full bg-[#090f23] rounded-[10px] flex items-center justify-center">
                <Trophy className="w-5 h-5 text-amber-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black text-white tracking-wide">
                  GLOBAL LEADERBOARD
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  TOP 10 PLAYERS
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Ranked by total career points earned across all Color Clash matches
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-[#152042] border border-[#1e2c56] transition-all disabled:opacity-50"
              title="Refresh Leaderboard"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
            </button>
            <button
              onClick={() => {
                soundManager.playClick();
                onClose();
              }}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-[#152042] border border-[#1e2c56] transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Controls Bar: Sort tabs & Search */}
        <div className="px-5 py-3 bg-[#0a1026] border-b border-[#172346] flex flex-wrap items-center justify-between gap-3">
          {/* Metric Sort Pills */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#060a18] border border-[#1a264a]">
            <button
              onClick={() => {
                soundManager.playClick();
                setSortMetric('totalPoints');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                sortMetric === 'totalPoints'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              <span>Total Points</span>
            </button>

            <button
              onClick={() => {
                soundManager.playClick();
                setSortMetric('gamesWon');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                sortMetric === 'gamesWon'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Award className="w-3.5 h-3.5 text-yellow-400" />
              <span>Matches Won</span>
            </button>

            <button
              onClick={() => {
                soundManager.playClick();
                setSortMetric('winRate');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                sortMetric === 'winRate'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              <span>Win Rate %</span>
            </button>

            <button
              onClick={() => {
                soundManager.playClick();
                setSortMetric('highScore');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                sortMetric === 'highScore'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-cyan-400" />
              <span>High Score</span>
            </button>
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-56">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search player..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-[#060a18] border border-[#1b274c] rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-5 flex-1">
          {/* Top 3 Podium (Shown if no search term active) */}
          {!searchTerm && sortedEntries.length >= 3 && (
            <div className="grid grid-cols-3 gap-3 sm:gap-4 items-end pt-2 pb-1">
              {/* 2nd Place: Silver */}
              {top2 && (
                <div className="relative p-3.5 sm:p-4 rounded-2xl bg-gradient-to-b from-[#131b38] to-[#0c132a] border border-[#263768] text-center flex flex-col items-center shadow-lg transform translate-y-2">
                  <div className="absolute -top-3 px-2 py-0.5 rounded-full bg-slate-700/80 border border-slate-400/50 text-[10px] font-black text-slate-200 flex items-center gap-1 shadow-md">
                    <Medal className="w-3 h-3 text-slate-300" /> #2 SILVER
                  </div>
                  <div
                    className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-tr ${
                      avatarGradients[(top2.avatarIndex - 1) % avatarGradients.length]
                    } ring-2 ring-slate-400/60 flex items-center justify-center font-black text-white text-lg sm:text-xl shadow-lg mt-2 mb-2`}
                  >
                    {top2.username.charAt(0).toUpperCase()}
                  </div>
                  <h3 className="text-xs sm:text-sm font-black text-white truncate max-w-full">
                    {top2.username}
                  </h3>
                  <div className="text-base sm:text-lg font-black text-cyan-400 font-mono tracking-tight">
                    {top2.totalPoints.toLocaleString()} <span className="text-[10px] text-slate-400 font-sans">PTS</span>
                  </div>
                  <div className="mt-1 flex items-center gap-1 text-[10px] text-slate-400">
                    <span className="text-emerald-400 font-bold">{top2.gamesWon}W</span> / {top2.gamesPlayed}G ({top2.winRate}%)
                  </div>
                </div>
              )}

              {/* 1st Place: Gold Champion */}
              {top1 && (
                <div className="relative p-4 sm:p-5 rounded-2xl bg-gradient-to-b from-[#241e12] via-[#1a1728] to-[#0d1028] border-2 border-amber-500/60 text-center flex flex-col items-center shadow-2xl shadow-amber-500/10 z-10">
                  <div className="absolute -top-3.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 text-[#070b1a] text-[10px] font-black tracking-wider flex items-center gap-1 shadow-lg">
                    <Crown className="w-3.5 h-3.5 fill-current" /> #1 CHAMPION
                  </div>
                  <div
                    className={`w-16 h-16 sm:w-18 sm:h-18 rounded-2xl bg-gradient-to-tr ${
                      avatarGradients[(top1.avatarIndex - 1) % avatarGradients.length]
                    } ring-4 ring-amber-400 flex items-center justify-center font-black text-white text-2xl shadow-xl shadow-amber-500/20 mt-2 mb-2 animate-pulse`}
                  >
                    {top1.username.charAt(0).toUpperCase()}
                  </div>
                  <h3 className="text-sm sm:text-base font-black text-white truncate max-w-full flex items-center gap-1">
                    <span>{top1.username}</span>
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  </h3>
                  <div className="text-xl sm:text-2xl font-black text-amber-300 font-mono tracking-tight drop-shadow-md">
                    {top1.totalPoints.toLocaleString()} <span className="text-xs text-amber-400 font-sans">PTS</span>
                  </div>
                  <div className="mt-1 flex items-center gap-2 text-[11px] text-slate-300 font-semibold">
                    <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      {top1.gamesWon} Wins
                    </span>
                    <span className="text-emerald-400 font-bold">{top1.winRate}% Win</span>
                  </div>
                </div>
              )}

              {/* 3rd Place: Bronze */}
              {top3 && (
                <div className="relative p-3.5 sm:p-4 rounded-2xl bg-gradient-to-b from-[#1c1417] to-[#0c1126] border border-[#482820] text-center flex flex-col items-center shadow-lg transform translate-y-3">
                  <div className="absolute -top-3 px-2 py-0.5 rounded-full bg-amber-900/80 border border-amber-600/50 text-[10px] font-black text-amber-200 flex items-center gap-1 shadow-md">
                    <Medal className="w-3 h-3 text-amber-500" /> #3 BRONZE
                  </div>
                  <div
                    className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-tr ${
                      avatarGradients[(top3.avatarIndex - 1) % avatarGradients.length]
                    } ring-2 ring-amber-600/60 flex items-center justify-center font-black text-white text-lg sm:text-xl shadow-lg mt-2 mb-2`}
                  >
                    {top3.username.charAt(0).toUpperCase()}
                  </div>
                  <h3 className="text-xs sm:text-sm font-black text-white truncate max-w-full">
                    {top3.username}
                  </h3>
                  <div className="text-base sm:text-lg font-black text-amber-400 font-mono tracking-tight">
                    {top3.totalPoints.toLocaleString()} <span className="text-[10px] text-slate-400 font-sans">PTS</span>
                  </div>
                  <div className="mt-1 flex items-center gap-1 text-[10px] text-slate-400">
                    <span className="text-emerald-400 font-bold">{top3.gamesWon}W</span> / {top3.gamesPlayed}G ({top3.winRate}%)
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Leaderboard Table */}
          <div className="rounded-2xl bg-[#090f24] border border-[#1b284e] overflow-hidden shadow-lg">
            <div className="px-4 py-2.5 bg-[#0e1634] border-b border-[#1b274e] flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              <div className="flex items-center gap-6">
                <span className="w-8 text-center">Rank</span>
                <span>Player</span>
              </div>
              <div className="flex items-center gap-6 sm:gap-10">
                <span className="hidden sm:inline w-20 text-center">Record</span>
                <span className="hidden sm:inline w-16 text-center">High Score</span>
                <span className="w-24 text-right">Points</span>
              </div>
            </div>

            <div className="divide-y divide-[#141e3d]">
              {restEntries.map((player) => {
                const isCurrentUser =
                  player.id === currentUser?.id ||
                  player.username.toLowerCase() === currentUser?.username.toLowerCase();

                return (
                  <div
                    key={player.id}
                    className={`px-4 py-3 flex items-center justify-between transition-colors ${
                      isCurrentUser
                        ? 'bg-blue-950/40 border-l-4 border-l-blue-500'
                        : 'hover:bg-[#0c1430]'
                    }`}
                  >
                    {/* Rank & Player Info */}
                    <div className="flex items-center gap-3">
                      <div className="w-8 text-center">
                        <span
                          className={`inline-flex items-center justify-center w-6 h-6 rounded-lg font-black text-xs ${
                            player.rank === 1
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                              : player.rank === 2
                              ? 'bg-slate-400/20 text-slate-200 border border-slate-400/40'
                              : player.rank === 3
                              ? 'bg-amber-800/30 text-amber-400 border border-amber-800/40'
                              : 'bg-[#121c38] text-slate-400'
                          }`}
                        >
                          #{player.rank}
                        </span>
                      </div>

                      <div
                        className={`w-9 h-9 rounded-xl bg-gradient-to-tr ${
                          avatarGradients[(player.avatarIndex - 1) % avatarGradients.length]
                        } flex items-center justify-center font-black text-white text-sm shadow-md shrink-0`}
                      >
                        {player.username.charAt(0).toUpperCase()}
                      </div>

                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs sm:text-sm font-black text-white">
                            {player.username}
                          </span>
                          {isCurrentUser && (
                            <span className="px-1.5 py-0.2 rounded-md bg-blue-500/20 text-blue-300 text-[9px] font-black border border-blue-500/30">
                              YOU
                            </span>
                          )}
                          {player.bestStreak && player.bestStreak >= 5 && (
                            <span
                              className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-400 text-[9px] font-bold flex items-center gap-0.5"
                              title={`${player.bestStreak}x Win Streak record`}
                            >
                              <Flame className="w-2.5 h-2.5" /> {player.bestStreak}x
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-500 font-mono">
                          ID: {player.id}
                        </span>
                      </div>
                    </div>

                    {/* Stats & Points */}
                    <div className="flex items-center gap-6 sm:gap-10">
                      <div className="hidden sm:block w-20 text-center">
                        <span className="text-xs font-bold text-slate-300">
                          {player.gamesWon}W / {player.gamesPlayed}G
                        </span>
                        <div className="w-full bg-[#141f3d] h-1.5 rounded-full mt-1 overflow-hidden">
                          <div
                            className="bg-emerald-500 h-full rounded-full"
                            style={{ width: `${Math.min(100, player.winRate)}%` }}
                          />
                        </div>
                      </div>

                      <div className="hidden sm:block w-16 text-center font-mono text-xs font-bold text-slate-400">
                        {player.highScore}
                      </div>

                      <div className="w-24 text-right">
                        <span className="text-sm sm:text-base font-black text-cyan-400 font-mono">
                          {player.totalPoints.toLocaleString()}
                        </span>
                        <span className="text-[10px] text-slate-500 block">PTS</span>
                      </div>
                    </div>
                  </div>
                );
              })}

              {restEntries.length === 0 && (
                <div className="p-8 text-center text-slate-400">
                  <Users className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                  <p className="text-xs">No players found matching &ldquo;{searchTerm}&rdquo;</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* User Standing Footer Bar */}
        <div className="px-5 py-3.5 bg-[#0a1027] border-t border-[#1b274e] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${
                avatarGradients[((currentUser?.avatarIndex || 1) - 1) % avatarGradients.length]
              } flex items-center justify-center font-black text-white text-base shadow-md shrink-0`}
            >
              {(currentUser?.username || 'You').charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-300">Your Current Standing:</span>
                <span className="px-2 py-0.5 rounded-full bg-blue-600 text-white text-[10px] font-black">
                  #{userRank || '—'} {currentUser?.username || 'Guest'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                <strong className="text-cyan-300 font-mono">
                  {currentUser?.stats?.totalPoints || 0} Points
                </strong>
                {top1 && pointsBehindTop > 0 && (
                  <span className="text-slate-500">
                    {' '}&bull; {pointsBehindTop.toLocaleString()} pts behind #1
                  </span>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onOpenAchievements && (
              <button
                onClick={() => {
                  soundManager.playClick();
                  onOpenAchievements();
                }}
                className="px-3.5 py-2 rounded-xl bg-[#141f3f] hover:bg-[#1b2b57] border border-[#233463] text-slate-200 text-xs font-bold transition-all flex items-center gap-1.5"
              >
                <Award className="w-3.5 h-3.5 text-amber-400" />
                <span>My Badges</span>
              </button>
            )}

            {onPlayGame && (
              <button
                onClick={() => {
                  soundManager.playClick();
                  onPlayGame();
                  onClose();
                }}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-black transition-all shadow-lg shadow-blue-600/30 flex items-center gap-1.5"
              >
                <Gamepad2 className="w-4 h-4" />
                <span>Play & Earn Points</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
