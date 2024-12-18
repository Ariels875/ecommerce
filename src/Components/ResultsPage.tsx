import React, { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { ShoppingCart, User, Sun, Moon } from 'lucide-react';
import { Button } from '../Ui/Button';
import { Badge } from '../Ui/Badge';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '../Ui/Sheet';
import { useTheme } from './ThemeContext';
import {  useCart } from './CartContext';
import ProductCard from './ProductCard';
import CartItem from './CartItem';
import LoginModal from './LoginModal';
import { SearchProducts } from './SearchProducts';

const ResultsPage: React.FC = () => {
  const location = useLocation();
  const { addToCart, cart, updateQuantity, removeFromCart, totalItems, totalPrice } = useCart();
  const { theme, toggleTheme } = useTheme();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  
  // Obtener resultados y término de búsqueda del estado de navegación
  const { searchTerm, results } = location.state || { 
    searchTerm: '', 
    results: [] 
  };

  return (
    <div className={`flex flex-col min-h-screen ${theme === 'dark' ? 'dark' : ''} bg-gray-100 dark:backdrop-blur-md dark:bg-black/30 dark:border dark:border-white/50 rounded-lg p-4 transition-colors duration-300`}>
    {/* Navigation bar */}
        <nav className="bg-white dark:backdrop-blur-md dark:bg-black/30 dark:border dark:border-white/50 rounded-lg p-4 shadow-md sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
            <div className="flex items-center">
                <Link className="text-2xl italic font-bold text-primary dark:text-primary-foreground dark:text-white" to="/">Ariels Store</Link>
            </div>
            <div className="flex items-center space-x-4">
                <div className="hidden sm:block">
                <SearchProducts/>
                </div>
                <Button 
                variant="ghost" 
                size="icon" 
                className="transition-colors duration-300 bg-white hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700"
                onClick={() => setIsLoginModalOpen(true)}
                >
                <User className="h-5 w-5 dark:text-white" />
                <span className="sr-only">Cuenta</span>
                </Button>
                <Sheet>
                <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="relative transition-colors duration-300 bg-white hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700">
                    <ShoppingCart className="h-5 w-5 dark:text-white" />
                    <span className="sr-only">Carrito</span>
                    {totalItems > 0 && (
                        <Badge variant="destructive" className="absolute -top-2 -right-2 px-2 py-1 text-xs bg-red-600 text-white">
                        {totalItems}
                        </Badge>
                    )}
                    </Button>
                </SheetTrigger>
                <SheetContent>
                    <SheetHeader>
                    <SheetTitle>Carrito de Compras</SheetTitle>
                    <SheetDescription>
                        {cart.length === 0 ? (
                        "Tu carrito está vacío"
                        ) : (
                        `${totalItems} ${totalItems === 1 ? 'artículo' : 'artículos'} en tu carrito`
                        )}
                    </SheetDescription>
                    </SheetHeader>
                    <div className="mt-8">
                    {cart.map((item) => (
                        <CartItem
                        key={`${item.id}-${item.selectedColor}-${item.selectedSize}`}
                        item={item}
                        updateQuantity={updateQuantity}
                        removeFromCart={removeFromCart}
                        />
                    ))}
                    </div>
                    {cart.length > 0 && (
                    <div className="mt-4">
                        <div className="flex justify-between items-center mb-4">
                        <span className="font-semibold dark:text-white">Total:</span>
                        <span className="font-bold text-lg text-primary dark:text-primary-foreground">
                            ${totalPrice.toFixed(2)}
                        </span>
                        </div>
                        <Button className="w-full">Proceder al pago</Button>
                    </div>
                    )}
                </SheetContent>
                </Sheet>
                <Button 
                variant="ghost" 
                size="icon" 
                onClick={toggleTheme} 
                className="transition-colors duration-300 bg-white hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-cyan-600"
                >
                {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                <span className="sr-only">Cambiar tema</span>
                </Button>
            </div>
            </div>
        </div>
        </nav>
        <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6 dark:text-white">
            Resultados de búsqueda para: "{searchTerm}"
        </h1>
        {results.length === 0 ? (
            <p className="text-gray-600 dark:text-gray-300">
            No se encontraron productos.
            </p>
        ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {results.map((product) => (
                <ProductCard 
                key={product.id} 
                product={product} 
                addToCart={addToCart} 
                />
            ))}
            </div>
        )}
        </div>
        <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
    </div>
  );
};

export default ResultsPage;