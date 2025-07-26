import { useState, useEffect } from 'react';
import { Navbar } from './Navbar';
import { useTheme } from './ThemeContext';
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import { Eye, Download, Filter, BarChart, Edit, Trash2, Plus, Star } from 'lucide-react';
import { Button } from '../Ui/Button';
import { Input } from '../Ui/Input';
import { Label } from '../Ui/Label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../Ui/Table';
import { Badge } from '../Ui/Badge';
import { API_URL } from './types';

interface AuditLog {
  id: number;
  usuario_id: number;
  usuario_email: string;
  usuario_rol: string;
  accion: 'CREATE' | 'READ' | 'UPDATE' | 'DELETE';
  tabla_afectada: string;
  registro_id?: number;
  datos_anteriores?: Record<string, unknown>;
  datos_nuevos?: Record<string, unknown>;
  descripcion: string;
  escalaLiker?: string;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

interface AuditStats {
  totalLogs: number;
  logsByAction: Array<{ accion: string; count: number }>;
  logsByTable: Array<{ tabla_afectada: string; count: number }>;
  mostActiveUsers: Array<{ usuario_email: string; usuario_rol: string; actividad_count: number }>;
  dailyActivity: Array<{ fecha: string; count: number }>;
}

const AuditorPanel = () => {
  const { theme } = useTheme();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [stats, setStats] = useState<AuditStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Filtros
  const [filters, setFilters] = useState({
    usuario_email: '',
    tabla_afectada: '',
    accion: '',
    searchTerm: ''
  });

  // Form para crear/editar
  const [auditForm, setAuditForm] = useState({
    descripcion: '',
    escalaLiker: '1',
    tabla_afectada: 'sistema',
    accion: 'READ' as 'CREATE' | 'READ' | 'UPDATE' | 'DELETE'
  });

  const actionColors = {
    CREATE: 'bg-green-100 text-green-800',
    READ: 'bg-blue-100 text-blue-800',
    UPDATE: 'bg-yellow-100 text-yellow-800',
    DELETE: 'bg-red-100 text-red-800'
  };

  const roleColors = {
    administrador: 'bg-red-100 text-red-800',
    operador: 'bg-blue-100 text-blue-800',
    auditor: 'bg-purple-100 text-purple-800',
    usuario: 'bg-gray-100 text-gray-800'
  };

  const fetchAuditLogs = async (page = 1) => {
    try {
      setIsLoading(true);
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: '20'
      });

      // Solo agregar filtros que tengan valor
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value.trim() !== '') {
          // Para el email, usar búsqueda exacta
          if (key === 'usuario_email') {
            queryParams.append('usuario_email_exact', value.trim());
          } else {
            queryParams.append(key, value);
          }
        }
      });

      const response = await fetch(`${API_URL}/auditor/audit?${queryParams}`, {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Error al obtener logs de auditoría');
      }

      const data = await response.json();
      setLogs(data.logs || []);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      setLogs([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAuditStats = async () => {
    try {
      const response = await fetch(`${API_URL}/auditor/audit/stats`, {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching audit stats:', error);
    }
  };

  // Cargar datos al iniciar
  useEffect(() => {
    fetchAuditLogs(1);
    fetchAuditStats();
  }, []);

  // Recargar cuando cambien los filtros
  useEffect(() => {
    if (currentPage === 1) {
      fetchAuditLogs(1);
    } else {
      setCurrentPage(1);
    }
  }, [filters]);

  // Recargar cuando cambie la página
  useEffect(() => {
    fetchAuditLogs(currentPage);
  }, [currentPage]);

  const handleViewDetails = (log: AuditLog) => {
    setSelectedLog(log);
    setIsDetailModalOpen(true);
  };

  const handleEditLog = (log: AuditLog) => {
    setSelectedLog(log);
    setAuditForm({
      descripcion: log.descripcion,
      escalaLiker: log.escalaLiker || '1',
      tabla_afectada: log.tabla_afectada,
      accion: log.accion
    });
    setIsEditModalOpen(true);
  };

  const handleCreateLog = () => {
    setAuditForm({
      descripcion: '',
      escalaLiker: '1',
      tabla_afectada: 'sistema',
      accion: 'READ'
    });
    setIsCreateModalOpen(true);
  };

  const handleSubmitAudit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const method = selectedLog ? 'PUT' : 'POST';
      const url = selectedLog 
        ? `${API_URL}/admin/audit/${selectedLog.id}` 
        : `${API_URL}/admin/audit`;

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(auditForm)
      });

      if (response.ok) {
        setIsEditModalOpen(false);
        setIsCreateModalOpen(false);
        fetchAuditLogs(currentPage);
        fetchAuditStats();
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Error al guardar el log');
      }
    } catch (error) {
      console.error('Error submitting audit:', error);
      alert('Error al guardar el log');
    }
  };

  const handleDeleteLog = async (id: number) => {
    if (!confirm('¿Estás seguro de eliminar este log?')) return;

    try {
      const response = await fetch(`${API_URL}/admin/audit/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        fetchAuditLogs(currentPage);
        fetchAuditStats();
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Error al eliminar el log');
      }
    } catch (error) {
      console.error('Error deleting log:', error);
      alert('Error al eliminar el log');
    }
  };

  const handleSearch = () => {
    // Los filtros se aplicarán automáticamente por el useEffect
  };

  const handleClearFilters = () => {
    setFilters({
      usuario_email: '',
      tabla_afectada: '',
      accion: '',
      searchTerm: ''
    });
  };

  const handleExportCSV = async () => {
    try {
      const response = await fetch(`${API_URL}/auditor/audit/export/csv`, {
        credentials: 'include'
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `audit_logs_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        alert('Error al exportar logs');
      }
    } catch (error) {
      console.error('Error exporting logs:', error);
      alert('Error al exportar logs');
    }
  };

  return (
    <div className={`min-h-screen w-full bg-gray-50 dark:backdrop-blur-md dark:bg-black/30 dark:border dark:border-white/50 flex flex-col ${theme === 'dark' ? 'dark' : ''}`}>
      <Navbar />

      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-7xl">
        {/* Efectos visuales de fondo */}
        <div className="absolute -top-10 left-10 w-44 h-44 dark:bg-violet-500/30 blur-3xl rounded-full -z-20"></div>
        <div className="absolute bottom-20 left-50 w-44 h-44 dark:bg-indigo-500/30 blur-3xl rounded-full -z-20"></div>
        <div className="absolute top-20 right-10 w-44 h-44 dark:bg-purple-500/30 blur-3xl rounded-full -z-20"></div>

        {/* Encabezado */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Panel de Auditoría
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                Monitorea y gestiona todas las actividades del sistema
              </p>
            </div>
            <Button onClick={handleCreateLog} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Nuevo Log
            </Button>
          </div>
        </div>

        {/* Estadísticas */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
              <div className="flex items-center">
                <BarChart className="h-8 w-8 text-blue-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Logs</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalLogs}</p>
                </div>
              </div>
            </div>
            {stats.logsByAction.slice(0, 4).map((action) => (
              <div key={action.accion} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{action.accion}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{action.count}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Filtros y búsqueda */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow mb-6">
          <h3 className="text-lg font-medium mb-4 dark:text-white">Filtros de Búsqueda</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div>
              <Label>Buscar por descripción</Label>
              <Input
                placeholder="Buscar..."
                value={filters.searchTerm}
                onChange={(e) => setFilters({ ...filters, searchTerm: e.target.value })}
              />
            </div>

            <div>
              <Label>Email de Usuario (exacto)</Label>
              <Input
                placeholder="usuario@email.com"
                value={filters.usuario_email}
                onChange={(e) => setFilters({ ...filters, usuario_email: e.target.value })}
              />
            </div>

            <div>
              <Label>Tabla Afectada</Label>
              <select
                className="w-full rounded-md border border-input bg-background px-3 py-2"
                value={filters.tabla_afectada}
                onChange={(e) => setFilters({ ...filters, tabla_afectada: e.target.value })}
              >
                <option value="">Todas las tablas</option>
                <option value="usuarios">Usuarios</option>
                <option value="productos">Productos</option>
                <option value="categorias">Categorías</option>
                <option value="ventas">Ventas</option>
                <option value="sistema">Sistema</option>
              </select>
            </div>

            <div>
              <Label>Acción</Label>
              <select
                className="w-full rounded-md border border-input bg-background px-3 py-2"
                value={filters.accion}
                onChange={(e) => setFilters({ ...filters, accion: e.target.value })}
              >
                <option value="">Todas las acciones</option>
                <option value="CREATE">CREATE</option>
                <option value="READ">READ</option>
                <option value="UPDATE">UPDATE</option>
                <option value="DELETE">DELETE</option>
              </select>
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleSearch} className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Aplicar Filtros
            </Button>
            <Button variant="outline" onClick={handleClearFilters}>
              Limpiar Filtros
            </Button>
            <Button variant="outline" onClick={handleExportCSV} className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Exportar CSV
            </Button>
          </div>
        </div>

        {/* Tabla de logs */}
        <div className="bg-white dark:backdrop-blur-md dark:bg-black/30 dark:border dark:border-white/50 rounded-lg shadow">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Usuario</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead>Acción</TableHead>
                  <TableHead>Tabla</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead>Escala Likert</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>#{log.id}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="font-medium">{log.usuario_email}</div>
                        <div className="text-gray-500">ID: {log.usuario_id}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={roleColors[log.usuario_rol as keyof typeof roleColors]}>
                        {log.usuario_rol}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={actionColors[log.accion]}>
                        {log.accion}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono">{log.tabla_afectada}</TableCell>
                    <TableCell className="max-w-xs truncate">{log.descripcion}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {Array.from({length: parseInt(log.escalaLiker || '0')}).map((_, i) => (
                          <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        ))}
                        <span className="text-sm ml-2">{log.escalaLiker || 'Sin calificar'}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{new Date(log.created_at).toLocaleDateString()}</div>
                        <div className="text-gray-500">{new Date(log.created_at).toLocaleTimeString()}</div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleViewDetails(log)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditLog(log)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteLog(log.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>

        {/* Paginación */}
        {totalPages > 1 && (
          <div className="flex justify-center space-x-2 mt-6">
            <Button
              variant="outline"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
            >
              Anterior
            </Button>
            <span className="flex items-center px-4 py-2 text-sm dark:text-white">
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
      </main>

      {/* Modal de detalles del log */}
      <Dialog open={isDetailModalOpen} onClose={() => setIsDetailModalOpen(false)} className="relative z-50">
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <DialogPanel className="mx-auto max-w-4xl w-full rounded-lg bg-white dark:bg-neutral-900 p-6 shadow-xl max-h-[80vh] overflow-y-auto">
            <DialogTitle className="text-lg font-medium mb-4 dark:text-white">
              Detalles del Log de Auditoría #{selectedLog?.id}
            </DialogTitle>
            
            {selectedLog && (
              <div className="space-y-6">
                {/* Información básica */}
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-2 dark:text-white">Información del Usuario</h4>
                    <div className="space-y-2 text-sm">
                      <div><strong>ID:</strong> {selectedLog.usuario_id}</div>
                      <div><strong>Email:</strong> {selectedLog.usuario_email}</div>
                      <div><strong>Rol:</strong> 
                        <Badge className={`ml-2 ${roleColors[selectedLog.usuario_rol as keyof typeof roleColors]}`}>
                          {selectedLog.usuario_rol}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2 dark:text-white">Información de la Acción</h4>
                    <div className="space-y-2 text-sm">
                      <div><strong>Acción:</strong> 
                        <Badge className={`ml-2 ${actionColors[selectedLog.accion]}`}>
                          {selectedLog.accion}
                        </Badge>
                      </div>
                      <div><strong>Tabla:</strong> {selectedLog.tabla_afectada}</div>
                      {selectedLog.registro_id && (
                        <div><strong>ID Registro:</strong> {selectedLog.registro_id}</div>
                      )}
                      <div><strong>Fecha:</strong> {new Date(selectedLog.created_at).toLocaleString()}</div>
                      <div><strong>Escala Likert:</strong> {selectedLog.escalaLiker || 'Sin calificar'}</div>
                    </div>
                  </div>
                </div>

                {/* Descripción */}
                <div>
                  <h4 className="font-medium mb-2 dark:text-white">Descripción</h4>
                  <p className="text-sm p-3 bg-gray-50 dark:bg-gray-800 rounded">{selectedLog.descripcion}</p>
                </div>

                {/* Información técnica */}
                {(selectedLog.ip_address || selectedLog.user_agent) && (
                  <div>
                    <h4 className="font-medium mb-2 dark:text-white">Información Técnica</h4>
                    <div className="space-y-2 text-sm">
                      {selectedLog.ip_address && (
                        <div><strong>IP:</strong> {selectedLog.ip_address}</div>
                      )}
                      {selectedLog.user_agent && (
                        <div><strong>User Agent:</strong> {selectedLog.user_agent}</div>
                      )}
                    </div>
                  </div>
                )}

                {/* Datos anteriores y nuevos */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {selectedLog.datos_anteriores && (
                    <div>
                      <h4 className="font-medium mb-2 dark:text-white">Datos Anteriores</h4>
                      <pre className="text-xs p-3 bg-red-50 dark:bg-red-900/20 rounded overflow-auto max-h-40">
                        {JSON.stringify(selectedLog.datos_anteriores, null, 2)}
                      </pre>
                    </div>
                  )}
                  
                  {selectedLog.datos_nuevos && (
                    <div>
                      <h4 className="font-medium mb-2 dark:text-white">Datos Nuevos</h4>
                      <pre className="text-xs p-3 bg-green-50 dark:bg-green-900/20 rounded overflow-auto max-h-40">
                        {JSON.stringify(selectedLog.datos_nuevos, null, 2)}
                      </pre>
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

      {/* Modal de crear/editar log */}
      <Dialog open={isEditModalOpen || isCreateModalOpen} onClose={() => {
        setIsEditModalOpen(false);
        setIsCreateModalOpen(false);
      }} className="relative z-50">
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <DialogPanel className="mx-auto max-w-md w-full rounded-lg bg-white dark:bg-neutral-900 p-6 shadow-xl">
            <DialogTitle className="text-lg font-medium mb-4 dark:text-white">
              {selectedLog ? 'Editar Log de Auditoría' : 'Crear Log de Auditoría'}
            </DialogTitle>
            
            <form onSubmit={handleSubmitAudit} className="space-y-4">
              <div>
                <Label htmlFor="descripcion">Descripción</Label>
                <Input
                  id="descripcion"
                  value={auditForm.descripcion}
                  onChange={(e) => setAuditForm({ ...auditForm, descripcion: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="tabla_afectada">Tabla Afectada</Label>
                <select
                  id="tabla_afectada"
                  className="w-full rounded-md border border-input bg-background px-3 py-2"
                  value={auditForm.tabla_afectada}
                  onChange={(e) => setAuditForm({ ...auditForm, tabla_afectada: e.target.value })}
                  required
                >
                  <option value="sistema">Sistema</option>
                  <option value="usuarios">Usuarios</option>
                  <option value="productos">Productos</option>
                  <option value="categorias">Categorías</option>
                  <option value="ventas">Ventas</option>
                </select>
              </div>

              <div>
                <Label htmlFor="accion">Acción</Label>
                <select
                  id="accion"
                  className="w-full rounded-md border border-input bg-background px-3 py-2"
                  value={auditForm.accion}
                  onChange={(e) => setAuditForm({ ...auditForm, accion: e.target.value as 'CREATE' | 'READ' | 'UPDATE' | 'DELETE' })}
                  required
                >
                  <option value="CREATE">CREATE</option>
                  <option value="READ">READ</option>
                  <option value="UPDATE">UPDATE</option>
                  <option value="DELETE">DELETE</option>
                </select>
              </div>

              <div>
                <Label htmlFor="escalaLiker">Escala Likert (1-5)</Label>
                <select
                  id="escalaLiker"
                  className="w-full rounded-md border border-input bg-background px-3 py-2"
                  value={auditForm.escalaLiker}
                  onChange={(e) => setAuditForm({ ...auditForm, escalaLiker: e.target.value })}
                  required
                >
                  <option value="1">1 - Muy malo</option>
                  <option value="2">2 - Malo</option>
                  <option value="3">3 - Regular</option>
                  <option value="4">4 - Bueno</option>
                  <option value="5">5 - Muy bueno</option>
                </select>
              </div>
              
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => {
                  setIsEditModalOpen(false);
                  setIsCreateModalOpen(false);
                }}>
                  Cancelar
                </Button>
                <Button type="submit">
                  {selectedLog ? 'Actualizar' : 'Crear'}
                </Button>
              </div>
            </form>
          </DialogPanel>
        </div>
      </Dialog>
    </div>
  );
};

export default AuditorPanel;