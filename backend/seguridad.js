import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const secret = () => process.env.JWT_SECRET || 'development-secret-change-me';

export const hashPassword = password => bcrypt.hash(password, 12);
export const verificarPassword = (password, hash) => bcrypt.compare(password, hash);
export const crearToken = usuario => jwt.sign({ usuarioId: usuario.id }, secret(), { expiresIn: '8h' });

export function requiereSesion(req, res, next) {
  const authorization = req.get('Authorization') || '';
  const token = authorization.startsWith('Bearer ') ? authorization.slice(7) : '';
  try {
    req.usuarioId = jwt.verify(token, secret()).usuarioId;
    next();
  } catch {
    res.status(401).json({ error: 'Debes iniciar sesión.' });
  }
}
