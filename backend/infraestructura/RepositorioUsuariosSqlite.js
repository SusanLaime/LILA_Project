// =====================================================================
// RepositorioUsuariosSqlite.js — Cumple el contrato RepositorioUsuarios con
// SQLite. Es el ÚNICO lugar con SQL de usuarios, roles y perfiles (antes
// estaba repartido en routes/registro.js, login.js y perfil.js).
// Recibe la conexión (db.js) por el constructor.
// =====================================================================

import { RepositorioUsuarios } from '../contratos/RepositorioUsuarios.js';
import { Usuario } from '../dominio/Usuario.js';
import { PerfilTrabajador } from '../dominio/PerfilTrabajador.js';
import { PerfilEmpleador } from '../dominio/PerfilEmpleador.js';

export class RepositorioUsuariosSqlite extends RepositorioUsuarios {
  #db;

  constructor(db) {
    super();
    this.#db = db;
  }

  buscarPorId(id) {
    const fila = this.#db.prepare(`
      SELECT id, nombre, ci, telefono, password_hash, rol, estado_verificacion
      FROM usuarios
      WHERE id = ?
    `).get(id);
    return fila ? this.#armarUsuario(fila) : null;
  }

  buscarPorCi(ci) {
    const fila = this.#db.prepare(`
      SELECT id, nombre, ci, telefono, password_hash, rol, estado_verificacion
      FROM usuarios
      WHERE ci = ?
    `).get(ci);
    return fila ? this.#armarUsuario(fila) : null;
  }

  existe(ci, telefono) {
    const fila = this.#db.prepare(
      'SELECT id FROM usuarios WHERE ci = ? OR telefono = ?'
    ).get(ci, telefono);
    return Boolean(fila);
  }

  guardar(usuario) {
    try {
      this.#db.exec('BEGIN IMMEDIATE');
      try {
        if (usuario.id === null) {
          this.#insertarUsuario(usuario);
        }
        this.#guardarPerfiles(usuario);
        this.#db.exec('COMMIT');
      } catch (error) {
        this.#db.exec('ROLLBACK');
        throw error;
      }
    } catch (error) {
      if (
        error.code === 'SQLITE_CONSTRAINT_UNIQUE' ||
        error.message?.includes('UNIQUE constraint failed')
      ) {
        throw Object.assign(
          new Error('El CI o el teléfono ya están registrados.'),
          { codigo: 'DUPLICADO' }
        );
      }
      throw error;
    }
    return usuario;
  }

  // ---------------------------------------------------------------
  // De filas de la base de datos a objetos del dominio
  // ---------------------------------------------------------------

  #armarUsuario(fila) {
    const usuario = new Usuario({
      id: fila.id,
      nombre: fila.nombre,
      ci: fila.ci,
      telefono: fila.telefono,
      passwordHash: fila.password_hash,
      estadoVerificacion: fila.estado_verificacion,
      rolOriginal: fila.rol
    });

    // Roles guardados (trabajador primero). Si no hay, se usa usuarios.rol.
    const guardados = this.#db.prepare(`
      SELECT rol
      FROM usuario_roles
      WHERE usuario_id = ?
      ORDER BY CASE rol
        WHEN 'trabajador' THEN 0
        WHEN 'empleador' THEN 1
      END
    `).all(fila.id).map(f => f.rol);
    const roles = guardados.length > 0 ? guardados : [fila.rol];

    if (roles.includes('trabajador')) {
      const datos = this.#db.prepare(`
        SELECT ciudad, habilidades, experiencia, genero, edad
        FROM perfiles_trabajador
        WHERE usuario_id = ?
      `).get(fila.id);
      usuario.agregarPerfil(new PerfilTrabajador({ ...datos }));
    }

    if (roles.includes('empleador')) {
      const datos = this.#db.prepare(`
        SELECT ciudad, genero, edad
        FROM perfiles_empleador
        WHERE usuario_id = ?
      `).get(fila.id);
      usuario.agregarPerfil(new PerfilEmpleador({ ...datos }));
    }

    return usuario;
  }

  // ---------------------------------------------------------------
  // De objetos del dominio a filas de la base de datos
  // ---------------------------------------------------------------

  #insertarUsuario(usuario) {
    const resultado = this.#db.prepare(`
      INSERT INTO usuarios (
        nombre, ci, telefono, password_hash,
        rol, estado_verificacion, consentimiento_fecha
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      usuario.nombre,
      usuario.ci,
      usuario.telefono,
      usuario.passwordHash,
      usuario.rolOriginal ?? usuario.roles()[0],
      usuario.estadoVerificacion,
      new Date().toISOString()
    );
    usuario.id = Number(resultado.lastInsertRowid);
  }

  // Inserta los roles y filas de perfil que falten y guarda los datos de cada perfil.
  #guardarPerfiles(usuario) {
    for (const perfil of usuario.perfiles()) {
      this.#db.prepare(`
        INSERT OR IGNORE INTO usuario_roles (usuario_id, rol)
        VALUES (?, ?)
      `).run(usuario.id, perfil.rol());

      if (perfil instanceof PerfilTrabajador) {
        this.#db.prepare(
          'INSERT OR IGNORE INTO perfiles_trabajador (usuario_id) VALUES (?)'
        ).run(usuario.id);
        this.#db.prepare(`
          UPDATE perfiles_trabajador
          SET ciudad = ?, habilidades = ?, experiencia = ?, genero = ?, edad = ?
          WHERE usuario_id = ?
        `).run(
          perfil.ciudad,
          perfil.habilidades,
          perfil.experiencia,
          perfil.genero,
          perfil.edad,
          usuario.id
        );
      } else {
        this.#db.prepare(
          'INSERT OR IGNORE INTO perfiles_empleador (usuario_id) VALUES (?)'
        ).run(usuario.id);
        this.#db.prepare(`
          UPDATE perfiles_empleador
          SET ciudad = ?, genero = ?, edad = ?
          WHERE usuario_id = ?
        `).run(perfil.ciudad, perfil.genero, perfil.edad, usuario.id);
      }
    }
  }
}
