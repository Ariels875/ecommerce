import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import { Button } from '../Ui/Button';
import { Input } from '../Ui/Input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, } from '../Ui/Dialog';
import { Toast, ToastTitle, ToastDescription } from '../Ui/Toast';
import { useAuth } from '../hooks/useAuth';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface LoginResponse {
  message: string;
  user: {
    id: number;
    email: string;
    rol: string;
    nombre: string;
  };
  error?: string;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const navigate = useNavigate();
  const { login, checkAuthStatus } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
        mode: 'cors',
      });

      const data: LoginResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al iniciar sesión');
      }

      await login(data.user);
      await checkAuthStatus();

      onClose();
      setEmail('');
      setPassword('');
      setShowToast(true);

      // Redirigir inmediatamente después de confirmar la autenticación
      if (data.user.rol === 'administrador') {
        navigate('/admin/panel');
      } else {
        navigate('/');
      }
    } catch (error) {
      console.error('Error durante el login:', error);
      setError(error instanceof Error ? error.message : 'Error al iniciar sesión');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Iniciar Sesión</DialogTitle>
          <DialogDescription>
            Ingresa tus credenciales para acceder a tu cuenta.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <p className="text-red-500">{error}</p>}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Correo Electrónico
            </label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Contraseña
            </label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1"
            />
          </div>
          <Button type="submit" className="w-full">
            Iniciar Sesión
          </Button>
        </form>
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
          <X className="h-6 w-6" />
          <span className="sr-only">Cerrar</span>
        </button>
      </DialogContent>

      {showToast && (
        <Toast onOpenChange={() => setShowToast(false)}>
          <ToastTitle>Login exitoso</ToastTitle>
          <ToastDescription>{`Bienvenido ${email}`}</ToastDescription>
        </Toast>
      )}
    </Dialog>
  );
};

export default LoginModal;