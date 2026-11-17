// =====================================================================
// DUEÑA/O: Joaquín Peredo — Inicio de sesión
// Responsables: README.md (sección Equipo)  ·  Contrato: docs/API.md
// =====================================================================

import express from 'express';
import db from '../db.js';
import { validarLogin } from '../validacion.js';
import { crearToken, verificarPassword } from '../seguridad.js';

const router = express.Router();

router.post('/', async (req, res) => {
  const datos = req.body ?? {};
  const validacion = validarLogin(datos);

  if (!validacion.ok) {
    return res.status(400).json({ error: validacion.errores.join(' ') });
  }

  try {
    const usuario = db.prepare(`
      SELECT id, nombre, rol, password_hash
      FROM usuarios
      WHERE ci = ?
    `).get(datos.ci.trim());

    if (!usuario || !(await verificarPassword(datos.password, usuario.password_hash))) {
      return res.status(401).json({
        error: 'Carnet o contraseña incorrectos.'
      });
    }

    const rolesGuardados = db.prepare(`
      SELECT rol
      FROM usuario_roles
      WHERE usuario_id = ?
      ORDER BY CASE rol
        WHEN 'trabajador' THEN 0
        WHEN 'empleador' THEN 1
      END
    `).all(usuario.id).map(fila => fila.rol);
    const roles = rolesGuardados.length > 0
      ? rolesGuardados
      : [usuario.rol];

    const token = crearToken(usuario);
    return res.status(200).json({
      token,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        rol: roles[0],
        roles
      }
    });
  } catch (error) {
    console.error('Error al iniciar sesión:', error);
    return res.status(500).json({
      error: 'No se pudo iniciar sesión. Verifica la configuración del servidor.'
    });
  }
});

export default router;
