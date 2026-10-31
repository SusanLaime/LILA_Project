import { Router } from 'express';
import { db } from '../db.js';
import { validarPerfil } from '../validacion.js';
import { requiereSesion } from '../seguridad.js';

const router = Router();
const perfil = id => db.prepare(`SELECT id, nombre, telefono, rol, ciudad, habilidades,
  experiencia, estado_verificacion FROM usuarios WHERE id = ?`).get(id);
router.use(requiereSesion);
router.get('/', (req, res) => res.json(perfil(req.usuarioId)));
router.put('/', (req, res) => {
  const validacion = validarPerfil(req.body);
  if (!validacion.ok) return res.status(400).json({ error: validacion.errores[0] });
  db.prepare('UPDATE usuarios SET ciudad = ?, habilidades = ?, experiencia = ? WHERE id = ?')
    .run(req.body.ciudad?.trim() || null, req.body.habilidades?.trim() || null,
      req.body.experiencia?.trim() || null, req.usuarioId);
  res.json(perfil(req.usuarioId));
});
export default router;
