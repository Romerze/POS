import { Request, Response } from 'express';
import { Product } from '../models/product.model';

// Simulación de base de datos en memoria
let products: Product[] = [
    {
        id: 1,
        name: 'Laptop Pro',
        price: 1200.50,
        stock: 15,
        sku: 'LP-001',
        category: 'Electrónica',
        description: 'Potente laptop para profesionales',
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        id: 2,
        name: 'Teclado Mecánico RGB',
        price: 89.99,
        stock: 50,
        sku: 'TM-RGB-002',
        category: 'Accesorios',
        createdAt: new Date(),
        updatedAt: new Date(),
    }
];

// Obtener todos los productos
export const getProducts = (req: Request, res: Response): void => {
    res.json(products);
};

// Obtener un producto por ID
export const getProductById = (req: Request, res: Response): void => {
    const id = parseInt(req.params.id, 10);
    const product = products.find(p => p.id === id);
    if (product) {
        res.json(product);
    } else {
        res.status(404).json({ message: 'Producto no encontrado' });
    }
};

// Crear un nuevo producto
export const createProduct = (req: Request, res: Response): void => {
    const { name, price, stock, sku, category, description } = req.body;
    if (!name || price === undefined || stock === undefined || !sku || !category) {
        res.status(400).json({ message: 'Faltan campos requeridos' });
        return;
    }
    const newProduct: Product = {
        id: products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1,
        name,
        price,
        stock,
        sku,
        category,
        description,
        createdAt: new Date(),
        updatedAt: new Date(),
    };
    products.push(newProduct);
    res.status(201).json(newProduct);
};

// Actualizar un producto
export const updateProduct = (req: Request, res: Response): void => {
    const id = parseInt(req.params.id, 10);
    const productIndex = products.findIndex(p => p.id === id);
    if (productIndex === -1) {
        res.status(404).json({ message: 'Producto no encontrado' });
        return;
    }
    const updatedProduct: Product = { ...products[productIndex], ...req.body, updatedAt: new Date() };
    products[productIndex] = updatedProduct;
    res.json(updatedProduct);
};

// Eliminar un producto
export const deleteProduct = (req: Request, res: Response): void => {
    const id = parseInt(req.params.id, 10);
    const initialLength = products.length;
    products = products.filter(p => p.id !== id);
    if (products.length === initialLength) {
        res.status(404).json({ message: 'Producto no encontrado' });
        return;
    }
    res.status(204).send(); // No Content
};
