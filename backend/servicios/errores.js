// =====================================================================
// errores.js — Crea los errores de negocio que lanzan los servicios.
// "estado" es el código HTTP que el controlador debe responder.
// =====================================================================

export function errorDeNegocio(mensaje, estado) {
  return Object.assign(new Error(mensaje), { estado });
}
