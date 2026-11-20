export type CarStatus = 'available' | 'rented' | 'maintenance' | 'reserved';

export interface Car {
  id: string;
  name: string;
  brand: string;
  modelYear: string;
  color: string;
  plateNumber: string;
  trafficUnit: string; // وحدة المرور
  chassisNumber: string; // رقم الشاسية
  motorNumber: string; // رقم الماتور
  ownerName: string; // اسم المالك
  currentMileage: number; // قراءة العداد الحالي (كم)
  dailyRate: number; // سعر اليوم
  monthlyRate: number; // سعر الشهر
  excessKmRate: number; // سعر الكيلومتر الزائد (ج.م)
  allowedDailyKm: number; // الكيلومتر المسموح يومياً (120 كم)
  monthlyInstallment?: number; // القسط الشهري (إن وجد)
  installmentDueDay?: number; // يوم استحقاق القسط (مثلاً 10 أو 15)
  status: CarStatus;
  imageUrl: string;
  features: string[];
  equipment: {
    hasGps: boolean;
    gpsInstalledDate?: string;
    gpsCost?: number;
    hasMats: boolean;
    matsCost?: number;
    lastOilChangeKm?: number;
    nextOilChangeKm?: number;
    tireCondition?: string;
  };
  notes?: string;
}

export interface Customer {
  id: string;
  fullName?: string;
  name?: string; // alias
  nationalId: string; // رقم البطاقة أو جواز السفر
  nationality?: string; // الجنسية
  address: string; // عنوان الإقامة
  job?: string; // الوظيفة
  licenseNumber?: string; // رقم الرخصة
  phone: string; // رقم الهاتف
  altPhone?: string; // هاتف بديل / واتساب
  email?: string;
  rating?: number; // تقييم العميل
  status?: string; // حالة العميل
  totalRentals?: number;
  activeContractsCount?: number;
  idCardImageUrl?: string;
  licenseImageUrl?: string;
  notes?: string;
  createdAt?: string;
  totalRentalsCount?: number;
  totalSpent?: number;
}

export type ContractStatus = 'active' | 'completed' | 'renewed' | 'cancelled' | 'overdue';

export interface Contract {
  id: string;
  contractNumber: string; // مثل: MK-2026-001
  carId: string;
  customerId: string;
  
  // بيانات الطرف الثاني المؤقتة المحفوظة مع العقد للتوثيق
  customerSnapshot?: {
    fullName: string;
    nationalId: string;
    nationality: string;
    address: string;
    job: string;
    licenseNumber: string;
    phone: string;
  };
  
  // بيانات السيارة وقت العقد
  carSnapshot?: {
    name: string;
    brand?: string;
    modelYear?: string;
    color?: string;
    ownerName?: string;
    plateNumber: string;
    trafficUnit?: string;
    chassisNumber?: string;
    motorNumber?: string;
  };

  // تفاصيل تاريخ العقد
  contractDayName?: string; // اسم اليوم (السبت، الأحد، ...)
  contractDate?: string; // تاريخ تحرير العقد (YYYY-MM-DD)
  contractTime?: string; // ساعة التحرير
  
  // مدة الإيجار
  startDate: string; // تاريخ الاستلام
  endDate: string; // تاريخ التسليم
  durationDays?: number; // مدة العقد بالأيام
  rentalPeriodDays?: number; // alias
  dailyRate?: number; // سعر اليوم
  durationType?: 'daily' | 'monthly' | 'custom';
  
  // الشق المالي
  rentalAmount?: number; // القيمة الإيجارية المتفق عليها
  totalRentAmount?: number; // alias
  depositAmount?: number; // مبلغ التأمين
  paidAmount?: number; // المبلغ المدفوع مقدماً
  remainingAmount?: number; // المبلغ المتبقي
  paymentStatus?: 'paid' | 'partial' | 'pending';
  paymentMethod?: PaymentMethod | string;
  
  // بيانات العداد
  allowedDailyKm?: number; // 120 كم افتراضياً
  dailyKmAllowance?: number; // alias
  excessKmRate?: number; // سعر الكيلو متر فوق المسموح
  initialMileage: number; // كيلو متر الخروج
  returnMileage?: number; // كيلو متر الدخول
  excessKmCount?: number; // عدد الكيلومترات الزائدة
  excessKmCost?: number; // تكلفة الكيلومترات الزائدة
  
  // فحص واستلام
  fuelOut?: string; // مستوى الوقود عند الاستلام (ممتلئ، 3/4، 1/2، ...)
  fuelIn?: string; // مستوى الوقود عند الإرجاع
  damagesNotes?: string;
  generalNotes?: string;
  notes?: string;
  secondPartyRepresentative?: string;
  
  status: ContractStatus;
  renewedFromContractId?: string; // في حالة التجديد
  renewedToContractId?: string;
  
  closedAt?: string;
  closedOdometer?: number;
  finalSettlementNotes?: string;
  additionalCharges?: number; // أي غرامات أو إضافات عند الإغلاق
  
  createdAt: string;
}

export type SheetCategory = 'rental_income' | 'installment' | 'maintenance' | 'gps_accessory' | 'tracker' | 'accessories' | 'upholstery' | 'violation' | 'accident_settlement' | 'bodywork_plates' | 'other';

// ورقة حسابات خاصة (القسم المالي - الوارد والمصروفات والأقساط)
export interface SheetRow {
  id: string;
  index: number;
  revenue: number | null; // عمود1 (إيراد الإيجار)
  revenueReason: string; // السبب
  expense: number | null; // المصروفات
  expenseReason: string; // السبب2
  total: number; // الإجمالي
  date: string; // التاريخ
  carId?: string;
  category: SheetCategory;
  contractId?: string;
  notes?: string;
}

// ورقة تشغيل عام (قاعدة البيانات التشغيلية للأسطول والعملاء وحركات التأجير)
export interface OperationRow {
  id: string;
  index: number;
  carName: string; // السيارة (مثل: توسان 2025، النترا CN7/2021، سبورتاج 2024، مرسيدس E350، نيسان كشكاي، اوبترا كحلي، اوبترا فضي، إلخ)
  plateNumber: string; // رقم اللوحة
  customerName: string; // اسم العميل
  customerPhone: string; // رقم الهاتف
  customerNationalId?: string; // الرقم القومي
  rentalPeriod?: string; // فترة الإيجار
  startDate: string; // بداية العقد
  endDate: string; // نهاية العقد
  initialMileage: number; // كم خروج
  returnMileage?: number; // كم دخول
  timeOut?: string; // ساعة الخروج
  timeIn?: string; // ساعة الدخول
  totalDays?: number; // اجمالي الايام
  totalKm?: number; // اجمالي كم
  excessKm?: number; // كم فوق المسموح
  supplySource?: string; // توريد (مكتب رفاهيه، مكتب ماستر كي، شركه الحمل، شركه الملوك، إلخ)
  rate?: number; // القيمة الإيجارية المتفق عليها
  paidAmount?: number; // المدفوع
  status: 'active' | 'completed' | 'scheduled'; // حالة التشغيل
  carId?: string;
  contractId?: string;
  notes?: string;
}

export type PaymentMethod = 'cash' | 'instapay' | 'bank_transfer' | 'vodafone_cash' | 'card';

// فاتورة العميل وسند القبض الرسمي
export interface Invoice {
  id: string;
  invoiceNumber: string; // INV-2026-001
  contractId?: string;
  contractNumber?: string;
  customerId: string;
  customerName: string;
  customerNationalId?: string;
  customerPhone: string;
  customerAddress?: string;
  customerJob?: string;
  carId?: string;
  carName: string;
  carPlateNumber?: string;
  plateNumber?: string; // alias
  carModelYear?: string;
  issueDate: string;
  issueTime?: string;
  dueDate?: string; // تاريخ الاستحقاق
  rentalPeriodDesc?: string;
  startDate?: string;
  endDate?: string;
  durationDays?: number;
  subtotal?: number;
  taxRate?: number;
  taxAmount?: number;
  rentalAmount?: number;
  depositAmount?: number;
  additionalCharges?: number;
  discount?: number;
  discountAmount?: number;
  totalAmount: number;
  paidAmount?: number;
  remainingAmount?: number;
  paymentMethod: PaymentMethod | string;
  paymentStatus?: 'paid' | 'partial' | 'pending';
  status?: 'paid' | 'partial' | 'pending' | 'draft' | 'cancelled';
  items?: Array<{ id?: string; description: string; amount?: number; quantity?: number; unitPrice?: number; totalPrice?: number }>;
  notes?: string;
  createdAt?: string;
}

export interface BookingRequest {
  id: string;
  customerName: string;
  customerPhone: string;
  customerNationalId: string;
  carId: string;
  carName: string;
  startDate: string;
  endDate: string;
  days: number;
  estimatedCost: number;
  notes?: string;
  status: 'pending' | 'approved' | 'rejected' | 'converted' | 'confirmed';
  createdAt: string;
}

export interface CompanyInfo {
  name: string;
  commercialRecord: string; // س.ت: 1379
  taxCard: string; // ب.ض: 503-798-767
  representativeName: string; // كريم كرم محرم عويس
  representativeNationalId: string; // 29601072103231
  representativeTitle: string; // رئيس مجلس إدارة الشركة
  phone: string; // 01146442004
  officePhone: string; // 01146442004
  email: string; // kareemkarm115@Gmail.com
  courtJurisdiction: string; // محكمة الجيزة
  dailyKmAllowance: number; // 120 كم
}
