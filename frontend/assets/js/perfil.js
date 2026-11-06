
/* ==========================================================
 * LILA - PERFIL DEL USUARIO
 * DUEÑA/O: Sara Revollo
 *
 * Frontend del perfil.
 * API existente: GET /api/perfil y PUT /api/perfil.
 * No modifica la autenticación ni la base de datos.
 * ========================================================== */

import { pedirApi } from './api.js';
import { obtenerToken } from './sesion.js';
import { initHeader } from './components.js';

const token = obtenerToken();

if (!token) {
    window.location.href = '/frontend/auth/login.html';
} else {

    // ======================================================
    // ELEMENTOS DEL FORMULARIO
    // ======================================================

    const form = document.getElementById('perfil-form');
    const mensaje = document.getElementById('perfil-mensaje');

    const ciudad = document.getElementById('ciudad');
    const telefono = document.getElementById('telefono-perfil');
    const experiencia = document.getElementById('experiencia');

    const habilidades = document.getElementById('habilidades');
    const habilidadesTags = document.getElementById('habilidades-tags');
    const habilidadNueva = document.getElementById('habilidad-nueva');
    const btnAgregar = document.getElementById('btn-agregar-habilidad');
    const habilidadesSugeridas = document.getElementById('habilidades-sugeridas');

    const contador = document.getElementById('contador-experiencia');
    const btnGuardar = document.getElementById('btn-guardar-perfil');
    const btnCancelar = document.getElementById('btn-cancelar-perfil');

    let listaHabilidades = [];
    let perfilGuardado = null;
    let guardando = false;

    // ======================================================
    // FECHA ACTUAL
    // ======================================================

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

    // ======================================================
    // CERRAR SESIÓN
    // ======================================================

    document.getElementById('btn-salir')?.addEventListener(
        'click',
        () => {
            localStorage.removeItem('lila_token');

            window.location.href =
                '/frontend/auth/login.html';
        }
    );

    // ======================================================
    // MOSTRAR MENSAJES
    // ======================================================

    function mostrarMensaje(texto, tipo = '') {
        if (!mensaje) return;

        mensaje.textContent = texto;

        if (tipo) {
            mensaje.dataset.tipo = tipo;
        } else {
            delete mensaje.dataset.tipo;
        }
    }

    // ======================================================
    // CONTADOR DE EXPERIENCIA
    // ======================================================

    function actualizarContador() {
        if (!contador || !experiencia) return;

        contador.textContent = experiencia.value.length;
    }

    experiencia?.addEventListener(
        'input',
        actualizarContador
    );

    // ======================================================
    // HABILIDADES
    // ======================================================

    function sincronizarHabilidades() {
        habilidades.value = listaHabilidades.join(', ');
    }

    function renderizarHabilidades() {
        habilidadesTags.replaceChildren();

        listaHabilidades.forEach((habilidad, indice) => {

            const etiqueta = document.createElement('span');
            etiqueta.className = 'lp-habilidad-tag';

            const texto = document.createElement('span');
            texto.textContent = habilidad;

            const boton = document.createElement('button');
            boton.type = 'button';
            boton.className = 'lp-habilidad-eliminar';
            boton.textContent = '×';

            boton.setAttribute(
                'aria-label',
                `Eliminar habilidad ${habilidad}`
            );

            boton.addEventListener('click', () => {
                listaHabilidades.splice(indice, 1);

                renderizarHabilidades();
                mostrarMensaje('');
            });

            etiqueta.append(texto, boton);
            habilidadesTags.appendChild(etiqueta);
        });

        sincronizarHabilidades();
    }

    function agregarHabilidad(valor) {
        const nueva = String(valor || '').trim();

        if (!nueva) {
            return false;
        }

        if (nueva.length > 60) {
            mostrarMensaje(
                'Cada habilidad debe tener máximo 60 caracteres.',
                'error'
            );
            return false;
        }

        if (nueva.includes(',')) {
            mostrarMensaje(
                'Agrega las habilidades de una en una, sin comas.',
                'error'
            );
            return false;
        }

        const existe = listaHabilidades.some(
            item =>
                item.toLocaleLowerCase('es') ===
                nueva.toLocaleLowerCase('es')
        );

        if (existe) {
            mostrarMensaje(
                'Esta habilidad ya fue agregada.',
                'error'
            );
            return false;
        }

        const propuesta = [
            ...listaHabilidades,
            nueva
        ].join(', ');

        if (propuesta.length > 300) {
            mostrarMensaje(
                'Las habilidades no pueden superar 300 caracteres en total.',
                'error'
            );
            return false;
        }

        listaHabilidades.push(nueva);
        renderizarHabilidades();
        mostrarMensaje('');

        return true;
    }

    // Agregar con el botón +
    btnAgregar?.addEventListener('click', () => {
        if (agregarHabilidad(habilidadNueva.value)) {
            habilidadNueva.value = '';
            habilidadNueva.focus();
        }
    });

    // Agregar presionando Enter
    habilidadNueva?.addEventListener('keydown', event => {
        if (event.key === 'Enter') {
            event.preventDefault();

            if (agregarHabilidad(habilidadNueva.value)) {
                habilidadNueva.value = '';
            }
        }
    });

    // Agregar desde la lista de sugerencias
    habilidadesSugeridas?.addEventListener('change', () => {
        const valor = habilidadesSugeridas.value;

        if (valor) {
            agregarHabilidad(valor);
        }

        habilidadesSugeridas.value = '';
    });

    // ======================================================
    // CIUDAD
    // ======================================================

    function establecerCiudad(valor) {
        const guardada = String(valor || '').trim();

        // Eliminar una opción temporal previa
        ciudad.querySelectorAll('[data-temporal]')
            .forEach(opcion => opcion.remove());

        if (!guardada) {
            ciudad.value = '';
            return;
        }

        // Comprobar si la ciudad está en el listado
        const existe = Array.from(ciudad.options).some(
            opcion => opcion.value === guardada
        );

        // Conservar ciudades antiguas no incluidas
        if (!existe) {
            const opcion = document.createElement('option');

            opcion.value = guardada;
            opcion.textContent = guardada;
            opcion.dataset.temporal = 'true';

            ciudad.appendChild(opcion);
        }

        ciudad.value = guardada;
    }

    // ======================================================
    // PROGRESO DEL PERFIL
    // ======================================================

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

            if (lleno) {
                completos++;
            }

            const elemento = document.querySelector(
                `.lp-lista li[data-campo="${campo}"]`
            );

            elemento?.classList.toggle('hecho', lleno);
        });

        const porcentaje = Math.round(
            (completos / campos.length) * 100
        );

        const texto = document.getElementById('progreso-texto');
        const barra = document.getElementById('progreso-barra');

        if (texto) {
            texto.textContent = `${porcentaje}% completo`;
        }

        if (barra) {
            barra.style.width = `${porcentaje}%`;
        }
    }

    // ======================================================
    // PRESENTAR LOS DATOS DEL USUARIO
    // ======================================================

    function mostrarPerfil(perfil) {

        perfilGuardado = { ...perfil };

        const nombre = perfil.nombre || 'Usuario';
        const rol = perfil.rol || 'trabajador';

        const estado =
            perfil.estado_verificacion || 'no_verificado';

        // Encabezado principal
        document.querySelector('.profile-name').textContent =
            nombre;

        document.getElementById('chip-nombre').textContent =
            nombre;

        document.getElementById('chip-rol').textContent =
            rol;

        document.getElementById('chip-inicial').textContent =
            nombre.trim().charAt(0).toUpperCase();

        // Resumen
        document.getElementById('perfil-telefono').textContent =
            perfil.telefono || 'Sin teléfono';

        document.getElementById('perfil-rol').textContent =
            rol;

        const badge = document.getElementById('badge-verif');

        badge.textContent =
            estado.replaceAll('_', ' ').toUpperCase();

        badge.classList.toggle(
            'verificado',
            estado === 'verificado'
        );

        // Campos de Mis datos
        establecerCiudad(perfil.ciudad);

        telefono.value = perfil.telefono
            ? `+591 ${perfil.telefono}`
            : '';

        listaHabilidades = String(perfil.habilidades || '')
            .split(',')
            .map(item => item.trim())
            .filter(Boolean);

        renderizarHabilidades();

        experiencia.value = perfil.experiencia || '';
        actualizarContador();

        // Mantener el comportamiento por roles
        const esEmpleador = rol === 'empleador';

        document.querySelectorAll('.solo-trabajador')
            .forEach(elemento => {
                elemento.hidden = esEmpleador;
            });

        // Funciones existentes del proyecto
        initHeader(estado, rol);
        actualizarProgreso(perfil);
    }

    // ======================================================
    // CONSULTAR PERFIL EN SQLITE MEDIANTE LA API
    // ======================================================

    async function cargarPerfil() {

        const resultado = await pedirApi('/api/perfil', {
            token
        });

        if (resultado.estado === 401) {
            window.location.href =
                '/frontend/auth/login.html';
            return;
        }

        if (!resultado.ok) {
            mostrarMensaje(
                resultado.datos?.error ||
                'No se pudo cargar el perfil.',
                'error'
            );
            return;
        }

        mostrarPerfil(resultado.datos);
    }

    // ======================================================
    // GUARDAR PERFIL
    // ======================================================

    form?.addEventListener('submit', async event => {

        event.preventDefault();

        if (guardando || !perfilGuardado) {
            return;
        }

        const esTrabajador =
            perfilGuardado.rol === 'trabajador';

        // Agregar texto pendiente antes de guardar
        if (esTrabajador && habilidadNueva.value.trim()) {

            if (!agregarHabilidad(habilidadNueva.value)) {
                return;
            }

            habilidadNueva.value = '';
        }

        const cuerpo = {
            ciudad: ciudad.value,

            // Mantener los valores anteriores si es empleador
            habilidades: esTrabajador
                ? habilidades.value
                : (perfilGuardado.habilidades || ''),

            experiencia: esTrabajador
                ? experiencia.value
                : (perfilGuardado.experiencia || '')
        };

        guardando = true;
        btnGuardar.disabled = true;

        mostrarMensaje('Guardando cambios...');

        try {
            const resultado = await pedirApi('/api/perfil', {
                metodo: 'PUT',
                token,
                cuerpo
            });

            if (resultado.estado === 401) {
                window.location.href =
                    '/frontend/auth/login.html';
                return;
            }

            if (!resultado.ok) {
                mostrarMensaje(
                    resultado.datos?.error ||
                    'No se pudo guardar el perfil.',
                    'error'
                );
                return;
            }

            // Refrescar datos con la respuesta del backend
            mostrarPerfil(resultado.datos);

            mostrarMensaje(
                'Perfil guardado correctamente.',
                'exito'
            );

        } catch (error) {
            console.error('Error al guardar perfil:', error);

            mostrarMensaje(
                'Ocurrió un problema al guardar los cambios.',
                'error'
            );

        } finally {
            guardando = false;
            btnGuardar.disabled = false;
        }
    });

    // ======================================================
    // CANCELAR CAMBIOS
    // ======================================================

    btnCancelar?.addEventListener('click', () => {

        if (!perfilGuardado) {
            return;
        }

        mostrarPerfil(perfilGuardado);

        habilidadNueva.value = '';

        mostrarMensaje('');
    });

    
    // ======================================================
    // MENÚ HAMBURGUESA PARA CELULARES
    // ======================================================

    const btnMenuMovil = document.getElementById('btn-menu-movil');
    const btnCerrarMenu = document.getElementById('btn-cerrar-menu');
    const fondoMenuMovil = document.getElementById('fondo-menu-movil');
    const menuLateral = document.getElementById('menu-lateral');

    const mediaMenuMovil = window.matchMedia('(max-width: 900px)');

    function cerrarMenuMovil() {
        if (!menuLateral) return;

        menuLateral.classList.remove('lp-sidebar-abierto');
        fondoMenuMovil?.classList.remove('activo');

        btnMenuMovil?.setAttribute('aria-expanded', 'false');
        btnMenuMovil?.setAttribute(
            'aria-label',
            'Abrir menú de navegación'
        );

        document.body.style.overflow = '';

        menuLateral.inert = mediaMenuMovil.matches;
    }

    function abrirMenuMovil() {
        if (!menuLateral || !mediaMenuMovil.matches) return;

        menuLateral.inert = false;

        menuLateral.classList.add('lp-sidebar-abierto');
        fondoMenuMovil?.classList.add('activo');

        btnMenuMovil?.setAttribute('aria-expanded', 'true');
        btnMenuMovil?.setAttribute(
            'aria-label',
            'Cerrar menú de navegación'
        );

        document.body.style.overflow = 'hidden';

        btnCerrarMenu?.focus();
    }

    // Abrir al tocar el botón hamburguesa
    btnMenuMovil?.addEventListener('click', () => {
        if (menuLateral?.classList.contains('lp-sidebar-abierto')) {
            cerrarMenuMovil();
        } else {
            abrirMenuMovil();
        }
    });

    // Cerrar con el botón X
    btnCerrarMenu?.addEventListener('click', () => {
        cerrarMenuMovil();
        btnMenuMovil?.focus();
    });

    // Cerrar al tocar fuera del menú
    fondoMenuMovil?.addEventListener('click', () => {
        cerrarMenuMovil();
        btnMenuMovil?.focus();
    });

    // Cerrar con Escape
    document.addEventListener('keydown', (event) => {
        if (
            event.key === 'Escape' &&
            menuLateral?.classList.contains('lp-sidebar-abierto')
        ) {
            cerrarMenuMovil();
            btnMenuMovil?.focus();
        }
    });

    // Cerrar al seleccionar un enlace
    menuLateral?.querySelectorAll('a[href]').forEach((enlace) => {
        enlace.addEventListener('click', cerrarMenuMovil);
    });

    // Adaptar el menú al cambiar el tamaño de pantalla
    mediaMenuMovil.addEventListener('change', cerrarMenuMovil);

    // Configurar estado inicial
    cerrarMenuMovil();


    // ======================================================
    // INICIAR PERFIL
    // ======================================================

    cargarPerfil();
}
