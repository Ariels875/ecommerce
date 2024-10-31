import React, { useState, useEffect } from 'react';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
import { Button } from '../Ui/Button';
import { Input } from '../Ui/Input';
import { Select } from '../Ui/Select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../Ui/Table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../Ui/Dialog';

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

const AdminPanel: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    // Fetch products and categories from your API
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    // Replace with actual API call
    const response = await fetch('/api/products');
    const data = await response.json();
    setProducts(data);
  };

  const fetchCategories = async () => {
    // Replace with actual API call
    const response = await fetch('/api/categories');
    const data = await response.json();
    setCategories(data);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
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

    if (editingProduct) {
      // Update existing product
      await fetch(`/api/products/${editingProduct.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData),
      });
    } else {
      // Create new product
      await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData),
      });
    }

    setIsDialogOpen(false);
    setEditingProduct(null);
    fetchProducts();
  };

  const handleDelete = async (id: number) => {
    if (confirm('¿Estás seguro de que quieres eliminar este producto?')) {
      await fetch(`/api/products/${id}`, { method: 'DELETE' });
      fetchProducts();
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Panel de Administración</h1>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button className="mb-4">
            <PlusCircle className="mr-2 h-4 w-4" /> Agregar Producto
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingProduct ? 'Editar Producto' : 'Agregar Producto'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input name="name" placeholder="Nombre" defaultValue={editingProduct?.name} required />
            <textarea
              name="description"
              placeholder="Descripción"
              className="w-full p-2 border rounded"
              defaultValue={editingProduct?.description}
              required
            />
            <Input name="price" type="number" step="0.01" placeholder="Precio" defaultValue={editingProduct?.price} required />
            <Input name="stock" type="number" placeholder="Stock" defaultValue={editingProduct?.stock} required />
            <Select name="category_id" defaultValue={editingProduct?.category_id?.toString()} required>
              {categories.map(category => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </Select>
            <Input name="colors" placeholder="Colores (separados por comas)" defaultValue={editingProduct?.colors.join(', ')} required />
            <Input name="sizes" placeholder="Tallas (separadas por comas)" defaultValue={editingProduct?.sizes.join(', ')} required />
            <Input name="images" placeholder="URLs de imágenes (separadas por comas)" defaultValue={editingProduct?.images.join(', ')} required />
            <Button type="submit">{editingProduct ? 'Actualizar' : 'Crear'} Producto</Button>
          </form>
        </DialogContent>
      </Dialog>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Precio</TableHead>
            <TableHead>Stock</TableHead>
            <TableHead>Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map(product => (
            <TableRow key={product.id}>
              <TableCell>{product.name}</TableCell>
              <TableCell>${product.price.toFixed(2)}</TableCell>
              <TableCell>{product.stock}</TableCell>
              <TableCell>
                <Button variant="ghost" onClick={() => { setEditingProduct(product); setIsDialogOpen(true); }}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="ghost" onClick={() => handleDelete(product.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default AdminPanel;