import React, { useState } from 'react';
import { 
  Car as CarIcon, 
  Gauge, 
  Wrench, 
  Calendar, 
  ShieldCheck, 
  PlusCircle, 
  Edit, 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  CheckCircle2, 
  AlertCircle,
  MapPin,
  Radio,
  FileText,
  Trash2
} from 'lucide-react';
import { Car } from '../types';
import { useApp } from '../context/AppContext';

interface FleetManagerProps {
  onOpenNewCarModal: () => void;
  onOpenOdometerModal: (car: Car) => void;
  onOpenNewContractForCar: (car: Car) => void;
}

export const FleetManager: React.FC<FleetManagerProps> = ({
  onOpenNewCarModal,
  onOpenOdometerModal,
  onOpenNewContractForCar,
}) => {
  const { cars, sheetRows, contracts, updateCar, deleteCar } = useApp();
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const filteredCars = cars.filter(car => {
    if (filterStatus === 'all') return true;
    return car.status === filterStatus;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      
      {/* Header and Add Car Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <CarIcon className="w-6 h-6 text-amber-400" />
            <h1 className="text-2xl font-black text-white font-['Cairo',sans-serif]">
              أسطول سيارات ماستر كي وتتبع العدادات
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400">
            ملفات تفصيلية لكل مركبة، تتبع قراءات العدادات، صيانة الزيوت والفلاتر، أجهزة الـ GPS، وجداول سداد الأقساط الشهرية.
          </p>
        </div>

        <button
          onClick={onOpenNewCarModal}
          className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm shadow-xl shadow-amber-500/25 transition-all hover:scale-105"
        >
          <PlusCircle className="w-5 h-5" />
          <span>إضافة سيارة جديدة للأسطول</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2">
        {[
          { id: 'all', label: `جميع المركبات (${cars.length})` },
          { id: 'rented', label: `مؤجرة حالياً (${cars.filter(c => c.status === 'rented').length})` },
          { id: 'available', label: `متاحة (${cars.filter(c => c.status === 'available').length})` },
          { id: 'maintenance', label: `في الصيانة (${cars.filter(c => c.status === 'maintenance').length})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilterStatus(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
              filterStatus === tab.id
                ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-md'
                : 'bg-slate-900/80 text-slate-400 hover:text-white border-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Fleet Cards Grid */}
      {filteredCars.length === 0 ? (
        <div className="p-12 rounded-3xl bg-slate-900/60 border border-dashed border-slate-800 text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-3xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
            <CarIcon className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-white">لا توجد أي سيارات مسجلة بالأسطول حالياً</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              أضف سياراتك الفعلية (الماركة، الموديل، اللون، رقم اللوحات، عداد الكيلومتر الحالي، وأسعار الإيجار اليومي والشهري) للبدء المباشر في تحرير العقود وتتبع الحسابات.
            </p>
          </div>
          <button
            onClick={onOpenNewCarModal}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-sm font-bold shadow-lg shadow-amber-500/20 transition-all hover:scale-105"
          >
            <PlusCircle className="w-5 h-5" />
            <span>إضافة سيارة جديدة للأسطول</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {filteredCars.map((car) => {
          // Calculate financial metrics for this car from sheet
          const carRows = sheetRows.filter(r => r.carId === car.id || r.revenueReason.includes(car.name.split(' ')[0]) || r.expenseReason.includes(car.name.split(' ')[0]));
          const rev = carRows.reduce((sum, r) => sum + (r.revenue || 0), 0);
          const exp = carRows.reduce((sum, r) => sum + (r.expense || 0), 0);
          const net = rev - exp;
          const activeContract = contracts.find(c => c.carId === car.id && c.status === 'active');

          return (
            <div
              key={car.id}
              className="bg-slate-900/90 border border-slate-800 hover:border-amber-500/40 rounded-3xl overflow-hidden shadow-2xl transition-all flex flex-col justify-between"
            >
              <div>
                {/* Photo & Status Banner */}
                <div className="relative h-48 bg-slate-950 overflow-hidden">
                  <img
                    src={car.imageUrl}
                    alt={car.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                  
                  {/* Plate Badge */}
                  <div className="absolute top-3 right-3">
                    <span className="px-3 py-1 rounded-xl text-xs font-bold bg-slate-900/95 text-amber-400 border border-amber-500/40 shadow-lg font-mono">
                      {car.plateNumber}
                    </span>
                  </div>

                  {/* Status Badge */}
                  <div className="absolute top-3 left-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold shadow ${
                      car.status === 'rented'
                        ? 'bg-amber-500 text-slate-950'
                        : car.status === 'available'
                        ? 'bg-emerald-500 text-slate-950'
                        : 'bg-rose-500 text-white'
                    }`}>
                      {car.status === 'rented' ? 'مؤجرة' : car.status === 'available' ? 'متاحة' : 'صيانة'}
                    </span>
                  </div>

                  {/* Title & Color overlay */}
                  <div className="absolute bottom-3 right-3 left-3 flex items-end justify-between">
                    <div>
                      <h2 className="text-lg font-black text-white font-['Cairo',sans-serif]">
                        {car.name}
                      </h2>
                      <span className="text-xs text-slate-300">
                        موديل: {car.modelYear} | اللون: {car.color}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Body Details */}
                <div className="p-5 space-y-4 text-xs">
                  
                  {/* Odometer Bar */}
                  <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-3.5 flex items-center justify-between">
                    <div className="space-y-0.5">
                      <span className="text-slate-400 block text-[11px]">قراءة العداد الحالي</span>
                      <span className="text-lg font-black text-amber-400 font-mono flex items-center gap-1.5">
                        <Gauge className="w-4 h-4" />
                        {(car.currentMileage || 0).toLocaleString()} كم
                      </span>
                    </div>

                    <button
                      onClick={() => onOpenOdometerModal(car)}
                      className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-slate-950 border border-amber-500/40 text-xs font-bold transition-all"
                    >
                      تحديث العداد
                    </button>
                  </div>

                  {/* Official Spec Box (For Contracts) */}
                  <div className="bg-slate-950/40 border border-slate-800/80 rounded-2xl p-3 space-y-1.5 text-[11px] text-slate-300">
                    <div className="flex justify-between">
                      <span className="text-slate-400">وحدة المرور:</span>
                      <span className="font-semibold">{car.trafficUnit || 'مرور الجيزة'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">رقم الشاسية:</span>
                      <span className="font-mono">{car.chassisNumber || '—'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">رقم الماتور:</span>
                      <span className="font-mono">{car.motorNumber || '—'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">سعر الإيجار:</span>
                      <span className="font-bold text-emerald-400 font-mono">{(car.monthlyRate || 0).toLocaleString()} ج.م / شهر ({car.dailyRate || 0} ج/يوم)</span>
                    </div>
                  </div>

                  {/* Equipment & GPS Status */}
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div className={`p-2 rounded-xl border flex items-center gap-1.5 ${
                      car.equipment?.hasGps ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300' : 'bg-slate-800 border-slate-700 text-slate-400'
                    }`}>
                      <Radio className="w-3.5 h-3.5" />
                      <span>{car.equipment?.hasGps ? 'جهاز تتبع GPS راكب' : 'بدون GPS'}</span>
                    </div>

                    <div className="p-2 rounded-xl bg-slate-950/40 border border-slate-800 text-slate-300 flex items-center gap-1.5">
                      <Wrench className="w-3.5 h-3.5 text-amber-400" />
                      <span>تغيير زيت: {car.equipment?.lastOilChangeKm ? `${(car.equipment.lastOilChangeKm || 0).toLocaleString()} كم` : 'منتظم'}</span>
                    </div>
                  </div>

                  {/* Monthly Installment info if any */}
                  {car.monthlyInstallment && car.monthlyInstallment > 0 ? (
                    <div className="bg-rose-950/20 border border-rose-500/30 rounded-xl p-2.5 flex items-center justify-between text-xs text-rose-300">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-rose-400" />
                        <span>قسط شهري: <strong className="font-mono">{(car.monthlyInstallment || 0).toLocaleString()} ج.م</strong></span>
                      </div>
                      <span className="text-[11px] font-bold text-slate-400">يوم {car.installmentDueDay || 10} من كل شهر</span>
                    </div>
                  ) : null}

                  {/* Financial Mini Strip */}
                  <div className="grid grid-cols-3 gap-2 text-center text-[11px] pt-1">
                    <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800">
                      <span className="text-slate-400 block text-[10px]">إيراد محقق</span>
                      <span className="font-bold text-emerald-400 font-mono">{(rev || 0).toLocaleString()}</span>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800">
                      <span className="text-slate-400 block text-[10px]">مصروفات</span>
                      <span className="font-bold text-rose-400 font-mono">{(exp || 0).toLocaleString()}</span>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800">
                      <span className="text-slate-400 block text-[10px]">صافي الربح</span>
                      <span className="font-bold text-amber-400 font-mono">{(net || 0).toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Active Rental info */}
                  {activeContract && (
                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-2.5 text-xs text-slate-300 space-y-1">
                      <div className="flex items-center justify-between font-semibold text-amber-300">
                        <span>مستأجرة حتى: {activeContract.endDate}</span>
                        <span className="font-mono font-bold">{((activeContract.rentalAmount ?? activeContract.totalRentAmount) || 0).toLocaleString()} ج.م</span>
                      </div>
                      <p className="text-slate-400 truncate">
                        العميل: {activeContract.customerSnapshot?.fullName || activeContract.secondPartyRepresentative || 'العميل'}
                      </p>
                    </div>
                  )}

                </div>
              </div>

              {/* Bottom Actions */}
              <div className="p-5 pt-0 flex items-center gap-2">
                {car.status === 'available' ? (
                  <button
                    onClick={() => onOpenNewContractForCar(car)}
                    className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition-all"
                  >
                    <FileText className="w-4 h-4" />
                    <span>تحرير عقد إيجار</span>
                  </button>
                ) : (
                  <button
                    onClick={() => onOpenOdometerModal(car)}
                    className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-2 transition-colors"
                  >
                    <Gauge className="w-4 h-4 text-amber-400" />
                    <span>تحديث العداد والصيانة</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    const isConfirmed = window.confirm(
                      `هل أنت متأكد من حذف سيارة "${car.name}" (لوحة: ${car.plateNumber}) من الأسطول نهائياً؟`
                    );
                    if (isConfirmed) {
                      deleteCar(car.id);
                    }
                  }}
                  className="p-2.5 rounded-xl bg-slate-800 hover:bg-rose-950/80 text-slate-400 hover:text-rose-400 border border-slate-700 hover:border-rose-500/40 transition-colors"
                  title="حذف السيارة نهائياً من الأسطول"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

            </div>
          );
        })}
      </div>
      )}

    </div>
  );
};
