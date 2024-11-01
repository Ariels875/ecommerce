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
}

// Mock API function
export const fetchProducts = async (): Promise<Product[]> => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  return [
      {
          "id": 1,
          "name": "Camiseta Cool",
          "description": "Una camiseta muy cool para el verano",
          "price": 29.99,
          "stock": 100,
          "category_id": 1,
          "colors": ["Rojo", "Azul", "Verde"],
          "sizes": ["S", "M", "L"],
          "images": [
              "/placeholder.svg?height=200&width=300&text=Camiseta1",
              "/placeholder.svg?height=200&width=300&text=Camiseta2",
              "/placeholder.svg?height=200&width=300&text=Camiseta3",
              "/placeholder.svg?height=200&width=300&text=Camiseta4"
          ],
          "created_at": "2024-10-01T12:00:00Z"
      },
      {
          "id": 2,
          "name": "Jeans Clásicos",
          "description": "Jeans cómodos para el día a día",
          "price": 59.99,
          "stock": 50,
          "category_id": 2,
          "colors": ["Negro", "Azul"],
          "sizes": ["M", "L", "XL"],
          "images": [
              "/placeholder.svg?height=200&width=300&text=Jeans1",
              "/placeholder.svg?height=200&width=300&text=Jeans2",
              "/placeholder.svg?height=200&width=300&text=Jeans3",
              "/placeholder.svg?height=200&width=300&text=Jeans4"
          ],
          "created_at": "2024-10-01T12:00:00Z"
      },
      {
          "id": 3,
          "name": "Zapatillas Deportivas",
          "description": "Perfectas para correr o entrenar",
          "price": 89.99,
          "stock": 75,
          "category_id": 3,
          "colors": ["Negro", "Blanco", "Rojo"],
          "sizes": ["S", "M", "L", "XL"],
          "images": [
              "/placeholder.svg?height=200&width=300&text=Zapatillas1",
              "/placeholder.svg?height=200&width=300&text=Zapatillas2",
              "/placeholder.svg?height=200&width=300&text=Zapatillas3",
              "/placeholder.svg?height=200&width=300&text=Zapatillas4"
          ],
          "created_at": "2024-10-01T12:00:00Z"
      },
      {
          "id": 4,
          "name": "Chaqueta de Cuero",
          "description": "Elegante chaqueta de cuero para todas las estaciones",
          "price": 199.99,
          "stock": 30,
          "category_id": 4,
          "colors": ["Negro", "Marrón"],
          "sizes": ["M", "L"],
          "images": [
              "/placeholder.svg?height=200&width=300&text=Chaqueta1",
              "/placeholder.svg?height=200&width=300&text=Chaqueta2",
              "/placeholder.svg?height=200&width=300&text=Chaqueta3",
              "/placeholder.svg?height=200&width=300&text=Chaqueta4"
          ],
          "created_at": "2024-10-01T12:00:00Z"
      }
  ]    
};