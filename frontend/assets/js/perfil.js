
/* =====================================================================
 * DUEÑA/O: Sara Revollo — Pantalla de perfil
 * Contrato con el backend: docs/API.md
 * ===================================================================== */

import { pedirApi } from '../../assets/js/api.js';
import { obtenerToken } from '../../assets/js/sesion.js';
import { initHeader } from '../../assets/js/components.js';

// Obtener token de la sesión
const token = obtenerToken();

// Verificar que el usuario haya iniciado sesión
if (!token) {
    window.location.href = '/frontend/auth/login.html';
} else {

    const message = document.getElementById('perfil-mensaje');
    const form = document.getElementById('perfil-form');

    // ================================================================
    // FECHA ACTUAL
    // ================================================================

    const fecha = document.getElementById('fecha-hoy');

    if (fecha) {
        const texto = new Date().toLocaleDateString('es-BO', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });

        fecha.textContent =
            texto.charAt(0).toUpperCase() + texto.slice(1);
    }

    // ================================================================
    // CERRAR SESIÓN
    // ================================================================

    document.getElementById('btn-salir')?.addEventListener(
        'click',
        () => {
            localStorage.removeItem('lila_token');

            window.location.href =
                '/frontend/auth/login.html';
        }
    );

    // ================================================================
    // PROGRESO DEL PERFIL
    // ================================================================

    function actualizarProgreso(perfil) {

        const campos = perfil.rol === 'empleador'
            ? ['ciudad']
            : ['ciudad', 'habilidades', 'experiencia'];

        let completos = 0;

        campos.forEach(campo => {

            const lleno = Boolean(
                perfil[campo] &&
                String(perfil[campo]).trim()
            );

            if (lleno) completos++;

            document.querySelector(
                `.lp-lista li[data-campo="${campo}"]`
            )?.classList.toggle('hecho', lleno);

        });

        const porcentaje = Math.round(
            (completos / campos.length) * 100
        );

        document.getElementById(
            'progreso-texto'
        ).textContent = `${porcentaje}% completo`;

        document.getElementById(
            'progreso-barra'
        ).style.width = `${porcentaje}%`;
    }

    // ================================================================
    // CARGAR PERFIL DESDE EL BACKEND
    // ================================================================

    async function cargarPerfil() {

        const result = await pedirApi('/api/perfil', {
            token
        });

        // Sesión inválida
        if (result.estado === 401) {
            window.location.href =
                '/frontend/auth/login.html';
            return;
        }

        // Error al cargar el perfil
        if (!result.ok) {
            message.textContent =
                result.datos.error ||
                'No se pudo cargar el perfil.';
            return;
        }

        const perfil = result.datos;

        // Inicializar encabezado
        initHeader(
            perfil.estado_verificacion,
            perfil.rol
        );

        // Ocultar campos laborales para empleadores
        if (perfil.rol === 'empleador') {

            document.querySelectorAll(
                '.solo-trabajador'
            ).forEach(campo => {
                campo.hidden = true;
            });

        }

        // Información principal
        document.querySelector(
            '.profile-name'
        ).textContent = perfil.nombre;

        document.getElementById(
            'perfil-telefono'
        ).textContent = perfil.telefono;

        // Datos editables
        document.getElementById(
            'ciudad'
        ).value = perfil.ciudad || '';

        document.getElementById(
            'habilidades'
        ).value = perfil.habilidades || '';

        document.getElementById(
            'experiencia'
        ).value = perfil.experiencia || '';

        // Estado de verificación
        document.getElementById(
            'badge-verif'
        ).textContent = perfil.estado_verificacion
            .replace('_', ' ')
            .toUpperCase();

        document.getElementById(
            'badge-verif'
        ).classList.toggle(
            'verificado',
            perfil.estado_verificacion === 'verificado'
        );

        // Rol del usuario
        document.getElementById(
            'perfil-rol'
        ).textContent = perfil.rol;

        // Información del encabezado
        document.getElementById(
            'chip-nombre'
        ).textContent = perfil.nombre;

        document.getElementById(
            'chip-rol'
        ).textContent = perfil.rol;

        document.getElementById(
            'chip-inicial'
        ).textContent = (
            perfil.nombre || '?'
        ).trim().charAt(0).toUpperCase();

        // Actualizar progreso
        actualizarProgreso(perfil);
    }

    // ================================================================
    // GUARDAR CAMBIOS DEL PERFIL
    // ================================================================

    form?.addEventListener('submit', async event => {

        event.preventDefault();

        // Obtener los valores del formulario
        const ciudad = document.getElementById(
            'ciudad'
        ).value;

        const habilidades = document.getElementById(
            'habilidades'
        ).value;

        const experiencia = document.getElementById(
            'experiencia'
        ).value;

        // Enviar datos al servidor
        const result = await pedirApi('/api/perfil', {
            metodo: 'PUT',
            token,
            cuerpo: {
                ciudad,
                habilidades,
                experiencia
            }
        });

        // Mostrar resultado
        message.textContent = result.ok
            ? 'Perfil guardado.'
            : result.datos.error ||
              'No se pudo guardar el perfil.';

        // Actualizar porcentaje de progreso
        if (result.ok) {
            actualizarProgreso(result.datos);
        }

    });

    // ================================================================
    // INICIAR PÁGINA
    // ================================================================

    cargarPerfil();
}
