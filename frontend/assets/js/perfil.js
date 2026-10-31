// =====================================================================
// DUEÑA/O: Persona 4 — Tarea T-04 (Perfil)
// Pantalla: frontend/website/trabajador/perfil.html  ·  Contrato: docs/API.md
// =====================================================================
//
// TODO (Persona 4): al abrir la página: obtenerToken() de ./sesion.js (Persona 3);
//                   si no hay token, ir a /frontend/auth/login.html
// TODO (Persona 4): pedirApi('/api/perfil', { token }) de ./api.js y mostrar
//                   nombre, teléfono, ciudad, habilidades y experiencia.
//                   Si responde 401: ir al login.
// TODO (Persona 4): formulario de edición: PUT /api/perfil con ciudad, habilidades y experiencia;
//                   mostrar "Perfil guardado" o datos.error en #perfil-mensaje.
// TODO (Persona 4): mostrar los textos con textContent (no innerHTML) para evitar inyección de código.
