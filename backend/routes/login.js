// =====================================================================
// DUEÑA/O: Joaquín Peredo — Inicio de sesión
// Responsables: README.md (sección Equipo)  ·  Contrato: docs/API.md (POST /api/login)
// =====================================================================
//
// TODO (Joaquín): crear un express.Router con POST /
// TODO (Joaquín): validar con validarLogin() de ../validacion.js (Susan) -> 400 si faltan datos.
// TODO (Joaquín): buscar al usuario por teléfono y comparar con verificarPassword().
// TODO (Joaquín): si no existe o la contraseña no coincide:
//                   401 { error: "Teléfono o contraseña incorrectos." }
//                   (el mismo mensaje en ambos casos: no revelar qué dato falló).
// TODO (Joaquín): si es correcto: 200 { token, usuario: { id, nombre, rol } }
// TODO (Joaquín): exportar el router.
