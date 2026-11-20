import React, { useState } from 'react';
import { 
  X, 
  CheckCircle2, 
  Gauge, 
  Calendar, 
  DollarSign, 
  Fuel, 
  AlertCircle,
  Car,
  User
} from 'lucide-react';
import { Contract } from '../../types';
import { useApp } from '../../context/AppContext';

interface CloseContractModalProps {
  isOpen: boolean;
  onClose: () => void;
  contract: Contract | null;
}

export const CloseContractModal: React.FC<CloseContractModalProps> = ({
  isOpen,
  onClose,
  contract,
}) => {
  const { closeContract } = useApp();

  const [returnDate, setReturnDate] = useState(new Date().toISOString().split('T')[0]);
  const [returnMileage, setReturnMileage] = useState<number>(contract ? contract.initialMileage + 3600 : 0);
  const [fuelIn, setFuelIn] = useState<string>('ممتلئ (Full)');
  const [extraCharges, setExtraCharges] = useState<number>(0);
  const [extraReason, setExtraReason] = useState<string>('');

  if (!isOpen || !contract) return null;

  // Real-time calculations
  const drivenKm = Math.max(0, returnMileage - contract.initialMileage);
  const allowedKm = contract.durationDays * (contract.allowedDailyKm || 120);
  const excessKm = Math.max(0, drivenKm - allowedKm);
  const excessKmCost = excessKm * (contract.excessKmRate || 5);
  const totalAdditionalAmount = excessKmCost + extraCharges;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    closeContract(contract.id, {
      returnDate,
      returnMileage,
      fuelIn,
      extraCharges: totalAdditionalAmount,
      extraChargesReason: extraReason || (excessKm > 0 ? `كيلومترات زائدة ${excessKm} كم` : undefined),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-900 border border-emerald-500/30 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden my-8">
        
        {/* Modal Header */}
        <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white font-['Cairo',sans-serif]">
                إغلاق العقد واستلام السيارة وتحديث العداد
              </h2>
              <p className="text-xs text-slate-400">
                رقم العقد: <span className="font-mono text-amber-400 font-bold">{contract.contractNumber}</span>
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

        <form onSubmit={handleSubmit} className="p-6 space-y-5 text-xs">
          
          {/* Summary of Contract */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 grid grid-cols-2 gap-3 text-slate-300">
            <div>
              <span className="text-slate-400 block text-[11px]">العميل:</span>
              <span className="font-bold text-white text-sm">{contract.customerSnapshot?.fullName || contract.secondPartyRepresentative || 'العميل'}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">السيارة:</span>
              <span className="font-bold text-amber-400 text-sm">{contract.carSnapshot?.name || 'السيارة'} ({contract.carSnapshot?.plateNumber || ''})</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">فترة العقد:</span>
              <span className="font-mono">{contract.durationDays ?? contract.rentalPeriodDays ?? 30} يوم (من {contract.startDate} إلى {contract.endDate})</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">عداد الخروج:</span>
              <span className="font-mono font-bold text-slate-200">{(contract.initialMileage || 0).toLocaleString()} كم</span>
            </div>
          </div>

          {/* Odometer and Return Date */}
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-slate-400 block mb-1">تاريخ الاستلام الفعلي *</label>
                <input
                  type="date"
                  value={returnDate}
                  onChange={(e) => setReturnDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white"
                  required
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">قراءة عداد الدخول (كم) *</label>
                <input
                  type="number"
                  value={returnMileage}
                  onChange={(e) => setReturnMileage(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-emerald-500/50 rounded-xl p-2.5 text-white font-mono font-bold text-base"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-slate-400 block mb-1">حالة ومستوى الوقود عند الدخول</label>
              <select
                value={fuelIn}
                onChange={(e) => setFuelIn(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white"
              >
                <option value="ممتلئ (Full)">ممتلئ (Full)</option>
                <option value="3/4 خزان">3/4 خزان</option>
                <option value="1/2 خزان">1/2 خزان</option>
                <option value="1/4 خزان">1/4 خزان</option>
                <option value="فارغ (Empty)">فارغ (Empty)</option>
              </select>
            </div>
          </div>

          {/* Mileage Calculation Results */}
          <div className="bg-slate-950/80 border border-amber-500/30 rounded-2xl p-4 space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-400">المسافة المقطوعة الفعلية:</span>
              <span className="font-bold text-white font-mono">{drivenKm.toLocaleString()} كم</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">الحد الأقصى المسموح ({contract.durationDays} يوم × 120 كم):</span>
              <span className="font-bold text-amber-400 font-mono">{allowedKm.toLocaleString()} كم</span>
            </div>
            
            <div className={`flex justify-between items-center p-2 rounded-xl border ${
              excessKm > 0 ? 'bg-rose-950/30 border-rose-500/40 text-rose-300' : 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300'
            }`}>
              <span>الكيلومترات الزائدة:</span>
              <span className="font-bold font-mono">
                {excessKm > 0 ? `+${excessKm.toLocaleString()} كم (${excessKmCost.toLocaleString()} ج.م)` : '0 كم (لا توجد غرامة)'}
              </span>
            </div>
          </div>

          {/* Additional Charges / Damages */}
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-slate-400 block mb-1">مصروفات / غرامات إضافية (ج.م)</label>
                <input
                  type="number"
                  value={extraCharges}
                  onChange={(e) => setExtraCharges(Number(e.target.value))}
                  placeholder="0"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white font-mono"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">سبب المصروف الإضافي أو التلفيات</label>
                <input
                  type="text"
                  value={extraReason}
                  onChange={(e) => setExtraReason(e.target.value)}
                  placeholder="مثال: غسيل سيارة / فرق وقود / مخالفة رادار"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white"
                />
              </div>
            </div>
          </div>

          {/* Total Settlement */}
          <div className="bg-gradient-to-r from-slate-950 to-emerald-950/30 border border-emerald-500/40 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <span className="text-xs text-emerald-300 block">إجمالي المبلغ المحصل عند الإغلاق</span>
              <span className="text-xl font-black text-emerald-400 font-mono">
                {totalAdditionalAmount.toLocaleString()} ج.م
              </span>
            </div>
            <span className="text-[11px] text-slate-400 max-w-[200px] text-left">
              سيتم تحويل السيارة إلى "متاحة" وتحديث العداد تلقائياً وإدراج القيد في الشيت.
            </span>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-xl shadow-emerald-600/25 transition-all"
            >
              تأكيد الاستلام وإغلاق العقد
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
