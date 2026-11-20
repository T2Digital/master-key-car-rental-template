import React, { useState } from 'react';
import { 
  X, 
  User, 
  CreditCard, 
  Phone, 
  MapPin, 
  Briefcase, 
  ShieldCheck 
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface NewCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NewCustomerModal: React.FC<NewCustomerModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { addCustomer } = useApp();

  const [fullName, setFullName] = useState('');
  const [nationalId, setNationalId] = useState('');
  const [nationality, setNationality] = useState('مصري');
  const [address, setAddress] = useState('');
  const [job, setJob] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !nationalId || !phone) return;

    addCustomer({
      fullName,
      nationalId,
      nationality,
      address,
      job,
      licenseNumber,
      phone,
      notes,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-900 border border-amber-500/30 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden">
        
        <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-white font-['Cairo',sans-serif]">
                إضافة عميل جديد لقاعدة بيانات CRM
              </h2>
              <p className="text-xs text-slate-400">
                تسجيل بيانات الهوية ورخصة القيادة
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
          
          <div>
            <label className="text-slate-400 block mb-1">اسم العميل بالكامل *</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="الاسم الرباعي كما بالبطاقة"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-slate-400 block mb-1">الرقم القومي / جواز السفر *</label>
              <input
                type="text"
                value={nationalId}
                onChange={(e) => setNationalId(e.target.value)}
                placeholder="14 رقم"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white font-mono"
                required
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1">رقم الهاتف *</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="010xxxxxxxx"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white font-mono"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-slate-400 block mb-1">الجنسية</label>
              <input
                type="text"
                value={nationality}
                onChange={(e) => setNationality(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1">الوظيفة / جهة العمل</label>
              <input
                type="text"
                value={job}
                onChange={(e) => setJob(e.target.value)}
                placeholder="المهنة"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white"
              />
            </div>
          </div>

          <div>
            <label className="text-slate-400 block mb-1">رقم رخصة القيادة</label>
            <input
              type="text"
              value={licenseNumber}
              onChange={(e) => setLicenseNumber(e.target.value)}
              placeholder="رقم الرخصة"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white font-mono"
            />
          </div>

          <div>
            <label className="text-slate-400 block mb-1">محل الإقامة (العنوان)</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="العنوان التفصيلي"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white"
            />
          </div>

          <div>
            <label className="text-slate-400 block mb-1">ملاحظات إضافية</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
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
              حفظ العميل
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
