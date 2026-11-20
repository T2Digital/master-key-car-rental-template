import React, { useRef, useState } from 'react';
import { 
  X, 
  Printer, 
  Download, 
  Share2, 
  Receipt, 
  CheckCircle2, 
  Car as CarIcon, 
  Calendar, 
  User, 
  Phone, 
  CreditCard, 
  Stamp, 
  Loader2,
  FileCheck,
  Send,
  MessageSquare
} from 'lucide-react';
import { Invoice } from '../types';
import { useApp } from '../context/AppContext';
import { 
  downloadElementAsPdf, 
  sharePdfViaWhatsapp, 
  openWhatsappChat,
  shareDocumentAsFile,
  printElementCleanly,
  buildDocumentShareUrl,
  buildInvoiceWhatsappMessage
} from '../utils/pdfExport';
import { BRAND_LOGO_BASE64 } from '../data/brandLogoData';
import { SharePdfModal } from './SharePdfModal';

interface InvoiceModalProps {
  invoice: Invoice | null;
  onClose: () => void;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({ invoice, onClose }) => {
  const { company, showToast, contracts } = useApp();
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
  const invoiceRef = useRef<HTMLDivElement>(null);

  if (!invoice) return null;

  // Retrieve related contract if available
  const relatedContract = contracts?.find(
    (c) => (invoice.contractNumber && c.contractNumber === invoice.contractNumber) || (invoice.contractId && c.id === invoice.contractId)
  );

  const handlePrint = () => {
    printElementCleanly('official-invoice-print');
  };

  const handleDownloadPdf = async () => {
    try {
      setIsGeneratingPdf(true);
      await downloadElementAsPdf('official-invoice-print', `فاتورة_ماستر_كي_${invoice.invoiceNumber}.pdf`);
      showToast(`تم تحميل فاتورة رقم ${invoice.invoiceNumber} بصيغة PDF بنجاح`, 'success');
    } catch (err) {
      console.error(err);
      showToast('حدث خطأ أثناء تصدير ملف PDF', 'error');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  /**
   * الزر الرئيسي: إرسال ملف الفاتورة والعقد الأصلي المعتمد (PDF) عبر واتساب
   * - يولد ملف الـ PDF عالي الدقة ويشارك الملف كـ Document في واتساب
   * - في حال تعذر المشاركة المباشرة يفتح نافذة المشاركة التفاعلية
   */
  const handleShareWhatsappPdf = async () => {
    const fileName = `فاتورة_وعقد_ماستر_كي_${invoice.invoiceNumber}.pdf`;
    const textMsg = buildInvoiceWhatsappMessage(invoice, company.phone, relatedContract);

    try {
      setIsGeneratingPdf(true);
      const result = await sharePdfViaWhatsapp(
        'official-invoice-print',
        fileName,
        undefined,
        textMsg,
        cachedPdfBlobRef.current || undefined
      );

      if (result.blob) {
        cachedPdfBlobRef.current = result.blob;
      }

      if (result.method === 'share_api') {
        showToast('تم فتح واتساب مع إرفاق ملف الفاتورة الأصلي والملخص بنجاح', 'success');
      } else {
        setShareModalData({
          file: result.file,
          blob: result.blob,
          fileName,
          textMessage: textMsg
        });
        setShareModalOpen(true);
        showToast('تم تجهيز ملف الفاتورة الأصلي (PDF) بنجاح للإرسال', 'success');
      }
    } catch (err) {
      console.error(err);
      showToast('حدث خطأ أثناء مشاركة ملف الفاتورة عبر واتساب', 'error');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  /**
   * إرسال ملخص نصي فقط بدون ملف PDF
   */
  const handleShareTextOnly = () => {
    try {
      const textMsg = buildInvoiceWhatsappMessage(invoice, company.phone, relatedContract);
      openWhatsappChat(undefined, textMsg, true);
      showToast('جاري فتح واتساب لاختيار جهة الاتصال وإرسال الملخص النصي', 'success');
    } catch (err) {
      console.error(err);
      showToast('حدث خطأ أثناء فتح واتساب', 'error');
    }
  };

  const handleShareToCustomer = () => {
    try {
      const targetPhone = invoice.customerPhone || relatedContract?.customerSnapshot?.phone;
      if (!targetPhone) {
        showToast('لا يوجد رقم هاتف مسجل للمستأجر', 'error');
        return;
      }
      const textMsg = buildInvoiceWhatsappMessage(invoice, company.phone, relatedContract);
      openWhatsappChat(targetPhone, textMsg, false);
      showToast(`جاري فتح محادثة واتساب مع المستأجر (${targetPhone})`, 'success');
    } catch (err) {
      console.error(err);
      showToast('حدث خطأ أثناء فتح محادثة واتساب', 'error');
    }
  };

  const paymentMethodBadge = {
    cash: 'نقداً (كاش)',
    bank_transfer: 'تحويل بنكي / إنستاباي',
    vodafone_cash: 'فودافون كاش / محفظة',
    card: 'بطاقة ائتمان / فيزا',
  }[invoice.paymentMethod || 'cash'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-4xl w-full max-h-[92vh] overflow-y-auto shadow-2xl flex flex-col my-auto text-slate-100">
        
        {/* Modal Header & Controls (Hidden on Print) */}
        <div className="print:hidden p-4 sm:p-5 border-b border-slate-800 bg-slate-950/80 sticky top-0 z-20 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white font-['Cairo',sans-serif]">
                فاتورة وسند سداد: <span className="text-amber-400 font-mono">{invoice.invoiceNumber}</span>
              </h2>
              <p className="text-xs text-slate-400">
                العميل: <span className="text-slate-200">{invoice.customerName}</span> | العقد: <span className="text-amber-300 font-mono">{invoice.contractNumber}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setShowStamp(!showStamp)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                showStamp 
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' 
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}
            >
              <Stamp className="w-3.5 h-3.5" />
              <span>{showStamp ? 'إخفاء الختم' : 'إظهار الختم'}</span>
            </button>

            {/* الزر الرئيسي: إرسال ملف الفاتورة والعقد الأصلي PDF المعتمد عبر واتساب */}
            <button
              onClick={handleShareWhatsappPdf}
              disabled={isGeneratingPdf}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md shadow-emerald-600/20 hover:scale-105 disabled:opacity-60"
              title="إرسال ملف الفاتورة والعقد الأصلي المعتمد (PDF) مباشرة عبر تطبيق واتساب لجهة الاتصال المختارة"
            >
              {isGeneratingPdf ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              <span>إرسال الفاتورة كـ PDF عبر واتساب</span>
            </button>

            {/* إرسال ملخص نصي فقط */}
            <button
              onClick={handleShareTextOnly}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-medium transition-all"
              title="إرسال ملخص الفاتورة كنص ورابط فقط عبر واتساب"
            >
              <MessageSquare className="w-3 h-3 text-emerald-400" />
              <span>ملخص نصي فقط</span>
            </button>

            {/* إرسال مباشر لرقم العميل إذا توفر */}
            {(invoice.customerPhone || relatedContract?.customerSnapshot?.phone) && (
              <button
                onClick={handleShareToCustomer}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-emerald-500/30 text-xs font-semibold transition-all hover:scale-105"
                title={`فتح محادثة واتساب مباشرة مع المستأجر (${invoice.customerPhone || relatedContract?.customerSnapshot?.phone})`}
              >
                <Phone className="w-3 h-3" />
                <span>إرسال للعميل</span>
              </button>
            )}

            <button
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-all disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5 text-blue-400" />
              <span>تحميل PDF</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all hover:scale-105"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>طباعة A4</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Official Invoice Body */}
        <div className="p-2 sm:p-8 overflow-x-auto">
          <div className="w-[820px] min-w-[820px] max-w-[820px] mx-auto">
            {/* Mobile Screen Notice */}
            <div className="print:hidden md:hidden mb-2 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[11px] flex items-center justify-between">
              <span>🧾 معاينة ورقة الفاتورة الرسمية A4 (اسحب أفقياً للمعاينة الكاملة)</span>
              <span className="text-[10px] text-slate-400">سند رسمي</span>
            </div>

            <div
              ref={invoiceRef}
              id="official-invoice-print"
              className="relative bg-white text-slate-950 p-6 sm:p-10 rounded-2xl shadow-xl border-2 border-slate-300 font-['Cairo',sans-serif] leading-relaxed text-xs sm:text-sm select-text overflow-hidden w-[820px] min-w-[820px] max-w-[820px]"
              dir="rtl"
            >
              {/* Top Invoice Header */}
              <div className="relative border-b-2 border-slate-900 pb-3 mb-4">
                <div className="flex items-center justify-between gap-2">
                  <div className="text-right w-1/3 min-w-0">
                    <h1 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-wider whitespace-nowrap">
                      Master Key
                    </h1>
                    <p className="text-xs sm:text-sm font-bold text-slate-800 mt-0.5 whitespace-nowrap">
                      تأجير وتوريد السيارات
                    </p>
                    <p className="text-[11px] font-bold text-amber-800 whitespace-nowrap">
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

                  <div className="text-left text-xs font-bold text-slate-900 space-y-1 w-1/3 min-w-0 flex flex-col items-start" dir="ltr">
                    <div className="text-left whitespace-nowrap">س.ت : <span className="font-mono text-sm sm:text-base font-black text-slate-950">{company.commercialRecord}</span></div>
                    <div className="text-left whitespace-nowrap">ب.ض: <span className="font-mono text-sm sm:text-base font-black text-slate-950">{company.taxCard}</span></div>
                    <div className="text-left text-xs whitespace-nowrap font-mono font-bold text-slate-950 flex items-center gap-1" dir="ltr">
                      <span>01146442004</span>
                      <span>-</span>
                      <span>01022221258</span>
                    </div>
                  </div>
                </div>

                <div className="text-center mt-3 pt-2 border-t border-slate-200">
                  <h2 className="inline-block text-lg sm:text-xl font-black text-slate-950 bg-slate-100 px-6 py-1 rounded-lg border border-slate-300">
                    فاتورة وسند سداد إلكتروني
                  </h2>
                </div>
              </div>

              {/* Invoice Meta Grid */}
              <div className="grid grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200 mb-6 text-xs">
                <div>
                  <span className="text-slate-500 block">رقم الفاتورة:</span>
                  <span className="font-black text-slate-950 font-mono text-sm">{invoice.invoiceNumber}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">رقم العقد المرتبط:</span>
                  <span className="font-black text-amber-800 font-mono text-sm">{invoice.contractNumber}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">تاريخ الإصدار:</span>
                  <span className="font-bold text-slate-900 font-mono">{invoice.issueDate}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">وقت الإصدار:</span>
                  <span className="font-bold text-slate-900 font-mono">{invoice.issueTime}</span>
                </div>
              </div>

              {/* Customer & Car Info */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                {/* Customer Box */}
                <div className="border border-slate-300 rounded-xl p-4 bg-slate-50/50">
                  <h3 className="font-bold text-slate-950 border-b border-slate-200 pb-2 mb-2 flex items-center gap-1.5 text-xs sm:text-sm">
                    <User className="w-4 h-4 text-slate-700" />
                    <span>بيانات العميل (المستأجر)</span>
                  </h3>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-600">الاسم الكامل:</span>
                      <span className="font-bold text-slate-950">{invoice.customerName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">الرقم القومي:</span>
                      <span className="font-mono font-bold text-slate-900">{invoice.customerNationalId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">رقم الهاتف:</span>
                      <span className="font-mono font-bold text-slate-900" dir="ltr">{invoice.customerPhone}</span>
                    </div>
                    {invoice.customerAddress && (
                      <div className="flex justify-between">
                        <span className="text-slate-600">العنوان:</span>
                        <span className="text-slate-900 font-medium">{invoice.customerAddress}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Vehicle & Rental Box */}
                <div className="border border-slate-300 rounded-xl p-4 bg-slate-50/50">
                  <h3 className="font-bold text-slate-950 border-b border-slate-200 pb-2 mb-2 flex items-center gap-1.5 text-xs sm:text-sm">
                    <CarIcon className="w-4 h-4 text-slate-700" />
                    <span>بيانات السيارة ومدة الإيجار</span>
                  </h3>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-600">السيارة والموديل:</span>
                      <span className="font-bold text-slate-950">{invoice.carName} {invoice.carModelYear ? `(${invoice.carModelYear})` : ''}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">رقم اللوحة المعدنية:</span>
                      <span className="font-mono font-black text-slate-900 bg-slate-200 px-2 py-0.5 rounded">{invoice.carPlateNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">فترة الإيجار:</span>
                      <span className="font-bold text-slate-900">{invoice.rentalPeriodDesc} ({invoice.durationDays} يوم)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">من / إلى:</span>
                      <span className="font-mono text-slate-900 font-semibold">{invoice.startDate} إلى {invoice.endDate}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Financial Line Items Table */}
              <div className="border-2 border-slate-900 rounded-xl overflow-hidden mb-6">
                <table className="w-full text-right border-collapse text-xs sm:text-sm">
                  <thead className="bg-slate-900 text-white font-bold">
                    <tr>
                      <th className="p-2.5 w-10 text-center">#</th>
                      <th className="p-2.5">البيان / الوصف</th>
                      <th className="p-2.5 text-center w-24">المدة / الكمية</th>
                      <th className="p-2.5 text-left w-32">المبلغ (ج.م)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    <tr>
                      <td className="p-2.5 text-center font-mono font-bold">1</td>
                      <td className="p-2.5">
                        <p className="font-bold text-slate-950">قيمة إيجار سيارة {invoice.carName}</p>
                        <p className="text-[11px] text-slate-500">من تاريخ {invoice.startDate} حتى {invoice.endDate}</p>
                      </td>
                      <td className="p-2.5 text-center font-mono">{invoice.durationDays} يوم</td>
                      <td className="p-2.5 text-left font-mono font-bold text-slate-950">{(invoice.rentalAmount || 0).toLocaleString()}</td>
                    </tr>

                    {invoice.depositAmount && invoice.depositAmount > 0 ? (
                      <tr className="bg-slate-50">
                        <td className="p-2.5 text-center font-mono font-bold">2</td>
                        <td className="p-2.5">
                          <p className="font-bold text-slate-950">مبلغ التأمين النقدي المسترد</p>
                          <p className="text-[11px] text-slate-500">يسترد للعميل بالكامل عند تسليم السيارة بحالتها</p>
                        </td>
                        <td className="p-2.5 text-center font-mono">تأمين</td>
                        <td className="p-2.5 text-left font-mono font-bold text-slate-950">{(invoice.depositAmount || 0).toLocaleString()}</td>
                      </tr>
                    ) : null}

                    {invoice.additionalCharges && invoice.additionalCharges > 0 ? (
                      <tr>
                        <td className="p-2.5 text-center font-mono font-bold">3</td>
                        <td className="p-2.5">
                          <p className="font-bold text-slate-950">رسوم وخدمات إضافية / تسوية</p>
                        </td>
                        <td className="p-2.5 text-center font-mono">إضافي</td>
                        <td className="p-2.5 text-left font-mono font-bold text-slate-950">{(invoice.additionalCharges || 0).toLocaleString()}</td>
                      </tr>
                    ) : null}

                    {invoice.discount && invoice.discount > 0 ? (
                      <tr className="text-emerald-700 bg-emerald-50">
                        <td className="p-2.5 text-center font-mono font-bold">4</td>
                        <td className="p-2.5">
                          <p className="font-bold">خصم تجاري خاص</p>
                        </td>
                        <td className="p-2.5 text-center font-mono">خصم</td>
                        <td className="p-2.5 text-left font-mono font-bold">-{(invoice.discount || 0).toLocaleString()}</td>
                      </tr>
                    ) : null}
                  </tbody>
                </table>
              </div>

              {/* Totals & Payment Summary */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                {/* Payment Details */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">طريقة السداد:</span>
                    <span className="font-bold text-slate-950 bg-white border border-slate-300 px-2.5 py-0.5 rounded-lg">
                      {paymentMethodBadge}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">حالة السداد:</span>
                    <span className="font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-2.5 py-0.5 rounded-lg flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>تم التحصيل والاعتماد</span>
                    </span>
                  </div>
                  <div className="pt-2 text-[11px] text-slate-500 border-t border-slate-200">
                    ملاحظات: {invoice.notes || 'لا توجد ملاحظات إضافية'}
                  </div>
                </div>

                {/* Total Calculation Card */}
                <div className="bg-slate-900 text-white rounded-xl p-4 space-y-2 text-xs font-mono">
                  <div className="flex justify-between text-slate-300">
                    <span>إجمالي القيمة:</span>
                    <span className="font-bold text-sm">{(invoice.totalAmount || 0).toLocaleString()} ج.م</span>
                  </div>
                  <div className="flex justify-between text-emerald-400 text-sm font-bold border-t border-slate-800 pt-1">
                    <span>المبلغ المدفوع (المحصل):</span>
                    <span>{(invoice.paidAmount || 0).toLocaleString()} ج.م</span>
                  </div>
                  <div className="flex justify-between text-amber-400 text-sm font-bold border-t border-slate-800 pt-1">
                    <span>المبلغ المتبقي:</span>
                    <span>{(invoice.remainingAmount || 0).toLocaleString()} ج.م</span>
                  </div>
                </div>
              </div>

            {/* Stamp & Signatures */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t-2 border-slate-900 text-center text-xs font-bold text-slate-900 items-end">
              <div>
                <p className="mb-8">توقيع المستأجر / المستلم</p>
                <div className="border-b border-dotted border-slate-900 w-32 mx-auto"></div>
                <p className="text-[10px] text-slate-500 mt-1 font-normal">{invoice.customerName}</p>
              </div>

              <div className="flex flex-col items-center justify-center">
                {showStamp && (
                  <div className="w-24 h-24 rounded-full border-2 border-rose-700/80 flex flex-col items-center justify-center p-2 text-rose-700 font-serif rotate-[-12deg] shadow-sm">
                    <span className="text-[9px] font-bold">شركة ماستر كي</span>
                    <span className="text-xs font-black">MASTER KEY</span>
                    <span className="text-[8px]">س.ت: {company.commercialRecord}</span>
                    <span className="text-[9px] font-bold text-emerald-700">معتمد إلكترونياً</span>
                  </div>
                )}
              </div>

              <div>
                <p className="mb-8">توقيع المحاسب / الإدارة</p>
                <div className="border-b border-dotted border-slate-900 w-32 mx-auto"></div>
                <p className="text-[10px] text-slate-500 mt-1 font-normal">إدارة الحسابات والخزينة</p>
              </div>
            </div>

            {/* Footer Notice */}
            <div className="text-center text-[10px] text-slate-500 mt-6 pt-3 border-t border-slate-200">
              هذه الفاتورة مستند رسمي صادر عن شركة ماستر كي لتأجير وتوريد السيارات - القاهرة / الجيزة - هاتف: 01146442004 / 01022221258
            </div>
          </div>
        </div>
      </div>

        {/* Modal Bottom Actions */}
        <div className="print:hidden p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between">
          <p className="text-xs text-slate-400">
            يمكنك طباعة الفاتورة على ورق A4 أو مشاركتها مباشرة كملف PDF مع العميل عبر الواتساب.
          </p>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-colors"
          >
            إغلاق
          </button>
        </div>
      </div>

      {/* نافذة مشاركة ملف الـ PDF الأصلي التفاعلية ذات النقرة المباشرة */}
      <SharePdfModal
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        pdfFile={shareModalData.file}
        pdfBlob={shareModalData.blob}
        fileName={shareModalData.fileName}
        documentTitle="فاتورة وسند قبض رسمي"
        documentNumber={invoice.invoiceNumber}
        textMessage={shareModalData.textMessage}
        customerPhone={invoice.customerPhone || relatedContract?.customerSnapshot?.phone}
        customerName={invoice.customerName}
      />
    </div>
  );
};
