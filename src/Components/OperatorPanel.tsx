import { Navbar } from './Navbar';
import AdminProduct from './AdminProduct';
import AdminCategory from './AdminCategory';
import OperatorSales from './OperatorSales';
import { CategoryProvider } from './CategoryContext';
import { Package, Grid, ShoppingBag } from 'lucide-react';
import { useTheme } from './ThemeContext';
import { Tabs, TabsList, TabsTrigger } from '../Ui/Tabs';

const OperatorPanel = () => {
  const { theme } = useTheme();

  return (
    <CategoryProvider>
      <div className={`min-h-screen w-full bg-gray-50 dark:backdrop-blur-md dark:bg-black/30 dark:border dark:border-white/50 flex flex-col ${theme === 'dark' ? 'dark' : ''}`}>
        <Navbar />

        <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-7xl">
          {/* Efectos visuales de fondo */}
          <div className="absolute -top-10 left-10 w-44 h-44 dark:bg-blue-500/30 blur-3xl rounded-full -z-20"></div>
          <div className="absolute bottom-20 left-50 w-44 h-44 dark:bg-cyan-500/30 blur-3xl rounded-full -z-20"></div>
          <div className="absolute top-20 right-10 w-44 h-44 dark:bg-teal-500/30 blur-3xl rounded-full -z-20"></div>
          <div className="absolute -bottom-30 right-60 w-44 h-44 dark:bg-indigo-500/30 blur-3xl rounded-full -z-20"></div>
          <div className="absolute -bottom-10 right-1/4 w-44 h-44 dark:bg-purple-500/30 blur-3xl rounded-full -z-20"></div>

          {/* Encabezado del panel */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Panel de Operador
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Gestiona productos, categorías y ventas del sistema
            </p>
          </div>

          <Tabs defaultValue="products" className="space-y-6">
            <TabsList className="grid grid-cols-3 w-full max-w-md">
              <TabsTrigger value="products" className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                Productos
              </TabsTrigger>
              <TabsTrigger value="categories" className="flex items-center gap-2">
                <Grid className="h-4 w-4" />
                Categorías
              </TabsTrigger>
              <TabsTrigger value="sales" className="flex items-center gap-2">
                <ShoppingBag className="h-4 w-4" />
                Ventas
              </TabsTrigger>
            </TabsList>

            {/* Componente de productos reutilizado */}
            <AdminProduct />

            {/* Componente de categorías reutilizado */}
            <AdminCategory />

            {/* Componente de ventas específico para operadores */}
            <OperatorSales />
          </Tabs>
        </main>
      </div>
    </CategoryProvider>
  );
};

export default OperatorPanel;