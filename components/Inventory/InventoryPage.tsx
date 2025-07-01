
import React, { useState, useEffect, useCallback } from 'react';
import { Product, ProductFormData, Permission } from '../../types'; // Added Permission
import { fetchProducts, updateProduct } from '../../services/apiService';
import Spinner from '../common/Spinner';
import { SquaresPlusIcon, ArchiveBoxArrowDownIcon, ArchiveBoxXMarkIcon, ArrowsRightLeftIcon, MagnifyingGlassIcon, PlusCircleIcon, PencilSquareIcon, EyeIcon } from '@heroicons/react/24/outline';
import Button from '../common/Button';
import Input from '../common/Input';
import { DEFAULT_CURRENCY_SYMBOL } from '../../constants';
import StockAdjustmentModal, { AdjustmentType } from './StockAdjustmentModal';
import ProductFormModal from '../Products/ProductFormModal'; // For editing product details
import { useAuth } from '../../hooks/useAuth';
import { UserRole } from '../../types';


const InventoryPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [formLoading, setFormLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  const [isStockModalOpen, setIsStockModalOpen] = useState<boolean>(false);
  const [productForStockAdjustment, setProductForStockAdjustment] = useState<Product | null>(null);
  
  const [isProductModalOpen, setIsProductModalOpen] = useState<boolean>(false);
  const [editingProductDetails, setEditingProductDetails] = useState<Product | null>(null);

  const { currentUser, hasPermission } = useAuth(); // Get hasPermission
  const canAdjustStock = hasPermission(Permission.ADJUST_STOCK);
  const canEditProductDetails = hasPermission(Permission.EDIT_PRODUCT);


  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedProducts = await fetchProducts();
      setProducts(fetchedProducts);
      setFilteredProducts(fetchedProducts);
    } catch (err: any) {
      setError(err.message || 'Error al cargar el inventario.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  useEffect(() => {
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    const results = products.filter(product =>
      product.name.toLowerCase().includes(lowerCaseSearchTerm) ||
      product.sku.toLowerCase().includes(lowerCaseSearchTerm) ||
      (product.category && product.category.toLowerCase().includes(lowerCaseSearchTerm))
    );
    setFilteredProducts(results);
  }, [searchTerm, products]);


  const handleOpenStockModal = (product: Product) => {
    if (!canAdjustStock) {
        alert("No tiene permisos para ajustar stock.");
        return;
    }
    setProductForStockAdjustment(product);
    setIsStockModalOpen(true);
  };
  
  const handleCloseStockModal = () => {
    setIsStockModalOpen(false);
    setProductForStockAdjustment(null);
  };

  const handleStockAdjustmentSubmit = async (productId: string, newStock: number, adjustmentDetails: {type: AdjustmentType, quantity: number, reason?: string}) => {
    if (!canAdjustStock) {
        alert("No tiene permisos para ajustar stock.");
        return;
    }
    setFormLoading(true);
    setError(null);
    try {
      const productToUpdate = products.find(p => p.id === productId);
      if (!productToUpdate) throw new Error("Producto no encontrado para ajustar stock.");

      const updatedProductData: ProductFormData = { ...productToUpdate, stock: newStock };
      await updateProduct(updatedProductData);
      
      alert(`Stock de "${productToUpdate.name}" ajustado a ${newStock} ${productToUpdate.unit}.\nTipo: ${adjustmentDetails.type}, Cantidad: ${adjustmentDetails.quantity} ${adjustmentDetails.reason ? `\nMotivo: ${adjustmentDetails.reason}` : ''}`);
      handleCloseStockModal();
      await loadProducts(); // Refresh list
    } catch (err: any) {
      setError(err.message || 'Error al ajustar el stock.');
      alert(`Error: ${err.message}`);
    } finally {
      setFormLoading(false);
    }
  };

  const handleOpenEditProductModal = (product: Product) => {
    // Viewing details is always allowed, editing requires permission
    if (!canEditProductDetails && currentUser?.role !== UserRole.ADMIN && currentUser?.role !== UserRole.SUPERVISOR) { // Allow view if no edit permission
         // For now, let's allow viewing for anyone who can see inventory page
    }
    setEditingProductDetails(product);
    setIsProductModalOpen(true);
  };

  const handleProductFormSubmit = async (productData: ProductFormData) => {
    if (!canEditProductDetails) {
        alert("No tiene permisos para editar detalles del producto.");
        return;
    }
    setFormLoading(true);
    setError(null);
    try {
      await updateProduct(productData); 
      alert('Producto actualizado con éxito.');
      setIsProductModalOpen(false);
      setEditingProductDetails(null);
      await loadProducts();
    } catch (err: any) {
      setError(err.message || 'Error al guardar el producto.');
      alert(`Error al guardar el producto: ${err.message}`);
    } finally {
      setFormLoading(false);
    }
  };
  

  if (loading && products.length === 0) {
    return <div className="flex justify-center items-center h-64"><Spinner size="lg" /></div>;
  }

  if (error && products.length === 0) {
    return <div className="text-center text-red-500 p-4 bg-red-50 rounded-md shadow">{error}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold text-neutral-dark flex items-center">
            <SquaresPlusIcon className="h-8 w-8 mr-3 text-primary"/>Gestión de Inventario
        </h1>
         {/* Future: <Button onClick={() => alert("Carga masiva no implementada")} leftIcon={<ArrowUpTrayIcon className="h-5 w-5"/>}>Carga Masiva</Button> */}
      </div>
       <div className="mb-6 p-4 bg-white shadow rounded-lg">
        <Input
            type="text"
            placeholder="Buscar productos en inventario (nombre, SKU, categoría)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon={<MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />}
            containerClassName="mb-0"
        />
      </div>
      {error && <div className="mb-4 text-center text-red-500 p-3 bg-red-50 rounded-md shadow-sm">{error}</div>}
      {loading && products.length > 0 && <div className="flex justify-center my-4"><Spinner size="md" /></div>}

      {filteredProducts.length === 0 && !loading ? (
         <div className="text-center text-gray-500 py-10 bg-white rounded-lg shadow">
          <SquaresPlusIcon className="h-16 w-16 mx-auto text-gray-400 mb-4" />
          <p className="text-xl">No hay productos en el inventario que coincidan.</p>
           {searchTerm && <p className="text-sm">Intenta con otros términos de búsqueda.</p>}
           {!searchTerm && <p className="text-sm">Puedes añadir productos desde el módulo de "Productos".</p>}
        </div>
      ) : (
        <div className="bg-white shadow-md rounded-lg overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Producto (SKU)</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider hidden md:table-cell">Categoría</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Stock</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider hidden sm:table-cell">Stock Mín.</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider hidden lg:table-cell">P. Compra</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">P. Venta</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProducts.map((product) => {
                const stockAlertThreshold = product.minStock || Math.max(1, Math.floor(product.stock * 0.1));
                const rowClass = product.stock === 0 ? 'bg-red-50 hover:bg-red-100' 
                                 : product.stock <= stockAlertThreshold ? 'bg-yellow-50 hover:bg-yellow-100' 
                                 : 'hover:bg-gray-50';
                const stockColor = product.stock === 0 ? 'text-red-600 font-bold' 
                                 : product.stock <= stockAlertThreshold ? 'text-yellow-600 font-semibold' 
                                 : 'text-green-600';

                return (
                <tr key={product.id} className={rowClass}>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{product.name}</div>
                    <div className="text-xs text-gray-500">SKU: {product.sku}</div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 hidden md:table-cell">{product.category || 'N/A'}</td>
                  <td className={`px-4 py-3 whitespace-nowrap text-right text-sm ${stockColor}`}>{product.stock} <span className="text-xs text-gray-500">{product.unit}</span></td>
                  <td className="px-4 py-3 whitespace-nowrap text-right text-sm text-gray-500 hidden sm:table-cell">{product.minStock || 5} <span className="text-xs">{product.unit}</span></td>
                  <td className="px-4 py-3 whitespace-nowrap text-right text-sm text-gray-500 hidden lg:table-cell">{DEFAULT_CURRENCY_SYMBOL}{product.purchasePrice.toFixed(2)}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-right text-sm text-gray-700 font-medium">{DEFAULT_CURRENCY_SYMBOL}{product.salePrice.toFixed(2)}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-center text-sm font-medium">
                    {canAdjustStock && (
                        <Button variant="ghost" size="sm" onClick={() => handleOpenStockModal(product)} title="Ajustar Stock" className="p-1 text-blue-600 hover:text-blue-800">
                            <ArrowsRightLeftIcon className="h-5 w-5"/>
                        </Button>
                    )}
                    {canEditProductDetails ? (
                        <Button variant="ghost" size="sm" onClick={() => handleOpenEditProductModal(product)} title="Editar Detalles del Producto" className="p-1 text-primary hover:text-primary-dark ml-1">
                            <PencilSquareIcon className="h-5 w-5"/>
                        </Button>
                    ) : ( // Allow view if no edit permission but has inventory view
                         <Button variant="ghost" size="sm" onClick={() => handleOpenEditProductModal(product)} title="Ver Detalles del Producto" className="p-1 text-gray-500 hover:text-primary-dark ml-1">
                            <EyeIcon className="h-5 w-5"/>
                        </Button>
                    )}
                  </td>
                </tr>
              )})}
            </tbody>
          </table>
        </div>
      )}
      {canAdjustStock && isStockModalOpen && productForStockAdjustment && (
        <StockAdjustmentModal
            isOpen={isStockModalOpen}
            onClose={handleCloseStockModal}
            onSubmit={handleStockAdjustmentSubmit}
            product={productForStockAdjustment}
            isLoading={formLoading}
        />
      )}
      {isProductModalOpen && editingProductDetails && ( 
        <ProductFormModal
            isOpen={isProductModalOpen}
            onClose={() => { setIsProductModalOpen(false); setEditingProductDetails(null);}}
            onSubmit={handleProductFormSubmit}
            editingProduct={editingProductDetails}
            isLoading={formLoading}
        />
      )}
    </div>
  );
};

export default InventoryPage;
