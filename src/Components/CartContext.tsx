import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { Product, CartItem } from './types';

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, color: string, size: string) => void;
  updateQuantity: (identifier: string, newQuantity: number) => void;
  removeFromCart: (identifier: string) => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);
 
const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>(() => {
    const storedCart = localStorage.getItem('cart');
    return storedCart ? JSON.parse(storedCart) : [];
  });

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product: Product, color: string, size: string) => {
    setCart((prevCart) => {
      const identifier = `${product.id}-${color}-${size}`;
      const existingItem = prevCart.find((item) => item.identifier === identifier);
      
      if (existingItem) {
        return prevCart.map((item) =>
          item.identifier === identifier
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      
      return [
        ...prevCart,
        { ...product, quantity: 1, selectedColor: color, selectedSize: size, identifier }
      ];
    });
  };

  const updateQuantity = (identifier: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.identifier === identifier ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const removeFromCart = (identifier: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.identifier !== identifier));
  };

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <CartContext.Provider 
      value={{ 
        cart, 
        addToCart, 
        updateQuantity, 
        removeFromCart, 
        totalItems, 
        totalPrice 
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export { CartProvider, useCart };