import { useState, useEffect, useCallback } from 'react';

interface User {
  id: number;
  email: string;
  rol: string;
  nombre: string;
}

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    loading: true
  });

  const checkAuthStatus = useCallback(async () => {
    setAuthState(prev => ({ ...prev, loading: true }));
    try {
      const response = await fetch(`${import.meta.env.VITE_API_DEV}/auth/verify`, {
        credentials: 'include',
      });
  
      if (response.ok) {
        const data = await response.json();
        setAuthState({
          isAuthenticated: true,
          user: data.user,
          loading: false
        });
      } else {
        localStorage.removeItem('user');
        setAuthState({
          isAuthenticated: false,
          user: null,
          loading: false
        });
      }
    } catch (error) {
      console.error('Error verificando autenticación:', error);
      localStorage.removeItem('user');
      setAuthState({
        isAuthenticated: false,
        user: null,
        loading: false
      });
    }
  }, []);

  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  const login = useCallback(async (userData: User) => {
    localStorage.setItem('user', JSON.stringify(userData));
    setAuthState({
      isAuthenticated: true,
      user: userData,
      loading: false
    });
    // Verificar el estado de autenticación después del login
    await checkAuthStatus();
  }, [checkAuthStatus]);

  const logout = useCallback(async () => {
    try {
      await fetch(`${import.meta.env.VITE_API_DEV}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } finally {
      localStorage.removeItem('user');
      setAuthState({
        isAuthenticated: false,
        user: null,
        loading: false
      });
    }
  }, []);

  return {
    ...authState,
    login,
    logout,
    checkAuthStatus
  };
};