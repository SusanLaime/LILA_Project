// =====================================================================
// DUEÑA/O: Joaquín Peredo — Seguridad (contraseñas y sesión)
// Responsables: README.md (sección Equipo)
// =====================================================================

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export function hashPassword(password) {
  if (typeof password !== 'string') {
    throw new TypeError('La contraseña debe ser texto.');
  }

  return bcrypt.hash(password, 10);
}

export function verificarPassword(password, hash) {
  if (typeof password !== 'string' || typeof hash !== 'string') {
    return Promise.resolve(false);
  }

  return bcrypt.compare(password, hash);
}

function obtenerJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (typeof secret !== 'string' || secret.trim() === '') {
    throw new Error('JWT_SECRET no está configurado. Añádelo a tu archivo de entorno.');
  }

  return secret;
}

export function validarConfiguracionJwt() {
  obtenerJwtSecret();
}

export function crearToken(usuario) {
  if (!Number.isSafeInteger(usuario?.id) || usuario.id < 1) {
    throw new TypeError('El usuario debe tener un id válido para crear una sesión.');
  }

  return jwt.sign({ id: usuario.id }, obtenerJwtSecret(), { expiresIn: '8h' });
}

export function requiereSesion(req, res, next) {
  const encabezado = req.get('Authorization') || '';
  const coincidencia = /^Bearer\s+(\S+)$/i.exec(encabezado);

  if (!coincidencia) {
    return res.status(401).json({ error: 'Debes iniciar sesión.' });
  }

  try {
    const payload = jwt.verify(coincidencia[1], obtenerJwtSecret());
    if (
      typeof payload !== 'object' ||
      !Number.isSafeInteger(payload.id) ||
      payload.id < 1
    ) {
      return res.status(401).json({ error: 'Debes iniciar sesión.' });
    }

    req.usuarioId = payload.id;
    return next();
  } catch {
    return res.status(401).json({ error: 'Debes iniciar sesión.' });
  }
}

// Nunca guardar ni mostrar la contraseña en texto plano, ni en la base de datos ni en los logs.
