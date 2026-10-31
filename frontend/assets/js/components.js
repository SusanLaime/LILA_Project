// components.js
// Carga los componentes compartidos (encabezado y pie de página) en cada pantalla.
// Archivo COMPARTIDO: si necesitas cambiarlo, avisa al equipo antes (ver docs/TAREAS.md).

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
 * Inicializa el encabezado.
 * @param {string} verificationStatus 'verificado' | 'pendiente' | 'no_verificado'
 * @param {string} rol 'trabajador' | 'empleador'
 *        En el Primer Parcial todos los usuarios son 'no_verificado'
 *        (la verificación de CI queda para el Segundo Parcial).
 */
export async function initHeader(verificationStatus = 'no_verificado', rol = 'trabajador') {
    await loadComponent('/frontend/components/header.html', 'header-placeholder');

    const roleBadge = document.getElementById('lila-role-badge');
    if (roleBadge) {
        roleBadge.textContent = rol === 'empleador' ? 'EMPLEADOR' : 'TRABAJADOR';
    }

    const badge = document.getElementById('lila-verified-badge');
    if (badge) {
        badge.style.display = 'inline-flex';
        if (verificationStatus === 'verificado') {
            badge.textContent = 'VERIFICADO';
            badge.style.backgroundColor = '#F2EDFA';
            badge.style.color = '#272348';
        } else if (verificationStatus === 'pendiente') {
            badge.textContent = 'PENDIENTE';
            badge.style.backgroundColor = '#FFF3CD';
            badge.style.color = '#856404';
        } else {
            badge.textContent = 'NO VERIFICADO';
            badge.style.backgroundColor = '#E2E3E5';
            badge.style.color = '#383D41';
        }
    }

    const logoLink = document.querySelector('.lila-brand');
    if (logoLink) {
        logoLink.href = '/frontend/website/trabajador/perfil.html';
    }

    const navLinks = document.getElementById('lila-nav-links');
    if (navLinks) {
        navLinks.innerHTML = `
            <li class="nav-item"><a class="nav-link" href="/frontend/website/trabajador/perfil.html"><span aria-hidden="true">♙</span> Mi Perfil</a></li>
            <li class="nav-item"><a class="nav-link" id="lila-salir" href="/frontend/auth/login.html"><span aria-hidden="true">⍈</span> Salir</a></li>
        `;
        document.getElementById('lila-salir')?.addEventListener('click', () => {
            localStorage.removeItem('lila_token');
        });
    }
}

/**
 * Inicializa el pie de página.
 */
export async function initFooter() {
    await loadComponent('/frontend/components/footer.html', 'footer-placeholder');
}
