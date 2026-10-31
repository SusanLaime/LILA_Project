// =====================================================================
// DUEÑA/O: Joaquín Peredo — Token de sesión en el navegador
// Responsables: README.md (sección Equipo)  ·  Contrato con el backend: docs/API.md
// Primera versión generada con ayuda de IA (ver README.md, sección Uso de IA):
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
