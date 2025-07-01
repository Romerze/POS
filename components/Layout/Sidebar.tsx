
import React from 'react';
import { NavLink } from 'react-router-dom';
import { APP_NAME } from '../../constants';
import { useAuth } from '../../hooks/useAuth';
import { UserRole, NavItem, Permission } from '../../types';
import {
  ChartBarIcon, ShoppingCartIcon, UsersIcon, ArchiveBoxIcon, UserGroupIcon, Cog6ToothIcon, DocumentTextIcon, BanknotesIcon, BuildingStorefrontIcon, TruckIcon, SquaresPlusIcon, CurrencyDollarIcon, XMarkIcon, ShareIcon
} from '@heroicons/react/24/outline';

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

const navItems: NavItem[] = [
  { name: 'Dashboard', path: '/dashboard', icon: ChartBarIcon, permissions: [Permission.VIEW_DASHBOARD] },
  { name: 'Ventas', path: '/sales', icon: ShoppingCartIcon, permissions: [Permission.CREATE_SALE] },
  { name: 'Productos', path: '/products', icon: ArchiveBoxIcon, permissions: [Permission.VIEW_PRODUCTS] },
  { name: 'Inventario', path: '/inventory', icon: SquaresPlusIcon, permissions: [Permission.VIEW_INVENTORY] },
  { name: 'Clientes', path: '/customers', icon: UserGroupIcon, permissions: [Permission.VIEW_CUSTOMERS] },
  { name: 'Proveedores', path: '/suppliers', icon: BuildingStorefrontIcon, permissions: [Permission.VIEW_SUPPLIERS] },
  { name: 'Compras', path: '/purchases', icon: TruckIcon, permissions: [Permission.VIEW_PURCHASES] },
  { name: 'Caja', path: '/cash-register', icon: BanknotesIcon, permissions: [Permission.MANAGE_CASH_REGISTER] },
  { name: 'Pagos', path: '/payments', icon: CurrencyDollarIcon, permissions: [Permission.PAY_PURCHASE_ORDER] },
  { name: 'Reportes', path: '/reports', icon: DocumentTextIcon, permissions: [Permission.VIEW_REPORTS_GENERAL] },
  { name: 'Usuarios', path: '/users', icon: UsersIcon, permissions: [Permission.VIEW_USERS] },
  { name: 'Integraciones', path: '/integrations', icon: ShareIcon, permissions: [Permission.MANAGE_INTEGRATIONS] },
  { name: 'Configuración', path: '/settings', icon: Cog6ToothIcon, permissions: [Permission.MANAGE_SETTINGS] },
];

const SidebarNavLink: React.FC<{ item: NavItem; onClick?: () => void }> = ({ item, onClick }) => (
  <NavLink
    to={item.path}
    onClick={onClick}
    className={({ isActive }) =>
      `flex items-center px-4 py-3 text-sm font-medium rounded-md group hover:bg-primary-dark hover:text-white transition-colors duration-150 ease-in-out ${
        isActive ? 'bg-primary text-white' : 'text-neutral-light hover:text-white'
      }`
    }
  >
    <item.icon className="h-5 w-5 mr-3 flex-shrink-0" />
    {item.name}
  </NavLink>
);

const Sidebar: React.FC<SidebarProps> = ({ sidebarOpen, setSidebarOpen }) => {
  const { currentUser, hasPermission } = useAuth();

  const filteredNavItems = navItems.filter(item => {
    if (item.permissions) {
      return hasPermission(item.permissions);
    }
    // Fallback to role-based check if permissions array is not defined on NavItem
    // This part can be removed if all items are migrated to use permissions.
    if (item.roles) {
      return currentUser && item.roles.includes(currentUser.role);
    }
    return true; // If no roles or permissions specified, show to all (or handle as needed)
  });

  const commonSidebarClasses = "flex flex-col flex-shrink-0 w-64 bg-neutral-dark text-neutral-light transition-all duration-300 ease-in-out";

  return (
    <>
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-black opacity-50" onClick={() => setSidebarOpen(false)}></div>
        <div className={`${commonSidebarClasses} transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} h-full`}>
          <div className="flex items-center justify-between h-16 px-4 border-b border-neutral-dark">
            <span className="text-xl font-semibold text-white">{APP_NAME}</span>
            <button onClick={() => setSidebarOpen(false)} className="text-neutral-light hover:text-white">
                <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
          <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
            {filteredNavItems.map((item) => (
              <SidebarNavLink key={item.name} item={item} onClick={() => setSidebarOpen(false)} />
            ))}
          </nav>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className={`${commonSidebarClasses} hidden lg:flex h-full`}>
        <div className="flex items-center justify-center h-16 border-b border-neutral-dark">
          <span className="text-xl font-semibold text-white">{APP_NAME}</span>
        </div>
        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
          {filteredNavItems.map((item) => (
            <SidebarNavLink key={item.name} item={item} />
          ))}
        </nav>
        <div className="p-4 border-t border-neutral-dark text-xs text-center text-neutral-DEFAULT">
            Versión 0.1.0
        </div>
      </div>
    </>
  );
};

export default Sidebar;
