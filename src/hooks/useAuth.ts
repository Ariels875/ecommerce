import { useState, useEffect } from 'react';

interface User {
  id: number;
  email: string;
  rol: string;
  nombre: string;
}

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/session`, {
          credentials: 'include'
        });
        const data = await response.json();
        
        if (data.authenticated) {
          setIsAuthenticated(true);
          setUser(data.user);
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
        setIsAuthenticated(false);
        setUser(null);
      }
    };

    checkAuth();
  }, []);

  return { isAuthenticated, user };
};