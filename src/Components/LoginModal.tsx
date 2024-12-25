import React, { useState } from 'react';
import { Dialog, DialogPanel, DialogTitle, Description } from '@headlessui/react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../Ui/Button';
import { Input } from '../Ui/Input';
import { Toast, ToastTitle, ToastDescription } from '../Ui/Toast';
import { useAuth } from '../hooks/useAuth';
import { API_URL } from './types';


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
  const [isLoading, setIsLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const navigate = useNavigate();
  const { login, checkAuthStatus } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
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
      await new Promise(resolve => setTimeout(resolve, 500));
      await checkAuthStatus();
      setEmail('');
      setPassword('');
      onClose();

      setShowToast(true);

      if (data.user.rol === 'administrador') {
        navigate('/admin/panel');
      } else {
        navigate('/');
      }
    } catch (error) {
      console.error('Error durante el login:', error);
      setError(error instanceof Error ? error.message : 'Error al iniciar sesión');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
        <div className="flex justify-center items-center h-screen">
            <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
        </div>
    );
  }

  return (
    <>
      <Dialog open={isOpen} onClose={onClose} className="relative z-50 dark:text-white">
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <DialogPanel className="mx-auto max-w-sm w-full rounded-lg bg-white dark:bg-neutral-900 p-6 shadow-xl">
            <DialogTitle className="text-2xl font-bold mb-2 dark:text-white">
              Iniciar Sesión
            </DialogTitle>
            <Description className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              Ingresa tus credenciales para acceder a tu cuenta.
            </Description>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 rounded bg-red-50 border border-red-200">
                  <p className="text-red-500 text-sm">{error}</p>
                </div>
              )}
              
              <div>
                <label 
                  htmlFor="email" 
                  className="block text-sm font-medium text-gray-700 dark:text-white mb-1"
                >
                  Correo Electrónico
                </label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full dark:text-white"
                />
              </div>

              <div>
                <label 
                  htmlFor="password" 
                  className="block text-sm font-medium text-gray-700 dark:text-white mb-1"
                >
                  Contraseña
                </label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full dark:text-white"
                />
              </div>

              <div className="flex gap-2 justify-end pt-4">
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancelar
                </Button>
                <Button type="submit">
                  Iniciar Sesión
                </Button>
              </div>
            </form>
          </DialogPanel>
        </div>
      </Dialog>

      {showToast && (
        <Toast onOpenChange={() => setShowToast(false)}>
          <ToastTitle>Login exitoso</ToastTitle>
          <ToastDescription>{`Bienvenido ${email}`}</ToastDescription>
        </Toast>
      )}
    </>
  );
};

export default LoginModal;