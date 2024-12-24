import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Product } from './types';
import ProductCard from './ProductCard';
import { useCart } from './CartContext';
import { Button } from '../Ui/Button';
import { useTheme } from './ThemeContext';
import LoginModal from './LoginModal';
import { CartProvider } from './CartContext';
import { Navbar, Footer } from './Navbar';
import { fetchProductDetails, fetchRelatedProducts } from '../api/products';


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
      className={`relative w-full h-96 bg-black ${className}`}
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
const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('');
  const { addToCart } = useCart();
  const { theme } = useTheme();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadProductData = async () => {
      if (!id) return;
      
      setIsLoading(true);
      try {
        const productData = await fetchProductDetails(id);
        
        if (productData) {
          setProduct(productData);
          
          // Establecer valores predeterminados
          if (productData.colors?.length > 0) {
            setSelectedColor(productData.colors[0]);
          }
          if (productData.sizes?.length > 0) {
            setSelectedSize(productData.sizes[0]);
          }

          // Cargar productos relacionados
          if (productData.category_id) {
            const relatedData = await fetchRelatedProducts(productData.category_id, id);
            setRelatedProducts(relatedData);
          }
        }
      } catch (error) {
        console.error("Error loading product:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProductData();
  }, [id]);

  const handleAddToCart = () => {
    if (product && selectedColor && selectedSize) {
      addToCart(product, selectedColor, selectedSize);
    }
  };

  const nextImage = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex + 1) % (product?.images.length || 1));
  };

  const prevImage = () => {
    setCurrentImageIndex((prevIndex) =>
      (prevIndex - 1 + (product?.images.length || 1)) % (product?.images.length || 1)
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!product) {
    return <div className="text-center text-gray-600">Cargando...</div>;
  }

  return (
    <div className={`flex flex-col min-h-screen ${theme === 'dark' ? 'dark' : ''} bg-gray-100 dark:backdrop-blur-md dark:bg-black/30 dark:border dark:border-white/50 rounded-lg p-4 transition-colors duration-300`}>
      {/* Navigation bar */}
      <Navbar />

      {/* Contenido del detalle del producto */}
      <div className="absolute -top-10 left-10 w-44 h-44 dark:bg-green-500/30 blur-3xl rounded-full -z-20"></div>
      <div className="absolute bottom-20 left-50 w-44 h-44 dark:bg-red-500/30 blur-3xl rounded-full -z-20"></div>
      <div className="absolute top-20 right-10 w-44 h-44 dark:bg-purple-500/30 blur-3xl rounded-full -z-20"></div>
      <div className="absolute -bottom-30 right-60 w-44 h-44 dark:bg-pink-500/30 blur-3xl rounded-full -z-20"></div>
      <div className="absolute -bottom-10 right-1/4 w-44 h-44 dark:bg-yellow-500/30 blur-3xl rounded-full -z-20"></div>
      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Galería de imágenes */}
          <div className="relative w-full md:w-1/2">
            <CenteredImage
              src={product.images[currentImageIndex]}
              alt={product.name}
              className="w-full h-96 object-cover rounded-lg"
            />
            <button
              onClick={prevImage}
              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white dark:text-white dark:bg-gray-800 bg-opacity-50 rounded-full p-1"
            >
              <ChevronLeft className="h-6 w-6 text-gray-800 dark:text-gray-200" />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white dark:text-white dark:bg-gray-800 bg-opacity-50 rounded-full p-1"
            >
              <ChevronRight className="h-6 w-6 text-gray-800 dark:text-gray-200" />
            </button>
          </div>

          {/* Detalles del producto */}
          <div className="w-full md:w-1/2">
            <h1 className="text-3xl font-bold mb-4 dark:text-white">{product.name}</h1>
            <p className="text-gray-700 dark:text-gray-300 mb-4">{product.description}</p>
            <p className="text-2xl font-semibold text-primary mb-2">Precio: ${product.price}</p>

            {/* Selección de colores */}
            {product.colors && product.colors.length > 0 && (
              <div className="mb-4">
                <label className="block text-gray-700 dark:text-gray-300 mb-2">Color:</label>
                <div className="flex space-x-2">
                  {product.colors.map((color) => (
                    <Button
                      key={color}
                      variant={selectedColor === color ? 'default' : 'outline'}
                      onClick={() => setSelectedColor(color)}
                      className="px-3 py-1"
                    >
                      {color}
                    </Button>
                  ))}
                </div>
              </div>
            )}
            <div className="absolute bottom-20 right-10 w-44 h-44 dark:bg-purple-500/30 blur-3xl rounded-full -z-20"></div>

            {/* Selección de talla */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="mb-4">
                <label className="block text-gray-700 dark:text-gray-300 mb-2">Talla:</label>
                <div className="flex space-x-2">
                  {product.sizes.map((size) => (
                    <Button
                      key={size}
                      variant={selectedSize === size ? 'default' : 'outline'}
                      onClick={() => setSelectedSize(size)}
                      className="px-3 py-1"
                    >
                      {size}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            <p className="text-gray-600 mb-4">Stock: {product.stock}</p>
            <Button
              onClick={handleAddToCart}
              disabled={!selectedColor || !selectedSize}
              className="w-full"
            >
              Añadir al carrito
            </Button>
          </div>
        </div>

        {/* Productos relacionados */}
        <div className="mt-12">
          <div className="absolute top-100 right-10 w-44 h-44 dark:bg-green-500/30 blur-2xl rounded-full -z-20"></div>
          <div className="absolute top-30 left-10 w-52 h-52 dark:bg-purple-500/30 blur-2xl rounded-full -z-20"></div>
          <h2 className="text-2xl font-bold mb-4 dark:text-white">Productos Relacionados</h2>
          {relatedProducts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <ProductCard
                  key={relatedProduct.id}
                  product={relatedProduct}
                  addToCart={addToCart}
                />
              ))}
            </div>
          ) : (
            <p className="text-gray-600 dark:text-gray-300">No hay productos relacionados.</p>
          )}
        </div>
      </main>

      {/* Footer */}
      <Footer />

      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
    </div>
  );
};

const ProductDetailWrapper: React.FC = () => {
  return (
    <CartProvider>
      <ProductDetail />
    </CartProvider>
  );
};

export default ProductDetailWrapper;