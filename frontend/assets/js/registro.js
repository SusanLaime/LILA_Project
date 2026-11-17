// =====================================================================
// DUEÑA/O: Natalia Arze — Pantalla de registro (trabajador o empleador)
// Responsables: README.md (sección Equipo)  ·  Contrato con el backend: docs/API.md
// Primera versión generada con ayuda de IA (ver README.md, sección Uso de IA):
// revisarla, entenderla y adaptarla es parte de la tarea.
// =====================================================================

import { pedirApi } from './api.js';
import { obtenerToken } from './sesion.js';

const form = document.getElementById('registroForm');
const message = document.getElementById('registro-mensaje');
const passwordInput = document.getElementById('password');
const passwordToggle = document.getElementById('toggle-password');

const rolPorAgregar = new URLSearchParams(window.location.search).get('agregarRol');
if (rolPorAgregar === 'trabajador' || rolPorAgregar === 'empleador') {
    const nombreRol = rolPorAgregar === 'empleador' ? 'Empleador' : 'Trabajador';
    const titulo = document.getElementById('registro-titulo');
    const introduccion = document.querySelector('.introducci-n');
    titulo.textContent = `Agregar perfil de ${nombreRol}`;
    introduccion.textContent = 'Se agregará a tu cuenta actual; no se creará una cuenta nueva.';
    form.hidden = true;

    const panel = document.createElement('section');
    panel.className = 'registro-form';
    panel.setAttribute('aria-labelledby', 'agregar-perfil-titulo');

    const descripcion = document.createElement('p');
    descripcion.className = 'introducci-n';
    descripcion.id = 'agregar-perfil-titulo';
    descripcion.textContent = `Confirma para habilitar el perfil de ${nombreRol} en tu cuenta.`;

    const estado = document.createElement('p');
    estado.id = 'agregar-perfil-mensaje';
    estado.setAttribute('role', 'alert');
    estado.setAttribute('aria-live', 'polite');

    const acciones = document.createElement('div');
    acciones.className = 'acciones-registro';

    const cancelar = document.createElement('a');
    cancelar.className = 'invitado';
    cancelar.href = rolPorAgregar === 'empleador'
        ? '/frontend/website/homeTrabajador.html'
        : '/frontend/website/homeEmpleador.html';
    cancelar.textContent = 'Cancelar y volver';
    acciones.append(cancelar);

    const token = obtenerToken();
    if (!token) {
        estado.textContent = 'Tu sesión ya no está activa. Inicia sesión para agregar el perfil a tu cuenta.';
        const iniciarSesion = document.createElement('a');
        iniciarSesion.className = 'botn-ingresar ingresar';
        iniciarSesion.href = `/frontend/auth/login.html?agregarRol=${rolPorAgregar}`;
        iniciarSesion.textContent = 'Iniciar sesión';
        acciones.prepend(iniciarSesion);
    } else {
        const boton = document.createElement('button');
        boton.id = 'agregar-perfil-submit';
        boton.className = 'botn-ingresar ingresar';
        boton.type = 'button';
        boton.textContent = `Agregar perfil de ${nombreRol}`;
        boton.addEventListener('click', async () => {
            boton.disabled = true;
            const resultado = await pedirApi('/api/perfil/roles', {
                metodo: 'POST',
                token,
                cuerpo: { rol: rolPorAgregar }
            });

            if (!resultado.ok) {
                estado.textContent = resultado.datos.error || 'No se pudo agregar el perfil.';
                boton.disabled = false;
                if (resultado.estado === 401) {
                    estado.textContent = 'Tu sesión venció. Inicia sesión para agregar el perfil a tu cuenta.';
                    const iniciarSesion = document.createElement('a');
                    iniciarSesion.className = 'invitado';
                    iniciarSesion.href = `/frontend/auth/login.html?agregarRol=${rolPorAgregar}`;
                    iniciarSesion.textContent = 'Iniciar sesión';
                    acciones.prepend(iniciarSesion);
                }
                return;
            }

            localStorage.setItem('lila_rol_activo', rolPorAgregar);
            window.location.href = rolPorAgregar === 'empleador'
                ? '/frontend/website/homeEmpleador.html'
                : '/frontend/website/homeTrabajador.html';
        });
        acciones.prepend(boton);
    }

    panel.append(descripcion, estado, acciones);
    form.before(panel);
}

passwordToggle?.addEventListener('click', () => {
    const mostrar = passwordInput.type === 'password';
    passwordInput.type = mostrar ? 'text' : 'password';
    passwordToggle.textContent = mostrar ? 'Ocultar' : 'Mostrar';
    passwordToggle.setAttribute('aria-pressed', String(mostrar));
});

form?.addEventListener('submit', async event => {
    event.preventDefault();
    const roles = Array.from(
        form.querySelectorAll('input[name="roles"]:checked')
    ).map(input => input.value);

    if (roles.length === 0) {
        message.textContent = 'Selecciona al menos un perfil.';
        form.querySelector('input[name="roles"]')?.focus();
        return;
    }

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
            roles
        }
    });
    message.textContent = result.datos.error || result.datos.mensaje ||
        'No se pudo completar el registro.';
    if (result.ok) {
        setTimeout(() => { window.location.href = '/frontend/auth/login.html'; }, 800);
    } else {
        button.disabled = false;
    }
});
