import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Toast, ToastViewport, ToastTitle, ToastDescription } from '../Ui/Toast';

interface AdminRouteProps {
  children: React.ReactNode;
}

const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const { isAuthenticated, user, loading } = useAuth();
  const navigate = useNavigate();
  const [toastMessage, setToastMessage] = useState<{
    title: string;
    description: string;
    variant: 'default' | 'destructive';
  } | null>(null);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const checkAccess = async () => {
      if (!loading) {
        if (!isAuthenticated) {
          setToastMessage({
            variant: 'destructive',
            title: 'Acceso denegado',
            description: 'Por favor, inicia sesión para acceder.',
          });
        } else if (user?.rol !== 'administrador') {
          setToastMessage({
            variant: 'destructive',
            title: 'Acceso restringido',
            description: 'No tienes permisos de administrador.',
          });
        } else {
          return; // Usuario autenticado y es admin
        }

        // Esperar un momento para que el toast se muestre
        timeoutId = setTimeout(() => {
          navigate('/');
        }, 1500);
      }
    };

    checkAccess();

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [isAuthenticated, user, navigate, loading]);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
    </div>;
  }

  // Para este punto, sabemos que el usuario está autenticado y es admin
  return (
    <>
      {children}
      {toastMessage && (
        <Toast 
          variant={toastMessage.variant} 
          onOpenChange={() => setToastMessage(null)}
        >
          <ToastTitle>{toastMessage.title}</ToastTitle>
          <ToastDescription>{toastMessage.description}</ToastDescription>
        </Toast>
      )}
      <ToastViewport />
    </>
  );
};

export default AdminRoute;