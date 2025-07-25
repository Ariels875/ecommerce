import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Toast, ToastViewport, ToastTitle, ToastDescription } from '../Ui/Toast';

interface RoleRouteProps {
  children: React.ReactNode;
  allowedRoles: string[]; // Lista de roles permitidos
  redirectTo?: string; // Ruta de redirección personalizada
}

const RoleRoute: React.FC<RoleRouteProps> = ({ 
  children, 
  allowedRoles, 
  redirectTo = '/' 
}) => {
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
        } else if (user && !allowedRoles.includes(user.rol)) {
          setToastMessage({
            variant: 'destructive',
            title: 'Acceso restringido',
            description: `No tienes permisos para acceder a esta sección. Roles permitidos: ${allowedRoles.join(', ')}.`,
          });
        } else {
          return; // Usuario autenticado y tiene el rol correcto
        }

        // Esperar un momento para que el toast se muestre
        timeoutId = setTimeout(() => {
          navigate(redirectTo);
        }, 1500);
      }
    };

    checkAccess();

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [isAuthenticated, user, navigate, loading, allowedRoles, redirectTo]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  // Verificar autenticación y rol
  if (!isAuthenticated || !user || !allowedRoles.includes(user.rol)) {
    return (
      <>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Verificando acceso...
            </h2>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto" />
          </div>
        </div>
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
  }

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

export default RoleRoute;