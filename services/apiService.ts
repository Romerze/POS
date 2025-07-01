import { Product, User, Sale, Customer, Supplier, CashRegisterSession, PurchaseOrder, AppSettings, TopSellingProductReportItem, ProfitMarginsReport, SupplierPayment, ProductFormData, CustomerFormData, SupplierFormData, PurchaseOrderFormData, CashRegisterTransaction, CashTransactionType, PurchaseOrderStatus, SaleStatus, PaymentMethod, UserRole } from '../types';

const API_BASE_URL = process.env.API_URL || '/api';

interface AuthResponse {
  user: User;
  token: string;
}

// Helper para obtener el token de localStorage
const getToken = (): string | null => {
  return localStorage.getItem('authToken');
};

// Wrapper genérico para las llamadas fetch
const apiFetch = async (endpoint: string, options: RequestInit = {}): Promise<any> => {
  const token = getToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMessage = `Error ${response.status}: ${response.statusText}`;
    try {
      const errorBody = await response.json();
      errorMessage = errorBody.message || errorBody.error || errorMessage;
    } catch (e) {
      // El cuerpo del error no era JSON, usar el statusText
    }
    throw new Error(errorMessage);
  }
  
  // Si el body está vacío (ej. en un 204 No Content), no intentar parsear JSON
  if (response.status === 204) {
    return null;
  }

  return response.json();
};

// --- Autenticación ---
export const login = (username: string, passwordAttempt: string): Promise<AuthResponse> => {
  return apiFetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password: passwordAttempt }),
  });
};

export const fetchCurrentUser = (): Promise<User> => {
  return apiFetch('/auth/me');
}

// --- Productos ---
export const fetchProducts = (): Promise<Product[]> => apiFetch('/products');
export const fetchProductById = (id: string): Promise<Product> => apiFetch(`/products/${id}`);
export const addProduct = (productData: ProductFormData): Promise<Product> => {
  return apiFetch('/products', { method: 'POST', body: JSON.stringify(productData) });
};
export const updateProduct = (productData: ProductFormData): Promise<Product> => {
  return apiFetch(`/products/${productData.id}`, { method: 'PUT', body: JSON.stringify(productData) });
};
export const deleteProduct = (productId: string): Promise<void> => {
  return apiFetch(`/products/${productId}`, { method: 'DELETE' });
};

// --- Ventas ---
export const submitSale = (
  cartItems: any[], 
  paymentMethod: PaymentMethod, 
  grandTotal: number, 
  cashierId: string, 
  customerId?: string, 
  notes?: string,
  paymentDetails?: string,
  cashRegisterSessionId?: string
): Promise<Sale> => {
  const saleData = {
    items: cartItems.map(item => ({ productId: item.product.id, quantity: item.quantity, unitPrice: item.unitPrice })),
    paymentMethod,
    grandTotal,
    cashierId,
    customerId,
    notes,
    paymentDetails,
    cashRegisterSessionId,
  };
  return apiFetch('/sales', { method: 'POST', body: JSON.stringify(saleData) });
};

// --- Clientes ---
export const fetchCustomers = (): Promise<Customer[]> => apiFetch('/customers');
export const addCustomer = (customerData: CustomerFormData): Promise<Customer> => {
  return apiFetch('/customers', { method: 'POST', body: JSON.stringify(customerData) });
};
export const updateCustomer = (customerData: CustomerFormData): Promise<Customer> => {
  return apiFetch(`/customers/${customerData.id}`, { method: 'PUT', body: JSON.stringify(customerData) });
};
export const deleteCustomer = (customerId: string): Promise<void> => {
  return apiFetch(`/customers/${customerId}`, { method: 'DELETE' });
};

// --- Usuarios ---
export const fetchUsers = (): Promise<User[]> => apiFetch('/users');
export const addUser = (userData: Omit<User, 'id' | 'lastLogin' | 'loginIp' | 'failedAttempts' | 'permissions'>): Promise<User> => {
  return apiFetch('/users', { method: 'POST', body: JSON.stringify(userData) });
};
export const updateUser = (userData: Omit<User, 'permissions'>): Promise<User> => {
  return apiFetch(`/users/${userData.id}`, { method: 'PUT', body: JSON.stringify(userData) });
};
export const deleteUser = (userId: string): Promise<void> => {
  return apiFetch(`/users/${userId}`, { method: 'DELETE' });
};


// --- Proveedores ---
export const fetchSuppliers = (): Promise<Supplier[]> => apiFetch('/suppliers');
export const addSupplier = (supplierData: SupplierFormData): Promise<Supplier> => {
    return apiFetch('/suppliers', { method: 'POST', body: JSON.stringify(supplierData) });
};
export const updateSupplier = (supplierData: SupplierFormData): Promise<Supplier> => {
    return apiFetch(`/suppliers/${supplierData.id}`, { method: 'PUT', body: JSON.stringify(supplierData) });
};
export const deleteSupplier = (supplierId: string): Promise<void> => {
    return apiFetch(`/suppliers/${supplierId}`, { method: 'DELETE' });
};


// --- Caja ---
export const fetchActiveCashRegisterSession = (terminalId: string, userId: string): Promise<CashRegisterSession | null> => {
    return apiFetch(`/cash-register/session/active?terminalId=${terminalId}&userId=${userId}`);
};
export const openCashRegister = (terminalId: string, userId: string, initialCash: number): Promise<CashRegisterSession> => {
    return apiFetch('/cash-register/open', { method: 'POST', body: JSON.stringify({ terminalId, userId, initialCash }) });
};
export const closeCashRegister = (sessionId: string, countedCash: number, notes?: string): Promise<CashRegisterSession> => {
    return apiFetch(`/cash-register/close/${sessionId}`, { method: 'POST', body: JSON.stringify({ countedCash, notes }) });
};
export const addCashTransaction = (sessionId: string, userId: string, type: CashTransactionType, amount: number, description: string): Promise<CashRegisterTransaction> => {
    return apiFetch(`/cash-register/transaction`, { method: 'POST', body: JSON.stringify({ sessionId, userId, type, amount, description }) });
};
export const fetchCashTransactionsForSession = (sessionId: string): Promise<CashRegisterTransaction[]> => {
    return apiFetch(`/cash-register/transactions/${sessionId}`);
};


// --- Órdenes de Compra ---
export const fetchPurchaseOrders = (): Promise<PurchaseOrder[]> => apiFetch('/purchase-orders');
export const addPurchaseOrder = (poData: PurchaseOrderFormData): Promise<PurchaseOrder> => {
    return apiFetch('/purchase-orders', { method: 'POST', body: JSON.stringify(poData) });
};
export const updatePurchaseOrderStatus = (poId: string, status: PurchaseOrderStatus): Promise<PurchaseOrder> => {
    return apiFetch(`/purchase-orders/${poId}/status`, { method: 'PATCH', body: JSON.stringify({ status }) });
};


// --- Pagos a Proveedores ---
export const addSupplierPayment = (paymentData: Omit<SupplierPayment, 'id'>): Promise<SupplierPayment> => {
    return apiFetch('/supplier-payments', { method: 'POST', body: JSON.stringify(paymentData) });
};


// --- Configuración ---
export const fetchAppSettings = (): Promise<AppSettings> => apiFetch('/settings');
export const updateAppSettings = (settings: AppSettings): Promise<AppSettings> => {
    return apiFetch('/settings', { method: 'PUT', body: JSON.stringify(settings) });
};

// --- Reportes ---
export const fetchSalesByDateRange = (startDate: string, endDate: string): Promise<Sale[]> => {
    return apiFetch(`/reports/sales?startDate=${startDate}&endDate=${endDate}`);
};
export const fetchTopSellingProducts = (startDate: string, endDate:string, limit: number): Promise<TopSellingProductReportItem[]> => {
    return apiFetch(`/reports/top-selling?startDate=${startDate}&endDate=${endDate}&limit=${limit}`);
};
export const fetchProfitMarginsReport = (startDate: string, endDate:string): Promise<ProfitMarginsReport> => {
    return apiFetch(`/reports/profit-margins?startDate=${startDate}&endDate=${endDate}`);
};
export const fetchCashRegisterSessionsReport = (startDate: string, endDate:string): Promise<CashRegisterSession[]> => {
    return apiFetch(`/reports/cash-sessions?startDate=${startDate}&endDate=${endDate}`);
};