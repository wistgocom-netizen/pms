export type RoomStatus = 'available' | 'occupied' | 'maintenance';
export type HousekeepingStatus = 'clean' | 'dirty' | 'inspecting';
export type BookingStatus = 'active' | 'upcoming' | 'completed' | 'cancelled';
export type PaymentStatus = 'paid' | 'pending';
export type BookingType = string;
export type PaymentMethodType = 'cash' | 'card' | 'loan' | 'qr' | 'split' | 'cheque';

export type PricingTier = {
  id: string;
  label: string;
  price: number;
};

export type Room = {
  id: string;
  type: 'Standard' | 'Deluxe' | 'Suite';
  floor: number;
  capacity: number;
  price: number;
  pricingTiers: PricingTier[];
  amenities: string[];
  status: RoomStatus;
  hkStatus: HousekeepingStatus;
  lastCleaned: string;
};

export type ExtraCharge = {
  id: string;
  description: string;
  amount: number;
  date: string;
  source?: 'guest' | 'staff';
  saleId?: string;
};

export type Booking = {
  id: string;
  roomId: string;
  guestName: string;
  guestIdPassport?: string;
  phone: string;
  email: string;
  checkIn: string;
  checkOut: string;
  checkInTime?: string;
  checkOutTime?: string;
  guests: number;
  advance: number;
  status: BookingStatus;
  totalAmount: number;
  bookingType: string;
  organizationId?: string;
  pricingTierId?: string;
  extraCharges?: ExtraCharge[];
  stayMode: 'daily' | 'hourly';
  durationUnits: number;
  timeRange: string;
  completedAt?: string;
  source?: string;
  externalId?: string;
};

export type EmployeePayment = {
  month: string;
  amount: number;
  date: string;
  status: PaymentStatus;
};

export type Employee = {
  id: string;
  name: string;
  role: string;
  department: string;
  salary: number;
  phone: string;
  joiningDate: string;
  payments: EmployeePayment[];
};

export type Department = {
  id: string;
  name: string;
  description?: string;
};

export type HkTaskStatus = 'pending' | 'in-progress' | 'completed';
export type HkPriority = 'High' | 'Medium' | 'Low';
export type HkType = 'Full Clean' | 'Turndown' | 'Maintenance' | 'Inspection' | 'Mini Bar Restock';

export type HkTask = {
  id: string;
  roomId: string;
  assignedTo?: string; // employeeId
  type: HkType;
  priority: HkPriority;
  status: HkTaskStatus;
  notes?: string;
  createdAt: string;
};

export type AppNotification = {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'task_assigned' | 'task_started' | 'task_completed';
  relatedId?: string;
  read: boolean;
  createdAt: string;
  organizationId: string;
};

export type ExpenseCategory = 'Utilities' | 'Maintenance' | 'Food & Beverage' | 'Supplies' | 'Marketing' | 'Staff' | 'Other';

export type Expense = {
  id: string;
  date: string;
  category: ExpenseCategory;
  amount: number;
  description: string;
  status: 'paid' | 'pending';
  paymentMethod: string;
};

export type Note = {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  category: string;
  color?: string;
};

export type CashierPermissions = {
  dashboard?: boolean;
  rooms?: boolean;
  bookings?: boolean;
  ordering?: boolean;
  orderBoard?: boolean;
  orders?: boolean;
  housekeeping?: boolean;
  guests?: boolean;
  employees?: boolean;
  users?: boolean;
  departments?: boolean;
  products?: boolean;
  expenses?: boolean;
  notes?: boolean;
  reports?: boolean;
  control?: boolean;
  stores?: boolean;
  subscription?: boolean;
  settings?: boolean;
};

export type UserProfile = {
  id: string;
  uid: string;
  email?: string;
  username?: string;
  displayName?: string;
  role?: 'super-admin' | 'admin' | 'staff' | 'cashier' | 'pending';
  organizationId?: string | null;
  createdAt?: Date;
  cashierPermissions?: CashierPermissions;
  photoURL?: string;
  lastLocation?: {
    lat: number;
    lng: number;
    timestamp: string;
  };
};

export type PricingPlan = {
  id: string;
  name: string;
  description: string;
  priceMonthly: number;
  priceYearly: number;
  yearlyDiscount: number;
  durationDays: number;
  features: string[];
  isPopular: boolean;
  rooms: number;
  products: number;
  stores?: number;
  cashiers?: number;
};

export type Organization = {
  id: string;
  name: string;
  ownerUid: string;
  subscriptionPlan?: string;
  subscriptionStatus?: 'paid' | 'pending' | 'unpaid' | 'trial';
  subscriptionEndDate?: string;
  lastPaymentDate?: string;
  billingCycle?: 'monthly' | 'yearly';
  receiptSettings?: ReceiptSettings;
  invoiceSettings?: InvoiceSettings;
  dodoSubscriptionId?: string;
  dodoCustomerId?: string;
};

export type BankDetails = {
  bankName?: string;
  accountName?: string;
  accountNumber?: string;
  branch?: string;
  importantMessage?: string;
};

export type ReceiptSettings = {
  showStoreAddress: boolean;
  showStorePhone: boolean;
  fontSize: number;
  margin: number;
  showLogo: boolean;
  paperWidth: '80mm' | '58mm';
  headerText: string;
  footerText: string;
};

export type InvoiceSettings = {
  showLogo: boolean;
  termsAndConditions: string[];
  accentColor: string;
};

export type Category = {
  id: string;
  name: string;
  emoji?: string;
};

export type Product = {
  id: string;
  name: string;
  genericName?: string;
  manufacturer?: string;
  packSize?: string;
  batchNumber?: string;
  manufacturingDate?: string;
  rackLocation?: string;
  price: number;
  buyingPrice?: number;
  stock: number;
  category: string;
  emoji: string;
  supplier?: string;
  expireDate?: string;
  hasWarranty?: boolean;
  warrantyPeriod?: string;
};

export type CartItem = Product & {
  quantity: number;
  discount?: number; // percentage 0-100
  lineItemId: string;
};

export type SaleStatus = 'Completed' | 'Pending' | 'Cancelled' | 'Draft' | 'New' | 'Preparing' | 'Ready' | 'Approved' | 'Processing';

export type Sale = {
  id: string;
  saleDate: Date;
  status: SaleStatus;
  totalAmount: number;
  subtotal: number;
  taxes: number;
  discountAmount: number;
  paymentMethod: PaymentMethodType;
  customerId?: string;
  userId?: string;
  organizationId?: string | null;
  items: {
    productId: string;
    productName: string;
    quantity: number;
    unitPrice: number;
    discount?: number;
    isPrepared?: boolean;
  }[];
  tableNumber?: string;
  customerName?: string;
  orderType?: 'dine-in' | 'take-away' | 'wholesale';
  serviceCharge?: number;
  paymentDetails?: {
    cashAmount?: number;
    cardAmount?: number;
    chequeAmount?: number;
    chequeDetails?: {
      chequeNo: string;
      bank: string;
      chequeIssueDate: string;
      chequeClearDate?: string;
    };
  };
};

export type Supplier = {
  id: string;
  name: string;
  contactPerson?: string;
  email?: string;
  phone?: string[];
  address?: string;
};

export type Vehicle = {
  id: string;
  name: string;
  type: 'van' | 'truck';
  licensePlate: string;
};

export type LoadItem = {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  emoji: string;
  rackLocation?: string;
};

export type Load = {
  id: string;
  vehicleId: string;
  userId: string;
  createdAt: Date;
  status: 'planning' | 'active' | 'completed';
  items: LoadItem[];
  totalValue: number;
  totalItems?: number;
};

export type Bank = {
  id: string;
  name: string;
};

export type ChequeStatus = 'Pending' | 'Success' | 'Returned' | 'Cleared';

export type Cheque = {
  id: string;
  invoiceNo: string;
  chequeNo: string;
  chequeIssueDate: string;
  chequePrintedDate?: string;
  chequeClearDate?: string;
  duration?: number;
  bank: string;
  chequeAmount: number;
  status: ChequeStatus;
  date: Date;
};

export interface StoreContextType {
  rooms: Room[];
  bookings: Booking[];
  employees: Employee[];
  departments: Department[];
  expenses: Expense[];
  notes: Note[];
  hkTasks: HkTask[];
  notifications: AppNotification[];
  addNotification: (notif: Omit<AppNotification, 'id' | 'createdAt'>) => Promise<void>;
  markNotificationRead: (id: string) => Promise<void>;
  products: Product[];
  categories: Category[];
  suppliers: Supplier[];
  sales: Sale[];
  vehicles: Vehicle[];
  loads: Load[];
  cheques: Cheque[];
  banks: Bank[];
  customers: any[];
  userProfile: UserProfile | null;
  isLoading: boolean;
  
  // Subscription & Organizations
  pricingPlans: PricingPlan[];
  isLoadingPricingPlans: boolean;
  organizations: Organization[];
  isLoadingOrganizations: boolean;
  organization: Organization | null;
  isLoadingOrganization: boolean;
  bankDetails: BankDetails | null;
  users: UserProfile[];

  // Settings
  storeName: string;
  setStoreName: (name: string) => void;
  storeAddress: string;
  setStoreAddress: (address: string) => void;
  storePhone: string;
  setStorePhone: (phone: string) => void;
  storeEmail: string;
  setStoreEmail: (email: string) => void;
  currency: string;
  setCurrency: (currency: string) => void;
  taxRate: number;
  setTaxRate: (rate: number) => void;
  theme: string;
  setTheme: (theme: string) => void;
  zoom: number;
  setZoom: (zoom: number) => void;
  autoPrintReceipt: boolean;
  setAutoPrintReceipt: (val: boolean) => void;
  printFontScale: number;
  setPrintFontScale: (val: number) => void;
  hotelLogo: string;
  setHotelLogo: (val: string) => void;
  reviewQrCode: string;
  setReviewQrCode: (val: string) => void;
  paymentMethods: Record<PaymentMethodType, boolean>;
  cashDenominations: number[];

  // Hardware/POS Helpers
  registerBarcodeFocusHandler: (handler: () => void) => void;
  focusBarcode: () => void;
  updateUserLocation: (lat: number, lng: number) => void;

  roomTypes: string[];
  addRoomType: (type: string) => void;
  removeRoomType: (type: string) => void;

  // Actions
  addRoom: (room: Room) => void;
  removeRoom: (roomId: string) => void;
  updateRoom: (roomId: string, room: Partial<Room>) => void;
  updateRoomStatus: (roomId: string, status: RoomStatus) => void;
  setRoomDatePrice: (roomId: string, date: string, price: number) => void;
  clearRoomDatePrice: (roomId: string, date: string) => void;
  setBulkRoomDatePrices: (roomIds: string[], dates: string[], price: number) => void;
  roomDatePricing: Record<string, Record<string, number>>;
  addBooking: (booking: Omit<Booking, 'id' | 'status' | 'totalAmount'>) => void;
  updateBooking: (bookingId: string, booking: Partial<Booking>) => void;
  updateBookingStatus: (bookingId: string, status: BookingStatus) => void;
  addExtraCharge: (bookingId: string, charge: Omit<ExtraCharge, 'id' | 'date'>) => void;
  removeExtraCharge: (bookingId: string, chargeId: string) => void;
  addEmployee: (employee: Omit<Employee, 'id' | 'payments'>) => void;
  updateEmployee: (employeeId: string, employee: Partial<Employee>) => void;
  deleteEmployee: (employeeId: string) => void;
  addEmployeePayment: (employeeId: string, payment: EmployeePayment) => void;
  
  // Department Actions
  addDepartment: (dept: Omit<Department, 'id'>) => void;
  updateDepartment: (deptId: string, data: Partial<Department>) => void;
  deleteDepartment: (deptId: string) => void;

  // Housekeeping Actions
  addHkTask: (task: Omit<HkTask, 'id' | 'status' | 'createdAt'>) => void;
  updateHkTaskStatus: (taskId: string, status: HkTaskStatus) => void;
  deleteHkTask: (taskId: string) => void;

  // Expenses Actions
  addExpense: (expense: Omit<Expense, 'id'>) => void;
  updateExpense: (expenseId: string, data: Partial<Expense>) => void;
  deleteExpense: (expenseId: string) => void;

  // Notes Actions
  addNote: (note: Omit<Note, 'id' | 'createdAt'>) => void;
  updateNote: (noteId: string, data: Partial<Note>) => void;
  deleteNote: (noteId: string) => void;

  // POS & Inventory Actions
  addProduct: (product: Product) => Promise<void>;
  updateProduct: (productId: string, field: keyof Product, value: any) => void;
  deleteProduct: (product: Product) => void;
  deleteProducts: (ids: string[]) => void;
  addCategory: (cat: Omit<Category, 'id'>) => Promise<void>;
  updateCategory: (id: string, data: Partial<Category>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  addSupplier: (sup: Omit<Supplier, 'id'>) => void;
  updateSupplier: (id: string, data: Partial<Supplier>) => void;
  deleteSupplier: (id: string) => void;
  deleteSuppliers: (ids: string[]) => void;
  addSale: (saleData: any) => Promise<Sale>;
  addWholesaleSale: (saleData: any) => Promise<void>;
  saveWholesaleDraft: (saleData: any) => Promise<void>;
  updateSaleDetails: (id: string, data: Partial<Sale>) => void;
  deleteSale: (id: string) => void;
  toggleOrderItemStatus: (saleId: string, productId: string) => void;
  createNewOrder: (customerId: string, tableNumber?: string, customerName?: string, orderType?: 'dine-in' | 'take-away' | 'wholesale', guestOrgId?: string) => Promise<Sale>;
  addCustomer: (customerData: any) => Promise<string>;

  // Logistics Actions
  addVehicle: (vehicle: Omit<Vehicle, 'id'>) => Promise<void>;
  updateVehicle: (id: string, data: Partial<Vehicle>) => Promise<void>;
  deleteVehicle: (id: string) => Promise<void>;
  addLoad: (loadData: any) => Promise<Load>;
  updateLoad: (id: string, data: Partial<Load>) => void;
  deleteLoad: (id: string) => Promise<void>;

  // Financial Actions
  addCheque: (chequeData: any) => Promise<void>;
  updateCheque: (id: string, data: Partial<Cheque>) => Promise<void>;
  deleteCheque: (id: string) => Promise<void>;
  addBank: (bank: Omit<Bank, 'id'>) => Promise<void>;
  updateBank: (id: string, data: Partial<Bank>) => Promise<void>;
  deleteBank: (id: string) => Promise<void>;

  // Subscription Actions
  addPricingPlan: (plan: Omit<PricingPlan, 'id'>) => Promise<void>;
  updatePricingPlan: (planId: string, data: Partial<PricingPlan>) => Promise<void>;
  deletePricingPlan: (planId: string) => Promise<void>;
  requestSubscriptionChange: (orgId: string, planName: string, cycle: 'monthly' | 'yearly') => Promise<void>;
  processSubscriptionPayment: (orgId: string, cycle?: 'monthly' | 'yearly', dodoSubscriptionId?: string) => Promise<void>;
  updateBankDetails: (details: BankDetails) => Promise<void>;
  updateOrganization: (orgId: string, data: Partial<Organization>) => Promise<void>;
  updateUserRole: (userId: string, role: UserProfile['role']) => Promise<void>;
  updateUserPermissions: (userId: string, permissions: CashierPermissions) => Promise<void>;
  
  // Store Creation Actions
  createStoreAndAdmin: (data: any) => Promise<{ success: boolean; error?: any }>;
  createStoreByAdmin: (data: any) => Promise<{ success: boolean; error?: any }>;
  createUser: (data: any) => Promise<{ success: boolean; error?: any }>;

  seedDemoData: (orgId: string) => Promise<void>;
  t: (key: string, replacements?: Record<string, string | number>) => string;
  formatCurrency: (amount: number) => string;
  signOut: () => void;
  signIn: (loginId: string, pass: string) => Promise<{success: boolean, error: string | null}>;
  signUp: (data: any) => Promise<{success: boolean, error: string | null}>;
}
