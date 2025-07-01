
import React, { useState, useEffect, useCallback } from 'react';
import { PurchaseOrder, PurchaseOrderStatus, PurchaseOrderPaymentStatus, SupplierPayment, SupplierPaymentMethod, UserRole, Permission } from '../../types'; // Added Permission
import { fetchPurchaseOrders, addSupplierPayment } from '../../services/apiService';
import { useAuth } from '../../hooks/useAuth';
import Button from '../common/Button';
import Spinner from '../common/Spinner';
import { CurrencyDollarIcon, DocumentMagnifyingGlassIcon, PlusCircleIcon } from '@heroicons/react/24/outline';
import { DEFAULT_CURRENCY_SYMBOL } from '../../constants';
import SupplierPaymentFormModal from './SupplierPaymentFormModal';


const PaymentsPage: React.FC = () => {
  const { currentUser, hasPermission } = useAuth(); // Get hasPermission
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState<boolean>(false);
  const [selectedPOForPayment, setSelectedPOForPayment] = useState<PurchaseOrder | null>(null);
  const [formLoading, setFormLoading] = useState<boolean>(false);


  const loadPOsForPayment = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const allPOs = await fetchPurchaseOrders();
      const posRequiringPayment = allPOs.filter(
        po => po.paymentStatus === 'pendiente' || po.paymentStatus === 'parcialmente pagado'
      ).sort((a, b) => new Date(a.orderDate).getTime() - new Date(b.orderDate).getTime()); // Oldest first
      setPurchaseOrders(posRequiringPayment);
    } catch (err: any) {
      setError(err.message || "Error al cargar órdenes de compra para pago.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPOsForPayment();
  }, [loadPOsForPayment]);

  const handleOpenPaymentModal = (po: PurchaseOrder) => {
    if (!hasPermission(Permission.PAY_PURCHASE_ORDER)) {
        alert("No tiene permisos para registrar pagos a proveedores.");
        return;
    }
    setSelectedPOForPayment(po);
    setIsPaymentModalOpen(true);
  };

  const handleClosePaymentModal = () => {
    setSelectedPOForPayment(null);
    setIsPaymentModalOpen(false);
  };

  const handlePaymentSubmit = async (paymentData: Omit<SupplierPayment, 'id' | 'recordedByUserId' | 'supplierId'>) => {
    if (!hasPermission(Permission.PAY_PURCHASE_ORDER)) {
        alert("No tiene permisos para registrar pagos.");
        setError("Acción no permitida.");
        return;
    }
    if (!currentUser || !selectedPOForPayment) {
        setError("Error de autenticación o selección de PO.");
        return;
    }
    setFormLoading(true);
    try {
        const fullPaymentData: Omit<SupplierPayment, 'id'> = {
            ...paymentData,
            recordedByUserId: currentUser.id,
            supplierId: selectedPOForPayment.supplierId,
        };
        await addSupplierPayment(fullPaymentData);
        alert(`Pago registrado para la orden ${selectedPOForPayment.orderNumber}.`);
        handleClosePaymentModal();
        await loadPOsForPayment(); // Refresh list
    } catch (err: any) {
        setError(err.message || "Error al registrar el pago.");
        alert(`Error: ${err.message}`);
    } finally {
        setFormLoading(false);
    }
  };

  const getPaymentStatusColor = (status: PurchaseOrderPaymentStatus) => {
    switch (status) {
        case 'pendiente': return 'text-red-600 bg-red-100';
        case 'parcialmente pagado': return 'text-yellow-600 bg-yellow-100';
        case 'pagado': return 'text-green-600 bg-green-100';
        default: return 'text-gray-600 bg-gray-100';
    }
  };
  
  const canManagePayments = hasPermission(Permission.PAY_PURCHASE_ORDER);


  if (loading) {
    return <div className="flex justify-center items-center h-64"><Spinner size="lg" /></div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold text-neutral-dark flex items-center">
            <CurrencyDollarIcon className="h-8 w-8 mr-3 text-primary"/>Pagos a Proveedores
        </h1>
        {/* Potentially add filters for supplier or date range here */}
      </div>

      {error && <p className="mb-4 text-center text-red-500 p-3 bg-red-100 rounded-md shadow-sm">{error}</p>}
      
      {!canManagePayments && (
         <div className="text-center text-yellow-600 bg-yellow-50 p-4 rounded-md">No tiene permisos para gestionar pagos a proveedores.</div>
      )}

      {canManagePayments && purchaseOrders.length === 0 && !loading && (
        <div className="text-center text-gray-500 py-10 bg-white rounded-lg shadow">
          <DocumentMagnifyingGlassIcon className="h-16 w-16 mx-auto text-gray-400 mb-4" />
          <p className="text-xl">No hay órdenes de compra pendientes de pago.</p>
          <p className="text-sm">Todas las órdenes de compra están saldadas o no existen órdenes que requieran pago.</p>
        </div>
      )}

      {canManagePayments && purchaseOrders.length > 0 && (
        <div className="bg-white shadow-md rounded-lg overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Nº Orden</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase hidden sm:table-cell">Proveedor</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Fecha Orden</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Total Orden</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Monto Pagado</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Saldo Pendiente</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Estado Pago</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {purchaseOrders.map((po) => {
                const amountDue = po.totalAmount - po.amountPaid;
                return (
                  <tr key={po.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{po.orderNumber}</div>
                        <div className="text-xs text-gray-500 sm:hidden">{po.supplierName}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 hidden sm:table-cell">{po.supplierName}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{new Date(po.orderDate).toLocaleDateString()}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 text-right font-medium">{DEFAULT_CURRENCY_SYMBOL}{po.totalAmount.toFixed(2)}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-green-600 text-right">{DEFAULT_CURRENCY_SYMBOL}{po.amountPaid.toFixed(2)}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-red-600 text-right font-semibold">{DEFAULT_CURRENCY_SYMBOL}{amountDue.toFixed(2)}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${getPaymentStatusColor(po.paymentStatus)}`}>
                            {po.paymentStatus.charAt(0).toUpperCase() + po.paymentStatus.slice(1)}
                        </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-center">
                      <Button 
                        variant="primary" 
                        size="sm" 
                        onClick={() => handleOpenPaymentModal(po)}
                        disabled={amountDue <= 0 || !canManagePayments}
                        leftIcon={<PlusCircleIcon className="h-4 w-4"/>}
                        className="text-xs"
                      >
                        Registrar Pago
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      {selectedPOForPayment && isPaymentModalOpen && canManagePayments && (
        <SupplierPaymentFormModal
            isOpen={isPaymentModalOpen}
            onClose={handleClosePaymentModal}
            onSubmit={handlePaymentSubmit}
            purchaseOrder={selectedPOForPayment}
            isLoading={formLoading}
        />
      )}
    </div>
  );
};

export default PaymentsPage;
