import express, { Express, Request, Response } from 'express';
import cors from 'cors';

const app: Express = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get('/', (req: Request, res: Response) => {
  res.send('Backend del Sistema POS funcionando!');
});

app.listen(port, () => {
  console.log(`[server]: Servidor corriendo en http://localhost:${port}`);
});
