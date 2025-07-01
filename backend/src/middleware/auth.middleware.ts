import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Extendemos la interfaz de Request para poder añadir la información del usuario decodificado
interface AuthenticatedRequest extends Request {
    user?: { id: number; role: string };
}

export const protect = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Obtener el token de la cabecera (formato: 'Bearer TOKEN')
            token = req.headers.authorization.split(' ')[1];

            const secret = process.env.JWT_SECRET;
            if (!secret) {
                throw new Error('JWT_SECRET no está definido en las variables de entorno');
            }

            // Verificar el token
            const decoded = jwt.verify(token, secret) as { id: number; role: string };

            // Añadir el usuario decodificado al objeto de la petición
            req.user = decoded;

            next(); // Continuar al siguiente middleware/controlador
            return;
        } catch (error) {
            console.error(error);
            res.status(401).json({ message: 'No autorizado, token fallido' });
            return;
        }
    }

    if (!token) {
        res.status(401).json({ message: 'No autorizado, no hay token' });
    }
};
