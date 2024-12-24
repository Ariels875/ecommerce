import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogPanel } from '@headlessui/react';
import ImageUpload from './ImageUpload';
import { useCategories } from './CategoryContext';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { Button } from '../Ui/Button';
import { Input } from '../Ui/Input';
import { Label } from '../Ui/Label';
import { Textarea } from '../Ui/Textarea';
import { TabsContent } from '../Ui/Tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../Ui/Table';
import { Product } from './types';
import { fetchNewProducts, submitProduct, deleteProduct } from '../api/products';


const initialFormState = {
    name: '',
    description: '',
    price: 0,
    stock: 0,
    category_id: null as number | null,
    colors: '',
    sizes: '',
    images: ''
};

const AdminProduct = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [selectedImages, setSelectedImages] = useState<File[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { categories } = useCategories();
    const [isOpen, setIsOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [productForm, setProductForm] = useState(initialFormState);

    useEffect(() => {
        const loadProducts = async () => {
            try {
                const products = await fetchNewProducts();
                setProducts(products);
            } catch (error) {
                console.error('Error loading products:', error);
            } finally {
                setIsLoading(false);
            }
        };
    
        loadProducts();
    }, []);

    const handleOpenDialog = (product: Product | null = null) => {
        if (product) {
            setEditingProduct(product);
            setProductForm({
                name: product.name,
                description: product.description,
                price: product.price,
                stock: product.stock,
                category_id: product.category_id,
                colors: product.colors.join(', '),
                sizes: product.sizes.join(', '),
                images: product.images.join(', ')
            });
        } else {
            setEditingProduct(null);
            setProductForm(initialFormState);
        }
        setIsOpen(true);
    };

    const handleCloseDialog = () => {
        setIsOpen(false);
        setEditingProduct(null);
        setProductForm(initialFormState);
        setSelectedImages([]);
    };

    const handleProductSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isSubmitting) return;

        setIsSubmitting(true);
        try {
            const success = await submitProduct(productForm, editingProduct, selectedImages);
            if (success) {
                handleSuccess();
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteProduct = async (id: number) => {
        if (!confirm('¿Estás seguro de que deseas eliminar este producto?')) return;

        const success = await deleteProduct(id);
        if (success) {
            fetchNewProducts();
        }
    };

    const handleSuccess = () => {
        handleCloseDialog();
        fetchNewProducts();
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <TabsContent value="products">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold dark:text-white">Productos</h2>
                <Button className="flex items-center gap-2" onClick={() => handleOpenDialog()}>
                    <Plus className="h-4 w-4" />
                    Nuevo Producto
                </Button>
            </div>

            <Dialog open={isOpen} onClose={handleCloseDialog} className="relative z-50 dark:text-white">
                <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
                
                <div className="fixed inset-0 flex items-center justify-center p-4">
                    <DialogPanel className="mx-auto max-w-xl w-full sm:max-w-sm md:max-w-md rounded-lg bg-white dark:bg-neutral-900 p-6 shadow-xl max-h-[80vh] overflow-y-auto">
                        <DialogTitle className="text-lg font-medium mb-4 dark:text-white">
                            {editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
                        </DialogTitle>
                        
                        <form onSubmit={handleProductSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Nombre</Label>
                                <Input
                                    id="name"
                                    value={productForm.name}
                                    onChange={(e) =>
                                        setProductForm({ ...productForm, name: e.target.value })
                                    }
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="description">Descripción</Label>
                                <Textarea
                                    id="description"
                                    value={productForm.description}
                                    onChange={(e) =>
                                        setProductForm({ ...productForm, description: e.target.value })
                                    }
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="price">Precio</Label>
                                    <Input
                                        id="price"
                                        type="number"
                                        value={productForm.price}
                                        onChange={(e) =>
                                            setProductForm({
                                                ...productForm,
                                                price: parseFloat(e.target.value)
                                            })
                                        }
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="stock">Stock</Label>
                                    <Input
                                        id="stock"
                                        type="number"
                                        value={productForm.stock}
                                        onChange={(e) =>
                                            setProductForm({
                                                ...productForm,
                                                stock: parseInt(e.target.value)
                                            })
                                        }
                                        required
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="category">Categoría</Label>
                                <select
                                    id="category"
                                    className="w-full rounded-md border border-input bg-background px-3 py-2 dark:bg-neutral-800"
                                    value={productForm.category_id || ''}
                                    onChange={(e) =>
                                        setProductForm({
                                            ...productForm,
                                            category_id: parseInt(e.target.value) || null
                                        })
                                    }
                                >
                                    <option value="">Sin categoría</option>
                                    {categories.map((category) => (
                                        <option key={category.id} value={category.id}>
                                            {category.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="colors">Colores (separados por coma)</Label>
                                <Input
                                    id="colors"
                                    value={productForm.colors}
                                    onChange={(e) =>
                                        setProductForm({ ...productForm, colors: e.target.value })
                                    }
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="sizes">Tallas (separadas por coma)</Label>
                                <Input
                                    id="sizes"
                                    value={productForm.sizes}
                                    onChange={(e) =>
                                        setProductForm({ ...productForm, sizes: e.target.value })
                                    }
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Imágenes</Label>
                                <ImageUpload onChange={setSelectedImages} />
                                {selectedImages.length > 0 && (
                                    <p className="text-sm text-gray-500">
                                        {selectedImages.length} {selectedImages.length === 1 ? 'imagen seleccionada' : 'imágenes seleccionadas'}
                                    </p>
                                )}
                            </div>
                            <div className="flex gap-2 justify-end mt-6">
                                <Button type="button" variant="outline" onClick={handleCloseDialog}>
                                    Cancelar
                                </Button>
                                <Button type="submit" disabled={isSubmitting}>
                                    {isSubmitting ? 'Procesando...' : editingProduct ? 'Actualizar' : 'Crear'} Producto
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
                            <TableHead>Precio</TableHead>
                            <TableHead>Stock</TableHead>
                            <TableHead>Categoría</TableHead>
                            <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {products.map((product) => (
                            <TableRow key={product.id}>
                                <TableCell>{product.id}</TableCell>
                                <TableCell>{product.name}</TableCell>
                                <TableCell>${product.price}</TableCell>
                                <TableCell>{product.stock}</TableCell>
                                <TableCell>
                                    {categories.find(c => c.id === product.category_id)?.name || 'Sin categoría'}
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleOpenDialog(product)}
                                        className="mr-2 bg-white dark:bg-neutral-900 dark:hover:bg-gray-800"
                                    >
                                        <Pencil className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleDeleteProduct(product.id)}
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

export default AdminProduct;