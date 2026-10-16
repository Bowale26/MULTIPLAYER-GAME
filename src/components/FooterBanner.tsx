import React from 'react';
import { 
  Users, 
  BrainCircuit, 
  Bot, 
  ShieldCheck, 
  Wrench, 
  Cloud, 
  Smartphone, 
  Shield, 
  Wifi, 
  Flame,
  ArrowRight
} from 'lucide-react';
import { soundManager } from '../utils/sound';

interface FooterBannerProps {
  onOpenMobileGuide: () => void;
  onOpenVision: () => void;
  onOpenJudge: () => void;
  onOpenGameMaster: () => void;
  onOpenMaintenance: () => void;
}

export const FooterBanner: React.FC<FooterBannerProps> = ({
  onOpenMobileGuide,
  onOpenVision,
  onOpenJudge,
  onOpenGameMaster,
  onOpenMaintenance,
}) => {
  const features = [
    {
      title: 'Real-Time Multiplayer',
      icon: Users,
      color: 'bg-purple-600',
      action: () => {},
    },
    {
      title: 'Computer Vision & Image Recognition',
      icon: BrainCircuit,
      color: 'bg-rose-600',
      action: onOpenVision,
    },
    {
      title: 'AI Game Master',
      icon: Bot,
      color: 'bg-emerald-600',
      action: onOpenGameMaster,
    },
    {
      title: 'Judge Agent (Quality Check)',
      icon: ShieldCheck,
      color: 'bg-blue-600',
      action: onOpenJudge,
    },
    {
      title: 'Self-Maintenance & Updates',
      icon: Wrench,
      color: 'bg-fuchsia-600',
      action: onOpenMaintenance,
    },
    {
      title: 'Cloud Powered & Secure',
      icon: Cloud,
      color: 'bg-amber-500',
      action: () => {},
    },
  ];

  return (
    <footer className="w-full bg-[#050814] border-t border-[#182342] select-none text-white">
      {/* Top Status Strip */}
      <div className="px-4 py-2 flex flex-wrap items-center justify-between gap-2 border-b border-[#121b33] text-xs">
        <div className="flex items-center gap-2">
          <span className="font-black text-cyan-400 flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 text-yellow-400" /> COLOR CLASH
          </span>
          <span className="text-slate-600">|</span>
          <span className="text-slate-400 text-[11px]">Real-time Multiplayer Game Engine</span>
        </div>

        <div className="flex items-center gap-2 sm:gap-4 text-[11px] font-semibold text-slate-300">
          <span className="flex items-center gap-1">
            <Smartphone className="w-3 h-3 text-blue-400" /> PWA Ready
          </span>
          <span className="flex items-center gap-1">
            <Wifi className="w-3 h-3 text-emerald-400" /> Mobile Friendly
          </span>
          <span className="flex items-center gap-1">
            <Shield className="w-3 h-3 text-cyan-400" /> Secure (HTTPS)
          </span>
          <span className="flex items-center gap-1">
            <Cloud className="w-3 h-3 text-yellow-400" /> Cloud Powered
          </span>
        </div>
      </div>

      {/* 6 Feature Icons & Download Badges matching reference mockup */}
      <div className="px-4 py-3 sm:py-4 flex flex-col lg:flex-row items-center justify-between gap-4">
        {/* Features Row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 sm:gap-3 w-full lg:w-auto">
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <button
                key={idx}
                onClick={() => {
                  soundManager.playClick();
                  feat.action();
                }}
                className="flex flex-col items-center text-center p-2 rounded-xl bg-[#0a1024] border border-[#16213f] hover:border-blue-500/50 hover:bg-[#0e1633] transition-all group cursor-pointer"
              >
                <div
                  className={`w-9 h-9 rounded-xl ${feat.color} flex items-center justify-center text-white mb-1.5 shadow-md group-hover:scale-105 transition-transform`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold text-slate-300 group-hover:text-white leading-tight">
                  {feat.title}
                </span>
              </button>
            );
          })}
        </div>

        {/* Download Now Badges */}
        <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
          <div className="flex items-center gap-1.5 text-xs font-black text-yellow-400 uppercase tracking-wider">
            <span>Download Now</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>

          <div className="flex items-center gap-2">
            {/* Google Play Mock Button */}
            <button
              onClick={() => {
                soundManager.playClick();
                onOpenMobileGuide();
              }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black border border-slate-700 hover:border-slate-500 transition-all shadow-md group"
            >
              <svg className="w-4 h-4 fill-current text-white" viewBox="0 0 24 24">
                <path d="M3.609 1.814L13.792 12 3.61 22.186a1.98 1.98 0 0 1-.61-.956V2.77c0-.36.104-.693.284-.972l.325.016zm11.246 11.246l2.42 2.42-12.7 7.332 10.28-9.752zm2.42-2.12l4.133 2.387c.803.464.803 1.223 0 1.687l-4.133 2.387-2.73-2.73 2.73-2.731zm-2.42-2.121L4.575 1.066l12.7 7.333-2.42 2.42z" />
              </svg>
              <div className="text-left leading-tight">
                <span className="block text-[8px] uppercase tracking-wider text-slate-400">GET IT ON</span>
                <span className="block text-xs font-bold text-white">Google Play</span>
              </div>
            </button>

            {/* Apple App Store Mock Button */}
            <button
              onClick={() => {
                soundManager.playClick();
                onOpenMobileGuide();
              }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black border border-slate-700 hover:border-slate-500 transition-all shadow-md group"
            >
              <svg className="w-4 h-4 fill-current text-white" viewBox="0 0 24 24">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.8c.64-.78 1.08-1.86.96-2.95-1 .04-2.16.66-2.83 1.45-.58.68-1.1 1.77-.96 2.84 1.11.09 2.2-.56 2.83-1.34z" />
              </svg>
              <div className="text-left leading-tight">
                <span className="block text-[8px] uppercase tracking-wider text-slate-400">Download on the</span>
                <span className="block text-xs font-bold text-white">App Store</span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
