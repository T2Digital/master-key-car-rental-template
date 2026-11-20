import React, { useState } from 'react';
import { 
  X, 
  Gauge, 
  Car, 
  Wrench, 
  Calendar 
} from 'lucide-react';
import { Car as CarType } from '../../types';
import { useApp } from '../../context/AppContext';

interface UpdateOdometerModalProps {
  isOpen: boolean;
  onClose: () => void;
  car: CarType | null;
}

export const UpdateOdometerModal: React.FC<UpdateOdometerModalProps> = ({
  isOpen,
  onClose,
  car,
}) => {
  const { updateCarOdometer } = useApp();

  const [newMileage, setNewMileage] = useState<number>(car?.currentMileage || 0);
  const [notes, setNotes] = useState<string>('');

  if (!isOpen || !car) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateCarOdometer(car.id, newMileage, notes);
    onClose();
  };

  const kmDifference = newMileage - car.currentMileage;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-900 border border-amber-500/30 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden">
        
        <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Gauge className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-white font-['Cairo',sans-serif]">
                تحديث عداد السيارة
              </h2>
              <p className="text-xs text-slate-400">
                {car.name} ({car.plateNumber})
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
          
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
            <span className="text-slate-400">قراءة العداد الحالية:</span>
            <span className="font-mono font-bold text-white text-sm">{car.currentMileage.toLocaleString()} كم</span>
          </div>

          <div>
            <label className="text-slate-400 block mb-1">القراءة الجديدة للعداد (كم) *</label>
            <input
              type="number"
              value={newMileage}
              onChange={(e) => setNewMileage(Number(e.target.value))}
              className="w-full bg-slate-950 border border-amber-500/50 rounded-xl p-2.5 text-amber-300 font-mono font-bold text-base"
              required
            />
            {kmDifference > 0 && (
              <span className="text-[11px] text-emerald-400 block mt-1">
                + زيادة بمقدار {kmDifference.toLocaleString()} كم
              </span>
            )}
          </div>

          <div>
            <label className="text-slate-400 block mb-1">سبب التحديث / ملاحظات الصيانة</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="مثال: فحص دوري / استلام من الصيانة / غيار زيت"
              rows={3}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white resize-none"
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
              حفظ وتحديث
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
