// =====================================================================
// DUEÑA/O: Persona 2 — Tarea T-02 (Registro)
// Guía completa: docs/TAREAS.md  ·  Contrato: docs/API.md (POST /api/registro)
// Criterio de aceptación: CA-02 (docs/CRITERIOS.md)
// =====================================================================
//
// TODO (Persona 2): crear un express.Router con POST /
// TODO (Persona 2): validar los datos con validarRegistro() de ../validacion.js (Persona 3)
//                   -> si hay errores: 400 { error: "..." }
// TODO (Persona 2): REGLA DE NEGOCIO (CA-02): si el CI o el teléfono ya están registrados
//                   -> 409 { error: "El CI o el teléfono ya están registrados." }
//                   y NO guardar nada.
// TODO (Persona 2): guardar la contraseña con hashPassword() de ../seguridad.js (Persona 3).
// TODO (Persona 2): insertar el usuario en la tabla "usuarios" con
//                   estado_verificacion = 'no_verificado' y la fecha de consentimiento.
// TODO (Persona 2): responder 201 { id, mensaje: "Cuenta creada correctamente." }
// TODO (Persona 2): exportar el router.
