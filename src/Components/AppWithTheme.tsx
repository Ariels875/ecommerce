import React, { useState, useEffect } from 'react';
import { useTheme } from './ThemeContext';
import { CartProvider, useCart } from './CartContext';
import ProductCard from './ProductCard';
import LoginModal from './LoginModal';
import { Product } from './types';
import { fetchProducts } from '../api/products';
import { Navbar, Footer } from './Navbar';

const AppWithThemeContent: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { theme } = useTheme();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const { addToCart } = useCart();

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
      <Navbar />

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
      <Footer />
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