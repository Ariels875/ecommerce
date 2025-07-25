import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { API_URL } from './types';
import { CheckCircle, XCircle, AlertTriangle, RefreshCw, Database, Users, Package, ShoppingBag, FileText } from 'lucide-react';
import { Button } from '../Ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../Ui/Card';
import { Badge } from '../Ui/Badge';

interface SystemStats {
  sistema: {
    usuarios: number;
    productos: number;
    categorias: number;
    ventas: number;
    logs_auditoria: number;
  };
  timestamp: string;
}

interface DiagnosticResult {
  service: string;
  status: 'success' | 'error' | 'warning';
  message: string;
  details?: any;
}

const SystemDiagnostic: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [systemStats, setSystemStats] = useState<SystemStats | null>(null);
  const [diagnostics, setDiagnostics] = useState<DiagnosticResult[]>([]);
  const [lastCheck, setLastCheck] = useState<string>('');

  const runDiagnostics = async () => {
    setIsLoading(true);
    const results: DiagnosticResult[] = [];

    try {
      // Test 1: API Health Check
      try {
        const healthResponse = await fetch(`${API_URL}/health`);
        if (healthResponse.ok) {
          const healthData = await healthResponse.json();
          results.push({
            service: 'API Health',
            status: 'success',
            message: `API funcionando correctamente - v${healthData.version}`,
            details: healthData
          });
        } else {
          results.push({
            service: 'API Health',
            status: 'error',
            message: `API respondió con estado ${healthResponse.status}`
          });
        }
      } catch (error) {
        results.push({
          service: 'API Health',
          status: 'error',
          message: 'No se puede conectar con la API',
          details: error
        });
      }

      // Test 2: Authentication
      if (isAuthenticated && user) {
        results.push({
          service: 'Autenticación',
          status: 'success',
          message: `Usuario autenticado: ${user.email} (${user.rol})`,
          details: user
        });
      } else {
        results.push({
          service: 'Autenticación',
          status: 'warning',
          message: 'Usuario no autenticado'
        });
      }

      // Test 3: System Stats (solo para admins)
      if (user?.rol === 'administrador') {
        try {
          const statsResponse = await fetch(`${API_URL}/system/stats`, {
            credentials: 'include'
          });
          if (statsResponse.ok) {
            const stats = await statsResponse.json();
            setSystemStats(stats);
            results.push({
              service: 'Estadísticas del Sistema',
              status: 'success',
              message: 'Estadísticas obtenidas correctamente',
              details: stats.sistema
            });
          } else {
            results.push({
              service: 'Estadísticas del Sistema',
              status: 'error',
              message: 'Error al obtener estadísticas del sistema'
            });
          }
        } catch (error) {
          results.push({
            service: 'Estadísticas del Sistema',
            status: 'error',
            message: 'Error de conexión con estadísticas',
            details: error
          });
        }
      }

      // Test 4: Products API
      try {
        const productsResponse = await fetch(`${API_URL}/products?limit=1`);
        if (productsResponse.ok) {
          const products = await productsResponse.json();
          results.push({
            service: 'API Productos',
            status: 'success',
            message: `API de productos funcionando - ${Array.isArray(products) ? products.length : 0} productos encontrados`,
            details: { count: Array.isArray(products) ? products.length : 0 }
          });
        } else {
          results.push({
            service: 'API Productos',
            status: 'error',
            message: 'Error en API de productos'
          });
        }
      } catch (error) {
        results.push({
          service: 'API Productos',
          status: 'error',
          message: 'Error de conexión con API de productos',
        details: error
        });
      }

      // Test 5: Categories API
      try {
        const categoriesResponse = await fetch(`${API_URL}/categories`);
        if (categoriesResponse.ok) {
          const categories = await categoriesResponse.json();
          results.push({
            service: 'API Categorías',
            status: 'success',
            message: `API de categorías funcionando - ${Array.isArray(categories) ? categories.length : 0} categorías encontradas`,
            details: { count: Array.isArray(categories) ? categories.length : 0 }
          });
        } else {
          results.push({
            service: 'API Categorías',
            status: 'error',
            message: 'Error en API de categorías'
          });
        }
      } catch (error) {
        results.push({
          service: 'API Categorías',
          status: 'error',
          message: 'Error de conexión con API de categorías',
          details: error
        });
      }

      // Test 6: Audit API (solo para auditores/admins)
      if (user?.rol === 'auditor' || user?.rol === 'administrador') {
        try {
          const auditResponse = await fetch(`${API_URL}/auditor/audit?limit=1`, {
            credentials: 'include'
          });
          if (auditResponse.ok) {
            const auditData = await auditResponse.json();
            results.push({
              service: 'Sistema de Auditoría',
              status: 'success',
              message: `Sistema de auditoría funcionando - ${auditData.pagination?.total || 0} logs registrados`,
              details: auditData.pagination
            });
          } else {
            results.push({
              service: 'Sistema de Auditoría',
              status: 'error',
              message: 'Error en sistema de auditoría'
            });
          }
        } catch (error) {
          results.push({
            service: 'Sistema de Auditoría',
            status: 'error',
            message: 'Error de conexión con sistema de auditoría',
            details: error
          });
        }
      }

      // Test 7: Role-based Access
      const expectedAccess = getRoleExpectedAccess(user?.rol);
      results.push({
        service: 'Control de Acceso',
        status: 'success',
        message: `Acceso configurado para rol: ${user?.rol || 'usuario'}`,
        details: expectedAccess
      });

    } catch (error) {
      results.push({
        service: 'Diagnóstico General',
        status: 'error',
        message: 'Error durante el diagnóstico',
        details: error
      });
    }

    setDiagnostics(results);
    setLastCheck(new Date().toLocaleString());
    setIsLoading(false);
  };

  const getRoleExpectedAccess = (role?: string) => {
    switch (role) {
      case 'administrador':
        return {
          panels: ['Admin Panel', 'Operator Panel', 'Auditor Panel'],
          permissions: ['Gestión completa de usuarios', 'Todos los CRUD', 'Auditoría completa']
        };
      case 'operador':
        return {
          panels: ['Operator Panel'],
          permissions: ['CRUD Productos', 'CRUD Categorías', 'Gestión de Ventas']
        };
      case 'auditor':
        return {
          panels: ['Auditor Panel'],
          permissions: ['Visualización de logs', 'Exportación de reportes', 'Estadísticas de auditoría']
        };
      case 'usuario':
        return {
          panels: ['Ecommerce público'],
          permissions: ['Realizar compras', 'Ver historial propio']
        };
      default:
        return {
          panels: ['Ecommerce público'],
          permissions: ['Navegación pública']
        };
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  useEffect(() => {
    runDiagnostics();
  }, [user]);

  const successCount = diagnostics.filter(d => d.status === 'success').length;
  const errorCount = diagnostics.filter(d => d.status === 'error').length;
  const warningCount = diagnostics.filter(d => d.status === 'warning').length;

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Diagnóstico del Sistema
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Estado actual de todos los servicios y componentes
          </p>
        </div>
        <Button 
          onClick={runDiagnostics} 
          disabled={isLoading}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          {isLoading ? 'Ejecutando...' : 'Ejecutar Diagnóstico'}
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold text-green-600">{successCount}</p>
                <p className="text-sm text-gray-600">Servicios OK</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <XCircle className="h-8 w-8 text-red-500" />
              <div>
                <p className="text-2xl font-bold text-red-600">{errorCount}</p>
                <p className="text-sm text-gray-600">Errores</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-8 w-8 text-yellow-500" />
              <div>
                <p className="text-2xl font-bold text-yellow-600">{warningCount}</p>
                <p className="text-sm text-gray-600">Advertencias</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Database className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold text-blue-600">{diagnostics.length}</p>
                <p className="text-sm text-gray-600">Tests Ejecutados</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Stats (solo para admins) */}
      {systemStats && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Estadísticas del Sistema
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center">
                <Users className="h-8 w-8 mx-auto text-blue-500 mb-2" />
                <p className="text-2xl font-bold">{systemStats.sistema.usuarios}</p>
                <p className="text-sm text-gray-600">Usuarios</p>
              </div>
              <div className="text-center">
                <Package className="h-8 w-8 mx-auto text-green-500 mb-2" />
                <p className="text-2xl font-bold">{systemStats.sistema.productos}</p>
                <p className="text-sm text-gray-600">Productos</p>
              </div>
              <div className="text-center">
                <Database className="h-8 w-8 mx-auto text-purple-500 mb-2" />
                <p className="text-2xl font-bold">{systemStats.sistema.categorias}</p>
                <p className="text-sm text-gray-600">Categorías</p>
              </div>
              <div className="text-center">
                <ShoppingBag className="h-8 w-8 mx-auto text-orange-500 mb-2" />
                <p className="text-2xl font-bold">{systemStats.sistema.ventas}</p>
                <p className="text-sm text-gray-600">Ventas</p>
              </div>
              <div className="text-center">
                <FileText className="h-8 w-8 mx-auto text-red-500 mb-2" />
                <p className="text-2xl font-bold">{systemStats.sistema.logs_auditoria}</p>
                <p className="text-sm text-gray-600">Logs Auditoría</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Diagnostic Results */}
      <Card>
        <CardHeader>
          <CardTitle>Resultados del Diagnóstico</CardTitle>
          {lastCheck && (
            <p className="text-sm text-gray-500">Última verificación: {lastCheck}</p>
          )}
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {diagnostics.map((diagnostic, index) => (
              <div 
                key={index}
                className="flex items-start justify-between p-4 border rounded-lg"
              >
                <div className="flex items-start space-x-3">
                  {getStatusIcon(diagnostic.status)}
                  <div>
                    <h4 className="font-medium">{diagnostic.service}</h4>
                    <p className="text-sm text-gray-600">{diagnostic.message}</p>
                    {diagnostic.details && (
                      <details className="mt-2">
                        <summary className="text-xs text-blue-600 cursor-pointer">
                          Ver detalles
                        </summary>
                        <pre className="text-xs bg-gray-100 p-2 rounded mt-1 overflow-auto">
                          {JSON.stringify(diagnostic.details, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
                <Badge className={getStatusColor(diagnostic.status)}>
                  {diagnostic.status.toUpperCase()}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* User Info */}
      {user && (
        <Card>
          <CardHeader>
            <CardTitle>Información del Usuario Actual</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-2">Datos del Usuario</h4>
                <div className="space-y-1 text-sm">
                  <p><strong>Nombre:</strong> {user.nombre}</p>
                  <p><strong>Email:</strong> {user.email}</p>
                  <p><strong>Rol:</strong> <Badge>{user.rol}</Badge></p>
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-2">Acceso Esperado</h4>
                <div className="space-y-1 text-sm">
                  {getRoleExpectedAccess(user.rol).panels.map((panel, index) => (
                    <p key={index}>✅ {panel}</p>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Instrucciones de Uso</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <p>🔍 <strong>Para probar el sistema de auditoría:</strong></p>
            <ol className="list-decimal list-inside space-y-1 ml-4">
              <li>Realiza operaciones CRUD en productos, categorías o usuarios</li>
              <li>Ve al Panel de Auditoría para verificar que se registraron</li>
              <li>Prueba los filtros y exportación de logs</li>
              <li>Verifica que cada rol tenga los permisos correctos</li>
            </ol>
            
            <p className="mt-4">📧 <strong>Usuarios de prueba disponibles:</strong></p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li><code>admin@arielsstore.com</code> (admin123) - Administrador</li>
              <li><code>operador@arielsstore.com</code> (operador123) - Operador</li>
              <li><code>auditor@arielsstore.com</code> (auditor123) - Auditor</li>
              <li><code>cliente@email.com</code> (usuario123) - Usuario</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SystemDiagnostic;