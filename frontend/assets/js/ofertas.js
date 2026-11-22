// ofertas.js
// Saves the employer's job offers and their status (active or paused) in the browser for the demo, until the backend has an offers API.
// Guarda las ofertas del empleador y su estado (activa o pausada) en el navegador para la demostración, hasta que el backend tenga una API de ofertas.

// Almacenamiento local (localStorage) de las ofertas del empleador para la demostración.
// Mientras no exista una API de ofertas en el backend, las ofertas publicadas y el estado (activa / pausada) de cada oferta se guardan en el navegador.

export const CLAVE_OFERTAS = 'lila_ofertas';
export const CLAVE_ESTADOS = 'lila_estados_ofertas';

export const CATEGORIAS = {
    gastronomia: 'Gastronomía',
    marketing: 'Diseño y marketing',
    eventos: 'Eventos',
    ventas: 'Ventas y comercio',
    otros: 'Otros'
};

function leer(clave, valorPorDefecto) {
    try {
        const crudo = localStorage.getItem(clave);
        if (!crudo) return valorPorDefecto;
        const valor = JSON.parse(crudo);
        return valor ?? valorPorDefecto;
    } catch {
        return valorPorDefecto;
    }
}

function escribir(clave, valor) {
    try {
        localStorage.setItem(clave, JSON.stringify(valor));
        return true;
    } catch {
        return false;
    }
}

/** Convierte un texto libre ("Santa Cruz") en un identificador ("santa-cruz"). */
export function normalizarTexto(texto) {
    return String(texto ?? '')
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

/** Devuelve las ofertas publicadas desde este navegador, de la más nueva a la más antigua. */
export function obtenerOfertas() {
    const ofertas = leer(CLAVE_OFERTAS, []);
    return Array.isArray(ofertas) ? ofertas.filter(o => o && typeof o === 'object' && o.id) : [];
}

/** Guarda una nueva oferta y devuelve el objeto guardado (o null si los datos no son válidos). */
export function guardarOferta(datos) {
    const titulo = String(datos.title ?? '').trim();
    const ubicacion = String(datos.location ?? '').trim();
    const modalidad = String(datos.type ?? '').trim();
    const pago = String(datos.pay ?? '').trim();
    const descripcion = String(datos.description ?? '').trim();
    const tipoEmpleo = datos.employmentType === 'no-formal' ? 'no-formal' : 'formal';
    const categoria = Object.hasOwn(CATEGORIAS, datos.category) ? datos.category : 'otros';

    if (!titulo || !ubicacion || !modalidad || !pago || !descripcion) return null;

    const ahora = Date.now();
    const oferta = {
        id: `oferta-${ahora}-${Math.random().toString(36).slice(2, 8)}`,
        title: titulo,
        location: ubicacion,
        city: normalizarTexto(ubicacion),
        type: modalidad,
        employmentType: tipoEmpleo,
        pay: pago,
        description: descripcion,
        category: categoria,
        status: 'active',
        createdAt: ahora
    };

    const ofertas = obtenerOfertas();
    ofertas.unshift(oferta);
    return escribir(CLAVE_OFERTAS, ofertas) ? oferta : null;
}

/** Estados guardados por id de oferta: { "oferta-x": "paused" | "active" }. */
export function obtenerEstados() {
    const estados = leer(CLAVE_ESTADOS, {});
    return estados && typeof estados === 'object' && !Array.isArray(estados) ? estados : {};
}

export function guardarEstado(id, estado) {
    if (!id || (estado !== 'active' && estado !== 'paused')) return;
    const estados = obtenerEstados();
    estados[id] = estado;
    escribir(CLAVE_ESTADOS, estados);
}
