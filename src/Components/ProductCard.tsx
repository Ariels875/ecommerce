import React, { useState, useEffect, useRef } from 'react';
// import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
// import { Button } from '../Ui/Button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../Ui/Select';
import { Product } from './types';

// Función de utilidad para truncar texto
const truncateText = (text: string, maxLength: number) => {
  return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
};

// Componente de imagen personalizado para manejo de dimensiones
const CenteredImage = ({ src, alt, className }: { src: string, alt: string, className?: string }) => {
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleImageLoad = () => {
      if (!imageRef.current || !containerRef.current) return;

      const img = imageRef.current;
      const container = containerRef.current;

      // Obtener dimensiones del contenedor y de la imagen
      const containerWidth = container.clientWidth;
      const containerHeight = container.clientHeight;
      
      // Calcular escala y posicionamiento
      const imgWidth = img.naturalWidth;
      const imgHeight = img.naturalHeight;

      // Calcular el modo de ajuste
      const widthRatio = containerWidth / imgWidth;
      const heightRatio = containerHeight / imgHeight;
      const scale = Math.min(widthRatio, heightRatio);

      const scaledWidth = imgWidth * scale;
      const scaledHeight = imgHeight * scale;

      // Calcular posiciones para centrar
      const marginLeft = (containerWidth - scaledWidth) / 2;
      const marginTop = (containerHeight - scaledHeight) / 2;

      // Aplicar estilos
      img.style.position = 'absolute';
      img.style.left = `${marginLeft}px`;
      img.style.top = `${marginTop}px`;
      img.style.width = `${scaledWidth}px`;
      img.style.height = `${scaledHeight}px`;
      img.style.objectFit = 'contain';
    };

    const imgElement = imageRef.current;
    if (imgElement) {
      // Si la imagen ya está cargada
      if (imgElement.complete) {
        handleImageLoad();
      } else {
        // Esperar a que la imagen se cargue
        imgElement.addEventListener('load', handleImageLoad);
        return () => {
          imgElement.removeEventListener('load', handleImageLoad);
        };
      }
    }
  }, [src]);

  return (
    <div 
      ref={containerRef} 
      className={`relative w-full h-48 bg-black ${className}`}
    >
      <img
        ref={imageRef}
        src={src}
        alt={alt}
        className="absolute inset-0 max-w-full max-h-full"
      />
    </div>
  );
};

interface ProductCardProps {
  product: Product;
  addToCart: (product: Product, color: string, size: string) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, addToCart }: { product: Product; addToCart: (product: Product, color: string, size: string) => void }) => {
  // const navigate = useNavigate();
  // const handleCardClick = () => {
  //   navigate(`/products/${product.id}`);
  // }
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
    <div className="bg-white dark:backdrop-blur-md dark:bg-black/30 dark:border dark:border-white/50 rounded-lg shadow-md overflow-hidden">
      <div className="relative">
        <div 
        // onClick={handleCardClick}
        >
          <CenteredImage
            src={product.images[currentImageIndex]}
            alt={`${product.name} - Imagen ${currentImageIndex + 1}`}
            className="w-full h-48 object-cover"
          />
        </div>
        {product.images.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-whitedark:backdrop-blur-md bg-white dark:bg-black/30 dark:border dark:border-white/50 bg-opacity-50 rounded-full p-1"
              aria-label="Imagen anterior"
            >
              <ChevronLeft className="h-6 w-6 text-gray-800 dark:text-gray-200" />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-whitedark:backdrop-blur-md bg-white dark:bg-black/30 dark:border dark:border-white/50 bg-opacity-50 rounded-full p-1"
              aria-label="Imagen siguiente"
            >
              <ChevronRight className="h-6 w-6 text-gray-800 dark:text-gray-200" />
            </button>
          </>
        )}
      </div>
      {/* Resto del código permanece igual */}
      <div className="p-4">
        <h3 
          className="text-lg font-semibold mb-2 dark:text-white truncate" 
          // onClick={handleCardClick}
        >
          {truncateText(product.name, 30)}
        </h3>
        <p 
          className="text-gray-600 dark:text-gray-300 mb-2 line-clamp-2" 
          // onClick={handleCardClick}
        >
          {truncateText(product.description, 60)}
        </p>
        <div className="flex justify-between items-center mb-2">
          <span className="text-xl font-bold text-primary dark:text-white dark:text-primary-foreground" 
          // onClick={handleCardClick}
          >${product.price.toFixed(2)}</span>
          <span className="text-sm text-gray-500 dark:text-gray-400" 
          // onClick={handleCardClick}
          >Stock: {product.stock}</span>
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
        {/* <Button onClick={() => addToCart(product, selectedColor, selectedSize)} className="w-full">
          Añadir al carrito
        </Button> */}
      </div>
    </div>
  )
}

export default ProductCard;