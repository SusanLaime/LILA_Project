// =====================================================================
// validacion.js — Revisa que los datos de registro, inicio de sesión y perfil estén completos y bien escritos antes de usarlos.
// =====================================================================
//
// Lo usan Natalia (registro), — (login) y Sara (perfil): entregarlo primero.
// Cada función recibe los datos y devuelve { ok: true } o { ok: false, errores: ["..."] }.

// Revisa el formulario de registro: nombre (3 a 100 letras), carnet (5 a 10 dígitos),
// teléfono (8 dígitos, empieza con 6 o 7), contraseña (mínimo 8), consentimiento aceptado
// y rol (trabajador, empleador o ambos, sin repetir). Lo usa registro.js.
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

  const roles = Array.isArray(datos.roles)
    ? datos.roles
    : [datos.rol];
  const rolesValidos = ['trabajador', 'empleador'];

  if (
    roles.length < 1 ||
    roles.length > rolesValidos.length ||
    roles.some(rol => !rolesValidos.includes(rol)) ||
    new Set(roles).size !== roles.length
  ) {
    errores.push(
      'Selecciona trabajador, empleador o ambos perfiles, sin repetirlos.'
    );
  }

  return errores.length === 0
    ? { ok: true }
    : { ok: false, errores };
}

// Revisa el formulario de inicio de sesión: carnet de 5 a 10 dígitos y contraseña no vacía.
// No comprueba si son correctos; eso lo hace login.js con la base de datos.
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

// TODO (Sara): validarPerfil(datos) — ciudad, habilidades y experiencia según docs/API.md.

// Revisa los datos del perfil: ciudad (máx. 60), habilidades (máx. 300) y experiencia
// (máx. 1000) como texto; género (masculino, femenino u otro) y edad (18 a 100) obligatorios.
// Lo usa perfil.js al guardar cambios.
export function validarPerfil(datos) {
  if (
    !datos ||
    typeof datos !== 'object' ||
    Array.isArray(datos)
  ) {
    return {
      ok: false,
      errores: ['Los datos del perfil no son válidos.']
    };
  }

  const errores = [];

  const campos = [
    ['ciudad', 60],
    ['habilidades', 300],
    ['experiencia', 1000]
  ];

  for (const [campo, maximo] of campos) {
    if (
      typeof datos[campo] !== 'string' ||
      datos[campo].trim().length > maximo
    ) {
      errores.push(
        `El campo ${campo} debe ser texto de máximo ${maximo} caracteres.`
      );
    }
  }

  // Género obligatorio
  const generosPermitidos = [
      'masculino',
      'femenino',
      'otro'
  ];

  if (!generosPermitidos.includes(datos.genero)) {
      errores.push('Debes seleccionar tu género.');
  }

  // Edad obligatoria
  if (
      !Number.isInteger(datos.edad) ||
      datos.edad < 18 ||
      datos.edad > 100
  ) {
      errores.push(
          'Debes ingresar una edad válida entre 18 y 100 años.'
      );
  }

  return errores.length === 0
    ? { ok: true }
    : { ok: false, errores };
}
