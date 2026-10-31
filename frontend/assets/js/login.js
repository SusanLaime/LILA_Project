import { pedirApi } from './api.js';
import { guardarToken } from './sesion.js';

const form = document.getElementById('login-form');
const message = document.getElementById('login-mensaje');

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
            telefono: document.getElementById('login-telefono').value,
            password: document.getElementById('login-password').value
        }
    });
    if (result.ok) {
        guardarToken(result.datos.token);
        window.location.href = '/frontend/website/trabajador/perfil.html';
    } else {
        message.textContent = result.datos.error;
        button.disabled = false;
    }
});
