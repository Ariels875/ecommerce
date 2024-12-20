import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useTheme } from './ThemeContext';
import {  useCart } from './CartContext';
import ProductCard from './ProductCard';
import LoginModal from './LoginModal';
import { Navbar, Footer } from './Navbar';
import { Product } from './types';

const ResultsPage: React.FC = () => {
  const location = useLocation();
  const { addToCart } = useCart();
  const { theme } = useTheme();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  
  // Obtener resultados y término de búsqueda del estado de navegación
  const { searchTerm, results } = location.state as { 
    searchTerm: string, 
    results: Product[] 
  } || { 
    searchTerm: '', 
    results: [] 
  };

  return (
    <div className={`flex flex-col min-h-screen ${theme === 'dark' ? 'dark' : ''} bg-gray-100 dark:backdrop-blur-md dark:bg-black/30 dark:border dark:border-white/50 rounded-lg p-4 transition-colors duration-300`}>
    {/* Navigation bar */}
        <Navbar />
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
        <Footer />
        <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
    </div>
  );
};

export default ResultsPage;