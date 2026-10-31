// =====================================================================
// DUEÑA/O: Persona 4 — Tarea T-04 (Inicio de sesión)
// Guía completa: docs/TAREAS.md  ·  Contrato: docs/API.md (POST /api/login)
// =====================================================================
//
// TODO (Persona 4): crear un express.Router con POST /
// TODO (Persona 4): validar con validarLogin() de ../validacion.js (Persona 3) -> 400 si faltan datos.
// TODO (Persona 4): buscar al usuario por teléfono y comparar con verificarPassword().
// TODO (Persona 4): si no existe o la contraseña no coincide:
//                   401 { error: "Teléfono o contraseña incorrectos." }
//                   (el mismo mensaje en ambos casos: no revelar qué dato falló).
// TODO (Persona 4): si es correcto: 200 { token, usuario: { id, nombre, rol } }
// TODO (Persona 4): exportar el router.
