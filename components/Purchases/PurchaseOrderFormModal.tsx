
import React, { useState, useEffect, useCallback } from 'react';
import { PurchaseOrderFormData, PurchaseOrderItemFormData, Supplier, Product, SelectOption, PurchaseOrderStatus } from '../../types';
import { fetchSuppliers, fetchProducts } from '../../services/apiService';
import Button from '../common/Button';
import Input from '../common/Input';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import { DEFAULT_CURRENCY_SYMBOL, TAX_RATE } from '../../constants';

interface PurchaseOrderFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (poData: PurchaseOrderFormData) => void;
  isLoading?: boolean;
}

const PurchaseOrderFormModal: React.FC<PurchaseOrderFormModalProps> = ({ isOpen, onClose, onSubmit, isLoading }) => {
  const [formData, setFormData] = useState<PurchaseOrderFormData>({
    supplierId: '',
    items: [],
    orderDate: new Date().toISOString().split('T')[0],
    expectedDeliveryDate: '',
    shippingCost: 0,
    taxesAmount: 0, // Will be calculated
    notes: '',
    status: PurchaseOrderStatus.PENDING, 
  });
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [availableProducts, setAvailableProducts] = useState<SelectOption[]>([]);
  const [productSearchTerm, setProductSearchTerm] = useState('');


  const loadPrerequisites = useCallback(async () => {
    try {
      const [fetchedSuppliers, fetchedProducts] = await Promise.all([
        fetchSuppliers(),
        fetchProducts()
      ]);
      setSuppliers(fetchedSuppliers.filter(s => s.status === 'active'));
      setProducts(fetchedProducts);
      setAvailableProducts(fetchedProducts.map(p => ({ value: p.id, label: `${p.name} (SKU: ${p.sku})` })));
    } catch (error) {
      console.error("Error loading suppliers or products for PO form:", error);
      alert("Error al cargar datos necesarios para la orden de compra.");
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      loadPrerequisites();
      // Reset form when opened
       setFormData({
        supplierId: '',
        items: [], 
        orderDate: new Date().toISOString().split('T')[0],
        expectedDeliveryDate: '',
        shippingCost: 0,
        taxesAmount: 0,
        notes: '',
        status: PurchaseOrderStatus.PENDING, 
      });
    }
  }, [isOpen, loadPrerequisites]);


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    let processedValue: string | number = value;
    if (type === 'number') processedValue = parseFloat(value) || 0;
    if (name === 'shippingCost') processedValue = Math.max(0, parseFloat(value) || 0);

    setFormData(prev => ({ ...prev, [name]: processedValue }));
  };

  const handleItemChange = (index: number, field: keyof PurchaseOrderItemFormData, value: string) => {
    const newItems = [...formData.items];
    const currentItem = { ...newItems[index] };

    if (field === 'productId') {
        const selectedProduct = products.find(p => p.id === value);
        currentItem.productId = value;
        currentItem.productName = selectedProduct?.name || '';
        currentItem.productSku = selectedProduct?.sku || '';
        currentItem.unitCost = selectedProduct?.purchasePrice || 0; 
    } else if (field === 'quantityOrdered') {
        const numericValue = Number(value);
        currentItem.quantityOrdered = Math.max(0, isNaN(numericValue) ? 0 : numericValue);
    } else if (field === 'unitCost') {
        const numericValue = Number(value);
        currentItem.unitCost = Math.max(0, isNaN(numericValue) ? 0 : numericValue);
    } else if (field === 'productName' || field === 'productSku') {
        currentItem[field] = value;
    }
    
    newItems[index] = currentItem;
    setFormData(prev => ({ ...prev, items: newItems }));
  };

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { productId: '', productName: '', productSku: '', quantityOrdered: 1, unitCost: 0 }]
    }));
  };

  const removeItem = (index: number) => {
    setFormData(prev => ({ ...prev, items: prev.items.filter((_, i) => i !== index) }));
  };
  
  const calculateTotals = useCallback(() => {
    const subTotal = formData.items.reduce((sum, item) => sum + (item.quantityOrdered * item.unitCost), 0);
    const taxes = subTotal * TAX_RATE; 
    return { subTotal, taxes };
  }, [formData.items]);

  useEffect(() => {
    const { taxes } = calculateTotals();
    setFormData(prev => ({...prev, taxesAmount: taxes}));
  }, [formData.items, calculateTotals]);


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.supplierId) {
      alert("Por favor seleccione un proveedor.");
      return;
    }
    if (formData.items.length === 0) {
      alert("Debe añadir al menos un producto a la orden.");
      return;
    }
    if (formData.items.some(item => !item.productId || item.quantityOrdered <= 0 || item.unitCost < 0)) {
        alert("Todos los productos deben tener cantidad y costo unitario válidos (cantidad > 0, costo >= 0).");
        return;
    }
    onSubmit(formData);
  };

  if (!isOpen) return null;

  const { subTotal: currentSubtotal } = calculateTotals();
  const currentTotal = currentSubtotal + formData.taxesAmount + formData.shippingCost;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 overflow-y-auto h-full w-full z-50 flex justify-center items-start pt-6 pb-6">
      <div className="relative bg-white p-5 md:p-7 rounded-lg shadow-xl w-full max-w-3xl mx-auto my-4">
        <h2 className="text-2xl font-semibold mb-5 text-neutral-dark">Nueva Orden de Compra</h2>
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[85vh] overflow-y-auto pr-2 custom-scrollbar">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="supplierId" className="block text-sm font-medium text-gray-700 mb-1">Proveedor</label>
              <select id="supplierId" name="supplierId" value={formData.supplierId} onChange={handleInputChange} required className="form-select">
                <option value="">Seleccione un proveedor</option>
                {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <Input name="orderDate" label="Fecha de Orden" type="date" value={formData.orderDate} onChange={handleInputChange} required />
          </div>
          
          <Input name="expectedDeliveryDate" label="Fecha Estimada de Entrega (Opcional)" type="date" value={formData.expectedDeliveryDate || ''} onChange={handleInputChange} />

          {/* Items */}
          <div className="border-t pt-4 mt-4">
            <h3 className="text-lg font-medium text-gray-800 mb-2">Productos a Ordenar</h3>
            {formData.items.map((item, index) => (
              <div key={index} className="grid grid-cols-12 gap-2 items-end p-2 mb-2 border rounded-md">
                <div className="col-span-12 sm:col-span-5">
                    <label htmlFor={`item_product_${index}`} className="text-xs text-gray-600">Producto</label>
                    <select 
                        id={`item_product_${index}`}
                        value={item.productId}
                        onChange={(e) => handleItemChange(index, 'productId', e.target.value)}
                        className="form-select text-sm py-1.5"
                    >
                        <option value="">Seleccionar producto</option>
                        {availableProducts.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                    </select>
                </div>
                <div className="col-span-4 sm:col-span-2">
                     <Input label="Cantidad" type="number" min="1" value={item.quantityOrdered.toString()} onChange={e => handleItemChange(index, 'quantityOrdered', e.target.value)} containerClassName="mb-0" className="text-sm py-1.5" labelClassName="text-xs"/>
                </div>
                <div className="col-span-4 sm:col-span-2">
                     <Input label="Costo Unit." type="number" min="0" step="0.01" value={item.unitCost.toString()} onChange={e => handleItemChange(index, 'unitCost', e.target.value)} containerClassName="mb-0" className="text-sm py-1.5" labelClassName="text-xs"/>
                </div>
                <div className="col-span-4 sm:col-span-2 text-right">
                    <p className="text-xs text-gray-500 mb-1">Subtotal</p>
                    <p className="text-sm font-semibold">{DEFAULT_CURRENCY_SYMBOL}{(item.quantityOrdered * item.unitCost).toFixed(2)}</p>
                </div>
                <div className="col-span-12 sm:col-span-1 flex justify-end items-center">
                    <Button type="button" variant="danger" size="sm" onClick={() => removeItem(index)} className="p-1.5">
                        <TrashIcon className="h-4 w-4" />
                    </Button>
                </div>
              </div>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={addItem} leftIcon={<PlusIcon className="h-4 w-4"/>} className="mt-2">
              Añadir Producto
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t pt-4 mt-4">
            <Input name="shippingCost" label="Costo de Envío" type="number" value={formData.shippingCost.toString()} onChange={handleInputChange} />
            <div>
                <p className="text-sm font-medium text-gray-700">Subtotal Productos:</p>
                <p className="text-lg font-semibold">{DEFAULT_CURRENCY_SYMBOL}{currentSubtotal.toFixed(2)}</p>
            </div>
             <div>
                <p className="text-sm font-medium text-gray-700">Impuestos ({TAX_RATE*100}%):</p>
                <p className="text-lg font-semibold">{DEFAULT_CURRENCY_SYMBOL}{formData.taxesAmount.toFixed(2)}</p>
            </div>
          </div>
           <div className="text-right mt-2">
                <p className="text-sm font-medium text-gray-700">Total Orden:</p>
                <p className="text-2xl font-bold text-primary">{DEFAULT_CURRENCY_SYMBOL}{currentTotal.toFixed(2)}</p>
            </div>

          <Input name="notes" label="Notas Adicionales (Opcional)" type="textarea" value={formData.notes || ''} onChange={handleInputChange} className="h-20"/>

          <div className="flex justify-end space-x-3 pt-6 border-t mt-6">
            <Button type="button" variant="ghost" onClick={onClose} disabled={isLoading}>Cancelar</Button>
            <Button type="submit" isLoading={isLoading} disabled={isLoading || formData.items.length === 0}>
              {isLoading ? 'Creando Orden...' : 'Crear Orden de Compra'}
            </Button>
          </div>
        </form>
        <style
          dangerouslySetInnerHTML={{
            __html: `
              .custom-scrollbar::-webkit-scrollbar { width: 8px; } 
              .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #06b6d4; border-radius: 4px; } 
              .custom-scrollbar::-webkit-scrollbar-track { background-color: #f1f1f1; }
              .form-select {
                display: block;
                width: 100%;
                padding: 0.5rem 2.5rem 0.5rem 0.75rem; /* py-2 pl-3 pr-10 */
                font-size: 0.875rem; /* sm:text-sm */
                line-height: 1.25rem;
                border-width: 1px;
                border-color: #d1d5db; /* border-gray-300 */
                border-radius: 0.375rem; /* rounded-md */
                background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
                background-position: right 0.5rem center;
                background-repeat: no-repeat;
                background-size: 1.5em 1.5em;
                -webkit-appearance: none;
                -moz-appearance: none;
                appearance: none;
              }
              .form-select:focus {
                outline: 2px solid transparent;
                outline-offset: 2px;
                border-color: #06b6d4; /* focus:border-primary */
                box-shadow: 0 0 0 2px #06b6d4; /* focus:ring-primary */
              }
            `
          }}
        />
      </div>
    </div>
  );
};

export default PurchaseOrderFormModal;
