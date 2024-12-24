import React, { Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { Button } from '../Ui/Button';
import { User } from 'lucide-react';
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

  const handleAdminPanel = () => {
    navigate('/admin/panel');
  };

  const handleLoginClick = () => {
    setIsLoginModalOpen(true);
  };

  return (
    <>
      <Menu as="div" className="relative">
        <Menu.Button as={Fragment}>
          <Button
            variant="ghost"
            size="icon"
            className="transition-colors duration-300 bg-white hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700"
          >
            <User className="h-5 w-5 dark:text-white" />
            <span className="sr-only">Cuenta</span>
          </Button>
        </Menu.Button>

        <Transition
          as={Fragment}
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
          <Menu.Items className="absolute right-0 mt-2 w-48 origin-top-right rounded-md bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
            {isAuthenticated ? (
              <div className="p-1">
                <Menu.Item>
                  <div className="px-2 py-1.5 text-sm font-medium text-gray-900 dark:text-white">
                    {user?.nombre || user?.email}
                  </div>
                </Menu.Item>
                {user?.rol === 'administrador' && (
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        onClick={handleAdminPanel}
                        className={`${
                          active ? 'bg-gray-100 dark:bg-gray-700' : ''
                        } group flex w-full items-center rounded-md px-2 py-1.5 text-sm text-gray-900 dark:text-white`}
                      >
                        Panel de Administrador
                      </button>
                    )}
                  </Menu.Item>
                )}
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={handleLogout}
                      className={`${
                        active ? 'bg-gray-100 dark:bg-gray-700' : ''
                      } group flex w-full items-center rounded-md px-2 py-1.5 text-sm text-gray-900 dark:text-white`}
                    >
                      Cerrar Sesión
                    </button>
                  )}
                </Menu.Item>
              </div>
            ) : (
              <Menu.Item>
                {({ active }) => (
                  <button
                    onClick={handleLoginClick}
                    className={`${
                      active ? 'bg-gray-100 dark:bg-gray-700' : ''
                    } group flex w-full items-center rounded-md px-2 py-1.5 text-sm text-gray-900 dark:text-white`}
                  >
                    Iniciar Sesión
                  </button>
                )}
              </Menu.Item>
            )}
          </Menu.Items>
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