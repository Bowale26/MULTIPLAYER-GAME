import React from 'react';
import { Wifi, Battery, Signal, Sparkles, Gamepad2 } from 'lucide-react';
import { RoomData, ColorChoice } from '../types/game';
import { soundManager } from '../utils/sound';

interface MobilePhoneFrameProps {
  room: RoomData | null;
  onColorSelect: (color: ColorChoice, timeMs: number) => void;
  onHostAction: (action: 'START' | 'PAUSE' | 'RESUME' | 'RESTART' | 'ADD_BOTS') => void;
  onCreateRoom: (nickname: string) => void;
  onJoinRoom: (code: string, nickname: string) => void;
  playerNickname: string;
}

export const MobilePhoneFrame: React.FC<MobilePhoneFrameProps> = ({
  room,
  onColorSelect,
  onHostAction,
  onCreateRoom,
  onJoinRoom,
  playerNickname,
}) => {
  const currentTarget = room?.targetColor || 'YELLOW';
  const round = room?.round || 3;
  const totalRounds = room?.totalRounds || 10;

  const handleTap = (color: ColorChoice) => {
    soundManager.playColorTap(color);
    onColorSelect(color, 850);
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 overflow-y-auto">
      <div className="text-center mb-4">
        <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest bg-cyan-950/60 px-3 py-1 rounded-full border border-cyan-800/40">
          Mobile Device Frame Simulator
        </span>
        <h2 className="text-lg font-black text-white mt-1">
          Dual-Screen Mobile Preview (Android / iOS)
        </h2>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-8">
        {/* LEFT PHONE: Lobby & Join View (matching left phone in reference image) */}
        <div className="w-[310px] h-[620px] bg-[#070b1a] border-4 border-[#243358] rounded-[42px] shadow-2xl p-4 flex flex-col justify-between relative overflow-hidden ring-1 ring-white/10">
          {/* Notch / Dynamic Island */}
          <div className="flex items-center justify-between px-2 pt-1 pb-3 text-[11px] text-slate-300 font-semibold select-none">
            <span>9:41</span>
            <div className="w-20 h-4 bg-black rounded-full" />
            <div className="flex items-center gap-1.5">
              <Signal className="w-3 h-3 text-slate-300" />
              <Wifi className="w-3 h-3 text-slate-300" />
              <Battery className="w-3.5 h-3.5 text-slate-300" />
            </div>
          </div>

          {/* Lobby Content */}
          <div className="flex-1 flex flex-col items-center justify-center text-center px-1">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-pink-500 p-0.5 shadow-lg mb-3">
              <div className="w-full h-full bg-[#080d22] rounded-[14px] flex items-center justify-center">
                <Gamepad2 className="w-8 h-8 text-cyan-400" />
              </div>
            </div>

            <h3 className="text-xl font-black text-white leading-tight">
              MULTIPLAYER <span className="text-yellow-400">GAME</span>
            </h3>
            <p className="text-[11px] text-slate-400 mt-1 mb-5">
              Play together from any device.
            </p>

            {/* Action Buttons from Reference Mockup */}
            <div className="w-full space-y-2.5">
              <button
                onClick={() => {
                  soundManager.playClick();
                  onCreateRoom(playerNickname);
                }}
                className="w-full py-2.5 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-md shadow-emerald-600/30 flex items-center justify-center gap-1.5"
              >
                <span>+</span> CREATE GAME
              </button>

              <button
                onClick={() => {
                  soundManager.playClick();
                  onJoinRoom(room?.code || '7F3K9Q', playerNickname);
                }}
                className="w-full py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-md shadow-blue-600/30"
              >
                JOIN GAME
              </button>

              <button
                onClick={() => soundManager.playClick()}
                className="w-full py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-md opacity-90"
              >
                HOW TO PLAY
              </button>

              <button
                onClick={() => {
                  soundManager.playClick();
                  onHostAction('START');
                }}
                className="w-full py-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-md opacity-90"
              >
                PLAY DEMO
              </button>
            </div>

            <div className="w-full mt-4 space-y-2">
              <div className="px-3 py-1.5 bg-[#0e1633] border border-[#1f2d57] rounded-xl text-left text-[11px] text-slate-300 flex items-center justify-between">
                <span>👤 Nickname</span>
                <span className="font-bold text-white">{playerNickname}</span>
              </div>
              <div className="px-3 py-1.5 bg-[#0e1633] border border-[#1f2d57] rounded-xl text-left text-[11px] text-slate-300 flex items-center justify-between font-mono">
                <span>🔒 Room Code</span>
                <span className="font-bold text-cyan-400">{room?.code || '7F3K9Q'}</span>
              </div>
            </div>
          </div>

          <div className="text-[10px] text-slate-500 text-center pb-1">
            Play • Connect • Compete
          </div>
          {/* Home indicator bar */}
          <div className="w-24 h-1 bg-slate-600 rounded-full mx-auto" />
        </div>

        {/* RIGHT PHONE: Active Game View (matching right phone in reference image) */}
        <div className="w-[310px] h-[620px] bg-[#070b1a] border-4 border-[#243358] rounded-[42px] shadow-2xl p-4 flex flex-col justify-between relative overflow-hidden ring-1 ring-white/10">
          {/* Notch / Dynamic Island */}
          <div className="flex items-center justify-between px-2 pt-1 pb-2 text-[11px] text-slate-300 font-semibold select-none">
            <span>9:41</span>
            <div className="w-20 h-4 bg-black rounded-full" />
            <div className="flex items-center gap-1.5">
              <Signal className="w-3 h-3 text-slate-300" />
              <Wifi className="w-3 h-3 text-slate-300" />
              <Battery className="w-3.5 h-3.5 text-slate-300" />
            </div>
          </div>

          {/* Active Color Clash Header */}
          <div className="text-center">
            <h4 className="text-base font-black text-white flex items-center justify-center gap-1">
              <span>COLOR</span>
              <span className="text-yellow-400">CLASH</span>
            </h4>
            <span className="text-[10px] font-bold text-slate-400 font-mono">
              Round {round}/{totalRounds}
            </span>
          </div>

          {/* Target Color Box */}
          <div className="my-1 flex flex-col items-center">
            <span className="text-[10px] uppercase font-black text-slate-300 tracking-wider mb-2">
              TAP THE COLOR YOU SEE.
            </span>
            <div
              className={`w-full h-24 rounded-2xl border-2 transition-all duration-200 flex items-center justify-center ${
                currentTarget === 'YELLOW'
                  ? 'bg-gradient-to-br from-yellow-400 to-amber-500 border-yellow-200 shadow-[0_0_35px_rgba(250,204,21,0.6)]'
                  : currentTarget === 'RED'
                  ? 'bg-gradient-to-br from-red-500 to-red-600 border-red-300 shadow-[0_0_35px_rgba(239,68,68,0.6)]'
                  : currentTarget === 'BLUE'
                  ? 'bg-gradient-to-br from-blue-500 to-blue-600 border-blue-300 shadow-[0_0_35px_rgba(59,130,246,0.6)]'
                  : 'bg-gradient-to-br from-emerald-500 to-green-600 border-emerald-300 shadow-[0_0_35px_rgba(34,197,94,0.6)]'
              }`}
            />
          </div>

          {/* 4 Large Color Buttons */}
          <div className="grid grid-cols-2 gap-2.5 my-1">
            <button
              onClick={() => handleTap('RED')}
              className="h-16 rounded-xl bg-red-600 hover:bg-red-500 active:scale-95 border border-red-400 text-white font-black text-sm tracking-wider shadow-lg shadow-red-600/30"
            >
              RED
            </button>
            <button
              onClick={() => handleTap('BLUE')}
              className="h-16 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-95 border border-blue-400 text-white font-black text-sm tracking-wider shadow-lg shadow-blue-600/30"
            >
              BLUE
            </button>
            <button
              onClick={() => handleTap('YELLOW')}
              className="h-16 rounded-xl bg-amber-400 hover:bg-amber-300 active:scale-95 border border-yellow-200 text-slate-950 font-black text-sm tracking-wider shadow-lg shadow-yellow-400/30"
            >
              YELLOW
            </button>
            <button
              onClick={() => handleTap('GREEN')}
              className="h-16 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 border border-emerald-400 text-white font-black text-sm tracking-wider shadow-lg shadow-emerald-600/30"
            >
              GREEN
            </button>
          </div>

          {/* 12s timer indicator */}
          <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-yellow-400 py-1">
            <span>⏱️ 12s</span>
          </div>

          {/* Scores summary in mobile card */}
          <div className="bg-[#0b1229] border border-[#1b274c] rounded-xl p-2 text-[10px]">
            <span className="font-bold text-slate-400 block mb-1">Current Scores</span>
            <div className="space-y-1">
              <div className="flex justify-between font-bold text-white">
                <span>1. 👤 Alex</span>
                <span className="font-mono text-yellow-400">85</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>2. 👤 Sarah</span>
                <span className="font-mono">70</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>3. 👤 Mike</span>
                <span className="font-mono">65</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>4. 👤 Emma</span>
                <span className="font-mono">60</span>
              </div>
            </div>
          </div>

          {/* Home indicator bar */}
          <div className="w-24 h-1 bg-slate-600 rounded-full mx-auto mt-2" />
        </div>
      </div>
    </div>
  );
};
