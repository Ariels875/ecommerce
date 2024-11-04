import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth'; 
import { Toast, ToastViewport, ToastTitle, ToastDescription } from '../Ui/Toast'; 

interface AdminRouteProps {
  children: React.ReactNode;
}

const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const { isAuthenticated, user, loading } = useAuth();
  const navigate = useNavigate();

  // Estado para manejar los mensajes del Toast
  const [toastMessage, setToastMessage] = useState<{ title: string; description: string; variant: 'default' | 'destructive' } | null>(null);

  useEffect(() => {
    // Solo realizar verificaciones cuando la carga inicial haya terminado
    if (!loading) {
      if (!isAuthenticated) {
        setToastMessage({
          variant: 'destructive',
          title: 'Acceso denegado',
          description: 'Por favor, inicia sesión para acceder.',
        });
        navigate('/');
      } else if (user?.rol !== 'administrador') {
        setToastMessage({
          variant: 'destructive',
          title: 'Acceso restringido',
          description: 'No tienes permisos de administrador.',
        });
        navigate('/');
      }
    }
  }, [isAuthenticated, user, navigate, loading]);

  // Mostrar un loader mientras se verifica la autenticación
  if (loading) {
    return <div>Cargando...</div>;
  }

  return (
    <>
      {isAuthenticated && user?.rol === 'administrador' ? children : null}
      {toastMessage && (
        <Toast variant={toastMessage.variant} onOpenChange={() => setToastMessage(null)}>
          <ToastTitle>{toastMessage.title}</ToastTitle>
          <ToastDescription>{toastMessage.description}</ToastDescription>
        </Toast>
      )}
      <ToastViewport />
    </>
  );
};

export default AdminRoute;
