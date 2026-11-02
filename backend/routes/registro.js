// =====================================================================
// DUEÑA/O: Natalia Arze — Registro (CA-02)
// Responsables: README.md (sección Equipo)  ·  Contrato: docs/API.md (POST /api/registro)
// Criterio de aceptación: CA-02 (README.md)
// =====================================================================

//Este código depende de las funciones validarRegistro() de Susan 
//y hashPassword() de Joaquín


import express from 'express';
import db from '../db.js';
import { validarRegistro } from '../validacion.js';
import { hashPassword } from '../seguridad.js';

const router = express.Router();

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

    const { nombre, ci, telefono, password, rol } = datos;

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
    const resultado = db.prepare(`
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
      rol,
      new Date().toISOString()
    );

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
