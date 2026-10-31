// =====================================================================
// DUEÑA/O: Natalia Arze — Pantalla de registro (trabajador o empleador)
// Responsables: README.md (sección Equipo)  ·  Contrato con el backend: docs/API.md
// Primera versión generada con ayuda de IA (ver README.md, sección Uso de IA):
// revisarla, entenderla y adaptarla es parte de la tarea.
// =====================================================================

import { pedirApi } from './api.js';

const form = document.getElementById('registroForm');
const message = document.getElementById('registro-mensaje');

form?.addEventListener('submit', async event => {
    event.preventDefault();
    const button = form.querySelector('button[type="submit"]');
    button.disabled = true;
    const result = await pedirApi('/api/registro', {
        metodo: 'POST',
        cuerpo: {
            nombre: document.getElementById('nombre').value,
            ci: document.getElementById('ci').value,
            telefono: document.getElementById('telefono').value,
            password: document.getElementById('password').value,
            consentimiento: document.getElementById('consentimiento').checked,
            rol: document.getElementById('rol').value
        }
    });
    message.textContent = result.datos.error || result.datos.mensaje;
    if (result.ok) {
        setTimeout(() => { window.location.href = '/frontend/auth/login.html'; }, 800);
    } else {
        button.disabled = false;
    }
});
