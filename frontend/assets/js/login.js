// =====================================================================
// Natalia Arze — Pantalla de inicio de sesión
// Login page logic: sends carnet and password to /api/login, saves the token and the active role, and opens the home page for that role.
// Lógica de la página de inicio de sesión: envía carnet y contraseña a /api/login, guarda el token y el rol activo, y abre la página de inicio de ese rol.
// Contiene la clase PaginaLogin (hereda de Pagina).
// =====================================================================

import { Pagina } from './nucleo/Pagina.js';
import { ClienteApi } from './nucleo/ClienteApi.js';
import { Sesion } from './nucleo/Sesion.js';

const DESTINOS = {
    trabajador: '/frontend/website/homeTrabajador.html',
    empleador: '/frontend/website/homeEmpleador.html'
};

export class PaginaLogin extends Pagina {
    #form;

    alCargar() {
        this.#form = document.getElementById('login-form');
        this.mensaje = document.getElementById('login-mensaje');

        this.activarMostrarPassword(
            document.getElementById('login-password'),
            document.getElementById('toggle-password')
        );

        document.getElementById('btn-crear')?.addEventListener('click', () => {
            window.location.href = '/frontend/auth/register.html';
        });

        document.getElementById('btn-ingresar')
            ?.addEventListener('click', () => this.#form?.requestSubmit());

        this.#form?.addEventListener('submit', event => this.#enviar(event));
    }

    async #enviar(event) {
        event.preventDefault();
        const button = document.getElementById('btn-ingresar');
        button.disabled = true;

        const result = await this.api.post('/api/login', {
            ci: document.getElementById('login-ci').value.trim(),
            password: document.getElementById('login-password').value
        });

        if (!result.ok) {
            this.mostrarMensaje(result.datos.error);
            button.disabled = false;
            return;
        }

        this.sesion.guardar(result.datos.token);
        const usuario = result.datos.usuario;
        const roles = Array.isArray(usuario?.roles)
            ? usuario.roles
            : [usuario?.rol].filter(Boolean);
        const rolPorAgregar = new URLSearchParams(window.location.search).get('agregarRol');
        const rolGuardado = this.sesion.obtenerRolActivo();
        const rol = roles.includes(rolGuardado) ? rolGuardado : roles[0];
        const rolValidoParaAgregar =
            rolPorAgregar === 'trabajador' || rolPorAgregar === 'empleador';
        const destinoAgregar = rolValidoParaAgregar ? DESTINOS[rolPorAgregar] : null;
        const destino = destinoAgregar
            ? roles.includes(rolPorAgregar)
                ? destinoAgregar
                : `/frontend/auth/register.html?agregarRol=${rolPorAgregar}`
            : DESTINOS[rol];

        if (!destino) {
            this.mostrarMensaje('No se pudo identificar el tipo de cuenta.');
            button.disabled = false;
            return;
        }

        this.sesion.guardarRolActivo(rol);
        window.location.href = destino;
    }
}

const sesion = new Sesion();
new PaginaLogin(new ClienteApi(sesion), sesion).iniciar();
