
import React, { useEffect, useState, useCallback } from 'react';
import { Product, UserRole, ProductFormData, Permission } from '../../types';
import { fetchProducts, addProduct, updateProduct, deleteProduct } from '../../services/apiService';
import ProductCard from './ProductCard';
import ProductFormModal from './ProductFormModal';
import Spinner from '../common/Spinner';
import Input from '../common/Input';
import { MagnifyingGlassIcon, PlusCircleIcon, ArchiveBoxIcon } from '@heroicons/react/24/outline';
import Button from '../common/Button';
import { useAuth } from '../../hooks/useAuth';


const ProductListPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [formLoading, setFormLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  const { currentUser, hasPermission } = useAuth();

  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedProducts = await fetchProducts();
      setProducts(fetchedProducts);
      setFilteredProducts(fetchedProducts);
    } catch (err: any) {
      setError(err.message || 'Error al cargar los productos.');
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

  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (product: Product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  const handleProductFormSubmit = async (productData: ProductFormData) => {
    setFormLoading(true);
    setError(null);
    try {
      if (editingProduct && productData.id) {
        if (!hasPermission(Permission.EDIT_PRODUCT)) {
          throw new Error("No tiene permisos para editar productos.");
        }
        await updateProduct(productData);
        alert('Producto actualizado con éxito.');
      } else {
        if (!hasPermission(Permission.CREATE_PRODUCT)) {
          throw new Error("No tiene permisos para crear productos.");
        }
        await addProduct(productData);
        alert('Producto añadido con éxito.');
      }
      handleCloseModal();
      await loadProducts(); // Refresh list
    } catch (err: any) {
      setError(err.message || 'Error al guardar el producto.');
      alert(`Error al guardar el producto: ${err.message}`);
    } finally {
      setFormLoading(false);
    }
  };
  
  const handleDeleteProduct = async (product: Product) => {
    if (!hasPermission(Permission.DELETE_PRODUCT)) {
      alert("No tiene permisos para eliminar productos.");
      return;
    }
    if (window.confirm(`¿Está seguro de que desea eliminar el producto "${product.name}"? Esta acción no se puede deshacer.`)) {
      setLoading(true); // Indicate general loading as product list will refresh
      setError(null);
      try {
        await deleteProduct(product.id);
        alert('Producto eliminado con éxito.');
        await loadProducts(); // Refresh list
      } catch (err: any) {
        setError(err.message || 'Error al eliminar el producto.');
        alert(`Error al eliminar el producto: ${err.message}`);
        setLoading(false); // Stop loading if error occurred before refresh
      }
      // setLoading(false) will be handled by loadProducts' finally block if successful
    }
  };

  const handleAddToCart = (product: Product) => {
    if (!hasPermission(Permission.ADD_PRODUCT_TO_CART)) {
      alert("No tiene permisos para añadir productos al carrito.");
      return;
    }
    // This would typically interact with a global cart state or context
    console.log(`Producto añadido al carrito: ${product.name}`);
    alert(`${product.name} añadido al carrito (simulado). Ve a la página de Ventas.`);
    // Consider navigating or adding to a shared cart state
  };
  
  if (loading && products.length === 0) { // Show spinner only on initial load or full reload
    return <div className="flex justify-center items-center h-64"><Spinner size="lg" /></div>;
  }

  if (error && products.length === 0) { // Show error if initial load failed
    return <div className="text-center text-red-500 p-4 bg-red-50 rounded-md shadow">{error}</div>;
  }

  const canCreateProducts = hasPermission(Permission.CREATE_PRODUCT);
  const canEditProducts = hasPermission(Permission.EDIT_PRODUCT);
  const canDeleteProducts = hasPermission(Permission.DELETE_PRODUCT);
  const showAdminActions = canEditProducts || canDeleteProducts;


  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold text-neutral-dark flex items-center">
            <ArchiveBoxIcon className="h-8 w-8 mr-3 text-primary"/>Catálogo de Productos
        </h1>
        {canCreateProducts && (
            <Button onClick={handleOpenAddModal} leftIcon={<PlusCircleIcon className="h-5 w-5"/>}>
                Añadir Producto
            </Button>
        )}
      </div>
      
      <div className="mb-8 p-4 bg-white shadow rounded-lg">
        <Input
          type="text"
          placeholder="Buscar productos por nombre, SKU o categoría..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          icon={<MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />}
          containerClassName="mb-0"
        />
      </div>
      
      {error && <div className="mb-4 text-center text-red-500 p-3 bg-red-50 rounded-md shadow-sm">{error}</div>}


      {loading && products.length > 0 && <div className="flex justify-center my-4"><Spinner size="md" /></div>}


      {filteredProducts.length === 0 && !loading && (
        <div className="text-center text-gray-500 py-10 bg-white rounded-lg shadow">
          <ArchiveBoxIcon className="h-16 w-16 mx-auto text-gray-400 mb-4" />
          <p className="text-xl">No se encontraron productos.</p>
          {searchTerm && <p className="text-sm">Intenta con otros términos de búsqueda.</p>}
           {!searchTerm && !canCreateProducts && <p className="text-sm">No hay productos disponibles actualmente.</p>}
           {!searchTerm && canCreateProducts && <p className="text-sm">Puedes empezar añadiendo un nuevo producto.</p>}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredProducts.map((product) => (
          <ProductCard 
            key={product.id} 
            product={product} 
            onAddToCart={handleAddToCart}
            onEdit={canEditProducts ? () => handleOpenEditModal(product) : undefined}
            onDelete={canDeleteProducts ? () => handleDeleteProduct(product) : undefined}
            showAdminActions={showAdminActions}
          />
        ))}
      </div>
      { (canCreateProducts || canEditProducts) && isModalOpen && (
        <ProductFormModal
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            onSubmit={handleProductFormSubmit}
            editingProduct={editingProduct}
            isLoading={formLoading}
        />
      )}
    </div>
  );
};

export default ProductListPage;
