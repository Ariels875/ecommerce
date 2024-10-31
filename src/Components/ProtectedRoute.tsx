import React from 'react';
import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  // Aquí deberías implementar tu lógica de autenticación
  // Por ejemplo, verificar si hay un token en localStorage o en el estado global
  const isAuthenticated = localStorage.getItem('token') !== null;

  if (!isAuthenticated) {
    // Redirige al usuario a la página de login si no está autenticado
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;