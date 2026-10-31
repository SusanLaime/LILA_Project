// =====================================================================
// DUEÑA/O: Persona 3 — Tarea T-03 (Inicio de sesión)
// Guía completa: docs/TAREAS.md  ·  Contrato: docs/API.md (POST /api/login)
// =====================================================================
//
// TODO (Persona 3): crear un express.Router con POST /
// TODO (Persona 3): validar con validarLogin() de ../validacion.js -> 400 si faltan datos.
// TODO (Persona 3): buscar al usuario por teléfono y comparar con verificarPassword().
// TODO (Persona 3): si no existe o la contraseña no coincide:
//                   401 { error: "Teléfono o contraseña incorrectos." }
//                   (el mismo mensaje en ambos casos: no revelar qué dato falló).
// TODO (Persona 3): si es correcto: 200 { token, usuario: { id, nombre } }
// TODO (Persona 3): exportar el router.
