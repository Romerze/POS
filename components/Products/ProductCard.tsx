import React from 'react';
import { Product } from '../../types';
import { DEFAULT_CURRENCY_SYMBOL } from '../../constants';
import Button from '../common/Button';
import { ShoppingCartIcon, PencilSquareIcon, TrashIcon, ClockIcon } from '@heroicons/react/24/outline';

interface ProductCardProps {
  product: Product;
  onAddToCart?: (product: Product) => void;
  onEdit?: (product: Product) => void;
  onDelete?: (product: Product) => void;
  showAdminActions?: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart, onEdit, onDelete, showAdminActions = false }) => {
  const stockAlertThreshold = product.minStock || Math.max(1, Math.floor(product.stock * 0.1)); // Default minStock or 10% if not set
  const stockColor = product.stock > stockAlertThreshold ? 'text-green-600' : product.stock > 0 ? 'text-yellow-600' : 'text-red-600';
  const stockText = product.stock > 0 ? `${product.stock} en stock` : 'Agotado';

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click if actions are on card
    onEdit?.(product);
  };
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete?.(product);
  };
   const handleAddToCartClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToCart?.(product);
  };

  return (
    <div className="bg-white shadow-lg rounded-xl overflow-hidden flex flex-col transition-all duration-300 hover:shadow-2xl group">
      <div className="relative h-48 w-full overflow-hidden">
        <img 
            src={product.imageUrl || `https://picsum.photos/seed/${product.id}/400/300`} 
            alt={product.name} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
        />
        {product.stock === 0 && (
             <div className="absolute top-2 right-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-full shadow">
                AGOTADO
            </div>
        )}
        {product.stock > 0 && product.stock <= stockAlertThreshold && (
            <div className="absolute top-2 right-2 bg-yellow-500 text-neutral-dark text-xs font-bold px-2 py-1 rounded-full shadow">
                STOCK BAJO
            </div>
        )}
      </div>
      
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="text-md font-semibold text-neutral-dark group-hover:text-primary transition-colors truncate mb-1" title={product.name}>
          {product.name}
        </h3>
        <p className="text-xs text-gray-400 mb-1 uppercase tracking-wider">{product.category || 'Sin Categoría'} - SKU: {product.sku}</p>
        <p className="text-sm text-gray-600 mb-3 line-clamp-2 min-h-[2.5rem] flex-grow">
          {product.description || 'Descripción no disponible.'}
        </p>

        <div className="mt-auto">
          <div className="flex justify-between items-center mb-3">
            <p className="text-xl font-bold text-primary">
              {DEFAULT_CURRENCY_SYMBOL}{product.salePrice.toFixed(2)}
            </p>
            <p className={`text-sm font-semibold ${stockColor}`}>{stockText}</p>
          </div>
          
          {product.lastUpdated && (
            <p className="text-xs text-gray-400 mb-3 flex items-center">
                <ClockIcon className="h-3 w-3 mr-1"/> Actualizado: {new Date(product.lastUpdated).toLocaleDateString()}
            </p>
          )}

          {onAddToCart && (
            <Button 
              onClick={handleAddToCartClick}
              className="w-full" 
              disabled={product.stock === 0}
              leftIcon={<ShoppingCartIcon className="h-5 w-5" />}
            >
              {product.stock === 0 ? 'Agotado' : 'Añadir al Carrito'}
            </Button>
          )}
          
          {showAdminActions && onEdit && onDelete && (
            <div className="mt-3 flex space-x-2">
              <Button onClick={handleEdit} variant="outline" size="sm" className="flex-1" leftIcon={<PencilSquareIcon className="h-4 w-4" />}>
                Editar
              </Button>
              <Button onClick={handleDelete} variant="danger" size="sm" className="flex-1" leftIcon={<TrashIcon className="h-4 w-4" />}>
                Eliminar
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
