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
        id: 1,
        name: "Camiseta Cool",
        description: "Una camiseta muy cool para el verano",
        price: 29.99,
        images: [
          "/placeholder.svg?height=200&width=300&text=Camiseta1",
          "/placeholder.svg?height=200&width=300&text=Camiseta2",
          "/placeholder.svg?height=200&width=300&text=Camiseta3",
          "/placeholder.svg?height=200&width=300&text=Camiseta4"
        ]
      },
      // ... (otros productos)
    ];
  };