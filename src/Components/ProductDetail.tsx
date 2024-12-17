import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ShoppingCart, User, Search, Sun, Moon } from 'lucide-react';
import { Product } from './types';
import ProductCard from './ProductCard';
import { useCart } from './CartContext';
import { Button } from '../Ui/Button';
import { Input } from '../Ui/Input';
import { Badge } from '../Ui/Badge';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '../Ui/Sheet';
import { useTheme } from './ThemeContext';
import LoginModal from './LoginModal';
import CartItem from './CartItem';
import { CartProvider } from './CartContext';

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('');
  const { addToCart, cart, updateQuantity, removeFromCart, totalItems, totalPrice } = useCart();
  const { theme, toggleTheme } = useTheme();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // Fetch del producto actual
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_DEV}/products/${id}`);
        const data = await response.json();
        setProduct(data);
        
        // Establecer color y talla predeterminados
        if (data.colors && data.colors.length > 0) {
          setSelectedColor(data.colors[0]);
        }
        if (data.sizes && data.sizes.length > 0) {
          setSelectedSize(data.sizes[0]);
        }

        // Llama a los productos relacionados por categoría
        if (data?.category_id) {
          fetchRelatedProducts(data.category_id);
        }
      } catch (error) {
        console.error("Error al cargar el producto:", error);
      }
    };

    const fetchRelatedProducts = async (categoryId: number) => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_DEV}/products?category_id=${categoryId}&exclude_id=${id}`
        );
        const data = await response.json();
        setRelatedProducts(data);
      } catch (error) {
        console.error("Error al cargar productos relacionados:", error);
      }
    };

    fetchProduct();
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

  if (!product) {
    return <div className="text-center text-gray-600">Cargando...</div>;
  }

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
                <User className="h-5 w-5 dark-text-white" />
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
                  <div className="mt-8 dark:text-white">
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
                        <span className="font-bold text-lg text-primary dark:text-white">
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
            <img
              src={product.images[currentImageIndex]}
              alt={product.name}
              className="w-full h-96 object-cover rounded-lg"
            />
            <button
              onClick={prevImage}
              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-gray-800 dark:text-white dark:bg-gray-800 bg-opacity-50 rounded-full p-1"
            >
              <ChevronLeft className="h-6 w-6 text-gray-800 dark:text-gray-200" />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gray-800 dark:text-white dark:bg-gray-800 bg-opacity-50 rounded-full p-1"
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
      <footer className="bg-gray-800 text-white dark:backdrop-blur-md dark:bg-black/30 dark:border dark:border-white/50 rounded-lg">
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

const ProductDetailWrapper: React.FC = () => {
  return (
    <CartProvider>
      <ProductDetail />
    </CartProvider>
  );
};

export default ProductDetailWrapper;