import React, { useState, useEffect } from 'react';
import { useCategories } from './CategoryContext';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { Button } from '../Ui/Button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../Ui/Dialog';
import { Input } from '../Ui/Input';
import { Label } from '../Ui/Label';
import { Textarea } from '../Ui/Textarea';
import { TabsContent } from '../Ui/Tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../Ui/Table';

interface Category {
    id: number;
    name: string;
    description: string;
}

const AdminCategory = () => {
  const { categories, fetchCategories } = useCategories();
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: ''
  });

  useEffect(() => {
    fetchCategories().finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = editingCategory ? 'PUT' : 'POST';
    const url = editingCategory
      ? `${import.meta.env.VITE_API_DEV}/categories/${editingCategory.id}`
      : `${import.meta.env.VITE_API_DEV}/categories`;

    try {
      const response = await fetch(url, {
        method,
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(categoryForm),
      });

      if (response.ok) {
        setIsCategoryDialogOpen(false);
        fetchCategories();
        setCategoryForm({ name: '', description: '' });
        setEditingCategory(null);
      }
    } catch (error) {
      console.error('Error submitting category:', error);
    }
  };

  const handleDeleteCategory = async (id: number) => {
    if (!confirm('¿Estás seguro de que deseas eliminar esta categoría?')) return;

    try {
      const response = await fetch(`${import.meta.env.VITE_API_DEV}/categories/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        fetchCategories();
      }
    } catch (error) {
      console.error('Error deleting category:', error);
    }
  };
  return (
    <TabsContent value="categories">
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold dark:text-white">Categorías</h2>
            <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
            <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Nueva Categoría
                </Button>
            </DialogTrigger>
            <DialogContent className='max-h-[90vh] overflow-y-auto dark:text-white'>
                <DialogHeader>
                <DialogTitle>
                    {editingCategory ? 'Editar Categoría' : 'Nueva Categoría'}
                </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCategorySubmit} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="categoryName">Nombre</Label>
                    <Input
                    id="categoryName"
                    value={categoryForm.name}
                    onChange={(e) =>
                        setCategoryForm({ ...categoryForm, name: e.target.value })
                    }
                    required
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="categoryDescription">Descripción</Label>
                    <Textarea
                    id="categoryDescription"
                    value={categoryForm.description}
                    onChange={(e) =>
                        setCategoryForm({ ...categoryForm, description: e.target.value })
                    }
                    required
                    />
                </div>
                <Button type="submit" className="w-full">
                    {editingCategory ? 'Actualizar' : 'Crear'} Categoría
                </Button>
                </form>
            </DialogContent>
            </Dialog>
        </div>

        <div className="bg-white dark:backdrop-blur-md dark:bg-black/30 dark:border dark:border-white/50 rounded-lg shadow">
            <Table>
            <TableHeader>
                <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {categories.map((category) => (
                <TableRow key={category.id}>
                    <TableCell>{category.id}</TableCell>
                    <TableCell>{category.name}</TableCell>
                    <TableCell>{category.description}</TableCell>
                    <TableCell className="text-right">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                        setEditingCategory(category);
                        setCategoryForm({
                            name: category.name,
                            description: category.description
                        });
                        setIsCategoryDialogOpen(true);
                        }}
                        className="mr-2 bg-white dark:bg-zinc-900"
                    >
                        <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteCategory(category.id)}
                        className="bg-white dark:bg-zinc-900 text-red-500 hover:text-red-700"
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                    </TableCell>
                </TableRow>
                ))}
            </TableBody>
            </Table>
        </div>
    </TabsContent>
  );
}

export default AdminCategory;
