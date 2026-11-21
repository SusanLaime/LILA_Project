// =====================================================================
// MiddlewareSesion.js — Protege las rutas privadas. Lee el encabezado
// "Authorization: Bearer <token>" y lo revisa con el contrato Tokens.
// Si es válido guarda req.usuarioId y deja pasar; si no, corta con 401.
// =====================================================================

export class MiddlewareSesion {
  #tokens;

  constructor(tokens) {
    this.#tokens = tokens;
  }

  // Función flecha: Express la recibe suelta y conserva "this".
  requiereSesion = (req, res, next) => {
    const encabezado = req.get('Authorization') || '';
    const coincidencia = /^Bearer\s+(\S+)$/i.exec(encabezado);
    const usuarioId = coincidencia ? this.#tokens.verificar(coincidencia[1]) : null;

    if (usuarioId === null) {
      return res.status(401).json({ error: 'Debes iniciar sesión.' });
    }

    req.usuarioId = usuarioId;
    return next();
  };
}
