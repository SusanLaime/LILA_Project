// =====================================================================
// DUEÑA/O: Natalia Arze — Pantalla de inicio de sesión
// Responsables: README.md (sección Equipo)  ·  Contrato con el backend: docs/API.md
// Primera versión generada con ayuda de IA (ver README.md, sección Uso de IA):
// revisarla, entenderla y adaptarla es parte de la tarea.
// =====================================================================

import { pedirApi } from './api.js';
import { guardarToken } from './sesion.js';

const form = document.getElementById('login-form');
const message = document.getElementById('login-mensaje');
const passwordInput = document.getElementById('login-password');
const passwordToggle = document.getElementById('toggle-password');

passwordToggle?.addEventListener('click', () => {
    const mostrar = passwordInput.type === 'password';
    passwordInput.type = mostrar ? 'text' : 'password';
    passwordToggle.textContent = mostrar ? 'Ocultar' : 'Mostrar';
    passwordToggle.setAttribute('aria-pressed', String(mostrar));
});

document.getElementById('btn-crear')?.addEventListener('click', () => {
    window.location.href = '/frontend/auth/register.html';
});

document.getElementById('btn-ingresar')?.addEventListener('click', () => form?.requestSubmit());

form?.addEventListener('submit', async event => {
    event.preventDefault();
    const button = document.getElementById('btn-ingresar');
    button.disabled = true;
    const result = await pedirApi('/api/login', {
        metodo: 'POST',
        cuerpo: {
            ci: document.getElementById('login-ci').value.trim(),
            password: document.getElementById('login-password').value
        }
    });
    if (result.ok) {
        guardarToken(result.datos.token);
        const usuario = result.datos.usuario;
        const roles = Array.isArray(usuario?.roles)
            ? usuario.roles
            : [usuario?.rol].filter(Boolean);
        const rolPorAgregar = new URLSearchParams(window.location.search).get('agregarRol');
        const rolGuardado = localStorage.getItem('lila_rol_activo');
        const rol = roles.includes(rolGuardado) ? rolGuardado : roles[0];
        const destinos = {
            trabajador: '/frontend/website/homeTrabajador.html',
            empleador: '/frontend/website/homeEmpleador.html'
        };
        const rolValidoParaAgregar =
            rolPorAgregar === 'trabajador' || rolPorAgregar === 'empleador';
        const destinoAgregar = rolValidoParaAgregar ? destinos[rolPorAgregar] : null;
        const destino = destinoAgregar
            ? roles.includes(rolPorAgregar)
                ? destinoAgregar
                : `/frontend/auth/register.html?agregarRol=${rolPorAgregar}`
            : destinos[rol];

        if (!destino) {
            message.textContent = 'No se pudo identificar el tipo de cuenta.';
            button.disabled = false;
            return;
        }

        localStorage.setItem('lila_rol_activo', rol);
        window.location.href = destino;
    } else {
        message.textContent = result.datos.error;
        button.disabled = false;
    }
});
