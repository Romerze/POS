import React, { useState, useEffect } from 'react';
import { PurchaseOrder, SupplierPayment, SupplierPaymentMethod } from '../../types';
import Button from '../common/Button';
import Input from '../common/Input';
import { DEFAULT_CURRENCY_SYMBOL } from '../../constants';

interface SupplierPaymentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (paymentData: Omit<SupplierPayment, 'id' | 'recordedByUserId' | 'supplierId'>) => void;
  purchaseOrder: PurchaseOrder | null;
  isLoading?: boolean;
}

const SupplierPaymentFormModal: React.FC<SupplierPaymentFormModalProps> = ({ isOpen, onClose, onSubmit, purchaseOrder, isLoading }) => {
  
  const [amountToPay, setAmountToPay] = useState<number>(0);
  const [paymentDate, setPaymentDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState<SupplierPaymentMethod>(SupplierPaymentMethod.TRANSFER);
  const [referenceNumber, setReferenceNumber] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  const amountDue = purchaseOrder ? purchaseOrder.totalAmount - purchaseOrder.amountPaid : 0;

  useEffect(() => {
    if (purchaseOrder) {
      // Pre-fill amount to pay with the remaining due, but not more than total
      const due = purchaseOrder.totalAmount - purchaseOrder.amountPaid;
      setAmountToPay(Math.max(0, parseFloat(due.toFixed(2)))); // Ensure positive and correct precision
      setPaymentDate(new Date().toISOString().split('T')[0]);
      setPaymentMethod(SupplierPaymentMethod.TRANSFER);
      setReferenceNumber('');
      setNotes('');
    }
  }, [purchaseOrder, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!purchaseOrder) return;
    if (amountToPay <= 0) {
      alert("El monto a pagar debe ser mayor a cero.");
      return;
    }
    if (amountToPay > amountDue + 0.001) { // Add small tolerance for float precision
      alert(`El monto a pagar (${DEFAULT_CURRENCY_SYMBOL}${amountToPay.toFixed(2)}) no puede exceder el saldo pendiente (${DEFAULT_CURRENCY_SYMBOL}${amountDue.toFixed(2)}).`);
      return;
    }

    onSubmit({
      purchaseOrderId: purchaseOrder.id,
      paymentDate,
      amountPaid: amountToPay,
      paymentMethod,
      referenceNumber,
      notes,
    });
  };

  if (!isOpen || !purchaseOrder) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 overflow-y-auto h-full w-full z-50 flex justify-center items-center p-4">
      <div className="relative bg-white p-6 rounded-lg shadow-xl w-full max-w-lg mx-auto">
        <h2 className="text-xl font-semibold mb-2 text-neutral-dark">Registrar Pago para Orden de Compra</h2>
        <p className="text-sm text-gray-600">Nº Orden: <span className="font-medium">{purchaseOrder.orderNumber}</span></p>
        <p className="text-sm text-gray-600">Proveedor: <span className="font-medium">{purchaseOrder.supplierName}</span></p>
        <p className="text-sm text-gray-600 mb-1">Total Orden: <span className="font-medium">{DEFAULT_CURRENCY_SYMBOL}{purchaseOrder.totalAmount.toFixed(2)}</span></p>
        <p className="text-sm text-gray-600 mb-1">Monto Pagado: <span className="font-medium text-green-600">{DEFAULT_CURRENCY_SYMBOL}{purchaseOrder.amountPaid.toFixed(2)}</span></p>
        <p className="text-md font-semibold text-red-600 mb-4">Saldo Pendiente: <span className="font-bold">{DEFAULT_CURRENCY_SYMBOL}{amountDue.toFixed(2)}</span></p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            name="amountToPay"
            label="Monto a Pagar"
            type="number"
            value={amountToPay > 0 ? amountToPay.toString() : ''}
            onChange={(e) => setAmountToPay(parseFloat(e.target.value) || 0)}
            required
            min="0.01"
            max={amountDue.toFixed(2)}
            step="0.01"
            icon={<span className="text-gray-500 text-sm">{DEFAULT_CURRENCY_SYMBOL}</span>}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
                name="paymentDate"
                label="Fecha de Pago"
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                required
            />
            <div>
              <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700 mb-1">Método de Pago</label>
              <select
                id="paymentMethod"
                name="paymentMethod"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as SupplierPaymentMethod)}
                required
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
              >
                {Object.values(SupplierPaymentMethod).map(method => (
                  <option key={method} value={method}>{method.charAt(0).toUpperCase() + method.slice(1)}</option>
                ))}
              </select>
            </div>
          </div>
          
          <Input
            name="referenceNumber"
            label="Nº Referencia / Transacción (Opcional)"
            type="text"
            value={referenceNumber}
            onChange={(e) => setReferenceNumber(e.target.value)}
            placeholder="Ej: ID Transferencia, Nº Cheque"
          />
          <Input
            name="notes"
            label="Notas Adicionales (Opcional)"
            type="textarea"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
          />

          <div className="flex justify-end space-x-3 pt-4 border-t mt-4">
            <Button type="button" variant="ghost" onClick={onClose} disabled={isLoading}>Cancelar</Button>
            <Button type="submit" isLoading={isLoading} disabled={isLoading || amountToPay <= 0 || amountToPay > amountDue + 0.001}>
                {isLoading ? 'Registrando...' : 'Registrar Pago'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SupplierPaymentFormModal;