// components.js
// Carga los componentes compartidos (encabezado y pie de página) en cada pantalla.
// DUEÑA/O: Joaquín Peredo — Navbar y footer. Ver README.md (sección Equipo)

import { obtenerToken } from './sesion.js';
import { pedirApi } from './api.js';

/**
 * Carga un archivo HTML y lo inserta dentro del contenedor indicado.
 */
async function loadComponent(url, containerId) {
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const html = await response.text();
        const container = document.getElementById(containerId);
        if (container) {
            container.innerHTML = html;
        }
    } catch (error) {
        console.error(`Error al cargar el componente ${url}:`, error);
    }
}

/**
 * Reemplaza la hoja de estilos del navbar actual para evitar conflictos visuales.
 */
function setNavbarStylesheet(cssHref) {
    document
        .querySelectorAll('link[href*="components/header.css"], link[href*="components/navbar"]')
        .forEach(link => link.remove());

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = cssHref;
    document.head.appendChild(link);
}

/**
 * Muestra un pop-up cuando el usuario intenta cambiar a un rol que aún no creó.
 */
function mostrarPopupCrearPerfil(rolFaltante) {
    const existente = document.getElementById('lila-role-modal');
    if (existente) existente.remove();

    const esEmpleador = rolFaltante === 'empleador';
    const titulo = esEmpleador
        ? 'Crea tu perfil de Empleador'
        : 'Crea tu perfil de Trabajador';
    const descripcion = esEmpleador
        ? 'Aún no tienes una cuenta de empleador activa. Regístrate con ese perfil para publicar ofertas y cambiar de modo.'
        : 'Aún no tienes una cuenta de trabajador activa. Regístrate con ese perfil para postular a empleos y cambiar de modo.';
    const urlDestino = '/frontend/auth/register.html';

    const overlay = document.createElement('div');
    overlay.id = 'lila-role-modal';
    overlay.style.cssText = `
        position: fixed; inset: 0; background: rgba(24, 20, 44, 0.55);
        display: flex; align-items: center; justify-content: center;
        z-index: 9999; padding: 16px;
    `;

    overlay.innerHTML = `
        <div role="dialog" aria-modal="true" style="
            background: #ffffff; border-radius: 16px; max-width: 420px; width: 100%;
            padding: 28px 24px; box-shadow: 0 20px 45px rgba(0,0,0,0.2);
            text-align: center; font-family: inherit;
        ">
            <h3 style="margin: 0 0 10px; color: #272348; font-size: 1.3rem;">${titulo}</h3>
            <p style="margin: 0 0 22px; color: #56526d; font-size: 0.95rem; line-height: 1.5;">
                ${descripcion}
            </p>
            <div style="display: flex; gap: 10px; justify-content: center;">
                <button type="button" id="lila-modal-cancelar" style="
                    padding: 10px 18px; border-radius: 999px; border: 1px solid #d4cee3;
                    background: #ffffff; color: #272348; font-weight: 600; cursor: pointer;
                ">Cancelar</button>
                <a href="${urlDestino}" style="
                    padding: 10px 20px; border-radius: 999px; background: #6b54a8;
                    color: #ffffff; font-weight: 600; text-decoration: none; display: inline-block;
                ">Registrarme</a>
            </div>
        </div>
    `;

    document.body.appendChild(overlay);

    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) overlay.remove();
    });
    document.getElementById('lila-modal-cancelar')?.addEventListener('click', () => {
        overlay.remove();
    });
}

/**
 * Configura el enlace dinámico del logo y el botón de cambio de rol en headerCambio.html.
 */
async function configurarHeaderCambio(token, rolSugerido) {
    let tieneTrabajador = false;
    let tieneEmpleador = false;
    let rolBackend = rolSugerido || 'trabajador';

    const resultado = await pedirApi('/api/perfil', { token });
    if (resultado.ok && resultado.datos) {
        const d = resultado.datos;
        const roles = Array.isArray(d.roles) ? d.roles : [d.rol];
        rolBackend = d.rol || roles[0] || rolBackend;
        tieneTrabajador =
            roles.includes('trabajador') ||
            d.rol === 'trabajador' ||
            d.rol === 'ambos' ||
            Boolean(d.tieneTrabajador || d.perfilTrabajador || d.es_trabajador);
        tieneEmpleador =
            roles.includes('empleador') ||
            d.rol === 'empleador' ||
            d.rol === 'ambos' ||
            Boolean(d.tieneEmpleador || d.perfilEmpleador || d.es_empleador);
    } else {
        if (rolBackend === 'ambos') {
            tieneTrabajador = true;
            tieneEmpleador = true;
        } else if (rolBackend === 'empleador') {
            tieneEmpleador = true;
        } else {
            tieneTrabajador = true;
        }
    }

    let rolActivo = localStorage.getItem('lila_rol_activo');
    if (rolActivo !== 'trabajador' && rolActivo !== 'empleador') {
        rolActivo = rolBackend === 'empleador' ? 'empleador' : 'trabajador';
    }
    if (rolActivo === 'empleador' && !tieneEmpleador && tieneTrabajador) {
        rolActivo = 'trabajador';
    }
    if (rolActivo === 'trabajador' && !tieneTrabajador && tieneEmpleador) {
        rolActivo = 'empleador';
    }
    localStorage.setItem('lila_rol_activo', rolActivo);

    const logoLink = document.getElementById('nav-logo-link');
    const textoRol = document.getElementById('texto-rol-actual');
    const btnCambiar = document.getElementById('btn-cambiar-rol');

    function actualizarVistaRol(rol) {
        if (textoRol) {
            textoRol.textContent = rol === 'empleador' ? 'Empleador' : 'Trabajador';
        }
        if (logoLink) {
            logoLink.setAttribute(
                'href',
                rol === 'empleador'
                    ? '/frontend/homeEmpleador.html'
                    : '/frontend/homeTrabajador.html'
            );
        }
    }

    actualizarVistaRol(rolActivo);

    if (btnCambiar) {
        btnCambiar.addEventListener('click', () => {
            const siguienteRol = rolActivo === 'trabajador' ? 'empleador' : 'trabajador';

            if (siguienteRol === 'empleador' && !tieneEmpleador) {
                mostrarPopupCrearPerfil('empleador');
                return;
            }

            if (siguienteRol === 'trabajador' && !tieneTrabajador) {
                mostrarPopupCrearPerfil('trabajador');
                return;
            }

            rolActivo = siguienteRol;
            localStorage.setItem('lila_rol_activo', rolActivo);
            actualizarVistaRol(rolActivo);

            window.location.href =
                rolActivo === 'empleador'
                    ? '/frontend/homeEmpleador.html'
                    : '/frontend/homeTrabajador.html';
        });
    }
}

/**
 * Inicializa el encabezado según la ruta y el estado de sesión del usuario:
 * - En register.html -> oculta el navbar.
 * - Sin sesión -> carga headerauth.html.
 * - Con sesión -> carga headerCambio.html.
 */
export async function initHeader(verificationStatus = 'no_verificado', rol = 'trabajador') {
    const rutaActual = window.location.pathname.toLowerCase();

    if (rutaActual.includes('register.html')) {
        const placeholder = document.getElementById('header-placeholder');
        if (placeholder) placeholder.remove();
        return;
    }

    const token = obtenerToken();

    if (!token) {
        setNavbarStylesheet('/frontend/assets/css/components/navbarauth.css');
        await loadComponent('/frontend/components/headerauth.html', 'header-placeholder');
        return;
    }

    setNavbarStylesheet('/frontend/assets/css/components/navbarcambio.css');
    await loadComponent('/frontend/components/headerCambio.html', 'header-placeholder');
    await configurarHeaderCambio(token, rol);
}

/**
 * Inicializa el pie de página.
 */
export async function initFooter() {
    await loadComponent('/frontend/components/footer.html', 'footer-placeholder');
}