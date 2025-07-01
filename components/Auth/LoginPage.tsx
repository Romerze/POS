import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Button from '../common/Button';
import Input from '../common/Input';
import { APP_NAME } from '../../constants';
import { LockClosedIcon, UserIcon } from '@heroicons/react/24/outline';


const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('password');
  const [localError, setLocalError] = useState('');
  const { login, loading, error: authError, currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (currentUser) {
      navigate('/dashboard', { replace: true });
    }
  }, [currentUser, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');
    if (!username || !password) {
        setLocalError("Por favor ingrese usuario y contraseña.");
        return;
    }
    try {
        await login(username, password);
        // Navigation will be handled by the useEffect
    } catch (err) {
        // The authError from the context will be displayed.
        // No need to set localError here unless for specific cases.
        console.error("Login failed:", err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-light via-primary to-primary-dark flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <svg className="mx-auto h-16 w-auto text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
        </svg>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
          {APP_NAME}
        </h2>
        <p className="mt-2 text-center text-sm text-cyan-100">
          Ingrese a su cuenta
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <Input
              id="username"
              label="Usuario"
              type="text"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              icon={<UserIcon className="h-5 w-5 text-gray-400" />}
            />
            <Input
              id="password"
              label="Contraseña"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              icon={<LockClosedIcon className="h-5 w-5 text-gray-400" />}
            />
            
            {(authError || localError) && <p className="text-center text-sm text-red-600 bg-red-100 p-3 rounded-md">{authError || localError}</p>}

            <div>
              <Button type="submit" className="w-full" isLoading={loading} disabled={loading}>
                {loading ? 'Ingresando...' : 'Ingresar'}
              </Button>
            </div>
          </form>
          <p className="mt-6 text-center text-xs text-gray-500">
            Esta aplicación ahora se conecta a un backend real.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
