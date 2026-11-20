import React, { useState } from 'react';
import { 
  X, 
  Car, 
  Gauge, 
  DollarSign, 
  Calendar, 
  ShieldCheck, 
  Radio 
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface NewCarModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NewCarModal: React.FC<NewCarModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { addCar, company } = useApp();

  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [modelYear, setModelYear] = useState('2024');
  const [color, setColor] = useState('');
  const [plateNumber, setPlateNumber] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [trafficUnit, setTrafficUnit] = useState('مرور 6 أكتوبر');
  const [chassisNumber, setChassisNumber] = useState('');
  const [motorNumber, setMotorNumber] = useState('');
  const [currentMileage, setCurrentMileage] = useState<number>(0);
  const [dailyRate, setDailyRate] = useState<number>(1000);
  const [monthlyRate, setMonthlyRate] = useState<number>(25000);
  const [excessKmRate, setExcessKmRate] = useState<number>(5);
  const [monthlyInstallment, setMonthlyInstallment] = useState<number>(0);
  const [hasGps, setHasGps] = useState<boolean>(true);
  const [imageUrl, setImageUrl] = useState('https://images.unsplash.com/photo-1549399542-7e3f8b79c341?q=80&w=800&auto=format&fit=crop');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !plateNumber) return;

    addCar({
      name,
      brand: brand || name.split(' ')[0],
      modelYear,
      color,
      plateNumber,
      trafficUnit,
      chassisNumber: chassisNumber || 'CHK' + Math.floor(Math.random() * 900000 + 100000),
      motorNumber: motorNumber || 'MTR' + Math.floor(Math.random() * 900000 + 100000),
      ownerName: ownerName.trim() || 'اسم المالك بالرخصة',
      status: 'available',
      currentMileage,
      allowedDailyKm: 120,
      excessKmRate,
      dailyRate,
      monthlyRate,
      monthlyInstallment: monthlyInstallment > 0 ? monthlyInstallment : undefined,
      installmentDueDay: monthlyInstallment > 0 ? 15 : undefined,
      imageUrl,
      equipment: {
        hasGps,
        hasMats: true,
        tireCondition: 'ممتازة',
      },
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-900 border border-amber-500/30 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden my-8">
        
        <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Car className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white font-['Cairo',sans-serif]">
                إضافة سيارة جديدة لأسطول ماستر كي
              </h2>
              <p className="text-xs text-slate-400">
                تسجيل المواصفات الفنية وبنود العقد وأسعار الإيجار
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs max-h-[80vh] overflow-y-auto">
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="text-slate-400 block mb-1">اسم وموديل السيارة *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="مثال: هيونداي إلنترا CN7"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white"
                required
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1">سنة الصنع (الموديل)</label>
              <input
                type="text"
                value={modelYear}
                onChange={(e) => setModelYear(e.target.value)}
                placeholder="2024"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white font-mono"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1">رقم اللوحات المعدنية *</label>
              <input
                type="text"
                value={plateNumber}
                onChange={(e) => setPlateNumber(e.target.value)}
                placeholder="مثال: ق ن ل 825"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white font-bold"
                required
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1">اللون</label>
              <input
                type="text"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                placeholder="مثال: فضي ميتالك"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1">وحدة المرور التابعة</label>
              <input
                type="text"
                value={trafficUnit}
                onChange={(e) => setTrafficUnit(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white"
              />
            </div>

            <div className="sm:col-span-3">
              <label className="text-amber-400 font-bold block mb-1">اسم مالك السيارة (الموجود بالرخصة) *</label>
              <input
                type="text"
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                placeholder="اكتب اسم المالك الموجود في رخصة السيارة (وليس ماستر كي تلقائياً)"
                className="w-full bg-slate-950 border border-amber-500/40 rounded-xl p-2.5 text-white font-semibold"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-slate-400 block mb-1">رقم الشاسية</label>
              <input
                type="text"
                value={chassisNumber}
                onChange={(e) => setChassisNumber(e.target.value)}
                placeholder="رقم الشاسية كما بالرخصة"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white font-mono"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1">رقم الماتور</label>
              <input
                type="text"
                value={motorNumber}
                onChange={(e) => setMotorNumber(e.target.value)}
                placeholder="رقم الماتور كما بالرخصة"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white font-mono"
              />
            </div>
          </div>

          {/* Odometer and Rates */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800">
            <div>
              <label className="text-slate-400 block mb-1">قراءة العداد الحالية (كم) *</label>
              <input
                type="number"
                value={currentMileage}
                onChange={(e) => setCurrentMileage(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white font-mono font-bold"
                required
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1">سعر الإيجار الشهري (ج.م) *</label>
              <input
                type="number"
                value={monthlyRate}
                onChange={(e) => setMonthlyRate(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-amber-300 font-mono font-bold"
                required
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1">سعر اليوم (ج.م)</label>
              <input
                type="number"
                value={dailyRate}
                onChange={(e) => setDailyRate(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white font-mono font-bold"
              />
            </div>
          </div>

          {/* Installment and Equipment */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-slate-400 block mb-1">القسط الشهري إن وجد (ج.م)</label>
              <input
                type="number"
                value={monthlyInstallment}
                onChange={(e) => setMonthlyInstallment(Number(e.target.value))}
                placeholder="0"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-rose-300 font-mono"
              />
            </div>

            <div className="flex items-center gap-3 pt-6">
              <label className="flex items-center gap-2 cursor-pointer text-slate-200">
                <input
                  type="checkbox"
                  checked={hasGps}
                  onChange={(e) => setHasGps(e.target.checked)}
                  className="w-4 h-4 rounded text-amber-500 bg-slate-900 border-slate-700"
                />
                <span>مجهزة بجهاز تتبع GPS</span>
              </label>
            </div>
          </div>

          <div>
            <label className="text-slate-400 block mb-1">رابط صورة السيارة (URL)</label>
            <input
              type="text"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2 text-white font-mono text-[11px]"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shadow"
            >
              إضافة السيارة للأسطول
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
