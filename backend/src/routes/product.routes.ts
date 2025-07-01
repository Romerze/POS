import { Router } from 'express';
import { protect } from '../middleware/auth.middleware';
import {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct
} from '../controllers/product.controller';

const router = Router();

// Aplicamos el middleware 'protect' a todas las rutas de productos
router.use(protect);

router.route('/')
    .get(getProducts)
    .post(createProduct);

router.route('/:id')
    .get(getProductById)
    .put(updateProduct)
    .delete(deleteProduct);

export default router;
