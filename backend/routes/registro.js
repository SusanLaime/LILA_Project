import { Router } from 'express';
import { db } from '../db.js';
import { validarRegistro } from '../validacion.js';
import { hashPassword } from '../seguridad.js';

const router = Router();
router.post('/', async (req, res, next) => {
  const validacion = validarRegistro(req.body);
  if (!validacion.ok) return res.status(400).json({ error: validacion.errores[0] });
  const { nombre, ci, telefono, password, rol } = req.body;
  if (db.prepare('SELECT id FROM usuarios WHERE ci = ? OR telefono = ?').get(ci.trim(), telefono.trim())) {
    return res.status(409).json({ error: 'El CI o el teléfono ya están registrados.' });
  }
  try {
    const result = db.prepare(`INSERT INTO usuarios
      (nombre, ci, telefono, password_hash, rol, consentimiento_fecha)
      VALUES (?, ?, ?, ?, ?, ?)`).run(nombre.trim(), ci.trim(), telefono.trim(),
      await hashPassword(password), rol, new Date().toISOString());
    res.status(201).json({ id: Number(result.lastInsertRowid), mensaje: 'Cuenta creada correctamente.' });
  } catch (error) {
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') return res.status(409).json({ error: 'El CI o el teléfono ya están registrados.' });
    next(error);
  }
});
export default router;
