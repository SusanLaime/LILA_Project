// =====================================================================
// DUEÑA/O: Persona 1 — Tarea T-01 (Frontend: pantalla de perfil)
// Guía: docs/TAREAS.md  ·  Contrato con el backend: docs/API.md
// Primera versión generada con ayuda de IA (ver docs/DECLARACION_IA.md):
// revisarla, entenderla y adaptarla es parte de la tarea.
// =====================================================================

import { pedirApi } from '../../assets/js/api.js';
import { obtenerToken } from '../../assets/js/sesion.js';
import { initHeader } from '../../assets/js/components.js';

const token = obtenerToken();
if (!token) {
    window.location.href = '/frontend/auth/login.html';
} else {
    const message = document.getElementById('perfil-mensaje');
    const form = document.getElementById('perfil-form');

    async function cargarPerfil() {
        const result = await pedirApi('/api/perfil', { token });
        if (result.estado === 401) {
            window.location.href = '/frontend/auth/login.html';
            return;
        }
        if (!result.ok) {
            message.textContent = result.datos.error;
            return;
        }
        const perfil = result.datos;
        initHeader(perfil.estado_verificacion, perfil.rol);
        if (perfil.rol === 'empleador') {
            document.querySelectorAll('.solo-trabajador').forEach(campo => { campo.hidden = true; });
        }
        document.querySelector('.profile-name').textContent = perfil.nombre;
        document.getElementById('perfil-telefono').textContent = perfil.telefono;
        document.getElementById('ciudad').value = perfil.ciudad || '';
        document.getElementById('habilidades').value = perfil.habilidades || '';
        document.getElementById('experiencia').value = perfil.experiencia || '';
        document.getElementById('badge-verif').textContent = perfil.estado_verificacion.replace('_', ' ').toUpperCase();
    }

    form?.addEventListener('submit', async event => {
        event.preventDefault();
        const result = await pedirApi('/api/perfil', {
            metodo: 'PUT',
            token,
            cuerpo: {
                ciudad: document.getElementById('ciudad').value,
                habilidades: document.getElementById('habilidades').value,
                experiencia: document.getElementById('experiencia').value
            }
        });
        message.textContent = result.ok ? 'Perfil guardado.' : result.datos.error;
    });

    cargarPerfil();
}
