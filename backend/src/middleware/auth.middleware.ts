import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// TODO: Mover el secreto a una variable de entorno (.env)
const JWT_SECRET = 'tu_super_secreto_jwt';

// Extendemos la interfaz de Request para poder añadir la información del usuario decodificado
interface AuthenticatedRequest extends Request {
    user?: { id: number; role: string };
}

export const protect = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Obtener el token de la cabecera (formato: 'Bearer TOKEN')
            token = req.headers.authorization.split(' ')[1];

            // Verificar el token
            const decoded = jwt.verify(token, JWT_SECRET) as { id: number; role: string };

            // Añadir el usuario decodificado al objeto de la petición
            req.user = decoded;

            next(); // Continuar al siguiente middleware/controlador
        } catch (error) {
            console.error(error);
            res.status(401).json({ message: 'No autorizado, token fallido' });
        }
    }

    if (!token) {
        res.status(401).json({ message: 'No autorizado, no hay token' });
    }
};
