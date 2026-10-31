// =====================================================================
// DUEÑA/O: Persona 4 — Tarea T-04 (Sesión y perfil)
// Guía completa: docs/TAREAS.md
// =====================================================================
//
// Este archivo lo usa también la Persona 3 (hashPassword en el registro):
// entregarlo primero (fecha en docs/CALENDARIO.md).
//
// TODO (Persona 4): hashPassword(password)            -> hash con bcryptjs (requisito del Dossier §8.c)
// TODO (Persona 4): verificarPassword(password, hash) -> true / false
// TODO (Persona 4): crearToken(usuario)               -> token JWT firmado con process.env.JWT_SECRET
//                                                        (guardar solo el id del usuario; vence en 8 h)
//                   Si JWT_SECRET no está configurado, el servidor NO debe usar un secreto inventado:
//                   debe mostrar un error claro al iniciar.
// TODO (Persona 4): requiereSesion(req, res, next)    -> middleware de Express:
//                     lee "Authorization: Bearer <token>", lo verifica y guarda req.usuarioId.
//                     Si falta o no es válido: responder 401 { error: "Debes iniciar sesión." }
// TODO (Persona 4): exportar las cuatro funciones.
//
// Nunca guardar ni mostrar la contraseña en texto plano, ni en la base de datos ni en los logs.
