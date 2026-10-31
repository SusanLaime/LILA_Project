// =====================================================================
// DUEÑA/O: Sara Revollo — Perfil (CA-01)
// Responsables: README.md (sección Equipo)  ·  Contrato: docs/API.md (GET y PUT /api/perfil)
// Criterio de aceptación: CA-01 (README.md)
// =====================================================================
//
// TODO (Sara): crear un express.Router protegido con requiereSesion() de ../seguridad.js (Joaquín)
// TODO (Sara): GET /  -> devolver el perfil del usuario de la sesión (req.usuarioId)
//                   SIN password_hash.  200 { id, nombre, telefono, ROL, ciudad, habilidades,
//                   experiencia, estado_verificacion }
//                   (la pantalla usa "rol" para mostrar TRABAJADOR o EMPLEADOR).
// TODO (Sara): PUT /  -> validar con validarPerfil() de ../validacion.js (Susan),
//                   400 si hay errores; actualizar ciudad, habilidades y experiencia
//                   y devolver 200 con el perfil actualizado.
// TODO (Sara): exportar el router.
