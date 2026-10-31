// =====================================================================
// DUEÑA/O: Persona 3 — Tarea T-03 (Inicio de sesión, seguridad y validaciones)
// Guía completa: docs/TAREAS.md
// =====================================================================
//
// Este archivo lo usan también la Persona 2 (registro) y la Persona 4 (perfil).
//
// TODO (Persona 3): hashPassword(password)            -> hash con bcryptjs (requisito del Dossier §8.c)
// TODO (Persona 3): verificarPassword(password, hash) -> true / false
// TODO (Persona 3): crearToken(usuario)               -> token JWT firmado con process.env.JWT_SECRET
//                                                        (guardar solo el id del usuario; vence en 8 h)
// TODO (Persona 3): requiereSesion(req, res, next)    -> middleware de Express:
//                     lee "Authorization: Bearer <token>", lo verifica y guarda req.usuarioId.
//                     Si falta o no es válido: responder 401 { error: "Debes iniciar sesión." }
// TODO (Persona 3): exportar las cuatro funciones.
//
// Nunca guardar ni mostrar la contraseña en texto plano, ni en la base de datos ni en los logs.
