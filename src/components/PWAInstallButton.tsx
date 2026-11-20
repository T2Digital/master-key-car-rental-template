import React, { useState } from 'react';
import { Download, Smartphone, Share2, PlusSquare, X, Sparkles, ShieldCheck } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already running as an installed PWA, hide install prompt
  if (isInstalled) {
    return null;
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    return (
      <button
        onClick={install}
        className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500/20 to-amber-600/20 hover:from-amber-500/30 hover:to-amber-600/30 border border-amber-500/40 text-amber-300 hover:text-amber-200 text-xs font-bold transition-all shadow-md group active:scale-95"
        title="تثبيت تطبيق ماستر كي PWA على جهازك"
      >
        <Download className="w-3.5 h-3.5 text-amber-400 group-hover:translate-y-0.5 transition-transform" />
        <span className="hidden sm:inline">تثبيت التطبيق (PWA)</span>
        <span className="sm:hidden">تثبيت التطبيق</span>
      </button>
    );
  }

  // iOS Safari flow (beforeinstallprompt is not supported by WebKit)
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-amber-500/30 text-amber-300 text-xs font-bold transition-all shadow-md active:scale-95"
          title="تثبيت التطبيق على iPhone / iPad"
        >
          <Smartphone className="w-3.5 h-3.5 text-amber-400" />
          <span>تثبيت على آيفون</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-amber-500/30 p-6 shadow-2xl text-slate-100 relative">
              <button
                onClick={() => setShowIOSGuide(false)}
                className="absolute top-4 left-4 p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
                  <Smartphone className="w-6 h-6 text-amber-400" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white font-['Cairo',sans-serif]">تثبيت تطبيق ماستر كي على iOS</h3>
                  <p className="text-xs text-slate-400">يعمل كتطبيق أصلي سريع بدون إنترنت</p>
                </div>
              </div>

              <div className="space-y-3 my-5 text-xs text-slate-300 bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center shrink-0 text-xs">
                    1
                  </span>
                  <p className="pt-0.5">
                    اضغط على زر <strong className="text-amber-300">مشاركة (Share <Share2 className="w-3.5 h-3.5 inline mx-1" />)</strong> في شريط متصفح Safari السفلي.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center shrink-0 text-xs">
                    2
                  </span>
                  <p className="pt-0.5">
                    مرر لأسفل واختر <strong className="text-amber-300">إضافة إلى الصفحة الرئيسية (Add to Home Screen <PlusSquare className="w-3.5 h-3.5 inline mx-1" />)</strong>.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center shrink-0 text-xs">
                    3
                  </span>
                  <p className="pt-0.5">
                    اضغط على <strong className="text-amber-300">إضافة (Add)</strong> في أعلى الزاوية.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-[11px] text-emerald-400 mb-5 bg-emerald-950/30 p-2.5 rounded-xl border border-emerald-500/20">
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span>سيظهر التطبيق بأيقونة ماستر كي الفاخرة على شاشة هاتفك الرئيسية.</span>
              </div>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition shadow-lg shadow-amber-500/20"
              >
                فهمت، شكراً
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  // Generic fallback install guide button if browser doesn't dispatch beforeinstallprompt yet
  return (
    <button
      onClick={() => {
        alert('لتثبيت تطبيق ماستر كي:\n- من الكمبيوتر (Chrome/Edge): اضغط على أيقونة التثبيت ⊕ في شريط العنوان أعلى المتصفح.\n- من الهاتف (Android): اضغط على القائمة (⋮) ثم "تثبيت التطبيق" أو "إضافة إلى الشاشة الرئيسية".\n- من iPhone: اضغط زر مشاركة Safari ثم "إضافة إلى الصفحة الرئيسية".');
      }}
      className="hidden md:flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white text-xs font-medium transition-all"
      title="تثبيت تطبيق ماستر كي PWA"
    >
      <Download className="w-3.5 h-3.5 text-amber-400" />
      <span>تطبيق الويب PWA</span>
    </button>
  );
};
