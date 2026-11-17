# Contrato de la API y modelo de datos

> **Documento compartido.** Los cambios de rutas, campos o reglas deben acordarse con el
> equipo antes de implementarse.
>
> Este contrato permite que una persona tenga una cuenta con perfil de trabajador, empleador
> o ambos.

Todas las respuestas son JSON. Cuando algo falla, la respuesta tiene la forma:

```json
{ "error": "Mensaje claro para el usuario." }
```

---

## 1. Rutas

### `POST /api/registro`

Crea una cuenta única y activa uno o ambos perfiles.

**Envía:**
```json
{
  "nombre": "Ana Prueba",
  "ci": "1234567",
  "telefono": "70000001",
  "password": "clave-de-prueba",
  "consentimiento": true,
  "roles": ["trabajador", "empleador"]
}
```

`roles` debe ser una lista no vacía, sin duplicados; puede incluir `trabajador`, `empleador`
o ambos. Los perfiles seleccionados pertenecen a la misma cuenta y usan las mismas
credenciales.

| Estado | Cuándo | Respuesta |
|---|---|---|
| `201` | Cuenta creada | `{ "id": 1, "mensaje": "Cuenta creada correctamente." }` |
| `400` | Falta un dato o no cumple las reglas (sección 3) | `{ "error": "..." }` |
| `409` | El CI o el teléfono ya están registrados | `{ "error": "El CI o el teléfono ya están registrados." }` |

### `POST /api/login`

**Envía:**
```json
{ "ci": "1234567", "password": "clave-de-prueba" }
```

| Estado | Cuándo | Respuesta |
|---|---|---|
| `200` | Datos correctos | `{ "token": "...", "usuario": { "id": 1, "nombre": "Ana Prueba", "rol": "trabajador", "roles": ["trabajador", "empleador"] } }` |
| `400` | Falta el CI válido o la contraseña | `{ "error": "..." }` |
| `401` | Carnet o contraseña incorrectos | `{ "error": "Carnet o contraseña incorrectos." }` |

`roles` enumera los perfiles habilitados. `rol` indica el perfil inicial seleccionado y se
mantiene como dato de compatibilidad. El perfil activo es una preferencia de interfaz, no una
autorización.

### `GET /api/perfil`

Requiere el encabezado `Authorization` con el token JWT de sesión como credencial Bearer.
El parámetro opcional `rol` selecciona cuál perfil se devuelve en los campos superiores. Si
se omite o no pertenece a la cuenta, se usa su primer perfil habilitado.

| Estado | Cuándo | Respuesta |
|---|---|---|
| `200` | Sesión válida | Datos públicos de la cuenta, `roles`, `rol` activo y `perfiles` |
| `401` | Sin token o token inválido | `{ "error": "Debes iniciar sesión." }` |

Ejemplo de respuesta:
```json
{
  "id": 1,
  "nombre": "Ana Prueba",
  "telefono": "70000001",
  "estado_verificacion": "no_verificado",
  "rol": "trabajador",
  "roles": ["trabajador", "empleador"],
  "ciudad": "Cochabamba",
  "habilidades": "Ventas",
  "experiencia": "Dos años",
  "genero": "femenino",
  "edad": 25,
  "perfiles": {
    "trabajador": {
      "ciudad": "Cochabamba",
      "habilidades": "Ventas",
      "experiencia": "Dos años",
      "genero": "femenino",
      "edad": 25
    },
    "empleador": {
      "ciudad": "La Paz",
      "genero": "otro",
      "edad": 40
    }
  }
}
```

Nunca se devuelve `ci` ni `password_hash`.

### `POST /api/perfil/roles`

Requiere `Authorization` con el token JWT de sesión. Agrega un perfil a la cuenta autenticada;
no crea otro usuario ni solicita de nuevo CI, teléfono o contraseña.

**Envía:**
```json
{
  "rol": "empleador"
}
```

La operación es idempotente: si el perfil ya existe, devuelve los roles actuales sin duplicarlos.

| Estado | Cuándo | Respuesta |
|---|---|---|
| `200` | Perfil agregado o ya existente | `{ "mensaje": "...", "roles": ["trabajador", "empleador"] }` |
| `400` | Rol inválido | `{ "error": "..." }` |
| `401` | Sin sesión o usuario inexistente | `{ "error": "Debes iniciar sesión." }` |

### `PUT /api/perfil`

Requiere `Authorization` con el token JWT de sesión como credencial Bearer. `rol` identifica
el perfil que se actualiza y debe pertenecer a la cuenta.

**Envía:**
```json
{
  "rol": "trabajador",
  "ciudad": "Cochabamba",
  "habilidades": "Atención al cliente, ventas",
  "experiencia": "Dos años como vendedora",
  "genero": "femenino",
  "edad": 25
}
```

| Estado | Cuándo | Respuesta |
|---|---|---|
| `200` | Perfil guardado | Perfil actualizado, con el mismo formato de `GET` |
| `400` | Datos no válidos | `{ "error": "..." }` |
| `401` | Sin sesión | `{ "error": "Debes iniciar sesión." }` |
| `403` | La cuenta no tiene ese perfil | `{ "error": "No tienes activo ese perfil." }` |

Cada operación protegida que requiera un perfil (por ejemplo, publicar una oferta o postular)
debe comprobar en el servidor que la cuenta tiene el rol necesario. No se debe confiar en un
rol enviado solamente por el frontend.

---

## 2. Modelo de datos

### Tabla `usuarios`

Guarda la identidad y las credenciales de una persona: `id`, `nombre`, `ci`, `telefono`,
`password_hash`, `estado_verificacion`, `consentimiento_fecha` y `creado_en`. El CI y el
teléfono son únicos; la contraseña se almacena como hash bcrypt.

Por compatibilidad con el esquema anterior, `usuarios.rol`, `ciudad`, `habilidades`,
`experiencia`, `genero` y `edad` se conservan temporalmente. `usuarios.rol` se usa solo para
guardar el rol inicial y migrar cuentas antiguas. Los permisos actuales se consultan desde
`usuario_roles`, que es la fuente de verdad para saber si una cuenta es trabajadora,
empleadora o ambas.

### Tabla `usuario_roles`

Una fila por perfil habilitado, con clave primaria compuesta (`usuario_id`, `rol`).
`usuario_id` referencia `usuarios.id`; `rol` solo acepta `trabajador` o `empleador`.

### Tablas `perfiles_trabajador` y `perfiles_empleador`

Cada perfil se relaciona con `usuarios.id` mediante `usuario_id`, que es clave primaria y
foránea. El perfil de trabajador contiene `ciudad`, `habilidades`, `experiencia`, `genero` y
`edad`. El de empleador contiene `ciudad`, `genero` y `edad`. La cuenta puede tener uno o los
dos perfiles.

Al iniciar la aplicación, la migración convierte el rol y los datos de perfil existentes en
filas de estas tablas. No elimina las columnas antiguas.

---

## 3. Reglas de validación

| Campo | Regla |
|---|---|
| `nombre` | Obligatorio, entre 3 y 100 caracteres |
| `ci` | Obligatorio, solo números, entre 5 y 10 dígitos |
| `telefono` | Obligatorio, 8 dígitos, empieza con 6 o 7 |
| `password` | Obligatoria, mínimo 8 caracteres |
| `consentimiento` | Debe ser `true` |
| `roles` | Lista no vacía, sin duplicados; cada elemento debe ser `trabajador` o `empleador` |
| `ciudad` | Texto de máximo 60 caracteres |
| `habilidades` | Texto de máximo 300 caracteres (perfil de trabajador) |
| `experiencia` | Texto de máximo 1000 caracteres (perfil de trabajador) |
| `genero` | `masculino`, `femenino` u `otro` |
| `edad` | Número entero entre 18 y 100 |

---

## 4. Sesión del navegador

- El token se guarda en `localStorage` con la clave `lila_token`.
- El perfil activo se elige entre los `roles` recibidos del servidor y puede guardarse como
  preferencia de interfaz; nunca sustituye la autorización del backend.
- Las pantallas llaman al servidor con `pedirApi()` de `frontend/assets/js/api.js`.
