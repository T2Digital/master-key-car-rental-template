import { Car, CompanyInfo, Customer, Contract, SheetRow, BookingRequest, OperationRow, Invoice } from '../types';

export const companyInfo: CompanyInfo = {
  name: 'شركة ماستر كي لتأجير وتوريد السيارات',
  commercialRecord: '1379',
  taxCard: '503-798-767',
  representativeName: 'كريم كرم محرم عويس',
  representativeNationalId: '29601072103231',
  representativeTitle: 'رئيس مجلس إدارة الشركة',
  phone: '01146442004',
  officePhone: '01022221258',
  email: 'kareemkarm115@Gmail.com',
  courtJurisdiction: 'محكمة الجيزة',
  dailyKmAllowance: 120,
};

// تفريغ كافة البيانات الأولية والبدء بقاعدة بيانات حية وفارغة
export const initialCars: Car[] = [];
export const initialCustomers: Customer[] = [];
export const initialContracts: Contract[] = [];
export const initialInvoices: Invoice[] = [];
export const initialOperationRows: OperationRow[] = [];
export const initialSheetRows: SheetRow[] = [];
export const initialBookings: BookingRequest[] = [];
