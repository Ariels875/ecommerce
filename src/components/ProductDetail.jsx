// src/components/ProductDetail.js
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getProduct } from '../api';

function ProductDetail() {
  const [product, setProduct] = useState(null);
  const { id } = useParams();

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const response = await getProduct(id);
      setProduct(response.data);
    } catch (err) {
      console.error('Error fetching product:', err);
    }
  };

  if (!product) return <div>Loading...</div>;

  return (
    <div>
      <h2>{product.name}</h2>
      <p>{product.description}</p>
      <p>Price: ${product.price}</p>
      <p>Stock: {product.stock}</p>
      <button>Add to Cart</button>
    </div>
  );
}

export default ProductDetail;