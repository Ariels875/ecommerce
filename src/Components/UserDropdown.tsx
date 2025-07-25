import React, { Fragment } from 'react';
import { Menu, Transition, MenuItem, MenuItems, MenuButton } from '@headlessui/react';
import { Button } from '../Ui/Button';
import { User, Shield, Settings, Eye, BarChart, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import LoginModal from './LoginModal';

const UserDropdown = () => {
  const [isLoginModalOpen, setIsLoginModalOpen] = React.useState(false);
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const handlePanelNavigation = (panelType: string) => {
    switch (panelType) {
      case 'admin':
        navigate('/admin/panel');
        break;
      case 'operator':
        navigate('/operator/panel');
        break;
      case 'auditor':
        navigate('/auditor/panel');
        break;
      case 'diagnostic':
        navigate('/system/diagnostic');
        break;
      default:
        navigate('/');
    }
  };

  const handleLoginClick = () => {
    setIsLoginModalOpen(true);
  };

  const getPanelOptions = () => {
    if (!user) return [];

    const options = [];

    switch (user.rol) {
      case 'administrador':
        options.push(
          {
            label: 'Panel de Administrador',
            icon: Shield,
            action: () => handlePanelNavigation('admin'),
            description: 'Control total del sistema'
          },
          {
            label: 'Panel de Operador',
            icon: Settings,
            action: () => handlePanelNavigation('operator'),
            description: 'Gestión de productos y ventas'
          },
          {
            label: 'Panel de Auditoría',
            icon: Eye,
            action: () => handlePanelNavigation('auditor'),
            description: 'Monitoreo y logs del sistema'
          }
        );
        break;
      case 'operador':
        options.push({
          label: 'Panel de Operador',
          icon: Settings,
          action: () => handlePanelNavigation('operator'),
          description: 'Gestión de productos y ventas'
        });
        break;
      case 'auditor':
        options.push({
          label: 'Panel de Auditoría',
          icon: Eye,
          action: () => handlePanelNavigation('auditor'),
          description: 'Monitoreo y logs del sistema'
        });
        break;
      default:
        // Usuario normal no tiene paneles administrativos
        break;
    }

    // Agregar diagnóstico para todos los usuarios autenticados
    options.push({
      label: 'Diagnóstico del Sistema',
      icon: Activity,
      action: () => handlePanelNavigation('diagnostic'),
      description: 'Estado del sistema y servicios'
    });

    return options;
  };

  const getRoleBadgeColor = (rol: string) => {
    switch (rol) {
      case 'administrador':
        return 'text-red-600 bg-red-100';
      case 'operador':
        return 'text-blue-600 bg-blue-100';
      case 'auditor':
        return 'text-purple-600 bg-purple-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const panelOptions = getPanelOptions();

  return (
    <>
      <Menu as="div" className="relative">
        <MenuButton as={Fragment}>
          <Button
            variant="ghost"
            size="icon"
            className="transition-colors duration-300 bg-white hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700"
          >
            <User className="h-5 w-5 dark:text-white" />
            <span className="sr-only">Cuenta</span>
          </Button>
        </MenuButton>

        <Transition
          as={Fragment}
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
          <MenuItems className="absolute right-0 mt-2 w-72 origin-top-right rounded-md bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
            {isAuthenticated ? (
              <div className="p-1">
                {/* Información del usuario */}
                <MenuItem>
                  <div className="px-3 py-2 border-b border-gray-200 dark:border-gray-700">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {user?.nombre || user?.email}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {user?.email}
                    </div>
                    {user?.rol && (
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-1 ${getRoleBadgeColor(user.rol)}`}>
                        {user.rol.charAt(0).toUpperCase() + user.rol.slice(1)}
                      </span>
                    )}
                  </div>
                </MenuItem>

                {/* Opciones de paneles según el rol */}
                {panelOptions.map((option) => (
                  <MenuItem key={option.label}>
                    {({ active }) => (
                      <button
                        onClick={option.action}
                        className={`${
                          active ? 'bg-gray-100 dark:bg-gray-700' : ''
                        } group flex w-full items-center rounded-md px-3 py-2 text-sm text-gray-900 dark:text-white`}
                      >
                        <option.icon className="h-4 w-4 mr-3 text-gray-400" />
                        <div className="text-left">
                          <div className="font-medium">{option.label}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {option.description}
                          </div>
                        </div>
                      </button>
                    )}
                  </MenuItem>
                ))}

                {/* Separador */}
                <div className="border-t border-gray-200 dark:border-gray-700 my-1" />

                {/* Cerrar sesión */}
                <MenuItem>
                  {({ active }) => (
                    <button
                      onClick={handleLogout}
                      className={`${
                        active ? 'bg-gray-100 dark:bg-gray-700' : ''
                      } group flex w-full items-center rounded-md px-3 py-2 text-sm text-gray-900 dark:text-white`}
                    >
                      <BarChart className="h-4 w-4 mr-3 text-gray-400" />
                      Cerrar Sesión
                    </button>
                  )}
                </MenuItem>
              </div>
            ) : (
              <MenuItem>
                {({ active }) => (
                  <button
                    onClick={handleLoginClick}
                    className={`${
                      active ? 'bg-gray-100 dark:bg-gray-700' : ''
                    } group flex w-full items-center rounded-md px-3 py-2 text-sm text-gray-900 dark:text-white`}
                  >
                    <User className="h-4 w-4 mr-3 text-gray-400" />
                    Iniciar Sesión
                  </button>
                )}
              </MenuItem>
            )}
          </MenuItems>
        </Transition>
      </Menu>

      <LoginModal 
        isOpen={isLoginModalOpen} 
        onClose={() => setIsLoginModalOpen(false)} 
      />
    </>
  );
};

export default UserDropdown;