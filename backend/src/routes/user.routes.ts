import { Router } from 'express';
import { protect } from '../middleware/auth.middleware';

const router = Router();

// Ruta protegida de ejemplo
router.get('/profile', protect, (req, res) => {
    // Gracias al middleware 'protect', aquí tenemos acceso a req.user
    res.json({ message: 'Esta es una ruta protegida', user: (req as any).user });
});

export default router;
