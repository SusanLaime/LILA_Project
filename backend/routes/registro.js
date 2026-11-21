// =====================================================================
// registro.js — Ruta POST /api/registro: crea una cuenta nueva (trabajador, empleador o ambos) y la guarda en la base de datos.
// DUEÑA/O: Natalia Arze — Registro (CA-02)
// =====================================================================

//Este código depende de las funciones validarRegistro() de Susan 
//y hashPassword() de Joaquín


import express from 'express';
import db from '../db.js';
import { validarRegistro } from '../validacion.js';
import { hashPassword } from '../seguridad.js';

const router = express.Router();

// POST /api/registro — Registra a un usuario nuevo.
// Revisa los datos del formulario, rechaza el registro si el carnet o el teléfono
// ya existen, guarda la contraseña protegida (hash) y crea la cuenta con sus roles
// y sus perfiles vacíos. Todo se guarda junto: si un paso falla, no se guarda nada.
router.post('/', async (req, res) => {
  try {
    const datos = req.body ?? {};

    // 1. Validar los datos del formulario
    const validacion = validarRegistro(datos);

    if (!validacion.ok) {
      return res.status(400).json({
        error: validacion.errores.join(' ')
      });
    }

    const { nombre, ci, telefono, password } = datos;
    const roles = Array.isArray(datos.roles)
      ? datos.roles
      : [datos.rol];

    // 2. Comprobar si ya existe el usuario
    const existente = db.prepare(
      'SELECT id FROM usuarios WHERE ci = ? OR telefono = ?'
    ).get(ci, telefono);

    if (existente) {
      return res.status(409).json({
        error: 'El CI o el teléfono ya están registrados.'
      });
    }

    // 3. Proteger la contraseña
    const passwordHash = await hashPassword(password);

    // 4. Guardar el nuevo usuario
    db.exec('BEGIN IMMEDIATE');
    let resultado;
    try {
      resultado = db.prepare(`
        INSERT INTO usuarios (
          nombre, ci, telefono, password_hash,
          rol, estado_verificacion, consentimiento_fecha
        )
        VALUES (?, ?, ?, ?, ?, 'no_verificado', ?)
      `).run(
        nombre,
        ci,
        telefono,
        passwordHash,
        roles[0],
        new Date().toISOString()
      );

      const usuarioId = Number(resultado.lastInsertRowid);
      const insertarRol = db.prepare(
        'INSERT INTO usuario_roles (usuario_id, rol) VALUES (?, ?)'
      );
      roles.forEach(rol => insertarRol.run(usuarioId, rol));

      if (roles.includes('trabajador')) {
        db.prepare(
          'INSERT INTO perfiles_trabajador (usuario_id) VALUES (?)'
        ).run(usuarioId);
      }

      if (roles.includes('empleador')) {
        db.prepare(
          'INSERT INTO perfiles_empleador (usuario_id) VALUES (?)'
        ).run(usuarioId);
      }

      db.exec('COMMIT');
    } catch (error) {
      db.exec('ROLLBACK');
      throw error;
    }

    // 5. Responder que la cuenta fue creada
    return res.status(201).json({
      id: Number(resultado.lastInsertRowid),
      mensaje: 'Cuenta creada correctamente.'
    });

  } catch (error) {
    if (
      error.code === 'SQLITE_CONSTRAINT_UNIQUE' ||
      error.message?.includes('UNIQUE constraint failed')
    ) {
      return res.status(409).json({
        error: 'El CI o el teléfono ya están registrados.'
      });
    }

    console.error('Error al registrar usuario:', error);

    return res.status(500).json({
      error: 'No se pudo crear la cuenta.'
    });
  }
});

export default router;
