import React from 'react';
import { Sale } from '../../types';
import Button from '../common/Button';
import { DEFAULT_CURRENCY_SYMBOL, APP_NAME } from '../../constants';
import { PrinterIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface SaleTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  sale: Sale | null;
}

const SaleTicketModal: React.FC<SaleTicketModalProps> = ({ isOpen, onClose, sale }) => {
  if (!isOpen || !sale) return null;

  const handlePrint = () => {
    alert("Simulando impresión de ticket...");
    // In a real app, this would trigger window.print() on a print-formatted version.
    onClose(); 
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 overflow-y-auto h-full w-full z-50 flex justify-center items-center p-4">
      <div className="relative bg-white p-6 rounded-lg shadow-xl w-full max-w-md mx-auto">
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-neutral-dark">
                {sale.invoiceNumber ? 'Factura de Venta' : 'Ticket de Venta'}
            </h2>
            <Button variant="ghost" size="sm" onClick={onClose} className="p-1">
                <XMarkIcon className="h-6 w-6" />
            </Button>
        </div>
        
        <div className="border border-dashed border-gray-300 p-4 rounded-md text-sm printable-ticket">
            <div className="text-center mb-4">
                <h3 className="text-lg font-bold">{APP_NAME}</h3>
                <p className="text-xs">RUC: 12345678901 (Ejemplo)</p>
                <p className="text-xs">Dirección: Av. Ficticia 123, Lima</p>
                <p className="text-xs">Tel: (01) 555-5555</p>
            </div>

            <div className="mb-2">
                <p><strong>{sale.invoiceNumber ? `Factura Nº: ${sale.invoiceNumber}` : `Ticket Nº: ${sale.ticketNumber}`}</strong></p>
                <p>Fecha: {new Date(sale.timestamp).toLocaleString()}</p>
                <p>Cajero: {sale.cashierName || sale.cashierId}</p>
                {sale.customerName && sale.customerName !== "Cliente Anónimo" && <p>Cliente: {sale.customerName}</p>}
                {/* Add Customer DNI/RUC if available and it's an invoice */}
            </div>

            <table className="w-full my-3 text-left">
                <thead>
                    <tr className="border-b border-dashed">
                        <th className="py-1 font-normal">Cant.</th>
                        <th className="py-1 font-normal">Producto</th>
                        <th className="py-1 font-normal text-right">P.Unit.</th>
                        <th className="py-1 font-normal text-right">Subtotal</th>
                    </tr>
                </thead>
                <tbody>
                    {sale.items.map(item => (
                        <tr key={item.product.id} className="border-b border-dashed">
                            <td className="py-1 align-top">{item.quantity}</td>
                            <td className="py-1 align-top">{item.product.name}</td>
                            <td className="py-1 align-top text-right">{DEFAULT_CURRENCY_SYMBOL}{item.unitPrice.toFixed(2)}</td>
                            <td className="py-1 align-top text-right">{DEFAULT_CURRENCY_SYMBOL}{item.subtotal.toFixed(2)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div className="mt-3 text-right">
                <p>Subtotal: {DEFAULT_CURRENCY_SYMBOL}{sale.subTotal.toFixed(2)}</p>
                <p>IGV ({/* You might want TAX_RATE here from constants */ (0.18 * 100).toFixed(0)}%): {DEFAULT_CURRENCY_SYMBOL}{sale.taxes.toFixed(2)}</p>
                {sale.discountApplied > 0 && <p>Descuento: -{DEFAULT_CURRENCY_SYMBOL}{sale.discountApplied.toFixed(2)}</p>}
                <p className="font-bold text-md">Total: {DEFAULT_CURRENCY_SYMBOL}{sale.grandTotal.toFixed(2)}</p>
            </div>
            
            <div className="mt-2">
                <p>Método de Pago: {sale.paymentMethod.charAt(0).toUpperCase() + sale.paymentMethod.slice(1)}</p>
                {sale.paymentDetails && <p className="text-xs">Detalle Pago: {sale.paymentDetails}</p>}
            </div>

            {sale.notes && <p className="mt-2 text-xs">Notas: {sale.notes}</p>}

            <div className="text-center mt-5">
                <p className="text-xs">¡Gracias por su compra!</p>
            </div>
        </div>

        <div className="flex justify-end space-x-3 pt-6 mt-4 border-t">
          <Button variant="outline" onClick={onClose}>Cerrar</Button>
          <Button onClick={handlePrint} leftIcon={<PrinterIcon className="h-5 w-5"/>}>
            Imprimir Ticket
          </Button>
        </div>
        <style>{`
            .printable-ticket { font-family: 'Courier New', Courier, monospace; }
            .printable-ticket p, .printable-ticket td, .printable-ticket th { margin-bottom: 2px; }
        `}</style>
      </div>
    </div>
  );
};

export default SaleTicketModal;
