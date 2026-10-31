// =====================================================================
// DUEÑA/O: Joaquín Peredo — Seguridad (contraseñas y sesión)
// Responsables: README.md (sección Equipo)
// =====================================================================
//
// Lo usan Natalia (hashPassword en el registro) y Sara (requiereSesion en el perfil):
// entregarlo primero.
//
// TODO (Joaquín): hashPassword(password)            -> hash con bcryptjs (requisito del Dossier §8.c)
// TODO (Joaquín): verificarPassword(password, hash) -> true / false
// TODO (Joaquín): crearToken(usuario)               -> token JWT firmado con process.env.JWT_SECRET
//                                                        (guardar solo el id del usuario; vence en 8 h)
//                   Si JWT_SECRET no está configurado, el servidor NO debe usar un secreto inventado:
//                   debe mostrar un error claro al iniciar.
// TODO (Joaquín): requiereSesion(req, res, next)    -> middleware de Express:
//                     lee "Authorization: Bearer <token>", lo verifica y guarda req.usuarioId.
//                     Si falta o no es válido: responder 401 { error: "Debes iniciar sesión." }
// TODO (Joaquín): exportar las cuatro funciones.
//
// Nunca guardar ni mostrar la contraseña en texto plano, ni en la base de datos ni en los logs.
