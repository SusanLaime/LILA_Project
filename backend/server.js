
/* =====================================================================
 * Servidor principal de LILA
 * Frontend y rutas de registro, inicio de sesión y perfil.
 * ===================================================================== */

import express from 'express';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, resolve } from 'node:path';

import registroRouter from './routes/registro.js';
import loginRouter from './routes/login.js';
import perfilRouter from './routes/perfil.js';

import { validarConfiguracionJwt } from './seguridad.js';

// =====================================================================
// CONFIGURACIÓN DE DIRECTORIOS
// =====================================================================

const carpetaActual = dirname(fileURLToPath(import.meta.url));
const raiz = resolve(carpetaActual, '..');

// =====================================================================
// CONFIGURACIÓN DE EXPRESS
// =====================================================================

const app = express();

// Permitir recibir datos JSON
app.use(express.json({ limit: '20kb' }));

// Servir los archivos del frontend
app.use('/frontend', express.static(resolve(raiz, 'frontend')));

// =====================================================================
// RUTAS DE LA API
// =====================================================================

// Registro de usuarios
app.use('/api/registro', registroRouter);

// Inicio de sesión
app.use('/api/login', loginRouter);

// Perfil del usuario autenticado
app.use('/api/perfil', perfilRouter);

// =====================================================================
// RUTA PRINCIPAL
// =====================================================================

app.get('/', (req, res) => {
  return res.redirect('/frontend/index.html');
});

// =====================================================================
// MANEJO DE RUTAS NO ENCONTRADAS
// =====================================================================

app.use((req, res, next) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({
      error: 'Ruta de API no encontrada.'
    });
  }

  return next();
});

// =====================================================================
// MANEJO GLOBAL DE ERRORES
// =====================================================================

app.use((error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }

  // Error cuando el JSON recibido no es válido
  if (
    error instanceof SyntaxError &&
    error.status === 400 &&
    'body' in error
  ) {
    return res.status(400).json({
      error: 'El cuerpo JSON de la solicitud no es válido.'
    });
  }

  console.error('Error interno del servidor:', error);

  return res.status(500).json({
    error: 'Error interno del servidor.'
  });
});

// =====================================================================
// EXPORTACIÓN PARA PRUEBAS
// =====================================================================

export { app };
export default app;

// =====================================================================
// INICIO DEL SERVIDOR
// =====================================================================

const archivoEjecutado = process.argv[1]
  ? pathToFileURL(resolve(process.argv[1])).href
  : null;

if (archivoEjecutado === import.meta.url) {

  // Validar configuración de seguridad JWT
  validarConfiguracionJwt();

  // Puerto del servidor
  const port = Number(process.env.PORT || 3000);

  // Validación del puerto
  if (
    !Number.isInteger(port) ||
    port < 1 ||
    port > 65535
  ) {
    throw new Error(
      'PORT debe ser un número entero entre 1 y 65535.'
    );
  }

  // Iniciar servidor
  app.listen(port, () => {
    console.log(
      `Servidor LILA funcionando en http://localhost:${port}`
    );
  });
}
