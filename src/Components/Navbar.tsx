// Navbar.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Sun, Moon } from 'lucide-react';
import { Button } from '../Ui/Button';
import { Badge } from '../Ui/Badge';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '../Ui/Sheet';
import { useTheme } from './ThemeContext';
import { useCart } from './CartContext';
import CartItem from './CartItem';
import { SearchProducts } from './SearchProducts';
import UserDropdown from './UserDropdown';

const Navbar: React.FC = () => {
  const { cart, updateQuantity, removeFromCart, totalItems, totalPrice } = useCart();
  const { theme, toggleTheme } = useTheme();

  return (
    <nav className="bg-white dark:backdrop-blur-md dark:bg-black/30 dark:border dark:border-white/50 rounded-lg p-4 shadow-md sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link className="text-2xl italic font-bold text-primary dark:text-primary-foreground dark:text-white" to="/">
              Ariels Store
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <div className="hidden sm:block">
              <SearchProducts />
            </div>
            <UserDropdown />
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
                    {cart.length === 0
                      ? "Tu carrito está vacío"
                      : `${totalItems} ${totalItems === 1 ? 'artículo' : 'artículos'} en tu carrito`}
                  </SheetDescription>
                </SheetHeader>
                <div className="mt-8 dark:text-white">
                  {cart.map((item) => (
                    <CartItem
                      key={`${item.identifier}-${item.selectedColor}-${item.selectedSize}`}
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
                      <span className="font-bold text-lg text-primary dark:text-primary-foreground dark:text-white">
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
  );
};

// Footer.tsx
const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-800 text-white dark:backdrop-blur-md dark:bg-black/30 dark:border dark:border-white/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grentifier grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">Acerca de nosotros</h3>
            <p className="text-gray-400">
              Somos una tienda en línea comprometida con ofrecer los mejores productos a nuestros clientes.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Enlaces rápidos</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-400 hover:text-white transition-colors duration-300">
                  Inicio
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-400 hover:text-white transition-colors duration-300">
                  Sobre mi
                </Link>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors duration-300">
                  WhatsApp
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Contáctanos</h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="mailto:ascastro875@gmail.com"
                  className="text-gray-400 hover:text-white transition-colors duration-300"
                >
                  Email: ascastro875@gmail.com
                </a>
              </li>
              <li>
                <a
                  href="tel:+593990518579"
                  className="text-gray-400 hover:text-white transition-colors duration-300"
                >
                  Teléfono: +593990518579
                </a>
              </li>
              <li>
                <a href="https://www.linkedin.com/in/ariels875/" className="text-gray-400 hover:text-white transition-colors duration-300">
                  Linkedin: @ariels875
                </a>
              </li>
              <li>
                <a href="https://github.com/Ariels875" className="text-gray-400 hover:text-white transition-colors duration-300">
                  GitHub: @ariels875
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-gray-700 pt-8 text-center">
          <p className="text-gray-400">&copy; 2024 Ariels Store. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
};

export { Navbar, Footer };