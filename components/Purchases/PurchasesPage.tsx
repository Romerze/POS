
import React, { useState, useEffect, useCallback } from 'react';
import { PurchaseOrder, PurchaseOrderStatus, PurchaseOrderFormData, UserRole, Permission } from '../../types'; // Added Permission
import { fetchPurchaseOrders, addPurchaseOrder, updatePurchaseOrderStatus } from '../../services/apiService';
import Spinner from '../common/Spinner';
import Button from '../common/Button';
import Input from '../common/Input';
import { PlusCircleIcon, TruckIcon, MagnifyingGlassIcon, PencilSquareIcon, EyeIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import PurchaseOrderFormModal from './PurchaseOrderFormModal';
import { DEFAULT_CURRENCY_SYMBOL } from '../../constants';
import { useAuth } from '../../hooks/useAuth';

const PurchasesPage: React.FC = () => {
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [filteredPOs, setFilteredPOs] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [formLoading, setFormLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  // const [editingPO, setEditingPO] = useState<PurchaseOrder | null>(null); // For future editing PO

  const { currentUser, hasPermission } = useAuth();
  const canCreatePO = hasPermission(Permission.CREATE_PURCHASE_ORDER);
  const canUpdatePOStatus = hasPermission(Permission.UPDATE_PURCHASE_ORDER_STATUS);


  const loadPurchaseOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedPOs = await fetchPurchaseOrders();
      setPurchaseOrders(fetchedPOs.sort((a,b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime()));
      setFilteredPOs(fetchedPOs);
    } catch (err: any) {
      setError(err.message || 'Error al cargar las órdenes de compra.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPurchaseOrders();
  }, [loadPurchaseOrders]);

  useEffect(() => {
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    if (purchaseOrders.length > 0) {
      const results = purchaseOrders.filter(po =>
        po.orderNumber.toLowerCase().includes(lowerCaseSearchTerm) ||
        (po.supplierName && po.supplierName.toLowerCase().includes(lowerCaseSearchTerm)) ||
        po.status.toLowerCase().includes(lowerCaseSearchTerm)
      );
      setFilteredPOs(results);
    }
  }, [searchTerm, purchaseOrders]);

  const handleOpenAddModal = () => {
    if(!canCreatePO) {
        alert("No tiene permisos para crear órdenes de compra.");
        return;
    }
    // setEditingPO(null);
    setIsModalOpen(true);
  };
  
  const handleCloseModal = () => {
    setIsModalOpen(false);
    // setEditingPO(null);
  };

  const handleFormSubmit = async (poData: PurchaseOrderFormData) => {
    if(!canCreatePO) {
        alert("No tiene permisos para crear órdenes de compra.");
        return;
    }
    setFormLoading(true);
    setError(null);
    try {
      await addPurchaseOrder(poData);
      alert('Orden de Compra creada con éxito.');
      handleCloseModal();
      await loadPurchaseOrders(); // Refresh list
    } catch (err: any) {
      setError(err.message || 'Error al crear la Orden de Compra.');
      alert(`Error: ${err.message}`);
    } finally {
      setFormLoading(false);
    }
  };

  const handleChangeStatus = async (poId: string, newStatus: PurchaseOrderStatus) => {
    if(!canUpdatePOStatus) {
        alert("No tiene permisos para actualizar el estado de las órdenes de compra.");
        return;
    }
    if (!window.confirm(`¿Está seguro de cambiar el estado de la orden a "${newStatus}"?`)) return;
    
    if (newStatus === PurchaseOrderStatus.RECEIVED) {
        if (!window.confirm("Al marcar como RECIBIDO, se actualizará el stock de los productos según las cantidades ordenadas. ¿Continuar?")) return;
    }

    setLoading(true); // Indicate general loading
    try {
        await updatePurchaseOrderStatus(poId, newStatus);
        alert(`Estado de la orden actualizado a "${newStatus}".`);
        await loadPurchaseOrders();
    } catch (err: any) {
        setError(err.message || 'Error al actualizar estado de la orden.');
        alert(`Error: ${err.message}`);
        setLoading(false);
    }
  };


  if (loading && purchaseOrders.length === 0) {
    return <div className="flex justify-center items-center h-64"><Spinner size="lg" /></div>;
  }

  if (error && purchaseOrders.length === 0) {
    return <div className="text-center text-red-500 p-4 bg-red-50 rounded-md shadow">{error}</div>;
  }
  
  const getStatusColor = (status: PurchaseOrderStatus) => {
    switch(status) {
        case PurchaseOrderStatus.PENDING: return 'bg-yellow-100 text-yellow-800';
        case PurchaseOrderStatus.ORDERED: return 'bg-blue-100 text-blue-800';
        case PurchaseOrderStatus.PARTIALLY_RECEIVED: return 'bg-indigo-100 text-indigo-800';
        case PurchaseOrderStatus.RECEIVED: return 'bg-green-100 text-green-800';
        case PurchaseOrderStatus.CANCELLED: return 'bg-red-100 text-red-800';
        default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold text-neutral-dark flex items-center">
            <TruckIcon className="h-8 w-8 mr-3 text-primary" />
            Gestión de Compras
        </h1>
        {canCreatePO && (
            <Button onClick={handleOpenAddModal} leftIcon={<PlusCircleIcon className="h-5 w-5"/>}>
            Nueva Orden de Compra
            </Button>
        )}
      </div>

      <div className="mb-6 p-4 bg-white shadow rounded-lg">
        <Input
            type="text"
            placeholder="Buscar por Nº Orden, Proveedor, Estado..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon={<MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />}
            containerClassName="mb-0"
        />
      </div>
      {error && <div className="mb-4 text-center text-red-500 p-3 bg-red-50 rounded-md shadow-sm">{error}</div>}
      {loading && purchaseOrders.length > 0 && <div className="flex justify-center my-4"><Spinner size="md" /></div>}
      
      {filteredPOs.length === 0 && !loading ? (
        <div className="text-center text-gray-500 py-10 bg-white rounded-lg shadow">
          <TruckIcon className="h-16 w-16 mx-auto text-gray-400 mb-4" />
          <p className="text-xl">No se encontraron órdenes de compra.</p>
           {searchTerm && <p className="text-sm">Intenta con otros términos de búsqueda.</p>}
           {!searchTerm && canCreatePO && <p className="text-sm">Puedes empezar creando una nueva orden de compra.</p>}
        </div>
      ) : (
        <div className="bg-white shadow-md rounded-lg overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Nº Orden</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Fecha</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider hidden sm:table-cell">Proveedor</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Total</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Estado</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPOs.map((po) => (
                <tr key={po.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{po.orderNumber}</div>
                    <div className="text-xs text-gray-500 md:hidden">{po.supplierName}</div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{new Date(po.orderDate).toLocaleDateString()}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 hidden sm:table-cell">{po.supplierName || 'N/A'}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 text-right font-medium">{DEFAULT_CURRENCY_SYMBOL}{po.totalAmount.toFixed(2)}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(po.status)}`}>
                      {po.status.charAt(0).toUpperCase() + po.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-center text-sm font-medium space-x-1">
                    <Button variant="ghost" size="sm" onClick={() => alert(`Ver detalles de PO ${po.orderNumber} (no implementado)`)} title="Ver Detalles" className="text-blue-600 hover:text-blue-800 p-1">
                        <EyeIcon className="h-5 w-5"/>
                    </Button>
                    {canUpdatePOStatus && po.status !== PurchaseOrderStatus.RECEIVED && po.status !== PurchaseOrderStatus.CANCELLED && (
                        <Button variant="ghost" size="sm" onClick={() => handleChangeStatus(po.id, PurchaseOrderStatus.RECEIVED)} title="Marcar como Recibido" className="text-green-600 hover:text-green-800 p-1">
                            <CheckCircleIcon className="h-5 w-5"/>
                        </Button>
                    )}
                     {canUpdatePOStatus && po.status !== PurchaseOrderStatus.CANCELLED && po.status !== PurchaseOrderStatus.RECEIVED &&(
                        <Button variant="ghost" size="sm" onClick={() => handleChangeStatus(po.id, PurchaseOrderStatus.CANCELLED)} title="Cancelar Orden" className="text-red-600 hover:text-red-800 p-1">
                            <XCircleIcon className="h-5 w-5"/>
                        </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {canCreatePO && isModalOpen && (
        <PurchaseOrderFormModal
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            onSubmit={handleFormSubmit}
            isLoading={formLoading}
        />
      )}
    </div>
  );
};

export default PurchasesPage;
