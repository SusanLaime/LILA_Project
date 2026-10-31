import express from 'express';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import './db.js';
import registroRouter from './routes/registro.js';
import loginRouter from './routes/login.js';
import perfilRouter from './routes/perfil.js';

const app = express();
const root = dirname(dirname(fileURLToPath(import.meta.url)));
app.use(express.json());
app.use('/frontend', express.static(join(root, 'frontend')));
app.get('/', (req, res) => res.redirect('/frontend/auth/login.html'));
app.use('/api/registro', registroRouter);
app.use('/api/login', loginRouter);
app.use('/api/perfil', perfilRouter);
app.use((error, req, res, next) => {
  if (res.headersSent) return next(error);
  res.status(500).json({ error: 'Error interno del servidor.' });
});

export { app };

if (process.argv[1] && fileURLToPath(import.meta.url) === fileURLToPath(`file://${process.argv[1]}`)) {
  const port = Number(process.env.PORT || 3000);
  app.listen(port, () => console.log(`LILA disponible en http://localhost:${port}`));
}
