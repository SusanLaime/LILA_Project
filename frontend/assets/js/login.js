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
        const rol = result.datos.usuario?.rol;
        const destinos = {
            trabajador: '/frontend/homeTrabajador.html',
            empleador: '/frontend/homeEmpleador.html'
        };
        const destino = destinos[rol];

        if (!destino) {
            message.textContent = 'No se pudo identificar el tipo de cuenta.';
            button.disabled = false;
            return;
        }

        window.location.href = destino;
    } else {
        message.textContent = result.datos.error;
        button.disabled = false;
    }
});
