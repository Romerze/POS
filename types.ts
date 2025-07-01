
export enum UserRole {
  ADMIN = 'admin',
  CASHIER = 'cajero',
  SUPERVISOR = 'supervisor',
  GUEST = 'guest',
}

export enum Permission {
  // General
  VIEW_DASHBOARD = 'VIEW_DASHBOARD',

  // Products
  VIEW_PRODUCTS = 'VIEW_PRODUCTS',
  CREATE_PRODUCT = 'CREATE_PRODUCT',
  EDIT_PRODUCT = 'EDIT_PRODUCT',
  DELETE_PRODUCT = 'DELETE_PRODUCT',
  ADD_PRODUCT_TO_CART = 'ADD_PRODUCT_TO_CART', // For sales page

  // Inventory
  VIEW_INVENTORY = 'VIEW_INVENTORY',
  ADJUST_STOCK = 'ADJUST_STOCK',

  // Sales
  CREATE_SALE = 'CREATE_SALE',
  VIEW_SALES_REPORTS = 'VIEW_SALES_REPORTS', // General sales reports
  CANCEL_SALE = 'CANCEL_SALE', // Future use

  // Customers
  VIEW_CUSTOMERS = 'VIEW_CUSTOMERS',
  CREATE_CUSTOMER = 'CREATE_CUSTOMER',
  EDIT_CUSTOMER = 'EDIT_CUSTOMER',
  DELETE_CUSTOMER = 'DELETE_CUSTOMER',

  // Suppliers
  VIEW_SUPPLIERS = 'VIEW_SUPPLIERS',
  CREATE_SUPPLIER = 'CREATE_SUPPLIER',
  EDIT_SUPPLIER = 'EDIT_SUPPLIER',
  DELETE_SUPPLIER = 'DELETE_SUPPLIER',

  // Purchases
  VIEW_PURCHASES = 'VIEW_PURCHASES',
  CREATE_PURCHASE_ORDER = 'CREATE_PURCHASE_ORDER',
  UPDATE_PURCHASE_ORDER_STATUS = 'UPDATE_PURCHASE_ORDER_STATUS',
  PAY_PURCHASE_ORDER = 'PAY_PURCHASE_ORDER',


  // Cash Register
  MANAGE_CASH_REGISTER = 'MANAGE_CASH_REGISTER', // Open, close, add transactions
  VIEW_CASH_REGISTER_REPORTS = 'VIEW_CASH_REGISTER_REPORTS',

  // Users
  VIEW_USERS = 'VIEW_USERS',
  CREATE_USER = 'CREATE_USER',
  EDIT_USER = 'EDIT_USER',
  DELETE_USER = 'DELETE_USER',
  MANAGE_ROLES = 'MANAGE_ROLES', // Future use for dynamic roles

  // Reports
  VIEW_REPORTS_GENERAL = 'VIEW_REPORTS_GENERAL', // Access to reports page
  VIEW_REPORTS_FINANCIAL = 'VIEW_REPORTS_FINANCIAL', // Profit margins, etc.

  // Settings
  MANAGE_SETTINGS = 'MANAGE_SETTINGS',
  MANAGE_INTEGRATIONS = 'MANAGE_INTEGRATIONS',
}


export interface User {
  id: string;
  username: string;
  password?: string; // Only for login form, not stored as plain text
  role: UserRole;
  fullName: string;
  email?: string;
  status: 'active' | 'inactive' | 'blocked';
  lastLogin?: string;
  loginIp?: string;
  failedAttempts?: number;
  permissions: Permission[]; // New field
}

export interface ProductVariant {
  id: string;
  name: string; // e.g., "Color", "Size"
  value: string; // e.g., "Red", "XL"
  additionalPrice?: number;
  skuSuffix?: string;
  stock?: number;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  description?: string;
  category?: string;
  unit: string; // e.g., "unidad", "kg", "docena"
  purchasePrice: number;
  salePrice: number;
  stock: number;
  minStock?: number;
  imageUrl?: string;
  variants?: ProductVariant[];
  isService?: boolean;
  supplierId?: string; // Optional: To link to a supplier
  dateAdded?: string;
  lastUpdated?: string;
}

// For forms, to handle product data before it has an ID or for partial updates
export type ProductFormData = Omit<Product, 'id' | 'dateAdded' | 'lastUpdated'> & { id?: string };


export interface CartItem {
  product: Product;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export enum PaymentMethod {
  CASH = 'efectivo',
  CARD = 'tarjeta',
  YAPE = 'yape/plin', // Combined Yape/Plin as they are similar mobile payments in Peru
  TRANSFER = 'transferencia',
  OTHER = 'otro',
}

export enum SaleStatus {
  PAID = 'pagada',
  PENDING = 'pendiente',
  CANCELLED = 'anulada',
}

export interface Sale {
  id: string;
  timestamp: string;
  items: CartItem[];
  discountApplied: number; // Amount
  taxes: number; // Amount
  subTotal: number; // Before taxes and discount
  grandTotal: number;
  customerId?: string; // Link to Customer
  customerName?: string; // Denormalized for quick display
  cashierId: string;
  cashierName?: string; // Denormalized
  paymentMethod: PaymentMethod;
  paymentDetails?: string; // e.g., last 4 digits of card, transaction ID for Yape
  status: SaleStatus;
  notes?: string;
  terminalId?: string;
  invoiceNumber?: string; // For formal invoices
  ticketNumber?: string; // For simpler sales tickets
  cashRegisterSessionId?: string;
}

export interface Customer {
  id: string;
  fullName: string; // Or Razón Social for companies
  docType?: 'DNI' | 'RUC' | 'CE' | 'Pasaporte' | 'Otro';
  docNumber?: string;
  phone?: string;
  email?: string;
  address?: string;
  registrationDate: string;
  status: 'active' | 'inactive';
  customerType?: 'minorista' | 'mayorista' | 'VIP' | 'empresa'; // Clasificación
  creditLimit?: number;
  notes?: string; // Observaciones
}

export type CustomerFormData = Omit<Customer, 'id' | 'registrationDate'> & { id?: string };


export interface SelectOption<T = string> {
  value: T;
  label: string;
}

export interface NavItem {
  name: string;
  path: string;
  icon: (props: React.SVGProps<SVGSVGElement>) => React.ReactNode;
  children?: NavItem[];
  roles?: UserRole[]; 
  permissions?: Permission[]; // Updated: roles OR permissions
}

export interface Supplier {
  id: string;
  name: string; // Razón Social
  ruc?: string;
  contactName?: string;
  phone?: string;
  email?: string;
  address?: string;
  notes?: string;
  status: 'active' | 'inactive';
  dateAdded?: string;
  lastUpdated?: string;
}

export type SupplierFormData = Omit<Supplier, 'id' | 'dateAdded' | 'lastUpdated'> & { id?: string };

export enum PurchaseOrderStatus {
  PENDING = 'pendiente', // PO created, not yet sent or acknowledged
  ORDERED = 'ordenado', // PO sent to supplier
  PARTIALLY_RECEIVED = 'parcialmente recibido',
  RECEIVED = 'recibido', // All items received
  CANCELLED = 'cancelado'
}

export type PurchaseOrderPaymentStatus = 'pendiente' | 'parcialmente pagado' | 'pagado';

export interface PurchaseOrderItem {
  productId: string;
  productName: string; // Denormalized for quick identification
  productSku?: string; // Denormalized for quick identification
  quantityOrdered: number;
  quantityReceived?: number;
  unitCost: number; // Cost at the time of purchase
  subtotal: number; // quantityOrdered * unitCost
}

export interface PurchaseOrder {
  id: string;
  orderNumber: string; // e.g. PO-2023-001
  orderDate: string;
  supplierId: string;
  supplierName?: string; // Denormalized for quick display
  items: PurchaseOrderItem[];
  subTotalAmount: number; // Sum of item subtotals
  taxesAmount: number; // Taxes on the purchase
  shippingCost: number;
  totalAmount: number; // subTotal + taxes + shipping
  status: PurchaseOrderStatus;
  expectedDeliveryDate?: string;
  actualDeliveryDate?: string;
  notes?: string;
  paymentStatus: PurchaseOrderPaymentStatus;
  amountPaid: number; // New field
  // createdByUserId: string;
}

export type PurchaseOrderItemFormData = Omit<PurchaseOrderItem, 'subtotal'>; // subtotal will be calculated

export type PurchaseOrderFormData = Omit<PurchaseOrder, 'id' | 'orderNumber' | 'supplierName' | 'subTotalAmount' | 'totalAmount' | 'items' | 'amountPaid' | 'paymentStatus'> & {
  id?: string;
  items: PurchaseOrderItemFormData[];
};


export enum CashRegisterStatus {
  OPEN = 'abierta',
  CLOSED = 'cerrada',
}
export interface CashRegisterSession {
  id: string;
  userId: string; // User who opened/closed
  userName?: string;
  terminalId: string;
  openingTime: string;
  closingTime?: string;
  initialCash: number;
  totalSalesCash?: number; // Cash sales during this session
  totalOtherPayments?: number; // Other payment method sales
  manualIncome?: number; // Ingresos manuales
  manualExpenses?: number; // Egresos manuales
  expectedCash?: number; // initial + sales_cash + income - expenses
  countedCash?: number; // Arqueo
  difference?: number;
  status: CashRegisterStatus;
  notes?: string;
}

export enum CashTransactionType {
  MANUAL_INCOME = 'ingreso manual',
  MANUAL_EXPENSE = 'egreso manual',
  OPENING_FLOAT = 'fondo inicial',
  SALE_CASH = 'venta efectivo', // Could be aggregated rather than individual transactions
}
export interface CashRegisterTransaction {
  id: string;
  sessionId: string;
  timestamp: string;
  type: CashTransactionType;
  amount: number; // Positive for income, negative for expense
  description: string;
  userId: string; // User who registered it
}

export enum SupplierPaymentMethod {
    TRANSFER = 'transferencia bancaria',
    CASH = 'efectivo',
    CHEQUE = 'cheque',
    CREDIT_CARD = 'tarjeta de crédito (corporativa)',
    OTHER = 'otro'
}

export interface SupplierPayment {
    id: string;
    purchaseOrderId: string;
    supplierId: string;
    paymentDate: string;
    amountPaid: number;
    paymentMethod: SupplierPaymentMethod;
    referenceNumber?: string; // e.g., transaction ID, cheque number
    notes?: string;
    recordedByUserId: string;
}

export type DocumentType = 'factura' | 'boleta' | 'nota_credito' | 'nota_debito' | 'ticket_venta' | 'guia_remision';

export interface DocumentSerieSetting {
  id: string; // e.g., 'factura_F001' or unique uuid
  documentType: DocumentType;
  serie: string; // e.g., F001, B001, T001
  currentNumber: number; // The next number to be used
  isActive: boolean;
}

export interface AppSettings {
  businessName: string;
  currencySymbol: string;
  taxRatePercentage: number; // e.g., 18 for 18%
  logoUrl?: string;
  ticketHeaderText?: string;
  ticketFooterText?: string;
  documentSeries?: DocumentSerieSetting[]; // New field
}

// Report-specific types
export interface TopSellingProductReportItem {
  productId: string;
  productName: string;
  sku: string;
  totalQuantitySold: number;
  totalValueSold: number;
}

export interface ProfitMarginsReport {
  totalRevenue: number;
  totalCOGS: number; // Cost of Goods Sold
  grossProfit: number;
  profitMarginPercentage: number;
  numberOfSalesAnalyzed: number;
  periodStartDate?: string;
  periodEndDate?: string;
}
