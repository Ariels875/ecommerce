import React from 'react';
import { Plus, Minus, X } from 'lucide-react';
import { Button } from '../Ui/Button';
import { CartItem as CartItemType } from './types';

interface CartItemProps {
  item: CartItemType;
  updateQuantity: (identifier: string, newQuantity: number) => void;
  removeFromCart: (identifier: string) => void;
}

const CartItem: React.FC<CartItemProps> = ({ item, updateQuantity, removeFromCart }) => {
  return (
    <div className="flex items-center justify-between py-4 border-b dark:border-gray-700">
      <div className="flex items-center">
        <img src={item.images[0]} alt={item.name} className="w-16 h-16 object-cover rounded mr-4" />
        <div>
          <h3 className="font-semibold dark:text-white">{item.name}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">${item.price.toFixed(2)}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Color: {item.selectedColor}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Talla: {item.selectedSize}</p>
        </div>
      </div>
      <div className="flex items-center">
        <Button
          variant="outline"
          size="icon"
          onClick={() => updateQuantity(item.identifier, item.quantity - 1)}
          disabled={item.quantity <= 1}
          className="transition-all duration-300 hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <Minus className="h-4 w-4" />
        </Button>
        <span className="mx-2 dark:text-white">{item.quantity}</span>
        <Button
          variant="outline"
          size="icon"
          onClick={() => updateQuantity(item.identifier, item.quantity + 1)}
          className="transition-all duration-300 hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <Plus className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className=" bg-zinc-200 ml-2 transition-all duration-300 hover:bg-red-100 dark:hover:bg-red-900"
          onClick={() => removeFromCart(item.identifier)}
        >
          <X className="h-4 w-4 dark:text-red-600" />
        </Button>
      </div>
    </div>
  );
};

export default CartItem;