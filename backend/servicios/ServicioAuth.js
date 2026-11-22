// =====================================================================
// ServicioAuth.js — Casos de uso de registro e inicio de sesión.
// Contiene las reglas que antes estaban en routes/registro.js y routes/login.js.
// Solo depende de contratos (RepositorioUsuarios, Hasheador, Tokens) y del
// dominio: no conoce Express, SQLite, bcrypt ni JWT.
// =====================================================================

import { validarRegistro, validarLogin } from '../validacion.js';
import { Usuario } from '../dominio/Usuario.js';
import { PerfilTrabajador } from '../dominio/PerfilTrabajador.js';
import { PerfilEmpleador } from '../dominio/PerfilEmpleador.js';
import { errorDeNegocio } from './errores.js';

const MENSAJE_DUPLICADO = 'El CI o el teléfono ya están registrados.';

export class ServicioAuth {
  #usuarios;
  #hasheador;
  #tokens;

  constructor({ usuarios, hasheador, tokens }) {
    this.#usuarios = usuarios;
    this.#hasheador = hasheador;
    this.#tokens = tokens;
  }

  // Crea una cuenta nueva con uno o dos perfiles vacíos. Devuelve el Usuario guardado.
  async registrar(datos) {
    const validacion = validarRegistro(datos);
    if (!validacion.ok) {
      throw errorDeNegocio(validacion.errores.join(' '), 400);
    }

    const { nombre, ci, telefono, password } = datos;
    const roles = Array.isArray(datos.roles) ? datos.roles : [datos.rol];

    if (this.#usuarios.existe(ci, telefono)) {
      throw errorDeNegocio(MENSAJE_DUPLICADO, 409);
    }

    const usuario = new Usuario({
      nombre,
      ci,
      telefono,
      passwordHash: await this.#hasheador.hashear(password),
      rolOriginal: roles[0]
    });
    if (roles.includes('trabajador')) usuario.agregarPerfil(new PerfilTrabajador());
    if (roles.includes('empleador')) usuario.agregarPerfil(new PerfilEmpleador());

    try {
      return this.#usuarios.guardar(usuario);
    } catch (error) {
      if (error.codigo === 'DUPLICADO') {
        throw errorDeNegocio(MENSAJE_DUPLICADO, 409);
      }
      throw error;
    }
  }

  // Revisa carnet y contraseña. Devuelve { token, usuario: { id, nombre, rol, roles } }.
  async iniciarSesion(datos) {
    const validacion = validarLogin(datos);
    if (!validacion.ok) {
      throw errorDeNegocio(validacion.errores.join(' '), 400);
    }

    const usuario = this.#usuarios.buscarPorCi(datos.ci.trim());
    if (!usuario || !(await this.#hasheador.comparar(datos.password, usuario.passwordHash))) {
      throw errorDeNegocio('Carnet o contraseña incorrectos.', 401);
    }

    const roles = usuario.roles();
    return {
      token: this.#tokens.crear(usuario.id),
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        rol: roles[0],
        roles
      }
    };
  }
}
