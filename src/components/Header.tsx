import React, { useState } from 'react';
import { 
  Volume2, 
  VolumeX, 
  Smartphone, 
  Monitor, 
  Copy, 
  Check, 
  Gamepad2, 
  Sparkles,
  Users,
  ShieldCheck,
  User,
  LogIn,
  Trophy
} from 'lucide-react';
import { UserProfile } from '../types/game';
import { soundManager } from '../utils/sound';

interface HeaderProps {
  roomCode: string;
  isOnline: boolean;
  playerName: string;
  currentUser: UserProfile | null;
  onOpenAuth: () => void;
  onOpenLobbies: () => void;
  onOpenLeaderboard?: () => void;
  onUpdateNickname: (name: string) => void;
  viewMode: 'desktop' | 'mobile-preview';
  onToggleViewMode: (mode: 'desktop' | 'mobile-preview') => void;
}

export const Header: React.FC<HeaderProps> = ({
  roomCode,
  isOnline,
  playerName,
  currentUser,
  onOpenAuth,
  onOpenLobbies,
  onOpenLeaderboard,
  onUpdateNickname,
  viewMode,
  onToggleViewMode,
}) => {
  const [copied, setCopied] = useState(false);
  const [isMuted, setIsMuted] = useState(soundManager.isMuted());

  const handleCopy = () => {
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    soundManager.playClick();
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleSound = () => {
    const next = !isMuted;
    soundManager.setMuted(next);
    setIsMuted(next);
    if (!next) soundManager.playClick();
  };

  const avatarGradients = [
    'from-blue-500 to-cyan-500',
    'from-purple-500 to-indigo-600',
    'from-pink-500 to-rose-600',
    'from-amber-400 to-orange-500',
    'from-emerald-400 to-teal-600',
    'from-fuchsia-500 to-purple-600',
  ];

  return (
    <header className="w-full bg-[#080d1e] border-b border-[#1b2648] px-4 py-2.5 flex items-center justify-between text-white select-none">
      {/* Left: Branding Lockup */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-pink-500 p-0.5 shadow-lg shadow-blue-500/20 flex items-center justify-center">
          <div className="w-full h-full bg-[#090e23] rounded-[10px] flex items-center justify-center">
            <Gamepad2 className="w-6 h-6 text-cyan-400" />
          </div>
        </div>

        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black tracking-tight flex items-center gap-1.5 font-sans">
              <span className="text-white">MULTIPLAYER</span>
              <span className="text-yellow-400 drop-shadow-[0_0_12px_rgba(250,204,21,0.5)]">GAME</span>
            </h1>
            <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/30">
              <Sparkles className="w-3 h-3 text-yellow-400" /> COLOR CLASH
            </span>
          </div>
          <p className="text-[11px] text-slate-400 hidden md:block">
            One Room. One Code. Everyone Plays.
          </p>
        </div>
      </div>

      {/* Center: Quick Room Status & Lobby Browser Shortcut */}
      <div className="hidden lg:flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0f172a] border border-[#1e293b]">
          <span className={`w-2.5 h-2.5 rounded-full ${isOnline ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]' : 'bg-red-400'} animate-pulse`} />
          <span className="text-xs font-semibold text-slate-300">
            {isOnline ? 'Online' : 'Reconnecting'}
          </span>
        </div>

        {/* Room Code Badge */}
        <button
          onClick={handleCopy}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-950/60 border border-blue-600/40 text-blue-300 hover:bg-blue-900/60 hover:border-blue-400 transition-all font-mono font-bold text-xs group"
          title="Click to copy Room Code"
        >
          <span className="text-slate-400">Room:</span>
          <span className="text-white tracking-wider text-sm">{roomCode}</span>
          {copied ? (
            <Check className="w-3.5 h-3.5 text-emerald-400" />
          ) : (
            <Copy className="w-3.5 h-3.5 text-blue-400 group-hover:scale-110 transition-transform" />
          )}
        </button>

        {/* Browse Lobbies Button */}
        <button
          onClick={() => {
            soundManager.playClick();
            onOpenLobbies();
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#101a3b] border border-[#213263] text-cyan-300 hover:bg-[#16244f] hover:text-white transition-all text-xs font-bold"
        >
          <Users className="w-3.5 h-3.5 text-cyan-400" />
          <span>Browse Lobbies</span>
        </button>

        {/* Global Leaderboard Button */}
        {onOpenLeaderboard && (
          <button
            onClick={() => {
              soundManager.playClick();
              onOpenLeaderboard();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#131c36] border border-[#233566] text-amber-300 hover:bg-[#1b274e] hover:text-white transition-all text-xs font-bold"
          >
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Leaderboard</span>
          </button>
        )}
      </div>

      {/* Right: Controls & Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Device Switcher (Desktop vs Mobile Preview mockup) */}
        <div className="flex items-center p-1 rounded-lg bg-[#0e1630] border border-[#1d294d]">
          <button
            onClick={() => onToggleViewMode('desktop')}
            className={`p-1.5 rounded-md transition-all ${
              viewMode === 'desktop'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Desktop Mode"
          >
            <Monitor className="w-4 h-4" />
          </button>
          <button
            onClick={() => onToggleViewMode('mobile-preview')}
            className={`p-1.5 rounded-md transition-all ${
              viewMode === 'mobile-preview'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Mobile Device Mockup View (like reference image)"
          >
            <Smartphone className="w-4 h-4" />
          </button>
        </div>

        {/* Mute Button */}
        <button
          onClick={toggleSound}
          className="p-2 rounded-lg bg-[#0e1630] border border-[#1d294d] text-slate-300 hover:text-white hover:border-blue-500/50 transition-all"
          title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
        </button>

        {/* User Account / Profile Button */}
        <button
          onClick={() => {
            soundManager.playClick();
            onOpenAuth();
          }}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0e1630] border border-[#1d294d] hover:border-blue-500/50 transition-all"
        >
          <div
            className={`w-6 h-6 rounded-full bg-gradient-to-r ${
              avatarGradients[((currentUser?.avatarIndex || 1) - 1) % avatarGradients.length]
            } flex items-center justify-center font-bold text-xs text-white shadow-sm`}
          >
            {(currentUser?.username || playerName).charAt(0).toUpperCase()}
          </div>
          <div className="text-left hidden sm:block">
            <span className="block text-xs font-bold text-slate-200 max-w-[90px] truncate leading-tight">
              {currentUser?.username || playerName}
            </span>
            <span className="block font-mono text-[9px] text-cyan-400 font-semibold leading-none">
              {currentUser?.id || 'GUEST'}
            </span>
          </div>
        </button>
      </div>
    </header>
  );
};
