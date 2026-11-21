// =====================================================================
// loginController.js — Ruta POST /api/login: verifica carnet y contraseña y
// entrega el token de sesión. Antes era routes/login.js.
// =====================================================================
// Solo traduce entre HTTP y ServicioAuth.

import express from 'express';

export class LoginController {
  #servicio;

  constructor(servicioAuth) {
    this.#servicio = servicioAuth;
    this.router = express.Router();
    this.router.post('/', (req, res) => this.iniciarSesion(req, res));
  }

  // POST /api/login — 200 { token, usuario }, 400 datos inválidos, 401 carnet o clave incorrectos.
  async iniciarSesion(req, res) {
    try {
      const resultado = await this.#servicio.iniciarSesion(req.body ?? {});
      return res.status(200).json(resultado);
    } catch (error) {
      if (error.estado) {
        return res.status(error.estado).json({ error: error.message });
      }
      console.error('Error al iniciar sesión:', error);
      return res.status(500).json({
        error: 'No se pudo iniciar sesión. Verifica la configuración del servidor.'
      });
    }
  }
}
