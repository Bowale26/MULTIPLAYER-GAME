import React from 'react';
import { 
  Gamepad2, 
  Users, 
  Bot, 
  Eye, 
  ShieldCheck, 
  Wrench, 
  BookOpen, 
  Smartphone, 
  HelpCircle,
  Cpu,
  MessageSquare,
  Trophy
} from 'lucide-react';
import { soundManager } from '../utils/sound';

export type ActiveTab = 
  | 'game' 
  | 'lobbies'
  | 'leaderboard'
  | 'chat'
  | 'room' 
  | 'gamemaster' 
  | 'vision' 
  | 'judge' 
  | 'maintenance' 
  | 'rules' 
  | 'mobile' 
  | 'help';

interface NavigationSidebarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  chatCount?: number;
}

export const NavigationSidebar: React.FC<NavigationSidebarProps> = ({
  activeTab,
  onSelectTab,
  chatCount,
}) => {
  const navItems = [
    { id: 'game' as ActiveTab, label: 'Game', icon: Gamepad2, highlight: true },
    { id: 'lobbies' as ActiveTab, label: 'Lobbies', icon: Users, badge: 'Browse' },
    { id: 'leaderboard' as ActiveTab, label: 'Leaderboard', icon: Trophy, badge: 'Top 10' },
    { id: 'chat' as ActiveTab, label: 'Lobby Chat', icon: MessageSquare, badge: chatCount ? String(chatCount) : 'Live' },
    { id: 'gamemaster' as ActiveTab, label: 'AI Game Master', icon: Bot, badge: 'Gemini' },
    { id: 'vision' as ActiveTab, label: 'Vision Agent', icon: Eye, badge: 'Vision' },
    { id: 'judge' as ActiveTab, label: 'Judge Agent', icon: ShieldCheck, badge: 'A2A' },
    { id: 'maintenance' as ActiveTab, label: 'Maintenance', icon: Wrench },
    { id: 'rules' as ActiveTab, label: 'Rulebook', icon: BookOpen },
    { id: 'mobile' as ActiveTab, label: 'Android / iOS', icon: Smartphone },
    { id: 'help' as ActiveTab, label: 'Help', icon: HelpCircle },
  ];

  const handleSelect = (tab: ActiveTab) => {
    soundManager.playClick();
    onSelectTab(tab);
  };

  return (
    <aside className="w-56 shrink-0 bg-[#090f23] border-r border-[#192444] flex flex-col justify-between p-3 select-none">
      <nav className="space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => handleSelect(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 font-bold translate-x-0.5'
                  : 'text-slate-300 hover:text-white hover:bg-[#121c38]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-blue-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && !isActive && (
                <span className="px-1.5 py-0.5 text-[9px] font-bold rounded-md bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Powered by AI Badge from reference image */}
      <div className="p-3.5 rounded-2xl bg-[#0c142e] border border-[#1e2d57] text-center shadow-inner">
        <div className="flex items-center justify-center gap-2 mb-1.5">
          <div className="p-1 rounded-lg bg-indigo-500/20 text-indigo-400">
            <Cpu className="w-4 h-4 text-cyan-400" />
          </div>
          <span className="text-xs font-black tracking-wide bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent">
            Powered by AI
          </span>
        </div>
        <p className="text-[10px] text-slate-400 leading-tight">
          Computer Vision • AI Agents
        </p>
        <p className="text-[10px] text-slate-400 leading-tight">
          A2A Communication
        </p>
      </div>
    </aside>
  );
};
