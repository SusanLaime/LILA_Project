// =====================================================================
// DUEÑA/O: Persona 4 — Tarea T-04 (Perfil)
// Guía completa: docs/TAREAS.md  ·  Contrato: docs/API.md (GET y PUT /api/perfil)
// Criterio de aceptación: CA-01 (docs/CRITERIOS.md)
// =====================================================================
//
// TODO (Persona 4): crear un express.Router protegido con requiereSesion() de ../seguridad.js
// TODO (Persona 4): GET /  -> devolver el perfil del usuario de la sesión (req.usuarioId)
//                   SIN password_hash.  200 { id, nombre, telefono, ciudad, habilidades,
//                   experiencia, estado_verificacion }
// TODO (Persona 4): PUT /  -> validar con validarPerfil() de ../validacion.js (400 si hay errores),
//                   actualizar ciudad, habilidades y experiencia, y devolver 200 con el perfil actualizado.
// TODO (Persona 4): exportar el router.
