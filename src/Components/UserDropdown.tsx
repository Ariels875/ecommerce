import React from 'react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../Ui/Dropdown-menu';
import { Button } from '../Ui/Button';
import { User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import LoginModal from './LoginModal';

const UserDropdown = () => {
  const [isLoginModalOpen, setIsLoginModalOpen] = React.useState(false);
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const handleAdminPanel = () => {
    navigate('/admin/panel');
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="transition-colors duration-300 bg-white hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700"
          >
            <User className="h-5 w-5 dark:text-white" />
            <span className="sr-only">Cuenta</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          {isAuthenticated ? (
            <>
              <DropdownMenuItem className="font-medium">
                {user?.nombre || user?.email}
              </DropdownMenuItem>
              {user?.rol === 'administrador' && (
                <DropdownMenuItem onClick={handleAdminPanel}>
                  Panel de Administrador
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={handleLogout}>
                Cerrar Sesión
              </DropdownMenuItem>
            </>
          ) : (
            <DropdownMenuItem onClick={() => setIsLoginModalOpen(true)}>
              Iniciar Sesión
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <LoginModal 
        isOpen={isLoginModalOpen} 
        onClose={() => setIsLoginModalOpen(false)} 
      />
    </>
  );
};

export default UserDropdown;