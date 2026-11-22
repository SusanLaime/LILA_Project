// =====================================================================
// HasheadorBcrypt.js — Adaptador: cumple el contrato Hasheador usando las
// funciones de seguridad.js (que sigue siendo el único archivo que conoce bcrypt).
// =====================================================================

import { Hasheador } from '../contratos/Hasheador.js';
import { hashPassword, verificarPassword } from '../seguridad.js';

export class HasheadorBcrypt extends Hasheador {
  hashear(password) {
    return hashPassword(password);
  }

  comparar(password, hash) {
    return verificarPassword(password, hash);
  }
}
