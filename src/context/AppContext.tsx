import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  Car, 
  Customer, 
  Contract, 
  SheetRow, 
  OperationRow,
  Invoice,
  BookingRequest, 
  CompanyInfo, 
  ContractStatus,
  PaymentMethod
} from '../types';
import { 
  companyInfo, 
  initialCars, 
  initialCustomers, 
  initialContracts, 
  initialSheetRows, 
  initialOperationRows,
  initialInvoices,
  initialBookings 
} from '../data/initialData';
import { firestoreSync } from '../services/firestoreSync';

interface AppContextType {
  cloudStatus: 'connected' | 'connecting' | 'offline';
  company: CompanyInfo;
  updateCompanyInfo: (updates: Partial<CompanyInfo>) => void;
  cars: Car[];
  customers: Customer[];
  contracts: Contract[];
  sheetRows: SheetRow[]; // حسابات خاصة (الماليات)
  operationRows: OperationRow[]; // تشغيل عام (الأسطول والعمليات)
  invoices: Invoice[]; // فواتير وسندات القبض
  bookings: BookingRequest[];
  
  // Navigation / View mode
  activeTab: 'dashboard' | 'contracts' | 'fleet' | 'crm' | 'sheet' | 'bookings' | 'calculator' | 'settings';
  setActiveTab: (tab: 'dashboard' | 'contracts' | 'fleet' | 'crm' | 'sheet' | 'bookings' | 'calculator' | 'settings') => void;
  
  // Active selected items for modals / drawers
  selectedContract: Contract | null;
  setSelectedContract: (contract: Contract | null) => void;
  selectedCar: Car | null;
  setSelectedCar: (car: Car | null) => void;
  selectedCustomer: Customer | null;
  setSelectedCustomer: (customer: Customer | null) => void;
  selectedInvoice: Invoice | null;
  setSelectedInvoice: (invoice: Invoice | null) => void;
  
  // Contract Actions
  createContract: (contractData: Omit<Contract, 'id' | 'contractNumber' | 'createdAt'>) => Contract;
  updateContract: (id: string, updates: Partial<Contract>) => void;
  deleteContract: (id: string) => void;
  closeContract: (
    contractId: string, 
    returnMileage: number, 
    returnDate: string, 
    fuelIn: string, 
    additionalCharges: number, 
    notes?: string
  ) => void;
  renewContract: (
    contractId: string, 
    newEndDate: string, 
    additionalDays: number, 
    newAmount: number, 
    notes?: string
  ) => Contract;
  
  // Car / Fleet Actions
  addCar: (car: Omit<Car, 'id'>) => void;
  updateCar: (id: string, updates: Partial<Car>) => void;
  updateCarMileage: (carId: string, newMileage: number, reason?: string) => void;
  deleteCar: (id: string) => void;
  
  // Customer Actions
  addCustomer: (customer: Omit<Customer, 'id' | 'createdAt' | 'totalRentalsCount' | 'totalSpent'>) => Customer;
  updateCustomer: (id: string, updates: Partial<Customer>) => void;
  deleteCustomer: (id: string) => void;
  
  // Sheet Actions: ورقة 2 (حسابات خاصة - الماليات)
  addSheetRow: (row: Omit<SheetRow, 'id' | 'index' | 'total'>) => void;
  updateSheetRow: (id: string, updates: Partial<SheetRow>) => void;
  deleteSheetRow: (id: string) => void;
  resetToInitialSheet: () => void;

  // Sheet Actions: ورقة 1 (تشغيل عام - العمليات والأسطول)
  addOperationRow: (row: Omit<OperationRow, 'id' | 'index'>) => void;
  updateOperationRow: (id: string, updates: Partial<OperationRow>) => void;
  deleteOperationRow: (id: string) => void;
  resetToInitialOperations: () => void;

  // Invoice Actions
  createInvoice: (invoiceData: Omit<Invoice, 'id' | 'invoiceNumber' | 'createdAt'>) => Invoice;
  updateInvoice: (id: string, updates: Partial<Invoice>) => void;
  deleteInvoice: (id: string) => void;
  generateInvoiceForContract: (contract: Contract, paymentMethod?: PaymentMethod) => Invoice;
  
  // Booking Actions
  submitBooking: (booking: Omit<BookingRequest, 'id' | 'createdAt' | 'status'>) => void;
  updateBookingStatus: (id: string, status: BookingRequest['status']) => void;
  convertBookingToContract: (bookingId: string) => Contract | null;
  
  // Financial & Stats Summaries
  financialStats: {
    totalRevenue: number;
    totalExpenses: number;
    netBalance: number;
    activeRentalsCount: number;
    totalCarsCount: number;
    availableCarsCount: number;
    fleetUtilization: number;
    totalInstallmentsPaid: number;
    totalMaintenancePaid: number;
    upcomingInstallments: {
      carName: string;
      plateNumber: string;
      amount: number;
      dueDay: number;
      isDueSoon: boolean;
    }[];
  };
  
  // Toast notifications
  toastMessage: { text: string; type: 'success' | 'error' | 'info' } | null;
  toast: { message: string; type: 'success' | 'error' | 'info' } | null;
  showToast: (text: string, type?: 'success' | 'error' | 'info') => void;
  clearAllData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Clean legacy mock demo keys from previous runs to provide a 100% fresh live slate
const RESET_APPLIED_FLAG = 'mk_clean_slate_reset_v8_applied';
if (typeof window !== 'undefined') {
  try {
    if (!localStorage.getItem(RESET_APPLIED_FLAG)) {
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('mk_')) {
          localStorage.removeItem(key);
        }
      });
      localStorage.setItem(RESET_APPLIED_FLAG, 'true');
    }
  } catch (e) {
    console.error('Local storage reset error:', e);
  }
}

const STORAGE_KEYS = {
  CARS: 'mk_fleet_cars_v8_live',
  CUSTOMERS: 'mk_crm_customers_v8_live',
  CONTRACTS: 'mk_contracts_v8_live',
  SHEET: 'mk_google_sheet_rows_v8_live',
  OPERATIONS: 'mk_operation_rows_v8_live',
  INVOICES: 'mk_invoices_v8_live',
  BOOKINGS: 'mk_bookings_v8_live',
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cars, setCars] = useState<Car[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CARS);
    return saved ? JSON.parse(saved) : initialCars;
  });

  const [customers, setCustomers] = useState<Customer[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CUSTOMERS);
    return saved ? JSON.parse(saved) : initialCustomers;
  });

  const [contracts, setContracts] = useState<Contract[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CONTRACTS);
    return saved ? JSON.parse(saved) : initialContracts;
  });

  const [sheetRows, setSheetRows] = useState<SheetRow[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SHEET);
    return saved ? JSON.parse(saved) : initialSheetRows;
  });

  const [operationRows, setOperationRows] = useState<OperationRow[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.OPERATIONS);
    return saved ? JSON.parse(saved) : initialOperationRows;
  });

  const [invoices, setInvoices] = useState<Invoice[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.INVOICES);
    return saved ? JSON.parse(saved) : initialInvoices;
  });

  const [company, setCompany] = useState<CompanyInfo>(() => {
    try {
      const saved = localStorage.getItem('mk_company_info_v8');
      if (saved) return { ...companyInfo, ...JSON.parse(saved) };
    } catch {}
    const b = (typeof window !== 'undefined' && (window as any).__TENANT_BRAND__) || null;
    return {
      ...companyInfo,
      ...(b?.name ? { name: b.name } : {}),
      ...(b?.phone ? { phone: b.phone } : {}),
      ...(b?.commercialRegister ? { commercialRecord: b.commercialRegister } : {}),
      ...(b?.taxCardNumber ? { taxCard: b.taxCardNumber } : {}),
    };
  });

  const updateCompanyInfo = (updates: Partial<CompanyInfo>) => {
    setCompany(prev => {
      const next = { ...prev, ...updates };
      try { localStorage.setItem('mk_company_info_v8', JSON.stringify(next)); } catch {}
      firestoreSync.saveCompanyInfo(next).catch(() => {});
      return next;
    });
  };

  const [bookings, setBookings] = useState<BookingRequest[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.BOOKINGS);
    return saved ? JSON.parse(saved) : initialBookings;
  });

  const [activeTab, setActiveTab] = useState<'dashboard' | 'contracts' | 'fleet' | 'crm' | 'sheet' | 'bookings' | 'calculator' | 'settings'>('dashboard');
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [selectedCar, setSelectedCar] = useState<Car | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [cloudStatus, setCloudStatus] = useState<'connected' | 'connecting' | 'offline'>('connecting');

  // Firestore Real-Time Sync & Initialization
  useEffect(() => {
    let unsubs: (() => void)[] = [];
    let isMounted = true;

    async function initFirestore() {
      try {
        const isConnected = await firestoreSync.initConnection();
        if (!isMounted) return;
        setCloudStatus(isConnected ? 'connected' : 'offline');

        // Seed initial fleet data to Firestore if cloud collection is empty
        await firestoreSync.checkAndSeedInitialData({
          cars: initialCars,
          customers: initialCustomers,
          contracts: initialContracts,
          sheetRows: initialSheetRows,
          operationRows: initialOperationRows,
          invoices: initialInvoices,
          bookings: initialBookings,
        });

        // Set up real-time Firestore listeners
        const unsubCars = firestoreSync.subscribeToCollection<Car>('cars', (cloudCars) => {
          if (cloudCars && cloudCars.length > 0) {
            setCars(cloudCars);
            setCloudStatus('connected');
          }
        });
        unsubs.push(unsubCars);

        const unsubCustomers = firestoreSync.subscribeToCollection<Customer>('customers', (cloudCustomers) => {
          if (cloudCustomers && cloudCustomers.length > 0) {
            setCustomers(cloudCustomers);
            setCloudStatus('connected');
          }
        });
        unsubs.push(unsubCustomers);

        const unsubContracts = firestoreSync.subscribeToCollection<Contract>('contracts', (cloudContracts) => {
          if (cloudContracts && cloudContracts.length > 0) {
            setContracts(cloudContracts);
            setCloudStatus('connected');
          }
        });
        unsubs.push(unsubContracts);

        const unsubSheet = firestoreSync.subscribeToCollection<SheetRow>('sheet_rows', (cloudSheet) => {
          if (cloudSheet && cloudSheet.length > 0) {
            setSheetRows(cloudSheet);
            setCloudStatus('connected');
          }
        });
        unsubs.push(unsubSheet);

        const unsubOps = firestoreSync.subscribeToCollection<OperationRow>('operation_rows', (cloudOps) => {
          if (cloudOps && cloudOps.length > 0) {
            setOperationRows(cloudOps);
            setCloudStatus('connected');
          }
        });
        unsubs.push(unsubOps);

        const unsubInvoices = firestoreSync.subscribeToCollection<Invoice>('invoices', (cloudInvoices) => {
          if (cloudInvoices && cloudInvoices.length > 0) {
            setInvoices(cloudInvoices);
            setCloudStatus('connected');
          }
        });
        unsubs.push(unsubInvoices);

        const unsubBookings = firestoreSync.subscribeToCollection<BookingRequest>('bookings', (cloudBookings) => {
          if (cloudBookings && cloudBookings.length > 0) {
            setBookings(cloudBookings);
            setCloudStatus('connected');
          }
        });
        unsubs.push(unsubBookings);

        const unsubCompany = firestoreSync.subscribeCompanyInfo((cloudCompany) => {
          if (cloudCompany && cloudCompany.name) {
            setCompany(prev => {
              const merged = { ...prev, ...cloudCompany };
              try { localStorage.setItem('mk_company_info_v8', JSON.stringify(merged)); } catch {}
              return merged;
            });
          }
        });
        unsubs.push(unsubCompany);
      } catch (err) {
        console.warn('Firebase sync listener warning:', err);
        if (isMounted) setCloudStatus('offline');
      }
    }

    initFirestore();

    return () => {
      isMounted = false;
      unsubs.forEach(u => u());
    };
  }, []);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CARS, JSON.stringify(cars));
  }, [cars]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CONTRACTS, JSON.stringify(contracts));
  }, [contracts]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SHEET, JSON.stringify(sheetRows));
  }, [sheetRows]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.OPERATIONS, JSON.stringify(operationRows));
  }, [operationRows]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(invoices));
  }, [invoices]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(bookings));
  }, [bookings]);

  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Helper for generating serial contract numbers
  const generateContractNumber = () => {
    const count = contracts.length + 1;
    const year = new Date().getFullYear();
    const pad = count < 10 ? `00${count}` : count < 100 ? `0${count}` : `${count}`;
    return `MK-${year}-${pad}`;
  };

  // Helper for generating serial invoice numbers
  const generateInvoiceNumber = () => {
    const count = invoices.length + 1;
    const year = new Date().getFullYear();
    const pad = count < 10 ? `00${count}` : count < 100 ? `0${count}` : `${count}`;
    return `INV-${year}-${pad}`;
  };

  // Create new contract (Syncs with both تشغيل عام and حسابات خاصة and generates Invoice)
  const createContract = (contractData: Omit<Contract, 'id' | 'contractNumber' | 'createdAt'>): Contract => {
    const newId = `contract-${Date.now()}`;
    const contractNumber = generateContractNumber();
    const newContract: Contract = {
      ...contractData,
      id: newId,
      contractNumber,
      createdAt: new Date().toISOString(),
    };

    setContracts(prev => [newContract, ...prev]);

    // Update car status to 'rented' and initial mileage
    setCars(prev => prev.map(car => {
      if (car.id === newContract.carId) {
        return {
          ...car,
          status: 'rented',
          currentMileage: Math.max(car.currentMileage, newContract.initialMileage),
        };
      }
      return car;
    }));

    // Update customer stats
    setCustomers(prev => prev.map(cust => {
      if (cust.id === newContract.customerId || cust.phone === newContract.customerSnapshot.phone) {
        return {
          ...cust,
          totalRentalsCount: cust.totalRentalsCount + 1,
          totalSpent: cust.totalSpent + (newContract.paidAmount || newContract.rentalAmount),
        };
      }
      return cust;
    }));

    const carName = newContract.carSnapshot.name || 'سيارة';
    const durationDesc = newContract.durationType === 'monthly' ? 'شهر كامل' : `${newContract.durationDays} يوم`;

    // 1. Sync to ورقة 1: تشغيل عام (General Operations Sheet)
    const newOperationRow: OperationRow = {
      id: `op-${Date.now()}`,
      index: operationRows.length + 2,
      carName: newContract.carSnapshot.name,
      plateNumber: newContract.carSnapshot.plateNumber,
      customerName: newContract.customerSnapshot.fullName,
      customerPhone: newContract.customerSnapshot.phone,
      customerNationalId: newContract.customerSnapshot.nationalId,
      rentalPeriod: durationDesc,
      startDate: newContract.startDate,
      endDate: newContract.endDate,
      rate: newContract.rentalAmount,
      paidAmount: newContract.paidAmount,
      initialMileage: newContract.initialMileage,
      status: 'active',
      carId: newContract.carId,
      contractId: newId,
      notes: `عقد رسمي رقم ${contractNumber} مع تأمين ${newContract.depositAmount} ج.م`,
    };
    setOperationRows(prev => [newOperationRow, ...prev]);

    // 2. Sync to ورقة 2: حسابات خاصة (Special Accounts Financial Ledger)
    if (newContract.paidAmount > 0) {
      const newSheetRow: SheetRow = {
        id: `row-${Date.now()}`,
        index: sheetRows.length + 1,
        revenue: newContract.paidAmount,
        revenueReason: `ايجار ${carName} ${durationDesc}`,
        expense: null,
        expenseReason: '',
        total: newContract.paidAmount,
        date: newContract.startDate || new Date().toISOString().split('T')[0],
        carId: newContract.carId,
        category: 'rental_income',
        contractId: newId,
        notes: `تم إنشاء العقد رقم ${contractNumber} للعميل ${newContract.customerSnapshot.fullName}`,
      };
      setSheetRows(prev => [...prev, newSheetRow]);
      firestoreSync.saveSheetRow(newSheetRow);
    }

    // 3. Auto-generate official customer invoice
    const invNumber = generateInvoiceNumber();
    const newInvoice: Invoice = {
      id: `inv-${Date.now()}`,
      invoiceNumber: invNumber,
      contractId: newId,
      contractNumber,
      customerId: newContract.customerId,
      customerName: newContract.customerSnapshot.fullName,
      customerNationalId: newContract.customerSnapshot.nationalId,
      customerPhone: newContract.customerSnapshot.phone,
      customerAddress: newContract.customerSnapshot.address,
      customerJob: newContract.customerSnapshot.job,
      carId: newContract.carId,
      carName: newContract.carSnapshot.name,
      carPlateNumber: newContract.carSnapshot.plateNumber,
      carModelYear: newContract.carSnapshot.modelYear,
      issueDate: newContract.contractDate || new Date().toISOString().split('T')[0],
      issueTime: newContract.contractTime || new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
      rentalPeriodDesc: durationDesc,
      startDate: newContract.startDate,
      endDate: newContract.endDate,
      durationDays: newContract.durationDays,
      rentalAmount: newContract.rentalAmount,
      depositAmount: newContract.depositAmount,
      additionalCharges: 0,
      discount: 0,
      totalAmount: newContract.rentalAmount + newContract.depositAmount,
      paidAmount: newContract.paidAmount,
      remainingAmount: Math.max(0, (newContract.rentalAmount + newContract.depositAmount) - newContract.paidAmount),
      paymentMethod: 'cash',
      paymentStatus: newContract.paymentStatus,
      notes: `فاتورة إيجار صادرة للعقد رقم ${contractNumber}`,
      createdAt: new Date().toISOString(),
    };
    setInvoices(prev => [newInvoice, ...prev]);

    // Persist to Cloud Firestore in real time
    firestoreSync.saveContract(newContract);
    firestoreSync.saveOperationRow(newOperationRow);
    firestoreSync.saveInvoice(newInvoice);
    const linkedCar = cars.find(c => c.id === newContract.carId);
    if (linkedCar) {
      firestoreSync.saveCar({
        ...linkedCar,
        status: 'rented',
        currentMileage: Math.max(linkedCar.currentMileage, newContract.initialMileage),
      });
    }
    const linkedCustomer = customers.find(c => c.id === newContract.customerId);
    if (linkedCustomer) {
      firestoreSync.saveCustomer({
        ...linkedCustomer,
        totalRentalsCount: (linkedCustomer.totalRentalsCount || 0) + 1,
        totalSpent: (linkedCustomer.totalSpent || 0) + (newContract.paidAmount || newContract.rentalAmount),
      });
    }

    showToast(`تم إنشاء العقد رقم ${contractNumber} بنجاح وتحديث شيت التشغيل العام والحسابات المالية والفاتورة سحابياً`, 'success');
    return newContract;
  };

  // Update Contract
  const updateContract = (id: string, updates: Partial<Contract>) => {
    setContracts(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
    const target = contracts.find(c => c.id === id);
    if (target) {
      firestoreSync.saveContract({ ...target, ...updates });
    }
    showToast('تم تحديث بيانات العقد بنجاح', 'info');
  };

  // Delete Contract
  const deleteContract = (id: string) => {
    const target = contracts.find(c => c.id === id);
    if (!target) return;

    // If the contract was active, free the linked car back to 'available'
    if (target.status === 'active' && target.carId) {
      setCars(prev => prev.map(car => car.id === target.carId ? { ...car, status: 'available' } : car));
      const targetCar = cars.find(c => c.id === target.carId);
      if (targetCar) {
        firestoreSync.saveCar({ ...targetCar, status: 'available' });
      }
    }

    // Remove contract from state and cloud
    setContracts(prev => prev.filter(c => c.id !== id));
    firestoreSync.deleteContract(id);

    // Clear selection if currently viewing
    if (selectedContract?.id === id) {
      setSelectedContract(null);
    }

    // Clean up related operation sheet row if exists
    const linkedOp = operationRows.find(op => op.contractId === id);
    if (linkedOp) {
      setOperationRows(prev => prev.filter(op => op.id !== linkedOp.id));
      firestoreSync.deleteOperationRow(linkedOp.id);
    }

    showToast(`تم حذف العقد رقم ${target.contractNumber} بنجاح`, 'info');
  };

  // Close Contract (Return Car, Check Odometer, Calculate Excess Km, Update Sheet)
  const closeContract = (
    contractId: string, 
    returnMileage: number, 
    returnDate: string, 
    fuelIn: string, 
    additionalCharges: number = 0, 
    notes?: string
  ) => {
    const target = contracts.find(c => c.id === contractId);
    if (!target) return;

    // Calculate actual distance driven
    const drivenKm = Math.max(0, returnMileage - target.initialMileage);
    const maxAllowedKm = target.durationDays * (target.allowedDailyKm || 120);
    const excessKm = Math.max(0, drivenKm - maxAllowedKm);
    const excessCost = excessKm * (target.excessKmRate || 5);
    const totalExtraRequired = excessCost + (additionalCharges || 0);

    const updatedContract: Contract = {
      ...target,
      status: 'completed',
      returnMileage,
      fuelIn,
      excessKmCount: excessKm,
      excessKmCost: excessCost,
      additionalCharges,
      closedAt: returnDate || new Date().toISOString(),
      closedOdometer: returnMileage,
      finalSettlementNotes: notes || (excessKm > 0 ? `كيلومتر زائد: ${excessKm} كم × ${target.excessKmRate} ج.م = ${excessCost} ج.م` : 'استلام سليم بدون تجاوز للكيلومترات'),
    };

    setContracts(prev => prev.map(c => c.id === contractId ? updatedContract : c));
    firestoreSync.saveContract(updatedContract);

    // Release car to 'available' and update its odometer
    setCars(prev => prev.map(car => {
      if (car.id === target.carId) {
        return {
          ...car,
          status: 'available',
          currentMileage: Math.max(car.currentMileage, returnMileage),
        };
      }
      return car;
    }));
    const carToFree = cars.find(c => c.id === target.carId);
    if (carToFree) {
      firestoreSync.saveCar({
        ...carToFree,
        status: 'available',
        currentMileage: Math.max(carToFree.currentMileage, returnMileage),
      });
    }

    // Update ورقة 1: تشغيل عام
    setOperationRows(prev => prev.map(op => {
      if (op.contractId === contractId || (op.carId === target.carId && op.status === 'active')) {
        return {
          ...op,
          status: 'completed',
          returnMileage,
          notes: `${op.notes || ''} — تم الإغلاق بعداد ${returnMileage} كم`,
        };
      }
      return op;
    }));
    const targetOp = operationRows.find(op => op.contractId === contractId || (op.carId === target.carId && op.status === 'active'));
    if (targetOp) {
      firestoreSync.saveOperationRow({
        ...targetOp,
        status: 'completed',
        returnMileage,
        notes: `${targetOp.notes || ''} — تم الإغلاق بعداد ${returnMileage} كم`,
      });
    }

    // If extra charges were collected, log to ورقة 2: حسابات خاصة
    if (totalExtraRequired > 0) {
      const extraSheetRow: SheetRow = {
        id: `row-${Date.now()}`,
        index: sheetRows.length + 1,
        revenue: totalExtraRequired,
        revenueReason: `تسوية اغلاق عقد ${target.contractNumber} (${excessKm > 0 ? `${excessKm} كم زيادة` : ''} ${additionalCharges > 0 ? `+ رسوم/غرامات ${additionalCharges}ج` : ''})`,
        expense: null,
        expenseReason: '',
        total: totalExtraRequired,
        date: returnDate || new Date().toISOString().split('T')[0],
        carId: target.carId,
        category: 'rental_income',
        contractId: target.id,
        notes: `إغلاق عقد ${target.contractNumber}. عداد الدخول: ${returnMileage} كم`,
      };
      setSheetRows(prev => [...prev, extraSheetRow]);
      firestoreSync.saveSheetRow(extraSheetRow);
    }

    showToast(`تم إغلاق العقد ${target.contractNumber} واستلام السيارة وتحديث التشغيل والعداد بالشيت`, 'success');
  };

  // Renew Contract
  const renewContract = (
    contractId: string, 
    newEndDate: string, 
    additionalDays: number, 
    newAmount: number, 
    notes?: string
  ): Contract => {
    const parent = contracts.find(c => c.id === contractId);
    if (!parent) throw new Error('Contract not found');

    const newContractNumber = generateContractNumber();
    const newContractId = `contract-${Date.now()}`;
    const newStartDate = parent.endDate;

    // Mark parent as renewed
    setContracts(prev => prev.map(c => c.id === contractId ? { ...c, status: 'renewed', renewedToContractId: newContractId } : c));

    const currentCar = cars.find(c => c.id === parent.carId);
    const startMileage = currentCar ? currentCar.currentMileage : parent.initialMileage;

    const renewedContract: Contract = {
      ...parent,
      id: newContractId,
      contractNumber: newContractNumber,
      contractDate: new Date().toISOString().split('T')[0],
      contractTime: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
      startDate: newStartDate,
      endDate: newEndDate,
      durationDays: additionalDays,
      durationType: additionalDays >= 28 ? 'monthly' : 'custom',
      rentalAmount: newAmount,
      paidAmount: newAmount,
      paymentStatus: 'paid',
      initialMileage: startMileage,
      returnMileage: undefined,
      excessKmCost: 0,
      excessKmCount: 0,
      status: 'active',
      renewedFromContractId: parent.id,
      generalNotes: `تجديد للعقد السابق ${parent.contractNumber}. ${notes || ''}`,
      createdAt: new Date().toISOString(),
    };

    setContracts(prev => [renewedContract, ...prev]);

    // Update ورقة 1: تشغيل عام
    const durationDesc = additionalDays >= 28 ? 'شهر تجديد' : `${additionalDays} يوم تجديد`;
    const newOp: OperationRow = {
      id: `op-${Date.now()}`,
      index: operationRows.length + 2,
      carName: renewedContract.carSnapshot.name,
      plateNumber: renewedContract.carSnapshot.plateNumber,
      customerName: renewedContract.customerSnapshot.fullName,
      customerPhone: renewedContract.customerSnapshot.phone,
      customerNationalId: renewedContract.customerSnapshot.nationalId,
      rentalPeriod: durationDesc,
      startDate: renewedContract.startDate,
      endDate: renewedContract.endDate,
      rate: newAmount,
      paidAmount: newAmount,
      initialMileage: renewedContract.initialMileage,
      status: 'active',
      carId: renewedContract.carId,
      contractId: newContractId,
      notes: `تجديد رسمي للعقد ${parent.contractNumber}`,
    };
    setOperationRows(prev => [newOp, ...prev]);

    // Add row to ورقة 2: حسابات خاصة
    if (newAmount > 0) {
      const carName = parent.carSnapshot.name || 'سيارة';
      const newSheetRow: SheetRow = {
        id: `row-${Date.now()}`,
        index: sheetRows.length + 1,
        revenue: newAmount,
        revenueReason: `تجديد ايجار ${carName} ${durationDesc}`,
        expense: null,
        expenseReason: '',
        total: newAmount,
        date: newStartDate,
        carId: parent.carId,
        category: 'rental_income',
        contractId: newContractId,
        notes: `تجديد العقد السابق ${parent.contractNumber} برقم جديد ${newContractNumber}`,
      };
      setSheetRows(prev => [...prev, newSheetRow]);
      firestoreSync.saveSheetRow(newSheetRow);
    }

    // Auto-generate invoice
    const invNumber = generateInvoiceNumber();
    const newInvoice: Invoice = {
      id: `inv-${Date.now()}`,
      invoiceNumber: invNumber,
      contractId: newContractId,
      contractNumber: newContractNumber,
      customerId: renewedContract.customerId,
      customerName: renewedContract.customerSnapshot.fullName,
      customerNationalId: renewedContract.customerSnapshot.nationalId,
      customerPhone: renewedContract.customerSnapshot.phone,
      customerAddress: renewedContract.customerSnapshot.address,
      carId: renewedContract.carId,
      carName: renewedContract.carSnapshot.name,
      carPlateNumber: renewedContract.carSnapshot.plateNumber,
      issueDate: new Date().toISOString().split('T')[0],
      issueTime: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
      rentalPeriodDesc: durationDesc,
      startDate: renewedContract.startDate,
      endDate: renewedContract.endDate,
      durationDays: additionalDays,
      rentalAmount: newAmount,
      depositAmount: 0,
      additionalCharges: 0,
      discount: 0,
      totalAmount: newAmount,
      paidAmount: newAmount,
      remainingAmount: 0,
      paymentMethod: 'cash',
      paymentStatus: 'paid',
      notes: `فاتورة تجديد العقد ${newContractNumber}`,
      createdAt: new Date().toISOString(),
    };
    setInvoices(prev => [newInvoice, ...prev]);

    // Persist to Cloud Firestore
    firestoreSync.saveContract(renewedContract);
    firestoreSync.saveContract({ ...parent, status: 'renewed', renewedToContractId: newContractId });
    firestoreSync.saveOperationRow(newOp);
    firestoreSync.saveInvoice(newInvoice);

    showToast(`تم تجديد العقد بنجاح برقم ${newContractNumber} وإضافة الإيراد للشيت والفاتورة ومزامنته سحابياً`, 'success');
    return renewedContract;
  };

  // Car Actions
  const addCar = (carData: Omit<Car, 'id'>) => {
    const newCar: Car = {
      ...carData,
      id: `car-${Date.now()}`,
    };
    setCars(prev => [...prev, newCar]);
    firestoreSync.saveCar(newCar);
    showToast(`تمت إضافة السيارة ${newCar.name} إلى الأسطول`, 'success');
  };

  const updateCar = (id: string, updates: Partial<Car>) => {
    setCars(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
    const target = cars.find(c => c.id === id);
    if (target) {
      firestoreSync.saveCar({ ...target, ...updates });
    }
    showToast('تم حفظ تعديلات السيارة', 'info');
  };

  const updateCarMileage = (carId: string, newMileage: number, reason?: string) => {
    setCars(prev => prev.map(c => {
      if (c.id === carId) {
        const updatedCar = {
          ...c,
          currentMileage: newMileage,
          notes: reason ? `${c.notes ? c.notes + '\n' : ''}[${new Date().toLocaleDateString('ar-EG')}] تحديث العداد إلى ${newMileage} كم: ${reason}` : c.notes,
        };
        firestoreSync.saveCar(updatedCar);
        return updatedCar;
      }
      return c;
    }));
    showToast(`تم تحديث قراءة العداد إلى ${newMileage.toLocaleString()} كم`, 'success');
  };

  const deleteCar = (id: string) => {
    const target = cars.find(c => c.id === id);
    if (!target) return;
    setCars(prev => prev.filter(c => c.id !== id));
    firestoreSync.deleteCar(id);
    if (selectedCar?.id === id) {
      setSelectedCar(null);
    }
    showToast(`تم حذف السيارة ${target.name} (${target.plateNumber}) من الأسطول`, 'info');
  };

  // Customer Actions
  const addCustomer = (customerData: Omit<Customer, 'id' | 'createdAt' | 'totalRentalsCount' | 'totalSpent'>): Customer => {
    const newCustomer: Customer = {
      ...customerData,
      id: `cust-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
      totalRentalsCount: 0,
      totalSpent: 0,
    };
    setCustomers(prev => [newCustomer, ...prev]);
    firestoreSync.saveCustomer(newCustomer);
    showToast(`تمت إضافة العميل ${newCustomer.fullName} إلى قاعدة البيانات`, 'success');
    return newCustomer;
  };

  const updateCustomer = (id: string, updates: Partial<Customer>) => {
    setCustomers(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
    const target = customers.find(c => c.id === id);
    if (target) {
      firestoreSync.saveCustomer({ ...target, ...updates });
    }
    showToast('تم تحديث بيانات العميل بنجاح', 'info');
  };

  const deleteCustomer = (id: string) => {
    const target = customers.find(c => c.id === id);
    setCustomers(prev => prev.filter(c => c.id !== id));
    firestoreSync.deleteCustomer(id);
    showToast(`تم حذف العميل ${target ? `"${target.fullName}" ` : ''}بنجاح`, 'info');
  };

  // Sheet Actions: ورقة 2 (حسابات خاصة - الماليات)
  const addSheetRow = (rowData: Omit<SheetRow, 'id' | 'index' | 'total'>) => {
    const netRowTotal = (rowData.revenue || 0) - (rowData.expense || 0);
    const newRow: SheetRow = {
      ...rowData,
      id: `row-${Date.now()}`,
      index: sheetRows.length + 1,
      total: netRowTotal,
    };
    setSheetRows(prev => [...prev, newRow]);
    firestoreSync.saveSheetRow(newRow);
    showToast('تمت إضافة المعاملة إلى ورقة حسابات خاصة بنجاح', 'success');
  };

  const updateSheetRow = (id: string, updates: Partial<SheetRow>) => {
    setSheetRows(prev => prev.map(r => {
      if (r.id === id) {
        const merged = { ...r, ...updates };
        const newTotal = (merged.revenue || 0) - (merged.expense || 0);
        const updatedRow = { ...merged, total: newTotal };
        firestoreSync.saveSheetRow(updatedRow);
        return updatedRow;
      }
      return r;
    }));
    showToast('تم تحديث سجل الشيت', 'info');
  };

  const deleteSheetRow = (id: string) => {
    setSheetRows(prev => prev.filter(r => r.id !== id));
    firestoreSync.deleteSheetRow(id);
    showToast('تم حذف السطر من ورقة الحسابات', 'info');
  };

  const resetToInitialSheet = () => {
    setSheetRows([]);
    showToast('تم تفريغ سجل ورقة حسابات خاصة بالكامل', 'info');
  };

  // Sheet Operations Actions: ورقة 1 (تشغيل عام - العمليات والأسطول)
  const addOperationRow = (opData: Omit<OperationRow, 'id' | 'index'>) => {
    const newOp: OperationRow = {
      ...opData,
      id: `op-${Date.now()}`,
      index: operationRows.length + 2,
    };
    setOperationRows(prev => [newOp, ...prev]);
    firestoreSync.saveOperationRow(newOp);
    showToast(`تمت إضافة عملية التشغيل للسيارة ${opData.carName} إلى ورقة تشغيل عام`, 'success');
  };

  const updateOperationRow = (id: string, updates: Partial<OperationRow>) => {
    setOperationRows(prev => prev.map(op => {
      if (op.id === id) {
        const updated = { ...op, ...updates };
        firestoreSync.saveOperationRow(updated);
        return updated;
      }
      return op;
    }));
    showToast('تم تحديث عملية التشغيل في ورقة تشغيل عام', 'info');
  };

  const deleteOperationRow = (id: string) => {
    setOperationRows(prev => prev.filter(op => op.id !== id));
    firestoreSync.deleteOperationRow(id);
    showToast('تم حذف عملية التشغيل من ورقة تشغيل عام', 'info');
  };

  const resetToInitialOperations = () => {
    setOperationRows([]);
    showToast('تم تفريغ سجل ورقة تشغيل عام بالكامل', 'info');
  };

  // Clear all data from application to run with real live data
  const clearAllData = () => {
    setCars([]);
    setCustomers([]);
    setContracts([]);
    setSheetRows([]);
    setOperationRows([]);
    setInvoices([]);
    setBookings([]);
    setSelectedContract(null);
    setSelectedCar(null);
    setSelectedCustomer(null);
    setSelectedInvoice(null);
    try {
      localStorage.setItem(STORAGE_KEYS.CARS, JSON.stringify([]));
      localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify([]));
      localStorage.setItem(STORAGE_KEYS.CONTRACTS, JSON.stringify([]));
      localStorage.setItem(STORAGE_KEYS.SHEET, JSON.stringify([]));
      localStorage.setItem(STORAGE_KEYS.OPERATIONS, JSON.stringify([]));
      localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify([]));
      localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify([]));
    } catch (e) {
      console.error(e);
    }
    showToast('تم مسح وتصفير كافة البيانات بنجاح، النظام جاهز للعمل الفعلي المباشر', 'success');
  };

  // Invoice Actions
  const createInvoice = (invoiceData: Omit<Invoice, 'id' | 'invoiceNumber' | 'createdAt'>): Invoice => {
    const newId = `inv-${Date.now()}`;
    const invoiceNumber = generateInvoiceNumber();
    const newInvoice: Invoice = {
      ...invoiceData,
      id: newId,
      invoiceNumber,
      createdAt: new Date().toISOString(),
    };
    setInvoices(prev => [newInvoice, ...prev]);
    firestoreSync.saveInvoice(newInvoice);
    showToast(`تم إصدار الفاتورة رقم ${invoiceNumber} بنجاح للعميل ${newInvoice.customerName}`, 'success');
    return newInvoice;
  };

  const updateInvoice = (id: string, updates: Partial<Invoice>) => {
    setInvoices(prev => prev.map(inv => {
      if (inv.id === id) {
        const updated = { ...inv, ...updates };
        firestoreSync.saveInvoice(updated);
        return updated;
      }
      return inv;
    }));
    showToast('تم تحديث بيانات الفاتورة', 'info');
  };

  const deleteInvoice = (id: string) => {
    setInvoices(prev => prev.filter(inv => inv.id !== id));
    firestoreSync.deleteInvoice(id);
    showToast('تم حذف الفاتورة', 'info');
  };

  const generateInvoiceForContract = (contract: Contract, paymentMethod: PaymentMethod = 'cash'): Invoice => {
    const existing = invoices.find(inv => inv.contractId === contract.id);
    if (existing) return existing;

    const invNumber = generateInvoiceNumber();
    const durationDesc = contract.durationType === 'monthly' ? 'شهر كامل' : `${contract.durationDays} يوم`;
    const newInvoice: Invoice = {
      id: `inv-${Date.now()}`,
      invoiceNumber: invNumber,
      contractId: contract.id,
      contractNumber: contract.contractNumber,
      customerId: contract.customerId,
      customerName: contract.customerSnapshot.fullName,
      customerNationalId: contract.customerSnapshot.nationalId,
      customerPhone: contract.customerSnapshot.phone,
      customerAddress: contract.customerSnapshot.address,
      customerJob: contract.customerSnapshot.job,
      carId: contract.carId,
      carName: contract.carSnapshot.name,
      carPlateNumber: contract.carSnapshot.plateNumber,
      carModelYear: contract.carSnapshot.modelYear,
      issueDate: contract.contractDate || new Date().toISOString().split('T')[0],
      issueTime: contract.contractTime || new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
      rentalPeriodDesc: durationDesc,
      startDate: contract.startDate,
      endDate: contract.endDate,
      durationDays: contract.durationDays,
      rentalAmount: contract.rentalAmount,
      depositAmount: contract.depositAmount,
      additionalCharges: contract.additionalCharges || 0,
      discount: 0,
      totalAmount: contract.rentalAmount + contract.depositAmount + (contract.additionalCharges || 0),
      paidAmount: contract.paidAmount,
      remainingAmount: Math.max(0, (contract.rentalAmount + contract.depositAmount + (contract.additionalCharges || 0)) - contract.paidAmount),
      paymentMethod,
      paymentStatus: contract.paymentStatus,
      notes: `فاتورة رسمية وسند تحصيل للعقد ${contract.contractNumber}`,
      createdAt: new Date().toISOString(),
    };
    setInvoices(prev => [newInvoice, ...prev]);
    firestoreSync.saveInvoice(newInvoice);
    showToast(`تم تجهيز فاتورة العقد رقم ${invNumber}`, 'success');
    return newInvoice;
  };

  // Booking Actions
  const submitBooking = (bookingData: Omit<BookingRequest, 'id' | 'createdAt' | 'status'>) => {
    const newBooking: BookingRequest = {
      ...bookingData,
      id: `book-${Date.now()}`,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    setBookings(prev => [newBooking, ...prev]);
    firestoreSync.saveBooking(newBooking);
    showToast('تم تسجيل طلب الحجز بنجاح! سيتم التواصل معك للتأكيد', 'success');
  };

  const updateBookingStatus = (id: string, status: BookingRequest['status']) => {
    setBookings(prev => prev.map(b => {
      if (b.id === id) {
        const updated = { ...b, status };
        firestoreSync.saveBooking(updated);
        return updated;
      }
      return b;
    }));
    showToast(`تم تغيير حالة الحجز إلى ${status}`, 'info');
  };

  const convertBookingToContract = (bookingId: string): Contract | null => {
    const booking = bookings.find(b => b.id === bookingId);
    if (!booking) return null;

    const car = cars.find(c => c.id === booking.carId) || (cars.length > 0 ? cars[0] : null);
    if (!car) {
      showToast('لا توجد سيارة متاحة في الأسطول لإتمام هذا الحجز. يرجى إضافة سيارة أولاً.', 'error');
      return null;
    }
    let customer = customers.find(c => c.phone === booking.customerPhone || c.nationalId === booking.customerNationalId);
    
    if (!customer) {
      customer = addCustomer({
        fullName: booking.customerName,
        phone: booking.customerPhone,
        nationalId: booking.customerNationalId || 'لم تسجل بعد',
        nationality: 'مصري',
        address: 'عنوان العميل',
        job: 'عميل حجز ذكي',
        licenseNumber: 'رخصة قيادة سارية',
        notes: `حجز عبر البوابة الذكية: ${booking.notes || ''}`,
      });
    }

    const startDate = booking.startDate;
    const endDate = booking.endDate;
    const days = booking.days || 1;

    const contract = createContract({
      carId: car.id,
      customerId: customer.id,
      customerSnapshot: {
        fullName: customer.fullName,
        nationalId: customer.nationalId,
        nationality: customer.nationality,
        address: customer.address,
        job: customer.job,
        licenseNumber: customer.licenseNumber,
        phone: customer.phone,
      },
      carSnapshot: {
        name: car.name,
        brand: car.brand,
        modelYear: car.modelYear,
        color: car.color,
        ownerName: car.ownerName,
        plateNumber: car.plateNumber,
        trafficUnit: car.trafficUnit,
        chassisNumber: car.chassisNumber,
        motorNumber: car.motorNumber,
      },
      contractDayName: 'اليوم',
      contractDate: new Date().toISOString().split('T')[0],
      contractTime: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
      startDate,
      endDate,
      durationDays: days,
      durationType: days >= 28 ? 'monthly' : 'custom',
      rentalAmount: booking.estimatedCost,
      depositAmount: 3000,
      paidAmount: booking.estimatedCost,
      paymentStatus: 'paid',
      allowedDailyKm: car.allowedDailyKm || 120,
      excessKmRate: car.excessKmRate || 5,
      initialMileage: car.currentMileage,
      fuelOut: 'ممتلئ (Full)',
      status: 'active',
      generalNotes: `تم تحويله تلقائياً من طلب الحجز الذكي رقم ${booking.id}`,
    });

    updateBookingStatus(bookingId, 'converted');
    return contract;
  };

  // Financial and KPI calculations
  const totalRevenue = sheetRows.reduce((sum, r) => sum + (r.revenue || 0), 0);
  const totalExpenses = sheetRows.reduce((sum, r) => sum + (r.expense || 0), 0);
  const netBalance = totalRevenue - totalExpenses;
  const activeRentalsCount = contracts.filter(c => c.status === 'active').length;
  const totalCarsCount = cars.length;
  const availableCarsCount = cars.filter(c => c.status === 'available').length;
  const fleetUtilization = totalCarsCount > 0 ? Math.round(((totalCarsCount - availableCarsCount) / totalCarsCount) * 100) : 0;
  
  const totalInstallmentsPaid = sheetRows
    .filter(r => r.category === 'installment' || r.expenseReason.includes('قسط'))
    .reduce((sum, r) => sum + (r.expense || 0), 0);

  const totalMaintenancePaid = sheetRows
    .filter(r => r.category === 'maintenance' || r.category === 'gps_accessory' || r.category === 'violation')
    .reduce((sum, r) => sum + (r.expense || 0), 0);

  const today = new Date();
  const currentDay = today.getDate();

  const upcomingInstallments = cars
    .filter(c => c.monthlyInstallment && c.monthlyInstallment > 0)
    .map(c => {
      const dueDay = c.installmentDueDay || 10;
      const isDueSoon = Math.abs(dueDay - currentDay) <= 5;
      return {
        carName: c.name,
        plateNumber: c.plateNumber,
        amount: c.monthlyInstallment!,
        dueDay,
        isDueSoon,
      };
    });

  const financialStats = {
    totalRevenue,
    totalExpenses,
    netBalance,
    activeRentalsCount,
    totalCarsCount,
    availableCarsCount,
    fleetUtilization,
    totalInstallmentsPaid,
    totalMaintenancePaid,
    upcomingInstallments,
  };

  return (
    <AppContext.Provider
      value={{
        cloudStatus,
        company,
        updateCompanyInfo,
        cars,
        customers,
        contracts,
        sheetRows,
        operationRows,
        invoices,
        bookings,
        activeTab,
        setActiveTab,
        selectedContract,
        setSelectedContract,
        selectedCar,
        setSelectedCar,
        selectedCustomer,
        setSelectedCustomer,
        selectedInvoice,
        setSelectedInvoice,
        createContract,
        updateContract,
        deleteContract,
        closeContract,
        renewContract,
        addCar,
        updateCar,
        updateCarMileage,
        deleteCar,
        addCustomer,
        updateCustomer,
        deleteCustomer,
        addSheetRow,
        updateSheetRow,
        deleteSheetRow,
        resetToInitialSheet,
        addOperationRow,
        updateOperationRow,
        deleteOperationRow,
        resetToInitialOperations,
        createInvoice,
        updateInvoice,
        deleteInvoice,
        generateInvoiceForContract,
        submitBooking,
        updateBookingStatus,
        convertBookingToContract,
        financialStats,
        toastMessage,
        toast: toastMessage ? { message: toastMessage.text, type: toastMessage.type } : null,
        showToast,
        clearAllData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
