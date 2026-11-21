// =====================================================================
// ClienteApi.js — Fachada sobre api.js: las páginas piden get/post/put y
// esta clase agrega el token de la sesión. Siempre devuelve { ok, estado, datos }.
// =====================================================================

import { pedirApi } from '../api.js';

export class ClienteApi {
    #sesion;

    constructor(sesion) {
        this.#sesion = sesion;
    }

    get(ruta) {
        return pedirApi(ruta, { token: this.#sesion.obtener() });
    }

    post(ruta, datos) {
        return pedirApi(ruta, { metodo: 'POST', cuerpo: datos, token: this.#sesion.obtener() });
    }

    put(ruta, datos) {
        return pedirApi(ruta, { metodo: 'PUT', cuerpo: datos, token: this.#sesion.obtener() });
    }
}
