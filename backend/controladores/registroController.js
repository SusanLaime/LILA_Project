// =====================================================================
// registroController.js — Ruta POST /api/registro: crea una cuenta nueva
// (trabajador, empleador o ambos). Antes era routes/registro.js.
// Natalia Arze — Registro (CA-02)
// =====================================================================
// Solo traduce entre HTTP y ServicioAuth: las reglas están en el servicio
// y el SQL en RepositorioUsuariosSqlite.

import express from 'express';

export class RegistroController {
  #servicio;

  constructor(servicioAuth) {
    this.#servicio = servicioAuth;
    this.router = express.Router();
    this.router.post('/', (req, res) => this.registrar(req, res));
  }

  // POST /api/registro — 201 { id, mensaje }, 400 datos inválidos, 409 CI o teléfono repetido.
  async registrar(req, res) {
    try {
      const usuario = await this.#servicio.registrar(req.body ?? {});
      return res.status(201).json({
        id: usuario.id,
        mensaje: 'Cuenta creada correctamente.'
      });
    } catch (error) {
      if (error.estado) {
        return res.status(error.estado).json({ error: error.message });
      }
      console.error('Error al registrar usuario:', error);
      return res.status(500).json({ error: 'No se pudo crear la cuenta.' });
    }
  }
}
