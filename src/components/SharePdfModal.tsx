import React, { useState } from 'react';
import { 
  X, 
  Send, 
  Download, 
  Copy, 
  Check, 
  FileText, 
  MessageSquare, 
  Phone, 
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Share2
} from 'lucide-react';
import { openWhatsappChat, downloadBlob } from '../utils/pdfExport';

interface SharePdfModalProps {
  isOpen: boolean;
  onClose: () => void;
  pdfFile: File | null;
  pdfBlob: Blob | null;
  fileName: string;
  documentTitle: string;
  documentNumber: string;
  textMessage: string;
  customerPhone?: string;
  customerName?: string;
}

export const SharePdfModal: React.FC<SharePdfModalProps> = ({
  isOpen,
  onClose,
  pdfFile,
  pdfBlob,
  fileName,
  documentTitle,
  documentNumber,
  textMessage,
  customerPhone,
  customerName
}) => {
  const [copied, setCopied] = useState(false);
  const [shareError, setShareError] = useState<string | null>(null);
  const [isSharing, setIsSharing] = useState(false);

  if (!isOpen) return null;

  const canNativeShareFiles = typeof navigator !== 'undefined' && 
    !!navigator.share && 
    !!navigator.canShare && 
    !!pdfFile && 
    navigator.canShare({ files: [pdfFile] });

  // Direct user gesture triggered from button click
  const handleDirectFileShare = async () => {
    setShareError(null);
    if (!pdfFile) {
      setShareError('ملف الـ PDF غير جاهز بعد، يرجى المحاولة بعد لحظات');
      return;
    }

    try {
      setIsSharing(true);
      // Auto-copy text message as convenience
      if (navigator.clipboard?.writeText) {
        try {
          await navigator.clipboard.writeText(textMessage);
          setCopied(true);
        } catch {}
      }

      if (canNativeShareFiles) {
        // Send PDF file WITH the text message caption
        try {
          await navigator.share({
            title: fileName.replace('.pdf', ''),
            text: textMessage,
            files: [pdfFile],
          });
          onClose();
        } catch (combinedErr: any) {
          if (combinedErr.name === 'AbortError') return;
          // Fallback to files only if the OS rejects combined text+file
          await navigator.share({
            title: fileName.replace('.pdf', ''),
            files: [pdfFile],
          });
          onClose();
        }
      } else {
        // Browser does not support sharing files via Web Share API
        // Download file and open WhatsApp
        if (pdfBlob) {
          downloadBlob(pdfBlob, fileName);
        }
        openWhatsappChat(customerPhone, textMessage, !customerPhone);
        setShareError('المتصفح الحالي لا يدعم إرفاق الملفات برمجياً. تم تحميل ملف الـ PDF على جهازك وفتح واتساب، يرجى سحب الملف أو إرفاقه كـ Document.');
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        // User closed the share sheet
        return;
      }
      console.warn('Direct share error:', err);
      // Fallback
      if (pdfBlob) {
        downloadBlob(pdfBlob, fileName);
      }
      openWhatsappChat(customerPhone, textMessage, !customerPhone);
    } finally {
      setIsSharing(false);
    }
  };

  const handleDownloadOnly = () => {
    if (pdfBlob) {
      downloadBlob(pdfBlob, fileName);
    } else if (pdfFile) {
      downloadBlob(pdfFile, fileName);
    }
  };

  const handleCopyText = async () => {
    if (navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(textMessage);
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
      } catch {}
    }
  };

  const handleOpenWhatsappTextOnly = () => {
    openWhatsappChat(customerPhone, textMessage, !customerPhone);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div 
        className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl overflow-hidden"
        dir="rtl"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">إرسال ملف الـ PDF الأصلي</h3>
              <p className="text-xs text-slate-400">{documentTitle}: <span className="text-emerald-400 font-mono font-semibold">{documentNumber}</span></p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* File Card Preview */}
        <div className="p-4 mb-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 shrink-0">
            <FileText className="w-6 h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-xs font-bold text-slate-200 truncate">{fileName}</p>
              <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 text-[10px] font-semibold border border-emerald-500/30 shrink-0">
                جاهز للإرسال
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">نسخة معتمدة ومختومة رسمياً بصيغة PDF (A4)</p>
          </div>
        </div>

        {/* Text Caption Preview */}
        <div className="p-3 mb-4 rounded-2xl bg-slate-800/40 border border-slate-700/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
              <span>الملخص النصي المرفق مع ملف العقد:</span>
            </span>
            <button
              type="button"
              onClick={handleCopyText}
              className="px-2 py-0.5 rounded-lg bg-slate-700/80 hover:bg-slate-600 text-slate-300 text-[10px] flex items-center gap-1 transition-colors"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-slate-400" />}
              <span>{copied ? 'تم النسخ' : 'نسخ النص'}</span>
            </button>
          </div>
          <pre className="text-[11px] text-slate-300 font-sans whitespace-pre-wrap leading-relaxed bg-slate-950/50 p-2.5 rounded-xl border border-slate-800/80 max-h-36 overflow-y-auto">
            {textMessage}
          </pre>
        </div>

        {shareError && (
          <div className="p-3 mb-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <p>{shareError}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-2.5">
          {/* Main WhatsApp File Share Button */}
          <button
            onClick={handleDirectFileShare}
            disabled={isSharing || !pdfFile}
            className="w-full py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2.5 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60"
          >
            <Send className="w-4 h-4" />
            <span>إرسال ملف الـ PDF عبر واتساب الآن</span>
          </button>

          {/* Download File Directly */}
          <button
            onClick={handleDownloadOnly}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 flex items-center justify-center gap-2 transition-all"
          >
            <Download className="w-4 h-4 text-blue-400" />
            <span>تحميل ملف العقد PDF على هذا الجهاز</span>
          </button>

          {/* Customer direct WhatsApp or text */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={handleOpenWhatsappTextOnly}
              className="py-2.5 px-3 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 text-xs font-medium border border-slate-700/60 flex items-center justify-center gap-1.5 transition-all"
            >
              <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
              <span>إرسال ملخص نصي فقط</span>
            </button>

            <button
              onClick={handleCopyText}
              className="py-2.5 px-3 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 text-xs font-medium border border-slate-700/60 flex items-center justify-center gap-1.5 transition-all"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
              <span>{copied ? 'تم نسخ الملخص' : 'نسخ الملخص'}</span>
            </button>
          </div>
        </div>

        {/* Tip footer */}
        <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400 text-center leading-relaxed">
          💡 على الهواتف: سيفتح واتساب مباشرة لتحديد جهة الاتصال وإرسال ملف الـ PDF كملف مستند رسمي في المحادثة.
        </div>
      </div>
    </div>
  );
};
