// =====================================================================
// Perfil.js — Clase abstracta con los datos comunes de todo perfil
// (ciudad, género y edad). PerfilTrabajador y PerfilEmpleador heredan de ella.
// =====================================================================

export class Perfil {
  constructor({ ciudad = null, genero = null, edad = null } = {}) {
    if (new.target === Perfil) {
      throw new Error('Perfil es abstracta: usa PerfilTrabajador o PerfilEmpleador.');
    }
    this.ciudad = ciudad;
    this.genero = genero;
    this.edad = edad;
  }

  // Cada perfil hijo dice qué rol representa.
  rol() {
    throw new Error('Cada perfil define su rol.');
  }

  // Actualiza los campos comunes. Los hijos agregan los suyos con super.actualizar().
  actualizar(datos) {
    this.ciudad = datos.ciudad.trim();
    this.genero = datos.genero;
    this.edad = datos.edad;
  }

  // Datos del perfil tal como los devuelve la API.
  aJSON() {
    return { ciudad: this.ciudad, genero: this.genero, edad: this.edad };
  }
}
