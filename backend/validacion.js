// =====================================================================
// DUEÑA/O: Susan Laime — Validaciones
// Responsables: README.md (sección Equipo)  ·  Reglas de validación: docs/API.md
// =====================================================================
//
// Lo usan Natalia (registro), Joaquín (login) y Sara (perfil): entregarlo primero.
// Cada función recibe los datos y devuelve { ok: true } o { ok: false, errores: ["..."] }.

export function validarRegistro(datos) {
  const errores = [];

  if (!datos || typeof datos !== 'object' || Array.isArray(datos)) {
    return { ok: false, errores: ['Los datos del registro no son válidos.'] };
  }

  const nombre = typeof datos.nombre === 'string' ? datos.nombre.trim() : '';
  if (nombre.length < 3 || nombre.length > 100) {
    errores.push('El nombre debe tener entre 3 y 100 caracteres.');
  }

  if (typeof datos.ci !== 'string' || !/^\d{5,10}$/.test(datos.ci)) {
    errores.push('El CI debe contener entre 5 y 10 dígitos.');
  }

  if (typeof datos.telefono !== 'string' || !/^[67]\d{7}$/.test(datos.telefono)) {
    errores.push('El teléfono debe tener 8 dígitos y empezar con 6 o 7.');
  }

  if (typeof datos.password !== 'string' || datos.password.length < 8) {
    errores.push('La contraseña debe tener al menos 8 caracteres.');
  }

  if (datos.consentimiento !== true) {
    errores.push('Debes aceptar el tratamiento de tus datos personales.');
  }

  if (datos.rol !== 'trabajador' && datos.rol !== 'empleador') {
    errores.push('El rol debe ser trabajador o empleador.');
  }

  return errores.length === 0
    ? { ok: true }
    : { ok: false, errores };
}

export function validarLogin(datos) {
  const errores = [];

  if (!datos || typeof datos !== 'object' || Array.isArray(datos)) {
    return { ok: false, errores: ['Los datos de inicio de sesión no son válidos.'] };
  }

  if (typeof datos.ci !== 'string' || !/^\d{5,10}$/.test(datos.ci.trim())) {
    errores.push('El carnet debe contener entre 5 y 10 dígitos.');
  }

  if (typeof datos.password !== 'string' || datos.password.length === 0) {
    errores.push('La contraseña es obligatoria.');
  }

  return errores.length === 0
    ? { ok: true }
    : { ok: false, errores };
}

// TODO (Susan): validarPerfil(datos) — ciudad, habilidades y experiencia según docs/API.md.
