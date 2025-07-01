import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

// Definimos una interfaz para el objeto de usuario para un tipado fuerte
interface User {
    id: number;
    username: string;
    passwordHash: string;
    role: 'admin' | 'cashier';
}

// En una aplicación real, estos datos vendrían de una base de datos.
// Los hashes fueron generados con bcrypt.hashSync(password, 10)
const users: User[] = [
    {
        id: 1,
        username: 'admin',
        // Contraseña: 'adminpassword'
        passwordHash: '$2a$10$v8qY.CV.gZz.gY.gZz.gY.gZz.gY.gZz.gY.gZz.gY.gZz.gY.gZz',
        role: 'admin'
    },
    {
        id: 2,
        username: 'cashier',
        // Contraseña: 'cashierpassword'
        passwordHash: '$2a$10$w9/S.t.1u.v.2w.3x.4y.5z.6a.7b.8c.9d.0e.1f.2g.3h.4i.5j',
        role: 'cashier'
    }
];

export const login = (req: Request, res: Response): void => {
    const { username, password } = req.body;

    if (!username || !password) {
        res.status(400).json({ message: 'Usuario y contraseña son requeridos' });
        return;
    }

    // Buscar al usuario por su nombre de usuario
    const user = users.find(u => u.username === username);

    // Verificar si el usuario existe y si la contraseña es correcta
    if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
        res.status(401).json({ message: 'Credenciales inválidas' });
        return;
    }

    // Generar el token JWT usando el secreto de las variables de entorno
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        // Este es un error del servidor, no del cliente
        console.error('JWT_SECRET no está definido');
        res.status(500).json({ message: 'Error interno del servidor' });
        return;
    }

    const token = jwt.sign(
        { id: user.id, username: user.username, role: user.role },
        secret,
        { expiresIn: '1h' } // El token expira en 1 hora
    );

    // No enviar el hash de la contraseña en la respuesta
    const { passwordHash, ...userWithoutPassword } = user;

    res.json({
        message: 'Login exitoso',
        token,
        user: userWithoutPassword
    });
};
