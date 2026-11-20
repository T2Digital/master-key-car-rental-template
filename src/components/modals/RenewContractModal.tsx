import React, { useState } from 'react';
import { 
  X, 
  RotateCcw, 
  Calendar, 
  DollarSign, 
  Car, 
  User 
} from 'lucide-react';
import { Contract } from '../../types';
import { useApp } from '../../context/AppContext';

interface RenewContractModalProps {
  isOpen: boolean;
  onClose: () => void;
  contract: Contract | null;
}

export const RenewContractModal: React.FC<RenewContractModalProps> = ({
  isOpen,
  onClose,
  contract,
}) => {
  const { renewContract } = useApp();

  const [newEndDate, setNewEndDate] = useState(() => {
    if (!contract) return '';
    const d = new Date(contract.endDate);
    d.setDate(d.getDate() + 30);
    return d.toISOString().split('T')[0];
  });
  const [additionalDays, setAdditionalDays] = useState<number>(30);
  const [renewalAmount, setRenewalAmount] = useState<number>(contract?.rentalAmount || 25000);

  if (!isOpen || !contract) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    renewContract(contract.id, {
      newEndDate,
      additionalDays,
      renewalAmount,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-900 border border-amber-500/30 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden my-8">
        
        {/* Modal Header */}
        <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white font-['Cairo',sans-serif]">
                تجديد عقد الإيجار لفترة إضافية
              </h2>
              <p className="text-xs text-slate-400">
                رقم العقد الحالي: <span className="font-mono text-amber-400 font-bold">{contract.contractNumber}</span>
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
          
          {/* Summary Box */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 space-y-2 text-slate-300">
            <div className="flex justify-between">
              <span className="text-slate-400">العميل:</span>
              <span className="font-bold text-white">{contract.customerSnapshot?.fullName || contract.secondPartyRepresentative || 'العميل'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">السيارة:</span>
              <span className="font-bold text-amber-400">{contract.carSnapshot?.name || 'السيارة'} ({contract.carSnapshot?.plateNumber || ''})</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">تاريخ انتهاء العقد الحالي:</span>
              <span className="font-mono font-bold text-slate-200">{contract.endDate}</span>
            </div>
          </div>

          {/* New Period Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-slate-400 block mb-1">تاريخ الانتهاء الجديد *</label>
              <input
                type="date"
                value={newEndDate}
                onChange={(e) => setNewEndDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white"
                required
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1">المدة الإضافية (بالأيام)</label>
              <input
                type="number"
                value={additionalDays}
                onChange={(e) => setAdditionalDays(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white font-mono font-bold"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-slate-400 block mb-1">قيمة التجديد المحصلة (ج.م) *</label>
            <input
              type="number"
              value={renewalAmount}
              onChange={(e) => setRenewalAmount(Number(e.target.value))}
              className="w-full bg-slate-950 border border-amber-500/50 rounded-xl p-2.5 text-amber-300 font-mono font-bold text-base"
              required
            />
            <p className="text-[11px] text-slate-400 mt-1">
              سيتم تسجيل هذا المبلغ تلقائياً في شيت الحسابات (إيراد تجديد إيجار).
            </p>
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
              className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm shadow-xl shadow-amber-500/20 transition-all"
            >
              تأكيد التجديد وتحديث البيانات
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
