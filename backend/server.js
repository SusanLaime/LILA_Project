// =====================================================================
// DUEÑA/O: Persona 2 — Tarea T-02 (Servidor y base de datos)
// Guía completa: docs/TAREAS.md  ·  Contrato de la API: docs/API.md
// =====================================================================
//
// Qué debe hacer este archivo:
//
// TODO (Persona 2): crear la aplicación Express y aceptar JSON (express.json()).
// TODO (Persona 2): servir la carpeta "frontend" en la ruta /frontend
//                   (¡NO servir la raíz del proyecto: expondría backend/ y .env!).
// TODO (Persona 2): redirigir "/" a /frontend/auth/login.html
// TODO (Persona 2): montar las rutas de la API:
//                     /api/registro  -> ./routes/registro.js  (Persona 3)
//                     /api/login     -> ./routes/login.js     (Persona 4)
//                     /api/perfil    -> ./routes/perfil.js    (Persona 4)
// TODO (Persona 2): manejador de errores final que responda { error: "..." } con estado 500
//                   y que nunca muestre detalles internos al usuario.
// TODO (Persona 2): exportar "app" (para las pruebas) y llamar a app.listen(PORT)
//                   solo cuando el archivo se ejecuta directamente (npm start).
//                   PORT se lee de process.env.PORT (ver .env.example).
