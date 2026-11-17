/* =====================================================================
 * Perfil de cuenta y perfiles laborales.
 * Contrato: docs/API.md
 * ===================================================================== */

import express from 'express';
import db from '../db.js';
import { requiereSesion } from '../seguridad.js';
import { validarPerfil } from '../validacion.js';

const router = express.Router();
router.use(requiereSesion);

function obtenerRoles(usuarioId) {
    const roles = db.prepare(`
        SELECT rol
        FROM usuario_roles
        WHERE usuario_id = ?
        ORDER BY CASE rol
            WHEN 'trabajador' THEN 0
            WHEN 'empleador' THEN 1
        END
    `).all(usuarioId).map(fila => fila.rol);

    if (roles.length > 0) {
        return roles;
    }

    const usuario = db.prepare(
        'SELECT rol FROM usuarios WHERE id = ?'
    ).get(usuarioId);

    return usuario ? [usuario.rol] : [];
}

function obtenerPerfil(usuarioId, rolSolicitado) {
    const usuario = db.prepare(`
        SELECT id, nombre, telefono, estado_verificacion
        FROM usuarios
        WHERE id = ?
    `).get(usuarioId);

    if (!usuario) {
        return null;
    }

    const roles = obtenerRoles(usuarioId);
    const rolActivo = roles.includes(rolSolicitado)
        ? rolSolicitado
        : roles[0];
    const trabajador = roles.includes('trabajador')
        ? db.prepare(`
            SELECT ciudad, habilidades, experiencia, genero, edad
            FROM perfiles_trabajador
            WHERE usuario_id = ?
        `).get(usuarioId) || null
        : null;
    const empleador = roles.includes('empleador')
        ? db.prepare(`
            SELECT ciudad, genero, edad
            FROM perfiles_empleador
            WHERE usuario_id = ?
        `).get(usuarioId) || null
        : null;
    const perfilActivo = rolActivo === 'empleador' ? empleador : trabajador;

    return {
        ...usuario,
        rol: rolActivo,
        roles,
        ciudad: perfilActivo?.ciudad ?? null,
        habilidades: rolActivo === 'trabajador'
            ? trabajador?.habilidades ?? null
            : null,
        experiencia: rolActivo === 'trabajador'
            ? trabajador?.experiencia ?? null
            : null,
        genero: perfilActivo?.genero ?? null,
        edad: perfilActivo?.edad ?? null,
        perfiles: { trabajador, empleador }
    };
}

router.get('/', (req, res) => {
    const perfil = obtenerPerfil(req.usuarioId, req.query.rol);

    if (!perfil) {
        return res.status(401).json({
            error: 'Debes iniciar sesión.'
        });
    }

    return res.status(200).json(perfil);
});

router.put('/', (req, res) => {
    const validacion = validarPerfil(req.body);

    if (!validacion.ok) {
        return res.status(400).json({
            error: validacion.errores.join(' ')
        });
    }

    const roles = obtenerRoles(req.usuarioId);
    const rol = req.body.rol || roles[0];

    if (rol !== 'trabajador' && rol !== 'empleador') {
        return res.status(400).json({
            error: 'El perfil debe ser trabajador o empleador.'
        });
    }

    if (!roles.includes(rol)) {
        return res.status(403).json({
            error: 'No tienes activo ese perfil.'
        });
    }

    const valoresComunes = [
        req.body.ciudad.trim(),
        req.body.genero,
        req.body.edad
    ];

    if (rol === 'trabajador') {
        db.prepare(`
            UPDATE perfiles_trabajador
            SET ciudad = ?, habilidades = ?, experiencia = ?, genero = ?, edad = ?
            WHERE usuario_id = ?
        `).run(
            valoresComunes[0],
            req.body.habilidades.trim(),
            req.body.experiencia.trim(),
            valoresComunes[1],
            valoresComunes[2],
            req.usuarioId
        );
    } else {
        db.prepare(`
            UPDATE perfiles_empleador
            SET ciudad = ?, genero = ?, edad = ?
            WHERE usuario_id = ?
        `).run(
            valoresComunes[0],
            valoresComunes[1],
            valoresComunes[2],
            req.usuarioId
        );
    }

    const perfilActualizado = obtenerPerfil(req.usuarioId, rol);
    return res.status(200).json(perfilActualizado);
});

export default router;
