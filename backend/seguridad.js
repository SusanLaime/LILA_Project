// =====================================================================
// DUEÑA/O: Joaquín Peredo — Seguridad (contraseñas y sesión)
// seguridad.js — Protege las contraseñas (hash) y maneja la sesión con tokens: los crea al iniciar sesión y los revisa en las rutas privadas.
// =====================================================================

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Convierte la contraseña en un hash (texto cifrado que no se puede revertir)
// para guardarla en la base de datos. Se usa al registrarse.
export function hashPassword(password) {
  if (typeof password !== 'string') {
    throw new TypeError('La contraseña debe ser texto.');
  }

  return bcrypt.hash(password, 10);
}

// Compara la contraseña escrita con el hash guardado. Devuelve true si coinciden.
// Se usa al iniciar sesión.
export function verificarPassword(password, hash) {
  if (typeof password !== 'string' || typeof hash !== 'string') {
    return Promise.resolve(false);
  }

  return bcrypt.compare(password, hash);
}

// Lee la clave secreta JWT_SECRET del archivo .env. Con ella se firman y revisan
// los tokens. Si falta, lanza un error. Es interna: solo la usa este archivo.
function obtenerJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (typeof secret !== 'string' || secret.trim() === '') {
    throw new Error('JWT_SECRET no está configurado. Añádelo a tu archivo de entorno.');
  }

  return secret;
}

// Revisa que JWT_SECRET exista. server.js la llama al arrancar para que el servidor
// no inicie si falta la clave, en vez de fallar después en el primer login.
export function validarConfiguracionJwt() {
  obtenerJwtSecret();
}

// Crea el token de sesión del usuario: guarda solo su id, lo firma con la clave
// secreta y vence en 8 horas. Se usa al iniciar sesión.
export function crearToken(usuario) {
  if (!Number.isSafeInteger(usuario?.id) || usuario.id < 1) {
    throw new TypeError('El usuario debe tener un id válido para crear una sesión.');
  }

  return jwt.sign({ id: usuario.id }, obtenerJwtSecret(), { expiresIn: '8h' });
}

// Middleware que protege las rutas privadas (por ejemplo, /api/perfil).
// Busca el token en el encabezado "Authorization: Bearer <token>" y lo revisa.
// Si es válido, guarda el id del usuario en req.usuarioId y deja pasar (next).
// Si falta, es falso o ya venció, responde 401 "Debes iniciar sesión."
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
