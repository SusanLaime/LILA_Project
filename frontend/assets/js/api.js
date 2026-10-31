export async function pedirApi(ruta, { metodo = 'GET', cuerpo, token } = {}) {
    try {
        const headers = {};
        if (cuerpo !== undefined) headers['Content-Type'] = 'application/json';
        if (token) headers.Authorization = `Bearer ${token}`;
        const response = await fetch(ruta, {
            method: metodo,
            headers,
            body: cuerpo === undefined ? undefined : JSON.stringify(cuerpo)
        });
        const datos = await response.json();
        return { ok: response.ok, estado: response.status, datos };
    } catch {
        return { ok: false, estado: 0, datos: { error: 'No se pudo conectar con el servidor.' } };
    }
}
