// =====================================================================
// Tokens.js — Contrato (interfaz) para crear y revisar tokens de sesión.
// =====================================================================

export class Tokens {
  // Devuelve un token firmado para ese usuario.
  crear(usuarioId) { throw new Error('No implementado'); }

  // Devuelve el id del usuario si el token es válido; si no, null.
  verificar(token) { throw new Error('No implementado'); }
}
