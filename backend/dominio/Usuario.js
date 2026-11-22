// =====================================================================
// Usuario.js — Cuenta de LILA con sus perfiles (composición: un usuario
// tiene 1 o 2 perfiles y estos no existen sin él).
// =====================================================================

// Orden en que se listan los roles: trabajador primero, luego empleador.
const ORDEN_ROLES = ['trabajador', 'empleador'];

export class Usuario {
  #perfiles = new Map();

  constructor({
    id = null,
    nombre,
    ci = null,
    telefono = null,
    passwordHash = null,
    estadoVerificacion = 'no_verificado',
    rolOriginal = null
  } = {}) {
    this.id = id;
    this.nombre = nombre;
    this.ci = ci;
    this.telefono = telefono;
    this.passwordHash = passwordHash;
    this.estadoVerificacion = estadoVerificacion;
    // Columna usuarios.rol: respaldo para cuentas antiguas sin perfiles.
    this.rolOriginal = rolOriginal;
  }

  // Agrega un perfil. Si ya tiene uno de ese rol, no lo repite.
  agregarPerfil(perfil) {
    if (!this.#perfiles.has(perfil.rol())) {
      this.#perfiles.set(perfil.rol(), perfil);
    }
    return this;
  }

  obtenerPerfil(rol) {
    return this.#perfiles.get(rol) ?? null;
  }

  // Lista de roles ordenada. Si no tiene perfiles, usa el rol original.
  roles() {
    const roles = ORDEN_ROLES.filter(rol => this.#perfiles.has(rol));
    if (roles.length > 0) return roles;
    return this.rolOriginal ? [this.rolOriginal] : [];
  }

  tieneRol(rol) {
    return this.roles().includes(rol);
  }

  perfiles() {
    return [...this.#perfiles.values()];
  }
}
