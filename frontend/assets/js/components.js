// components.js
// Logic for fetching and rendering reusable components

/**
 * Utility to load an HTML file and inject it into a container
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
        console.error(`Error loading component ${url}:`, error);
    }
}

/**
 * Initialize the Header Component
 * @param {string} role 'trabajador' or 'empleador'
 * @param {string} verificationStatus 'verified', 'pending', or 'unverified' (or boolean for backwards compatibility)
 */
export async function initHeader(role, verificationStatus) {
    await loadComponent('/frontend/components/header.html', 'header-placeholder');

    const roleBadge = document.getElementById('lila-role-badge');
    if (roleBadge) {
        roleBadge.textContent = role === 'empleador' ? 'EMPLEADOR' : 'TRABAJADOR';
    }

    const badge = document.getElementById('lila-verified-badge');
    if (badge) {
        badge.style.display = 'inline-flex';
        
        if (verificationStatus === 'verified' || verificationStatus === true) {
            badge.textContent = 'VERIFIED';
            badge.style.backgroundColor = '#F2EDFA';
            badge.style.color = '#272348';
        } else if (verificationStatus === 'pending') {
            badge.textContent = 'PENDING';
            badge.style.backgroundColor = '#FFF3CD';
            badge.style.color = '#856404';
        } else {
            badge.textContent = 'NOT VERIFIED';
            badge.style.backgroundColor = '#E2E3E5';
            badge.style.color = '#383D41';
        }
    }

    const logoLink = document.querySelector('.lila-brand');
    if (logoLink) {
        logoLink.href = role === 'empleador' ? '/frontend/website/empleador/publicar.html' : '/frontend/website/trabajador/buscar.html';
    }

    const navLinks = document.getElementById('lila-nav-links');
    if (navLinks) {
        if (role === 'trabajador') {
            navLinks.innerHTML = `
                <li class="nav-item"><a class="nav-link" href="/frontend/website/trabajador/buscar.html"><span aria-hidden="true">⌕</span> Buscar</a></li>
                <li class="nav-item"><a class="nav-link" href="/frontend/website/trabajador/postulaciones.html"><span aria-hidden="true">☷</span> Mis Postulaciones</a></li>
                <li class="nav-item"><a class="nav-link" href="/frontend/website/trabajador/perfil.html"><span aria-hidden="true">♙</span> Mi Perfil</a></li>
                <li class="nav-item"><a class="nav-link" href="/frontend/auth/login.html"><span aria-hidden="true">⍈</span> Salir</a></li>
            `;
        } else if (role === 'empleador') {
            navLinks.innerHTML = `
                <li class="nav-item"><a class="nav-link" href="/frontend/website/empleador/publicar.html"><span aria-hidden="true">＋</span> Crear Oferta</a></li>
                <li class="nav-item"><a class="nav-link" href="/frontend/website/empleador/ofertas.html"><span aria-hidden="true">☷</span> Mis Ofertas</a></li>
                <li class="nav-item"><a class="nav-link" href="/frontend/website/empleador/perfil.html"><span aria-hidden="true">♙</span> Mi Perfil</a></li>
                <li class="nav-item"><a class="nav-link" href="/frontend/auth/login.html"><span aria-hidden="true">⍈</span> Salir</a></li>
            `;
        }
    }
}

/**
 * Initialize the Footer Component
 */
export async function initFooter() {
    await loadComponent('/frontend/components/footer.html', 'footer-placeholder');
}

/**
 * Initialize the Bottom Navigation Shell (Deprecated - Now integrated into Header)
 */
export async function initNav(role) {
    // No-op: Navigation is now part of the Top Header.
}

/**
 * Generate a Job Card element for the search/listings page (MVP requirements HU-04)
 * @param {Object} job Job data object
 * @returns {HTMLElement} The constructed job card DOM element
 */
export function createJobCard(job) {
    const card = document.createElement('div');
    card.className = 'lila-job-card';

    // Trust signal: Employer verified badge
    const verifiedHtml = job.employerVerified ? `
        <span class="lila-verified-badge" title="Empleador Verificado">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
            Verificado
        </span>
    ` : '';

    card.innerHTML = `
        <div class="lila-job-card-header">
            <h3 class="lila-job-card-title">${job.title}</h3>
            ${verifiedHtml}
        </div>
        <div class="lila-job-card-meta">
            <span class="lila-meta-item">📍 ${job.location}</span>
            <span class="lila-meta-item">🗓️ ${job.date}</span>
            <span class="lila-meta-item">🏷️ ${job.category}</span>
        </div>
        <div class="lila-job-card-payment">
            <strong>Pago ofrecido:</strong> ${job.payment}
        </div>
        <p class="lila-job-card-excerpt">${job.descriptionSnippet}</p>
        <div class="lila-job-card-actions">
            <button class="lila-btn-ver-detalles" onclick="window.location.href='/frontend/website/trabajador/detalle-oferta.html?id=${job.id}'">
                Ver Detalles
            </button>
        </div>
    `;

    return card;
}
