// =====================================================================
// DUEÑA/O: Persona 1 — Tarea T-01
// Guía completa: docs/TAREAS.md  ·  Contrato de la API: docs/API.md
// =====================================================================
//
// Función compartida para que las pantallas hablen con el servidor.
// La usan registro.js (Persona 2), login.js (Persona 3) y perfil.js (Persona 4).
//
// TODO (Persona 1): exportar pedirApi(ruta, { metodo = 'GET', cuerpo, token } = {})
//                   - hace fetch a la ruta (ej. '/api/registro') con JSON
//                   - si hay token, envía el encabezado "Authorization: Bearer <token>"
//                   - devuelve { ok, estado, datos } (datos = JSON de la respuesta)
//                   - si el servidor no responde, devuelve { ok: false, estado: 0,
//                     datos: { error: 'No se pudo conectar con el servidor.' } }
