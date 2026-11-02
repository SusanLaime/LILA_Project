// =====================================================================
// DUEÑA/O: Persona 2 — Tarea T-02 (Servidor y base de datos)
// Guía completa: docs/TAREAS.md  ·  Modelo de datos: docs/API.md
// =====================================================================
//
// Qué debe hacer este archivo:
//
// TODO (Persona 2): abrir la base de datos SQLite con el módulo incorporado de Node
//                   `node:sqlite` (DatabaseSync). Ruta: process.env.DB_PATH.
//                   No requiere instalar nada extra (Node 22.13 o superior).
// TODO (Persona 2): al iniciar, ejecutar database/schema.sql para crear las tablas
//                   si todavía no existen.
// TODO (Persona 2): si la tabla "usuarios" está vacía, cargar database/seed.sql
//                   (usuarios de prueba, nunca datos reales).
// TODO (Persona 2): exportar la conexión para que la usen las rutas de las Personas 3 y 4.
//
// Regla para todo el equipo: usar SIEMPRE consultas preparadas (db.prepare("... ?")),
// nunca concatenar datos del usuario dentro del SQL (evita inyección SQL).
