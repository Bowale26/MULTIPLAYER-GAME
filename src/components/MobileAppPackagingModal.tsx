import React, { useState } from 'react';
import { Smartphone, Apple, Play, Code2, Download, Check, Copy, X } from 'lucide-react';
import { soundManager } from '../utils/sound';

interface MobileAppPackagingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileAppPackagingModal: React.FC<MobileAppPackagingModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    soundManager.playClick();
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const capacitorConfig = `{
  "appId": "com.aistudio.multiplayergame.colorclash",
  "appName": "MULTIPLAYER GAME",
  "webDir": "dist",
  "bundledWebRuntime": false,
  "server": {
    "androidScheme": "https"
  },
  "plugins": {
    "SplashScreen": {
      "launchShowDuration": 2000,
      "backgroundColor": "#060914"
    },
    "StatusBar": {
      "style": "DARK",
      "backgroundColor": "#060914"
    }
  }
}`;

  const manifestJson = `{
  "short_name": "ColorClash",
  "name": "MULTIPLAYER GAME: Color Clash",
  "icons": [
    {
      "src": "/favicon.ico",
      "sizes": "64x64 32x32 24x24 16x16",
      "type": "image/x-icon"
    }
  ],
  "start_url": "/",
  "background_color": "#060914",
  "theme_color": "#060914",
  "display": "standalone",
  "orientation": "portrait"
}`;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 select-none">
      <div className="w-full max-w-3xl bg-[#090e24] border border-[#23335f] rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-4 py-3 bg-[#0d1533] border-b border-[#1f2d57] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-black text-white flex items-center gap-1.5">
                Android & iOS Native Packaging
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30">
                  Capacitor 6 Ready
                </span>
              </h2>
              <p className="text-[11px] text-slate-400">Export MULTIPLAYER GAME for Google Play Store and Apple App Store</p>
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

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {/* Quick instructions banner */}
          <div className="p-3.5 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-xs text-cyan-200">
            <p className="font-bold text-white mb-1">Single Codebase, Instant Mobile Delivery</p>
            <p>
              MULTIPLAYER GAME is built mobile-first. You can install it directly to any home screen as an offline-capable PWA, or compile it to native Android (APK/AAB) and iOS (Xcode Archive) via Capacitor.
            </p>
          </div>

          {/* Android Section */}
          <div className="bg-[#0e1633] border border-[#1f2e59] rounded-2xl p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <Play className="w-4 h-4 fill-emerald-400" /> Android Build Pipeline (Google Play)
              </h3>
              <button
                onClick={() => copyToClipboard('npm run build && npx cap sync android && npx cap open android', 'android-cmd')}
                className="text-[10px] text-slate-300 hover:text-white flex items-center gap-1 bg-[#152042] px-2 py-0.5 rounded"
              >
                {copiedKey === 'android-cmd' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                Copy Commands
              </button>
            </div>
            <pre className="p-3 rounded-xl bg-[#060a17] border border-[#1a264a] text-xs font-mono text-emerald-300 overflow-x-auto">
{`# 1. Build production web bundle
npm run build

# 2. Add and sync Capacitor Android target
npm install @capacitor/core @capacitor/cli @capacitor/android
npx cap add android
npx cap sync android

# 3. Open in Android Studio to build signed APK / AAB
npx cap open android`}
            </pre>
          </div>

          {/* iOS Section */}
          <div className="bg-[#0e1633] border border-[#1f2e59] rounded-2xl p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-black uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
                <Apple className="w-4 h-4" /> iOS Build Pipeline (Apple App Store)
              </h3>
              <button
                onClick={() => copyToClipboard('npm run build && npx cap sync ios && npx cap open ios', 'ios-cmd')}
                className="text-[10px] text-slate-300 hover:text-white flex items-center gap-1 bg-[#152042] px-2 py-0.5 rounded"
              >
                {copiedKey === 'ios-cmd' ? <Check className="w-3 h-3 text-blue-400" /> : <Copy className="w-3 h-3" />}
                Copy Commands
              </button>
            </div>
            <pre className="p-3 rounded-xl bg-[#060a17] border border-[#1a264a] text-xs font-mono text-blue-300 overflow-x-auto">
{`# 1. Build production web bundle
npm run build

# 2. Add and sync Capacitor iOS target
npm install @capacitor/ios
npx cap add ios
npx cap sync ios

# 3. Open in Xcode on macOS to sign and archive for App Store
npx cap open ios`}
            </pre>
          </div>

          {/* Capacitor Config */}
          <div className="bg-[#0e1633] border border-[#1f2e59] rounded-2xl p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Code2 className="w-4 h-4 text-purple-400" /> capacitor.config.json
              </h3>
              <button
                onClick={() => copyToClipboard(capacitorConfig, 'cap-config')}
                className="text-[10px] text-slate-300 hover:text-white flex items-center gap-1 bg-[#152042] px-2 py-0.5 rounded"
              >
                {copiedKey === 'cap-config' ? <Check className="w-3 h-3 text-purple-400" /> : <Copy className="w-3 h-3" />}
                Copy JSON
              </button>
            </div>
            <pre className="p-3 rounded-xl bg-[#060a17] border border-[#1a264a] text-xs font-mono text-slate-300 overflow-x-auto">
              {capacitorConfig}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
