// =====================================================================
// DUEÑA/O: Persona 2 — Tarea T-02 (Registro)
// Pantalla: frontend/auth/register.html  ·  Contrato: docs/API.md
// =====================================================================
//
// TODO (Persona 2): al enviar #registroForm (evitar que la página se recargue):
//                   - leer nombre, ci, telefono, password y consentimiento
//                   - llamar a pedirApi('/api/registro', { metodo: 'POST', cuerpo }) de ./api.js
//                   - si responde 201: mostrar "Cuenta creada" y enviar al login
//                   - si responde 400 o 409: mostrar datos.error en #registro-mensaje
//                   - desactivar el botón mientras se envía (evita registros dobles)
