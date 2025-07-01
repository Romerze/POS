import React, { createContext, useState, useContext, useEffect, useCallback, ReactNode } from 'react';
import { User, Permission } from '../types';
import { login as apiLogin, fetchCurrentUser } from '../services/apiService';

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  error: string | null;
  login: (username: string, passwordAttempt: string) => Promise<void>;
  logout: () => void;
  hasPermission: (permission: Permission | Permission[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const verifyTokenAndSetUser = useCallback(async () => {
    const token = localStorage.getItem('authToken');
    if (token) {
      try {
        // Fetch user data using the stored token
        const user = await fetchCurrentUser();
        setCurrentUser(user);
      } catch (e) {
        console.error("Token verification failed:", e);
        // If token is invalid, clear it
        localStorage.removeItem('authToken');
        localStorage.removeItem('currentUser');
        setCurrentUser(null);
      }
    }
    setLoading(false);
  }, []);


  useEffect(() => {
    verifyTokenAndSetUser();
  }, [verifyTokenAndSetUser]);

  const login = useCallback(async (username: string, passwordAttempt: string) => {
    setLoading(true);
    setError(null);
    try {
      const { user, token } = await apiLogin(username, passwordAttempt);
      localStorage.setItem('authToken', token);
      localStorage.setItem('currentUser', JSON.stringify(user)); // Optional, can rely on fetchCurrentUser
      setCurrentUser(user);
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión.');
      localStorage.removeItem('authToken');
      localStorage.removeItem('currentUser');
      setCurrentUser(null);
      // Re-throw the error to be caught in the component if needed
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setCurrentUser(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    // The redirect is handled by the ProtectedRoute component
  }, []);

  const hasPermission = useCallback((requiredPermissions: Permission | Permission[]): boolean => {
    if (!currentUser || !currentUser.permissions) {
      return false;
    }
    const userPermissions = new Set(currentUser.permissions);
    if (Array.isArray(requiredPermissions)) {
      return requiredPermissions.every(rp => userPermissions.has(rp));
    }
    return userPermissions.has(requiredPermissions);
  }, [currentUser]);


  return (
    <AuthContext.Provider value={{ currentUser, loading, error, login, logout, hasPermission }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
