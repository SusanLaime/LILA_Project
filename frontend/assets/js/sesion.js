// =====================================================================
// DUEÑA/O: Persona 1 — Tarea T-01 (Frontend: token de sesión en el navegador)
// Guía: docs/TAREAS.md  ·  Contrato con el backend: docs/API.md
// Primera versión generada con ayuda de IA (ver docs/DECLARACION_IA.md):
// revisarla, entenderla y adaptarla es parte de la tarea.
// =====================================================================

const TOKEN_KEY = 'lila_token';

export function guardarToken(token) {
    localStorage.setItem(TOKEN_KEY, token);
}

export function obtenerToken() {
    return localStorage.getItem(TOKEN_KEY);
}

export function cerrarSesion() {
    localStorage.removeItem(TOKEN_KEY);
    window.location.href = '/frontend/auth/login.html';
}
