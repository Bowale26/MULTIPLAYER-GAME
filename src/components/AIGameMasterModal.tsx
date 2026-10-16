import React, { useState } from 'react';
import { Bot, Send, Sparkles, X, Flame, Shield, HelpCircle, Loader2 } from 'lucide-react';
import { RoomData } from '../types/game';
import { soundManager } from '../utils/sound';

interface AIGameMasterModalProps {
  isOpen: boolean;
  onClose: () => void;
  room: RoomData | null;
}

export const AIGameMasterModal: React.FC<AIGameMasterModalProps> = ({
  isOpen,
  onClose,
  room,
}) => {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; text: string; model?: string }>>([
    {
      role: 'assistant',
      text: "👋 Welcome to COLOR CLASH! I am your AI Game Master. Ask me about game rules, scoring multipliers, speed bonuses, or ask for balanced room configurations!",
      model: 'gemini-3.8-flash',
    },
  ]);

  if (!isOpen) return null;

  const handleSend = async (customText?: string) => {
    const query = customText || prompt;
    if (!query.trim() || loading) return;

    soundManager.playClick();
    const userMsg = { role: 'user' as const, text: query };
    setMessages((prev) => [...prev, userMsg]);
    setPrompt('');
    setLoading(true);

    try {
      const res = await fetch('/api/ai/game-master', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: query,
          currentRoomState: room,
          mode: 'standard',
        }),
      });
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: data.text || 'Game Master is ready for your next round!',
          model: data.modelUsed || 'gemini-3.8-flash',
        },
      ]);
      soundManager.playSuccess();
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: "⚡ Pro-Tip: Tap within the first 2 seconds for a +10 speed bonus! Keep your fingers positioned on keys 1-4 for instant reaction.",
          model: 'fallback-cache',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const quickPrompts = [
    { label: 'Explain Scoring & Speed Bonuses', text: 'How exactly does the scoring math work, including speed bonuses and combos?' },
    { label: 'Suggest Blitz Mode (6s)', text: 'Can you propose a high-intensity Blitz mode configuration for fast players?' },
    { label: 'Colorblind Mode Tips', text: 'What accessibility features are available for colorblind players in Color Clash?' },
    { label: 'Analyze Match Standings', text: 'Look at the current room leaderboard and give commentary on the match!' },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 select-none">
      <div className="w-full max-w-2xl bg-[#090e24] border border-[#23335f] rounded-2xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-4 py-3 bg-[#0d1533] border-b border-[#1f2d57] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-black text-white flex items-center gap-1.5">
                AI Game Master
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 font-bold border border-blue-500/30">
                  Gemini 3.8 Flash
                </span>
              </h2>
              <p className="text-[11px] text-slate-400">Rules advisory, game balancing & match commentary</p>
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

        {/* Quick Presets */}
        <div className="px-4 py-2 bg-[#0b1129] border-b border-[#1b274c] flex flex-wrap gap-1.5">
          {quickPrompts.map((qp, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(qp.text)}
              className="text-[11px] px-2.5 py-1 rounded-lg bg-[#111a3d] border border-[#213060] text-slate-300 hover:text-white hover:border-blue-400 transition-colors"
            >
              {qp.label}
            </button>
          ))}
        </div>

        {/* Message Log */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm leading-relaxed ${
                  m.role === 'user'
                    ? 'bg-blue-600 text-white rounded-br-none'
                    : 'bg-[#101938] border border-[#202e5b] text-slate-200 rounded-bl-none shadow-md'
                }`}
              >
                <p className="whitespace-pre-line">{m.text}</p>
                {m.model && (
                  <span className="block mt-1 text-[9px] text-slate-400 font-mono text-right">
                    via {m.model}
                  </span>
                )}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex items-center gap-2 text-xs text-blue-400 italic py-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Game Master is calculating strategy...
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-[#0d1533] border-t border-[#1f2d57]">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Ask the Game Master anything about Color Clash..."
              className="flex-1 px-3.5 py-2 bg-[#060a17] border border-[#1f2e59] rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
            <button
              type="submit"
              disabled={!prompt.trim() || loading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-md shadow-blue-600/30"
            >
              <Send className="w-4 h-4" />
              <span>Send</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
