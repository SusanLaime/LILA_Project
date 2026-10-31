# Contrato de la API y modelo de datos

> **Documento compartido.** Es el acuerdo entre las 4 personas: si alguien necesita cambiar
> una ruta, un campo o una regla, lo propone al equipo **antes** de cambiarlo, porque afecta
> el trabajo de los demás.

Todas las respuestas son JSON. Cuando algo falla, la respuesta siempre tiene la forma:

```json
{ "error": "Mensaje claro para el usuario." }
```

---

## 1. Rutas

### `POST /api/registro` — Persona 2

Crea la cuenta de un trabajador.

**Envía:**
```json
{
  "nombre": "Ana Prueba",
  "ci": "1234567",
  "telefono": "70000001",
  "password": "clave-de-prueba",
  "consentimiento": true
}
```

| Estado | Cuándo | Respuesta |
|---|---|---|
| `201` | Cuenta creada | `{ "id": 1, "mensaje": "Cuenta creada correctamente." }` |
| `400` | Falta un dato o no cumple las reglas (sección 3) | `{ "error": "..." }` |
| `409` | **El CI o el teléfono ya están registrados (CA-02)** | `{ "error": "El CI o el teléfono ya están registrados." }` |

### `POST /api/login` — Persona 3

**Envía:**
```json
{ "telefono": "70000001", "password": "clave-de-prueba" }
```

| Estado | Cuándo | Respuesta |
|---|---|---|
| `200` | Datos correctos | `{ "token": "...", "usuario": { "id": 1, "nombre": "Ana Prueba" } }` |
| `400` | Falta el teléfono o la contraseña | `{ "error": "..." }` |
| `401` | Teléfono o contraseña incorrectos | `{ "error": "Teléfono o contraseña incorrectos." }` |

### `GET /api/perfil` — Persona 4

Requiere el encabezado `Authorization: Bearer <token>`.

| Estado | Cuándo | Respuesta |
|---|---|---|
| `200` | Sesión válida | `{ "id", "nombre", "telefono", "ciudad", "habilidades", "experiencia", "estado_verificacion" }` |
| `401` | Sin token o token inválido | `{ "error": "Debes iniciar sesión." }` |

> Nunca se devuelve `password_hash`.

### `PUT /api/perfil` — Persona 4

Requiere `Authorization: Bearer <token>`.

**Envía:**
```json
{
  "ciudad": "Cochabamba",
  "habilidades": "Atención al cliente, ventas",
  "experiencia": "2 años como vendedora en ferias."
}
```

| Estado | Cuándo | Respuesta |
|---|---|---|
| `200` | Perfil guardado | El perfil completo actualizado (igual que `GET`) |
| `400` | Datos no válidos | `{ "error": "..." }` |
| `401` | Sin sesión | `{ "error": "Debes iniciar sesión." }` |

---

## 2. Modelo de datos — Persona 1

Tabla **`usuarios`**:

| Columna | Tipo | Regla |
|---|---|---|
| `id` | INTEGER | Clave primaria, autoincremental |
| `nombre` | TEXT | Obligatorio |
| `ci` | TEXT | Obligatorio, **UNIQUE** |
| `telefono` | TEXT | Obligatorio, **UNIQUE** |
| `password_hash` | TEXT | Obligatorio (hash bcrypt, nunca texto plano) |
| `rol` | TEXT | Por defecto `'trabajador'` |
| `ciudad` | TEXT | Opcional (se llena en el perfil) |
| `habilidades` | TEXT | Opcional (se llena en el perfil) |
| `experiencia` | TEXT | Opcional (se llena en el perfil) |
| `estado_verificacion` | TEXT | Por defecto `'no_verificado'` (la verificación de CI queda para el Segundo Parcial) |
| `consentimiento_fecha` | TEXT | Obligatorio: fecha y hora en que aceptó el tratamiento de datos (Ley 2472) |
| `creado_en` | TEXT | Por defecto la fecha y hora actual |

---

## 3. Reglas de validación — Persona 3 (las usan las Personas 2 y 4)

| Campo | Regla |
|---|---|
| `nombre` | Obligatorio, entre 3 y 100 caracteres |
| `ci` | Obligatorio, solo números, entre 5 y 10 dígitos |
| `telefono` | Obligatorio, 8 dígitos, empieza con 6 o 7 (celular de Bolivia) |
| `password` | Obligatoria, mínimo 8 caracteres |
| `consentimiento` | Debe ser `true` |
| `ciudad` | Opcional, máximo 60 caracteres |
| `habilidades` | Opcional, máximo 300 caracteres |
| `experiencia` | Opcional, máximo 1000 caracteres |

---

## 4. Sesión en el navegador — Persona 3

- El token se guarda en `localStorage` con la clave **`lila_token`** (funciones en `frontend/assets/js/sesion.js`).
- Las pantallas llaman al servidor con `pedirApi()` de `frontend/assets/js/api.js` (Persona 1).
