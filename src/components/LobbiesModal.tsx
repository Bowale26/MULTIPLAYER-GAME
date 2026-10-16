import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Plus, 
  Search, 
  Play, 
  Clock, 
  Shield, 
  Lock, 
  X, 
  Loader2, 
  RefreshCw,
  Sparkles,
  Zap,
  Globe
} from 'lucide-react';
import { LobbySummary } from '../types/game';
import { soundManager } from '../utils/sound';

interface LobbiesModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentRoomCode: string;
  onSelectLobby: (code: string) => void;
  onCreateCustomLobby: (config: {
    name: string;
    maxPlayers: number;
    roundDuration: number;
    totalRounds: number;
    isPrivate: boolean;
  }) => void;
}

export const LobbiesModal: React.FC<LobbiesModalProps> = ({
  isOpen,
  onClose,
  currentRoomCode,
  onSelectLobby,
  onCreateCustomLobby,
}) => {
  const [lobbies, setLobbies] = useState<LobbySummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterState, setFilterState] = useState<'ALL' | 'WAITING' | 'PLAYING'>('ALL');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Create lobby form state
  const [lobbyName, setLobbyName] = useState('');
  const [maxPlayers, setMaxPlayers] = useState(8);
  const [roundDuration, setRoundDuration] = useState(12);
  const [totalRounds, setTotalRounds] = useState(10);
  const [isPrivate, setIsPrivate] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchLobbies();
    }
  }, [isOpen]);

  const fetchLobbies = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/lobbies');
      const data = await res.json();
      if (data.lobbies) {
        setLobbies(data.lobbies);
      }
    } catch (err) {
      console.error('Failed to fetch lobbies:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    soundManager.playClick();
    onCreateCustomLobby({
      name: lobbyName.trim() || 'New Game Room',
      maxPlayers,
      roundDuration,
      totalRounds,
      isPrivate,
    });
    setShowCreateModal(false);
    onClose();
  };

  if (!isOpen) return null;

  const filteredLobbies = lobbies.filter((l) => {
    const matchesSearch =
      l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.hostName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesState = filterState === 'ALL' || l.state === filterState;
    return matchesSearch && matchesState;
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 select-none">
      <div className="w-full max-w-4xl bg-[#090e24] border border-[#23335f] rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-5 py-4 bg-[#0d1533] border-b border-[#1f2d57] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-black text-white flex items-center gap-1.5">
                Game Lobby Browser
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 font-bold border border-blue-500/30">
                  {lobbies.length} Active Lobbies
                </span>
              </h2>
              <p className="text-[11px] text-slate-400">
                Join an existing multiplayer room or configure a custom match
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              soundManager.playClick();
              onClose();
            }}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-[#1a2548]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter & Action Bar */}
        <div className="px-5 py-3 bg-[#0b1129] border-b border-[#1b274c] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-1 min-w-[200px]">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search lobbies by name, code, or host..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-[#060a17] border border-[#1f2e59] rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Filter pills */}
            <div className="flex items-center p-1 rounded-xl bg-[#0e1633] border border-[#1d2a52]">
              {(['ALL', 'WAITING', 'PLAYING'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setFilterState(st)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                    filterState === st
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {st === 'ALL' ? 'All' : st === 'WAITING' ? 'Open Lobbies' : 'In Game'}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchLobbies}
              className="p-2 rounded-xl bg-[#101938] border border-[#1f2d57] text-slate-300 hover:text-white hover:border-blue-500 transition-colors"
              title="Refresh Lobbies"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            </button>

            <button
              onClick={() => {
                soundManager.playClick();
                setShowCreateModal(true);
              }}
              className="px-3.5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shadow-md shadow-blue-600/30"
            >
              <Plus className="w-4 h-4" />
              <span>Create Custom Lobby</span>
            </button>
          </div>
        </div>

        {/* Lobbies Grid */}
        <div className="flex-1 overflow-y-auto p-5">
          {loading ? (
            <div className="py-16 flex flex-col items-center justify-center text-xs text-slate-400">
              <Loader2 className="w-7 h-7 text-blue-400 animate-spin mb-2" />
              <span>Scanning live game servers...</span>
            </div>
          ) : filteredLobbies.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-sm font-bold text-slate-300">No matching lobbies found</p>
              <p className="text-xs text-slate-500 mt-1">Try adjusting your search or create a new room!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {filteredLobbies.map((lobby) => {
                const isCurrent = lobby.code === currentRoomCode;
                const isFull = lobby.playerCount >= lobby.maxPlayers;
                const percentFull = Math.min(100, Math.round((lobby.playerCount / lobby.maxPlayers) * 100));

                return (
                  <div
                    key={lobby.code}
                    className={`bg-[#0e1633] border rounded-2xl p-4 transition-all duration-150 flex flex-col justify-between ${
                      isCurrent
                        ? 'border-cyan-500/60 shadow-lg shadow-cyan-500/10'
                        : 'border-[#1f2e59] hover:border-blue-500/50'
                    }`}
                  >
                    <div>
                      {/* Top Info Bar */}
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-black text-blue-300 px-2 py-0.5 rounded-md bg-[#070b1a] border border-[#1a2546]">
                              {lobby.code}
                            </span>
                            <h3 className="text-sm font-black text-white truncate max-w-[200px]">
                              {lobby.name}
                            </h3>
                          </div>
                          <span className="text-[11px] text-slate-400 mt-0.5 block">
                            Host: <strong className="text-slate-200">{lobby.hostName}</strong>
                          </span>
                        </div>

                        {/* Status badge */}
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                            lobby.state === 'WAITING'
                              ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                              : lobby.state === 'PLAYING'
                              ? 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                              : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                          }`}
                        >
                          {lobby.state === 'PLAYING' ? `Round ${lobby.round}/${lobby.totalRounds}` : lobby.state}
                        </span>
                      </div>

                      {/* Specs pills */}
                      <div className="flex flex-wrap items-center gap-2 my-2.5 text-[10px] text-slate-300">
                        <span className="flex items-center gap-1 bg-[#070b1a] px-2 py-1 rounded-md border border-[#16213e]">
                          <Clock className="w-3 h-3 text-cyan-400" /> {lobby.roundDuration}s Timer
                        </span>
                        <span className="flex items-center gap-1 bg-[#070b1a] px-2 py-1 rounded-md border border-[#16213e]">
                          <Zap className="w-3 h-3 text-yellow-400" /> {lobby.totalRounds} Rounds
                        </span>
                        <span className="flex items-center gap-1 bg-[#070b1a] px-2 py-1 rounded-md border border-[#16213e]">
                          <Globe className="w-3 h-3 text-emerald-400" /> Public
                        </span>
                      </div>

                      {/* Player capacity indicator */}
                      <div className="space-y-1 mb-3">
                        <div className="flex justify-between text-[11px] font-bold">
                          <span className="text-slate-400">Player Slots:</span>
                          <span className={`${isFull ? 'text-rose-400' : 'text-emerald-400'}`}>
                            {lobby.playerCount} / {lobby.maxPlayers}
                          </span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-[#060a17] overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              isFull ? 'bg-rose-500' : 'bg-emerald-500'
                            }`}
                            style={{ width: `${percentFull}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Join Button */}
                    <button
                      onClick={() => {
                        soundManager.playClick();
                        onSelectLobby(lobby.code);
                        onClose();
                      }}
                      disabled={isFull && !isCurrent}
                      className={`w-full py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 ${
                        isCurrent
                          ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30'
                          : isFull
                          ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                          : 'bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/30'
                      }`}
                    >
                      {isCurrent ? (
                        <span>Currently Inside Lobby</span>
                      ) : isFull ? (
                        <span>Lobby is Full ({lobby.maxPlayers}/{lobby.maxPlayers})</span>
                      ) : (
                        <>
                          <Play className="w-3 h-3 fill-white" />
                          <span>Join Lobby ({lobby.code})</span>
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Create Custom Lobby Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 z-60 bg-black/80 flex items-center justify-center p-4">
            <div className="bg-[#0b1229] border border-[#2b3d70] rounded-2xl p-5 w-full max-w-lg shadow-2xl">
              <h3 className="text-sm font-black text-white mb-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400" /> Create Custom Game Lobby
              </h3>
              <form onSubmit={handleCreateSubmit} className="space-y-3.5">
                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1">
                    Lobby Name / Match Title
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Weekend Clash Blitz Arena"
                    maxLength={28}
                    value={lobbyName}
                    onChange={(e) => setLobbyName(e.target.value)}
                    className="w-full px-3 py-2 bg-[#060a17] border border-[#21315b] rounded-xl text-xs text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-300 block mb-1">
                      Max Players Limit (2 - 12)
                    </label>
                    <select
                      value={maxPlayers}
                      onChange={(e) => setMaxPlayers(parseInt(e.target.value, 10))}
                      className="w-full px-3 py-2 bg-[#060a17] border border-[#21315b] rounded-xl text-xs text-white focus:outline-none"
                    >
                      <option value={2}>2 Players (1v1 Duel)</option>
                      <option value={4}>4 Players (Small Group)</option>
                      <option value={6}>6 Players (Classic)</option>
                      <option value={8}>8 Players (Championship)</option>
                      <option value={10}>10 Players (Mega Room)</option>
                      <option value={12}>12 Players (Chaos Arena)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-300 block mb-1">
                      Round Countdown Timer
                    </label>
                    <select
                      value={roundDuration}
                      onChange={(e) => setRoundDuration(parseInt(e.target.value, 10))}
                      className="w-full px-3 py-2 bg-[#060a17] border border-[#21315b] rounded-xl text-xs text-white focus:outline-none"
                    >
                      <option value={6}>6 Seconds (⚡ Blitz Mode)</option>
                      <option value={10}>10 Seconds (Standard Fast)</option>
                      <option value={12}>12 Seconds (Default Balanced)</option>
                      <option value={15}>15 Seconds (Relaxed / Casual)</option>
                      <option value={20}>20 Seconds (High Accessibility)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-300 block mb-1">
                      Total Match Rounds
                    </label>
                    <select
                      value={totalRounds}
                      onChange={(e) => setTotalRounds(parseInt(e.target.value, 10))}
                      className="w-full px-3 py-2 bg-[#060a17] border border-[#21315b] rounded-xl text-xs text-white focus:outline-none"
                    >
                      <option value={5}>5 Rounds (Quick Skirmish)</option>
                      <option value={8}>8 Rounds (Medium Match)</option>
                      <option value={10}>10 Rounds (Standard Tournament)</option>
                      <option value={15}>15 Rounds (Endurance)</option>
                    </select>
                  </div>

                  <div className="flex items-center pt-5">
                    <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300 font-semibold">
                      <input
                        type="checkbox"
                        checked={isPrivate}
                        onChange={(e) => setIsPrivate(e.target.checked)}
                        className="rounded border-slate-700 text-blue-600 focus:ring-0"
                      />
                      <span>Private Lobby (Invite Code Only)</span>
                    </label>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-3.5 py-1.5 text-xs text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-600/30"
                  >
                    Create & Host Lobby
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
