import React, { useRef, useState, useEffect } from 'react';
import { 
  Printer, 
  Download, 
  Share2, 
  CheckCircle2, 
  RotateCcw, 
  ArrowLeft, 
  Shield, 
  Stamp, 
  FileCheck,
  Phone,
  Mail,
  Car as CarIcon,
  Calendar,
  Gauge,
  AlertCircle,
  Receipt,
  Loader2,
  Trash2,
  Send,
  MessageSquare
} from 'lucide-react';
import { Contract } from '../types';
import { useApp } from '../context/AppContext';
import { 
  downloadElementAsPdf, 
  sharePdfViaWhatsapp, 
  openWhatsappChat,
  shareDocumentAsFile,
  printElementCleanly,
  buildDocumentShareUrl,
  buildContractWhatsappMessage,
  generatePdfBlob
} from '../utils/pdfExport';
import { BRAND_LOGO_BASE64 } from '../data/brandLogoData';
import { SharePdfModal } from './SharePdfModal';

interface ContractDocumentProps {
  contract: Contract;
  onBack?: () => void;
  onOpenCloseModal?: (contract: Contract) => void;
  onOpenRenewModal?: (contract: Contract) => void;
  onOpenInvoiceModal?: (contract: Contract) => void;
}

export const ContractDocument: React.FC<ContractDocumentProps> = ({ 
  contract, 
  onBack,
  onOpenCloseModal,
  onOpenRenewModal,
  onOpenInvoiceModal
}) => {
  const { company, showToast, deleteContract } = useApp();
  const [showStamp, setShowStamp] = useState(true);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [shareModalData, setShareModalData] = useState<{
    file: File | null;
    blob: Blob | null;
    fileName: string;
    textMessage: string;
  }>({
    file: null,
    blob: null,
    fileName: '',
    textMessage: ''
  });
  const cachedPdfBlobRef = useRef<Blob | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  // Pre-generate PDF in background when viewing contract for instantaneous zero-latency sharing
  useEffect(() => {
    cachedPdfBlobRef.current = null;
    const timer = setTimeout(async () => {
      try {
        const blob = await generatePdfBlob('official-contract-print');
        cachedPdfBlobRef.current = blob;
      } catch {
        // Silently ignore if not ready
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [contract.id, contract.contractNumber, showStamp]);

  const handleDeleteContract = () => {
    const isConfirmed = window.confirm(
      `هل أنت متأكد من حذف العقد رقم (${contract.contractNumber}) نهائياً؟\nسيتم إعادة حالة السيارة لتكون متاحة تلقائياً في حال كان العقد سارياً.`
    );
    if (isConfirmed) {
      deleteContract(contract.id);
      if (onBack) onBack();
    }
  };

  const handlePrint = () => {
    printElementCleanly('official-contract-print');
  };

  const handleDownloadPdf = async () => {
    try {
      setIsGeneratingPdf(true);
      const customerName = contract.customerSnapshot?.fullName || contract.secondPartyRepresentative || 'عميل';
      await downloadElementAsPdf('official-contract-print', `عقد_ايجار_${contract.contractNumber}_${customerName.replace(/\s+/g, '_')}.pdf`);
      showToast(`تم تحميل العقد رقم ${contract.contractNumber} بصيغة PDF بنجاح`, 'success');
    } catch (err) {
      console.error(err);
      showToast('حدث خطأ أثناء تصدير العقد بصيغة PDF', 'error');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  /**
   * الزر الرئيسي: إرسال ملف العقد الأصلي PDF المعتمد عبر واتساب
   * - يشارك ملف الـ PDF كملف مستند رسمي عبر واجهة المشاركة الأصلية
   * - إذا كان المتصفح لا يدعم أو انتهت مهلة الإيماءة، تفتح نافذة المشاركة المباشرة ذات النقرة الفورية
   */
  const handleShareWhatsappPdf = async () => {
    const fileName = `عقد_ايجار_${contract.contractNumber}.pdf`;
    const textMsg = buildContractWhatsappMessage(contract, company.phone);

    try {
      setIsGeneratingPdf(true);
      const result = await sharePdfViaWhatsapp(
        'official-contract-print',
        fileName,
        undefined,
        textMsg,
        cachedPdfBlobRef.current || undefined
      );

      if (result.blob) {
        cachedPdfBlobRef.current = result.blob;
      }

      if (result.method === 'share_api') {
        showToast('تم فتح واتساب مع إرفاق ملف العقد الأصلي والملخص بنجاح', 'success');
      } else {
        // Fallback / desktop / user gesture expired: open dedicated SharePdfModal
        setShareModalData({
          file: result.file,
          blob: result.blob,
          fileName,
          textMessage: textMsg
        });
        setShareModalOpen(true);
        showToast('تم تجهيز ملف العقد الأصلي (PDF) بنجاح للإرسال', 'success');
      }
    } catch (err) {
      console.error(err);
      showToast('حدث خطأ أثناء مشاركة ملف العقد عبر واتساب', 'error');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  /**
   * إرسال ملخص نصي فقط بدون ملف PDF
   */
  const handleShareTextOnly = () => {
    try {
      const textMsg = buildContractWhatsappMessage(contract, company.phone);

      openWhatsappChat(undefined, textMsg, true);
      showToast('جاري فتح واتساب لاختيار جهة الاتصال وإرسال الملخص النصي', 'success');
    } catch (err) {
      console.error(err);
      showToast('حدث خطأ أثناء فتح واتساب', 'error');
    }
  };

  const handleShareToCustomer = () => {
    try {
      const customerPhone = contract.customerSnapshot?.phone;
      if (!customerPhone) {
        showToast('لا يوجد رقم هاتف مسجل للمستأجر في العقد', 'error');
        return;
      }
      const textMsg = buildContractWhatsappMessage(contract, company.phone);

      openWhatsappChat(customerPhone, textMsg, false);
      showToast(`جاري فتح محادثة واتساب مع المستأجر (${customerPhone})`, 'success');
    } catch (err) {
      console.error(err);
      showToast('حدث خطأ أثناء فتح محادثة واتساب', 'error');
    }
  };

  const statusBadge = {
    active: { label: 'عقد ساري ونشط', bg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' },
    completed: { label: 'عقد مغلق ومستلم', bg: 'bg-blue-500/20 text-blue-300 border-blue-500/40' },
    renewed: { label: 'تم تجديده', bg: 'bg-amber-500/20 text-amber-300 border-amber-500/40' },
    cancelled: { label: 'ملغي', bg: 'bg-rose-500/20 text-rose-300 border-rose-500/40' },
    overdue: { label: 'متأخر في التسليم', bg: 'bg-rose-600/30 text-rose-200 border-rose-600/50' },
  }[contract.status];

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      
      {/* Control Actions Bar (Hidden on print) */}
      <div className="print:hidden bg-slate-900/90 border border-amber-500/30 rounded-2xl p-4 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
              title="رجوع"
            >
              <ArrowLeft className="w-5 h-5 rotate-180" />
            </button>
          )}
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white font-['Cairo',sans-serif]">
                عقد رقم: <span className="text-amber-400 font-mono">{contract.contractNumber}</span>
              </h2>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${statusBadge.bg}`}>
                {statusBadge.label}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              المستأجر: <span className="text-slate-200">{contract.customerSnapshot.fullName}</span> | السيارة: <span className="text-slate-200">{contract.carSnapshot.name}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setShowStamp(!showStamp)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
              showStamp 
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' 
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
          >
            <Stamp className="w-4 h-4" />
            <span>{showStamp ? 'إخفاء ختم الشركة' : 'إظهار ختم الشركة'}</span>
          </button>

          {onOpenInvoiceModal && (
            <button
              onClick={() => onOpenInvoiceModal(contract)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 text-xs font-bold transition-all shadow"
              title="عرض وطباعة فاتورة وسند سداد للعميل"
            >
              <Receipt className="w-4 h-4 text-amber-400" />
              <span>فاتورة العميل</span>
            </button>
          )}

          {contract.status === 'active' && onOpenRenewModal && (
            <button
              onClick={() => onOpenRenewModal(contract)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 border border-amber-500/30 text-xs font-bold transition-all shadow"
            >
              <RotateCcw className="w-4 h-4" />
              <span>تجديد العقد</span>
            </button>
          )}

          {contract.status === 'active' && onOpenCloseModal && (
            <button
              onClick={() => onOpenCloseModal(contract)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-lg shadow-emerald-600/20"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>إغلاق واستلام السيارة</span>
            </button>
          )}

          {/* الزر الرئيسي: إرسال ملف العقد الأصلي PDF المعتمد عبر واتساب مع اختيار جهة الاتصال */}
          <button
            onClick={handleShareWhatsappPdf}
            disabled={isGeneratingPdf}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md shadow-emerald-600/25 hover:scale-105 disabled:opacity-60"
            title="إرسال ملف العقد الأصلي المعتمد (PDF) مباشرة عبر تطبيق واتساب لجهة الاتصال المختارة"
          >
            {isGeneratingPdf ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            <span>إرسال العقد الأصلي PDF عبر واتساب</span>
          </button>

          {/* خيار إرسال ملخص نصي ورابط فقط بدون توليد ملف */}
          <button
            onClick={handleShareTextOnly}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-medium transition-all"
            title="إرسال ملخص العقد ورابط التحميل كنص فقط عبر واتساب بدون إرفاق ملف PDF"
          >
            <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
            <span>ملخص نصي فقط</span>
          </button>

          {/* خيار إرسال مباشر لمحادثة العميل المسجل في حال توفر هاتفه */}
          {contract.customerSnapshot?.phone && (
            <button
              onClick={handleShareToCustomer}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-emerald-500/30 text-xs font-semibold transition-all hover:scale-105"
              title={`فتح محادثة واتساب مباشرة مع المستأجر (${contract.customerSnapshot.phone})`}
            >
              <Phone className="w-3.5 h-3.5" />
              <span>إرسال للعميل ({contract.customerSnapshot.phone})</span>
            </button>
          )}

          <button
            onClick={handleDownloadPdf}
            disabled={isGeneratingPdf}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-all disabled:opacity-50"
            title="تنزيل العقد كملف PDF"
          >
            <Download className="w-4 h-4 text-blue-400" />
            <span>تحميل PDF</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/30 transition-all hover:scale-105"
          >
            <Printer className="w-4 h-4" />
            <span>طباعة A4</span>
          </button>

          <button
            onClick={handleDeleteContract}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-950/40 hover:bg-rose-600 text-rose-400 hover:text-white border border-rose-500/40 text-xs font-bold transition-all shadow"
            title="حذف هذا العقد نهائياً"
          >
            <Trash2 className="w-4 h-4" />
            <span>حذف العقد</span>
          </button>
        </div>
      </div>

      {/* Contract Notice Alert */}
      {contract.status === 'completed' && contract.returnMileage && (
        <div className="print:hidden bg-blue-950/40 border border-blue-500/30 rounded-2xl p-4 text-xs text-blue-200 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-blue-400 shrink-0" />
            <div>
              <p className="font-semibold text-white">تم إغلاق العقد بنجاح</p>
              <p className="text-blue-300">
                عداد الخروج: {(contract.initialMileage || 0).toLocaleString()} كم | عداد الدخول: {(contract.returnMileage || 0).toLocaleString()} كم | المسافة المقطوعة: {((contract.returnMileage || 0) - (contract.initialMileage || 0)).toLocaleString()} كم
                {contract.excessKmCount && contract.excessKmCount > 0 ? ` (كيلومترات زائدة: ${contract.excessKmCount} كم - تكلفة: ${contract.excessKmCost} ج.م)` : ''}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          THE OFFICIAL CONTRACT DOCUMENT (100% IDENTICAL REPLICA OF THE ATTACHMENT)
          Formatted precisely for paper printing (A4) & screen preview
         ========================================================================= */}
      <div className="w-full overflow-x-auto pb-6">
        <div className="w-[820px] min-w-[820px] max-w-[820px] mx-auto">
          {/* Mobile Screen Notice */}
          <div className="print:hidden md:hidden mb-2 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[11px] flex items-center justify-between">
            <span>📄 معاينة ورقة العقد الرسمية A4 (اسحب أفقياً للمعاينة الكاملة)</span>
            <span className="text-[10px] text-slate-400">طباعة A4 معتمدة</span>
          </div>

          <div 
            ref={printRef}
            id="official-contract-print"
            className="space-y-8 print:space-y-0"
            dir="rtl"
          >
            {/* =========================================================================
                PAGE 1: CONTRACT FACE (وجه العقد - البيانات والإقرار والتوقيع والختم)
               ========================================================================= */}
            <div className="contract-page contract-page-1 relative bg-white text-slate-950 p-6 rounded-xl shadow-xl border border-slate-300 print:border-none print:shadow-none print:p-0 print:m-0 font-['Amiri',serif] leading-normal select-text overflow-hidden w-[820px] min-w-[820px] max-w-[820px]">
              {/* Top Header matching original document */}
              <div className="relative border-b-2 border-slate-900 pb-2 mb-3">
                <div className="flex items-center justify-between gap-2">
                  {/* Right Side: Company Legal Name */}
                  <div className="text-right w-1/3 min-w-0">
                    <h1 className="text-2xl sm:text-3xl font-black text-slate-950 font-['Cairo',sans-serif] tracking-wider whitespace-nowrap">
                      Master Key
                    </h1>
                    <p className="text-xs sm:text-sm font-bold text-slate-800 mt-0.5 whitespace-nowrap">
                      تأجير وتوريد السيارات
                    </p>
                    <p className="text-[10px] sm:text-[11px] font-bold text-amber-800 font-['Cairo',sans-serif] whitespace-nowrap">
                      CAREEM CAR RENTAL (KRM)
                    </p>
                  </div>

                  {/* Center: Official Brand Logo Emblem */}
                  <div className="flex flex-col items-center justify-center shrink-0">
                    <img
                      src={BRAND_LOGO_BASE64}
                      alt="شعار الشركة"
                      className="w-14 h-14 object-contain rounded-md"
                      referrerPolicy="no-referrer"
                    />
                  </div>

                  {/* Left Side: Commercial Record & Tax & Contract ID & Mobile Numbers */}
                  <div className="text-left font-['Cairo',sans-serif] text-xs font-bold text-slate-900 space-y-0.5 w-1/3 min-w-0 flex flex-col items-start" dir="ltr">
                    <div className="text-left whitespace-nowrap">
                      س.ت : <span className="font-mono text-sm sm:text-base font-black text-slate-950">{company.commercialRecord}</span>
                    </div>
                    <div className="text-left whitespace-nowrap">
                      ب.ض: <span className="font-mono text-sm sm:text-base font-black text-slate-950">{company.taxCard}</span>
                    </div>
                    <div className="text-left font-mono font-black text-slate-950 text-xs whitespace-nowrap flex items-center gap-1" dir="ltr">
                      <span>01146442004</span>
                      <span>-</span>
                      <span>01022221258</span>
                    </div>
                    <div className="text-left text-[10px] text-slate-600 whitespace-nowrap">
                      رقم : <span className="font-mono font-bold text-slate-950">{contract.contractNumber}</span>
                    </div>
                  </div>
                </div>

                <div className="text-center mt-1">
                  <h2 className="inline-block text-lg font-black text-slate-950 border-b-2 border-slate-900 pb-0.5 px-8 font-['Cairo',sans-serif]">
                    عقد ايجار سيارة
                  </h2>
                </div>
              </div>

              {/* Date, Day, Time preamble */}
              <div className="text-sm font-semibold mb-2.5 text-slate-900 flex items-center justify-between border border-slate-300 p-2 rounded bg-slate-50/50 whitespace-nowrap gap-2">
                <div className="flex items-center gap-1 shrink-0 whitespace-nowrap">
                  <span>انه في يوم:</span>
                  <span className="font-bold border-b border-dotted border-slate-900 px-2 text-slate-950 inline-block min-w-[70px] text-center">
                    {contract.contractDayName || 'السبت'}
                  </span>
                </div>
                <div className="flex items-center gap-1 shrink-0 whitespace-nowrap">
                  <span>الموافق:</span>
                  <span className="font-bold font-mono border-b border-dotted border-slate-900 px-2 text-slate-950 inline-block min-w-[100px] text-center" dir="ltr">
                    {contract.contractDate || contract.startDate}
                  </span>
                </div>
                <div className="flex items-center gap-1 shrink-0 whitespace-nowrap">
                  <span>الساعة:</span>
                  <span className="font-bold border-b border-dotted border-slate-900 px-2 text-slate-950 inline-block min-w-[80px] text-center">
                    {contract.contractTime || '12:00 م'}
                  </span>
                </div>
              </div>

              <p className="text-sm font-bold text-slate-950 mb-1.5">
                تحرر هذا العقد بين كل من:-
              </p>

              {/* First Party (Lessor) */}
              <div className="mb-2 bg-slate-50/80 border border-slate-300 p-2 rounded text-xs leading-normal">
                <p className="font-bold text-slate-950">
                  الطرف الاول : ماستر كى لتأجير وتوريد السيارات
                </p>
                <p className="text-slate-900 font-semibold mt-0.5">
                  ويمثلها قانوناً السيد : <span className="font-bold text-slate-950 underline">{company.representativeName}</span>
                </p>
                <div className="flex items-center justify-between mt-0.5 text-slate-900">
                  <span>
                    رقم القومي: <span className="font-mono font-bold">{company.representativeNationalId}</span>
                  </span>
                  <span className="font-bold px-2 py-0.5 border border-slate-900 rounded text-[11px]">
                    (طرف أول ) مؤجر
                  </span>
                </div>
              </div>

              {/* Second Party (Tenant / Customer) */}
              <div className="mb-2 border border-slate-300 p-2 rounded bg-white text-xs">
                <div className="flex items-center justify-between border-b border-slate-200 pb-1 mb-1.5">
                  <span className="font-bold text-slate-950">
                    ثانياً: (طرف ثاني) مستأجر
                  </span>
                  <span className="text-[11px] text-slate-600 font-sans">بيانات العميل المعتمدة</span>
                </div>

                <div className="grid grid-cols-2 gap-y-1.5 gap-x-4">
                  <div className="flex items-center">
                    <span className="w-32 font-bold text-slate-900 text-xs shrink-0">الاسم:</span>
                    <span className="font-bold text-slate-950 border-b border-slate-400 flex-1 px-1 truncate">
                      {contract.customerSnapshot?.fullName || contract.secondPartyRepresentative || '...........................................'}
                    </span>
                  </div>

                  <div className="flex items-center">
                    <span className="w-32 font-bold text-slate-900 text-xs shrink-0">رقم البطاقة /جواز:</span>
                    <span className="font-mono font-bold text-slate-950 border-b border-slate-400 flex-1 px-1">
                      {contract.customerSnapshot?.nationalId || '...........................................'}
                    </span>
                  </div>

                  <div className="flex items-center">
                    <span className="w-32 font-bold text-slate-900 text-xs shrink-0">الجنسية:</span>
                    <span className="font-bold text-slate-950 border-b border-slate-400 flex-1 px-1">
                      {contract.customerSnapshot?.nationality || 'مصري'}
                    </span>
                  </div>

                  <div className="flex items-center">
                    <span className="w-32 font-bold text-slate-900 text-xs shrink-0">الوظيفة :</span>
                    <span className="font-bold text-slate-950 border-b border-slate-400 flex-1 px-1">
                      {contract.customerSnapshot?.job || '...........................................'}
                    </span>
                  </div>

                  <div className="flex items-center col-span-2">
                    <span className="w-32 font-bold text-slate-900 text-xs shrink-0">عنوان الاقامة :</span>
                    <span className="font-bold text-slate-950 border-b border-slate-400 flex-1 px-1 truncate">
                      {contract.customerSnapshot?.address || '......................................................................................'}
                    </span>
                  </div>

                  <div className="flex items-center">
                    <span className="w-32 font-bold text-slate-900 text-xs shrink-0">رقم الرخصه:</span>
                    <span className="font-mono font-bold text-slate-950 border-b border-slate-400 flex-1 px-1">
                      {contract.customerSnapshot?.licenseNumber || '...........................................'}
                    </span>
                  </div>

                  <div className="flex items-center">
                    <span className="w-32 font-bold text-slate-900 text-xs shrink-0">رقم الهاتف:</span>
                    <span className="font-mono font-bold text-slate-950 border-b border-slate-400 flex-1 px-1">
                      {contract.customerSnapshot?.phone || '...........................................'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Section: Car Details */}
              <div className="mb-2 border-2 border-slate-900 p-2 rounded bg-slate-50/40 text-xs">
                <div className="text-center font-bold text-slate-950 mb-1 pb-0.5 border-b border-slate-300 font-['Cairo',sans-serif]">
                  بيانات السيارة المأجرة
                </div>

                <div className="grid grid-cols-2 gap-y-1.5 gap-x-4">
                  <div className="flex items-center">
                    <span className="w-24 font-bold text-slate-900 text-xs shrink-0">السيارة ماركة:</span>
                    <span className="font-bold text-slate-950 border-b border-slate-400 flex-1 px-1">
                      {contract.carSnapshot?.brand || contract.carSnapshot?.name || 'سيارة سياحية'}
                    </span>
                  </div>

                  <div className="flex items-center">
                    <span className="w-24 font-bold text-slate-900 text-xs shrink-0">موديل:</span>
                    <span className="font-bold text-slate-950 border-b border-slate-400 flex-1 px-1">
                      {contract.carSnapshot?.modelYear || '2024'}
                    </span>
                  </div>

                  <div className="flex items-center">
                    <span className="w-24 font-bold text-slate-900 text-xs shrink-0">اللون:</span>
                    <span className="font-bold text-slate-950 border-b border-slate-400 flex-1 px-1">
                      {contract.carSnapshot?.color || '—'}
                    </span>
                  </div>

                  <div className="flex items-center">
                    <span className="w-24 font-bold text-slate-900 text-xs shrink-0">اسم المالك:</span>
                    <span className="font-bold text-slate-950 border-b border-slate-400 flex-1 px-1 truncate">
                      {contract.carSnapshot?.ownerName || 'اسم المالك بالرخصة'}
                    </span>
                  </div>

                  <div className="flex items-center">
                    <span className="w-24 font-bold text-slate-900 text-xs shrink-0">لوحات:</span>
                    <span className="font-bold text-slate-950 border-b border-slate-400 flex-1 px-1 text-sm font-mono">
                      {contract.carSnapshot?.plateNumber || '—'}
                    </span>
                  </div>

                  <div className="flex items-center">
                    <span className="w-24 font-bold text-slate-900 text-xs shrink-0">وحدة المرور:</span>
                    <span className="font-bold text-slate-950 border-b border-slate-400 flex-1 px-1">
                      {contract.carSnapshot?.trafficUnit || 'مرور الجيزة'}
                    </span>
                  </div>

                  <div className="flex items-center">
                    <span className="w-24 font-bold text-slate-900 text-xs shrink-0">رقم الشاسية:</span>
                    <span className="font-mono font-bold text-slate-950 border-b border-slate-400 flex-1 px-1 text-xs">
                      {contract.carSnapshot?.chassisNumber || '—'}
                    </span>
                  </div>

                  <div className="flex items-center">
                    <span className="w-24 font-bold text-slate-900 text-xs shrink-0">رقم الماتور:</span>
                    <span className="font-mono font-bold text-slate-950 border-b border-slate-400 flex-1 px-1 text-xs">
                      {contract.carSnapshot?.motorNumber || '—'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Section: Rental Dates, Period, Rates */}
              <div className="mb-2 border border-slate-300 p-2 rounded bg-white text-xs">
                <div className="grid grid-cols-2 gap-y-1.5 gap-x-4">
                  <div className="flex items-center">
                    <span className="w-28 font-bold text-slate-900 text-xs shrink-0">تاريخ الاستلام:</span>
                    <span className="font-mono font-bold text-slate-950 border-b border-slate-400 flex-1 px-1">
                      {contract.startDate}
                    </span>
                  </div>

                  <div className="flex items-center">
                    <span className="w-28 font-bold text-slate-900 text-xs shrink-0">تاريخ التسلم:</span>
                    <span className="font-mono font-bold text-slate-950 border-b border-slate-400 flex-1 px-1">
                      {contract.endDate}
                    </span>
                  </div>

                  <div className="flex items-center">
                    <span className="w-28 font-bold text-slate-900 text-xs shrink-0">مدة العقد:</span>
                    <span className="font-bold text-slate-950 border-b border-slate-400 flex-1 px-1">
                      {contract.durationDays ?? contract.rentalPeriodDays ?? 30} يوم ({contract.durationType === 'monthly' ? 'شهر كامل' : `${contract.durationDays ?? contract.rentalPeriodDays ?? 30} يوم`})
                    </span>
                  </div>

                  <div className="flex items-center">
                    <span className="w-36 font-bold text-slate-900 text-xs shrink-0">القيمة الإيجارية المتفق عليها:</span>
                    <span className="font-bold text-slate-950 border-b border-slate-400 flex-1 px-1">
                      {((contract.rentalAmount ?? contract.totalRentAmount) || 0).toLocaleString()} ج.م ({contract.paidAmount >= ((contract.rentalAmount ?? contract.totalRentAmount) || 0) ? 'مدفوعة بالكامل' : `مدفوع ${(contract.paidAmount || 0).toLocaleString()} ج.م`})
                    </span>
                  </div>

                  <div className="flex items-center col-span-2">
                    <span className="w-28 font-bold text-slate-900 text-xs shrink-0">ذلك لمدة:</span>
                    <span className="font-bold text-slate-950 border-b border-slate-400 flex-1 px-1">
                      من {contract.startDate} وحتى {contract.endDate}
                    </span>
                  </div>
                </div>
              </div>

              {/* Section: Kilometers & Allowance Rule */}
              <div className="mb-2 border border-amber-900/30 p-2 rounded bg-amber-50/40 text-xs">
                <div className="font-bold text-slate-950 mb-1">
                  الكيلو متر المسموح به: <span className="underline font-black text-amber-950">120كم لليوم الواحد</span> ويحتسب كم فوق المسموح بمبلغ.( <span className="font-mono font-black underline">{contract.excessKmRate || 5}</span> جنيه ) للكيلو الواحد
                </div>

                <div className="grid grid-cols-2 gap-3 mt-1">
                  <div className="flex items-center bg-white p-1.5 border border-slate-300 rounded">
                    <span className="w-28 font-bold text-slate-900 text-xs shrink-0">كيلو متر الخروج:</span>
                    <span className="font-mono font-black text-slate-950 text-sm flex-1">
                      {(contract.initialMileage || 0).toLocaleString()} كم
                    </span>
                  </div>

                  <div className="flex items-center bg-white p-1.5 border border-slate-300 rounded">
                    <span className="w-28 font-bold text-slate-900 text-xs shrink-0">كيلو متر الدخول:</span>
                    <span className="font-mono font-black text-slate-950 text-sm flex-1">
                      {contract.returnMileage ? `${(contract.returnMileage || 0).toLocaleString()} كم` : '..........................'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Declaration Paragraph */}
              <div className="mb-2.5 text-justify text-xs font-semibold text-slate-900 leading-relaxed border border-slate-300 p-2 rounded bg-slate-50/60">
                <p>
                  اقر الطرف الثاني (المستأجر) أنه قام باستلم السيارة المبينة بهذا العقد وقرأت جميع البنود الموضحة بظهر هذا العقد قراءة جيدة  وأوافق علي الالتزام بجميع ماورد فيها من بنود وشروط  قانونية. استلامًا فعليًا بحالة جيدة وصالحة للاستعمال، وذلك بعد فحصها ومعاينتها المعاينة التامة النافية للجهالة، وأنها خالية من أي عيوب ظاهرة، ويتعهد بالحفاظ عليها واستعمالها الاستعمال المعتاد وردها للطرف الأول بالحالة التي استلمها عليها عند انتهاء مدة الإيجار
                </p>
              </div>

              {/* Page 1 Signatures & Stamp */}
              <div className="flex items-end justify-between border-t-2 border-slate-400 pt-2">
                <div className="space-y-1">
                  <p className="font-bold text-slate-950 text-xs">
                    المستأجر : ( طرف ثاني )
                  </p>
                  <p className="text-xs">الاسم: <span className="font-bold">{contract.customerSnapshot?.fullName || contract.secondPartyRepresentative || 'العميل'}</span></p>
                  <p className="text-xs">التوقيع: ...........................................</p>
                </div>

                <div className="text-center space-y-0.5">
                  <p className="font-bold text-slate-950 text-xs">يعتمد,,</p>
                  {showStamp && (
                    <div className="relative inline-block my-0.5">
                      <div className="w-20 h-20 rounded-full border-2 border-red-700 flex flex-col items-center justify-center text-red-700 text-[9px] font-bold p-1 rotate-[-12deg] shadow-sm bg-red-50/20">
                        <div className="border border-red-700 rounded-full w-full h-full flex flex-col items-center justify-center">
                          <span className="font-black text-[10px]">MASTER KEY</span>
                          <span className="text-[8px]">تأجير سيارات</span>
                          <span className="font-mono text-[7px]">س.ت: 1379</span>
                          <span className="font-bold text-[7px]">كريم كرم</span>
                        </div>
                      </div>
                    </div>
                  )}
                  <p className="text-[10px] font-bold text-red-700">
                    لا يعتمد عقد غير مختوم بختم شركة
                  </p>
                </div>
              </div>

              {/* Bottom Contact Footer from original contract */}
              <div className="border-t-2 border-slate-900 pt-1.5 mt-2 text-xs font-semibold text-slate-900 flex items-center justify-between gap-2 font-['Cairo',sans-serif]">
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5" />
                  <span>رقم الهاتف:</span>
                  <span className="font-mono font-bold" dir="ltr">01146442004</span>
                  <span>/</span>
                  <span className="font-mono font-bold" dir="ltr">01022221258</span>
                </div>

                <div className="flex items-center gap-1.5" dir="ltr">
                  <Mail className="w-3.5 h-3.5" />
                  <span className="font-mono font-bold">{company.email}</span>
                </div>
              </div>
            </div>

            {/* =========================================================================
                PAGE 2: TERMS AND CONDITIONS (ظهر العقد - بنود العقد والتوقيعات النهائية)
               ========================================================================= */}
            <div className="contract-page contract-page-2 page-break-before relative bg-white text-slate-950 p-6 rounded-xl shadow-xl border border-slate-300 print:border-none print:shadow-none print:p-0 print:m-0 font-['Amiri',serif] leading-relaxed select-text overflow-hidden w-[820px] min-w-[820px] max-w-[820px]">
              {/* Page 2 Top Header */}
              <div className="relative border-b-2 border-slate-900 pb-1.5 mb-2.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="text-right w-1/3 min-w-0">
                    <h1 className="text-2xl font-black text-slate-950 font-['Cairo',sans-serif] tracking-wider whitespace-nowrap">
                      Master Key
                    </h1>
                    <p className="text-[11px] font-bold text-slate-800 whitespace-nowrap">
                      تأجير وتوريد السيارات
                    </p>
                  </div>

                  {/* Center: Official Brand Logo Emblem */}
                  <div className="flex flex-col items-center justify-center shrink-0">
                    <img
                      src={BRAND_LOGO_BASE64}
                      alt="شعار الشركة"
                      className="w-11 h-11 object-contain rounded-md"
                      referrerPolicy="no-referrer"
                    />
                  </div>

                  <div className="text-left font-['Cairo',sans-serif] text-xs font-bold text-slate-900 space-y-0.5 w-1/3 min-w-0 flex flex-col items-start" dir="ltr">
                    <div className="text-left whitespace-nowrap">عقد رقم: <span className="font-mono font-bold text-slate-950">{contract.contractNumber}</span></div>
                    <div className="text-left text-[10px] text-slate-600 whitespace-nowrap">الصفحة الثانية (الشروط والأحكام)</div>
                  </div>
                </div>
                <div className="text-center mt-1">
                  <h3 className="inline-block text-lg font-black text-slate-950 border-b-2 border-slate-900 pb-0.5 px-6 font-['Cairo',sans-serif]">
                    بنود وشروط عقد الإيجار
                  </h3>
                </div>
              </div>

              {/* 8 Legal Articles */}
              <div className="space-y-1.5 text-xs text-slate-900 leading-snug">
                <div className="border-r-2 border-slate-900 pr-3">
                  <span className="font-black text-slate-950 text-xs sm:text-sm">البند الاول: مسؤولية المخالفات المرورية</span>
                  <p className="mt-0.5 text-justify">
                    يقر المستأجر بأنه المسؤول مسؤولية كاملة عن جميع المخالفات المرورية والجنائية والمدنية التي ترتكب بالمركبة خلال مدة الإيجار، ويتحمل وحده كافة الغرامات والرسوم والتعويضات الناتجة عنها دون أي مسؤولية على المؤجر.
                  </p>
                </div>

                <div className="border-r-2 border-slate-900 pr-3">
                  <span className="font-black text-slate-950 text-xs sm:text-sm">البند الثاني: تحديد مدة الاستلام والتسليم</span>
                  <p className="mt-0.5 text-justify">
                    تبدأ مسؤولية المستأجر عن المركبة من وقت استلامها المثبت بالعقد وحتى وقت تسليمها فعليًا للمؤجر، ويعد المستأجر مسؤولًا عن أي استخدام أو مخالفة أو حادث يقع خلال هذه الفترة.
                  </p>
                </div>

                <div className="border-r-2 border-slate-900 pr-3">
                  <span className="font-black text-slate-950 text-xs sm:text-sm">البند الثالث: استخدام السيارة في أمور غير قانونية</span>
                  <p className="mt-0.5 text-justify">
                    يحظر على المستأجر استخدام المركبة في أي أعمال مخالفة للقانون مثل نقل مواد محظورة أو الهروب من الجهات الأمنية أو استخدامها في أي نشاط غير مشروع، وفي حال حدوث ذلك يتحمل المستأجر كامل المسؤولية القانونية والجنائية.
                  </p>
                </div>

                <div className="border-r-2 border-slate-900 pr-3">
                  <span className="font-black text-slate-950 text-xs sm:text-sm">البند الرابع: سحب السيارة أو التحفظ عليها</span>
                  <p className="mt-0.5 text-justify">
                    في حال قيام أي جهة حكومية بالتحفظ على المركبة بسبب تصرف المستأجر، يلتزم المستأجر بتحمل جميع المصاريف والغرامات والتعويضات الناتجة عن ذلك، مع تعويض المؤجر عن أي أضرار أو خسائر.
                  </p>
                </div>

                <div className="border-r-2 border-slate-900 pr-3">
                  <span className="font-black text-slate-950 text-xs sm:text-sm">البند الخامس : صيانة السيارة والأعطال</span>
                  <p className="mt-0.5 text-justify">
                    يقر المستأجر بمسئولية صيانة السيارة اثناء فترة الايجار واخطار الشركة فور حدوث عطل مفاجئ ولايجوز للمستأجر تحت اي ظرف القيام باي اصلاحات للسيارة ,وفي حالة قيامة بذلك يحق للشركة مطالبة بتعويض التي تراه مناسب ولا تعتمد شركة ماستر كي اي فواتير من قبل المستأجر.
                  </p>
                </div>

                <div className="border-r-2 border-slate-900 pr-3">
                  <span className="font-black text-slate-950 text-xs sm:text-sm">البند السادس : الاختصاص القضائي</span>
                  <p className="mt-0.5 text-justify">
                    في حالة اي نزاع قضائي بخصوص هذا العقد تكون محكمة الجيزة المكان المختص للفصل بين الطرفين.
                  </p>
                </div>

                <div className="border-r-2 border-slate-900 pr-3">
                  <span className="font-black text-slate-950 text-xs sm:text-sm">البند السابع: الحيازة</span>
                  <p className="mt-0.5 text-justify">
                    تم فحص ومعاينة السيارة محل العقد من الداخل والخارج، والشنطة، والتابلوه، وكافة التجاويف فحصاً تاماً وينفي الجهالة. ويقر الطرف المسلِّم بمسؤوليته الكاملة عن المركبة حتى لحظة التوقيع. كما يقر الطرف المستلِم بأنه استلم السيارة خالية تماماً من أي متروكات، أو بضائع، أو ممنوعات، وتبدأ مسؤوليته الحصرية عن حيازة المركبة وما يوجد بداخلها من تاريخ وساعة تحرير هذا المحضر.
                  </p>
                </div>

                <div className="border-r-2 border-slate-900 pr-3">
                  <span className="font-black text-slate-950 text-xs sm:text-sm">البند الثامن: المسؤولية القانونية بعد انتهاء العقد</span>
                  <p className="mt-0.5 text-justify">
                    في حال عدم رد السيارة بعد انتهاء المدة بـ 24 ساعة دون إذن، يُعتبر المستأجر مبدداً للسيارة وخائناً للأمانة، ويحق للمؤجر اتخاذ الإجراءات القانونية الفورية لاستردادها.
                  </p>
                </div>
              </div>

              {/* Final Signatures & Approval */}
              <div className="grid grid-cols-2 gap-8 mt-2.5 pt-1.5 border-t-2 border-slate-300">
                <div>
                  <p className="font-bold text-slate-950 text-xs mb-1">
                    الطرف الثاني (المستأجر)
                  </p>
                  <div className="space-y-1 text-xs">
                    <p>الاسم: <span className="font-bold">{contract.customerSnapshot?.fullName || contract.secondPartyRepresentative || 'العميل'}</span></p>
                    <p>التوقيع: .....................................................</p>
                  </div>
                </div>

                <div className="text-left">
                  <p className="font-bold text-slate-950 text-xs mb-1">
                    الطرف الاول (المؤجر)
                  </p>
                  <div className="space-y-1 text-xs">
                    <p className="font-bold">شركه ماستركي لتاًجير وتوريد السيارات</p>
                    <p>ويمثلها قانوناً أ.كريم كرم محرم</p>
                    <p className="font-bold pt-0.5">يعتمد:</p>
                    {showStamp && (
                      <div className="inline-block border-2 border-blue-900 text-blue-900 font-bold px-3 py-0.5 rounded text-xs rotate-[-4deg] mt-0.5">
                        إدارة ماستر كي لتأجير السيارات (معتمد)
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Official Stamp warning */}
              <div className="text-center my-1">
                <span className="inline-block text-xs font-bold text-red-700 border border-red-700 px-4 py-0.5 rounded bg-red-50/40">
                  لا يعتمد عقد غير مختوم بختم شركه
                </span>
              </div>

              {/* Bottom Contact Footer from original contract */}
              <div className="border-t-2 border-slate-900 pt-1 mt-1.5 text-xs font-semibold text-slate-900 flex items-center justify-between gap-2 font-['Cairo',sans-serif]">
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5" />
                  <span>رقم الهاتف:</span>
                  <span className="font-mono font-bold" dir="ltr">01146442004</span>
                  <span>/</span>
                  <span className="font-mono font-bold" dir="ltr">01022221258</span>
                </div>

                <div className="flex items-center gap-1.5" dir="ltr">
                  <Mail className="w-3.5 h-3.5" />
                  <span className="font-mono font-bold">{company.email}</span>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* نافذة مشاركة ملف الـ PDF الأصلي التفاعلية ذات النقرة الفورية */}
      <SharePdfModal
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        pdfFile={shareModalData.file}
        pdfBlob={shareModalData.blob}
        fileName={shareModalData.fileName}
        documentTitle="عقد إيجار سيارة رسمي"
        documentNumber={contract.contractNumber}
        textMessage={shareModalData.textMessage}
        customerPhone={contract.customerSnapshot?.phone}
        customerName={contract.customerSnapshot?.fullName}
      />

    </div>
  );
};
