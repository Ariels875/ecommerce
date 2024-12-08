import { useState, useEffect } from 'react';

interface User {
    id: number;
    email: string;
    rol: string;
    nombre: string;
}

const useAuth = () => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    // Verifica si el usuario está autenticado
    const isAuthenticated = user !== null;

    const login = async (userData: User) => {
        setUser(userData);
        // Aquí puedes guardar el token en localStorage o cookies si es necesario
        // localStorage.setItem('token', token);
    };

    const logout = () => {
        setUser(null);
        // Aquí puedes eliminar el token de localStorage o cookies si es necesario
        // localStorage.removeItem('token');
    };

    const checkAuthStatus = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_DEV}/auth/verify`, {
                method: 'GET',
                credentials: 'include', // Para enviar cookies con la solicitud
            });

            if (response.ok) {
                const data = await response.json();
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
        checkAuthStatus();
    }, []);

    return { user, login, logout, loading, checkAuthStatus, isAuthenticated };
};

export default useAuth;