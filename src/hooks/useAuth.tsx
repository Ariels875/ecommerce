// AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
    id: number;
    email: string;
    rol: string;
    nombre: string;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    isAuthenticated: boolean;
    login: (userData: User) => Promise<void>;
    logout: () => Promise<void>;
    checkAuthStatus: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isAuthenticated: false,
  login: async () => {},
  logout: async () => {},
  checkAuthStatus: async () => {}
});


export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [initialized, setInitialized] = useState(false);

    const login = async (userData: User) => {
        setUser(userData);
    };

    const logout = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_DEV}/auth/logout`, {
                method: 'POST',
                credentials: 'include',
            });

            if (response.ok) {
                setUser(null);
                localStorage.removeItem('token');
                localStorage.removeItem('user');
            }
        } catch (error) {
            console.error('Error durante el logout:', error);
        }
    };

    const checkAuthStatus = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_DEV}/auth/verify`, {
                method: 'GET',
                credentials: 'include',
            });

            const data = await response.json();
            
            if (response.ok && data.authenticated) {
                setUser(data.user);
            } else {
                setUser(null);
            }
        } catch (error) {
            console.error('Error al verificar estado de autenticación:', error);
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!initialized) {
            checkAuthStatus();
            setInitialized(true);
        }
    }, [initialized]);

    const value = {
        user,
        loading,
        isAuthenticated: user !== null,
        login,
        logout,
        checkAuthStatus
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth debe ser usado dentro de un AuthProvider');
    }
    return context;
};