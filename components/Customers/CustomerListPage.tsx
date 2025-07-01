
import React, { useState, useEffect, useCallback } from 'react';
import { Customer, CustomerFormData, Permission } from '../../types'; // Added Permission
import { fetchCustomers, addCustomer, updateCustomer, deleteCustomer } from '../../services/apiService';
import Spinner from '../common/Spinner';
import Button from '../common/Button';
import Input from '../common/Input';
import { PlusCircleIcon, UserGroupIcon, MagnifyingGlassIcon, PencilSquareIcon, TrashIcon, BuildingOffice2Icon } from '@heroicons/react/24/outline';
import CustomerFormModal from './CustomerFormModal';
import { useAuth } from '../../hooks/useAuth'; // Added useAuth

const CustomerListPage: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [formLoading, setFormLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const { hasPermission } = useAuth(); // Get hasPermission

  const loadCustomers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedCustomers = await fetchCustomers();
      // In a real API, you might have a dedicated endpoint for listable customers
      // or filter on the frontend like this.
      const listableCustomers = fetchedCustomers.filter(c => c.fullName !== 'Cliente Anónimo');
      setCustomers(listableCustomers); 
      setFilteredCustomers(listableCustomers);
    } catch (err: any) {
      setError(err.message || 'Error al cargar los clientes.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);
  
  useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);
  
  useEffect(() => {
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    if (customers.length > 0) {
        const results = customers.filter(customer =>
            customer.fullName.toLowerCase().includes(lowerCaseSearchTerm) ||
            (customer.docNumber && customer.docNumber.toLowerCase().includes(lowerCaseSearchTerm)) ||
            (customer.email && customer.email.toLowerCase().includes(lowerCaseSearchTerm)) ||
            (customer.phone && customer.phone.includes(lowerCaseSearchTerm))
        );
        setFilteredCustomers(results);
    }
  }, [searchTerm, customers]);

  const handleOpenAddModal = () => {
    if (!hasPermission(Permission.CREATE_CUSTOMER)) {
        alert("No tiene permisos para añadir clientes.");
        return;
    }
    setEditingCustomer(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (customer: Customer) => {
    if (!hasPermission(Permission.EDIT_CUSTOMER)) {
        alert("No tiene permisos para editar clientes.");
        return;
    }
    setEditingCustomer(customer);
    setIsModalOpen(true);
  };
  
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCustomer(null);
  };

  const handleFormSubmit = async (customerData: CustomerFormData) => {
    setFormLoading(true);
    setError(null);
    try {
      if (editingCustomer && customerData.id) {
        if (!hasPermission(Permission.EDIT_CUSTOMER)) throw new Error("No tiene permisos para editar clientes.");
        await updateCustomer(customerData);
        alert('Cliente actualizado con éxito.');
      } else {
        if (!hasPermission(Permission.CREATE_CUSTOMER)) throw new Error("No tiene permisos para crear clientes.");
        await addCustomer(customerData);
        alert('Cliente añadido con éxito.');
      }
      handleCloseModal();
      await loadCustomers();
    } catch (err: any) {
      setError(err.message || 'Error al guardar el cliente.');
      alert(`Error al guardar cliente: ${err.message}`);
    } finally {
      setFormLoading(false);
    }
  };
  
  const handleDeleteCustomer = async (customer: Customer) => {
    if (!hasPermission(Permission.DELETE_CUSTOMER)) {
        alert("No tiene permisos para eliminar clientes.");
        return;
    }
    if (window.confirm(`¿Está seguro de que desea eliminar al cliente "${customer.fullName}"? Esta acción no se puede deshacer.`)) {
      setLoading(true);
      setError(null);
      try {
        await deleteCustomer(customer.id);
        alert('Cliente eliminado con éxito.');
        await loadCustomers();
      } catch (err: any) {
        setError(err.message ||'Error al eliminar el cliente.');
        alert(`Error: ${err.message}`);
        setLoading(false);
      }
    }
  };

  if (loading && customers.length === 0) {
    return <div className="flex justify-center items-center h-64"><Spinner size="lg" /></div>;
  }

  if (error && customers.length === 0) {
    return <div className="text-center text-red-500 p-4 bg-red-50 rounded-md shadow">{error}</div>;
  }
  
  const canCreateCustomer = hasPermission(Permission.CREATE_CUSTOMER);
  const canEditCustomer = hasPermission(Permission.EDIT_CUSTOMER);
  const canDeleteCustomer = hasPermission(Permission.DELETE_CUSTOMER);


  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold text-neutral-dark flex items-center">
            <UserGroupIcon className="h-8 w-8 mr-3 text-primary" />
            Gestión de Clientes
        </h1>
        {canCreateCustomer && (
            <Button onClick={handleOpenAddModal} leftIcon={<PlusCircleIcon className="h-5 w-5"/>}>
            Nuevo Cliente
            </Button>
        )}
      </div>

      <div className="mb-6 p-4 bg-white shadow rounded-lg">
        <Input
            type="text"
            placeholder="Buscar clientes por nombre, documento, email o teléfono..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon={<MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />}
            containerClassName="mb-0"
        />
      </div>
      {error && <div className="mb-4 text-center text-red-500 p-3 bg-red-50 rounded-md shadow-sm">{error}</div>}
      {loading && customers.length > 0 && <div className="flex justify-center my-4"><Spinner size="md" /></div>}
      
      {filteredCustomers.length === 0 && !loading ? (
        <div className="text-center text-gray-500 py-10 bg-white rounded-lg shadow">
          <BuildingOffice2Icon className="h-16 w-16 mx-auto text-gray-400 mb-4" /> {/* Changed Icon */}
          <p className="text-xl">No se encontraron clientes.</p>
           {searchTerm && <p className="text-sm">Intenta con otros términos de búsqueda.</p>}
           {!searchTerm && <p className="text-sm">Puedes empezar añadiendo un nuevo cliente.</p>}
        </div>
      ) : (
        <div className="bg-white shadow-md rounded-lg overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Nombre / Razón Social</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider hidden sm:table-cell">Documento</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider hidden md:table-cell">Email</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider hidden md:table-cell">Teléfono</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Tipo</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Estado</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCustomers.map((customer) => (
                <tr key={customer.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{customer.fullName}</div>
                    <div className="text-xs text-gray-500 md:hidden">{customer.docType} {customer.docNumber}</div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 hidden sm:table-cell">{customer.docType} {customer.docNumber}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 hidden md:table-cell">{customer.email || '-'}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 hidden md:table-cell">{customer.phone || '-'}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 capitalize">{customer.customerType || 'Minorista'}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      customer.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {customer.status === 'active' ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-center text-sm font-medium">
                    {canEditCustomer && (
                        <Button variant="ghost" size="sm" onClick={() => handleOpenEditModal(customer)} title="Editar Cliente" className="text-primary hover:text-primary-dark p-1">
                            <PencilSquareIcon className="h-5 w-5"/>
                        </Button>
                    )}
                    {canDeleteCustomer && (
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteCustomer(customer)} title="Eliminar Cliente" className="text-red-600 hover:text-red-800 p-1 ml-1">
                            <TrashIcon className="h-5 w-5"/>
                        </Button>
                    )}
                     {(!canEditCustomer && !canDeleteCustomer) && <span className="text-xs text-gray-400">-</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {(canCreateCustomer || canEditCustomer) && isModalOpen && (
        <CustomerFormModal
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            onSubmit={handleFormSubmit}
            editingCustomer={editingCustomer}
            isLoading={formLoading}
        />
      )}
    </div>
  );
};

export default CustomerListPage;
