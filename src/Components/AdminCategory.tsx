import React, { useState, useEffect } from 'react';
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import { useCategories } from './CategoryContext';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { Button } from '../Ui/Button';
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

const initialFormState = {
    name: '',
    description: ''
};

const AdminCategory = () => {
    const { categories, fetchCategories } = useCategories();
    const [isOpen, setIsOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [categoryForm, setCategoryForm] = useState(initialFormState);

    useEffect(() => {
        fetchCategories().finally(() => setIsLoading(false));
    }, []);

    const handleOpenDialog = (category: Category | null = null) => {
        if (category) {
            setEditingCategory(category);
            setCategoryForm({
                name: category.name,
                description: category.description
            });
        } else {
            setEditingCategory(null);
            setCategoryForm(initialFormState);
        }
        setIsOpen(true);
    };

    const handleCloseDialog = () => {
        setIsOpen(false);
        setEditingCategory(null);
        setCategoryForm(initialFormState);
    };

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
                handleCloseDialog();
                fetchCategories();
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

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <TabsContent value="categories">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold dark:text-white">Categorías</h2>
                <Button className="flex items-center gap-2" onClick={() => handleOpenDialog()}>
                    <Plus className="h-4 w-4" />
                    Nueva Categoría
                </Button>
            </div>

            <Dialog open={isOpen} onClose={handleCloseDialog} className="relative z-50 dark:text-white">
                <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
                
                <div className="fixed inset-0 flex items-center justify-center p-4">
                    <DialogPanel className="mx-auto max-w-xl w-full sm:max-w-sm md:max-w-md rounded-lg bg-white dark:bg-neutral-900 p-6 shadow-xl max-h-[80vh] overflow-y-auto">
                        <DialogTitle className="text-lg font-medium mb-4 dark:text-white">
                            {editingCategory ? 'Editar Categoría' : 'Nueva Categoría'}
                        </DialogTitle>
                        
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
                            <div className="flex gap-2 justify-end mt-6">
                                <Button type="button" variant="outline" onClick={handleCloseDialog}>
                                    Cancelar
                                </Button>
                                <Button type="submit">
                                    {editingCategory ? 'Actualizar' : 'Crear'} Categoría
                                </Button>
                            </div>
                        </form>
                    </DialogPanel>
                </div>
            </Dialog>

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
                                        onClick={() => handleOpenDialog(category)}
                                        className="mr-2 bg-white dark:bg-neutral-900 dark:hover:bg-gray-800"
                                    >
                                        <Pencil className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleDeleteCategory(category.id)}
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
        </TabsContent>
    );
};

export default AdminCategory;