import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Copy, 
  Check, 
  Users, 
  Clock, 
  Trophy, 
  Sparkles,
  Bot
} from 'lucide-react';
import { RoomData, ColorChoice } from '../types/game';
import { soundManager } from '../utils/sound';

interface CentralPlayfieldProps {
  room: RoomData | null;
  currentUserId: string;
  onColorSelect: (color: ColorChoice, responseTimeMs: number) => void;
  onHostAction: (action: 'START' | 'PAUSE' | 'RESUME' | 'RESTART' | 'ADD_BOTS') => void;
  onCreateRoom: (nickname: string) => void;
  onJoinRoom: (code: string, nickname: string) => void;
  onUpdateNickname: (name: string) => void;
  playerNickname: string;
  onOpenLobbies?: () => void;
  onOpenChat?: () => void;
  onOpenAuth?: () => void;
}

export const CentralPlayfield: React.FC<CentralPlayfieldProps> = ({
  room,
  currentUserId,
  onColorSelect,
  onHostAction,
  onCreateRoom,
  onJoinRoom,
  onUpdateNickname,
  playerNickname,
  onOpenLobbies,
  onOpenChat,
  onOpenAuth,
}) => {
  const [timeLeft, setTimeLeft] = useState<number>(12);
  const [copiedCode, setCopiedCode] = useState(false);
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [joinCodeInput, setJoinCodeInput] = useState('');
  const [nickInput, setNickInput] = useState(playerNickname);
  const [lastSelectedColor, setLastSelectedColor] = useState<ColorChoice | null>(null);
  const [hasSubmittedThisRound, setHasSubmittedThisRound] = useState(false);

  // Measure response time
  const roundStartRef = useRef<number>(Date.now());

  // Current player info
  const currentPlayer = room?.players.find(p => p.id === currentUserId);
  const isHost = currentPlayer?.isHost ?? true;

  // Sync timer with server roundEndTime
  useEffect(() => {
    if (!room || room.state !== 'PLAYING') {
      if (room?.state === 'WAITING') setTimeLeft(room.roundDuration || 12);
      return;
    }

    roundStartRef.current = room.roundStartTime || Date.now();
    setHasSubmittedThisRound(!!room.submissions[currentUserId]);

    const interval = setInterval(() => {
      const now = Date.now();
      const diff = Math.max(0, Math.ceil((room.roundEndTime - now) / 1000));
      setTimeLeft(diff);

      if (diff <= 3 && diff > 0) {
        soundManager.playTick(true);
      }
    }, 250);

    return () => clearInterval(interval);
  }, [room?.roundStartTime, room?.roundEndTime, room?.state, room?.round, room?.submissions, currentUserId, room?.roundDuration]);

  // Reset local submission state when round changes
  useEffect(() => {
    setLastSelectedColor(null);
    setHasSubmittedThisRound(false);
    setFeedback(null);
  }, [room?.round]);

  const handleSelectColor = useCallback((color: ColorChoice) => {
    if (!room || room.state !== 'PLAYING') {
      setFeedback({ message: 'Start the game to play!', type: 'info' });
      soundManager.playClick();
      return;
    }

    if (hasSubmittedThisRound) {
      setFeedback({ message: 'You already submitted for this round!', type: 'info' });
      return;
    }

    const elapsed = Math.max(80, Date.now() - roundStartRef.current);
    setLastSelectedColor(color);
    setHasSubmittedThisRound(true);

    soundManager.playColorTap(color);

    const isMatch = color === room.targetColor;
    if (isMatch) {
      soundManager.playSuccess();
      const speedBonus = elapsed <= 2000 ? '⚡ LIGHTNING (+20 pts)' : elapsed <= 4000 ? '⚡ FAST (+16 pts)' : '+10 pts';
      setFeedback({ message: `CORRECT! ${speedBonus} (${(elapsed / 1000).toFixed(2)}s)`, type: 'success' });
    } else {
      soundManager.playError();
      setFeedback({ message: `WRONG COLOR! Target was ${room.targetColor}`, type: 'error' });
    }

    onColorSelect(color, elapsed);
  }, [room, hasSubmittedThisRound, onColorSelect]);

  // Keyboard accessibility: 1 = RED, 2 = BLUE, 3 = YELLOW, 4 = GREEN, or R, B, Y, G
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if typing in an input
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;

      if (e.key === '1' || e.key.toLowerCase() === 'r') handleSelectColor('RED');
      else if (e.key === '2' || e.key.toLowerCase() === 'b') handleSelectColor('BLUE');
      else if (e.key === '3' || e.key.toLowerCase() === 'y') handleSelectColor('YELLOW');
      else if (e.key === '4' || e.key.toLowerCase() === 'g') handleSelectColor('GREEN');
      else if (e.key === ' ' && isHost && room?.state === 'WAITING') {
        onHostAction('START');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSelectColor, isHost, room?.state, onHostAction]);

  const handleCopy = () => {
    if (room?.code) {
      navigator.clipboard.writeText(room.code);
      setCopiedCode(true);
      soundManager.playClick();
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const getColorStyles = (color: ColorChoice) => {
    switch (color) {
      case 'RED':
        return {
          bg: 'bg-red-600',
          hover: 'hover:bg-red-500',
          border: 'border-red-400',
          shadow: 'shadow-[0_0_30px_rgba(239,68,68,0.45)]',
          text: 'text-red-50',
          activeRing: 'ring-4 ring-red-400',
        };
      case 'BLUE':
        return {
          bg: 'bg-blue-600',
          hover: 'hover:bg-blue-500',
          border: 'border-blue-400',
          shadow: 'shadow-[0_0_30px_rgba(59,130,246,0.45)]',
          text: 'text-blue-50',
          activeRing: 'ring-4 ring-blue-400',
        };
      case 'YELLOW':
        return {
          bg: 'bg-amber-400',
          hover: 'hover:bg-amber-300',
          border: 'border-yellow-200',
          shadow: 'shadow-[0_0_30px_rgba(250,204,21,0.45)]',
          text: 'text-slate-950 font-black',
          activeRing: 'ring-4 ring-yellow-300',
        };
      case 'GREEN':
        return {
          bg: 'bg-emerald-600',
          hover: 'hover:bg-emerald-500',
          border: 'border-emerald-400',
          shadow: 'shadow-[0_0_30px_rgba(34,197,94,0.45)]',
          text: 'text-emerald-50',
          activeRing: 'ring-4 ring-emerald-400',
        };
    }
  };

  const targetBoxStyles = (target: ColorChoice) => {
    switch (target) {
      case 'RED':
        return 'bg-gradient-to-br from-red-500 to-red-600 border-red-300 shadow-[0_0_50px_rgba(239,68,68,0.7)]';
      case 'BLUE':
        return 'bg-gradient-to-br from-blue-500 to-blue-600 border-blue-300 shadow-[0_0_50px_rgba(59,130,246,0.7)]';
      case 'YELLOW':
        return 'bg-gradient-to-br from-yellow-400 to-amber-500 border-yellow-200 shadow-[0_0_50px_rgba(250,204,21,0.7)]';
      case 'GREEN':
        return 'bg-gradient-to-br from-emerald-500 to-green-600 border-emerald-300 shadow-[0_0_50px_rgba(34,197,94,0.7)]';
      default:
        return 'bg-gradient-to-br from-red-500 to-red-600 border-red-300 shadow-[0_0_50px_rgba(239,68,68,0.7)]';
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-between p-3 sm:p-5 overflow-y-auto">
      {/* Top Game Bar matching design */}
      <div className="bg-[#0b1228] border border-[#1d2a4f] rounded-2xl p-3 sm:p-4 mb-4 flex flex-wrap items-center justify-between gap-3 shadow-lg">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-1.5">
              <span>COLOR</span>
              <span className="text-yellow-400">CLASH</span>
            </h2>
          </div>
          <p className="text-xs text-blue-300 font-medium">Tap the color you see!</p>
        </div>

        {/* Stats Cluster: Round, Time Left, Target Score */}
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="px-3.5 py-1.5 rounded-xl bg-[#111c3b] border border-[#22335f] text-center">
            <span className="block text-[10px] uppercase font-bold text-slate-400">Round</span>
            <span className="text-sm sm:text-base font-black text-white tabular-nums">
              {room ? `${room.round} / ${room.totalRounds}` : '1 / 10'}
            </span>
          </div>

          <div className={`px-3.5 py-1.5 rounded-xl border text-center transition-all ${
            timeLeft <= 3 && room?.state === 'PLAYING'
              ? 'bg-red-950/70 border-red-500/80 animate-pulse'
              : 'bg-[#111c3b] border-[#22335f]'
          }`}>
            <span className="block text-[10px] uppercase font-bold text-slate-400 flex items-center justify-center gap-1">
              <Clock className="w-2.5 h-2.5 text-blue-400" /> Time Left
            </span>
            <span className={`text-sm sm:text-base font-black tabular-nums ${
              timeLeft <= 3 && room?.state === 'PLAYING' ? 'text-red-400' : 'text-yellow-400'
            }`}>
              {timeLeft}s
            </span>
          </div>

          <div className="px-3.5 py-1.5 rounded-xl bg-[#111c3b] border border-[#22335f] text-center hidden sm:block">
            <span className="block text-[10px] uppercase font-bold text-slate-400 flex items-center justify-center gap-1">
              <Trophy className="w-2.5 h-2.5 text-yellow-400" /> Target Score
            </span>
            <span className="text-sm sm:text-base font-black text-white tabular-nums">
              {room?.targetScore || 100}
            </span>
          </div>
        </div>
      </div>

      {/* Main Play Area */}
      <div className="flex-1 flex flex-col items-center justify-center my-2 sm:my-4 relative">
        <h3 className="text-base sm:text-xl font-black tracking-wider uppercase text-slate-200 mb-3 sm:mb-5 drop-shadow-md">
          {room?.state === 'WAITING' 
            ? 'PRESS START GAME TO BEGIN' 
            : room?.state === 'PAUSED'
            ? 'GAME PAUSED BY HOST'
            : room?.state === 'FINISHED'
            ? '🏆 MATCH COMPLETED!'
            : 'TAP THE COLOR YOU SEE.'}
        </h3>

        {/* Central glowing target color box */}
        <div className="relative mb-6 sm:mb-8 group">
          <div
            className={`w-64 sm:w-80 h-32 sm:h-40 rounded-3xl border-2 transition-all duration-300 flex items-center justify-center ${
              room ? targetBoxStyles(room.targetColor) : targetBoxStyles('RED')
            }`}
          >
            {room?.state === 'FINISHED' ? (
              <div className="text-center p-4">
                <span className="text-xs uppercase font-bold tracking-widest text-yellow-200">Winner</span>
                <p className="text-2xl font-black text-white drop-shadow-lg">
                  {room.winner ? room.winner.nickname : 'Alex (You)'}
                </p>
                <span className="text-xs font-semibold text-yellow-300">Score: {room.winner?.score || 100}</span>
              </div>
            ) : (
              <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 backdrop-blur-xs px-3 py-1 rounded-full text-white text-xs font-bold">
                Target: {room?.targetColor || 'RED'}
              </div>
            )}
          </div>

          {/* Hit / Error feedback floating badge */}
          {feedback && (
            <div className={`absolute -bottom-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full text-xs font-black shadow-xl tracking-wide whitespace-nowrap animate-bounce z-20 ${
              feedback.type === 'success'
                ? 'bg-emerald-500 text-white shadow-emerald-500/40'
                : feedback.type === 'error'
                ? 'bg-red-500 text-white shadow-red-500/40'
                : 'bg-blue-600 text-white shadow-blue-500/40'
            }`}>
              {feedback.message}
            </div>
          )}
        </div>

        {/* Four Large Color Buttons matching reference mockup */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 w-full max-w-2xl px-2">
          {(['RED', 'BLUE', 'YELLOW', 'GREEN'] as ColorChoice[]).map((color, index) => {
            const styles = getColorStyles(color);
            const isSelected = lastSelectedColor === color;
            const keyNumber = index + 1;

            return (
              <button
                key={color}
                onClick={() => handleSelectColor(color)}
                disabled={room?.state !== 'PLAYING' || hasSubmittedThisRound}
                className={`relative h-20 sm:h-24 rounded-2xl border ${styles.border} ${styles.bg} ${styles.hover} ${styles.shadow} ${styles.text} transition-all duration-150 transform active:scale-95 flex flex-col items-center justify-center font-black text-lg sm:text-xl tracking-wider uppercase cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed select-none ${
                  isSelected ? styles.activeRing : ''
                }`}
              >
                <span>{color}</span>
                <span className="text-[10px] font-mono opacity-80 mt-0.5 tracking-normal bg-black/20 px-2 py-0.5 rounded-md">
                  Key [{keyNumber}]
                </span>
                {isSelected && (
                  <span className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-white animate-ping" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Unified Single-Panel Game Controls (from reference image) */}
      <div className="bg-[#090f24] border border-[#1b274a] rounded-2xl p-3 sm:p-4 mt-4 shadow-xl">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {/* 1. Create Game */}
          <div className="bg-[#0e1633] border border-[#1f2e59] rounded-xl p-3 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-200 mb-1">
                <Sparkles className="w-3.5 h-3.5 text-blue-400" /> Create Game
              </div>
              <p className="text-[11px] text-slate-400 leading-tight">
                Start a new room and invite your friends.
              </p>
            </div>
            <button
              onClick={() => {
                soundManager.playClick();
                onCreateRoom(playerNickname);
              }}
              className="mt-3 w-full py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition-all shadow-md shadow-blue-600/30"
            >
              Create Game
            </button>
          </div>

          {/* 2. Join Game */}
          {/* 2. Join Game & Browse */}
          <div className="bg-[#0e1633] border border-[#1f2e59] rounded-xl p-3 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs font-bold text-slate-200 mb-1">
                <span className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-cyan-400" /> Join Game
                </span>
                {onOpenLobbies && (
                  <button
                    onClick={() => {
                      soundManager.playClick();
                      onOpenLobbies();
                    }}
                    className="text-[10px] text-cyan-400 hover:text-white underline font-semibold"
                  >
                    Browse
                  </button>
                )}
              </div>
              <p className="text-[11px] text-slate-400 leading-tight">
                Enter room code or browse lobbies.
              </p>
            </div>
            <div className="mt-2 space-y-1.5">
              <input
                type="text"
                placeholder="Room Code (6 chars)"
                maxLength={6}
                value={joinCodeInput}
                onChange={(e) => setJoinCodeInput(e.target.value.toUpperCase())}
                className="w-full px-2.5 py-1 bg-[#060a17] border border-[#22335f] rounded-lg text-xs text-white uppercase font-mono tracking-wider focus:outline-none focus:border-cyan-400"
              />
              <div className="flex gap-1.5">
                <button
                  onClick={() => {
                    if (joinCodeInput.trim().length >= 4) {
                      soundManager.playClick();
                      onJoinRoom(joinCodeInput.trim(), playerNickname);
                    }
                  }}
                  disabled={joinCodeInput.trim().length < 4}
                  className="flex-1 py-1 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-lg text-xs font-bold transition-all shadow-md shadow-emerald-600/30"
                >
                  Join Code
                </button>
                {onOpenLobbies && (
                  <button
                    onClick={() => {
                      soundManager.playClick();
                      onOpenLobbies();
                    }}
                    className="px-2 py-1 bg-[#162248] hover:bg-blue-600 text-slate-200 hover:text-white rounded-lg text-xs font-bold transition-all"
                    title="Browse All Lobbies"
                  >
                    All
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* 3. Your Nickname */}
          <div className="bg-[#0e1633] border border-[#1f2e59] rounded-xl p-3 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs font-bold text-slate-200 mb-1">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-indigo-400" /> Player Profile
                </span>
                {onOpenAuth && (
                  <button
                    onClick={() => {
                      soundManager.playClick();
                      onOpenAuth();
                    }}
                    className="text-[10px] text-indigo-400 hover:text-white underline font-semibold"
                  >
                    Account
                  </button>
                )}
              </div>
              <p className="text-[11px] text-slate-400 leading-tight">
                Change your nickname or log in.
              </p>
            </div>
            <div className="mt-2 space-y-1.5">
              <input
                type="text"
                placeholder="Enter nickname"
                maxLength={15}
                value={nickInput}
                onChange={(e) => setNickInput(e.target.value)}
                className="w-full px-2.5 py-1 bg-[#060a17] border border-[#22335f] rounded-lg text-xs text-white focus:outline-none focus:border-indigo-400"
              />
              <button
                onClick={() => {
                  if (nickInput.trim()) {
                    soundManager.playClick();
                    onUpdateNickname(nickInput.trim());
                  }
                }}
                className="w-full py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition-all shadow-md shadow-indigo-600/30"
              >
                Update
              </button>
            </div>
          </div>

          {/* 4. Room Info */}
          <div className="bg-[#0e1633] border border-[#1f2e59] rounded-xl p-3 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs font-bold text-slate-200 mb-1">
                <span className="truncate max-w-[90px]">{room?.name || 'Room Info'}</span>
                <span className="text-[10px] text-emerald-400 font-semibold">
                  {room ? (room.state === 'PLAYING' ? 'In Game' : room.state) : 'Waiting'}
                </span>
              </div>
              <div className="flex items-center justify-between bg-[#060a17] border border-[#22335f] px-2 py-1 rounded-lg font-mono text-xs text-blue-300 my-1">
                <span>{room?.code || '7F3K9Q'}</span>
                <button
                  onClick={handleCopy}
                  className="hover:text-white transition-colors"
                  title="Copy code"
                >
                  {copiedCode ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-blue-400" />}
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between mt-1 pt-1 border-t border-[#19264a]">
              <span className="text-[11px] text-slate-400">
                Players: <strong className="text-white">{room?.players.length || 6}/{room?.maxPlayers || 8}</strong>
              </span>
              {onOpenChat && (
                <button
                  onClick={() => {
                    soundManager.playClick();
                    onOpenChat();
                  }}
                  className="text-[10px] px-2 py-0.5 rounded bg-blue-500/20 text-cyan-300 hover:bg-blue-500/30 font-bold border border-blue-500/30 flex items-center gap-1"
                >
                  <span>Chat</span>
                  {room?.messages && room.messages.length > 0 && (
                    <span className="text-white">({room.messages.length})</span>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* 5. Game Controls (Host) */}
          <div className="bg-[#0e1633] border border-[#1f2e59] rounded-xl p-3 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-slate-200">Game Controls (Host)</span>
              {isHost && (
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-yellow-500/20 text-yellow-300 font-bold border border-yellow-500/40">
                  👑 Host
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-1.5 mt-1">
              <button
                onClick={() => onHostAction('START')}
                disabled={!isHost || room?.state === 'PLAYING'}
                className="py-1 px-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white rounded-md text-[11px] font-bold flex items-center justify-center gap-1 transition-all"
              >
                <Play className="w-3 h-3 fill-white" /> Start
              </button>

              <button
                onClick={() => onHostAction(room?.state === 'PAUSED' ? 'RESUME' : 'PAUSE')}
                disabled={!isHost || (room?.state !== 'PLAYING' && room?.state !== 'PAUSED')}
                className="py-1 px-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white rounded-md text-[11px] font-bold flex items-center justify-center gap-1 transition-all"
              >
                {room?.state === 'PAUSED' ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
                {room?.state === 'PAUSED' ? 'Resume' : 'Pause'}
              </button>

              <button
                onClick={() => onHostAction('RESTART')}
                disabled={!isHost}
                className="col-span-1 py-1 px-1.5 border border-red-500/50 hover:bg-red-950/50 text-red-300 rounded-md text-[11px] font-bold flex items-center justify-center gap-1 transition-all"
              >
                <RotateCcw className="w-3 h-3" /> Restart
              </button>

              <button
                onClick={() => onHostAction('ADD_BOTS')}
                title="Add simulated AI players for full 6-player multiplayer testing"
                className="col-span-1 py-1 px-1.5 border border-amber-500/50 hover:bg-amber-950/50 text-amber-300 rounded-md text-[11px] font-bold flex items-center justify-center gap-1 transition-all"
              >
                <Bot className="w-3 h-3" /> +Bots
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
