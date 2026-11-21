// =====================================================================
// PerfilTrabajador.js — Perfil de trabajador: campos comunes + habilidades y experiencia.
// =====================================================================

import { Perfil } from './Perfil.js';

export class PerfilTrabajador extends Perfil {
  constructor({ habilidades = null, experiencia = null, ...comunes } = {}) {
    super(comunes);
    this.habilidades = habilidades;
    this.experiencia = experiencia;
  }

  rol() {
    return 'trabajador';
  }

  actualizar(datos) {
    super.actualizar(datos);
    this.habilidades = datos.habilidades.trim();
    this.experiencia = datos.experiencia.trim();
  }

  aJSON() {
    return {
      ciudad: this.ciudad,
      habilidades: this.habilidades,
      experiencia: this.experiencia,
      genero: this.genero,
      edad: this.edad
    };
  }
}
