import React, { useState } from 'react';
import { 
  Calculator, 
  Gauge, 
  Calendar, 
  DollarSign, 
  Fuel, 
  ShieldCheck, 
  Car, 
  HelpCircle,
  Sparkles
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const RentalCalculator: React.FC = () => {
  const { cars } = useApp();
  
  const [selectedCarId, setSelectedCarId] = useState<string>(cars[0]?.id || '');
  const [days, setDays] = useState<number>(30);
  const [initialKm, setInitialKm] = useState<number>(90000);
  const [returnKm, setReturnKm] = useState<number>(94500);
  const [excessRate, setExcessRate] = useState<number>(5);
  const [dailyRate, setDailyRate] = useState<number>(1000);
  const [monthlyRate, setMonthlyRate] = useState<number>(25000);
  const [isMonthly, setIsMonthly] = useState<boolean>(true);
  const [fuelDiffCost, setFuelDiffCost] = useState<number>(0);
  const [extraFines, setExtraFines] = useState<number>(0);

  const selectedCar = cars.find(c => c.id === selectedCarId);

  // Sync rates when car changes
  const handleCarChange = (carId: string) => {
    setSelectedCarId(carId);
    const car = cars.find(c => c.id === carId);
    if (car) {
      setDailyRate(car.dailyRate);
      setMonthlyRate(car.monthlyRate);
      setExcessRate(car.excessKmRate);
      setInitialKm(car.currentMileage);
      setReturnKm(car.currentMileage + 3600);
    }
  };

  // Calculations
  const allowedKmTotal = days * 120;
  const actualDrivenKm = Math.max(0, returnKm - initialKm);
  const excessKm = Math.max(0, actualDrivenKm - allowedKmTotal);
  const excessKmCost = excessKm * excessRate;
  
  const baseRentalCost = isMonthly 
    ? Math.round((monthlyRate / 30) * days) 
    : days * dailyRate;

  const totalCalculated = baseRentalCost + excessKmCost + fuelDiffCost + extraFines;

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      
      {/* Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Calculator className="w-6 h-6 text-amber-400" />
            <h1 className="text-2xl font-black text-white font-['Cairo',sans-serif]">
              حاسبة الإيجار والكيلومترات الزائدة (120 كم/يوم)
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400">
            أداة فورية لحساب تكاليف الإيجار، وتطبيق بند الـ 120 كم/يوم المعتمد في عقود ماستر كي مع فروق الوقود والغرامات.
          </p>
        </div>

        <div className="px-4 py-2 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 font-bold text-xs text-center">
          قاعدة العقد: 120 كم لكل 24 ساعة
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Controls Column (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5 text-xs">
          
          {/* Car Picker */}
          <div>
            <label className="text-slate-400 block mb-1 font-semibold">اختر السيارة من الأسطول</label>
            <select
              value={selectedCarId}
              onChange={(e) => handleCarChange(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white font-bold"
            >
              {cars.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name} - {c.plateNumber} (سعر شهر: {c.monthlyRate.toLocaleString()} ج / يوم: {c.dailyRate.toLocaleString()} ج)
                </option>
              ))}
            </select>
          </div>

          {/* Pricing Model & Days */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-400 block mb-1">مدة الإيجار (بالأيام)</label>
              <input
                type="number"
                value={days}
                onChange={(e) => setDays(Math.max(1, Number(e.target.value)))}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white font-mono font-bold text-base"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1">نظام الحساب</label>
              <div className="grid grid-cols-2 gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsMonthly(true)}
                  className={`py-1.5 rounded-lg font-bold transition-all ${isMonthly ? 'bg-amber-500 text-slate-950' : 'text-slate-400'}`}
                >
                  شهري
                </button>
                <button
                  type="button"
                  onClick={() => setIsMonthly(false)}
                  className={`py-1.5 rounded-lg font-bold transition-all ${!isMonthly ? 'bg-amber-500 text-slate-950' : 'text-slate-400'}`}
                >
                  يومي
                </button>
              </div>
            </div>
          </div>

          {/* Odometer Inputs */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 space-y-3">
            <h3 className="font-bold text-slate-200 flex items-center gap-1.5">
              <Gauge className="w-4 h-4 text-amber-400" />
              <span>قراءات العداد (كم)</span>
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-400 block mb-1">كيلو متر الخروج (البداية)</label>
                <input
                  type="number"
                  value={initialKm}
                  onChange={(e) => setInitialKm(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white font-mono font-bold"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">كيلو متر الدخول (الاستلام)</label>
                <input
                  type="number"
                  value={returnKm}
                  onChange={(e) => setReturnKm(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white font-mono font-bold"
                />
              </div>
            </div>

            <div>
              <label className="text-slate-400 block mb-1">سعر الكيلومتر الزائد (ج.م / كم)</label>
              <input
                type="number"
                value={excessRate}
                onChange={(e) => setExcessRate(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2 text-white font-mono"
              />
            </div>
          </div>

          {/* Extra items (Fuel & Fines) */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-400 block mb-1">فروق نقص الوقود (ج.م)</label>
              <input
                type="number"
                value={fuelDiffCost}
                onChange={(e) => setFuelDiffCost(Number(e.target.value))}
                placeholder="0"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white font-mono"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1">غرامات أو مخالفات إضافية (ج.م)</label>
              <input
                type="number"
                value={extraFines}
                onChange={(e) => setExtraFines(Number(e.target.value))}
                placeholder="0"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white font-mono"
              />
            </div>
          </div>

        </div>

        {/* Results Card (5 cols) */}
        <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 to-amber-950/40 border-2 border-amber-500/40 rounded-3xl p-6 shadow-2xl space-y-5 text-xs flex flex-col justify-between">
          
          <div className="space-y-4">
            <div className="border-b border-amber-500/20 pb-3">
              <h2 className="text-lg font-black text-white font-['Cairo',sans-serif]">
                التقرير المالي والتسوية
              </h2>
              <p className="text-xs text-amber-300/80">
                حساب دقيق لكافة البنود حسب الشروط المعتمدة
              </p>
            </div>

            {/* Breakdown List */}
            <div className="space-y-2.5 text-slate-300">
              
              <div className="flex justify-between items-center bg-slate-950/40 p-2.5 rounded-xl border border-slate-800">
                <span>القيمة الإيجارية الأساسية ({days} يوم):</span>
                <span className="font-bold text-white font-mono text-sm">{baseRentalCost.toLocaleString()} ج.م</span>
              </div>

              <div className="flex justify-between items-center bg-slate-950/40 p-2.5 rounded-xl border border-slate-800">
                <span>المسافة المقطوعة الفعلية:</span>
                <span className="font-bold text-slate-200 font-mono">{actualDrivenKm.toLocaleString()} كم</span>
              </div>

              <div className="flex justify-between items-center bg-slate-950/40 p-2.5 rounded-xl border border-slate-800">
                <span>الكيلومتر المسموح به ({days} × 120 كم):</span>
                <span className="font-bold text-amber-400 font-mono">{allowedKmTotal.toLocaleString()} كم</span>
              </div>

              <div className={`flex justify-between items-center p-2.5 rounded-xl border ${
                excessKm > 0 ? 'bg-rose-950/30 border-rose-500/40 text-rose-200' : 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300'
              }`}>
                <span>الكيلومترات الزائدة فوق المسموح:</span>
                <span className="font-bold font-mono">
                  {excessKm > 0 ? `+${excessKm.toLocaleString()} كم (${excessKmCost.toLocaleString()} ج)` : 'ضمن الحد المسموح (0 كم)'}
                </span>
              </div>

              {fuelDiffCost > 0 && (
                <div className="flex justify-between items-center bg-slate-950/40 p-2.5 rounded-xl border border-slate-800">
                  <span>فروق الوقود:</span>
                  <span className="font-bold text-slate-200 font-mono">+{fuelDiffCost.toLocaleString()} ج.م</span>
                </div>
              )}

              {extraFines > 0 && (
                <div className="flex justify-between items-center bg-slate-950/40 p-2.5 rounded-xl border border-slate-800">
                  <span>غرامات / مخالفات:</span>
                  <span className="font-bold text-rose-400 font-mono">+{extraFines.toLocaleString()} ج.م</span>
                </div>
              )}

            </div>
          </div>

          {/* Grand Total Box */}
          <div className="bg-slate-950 p-4 rounded-2xl border border-amber-500/50 space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span className="font-bold text-sm text-white">إجمالي المبلغ المطلوب للتسوية:</span>
            </div>
            <div className="text-3xl font-black text-amber-400 font-mono">
              {totalCalculated.toLocaleString()} <span className="text-sm font-normal text-slate-300">جنيه مصري</span>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
