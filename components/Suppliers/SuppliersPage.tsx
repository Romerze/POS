
import React, { useState, useEffect, useCallback } from 'react';
import { Supplier, SupplierFormData, Permission } from '../../types'; // Added Permission
import { fetchSuppliers, addSupplier, updateSupplier, deleteSupplier } from '../../services/apiService';
import Spinner from '../common/Spinner';
import Button from '../common/Button';
import Input from '../common/Input';
import { PlusCircleIcon, BuildingStorefrontIcon, MagnifyingGlassIcon, PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';
import SupplierFormModal from './SupplierFormModal'; 
import { useAuth } from '../../hooks/useAuth'; // Added useAuth

const SuppliersPage: React.FC = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [filteredSuppliers, setFilteredSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [formLoading, setFormLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const { hasPermission } = useAuth(); // Get hasPermission

  const loadSuppliers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedSuppliers = await fetchSuppliers();
      setSuppliers(fetchedSuppliers);
      setFilteredSuppliers(fetchedSuppliers);
    } catch (err: any) {
      setError(err.message || 'Error al cargar los proveedores.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);
  
  useEffect(() => {
    loadSuppliers();
  }, [loadSuppliers]);
  
  useEffect(() => {
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    if (suppliers.length > 0) {
        const results = suppliers.filter(supplier =>
            supplier.name.toLowerCase().includes(lowerCaseSearchTerm) ||
            (supplier.ruc && supplier.ruc.includes(lowerCaseSearchTerm)) ||
            (supplier.contactName && supplier.contactName.toLowerCase().includes(lowerCaseSearchTerm)) ||
            (supplier.email && supplier.email.toLowerCase().includes(lowerCaseSearchTerm))
        );
        setFilteredSuppliers(results);
    }
  }, [searchTerm, suppliers]);

  const handleOpenAddModal = () => {
    if(!hasPermission(Permission.CREATE_SUPPLIER)) {
        alert("No tiene permisos para añadir proveedores.");
        return;
    }
    setEditingSupplier(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (supplier: Supplier) => {
    if(!hasPermission(Permission.EDIT_SUPPLIER)) {
        alert("No tiene permisos para editar proveedores.");
        return;
    }
    setEditingSupplier(supplier);
    setIsModalOpen(true);
  };
  
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingSupplier(null);
  };

  const handleFormSubmit = async (supplierData: SupplierFormData) => {
    setFormLoading(true);
    setError(null);
    try {
      if (editingSupplier && supplierData.id) {
        if(!hasPermission(Permission.EDIT_SUPPLIER)) throw new Error("No tiene permisos para editar proveedores.");
        await updateSupplier(supplierData);
        alert('Proveedor actualizado con éxito.');
      } else {
        if(!hasPermission(Permission.CREATE_SUPPLIER)) throw new Error("No tiene permisos para crear proveedores.");
        await addSupplier(supplierData);
        alert('Proveedor añadido con éxito.');
      }
      handleCloseModal();
      await loadSuppliers();
    } catch (err: any) {
      setError(err.message || 'Error al guardar el proveedor.');
      alert(`Error al guardar proveedor: ${err.message}`);
    } finally {
      setFormLoading(false);
    }
  };
  
  const handleDeleteSupplier = async (supplier: Supplier) => {
    if(!hasPermission(Permission.DELETE_SUPPLIER)) {
        alert("No tiene permisos para eliminar proveedores.");
        return;
    }
    if (window.confirm(`¿Está seguro de que desea eliminar al proveedor "${supplier.name}"? Los productos asociados perderán esta referencia.`)) {
      setLoading(true); // Indicate general loading as supplier list will refresh
      setError(null);
      try {
        await deleteSupplier(supplier.id);
        alert('Proveedor eliminado con éxito.');
        await loadSuppliers(); // Refresh list
      } catch (err: any) {
        setError(err.message || 'Error al eliminar el proveedor.');
        alert(`Error al eliminar proveedor: ${err.message}`);
        setLoading(false); // Stop loading if error occurred before refresh
      }
    }
  };

  if (loading && suppliers.length === 0) {
    return <div className="flex justify-center items-center h-64"><Spinner size="lg" /></div>;
  }

  if (error && suppliers.length === 0) {
    return <div className="text-center text-red-500 p-4 bg-red-50 rounded-md shadow">{error}</div>;
  }
  
  const canCreateSupplier = hasPermission(Permission.CREATE_SUPPLIER);
  const canEditSupplier = hasPermission(Permission.EDIT_SUPPLIER);
  const canDeleteSupplier = hasPermission(Permission.DELETE_SUPPLIER);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold text-neutral-dark flex items-center">
            <BuildingStorefrontIcon className="h-8 w-8 mr-3 text-primary" />
            Gestión de Proveedores
        </h1>
        {canCreateSupplier && (
            <Button onClick={handleOpenAddModal} leftIcon={<PlusCircleIcon className="h-5 w-5"/>}>
            Nuevo Proveedor
            </Button>
        )}
      </div>

      <div className="mb-6 p-4 bg-white shadow rounded-lg">
        <Input
            type="text"
            placeholder="Buscar proveedores por nombre, RUC, contacto..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon={<MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />}
            containerClassName="mb-0"
        />
      </div>
      {error && <div className="mb-4 text-center text-red-500 p-3 bg-red-50 rounded-md shadow-sm">{error}</div>}
      {loading && suppliers.length > 0 && <div className="flex justify-center my-4"><Spinner size="md" /></div>}
      
      {filteredSuppliers.length === 0 && !loading ? (
        <div className="text-center text-gray-500 py-10 bg-white rounded-lg shadow">
          <BuildingStorefrontIcon className="h-16 w-16 mx-auto text-gray-400 mb-4" />
          <p className="text-xl">No se encontraron proveedores.</p>
           {searchTerm && <p className="text-sm">Intenta con otros términos de búsqueda.</p>}
           {!searchTerm && <p className="text-sm">Puedes empezar añadiendo un nuevo proveedor.</p>}
        </div>
      ) : (
        <div className="bg-white shadow-md rounded-lg overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Nombre / Razón Social</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider hidden sm:table-cell">RUC</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider hidden md:table-cell">Contacto</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider hidden lg:table-cell">Email</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Teléfono</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Estado</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredSuppliers.map((supplier) => (
                <tr key={supplier.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{supplier.name}</div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 hidden sm:table-cell">{supplier.ruc || '-'}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 hidden md:table-cell">{supplier.contactName || '-'}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 hidden lg:table-cell">{supplier.email || '-'}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{supplier.phone || '-'}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      supplier.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {supplier.status === 'active' ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-center text-sm font-medium">
                    {canEditSupplier && (
                        <Button variant="ghost" size="sm" onClick={() => handleOpenEditModal(supplier)} title="Editar Proveedor" className="text-primary hover:text-primary-dark p-1">
                            <PencilSquareIcon className="h-5 w-5"/>
                        </Button>
                    )}
                    {canDeleteSupplier && (
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteSupplier(supplier)} title="Eliminar Proveedor" className="text-red-600 hover:text-red-800 p-1 ml-1">
                            <TrashIcon className="h-5 w-5"/>
                        </Button>
                    )}
                    {(!canEditSupplier && !canDeleteSupplier) && <span className="text-xs text-gray-400">-</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {(canCreateSupplier || canEditSupplier) && isModalOpen && (
        <SupplierFormModal
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            onSubmit={handleFormSubmit}
            editingSupplier={editingSupplier}
            isLoading={formLoading}
        />
      )}
    </div>
  );
};

export default SuppliersPage;
