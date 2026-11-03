// components.js
// Carga los componentes compartidos (encabezado y pie de página) en cada pantalla.
// DUEÑA/O: Joaquín Peredo — Navbar y footer. Ver README.md (sección Equipo)

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
        if (rol === 'trabajador' || rol === 'empleador') {
            roleBadge.textContent = rol === 'empleador' ? 'EMPLEADOR' : 'TRABAJADOR';
            roleBadge.hidden = false;
        }
    }

    const authenticated = Boolean(localStorage.getItem('lila_token'));
    const authActions = document.getElementById('lila-auth-actions');
    const userActions = document.getElementById('lila-user-actions');
    if (authActions && userActions) {
        authActions.hidden = authenticated;
        userActions.hidden = !authenticated;
    }

    document.getElementById('lila-salir')?.addEventListener('click', () => {
        localStorage.removeItem('lila_token');
    });

}

/**
 * Inicializa el pie de página.
 */
export async function initFooter() {
    await loadComponent('/frontend/components/footer.html', 'footer-placeholder');
}
