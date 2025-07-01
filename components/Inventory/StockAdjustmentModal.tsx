import React, { useState, useEffect } from 'react';
import { Product } from '../../types';
import Button from '../common/Button';
import Input from '../common/Input';

export type AdjustmentType = 'ingreso' | 'salida' | 'ajuste';

interface StockAdjustmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (productId: string, newStock: number, adjustmentDetails: { type: AdjustmentType, quantity: number, reason?: string}) => void;
  product: Product | null;
  isLoading?: boolean;
}

const StockAdjustmentModal: React.FC<StockAdjustmentModalProps> = ({ isOpen, onClose, onSubmit, product, isLoading }) => {
  const [adjustmentQuantity, setAdjustmentQuantity] = useState<number>(0);
  const [adjustmentType, setAdjustmentType] = useState<AdjustmentType>('ingreso');
  const [reason, setReason] = useState<string>('');
  const [newStockPreview, setNewStockPreview] = useState<number>(0);

  useEffect(() => {
    if (product) {
      setAdjustmentQuantity(0); // Reset quantity on product change or open
      setReason('');
      setNewStockPreview(product.stock);
    }
  }, [product, isOpen]);

  useEffect(() => {
    if (!product) return;
    let newCalculatedStock = product.stock;
    const quantity = Number(adjustmentQuantity);

    if (isNaN(quantity)) {
      setNewStockPreview(product.stock);
      return;
    }

    switch (adjustmentType) {
      case 'ingreso':
        newCalculatedStock = product.stock + quantity;
        break;
      case 'salida':
        newCalculatedStock = product.stock - quantity;
        break;
      case 'ajuste':
        newCalculatedStock = quantity; // Direct set
        break;
    }
    setNewStockPreview(Math.max(0, newCalculatedStock)); // Stock cannot be negative
  }, [product, adjustmentQuantity, adjustmentType]);


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;
    if (adjustmentQuantity === 0 && adjustmentType !== 'ajuste') {
        alert("La cantidad de ajuste no puede ser cero para ingresos o salidas.");
        return;
    }
    const finalNewStock = Math.max(0, newStockPreview); // Ensure stock is not negative
     if (adjustmentType === 'salida' && finalNewStock < 0) {
        alert("La cantidad de salida excede el stock actual.");
        return;
    }

    onSubmit(product.id, finalNewStock, { type: adjustmentType, quantity: Number(adjustmentQuantity), reason });
  };

  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 overflow-y-auto h-full w-full z-50 flex justify-center items-center">
      <div className="relative bg-white p-8 rounded-lg shadow-xl w-full max-w-md mx-auto">
        <h2 className="text-xl font-semibold mb-2 text-neutral-dark">Ajustar Stock: {product.name}</h2>
        <p className="text-sm text-gray-500 mb-1">SKU: {product.sku}</p>
        <p className="text-sm text-gray-500 mb-4">Stock Actual: <span className="font-bold">{product.stock} {product.unit}</span></p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="adjustmentType" className="block text-sm font-medium text-gray-700 mb-1">Tipo de Ajuste</label>
            <select
              id="adjustmentType"
              name="adjustmentType"
              value={adjustmentType}
              onChange={(e) => setAdjustmentType(e.target.value as AdjustmentType)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
            >
              <option value="ingreso">Ingreso (+)</option>
              <option value="salida">Salida (-)</option>
              <option value="ajuste">Ajuste Directo (=)</option>
            </select>
          </div>

          <Input
            name="adjustmentQuantity"
            label={adjustmentType === 'ajuste' ? "Nuevo Stock Total" : "Cantidad a Ajustar"}
            type="number"
            value={adjustmentQuantity.toString()}
            onChange={(e) => setAdjustmentQuantity(parseFloat(e.target.value) || 0)}
            required
            min={adjustmentType === 'ajuste' ? 0 : undefined} // Allow 0 for adjustment type, but not for +/-
          />
          
          <Input 
            name="reason"
            label="Motivo del Ajuste (Opcional)"
            type="text"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder={adjustmentType === 'ingreso' ? 'Ej: Recepción de pedido' : adjustmentType === 'salida' ? 'Ej: Merma, Consumo interno' : 'Ej: Conteo físico'}
          />

          <p className="text-sm text-gray-700">
            Nuevo Stock Calculado: <span className="font-bold text-primary">{newStockPreview} {product.unit}</span>
          </p>

          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="ghost" onClick={onClose} disabled={isLoading}>Cancelar</Button>
            <Button type="submit" isLoading={isLoading} disabled={isLoading || (adjustmentQuantity === 0 && adjustmentType !== 'ajuste')}>
                {isLoading ? 'Guardando...' : 'Aplicar Ajuste'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StockAdjustmentModal;
