// =====================================================================
// Servidor principal de LILA: frontend y rutas de registro e inicio de sesión.
// =====================================================================

import express from 'express';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, resolve } from 'node:path';
import registroRouter from './routes/registro.js';
import loginRouter from './routes/login.js';
import { validarConfiguracionJwt } from './seguridad.js';

const carpetaActual = dirname(fileURLToPath(import.meta.url));
const raiz = resolve(carpetaActual, '..');

const app = express();

app.use(express.json({ limit: '20kb' }));
app.use('/frontend', express.static(resolve(raiz, 'frontend')));

app.use('/api/registro', registroRouter);
app.use('/api/login', loginRouter);

app.get('/', (req, res) => {
  res.redirect('/frontend/index.html');
});

app.use((req, res, next) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'Ruta de API no encontrada.' });
  }

  return next();
});

app.use((error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }

  if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
    return res.status(400).json({ error: 'El cuerpo JSON de la solicitud no es válido.' });
  }

  console.error('Error interno del servidor:', error);
  return res.status(500).json({ error: 'Error interno del servidor.' });
});

export { app };
export default app;

const archivoEjecutado = process.argv[1]
  ? pathToFileURL(resolve(process.argv[1])).href
  : null;

if (archivoEjecutado === import.meta.url) {
  validarConfiguracionJwt();

  const port = Number(process.env.PORT || 3000);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('PORT debe ser un número entero entre 1 y 65535.');
  }

  app.listen(port, () => {
    console.log(`Servidor LILA funcionando en http://localhost:${port}`);
  });
}
