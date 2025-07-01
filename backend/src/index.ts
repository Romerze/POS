import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';

dotenv.config();
import cors from 'cors';
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import productRoutes from './routes/product.routes';

const app: Express = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get('/', (req: Request, res: Response) => {
  res.send('Backend del Sistema POS funcionando!');
});

// Montar las rutas de la API
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);

app.listen(port, () => {
  console.log(`[server]: Servidor corriendo en http://localhost:${port}`);
});
