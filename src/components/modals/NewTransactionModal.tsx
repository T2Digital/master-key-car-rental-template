import React, { useState } from 'react';
import { 
  X, 
  PlusCircle, 
  DollarSign, 
  Calendar, 
  TrendingUp, 
  TrendingDown, 
  Car,
  Table2
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { SheetCategory } from '../../types';

interface NewTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NewTransactionModal: React.FC<NewTransactionModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { addSheetRow, cars } = useApp();

  const [entryType, setEntryType] = useState<'revenue' | 'expense' | 'both'>('expense');
  const [revenue, setRevenue] = useState<string>('');
  const [revenueReason, setRevenueReason] = useState<string>('');
  const [expense, setExpense] = useState<string>('');
  const [expenseReason, setExpenseReason] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [selectedCarId, setSelectedCarId] = useState<string>('');
  const [category, setCategory] = useState<SheetCategory>('maintenance');
  const [notes, setNotes] = useState<string>('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const revNum = revenue ? Number(revenue) : null;
    const expNum = expense ? Number(expense) : null;

    if (!revNum && !expNum) return;

    addSheetRow({
      revenue: revNum,
      revenueReason: revenueReason || '',
      expense: expNum,
      expenseReason: expenseReason || '',
      date,
      carId: selectedCarId || undefined,
      category,
      notes: notes || undefined,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-900 border border-blue-500/30 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
              <Table2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-white font-['Cairo',sans-serif]">
                إضافة سطر قيد جديد لشيت الحسابات
              </h2>
              <p className="text-xs text-slate-400">
                تسجيل إيراد أو مصروف جديد مطابق لأعمدة شيت جوجل
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

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          
          {/* Entry Type Toggle */}
          <div className="grid grid-cols-3 gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => setEntryType('expense')}
              className={`py-2 rounded-lg font-bold transition-all flex items-center justify-center gap-1.5 ${
                entryType === 'expense' ? 'bg-rose-600 text-white' : 'text-slate-400'
              }`}
            >
              <TrendingDown className="w-3.5 h-3.5" />
              <span>مصروف / قسط</span>
            </button>

            <button
              type="button"
              onClick={() => setEntryType('revenue')}
              className={`py-2 rounded-lg font-bold transition-all flex items-center justify-center gap-1.5 ${
                entryType === 'revenue' ? 'bg-emerald-600 text-white' : 'text-slate-400'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>إيراد تأجير</span>
            </button>

            <button
              type="button"
              onClick={() => setEntryType('both')}
              className={`py-2 rounded-lg font-bold transition-all flex items-center justify-center gap-1.5 ${
                entryType === 'both' ? 'bg-amber-500 text-slate-950' : 'text-slate-400'
              }`}
            >
              <span>قيد مزدوج</span>
            </button>
          </div>

          {/* Revenue Inputs */}
          {(entryType === 'revenue' || entryType === 'both') && (
            <div className="bg-slate-950/70 border border-emerald-500/30 rounded-2xl p-3.5 space-y-2.5">
              <span className="text-emerald-400 font-bold block text-xs">بيانات الإيراد (عمود 1 + السبب)</span>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-400 block mb-1">المبلغ المحصل (ج.م) *</label>
                  <input
                    type="number"
                    value={revenue}
                    onChange={(e) => setRevenue(e.target.value)}
                    placeholder="مثال: 25000"
                    className="w-full bg-slate-900 border border-emerald-500/50 rounded-xl p-2.5 text-emerald-300 font-mono font-bold"
                    required={entryType === 'revenue'}
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">بيان وسبب الإيراد *</label>
                  <input
                    type="text"
                    value={revenueReason}
                    onChange={(e) => setRevenueReason(e.target.value)}
                    placeholder="مثال: ايجار النترا شهر"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white"
                    required={entryType === 'revenue'}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Expense Inputs */}
          {(entryType === 'expense' || entryType === 'both') && (
            <div className="bg-slate-950/70 border border-rose-500/30 rounded-2xl p-3.5 space-y-2.5">
              <span className="text-rose-400 font-bold block text-xs">بيانات المصروف (المصروفات + السبب 2)</span>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-400 block mb-1">المبلغ المصروف (ج.م) *</label>
                  <input
                    type="number"
                    value={expense}
                    onChange={(e) => setExpense(e.target.value)}
                    placeholder="مثال: 10000"
                    className="w-full bg-slate-900 border border-rose-500/50 rounded-xl p-2.5 text-rose-300 font-mono font-bold"
                    required={entryType === 'expense'}
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">بيان وسبب المصروف *</label>
                  <input
                    type="text"
                    value={expenseReason}
                    onChange={(e) => setExpenseReason(e.target.value)}
                    placeholder="مثال: قسط اوبترا كحلي / صيانة زيت"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white"
                    required={entryType === 'expense'}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Metadata: Date, Car, Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-slate-400 block mb-1">التاريخ *</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white"
                required
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1">التصنيف</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as SheetCategory)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white"
              >
                <option value="installment">قسط سيارة شهري</option>
                <option value="rental_income">إيراد إيجار</option>
                <option value="maintenance">صيانة وغيار زيوت</option>
                <option value="gps_accessory">كروت GPS ودواسات وإكسسوار</option>
                <option value="bodywork_plates">سمكرة ومصفحة ولوحات</option>
                <option value="other">أخرى</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-slate-400 block mb-1">ربط بسيارة محددة (اختياري)</label>
            <select
              value={selectedCarId}
              onChange={(e) => setSelectedCarId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white"
            >
              <option value="">بدون ربط بسيارة محددة (مصروف عام)</option>
              {cars.map(c => (
                <option key={c.id} value={c.id}>{c.name} - {c.plateNumber}</option>
              ))}
            </select>
          </div>

          {/* Actions */}
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
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-lg shadow-blue-600/20"
            >
              إضافة القيد للشيت
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
