// =====================================================================
// DUEÑA/O: Persona 1 — Tarea T-01 (Servidor y base de datos)
// Guía completa: docs/TAREAS.md  ·  Contrato de la API: docs/API.md
// =====================================================================
//
// Qué debe hacer este archivo:
//
// TODO (Persona 1): crear la aplicación Express y aceptar JSON (express.json()).
// TODO (Persona 1): servir la carpeta "frontend" en la ruta /frontend
//                   (¡NO servir la raíz del proyecto: expondría backend/ y .env!).
// TODO (Persona 1): redirigir "/" a /frontend/auth/login.html
// TODO (Persona 1): montar las rutas de la API:
//                     /api/registro  -> ./routes/registro.js  (Persona 2)
//                     /api/login     -> ./routes/login.js     (Persona 3)
//                     /api/perfil    -> ./routes/perfil.js    (Persona 4)
// TODO (Persona 1): manejador de errores final que responda { error: "..." } con estado 500
//                   y que nunca muestre detalles internos al usuario.
// TODO (Persona 1): exportar "app" (para las pruebas) y llamar a app.listen(PORT)
//                   solo cuando el archivo se ejecuta directamente (npm start).
//                   PORT se lee de process.env.PORT (ver .env.example).
