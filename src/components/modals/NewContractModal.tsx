import React, { useState, useEffect } from 'react';
import { 
  X, 
  FileText, 
  Car, 
  User, 
  Calendar, 
  DollarSign, 
  Gauge, 
  ShieldCheck, 
  PlusCircle, 
  CheckCircle2, 
  Clock 
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useApp } from '../../context/AppContext';
import { Car as CarType, Customer } from '../../types';

interface NewContractModalProps {
  isOpen: boolean;
  onClose: () => void;
  preSelectedCar?: CarType | null;
  preSelectedCustomer?: Customer | null;
}

export const NewContractModal: React.FC<NewContractModalProps> = ({
  isOpen,
  onClose,
  preSelectedCar,
  preSelectedCustomer,
}) => {
  const { cars, customers, createContract, company, addCustomer } = useApp();

  const [selectedCarId, setSelectedCarId] = useState<string>(preSelectedCar?.id || (cars.length > 0 ? cars[0]?.id : ''));
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(preSelectedCustomer?.id || 'new');

  // Customer form fields
  const [fullName, setFullName] = useState(preSelectedCustomer?.fullName || '');
  const [nationalId, setNationalId] = useState(preSelectedCustomer?.nationalId || '');
  const [nationality, setNationality] = useState(preSelectedCustomer?.nationality || 'مصري');
  const [address, setAddress] = useState(preSelectedCustomer?.address || '');
  const [job, setJob] = useState(preSelectedCustomer?.job || '');
  const [licenseNumber, setLicenseNumber] = useState(preSelectedCustomer?.licenseNumber || '');
  const [phone, setPhone] = useState(preSelectedCustomer?.phone || '');

  // Dates & Details
  const [contractDayName, setContractDayName] = useState(() => {
    const days = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
    return days[new Date().getDay()];
  });
  const [contractDate, setContractDate] = useState(new Date().toISOString().split('T')[0]);
  const [contractTime, setContractTime] = useState('12:00 م');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().split('T')[0];
  });
  const [rentalType, setRentalType] = useState<'monthly' | 'daily' | 'custom'>('monthly');
  const [rentalAmount, setRentalAmount] = useState<number>(25000);
  const [depositAmount, setDepositAmount] = useState<number>(5000);
  const [paidAmount, setPaidAmount] = useState<number>(25000);
  const [initialMileage, setInitialMileage] = useState<number>(0);
  const [excessKmRate, setExcessKmRate] = useState<number>(5);
  const [fuelOut, setFuelOut] = useState<string>('ممتلئ (Full)');
  const [generalNotes, setGeneralNotes] = useState<string>('');
  const [carOwnerName, setCarOwnerName] = useState<string>('');

  useEffect(() => {
    if (preSelectedCar) {
      setSelectedCarId(preSelectedCar.id);
    } else if (cars.length > 0 && (!selectedCarId || !cars.some(c => c.id === selectedCarId))) {
      setSelectedCarId(cars[0].id);
    }
  }, [cars, preSelectedCar, selectedCarId]);

  const selectedCar = cars.find(c => c.id === selectedCarId) || (cars.length > 0 ? cars[0] : null);

  // Sync selected car defaults
  useEffect(() => {
    if (selectedCar) {
      setInitialMileage(selectedCar.currentMileage);
      setExcessKmRate(selectedCar.excessKmRate || 5);
      setCarOwnerName(selectedCar.ownerName || '');
      if (rentalType === 'monthly') {
        setRentalAmount(selectedCar.monthlyRate || 25000);
        setPaidAmount(selectedCar.monthlyRate || 25000);
      } else {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const diffDays = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
        setRentalAmount(diffDays * selectedCar.dailyRate);
        setPaidAmount(diffDays * selectedCar.dailyRate);
      }
    }
  }, [selectedCarId, selectedCar, rentalType, startDate, endDate]);

  // Sync customer selection
  useEffect(() => {
    if (selectedCustomerId !== 'new') {
      const cust = customers.find(c => c.id === selectedCustomerId);
      if (cust) {
        setFullName(cust.fullName);
        setNationalId(cust.nationalId);
        setNationality(cust.nationality || 'مصري');
        setAddress(cust.address);
        setJob(cust.job);
        setLicenseNumber(cust.licenseNumber);
        setPhone(cust.phone);
      }
    } else if (!preSelectedCustomer) {
      setFullName('');
      setNationalId('');
      setAddress('');
      setJob('');
      setLicenseNumber('');
      setPhone('');
    }
  }, [selectedCustomerId, customers, preSelectedCustomer]);

  if (!isOpen) return null;

  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffDays = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCar) {
      alert('لا توجد سيارة محددة بالأسطول. يرجى إضافة سيارة إلى الأسطول أولاً');
      return;
    }
    if (!fullName) return;

    let customerId = selectedCustomerId;
    if (selectedCustomerId === 'new') {
      const newCust = addCustomer({
        fullName,
        nationalId,
        nationality,
        address,
        job,
        licenseNumber,
        phone,
        notes: 'تمت إضافته أثناء تحرير العقد',
      });
      customerId = newCust.id;
    }

    createContract({
      carId: selectedCar.id,
      customerId,
      customerSnapshot: {
        fullName,
        nationalId,
        nationality,
        address,
        job,
        licenseNumber,
        phone,
      },
      carSnapshot: {
        name: selectedCar.name,
        brand: selectedCar.brand,
        modelYear: selectedCar.modelYear,
        color: selectedCar.color,
        ownerName: carOwnerName.trim() || selectedCar.ownerName || 'اسم المالك بالرخصة',
        plateNumber: selectedCar.plateNumber,
        trafficUnit: selectedCar.trafficUnit,
        chassisNumber: selectedCar.chassisNumber,
        motorNumber: selectedCar.motorNumber,
      },
      contractDayName,
      contractDate,
      contractTime,
      startDate,
      endDate,
      durationDays: diffDays,
      durationType: rentalType,
      rentalAmount,
      depositAmount,
      paidAmount,
      paymentStatus: paidAmount >= rentalAmount ? 'paid' : paidAmount > 0 ? 'partial' : 'pending',
      allowedDailyKm: selectedCar.allowedDailyKm || 120,
      excessKmRate,
      initialMileage,
      fuelOut,
      status: 'active',
      generalNotes,
    });

    confetti({
      particleCount: 70,
      spread: 60,
      origin: { y: 0.6 }
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-900 border border-amber-500/30 rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden my-8">
        
        {/* Modal Header */}
        <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white font-['Cairo',sans-serif]">
                تحرير عقد إيجار رسمي جديد (Master Key KRM)
              </h2>
              <p className="text-xs text-slate-400">
                إصدار عقد إيجار مطابق للنموذج المعتمد مع حفظ بيانات العداد والشيت
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 text-xs max-h-[80vh] overflow-y-auto">
          
          {/* Section 1: Customer Selection & Data */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="font-bold text-white text-sm flex items-center gap-1.5 font-['Cairo',sans-serif]">
                <User className="w-4 h-4 text-amber-400" />
                <span>بيانات المستأجر (الطرف الثاني)</span>
              </h3>

              <div className="flex items-center gap-2">
                <select
                  value={selectedCustomerId}
                  onChange={(e) => setSelectedCustomerId(e.target.value)}
                  className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-slate-200 text-xs"
                >
                  <option value="new">+ إدخال عميل جديد</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>{c.fullName} - {c.phone}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <div>
                <label className="text-slate-400 block mb-1">الاسم بالكامل *</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="الاسم الرباعي"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white"
                  required
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">رقم البطاقة / جواز السفر *</label>
                <input
                  type="text"
                  value={nationalId}
                  onChange={(e) => setNationalId(e.target.value)}
                  placeholder="الرقم القومي (14 رقم)"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white font-mono"
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
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white font-mono"
                  required
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">الجنسية</label>
                <input
                  type="text"
                  value={nationality}
                  onChange={(e) => setNationality(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">الوظيفة</label>
                <input
                  type="text"
                  value={job}
                  onChange={(e) => setJob(e.target.value)}
                  placeholder="المهنة / جهة العمل"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">رقم الرخصة</label>
                <input
                  type="text"
                  value={licenseNumber}
                  onChange={(e) => setLicenseNumber(e.target.value)}
                  placeholder="رقم الرخصة / المرور"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white font-mono"
                />
              </div>

              <div className="sm:col-span-2 lg:col-span-3">
                <label className="text-slate-400 block mb-1">عنوان الإقامة</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="المدينة - الحي - الشارع - رقم العقار"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Car Selection & Specs */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="font-bold text-white text-sm flex items-center gap-1.5 font-['Cairo',sans-serif]">
                <Car className="w-4 h-4 text-amber-400" />
                <span>بيانات السيارة المأجرة</span>
              </h3>
            </div>

            {cars.length === 0 ? (
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 space-y-2 text-center">
                <p className="font-bold text-sm">⚠️ لا توجد أي سيارات مسجلة في الأسطول حالياً</p>
                <p className="text-slate-400 text-xs">
                  يرجى إضافة سيارة إلى الأسطول أولاً (من تبويب &quot;أسطول السيارات&quot;) لتتمكن من اختيارها وتوقيع العقد الرسمي لها.
                </p>
              </div>
            ) : (
              <>
                <div>
                  <label className="text-slate-400 block mb-1">اختر السيارة من الأسطول *</label>
                  <select
                    value={selectedCarId}
                    onChange={(e) => setSelectedCarId(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white font-bold"
                  >
                    {cars.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name} - لوحات: {c.plateNumber} (عداد: {c.currentMileage.toLocaleString()} كم)
                      </option>
                    ))}
                  </select>
                </div>

                {selectedCar && (
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-900/60 p-3 rounded-xl border border-slate-800 text-[11px] text-slate-300">
                      <div>
                        <span className="text-slate-400 block">الماركة والموديل:</span>
                        <span className="font-bold text-white">{selectedCar.brand} {selectedCar.modelYear}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">اللون واللوحات:</span>
                        <span className="font-bold text-amber-400">{selectedCar.color} ({selectedCar.plateNumber})</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">رقم الشاسية:</span>
                        <span className="font-mono text-slate-200">{selectedCar.chassisNumber}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">رقم الماتور:</span>
                        <span className="font-mono text-slate-200">{selectedCar.motorNumber}</span>
                      </div>
                    </div>

                    <div className="bg-slate-900/80 p-2.5 rounded-xl border border-amber-500/30">
                      <label className="text-amber-400 font-bold block mb-1 text-xs">
                        اسم مالك السيارة (المدون في رخصة المركبة للعقد) *
                      </label>
                      <input
                        type="text"
                        value={carOwnerName}
                        onChange={(e) => setCarOwnerName(e.target.value)}
                        placeholder="اكتب الاسم الموجود في الرخصة ليتم طباعته في بند (اسم المالك)"
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-white font-semibold text-xs"
                      />
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Section 3: Dates, Durations & Preamble */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 space-y-3">
            <h3 className="font-bold text-white text-sm flex items-center gap-1.5 font-['Cairo',sans-serif]">
              <Calendar className="w-4 h-4 text-amber-400" />
              <span>فترة العقد وتاريخ التحرير</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-slate-400 block mb-1">يوم التحرير</label>
                <input
                  type="text"
                  value={contractDayName}
                  onChange={(e) => setContractDayName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">تاريخ تحرير العقد</label>
                <input
                  type="date"
                  value={contractDate}
                  onChange={(e) => setContractDate(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">ساعة التحرير</label>
                <input
                  type="text"
                  value={contractTime}
                  onChange={(e) => setContractTime(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">تاريخ الاستلام (البداية)</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">تاريخ التسليم (النهاية)</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">نوع المدة</label>
                <select
                  value={rentalType}
                  onChange={(e) => setRentalType(e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white"
                >
                  <option value="monthly">إيجار شهر كامل</option>
                  <option value="daily">إيجار يومي</option>
                  <option value="custom">مخصص ({diffDays} يوم)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 4: Mileage & Rules */}
          <div className="bg-slate-950/70 border border-amber-500/30 rounded-2xl p-4 space-y-3">
            <h3 className="font-bold text-amber-400 text-sm flex items-center gap-1.5 font-['Cairo',sans-serif]">
              <Gauge className="w-4 h-4" />
              <span>العداد وبند الكيلومتر المسموح (120 كم/يوم)</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-slate-400 block mb-1">كيلو متر الخروج (الاستلام) *</label>
                <input
                  type="number"
                  value={initialMileage}
                  onChange={(e) => setInitialMileage(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white font-mono font-bold"
                  required
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">سعر كم فوق المسموح (ج.م)</label>
                <input
                  type="number"
                  value={excessKmRate}
                  onChange={(e) => setExcessKmRate(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white font-mono"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">مستوى الوقود عند الخروج</label>
                <select
                  value={fuelOut}
                  onChange={(e) => setFuelOut(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white"
                >
                  <option value="ممتلئ (Full)">ممتلئ (Full)</option>
                  <option value="3/4 خزان">3/4 خزان</option>
                  <option value="1/2 خزان">1/2 خزان</option>
                  <option value="1/4 خزان">1/4 خزان</option>
                </select>
              </div>
            </div>

            <p className="text-[11px] text-amber-300/90 font-medium">
              * إجمالي الكيلومتر المسموح خلال مدة العقد ({diffDays} يوم): <strong className="font-mono">{(diffDays * 120).toLocaleString()} كم</strong>
            </p>
          </div>

          {/* Section 5: Financials */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 space-y-3">
            <h3 className="font-bold text-white text-sm flex items-center gap-1.5 font-['Cairo',sans-serif]">
              <DollarSign className="w-4 h-4 text-emerald-400" />
              <span>الشق المالي والسداد</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-slate-400 block mb-1">القيمة الإيجارية المتفق عليها (ج.م) *</label>
                <input
                  type="number"
                  value={rentalAmount}
                  onChange={(e) => setRentalAmount(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white font-mono font-bold text-base"
                  required
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">مبلغ التأمين المسترد (ج.م)</label>
                <input
                  type="number"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white font-mono"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">المبلغ المدفوع مقدماً (ج.م) *</label>
                <input
                  type="number"
                  value={paidAmount}
                  onChange={(e) => setPaidAmount(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-emerald-500/50 rounded-xl p-2.5 text-emerald-300 font-mono font-bold text-base"
                  required
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={!selectedCar}
              className={`px-6 py-2.5 rounded-xl font-bold text-sm shadow-xl transition-all ${
                selectedCar
                  ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/20 hover:scale-105 cursor-pointer'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
              }`}
            >
              اعتماد وإنشاء العقد الرسمي ومزامنته مع الشيت
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
