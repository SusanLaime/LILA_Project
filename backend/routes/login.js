import { Router } from 'express';
import { db } from '../db.js';
import { validarLogin } from '../validacion.js';
import { crearToken, verificarPassword } from '../seguridad.js';

const router = Router();
router.post('/', async (req, res) => {
  const validacion = validarLogin(req.body);
  if (!validacion.ok) return res.status(400).json({ error: validacion.errores[0] });
  const usuario = db.prepare('SELECT id, nombre, password_hash FROM usuarios WHERE telefono = ?').get(req.body.telefono.trim());
  if (!usuario || !(await verificarPassword(req.body.password, usuario.password_hash))) {
    return res.status(401).json({ error: 'Teléfono o contraseña incorrectos.' });
  }
  res.json({ token: crearToken(usuario), usuario: { id: usuario.id, nombre: usuario.nombre } });
});
export default router;
