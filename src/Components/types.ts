// types.ts
export const API_URL = import.meta.env.VITE_API_URL;

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

export interface Category {
  id: number;
  name: string;
  description: string;
}

export interface CachedData {
  timestamp: number;
  products: Product[];
}

export interface CartItem extends Product {
  quantity: number;
  selectedColor: string;
  selectedSize: string;
  identifier: string;
}

export interface ProductFormData {
  name: string;
  description: string;
  price: number;
  stock: number;
  category_id: number | null;
  colors: string;
  sizes: string;
  images: string;
}