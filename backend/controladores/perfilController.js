/* =====================================================================
 * perfilController.js — Rutas de /api/perfil: permite al usuario con sesión
 * ver, editar y agregar sus perfiles de trabajador o empleador.
 * Antes era routes/perfil.js. Contrato: docs/API.md
 * ===================================================================== */
// Solo traduce entre HTTP y ServicioPerfil. La sesión la revisa
// MiddlewareSesion antes (cadena de responsabilidad).

import express from 'express';

export class PerfilController {
  #servicio;

  constructor(servicioPerfil, middlewareSesion) {
    this.#servicio = servicioPerfil;
    this.router = express.Router();

    // Le pide al navegador no guardar en caché las respuestas del perfil.
    this.router.use((req, res, next) => {
      res.set('Cache-Control', 'no-store');
      next();
    });

    // Todas las rutas de este controlador exigen haber iniciado sesión.
    this.router.use(middlewareSesion.requiereSesion);

    this.router.get('/', (req, res, next) => this.#responder(res, next, 200,
      () => this.#servicio.ver(req.usuarioId, req.query.rol)));

    this.router.post('/roles', (req, res, next) => this.#responder(res, next, 200,
      () => ({
        mensaje: 'Perfil agregado correctamente.',
        roles: this.#servicio.agregarRol(req.usuarioId, req.body?.rol)
      })));

    this.router.put('/', (req, res, next) => this.#responder(res, next, 200,
      () => this.#servicio.actualizar(req.usuarioId, req.body?.rol, req.body)));
  }

  // Ejecuta el caso de uso y responde. Los errores de negocio traen su "estado";
  // los inesperados pasan al manejador global de errores de server.js (500).
  #responder(res, next, estado, casoDeUso) {
    try {
      return res.status(estado).json(casoDeUso());
    } catch (error) {
      if (error.estado) {
        return res.status(error.estado).json({ error: error.message });
      }
      return next(error);
    }
  }
}
