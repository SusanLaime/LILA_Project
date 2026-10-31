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
