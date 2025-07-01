import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';

// TODO: Mover usuarios a una base de datos real
const users = [
    {
        id: 1,
        email: 'admin@example.com',
        password: 'password123', // En un caso real, esto debería ser un hash
        name: 'Admin User',
        role: 'admin'
    },
    {
        id: 2,
        email: 'cashier@example.com',
        password: 'password123',
        name: 'Cashier User',
        role: 'cashier'
    }
];

// TODO: Mover el secreto a una variable de entorno (.env)
const JWT_SECRET = 'tu_super_secreto_jwt';

export const login = (req: Request, res: Response): void => {
    const { email, password } = req.body;

    if (!email || !password) {
        res.status(400).json({ message: 'Email y contraseña son requeridos' });
        return;
    }

    const user = users.find(u => u.email === email);

    if (!user || user.password !== password) {
        res.status(401).json({ message: 'Credenciales inválidas' });
        return;
    }

    // Generar el token JWT
    const token = jwt.sign(
        { id: user.id, role: user.role },
        JWT_SECRET,
        { expiresIn: '1h' } // El token expira en 1 hora
    );

    // No enviar la contraseña en la respuesta
    const { password: _, ...userWithoutPassword } = user;

    res.json({
        message: 'Login exitoso',
        token,
        user: userWithoutPassword
    });
};
