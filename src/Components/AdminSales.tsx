import React, { useState, useEffect } from 'react';
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import { Pencil, Plus, Trash2, ShoppingBag, Search, Eye } from 'lucide-react';
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

interface SaleFormData {
  usuario_id: number;
  producto_id: number;
  cantidad: number;
  precio_unitario: number;
  color: string;
  size: string;
  estado: 'pendiente' | 'procesando' | 'completada' | 'cancelada' | 'reembolsada';
  direccion_envio: string;
  telefono_contacto: string;
  notas: string;
}

interface SalesStats {
  totalSales: number;
  totalRevenue: number;
  salesByStatus: Array<{ estado: string; count: number }>;
  topProducts: Array<{ name: string; total_vendido: number; ingresos: number }>;
}

const initialFormState: SaleFormData = {
  usuario_id: 0,
  producto_id: 0,
  cantidad: 1,
  precio_unitario: 0,
  color: '',
  size: '',
  estado: 'pendiente',
  direccion_envio: '',
  telefono_contacto: '',
  notas: ''
};

const AdminSales = () => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [stats, setStats] = useState<SalesStats | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [editingSale, setEditingSale] = useState<Sale | null>(null);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saleForm, setSaleForm] = useState<SaleFormData>(initialFormState);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

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
      const response = await fetch(`${API_URL}/admin/sales?page=${page}&limit=20`, {
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
      const response = await fetch(`${API_URL}/admin/sales/stats/overview`, {
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

  const handleOpenDialog = (sale: Sale | null = null) => {
    if (sale) {
      setEditingSale(sale);
      setSaleForm({
        usuario_id: sale.usuario_id,
        producto_id: sale.producto_id,
        cantidad: sale.cantidad,
        precio_unitario: sale.precio_unitario,
        color: sale.color || '',
        size: sale.size || '',
        estado: sale.estado,
        direccion_envio: sale.direccion_envio || '',
        telefono_contacto: sale.telefono_contacto || '',
        notas: sale.notas || ''
      });
    } else {
      setEditingSale(null);
      setSaleForm(initialFormState);
    }
    setIsOpen(true);
  };

  const handleCloseDialog = () => {
    setIsOpen(false);
    setEditingSale(null);
    setSaleForm(initialFormState);
  };

  const handleViewDetails = (sale: Sale) => {
    setSelectedSale(sale);
    setIsDetailModalOpen(true);
  };

  const handleSaleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      const method = editingSale ? 'PUT' : 'POST';
      const url = editingSale
        ? `${API_URL}/admin/sales/${editingSale.id}`
        : `${API_URL}/admin/sales`;

      // Calcular precio total
      const precio_total = saleForm.precio_unitario * saleForm.cantidad;

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          ...saleForm,
          precio_total
        }),
      });

      if (response.ok) {
        handleCloseDialog();
        fetchSales(currentPage);
        fetchSalesStats();
      } else {
        const error = await response.json();
        alert(error.error || 'Error al guardar venta');
      }
    } catch (error) {
      console.error('Error submitting sale:', error);
      alert('Error al guardar venta');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteSale = async (id: number) => {
    if (!confirm('¿Estás seguro de que deseas eliminar esta venta?')) return;

    try {
      const response = await fetch(`${API_URL}/admin/sales/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        fetchSales(currentPage);
        fetchSalesStats();
      } else {
        const error = await response.json();
        alert(error.error || 'Error al eliminar venta');
      }
    } catch (error) {
      console.error('Error deleting sale:', error);
      alert('Error al eliminar venta');
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      fetchSales(1);
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch(`${API_URL}/admin/sales/search/${encodeURIComponent(searchTerm)}`, {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setSales(data.sales || []);
        setCurrentPage(1);
        setTotalPages(data.pagination?.totalPages || 1);
      }
    } catch (error) {
      console.error('Error searching sales:', error);
    } finally {
      setIsLoading(false);
    }
  };

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
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Ingresos Totales</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  ${stats.totalRevenue?.toFixed(2) || '0.00'}
                </p>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Completadas</p>
                <p className="text-2xl font-bold text-green-600">
                  {stats.salesByStatus.find(s => s.estado === 'completada')?.count || 0}
                </p>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Pendientes</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {stats.salesByStatus.find(s => s.estado === 'pendiente')?.count || 0}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Encabezado y controles */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="text-2xl font-bold dark:text-white">Gestión de Ventas</h2>
          <Button className="flex items-center gap-2" onClick={() => handleOpenDialog()}>
            <Plus className="h-4 w-4" />
            Nueva Venta
          </Button>
        </div>

        {/* Búsqueda */}
        <div className="flex gap-2">
          <div className="flex-1">
            <Input
              placeholder="Buscar ventas por producto, cliente o email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <Button variant="outline" onClick={handleSearch}>
            <Search className="h-4 w-4" />
          </Button>
          <Button variant="outline" onClick={() => {
            setSearchTerm('');
            fetchSales(1);
          }}>
            Limpiar
          </Button>
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
              {sales.map((sale) => (
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
                    <div className="flex gap-2 justify-end">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleViewDetails(sale)}
                        className="bg-white dark:bg-neutral-900 dark:hover:bg-gray-800"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenDialog(sale)}
                        className="mr-2 bg-white dark:bg-neutral-900 dark:hover:bg-gray-800"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteSale(sale.id)}
                        className="text-red-500 hover:text-red-700 bg-white dark:bg-neutral-900 dark:hover:bg-gray-800"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Paginación */}
        {totalPages > 1 && (
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
        )}
      </div>

      {/* Modal de venta */}
      <Dialog open={isOpen} onClose={handleCloseDialog} className="relative z-50 dark:text-white">
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <DialogPanel className="mx-auto max-w-md w-full rounded-lg bg-white dark:bg-neutral-900 p-6 shadow-xl max-h-[80vh] overflow-y-auto">
            <DialogTitle className="text-lg font-medium mb-4 dark:text-white">
              {editingSale ? 'Editar Venta' : 'Nueva Venta'}
            </DialogTitle>
            
            <form onSubmit={handleSaleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="usuario_id">ID Usuario</Label>
                  <Input
                    id="usuario_id"
                    type="number"
                    value={saleForm.usuario_id}
                    onChange={(e) => setSaleForm({ ...saleForm, usuario_id: parseInt(e.target.value) })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="producto_id">ID Producto</Label>
                  <Input
                    id="producto_id"
                    type="number"
                    value={saleForm.producto_id}
                    onChange={(e) => setSaleForm({ ...saleForm, producto_id: parseInt(e.target.value) })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="cantidad">Cantidad</Label>
                  <Input
                    id="cantidad"
                    type="number"
                    min="1"
                    value={saleForm.cantidad}
                    onChange={(e) => setSaleForm({ ...saleForm, cantidad: parseInt(e.target.value) })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="precio_unitario">Precio Unitario</Label>
                  <Input
                    id="precio_unitario"
                    type="number"
                    step="0.01"
                    min="0"
                    value={saleForm.precio_unitario}
                    onChange={(e) => setSaleForm({ ...saleForm, precio_unitario: parseFloat(e.target.value) })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="color">Color</Label>
                  <Input
                    id="color"
                    value={saleForm.color}
                    onChange={(e) => setSaleForm({ ...saleForm, color: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="size">Talla</Label>
                  <Input
                    id="size"
                    value={saleForm.size}
                    onChange={(e) => setSaleForm({ ...saleForm, size: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="estado">Estado</Label>
                <select
                  id="estado"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 dark:bg-neutral-800"
                  value={saleForm.estado}
                  onChange={(e) => setSaleForm({ 
                    ...saleForm, 
                    estado: e.target.value as 'pendiente' | 'procesando' | 'completada' | 'cancelada' | 'reembolsada'
                  })}
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
                <Label htmlFor="direccion_envio">Dirección de Envío</Label>
                <Input
                  id="direccion_envio"
                  value={saleForm.direccion_envio}
                  onChange={(e) => setSaleForm({ ...saleForm, direccion_envio: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="telefono_contacto">Teléfono</Label>
                <Input
                  id="telefono_contacto"
                  value={saleForm.telefono_contacto}
                  onChange={(e) => setSaleForm({ ...saleForm, telefono_contacto: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="notas">Notas</Label>
                <Textarea
                  id="notas"
                  value={saleForm.notas}
                  onChange={(e) => setSaleForm({ ...saleForm, notas: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="flex gap-2 justify-end mt-6">
                <Button type="button" variant="outline" onClick={handleCloseDialog}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Procesando...' : editingSale ? 'Actualizar' : 'Crear'} Venta
                </Button>
              </div>
            </form>
          </DialogPanel>
        </div>
      </Dialog>

      {/* Modal de detalles */}
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
    </TabsContent>
  );
};

export default AdminSales;