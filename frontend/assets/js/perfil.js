
/* ==========================================================
 * LILA - PERFIL DEL USUARIO
 * Sara Revollo
 * Profile page logic: loads the profile from /api/perfil, fills the form, manages skills and progress, saves changes, and handles the mobile menu.
 * Lógica de la página de perfil: carga el perfil desde /api/perfil, llena el formulario, maneja las habilidades y el progreso, guarda los cambios y controla el menú para celulares.
 *
 * Frontend del perfil.
 * API existente: GET /api/perfil y PUT /api/perfil.
 * No modifica la autenticación ni la base de datos.
 * Contiene la clase PaginaPerfil (hereda de Pagina): cada sección es un método.
 * ========================================================== */

import { Pagina } from './nucleo/Pagina.js';
import { ClienteApi } from './nucleo/ClienteApi.js';
import { Sesion } from './nucleo/Sesion.js';
import { initHeader } from './components.js';

export class PaginaPerfil extends Pagina {

    // Elementos del formulario
    #form;
    #ciudad;
    #telefono;
    #experiencia;
    #genero;
    #edad;
    #habilidades;
    #habilidadesTags;
    #habilidadNueva;
    #btnAgregar;
    #habilidadesSugeridas;
    #contador;
    #btnGuardar;
    #btnCancelar;

    // Estado de la página
    #listaHabilidades = [];
    #perfilGuardado = null;
    #guardando = false;

    // Menú móvil
    #btnMenuMovil;
    #btnCerrarMenu;
    #fondoMenuMovil;
    #menuLateral;
    #mediaMenuMovil;

    alCargar() {
        // Sin sesión, ir a iniciar sesión
        if (!this.sesion.obtener()) {
            window.location.href = '/frontend/auth/login.html';
            return;
        }

        this.#buscarElementos();
        this.#mostrarFecha();
        this.#activarCerrarSesion();
        this.#activarContador();
        this.#activarHabilidades();
        this.#activarGuardarYCancelar();
        this.#activarMenuMovil();
        this.#cargarPerfil();
    }

    // ======================================================
    // ELEMENTOS DEL FORMULARIO
    // ======================================================

    #buscarElementos() {
        this.#form = document.getElementById('perfil-form');
        this.mensaje = document.getElementById('perfil-mensaje');

        this.#ciudad = document.getElementById('ciudad');
        this.#telefono = document.getElementById('telefono-perfil');
        this.#experiencia = document.getElementById('experiencia');
        this.#genero = document.getElementById('genero');
        this.#edad = document.getElementById('edad');

        this.#habilidades = document.getElementById('habilidades');
        this.#habilidadesTags = document.getElementById('habilidades-tags');
        this.#habilidadNueva = document.getElementById('habilidad-nueva');
        this.#btnAgregar = document.getElementById('btn-agregar-habilidad');
        this.#habilidadesSugeridas = document.getElementById('habilidades-sugeridas');

        this.#contador = document.getElementById('contador-experiencia');
        this.#btnGuardar = document.getElementById('btn-guardar-perfil');
        this.#btnCancelar = document.getElementById('btn-cancelar-perfil');
    }

    // ======================================================
    // FECHA ACTUAL
    // ======================================================

    #mostrarFecha() {
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
    }

    // ======================================================
    // CERRAR SESIÓN
    // ======================================================

    #activarCerrarSesion() {
        document.getElementById('btn-salir')?.addEventListener(
            'click',
            () => this.sesion.cerrar()
        );
    }

    // ======================================================
    // CONTADOR DE EXPERIENCIA
    // ======================================================

    #actualizarContador() {
        if (!this.#contador || !this.#experiencia) return;

        this.#contador.textContent = this.#experiencia.value.length;
    }

    #activarContador() {
        this.#experiencia?.addEventListener(
            'input',
            () => this.#actualizarContador()
        );
    }

    // ======================================================
    // HABILIDADES
    // ======================================================

    #sincronizarHabilidades() {
        this.#habilidades.value = this.#listaHabilidades.join(', ');
    }

    #renderizarHabilidades() {
        this.#habilidadesTags.replaceChildren();

        this.#listaHabilidades.forEach((habilidad, indice) => {

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
                this.#listaHabilidades.splice(indice, 1);

                this.#renderizarHabilidades();
                this.mostrarMensaje('');
            });

            etiqueta.append(texto, boton);
            this.#habilidadesTags.appendChild(etiqueta);
        });

        this.#sincronizarHabilidades();
    }

    #agregarHabilidad(valor) {
        const nueva = String(valor || '').trim();

        if (!nueva) {
            return false;
        }

        if (nueva.length > 60) {
            this.mostrarMensaje(
                'Cada habilidad debe tener máximo 60 caracteres.',
                'error'
            );
            return false;
        }

        if (nueva.includes(',')) {
            this.mostrarMensaje(
                'Agrega las habilidades de una en una, sin comas.',
                'error'
            );
            return false;
        }

        const existe = this.#listaHabilidades.some(
            item =>
                item.toLocaleLowerCase('es') ===
                nueva.toLocaleLowerCase('es')
        );

        if (existe) {
            this.mostrarMensaje(
                'Esta habilidad ya fue agregada.',
                'error'
            );
            return false;
        }

        const propuesta = [
            ...this.#listaHabilidades,
            nueva
        ].join(', ');

        if (propuesta.length > 300) {
            this.mostrarMensaje(
                'Las habilidades no pueden superar 300 caracteres en total.',
                'error'
            );
            return false;
        }

        this.#listaHabilidades.push(nueva);
        this.#renderizarHabilidades();
        this.mostrarMensaje('');

        return true;
    }

    #activarHabilidades() {
        // Agregar con el botón +
        this.#btnAgregar?.addEventListener('click', () => {
            if (this.#agregarHabilidad(this.#habilidadNueva.value)) {
                this.#habilidadNueva.value = '';
                this.#habilidadNueva.focus();
            }
        });

        // Agregar presionando Enter
        this.#habilidadNueva?.addEventListener('keydown', event => {
            if (event.key === 'Enter') {
                event.preventDefault();

                if (this.#agregarHabilidad(this.#habilidadNueva.value)) {
                    this.#habilidadNueva.value = '';
                }
            }
        });

        // Agregar desde la lista de sugerencias
        this.#habilidadesSugeridas?.addEventListener('change', () => {
            const valor = this.#habilidadesSugeridas.value;

            if (valor) {
                this.#agregarHabilidad(valor);
            }

            this.#habilidadesSugeridas.value = '';
        });
    }

    // ======================================================
    // CIUDAD
    // ======================================================

    #establecerCiudad(valor) {
        const ciudad = this.#ciudad;
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

    #actualizarProgreso(perfil) {

        const campos = perfil.rol === 'empleador'
            ? ['ciudad', 'genero', 'edad']
            : ['ciudad', 'genero', 'edad', 'habilidades', 'experiencia'];

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

    #mostrarPerfil(perfil) {

        this.#perfilGuardado = { ...perfil };

        const nombre = perfil.nombre || 'Usuario';
        const rol = perfil.rol || 'trabajador';
        this.sesion.guardarRolActivo(rol);

        // Adaptar el menú de ofertas según el rol
        const enlaceOfertas = document.getElementById('enlace-ofertas');
        const textoOfertas = document.getElementById('texto-ofertas');

        if (enlaceOfertas && textoOfertas) {
            if (rol === 'empleador') {
                textoOfertas.textContent = 'Ofertas realizadas';
                enlaceOfertas.href = '/frontend/website/homeEmpleador.html';
            } else {
                textoOfertas.textContent = 'Ofertas';
                enlaceOfertas.href = '/frontend/website/homeTrabajador.html';
            }
        }

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

        // Mostrar ciudad en la cuarta tarjeta del resumen
        const tarjetaCiudad = document.getElementById('perfil-ciudad');

        if (tarjetaCiudad) {
            tarjetaCiudad.textContent = perfil.ciudad || 'Sin registrar';
        }

        const badge = document.getElementById('badge-verif');

        badge.textContent =
            estado.replaceAll('_', ' ').toUpperCase();

        badge.classList.toggle(
            'verificado',
            estado === 'verificado'
        );

        // Campos de Mis datos
        this.#establecerCiudad(perfil.ciudad);

        this.#genero.value = perfil.genero || '';
        this.#edad.value = perfil.edad ?? '';

        this.#telefono.value = perfil.telefono
            ? `+591 ${perfil.telefono}`
            : '';

        this.#listaHabilidades = String(perfil.habilidades || '')
            .split(',')
            .map(item => item.trim())
            .filter(Boolean);

        this.#renderizarHabilidades();

        this.#experiencia.value = perfil.experiencia || '';
        this.#actualizarContador();

        // Mantener el comportamiento por roles
        const esEmpleador = rol === 'empleador';

        document.querySelectorAll('.solo-trabajador')
            .forEach(elemento => {
                elemento.hidden = esEmpleador;
            });

        // Funciones existentes del proyecto
        initHeader(estado, rol);
        this.#actualizarProgreso(perfil);
    }

    // ======================================================
    // CONSULTAR PERFIL EN SQLITE MEDIANTE LA API
    // ======================================================

    async #cargarPerfil() {

        const rolActivo = this.sesion.obtenerRolActivo();
        const ruta = rolActivo
            ? `/api/perfil?rol=${encodeURIComponent(rolActivo)}`
            : '/api/perfil';
        const resultado = await this.api.get(ruta);

        if (resultado.estado === 401) {
            window.location.href =
                '/frontend/auth/login.html';
            return;
        }

        if (!resultado.ok) {
            this.mostrarMensaje(
                resultado.datos?.error ||
                'No se pudo cargar el perfil.',
                'error'
            );
            return;
        }

        this.#mostrarPerfil(resultado.datos);
    }

    // ======================================================
    // GUARDAR Y CANCELAR
    // ======================================================

    #activarGuardarYCancelar() {
        this.#form?.addEventListener('submit', event => this.#guardar(event));
        this.#btnCancelar?.addEventListener('click', () => this.#cancelar());
    }

    async #guardar(event) {

        event.preventDefault();

        if (this.#guardando || !this.#perfilGuardado) {
            return;
        }

        const perfilGuardado = this.#perfilGuardado;
        const esTrabajador =
            perfilGuardado.rol === 'trabajador';

        // Agregar texto pendiente antes de guardar
        if (esTrabajador && this.#habilidadNueva.value.trim()) {

            if (!this.#agregarHabilidad(this.#habilidadNueva.value)) {
                return;
            }

            this.#habilidadNueva.value = '';
        }

        const cuerpo = {
            rol: perfilGuardado.rol,
            ciudad: this.#ciudad.value,
            genero: this.#genero.value,
            edad: this.#edad.value === '' ? null : Number(this.#edad.value),

            // Mantener los valores anteriores si es empleador
            habilidades: esTrabajador
                ? this.#habilidades.value
                : (perfilGuardado.habilidades || ''),

            experiencia: esTrabajador
                ? this.#experiencia.value
                : (perfilGuardado.experiencia || '')
        };

        this.#guardando = true;
        this.#btnGuardar.disabled = true;

        this.mostrarMensaje('Guardando cambios...');

        try {
            const resultado = await this.api.put('/api/perfil', cuerpo);

            if (resultado.estado === 401) {
                window.location.href =
                    '/frontend/auth/login.html';
                return;
            }

            if (!resultado.ok) {
                this.mostrarMensaje(
                    resultado.datos?.error ||
                    'No se pudo guardar el perfil.',
                    'error'
                );
                return;
            }

            // Refrescar datos con la respuesta del backend
            this.#mostrarPerfil(resultado.datos);

            this.mostrarMensaje(
                'Perfil guardado correctamente.',
                'exito'
            );

        } catch (error) {
            console.error('Error al guardar perfil:', error);

            this.mostrarMensaje(
                'Ocurrió un problema al guardar los cambios.',
                'error'
            );

        } finally {
            this.#guardando = false;
            this.#btnGuardar.disabled = false;
        }
    }

    #cancelar() {

        if (!this.#perfilGuardado) {
            return;
        }

        this.#mostrarPerfil(this.#perfilGuardado);

        this.#habilidadNueva.value = '';

        this.mostrarMensaje('');
    }

    // ======================================================
    // MENÚ HAMBURGUESA PARA CELULARES
    // ======================================================

    #cerrarMenuMovil() {
        const menuLateral = this.#menuLateral;
        if (!menuLateral) return;

        menuLateral.classList.remove('lp-sidebar-abierto');
        this.#fondoMenuMovil?.classList.remove('activo');

        this.#btnMenuMovil?.setAttribute('aria-expanded', 'false');
        this.#btnMenuMovil?.setAttribute(
            'aria-label',
            'Abrir menú de navegación'
        );

        document.body.style.overflow = '';

        menuLateral.inert = this.#mediaMenuMovil.matches;
    }

    #abrirMenuMovil() {
        const menuLateral = this.#menuLateral;
        if (!menuLateral || !this.#mediaMenuMovil.matches) return;

        menuLateral.inert = false;

        menuLateral.classList.add('lp-sidebar-abierto');
        this.#fondoMenuMovil?.classList.add('activo');

        this.#btnMenuMovil?.setAttribute('aria-expanded', 'true');
        this.#btnMenuMovil?.setAttribute(
            'aria-label',
            'Cerrar menú de navegación'
        );

        document.body.style.overflow = 'hidden';

        this.#btnCerrarMenu?.focus();
    }

    #activarMenuMovil() {
        this.#btnMenuMovil = document.getElementById('btn-menu-movil');
        this.#btnCerrarMenu = document.getElementById('btn-cerrar-menu');
        this.#fondoMenuMovil = document.getElementById('fondo-menu-movil');
        this.#menuLateral = document.getElementById('menu-lateral');

        this.#mediaMenuMovil = window.matchMedia('(max-width: 900px)');

        const cerrar = () => this.#cerrarMenuMovil();

        // Abrir al tocar el botón hamburguesa
        this.#btnMenuMovil?.addEventListener('click', () => {
            if (this.#menuLateral?.classList.contains('lp-sidebar-abierto')) {
                this.#cerrarMenuMovil();
            } else {
                this.#abrirMenuMovil();
            }
        });

        // Cerrar con el botón X
        this.#btnCerrarMenu?.addEventListener('click', () => {
            this.#cerrarMenuMovil();
            this.#btnMenuMovil?.focus();
        });

        // Cerrar al tocar fuera del menú
        this.#fondoMenuMovil?.addEventListener('click', () => {
            this.#cerrarMenuMovil();
            this.#btnMenuMovil?.focus();
        });

        // Cerrar con Escape
        document.addEventListener('keydown', (event) => {
            if (
                event.key === 'Escape' &&
                this.#menuLateral?.classList.contains('lp-sidebar-abierto')
            ) {
                this.#cerrarMenuMovil();
                this.#btnMenuMovil?.focus();
            }
        });

        // Cerrar al seleccionar un enlace
        this.#menuLateral?.querySelectorAll('a[href]').forEach((enlace) => {
            enlace.addEventListener('click', cerrar);
        });

        // Adaptar el menú al cambiar el tamaño de pantalla
        this.#mediaMenuMovil.addEventListener('change', cerrar);

        // Configurar estado inicial
        this.#cerrarMenuMovil();
    }
}

// ======================================================
// INICIAR PERFIL
// ======================================================

const sesion = new Sesion();
new PaginaPerfil(new ClienteApi(sesion), sesion).iniciar();
