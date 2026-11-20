import { toJpeg } from 'html-to-image';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Contract, Invoice } from '../types';

export interface GeneratePdfOptions {
  fileName: string;
  elementId: string;
  title?: string;
}

/**
 * Downloads a Blob directly to the user's device.
 */
export function downloadBlob(blob: Blob, fileName: string): void {
  const cleanFileName = fileName.endsWith('.pdf') ? fileName : `${fileName}.pdf`;
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = cleanFileName;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  setTimeout(() => {
    if (link.parentNode) {
      document.body.removeChild(link);
    }
    URL.revokeObjectURL(url);
  }, 1200);
}

/**
 * Generates a high-quality, authentic A4 PDF Blob from an HTML element (Contract or Invoice).
 * Captures live computed styles, fonts, and layout directly from the rendered DOM.
 * Accurately calculates aspect ratios to prevent any vertical or horizontal stretching or corruption.
 */
export async function generatePdfBlob(elementId: string): Promise<Blob> {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error(`العنصر المطلوب برقم id=${elementId} غير موجود`);
  }

  // 1. Ensure all document images are pre-loaded
  const images = Array.from(element.querySelectorAll('img'));
  await Promise.all(
    images.map((img) => {
      if (img.complete) return Promise.resolve();
      return new Promise<void>((res) => {
        img.onload = () => res();
        img.onerror = () => res();
      });
    })
  );

  // 2. Ensure web fonts are completely loaded
  if (typeof document !== 'undefined' && document.fonts) {
    try {
      await document.fonts.ready;
    } catch {
      // Continue if font ready check fails
    }
  }

  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true,
  });

  const pdfWidth = 210; // A4 standard width in mm
  const pdfMaxHeight = 297; // A4 standard height in mm

  // Check if this is a multi-page contract document (.contract-page)
  const pageElements = element.querySelectorAll<HTMLElement>('.contract-page');

  if (pageElements.length > 0) {
    // Multi-page contract: Each .contract-page maps to an A4 page
    for (let i = 0; i < pageElements.length; i++) {
      const pageEl = pageElements[i];

      let imgData: string;
      let naturalWidth = pageEl.offsetWidth || 820;
      let naturalHeight = pageEl.offsetHeight || 1160;

      try {
        const canvas = await html2canvas(pageEl, {
          scale: 2, // 300 DPI high resolution
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff',
          logging: false,
          scrollX: 0,
          scrollY: 0,
        });
        imgData = canvas.toDataURL('image/jpeg', 0.96);
        naturalWidth = canvas.width;
        naturalHeight = canvas.height;
      } catch (canvasErr) {
        console.warn('html2canvas fallback to toJpeg:', canvasErr);
        imgData = await toJpeg(pageEl, {
          quality: 0.96,
          pixelRatio: 2,
          backgroundColor: '#ffffff',
          cacheBust: true,
        });
      }

      if (i > 0) {
        pdf.addPage();
      }

      // Calculate proportional height to preserve 100% natural aspect ratio (NO stretching)
      const proportionalHeight = (naturalHeight * pdfWidth) / naturalWidth;
      if (proportionalHeight <= pdfMaxHeight) {
        pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, proportionalHeight, undefined, 'FAST');
      } else {
        // Scale down proportionally to fit within 1 A4 page
        const scale = (pdfMaxHeight - 2) / proportionalHeight;
        const scaledWidth = pdfWidth * scale;
        const offsetX = (pdfWidth - scaledWidth) / 2;
        pdf.addImage(imgData, 'JPEG', offsetX, 1, scaledWidth, pdfMaxHeight - 2, undefined, 'FAST');
      }
    }
  } else {
    // Single-page document (e.g., Invoice)
    let imgData: string;
    let naturalWidth = element.offsetWidth || 820;
    let naturalHeight = element.offsetHeight || 1000;

    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        scrollX: 0,
        scrollY: 0,
      });
      imgData = canvas.toDataURL('image/jpeg', 0.96);
      naturalWidth = canvas.width;
      naturalHeight = canvas.height;
    } catch (canvasErr) {
      console.warn('html2canvas fallback to toJpeg:', canvasErr);
      imgData = await toJpeg(element, {
        quality: 0.96,
        pixelRatio: 2,
        backgroundColor: '#ffffff',
        cacheBust: true,
      });
    }

    // Preserve true proportional aspect ratio
    const proportionalHeight = (naturalHeight * pdfWidth) / naturalWidth;
    if (proportionalHeight <= pdfMaxHeight) {
      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, proportionalHeight, undefined, 'FAST');
    } else {
      const scale = (pdfMaxHeight - 2) / proportionalHeight;
      const scaledWidth = pdfWidth * scale;
      const offsetX = (pdfWidth - scaledWidth) / 2;
      pdf.addImage(imgData, 'JPEG', offsetX, 1, scaledWidth, pdfMaxHeight - 2, undefined, 'FAST');
    }
  }

  return pdf.output('blob');
}

/**
 * Downloads a high quality A4 PDF file directly to user device
 */
export async function downloadElementAsPdf(elementId: string, fileName: string): Promise<void> {
  const blob = await generatePdfBlob(elementId);
  const cleanFileName = fileName.endsWith('.pdf') ? fileName : `${fileName}.pdf`;
  
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = cleanFileName;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  
  setTimeout(() => {
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, 1000);
}

/**
 * Clean Print Utility: Isolates the document into an A4 iframe and prints only the official contract/invoice
 * without any UI distractions, clipping, or dark backgrounds on both mobile and desktop.
 */
export function printElementCleanly(elementId: string): void {
  const element = document.getElementById(elementId);
  if (!element) {
    window.print();
    return;
  }

  // Create an isolated hidden iframe for 100% clean paper printing
  const printIframe = document.createElement('iframe');
  printIframe.style.position = 'fixed';
  printIframe.style.right = '0';
  printIframe.style.bottom = '0';
  printIframe.style.width = '0';
  printIframe.style.height = '0';
  printIframe.style.border = '0';
  document.body.appendChild(printIframe);

  const doc = printIframe.contentDocument || printIframe.contentWindow?.document;
  if (!doc) {
    window.print();
    return;
  }

  const styles = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
    .map(style => style.outerHTML)
    .join('\n');

  doc.open();
  doc.write(`
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=850, initial-scale=1">
      <title>طباعة وثيقة رسمية A4 - Master Key KRM</title>
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <link href="https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400;1,700&family=Cairo:wght@400;600;700;900&family=Tajawal:wght@400;500;700;900&display=swap" rel="stylesheet">
      ${styles}
      <style>
        @page {
          size: A4 portrait;
          margin: 8mm 6mm;
        }
        * {
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
          box-sizing: border-box;
        }
        html, body {
          background-color: #ffffff !important;
          color: #000000 !important;
          margin: 0 !important;
          padding: 0 !important;
          width: 100% !important;
          max-width: 100% !important;
          font-family: 'Amiri', 'Tajawal', 'Cairo', serif, sans-serif !important;
        }
        .print-container {
          width: 820px !important;
          max-width: 820px !important;
          min-width: 820px !important;
          padding: 0;
          margin: 0 auto !important;
          background: #ffffff !important;
          color: #000000 !important;
        }
        .print\\:hidden, .no-print, button {
          display: none !important;
        }
        table {
          page-break-inside: auto;
        }
        tr, .contract-article, .signature-block {
          page-break-inside: avoid !important;
          break-inside: avoid !important;
        }
      </style>
    </head>
    <body>
      <div class="print-container">
        ${element.outerHTML}
      </div>
    </body>
    </html>
  `);
  doc.close();

  // Give iframe time to render fonts and styles before invoking print
  setTimeout(() => {
    try {
      printIframe.contentWindow?.focus();
      printIframe.contentWindow?.print();
    } catch {
      window.print();
    } finally {
      setTimeout(() => {
        document.body.removeChild(printIframe);
      }, 2000);
    }
  }, 400);
}

/**
 * Formats phone numbers for WhatsApp wa.me links.
 * Handles Egyptian mobile formats (e.g. 010..., 011..., 012..., 015...),
 * removes spaces/dashes, and formats to international format without plus.
 */
export function formatEgyptianPhoneNumberForWhatsapp(phone?: string): string {
  if (!phone) return '';
  // Convert Eastern Arabic-Indic numerals (٠-٩) to standard 0-9
  const normalized = phone.replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d).toString());
  let clean = normalized.replace(/[^0-9]/g, '');
  if (!clean) return '';
  
  if (clean.startsWith('0020')) {
    clean = clean.substring(2);
  } else if (clean.startsWith('20') && clean.length === 12) {
    // already 201xxxxxxxxx
  } else if (clean.startsWith('01') && clean.length === 11) {
    clean = `20${clean.substring(1)}`;
  } else if (clean.startsWith('1') && clean.length === 10) {
    clean = `20${clean}`;
  } else if (clean.startsWith('0') && clean.length === 11) {
    clean = `20${clean.substring(1)}`;
  }
  
  // Valid Egyptian mobile number in international format must be exactly 12 digits: 2010, 2011, 2012, or 2015
  if (/^201[0125]\d{8}$/.test(clean)) {
    return clean;
  }
  
  // Any incomplete or non-matching number (like "01") must return empty string
  // so WhatsApp never gets locked to an invalid phone number and instead opens contact selection!
  return '';
}

/**
 * Generates the canonical URL for downloading and viewing the authentic PDF document
 * online to prevent formatting loss and preserve legal authenticity.
 */
export function buildDocumentShareUrl(type: 'contract' | 'invoice', identifier: string): string {
  if (typeof window === 'undefined') return '';
  const origin = window.location.origin;
  const pathname = window.location.pathname.replace(/\/+$/, '');
  const base = `${origin}${pathname}`;
  return `${base}?${type}=${encodeURIComponent(identifier)}&download=pdf`;
}

/**
 * Builds a structured, professional WhatsApp text message for a Contract,
 * exactly matching the required format with clean vehicle, customer, period, and amount info.
 */
export function buildContractWhatsappMessage(
  contract: Contract,
  companyPhone?: string,
  downloadUrl?: string
): string {
  const customerName = contract.customerSnapshot?.fullName || contract.secondPartyRepresentative || 'العميل الكريم';
  const carName = contract.carSnapshot?.name || 'السيارة المؤجرة';
  const plateNumber = contract.carSnapshot?.plateNumber || '';
  const amount = ((contract.rentalAmount ?? contract.totalRentAmount) || 0).toLocaleString();
  const phoneContact = companyPhone || '01022221258';

  return `مرحباً ${customerName}،
مرفق عقد إيجار السيارة الرسمي بصيغة PDF من شركة ماستر كي (KRM):
📄 رقم العقد: ${contract.contractNumber}
🚗 السيارة: ${carName}${plateNumber ? ` (${plateNumber})` : ''}
📅 الفترة: من ${contract.startDate} إلى ${contract.endDate}
💰 القيمة: ${amount} ج.م
للتواصل: ${phoneContact}`;
}

/**
 * Builds a structured, professional WhatsApp text message for an Invoice / Payment Receipt.
 */
export function buildInvoiceWhatsappMessage(
  invoice: Invoice,
  companyPhone?: string,
  relatedContract?: Contract,
  downloadUrl?: string
): string {
  const customerName = invoice.customerName || relatedContract?.customerSnapshot?.fullName || 'العميل الكريم';
  const contractNumber = invoice.contractNumber || relatedContract?.contractNumber || '---';
  const carName = invoice.carName || relatedContract?.carSnapshot?.name || 'السيارة';
  const carPlate = invoice.carPlateNumber || relatedContract?.carSnapshot?.plateNumber || '';
  const paid = (invoice.paidAmount || 0).toLocaleString();
  const phoneContact = companyPhone || '01022221258';

  return `مرحباً ${customerName}،
مرفق سند القبض والفاتورة الرسمية بصيغة PDF من شركة ماستر كي (KRM):
🧾 رقم الفاتورة: ${invoice.invoiceNumber}
📄 رقم العقد: ${contractNumber}
🚗 السيارة: ${carName}${carPlate ? ` (${carPlate})` : ''}
💵 المبلغ المدفوع: ${paid} ج.م
للتواصل: ${phoneContact}`;
}

/**
 * Opens WhatsApp chat directly with a pre-filled structured message.
 * - On Mobile (Android / iOS): Launches the WhatsApp application directly via 'whatsapp://send' protocol
 *   so the native app opens instantly to the Contact Chooser screen ("إرسال إلى...").
 * - On Desktop: Opens WhatsApp Web in a clean new tab reusing the active logged-in session (no login loops).
 * - forceContactSelection: When true, omits any phone number so WhatsApp lets the user choose any contact or group.
 */
export function openWhatsappChat(
  recipientPhone?: string,
  textMessage?: string,
  forceContactSelection: boolean = false
): void {
  const cleanPhone = forceContactSelection ? '' : formatEgyptianPhoneNumberForWhatsapp(recipientPhone);
  const defaultText = textMessage || 'السلام عليكم ورحمة الله، مرفق تفاصيل العقد الرسمي من شركة ماستر كي لتأجير وتوريد السيارات.';
  const encodedText = encodeURIComponent(defaultText);

  const isMobile = typeof navigator !== 'undefined' && (
    /Android|iPhone|iPad|iPod|webOS|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
    (typeof navigator.maxTouchPoints === 'number' && navigator.maxTouchPoints > 2)
  );

  if (isMobile) {
    // 1. Mobile devices (Android / iOS):
    // Directly navigate to the whatsapp:// scheme to launch the installed native WhatsApp application.
    // Without phone parameter, WhatsApp ALWAYS opens the native Contact Chooser ("إرسال إلى...").
    const appSchemeUrl = cleanPhone
      ? `whatsapp://send?phone=${cleanPhone}&text=${encodedText}`
      : `whatsapp://send?text=${encodedText}`;

    // Directly assign without delay or setTimeout fallback so user gesture is preserved and web.whatsapp.com is NOT triggered
    window.location.href = appSchemeUrl;
  } else {
    // 2. Desktop PC:
    // Open web.whatsapp.com reusing the named window to avoid spawning multiple competing tabs
    const desktopUrl = cleanPhone
      ? `https://web.whatsapp.com/send?phone=${cleanPhone}&text=${encodedText}`
      : `https://web.whatsapp.com/send?text=${encodedText}`;

    window.open(desktopUrl, 'whatsapp_web_window');
  }
}

/**
 * Shares the actual authentic PDF document file directly using the native mobile share sheet (Web Share API).
 * Enables the user to pick WhatsApp or any app on their phone to send the genuine PDF file as an attachment.
 */
export async function shareDocumentAsFile(
  elementId: string,
  fileName: string,
  recipientPhone?: string,
  textMessage?: string
): Promise<'shared' | 'downloaded'> {
  const sanitizedFileName = fileName.endsWith('.pdf') ? fileName : `${fileName}.pdf`;
  const blob = await generatePdfBlob(elementId);
  const pdfFile = new File([blob], sanitizedFileName, { type: 'application/pdf' });

  if (typeof navigator !== 'undefined' && navigator.canShare && navigator.canShare({ files: [pdfFile] })) {
    try {
      await navigator.share({
        files: [pdfFile],
        title: sanitizedFileName,
        text: textMessage || 'مرفق ملف العقد الأصلي المعتمد (PDF)',
      });
      return 'shared';
    } catch (err: any) {
      if (err.name === 'AbortError') {
        return 'shared';
      }
      console.warn('Native share error, falling back to download:', err);
    }
  }

  // Fallback: Download file directly
  downloadBlob(blob, sanitizedFileName);
  return 'downloaded';
}

/**
 * Shares the authentic official PDF document directly via WhatsApp / Native Share:
 * 1. Generates the high-resolution A4 PDF blob (or uses a pre-cached blob) and creates a genuine File object.
 * 2. Copies the summary text to clipboard so it is never lost and easily pasted.
 * 3. On Mobile (Android & iOS): Invokes Web Share API with ONLY the PDF file in `files`.
 *    CRITICAL FIX: We do NOT include `text` containing URLs in the `navigator.share()` payload!
 *    When `text` is included with a URL, WhatsApp on Android prioritizes the text and drops the PDF file stream.
 *    Sharing ONLY `files: [pdfFile]` forces WhatsApp to open the Document Attachment view with the actual PDF!
 * 4. Returns the result and the generated File object so the UI can offer a seamless fallback if needed.
 */
export async function sharePdfViaWhatsapp(
  elementId: string, 
  fileName: string, 
  recipientPhone?: string, 
  textMessage?: string,
  existingBlob?: Blob
): Promise<{ method: 'share_api' | 'download_and_whatsapp' | 'file_ready'; file: File; blob: Blob }> {
  const sanitizedFileName = fileName.endsWith('.pdf') ? fileName : `${fileName}.pdf`;
  const defaultText = textMessage || 'السلام عليكم ورحمة الله، مرفق ملف العقد الرسمي من شركة ماستر كي لتأجير وتوريد السيارات.';

  // 1. Generate or use existing authentic A4 PDF file
  const blob = existingBlob || await generatePdfBlob(elementId);
  const pdfFile = new File([blob], sanitizedFileName, { type: 'application/pdf' });

  // 2. Auto-copy text message to clipboard for mobile & desktop convenience
  if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
    try {
      await navigator.clipboard.writeText(defaultText);
    } catch {}
  }

  // 3. Mobile Primary: Share the PDF file WITH the concise summary text as a caption!
  if (typeof navigator !== 'undefined' && navigator.share && navigator.canShare) {
    try {
      if (navigator.canShare({ files: [pdfFile] })) {
        try {
          // Send both the PDF file AND the clean text summary (without URLs)
          await navigator.share({
            title: sanitizedFileName.replace('.pdf', ''),
            text: defaultText,
            files: [pdfFile],
          });
          return { method: 'share_api', file: pdfFile, blob };
        } catch (combinedErr: any) {
          if (combinedErr.name === 'AbortError') {
            return { method: 'share_api', file: pdfFile, blob };
          }
          // If the OS doesn't support text with files, fall back to sharing the file alone
          await navigator.share({
            title: sanitizedFileName.replace('.pdf', ''),
            files: [pdfFile],
          });
          return { method: 'share_api', file: pdfFile, blob };
        }
      }
    } catch (shareErr: any) {
      if (shareErr.name === 'AbortError') {
        // User closed the share sheet
        return { method: 'share_api', file: pdfFile, blob };
      }
      console.warn('Native share with file failed:', shareErr);
    }
  }

  // 4. Desktop / Browser Fallback:
  // Auto-download the PDF file directly to device
  downloadBlob(blob, sanitizedFileName);

  return { method: 'download_and_whatsapp', file: pdfFile, blob };
}

