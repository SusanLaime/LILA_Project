// =====================================================================
// Pagina.js — Clase abstracta de las páginas (Template Method).
// iniciar() define los pasos fijos; cada página hija completa alCargar().
// También reúne el código que las páginas repetían: mostrar mensajes y
// el botón "Mostrar / Ocultar" contraseña.
// =====================================================================

export class Pagina {
    constructor(api, sesion) {
        if (new.target === Pagina) {
            throw new Error('Pagina es abstracta: crea una página hija.');
        }
        this.api = api;
        this.sesion = sesion;
        // Elemento donde se muestran los mensajes; cada página lo asigna.
        this.mensaje = null;
    }

    // La plantilla: espera al DOM (si todavía no cargó) y llama a alCargar().
    iniciar() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.alCargar());
        } else {
            this.alCargar();
        }
    }

    // El "hueco" que cada página completa.
    alCargar() {
        throw new Error('Cada página define alCargar().');
    }

    mostrarMensaje(texto, tipo = '') {
        if (!this.mensaje) return;

        this.mensaje.textContent = texto;

        if (tipo) {
            this.mensaje.dataset.tipo = tipo;
        } else {
            delete this.mensaje.dataset.tipo;
        }
    }

    activarMostrarPassword(input, boton) {
        boton?.addEventListener('click', () => {
            const mostrar = input.type === 'password';
            input.type = mostrar ? 'text' : 'password';
            boton.textContent = mostrar ? 'Ocultar' : 'Mostrar';
            boton.setAttribute('aria-pressed', String(mostrar));
        });
    }
}
