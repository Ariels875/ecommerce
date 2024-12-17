import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, User, Search, Sun, Moon } from 'lucide-react';
import { Button } from '../Ui/Button';
import { Input } from '../Ui/Input';
import { Badge } from '../Ui/Badge';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '../Ui/Sheet';
import { useTheme } from './ThemeContext';
import { CartProvider, useCart } from './CartContext';
import ProductCard from './ProductCard';
import CartItem from './CartItem';
import LoginModal from './LoginModal';
import { Product, fetchProducts } from './types';

const AppWithThemeContent: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { theme, toggleTheme } = useTheme();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const { cart, updateQuantity, removeFromCart, totalItems, totalPrice, addToCart } = useCart();

  useEffect(() => {
    const loadProducts = async () => {
      const fetchedProducts = await fetchProducts();
      setProducts(fetchedProducts);
      setLoading(false);
    };
    loadProducts();
  }, []);

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
                <Input type="search" placeholder="Buscar productos..." className="w-64" />
              </div>
              <Button variant="ghost" size="icon" className="transition-colors duration-300 bg-white hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700">
                <Search className="h-5 w-5 dark:text-white" />
                <span className="sr-only">Buscar</span>
              </Button>
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

      {/* Main content */}
      <div className="absolute -top-10 left-10 w-44 h-44 dark:bg-pink-500/30 blur-3xl rounded-full -z-20"></div>
      <div className="absolute bottom-20 left-50 w-44 h-44 dark:bg-red-500/30 blur-3xl rounded-full -z-20"></div>
      <div className="absolute top-20 right-10 w-44 h-44 dark:bg-yellow-500/30 blur-3xl rounded-full -z-20"></div>
      <div className="absolute -bottom-30 right-60 w-44 h-44 dark:bg-green-500/30 blur-3xl rounded-full -z-20"></div>
      <div className="absolute -bottom-10 right-1/4 w-44 h-44 dark:bg-purple-500/30 blur-3xl rounded-full -z-20"></div>

      <main className="flex-grow container mx-auto px-4 py-8">
        <h2 className="text-3xl font-semibold mb-6 dark:text-white">Productos Destacados</h2>
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard 
                key={product.id} 
                product={product} 
                addToCart={addToCart} 
              />
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white dark:backdrop-blur-md dark:bg-black/30 dark:border dark:border-white/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">Acerca de nosotros</h3>
              <p className="text-gray-400">Somos una tienda en línea comprometida con ofrecer los mejores productos a nuestros clientes.</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Enlaces rápidos</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors duration-300">Inicio</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors duration-300">Productos</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors duration-300">Sobre nosotros</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors duration-300">Contacto</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Contáctanos</h3>
              <p className="text-gray-400">Email: info@mitienda.com</p>
              <p className="text-gray-400">Teléfono: (123) 456-7890</p>
            </div>
          </div>
          <div className="mt-8 border-t border-gray-700 pt-8 text-center">
            <p className="text-gray-400">&copy; 2024 MiTienda. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
    </div>
  );
};

const AppWithTheme: React.FC = () => {
  return (
    <CartProvider>
      <AppWithThemeContent />
    </CartProvider>
  );
};

export default AppWithTheme;