// =====================================================================
// ServicioPerfil.js — Casos de uso del perfil: verlo, editarlo y agregar un rol.
// Contiene las reglas que antes estaban en routes/perfil.js.
// Solo depende del contrato RepositorioUsuarios y del dominio.
// =====================================================================

import { validarPerfil } from '../validacion.js';
import { PerfilTrabajador } from '../dominio/PerfilTrabajador.js';
import { PerfilEmpleador } from '../dominio/PerfilEmpleador.js';
import { errorDeNegocio } from './errores.js';

const ROLES_VALIDOS = ['trabajador', 'empleador'];

export class ServicioPerfil {
  #usuarios;

  constructor({ usuarios }) {
    this.#usuarios = usuarios;
  }

  // Devuelve el perfil del usuario con el rol pedido (o su primer rol) como activo.
  // La forma de la respuesta es la misma que documenta docs/API.md.
  ver(usuarioId, rolSolicitado) {
    const usuario = this.#usuarios.buscarPorId(usuarioId);
    if (!usuario) {
      throw errorDeNegocio('Debes iniciar sesión.', 401);
    }

    const roles = usuario.roles();
    const rolActivo = roles.includes(rolSolicitado) ? rolSolicitado : roles[0];
    const trabajador = usuario.obtenerPerfil('trabajador')?.aJSON() ?? null;
    const empleador = usuario.obtenerPerfil('empleador')?.aJSON() ?? null;
    const perfilActivo = rolActivo === 'empleador' ? empleador : trabajador;

    return {
      id: usuario.id,
      nombre: usuario.nombre,
      telefono: usuario.telefono,
      estado_verificacion: usuario.estadoVerificacion,
      rol: rolActivo,
      roles,
      ciudad: perfilActivo?.ciudad ?? null,
      habilidades: rolActivo === 'trabajador' ? trabajador?.habilidades ?? null : null,
      experiencia: rolActivo === 'trabajador' ? trabajador?.experiencia ?? null : null,
      genero: perfilActivo?.genero ?? null,
      edad: perfilActivo?.edad ?? null,
      perfiles: { trabajador, empleador }
    };
  }

  // Agrega un segundo rol a la cuenta con su perfil vacío. Devuelve la lista de roles.
  agregarRol(usuarioId, rol) {
    if (!ROLES_VALIDOS.includes(rol)) {
      throw errorDeNegocio('El perfil debe ser trabajador o empleador.', 400);
    }

    const usuario = this.#usuarios.buscarPorId(usuarioId);
    if (!usuario) {
      throw errorDeNegocio('Debes iniciar sesión.', 401);
    }

    usuario.agregarPerfil(rol === 'trabajador' ? new PerfilTrabajador() : new PerfilEmpleador());
    this.#usuarios.guardar(usuario);
    return usuario.roles();
  }

  // Guarda los cambios del perfil indicado y devuelve el perfil actualizado.
  actualizar(usuarioId, rolPedido, datos) {
    const validacion = validarPerfil(datos);
    if (!validacion.ok) {
      throw errorDeNegocio(validacion.errores.join(' '), 400);
    }

    const usuario = this.#usuarios.buscarPorId(usuarioId);
    const roles = usuario ? usuario.roles() : [];
    const rol = rolPedido || roles[0];

    if (!ROLES_VALIDOS.includes(rol)) {
      throw errorDeNegocio('El perfil debe ser trabajador o empleador.', 400);
    }
    if (!usuario || !usuario.tieneRol(rol)) {
      throw errorDeNegocio('No tienes activo ese perfil.', 403);
    }

    // Polimorfismo: cada perfil sabe qué campos actualizar.
    usuario.obtenerPerfil(rol).actualizar(datos);
    this.#usuarios.guardar(usuario);
    return this.ver(usuarioId, rol);
  }
}
