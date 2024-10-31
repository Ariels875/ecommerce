// ProductCard.tsx
import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './Ui/Button';
import { Product } from './types';

interface ProductCardProps {
  product: Product;
  addToCart: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, addToCart }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const nextImage = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex + 1) % product.images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex - 1 + product.images.length) % product.images.length);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl">
      <div className="relative aspect-w-3 aspect-h-2">
        <img
          src={product.images[currentImageIndex]}
          alt={`${product.name} - Imagen ${currentImageIndex + 1}`}
          className="w-full h-full object-cover"
        />
        <button
          onClick={prevImage}
          className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white dark:bg-gray-800 bg-opacity-50 rounded-full p-1 transition-all duration-300 hover:bg-opacity-75"
          aria-label="Imagen anterior"
        >
          <ChevronLeft className="h-6 w-6 text-gray-800 dark:text-gray-200" />
        </button>
        <button
          onClick={nextImage}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white dark:bg-gray-800 bg-opacity-50 rounded-full p-1 transition-all duration-300 hover:bg-opacity-75"
          aria-label="Imagen siguiente"
        >
          <ChevronRight className="h-6 w-6 text-gray-800 dark:text-gray-200" />
        </button>
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-2 dark:text-white">{product.name}</h3>
        <p className="text-gray-600 dark:text-gray-300 mb-2">{product.description}</p>
        <div className="flex justify-between items-center">
          <span className="text-xl font-bold text-primary dark:text-primary-foreground">${product.price.toFixed(2)}</span>
          <Button onClick={() => addToCart(product)} className="transition-all duration-300 hover:scale-105">
            Añadir al carrito
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;