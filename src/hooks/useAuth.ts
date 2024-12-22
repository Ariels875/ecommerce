import { useState, useEffect } from 'react';

interface User {
    id: number;
    email: string;
    rol: string;
    nombre: string;
}

interface AuthState {
    user: User | null;
    lastChecked: number;
}

// Cache global para mantener el estado entre componentes
const globalAuthState: AuthState = {
    user: null,
    lastChecked: 0
};

const CACHE_DURATION = 5000; // 5 segundos - ajusta según necesites

const useAuth = () => {
    const [user, setUser] = useState<User | null>(globalAuthState.user);
    const [loading, setLoading] = useState(true);

    const isAuthenticated = user !== null;

    const login = async (userData: User) => {
        setUser(userData);
        globalAuthState.user = userData;
        globalAuthState.lastChecked = Date.now();
    };

    const logout = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_DEV}/auth/logout`, {
                method: 'POST',
                credentials: 'include',
            });

            if (response.ok) {
                setUser(null);
                globalAuthState.user = null;
                globalAuthState.lastChecked = Date.now();
                localStorage.removeItem('token');
                localStorage.removeItem('user');
            } else {
                console.error('Error al cerrar sesión');
            }
        } catch (error) {
            console.error('Error durante el logout:', error);
        }
    };

    const checkAuthStatus = async (force: boolean = false) => {
        // Si no forzamos la verificación y el caché es válido, usar el valor en caché
        if (!force && Date.now() - globalAuthState.lastChecked < CACHE_DURATION) {
            setUser(globalAuthState.user);
            setLoading(false);
            return;
        }

        try {
            const response = await fetch(`${import.meta.env.VITE_API_DEV}/auth/verify`, {
                method: 'GET',
                credentials: 'include',
            });

            const data = await response.json();
            
            if (response.ok && data.authenticated) {
                // Solo actualizar si hay cambios
                if (JSON.stringify(globalAuthState.user) !== JSON.stringify(data.user)) {
                    setUser(data.user);
                    globalAuthState.user = data.user;
                }
            } else {
                setUser(null);
                globalAuthState.user = null;
            }

            globalAuthState.lastChecked = Date.now();
        } catch (error) {
            console.error('Error al verificar estado de autenticación:', error);
            setUser(null);
            globalAuthState.user = null;
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const needsCheck = 
            !globalAuthState.lastChecked || 
            Date.now() - globalAuthState.lastChecked >= CACHE_DURATION;

        if (needsCheck) {
            checkAuthStatus();
        } else {
            // Usar el valor en caché
            setUser(globalAuthState.user);
            setLoading(false);
        }
    }, []);

    return { 
        user, 
        login, 
        logout, 
        loading, 
        checkAuthStatus, 
        isAuthenticated 
    };
};

export default useAuth;