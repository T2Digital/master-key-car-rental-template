import React from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  Car, 
  FileText, 
  Users, 
  AlertTriangle, 
  Calendar, 
  CheckCircle2, 
  PlusCircle, 
  ArrowUpRight, 
  Gauge, 
  Sparkles,
  Layers,
  Clock
} from 'lucide-react';
import { useApp } from '../context/AppContext';

import { Contract, Invoice } from '../types';

interface DashboardViewProps {
  onOpenNewContract?: () => void;
  onOpenNewTransaction?: () => void;
  onViewContract?: (contractId: string) => void;
  onSelectContractForView?: (contract: Contract) => void;
  onOpenInvoiceModal?: (invoice: Invoice) => void;
  onNavigateToSheet?: () => void;
  onNavigateToContracts?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onOpenNewContract,
  onOpenNewTransaction,
  onViewContract,
  onSelectContractForView,
  onOpenInvoiceModal,
  onNavigateToSheet,
  onNavigateToContracts,
}) => {
  const { 
    financialStats, 
    cars, 
    contracts, 
    sheetRows, 
    operationRows,
    invoices,
    generateInvoiceForContract,
    setActiveTab, 
    setSelectedCar 
  } = useApp();

  const activeContracts = contracts.filter(c => c.status === 'active');
  const recentTransactions = [...sheetRows].reverse().slice(0, 6);

  // Group performance per car
  const carPerformance = cars.map(car => {
    const carRows = sheetRows.filter(r => r.carId === car.id || r.revenueReason.includes(car.name.split(' ')[0]) || r.expenseReason.includes(car.name.split(' ')[0]));
    const rev = carRows.reduce((sum, r) => sum + (r.revenue || 0), 0);
    const exp = carRows.reduce((sum, r) => sum + (r.expense || 0), 0);
    const profit = rev - exp;
    const activeContract = contracts.find(c => c.carId === car.id && c.status === 'active');

    return {
      car,
      rev,
      exp,
      profit,
      activeContract,
    };
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      
      {/* Top Banner / Welcome with Quick Actions */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/70 border border-amber-500/30 p-6 sm:p-8 shadow-2xl">
        <div className="absolute top-0 left-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -translate-x-1/2 -translate-y-1/2" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>نظام ماستر كي (KRM) الذكي لإدارة تأجير السيارات</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white font-['Cairo',sans-serif]">
              لوحة التحكم المالية والتشغيلية
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl">
              متابعة مباشرة لعقود الإيجار، وتحديث العدادات بالكيلومتر المسموح به (120 كم/يوم)، ومزامنة السجل المالي الفعلي لشيت جوجل.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={onOpenNewContract}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm shadow-xl shadow-amber-500/25 transition-all hover:scale-105 active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span>تحرير عقد جديد</span>
            </button>

            <button
              onClick={onOpenNewTransaction}
              className="flex items-center gap-2 px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 font-semibold text-sm transition-all"
            >
              <Wallet className="w-4 h-4 text-amber-400" />
              <span>إضافة إيراد / مصروف بالشيت</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Inflow */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden group hover:border-emerald-500/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">إجمالي الإيرادات المحصلة</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-white font-['Cairo',sans-serif]">
              {financialStats.totalRevenue.toLocaleString()} <span className="text-sm font-normal text-slate-400">ج.م</span>
            </div>
            <p className="text-xs text-emerald-400 flex items-center gap-1 mt-1 font-medium">
              <span>مطابق لسجلات إيجارات الشيت</span>
            </p>
          </div>
        </div>

        {/* Total Expenses */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden group hover:border-rose-500/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">إجمالي المصروفات والأقساط</span>
            <div className="w-9 h-9 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
              <TrendingDown className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-rose-300 font-['Cairo',sans-serif]">
              {financialStats.totalExpenses.toLocaleString()} <span className="text-sm font-normal text-slate-400">ج.م</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              أقساط: {financialStats.totalInstallmentsPaid.toLocaleString()} ج | صيانة وتجهيز: {financialStats.totalMaintenancePaid.toLocaleString()} ج
            </p>
          </div>
        </div>

        {/* Net Profit */}
        <div className="bg-gradient-to-br from-slate-900 to-amber-950/40 border border-amber-500/40 rounded-2xl p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-300">صافي رصيد الأرباح (الشيت)</span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-amber-400 font-['Cairo',sans-serif]">
              {financialStats.netBalance.toLocaleString()} <span className="text-sm font-normal text-slate-300">ج.م</span>
            </div>
            <p className="text-xs text-amber-300/80 mt-1">
              الرصيد الفعلي التراكمي لأسطول ماستر كي
            </p>
          </div>
        </div>

        {/* Fleet Utilization */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden group hover:border-blue-500/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">نسبة تشغيل الأسطول</span>
            <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
              <Car className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-blue-300 font-['Cairo',sans-serif]">
              {financialStats.fleetUtilization}%
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {financialStats.activeRentalsCount} سيارات مؤجرة من أصل {financialStats.totalCarsCount}
            </p>
          </div>
        </div>

      </div>

      {/* Upcoming Installment & Maintenance Alerts */}
      {financialStats.upcomingInstallments.length > 0 && (
        <div className="bg-slate-900/90 border border-amber-500/20 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-amber-400" />
              <h3 className="font-bold text-white text-base font-['Cairo',sans-serif]">
                جدول استحقاق أقساط السيارات الشهرية
              </h3>
            </div>
            <span className="text-xs text-slate-400">مواعيد ثابتة (يوم 10 و 15 من كل شهر)</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {financialStats.upcomingInstallments.map((inst, idx) => (
              <div 
                key={idx}
                className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 flex items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-100">{inst.carName}</span>
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">{inst.plateNumber}</span>
                  </div>
                  <p className="text-xs text-slate-400">
                    تاريخ الاستحقاق: <span className="text-amber-400 font-bold">يوم {inst.dueDay} من كل شهر</span>
                  </p>
                </div>
                <div className="text-left">
                  <div className="text-lg font-black text-rose-400 font-mono">
                    {inst.amount.toLocaleString()} ج.م
                  </div>
                  <button
                    onClick={onOpenNewTransaction}
                    className="mt-1 text-[11px] font-semibold text-amber-400 hover:text-amber-300 underline"
                  >
                    تسجيل سداد القسط
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Fleet Profitability & Performance Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-white font-['Cairo',sans-serif]">
              أداء ومردود سيارات الأسطول
            </h2>
            <p className="text-xs text-slate-400">تحليل الأرباح ومستوى العداد لكل سيارة على حدة</p>
          </div>
          <button
            onClick={() => setActiveTab('fleet')}
            className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1"
          >
            <span>عرض تفاصيل الأسطول كاملة</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>

        {carPerformance.length === 0 ? (
          <div className="p-8 rounded-2xl bg-slate-900/60 border border-dashed border-slate-800 text-center space-y-3">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Car className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">لا توجد سيارات مسجلة بالأسطول حالياً</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              ابدأ بإضافة أول سيارة لأسطول ماستر كي لتتمكن من إنشاء عقود الإيجار ومتابعة العدادات وحسابات التشغيل مباشرة.
            </p>
            <button
              onClick={() => setActiveTab('fleet')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 text-slate-950 text-xs font-bold hover:bg-amber-400 transition-all shadow"
            >
              <PlusCircle className="w-4 h-4" />
              <span>إضافة سيارة للأسطول</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {carPerformance.map(({ car, rev, exp, profit, activeContract }) => (
              <div 
                key={car.id}
                className="bg-slate-900/90 border border-slate-800 hover:border-amber-500/40 rounded-2xl overflow-hidden shadow-xl transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Image & Plate Bar */}
                  <div className="relative h-40 overflow-hidden bg-slate-950">
                    <img 
                      src={car.imageUrl} 
                      alt={car.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />
                    
                    <div className="absolute top-3 right-3">
                      <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-900/90 text-amber-400 border border-amber-500/30 shadow backdrop-blur-sm">
                        {car.plateNumber}
                      </span>
                    </div>

                    <div className="absolute top-3 left-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold shadow backdrop-blur-sm ${
                        car.status === 'rented' 
                          ? 'bg-amber-500/90 text-slate-950' 
                          : car.status === 'available'
                          ? 'bg-emerald-500/90 text-slate-950'
                          : 'bg-rose-500/90 text-white'
                      }`}>
                        {car.status === 'rented' ? 'مؤجرة حالياً' : car.status === 'available' ? 'متاحة للتأجير' : 'في الصيانة'}
                      </span>
                    </div>

                    <div className="absolute bottom-3 right-3 left-3 flex items-center justify-between text-xs text-slate-200">
                      <span className="font-bold text-white text-base font-['Cairo',sans-serif]">{car.name}</span>
                      <span className="flex items-center gap-1 font-mono text-amber-300">
                        <Gauge className="w-3.5 h-3.5" />
                        {(car.currentMileage || 0).toLocaleString()} كم
                      </span>
                    </div>
                  </div>

                  {/* Performance stats body */}
                  <div className="p-4 space-y-3">
                    <div className="grid grid-cols-3 gap-2 text-center text-xs">
                      <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800">
                        <span className="text-slate-400 block text-[11px]">الإيرادات</span>
                        <span className="font-bold text-emerald-400 font-mono text-sm">{(rev || 0).toLocaleString()}</span>
                      </div>
                      <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800">
                        <span className="text-slate-400 block text-[11px]">المصروفات</span>
                        <span className="font-bold text-rose-400 font-mono text-sm">{(exp || 0).toLocaleString()}</span>
                      </div>
                      <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800">
                        <span className="text-slate-400 block text-[11px]">الصافي</span>
                        <span className="font-bold text-amber-400 font-mono text-sm">{(profit || 0).toLocaleString()}</span>
                      </div>
                    </div>

                    {activeContract ? (
                      <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-2.5 text-xs text-slate-300 space-y-1">
                        <div className="flex items-center justify-between text-amber-300 font-semibold">
                          <span>عقد نشط: {activeContract.contractNumber}</span>
                          <span>{((activeContract.rentalAmount ?? activeContract.totalRentAmount) || 0).toLocaleString()} ج.م</span>
                        </div>
                        <p className="text-slate-400 truncate">
                          المستأجر: {activeContract.customerSnapshot?.fullName || activeContract.secondPartyRepresentative || 'العميل'}
                        </p>
                      </div>
                    ) : (
                      <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-2 text-center text-xs text-emerald-300 font-medium">
                        السيارة متاحة للاستلام الفوري
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-4 pt-0">
                  <button
                    onClick={() => {
                      setSelectedCar(car);
                      setActiveTab('fleet');
                    }}
                    className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors"
                  >
                    فتح ملف السيارة وتحديث العداد
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Active Contracts & Recent Sheet Activities Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Active Contracts List */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-amber-400" />
              <h3 className="font-black text-white text-lg font-['Cairo',sans-serif]">
                العقود الجارية والمطابقة
              </h3>
            </div>
            <button
              onClick={() => setActiveTab('contracts')}
              className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1"
            >
              <span>عرض كل العقود</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {activeContracts.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">لا توجد عقود نشطة حالياً</p>
            ) : (
              activeContracts.map((contract) => (
                <div
                  key={contract.id}
                  onClick={() => onViewContract(contract.id)}
                  className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 hover:border-amber-500/40 transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-bold text-amber-400 group-hover:underline">
                        {contract.contractNumber}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        ساري
                      </span>
                    </div>
                    <span className="text-sm font-black text-slate-100 font-mono">
                      {((contract.rentalAmount ?? contract.totalRentAmount) || 0).toLocaleString()} ج.م
                    </span>
                  </div>

                  <div className="mt-2 flex items-center justify-between text-xs text-slate-400">
                    <span>{contract.customerSnapshot?.fullName || contract.secondPartyRepresentative || 'العميل'}</span>
                    <span>{contract.carSnapshot?.name || 'السيارة'}</span>
                  </div>

                  <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                    <span>من {contract.startDate}</span>
                    <span>إلى {contract.endDate}</span>
                    <span className="text-amber-400/90 font-sans">عداد الخروج: {(contract.initialMileage || 0).toLocaleString()} كم</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Sheet Transactions */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-blue-400" />
              <h3 className="font-black text-white text-lg font-['Cairo',sans-serif]">
                آخر حركات شيت جوجل
              </h3>
            </div>
            <button
              onClick={() => setActiveTab('sheet')}
              className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1"
            >
              <span>فتح الشيت كاملاً</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5">
            {recentTransactions.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">لا توجد حركات مسجلة بالشيت حالياً</p>
            ) : (
              recentTransactions.map((row) => (
                <div 
                  key={row.id}
                  className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-0.5">
                    <p className="font-bold text-slate-200">
                      {row.revenueReason || row.expenseReason || 'معاملة مالية'}
                    </p>
                    <p className="text-[11px] text-slate-400 font-mono">{row.date}</p>
                  </div>

                  <div className="text-left font-mono font-bold text-sm">
                    {row.revenue ? (
                      <span className="text-emerald-400">+{(row.revenue || 0).toLocaleString()} ج.م</span>
                    ) : row.expense ? (
                      <span className="text-rose-400">-{(row.expense || 0).toLocaleString()} ج.م</span>
                    ) : (
                      <span className="text-slate-400">0 ج.م</span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
