
import React, { useState, useEffect, useCallback, ChangeEvent } from 'react';
import { Product, CartItem, PaymentMethod, SelectOption, Customer, Sale, CustomerFormData, Permission } from '../../types'; // Added Permission
import { fetchProducts, submitSale, fetchCustomers, addCustomer as apiAddCustomer, fetchActiveCashRegisterSession } from '../../services/apiService';
import { useAuth } from '../../hooks/useAuth';
import ProductCard from '../Products/ProductCard';
import CartItemCard from './CartItemCard';
import Button from '../common/Button';
import Spinner from '../common/Spinner';
import Input from '../common/Input';
import { DEFAULT_CURRENCY_SYMBOL, PAYMENT_METHOD_OPTIONS, TAX_RATE } from '../../constants';
import { MagnifyingGlassIcon, ShoppingBagIcon, CreditCardIcon, XCircleIcon, ShoppingCartIcon, UserPlusIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import SaleTicketModal from './SaleTicketModal'; // New component for ticket display
import CustomerFormModal from '../Customers/CustomerFormModal'; // For adding quick customer


const QuickSalePage: React.FC = () => {
  const [availableProducts, setAvailableProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.CASH);
  const [loadingProducts, setLoadingProducts] = useState<boolean>(true);
  const [submittingSale, setSubmittingSale] = useState<boolean>(false);
  const [saleError, setSaleError] = useState<string | null>(null);
  const [saleSuccessMessage, setSaleSuccessMessage] = useState<string | null>(null);
  
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(''); 

  const [cashReceived, setCashReceived] = useState<number>(0);
  const [saleNotes, setSaleNotes] = useState<string>('');

  const [completedSale, setCompletedSale] = useState<Sale | null>(null);
  const [isTicketModalOpen, setIsTicketModalOpen] = useState<boolean>(false);
  
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState<boolean>(false);

  const [activeCashSessionId, setActiveCashSessionId] = useState<string | undefined>(undefined);


  const { currentUser, hasPermission } = useAuth(); // Get hasPermission
  const canCreateSale = hasPermission(Permission.CREATE_SALE);
  const canAddProductToCart = hasPermission(Permission.ADD_PRODUCT_TO_CART);
  const canCreateCustomer = hasPermission(Permission.CREATE_CUSTOMER);

  const loadInitialData = useCallback(async () => {
    try {
      setLoadingProducts(true);
      setSaleError(null);
      const [fetchedProducts, fetchedCustomers] = await Promise.all([
        fetchProducts(),
        fetchCustomers()
      ]);
      setAvailableProducts(fetchedProducts);
      setFilteredProducts(fetchedProducts.filter(p => p.stock > 0));
      setCustomers(fetchedCustomers); 
      
      const anonymousCustomer = fetchedCustomers.find(c => c.fullName === 'Cliente Anónimo');
      if (anonymousCustomer) {
        setSelectedCustomerId(anonymousCustomer.id);
      }

      if (currentUser && hasPermission(Permission.MANAGE_CASH_REGISTER)) {
        const session = await fetchActiveCashRegisterSession('TERMINAL_01', currentUser.id);
        setActiveCashSessionId(session?.id);
        if (!session && (currentUser.role === 'cajero' || currentUser.role === 'admin' || currentUser.role === 'supervisor')) {
            setSaleError("No hay una sesión de caja activa. Por favor, abra caja para registrar ventas.");
        }
      }

    } catch (err: any) {
      setSaleError(err.message || 'Error al cargar datos iniciales.');
      console.error(err);
    } finally {
      setLoadingProducts(false);
    }
  }, [currentUser, hasPermission]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  useEffect(() => {
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    const results = availableProducts.filter(product =>
      product.stock > 0 &&
      (product.name.toLowerCase().includes(lowerCaseSearchTerm) ||
      product.sku.toLowerCase().includes(lowerCaseSearchTerm))
    );
    setFilteredProducts(results);
  }, [searchTerm, availableProducts]);

  const addToCart = useCallback((product: Product) => {
    if(!canAddProductToCart) {
        alert("No tiene permisos para añadir productos al carrito.");
        return;
    }
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.product.id === product.id);
      if (existingItem) {
        if (existingItem.quantity < product.stock) {
            return prevCart.map(item =>
            item.product.id === product.id
              ? { ...item, quantity: item.quantity + 1, subtotal: (item.quantity + 1) * item.unitPrice }
              : item
          );
        } else {
            alert(`No hay más stock disponible para ${product.name}. Máximo en stock: ${product.stock}`);
            return prevCart;
        }
      } else {
        if (product.stock > 0) {
            return [...prevCart, { product, quantity: 1, unitPrice: product.salePrice, subtotal: product.salePrice }];
        } else {
            alert(`${product.name} está agotado.`); 
            return prevCart;
        }
      }
    });
    setSaleError(null); 
    setSaleSuccessMessage(null);
  }, [canAddProductToCart]);

  const removeFromCart = useCallback((productId: string) => {
    setCart(prevCart => prevCart.filter(item => item.product.id !== productId));
  }, []);

  const updateCartItemQuantity = useCallback((productId: string, newQuantity: number) => {
    setCart(prevCart => {
        const itemToUpdate = prevCart.find(item => item.product.id === productId);
        if (!itemToUpdate) return prevCart;

        if (newQuantity <= 0) {
            return prevCart.filter(item => item.product.id !== productId);
        }
        if (newQuantity > itemToUpdate.product.stock) {
            alert(`No hay suficiente stock para ${itemToUpdate.product.name}. Máximo en stock: ${itemToUpdate.product.stock}`);
            return prevCart.map(item =>
                item.product.id === productId
                ? { ...item, quantity: itemToUpdate.product.stock, subtotal: itemToUpdate.product.stock * item.unitPrice }
                : item
            );
        }
        return prevCart.map(item =>
            item.product.id === productId
            ? { ...item, quantity: newQuantity, subtotal: newQuantity * item.unitPrice }
            : item
        );
    });
  }, []);

  const calculateTotals = () => {
    const currentSubTotal = cart.reduce((sum, item) => sum + item.subtotal, 0);
    const currentTaxes = currentSubTotal * TAX_RATE;
    const currentGrandTotal = currentSubTotal + currentTaxes;
    return { subTotal: currentSubTotal, taxes: currentTaxes, grandTotal: currentGrandTotal };
  };

  const { subTotal, taxes, grandTotal } = calculateTotals();

  const resetSaleState = useCallback(() => {
    setCart([]);
    setSaleError(null);
    setSaleSuccessMessage(null);
    const anonymousCustomer = customers.find(c => c.fullName === 'Cliente Anónimo');
    setSelectedCustomerId(anonymousCustomer?.id || '');
    setCashReceived(0);
    setSaleNotes('');
  }, [customers]);

  const handleFinalizeSale = async () => {
    if (!canCreateSale) {
        alert("No tiene permisos para finalizar ventas.");
        setSaleError("Acción no permitida.");
        return;
    }
    if (!currentUser) {
      setSaleError("Error: Usuario no autenticado.");
      return;
    }
    if (cart.length === 0) {
      setSaleError("El carrito está vacío.");
      return;
    }
    if (!activeCashSessionId && paymentMethod === PaymentMethod.CASH && hasPermission(Permission.MANAGE_CASH_REGISTER)) {
        setSaleError("No hay una sesión de caja activa para ventas en efectivo. Por favor, abra caja.");
        return;
    }
    if (paymentMethod === PaymentMethod.CASH && cashReceived < grandTotal) {
        setSaleError(`Monto recibido (S/${cashReceived.toFixed(2)}) es menor al total (S/${grandTotal.toFixed(2)}).`);
        return;
    }

    setSubmittingSale(true);
    setSaleError(null);
    setSaleSuccessMessage(null);
    try {
      let paymentDetails;
      if (paymentMethod === PaymentMethod.CASH) {
        paymentDetails = `Recibido: ${DEFAULT_CURRENCY_SYMBOL}${cashReceived.toFixed(2)}, Cambio: ${DEFAULT_CURRENCY_SYMBOL}${(cashReceived - grandTotal).toFixed(2)}`;
      } 

      const saleResult = await submitSale(
        cart, 
        paymentMethod, 
        grandTotal, 
        currentUser.id, 
        selectedCustomerId,
        saleNotes,
        paymentDetails,
        paymentMethod === PaymentMethod.CASH ? activeCashSessionId : undefined
      );
      
      setCompletedSale(saleResult);
      setIsTicketModalOpen(true);
      resetSaleState();

      const fetchedProducts = await fetchProducts();
      setAvailableProducts(fetchedProducts);
      setFilteredProducts(fetchedProducts.filter(p => p.stock > 0));

    } catch (err: any) {
      setSaleError(err.message || 'Ocurrió un error al procesar la venta.');
    } finally {
      setSubmittingSale(false);
    }
  };
  
  const handleOpenCustomerModal = () => {
    if (!canCreateCustomer) {
        alert("No tiene permisos para añadir nuevos clientes.");
        return;
    }
    setIsCustomerModalOpen(true);
  }

  const handleCustomerAdded = async (newCustomer: Customer) => {
     const updatedCustomers = await fetchCustomers();
     setCustomers(updatedCustomers);
     setSelectedCustomerId(newCustomer.id);
     setIsCustomerModalOpen(false);
  };


  return (
    <div className="container mx-auto px-2 py-4 md:px-4 md:py-8 h-[calc(100vh-theme.headerHeight)] flex flex-col lg:flex-row gap-4">
      {/* Product Selection Area */}
      <div className="lg:w-3/5 xl:w-2/3 flex flex-col h-full">
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold text-neutral-dark">Seleccionar Productos</h2>
        </div>
        <div className="mb-4 p-3 bg-white shadow-sm rounded-md">
          <Input
            type="text"
            placeholder="Buscar productos por nombre o SKU..."
            value={searchTerm}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
            icon={<MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />}
            containerClassName="mb-0"
          />
        </div>
        {loadingProducts ? (
          <div className="flex-grow flex justify-center items-center"><Spinner size="lg" /></div>
        ) : filteredProducts.length === 0 ? (
           <div className="flex-grow flex flex-col justify-center items-center text-center text-gray-500 py-10 bg-white rounded-lg shadow">
             <ShoppingBagIcon className="h-16 w-16 mx-auto text-gray-400 mb-4" />
             <p className="text-xl">No hay productos disponibles.</p>
             {searchTerm && <p className="text-sm">Intenta con otros términos o revisa el stock.</p>}
           </div>
        ) : (
          <div className="flex-grow overflow-y-auto pr-2 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 custom-scrollbar" style={{maxHeight: 'calc(100vh - 280px)'}}>
            {filteredProducts.map(product => (
              <ProductCard key={product.id} product={product} onAddToCart={canAddProductToCart ? addToCart : undefined} />
            ))}
          </div>
        )}
      </div>

      {/* Cart and Payment Area */}
      <div className="lg:w-2/5 xl:w-1/3 bg-white p-4 rounded-xl shadow-xl flex flex-col h-full">
        <h2 className="text-xl font-semibold text-neutral-dark mb-3 border-b pb-3">Resumen de Venta</h2>
        
        <div className="mb-3">
            <div className="flex justify-between items-center">
                 <label htmlFor="customer" className="block text-sm font-medium text-gray-700 mb-1">Cliente</label>
                 {canCreateCustomer && (
                    <Button variant="ghost" size="sm" onClick={handleOpenCustomerModal} leftIcon={<UserPlusIcon className="h-4 w-4"/>} className="text-xs !py-0.5">
                        Nuevo Cliente
                    </Button>
                 )}
            </div>
            <select
                id="customer"
                name="customer"
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
            >
                {customers.map((customer) => (
                    <option key={customer.id} value={customer.id}>{customer.fullName}{customer.docNumber ? ` (${customer.docNumber})`: ''}</option>
                ))}
            </select>
        </div>


        {cart.length === 0 ? (
          <div className="flex-grow flex flex-col justify-center items-center text-center text-gray-400">
            <ShoppingCartIcon className="h-16 w-16 mx-auto opacity-50 mb-3" />
            <p className="text-md">Tu carrito está vacío.</p>
            <p className="text-xs">Añade productos para comenzar una venta.</p>
          </div>
        ) : (
          <div className="flex-grow overflow-y-auto space-y-2 mb-3 pr-1 custom-scrollbar" style={{maxHeight: 'calc(100vh - 520px)' /* Adjusted for more fields */}}>
            {cart.map(item => (
              <CartItemCard
                key={item.product.id}
                item={item}
                onRemove={removeFromCart}
                onUpdateQuantity={updateCartItemQuantity}
              />
            ))}
          </div>
        )}

        {cart.length > 0 && (
          <div className="mt-auto border-t pt-3 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal:</span>
              <span className="font-semibold text-gray-800">{DEFAULT_CURRENCY_SYMBOL}{subTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">IGV ({TAX_RATE * 100}%):</span>
              <span className="font-semibold text-gray-800">{DEFAULT_CURRENCY_SYMBOL}{taxes.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold text-primary">
              <span>Total:</span>
              <span>{DEFAULT_CURRENCY_SYMBOL}{grandTotal.toFixed(2)}</span>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label htmlFor="paymentMethod" className="block text-xs font-medium text-gray-700 mb-0.5">Método de Pago</label>
                    <select
                        id="paymentMethod"
                        name="paymentMethod"
                        value={paymentMethod}
                        onChange={(e) => {
                            setPaymentMethod(e.target.value as PaymentMethod);
                            if (e.target.value !== PaymentMethod.CASH) setCashReceived(0); 
                        }}
                        className="mt-1 block w-full pl-2 pr-8 py-1.5 text-sm border-gray-300 focus:outline-none focus:ring-primary focus:border-primary rounded-md"
                    >
                        {PAYMENT_METHOD_OPTIONS.map((option: SelectOption<PaymentMethod>) => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                    </select>
                </div>
                {paymentMethod === PaymentMethod.CASH && (
                    <div>
                        <Input
                            label="Monto Recibido"
                            id="cashReceived"
                            type="number"
                            value={cashReceived > 0 ? cashReceived.toString() : ''}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => setCashReceived(parseFloat(e.target.value) || 0)}
                            min={grandTotal.toString()}
                            step="0.1"
                            containerClassName="mb-0"
                            className="py-1.5 text-sm"
                            labelClassName="text-xs"
                        />
                    </div>
                )}
            </div>
            {paymentMethod === PaymentMethod.CASH && cashReceived >= grandTotal && (
                <div className="text-right text-sm font-semibold text-green-600">
                    Cambio: {DEFAULT_CURRENCY_SYMBOL}{(cashReceived - grandTotal).toFixed(2)}
                </div>
            )}
             <div>
                <Input
                    label="Notas de Venta (Opcional)"
                    id="saleNotes"
                    type="textarea"
                    value={saleNotes}
                    onChange={(e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setSaleNotes(e.target.value)}
                    rows={1}
                    containerClassName="mb-0"
                    className="py-1.5 text-sm"
                    labelClassName="text-xs"
                />
            </div>


            {saleError && <p className="text-xs text-red-600 p-2 bg-red-100 rounded-md text-center">{saleError}</p>}
            

            <div className="grid grid-cols-2 gap-2">
                <Button 
                    onClick={handleFinalizeSale} 
                    className="w-full text-md py-2" 
                    isLoading={submittingSale} 
                    disabled={submittingSale || cart.length === 0 || (!activeCashSessionId && paymentMethod === PaymentMethod.CASH && hasPermission(Permission.MANAGE_CASH_REGISTER)) || !canCreateSale}
                    leftIcon={<CreditCardIcon className="h-5 w-5" />}
                >
                {submittingSale ? 'Procesando...' : 'Finalizar'}
                </Button>
                <Button 
                    onClick={resetSaleState}
                    variant="outline"
                    className="w-full text-md py-2" 
                    disabled={cart.length === 0 || submittingSale}
                    leftIcon={<XCircleIcon className="h-5 w-5"/>}
                >
                    Cancelar
                </Button>
            </div>
          </div>
        )}
      </div>
      <style>{`.custom-scrollbar::-webkit-scrollbar { width: 6px; } .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #06b6d4; border-radius: 3px; } .custom-scrollbar::-webkit-scrollbar-track { background-color: #f1f1f1; } input[type="number"]::-webkit-outer-spin-button, input[type="number"]::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; } input[type="number"] { -moz-appearance: textfield; }`}</style>
      
      {completedSale && isTicketModalOpen && (
        <SaleTicketModal 
            isOpen={isTicketModalOpen}
            onClose={() => { setIsTicketModalOpen(false); setCompletedSale(null); }}
            sale={completedSale}
        />
      )}
      {isCustomerModalOpen && canCreateCustomer && (
        <CustomerFormModal
            isOpen={isCustomerModalOpen}
            onClose={() => setIsCustomerModalOpen(false)}
            onSubmit={async (customerData) => {
                try {
                    const newCustomer = await apiAddCustomer(customerData as CustomerFormData);
                    handleCustomerAdded(newCustomer);
                } catch (e: any) { 
                    console.error("Failed to add customer",e);
                    alert(`Error al añadir cliente: ${e.message || String(e)}`);
                }
            }}
            editingCustomer={null}
        />
      )}
    </div>
  );
};

export default QuickSalePage;
