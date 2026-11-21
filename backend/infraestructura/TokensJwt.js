// =====================================================================
// TokensJwt.js — Adaptador: cumple el contrato Tokens usando las funciones
// de seguridad.js (que sigue siendo el único archivo que conoce JWT).
// =====================================================================

import { Tokens } from '../contratos/Tokens.js';
import { crearToken, verificarToken } from '../seguridad.js';

export class TokensJwt extends Tokens {
  crear(usuarioId) {
    return crearToken({ id: usuarioId });
  }

  verificar(token) {
    return verificarToken(token);
  }
}
