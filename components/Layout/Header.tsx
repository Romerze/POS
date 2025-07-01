
import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import Button from '../common/Button';
import { UserCircleIcon, Bars3Icon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline'; // Using Heroicons for example

interface HeaderProps {
  setSidebarOpen: (open: boolean) => void;
}

const Header: React.FC<HeaderProps> = ({ setSidebarOpen }) => {
  const { currentUser, logout } = useAuth();

  return (
    <header className="bg-white shadow-sm sticky top-0 z-40">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Hamburger menu for mobile */}
          <div className="lg:hidden">
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-gray-500 hover:text-gray-700 focus:outline-none"
            >
              <Bars3Icon className="h-6 w-6" />
            </button>
          </div>
          
          {/* Spacer to push user info to the right on larger screens */}
          <div className="hidden lg:flex lg:flex-1"></div>

          {currentUser && (
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <UserCircleIcon className="h-8 w-8 text-gray-400 mr-2" />
                <div>
                  <p className="text-sm font-medium text-gray-700">{currentUser.fullName}</p>
                  <p className="text-xs text-gray-500 capitalize">{currentUser.role}</p>
                </div>
              </div>
              <Button onClick={logout} variant="ghost" size="sm" leftIcon={<ArrowRightOnRectangleIcon className="h-5 w-5" />}>
                Salir
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
