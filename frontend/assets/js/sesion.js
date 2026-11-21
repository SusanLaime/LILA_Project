// =====================================================================
// Saves, reads and deletes the session token in the browser (localStorage); logging out also sends the user to the login page.
// Guarda, lee y borra el token de sesión en el navegador (localStorage); al cerrar sesión también envía al usuario a la página de inicio de sesión.
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
