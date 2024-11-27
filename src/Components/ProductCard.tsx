import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../Ui/Button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../Ui/Select';
import { Product } from './types';

interface ProductCardProps {
  product: Product;
  addToCart: (product: Product, color: string, size: string) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, addToCart }: { product: Product; addToCart: (product: Product, color: string, size: string) => void }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState(product.colors[0])
  const [selectedSize, setSelectedSize] = useState(product.sizes[0])

  const nextImage = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex + 1) % product.images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex - 1 + product.images.length) % product.images.length);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
      <div className="relative">
        <img
          src={product.images[currentImageIndex]}
          alt={`${product.name} - Imagen ${currentImageIndex + 1}`}
          className="w-full h-48 object-cover"
        />
        <button
          onClick={prevImage}
          className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white dark:bg-gray-800 bg-opacity-50 rounded-full p-1"
          aria-label="Imagen anterior"
        >
          <ChevronLeft className="h-6 w-6 text-gray-800 dark:text-gray-200" />
        </button>
        <button
          onClick={nextImage}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white dark:bg-gray-800 bg-opacity-50 rounded-full p-1"
          aria-label="Imagen siguiente"
        >
          <ChevronRight className="h-6 w-6 text-gray-800 dark:text-gray-200" />
        </button>
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-2 dark:text-white">{product.name}</h3>
        <p className="text-gray-600 dark:text-gray-300 mb-2">{product.description}</p>
        <div className="flex justify-between items-center mb-2">
          <span className="text-xl font-bold text-primary dark:text-primary-foreground">${product.price.toFixed(2)}</span>
          <span className="text-sm text-gray-500 dark:text-gray-400">Stock: {product.stock}</span>
        </div>
        <div className="mb-2">
          <Select value={selectedColor} onValueChange={setSelectedColor}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecciona un color" />
            </SelectTrigger>
            <SelectContent>
              {product.colors.map((color) => (
                <SelectItem key={color} value={color}>
                  {color}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="mb-4">
          <Select value={selectedSize} onValueChange={setSelectedSize}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecciona una talla" />
            </SelectTrigger>
            <SelectContent>
              {product.sizes.map((size) => (
                <SelectItem key={size} value={size}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={() => addToCart(product, selectedColor, selectedSize)} className="w-full">
          Añadir al carrito
        </Button>
      </div>
    </div>
  )
}

export default ProductCard;