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

interface CachedData {
  timestamp: number;
  products: Product[];
}

export interface CartItem extends Product {
  quantity: number;
  selectedColor: string;
  selectedSize: string;
  identifier: string;
}

const CACHE_DURATION = 60 * 60 * 1000;
const CACHE_KEY = 'cached_products';

const isValidCache = (timestamp: number): boolean => {
  const now = Date.now();
  return now - timestamp < CACHE_DURATION;
};

const getCachedProducts = (): Product[] | null => {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;

    const { timestamp, products }: CachedData = JSON.parse(cached);
    
    if (!isValidCache(timestamp)) {
      localStorage.removeItem(CACHE_KEY);
      return null;
    }

    return products;
  } catch (error) {
    console.error('Error reading from cache:', error);
    localStorage.removeItem(CACHE_KEY);
    return null;
  }
};

const setCachedProducts = (products: Product[]): void => {
  try {
    const cacheData: CachedData = {
      timestamp: Date.now(),
      products
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
  } catch (error) {
    console.error('Error writing to cache:', error);
  }
};

export const fetchProducts = async (): Promise<Product[]> => {
  try {
    // Intentar obtener productos del caché
    const cachedProducts = getCachedProducts();
    if (cachedProducts) {
      console.log('Returning cached products');
      return cachedProducts;
    }

    // Si no hay caché válido, hacer la petición
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
    
    // Guardar en caché los nuevos productos
    setCachedProducts(products);
    
    return products;
  } catch (error) {
    console.error('Failed to fetch products:', error);
    throw error;
  }
};

// Función para invalidar el caché (útil después de actualizaciones)
export const invalidateProductsCache = (): void => {
  localStorage.removeItem(CACHE_KEY);
};

// Función para obtener un producto específico (primero busca en caché)
export const fetchProductById = async (id: number): Promise<Product | null> => {
  try {
    // Intentar obtener del caché primero
    const cachedProducts = getCachedProducts();
    if (cachedProducts) {
      const cachedProduct = cachedProducts.find(p => p.id === id);
      if (cachedProduct) {
        console.log('Returning cached product');
        return cachedProduct;
      }
    }

    // Si no está en caché, hacer la petición
    const response = await fetch(`${import.meta.env.VITE_API_DEV}/products/${id}`);
    
    if (!response.ok) {
      throw new Error('Error fetching product');
    }

    const product: Product = await response.json();
    
    // Actualizar el caché si ya existe
    if (cachedProducts) {
      const updatedProducts = [...cachedProducts];
      const index = updatedProducts.findIndex(p => p.id === id);
      if (index >= 0) {
        updatedProducts[index] = product;
      } else {
        updatedProducts.push(product);
      }
      setCachedProducts(updatedProducts);
    }

    return product;
  } catch (error) {
    console.error(`Failed to fetch product with id ${id}:`, error);
    return null;
  }
};