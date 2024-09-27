// src/components/AdminPanel.js
import { useState, useEffect } from 'react';
import { getProducts, createProduct, updateProduct, deleteProduct } from '../api';

function AdminPanel() {
  const [products, setProducts] = useState([]);
  const [newProduct, setNewProduct] = useState({ name: '', description: '', price: '', stock: '', category_id: '', image_url: '' });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await getProducts();
      setProducts(response.data);
    } catch (err) {
      console.error('Error fetching products:', err);
    }
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    try {
      await createProduct(newProduct);
      setNewProduct({ name: '', description: '', price: '', stock: '', category_id: '', image_url: '' });
      fetchProducts();
    } catch (err) {
      console.error('Error creating product:', err);
    }
  };

  const handleUpdateProduct = async (id, updatedProduct) => {
    try {
      await updateProduct(id, updatedProduct);
      fetchProducts();
    } catch (err) {
      console.error('Error updating product:', err);
    }
  };

  const handleDeleteProduct = async (id) => {
    try {
      await deleteProduct(id);
      fetchProducts();
    } catch (err) {
      console.error('Error deleting product:', err);
    }
  };

  return (
    <div>
      <h2>Admin Panel</h2>
      <form onSubmit={handleCreateProduct}>
        {/* Formulario para crear nuevo producto */}
      </form>
      <h3>Products</h3>
      {products.map(product => (
        <div key={product.product_id}>
          <h4>{product.name}</h4>
          <p>{product.description}</p>
          <p>Price: ${product.price}</p>
          <p>Stock: {product.stock}</p>
          <button onClick={() => handleUpdateProduct(product.product_id, { ...product, price: product.price + 1 })}>
            Increase Price
          </button>
          <button onClick={() => handleDeleteProduct(product.product_id)}>Delete</button>
        </div>
      ))}
    </div>
  );
}

export default AdminPanel;