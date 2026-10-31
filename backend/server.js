// =====================================================================
// DUEÑA/O: Susan Laime — Servidor (arranque y página de inicio)
// Responsables: README.md (sección Equipo)  ·  Contrato de la API: docs/API.md
// =====================================================================
//
// Qué debe hacer este archivo:
//
// TODO (Susan): crear la aplicación Express y aceptar JSON (express.json()).
// TODO (Susan): servir la carpeta "frontend" en la ruta /frontend
//                   (¡NO servir la raíz del proyecto: expondría backend/ y .env!).
// TODO (Susan): redirigir "/" a /frontend/index.html (página de inicio)
// TODO (Susan): montar las rutas de la API:
//                     /api/registro  -> ./routes/registro.js  (Natalia)
//                     /api/login     -> ./routes/login.js     (Joaquín)
//                     /api/perfil    -> ./routes/perfil.js    (Sara)
// TODO (Susan): manejador de errores final que responda { error: "..." } con estado 500
//                   y que nunca muestre detalles internos al usuario.
// TODO (Susan): exportar "app" (para las pruebas) y llamar a app.listen(PORT)
//                   solo cuando el archivo se ejecuta directamente (npm start).
//                   PORT se lee de process.env.PORT (ver .env.example).
