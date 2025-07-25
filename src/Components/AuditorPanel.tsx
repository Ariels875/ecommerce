import { useState, useEffect } from 'react';
import { Navbar } from './Navbar';
import { useTheme } from './ThemeContext';
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import { Eye, Download, Search, Calendar, Filter, BarChart } from 'lucide-react';
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
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Filtros
  const [filters, setFilters] = useState({
    usuario_email: '',
    tabla_afectada: '',
    accion: '',
    fecha_inicio: '',
    fecha_fin: '',
    searchTerm: ''
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
        limit: '20',
        ...Object.fromEntries(
          Object.entries(filters).filter(([_, value]) => value && value.trim() !== '')
        )
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

  useEffect(() => {
    fetchAuditLogs(currentPage);
    fetchAuditStats();
  }, [currentPage]);

  const handleViewDetails = (log: AuditLog) => {
    setSelectedLog(log);
    setIsDetailModalOpen(true);
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchAuditLogs(1);
  };

  const handleClearFilters = () => {
    setFilters({
      usuario_email: '',
      tabla_afectada: '',
      accion: '',
      fecha_inicio: '',
      fecha_fin: '',
      searchTerm: ''
    });
    setCurrentPage(1);
    fetchAuditLogs(1);
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

  const handleSearchByTerm = async () => {
    if (!filters.searchTerm.trim()) {
      fetchAuditLogs(1);
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch(
        `${API_URL}/auditor/audit/search/${encodeURIComponent(filters.searchTerm)}`,
        { credentials: 'include' }
      );

      if (response.ok) {
        const data = await response.json();
        setLogs(data.logs || []);
        setCurrentPage(1);
        setTotalPages(data.pagination?.totalPages || 1);
      }
    } catch (error) {
      console.error('Error searching logs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && logs.length === 0) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen w-full bg-gray-50 dark:backdrop-blur-md dark:bg-black/30 dark:border dark:border-white/50 flex flex-col ${theme === 'dark' ? 'dark' : ''}`}>
      <Navbar />

      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-7xl">
        {/* Efectos visuales de fondo */}
        <div className="absolute -top-10 left-10 w-44 h-44 dark:bg-violet-500/30 blur-3xl rounded-full -z-20"></div>
        <div className="absolute bottom-20 left-50 w-44 h-44 dark:bg-indigo-500/30 blur-3xl rounded-full -z-20"></div>
        <div className="absolute top-20 right-10 w-44 h-44 dark:bg-purple-500/30 blur-3xl rounded-full -z-20"></div>
        <div className="absolute -bottom-30 right-60 w-44 h-44 dark:bg-pink-500/30 blur-3xl rounded-full -z-20"></div>
        <div className="absolute -bottom-10 right-1/4 w-44 h-44 dark:bg-fuchsia-500/30 blur-3xl rounded-full -z-20"></div>

        {/* Encabezado */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Panel de Auditoría
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Monitorea y analiza todas las actividades del sistema
          </p>
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
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            <div>
              <Label>Buscar por descripción o email</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Buscar..."
                  value={filters.searchTerm}
                  onChange={(e) => setFilters({ ...filters, searchTerm: e.target.value })}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearchByTerm()}
                />
                <Button variant="outline" onClick={handleSearchByTerm}>
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div>
              <Label>Email de Usuario</Label>
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

            <div>
              <Label>Fecha Inicio</Label>
              <Input
                type="datetime-local"
                value={filters.fecha_inicio}
                onChange={(e) => setFilters({ ...filters, fecha_inicio: e.target.value })}
              />
            </div>

            <div>
              <Label>Fecha Fin</Label>
              <Input
                type="datetime-local"
                value={filters.fecha_fin}
                onChange={(e) => setFilters({ ...filters, fecha_fin: e.target.value })}
              />
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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Usuario</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Acción</TableHead>
                <TableHead>Tabla</TableHead>
                <TableHead>Descripción</TableHead>
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
                    <div className="text-sm">
                      <div>{new Date(log.created_at).toLocaleDateString()}</div>
                      <div className="text-gray-500">{new Date(log.created_at).toLocaleTimeString()}</div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleViewDetails(log)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
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
    </div>
  );
};

export default AuditorPanel;