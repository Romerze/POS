export interface Product {
    id: number;
    name: string;
    price: number;
    stock: number;
    sku: string; // Stock Keeping Unit
    category: string;
    description?: string; // El '?' lo hace opcional
    createdAt: Date;
    updatedAt: Date;
}
