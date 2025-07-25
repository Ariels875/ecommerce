import React, { useState, useEffect } from 'react';
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import { Eye, Edit, ShoppingBag, TrendingUp } from 'lucide-react';
import { Button } from '../Ui/Button';
import { Input } from '../Ui/Input';
import { Label } from '../Ui/Label';
import { Textarea } from '../Ui/Textarea';
import { TabsContent } from '../Ui/Tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../Ui/Table';
import { Badge } from '../Ui/Badge';
import { API_URL } from './types';

interface Sale {
  id: number;
  usuario_id: number;
  producto_id: number;
  cantidad: number;
  precio_unitario: number;
  precio_total: number;
  color?: string;
  size?: string;
  estado: 'pendiente' | 'procesando' | 'completada' | 'cancelada' | 'reembolsada';
  direccion_envio?: string;
  telefono_contacto?: string;
  notas?: string;
  fecha_completado?: string;
  created_at: string;
  updated_at: string;
  producto_nombre?: string;
  usuario_nombre?: string;
  usuario_email?: string;
}

interface SalesStats {
  totalSales: number;
  totalRevenue: number;
  salesByStatus: Array<{ estado: string; count: number }>;
  topProducts: Array<{ name: string; total_vendido: number; ingresos: number }>;
}

const OperatorSales = () => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [stats, setStats] = useState<SalesStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Estados para edición
  const [editForm, setEditForm] = useState({
    estado: '',
    notas: ''
  });

  const estadoColors = {
    pendiente: 'bg-yellow-100 text-yellow-800',
    procesando: 'bg-blue-100 text-blue-800',
    completada: 'bg-green-100 text-green-800',
    cancelada: 'bg-red-100 text-red-800',
    reembolsada: 'bg-purple-100 text-purple-800'
  };

  const fetchSales = async (page = 1) => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_URL}/operator/sales?page=${page}&limit=20`, {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Error al obtener ventas');
      }

      const data = await response.json();
      setSales(data.sales || []);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch (error) {
      console.error('Error fetching sales:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSalesStats = async () => {
    try {
      const response = await fetch(`${API_URL}/operator/sales/stats/overview`, {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching sales stats:', error);
    }
  };

  useEffect(() => {
    fetchSales(currentPage);
    fetchSalesStats();
  }, [currentPage]);

  const handleViewDetails = (sale: Sale) => {
    setSelectedSale(sale);
    setIsDetailModalOpen(true);
  };

  const handleEditSale = (sale: Sale) => {
    setSelectedSale(sale);
    setEditForm({
      estado: sale.estado,
      notas: sale.notas || ''
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateSaleStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSale) return;

    try {
      const response = await fetch(`${API_URL}/operator/sales/${selectedSale.id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(editForm)
      });

      if (response.ok) {
        setIsEditModalOpen(false);
        fetchSales(currentPage);
        fetchSalesStats();
      } else {
        const error = await response.json();
        alert(error.error || 'Error al actualizar la venta');
      }
    } catch (error) {
      console.error('Error updating sale:', error);
      alert('Error al actualizar la venta');
    }
  };

  const filteredSales = sales.filter(sale => {
    const matchesSearch = !searchTerm || 
      sale.producto_nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.usuario_nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.usuario_email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || sale.estado === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <TabsContent value="sales">
      <div className="space-y-6">
        {/* Estadísticas */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
              <div className="flex items-center">
                <ShoppingBag className="h-8 w-8 text-blue-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Ventas</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalSales}</p>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-green-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Ingresos Totales</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    ${stats.totalRevenue?.toFixed(2) || '0.00'}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Ventas Completadas</p>
                <p className="text-2xl font-bold text-green-600">
                  {stats.salesByStatus.find(s => s.estado === 'completada')?.count || 0}
                </p>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Ventas Pendientes</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {stats.salesByStatus.find(s => s.estado === 'pendiente')?.count || 0}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Filtros */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <Input
              placeholder="Buscar por producto, cliente o email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="sm:w-48">
            <select
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">Todos los estados</option>
              <option value="pendiente">Pendiente</option>
              <option value="procesando">Procesando</option>
              <option value="completada">Completada</option>
              <option value="cancelada">Cancelada</option>
              <option value="reembolsada">Reembolsada</option>
            </select>
          </div>
        </div>

        {/* Tabla de ventas */}
        <div className="bg-white dark:backdrop-blur-md dark:bg-black/30 dark:border dark:border-white/50 rounded-lg shadow">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Producto</TableHead>
                <TableHead>Cantidad</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSales.map((sale) => (
                <TableRow key={sale.id}>
                  <TableCell>#{sale.id}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{sale.usuario_nombre}</div>
                      <div className="text-sm text-gray-500">{sale.usuario_email}</div>
                    </div>
                  </TableCell>
                  <TableCell>{sale.producto_nombre}</TableCell>
                  <TableCell>{sale.cantidad}</TableCell>
                  <TableCell>${sale.precio_total.toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge className={estadoColors[sale.estado]}>
                      {sale.estado}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(sale.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleViewDetails(sale)}
                      className="mr-2"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEditSale(sale)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Paginación */}
        <div className="flex justify-center space-x-2">
          <Button
            variant="outline"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
          >
            Anterior
          </Button>
          <span className="flex items-center px-4 py-2 text-sm">
            Página {currentPage} de {totalPages}
          </span>
          <Button
            variant="outline"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(currentPage + 1)}
          >
            Siguiente
          </Button>
        </div>
      </div>

      {/* Modal de detalles de venta */}
      <Dialog open={isDetailModalOpen} onClose={() => setIsDetailModalOpen(false)} className="relative z-50">
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <DialogPanel className="mx-auto max-w-2xl w-full rounded-lg bg-white dark:bg-neutral-900 p-6 shadow-xl max-h-[80vh] overflow-y-auto">
            <DialogTitle className="text-lg font-medium mb-4 dark:text-white">
              Detalles de la Venta #{selectedSale?.id}
            </DialogTitle>
            
            {selectedSale && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Cliente</Label>
                    <p className="text-sm">{selectedSale.usuario_nombre}</p>
                    <p className="text-sm text-gray-500">{selectedSale.usuario_email}</p>
                  </div>
                  <div>
                    <Label>Producto</Label>
                    <p className="text-sm">{selectedSale.producto_nombre}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>Cantidad</Label>
                    <p className="text-sm">{selectedSale.cantidad}</p>
                  </div>
                  <div>
                    <Label>Precio Unitario</Label>
                    <p className="text-sm">${selectedSale.precio_unitario.toFixed(2)}</p>
                  </div>
                  <div>
                    <Label>Total</Label>
                    <p className="text-sm font-bold">${selectedSale.precio_total.toFixed(2)}</p>
                  </div>
                </div>

                {(selectedSale.color || selectedSale.size) && (
                  <div className="grid grid-cols-2 gap-4">
                    {selectedSale.color && (
                      <div>
                        <Label>Color</Label>
                        <p className="text-sm">{selectedSale.color}</p>
                      </div>
                    )}
                    {selectedSale.size && (
                      <div>
                        <Label>Talla</Label>
                        <p className="text-sm">{selectedSale.size}</p>
                      </div>
                    )}
                  </div>
                )}

                <div>
                  <Label>Estado</Label>
                  <Badge className={estadoColors[selectedSale.estado]}>
                    {selectedSale.estado}
                  </Badge>
                </div>

                {selectedSale.direccion_envio && (
                  <div>
                    <Label>Dirección de Envío</Label>
                    <p className="text-sm">{selectedSale.direccion_envio}</p>
                  </div>
                )}

                {selectedSale.telefono_contacto && (
                  <div>
                    <Label>Teléfono de Contacto</Label>
                    <p className="text-sm">{selectedSale.telefono_contacto}</p>
                  </div>
                )}

                {selectedSale.notas && (
                  <div>
                    <Label>Notas</Label>
                    <p className="text-sm">{selectedSale.notas}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Fecha de Creación</Label>
                    <p className="text-sm">{new Date(selectedSale.created_at).toLocaleString()}</p>
                  </div>
                  {selectedSale.fecha_completado && (
                    <div>
                      <Label>Fecha de Completado</Label>
                      <p className="text-sm">{new Date(selectedSale.fecha_completado).toLocaleString()}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            <div className="flex justify-end mt-6">
              <Button onClick={() => setIsDetailModalOpen(false)}>
                Cerrar
              </Button>
            </div>
          </DialogPanel>
        </div>
      </Dialog>

      {/* Modal de edición de venta */}
      <Dialog open={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} className="relative z-50">
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <DialogPanel className="mx-auto max-w-md w-full rounded-lg bg-white dark:bg-neutral-900 p-6 shadow-xl">
            <DialogTitle className="text-lg font-medium mb-4 dark:text-white">
              Actualizar Estado de Venta #{selectedSale?.id}
            </DialogTitle>
            
            <form onSubmit={handleUpdateSaleStatus} className="space-y-4">
              <div>
                <Label htmlFor="estado">Estado</Label>
                <select
                  id="estado"
                  className="w-full rounded-md border border-input bg-background px-3 py-2"
                  value={editForm.estado}
                  onChange={(e) => setEditForm({ ...editForm, estado: e.target.value })}
                  required
                >
                  <option value="pendiente">Pendiente</option>
                  <option value="procesando">Procesando</option>
                  <option value="completada">Completada</option>
                  <option value="cancelada">Cancelada</option>
                  <option value="reembolsada">Reembolsada</option>
                </select>
              </div>
              
              <div>
                <Label htmlFor="notas">Notas</Label>
                <Textarea
                  id="notas"
                  value={editForm.notas}
                  onChange={(e) => setEditForm({ ...editForm, notas: e.target.value })}
                  placeholder="Notas adicionales sobre la venta..."
                  rows={3}
                />
              </div>
              
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">
                  Actualizar
                </Button>
              </div>
            </form>
          </DialogPanel>
        </div>
      </Dialog>
    </TabsContent>
  );
};

export default OperatorSales;