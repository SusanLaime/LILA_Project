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

function configurarEnlacesVolver(selector, fallback) {
    const clavePaginaAnterior = 'lila_pagina_anterior';
    const urlActual = new URL(window.location.href);
    let paginaAnterior = '';

    if (document.referrer) {
        try {
            const anterior = new URL(document.referrer);
            if (
                anterior.origin === window.location.origin &&
                anterior.pathname.startsWith('/frontend/') &&
                anterior.pathname !== urlActual.pathname
            ) {
                paginaAnterior = `${anterior.pathname}${anterior.search}${anterior.hash}`;
            }
        } catch (error) {
            console.warn('No se pudo interpretar la página anterior:', error);
        }
    }

    if (!paginaAnterior) {
        const guardada = sessionStorage.getItem(clavePaginaAnterior);
        if (guardada) {
            try {
                const anterior = new URL(guardada, window.location.origin);
                if (
                    anterior.origin === window.location.origin &&
                    anterior.pathname.startsWith('/frontend/') &&
                    anterior.pathname !== urlActual.pathname
                ) {
                    paginaAnterior = `${anterior.pathname}${anterior.search}${anterior.hash}`;
                }
            } catch (error) {
                console.warn('No se pudo interpretar la página anterior guardada:', error);
            }
        }
    }

    const destino = paginaAnterior || fallback;
    document.querySelectorAll(selector).forEach(enlace => {
        enlace.href = destino;
    });

    if (urlActual.pathname.startsWith('/frontend/')) {
        sessionStorage.setItem(
            clavePaginaAnterior,
            `${urlActual.pathname}${urlActual.search}${urlActual.hash}`
        );
    }
}

/**
 * Muestra un pop-up cuando el usuario intenta cambiar a un rol que aún no creó.
 */
function mostrarPopupCrearPerfil(rolFaltante) {
    const existente = document.getElementById('lila-role-modal');
    if (existente) existente.remove();

    const esEmpleador = rolFaltante === 'empleador';
    const titulo = esEmpleador
        ? 'Agrega tu perfil de Empleador'
        : 'Agrega tu perfil de Trabajador';
    const descripcion = esEmpleador
        ? 'Este perfil todavía no está asociado a tu cuenta. Regístralo para publicar ofertas y cambiar de modo.'
        : 'Este perfil todavía no está asociado a tu cuenta. Regístralo para postular a empleos y cambiar de modo.';
    const urlDestino = `/frontend/auth/register.html?agregarRol=${rolFaltante}`;

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
            text-align: center; font-family: "Poppins", sans-serif;
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
                ">Agregar perfil</a>
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
    const resultado = await pedirApi('/api/perfil', { token });
    const textoRol = document.getElementById('texto-rol-actual');
    const btnCambiar = document.getElementById('btn-cambiar-rol');
    if (!resultado.ok || !resultado.datos) {
        console.error('No se pudieron consultar los perfiles de la cuenta:', resultado.datos?.error);
        if (textoRol) textoRol.textContent = 'Error al cargar perfil';
        if (btnCambiar) {
            btnCambiar.disabled = true;
            btnCambiar.title = resultado.datos?.error || 'No se pudieron verificar tus perfiles.';
        }
        return;
    }

    const datosPerfil = resultado.datos;
    const roles = Array.isArray(datosPerfil.roles)
        ? datosPerfil.roles
        : [datosPerfil.rol].filter(rol => rol === 'trabajador' || rol === 'empleador');
    const tieneTrabajador = roles.includes('trabajador');
    const tieneEmpleador = roles.includes('empleador');
    let rolActivo = rolSugerido;
    if (rolActivo !== 'trabajador' && rolActivo !== 'empleador') {
        const rolGuardado = localStorage.getItem('lila_rol_activo');
        rolActivo = roles.includes(rolGuardado) ? rolGuardado : roles[0];
    }
    if (rolActivo !== 'trabajador' && rolActivo !== 'empleador') {
        console.error('La cuenta no tiene un rol válido asociado.');
        if (textoRol) textoRol.textContent = 'Perfil no disponible';
        if (btnCambiar) {
            btnCambiar.disabled = true;
            btnCambiar.title = 'La cuenta no tiene un perfil válido.';
        }
        return;
    }
    localStorage.setItem('lila_rol_activo', rolActivo);

    const logoLink = document.getElementById('nav-logo-link');

    function actualizarVistaRol(rol) {
        const siguienteRol = rol === 'empleador' ? 'trabajador' : 'empleador';
        if (textoRol) {
            textoRol.textContent = siguienteRol === 'empleador' ? 'Empleador' : 'Trabajador';
        }
        if (btnCambiar) {
            btnCambiar.title = `Cambiar a ${siguienteRol === 'empleador' ? 'Empleador' : 'Trabajador'}`;
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
        configurarEnlacesVolver('.nav-home-back', '/frontend/index.html');
        return;
    }

    setNavbarStylesheet('/frontend/assets/css/components/navbarcambio.css');
    await loadComponent('/frontend/components/headerCambio.html', 'header-placeholder');
    configurarEnlacesVolver(
        '.nav-home-back',
        rol === 'empleador'
            ? '/frontend/website/homeEmpleador.html'
            : '/frontend/website/homeTrabajador.html'
    );
    await configurarHeaderCambio(token, rol);
}

/**
 * Inicializa el pie de página.
 */
export async function initFooter() {
    configurarEnlacesVolver('.auth-back-link', '/frontend/index.html');
    await loadComponent('/frontend/components/footer.html', 'footer-placeholder');
}