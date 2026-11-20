import React from 'react';
import { 
  KeyRound, 
  Car, 
  FileText, 
  Users, 
  Table2, 
  Sparkles, 
  PlusCircle, 
  Phone, 
  CalendarClock, 
  Calculator,
  LayoutDashboard,
  ShieldCheck,
  BellRing,
  Database,
  CloudCheck,
  Cloud
} from 'lucide-react';
import { useApp } from '../context/AppContext';

import { PWAInstallButton } from './PWAInstallButton';
import { BrandLogo } from './BrandLogo';

interface NavbarProps {
  onOpenNewContract: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenNewContract }) => {
  const { activeTab, setActiveTab, bookings, financialStats, company, cloudStatus } = useApp();
  
  const pendingBookingsCount = bookings.filter(b => b.status === 'pending').length;
  const dueInstallmentsCount = financialStats.upcomingInstallments.filter(i => i.isDueSoon).length;

  interface NavItem {
    id: 'dashboard' | 'contracts' | 'fleet' | 'sheet' | 'crm' | 'bookings' | 'calculator' | 'settings';
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string | null;
    badgeColor?: string;
  }

  const navItems: NavItem[] = [
    {
      id: 'dashboard',
      label: 'الداشبورد المالي والتشغيلي',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'contracts',
      label: 'العقود الرسمية المطابقة',
      icon: FileText,
      badge: `${financialStats.activeRentalsCount} ساري`,
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    },
    {
      id: 'fleet',
      label: 'أسطول السيارات والعداد',
      icon: Car,
      badge: `${financialStats.totalCarsCount} مركبات`,
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    },
    {
      id: 'sheet',
      label: 'شيت جوجل وسجل الحسابات',
      icon: Table2,
      badge: 'مباشر',
      badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    },
    {
      id: 'crm',
      label: 'سجل العملاء CRM',
      icon: Users,
      badge: null,
    },
    {
      id: 'bookings',
      label: 'بوابة الحجز الذكي',
      icon: Sparkles,
      badge: pendingBookingsCount > 0 ? `${pendingBookingsCount} جديد` : null,
      badgeColor: 'bg-rose-500 text-white animate-pulse',
    },
    {
      id: 'calculator',
      label: 'حاسبة الكيلومتر والرسوم',
      icon: Calculator,
      badge: `${company.dailyKmAllowance} كم/يوم`,
      badgeColor: 'bg-slate-700 text-slate-300',
    },
    {
      id: 'settings',
      label: 'إعدادات الشركة والعقد القانوني',
      icon: ShieldCheck,
      badge: null,
    }
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-amber-500/20 shadow-2xl">
      {/* Top micro-bar with legal registration & direct contact */}
      <div className="bg-gradient-to-r from-amber-950/60 via-slate-950 to-amber-950/60 border-b border-amber-500/10 text-xs px-4 py-1.5">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-slate-400">
          <div className="flex items-center gap-4 flex-wrap">
            <span className="flex items-center gap-1.5 text-amber-400 font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{company.name}</span>
            </span>
            <span className="hidden sm:inline-block text-slate-600">|</span>
            <span className="hidden md:inline">س.ت : {company.commercialRecord}</span>
            <span className="hidden sm:inline-block text-slate-600">|</span>
            <span className="hidden md:inline">ب.ض: {company.taxCard}</span>
            <span className="hidden sm:inline-block text-slate-600">|</span>
            <span className="text-slate-300">{company.courtJurisdiction}</span>
          </div>

          <div className="flex items-center gap-4 flex-wrap text-xs">
            <a href={`tel:${company.phone}`} className="flex items-center gap-1 hover:text-amber-400 transition-colors text-slate-300">
              <Phone className="w-3 h-3 text-amber-500" />
              <span dir="ltr">{company.phone}</span>
            </a>
            <span className="text-slate-600">/</span>
            <a href={`tel:${company.officePhone}`} className="flex items-center gap-1 hover:text-amber-400 transition-colors text-slate-300">
              <Phone className="w-3 h-3 text-amber-500" />
              <span>المكتب:</span>
              <span dir="ltr">{company.officePhone}</span>
            </a>
            {dueInstallmentsCount > 0 && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[11px]">
                <BellRing className="w-3 h-3 text-rose-400 animate-bounce" />
                تنبيه أقساط قادمة ({dueInstallmentsCount})
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Main navigation header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
        <div className="flex items-center justify-between gap-4">
          
          {/* Logo & Identity */}
          <div 
            onClick={() => setActiveTab('dashboard')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400/20 via-slate-900 to-amber-950 p-1 border border-amber-500/40 shadow-lg shadow-amber-500/10 group-hover:scale-105 transition-transform flex items-center justify-center">
              <BrandLogo size="sm" showPhones={false} variant="gold-luxury" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-black tracking-wide text-white group-hover:text-amber-400 transition-colors font-['Cairo',sans-serif]">
                  CAREEM • MASTER KEY
                </span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500 text-slate-950 font-mono">
                  K R M
                </span>
              </div>
              <p className="text-xs text-slate-400">لتأجير وتوريد السيارات (كريم كرم محرم)</p>
            </div>
          </div>

          {/* Action button & PWA Install */}
          <div className="flex items-center gap-2.5">
            {/* Cloud Sync Status Pill */}
            <div 
              title={cloudStatus === 'connected' ? 'قاعدة بيانات فايربيز كلاود متصلة ومزامنة مباشرة' : cloudStatus === 'connecting' ? 'جاري الاتصال بقاعدة بيانات فايربيز...' : 'يعمل بالذاكرة المحلية (Offline)'}
              className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                cloudStatus === 'connected'
                  ? 'bg-emerald-950/40 text-emerald-400 border-emerald-500/30'
                  : cloudStatus === 'connecting'
                  ? 'bg-amber-950/40 text-amber-400 border-amber-500/30'
                  : 'bg-slate-800/60 text-slate-400 border-slate-700'
              }`}
            >
              <Database className={`w-3.5 h-3.5 ${cloudStatus === 'connected' ? 'text-emerald-400 animate-pulse' : cloudStatus === 'connecting' ? 'text-amber-400 animate-spin' : 'text-slate-500'}`} />
              <span className="text-[11px]">
                {cloudStatus === 'connected' ? 'فايربيز سحابي (مباشر)' : cloudStatus === 'connecting' ? 'جاري المزامنة...' : 'محلي (أوفلاين)'}
              </span>
            </div>

            <PWAInstallButton />
            <button
              onClick={onOpenNewContract}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 transition-all hover:scale-[1.02] active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span className="hidden sm:inline">تحرير عقد إيجار جديد</span>
              <span className="sm:hidden">عقد جديد</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs bar */}
        <nav className="flex items-center gap-1.5 mt-3 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs md:text-sm font-medium transition-all whitespace-nowrap border ${
                  isActive
                    ? 'bg-amber-500/15 text-amber-400 border-amber-500/40 shadow-inner'
                    : 'bg-slate-950/40 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border-slate-800/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
                {item.badge && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-md border font-semibold ${item.badgeColor || 'bg-slate-800 text-slate-300 border-slate-700'}`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
