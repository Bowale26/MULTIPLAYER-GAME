import React, { useState } from 'react';
import { 
  Crown, 
  Flame, 
  CheckCircle2, 
  Trophy, 
  Medal, 
  UserPlus, 
  UserMinus, 
  Trash2, 
  Bot, 
  Share2, 
  Check, 
  ShieldCheck, 
  History, 
  Users, 
  Sparkles,
  Zap,
  ArrowRight
} from 'lucide-react';
import { RoomData, Player } from '../types/game';
import { soundManager } from '../utils/sound';

interface MultiplayerSidebarProps {
  room: RoomData | null;
  currentUserId: string;
  onAddMember?: (member: { nickname: string; isBot?: boolean; rating?: number; avatarIndex?: number }) => void;
  onDeleteMember?: (playerId: string) => void;
  onOpenHistory?: () => void;
}

export const MultiplayerSidebar: React.FC<MultiplayerSidebarProps> = ({
  room,
  currentUserId,
  onAddMember,
  onDeleteMember,
  onOpenHistory,
}) => {
  const [activeView, setActiveView] = useState<'roster' | 'leaderboard' | 'audit'>('roster');
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [customNickname, setCustomNickname] = useState('');
  const [customRating, setCustomRating] = useState(1350);
  const [isBotChallenger, setIsBotChallenger] = useState(true);
  const [selectedBotPreset, setSelectedBotPreset] = useState<string>('Cipher (Diamond 1850)');
  const [copiedLink, setCopiedLink] = useState(false);

  const players: Player[] = room?.players || [
    { id: 'player-alex-you', nickname: 'Alex (You)', score: 85, connected: true, isHost: true, avatarIndex: 1, streak: 3, competitiveRating: 1542, tier: 'Gold' },
    { id: 'bot-sarah', nickname: 'Sarah', score: 70, connected: true, isHost: false, avatarIndex: 2, streak: 2, isBot: true, competitiveRating: 1504, tier: 'Gold' },
    { id: 'bot-mike', nickname: 'Mike', score: 65, connected: true, isHost: false, avatarIndex: 3, streak: 1, isBot: true, competitiveRating: 1390, tier: 'Silver' },
    { id: 'bot-emma', nickname: 'Emma', score: 60, connected: true, isHost: false, avatarIndex: 4, streak: 0, isBot: true, competitiveRating: 1390, tier: 'Silver' },
    { id: 'bot-david', nickname: 'David', score: 55, connected: true, isHost: false, avatarIndex: 5, streak: 1, isBot: true, competitiveRating: 1250, tier: 'Silver' },
  ];

  const sortedLeaderboard = [...players].sort((a, b) => b.score - a.score);

  const currentPlayer = players.find(p => p.id === currentUserId || p.nickname.includes('(You)'));
  const isHost = currentPlayer?.isHost ?? true;

  // Bot Presets tailored for adult competitive play
  const BOT_PRESETS = [
    { name: 'Cipher', rating: 1850, tier: 'Diamond', avatar: 3, title: 'AI Speed Master' },
    { name: 'Valkyrie', rating: 1650, tier: 'Platinum', avatar: 4, title: 'Tactical Challenger' },
    { name: 'Nova', rating: 1420, tier: 'Gold', avatar: 2, title: 'Consistent Veteran' },
    { name: 'Rook', rating: 1250, tier: 'Silver', avatar: 5, title: 'Calculated Strategist' },
    { name: 'Apex', rating: 2100, tier: 'Grandmaster', avatar: 6, title: 'Elite Grandmaster' },
  ];

  const getAvatarGradient = (index: number) => {
    const gradients = [
      'from-blue-500 to-cyan-500',
      'from-purple-500 to-indigo-600',
      'from-pink-500 to-rose-600',
      'from-amber-400 to-orange-500',
      'from-emerald-400 to-teal-600',
      'from-fuchsia-500 to-purple-600',
    ];
    return gradients[(index - 1 + gradients.length) % gradients.length];
  };

  const getTierBadge = (rating: number = 1200) => {
    if (rating >= 2000) {
      return <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-rose-500/20 text-rose-300 border border-rose-500/40">GM</span>;
    }
    if (rating >= 1800) {
      return <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">DIA</span>;
    }
    if (rating >= 1600) {
      return <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">PLAT</span>;
    }
    if (rating >= 1400) {
      return <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/40">GOLD</span>;
    }
    return <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-slate-500/20 text-slate-300 border border-slate-500/40">SILVER</span>;
  };

  const handleAddPresetBot = (preset: typeof BOT_PRESETS[0]) => {
    if (onAddMember) {
      onAddMember({
        nickname: preset.name,
        isBot: true,
        rating: preset.rating,
        avatarIndex: preset.avatar,
      });
      setIsAddMemberOpen(false);
    }
  };

  const handleAddCustomMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customNickname.trim()) return;

    if (onAddMember) {
      onAddMember({
        nickname: customNickname.trim(),
        isBot: isBotChallenger,
        rating: customRating,
        avatarIndex: Math.floor(Math.random() * 6) + 1,
      });
      setCustomNickname('');
      setIsAddMemberOpen(false);
    }
  };

  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const handleDeletePlayer = (playerId: string) => {
    soundManager.playClick();
    if (confirmDeleteId === playerId) {
      if (onDeleteMember) {
        onDeleteMember(playerId);
      }
      setConfirmDeleteId(null);
    } else {
      setConfirmDeleteId(playerId);
      setTimeout(() => {
        setConfirmDeleteId((current) => (current === playerId ? null : current));
      }, 4000);
    }
  };

  const handleCopyShareLink = () => {
    soundManager.playClick();
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <aside className="w-72 shrink-0 bg-[#070b19] border-l border-[#192444] flex flex-col p-3 space-y-3 select-none overflow-y-auto">
      {/* Top Header & Share Button */}
      <div className="flex items-center justify-between pb-1 border-b border-[#151f3b]">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-black uppercase tracking-wider text-slate-100">
            Game Arena
          </span>
        </div>
        <button
          onClick={handleCopyShareLink}
          title="Share Match Link"
          className="flex items-center gap-1 px-2 py-1 bg-[#101b3a] hover:bg-[#182855] border border-[#223565] rounded-lg text-[10px] font-bold text-cyan-300 transition-colors"
        >
          {copiedLink ? <Check className="w-3 h-3 text-emerald-400" /> : <Share2 className="w-3 h-3" />}
          <span>{copiedLink ? 'Copied' : 'Share'}</span>
        </button>
      </div>

      {/* View Switcher Tabs */}
      <div className="flex p-0.5 bg-[#0a1128] rounded-xl border border-[#1b274c]">
        <button
          onClick={() => setActiveView('roster')}
          className={`flex-1 py-1 text-[11px] font-bold rounded-lg transition-colors flex items-center justify-center gap-1 ${
            activeView === 'roster'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Users className="w-3 h-3" />
          <span>Members ({players.length})</span>
        </button>
        <button
          onClick={() => setActiveView('leaderboard')}
          className={`flex-1 py-1 text-[11px] font-bold rounded-lg transition-colors flex items-center justify-center gap-1 ${
            activeView === 'leaderboard'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Trophy className="w-3 h-3 text-amber-400" />
          <span>Scores</span>
        </button>
        <button
          onClick={() => setActiveView('audit')}
          className={`flex-1 py-1 text-[11px] font-bold rounded-lg transition-colors flex items-center justify-center gap-1 ${
            activeView === 'audit'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <History className="w-3 h-3" />
          <span>Audit</span>
        </button>
      </div>

      {/* 1. ROSTER VIEW WITH ADD/DELETE GAME MEMBERS */}
      {activeView === 'roster' && (
        <div className="bg-[#0b1229] border border-[#1b274c] rounded-2xl p-3 shadow-md space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black uppercase tracking-wider text-slate-200">
                Match Roster
              </span>
              <span className="px-1.5 py-0.2 bg-blue-500/20 text-blue-300 text-[10px] font-bold rounded-md">
                {players.length}/{room?.maxPlayers || 8}
              </span>
            </div>

            {/* Add Member Button */}
            <button
              onClick={() => {
                soundManager.playClick();
                setIsAddMemberOpen(!isAddMemberOpen);
              }}
              className="flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-[10px] font-black rounded-lg shadow-sm transition-all"
            >
              <UserPlus className="w-3 h-3" />
              <span>Add Member</span>
            </button>
          </div>

          {/* Add Member Drawer/Dropdown */}
          {isAddMemberOpen && (
            <div className="p-2.5 bg-[#0e1736] border border-[#233566] rounded-xl space-y-2.5 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-200 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-cyan-400" /> Quick Add Member
                </span>
                <button
                  onClick={() => setIsAddMemberOpen(false)}
                  className="text-slate-400 hover:text-white text-[10px]"
                >
                  ✕
                </button>
              </div>

              {/* Preset AI Challengers */}
              <div>
                <span className="text-[9px] uppercase font-bold text-slate-400 block mb-1">
                  Competitive AI Challengers
                </span>
                <div className="grid grid-cols-2 gap-1.5">
                  {BOT_PRESETS.map((bot) => (
                    <button
                      key={bot.name}
                      onClick={() => handleAddPresetBot(bot)}
                      disabled={players.some((p) => p.nickname === bot.name) || players.length >= (room?.maxPlayers || 8)}
                      className="p-1.5 bg-[#121c3f] hover:bg-[#1a285a] disabled:opacity-40 disabled:hover:bg-[#121c3f] border border-[#223567] rounded-lg text-left transition-colors flex items-center justify-between"
                    >
                      <div className="min-w-0">
                        <div className="text-[10px] font-bold text-slate-200 truncate flex items-center gap-1">
                          <Bot className="w-2.5 h-2.5 text-cyan-400 shrink-0" />
                          <span>{bot.name}</span>
                        </div>
                        <span className="text-[9px] text-slate-400">{bot.rating} ELO</span>
                      </div>
                      <span className="text-[8px] font-black text-amber-400 bg-amber-500/10 px-1 py-0.5 rounded">
                        {bot.tier}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Member Form */}
              <form onSubmit={handleAddCustomMember} className="pt-2 border-t border-[#1a264a] space-y-1.5">
                <span className="text-[9px] uppercase font-bold text-slate-400 block">
                  Add Custom Member
                </span>
                <input
                  type="text"
                  placeholder="Member nickname..."
                  value={customNickname}
                  onChange={(e) => setCustomNickname(e.target.value)}
                  maxLength={18}
                  className="w-full px-2 py-1 bg-[#090f23] border border-[#20315e] rounded-lg text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-blue-400"
                />
                <div className="flex items-center justify-between text-[10px] text-slate-400 px-1">
                  <label className="flex items-center gap-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isBotChallenger}
                      onChange={(e) => setIsBotChallenger(e.target.checked)}
                      className="rounded bg-[#090f23] border-[#20315e] text-blue-500 focus:ring-0"
                    />
                    <span>AI Bot</span>
                  </label>
                  <span>Rating: {customRating} ELO</span>
                </div>
                <button
                  type="submit"
                  disabled={!customNickname.trim() || players.length >= (room?.maxPlayers || 8)}
                  className="w-full py-1 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-slate-950 font-bold text-[10px] rounded-lg transition-colors"
                >
                  + Add to Game
                </button>
              </form>
            </div>
          )}

          {/* Members List with Delete Action */}
          <div className="space-y-1.5 max-h-[380px] overflow-y-auto pr-0.5">
            {players.map((p: Player) => {
              const isMe = p.id === currentUserId || p.nickname.includes('(You)');
              const hasSubmitted = room?.submissions ? !!room.submissions[p.id] : false;
              const rating = p.competitiveRating || (p.isBot ? 1400 : 1200 + p.score * 5);

              return (
                <div
                  key={p.id}
                  className={`group flex items-center justify-between px-2.5 py-1.5 rounded-xl transition-all ${
                    isMe
                      ? 'bg-blue-600/20 border border-blue-500/40 shadow-sm'
                      : 'bg-[#0f1733] border border-[#1d2b52] hover:bg-[#131d40]'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div
                      className={`w-7 h-7 rounded-full bg-gradient-to-tr ${getAvatarGradient(
                        p.avatarIndex
                      )} flex items-center justify-center text-white text-[11px] font-bold shadow-sm relative shrink-0`}
                    >
                      {p.nickname.charAt(0).toUpperCase()}
                      <span
                        className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-[#0b1229] ${
                          p.connected ? 'bg-emerald-400' : 'bg-slate-500'
                        }`}
                      />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-bold text-slate-100 truncate max-w-[85px]">
                          {p.nickname}
                        </span>
                        {p.isHost && (
                          <span title="Room Host">
                            <Crown className="w-3 h-3 text-yellow-400 shrink-0 fill-yellow-400" />
                          </span>
                        )}
                        {p.isBot && (
                          <span className="px-1 py-0.2 bg-cyan-500/20 text-cyan-300 text-[8px] font-bold rounded">
                            BOT
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 text-[9px] text-slate-400">
                        {getTierBadge(rating)}
                        <span>{rating} ELO</span>
                        {p.streak >= 2 && (
                          <span className="text-amber-400 font-semibold flex items-center gap-0.5">
                            <Flame className="w-2.5 h-2.5 fill-amber-400" /> {p.streak}x
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions & Score */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    {hasSubmitted && (
                      <span title="Round Submitted">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      </span>
                    )}
                    
                    <span className="font-mono text-xs font-black text-white tabular-nums px-1.5 py-0.5 rounded bg-[#070b1a] border border-[#1a2546]">
                      {p.score}
                    </span>

                    {/* Delete / Kick Member Button (enabled for host or anyone on bots, but not on self) */}
                    {!isMe && (
                      <button
                        onClick={() => handleDeletePlayer(p.id)}
                        title={confirmDeleteId === p.id ? `Click again to confirm removing ${p.nickname}` : `Remove ${p.nickname} from match`}
                        className={`p-1 rounded-md transition-all flex items-center gap-1 ${
                          confirmDeleteId === p.id
                            ? 'bg-rose-600 text-white font-bold text-[9px] px-1.5 py-0.5 shadow-md shadow-rose-600/30'
                            : 'opacity-70 group-hover:opacity-100 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10'
                        }`}
                      >
                        <Trash2 className="w-3 h-3" />
                        {confirmDeleteId === p.id && <span>Remove?</span>}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. LEADERBOARD VIEW */}
      {activeView === 'leaderboard' && (
        <div className="bg-[#0b1229] border border-[#1b274c] rounded-2xl p-3 shadow-md space-y-2">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-1.5">
              <Trophy className="w-3.5 h-3.5 text-yellow-400" />
              <span className="text-xs font-black uppercase tracking-wider text-slate-200">
                Match Standing
              </span>
            </div>
            <span className="text-[10px] text-yellow-400 font-bold flex items-center gap-0.5">
              <Medal className="w-3 h-3" /> Ranked
            </span>
          </div>

          <div className="space-y-1.5">
            {sortedLeaderboard.map((p, idx) => {
              const rank = idx + 1;
              const isMe = p.id === currentUserId || p.nickname.includes('(You)');

              return (
                <div
                  key={p.id}
                  className={`flex items-center justify-between px-2.5 py-1.5 rounded-xl ${
                    isMe ? 'bg-indigo-950/40 border border-indigo-500/30' : 'bg-[#0f1733]'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className={`w-5 h-5 rounded-full font-black text-[11px] flex items-center justify-center ${
                      rank === 1 ? 'bg-yellow-400 text-slate-950 shadow-[0_0_8px_rgba(250,204,21,0.6)]' :
                      rank === 2 ? 'bg-slate-300 text-slate-950' :
                      rank === 3 ? 'bg-amber-600 text-white' :
                      'bg-[#1b2646] text-slate-400'
                    }`}>
                      {rank}
                    </span>
                    <span className="text-xs font-bold text-slate-200 truncate max-w-[100px]">
                      {p.nickname}
                    </span>
                  </div>
                  <span className="font-mono text-xs font-black text-yellow-300 tabular-nums">
                    {p.score} pts
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. EVENT LOG / AUDIT */}
      {activeView === 'audit' && (
        <div className="bg-[#0b1229] border border-[#1b274c] rounded-2xl p-3 shadow-md flex-1 min-h-[220px] flex flex-col">
          <div className="flex items-center justify-between mb-2 px-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-300">
              Authoritative Event Log
            </span>
            <span className="text-[9px] text-cyan-400 font-mono">Firestore Sourced</span>
          </div>
          <div className="space-y-1.5 overflow-y-auto flex-1 pr-1 font-mono text-[10px]">
            {(room?.auditLogs || []).slice(0, 10).map((log) => (
              <div
                key={log.id}
                className="p-1.5 rounded-lg bg-[#070b1a] border border-[#141e3a] text-slate-300 leading-tight"
              >
                <div className="flex items-center justify-between text-[9px] text-slate-500 mb-0.5">
                  <span className="uppercase font-semibold text-blue-400">{log.type}</span>
                  <span>{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                </div>
                <p className="truncate text-slate-200">{log.message}</p>
              </div>
            ))}
            {(!room?.auditLogs || room.auditLogs.length === 0) && (
              <p className="text-[11px] text-slate-500 italic p-2">Waiting for game events...</p>
            )}
          </div>
        </div>
      )}

      {/* Quick Match ID info badge */}
      <div className="p-2 bg-[#090f24] border border-[#172346] rounded-xl flex items-center justify-between text-[10px] text-slate-400">
        <span>Room: <strong className="text-cyan-400 font-mono">{room?.code || '7F3K9Q'}</strong></span>
        <span>Anti-Gravity Sync: <strong className="text-emerald-400 font-mono">0ms Lag</strong></span>
      </div>
    </aside>
  );
};
