// src/components/ProductList.js
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getProducts } from '../api';

function ProductList() {
  const [products, setProducts] = useState([]);

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

  return (
    <div>
      <h2>Our Products</h2>
      <div className="product-grid">
        {products.map(product => (
          <Link to={`/product/${product.product_id}`} key={product.product_id}>
            <div className="product-card">
              <h3>{product.name}</h3>
              <p>${product.price}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default ProductList;