// =====================================================================
// DUEÑA/O: Persona 3 — Tarea T-03 (Registro)
// Guía completa: docs/TAREAS.md  ·  Contrato: docs/API.md (POST /api/registro)
// Criterio de aceptación: CA-02 (docs/CRITERIOS.md)
// =====================================================================
//
// TODO (Persona 3): crear un express.Router con POST /
// TODO (Persona 3): validar los datos con validarRegistro() de ../validacion.js
//                   -> si hay errores: 400 { error: "..." }
// TODO (Persona 3): REGLA DE NEGOCIO (CA-02): si el CI o el teléfono ya están registrados
//                   -> 409 { error: "El CI o el teléfono ya están registrados." }
//                   y NO guardar nada.
// TODO (Persona 3): cifrar la contraseña con hashPassword() de ../seguridad.js (Persona 4).
// TODO (Persona 3): insertar el usuario en la tabla "usuarios" con el ROL elegido
//                   ('trabajador' o 'empleador'), estado_verificacion = 'no_verificado'
//                   y la fecha de consentimiento.
// TODO (Persona 3): responder 201 { id, mensaje: "Cuenta creada correctamente." }
// TODO (Persona 3): exportar el router.
