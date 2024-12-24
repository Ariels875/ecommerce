import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Category } from './types';
import { fetchNewCategories as fetchCategoriesService } from '../api/categories';

interface CategoryContextType {
  categories: Category[];
  setCategories: React.Dispatch<React.SetStateAction<Category[]>>;
  fetchCategories: () => Promise<void>;
}

const CategoryContext = createContext<CategoryContextType | undefined>(undefined);

export const CategoryProvider = ({ children }: { children: ReactNode }) => {
  const [categories, setCategories] = useState<Category[]>([]);

  const fetchCategories = async () => {
    try {
      const data = await fetchCategoriesService();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  return (
    <CategoryContext.Provider value={{ categories, setCategories, fetchCategories }}>
      {children}
    </CategoryContext.Provider>
  );
};

export const useCategories = () => {
  const context = useContext(CategoryContext);
  if (context === undefined) {
    throw new Error('useCategories must be used within a CategoryProvider');
  }
  return context;
};