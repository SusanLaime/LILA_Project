
/* =====================================================================
 * DUEÑA/O: Sara Revollo — Perfil (CA-01)
 * Contrato: docs/API.md (GET y PUT /api/perfil)
 * ===================================================================== */

import express from 'express';
import db from '../db.js';
import { requiereSesion } from '../seguridad.js';
import { validarPerfil } from '../validacion.js';

const router = express.Router();

// ================================================================
// PROTEGER LAS RUTAS
// ================================================================

// Solo usuarios autenticados pueden consultar o modificar su perfil
router.use(requiereSesion);

// ================================================================
// CAMPOS PÚBLICOS DEL PERFIL
// ================================================================

// No incluir CI ni password_hash en las respuestas
const CAMPOS_PUBLICOS = `
    id,
    nombre,
    telefono,
    rol,
    ciudad,
    habilidades,
    experiencia,
    estado_verificacion
`;

// ================================================================
// CONSULTAR PERFIL EN SQLITE
// ================================================================

function obtenerPerfil(id) {

    const consulta = db.prepare(`
        SELECT ${CAMPOS_PUBLICOS}
        FROM usuarios
        WHERE id = ?
    `);

    return consulta.get(id);
}

// ================================================================
// GET /api/perfil
// ================================================================

// Devuelve los datos del usuario autenticado
router.get('/', (req, res) => {

    const perfil = obtenerPerfil(req.usuarioId);

    if (!perfil) {
        return res.status(401).json({
            error: 'Debes iniciar sesión.'
        });
    }

    return res.status(200).json(perfil);
});

// ================================================================
// PUT /api/perfil
// ================================================================

// Actualiza los datos editables del perfil
router.put('/', (req, res) => {

    // Validar información enviada
    const validacion = validarPerfil(req.body);

    if (!validacion.ok) {
        return res.status(400).json({
            error: validacion.errores.join(' ')
        });
    }

    // Consultar el perfil existente
    const perfilAnterior = obtenerPerfil(req.usuarioId);

    if (!perfilAnterior) {
        return res.status(401).json({
            error: 'Debes iniciar sesión.'
        });
    }

    // Ciudad: disponible para ambos roles
    const ciudad = req.body.ciudad.trim();

    // Campos laborales: solo trabajadores
    const habilidades = perfilAnterior.rol === 'trabajador'
        ? req.body.habilidades.trim()
        : perfilAnterior.habilidades;

    const experiencia = perfilAnterior.rol === 'trabajador'
        ? req.body.experiencia.trim()
        : perfilAnterior.experiencia;

    // Actualizar en SQLite con consulta preparada
    const actualizar = db.prepare(`
        UPDATE usuarios
        SET
            ciudad = ?,
            habilidades = ?,
            experiencia = ?
        WHERE id = ?
    `);

    actualizar.run(
        ciudad,
        habilidades,
        experiencia,
        req.usuarioId
    );

    // Recuperar los datos actualizados
    const perfilActualizado = obtenerPerfil(req.usuarioId);

    // Responder al frontend
    return res.status(200).json(perfilActualizado);
});

// ================================================================
// EXPORTAR ROUTER
// ================================================================

export default router;
