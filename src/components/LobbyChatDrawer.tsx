import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, 
  Send, 
  Smile, 
  X, 
  ChevronRight, 
  ChevronLeft, 
  Sparkles,
  Users
} from 'lucide-react';
import { ChatMessage, RoomData } from '../types/game';
import { soundManager } from '../utils/sound';

interface LobbyChatDrawerProps {
  room: RoomData | null;
  currentUserId: string;
  isOpen: boolean;
  onToggle: () => void;
  onSendMessage: (text: string) => void;
}

export const LobbyChatDrawer: React.FC<LobbyChatDrawerProps> = ({
  room,
  currentUserId,
  isOpen,
  onToggle,
  onSendMessage,
}) => {
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const prevCountRef = useRef<number>(0);

  const messages = room?.messages || [];

  // Auto-scroll on new message and play subtle chime if someone else messaged
  useEffect(() => {
    if (messages.length > prevCountRef.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      const lastMsg = messages[messages.length - 1];
      if (lastMsg && lastMsg.senderId !== currentUserId && !lastMsg.isSystem) {
        soundManager.playTick(false);
      }
    }
    prevCountRef.current = messages.length;
  }, [messages, currentUserId]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    soundManager.playClick();
    onSendMessage(inputText.trim());
    setInputText('');
  };

  const handleSendEmoji = (emoji: string) => {
    soundManager.playClick();
    onSendMessage(emoji);
  };

  const quickReactions = ['🔥', '⚡', '👏', '😂', '🎯', '👑', '🔴', '🔵', '🟡', '🟢'];

  const avatarGradients = [
    'from-blue-500 to-cyan-500',
    'from-purple-500 to-indigo-600',
    'from-pink-500 to-rose-600',
    'from-amber-400 to-orange-500',
    'from-emerald-400 to-teal-600',
    'from-fuchsia-500 to-purple-600',
  ];

  if (!isOpen) {
    return (
      <button
        onClick={() => {
          soundManager.playClick();
          onToggle();
        }}
        className="fixed bottom-20 right-4 z-40 px-3.5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-2xl shadow-xl shadow-blue-600/30 font-bold text-xs flex items-center gap-2 border border-blue-400/40 transition-transform active:scale-95 group"
      >
        <MessageSquare className="w-4 h-4" />
        <span>Lobby Chat</span>
        {messages.length > 0 && (
          <span className="w-5 h-5 rounded-full bg-cyan-400 text-slate-950 font-black text-[10px] flex items-center justify-center">
            {messages.length}
          </span>
        )}
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-40 w-80 sm:w-96 h-[460px] bg-[#090e24] border border-[#23335f] rounded-2xl shadow-2xl flex flex-col overflow-hidden select-none animate-in fade-in slide-in-from-bottom-4 duration-150">
      {/* Header */}
      <div className="px-4 py-3 bg-[#0d1533] border-b border-[#1f2d57] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-blue-500/20 text-cyan-400 border border-blue-500/30">
            <MessageSquare className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-black text-white flex items-center gap-1.5">
              Lobby Real-Time Chat
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 font-bold">
                Live
              </span>
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">
              Room: {room?.code || '7F3K9Q'} ({room?.players.length || 0} players)
            </span>
          </div>
        </div>

        <button
          onClick={() => {
            soundManager.playClick();
            onToggle();
          }}
          className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-[#1a2548]"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Messages List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
        {messages.length === 0 ? (
          <div className="py-16 text-center text-xs text-slate-500 italic">
            No messages yet. Say hello to your opponents!
          </div>
        ) : (
          messages.map((msg) => {
            if (msg.isSystem) {
              return (
                <div key={msg.id} className="flex justify-center my-1.5">
                  <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-[#111c3b] border border-[#202f5a] text-cyan-300 shadow-sm max-w-[90%] text-center">
                    {msg.text}
                  </span>
                </div>
              );
            }

            const isMe = msg.senderId === currentUserId;
            const grad = avatarGradients[(msg.senderAvatar - 1 + avatarGradients.length) % avatarGradients.length];

            return (
              <div
                key={msg.id}
                className={`flex gap-2 items-end ${isMe ? 'justify-end' : 'justify-start'}`}
              >
                {!isMe && (
                  <div
                    className={`w-6 h-6 rounded-full bg-gradient-to-tr ${grad} flex items-center justify-center text-white text-[10px] font-bold shrink-0 mb-0.5`}
                  >
                    {msg.senderName.charAt(0).toUpperCase()}
                  </div>
                )}

                <div
                  className={`max-w-[78%] rounded-2xl px-3 py-1.5 text-xs ${
                    isMe
                      ? 'bg-blue-600 text-white rounded-br-none shadow-md shadow-blue-600/20'
                      : 'bg-[#101938] border border-[#1f2e59] text-slate-200 rounded-bl-none shadow-sm'
                  }`}
                >
                  {!isMe && (
                    <span className="block text-[9px] font-bold text-cyan-400 mb-0.5">
                      {msg.senderName}
                    </span>
                  )}
                  <p className="leading-snug break-words">{msg.text}</p>
                  <span className="block text-[8px] text-slate-400 text-right mt-0.5 opacity-80">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Reactions Bar */}
      <div className="px-3 py-1.5 bg-[#0b1229] border-t border-[#1b274c] flex items-center gap-1.5 overflow-x-auto">
        <span className="text-[10px] text-slate-500 font-bold shrink-0">Fast:</span>
        {quickReactions.map((emoji, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSendEmoji(emoji)}
            className="text-xs p-1 hover:scale-125 transition-transform"
          >
            {emoji}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <div className="p-2.5 bg-[#0d1533] border-t border-[#1f2d57]">
        <form onSubmit={handleSend} className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Type message in lobby..."
            maxLength={180}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="flex-1 px-3 py-1.5 bg-[#060a17] border border-[#1f2e59] rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="p-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-600/30"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
};
