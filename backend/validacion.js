const text = value => typeof value === 'string' ? value.trim() : '';

function result(errores) {
  return errores.length ? { ok: false, errores } : { ok: true };
}

export function validarRegistro(datos = {}) {
  const errores = [];
  const nombre = text(datos.nombre);
  const ci = text(datos.ci);
  const telefono = text(datos.telefono);
  if (nombre.length < 3 || nombre.length > 100) errores.push('El nombre debe tener entre 3 y 100 caracteres.');
  if (!/^\d{5,10}$/.test(ci)) errores.push('El CI debe tener entre 5 y 10 dígitos.');
  if (!/^[67]\d{7}$/.test(telefono)) errores.push('El teléfono debe tener 8 dígitos y empezar con 6 o 7.');
  if (typeof datos.password !== 'string' || datos.password.length < 8) errores.push('La contraseña debe tener al menos 8 caracteres.');
  if (datos.consentimiento !== true) errores.push('Debes aceptar el consentimiento.');
  if (!['trabajador', 'empleador'].includes(datos.rol)) errores.push('Debes elegir si eres trabajador o empleador.');
  return result(errores);
}

export function validarLogin(datos = {}) {
  const errores = [];
  if (!text(datos.telefono) || typeof datos.password !== 'string' || !datos.password) errores.push('El teléfono y la contraseña son obligatorios.');
  return result(errores);
}

export function validarPerfil(datos = {}) {
  const errores = [];
  if (text(datos.ciudad).length > 60) errores.push('La ciudad no puede superar 60 caracteres.');
  if (text(datos.habilidades).length > 300) errores.push('Las habilidades no pueden superar 300 caracteres.');
  if (text(datos.experiencia).length > 1000) errores.push('La experiencia no puede superar 1000 caracteres.');
  return result(errores);
}
