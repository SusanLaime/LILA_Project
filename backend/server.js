
/* =====================================================================
 * server.js — Servidor principal de LILA: arranca Express, entrega las páginas del frontend y conecta las rutas de registro, inicio de sesión y perfil.
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

// carpetaActual = backend/ · raiz = carpeta principal del proyecto.
// Se usan para encontrar la carpeta frontend/ sin importar desde dónde se arranque.
const carpetaActual = dirname(fileURLToPath(import.meta.url));
const raiz = resolve(carpetaActual, '..');

// =====================================================================
// CONFIGURACIÓN DE EXPRESS
// =====================================================================

const app = express();

// Permitir recibir datos JSON (máximo 20 KB por petición)
app.use(express.json({ limit: '20kb' }));

// Direcciones antiguas de páginas que se movieron de carpeta.
// Si alguien entra a una dirección vieja, lo envía a la nueva (301 = cambio permanente).
const redireccionesFrontend = {
  '/frontend/website/index.html': '/frontend/index.html',
  '/frontend/homeTrabajador.html': '/frontend/website/homeTrabajador.html',
  '/frontend/homeEmpleador.html': '/frontend/website/homeEmpleador.html',
  '/frontend/website/trabajador/perfil.html': '/frontend/website/perfil.html',
  '/frontend/website/perfilEmpleador.html': '/frontend/website/perfil.html'
};

app.get(Object.keys(redireccionesFrontend), (req, res) => {
  return res.redirect(301, redireccionesFrontend[req.path]);
});

// Servir los archivos del frontend (HTML, CSS, JS e imágenes) bajo /frontend/...
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

// /frontend/index.html muestra la página de inicio, que en realidad está en website/index.html
app.get('/frontend/index.html', (req, res) => {
  return res.sendFile(resolve(raiz, 'frontend', 'website', 'index.html'));
});

// Al abrir http://localhost:3000 se envía al usuario a la página de inicio
app.get('/', (req, res) => {
  return res.redirect('/frontend/index.html');
});

// =====================================================================
// MANEJO DE RUTAS NO ENCONTRADAS
// =====================================================================

// Si piden una dirección /api/... que no existe, responde 404 en JSON
// (para que el frontend pueda leer el error). Las demás pasan de largo.
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

// Atrapa cualquier error que no se manejó en las rutas.
// Si el JSON enviado está mal escrito responde 400; para todo lo demás, 500.
// El detalle del error solo se muestra en la consola, nunca al usuario.
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

// Los tests importan "app" para probar las rutas sin tener que encender el servidor.
export { app };
export default app;

// =====================================================================
// INICIO DEL SERVIDOR
// =====================================================================

// Solo enciende el servidor si este archivo se ejecutó directamente (npm start).
// Si lo importa un test, no lo enciende.
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
