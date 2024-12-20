// types.ts
export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  images: string[];
  stock: number;
  category_id: number;
  colors: string[];
  sizes: string[];
  created_at: string;
}

export interface CartItem extends Product {
  quantity: number;
  selectedColor: string;
  selectedSize: string;
  identifier: string;
}

export const fetchProducts = async (): Promise<Product[]> => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_DEV}/products`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
  
      if (!response.ok) {
        throw new Error('Error fetching products');
      }
  
      const products: Product[] = await response.json();
      return products;
    } catch (error) {
      console.error('Failed to fetch products:', error);
      throw error;
    }
  };
  