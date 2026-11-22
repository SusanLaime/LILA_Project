// =====================================================================
// Natalia Arze — Pantalla de registro (trabajador o empleador)

// Register page logic: sends the new account to /api/registro, and when the page opens with ?agregarRol it adds a second role to the current account instead.
// Lógica de la página de registro: envía la cuenta nueva a /api/registro y, cuando la página se abre con ?agregarRol, agrega un segundo rol a la cuenta actual.
// Contiene la clase PaginaRegistro (hereda de Pagina).
// =====================================================================

import { Pagina } from './nucleo/Pagina.js';
import { ClienteApi } from './nucleo/ClienteApi.js';
import { Sesion } from './nucleo/Sesion.js';

export class PaginaRegistro extends Pagina {
    #form;

    alCargar() {
        this.#form = document.getElementById('registroForm');
        this.mensaje = document.getElementById('registro-mensaje');

        const rolPorAgregar = new URLSearchParams(window.location.search).get('agregarRol');
        if (rolPorAgregar === 'trabajador' || rolPorAgregar === 'empleador') {
            this.#modoAgregarRol(rolPorAgregar);
        }

        this.activarMostrarPassword(
            document.getElementById('password'),
            document.getElementById('toggle-password')
        );

        this.#form?.addEventListener('submit', event => this.#enviarRegistro(event));
    }

    // Modo ?agregarRol=...: oculta el formulario y muestra un panel para
    // agregar el segundo rol a la cuenta actual (POST /api/perfil/roles).
    #modoAgregarRol(rolPorAgregar) {
        const form = this.#form;
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

        if (!this.sesion.obtener()) {
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
                const resultado = await this.api.post('/api/perfil/roles', { rol: rolPorAgregar });

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

                this.sesion.guardarRolActivo(rolPorAgregar);
                window.location.href = rolPorAgregar === 'empleador'
                    ? '/frontend/website/homeEmpleador.html'
                    : '/frontend/website/homeTrabajador.html';
            });
            acciones.prepend(boton);
        }

        panel.append(descripcion, estado, acciones);
        form.before(panel);
    }

    async #enviarRegistro(event) {
        event.preventDefault();
        const form = this.#form;
        const roles = Array.from(
            form.querySelectorAll('input[name="roles"]:checked')
        ).map(input => input.value);

        if (roles.length === 0) {
            this.mostrarMensaje('Selecciona al menos un perfil.');
            form.querySelector('input[name="roles"]')?.focus();
            return;
        }

        const button = form.querySelector('button[type="submit"]');
        button.disabled = true;
        const result = await this.api.post('/api/registro', {
            nombre: document.getElementById('nombre').value,
            ci: document.getElementById('ci').value,
            telefono: document.getElementById('telefono').value,
            password: document.getElementById('password').value,
            consentimiento: document.getElementById('consentimiento').checked,
            roles
        });
        this.mostrarMensaje(result.datos.error || result.datos.mensaje ||
            'No se pudo completar el registro.');
        if (result.ok) {
            setTimeout(() => { window.location.href = '/frontend/auth/login.html'; }, 800);
        } else {
            button.disabled = false;
        }
    }
}

const sesion = new Sesion();
new PaginaRegistro(new ClienteApi(sesion), sesion).iniciar();
