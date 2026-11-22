// =====================================================================
// Sesion.js — Adaptador: expone las funciones de sesion.js como una clase,
// para que las páginas reciban la sesión por su constructor.
// =====================================================================

import {
    guardarToken,
    obtenerToken,
    cerrarSesion,
    guardarRolActivo,
    obtenerRolActivo
} from '../sesion.js';

export class Sesion {
    guardar(token) { guardarToken(token); }
    obtener() { return obtenerToken(); }
    cerrar() { cerrarSesion(); }
    guardarRolActivo(rol) { guardarRolActivo(rol); }
    obtenerRolActivo() { return obtenerRolActivo(); }
}
