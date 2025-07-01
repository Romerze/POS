
import React from 'react';
import { HashRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import LoginPage from './components/Auth/LoginPage';
import Layout from './components/Layout/Layout';
import DashboardPage from './components/Dashboard/DashboardPage';
import ProductListPage from './components/Products/ProductListPage';
import QuickSalePage from './components/Sales/QuickSalePage';
import UserManagementPage from './components/Users/UserManagementPage';
import SettingsPage from './components/Settings/SettingsPage';
import ReportsPage from './components/Reports/ReportsPage';
import CustomerListPage from './components/Customers/CustomerListPage';
import InventoryPage from './components/Inventory/InventoryPage';
import CashRegisterPage from './components/CashRegister/CashRegisterPage';
import SuppliersPage from './components/Suppliers/SuppliersPage'; 
import PurchasesPage from './components/Purchases/PurchasesPage'; 
import PaymentsPage from './components/Payments/PaymentsPage'; 
import IntegrationsPage from './components/Integrations/IntegrationsPage'; // New

const ProtectedRoute: React.FC = () => {
  const { currentUser } = useAuth();
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }
  return <Layout><Outlet /></Layout>;
};

const App: React.FC = () => {
  return (
    <HashRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/products" element={<ProductListPage />} />
          <Route path="/sales" element={<QuickSalePage />} />
          <Route path="/customers" element={<CustomerListPage />} />
          <Route path="/inventory" element={<InventoryPage />} />
          <Route path="/cash-register" element={<CashRegisterPage />} />
          <Route path="/suppliers" element={<SuppliersPage />} /> 
          <Route path="/purchases" element={<PurchasesPage />} /> 
          <Route path="/payments" element={<PaymentsPage />} /> 
          <Route path="/integrations" element={<IntegrationsPage />} /> {/* New Route */}
          <Route path="/users" element={<UserManagementPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
};

export default App;