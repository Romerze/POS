
import React, { useState, useEffect, useCallback } from 'react';
import { CashRegisterSession, CashRegisterStatus, CashRegisterTransaction, CashTransactionType, UserRole, Permission } from '../../types'; // Added Permission
import { useAuth } from '../../hooks/useAuth';
import { fetchActiveCashRegisterSession, openCashRegister, closeCashRegister, addCashTransaction, fetchCashTransactionsForSession } from '../../services/apiService';
import Button from '../common/Button';
import Input from '../common/Input';
import Spinner from '../common/Spinner';
import { BanknotesIcon, LockOpenIcon, LockClosedIcon, PlusCircleIcon, MinusCircleIcon, DocumentMagnifyingGlassIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { DEFAULT_CURRENCY_SYMBOL } from '../../constants';

const CashRegisterPage: React.FC = () => {
  const { currentUser, hasPermission } = useAuth(); // Get hasPermission
  const [activeSession, setActiveSession] = useState<CashRegisterSession | null>(null);
  const [transactions, setTransactions] = useState<CashRegisterTransaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [initialCash, setInitialCash] = useState<number>(100); // Default opening amount
  const [countedCash, setCountedCash] = useState<number>(0);
  const [showCloseModal, setShowCloseModal] = useState<boolean>(false);
  
  const [showTransactionModal, setShowTransactionModal] = useState<boolean>(false);
  const [transactionType, setTransactionType] = useState<CashTransactionType.MANUAL_INCOME | CashTransactionType.MANUAL_EXPENSE>(CashTransactionType.MANUAL_INCOME);
  const [transactionAmount, setTransactionAmount] = useState<number>(0);
  const [transactionDescription, setTransactionDescription] = useState<string>('');


  const terminalId = "TERMINAL_01"; // Hardcoded for this demo

  const loadActiveSession = useCallback(async () => {
    if (!currentUser) return;
    setLoading(true);
    setError(null);
    try {
      const session = await fetchActiveCashRegisterSession(terminalId, currentUser.id);
      setActiveSession(session);
      if (session) {
        const trans = await fetchCashTransactionsForSession(session.id);
        setTransactions(trans.sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
      } else {
        setTransactions([]);
      }
    } catch (err: any) {
      setError(err.message || "Error al cargar la sesión de caja.");
    } finally {
      setLoading(false);
    }
  }, [currentUser, terminalId]);

  useEffect(() => {
    loadActiveSession();
  }, [loadActiveSession]);

  const handleOpenCashRegister = async () => {
    if (!hasPermission(Permission.MANAGE_CASH_REGISTER)) {
        alert("No tiene permisos para abrir caja.");
        return;
    }
    if (!currentUser || initialCash <= 0) {
      setError("El monto inicial debe ser mayor a cero.");
      return;
    }
    setActionLoading(true);
    setError(null);
    try {
      const newSession = await openCashRegister(terminalId, currentUser.id, initialCash);
      setActiveSession(newSession);
      setTransactions([]); // Reset transactions for new session
      alert(`Caja abierta con ${DEFAULT_CURRENCY_SYMBOL}${initialCash.toFixed(2)}.`);
    } catch (err: any) {
      setError(err.message || "Error al abrir la caja.");
      alert(`Error: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCloseCashRegister = async () => {
     if (!hasPermission(Permission.MANAGE_CASH_REGISTER)) {
        alert("No tiene permisos para cerrar caja.");
        return;
    }
    if (!currentUser || !activeSession || countedCash < 0) {
      setError("El monto contado no puede ser negativo.");
      return;
    }
    setActionLoading(true);
    setError(null);
    try {
      const closedSession = await closeCashRegister(activeSession.id, countedCash, activeSession.notes); // Assuming notes could be added during session
      setActiveSession(null); // Or set to closedSession to display results
      setTransactions([]);
      setShowCloseModal(false);
      alert(`Caja cerrada. Diferencia: ${DEFAULT_CURRENCY_SYMBOL}${closedSession.difference?.toFixed(2) || '0.00'}`);
      // Potentially display a summary of the closed session
      loadActiveSession(); // Refresh to show no active session
    } catch (err: any) {
      setError(err.message || "Error al cerrar la caja.");
      alert(`Error: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };
  
  const handleAddTransaction = async () => {
    if (!hasPermission(Permission.MANAGE_CASH_REGISTER)) {
        alert("No tiene permisos para registrar transacciones manuales.");
        return;
    }
    if (!currentUser || !activeSession || transactionAmount <= 0 || !transactionDescription) {
        setError("Monto debe ser mayor a cero y descripción es requerida.");
        return;
    }
    setActionLoading(true);
    setError(null);
    try {
        await addCashTransaction(activeSession.id, currentUser.id, transactionType, transactionAmount, transactionDescription);
        alert("Transacción manual registrada.");
        setShowTransactionModal(false);
        setTransactionAmount(0);
        setTransactionDescription('');
        // Refresh transactions for current session
        const trans = await fetchCashTransactionsForSession(activeSession.id);
        setTransactions(trans.sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));

    } catch (err:any) {
        setError(err.message || "Error al registrar transacción.");
        alert(`Error: ${err.message}`);
    } finally {
        setActionLoading(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64"><Spinner size="lg" /></div>;
  }
  
  const canManageCash = hasPermission(Permission.MANAGE_CASH_REGISTER);


  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold text-neutral-dark flex items-center">
            <BanknotesIcon className="h-8 w-8 mr-3 text-primary"/>Gestión de Caja
        </h1>
        <Button onClick={loadActiveSession} variant="ghost" size="sm" leftIcon={<ArrowPathIcon className="h-4 w-4"/>} disabled={loading}>
            Refrescar Estado
        </Button>
      </div>

      {error && <p className="mb-4 text-center text-red-500 p-3 bg-red-100 rounded-md shadow-sm">{error}</p>}
      
      {!canManageCash && <p className="text-center text-yellow-600 bg-yellow-50 p-4 rounded-md">No tiene permisos para gestionar la caja.</p>}

      {canManageCash && (
        <>
            {!activeSession ? (
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
                <LockClosedIcon className="h-16 w-16 mx-auto text-gray-400 mb-4"/>
                <h2 className="text-xl font-semibold text-gray-700 mb-2">Caja Cerrada</h2>
                <p className="text-gray-600 mb-4">No hay una sesión de caja activa en la terminal {terminalId}.</p>
                <div className="max-w-xs mx-auto">
                    <Input 
                        label="Monto Inicial para Apertura"
                        type="number"
                        id="initialCash"
                        value={initialCash.toString()}
                        onChange={(e) => setInitialCash(parseFloat(e.target.value) || 0)}
                        min="0"
                        step="10"
                        icon={<span className="text-gray-500 text-sm">{DEFAULT_CURRENCY_SYMBOL}</span>}
                        containerClassName="mb-4 text-left"
                    />
                    <Button 
                        onClick={handleOpenCashRegister} 
                        isLoading={actionLoading} 
                        disabled={actionLoading || initialCash <=0 || !canManageCash}
                        leftIcon={<LockOpenIcon className="h-5 w-5"/>}
                        className="w-full"
                    >
                        Abrir Caja
                    </Button>
                </div>
            </div>
            ) : (
            <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex justify-between items-start mb-4 pb-4 border-b">
                    <div>
                        <LockOpenIcon className="h-12 w-12 text-green-500 mb-2"/>
                        <h2 className="text-2xl font-bold text-green-600">Caja Abierta</h2>
                        <p className="text-sm text-gray-500">Terminal: {activeSession.terminalId}</p>
                        <p className="text-sm text-gray-500">Abierta por: {activeSession.userName || activeSession.userId}</p>
                        <p className="text-sm text-gray-500">Desde: {new Date(activeSession.openingTime).toLocaleString()}</p>
                        <p className="text-lg font-semibold mt-1">Fondo Inicial: {DEFAULT_CURRENCY_SYMBOL}{activeSession.initialCash.toFixed(2)}</p>
                    </div>
                    {canManageCash && (
                        <Button 
                            onClick={() => setShowCloseModal(true)} 
                            variant="danger"
                            isLoading={actionLoading} 
                            disabled={actionLoading}
                            leftIcon={<LockClosedIcon className="h-5 w-5"/>}
                        >
                            Cerrar Caja
                        </Button>
                    )}
                </div>

                {canManageCash && (
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold text-neutral-dark mb-2">Transacciones Manuales</h3>
                        <Button onClick={() => { setTransactionType(CashTransactionType.MANUAL_INCOME); setShowTransactionModal(true);}} leftIcon={<PlusCircleIcon className="h-5 w-5"/>} variant="outline" size="sm" className="mr-2">Registrar Ingreso</Button>
                        <Button onClick={() => { setTransactionType(CashTransactionType.MANUAL_EXPENSE); setShowTransactionModal(true);}} leftIcon={<MinusCircleIcon className="h-5 w-5"/>} variant="outline" size="sm" className="text-red-600 border-red-300 hover:bg-red-50">Registrar Egreso</Button>
                    </div>
                )}

                <h3 className="text-lg font-semibold text-neutral-dark mb-3 flex items-center">
                    <DocumentMagnifyingGlassIcon className="h-6 w-6 mr-2 text-primary"/>Historial de Movimientos (Sesión Actual)
                </h3>
                {transactions.length === 0 ? (
                    <p className="text-gray-500">No hay transacciones en esta sesión aún.</p>
                ) : (
                    <div className="max-h-96 overflow-y-auto custom-scrollbar pr-2">
                        <table className="min-w-full divide-y divide-gray-200 text-sm">
                            <thead className="bg-gray-50 sticky top-0">
                                <tr>
                                    <th className="px-3 py-2 text-left font-medium text-gray-500 uppercase">Fecha/Hora</th>
                                    <th className="px-3 py-2 text-left font-medium text-gray-500 uppercase">Tipo</th>
                                    <th className="px-3 py-2 text-left font-medium text-gray-500 uppercase">Descripción</th>
                                    <th className="px-3 py-2 text-right font-medium text-gray-500 uppercase">Monto</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                            {transactions.map(t => (
                                <tr key={t.id} className={`${t.type === CashTransactionType.MANUAL_EXPENSE ? 'text-red-600' : t.type === CashTransactionType.MANUAL_INCOME ? 'text-green-600' : ''}`}>
                                    <td className="px-3 py-2 whitespace-nowrap">{new Date(t.timestamp).toLocaleTimeString()}</td>
                                    <td className="px-3 py-2 whitespace-nowrap capitalize">{t.type}</td>
                                    <td className="px-3 py-2">{t.description}</td>
                                    <td className="px-3 py-2 whitespace-nowrap text-right font-medium">
                                        {t.type === CashTransactionType.MANUAL_EXPENSE ? '-' : ''}
                                        {DEFAULT_CURRENCY_SYMBOL}{t.amount.toFixed(2)}
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
            )}
        </>
      )}


      {/* Close Cash Register Modal */}
      {showCloseModal && activeSession && canManageCash && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 overflow-y-auto h-full w-full z-50 flex justify-center items-center">
            <div className="relative bg-white p-8 rounded-lg shadow-xl w-full max-w-md mx-auto">
                <h2 className="text-xl font-semibold mb-4">Cerrar Caja (Arqueo)</h2>
                <p className="text-sm mb-1">Fondo Inicial: {DEFAULT_CURRENCY_SYMBOL}{activeSession.initialCash.toFixed(2)}</p>
                {/* TODO: Display calculated sales, manual income/expenses for user to verify before counting */}
                <p className="text-sm mb-4">Por favor, ingrese el monto total contado en caja.</p>
                <Input
                    label="Monto Contado en Caja"
                    type="number"
                    id="countedCash"
                    value={countedCash.toString()}
                    onChange={(e) => setCountedCash(parseFloat(e.target.value) || 0)}
                    min="0"
                    icon={<span className="text-gray-500 text-sm">{DEFAULT_CURRENCY_SYMBOL}</span>}
                    containerClassName="mb-6"
                />
                 <div className="flex justify-end space-x-3">
                    <Button variant="ghost" onClick={() => setShowCloseModal(false)} disabled={actionLoading}>Cancelar</Button>
                    <Button onClick={handleCloseCashRegister} isLoading={actionLoading} disabled={actionLoading || countedCash < 0} variant="danger">Confirmar Cierre</Button>
                </div>
            </div>
        </div>
      )}
      
      {/* Add Manual Transaction Modal */}
      {showTransactionModal && activeSession && canManageCash && (
         <div className="fixed inset-0 bg-gray-600 bg-opacity-75 overflow-y-auto h-full w-full z-50 flex justify-center items-center">
            <div className="relative bg-white p-8 rounded-lg shadow-xl w-full max-w-md mx-auto">
                <h2 className="text-xl font-semibold mb-4">Registrar {transactionType === CashTransactionType.MANUAL_INCOME ? 'Ingreso' : 'Egreso'} Manual</h2>
                <Input
                    label="Monto"
                    type="number"
                    value={transactionAmount > 0 ? transactionAmount.toString() : ''}
                    onChange={(e) => setTransactionAmount(parseFloat(e.target.value) || 0)}
                    min="0.01" step="0.01"
                    icon={<span className="text-gray-500 text-sm">{DEFAULT_CURRENCY_SYMBOL}</span>}
                    containerClassName="mb-4"
                />
                <Input
                    label="Descripción / Motivo"
                    type="text"
                    value={transactionDescription}
                    onChange={(e) => setTransactionDescription(e.target.value)}
                    required
                    containerClassName="mb-6"
                />
                 <div className="flex justify-end space-x-3">
                    <Button variant="ghost" onClick={() => setShowTransactionModal(false)} disabled={actionLoading}>Cancelar</Button>
                    <Button onClick={handleAddTransaction} isLoading={actionLoading} disabled={actionLoading || transactionAmount <= 0 || !transactionDescription}>Registrar</Button>
                </div>
            </div>
        </div>
      )}
      <style>{`.custom-scrollbar::-webkit-scrollbar { width: 8px; } .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #06b6d4; border-radius: 4px; } .custom-scrollbar::-webkit-scrollbar-track { background-color: #f1f1f1; }`}</style>
    </div>
  );
};

export default CashRegisterPage;
