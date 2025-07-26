import React, { useState } from 'react';
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import { Button } from '../Ui/Button';
import { Input } from '../Ui/Input';
import { Label } from '../Ui/Label';
import { Textarea } from '../Ui/Textarea';
import { useCart } from './CartContext';
import { useAuth } from '../hooks/useAuth';
import { API_URL, CartItem } from './types';
import { CheckCircle, ShoppingBag } from 'lucide-react';

interface CheckoutProps {
  isOpen: boolean;
  onClose: () => void;
}

const Checkout: React.FC<CheckoutProps> = ({ isOpen, onClose }) => {
  const { cart, totalPrice } = useCart();
  const { user, isAuthenticated } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [orderDetails, setOrderDetails] = useState({
    direccion_envio: '',
    telefono_contacto: '',
    notas: ''
  });

  const processSales = async () => {
    if (!isAuthenticated || !user) {
      alert('Debes iniciar sesión para realizar una compra');
      return;
    }

    if (cart.length === 0) {
      alert('El carrito está vacío');
      return;
    }

    // Validaciones adicionales
    if (!orderDetails.direccion_envio || orderDetails.direccion_envio.length < 10) {
      alert('La dirección de envío debe tener al menos 10 caracteres');
      return;
    }

    if (!orderDetails.telefono_contacto || orderDetails.telefono_contacto.length < 8) {
      alert('El teléfono de contacto debe tener al menos 8 caracteres');
      return;
    }

    setIsProcessing(true);
    
    try {
      // Procesar cada item del carrito como una venta separada
      const salesPromises = cart.map(async (item: CartItem) => {
        const saleData = {
          producto_id: Number(item.id), // Asegurar que sea número
          cantidad: Number(item.quantity), // Asegurar que sea número
          color: item.selectedColor || undefined, // Solo enviar si tiene valor
          size: item.selectedSize || undefined, // Solo enviar si tiene valor
          direccion_envio: orderDetails.direccion_envio.trim(),
          telefono_contacto: orderDetails.telefono_contacto.trim(),
          notas: orderDetails.notas?.trim() || undefined
        };

        const response = await fetch(`${API_URL}/sales`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify(saleData)
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error('Error en venta:', errorData);
          throw new Error(`Error en producto ${item.name}: ${errorData.error || 'Error desconocido'}`);
        }

        return response;
      });

      await Promise.all(salesPromises);
      
      // Si llegamos aquí, todas las ventas fueron exitosas
      setIsSuccess(true);
      // Limpiar carrito después de venta exitosa
      localStorage.removeItem('cart');
      window.location.reload(); // Recargar para limpiar el carrito
      
    } catch (error) {
      console.error('Error processing sales:', error);
      alert(error instanceof Error ? error.message : 'Error al procesar la venta. Inténtalo de nuevo.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    setIsSuccess(false);
    setOrderDetails({
      direccion_envio: '',
      telefono_contacto: '',
      notas: ''
    });
    onClose();
  };

  if (isSuccess) {
    return (
      <Dialog open={isOpen} onClose={handleClose} className="relative z-50">
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <DialogPanel className="mx-auto max-w-md w-full rounded-lg bg-white dark:bg-neutral-900 p-6 shadow-xl text-center">
            <div className="mb-4">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <DialogTitle className="text-2xl font-bold text-green-600 dark:text-green-400 mb-2">
                ¡Compra Exitosa!
              </DialogTitle>
              <p className="text-gray-600 dark:text-gray-300">
                Tu pedido ha sido procesado correctamente. Recibirás una confirmación por email.
              </p>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium">Total pagado:</span>
                <span className="text-xl font-bold text-green-600">
                  ${totalPrice.toFixed(2)}
                </span>
              </div>
              <div className="text-sm text-gray-500">
                Número de artículos: {cart.length}
              </div>
            </div>

            <Button onClick={handleClose} className="w-full">
              Continuar Comprando
            </Button>
          </DialogPanel>
        </div>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30 dark:text-white" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="mx-auto max-w-md w-full rounded-lg bg-white dark:bg-neutral-900 p-6 shadow-xl max-h-[80vh] overflow-y-auto dark:text-white">
          <DialogTitle className="text-lg font-medium mb-4 dark:text-white flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" />
            Finalizar Compra
          </DialogTitle>

          {!isAuthenticated ? (
            <div className="text-center">
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Debes iniciar sesión para realizar una compra
              </p>
              <Button onClick={onClose} variant="outline">
                Cerrar
              </Button>
            </div>
          ) : (
            <>
              {/* Resumen del pedido */}
              <div className="mb-6">
                <h3 className="font-medium mb-3 dark:text-white">Resumen del pedido</h3>
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                  <div className="space-y-2">
                    {cart.map((item) => (
                      <div key={`${item.id}-${item.selectedColor}-${item.selectedSize}`} 
                           className="flex justify-between text-sm">
                        <span>{item.name} ({item.selectedColor}, {item.selectedSize}) x{item.quantity}</span>
                        <span>${(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="border-t pt-2 mt-2 flex justify-between font-bold">
                    <span>Total:</span>
                    <span>${totalPrice.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Formulario de datos de envío */}
              <form onSubmit={(e) => { e.preventDefault(); processSales(); }} className="space-y-4">
                <div>
                  <Label htmlFor="direccion_envio">Dirección de Envío *</Label>
                  <Input
                    id="direccion_envio"
                    value={orderDetails.direccion_envio}
                    onChange={(e) => setOrderDetails({
                      ...orderDetails,
                      direccion_envio: e.target.value
                    })}
                    placeholder="Ingresa tu dirección completa"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="telefono_contacto">Teléfono de Contacto *</Label>
                  <Input
                    id="telefono_contacto"
                    type="tel"
                    value={orderDetails.telefono_contacto}
                    onChange={(e) => setOrderDetails({
                      ...orderDetails,
                      telefono_contacto: e.target.value
                    })}
                    placeholder="Ingresa tu número de teléfono"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="notas">Notas adicionales (opcional)</Label>
                  <Textarea
                    id="notas"
                    value={orderDetails.notas}
                    onChange={(e) => setOrderDetails({
                      ...orderDetails,
                      notas: e.target.value
                    })}
                    placeholder="Instrucciones especiales para la entrega"
                    rows={3}
                  />
                </div>

                <div className="flex gap-2 justify-end pt-4">
                  <Button type="button" variant="outline" onClick={onClose}>
                    Cancelar
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={isProcessing}
                    className="min-w-[120px]"
                  >
                    {isProcessing ? 'Procesando...' : `Pagar $${totalPrice.toFixed(2)}`}
                  </Button>
                </div>
              </form>
            </>
          )}
        </DialogPanel>
      </div>
    </Dialog>
  );
};

export default Checkout;