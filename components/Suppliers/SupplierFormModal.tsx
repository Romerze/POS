import React, { useState, useEffect } from 'react';
import { Supplier, SupplierFormData } from '../../types';
import Button from '../common/Button';
import Input from '../common/Input';

interface SupplierFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (supplierData: SupplierFormData) => void;
  editingSupplier: Supplier | null;
  isLoading?: boolean;
}

const SupplierFormModal: React.FC<SupplierFormModalProps> = ({ isOpen, onClose, onSubmit, editingSupplier, isLoading }) => {
  const [formData, setFormData] = useState<SupplierFormData>({
    name: '',
    ruc: '',
    contactName: '',
    phone: '',
    email: '',
    address: '',
    notes: '',
    status: 'active',
  });

  useEffect(() => {
    if (editingSupplier) {
      setFormData({ ...editingSupplier });
    } else {
      setFormData({
        name: '',
        ruc: '',
        contactName: '',
        phone: '',
        email: '',
        address: '',
        notes: '',
        status: 'active',
      });
    }
  }, [editingSupplier, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      alert("El nombre o razón social del proveedor es obligatorio.");
      return;
    }
    if (formData.ruc && formData.ruc.length !== 11) {
        alert("El RUC debe tener 11 dígitos si se especifica.");
        return;
    }
    onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 overflow-y-auto h-full w-full z-50 flex justify-center items-start pt-10">
      <div className="relative bg-white p-6 md:p-8 rounded-lg shadow-xl w-full max-w-xl mx-auto my-8">
        <h2 className="text-2xl font-semibold mb-6 text-neutral-dark">{editingSupplier ? 'Editar Proveedor' : 'Nuevo Proveedor'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[75vh] overflow-y-auto pr-2 custom-scrollbar">
          <Input name="name" label="Nombre / Razón Social" value={formData.name} onChange={handleChange} required />
          <Input name="ruc" label="RUC (Opcional)" value={formData.ruc || ''} onChange={handleChange} placeholder="11 dígitos" />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input name="contactName" label="Nombre de Contacto" value={formData.contactName || ''} onChange={handleChange} />
            <Input name="phone" label="Teléfono" value={formData.phone || ''} onChange={handleChange} />
          </div>

          <Input name="email" label="Correo Electrónico" type="email" value={formData.email || ''} onChange={handleChange} />
          <Input name="address" label="Dirección" value={formData.address || ''} onChange={handleChange} />
          
          <Input name="notes" label="Notas Adicionales" type="textarea" value={formData.notes || ''} onChange={handleChange} className="h-20"/>

          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
            <select 
                id="status" 
                name="status" 
                value={formData.status} 
                onChange={handleChange} 
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
            >
              <option value="active">Activo</option>
              <option value="inactive">Inactivo</option>
            </select>
          </div>

          <div className="flex justify-end space-x-3 pt-6 border-t mt-6">
            <Button type="button" variant="ghost" onClick={onClose} disabled={isLoading}>Cancelar</Button>
            <Button type="submit" isLoading={isLoading} disabled={isLoading}>
              {isLoading ? (editingSupplier ? 'Guardando...' : 'Creando...') : (editingSupplier ? 'Guardar Cambios' : 'Crear Proveedor')}
            </Button>
          </div>
        </form>
        <style>{`.custom-scrollbar::-webkit-scrollbar { width: 8px; } .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #06b6d4; border-radius: 4px; } .custom-scrollbar::-webkit-scrollbar-track { background-color: #f1f1f1; }`}</style>
      </div>
    </div>
  );
};

export default SupplierFormModal;