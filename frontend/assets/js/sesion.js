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

// Rol activo (trabajador o empleador) que el usuario eligió por última vez.
// Así solo este archivo toca localStorage para la sesión.
const ROL_ACTIVO_KEY = 'lila_rol_activo';

export function guardarRolActivo(rol) {
    localStorage.setItem(ROL_ACTIVO_KEY, rol);
}

export function obtenerRolActivo() {
    return localStorage.getItem(ROL_ACTIVO_KEY);
}
