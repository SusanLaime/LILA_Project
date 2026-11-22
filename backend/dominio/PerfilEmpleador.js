// =====================================================================
// PerfilEmpleador.js — Perfil de empleador: solo los campos comunes.
// =====================================================================

import { Perfil } from './Perfil.js';

export class PerfilEmpleador extends Perfil {
  rol() {
    return 'empleador';
  }
}
