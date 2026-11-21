// =====================================================================
// Hasheador.js — Contrato (interfaz) para proteger y comparar contraseñas.
// =====================================================================

export class Hasheador {
  async hashear(password) { throw new Error('No implementado'); }
  async comparar(password, hash) { throw new Error('No implementado'); }
}
