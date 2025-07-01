
import React from 'react';
import { CartItem } from '../../types';
import { DEFAULT_CURRENCY_SYMBOL } from '../../constants';
import Button from '../common/Button';
import { TrashIcon, PlusIcon, MinusIcon } from '@heroicons/react/24/outline';

interface CartItemCardProps {
  item: CartItem;
  onRemove: (productId: string) => void;
  onUpdateQuantity: (productId: string, newQuantity: number) => void;
}

const CartItemCard: React.FC<CartItemCardProps> = ({ item, onRemove, onUpdateQuantity }) => {
  const handleIncreaseQuantity = () => {
    onUpdateQuantity(item.product.id, item.quantity + 1);
  };

  const handleDecreaseQuantity = () => {
    if (item.quantity > 1) {
      onUpdateQuantity(item.product.id, item.quantity - 1);
    } else {
      onRemove(item.product.id); // Remove if quantity becomes 0 or less
    }
  };

  return (
    <div className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center space-x-4">
        <img 
            src={item.product.imageUrl || `https://picsum.photos/seed/${item.product.id}/100/100`} 
            alt={item.product.name} 
            className="w-16 h-16 object-cover rounded-md"
        />
        <div>
          <h4 className="text-md font-semibold text-gray-800">{item.product.name}</h4>
          <p className="text-sm text-gray-500">
            {DEFAULT_CURRENCY_SYMBOL}{item.unitPrice.toFixed(2)} x {item.quantity}
          </p>
        </div>
      </div>
      <div className="flex items-center space-x-3">
        <div className="flex items-center border border-gray-300 rounded-md">
            <Button variant="ghost" size="sm" onClick={handleDecreaseQuantity} className="px-2 py-1 !rounded-r-none border-r border-gray-300">
                <MinusIcon className="h-4 w-4" />
            </Button>
            <span className="px-3 text-sm font-medium">{item.quantity}</span>
            <Button variant="ghost" size="sm" onClick={handleIncreaseQuantity} className="px-2 py-1 !rounded-l-none border-l border-gray-300">
                <PlusIcon className="h-4 w-4" />
            </Button>
        </div>
        <p className="text-md font-semibold text-primary w-24 text-right">
          {DEFAULT_CURRENCY_SYMBOL}{item.subtotal.toFixed(2)}
        </p>
        <Button variant="danger" size="sm" onClick={() => onRemove(item.product.id)} className="p-2">
          <TrashIcon className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default CartItemCard;
