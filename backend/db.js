// =====================================================================
// DUEÑA/O: Natalia Arze — Base de datos
// Responsables: README.md (sección Equipo)  ·  Modelo de datos: docs/API.md
// =====================================================================
//
// Qué debe hacer este archivo:
//
// TODO (Natalia): abrir la base de datos SQLite con el módulo incorporado de Node
//                   `node:sqlite` (DatabaseSync). Ruta: process.env.DB_PATH.
//                   No requiere instalar nada extra (Node 22.13 o superior).
// TODO (Natalia): al iniciar, ejecutar database/schema.sql para crear las tablas
//                   si todavía no existen.
// TODO (Natalia): si la tabla "usuarios" está vacía, cargar database/seed.sql
//                   (usuarios de prueba, nunca datos reales).
// TODO (Natalia): exportar la conexión para que la usen las rutas de registro, login y perfil.
//
// Regla para todo el equipo: usar SIEMPRE consultas preparadas (db.prepare("... ?")),
// nunca concatenar datos del usuario dentro del SQL (evita inyección SQL).
