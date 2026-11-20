import React, { useState } from 'react';
import { 
  FileText, 
  Search, 
  Filter, 
  PlusCircle, 
  Printer, 
  Eye, 
  CheckCircle2, 
  RotateCcw, 
  Calendar, 
  Car, 
  User, 
  Gauge, 
  DollarSign,
  AlertCircle,
  X,
  Clock,
  Share2,
  Receipt,
  Trash2
} from 'lucide-react';
import { Contract, ContractStatus, Invoice } from '../types';
import { useApp } from '../context/AppContext';

interface ContractManagerProps {
  onSelectContractForView: (contract: Contract) => void;
  onOpenNewContract: () => void;
  onOpenCloseModal: (contract: Contract) => void;
  onOpenRenewModal: (contract: Contract) => void;
  onOpenInvoiceModal?: (invoice: Invoice) => void;
}

export const ContractManager: React.FC<ContractManagerProps> = ({
  onSelectContractForView,
  onOpenNewContract,
  onOpenCloseModal,
  onOpenRenewModal,
  onOpenInvoiceModal,
}) => {
  const { contracts, generateInvoiceForContract, deleteContract } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredContracts = contracts.filter(contract => {
    const custName = contract.customerSnapshot?.fullName || contract.secondPartyRepresentative || '';
    const carName = contract.carSnapshot?.name || '';
    const plateNum = contract.carSnapshot?.plateNumber || '';
    const contractNum = contract.contractNumber || '';

    const matchesSearch = 
      contractNum.toLowerCase().includes(searchTerm.toLowerCase()) ||
      custName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      carName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      plateNum.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || contract.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: ContractStatus) => {
    switch (status) {
      case 'active':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">ساري ونشط</span>;
      case 'completed':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">مغلق ومستلم</span>;
      case 'renewed':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">مجدد</span>;
      case 'overdue':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">متأخر</span>;
      case 'cancelled':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-700 text-slate-300 border border-slate-600">ملغي</span>;
    }
  };

  const handlePrintInvoice = (contract: Contract) => {
    const inv = generateInvoiceForContract(contract);
    if (onOpenInvoiceModal) {
      onOpenInvoiceModal(inv);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      
      {/* Header & New Contract Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <FileText className="w-6 h-6 text-amber-400" />
            <h1 className="text-2xl font-black text-white font-['Cairo',sans-serif]">
              إدارة العقود الرسمية المطابقة
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400">
            إنشاء، طباعة، تجديد، وإغلاق عقود الإيجار المطابقة لنموذج ماستر كي (KRM) مع حساب الكيلومترات الزائدة (120 كم/يوم).
          </p>
        </div>

        <button
          onClick={onOpenNewContract}
          className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm shadow-xl shadow-amber-500/25 transition-all hover:scale-105 active:scale-95"
        >
          <PlusCircle className="w-5 h-5" />
          <span>تحرير عقد جديد</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between shadow-lg">
        {/* Search input */}
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="بحث برقم العقد، اسم العميل، السيارة أو اللوحة..."
            className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pr-10 pl-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        {/* Status filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {[
            { id: 'all', label: 'جميع العقود' },
            { id: 'active', label: 'السارية' },
            { id: 'completed', label: 'المغلقة' },
            { id: 'renewed', label: 'المجددة' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                statusFilter === tab.id
                  ? 'bg-amber-500 text-slate-950 border-amber-500 font-bold shadow-md'
                  : 'bg-slate-950/60 text-slate-400 hover:text-white border-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Contracts List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredContracts.length === 0 ? (
          <div className="col-span-full py-16 text-center bg-slate-900/40 border border-dashed border-slate-800 rounded-3xl">
            <FileText className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400 font-semibold text-sm">لا توجد عقود مطابقة لمعايير البحث</p>
          </div>
        ) : (
          filteredContracts.map((contract) => (
            <div
              key={contract.id}
              className="bg-slate-900/90 border border-slate-800 hover:border-amber-500/40 rounded-3xl p-5 shadow-xl transition-all flex flex-col justify-between space-y-4 group"
            >
              {/* Header of Contract Card */}
              <div>
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                  <div>
                    <span className="text-xs text-slate-400 block">رقم العقد</span>
                    <span className="font-mono text-base font-black text-amber-400">
                      {contract.contractNumber}
                    </span>
                  </div>
                  {getStatusBadge(contract.status)}
                </div>

                {/* Customer & Car Info */}
                <div className="mt-3.5 space-y-2.5 text-xs">
                  <div className="flex items-start gap-2 text-slate-200">
                    <User className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-white block text-sm">{contract.customerSnapshot?.fullName || contract.secondPartyRepresentative || 'العميل'}</span>
                      <span className="text-slate-400 font-mono text-[11px]">{contract.customerSnapshot?.phone || '—'}</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 text-slate-200">
                    <Car className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-slate-100">{contract.carSnapshot?.name || 'السيارة'}</span>
                      <span className="text-amber-300 font-mono text-[11px] block">{contract.carSnapshot?.plateNumber || '—'}</span>
                    </div>
                  </div>

                  {/* Dates & Period */}
                  <div className="bg-slate-950/60 rounded-xl p-2.5 border border-slate-800 space-y-1.5">
                    <div className="flex items-center justify-between text-slate-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>فترة العقد:</span>
                      </span>
                      <span className="font-bold text-slate-200 font-mono">{contract.durationDays ?? contract.rentalPeriodDays ?? 30} يوم</span>
                    </div>
                    <div className="flex items-center justify-between font-mono text-[11px] text-slate-300">
                      <span>من: {contract.startDate}</span>
                      <span>إلى: {contract.endDate}</span>
                    </div>
                  </div>

                  {/* Mileage details */}
                  <div className="grid grid-cols-2 gap-2 text-center text-[11px]">
                    <div className="bg-slate-950/40 p-2 rounded-lg border border-slate-800/80">
                      <span className="text-slate-400 block">عداد الخروج</span>
                      <span className="font-mono font-bold text-slate-200">{(contract.initialMileage || 0).toLocaleString()} كم</span>
                    </div>
                    <div className="bg-slate-950/40 p-2 rounded-lg border border-slate-800/80">
                      <span className="text-slate-400 block">عداد الدخول</span>
                      <span className="font-mono font-bold text-slate-200">
                        {contract.returnMileage ? `${(contract.returnMileage || 0).toLocaleString()} كم` : 'قيد الاستخدام'}
                      </span>
                    </div>
                  </div>

                  {/* Financial summary */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs">
                    <span className="text-slate-400">القيمة الإيجارية:</span>
                    <span className="font-mono font-black text-amber-400 text-sm">
                      {((contract.rentalAmount ?? contract.totalRentAmount) || 0).toLocaleString()} ج.م
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-slate-800 flex items-center gap-2">
                <button
                  onClick={() => onSelectContractForView(contract)}
                  className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow transition-all hover:scale-[1.02]"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>معاينة العقد الرسمي</span>
                </button>

                <button
                  onClick={() => handlePrintInvoice(contract)}
                  className="p-2.5 rounded-xl bg-slate-800 hover:bg-amber-950/60 text-amber-400 hover:text-amber-300 border border-slate-700 hover:border-amber-500/40 transition-colors"
                  title="طباعة / مشاركة فاتورة العميل PDF"
                >
                  <Receipt className="w-4 h-4" />
                </button>

                {contract.status === 'active' && (
                  <button
                    onClick={() => onOpenCloseModal(contract)}
                    className="p-2.5 rounded-xl bg-slate-800 hover:bg-emerald-600 hover:text-white text-emerald-400 border border-slate-700 transition-colors"
                    title="إغلاق العقد واستلام السيارة"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                  </button>
                )}

                {contract.status === 'active' && (
                  <button
                    onClick={() => onOpenRenewModal(contract)}
                    className="p-2.5 rounded-xl bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-amber-400 border border-slate-700 transition-colors"
                    title="تجديد العقد"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                )}

                <button
                  onClick={() => {
                    const ok = window.confirm(
                      `هل أنت متأكد من حذف العقد رقم (${contract.contractNumber}) نهائياً؟\nفي حال كان العقد سارياً سيتم إعادة حالة السيارة لتصبح متاحة.`
                    );
                    if (ok) {
                      deleteContract(contract.id);
                    }
                  }}
                  className="p-2.5 rounded-xl bg-slate-800 hover:bg-rose-950/80 text-slate-400 hover:text-rose-400 border border-slate-700 hover:border-rose-500/40 transition-colors"
                  title="حذف هذا العقد نهائياً"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
};
