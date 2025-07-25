import React, { useState, useEffect } from 'react';
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import { Pencil, Plus, Trash2, User, Search } from 'lucide-react';
import { Button } from '../Ui/Button';
import { Input } from '../Ui/Input';
import { Label } from '../Ui/Label';
import { TabsContent } from '../Ui/Tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../Ui/Table';
import { Badge } from '../Ui/Badge';
import { API_URL } from './types';

interface User {
  id: number;
  nombre: string;
  email: string;
  direccion?: string;
  telefono?: string;
  rol: 'administrador' | 'operador' | 'auditor' | 'usuario';
  created_at: string;
}

interface UserFormData {
  nombre: string;
  email: string;
  contraseña: string;
  direccion: string;
  telefono: string;
  rol: 'administrador' | 'operador' | 'auditor' | 'usuario';
}

interface UserStats {
  totalUsers: number;
  usersByRole: Array<{ rol: string; count: number }>;
  mostActiveUsers: Array<{ nombre: string; email: string; total_ventas: number; total_gastado: number }>;
}

const initialFormState: UserFormData = {
  nombre: '',
  email: '',
  contraseña: '',
  direccion: '',
  telefono: '',
  rol: 'usuario'
};

const AdminUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userForm, setUserForm] = useState<UserFormData>(initialFormState);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const roleColors = {
    administrador: 'bg-red-100 text-red-800',
    operador: 'bg-blue-100 text-blue-800',
    auditor: 'bg-purple-100 text-purple-800',
    usuario: 'bg-gray-100 text-gray-800'
  };

  const roleLabels = {
    administrador: 'Administrador',
    operador: 'Operador',
    auditor: 'Auditor',
    usuario: 'Usuario'
  };

  const fetchUsers = async (page = 1) => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_URL}/admin/users?page=${page}&limit=20`, {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Error al obtener usuarios');
      }

      const data = await response.json();
      setUsers(data.users || []);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserStats = async () => {
    try {
      const response = await fetch(`${API_URL}/admin/users/stats/overview`, {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching user stats:', error);
    }
  };

  useEffect(() => {
    fetchUsers(currentPage);
    fetchUserStats();
  }, [currentPage]);

  const handleOpenDialog = (user: User | null = null) => {
    if (user) {
      setEditingUser(user);
      setUserForm({
        nombre: user.nombre,
        email: user.email,
        contraseña: '', // No mostramos la contraseña actual
        direccion: user.direccion || '',
        telefono: user.telefono || '',
        rol: user.rol
      });
    } else {
      setEditingUser(null);
      setUserForm(initialFormState);
    }
    setIsOpen(true);
  };

  const handleCloseDialog = () => {
    setIsOpen(false);
    setEditingUser(null);
    setUserForm(initialFormState);
  };

  const handleUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      const method = editingUser ? 'PUT' : 'POST';
      const url = editingUser
        ? `${API_URL}/admin/users/${editingUser.id}`
        : `${API_URL}/admin/users`;

      // Para edición, solo enviar contraseña si se proporcionó una nueva
      const submitData = { ...userForm };
      if (editingUser && !submitData.contraseña) {
        delete submitData.contraseña;
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(submitData),
      });

      if (response.ok) {
        handleCloseDialog();
        fetchUsers(currentPage);
        fetchUserStats();
      } else {
        const error = await response.json();
        alert(error.error || 'Error al guardar usuario');
      }
    } catch (error) {
      console.error('Error submitting user:', error);
      alert('Error al guardar usuario');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUser = async (id: number) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este usuario?')) return;

    try {
      const response = await fetch(`${API_URL}/admin/users/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        fetchUsers(currentPage);
        fetchUserStats();
      } else {
        const error = await response.json();
        alert(error.error || 'Error al eliminar usuario');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Error al eliminar usuario');
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      fetchUsers(1);
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch(`${API_URL}/admin/users/search/${encodeURIComponent(searchTerm)}`, {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
        setCurrentPage(1);
        setTotalPages(data.pagination?.totalPages || 1);
      }
    } catch (error) {
      console.error('Error searching users:', error);
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
    <TabsContent value="users">
      <div className="space-y-6">
        {/* Estadísticas */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
              <div className="flex items-center">
                <User className="h-8 w-8 text-blue-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Usuarios</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalUsers}</p>
                </div>
              </div>
            </div>
            {stats.usersByRole.map((role) => (
              <div key={role.rol} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    {roleLabels[role.rol as keyof typeof roleLabels]}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{role.count}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Encabezado y controles */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="text-2xl font-bold dark:text-white">Gestión de Usuarios</h2>
          <Button className="flex items-center gap-2" onClick={() => handleOpenDialog()}>
            <Plus className="h-4 w-4" />
            Nuevo Usuario
          </Button>
        </div>

        {/* Búsqueda */}
        <div className="flex gap-2">
          <div className="flex-1">
            <Input
              placeholder="Buscar usuarios por nombre o email..."
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
            fetchUsers(1);
          }}>
            Limpiar
          </Button>
        </div>

        {/* Tabla de usuarios */}
        <div className="bg-white dark:backdrop-blur-md dark:bg-black/30 dark:border dark:border-white/50 rounded-lg shadow">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Teléfono</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Fecha de Registro</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.id}</TableCell>
                  <TableCell className="font-medium">{user.nombre}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.telefono || '-'}</TableCell>
                  <TableCell>
                    <Badge className={roleColors[user.rol]}>
                      {roleLabels[user.rol]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(user.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleOpenDialog(user)}
                      className="mr-2 bg-white dark:bg-neutral-900 dark:hover:bg-gray-800"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteUser(user.id)}
                      className="text-red-500 hover:text-red-700 bg-white dark:bg-neutral-900 dark:hover:bg-gray-800"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
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

      {/* Modal de usuario */}
      <Dialog open={isOpen} onClose={handleCloseDialog} className="relative z-50 dark:text-white">
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <DialogPanel className="mx-auto max-w-md w-full rounded-lg bg-white dark:bg-neutral-900 p-6 shadow-xl max-h-[80vh] overflow-y-auto">
            <DialogTitle className="text-lg font-medium mb-4 dark:text-white">
              {editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}
            </DialogTitle>
            
            <form onSubmit={handleUserSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre</Label>
                <Input
                  id="nombre"
                  value={userForm.nombre}
                  onChange={(e) => setUserForm({ ...userForm, nombre: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={userForm.email}
                  onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contraseña">
                  {editingUser ? 'Nueva Contraseña (dejar vacío para mantener actual)' : 'Contraseña'}
                </Label>
                <Input
                  id="contraseña"
                  type="password"
                  value={userForm.contraseña}
                  onChange={(e) => setUserForm({ ...userForm, contraseña: e.target.value })}
                  required={!editingUser}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="telefono">Teléfono</Label>
                <Input
                  id="telefono"
                  value={userForm.telefono}
                  onChange={(e) => setUserForm({ ...userForm, telefono: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="direccion">Dirección</Label>
                <Input
                  id="direccion"
                  value={userForm.direccion}
                  onChange={(e) => setUserForm({ ...userForm, direccion: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="rol">Rol</Label>
                <select
                  id="rol"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 dark:bg-neutral-800"
                  value={userForm.rol}
                  onChange={(e) => setUserForm({ 
                    ...userForm, 
                    rol: e.target.value as 'administrador' | 'operador' | 'auditor' | 'usuario'
                  })}
                  required
                >
                  <option value="usuario">Usuario</option>
                  <option value="operador">Operador</option>
                  <option value="auditor">Auditor</option>
                  <option value="administrador">Administrador</option>
                </select>
              </div>

              <div className="flex gap-2 justify-end mt-6">
                <Button type="button" variant="outline" onClick={handleCloseDialog}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Procesando...' : editingUser ? 'Actualizar' : 'Crear'} Usuario
                </Button>
              </div>
            </form>
          </DialogPanel>
        </div>
      </Dialog>
    </TabsContent>
  );
};

export default AdminUsers;