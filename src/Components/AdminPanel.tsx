import { Navbar } from './Navbar';
import AdminProduct from './AdminProduct';
import AdminCategory from './AdminCategory';
import AdminUsers from './AdminUsers';
import { CategoryProvider } from './CategoryContext';
import { Package, Grid, Users, FileText } from 'lucide-react';
import { useTheme } from './ThemeContext';
import { Tabs, TabsList, TabsTrigger } from '../Ui/Tabs';

const AdminPanel = () => {
  const { theme } = useTheme();

  return (
    <CategoryProvider>
      <div className={`min-h-screen w-full bg-gray-50 dark:backdrop-blur-md dark:bg-black/30 dark:border dark:border-white/50 flex flex-col ${theme === 'dark' ? 'dark' : ''}`}>
        <Navbar />

        <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-7xl">
          {/* Efectos visuales de fondo */}
          <div className="absolute -top-10 left-10 w-44 h-44 dark:bg-pink-500/30 blur-3xl rounded-full -z-20"></div>
          <div className="absolute bottom-20 left-50 w-44 h-44 dark:bg-red-500/30 blur-3xl rounded-full -z-20"></div>
          <div className="absolute top-20 right-10 w-44 h-44 dark:bg-yellow-500/30 blur-3xl rounded-full -z-20"></div>
          <div className="absolute -bottom-30 right-60 w-44 h-44 dark:bg-green-500/30 blur-3xl rounded-full -z-20"></div>
          <div className="absolute -bottom-10 right-1/4 w-44 h-44 dark:bg-purple-500/30 blur-3xl rounded-full -z-20"></div>

          {/* Encabezado del panel */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Panel de Administración
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Control total del sistema - Gestiona productos, categorías, usuarios y auditoría
            </p>
          </div>

          <Tabs defaultValue="products" className="space-y-6">
            <TabsList className="grid grid-cols-4 w-full max-w-2xl">
              <TabsTrigger value="products" className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                Productos
              </TabsTrigger>
              <TabsTrigger value="categories" className="flex items-center gap-2">
                <Grid className="h-4 w-4" />
                Categorías
              </TabsTrigger>
              <TabsTrigger value="users" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Usuarios
              </TabsTrigger>
              <TabsTrigger value="audit" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Auditoría
              </TabsTrigger>
            </TabsList>

            {/* Gestión de productos */}
            <AdminProduct />

            {/* Gestión de categorías */}
            <AdminCategory />

            {/* Gestión de usuarios */}
            <AdminUsers />

            {/* Panel de auditoría embebido */}
            <div className="TabsContent" data-state={undefined} data-value="audit">
              <div className="p-6 bg-white dark:bg-gray-800 rounded-lg">
                <div className="text-center">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    Panel de Auditoría Avanzado
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    Para una experiencia completa de auditoría, accede al panel especializado.
                  </p>
                  <a
                    href="/auditor/panel"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Ir al Panel de Auditoría
                  </a>
                </div>
              </div>
            </div>
          </Tabs>
        </main>
      </div>
    </CategoryProvider>
  );
};

export default AdminPanel;