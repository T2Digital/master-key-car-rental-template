import React, { useState } from 'react';
import { 
  Sparkles, 
  Car as CarIcon, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  Phone, 
  ShieldCheck, 
  KeyRound, 
  Send, 
  ArrowRight,
  Gauge,
  FileCheck,
  UserCheck,
  AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useApp } from '../context/AppContext';
import { Car, BookingRequest } from '../types';

export const SmartBookingPortal: React.FC = () => {
  const { cars, bookings, submitBooking, updateBookingStatus, convertBookingToContract, company, setActiveTab } = useApp();
  
  // Tab within portal: Customer Booking View OR Admin Bookings Management
  const [portalMode, setPortalMode] = useState<'customer' | 'admin'>('customer');
  
  // Selected car for booking
  const [selectedCarId, setSelectedCarId] = useState<string>(cars[0]?.id || '');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerNationalId, setCustomerNationalId] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().split('T')[0];
  });
  const [rentalType, setRentalType] = useState<'monthly' | 'daily'>('monthly');
  const [notes, setNotes] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState(false);

  const selectedCar = cars.find(c => c.id === selectedCarId) || cars[0];

  // Calculate days & estimated cost
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.max(0, end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;

  const estimatedCost = rentalType === 'monthly'
    ? selectedCar?.monthlyRate || 25000
    : diffDays * (selectedCar?.dailyRate || 1000);

  const totalAllowedKm = diffDays * (selectedCar?.allowedDailyKm || 120);

  const handleSubmitBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerPhone || !selectedCar) return;

    submitBooking({
      customerName,
      customerPhone,
      customerNationalId,
      carId: selectedCar.id,
      carName: selectedCar.name,
      startDate,
      endDate,
      days: diffDays,
      estimatedCost,
      notes,
    });

    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });

    setBookingSuccess(true);
  };

  const handleConvert = (bookingId: string) => {
    const contract = convertBookingToContract(bookingId);
    if (contract) {
      setActiveTab('contracts');
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      
      {/* Switch between Client View and Admin View */}
      <div className="flex items-center justify-between bg-slate-900/90 border border-amber-500/20 rounded-2xl p-4 shadow-xl flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-400" />
          <span className="font-bold text-white text-sm">بوابة الحجز الذكي لعملاء ماستر كي (Master Key Smart Booking)</span>
        </div>

        <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setPortalMode('customer')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
              portalMode === 'customer'
                ? 'bg-amber-500 text-slate-950 shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            واجهة حجز العميل (Portal)
          </button>
          <button
            onClick={() => setPortalMode('admin')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              portalMode === 'admin'
                ? 'bg-amber-500 text-slate-950 shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>طلبات الحجز الواردة</span>
            {bookings.filter(b => b.status === 'pending').length > 0 && (
              <span className="w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] flex items-center justify-center font-bold">
                {bookings.filter(b => b.status === 'pending').length}
              </span>
            )}
          </button>
        </div>
      </div>

      {portalMode === 'customer' ? (
        /* CUSTOMER FACING BOOKING PORTAL */
        <div className="space-y-8">
          
          {/* Hero Banner */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/80 border border-amber-500/40 p-8 sm:p-12 text-center shadow-2xl">
            <div className="max-w-3xl mx-auto space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold">
                <KeyRound className="w-3.5 h-3.5" />
                <span>ماستر كي لتأجير وتوريد السيارات - K R M</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-white font-['Cairo',sans-serif]">
                احجز سيارتك الفاخرة بسهولة وشفافية تامة
              </h1>
              <p className="text-sm sm:text-base text-slate-300">
                أسطول حديث ومجهز بأحدث أنظمة التتبع GPS، كليو متر مسموح 120 كم/يوم، صيانة دورية معتمدة، وعقد إيجار رسمي موثق.
              </p>
            </div>
          </div>

          {bookingSuccess ? (
            <div className="bg-slate-900/90 border-2 border-emerald-500/50 rounded-3xl p-8 sm:p-12 text-center shadow-2xl max-w-2xl mx-auto space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-black text-white font-['Cairo',sans-serif]">
                تم استلام طلب حجزك بنجاح!
              </h3>
              <p className="text-sm text-slate-300">
                شكراً لاختيارك ماستر كي (K R M). تم تسجيل طلب الحجز الخاص بك لسيارة <strong className="text-amber-400">{selectedCar?.name}</strong> وسيقوم فريق خدمة العملاء بالتواصل معك فوراً لتأكيد الاستلام وتحرير العقد الرسمي.
              </p>
              <div className="pt-4 flex justify-center gap-3">
                <button
                  onClick={() => setBookingSuccess(false)}
                  className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow"
                >
                  حجز سيارة أخرى
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Car Selection Catalog (7 cols) */}
              <div className="lg:col-span-7 space-y-4">
                <h2 className="text-lg font-black text-white font-['Cairo',sans-serif] flex items-center gap-2">
                  <CarIcon className="w-5 h-5 text-amber-400" />
                  <span>اختر سيارتك من الأسطول</span>
                </h2>

                <div className="space-y-4">
                  {cars.map((car) => {
                    const isSelected = selectedCarId === car.id;
                    return (
                      <div
                        key={car.id}
                        onClick={() => setSelectedCarId(car.id)}
                        className={`rounded-3xl border-2 transition-all p-4 cursor-pointer flex flex-col sm:flex-row items-center gap-4 ${
                          isSelected
                            ? 'bg-amber-950/30 border-amber-500 shadow-xl shadow-amber-500/10'
                            : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="w-full sm:w-44 h-32 rounded-2xl overflow-hidden bg-slate-950 shrink-0">
                          <img 
                            src={car.imageUrl} 
                            alt={car.name} 
                            className="w-full h-full object-cover"
                          />
                        </div>

                        <div className="flex-1 space-y-2 w-full text-xs">
                          <div className="flex items-center justify-between">
                            <h3 className="text-base font-bold text-white font-['Cairo',sans-serif]">
                              {car.name}
                            </h3>
                            <span className="px-2 py-0.5 rounded bg-slate-800 text-amber-400 font-mono font-bold">
                              {car.plateNumber}
                            </span>
                          </div>

                          <div className="flex items-center gap-3 text-slate-400">
                            <span>موديل: <strong className="text-slate-200">{car.modelYear}</strong></span>
                            <span>•</span>
                            <span>اللون: <strong className="text-slate-200">{car.color}</strong></span>
                            <span>•</span>
                            <span className="text-amber-400 font-bold">120 كم/يوم</span>
                          </div>

                          <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                            <div>
                              <span className="text-slate-400 block text-[11px]">سعر الإيجار الشهري</span>
                              <span className="font-mono font-black text-amber-400 text-base">
                                {car.monthlyRate.toLocaleString()} ج.م
                              </span>
                            </div>

                            <div className="text-left">
                              <span className="text-slate-400 block text-[11px]">سعر اليوم</span>
                              <span className="font-mono font-bold text-slate-200 text-sm">
                                {car.dailyRate.toLocaleString()} ج.م
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Booking Form & Calculator (5 cols) */}
              <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5">
                <div className="border-b border-slate-800 pb-3">
                  <h3 className="font-black text-white text-lg font-['Cairo',sans-serif]">
                    بيانات الحجز وتقدير التكلفة
                  </h3>
                  <p className="text-xs text-slate-400">
                    السيارة المختارة: <strong className="text-amber-400">{selectedCar?.name}</strong>
                  </p>
                </div>

                <form onSubmit={handleSubmitBooking} className="space-y-4 text-xs">
                  
                  {/* Rental Type Selector */}
                  <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800">
                    <button
                      type="button"
                      onClick={() => setRentalType('monthly')}
                      className={`py-2 rounded-lg font-bold transition-all ${
                        rentalType === 'monthly'
                          ? 'bg-amber-500 text-slate-950 shadow'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      إيجار شهري (الأكثر توفيراً)
                    </button>
                    <button
                      type="button"
                      onClick={() => setRentalType('daily')}
                      className={`py-2 rounded-lg font-bold transition-all ${
                        rentalType === 'daily'
                          ? 'bg-amber-500 text-slate-950 shadow'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      إيجار يومي / مخصص
                    </button>
                  </div>

                  {/* Dates */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-slate-400 block mb-1">تاريخ الاستلام</label>
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-slate-400 block mb-1">تاريخ التسليم</label>
                      <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white"
                        required
                      />
                    </div>
                  </div>

                  {/* Customer Details */}
                  <div>
                    <label className="text-slate-400 block mb-1">اسم العميل بالكامل</label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="أدخل اسمك الثلاثي أو الرباعي"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white placeholder-slate-500"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-slate-400 block mb-1">رقم الهاتف / واتساب</label>
                      <input
                        type="tel"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        placeholder="010xxxxxxxx"
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white placeholder-slate-500 font-mono"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-slate-400 block mb-1">الرقم القومي (اختياري)</label>
                      <input
                        type="text"
                        value={customerNationalId}
                        onChange={(e) => setCustomerNationalId(e.target.value)}
                        placeholder="14 رقم"
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white placeholder-slate-500 font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-slate-400 block mb-1">ملاحظات إضافية أو موعد الاستلام المفضل</label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="مثل: الاستلام من مقر الشركة بالشيخ زايد..."
                      rows={2}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white placeholder-slate-500 resize-none"
                    />
                  </div>

                  {/* Price & Rules Box */}
                  <div className="bg-slate-950/80 border border-amber-500/30 rounded-2xl p-4 space-y-2">
                    <div className="flex justify-between text-slate-300">
                      <span>المدة المحسوبة:</span>
                      <span className="font-bold text-white font-mono">{diffDays} يوم</span>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>الكيلومتر المسموح به:</span>
                      <span className="font-bold text-amber-400 font-mono">{totalAllowedKm.toLocaleString()} كم ({selectedCar?.allowedDailyKm || 120} كم/يوم)</span>
                    </div>
                    <div className="flex justify-between text-slate-300 pt-2 border-t border-slate-800">
                      <span className="text-sm font-bold text-white">القيمة الإيجارية المقدرة:</span>
                      <span className="text-lg font-black text-amber-400 font-mono">{estimatedCost.toLocaleString()} ج.م</span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm shadow-xl shadow-amber-500/25 transition-all flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95"
                  >
                    <Send className="w-4 h-4" />
                    <span>تأكيد وإرسال طلب الحجز</span>
                  </button>
                </form>

              </div>

            </div>
          )}

        </div>
      ) : (
        /* ADMIN BOOKINGS MANAGEMENT VIEW */
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-white font-['Cairo',sans-serif]">
              طلبات الحجز الواردة عبر البوابة الذكية
            </h2>
            <span className="text-xs text-slate-400 font-semibold">
              إجمالي الطلبات: <strong className="text-amber-400">{bookings.length}</strong>
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {bookings.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-12 col-span-full">لا توجد طلبات حجز حالياً</p>
            ) : (
              bookings.map((booking) => (
                <div
                  key={booking.id}
                  className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4"
                >
                  <div className="flex items-start justify-between border-b border-slate-800 pb-3">
                    <div>
                      <h3 className="font-bold text-white text-base font-['Cairo',sans-serif]">{booking.customerName}</h3>
                      <p className="text-xs text-emerald-400 font-mono" dir="ltr">{booking.customerPhone}</p>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                      booking.status === 'pending'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse'
                        : booking.status === 'converted'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-slate-800 text-slate-400'
                    }`}>
                      {booking.status === 'pending' ? 'قيد المراجعة' : booking.status === 'converted' ? 'تم تحويله لعقد رسمي' : booking.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-300">
                    <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
                      <span className="text-slate-400 block text-[11px]">السيارة المطلوبة</span>
                      <span className="font-bold text-white">{booking.carName}</span>
                    </div>
                    <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
                      <span className="text-slate-400 block text-[11px]">القيمة المتوقعة</span>
                      <span className="font-black text-amber-400 font-mono">{booking.estimatedCost.toLocaleString()} ج.م</span>
                    </div>
                  </div>

                  <div className="text-xs text-slate-400 space-y-1">
                    <p>الفترة: من <strong className="text-slate-200">{booking.startDate}</strong> إلى <strong className="text-slate-200">{booking.endDate}</strong> ({booking.days} يوم)</p>
                    {booking.notes && <p className="text-slate-300 italic">ملاحظات: {booking.notes}</p>}
                  </div>

                  {booking.status === 'pending' && (
                    <div className="pt-2 border-t border-slate-800 flex items-center gap-2">
                      <button
                        onClick={() => handleConvert(booking.id)}
                        className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow"
                      >
                        <FileCheck className="w-4 h-4" />
                        <span>تحويل فوري إلى عقد رسمي معتمد</span>
                      </button>

                      <button
                        onClick={() => updateBookingStatus(booking.id, 'rejected')}
                        className="px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-rose-950 text-rose-400 text-xs font-bold transition-colors"
                      >
                        رفض
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

    </div>
  );
};
