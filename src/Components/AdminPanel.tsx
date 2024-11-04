import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, Edit, Trash2, LogOut, Home, Loader2 } from 'lucide-react';
import { Toast, ToastTitle, ToastDescription } from '../Ui/Toast';
import { Button } from '../Ui/Button';
import { Input } from '../Ui/Input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../Ui/Select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../Ui/Table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../Ui/Dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../Ui/AlertDialog";
import { Card, CardContent, CardHeader, CardTitle } from "../Ui/Card";

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  category_id: number;
  colors: string[];
  sizes: string[];
  images: string[];
}

const AdminPanel = () => {
  const navigate = useNavigate();
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState({ title: '', description: '', variant: 'default' as 'default' | 'destructive' });
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const showToastMessage = (title: string, description: string, variant: 'default' | 'destructive' = 'default') => {
    setToastMessage({ title, description, variant });
    setShowToast(true);
  };
  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/products');
      if (!response.ok) throw new Error('Error al cargar productos');
      const data: Product[] = await response.json();
      setProducts(data);
    } catch (error) {
      const errorMessage = (error as Error).message;
      showToastMessage(
        "Error",
        "No se pudieron cargar los productos" + errorMessage,
        "destructive"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      if (!response.ok) throw new Error('Error al cargar categorías');
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      const errorMessage = (error as Error).message;
      showToastMessage(
        "Error",
        "No se pudieron cargar las categorías: " + errorMessage,
        "destructive"
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const formData = new FormData(e.currentTarget);
      const productData = {
        name: formData.get('name') as string,
        description: formData.get('description') as string,
        price: parseFloat(formData.get('price') as string),
        stock: parseInt(formData.get('stock') as string),
        category_id: parseInt(formData.get('category_id') as string),
        colors: (formData.get('colors') as string).split(',').map(c => c.trim()),
        sizes: (formData.get('sizes') as string).split(',').map(s => s.trim()),
        images: (formData.get('images') as string).split(',').map(i => i.trim()),
      };

      const url = editingProduct 
        ? `/api/products/${editingProduct.id}`
        : '/api/products';
      
      const method = editingProduct ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData),
      });

      if (!response.ok) throw new Error('Error al guardar el producto');

      showToastMessage(
        "Éxito",
        `Producto ${editingProduct ? 'actualizado' : 'creado'} correctamente`
      );

      setIsDialogOpen(false);
      setEditingProduct(null);
      fetchProducts();
    } catch (error) {
      const errorMessage = (error as Error).message;
      showToastMessage(
        "Error",
        `No se pudo ${editingProduct ? 'actualizar' : 'crear'} el producto: ` + errorMessage,
        "destructive"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!productToDelete) return;
    
    try {
      setIsLoading(true);
      const response = await fetch(`/api/products/${productToDelete}`, { 
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Error al eliminar el producto');

      showToastMessage(
        "Éxito",
        "Producto eliminado correctamente"
      );

      fetchProducts();
    } catch (error) {
      const errorMessage = (error as Error).message;
      showToastMessage(
        "Error",
        errorMessage,
        "destructive"
      );
    } finally {
      setIsLoading(false);
      setIsDeleteDialogOpen(false);
      setProductToDelete(null);
    }
  };

  const handleLogout = () => {
    // Eliminar cookie de token
    document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    navigate('/login');
  };

  const filteredProducts = selectedCategory === 'all'
    ? products
    : products.filter(product => product.category_id.toString() === selectedCategory);

  return (
    <div className="container mx-auto p-4">
        {showToast && (
          <Toast onOpenChange={() => setShowToast(false)} variant={toastMessage.variant}>
            <ToastTitle>{toastMessage.title}</ToastTitle>
            <ToastDescription>{toastMessage.description}</ToastDescription>
        </Toast>
      )}
      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-2xl font-bold">Panel de Administración</CardTitle>
          <div className="space-x-2">
            <Button variant="outline" onClick={() => navigate('/')}>
              <Home className="mr-2 h-4 w-4" /> Inicio
            </Button>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" /> Cerrar Sesión
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <PlusCircle className="mr-2 h-4 w-4" /> Agregar Producto
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>{editingProduct ? 'Editar Producto' : 'Agregar Producto'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <Input 
                    name="name" 
                    placeholder="Nombre" 
                    defaultValue={editingProduct?.name} 
                    required 
                  />
                  <textarea
                    name="description"
                    placeholder="Descripción"
                    className="w-full p-2 border rounded"
                    defaultValue={editingProduct?.description}
                    required
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <Input 
                      name="price" 
                      type="number" 
                      step="0.01" 
                      placeholder="Precio" 
                      defaultValue={editingProduct?.price} 
                      required 
                    />
                    <Input 
                      name="stock" 
                      type="number" 
                      placeholder="Stock" 
                      defaultValue={editingProduct?.stock} 
                      required 
                    />
                  </div>
                  <Select 
                    name="category_id" 
                    defaultValue={editingProduct?.category_id?.toString()}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona una categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category.id} value={category.id.toString()}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input 
                    name="colors" 
                    placeholder="Colores (separados por comas)" 
                    defaultValue={editingProduct?.colors.join(', ')} 
                    required 
                  />
                  <Input 
                    name="sizes" 
                    placeholder="Tallas (separadas por comas)" 
                    defaultValue={editingProduct?.sizes.join(', ')} 
                    required 
                  />
                  <Input 
                    name="images" 
                    placeholder="URLs de imágenes (separadas por comas)" 
                    defaultValue={editingProduct?.images.join(', ')} 
                    required 
                  />
                  <Button type="submit" disabled={isLoading} className="w-full">
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {editingProduct ? 'Actualizar' : 'Crear'} Producto
                  </Button>
                </form>
              </DialogContent>
            </Dialog>

            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filtrar por categoría" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las categorías</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category.id} value={category.id.toString()}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {isLoading && !products.length ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Categoría</TableHead>
              <TableHead>Precio</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts.map(product => (
              <TableRow key={product.id}>
                <TableCell className="font-medium">{product.name}</TableCell>
                <TableCell>
                  {categories.find(c => c.id === product.category_id)?.name || 'Sin categoría'}
                </TableCell>
                <TableCell>${product.price.toFixed(2)}</TableCell>
                <TableCell>{product.stock}</TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button 
                      variant="ghost" 
                      onClick={() => { 
                        setEditingProduct(product); 
                        setIsDialogOpen(true); 
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      onClick={() => {
                        setProductToDelete(product.id);
                        setIsDeleteDialogOpen(true);
                      }}
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

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Esto eliminará permanentemente el producto.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminPanel;