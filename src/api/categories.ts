import { Category, API_URL } from '../Components/types';

const CACHE_DURATION = 10 * 60 * 1000;
const CACHE_KEY = 'cached_categories';

interface CategoryCacheData {
  timestamp: number;
  categories: Category[];
}

const isValidCache = (timestamp: number): boolean => {
  const now = Date.now();
  return now - timestamp < CACHE_DURATION;
};

const getCachedCategories = (): Category[] | null => {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;

    const { timestamp, categories }: CategoryCacheData = JSON.parse(cached);
    
    if (!isValidCache(timestamp)) {
      localStorage.removeItem(CACHE_KEY);
      return null;
    }

    return categories;
  } catch (error) {
    console.error('Error reading from cache:', error);
    localStorage.removeItem(CACHE_KEY);
    return null;
  }
};

const setCachedCategories = (categories: Category[]): void => {
  try {
    const cacheData: CategoryCacheData = {
      timestamp: Date.now(),
      categories
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
  } catch (error) {
    console.error('Error writing to cache:', error);
  }
};

export const fetchCategories = async (): Promise<Category[]> => {
  try {
    const cachedCategories = getCachedCategories();
    if (cachedCategories) {
      return cachedCategories;
    }

    const response = await fetch(`${API_URL}/categories`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Error fetching categories');
    }

    const categories: Category[] = await response.json();
    setCachedCategories(categories);
    
    return categories;
  } catch (error) {
    console.error('Failed to fetch categories:', error);
    throw error;
  }
};

export const fetchNewCategories = async (): Promise<Category[]> => {
  try {
    const response = await fetch(`${API_URL}/categories`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Error fetching categories');
    }

    const categories: Category[] = await response.json();
    setCachedCategories(categories);
    
    return categories;
  } catch (error) {
    console.error('Failed to fetch categories:', error);
    throw error;
  }
};

export const invalidateCategoriesCache = (): void => {
  localStorage.removeItem(CACHE_KEY);
};

export const fetchCategoryById = async (id: number): Promise<Category | null> => {
  try {
    const cachedCategories = getCachedCategories();
    if (cachedCategories) {
      const cachedCategory = cachedCategories.find(c => c.id === id);
      if (cachedCategory) {
        return cachedCategory;
      }
    }

    const response = await fetch(`${API_URL}/categories/${id}`);
    
    if (!response.ok) {
      throw new Error('Error fetching category');
    }

    const category: Category = await response.json();
    
    if (cachedCategories) {
      const updatedCategories = [...cachedCategories];
      const index = updatedCategories.findIndex(c => c.id === id);
      if (index >= 0) {
        updatedCategories[index] = category;
      } else {
        updatedCategories.push(category);
      }
      setCachedCategories(updatedCategories);
    }

    return category;
  } catch (error) {
    console.error(`Failed to fetch category with id ${id}:`, error);
    return null;
  }
};

export const submitCategory = async (
  category: { name: string; description: string },
  editingCategory: Category | null
): Promise<boolean> => {
  const method = editingCategory ? 'PUT' : 'POST';
  const url = editingCategory
    ? `${API_URL}/categories/${editingCategory.id}`
    : `${API_URL}/categories`;

  try {
    const response = await fetch(url, {
      method,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(category),
    });

    if (response.ok) {
      invalidateCategoriesCache();
    }

    return response.ok;
  } catch (error) {
    console.error('Error submitting category:', error);
    return false;
  }
};

export const deleteCategory = async (id: number): Promise<boolean> => {
  try {
    const response = await fetch(`${API_URL}/categories/${id}`, {
      method: 'DELETE',
      credentials: 'include'
    });

    if (response.ok) {
      invalidateCategoriesCache();
    }

    return response.ok;
  } catch (error) {
    console.error('Error deleting category:', error);
    return false;
  }
};