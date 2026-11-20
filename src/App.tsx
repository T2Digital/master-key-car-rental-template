import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { ContractManager } from './components/ContractManager';
import { ContractDocument } from './components/ContractDocument';
import { GoogleSheetSyncView } from './components/GoogleSheetSyncView';
import { FleetManager } from './components/FleetManager';
import { CustomerCRM } from './components/CustomerCRM';
import { SmartBookingPortal } from './components/SmartBookingPortal';
import { RentalCalculator } from './components/RentalCalculator';
import { InvoiceModal } from './components/InvoiceModal';
import { OfflineIndicator } from './components/OfflineIndicator';

// Modals
import { NewContractModal } from './components/modals/NewContractModal';
import { CloseContractModal } from './components/modals/CloseContractModal';
import { RenewContractModal } from './components/modals/RenewContractModal';
import { UpdateOdometerModal } from './components/modals/UpdateOdometerModal';
import { NewTransactionModal } from './components/modals/NewTransactionModal';
import { NewCarModal } from './components/modals/NewCarModal';
import { NewCustomerModal } from './components/modals/NewCustomerModal';

import { Car, Customer, Contract, Invoice } from './types';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';
import { printElementCleanly } from './utils/pdfExport';

const MainContent: React.FC = () => {
  const { activeTab, setActiveTab, toast, showToast, generateInvoiceForContract, contracts, invoices } = useApp();

  // Modal states
  const [isNewContractOpen, setIsNewContractOpen] = useState(false);
  const [isCloseContractOpen, setIsCloseContractOpen] = useState(false);
  const [isRenewContractOpen, setIsRenewContractOpen] = useState(false);
  const [isOdometerModalOpen, setIsOdometerModalOpen] = useState(false);
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [isNewCarModalOpen, setIsNewCarModalOpen] = useState(false);
  const [isNewCustomerModalOpen, setIsNewCustomerModalOpen] = useState(false);

  // Selected entities for modals
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [selectedCar, setSelectedCar] = useState<Car | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  
  // Viewing full printable contract
  const [viewingContract, setViewingContract] = useState<Contract | null>(null);

  // Handlers
  const handleOpenNewContract = (car?: Car, customer?: Customer) => {
    setSelectedCar(car || null);
    setSelectedCustomer(customer || null);
    setIsNewContractOpen(true);
  };

  const handleOpenCloseContract = (contract: Contract) => {
    setSelectedContract(contract);
    setIsCloseContractOpen(true);
  };

  const handleOpenRenewContract = (contract: Contract) => {
    setSelectedContract(contract);
    setIsRenewContractOpen(true);
  };

  const handleOpenOdometerModal = (car: Car) => {
    setSelectedCar(car);
    setIsOdometerModalOpen(true);
  };

  const handleOpenInvoiceForContract = (contract: Contract) => {
    const inv = generateInvoiceForContract(contract);
    setSelectedInvoice(inv);
  };

  // Direct deep link support (?contract=... or ?invoice=... &download=pdf) from WhatsApp wa.me links
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const urlParams = new URLSearchParams(window.location.search);
    const contractParam = urlParams.get('contract') || urlParams.get('contractNumber') || urlParams.get('contractId');
    const invoiceParam = urlParams.get('invoice') || urlParams.get('invoiceNumber') || urlParams.get('invoiceId');
    const autoDownload = urlParams.get('download') === 'pdf';

    if (contractParam && contracts.length > 0) {
      const match = contracts.find(
        (c) => c.contractNumber.toLowerCase() === contractParam.toLowerCase() || c.id === contractParam
      );
      if (match) {
        setViewingContract(match);
        if (autoDownload) {
          showToast(`تم فتح العقد الرسمي ${match.contractNumber} بنجاح`, 'info');
        }
      }
    } else if (invoiceParam && invoices.length > 0) {
      const match = invoices.find(
        (inv) => inv.invoiceNumber.toLowerCase() === invoiceParam.toLowerCase() || inv.id === invoiceParam
      );
      if (match) {
        setSelectedInvoice(match);
        if (autoDownload) {
          showToast(`تم فتح الفاتورة الرسمية ${match.invoiceNumber} بنجاح`, 'info');
        }
      }
    }
  }, [contracts, invoices, showToast]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-amber-500 selection:text-slate-950">
      
      {/* Navigation Bar */}
      <div className="no-print">
        <Navbar onOpenNewContract={() => handleOpenNewContract()} />
      </div>

      {/* Main Dynamic View */}
      <main className="flex-1 px-4 sm:px-6 lg:px-8 pt-6 pb-16 no-print">
        {activeTab === 'dashboard' && (
          <DashboardView
            onNavigateToSheet={() => setActiveTab('sheet')}
            onNavigateToContracts={() => setActiveTab('contracts')}
            onOpenNewContract={() => handleOpenNewContract()}
            onSelectContractForView={(contract) => setViewingContract(contract)}
            onOpenInvoiceModal={(invoice) => setSelectedInvoice(invoice)}
          />
        )}

        {activeTab === 'contracts' && (
          <ContractManager
            onSelectContractForView={(contract) => setViewingContract(contract)}
            onOpenNewContract={() => handleOpenNewContract()}
            onOpenCloseModal={handleOpenCloseContract}
            onOpenRenewModal={handleOpenRenewContract}
            onOpenInvoiceModal={(invoice) => setSelectedInvoice(invoice)}
          />
        )}

        {activeTab === 'sheet' && (
          <GoogleSheetSyncView
            onOpenNewTransactionModal={() => setIsTransactionModalOpen(true)}
            onOpenContract={(contractId) => {
              // Switch tab to contracts or open contract directly
              setActiveTab('contracts');
            }}
            onOpenInvoiceModal={(invoice) => setSelectedInvoice(invoice)}
          />
        )}

        {activeTab === 'fleet' && (
          <FleetManager
            onOpenNewCarModal={() => setIsNewCarModalOpen(true)}
            onOpenOdometerModal={handleOpenOdometerModal}
            onOpenNewContractForCar={(car) => handleOpenNewContract(car)}
          />
        )}

        {activeTab === 'crm' && (
          <CustomerCRM
            onOpenNewCustomerModal={() => setIsNewCustomerModalOpen(true)}
            onOpenNewContractForCustomer={(customer) => handleOpenNewContract(undefined, customer)}
            onOpenInvoiceModal={(invoice) => setSelectedInvoice(invoice)}
          />
        )}

        {activeTab === 'bookings' && <SmartBookingPortal />}

        {activeTab === 'calculator' && <RentalCalculator />}
      </main>

      {/* Contract Printable Viewer Modal (Full Screen with direct Print) */}
      {viewingContract && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/90 backdrop-blur-md p-4 sm:p-6 flex flex-col items-center">
          <div className="w-full max-w-5xl space-y-4 my-auto">
            
            {/* Top Toolbar */}
            <div className="bg-slate-900 border border-amber-500/30 rounded-2xl p-4 flex items-center justify-between no-print shadow-2xl">
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-white">معاينة العقد الرسمي المعتمد:</span>
                <span className="font-mono text-amber-400 font-black">{viewingContract.contractNumber}</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleOpenInvoiceForContract(viewingContract)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 font-bold text-xs shadow transition-all"
                >
                  عرض فاتورة العميل
                </button>
                <button
                  onClick={() => printElementCleanly('official-contract-print')}
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all hover:scale-105"
                >
                  طباعة العقد (A4)
                </button>
                <button
                  onClick={() => setViewingContract(null)}
                  className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* The 1:1 Contract Document */}
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden text-slate-950 p-2 sm:p-4">
              <ContractDocument
                contract={viewingContract}
                onOpenInvoiceModal={(contract) => handleOpenInvoiceForContract(contract)}
                onBack={() => setViewingContract(null)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Invoice Modal (Print / PDF / WhatsApp PDF) */}
      <InvoiceModal
        invoice={selectedInvoice}
        onClose={() => setSelectedInvoice(null)}
      />

      {/* Modals */}
      <NewContractModal
        isOpen={isNewContractOpen}
        onClose={() => {
          setIsNewContractOpen(false);
          setSelectedCar(null);
          setSelectedCustomer(null);
        }}
        preSelectedCar={selectedCar}
        preSelectedCustomer={selectedCustomer}
      />

      <CloseContractModal
        isOpen={isCloseContractOpen}
        onClose={() => {
          setIsCloseContractOpen(false);
          setSelectedContract(null);
        }}
        contract={selectedContract}
      />

      <RenewContractModal
        isOpen={isRenewContractOpen}
        onClose={() => {
          setIsRenewContractOpen(false);
          setSelectedContract(null);
        }}
        contract={selectedContract}
      />

      <UpdateOdometerModal
        isOpen={isOdometerModalOpen}
        onClose={() => {
          setIsOdometerModalOpen(false);
          setSelectedCar(null);
        }}
        car={selectedCar}
      />

      <NewTransactionModal
        isOpen={isTransactionModalOpen}
        onClose={() => setIsTransactionModalOpen(false)}
      />

      <NewCarModal
        isOpen={isNewCarModalOpen}
        onClose={() => setIsNewCarModalOpen(false)}
      />

      <NewCustomerModal
        isOpen={isNewCustomerModalOpen}
        onClose={() => setIsNewCustomerModalOpen(false)}
      />

      {/* PWA Offline Network Banner */}
      <OfflineIndicator />

      {/* Global Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 max-w-md bg-slate-900 border border-amber-500/40 text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 animate-slide-up no-print">
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          ) : toast.type === 'error' ? (
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
          )}
          <span className="text-xs sm:text-sm font-semibold">{toast.message}</span>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-6 text-center text-xs text-slate-500 no-print">
        <p>ماستر كي (K R M) لتأجير وتوريد السيارات © {new Date().getFullYear()} — نظام الإدارة وعقود التأجير الرسمية ومزامنة شيت الحسابات</p>
      </footer>

    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
