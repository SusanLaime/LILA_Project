// =====================================================================
// DUEÑA/O: Sara Revollo — Pantalla de perfil
// Responsables: README.md (sección Equipo)  ·  Contrato con el backend: docs/API.md
// Primera versión generada con ayuda de IA (ver README.md, sección Uso de IA):
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

    // Fecha de hoy en la barra superior
    const fecha = document.getElementById('fecha-hoy');
    if (fecha) {
        const texto = new Date().toLocaleDateString('es-BO', {
            weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
        });
        fecha.textContent = texto.charAt(0).toUpperCase() + texto.slice(1);
    }

    // Cerrar sesión: borra el token guardado (clave "lila_token", ver docs/API.md)
    document.getElementById('btn-salir')?.addEventListener('click', () => {
        localStorage.removeItem('lila_token');
        window.location.href = '/frontend/auth/login.html';
    });

    // Barra de progreso: cuenta cuántos campos del perfil ya tienen contenido
    function actualizarProgreso(perfil) {
        const campos = perfil.rol === 'empleador'
            ? ['ciudad']
            : ['ciudad', 'habilidades', 'experiencia'];
        let completos = 0;
        campos.forEach(campo => {
            const lleno = Boolean(perfil[campo] && String(perfil[campo]).trim());
            if (lleno) completos++;
            document.querySelector(`.lp-lista li[data-campo="${campo}"]`)
                ?.classList.toggle('hecho', lleno);
        });
        const porcentaje = Math.round((completos / campos.length) * 100);
        document.getElementById('progreso-texto').textContent = `${porcentaje}% completo`;
        document.getElementById('progreso-barra').style.width = `${porcentaje}%`;
    }

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

        // Presentación: estado, rol, nombre en la barra superior y progreso
        document.getElementById('badge-verif').classList.toggle('verificado', perfil.estado_verificacion === 'verificado');
        document.getElementById('perfil-rol').textContent = perfil.rol;
        document.getElementById('chip-nombre').textContent = perfil.nombre;
        document.getElementById('chip-rol').textContent = perfil.rol;
        document.getElementById('chip-inicial').textContent = (perfil.nombre || '?').trim().charAt(0).toUpperCase();
        actualizarProgreso(perfil);
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
        if (result.ok) actualizarProgreso(result.datos);
    });

    cargarPerfil();
}