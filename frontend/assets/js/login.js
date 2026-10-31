// =====================================================================
// DUEÑA/O: Persona 3 — Tarea T-03 (Inicio de sesión)
// Pantalla: frontend/auth/login.html  ·  Contrato: docs/API.md
// =====================================================================
//
// TODO (Persona 3): el botón "Crear nueva cuenta" (#btn-crear) lleva a register.html.
// TODO (Persona 3): al enviar #login-form:
//                   - llamar a pedirApi('/api/login', { metodo: 'POST', cuerpo }) de ./api.js
//                   - si responde 200: guardarToken(datos.token) e ir a /frontend/website/trabajador/perfil.html
//                   - si responde 400 o 401: mostrar datos.error en #login-mensaje
