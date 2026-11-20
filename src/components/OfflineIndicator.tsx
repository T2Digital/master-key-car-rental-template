import React from 'react';
import { WifiOff, AlertTriangle } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:right-auto sm:left-6 z-50 flex items-center gap-3 rounded-2xl bg-amber-600/90 text-slate-950 backdrop-blur-md px-4 py-3 shadow-2xl border border-amber-400/40 animate-bounce">
      <div className="w-8 h-8 rounded-xl bg-slate-950/20 flex items-center justify-center">
        <WifiOff className="w-4 h-4 text-slate-950" />
      </div>
      <div>
        <div className="flex items-center gap-1.5 font-bold text-xs">
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>أنت تعمل الآن في وضع عدم الاتصال (Offline Mode)</span>
        </div>
        <p className="text-[11px] opacity-90">يتم تشغيل تطبيق ماستر كي مباشرة من الذاكرة المخبأة (Cache).</p>
      </div>
    </div>
  );
};
