// =====================================================================
// DUEÑA/O: Natalia Arze — Registro (CA-02)
// Responsables: README.md (sección Equipo)  ·  Contrato: docs/API.md (POST /api/registro)
// Criterio de aceptación: CA-02 (README.md)
// =====================================================================
//
// TODO (Natalia): crear un express.Router con POST /
// TODO (Natalia): validar los datos con validarRegistro() de ../validacion.js (Susan)
//                   -> si hay errores: 400 { error: "..." }
// TODO (Natalia): REGLA DE NEGOCIO (CA-02): si el CI o el teléfono ya están registrados
//                   -> 409 { error: "El CI o el teléfono ya están registrados." }
//                   y NO guardar nada.
// TODO (Natalia): cifrar la contraseña con hashPassword() de ../seguridad.js (Joaquín).
// TODO (Natalia): insertar el usuario en la tabla "usuarios" con el ROL elegido
//                   ('trabajador' o 'empleador'), estado_verificacion = 'no_verificado'
//                   y la fecha de consentimiento.
// TODO (Natalia): responder 201 { id, mensaje: "Cuenta creada correctamente." }
// TODO (Natalia): exportar el router.
