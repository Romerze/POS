import React, { useState, useEffect } from 'react';
import { Customer, CustomerFormData } from '../../types';
import Button from '../common/Button';
import Input from '../common/Input';

interface CustomerFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (customerData: CustomerFormData) => void;
  editingCustomer: Customer | null;
  isLoading?: boolean;
}

const CustomerFormModal: React.FC<CustomerFormModalProps> = ({ isOpen, onClose, onSubmit, editingCustomer, isLoading }) => {
  const [formData, setFormData] = useState<CustomerFormData>({
    fullName: '',
    docType: 'DNI',
    docNumber: '',
    phone: '',
    email: '',
    address: '',
    status: 'active',
    customerType: 'minorista',
    notes: '',
  });

  useEffect(() => {
    if (editingCustomer) {
      setFormData({ ...editingCustomer });
    } else {
      setFormData({
        fullName: '',
        docType: 'DNI',
        docNumber: '',
        phone: '',
        email: '',
        address: '',
        status: 'active',
        customerType: 'minorista',
        notes: '',
      });
    }
  }, [editingCustomer, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName) {
      alert("El nombre completo o razón social es obligatorio.");
      return;
    }
    // Basic validation for DNI/RUC length if type is selected
    if (formData.docType === 'DNI' && formData.docNumber && formData.docNumber.length !== 8) {
      alert("El DNI debe tener 8 dígitos.");
      return;
    }
    if (formData.docType === 'RUC' && formData.docNumber && formData.docNumber.length !== 11) {
      alert("El RUC debe tener 11 dígitos.");
      return;
    }
    onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 overflow-y-auto h-full w-full z-50 flex justify-center items-start pt-10">
      <div className="relative bg-white p-6 md:p-8 rounded-lg shadow-xl w-full max-w-xl mx-auto my-8">
        <h2 className="text-2xl font-semibold mb-6 text-neutral-dark">{editingCustomer ? 'Editar Cliente' : 'Nuevo Cliente'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[75vh] overflow-y-auto pr-2 custom-scrollbar">
          <Input name="fullName" label="Nombre Completo / Razón Social" value={formData.fullName} onChange={handleChange} required />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="docType" className="block text-sm font-medium text-gray-700 mb-1">Tipo Documento</label>
              <select id="docType" name="docType" value={formData.docType || ''} onChange={handleChange} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md">
                <option value="DNI">DNI</option>
                <option value="RUC">RUC</option>
                <option value="CE">Carnet de Extranjería</option>
                <option value="Pasaporte">Pasaporte</option>
                <option value="Otro">Otro</option>
              </select>
            </div>
            <Input name="docNumber" label="Número Documento" value={formData.docNumber || ''} onChange={handleChange} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input name="email" label="Correo Electrónico" type="email" value={formData.email || ''} onChange={handleChange} />
            <Input name="phone" label="Teléfono" value={formData.phone || ''} onChange={handleChange} />
          </div>
          
          <Input name="address" label="Dirección" value={formData.address || ''} onChange={handleChange} />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label htmlFor="customerType" className="block text-sm font-medium text-gray-700 mb-1">Tipo de Cliente</label>
                <select id="customerType" name="customerType" value={formData.customerType || 'minorista'} onChange={handleChange} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md">
                    <option value="minorista">Minorista</option>
                    <option value="mayorista">Mayorista</option>
                    <option value="VIP">VIP</option>
                    <option value="empresa">Empresa</option>
                </select>
            </div>
            <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                <select id="status" name="status" value={formData.status} onChange={handleChange} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md">
                    <option value="active">Activo</option>
                    <option value="inactive">Inactivo</option>
                </select>
            </div>
          </div>
          
          <Input name="notes" label="Observaciones" type="textarea" value={formData.notes || ''} onChange={handleChange} className="h-20"/>

          <div className="flex justify-end space-x-3 pt-6 border-t mt-6">
            <Button type="button" variant="ghost" onClick={onClose} disabled={isLoading}>Cancelar</Button>
            <Button type="submit" isLoading={isLoading} disabled={isLoading}>
              {isLoading ? (editingCustomer ? 'Guardando...' : 'Creando...') : (editingCustomer ? 'Guardar Cambios' : 'Crear Cliente')}
            </Button>
          </div>
        </form>
         <style>{`.custom-scrollbar::-webkit-scrollbar { width: 8px; } .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #06b6d4; border-radius: 4px; } .custom-scrollbar::-webkit-scrollbar-track { background-color: #f1f1f1; }`}</style>
      </div>
    </div>
  );
};

export default CustomerFormModal;
