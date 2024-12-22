import { Navbar } from './Navbar';
import AdminProduct from './AdminProduct';
import AdminCategory from './AdminCategory';
import { CategoryProvider } from './CategoryContext';
import { Package, Grid } from 'lucide-react';
import { useTheme } from './ThemeContext';
import { Tabs, TabsList, TabsTrigger } from '../Ui/Tabs';

const AdminPanel = () => {
  const { theme } = useTheme();

  return (
    <CategoryProvider>
          <div className={`min-h-screen w-full bg-gray-50 dark:backdrop-blur-md dark:bg-black/30 dark:border dark:border-white/50 flex flex-col ${theme === 'dark' ? 'dark' : ''}`}>
        <Navbar />

        <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-7xl">
        <div className="absolute -top-10 left-10 w-44 h-44 dark:bg-pink-500/30 blur-3xl rounded-full -z-20"></div>
        <div className="absolute bottom-20 left-50 w-44 h-44 dark:bg-red-500/30 blur-3xl rounded-full -z-20"></div>
        <div className="absolute top-20 right-10 w-44 h-44 dark:bg-yellow-500/30 blur-3xl rounded-full -z-20"></div>
        <div className="absolute -bottom-30 right-60 w-44 h-44 dark:bg-green-500/30 blur-3xl rounded-full -z-20"></div>
        <div className="absolute -bottom-10 right-1/4 w-44 h-44 dark:bg-purple-500/30 blur-3xl rounded-full -z-20"></div>
          <Tabs defaultValue="products" className="space-y-6">
            <TabsList>
              <TabsTrigger value="products" className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                Productos
              </TabsTrigger>
              <TabsTrigger value="categories" className="flex items-center gap-2">
                <Grid className="h-4 w-4" />
                Categorías
              </TabsTrigger>
            </TabsList>

            <AdminProduct />

            <AdminCategory />
          </Tabs>
        </main>
      </div>
    </CategoryProvider>

  );
};

export default AdminPanel;