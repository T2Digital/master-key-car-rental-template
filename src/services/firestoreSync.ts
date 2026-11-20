import {
  collection as fsCollection,
  doc as fsDoc,
  setDoc,
  deleteDoc,
  getDocs,
  onSnapshot,
  Unsubscribe
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType, testFirestoreConnection } from '../lib/firebase';
import { resolveCarRentalBrandSlug } from '../tenantBootstrap';
import {
  Car,
  Customer,
  Contract,
  SheetRow,
  OperationRow,
  Invoice,
  BookingRequest,
  CompanyInfo
} from '../types';

function collection(database: typeof db, name: string) {
  const slug = resolveCarRentalBrandSlug();
  return slug ? fsCollection(database, 'tenants', slug, name) : fsCollection(database, name);
}

function doc(database: typeof db, name: string, id: string) {
  const slug = resolveCarRentalBrandSlug();
  return slug ? fsDoc(database, 'tenants', slug, name, id) : fsDoc(database, name, id);
}

// Helper to remove undefined fields because Firestore rejects undefined values
function sanitizeForFirestore<T>(data: T): Record<string, any> {
  const clean: Record<string, any> = {};
  if (!data || typeof data !== 'object') return clean;
  
  Object.entries(data as Record<string, any>).forEach(([key, value]) => {
    if (value !== undefined) {
      if (value !== null && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
        clean[key] = sanitizeForFirestore(value);
      } else {
        clean[key] = value;
      }
    }
  });
  return clean;
}

export const firestoreSync = {
  // Test connection on boot
  initConnection: async () => {
    return await testFirestoreConnection();
  },

  // Save / Update Car
  saveCar: async (car: Car) => {
    const path = `cars/${car.id}`;
    try {
      await setDoc(doc(db, 'cars', car.id), sanitizeForFirestore(car));
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  deleteCar: async (carId: string) => {
    const path = `cars/${carId}`;
    try {
      await deleteDoc(doc(db, 'cars', carId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  },

  // Save / Update Customer
  saveCustomer: async (customer: Customer) => {
    const path = `customers/${customer.id}`;
    try {
      await setDoc(doc(db, 'customers', customer.id), sanitizeForFirestore(customer));
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  deleteCustomer: async (customerId: string) => {
    const path = `customers/${customerId}`;
    try {
      await deleteDoc(doc(db, 'customers', customerId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  },

  // Save / Update Contract
  saveContract: async (contract: Contract) => {
    const path = `contracts/${contract.id}`;
    try {
      await setDoc(doc(db, 'contracts', contract.id), sanitizeForFirestore(contract));
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  deleteContract: async (contractId: string) => {
    const path = `contracts/${contractId}`;
    try {
      await deleteDoc(doc(db, 'contracts', contractId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  },

  // Save / Update Invoice
  saveInvoice: async (invoice: Invoice) => {
    const path = `invoices/${invoice.id}`;
    try {
      await setDoc(doc(db, 'invoices', invoice.id), sanitizeForFirestore(invoice));
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  deleteInvoice: async (invoiceId: string) => {
    const path = `invoices/${invoiceId}`;
    try {
      await deleteDoc(doc(db, 'invoices', invoiceId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  },

  // Save / Update Sheet Row (ورقة حسابات خاصة)
  saveSheetRow: async (row: SheetRow) => {
    const path = `sheet_rows/${row.id}`;
    try {
      await setDoc(doc(db, 'sheet_rows', row.id), sanitizeForFirestore(row));
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  deleteSheetRow: async (rowId: string) => {
    const path = `sheet_rows/${rowId}`;
    try {
      await deleteDoc(doc(db, 'sheet_rows', rowId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  },

  // Save / Update Operation Row (ورقة تشغيل عام)
  saveOperationRow: async (row: OperationRow) => {
    const path = `operation_rows/${row.id}`;
    try {
      await setDoc(doc(db, 'operation_rows', row.id), sanitizeForFirestore(row));
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  deleteOperationRow: async (rowId: string) => {
    const path = `operation_rows/${rowId}`;
    try {
      await deleteDoc(doc(db, 'operation_rows', rowId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  },

  // Save / Update Booking
  saveBooking: async (booking: BookingRequest) => {
    const path = `bookings/${booking.id}`;
    try {
      await setDoc(doc(db, 'bookings', booking.id), sanitizeForFirestore(booking));
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  deleteBooking: async (bookingId: string) => {
    const path = `bookings/${bookingId}`;
    try {
      await deleteDoc(doc(db, 'bookings', bookingId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  },

  // Subscribe to all collections in real time
  subscribeToCollection: <T>(
    collectionName: string,
    onData: (items: T[]) => void
  ): Unsubscribe => {
    const colRef = collection(db, collectionName);
    return onSnapshot(
      colRef,
      (snapshot) => {
        const items: T[] = [];
        snapshot.forEach((doc) => {
          items.push({ id: doc.id, ...doc.data() } as unknown as T);
        });
        onData(items);
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, collectionName);
      }
    );
  },

  // Save / Subscribe Company Legal Info
  saveCompanyInfo: async (company: CompanyInfo) => {
    try {
      await setDoc(doc(db, 'company_settings', 'main'), sanitizeForFirestore(company));
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'company_settings/main');
    }
  },

  subscribeCompanyInfo: (onData: (company: CompanyInfo) => void): Unsubscribe => {
    return onSnapshot(
      doc(db, 'company_settings', 'main'),
      (snap) => {
        if (snap.exists()) {
          onData(snap.data() as CompanyInfo);
        }
      },
      (err) => console.warn('Company settings snapshot warning:', err)
    );
  },

  // Initial seed if cloud DB is completely empty
  checkAndSeedInitialData: async (seedPayload: {
    cars: Car[];
    customers: Customer[];
    contracts: Contract[];
    sheetRows: SheetRow[];
    operationRows: OperationRow[];
    invoices: Invoice[];
    bookings: BookingRequest[];
  }) => {
    try {
      const carsSnap = await getDocs(collection(db, 'cars'));
      if (carsSnap.empty) {
        console.log('Seeding initial Master Key fleet data to Cloud Firestore...');
        // Seed cars
        for (const car of seedPayload.cars) {
          await setDoc(doc(db, 'cars', car.id), sanitizeForFirestore(car));
        }
        // Seed customers
        for (const customer of seedPayload.customers) {
          await setDoc(doc(db, 'customers', customer.id), sanitizeForFirestore(customer));
        }
        // Seed contracts
        for (const contract of seedPayload.contracts) {
          await setDoc(doc(db, 'contracts', contract.id), sanitizeForFirestore(contract));
        }
        // Seed sheetRows
        for (const row of seedPayload.sheetRows) {
          await setDoc(doc(db, 'sheet_rows', row.id), sanitizeForFirestore(row));
        }
        // Seed operationRows
        for (const row of seedPayload.operationRows) {
          await setDoc(doc(db, 'operation_rows', row.id), sanitizeForFirestore(row));
        }
        // Seed invoices
        for (const inv of seedPayload.invoices) {
          await setDoc(doc(db, 'invoices', inv.id), sanitizeForFirestore(inv));
        }
        // Seed bookings
        for (const booking of seedPayload.bookings) {
          await setDoc(doc(db, 'bookings', booking.id), sanitizeForFirestore(booking));
        }
        console.log('Initial data seeded successfully to Firestore!');
      }
    } catch (e) {
      console.warn('Firestore initial seed notice (offline or read delayed):', e);
    }
  }
};
