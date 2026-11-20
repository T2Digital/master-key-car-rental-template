import React, { useState } from 'react';
import { 
  Table2, 
  PlusCircle, 
  Download, 
  RotateCcw, 
  Search, 
  Filter, 
  Trash2, 
  Edit3, 
  Check, 
  X, 
  TrendingUp, 
  TrendingDown, 
  Wallet,
  Sparkles,
  Copy,
  Car as CarIcon,
  Users,
  Calendar,
  Layers,
  FileSpreadsheet,
  Receipt,
  FileText,
  Phone,
  Gauge,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { SheetRow, OperationRow, Contract, Invoice } from '../types';
import { useApp } from '../context/AppContext';

interface GoogleSheetSyncViewProps {
  onOpenNewTransactionModal: () => void;
  onOpenContract?: (contractId: string) => void;
  onOpenInvoiceModal?: (invoice: Invoice) => void;
}

export const GoogleSheetSyncView: React.FC<GoogleSheetSyncViewProps> = ({
  onOpenNewTransactionModal,
  onOpenContract,
  onOpenInvoiceModal,
}) => {
  const { 
    sheetRows, 
    addSheetRow, 
    updateSheetRow, 
    deleteSheetRow, 
    resetToInitialSheet,
    operationRows,
    addOperationRow,
    updateOperationRow,
    deleteOperationRow,
    resetToInitialOperations,
    contracts,
    invoices,
    generateInvoiceForContract,
    showToast, 
    cars 
  } = useApp();
  
  // Sheet tab switcher: 'operations' (تشغيل عام) vs 'financials' (حسابات خاصة)
  const [activeSheetTab, setActiveSheetTab] = useState<'operations' | 'financials'>('operations');

  // Search and filters
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Editing states for Financial Sheet (حسابات خاصة)
  const [editingSheetRowId, setEditingSheetRowId] = useState<string | null>(null);
  const [sheetEditData, setSheetEditData] = useState<Partial<SheetRow>>({});

  // Editing states for Operational Sheet (تشغيل عام)
  const [editingOpRowId, setEditingOpRowId] = useState<string | null>(null);
  const [opEditData, setOpEditData] = useState<Partial<OperationRow>>({});

  // New Operation Modal State
  const [showAddOpModal, setShowAddOpModal] = useState(false);
  const [newOpForm, setNewOpForm] = useState({
    carName: 'شيفروليه أوبترا (كحلي)',
    plateNumber: 'س ل ص 2854',
    customerName: '',
    customerPhone: '',
    customerNationalId: '',
    rentalPeriod: 'شهر كامل',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    rate: 15000,
    paidAmount: 15000,
    initialMileage: 48500,
    status: 'active' as const,
    notes: 'تسجيل يدوي في ورقة تشغيل عام',
  });

  // Filtered Financial Rows (حسابات خاصة)
  const filteredFinancialRows = sheetRows.filter(row => {
    const matchesSearch = 
      row.revenueReason.toLowerCase().includes(searchTerm.toLowerCase()) ||
      row.expenseReason.toLowerCase().includes(searchTerm.toLowerCase()) ||
      row.date.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (row.notes && row.notes.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory = categoryFilter === 'all' || row.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  // Filtered Operation Rows (تشغيل عام)
  const filteredOperationRows = operationRows.filter(op => {
    const matchesSearch = 
      op.carName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      op.plateNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      op.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      op.customerPhone.includes(searchTerm) ||
      op.customerNationalId.includes(searchTerm) ||
      (op.notes && op.notes.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || op.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Financial Sheet Calculations
  const totalRevenue = sheetRows.reduce((sum, r) => sum + (r.revenue || 0), 0);
  const totalExpense = sheetRows.reduce((sum, r) => sum + (r.expense || 0), 0);
  const grandFinancialTotal = totalRevenue - totalExpense;

  // Operations Sheet Calculations
  const totalOperationsCount = operationRows.length;
  const activeOperationsCount = operationRows.filter(o => o.status === 'active').length;
  const totalOperationsVolume = operationRows.reduce((sum, o) => sum + (o.rate || 0), 0);
  const totalOperationsPaid = operationRows.reduce((sum, o) => sum + (o.paidAmount || 0), 0);

  // Financial Inline Editing Handlers
  const startEditingSheetRow = (row: SheetRow) => {
    setEditingSheetRowId(row.id);
    setSheetEditData({
      revenue: row.revenue,
      revenueReason: row.revenueReason,
      expense: row.expense,
      expenseReason: row.expenseReason,
      date: row.date,
      notes: row.notes,
    });
  };

  const saveSheetRowEditing = (id: string) => {
    updateSheetRow(id, sheetEditData);
    setEditingSheetRowId(null);
    setSheetEditData({});
  };

  const cancelSheetRowEditing = () => {
    setEditingSheetRowId(null);
    setSheetEditData({});
  };

  // Operation Inline Editing Handlers
  const startEditingOpRow = (row: OperationRow) => {
    setEditingOpRowId(row.id);
    setOpEditData({
      carName: row.carName,
      plateNumber: row.plateNumber,
      customerName: row.customerName,
      customerPhone: row.customerPhone,
      rentalPeriod: row.rentalPeriod,
      rate: row.rate,
      paidAmount: row.paidAmount,
      initialMileage: row.initialMileage,
      status: row.status,
      notes: row.notes,
    });
  };

  const saveOpRowEditing = (id: string) => {
    updateOperationRow(id, opEditData);
    setEditingOpRowId(null);
    setOpEditData({});
  };

  const cancelOpRowEditing = () => {
    setEditingOpRowId(null);
    setOpEditData({});
  };

  // Quick Financial Presets
  const handleQuickAddFinancial = (type: 'installment_navy' | 'installment_silver' | 'rent_elantra' | 'oil_change') => {
    const today = new Date().toISOString().split('T')[0];
    if (type === 'installment_navy') {
      addSheetRow({
        revenue: null,
        revenueReason: '',
        expense: 10000,
        expenseReason: 'قسط اوبترا كحلي',
        date: today,
        carId: 'car-optra-navy',
        category: 'installment',
        notes: 'سداد قسط أوبترا كحلي',
      });
    } else if (type === 'installment_silver') {
      addSheetRow({
        revenue: null,
        revenueReason: '',
        expense: 10600,
        expenseReason: 'قسط اوبترا فضي',
        date: today,
        carId: 'car-optra-silver',
        category: 'installment',
        notes: 'سداد قسط أوبترا فضي',
      });
    } else if (type === 'rent_elantra') {
      addSheetRow({
        revenue: 25000,
        revenueReason: 'ايجار النترا شهر',
        expense: null,
        expenseReason: '',
        date: today,
        carId: 'car-elantra',
        category: 'rental_income',
        notes: 'إيجار شهري هيونداي إلنترا',
      });
    } else if (type === 'oil_change') {
      addSheetRow({
        revenue: null,
        revenueReason: '',
        expense: 2800,
        expenseReason: 'صيانة زيت وفلتر 10 آلاف كم',
        date: today,
        category: 'maintenance',
        notes: 'تغيير زيت وفلتر أصلي',
      });
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    if (activeSheetTab === 'financials') {
      const headers = ['عمود1 (الإيراد)', 'السبب', 'المصروفات', 'السبب2', 'الاجمالي', 'التاريخ', 'ملاحظات'];
      const rows = sheetRows.map(r => [
        r.revenue !== null ? r.revenue : '',
        `"${(r.revenueReason || '').replace(/"/g, '""')}"`,
        r.expense !== null ? r.expense : '',
        `"${(r.expenseReason || '').replace(/"/g, '""')}"`,
        r.total,
        r.date,
        `"${(r.notes || '').replace(/"/g, '""')}"`
      ]);

      const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `MasterKey_حسابات_خاصة_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast('تم تصدير ورقة حسابات خاصة بصيغة CSV بنجاح', 'success');
    } else {
      const headers = ['م', 'السيارة', 'رقم اللوحة', 'المستأجر', 'الهاتف', 'الرقم القومي', 'المدة', 'من', 'إلى', 'السعر', 'المدفوع', 'العداد', 'الحالة', 'ملاحظات'];
      const rows = operationRows.map((o, idx) => [
        idx + 1,
        `"${o.carName.replace(/"/g, '""')}"`,
        `"${o.plateNumber.replace(/"/g, '""')}"`,
        `"${o.customerName.replace(/"/g, '""')}"`,
        `"${o.customerPhone}"`,
        `"${o.customerNationalId}"`,
        `"${o.rentalPeriod}"`,
        o.startDate,
        o.endDate,
        o.rate,
        o.paidAmount,
        o.initialMileage,
        o.status === 'active' ? 'نشط' : o.status === 'completed' ? 'مكتمل' : 'تم التجديد',
        `"${(o.notes || '').replace(/"/g, '""')}"`
      ]);

      const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `MasterKey_تشغيل_عام_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast('تم تصدير ورقة تشغيل عام بصيغة CSV بنجاح', 'success');
    }
  };

  // Copy Table
  const handleCopyTable = () => {
    if (activeSheetTab === 'financials') {
      const text = sheetRows.map(r => `${r.revenue || ''}\t${r.revenueReason}\t${r.expense || ''}\t${r.expenseReason}\t${r.total}\t${r.date}`).join('\n');
      navigator.clipboard.writeText(text);
      showToast('تم نسخ ورقة حسابات خاصة إلى الحافظة (جاهزة للصق في Google Sheets)', 'success');
    } else {
      const text = operationRows.map((o, idx) => `${idx + 1}\t${o.carName}\t${o.plateNumber}\t${o.customerName}\t${o.customerPhone}\t${o.rentalPeriod}\t${o.startDate}\t${o.endDate}\t${o.rate}\t${o.paidAmount}\t${o.initialMileage}`).join('\n');
      navigator.clipboard.writeText(text);
      showToast('تم نسخ ورقة تشغيل عام إلى الحافظة (جاهزة للصق في Google Sheets)', 'success');
    }
  };

  // Open Invoice for Operation Row
  const handlePrintInvoiceForOperation = (op: OperationRow) => {
    if (op.contractId) {
      const existingContract = contracts.find(c => c.id === op.contractId);
      if (existingContract) {
        const inv = generateInvoiceForContract(existingContract);
        if (onOpenInvoiceModal) onOpenInvoiceModal(inv);
        return;
      }
    }
    
    // Find matching invoice or generate virtual one
    const matchingInv = invoices.find(i => i.customerName === op.customerName || i.carPlateNumber === op.plateNumber);
    if (matchingInv && onOpenInvoiceModal) {
      onOpenInvoiceModal(matchingInv);
    } else {
      const tempContract: Contract = {
        id: `op-c-${op.id}`,
        contractNumber: `MK-OP-${op.index || 1}`,
        carId: op.carId || 'car-1',
        customerId: 'cust-1',
        customerSnapshot: {
          fullName: op.customerName,
          nationalId: op.customerNationalId || '29000000000000',
          nationality: 'مصري',
          address: 'القاهرة / الجيزة',
          job: 'عميل تشغيل',
          licenseNumber: 'رخصة قيادة سارية',
          phone: op.customerPhone,
        },
        carSnapshot: {
          name: op.carName,
          brand: 'تأجير',
          modelYear: '2024',
          color: 'فضي',
          ownerName: 'ماستر كي',
          plateNumber: op.plateNumber,
          trafficUnit: 'مرور الجيزة',
          chassisNumber: 'MK-CHASSIS-01',
          motorNumber: 'MK-ENGINE-01',
        },
        contractDayName: 'اليوم',
        contractDate: op.startDate,
        contractTime: '12:00 م',
        startDate: op.startDate,
        endDate: op.endDate,
        durationDays: 30,
        durationType: 'monthly',
        rentalAmount: op.rate,
        depositAmount: 3000,
        paidAmount: op.paidAmount,
        paymentStatus: op.paidAmount >= op.rate ? 'paid' : 'partial',
        allowedDailyKm: 120,
        excessKmRate: 5,
        initialMileage: op.initialMileage,
        fuelOut: 'ممتلئ (Full)',
        status: op.status === 'active' ? 'active' : 'completed',
        createdAt: new Date().toISOString(),
      };
      const inv = generateInvoiceForContract(tempContract);
      if (onOpenInvoiceModal) onOpenInvoiceModal(inv);
    }
  };

  const handleAddOperationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOpForm.customerName || !newOpForm.customerPhone) {
      showToast('يرجى ملء اسم المستأجر ورقم الهاتف', 'error');
      return;
    }

    addOperationRow({
      carName: newOpForm.carName,
      plateNumber: newOpForm.plateNumber,
      customerName: newOpForm.customerName,
      customerPhone: newOpForm.customerPhone,
      customerNationalId: newOpForm.customerNationalId || '29000000000000',
      rentalPeriod: newOpForm.rentalPeriod,
      startDate: newOpForm.startDate,
      endDate: newOpForm.endDate,
      rate: Number(newOpForm.rate),
      paidAmount: Number(newOpForm.paidAmount),
      initialMileage: Number(newOpForm.initialMileage),
      status: newOpForm.status,
      notes: newOpForm.notes,
    });

    // Also sync to financial sheet if amount paid
    if (Number(newOpForm.paidAmount) > 0) {
      addSheetRow({
        revenue: Number(newOpForm.paidAmount),
        revenueReason: `ايجار ${newOpForm.carName} (${newOpForm.rentalPeriod})`,
        expense: null,
        expenseReason: '',
        date: newOpForm.startDate,
        category: 'rental_income',
        notes: `مزامنة آلية من تشغيل عام للمستأجر ${newOpForm.customerName}`,
      });
    }

    setShowAddOpModal(false);
    setNewOpForm({
      carName: 'شيفروليه أوبترا (كحلي)',
      plateNumber: 'س ل ص 2854',
      customerName: '',
      customerPhone: '',
      customerNationalId: '',
      rentalPeriod: 'شهر كامل',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      rate: 15000,
      paidAmount: 15000,
      initialMileage: 48500,
      status: 'active',
      notes: 'تسجيل يدوي في ورقة تشغيل عام',
    });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      
      {/* Main Sheet Header Banner */}
      <div className="bg-slate-900/95 border border-amber-500/30 rounded-3xl p-6 shadow-xl flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-white font-['Cairo',sans-serif]">
                منظومة شيت جوجل المتكاملة (Master Key Sheets)
              </h1>
              <p className="text-xs sm:text-sm text-slate-400">
                دمج كامل بين قاعدة البيانات التشغيلية <strong className="text-amber-300">(ورقة 1: تشغيل عام)</strong> والقسم المالي <strong className="text-emerald-300">(ورقة 2: حسابات خاصة)</strong>
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {activeSheetTab === 'operations' ? (
            <button
              onClick={() => setShowAddOpModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all hover:scale-105"
            >
              <PlusCircle className="w-4 h-4" />
              <span>إضافة عملية تشغيل جديدة</span>
            </button>
          ) : (
            <button
              onClick={onOpenNewTransactionModal}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/20 transition-all hover:scale-105"
            >
              <PlusCircle className="w-4 h-4" />
              <span>إضافة قيد مالي جديد</span>
            </button>
          )}

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-all shadow"
            title="تصدير الشيت الحالي كملف CSV متوافق مع Excel و Google Sheets"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>تصدير CSV</span>
          </button>

          <button
            onClick={handleCopyTable}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-all shadow"
            title="نسخ بيانات الجدول الحالي للصق المباشر في Google Sheets"
          >
            <Copy className="w-4 h-4 text-blue-400" />
            <span>نسخ لجوجل شيت</span>
          </button>
        </div>
      </div>

      {/* Sheet Tabs Selector (Switch between ورقة 1: تشغيل عام and ورقة 2: حسابات خاصة) */}
      <div className="flex bg-slate-900/80 p-1.5 rounded-2xl border border-slate-800 shadow-md">
        <button
          onClick={() => { setActiveSheetTab('operations'); setSearchTerm(''); }}
          className={`flex-1 flex items-center justify-center gap-2.5 py-3 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeSheetTab === 'operations'
              ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-lg shadow-amber-500/20 scale-[1.01]'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>ورقة 1: تشغيل عام (قاعدة البيانات التشغيلية للأسطول)</span>
          <span className={`px-2 py-0.5 rounded-full text-xs font-mono font-bold ${
            activeSheetTab === 'operations' ? 'bg-slate-950/20 text-slate-950' : 'bg-slate-800 text-slate-300'
          }`}>
            {operationRows.length} عملية
          </span>
        </button>

        <button
          onClick={() => { setActiveSheetTab('financials'); setSearchTerm(''); }}
          className={`flex-1 flex items-center justify-center gap-2.5 py-3 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeSheetTab === 'financials'
              ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-600/20 scale-[1.01]'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
          }`}
        >
          <Wallet className="w-4 h-4" />
          <span>ورقة 2: حسابات خاصة (القسم المالي الوارد والصادر والمصروفات)</span>
          <span className={`px-2 py-0.5 rounded-full text-xs font-mono font-bold ${
            activeSheetTab === 'financials' ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-300'
          }`}>
            {sheetRows.length} قيد
          </span>
        </button>
      </div>

      {/* =========================================================================
          TAB 1: ورقة 1 (تشغيل عام - General Operations Operational Database)
         ========================================================================= */}
      {activeSheetTab === 'operations' && (
        <div className="space-y-6">
          
          {/* Operations KPI Summary Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400 block">إجمالي عمليات التشغيل</span>
                <span className="text-2xl font-black text-white font-mono">
                  {totalOperationsCount}
                </span>
                <span className="text-[11px] text-amber-400 block mt-0.5">في قاعدة بيانات الشيت</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                <CarIcon className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400 block">العقود النشطة الحالية</span>
                <span className="text-2xl font-black text-emerald-400 font-mono">
                  {activeOperationsCount}
                </span>
                <span className="text-[11px] text-emerald-400 block mt-0.5">سيارة قيد التشغيل الفعلي</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400 block">إجمالي قيمة عقود التشغيل</span>
                <span className="text-xl font-black text-blue-400 font-mono">
                  {totalOperationsVolume.toLocaleString()} ج.م
                </span>
                <span className="text-[11px] text-slate-400 block mt-0.5">قيمة الإيجارات المتفق عليها</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400 block">المبالغ المحصلة فعلياً</span>
                <span className="text-xl font-black text-emerald-400 font-mono">
                  {totalOperationsPaid.toLocaleString()} ج.م
                </span>
                <span className="text-[11px] text-emerald-400/80 block mt-0.5">تم ترحيلها للحسابات الخاصة</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <Wallet className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between shadow-lg">
            <div className="relative w-full md:w-96">
              <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="بحث بالسيارة، المستأجر، اللوحة، رقم التليفون، أو القومي..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl pr-10 pl-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
              {[
                { id: 'all', label: 'كافة العمليات' },
                { id: 'active', label: 'نشط حالياً' },
                { id: 'completed', label: 'مكتمل ومستلم' },
                { id: 'renewed', label: 'تم تجديده' },
              ].map((st) => (
                <button
                  key={st.id}
                  onClick={() => setStatusFilter(st.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                    statusFilter === st.id
                      ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold shadow'
                      : 'bg-slate-950/60 text-slate-400 hover:text-white border-slate-800'
                  }`}
                >
                  {st.label}
                </button>
              ))}

              <button
                onClick={resetToInitialOperations}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700"
                title="استعادة بيانات تشغيل عام الأصلية"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Operational Sheet Interactive Table (ورقة 1: تشغيل عام) */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
            <div className="overflow-x-auto max-h-[650px] scrollbar-thin scrollbar-thumb-slate-700">
              <table className="w-full text-right border-collapse text-xs sm:text-sm">
                <thead className="bg-slate-950/90 text-slate-300 sticky top-0 z-10 border-b border-slate-800 font-['Cairo',sans-serif]">
                  <tr>
                    <th className="p-3 w-10 text-center text-slate-500 font-mono">م</th>
                    <th className="p-3 font-bold text-slate-100 border-r border-slate-800 whitespace-nowrap">اسم العميل</th>
                    <th className="p-3 font-bold text-slate-200 border-r border-slate-800 whitespace-nowrap">رقم الهاتف</th>
                    <th className="p-3 font-bold text-amber-400 border-r border-slate-800 whitespace-nowrap">السيارة</th>
                    <th className="p-3 font-bold text-slate-200 border-r border-slate-800 whitespace-nowrap">رقم اللوحه</th>
                    <th className="p-3 font-bold text-slate-300 border-r border-slate-800 whitespace-nowrap">بداية العقد</th>
                    <th className="p-3 font-bold text-slate-300 border-r border-slate-800 whitespace-nowrap">نهاية العقد</th>
                    <th className="p-3 font-bold text-blue-400 border-r border-slate-800 whitespace-nowrap">كم خروج</th>
                    <th className="p-3 font-bold text-blue-300 border-r border-slate-800 whitespace-nowrap">كم دخول</th>
                    <th className="p-3 font-bold text-slate-400 border-r border-slate-800 whitespace-nowrap">ساعة الخروج</th>
                    <th className="p-3 font-bold text-slate-400 border-r border-slate-800 whitespace-nowrap">ساعة الدخول</th>
                    <th className="p-3 font-bold text-amber-300 border-r border-slate-800 whitespace-nowrap">اجمالي الايام</th>
                    <th className="p-3 font-bold text-cyan-400 border-r border-slate-800 whitespace-nowrap">اجمالي كم</th>
                    <th className="p-3 font-bold text-rose-400 border-r border-slate-800 whitespace-nowrap">كم فوق المسموح</th>
                    <th className="p-3 font-bold text-emerald-400 border-r border-slate-800 whitespace-nowrap">توريد</th>
                    <th className="p-3 font-bold text-slate-200 border-r border-slate-800 text-center whitespace-nowrap">الحالة</th>
                    <th className="p-3 text-center w-28 border-r border-slate-800 whitespace-nowrap">إجراءات</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {filteredOperationRows.length === 0 ? (
                    <tr>
                      <td colSpan={17} className="text-center py-12 text-slate-400 font-sans">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <FileSpreadsheet className="w-8 h-8 text-slate-600" />
                          <p className="text-sm font-semibold text-slate-300">لا توجد سجلات تشغيل حتى الآن</p>
                          <p className="text-xs text-slate-500">ستتم إضافة السجلات تلقائياً عند تحرير العقود أو من خلال زر "إضافة عملية تشغيل جديدة".</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredOperationRows.map((op, idx) => {
                    const isEditing = editingOpRowId === op.id;

                    if (isEditing) {
                      return (
                        <tr key={op.id} className="bg-amber-950/30 border-y-2 border-amber-500/50">
                          <td className="p-2 text-center text-amber-400 font-bold">{op.index || idx + 1}</td>
                          <td className="p-2 border-r border-slate-800">
                            <input
                              type="text"
                              value={opEditData.customerName ?? ''}
                              onChange={(e) => setOpEditData({ ...opEditData, customerName: e.target.value })}
                              className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-white text-xs"
                            />
                          </td>
                          <td className="p-2 border-r border-slate-800">
                            <input
                              type="text"
                              value={opEditData.customerPhone ?? ''}
                              onChange={(e) => setOpEditData({ ...opEditData, customerPhone: e.target.value })}
                              className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-white text-xs"
                            />
                          </td>
                          <td className="p-2 border-r border-slate-800">
                            <input
                              type="text"
                              value={opEditData.carName ?? ''}
                              onChange={(e) => setOpEditData({ ...opEditData, carName: e.target.value })}
                              className="w-full bg-slate-950 border border-amber-500/50 rounded px-2 py-1 text-white text-xs"
                            />
                          </td>
                          <td className="p-2 border-r border-slate-800">
                            <input
                              type="text"
                              value={opEditData.plateNumber ?? ''}
                              onChange={(e) => setOpEditData({ ...opEditData, plateNumber: e.target.value })}
                              className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-white text-xs"
                            />
                          </td>
                          <td className="p-2 border-r border-slate-800">
                            <input
                              type="text"
                              value={opEditData.startDate ?? ''}
                              onChange={(e) => setOpEditData({ ...opEditData, startDate: e.target.value })}
                              className="w-24 bg-slate-950 border border-slate-700 rounded px-2 py-1 text-white text-xs"
                            />
                          </td>
                          <td className="p-2 border-r border-slate-800">
                            <input
                              type="text"
                              value={opEditData.endDate ?? ''}
                              onChange={(e) => setOpEditData({ ...opEditData, endDate: e.target.value })}
                              className="w-24 bg-slate-950 border border-slate-700 rounded px-2 py-1 text-white text-xs"
                            />
                          </td>
                          <td className="p-2 border-r border-slate-800">
                            <input
                              type="number"
                              value={opEditData.initialMileage ?? 0}
                              onChange={(e) => setOpEditData({ ...opEditData, initialMileage: Number(e.target.value) })}
                              className="w-20 bg-slate-950 border border-slate-700 rounded px-2 py-1 text-white text-xs"
                            />
                          </td>
                          <td className="p-2 border-r border-slate-800">
                            <input
                              type="number"
                              value={opEditData.returnMileage ?? 0}
                              onChange={(e) => setOpEditData({ ...opEditData, returnMileage: Number(e.target.value) })}
                              className="w-20 bg-slate-950 border border-slate-700 rounded px-2 py-1 text-white text-xs"
                            />
                          </td>
                          <td className="p-2 border-r border-slate-800 text-slate-400 text-xs">
                            {op.timeOut || '12:00 ص'}
                          </td>
                          <td className="p-2 border-r border-slate-800 text-slate-400 text-xs">
                            {op.timeIn || '11:30 م'}
                          </td>
                          <td className="p-2 border-r border-slate-800 text-slate-300 text-xs">
                            {op.totalDays}
                          </td>
                          <td className="p-2 border-r border-slate-800 text-cyan-300 text-xs">
                            {op.totalKm}
                          </td>
                          <td className="p-2 border-r border-slate-800 text-rose-300 text-xs">
                            {op.excessKm}
                          </td>
                          <td className="p-2 border-r border-slate-800 text-emerald-300 text-xs">
                            {op.supplySource}
                          </td>
                          <td className="p-2 border-r border-slate-800 text-center">
                            <select
                              value={opEditData.status ?? 'active'}
                              onChange={(e) => setOpEditData({ ...opEditData, status: e.target.value as any })}
                              className="bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-white"
                            >
                              <option value="active">نشط</option>
                              <option value="completed">مكتمل</option>
                            </select>
                          </td>
                          <td className="p-2 border-r border-slate-800 text-center space-x-1 space-x-reverse">
                            <button
                              onClick={() => saveOpRowEditing(op.id)}
                              className="p-1 rounded bg-emerald-600 text-white hover:bg-emerald-500"
                              title="حفظ"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={cancelOpRowEditing}
                              className="p-1 rounded bg-slate-700 text-slate-300 hover:bg-slate-600"
                              title="إلغاء"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    }

                    return (
                      <tr 
                        key={op.id}
                        className="hover:bg-slate-800/40 transition-colors group text-xs"
                      >
                        <td className="p-3 text-center text-slate-500 font-bold">{op.index || idx + 1}</td>
                        <td className="p-3 font-bold text-slate-100 font-['Cairo',sans-serif] border-r border-slate-800 whitespace-nowrap">
                          {op.customerName}
                        </td>
                        <td className="p-3 text-slate-300 border-r border-slate-800 whitespace-nowrap" dir="ltr">
                          {op.customerPhone}
                        </td>
                        <td className="p-3 font-bold text-amber-300 font-['Cairo',sans-serif] border-r border-slate-800 whitespace-nowrap">
                          {op.carName}
                        </td>
                        <td className="p-3 border-r border-slate-800 whitespace-nowrap">
                          <span className="bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700 text-slate-200 text-xs">
                            {op.plateNumber || '—'}
                          </span>
                        </td>
                        <td className="p-3 text-slate-300 border-r border-slate-800 whitespace-nowrap">
                          {op.startDate}
                        </td>
                        <td className="p-3 text-slate-300 border-r border-slate-800 whitespace-nowrap">
                          {op.endDate}
                        </td>
                        <td className="p-3 text-blue-400 font-semibold border-r border-slate-800 whitespace-nowrap">
                          {op.initialMileage ? `${op.initialMileage.toLocaleString()}` : '—'}
                        </td>
                        <td className="p-3 text-blue-300 border-r border-slate-800 whitespace-nowrap">
                          {op.returnMileage ? `${op.returnMileage.toLocaleString()}` : '—'}
                        </td>
                        <td className="p-3 text-slate-400 border-r border-slate-800 whitespace-nowrap">
                          {op.timeOut || '—'}
                        </td>
                        <td className="p-3 text-slate-400 border-r border-slate-800 whitespace-nowrap">
                          {op.timeIn || '—'}
                        </td>
                        <td className="p-3 font-bold text-amber-300 border-r border-slate-800 text-center whitespace-nowrap">
                          {op.totalDays !== undefined ? op.totalDays : '—'}
                        </td>
                        <td className="p-3 font-bold text-cyan-400 border-r border-slate-800 whitespace-nowrap">
                          {op.totalKm !== undefined ? op.totalKm.toLocaleString() : '—'}
                        </td>
                        <td className="p-3 font-bold text-rose-400 border-r border-slate-800 whitespace-nowrap">
                          {op.excessKm ? `+${op.excessKm}` : '0'}
                        </td>
                        <td className="p-3 font-semibold text-emerald-300 border-r border-slate-800 whitespace-nowrap font-['Cairo',sans-serif]">
                          {op.supplySource || '—'}
                        </td>
                        <td className="p-3 text-center border-r border-slate-800 whitespace-nowrap">
                          <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                            op.status === 'active' 
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                              : 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                          }`}>
                            {op.status === 'active' ? 'نشط' : 'مكتمل'}
                          </span>
                        </td>
                        <td className="p-3 text-center border-r border-slate-800 whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => handlePrintInvoiceForOperation(op)}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-amber-950/60 text-amber-400 hover:text-amber-300 border border-slate-700 hover:border-amber-500/40 transition-colors"
                              title="طباعة / مشاركة فاتورة وسند قبض"
                            >
                              <Receipt className="w-3.5 h-3.5" />
                            </button>

                            {op.contractId && onOpenContract && (
                              <button
                                onClick={() => onOpenContract(op.contractId!)}
                                className="p-1.5 rounded-lg bg-slate-800 hover:bg-blue-950/60 text-blue-400 hover:text-blue-300 border border-slate-700 hover:border-blue-500/40 transition-colors"
                                title="عرض العقد الرسمي"
                              >
                                <FileText className="w-3.5 h-3.5" />
                              </button>
                            )}

                            <button
                              onClick={() => startEditingOpRow(op)}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                              title="تعديل سريع"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => deleteOperationRow(op.id)}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950/60 text-slate-400 hover:text-rose-400 transition-colors"
                              title="حذف"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 2: ورقة 2 (حسابات خاصة - Special Accounts Financial Ledger)
         ========================================================================= */}
      {activeSheetTab === 'financials' && (
        <div className="space-y-6">
          
          {/* Quick Add Presets Bar */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 text-xs">
            <span className="font-bold text-amber-400 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" />
              <span>إضافة سريعة لشيت الحسابات الخاصة:</span>
            </span>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => handleQuickAddFinancial('installment_navy')}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-rose-950/60 text-rose-300 border border-rose-500/30 font-medium transition-all"
              >
                + قسط أوبترا كحلي (10,000 ج)
              </button>

              <button
                onClick={() => handleQuickAddFinancial('installment_silver')}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-rose-950/60 text-rose-300 border border-rose-500/30 font-medium transition-all"
              >
                + قسط أوبترا فضي (10,600 ج)
              </button>

              <button
                onClick={() => handleQuickAddFinancial('rent_elantra')}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-emerald-950/60 text-emerald-300 border border-emerald-500/30 font-medium transition-all"
              >
                + إيجار شهر إلنترا (25,000 ج)
              </button>

              <button
                onClick={() => handleQuickAddFinancial('oil_change')}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-blue-950/60 text-blue-300 border border-blue-500/30 font-medium transition-all"
              >
                + صيانة زيت وفلتر (2,800 ج)
              </button>
            </div>
          </div>

          {/* Financial Summary Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400 block">إجمالي عمود 1 (الإيرادات الواردة)</span>
                <span className="text-xl font-black text-emerald-400 font-mono">
                  +{totalRevenue.toLocaleString()} ج.م
                </span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400 block">إجمالي المصروفات والأقساط</span>
                <span className="text-xl font-black text-rose-400 font-mono">
                  -{totalExpense.toLocaleString()} ج.م
                </span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center">
                <TrendingDown className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-slate-900 to-amber-950/40 border border-amber-500/40 rounded-2xl p-4 flex items-center justify-between">
              <div>
                <span className="text-xs text-amber-300 block">إجمالي رصيد الشيت (صافي الأرباح)</span>
                <span className="text-2xl font-black text-amber-400 font-mono">
                  {grandFinancialTotal.toLocaleString()} ج.م
                </span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                <Wallet className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Filter & Search Bar */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between shadow-lg">
            <div className="relative w-full md:w-96">
              <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="بحث في أسباب الإيرادات أو المصروفات أو التواريخ..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl pr-10 pl-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
              {[
                { id: 'all', label: 'الكل' },
                { id: 'rental_income', label: 'إيرادات الإيجار' },
                { id: 'installment', label: 'أقساط السيارات' },
                { id: 'maintenance', label: 'الصيانة والقطع' },
                { id: 'gps_accessory', label: 'GPS ودواسات' },
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setCategoryFilter(cat.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                    categoryFilter === cat.id
                      ? 'bg-blue-600 text-white border-blue-500 font-bold shadow'
                      : 'bg-slate-950/60 text-slate-400 hover:text-white border-slate-800'
                  }`}
                >
                  {cat.label}
                </button>
              ))}

              <button
                onClick={resetToInitialSheet}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700"
                title="استعادة الشيت المالي الأصلي"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Financial Sheet Interactive Table (ورقة 2: حسابات خاصة) */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
            <div className="overflow-x-auto max-h-[600px] scrollbar-thin scrollbar-thumb-slate-700">
              <table className="w-full text-right border-collapse text-xs sm:text-sm">
                <thead className="bg-slate-950/90 text-slate-300 sticky top-0 z-10 border-b border-slate-800 font-['Cairo',sans-serif]">
                  <tr>
                    <th className="p-3.5 w-12 text-center text-slate-500 font-mono">#</th>
                    <th className="p-3.5 font-bold text-emerald-400 border-r border-slate-800">عمود1 (الإيراد)</th>
                    <th className="p-3.5 font-bold text-slate-200 border-r border-slate-800">السبب</th>
                    <th className="p-3.5 font-bold text-rose-400 border-r border-slate-800">المصروفات</th>
                    <th className="p-3.5 font-bold text-slate-200 border-r border-slate-800">السبب2</th>
                    <th className="p-3.5 font-bold text-amber-400 border-r border-slate-800">الاجمالي</th>
                    <th className="p-3.5 font-bold text-slate-300 border-r border-slate-800">التاريخ</th>
                    <th className="p-3.5 text-center w-24 border-r border-slate-800">إجراءات</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {filteredFinancialRows.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-12 text-slate-400 font-sans">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <Wallet className="w-8 h-8 text-slate-600" />
                          <p className="text-sm font-semibold text-slate-300">لا توجد حركات مالية مسجلة حالياً</p>
                          <p className="text-xs text-slate-500">استخدم زر "إضافة قيد مالي جديد" لتسجيل الإيرادات والمصروفات والأقساط.</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredFinancialRows.map((row, idx) => {
                    const isEditing = editingSheetRowId === row.id;

                    if (isEditing) {
                      return (
                        <tr key={row.id} className="bg-amber-950/30 border-y-2 border-amber-500/50">
                          <td className="p-2 text-center text-amber-400 font-bold">{idx + 1}</td>
                          <td className="p-2 border-r border-slate-800">
                            <input
                              type="number"
                              value={sheetEditData.revenue ?? ''}
                              onChange={(e) => setSheetEditData({ ...sheetEditData, revenue: e.target.value ? Number(e.target.value) : null })}
                              placeholder="0"
                              className="w-full bg-slate-950 border border-emerald-500/50 rounded px-2 py-1 text-emerald-300 text-xs"
                            />
                          </td>
                          <td className="p-2 border-r border-slate-800">
                            <input
                              type="text"
                              value={sheetEditData.revenueReason ?? ''}
                              onChange={(e) => setSheetEditData({ ...sheetEditData, revenueReason: e.target.value })}
                              className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-white text-xs"
                            />
                          </td>
                          <td className="p-2 border-r border-slate-800">
                            <input
                              type="number"
                              value={sheetEditData.expense ?? ''}
                              onChange={(e) => setSheetEditData({ ...sheetEditData, expense: e.target.value ? Number(e.target.value) : null })}
                              placeholder="0"
                              className="w-full bg-slate-950 border border-rose-500/50 rounded px-2 py-1 text-rose-300 text-xs"
                            />
                          </td>
                          <td className="p-2 border-r border-slate-800">
                            <input
                              type="text"
                              value={sheetEditData.expenseReason ?? ''}
                              onChange={(e) => setSheetEditData({ ...sheetEditData, expenseReason: e.target.value })}
                              className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-white text-xs"
                            />
                          </td>
                          <td className="p-2 border-r border-slate-800 text-amber-400 font-bold">
                            {((sheetEditData.revenue || 0) - (sheetEditData.expense || 0)).toLocaleString()}
                          </td>
                          <td className="p-2 border-r border-slate-800">
                            <input
                              type="date"
                              value={sheetEditData.date ?? ''}
                              onChange={(e) => setSheetEditData({ ...sheetEditData, date: e.target.value })}
                              className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-white text-xs"
                            />
                          </td>
                          <td className="p-2 border-r border-slate-800 text-center space-x-1 space-x-reverse">
                            <button
                              onClick={() => saveSheetRowEditing(row.id)}
                              className="p-1 rounded bg-emerald-600 text-white hover:bg-emerald-500"
                              title="حفظ"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={cancelSheetRowEditing}
                              className="p-1 rounded bg-slate-700 text-slate-300 hover:bg-slate-600"
                              title="إلغاء"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    }

                    return (
                      <tr 
                        key={row.id}
                        className="hover:bg-slate-800/40 transition-colors group"
                      >
                        <td className="p-3.5 text-center text-slate-500">{idx + 1}</td>
                        <td className="p-3.5 font-bold text-emerald-400 border-r border-slate-800">
                          {row.revenue !== null ? `${row.revenue.toLocaleString()} ج.م` : '—'}
                        </td>
                        <td className="p-3.5 text-slate-200 font-['Cairo',sans-serif] border-r border-slate-800">
                          {row.revenueReason || '—'}
                        </td>
                        <td className="p-3.5 font-bold text-rose-400 border-r border-slate-800">
                          {row.expense !== null ? `${row.expense.toLocaleString()} ج.م` : '—'}
                        </td>
                        <td className="p-3.5 text-slate-300 font-['Cairo',sans-serif] border-r border-slate-800">
                          {row.expenseReason || '—'}
                        </td>
                        <td className={`p-3.5 font-bold border-r border-slate-800 ${
                          row.total >= 0 ? 'text-emerald-400' : 'text-rose-400'
                        }`}>
                          {row.total.toLocaleString()} ج.م
                        </td>
                        <td className="p-3.5 text-slate-400 text-xs border-r border-slate-800">
                          {row.date}
                        </td>
                        <td className="p-3.5 text-center border-r border-slate-800">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => startEditingSheetRow(row)}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                              title="تعديل سريع"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => deleteSheetRow(row.id)}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950/60 text-slate-400 hover:text-rose-400 transition-colors"
                              title="حذف"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Add New Operation Row (تشغيل عام) */}
      {showAddOpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-amber-500/30 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white font-['Cairo',sans-serif] flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-amber-400" />
                <span>إضافة عملية تشغيل جديدة (ورقة تشغيل عام)</span>
              </h3>
              <button onClick={() => setShowAddOpModal(false)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddOperationSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">السيارة</label>
                  <select
                    value={newOpForm.carName}
                    onChange={(e) => {
                      const selected = cars.find(c => c.name === e.target.value);
                      setNewOpForm({
                        ...newOpForm,
                        carName: e.target.value,
                        plateNumber: selected?.plateNumber || newOpForm.plateNumber,
                        initialMileage: selected?.currentMileage || newOpForm.initialMileage,
                      });
                    }}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  >
                    {cars.map(c => (
                      <option key={c.id} value={c.name}>{c.name} ({c.plateNumber})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">رقم اللوحة</label>
                  <input
                    type="text"
                    value={newOpForm.plateNumber}
                    onChange={(e) => setNewOpForm({ ...newOpForm, plateNumber: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">اسم المستأجر</label>
                  <input
                    type="text"
                    value={newOpForm.customerName}
                    onChange={(e) => setNewOpForm({ ...newOpForm, customerName: e.target.value })}
                    placeholder="مثال: أحمد عبد الله"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">رقم الهاتف</label>
                  <input
                    type="text"
                    value={newOpForm.customerPhone}
                    onChange={(e) => setNewOpForm({ ...newOpForm, customerPhone: e.target.value })}
                    placeholder="01018888062"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">الرقم القومي</label>
                  <input
                    type="text"
                    value={newOpForm.customerNationalId}
                    onChange={(e) => setNewOpForm({ ...newOpForm, customerNationalId: e.target.value })}
                    placeholder="29001011234567"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">المدة (الوصف)</label>
                  <input
                    type="text"
                    value={newOpForm.rentalPeriod}
                    onChange={(e) => setNewOpForm({ ...newOpForm, rentalPeriod: e.target.value })}
                    placeholder="شهر كامل / 7 أيام"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">تاريخ البدء</label>
                  <input
                    type="date"
                    value={newOpForm.startDate}
                    onChange={(e) => setNewOpForm({ ...newOpForm, startDate: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">تاريخ الانتهاء</label>
                  <input
                    type="date"
                    value={newOpForm.endDate}
                    onChange={(e) => setNewOpForm({ ...newOpForm, endDate: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">السعر المتفق عليه</label>
                  <input
                    type="number"
                    value={newOpForm.rate}
                    onChange={(e) => setNewOpForm({ ...newOpForm, rate: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-blue-300 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">المبلغ المدفوع</label>
                  <input
                    type="number"
                    value={newOpForm.paidAmount}
                    onChange={(e) => setNewOpForm({ ...newOpForm, paidAmount: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-emerald-300 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">قراءة العداد</label>
                  <input
                    type="number"
                    value={newOpForm.initialMileage}
                    onChange={(e) => setNewOpForm({ ...newOpForm, initialMileage: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddOpModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shadow-lg shadow-amber-500/20"
                >
                  حفظ في الشيت
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
