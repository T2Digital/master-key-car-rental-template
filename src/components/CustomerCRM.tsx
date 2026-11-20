import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  PlusCircle, 
  Phone, 
  FileText, 
  Calendar, 
  CreditCard, 
  MapPin, 
  Briefcase, 
  ShieldCheck, 
  UserCheck,
  Edit,
  Trash2,
  Receipt,
  Car as CarIcon,
  AlertTriangle,
  X
} from 'lucide-react';
import { Customer, Invoice } from '../types';
import { useApp } from '../context/AppContext';

interface CustomerCRMProps {
  onOpenNewCustomerModal: () => void;
  onOpenNewContractForCustomer: (customer: Customer) => void;
  onOpenInvoiceModal?: (invoice: Invoice) => void;
}

export const CustomerCRM: React.FC<CustomerCRMProps> = ({
  onOpenNewCustomerModal,
  onOpenNewContractForCustomer,
  onOpenInvoiceModal,
}) => {
  const { customers, contracts, invoices, operationRows, generateInvoiceForContract, deleteCustomer } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);

  const filteredCustomers = customers.filter(cust => 
    cust.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cust.nationalId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cust.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cust.licenseNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handlePrintLatestCustomerInvoice = (customer: Customer) => {
    // Find matching invoice or latest contract
    const matchingInv = invoices.find(i => i.customerPhone === customer.phone || i.customerName === customer.fullName);
    if (matchingInv && onOpenInvoiceModal) {
      onOpenInvoiceModal(matchingInv);
      return;
    }

    const latestContract = contracts.find(c => c.customerId === customer.id || c.customerSnapshot?.phone === customer.phone);
    if (latestContract && onOpenInvoiceModal) {
      const inv = generateInvoiceForContract(latestContract);
      onOpenInvoiceModal(inv);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Users className="w-6 h-6 text-amber-400" />
            <h1 className="text-2xl font-black text-white font-['Cairo',sans-serif]">
              سجل العملاء وإدارة علاقات العملاء (CRM)
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400">
            قاعدة بيانات عملاء ماستر كي، الأرقام القومية، رخص القيادة، ومزامنة سجلات التشغيل وإصدار فواتير وسندات السداد.
          </p>
        </div>

        <button
          onClick={onOpenNewCustomerModal}
          className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm shadow-xl shadow-amber-500/25 transition-all hover:scale-105"
        >
          <PlusCircle className="w-5 h-5" />
          <span>إضافة عميل جديد</span>
        </button>
      </div>

      {/* Search bar */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-lg flex items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="بحث باسم العميل، الرقم القومي، الهاتف، أو الرخصة..."
            className="w-full bg-slate-950 border border-slate-700 rounded-xl pr-10 pl-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>
        <span className="text-xs text-slate-400 font-semibold">
          عدد العملاء: <strong className="text-amber-400">{filteredCustomers.length}</strong>
        </span>
      </div>

      {/* Customer Cards Grid */}
      {filteredCustomers.length === 0 ? (
        <div className="p-12 rounded-3xl bg-slate-900/60 border border-dashed border-slate-800 text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-3xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
            <Users className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-white">لا يوجد عملاء مسجلين حالياً</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              يمكنك إضافة عميل جديد مباشرة ببيانات الرقم القومي ورخصة القيادة، أو سيتم تسجيل العميل تلقائياً عند تحرير أول عقد إيجار.
            </p>
          </div>
          <button
            onClick={onOpenNewCustomerModal}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-sm font-bold shadow-lg shadow-amber-500/20 transition-all hover:scale-105"
          >
            <PlusCircle className="w-5 h-5" />
            <span>إضافة عميل جديد</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredCustomers.map((customer) => {
          const customerContracts = contracts.filter(c => c.customerId === customer.id || c.customerSnapshot?.phone === customer.phone);
          const activeContract = customerContracts.find(c => c.status === 'active');
          const customerOperations = operationRows.filter(o => o.customerPhone === customer.phone || o.customerName === customer.fullName);

          return (
            <div
              key={customer.id}
              className="bg-slate-900/90 border border-slate-800 hover:border-amber-500/40 rounded-3xl p-5 shadow-xl transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3 text-xs">
                {/* Header */}
                <div className="flex items-start justify-between border-b border-slate-800/80 pb-3">
                  <div className="space-y-0.5">
                    <h2 className="text-base font-bold text-white font-['Cairo',sans-serif]">
                      {customer.fullName}
                    </h2>
                    <span className="text-[11px] text-amber-400 font-semibold">{customer.job || 'عميل'}</span>
                  </div>
                  {activeContract ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      مستأجر حالياً
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-400">
                      غير نشط
                    </span>
                  )}
                </div>

                {/* Info List */}
                <div className="space-y-2 text-slate-300">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-amber-400 shrink-0" />
                    <span className="text-slate-400">الرقم القومي:</span>
                    <span className="font-mono font-bold text-white">{customer.nationalId}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="text-slate-400">الهاتف:</span>
                    <a href={`tel:${customer.phone}`} className="font-mono text-emerald-300 hover:underline" dir="ltr">
                      {customer.phone}
                    </a>
                  </div>

                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0" />
                    <span className="text-slate-400">رقم الرخصة:</span>
                    <span className="font-mono text-slate-200">{customer.licenseNumber}</span>
                  </div>

                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    <span className="text-slate-400 shrink-0">العنوان:</span>
                    <span className="text-slate-300">{customer.address}</span>
                  </div>
                </div>

                {/* Summary Strip */}
                <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-3 grid grid-cols-2 gap-2 text-center text-[11px]">
                  <div>
                    <span className="text-slate-400 block">إجمالي العقود والعمليات</span>
                    <span className="font-bold text-amber-400 font-mono text-sm">
                      {Math.max(customerContracts.length, customerOperations.length)} عقود
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">إجمالي التعاملات</span>
                    <span className="font-bold text-emerald-400 font-mono text-sm">
                      {Math.max(
                        customerContracts.reduce((sum, c) => sum + ((c.rentalAmount ?? c.totalRentAmount) || 0), 0),
                        customerOperations.reduce((sum, o) => sum + (o.rate || 0), 0)
                      ).toLocaleString()} ج.م
                    </span>
                  </div>
                </div>

                {customer.notes && (
                  <p className="text-[11px] text-slate-400 bg-slate-950/30 p-2 rounded-lg italic">
                    ملاحظات: {customer.notes}
                  </p>
                )}
              </div>

              {/* Action */}
              <div className="pt-2 border-t border-slate-800 flex items-center gap-2">
                <button
                  onClick={() => onOpenNewContractForCustomer(customer)}
                  className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow transition-all hover:scale-[1.02]"
                >
                  <FileText className="w-4 h-4" />
                  <span>تحرير عقد جديد</span>
                </button>

                <button
                  onClick={() => handlePrintLatestCustomerInvoice(customer)}
                  className="p-2.5 rounded-xl bg-slate-800 hover:bg-amber-950/60 text-amber-400 hover:text-amber-300 border border-slate-700 hover:border-amber-500/40 transition-colors"
                  title="طباعة / مشاركة فاتورة العميل PDF"
                >
                  <Receipt className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setCustomerToDelete(customer)}
                  className="p-2.5 rounded-xl bg-slate-800 hover:bg-rose-950/80 text-slate-400 hover:text-rose-400 border border-slate-700 hover:border-rose-500/40 transition-colors"
                  title="حذف العميل نهائياً"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
      )}

      {/* Delete Customer Confirmation Modal */}
      {customerToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-900 border border-rose-500/40 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5 text-rose-400">
                <div className="w-9 h-9 rounded-xl bg-rose-500/20 flex items-center justify-center">
                  <Trash2 className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-base text-white font-['Cairo',sans-serif]">تأكيد حذف العميل</h3>
              </div>
              <button
                onClick={() => setCustomerToDelete(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-4 text-xs text-rose-200 space-y-1">
                <div className="flex items-center gap-2 font-bold text-rose-300">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>تحذير: هذا الإجراء نهائي ولا يمكن التراجع عنه</span>
                </div>
                <p className="text-slate-300 pr-6">
                  سيتم حذف بيانات العميل نهائياً من قاعدة بيانات العملاء والسحابة (Firestore).
                </p>
              </div>

              <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 text-xs space-y-2.5">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">اسم العميل:</span>
                  <span className="font-bold text-white text-sm">{customerToDelete.fullName}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">الرقم القومي:</span>
                  <span className="font-mono font-bold text-slate-200">{customerToDelete.nationalId}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">رقم الهاتف:</span>
                  <span className="font-mono text-emerald-400 font-bold" dir="ltr">{customerToDelete.phone}</span>
                </div>
                {customerToDelete.licenseNumber && (
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">رقم الرخصة:</span>
                    <span className="font-mono text-slate-300">{customerToDelete.licenseNumber}</span>
                  </div>
                )}
              </div>

              {contracts.some(c => (c.customerId === customerToDelete.id || c.customerSnapshot?.phone === customerToDelete.phone) && c.status === 'active') && (
                <div className="bg-amber-500/15 border border-amber-500/30 rounded-xl p-3 text-xs text-amber-300 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>تنبيه: هذا العميل لديه عقد إيجار سارٍ حالياً!</span>
                </div>
              )}

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setCustomerToDelete(null)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors"
                >
                  إلغاء
                </button>
                <button
                  type="button"
                  onClick={() => {
                    deleteCustomer(customerToDelete.id);
                    setCustomerToDelete(null);
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-600/30 transition-all hover:scale-[1.02] flex items-center justify-center gap-1.5"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>تأكيد الحذف</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

