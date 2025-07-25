import { Product, CachedData, ProductFormData } from '../Components/types';
import { API_URL } from '../Components/types';

const CACHE_DURATION = 10 * 60 * 1000;
const CACHE_KEY = 'cached_products';

const isValidCache = (timestamp: number): boolean => {
  const now = Date.now();
  return now - timestamp < CACHE_DURATION;
};

const getCachedProducts = (): Product[] | null => {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null; // Corregir esto <3

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
      return cachedProducts;
    }

    // Si no hay caché válido, hacer la petición
    const response = await fetch(`${API_URL}/products`, {
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

export const fetchNewProducts = async (): Promise<Product[]> => {
    try {
      const response = await fetch(`${API_URL}/products`, {
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
    const response = await fetch(`${API_URL}/products/${id}`);
    
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

export const submitProduct = async (
    productForm: ProductFormData,
    editingProduct: Product | null,
    selectedImages?: File[]
): Promise<boolean> => {
    const method = editingProduct ? 'PUT' : 'POST';
    const url = editingProduct
        ? `${API_URL}/products/${editingProduct.id}`
        : `${API_URL}/products`;

    try {
        if (method === 'POST' && selectedImages) {
            const formData = new FormData();
            formData.append('name', productForm.name);
            formData.append('description', productForm.description);
            formData.append('price', productForm.price.toString());
            formData.append('stock', productForm.stock.toString());
            formData.append('category_id', productForm.category_id?.toString() || '');
            formData.append('colors', productForm.colors.trim());
            formData.append('sizes', productForm.sizes.trim());

            selectedImages.forEach(image => {
                formData.append('images', image);
            });

            const response = await fetch(url, {
                method: 'POST',
                credentials: 'include',
                body: formData,
            });

            return response.ok;
        } else {
            const response = await fetch(url, {
                method: 'PUT',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...productForm,
                    colors: productForm.colors.trim(),
                    sizes: productForm.sizes.trim(),
                    images: productForm.images.trim(),
                }),
            });

            return response.ok;
        }
    } catch (error) {
        console.error('Error submitting product:', error);
        return false;
    }
};

export const deleteProduct = async (id: number): Promise<boolean> => {
    try {
        const response = await fetch(`${API_URL}/products/${id}`, {
            method: 'DELETE',
            credentials: 'include'
        });

        return response.ok;
    } catch (error) {
        console.error('Error deleting product:', error);
        return false;
    }
};

export const fetchProductDetails = async (id: string | number): Promise<Product | null> => {
    try {
      const cachedProducts = getCachedProducts();
      if (cachedProducts) {
        const cachedProduct = cachedProducts.find(p => p.id === Number(id));
        if (cachedProduct) {
          return cachedProduct;
        }
      }
  
      const response = await fetch(`${API_URL}/products/${id}`);
      if (!response.ok) {
        throw new Error('Error fetching product details');
      }
  
      const product: Product = await response.json();
      
      // Actualizar caché si existe
      if (cachedProducts) {
        const updatedProducts = [...cachedProducts];
        const index = updatedProducts.findIndex(p => p.id === Number(id));
        if (index >= 0) {
          updatedProducts[index] = product;
        } else {
          updatedProducts.push(product);
        }
        setCachedProducts(updatedProducts);
      }
  
      return product;
    } catch (error) {
      console.error('Error fetching product details:', error);
      return null;
    }
  };
  
  export const fetchRelatedProducts = async (categoryId: number, excludeId: string | number): Promise<Product[]> => {
    try {
      const response = await fetch(
        `${API_URL}/products?category_id=${categoryId}&exclude_id=${excludeId}`
      );
      
      if (!response.ok) {
        throw new Error('Error fetching related products');
      }
  
      const products: Product[] = await response.json();
      return products;
    } catch (error) {
      console.error('Error fetching related products:', error);
      return [];
    }
  };