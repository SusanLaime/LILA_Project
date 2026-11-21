# Plan de implementación: LILA orientada a objetos (Opción B)

> **Rama:** `feature/oop` · **Diagrama de referencia:** `docs/diagrama-clases-oop.drawio`
>
> **Documento compartido.** Antes de tocar un archivo, avisar al equipo para no editarlo al mismo tiempo.

---

## 0. Resumen en 30 segundos

- **La idea:** solo se arreglan las **3 rutas del backend**, que hoy hacen demasiadas cosas a la vez. Todo lo demás se queda como está.
- **Qué NO hacemos:** no agregamos funciones nuevas. Las ofertas siguen en `localStorage` y quedan como **incremento futuro**.
- **No se borra ningún archivo.** Los que cambian se **renombran** con `git mv` (se conserva el historial de cada integrante) o se **envuelven** con una clase.
- **Cuánto código nuevo:** unas **200 líneas** (declaraciones de clases, constructores, contratos, adaptadores y la conexión en `server.js`). El resto es código que **ya existe y se reparte**.
- **Qué no cambia:** las URLs de la API, sus respuestas, el HTML, el CSS y la base de datos.
- **Cómo sabemos que no rompimos nada:** después de cada paso corremos `npm test` y deben pasar los 28 tests.

---

## 1. Por qué lo hacemos

Hoy cada ruta (`routes/registro.js`, `login.js`, `perfil.js`) es como una persona que hace **cuatro trabajos a la vez**: atiende la petición, revisa las reglas, escribe en la base de datos y arma la respuesta. Funciona, pero todo está mezclado.

El documento de la primera entrega (sección 5.2.2) ya lo reconoce:

> *"En este incremento, las consultas del modelo se escriben dentro de los controladores del BackEnd; separarlas en módulos propios de acceso a datos es una mejora prevista."*

Este plan **cumple esa mejora prevista** y además:

| Problema hoy | Solución con OOP |
|---|---|
| El SQL está mezclado con la lógica HTTP | El SQL vive solo en un **repositorio** |
| Las rutas importan directamente SQLite, bcrypt y JWT | Los servicios dependen de **contratos** (interfaces) |
| `obtenerRoles` está copiado en `login.js` y en `perfil.js` | Queda una sola vez, en el repositorio |
| `perfil.js` tiene `if (rol === 'trabajador') ... else ...` | Cada perfil sabe actualizarse solo (polimorfismo) |
| Para probar la lógica hay que levantar Express y una base de datos | Se puede probar un servicio con un repositorio **falso** |
| `lila_token` y `lila_rol_activo` se tocan a mano en varias páginas | Solo la clase `Sesion` toca `localStorage` |

---

## 2. La Opción B explicada en simple

Cada archivo del proyecto cae en **uno de estos 5 grupos**:

### Grupo 1 — Se quedan exactamente igual ⬜
`backend/db.js`, `backend/validacion.js`, `frontend/assets/js/ofertas.js`, `frontend/assets/js/components.js`, `database/*.sql`, todo el HTML y todo el CSS.

### Grupo 2 — Se quedan, con un "envoltorio" encima 🔌
| Archivo que se queda | Clase que lo envuelve | Cambio dentro del archivo |
|---|---|---|
| `backend/seguridad.js` | `HasheadorBcrypt` y `TokensJwt` | Exportar una función nueva: `verificarToken(token)` |
| `frontend/assets/js/api.js` | `ClienteApi` | Ninguno |
| `frontend/assets/js/sesion.js` | `Sesion` | Agregar `guardarRolActivo(rol)` y `obtenerRolActivo()` |

El archivo sigue haciendo su trabajo. La clase nueva es solo una **cáscara** que lo llama por dentro, como un enchufe adaptador: el aparato es el mismo, solo cambia cómo se conecta.

### Grupo 3 — Se renombran y se reparte su contenido 🔀
| Hoy | Después (`git mv`) | Qué se queda dentro |
|---|---|---|
| `backend/routes/registro.js` | `backend/controladores/registroController.js` | Solo leer la petición y responder |
| `backend/routes/login.js` | `backend/controladores/loginController.js` | Solo leer la petición y responder |
| `backend/routes/perfil.js` | `backend/controladores/perfilController.js` | Solo leer la petición y responder |

Las reglas pasan a los **servicios**, el SQL al **repositorio** y los datos de usuario y perfil a las clases del **dominio**.

### Grupo 4 — Mismo nombre y lugar, pero por dentro pasan a ser una clase ✏️
| Archivo (no se mueve) | Clase que contiene |
|---|---|
| `frontend/assets/js/login.js` | `PaginaLogin` |
| `frontend/assets/js/registro.js` | `PaginaRegistro` |
| `frontend/assets/js/perfil.js` | `PaginaPerfil` |

Como el nombre y el lugar no cambian, **el HTML no se toca**: `login.html` sigue cargando `../assets/js/login.js`. La última línea de cada archivo crea la página y la inicia.

### Grupo 5 — Carpetas nuevas 🆕
`backend/dominio/`, `backend/contratos/`, `backend/servicios/`, `backend/infraestructura/` y `frontend/assets/js/nucleo/`: aquí viven las clases que reciben los trabajos repartidos.

---

## 3. La arquitectura: qué se mantiene y qué mejora

**La arquitectura no cambia.** OOP solo ordena el código **por dentro**.

```
┌─────────────────────────────────────────────────────────────────────┐
│                     UNA SOLA APLICACIÓN (monolito)                  │
│                                                                     │
│   CLIENTE (navegador)                SERVIDOR (Node.js + Express)   │
│  ┌───────────────────┐   HTTP     ┌──────────────────────────────┐  │
│  │ CAPA PRESENTACIÓN │   + JSON   │ CAPA APLICACIÓN              │  │
│  │                   │ ─────────► │  controladores → servicios   │  │
│  │ Vista: HTML + CSS │  API REST  │                → dominio     │  │
│  │ Páginas (clases)  │ ◄───────── ├──────────────────────────────┤  │
│  │ ClienteApi/Sesion │            │ CAPA DATOS                   │  │
│  └───────────────────┘            │  contratos ◄─ infraestructura│  │
│                                   │                  │           │  │
│                                   │      db.js → SQLite (lila.db)│  │
│                                   └──────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

| Arquitectura | ¿Se mantiene? | Cómo se ve en el código nuevo |
|---|---|---|
| **Monolítica modular** | ✅ Igual | Un solo `package.json`, un solo `server.js`, una sola `lila.db`. Ahora con módulos mejor separados. |
| **Cliente-servidor con API REST** | ✅ Igual | `frontend/` (cliente) habla con `backend/controladores/` (servidor) solo por HTTP. Las 5 rutas no cambian. |
| **Tres capas** | ✅ Más clara | Presentación = `frontend/`; Aplicación = `controladores/`, `servicios/`, `dominio/`; Datos = `contratos/`, `infraestructura/`, `db.js`, `database/`. |
| **MVC** | ✅ Corregido | Modelo = `dominio/` + repositorio; Vista = HTML + CSS; Controlador = `controladores/` (servidor) y las clases `Pagina*` (navegador). Los controladores **ya no tienen SQL**. |
| **Inversión de dependencias** (nuevo) | 🆕 | Los servicios dependen de `contratos/`, nunca de SQLite, bcrypt ni JWT. |

### La regla de oro de las dependencias

**Todas las flechas apuntan hacia el centro (dominio y contratos), nunca hacia afuera.**

```
  frontend (Pagina*) ──HTTP──► controladores ──► servicios ──► contratos ◄── infraestructura
                                                     │                              │
                                                     ▼                              ▼
                                                  dominio                 db.js, seguridad.js
```

| Carpeta / archivo | Puede importar de | NUNCA importa de |
|---|---|---|
| `dominio/` | nada (solo de sí mismo) | todo lo demás |
| `contratos/` | `dominio/` | servicios, infraestructura, controladores |
| `servicios/` | `dominio/`, `contratos/`, `validacion.js` | `infraestructura/`, `db.js`, `seguridad.js`, controladores, Express |
| `infraestructura/` | `contratos/`, `dominio/`, `seguridad.js` (los adaptadores) | servicios, controladores |
| `controladores/` | `servicios/`, Express | `infraestructura/`, `db.js`, SQL |
| `server.js` | **todos** (es el único que conoce todo) | — |

> **Prueba rápida:** si abres un servicio o un controlador y ves `import db from ...` o `import ... from '../infraestructura/...'`, el diseño se rompió.

---

## 4. La nueva estructura de carpetas

**Leyenda:** 🆕 nuevo · 🔀 se renombra y se reparte su contenido · 🔌 adaptador (envuelve un archivo que se queda) · ✏️ cambia poco · ⬜ no cambia · ⏳ futuro

```
LILA_Project/
│
├── package.json                        ⬜
├── .env / .env.example                 ⬜
├── README.md                           ✏️  actualizar la estructura
├── LICENSE                             ⬜
│
├── docs/
│   ├── API.md                          ⬜  el contrato de la API NO cambia
│   ├── Solving_conflicts.md            ⬜
│   ├── diagrama-clases-oop.drawio      ✏️  ajustes de la sección 11
│   └── plan-implementacion-oop.md      🆕  este documento
│
├── database/                           ══ CAPA DE DATOS (almacenamiento) ══
│   ├── schema.sql                      ⬜
│   ├── seed.sql                        ⬜
│   └── lila.db                         ⬜
│
├── backend/                            ══ SERVIDOR ══
│   │
│   ├── server.js                       ✏️  raíz de composición: crea e inyecta todo
│   │
│   ├── db.js                           ⬜  se queda aquí (Singleton: una sola conexión)
│   ├── seguridad.js                    ✏️  se queda; solo agrega verificarToken()
│   ├── validacion.js                   ⬜  se queda; los servicios la usan
│   │
│   ├── dominio/                        ── MODELO: reglas del negocio ──
│   │   ├── Usuario.js                  🆕  datos de la cuenta + sus perfiles
│   │   ├── Perfil.js                   🆕  clase abstracta (ciudad, género, edad)
│   │   ├── PerfilTrabajador.js         🆕  + habilidades, experiencia
│   │   └── PerfilEmpleador.js          🆕  solo los campos comunes
│   │
│   ├── contratos/                      ── INTERFACES (abstracciones) ──
│   │   ├── RepositorioUsuarios.js      🆕
│   │   ├── Hasheador.js                🆕
│   │   └── Tokens.js                   🆕
│   │
│   ├── servicios/                      ── APLICACIÓN: casos de uso ──
│   │   ├── ServicioAuth.js             🆕  reglas sacadas de registro.js y login.js
│   │   └── ServicioPerfil.js           🆕  reglas sacadas de perfil.js
│   │
│   ├── infraestructura/                ── ACCESO A DATOS + adaptadores ──
│   │   ├── RepositorioUsuariosSqlite.js 🆕 todo el SQL sacado de las 3 rutas
│   │   ├── HasheadorBcrypt.js          🔌  envuelve seguridad.js
│   │   └── TokensJwt.js                🔌  envuelve seguridad.js
│   │
│   └── controladores/                  ── CONTROLADOR (MVC) + API REST ──
│       ├── registroController.js       🔀  era routes/registro.js
│       ├── loginController.js          🔀  era routes/login.js
│       ├── perfilController.js         🔀  era routes/perfil.js
│       └── MiddlewareSesion.js         🆕  revisa el token con Tokens.verificar()
│
├── frontend/                           ══ CLIENTE / CAPA DE PRESENTACIÓN ══
│   ├── auth/login.html, register.html  ⬜  VISTA (siguen cargando login.js / registro.js)
│   ├── website/*.html                  ⬜  VISTA
│   ├── components/                     ⬜
│   └── assets/
│       ├── css/                        ⬜  VISTA: estilos
│       ├── images/                     ⬜
│       └── js/
│           ├── nucleo/
│           │   ├── Pagina.js           🆕  clase abstracta de las páginas
│           │   ├── ClienteApi.js       🔌  envuelve api.js
│           │   └── Sesion.js           🔌  envuelve sesion.js
│           │
│           ├── login.js                ✏️  ahora contiene la clase PaginaLogin
│           ├── registro.js             ✏️  ahora contiene la clase PaginaRegistro
│           ├── perfil.js               ✏️  ahora contiene la clase PaginaPerfil
│           │
│           ├── api.js                  ⬜  se queda (pedirApi)
│           ├── sesion.js               ✏️  se queda; + guardarRolActivo(), obtenerRolActivo()
│           ├── components.js           ⬜  sin cambios (sigue usando api.js y sesion.js)
│           └── ofertas.js              ⏳  sin cambios (ofertas en localStorage)
│
└── tests/
    ├── registro.test.js                ✏️  importa el controlador en vez de routes/
    ├── login.test.js                   ✏️  importa el controlador en vez de routes/
    ├── perfil.test.js                  ✏️  importa el controlador en vez de routes/
    ├── db.test.js                      ⬜
    ├── perfiles-migracion.test.js      ⬜
    ├── server.test.js                  ⬜
    ├── servicios/                      🆕  opcional: pruebas con repositorios falsos
    └── e2e/homeEmpleador.e2e.js        ⬜
```

> **Sobre los nombres:** los controladores conservan el nombre de su archivo original + `Controller` (`perfil.js` → `perfilController.js`). Dentro, la clase se llama `PerfilController`. Las clases nuevas usan PascalCase (`Usuario.js`, `ServicioAuth.js`).

### ⏳ Incremento futuro (no se implementa ahora)

En el diagrama se pintan en **gris punteado con `«futuro»`**: `Oferta`, `PerfilEmpleador.publicarOferta()`, `RepositorioOfertas`, `RepositorioOfertasSqlite`, `ServicioOfertas`, `OfertasController`, `PaginaOfertas` y sus flechas. Requieren una tabla `ofertas` nueva y rutas `/api/ofertas`.

---

## 5. Qué pasa con cada archivo, bloque por bloque

**Cómo leer las tablas:** "Líneas" son las líneas del archivo **hoy** (rama `feature/oop`). "Pasa a" dice la clase y el método donde termina ese código. La regla para decidir es siempre la misma:

| Si el código… | va a… |
|---|---|
| lee `req` o responde con `res.status(...)` | el **controlador** |
| decide algo del negocio ("¿ya existe?", "¿tiene ese rol?", "¿la clave es correcta?") | el **servicio** |
| es una regla propia de un usuario o un perfil ("un trabajador tiene habilidades") | el **dominio** |
| escribe SQL (`db.prepare`, `db.exec`) | el **repositorio** |
| usa bcrypt o JWT | se queda en `seguridad.js` (lo usan los adaptadores) |

---

### A. `routes/registro.js` → `controladores/registroController.js` 🔀
**120 líneas** · **Ruta:** `POST /api/registro`

| Líneas | Qué hace hoy | Pasa a | Por qué ahí |
|---|---|---|---|
| 21–23 | Recibe la petición y lee `req.body` | `RegistroController.registrar(req, res)` | Es HTTP |
| 25–32 | `validarRegistro(datos)`; si falla, 400 | `ServicioAuth.registrar()` lanza un error con `estado: 400` | Es una regla del caso de uso |
| 34–37 | Junta los roles (`roles[]` o `rol`) | `ServicioAuth.registrar()` | Prepara los datos del caso de uso |
| 40–42 | `SELECT id FROM usuarios WHERE ci = ? OR telefono = ?` | `RepositorioUsuariosSqlite.existe(ci, telefono)` | Es SQL |
| 44–48 | Si ya existe, 409 | `ServicioAuth.registrar()` lanza un error con `estado: 409` | Regla "no se repite CI ni teléfono" |
| 51 | `hashPassword(password)` | `ServicioAuth` llama a `this.#hasheador.hashear(password)` | Usa el contrato, no bcrypt |
| — | (hoy no existe) Armar el objeto | `ServicioAuth`: `new Usuario({...})` + `usuario.agregarPerfil(new PerfilTrabajador())` o `new PerfilEmpleador()` según los roles | Ahora el usuario es un objeto |
| 54–94 | Transacción: `INSERT` en `usuarios`, `usuario_roles` y `perfiles_*` | `RepositorioUsuariosSqlite.guardar(usuario)` (la transacción `BEGIN`/`COMMIT`/`ROLLBACK` se queda dentro) | Es SQL |
| 97–100 | Responde 201 `{ id, mensaje }` | `RegistroController.registrar()` | Es HTTP |
| 103–110 | Si SQLite dice `UNIQUE constraint failed`, 409 | `RepositorioUsuariosSqlite.guardar()` lo convierte en un error `{ codigo: 'DUPLICADO' }` y `ServicioAuth` lo traduce a `estado: 409` | El servicio no debe conocer los mensajes de SQLite |
| 112–116 | Cualquier otro error, 500 `'No se pudo crear la cuenta.'` | `RegistroController.registrar()` (su `catch`) | Es HTTP |

**Cómo queda el controlador:**
```js
export class RegistroController {
  #servicio;
  constructor(servicioAuth) {
    this.#servicio = servicioAuth;
    this.router = express.Router();
    this.router.post('/', (req, res) => this.registrar(req, res));
  }

  async registrar(req, res) {
    try {
      const usuario = await this.#servicio.registrar(req.body ?? {});
      res.status(201).json({ id: usuario.id, mensaje: 'Cuenta creada correctamente.' });
    } catch (error) {
      if (error.estado) return res.status(error.estado).json({ error: error.message });
      console.error('Error al registrar usuario:', error);
      res.status(500).json({ error: 'No se pudo crear la cuenta.' });
    }
  }
}
```

---

### B. `routes/login.js` → `controladores/loginController.js` 🔀
**68 líneas** · **Ruta:** `POST /api/login`

| Líneas | Qué hace hoy | Pasa a | Por qué ahí |
|---|---|---|---|
| 16–17 | Recibe la petición y lee `req.body` | `LoginController.iniciarSesion(req, res)` | Es HTTP |
| 18–22 | `validarLogin(datos)`; si falla, 400 | `ServicioAuth.iniciarSesion()` (error `estado: 400`) | Regla del caso de uso |
| 25–29 | `SELECT ... FROM usuarios WHERE ci = ?` | `RepositorioUsuariosSqlite.buscarPorCi(ci)`, que devuelve un `Usuario` completo (con roles y perfiles) | Es SQL |
| 31–35 | Si no existe o la clave no coincide, 401 `'Carnet o contraseña incorrectos.'` | `ServicioAuth.iniciarSesion()` usando `this.#hasheador.comparar()` (error `estado: 401`) | Regla del negocio + contrato |
| 37–48 | Lee los roles ordenados (trabajador primero) y, si no hay, usa `usuarios.rol` | **SQL:** `RepositorioUsuariosSqlite` (al cargar el usuario). **Lista:** `Usuario.roles()` | El SQL va al repositorio; la lista la conoce el usuario |
| 50 | `crearToken(usuario)` | `ServicioAuth` llama a `this.#tokens.crear(usuario.id)` | Usa el contrato, no JWT |
| 51–59 | Responde 200 `{ token, usuario: { id, nombre, rol, roles } }` | `ServicioAuth` **devuelve** `{ token, usuario }`; `LoginController` **responde** 200 | Separar "qué" (servicio) de "cómo se envía" (controlador) |
| 60–65 | Error inesperado, 500 | `LoginController.iniciarSesion()` (su `catch`) | Es HTTP |

---

### C. `routes/perfil.js` → `controladores/perfilController.js` 🔀
**222 líneas** · **Rutas:** `GET /api/perfil`, `POST /api/perfil/roles`, `PUT /api/perfil`

Es el archivo que más se reparte, porque hoy hace de controlador, servicio, repositorio **y** modelo al mismo tiempo.

| Líneas | Qué hace hoy | Pasa a | Por qué ahí |
|---|---|---|---|
| 15–18 | Cabecera `Cache-Control: no-store` | `PerfilController` (en su `router.use`) | Es HTTP |
| 21 | `router.use(requiereSesion)` | `PerfilController` usa `MiddlewareSesion.requiereSesion` | Cadena de responsabilidad |
| 25–45 | `obtenerRoles()`: SQL de roles + respaldo con `usuarios.rol` | **SQL:** `RepositorioUsuariosSqlite` (dentro de `buscarPorId`). **Lista:** `Usuario.roles()` | **Se elimina la duplicación** con `login.js` |
| 51–78 | `obtenerPerfil()`: SQL de `usuarios`, `perfiles_trabajador` y `perfiles_empleador` | `RepositorioUsuariosSqlite.buscarPorId(id)`, que devuelve un `Usuario` con sus objetos `PerfilTrabajador` / `PerfilEmpleador` | Es SQL |
| 62–64 | Elegir el rol activo (el pedido, o el primero) | `ServicioPerfil.ver(usuarioId, rol)` | Regla del caso de uso |
| 79–95 | Armar el JSON de respuesta (campos del perfil activo + `perfiles`) | `ServicioPerfil.ver()` usando `perfil.aJSON()` de cada perfil | La forma de la respuesta **no cambia** |
| 100–110 | `GET /`: lee `req.usuarioId` y `req.query.rol`; si no hay usuario, 401; si hay, 200 | `PerfilController.ver(req, res)` | Es HTTP |
| 116–121 | `POST /roles`: el rol debe ser trabajador o empleador; si no, 400 | `ServicioPerfil.agregarRol()` (error `estado: 400`) | Regla del negocio |
| 123–130 | Si el usuario no existe, 401 | `ServicioPerfil.agregarRol()` (error `estado: 401`) | Regla del negocio |
| 132–151 | Transacción: `INSERT OR IGNORE` en `usuario_roles` y en la tabla de perfil | **Objeto:** `usuario.agregarPerfil(new PerfilEmpleador())`. **SQL:** `RepositorioUsuariosSqlite.guardar(usuario)` | El dominio decide, el repositorio guarda |
| 153–156 | Responde 200 `{ mensaje, roles }` | `PerfilController.agregarRol(req, res)` | Es HTTP |
| 163–169 | `PUT /`: `validarPerfil(req.body)`; si falla, 400 | `ServicioPerfil.actualizar()` (error `estado: 400`) | Regla del caso de uso |
| 171–178 | Rol por defecto y rol válido; si no, 400 | `ServicioPerfil.actualizar()` | Regla del caso de uso |
| 180–184 | Si el usuario no tiene ese rol, 403 `'No tienes activo ese perfil.'` | `ServicioPerfil.actualizar()` usando `usuario.tieneRol(rol)` (error `estado: 403`) | El usuario sabe qué roles tiene |
| 186–216 | `if (rol === 'trabajador') UPDATE ... else UPDATE ...` | **Qué campos cambian:** `perfil.actualizar(datos)` (polimorfismo). **SQL:** `RepositorioUsuariosSqlite.guardar(usuario)` | **Desaparece el `if/else` por rol** |
| 218–219 | Devuelve el perfil actualizado, 200 | `ServicioPerfil.actualizar()` devuelve `this.ver(...)`; `PerfilController.actualizar()` responde 200 | Reutiliza `ver()` |

> **`guardar(usuario)` sirve para los dos casos:** si el usuario no tiene `id`, hace `INSERT` (registro); si ya tiene `id`, hace `UPDATE` de sus perfiles e `INSERT OR IGNORE` de los roles nuevos (editar perfil, agregar rol). Así el contrato `RepositorioUsuarios` se queda con solo 4 métodos, como en el diagrama.

---

### D. `backend/seguridad.js` → se queda, envuelto por 2 adaptadores 🔌
**85 líneas**

`seguridad.js` **sigue siendo el único archivo que conoce bcrypt y JWT**. Lo único que cambia dentro es sacar las líneas 69–76 (el `jwt.verify` y la revisión del `id`) a una función exportada:

```js
// seguridad.js — función nueva (código que ya existía dentro de requiereSesion)
export function verificarToken(token) {
  try {
    const payload = jwt.verify(token, obtenerJwtSecret());
    return Number.isSafeInteger(payload?.id) && payload.id > 0 ? payload.id : null;
  } catch {
    return null;
  }
}
```

Los adaptadores solo la llaman:

```js
// infraestructura/HasheadorBcrypt.js
import { hashPassword, verificarPassword } from '../seguridad.js';
export class HasheadorBcrypt extends Hasheador {
  hashear(password)        { return hashPassword(password); }
  comparar(password, hash) { return verificarPassword(password, hash); }
}

// infraestructura/TokensJwt.js
import { crearToken, verificarToken } from '../seguridad.js';
export class TokensJwt extends Tokens {
  crear(usuarioId)  { return crearToken({ id: usuarioId }); }
  verificar(token)  { return verificarToken(token); }
}
```

| Función de `seguridad.js` | ¿Quién la usa después? |
|---|---|
| `hashPassword`, `verificarPassword` | `HasheadorBcrypt` |
| `crearToken`, `verificarToken` 🆕 | `TokensJwt` |
| `validarConfiguracionJwt` | `server.js` (igual que hoy) |
| `requiereSesion` | Ya no la usa la app (la reemplaza `MiddlewareSesion`). Se decide con — en el paso 7 si se borra o se deja para los tests. |

Los mensajes (`'Debes iniciar sesión.'`, `'JWT_SECRET no está configurado...'`), el vencimiento de **8 horas** y el costo de bcrypt (**10**) no cambian.

---

### E. `backend/db.js` → se queda igual ⬜
**116 líneas**

No cambia ni una línea y no se mueve de carpeta. Lo único que cambia es **quién lo importa**: hoy lo importan las tres rutas; después **solo** `server.js`, que se lo pasa a `RepositorioUsuariosSqlite` por el constructor. Sigue siendo un **Singleton**: una sola conexión para toda la app.

---

### F. `frontend/assets/js/api.js` → se queda, envuelto por `ClienteApi` 🔌
**24 líneas** · No cambia.

```js
// nucleo/ClienteApi.js
import { pedirApi } from '../api.js';
export class ClienteApi {
  #sesion;
  constructor(sesion) { this.#sesion = sesion; }
  get(ruta)         { return pedirApi(ruta, { token: this.#sesion.obtener() }); }
  post(ruta, datos) { return pedirApi(ruta, { metodo: 'POST', cuerpo: datos, token: this.#sesion.obtener() }); }
  put(ruta, datos)  { return pedirApi(ruta, { metodo: 'PUT',  cuerpo: datos, token: this.#sesion.obtener() }); }
}
```

```js
// Antes, en cada página:
const r = await pedirApi('/api/perfil', { metodo: 'PUT', cuerpo: datos, token: obtenerToken() });
// Después:
const r = await this.api.put('/api/perfil', datos);
```

---

### G. `frontend/assets/js/sesion.js` → se queda, envuelto por `Sesion` 🔌
**19 líneas** · Solo se agregan 2 funciones.

| Hoy en `sesion.js` | Método de `Sesion` |
|---|---|
| `guardarToken(token)` | `guardar(token)` |
| `obtenerToken()` | `obtener()` |
| `cerrarSesion()` | `cerrar()` |
| 🆕 `guardarRolActivo(rol)` | `guardarRolActivo(rol)` |
| 🆕 `obtenerRolActivo()` | `obtenerRolActivo()` |

Las dos funciones nuevas existen porque hoy la clave `lila_rol_activo` se lee y escribe **a mano** en `login.js` (líneas 46 y 67), `registro.js` (86) y `perfil.js` (334 y 429). Así **solo `sesion.js` toca `localStorage`** para la sesión.

---

### H. `frontend/assets/js/login.js` → contiene `PaginaLogin` ✏️
**73 líneas** · Mismo nombre y lugar.

| Líneas | Qué hace | Pasa a |
|---|---|---|
| 7–8 | Imports de `api.js` y `sesion.js` | Se reemplazan por `Pagina`, `ClienteApi` y `Sesion` |
| 10–13 | Busca los elementos del formulario | `PaginaLogin.alCargar()` (campos privados `#form`, `#mensaje`, …) |
| 15–20 | Botón "Mostrar / Ocultar" contraseña | `Pagina.activarMostrarPassword()` 🆕: **sube a la clase padre**, porque `registro.js` (98–103) tiene el mismo código |
| 22–26 | Botones "Crear cuenta" e "Ingresar" | `PaginaLogin.alCargar()` |
| 28–68 | Envío del formulario: `POST /api/login`, guarda token y rol activo, redirige | `PaginaLogin.#enviar()` con `this.api.post(...)`, `this.sesion.guardar(...)` y `this.sesion.guardarRolActivo(...)` |
| (final) | — | `new PaginaLogin(new ClienteApi(sesion), sesion).iniciar();` |

---

### I. `frontend/assets/js/registro.js` → contiene `PaginaRegistro` ✏️
**137 líneas** · Mismo nombre y lugar.

| Líneas | Qué hace | Pasa a |
|---|---|---|
| 10–14 | Busca los elementos | `PaginaRegistro.alCargar()` |
| 16–95 | Modo `?agregarRol=...`: arma el panel y llama `POST /api/perfil/roles` | `PaginaRegistro.#modoAgregarRol(rol)` |
| 50 | `obtenerToken()` | `this.sesion.obtener()` |
| 86 | `localStorage.setItem('lila_rol_activo', ...)` | `this.sesion.guardarRolActivo(...)` |
| 98–103 | Mostrar / ocultar contraseña | heredado: `this.activarMostrarPassword()` |
| 105–137 | Envío del registro: `POST /api/registro` y luego a `login.html` | `PaginaRegistro.#enviarRegistro()` con `this.api.post(...)` |

---

### J. `frontend/assets/js/perfil.js` → contiene `PaginaPerfil` ✏️
**659 líneas** · Mismo nombre y lugar. Ya está dividido en secciones con comentarios; **cada sección pasa a ser un método**.

| Líneas | Sección de hoy | Método en `PaginaPerfil` |
|---|---|---|
| 17–21 | Sin token, ir a `login.html` | inicio de `alCargar()` con `this.sesion.obtener()` |
| 23–48 | Elementos del formulario | campos privados, en `alCargar()` |
| 50–66 | Fecha actual | `#mostrarFecha()` |
| 68–80 | Cerrar sesión | `#activarCerrarSesion()` → usa `this.sesion.cerrar()` (**corrige** el `localStorage.removeItem('lila_token')` a mano de la línea 75) |
| 82–96 | `mostrarMensaje()` | **se borra aquí**: se hereda de `Pagina.mostrarMensaje()` |
| 98–111 | Contador de experiencia | `#actualizarContador()` |
| 113–241 | Habilidades (agregar, quitar, sugerencias) | `#renderizarHabilidades()`, `#agregarHabilidad()`, `#sincronizarHabilidades()` |
| 243–276 | Ciudad | `#establecerCiudad()` |
| 278–322 | Barra de progreso | `#actualizarProgreso(perfil)` |
| 324–421 | Mostrar los datos | `#mostrarPerfil(perfil)` (línea 334 → `this.sesion.guardarRolActivo(...)`) |
| 423–453 | Cargar el perfil (`GET /api/perfil`) | `#cargarPerfil()` con `this.api.get(...)` y `this.sesion.obtenerRolActivo()` |
| 455–543 | Guardar (`PUT /api/perfil`) | `#guardar()` con `this.api.put(...)` |
| 545–561 | Cancelar cambios | `#cancelar()` |
| 563–652 | Menú hamburguesa en celulares | `#activarMenuMovil()` |
| 654–659 | Iniciar | `alCargar()` llama a los métodos en orden |

> Por su tamaño, se recomienda convertirlo en **dos commits**: primero 17–453 (mostrar y cargar), luego 455–659 (guardar, cancelar y menú).

---

### K. `frontend/assets/js/ofertas.js` → se queda igual ⏳
**99 líneas**

`ofertas.js` **no es una página**: es un módulo que guarda las ofertas en `localStorage` (`lila_ofertas`, `lila_estados_ofertas`). Lo usan los scripts dentro de `homeEmpleador.html` (línea 240), `homeTrabajador.html` (203) y `publicarOferta.html` (73). En la Opción B **no se toca**. Cuando llegue el incremento de ofertas, se reemplaza por llamadas de `ClienteApi` a `/api/ofertas` y aparece `PaginaOfertas`.

---

### L. `frontend/assets/js/components.js` → se queda igual ⬜
**275 líneas**

Sigue importando `obtenerToken` de `sesion.js` y `pedirApi` de `api.js`. Como esos dos archivos se quedan, **no cambia nada**.

---

## 6. Los patrones de diseño, uno por uno

Cada patrón dice **dónde está**, **qué problema resuelve** y **cómo se ve**.

### 6.1 Repository (Repositorio)
- **Dónde:** `contratos/RepositorioUsuarios.js` (la promesa) y `infraestructura/RepositorioUsuariosSqlite.js` (el SQL real).
- **Problema que resuelve:** hoy el SQL está repartido en tres rutas. Con el repositorio, **todo el SQL de usuarios vive en un solo archivo**, y el resto del código solo pide "búscame este usuario" o "guarda este usuario".

```js
// El servicio NO sabe que existe SQL:
const usuario = this.#usuarios.buscarPorCi(ci);
```

### 6.2 Inyección de dependencias + Raíz de composición
- **Dónde:** `backend/server.js`.
- **Problema que resuelve:** hoy cada ruta hace `import db from '../db.js'`, así que no se puede cambiar la base de datos ni probar sin ella. Ahora **solo `server.js` crea las piezas y se las pasa** a quien las necesita por el constructor.

```js
// server.js — el ÚNICO lugar que conoce las clases concretas
import db from './db.js';

const usuarios  = new RepositorioUsuariosSqlite(db);
const hasheador = new HasheadorBcrypt();
const tokens    = new TokensJwt();

const servicioAuth   = new ServicioAuth({ usuarios, hasheador, tokens });
const servicioPerfil = new ServicioPerfil({ usuarios });
const sesion         = new MiddlewareSesion(tokens);

app.use('/api/registro', new RegistroController(servicioAuth).router);
app.use('/api/login',    new LoginController(servicioAuth).router);
app.use('/api/perfil',   new PerfilController(servicioPerfil, sesion).router);
```

### 6.3 Adapter (Adaptador)
- **Dónde:** `HasheadorBcrypt` y `TokensJwt` (envuelven `seguridad.js`), `ClienteApi` (envuelve `api.js`), `Sesion` (envuelve `sesion.js`).
- **Problema que resuelve:** esos archivos ya funcionan y tienen responsable. En vez de reescribirlos, una clase pequeña los **adapta** a la forma que espera el diseño (un contrato o una clase).

### 6.4 Strategy (Estrategia) mediante interfaces
- **Dónde:** `Hasheador` ← `HasheadorBcrypt`, `Tokens` ← `TokensJwt`.
- **Problema que resuelve:** si mañana se cambia bcrypt por otra librería, se escribe otra clase que cumple `Hasheador` y **`ServicioAuth` no se toca**.

```js
// contratos/Hasheador.js — JavaScript no tiene "interface": se usa una clase cuyos métodos lanzan error
export class Hasheador {
  async hashear(password)        { throw new Error('No implementado'); }
  async comparar(password, hash) { throw new Error('No implementado'); }
}
```

### 6.5 Herencia + Polimorfismo (perfiles)
- **Dónde:** `Perfil` (abstracta) ← `PerfilTrabajador`, `PerfilEmpleador`.
- **Problema que resuelve:** hoy `perfil.js` tiene `if (rol === 'trabajador') ... else ...`. Ahora **cada perfil sabe actualizarse solo**, y el servicio llama a `perfil.actualizar(datos)` sin preguntar de qué tipo es.

```js
export class Perfil {                                // abstracta
  constructor({ ciudad, genero, edad } = {}) { Object.assign(this, { ciudad, genero, edad }); }
  rol()             { throw new Error('Cada perfil define su rol'); }
  actualizar(datos) { this.ciudad = datos.ciudad.trim(); this.genero = datos.genero; this.edad = datos.edad; }
}

export class PerfilTrabajador extends Perfil {
  rol() { return 'trabajador'; }
  actualizar(datos) {
    super.actualizar(datos);                         // reutiliza lo común
    this.habilidades = datos.habilidades.trim();     // y agrega lo propio
    this.experiencia = datos.experiencia.trim();
  }
}
```

### 6.6 Composición
- **Dónde:** `Usuario` ◆→ `Perfil` (1 o 2 perfiles).
- **Problema que resuelve:** el perfil **es parte** del usuario y no existe sin él, igual que `ON DELETE CASCADE` en `schema.sql`. El usuario controla sus perfiles: `agregarPerfil()`, `obtenerPerfil(rol)`, `tieneRol(rol)`, `roles()`.

### 6.7 Template Method (Método plantilla)
- **Dónde:** `frontend/assets/js/nucleo/Pagina.js`.
- **Problema que resuelve:** las páginas repiten lo mismo (esperar a que cargue el DOM, mostrar mensajes, mostrar/ocultar contraseña). `Pagina.iniciar()` define **los pasos fijos** y cada página hija solo completa su parte.

```js
export class Pagina {
  constructor(api, sesion) { this.api = api; this.sesion = sesion; }
  iniciar() {                                         // la plantilla: siempre igual
    document.addEventListener('DOMContentLoaded', () => this.alCargar());
  }
  alCargar() { throw new Error('Cada página define alCargar()'); }   // el hueco
  mostrarMensaje(texto, tipo = '') { /* código común para mostrar mensajes */ }
  activarMostrarPassword(input, boton) { /* código común de login y registro */ }
}

// login.js
export class PaginaLogin extends Pagina {
  alCargar() { /* el código que hoy está suelto en login.js */ }
}
const sesion = new Sesion();
new PaginaLogin(new ClienteApi(sesion), sesion).iniciar();
```

### 6.8 Facade (Fachada)
- **Dónde:** `ClienteApi`.
- **Problema que resuelve:** las páginas no necesitan saber de `fetch`, cabeceras, JSON ni del token. Solo llaman `this.api.get('/api/perfil')`.

### 6.9 Chain of Responsibility (Cadena de responsabilidad)
- **Dónde:** middleware de Express: `MiddlewareSesion` → `PerfilController`.
- **Problema que resuelve:** la petición pasa primero por `MiddlewareSesion`. Si el token no es válido, la cadena se corta con 401 y **el controlador ni se entera**.

### 6.10 Singleton
- **Dónde:** `backend/db.js` (ya existe hoy).
- **Problema que resuelve:** toda la aplicación comparte **una sola conexión** a `lila.db`.

### 6.11 Observer (modelo de eventos del navegador)

> **Este patrón ya se usa hoy** y no cambia con la reorganización: los mismos observadores pasan a vivir dentro de los métodos de `PaginaLogin`, `PaginaRegistro` y `PaginaPerfil`.

**Definición.** El patrón Observer define una relación de uno a muchos entre objetos. Cuando un objeto (el **sujeto**) cambia de estado o recibe una acción, todos los objetos suscritos a él (los **observadores**) son notificados automáticamente, sin que el sujeto necesite conocerlos.

**Aplicación en LILA.** El FrontEnd de LILA aplica el patrón Observer mediante el modelo de eventos del navegador. Los elementos de la interfaz (formularios, botones, campos de texto y la propia ventana) actúan como **sujetos**. Los scripts de LILA registran **observadores** con `addEventListener`, que el navegador notifica cada vez que ocurre una acción del usuario. En el incremento actual hay alrededor de **48 suscripciones** distribuidas en las páginas del sistema:

| Sujeto (elemento observado) | Evento | Observador (reacción de LILA) | Archivo |
|---|---|---|---|
| Formulario de inicio de sesión | `submit` | Envía carnet y contraseña a `POST /api/login` | `login.js` |
| Formulario de registro | `submit` | Envía los datos a `POST /api/registro` | `registro.js` |
| Formulario del perfil | `submit` | Guarda los cambios con `PUT /api/perfil` | `perfil.js` |
| Campo de experiencia | `input` | Actualiza el contador de caracteres | `perfil.js` |
| Campo de habilidades | `keydown` | Agrega una habilidad al presionar Enter | `perfil.js` |
| Tamaño de pantalla (*media query*) | `change` | Cierra el menú móvil al cambiar de tamaño | `perfil.js` |
| Botón "Mostrar / Ocultar" | `click` | Muestra u oculta la contraseña | `login.js`, `registro.js` |
| Filtros de búsqueda | `input`, `change` | Filtra las ofertas en pantalla | `homeTrabajador.html`, `homeEmpleador.html` |
| Menú del encabezado | `click` | Abre y cierra el menú de navegación | `components.js` |

Además, las pruebas automatizadas de extremo a extremo (`tests/e2e/homeEmpleador.e2e.js`) usan el mismo patrón para observar la página durante la prueba (`page.on('console')`, `page.on('pageerror')`, `page.on('response')`) y detectar errores sin modificar el código de la aplicación.

**Beneficios para el sistema:**
- **Desacoplamiento entre la vista y la lógica.** El HTML no contiene código: no sabe qué ocurre al presionar un botón. La reacción se define por separado en los scripts, lo que respeta la separación entre Vista y Controlador del patrón MVC.
- **Varios observadores por sujeto.** Un mismo elemento puede tener más de una reacción sin que una afecte a la otra. Por ejemplo, el botón "Ingresar" dispara el envío del formulario, y ese envío es observado por la lógica de inicio de sesión.
- **Respuesta asíncrona.** Los observadores se ejecutan solo cuando el usuario actúa, sin consultar el estado constantemente. Esto es necesario para que las solicitudes a la API REST no bloqueen la interfaz.
- **Extensibilidad.** Para añadir un comportamiento nuevo, basta con registrar un nuevo observador, sin modificar los existentes.

**Alcance.** En LILA, la gestión de la lista de observadores y la notificación las provee la plataforma (el navegador, mediante la interfaz `EventTarget`). El código del proyecto define los sujetos que se observan y los observadores que reaccionan. El patrón se limita a la **capa de presentación**: la comunicación entre el cliente y el servidor sigue el modelo de solicitud y respuesta de HTTP, en el que el servidor no notifica al cliente por iniciativa propia.

### Resumen de patrones

| Patrón | Capa | Archivo principal |
|---|---|---|
| Repository | Datos | `RepositorioUsuariosSqlite.js` |
| Inyección de dependencias | Toda la app | `server.js` |
| Adapter | Datos / Presentación | `HasheadorBcrypt.js`, `TokensJwt.js`, `ClienteApi.js`, `Sesion.js` |
| Strategy | Datos | `Hasheador` / `Tokens` y sus implementaciones |
| Herencia + Polimorfismo | Dominio / Presentación | `Perfil.js`, `Pagina.js` |
| Composición | Dominio | `Usuario.js` |
| Template Method | Presentación | `Pagina.js` |
| Facade | Presentación | `ClienteApi.js` |
| Chain of Responsibility | Aplicación | `MiddlewareSesion.js` |
| Singleton | Datos | `db.js` |
| Observer (eventos del navegador) | Presentación | `login.js`, `registro.js`, `perfil.js`, `components.js`, páginas de inicio |

---

## 7. El recorrido de una petición (antes y después)

**Ejemplo: iniciar sesión.**

**Antes** — un solo archivo hace todo:
```
login.html → login.js → fetch POST /api/login → routes/login.js
                                                  (valida + SQL + bcrypt + JWT + respuesta)
```

**Después** — cada clase hace una sola cosa:
```
login.html
  └─► login.js: PaginaLogin.alCargar()             (escucha el formulario)
        └─► ClienteApi.post('/api/login', datos)   (usa pedirApi de api.js)
              │
              ▼  HTTP POST /api/login (JSON)
        LoginController                             (lee req.body, decide 200/400/401)
          └─► ServicioAuth.iniciarSesion(ci, pass)  (la regla: ¿existe? ¿clave correcta?)
                ├─► RepositorioUsuarios.buscarPorCi()  ◄── RepositorioUsuariosSqlite ──► db.js
                ├─► Hasheador.comparar()               ◄── HasheadorBcrypt ──► seguridad.js
                └─► Tokens.crear()                     ◄── TokensJwt ──────► seguridad.js
              │
              ▼  { token, usuario }
        PaginaLogin → Sesion.guardar(token) → redirige a la página de inicio
```

---

## 8. Plan paso a paso

Se avanza **de adentro hacia afuera**: primero lo que no depende de nada (dominio), al final lo que depende de todo (`server.js` y el frontend).

**Reglas para todos los pasos:**
1. Un commit por paso, con mensaje claro (por ejemplo `refactor(oop): paso 1 - dominio`).
2. `npm test` **antes** de cada commit. Si falla, no se hace commit.
3. Para renombrar, usar **siempre** `git mv` (nunca borrar y crear), así se conserva el historial.
4. Hacer `git merge main` seguido para que los conflictos sean pequeños.
5. **Solo mover, no agregar funciones.** Si algo nuevo hace falta, se anota para el siguiente incremento.

---

### Paso 0 — Preparación
- [ ] Hacer los ajustes del diagrama (sección 11) y hacer commit del diagrama y de este plan.
- [ ] Avisar al equipo qué archivos se van a tocar (sección 10).
- [ ] Correr `npm test` y confirmar que pasan los 28 tests (punto de partida).

---

### Paso 1 — Dominio (`backend/dominio/`) 🆕
**Objetivo:** crear los objetos del negocio. No dependen de nada.

| Crear | Contenido | Sale de |
|---|---|---|
| `Perfil.js` | abstracta: `ciudad`, `genero`, `edad`; `rol()`, `actualizar()`, `aJSON()` | campos comunes de `perfiles_trabajador` y `perfiles_empleador` |
| `PerfilTrabajador.js` | `extends Perfil` + `habilidades`, `experiencia` | `routes/perfil.js` (186–204) |
| `PerfilEmpleador.js` | `extends Perfil` | `routes/perfil.js` (205–216) |
| `Usuario.js` | `id`, `nombre`, `ci`, `telefono`, `passwordHash`, `estadoVerificacion`, `perfiles`; `roles()`, `tieneRol()`, `agregarPerfil()`, `obtenerPerfil()` | columnas de `usuarios` + `usuario_roles` |

- [ ] Nadie usa estas clases todavía, así que **no se puede romper nada**.
- [ ] `npm test` → 28 ✅

**Arquitectura:** Modelo (MVC), capa de Aplicación. **Patrones:** Herencia, Polimorfismo, Composición. **Esfuerzo:** bajo.

---

### Paso 2 — Contratos (`backend/contratos/`) 🆕
| Crear | Métodos que promete |
|---|---|
| `RepositorioUsuarios.js` | `buscarPorId(id)`, `buscarPorCi(ci)`, `existe(ci, telefono)`, `guardar(usuario)` |
| `Hasheador.js` | `hashear(password)`, `comparar(password, hash)` |
| `Tokens.js` | `crear(usuarioId)`, `verificar(token)` |

- [ ] Cada método lanza `new Error('No implementado')`.
- [ ] `npm test` → 28 ✅

**Arquitectura:** Capa de Datos (la frontera). **Patrones:** Strategy, base de la Inversión de dependencias. **Esfuerzo:** bajo.

---

### Paso 3 — Infraestructura (`backend/infraestructura/`) 🆕 🔌
| Crear | Cómo |
|---|---|
| `HasheadorBcrypt.js` | Adaptador de `seguridad.js` (sección 5-D) |
| `TokensJwt.js` | Adaptador de `seguridad.js` (sección 5-D) |
| `RepositorioUsuariosSqlite.js` | **Copiar** todas las sentencias SQL de las 3 rutas (secciones 5-A, 5-B, 5-C). Recibe `db` por el constructor. Convierte filas en objetos `Usuario`/`Perfil*` y al revés. |

- [ ] En `seguridad.js`: agregar `verificarToken(token)` y hacer que `requiereSesion` la use por dentro (mismo comportamiento).
- [ ] Las rutas todavía no cambian: el SQL queda **copiado**, no movido, hasta el paso 5.
- [ ] `npm test` → 28 ✅

**Arquitectura:** Capa de Datos / acceso a datos. **Patrones:** Repository, Adapter, Strategy. **Esfuerzo:** medio (es el paso con más SQL).

---

### Paso 4 — Servicios (`backend/servicios/`) 🆕
| Crear | Métodos | Reglas que se mueven aquí |
|---|---|---|
| `ServicioAuth.js` | `registrar(datos)`, `iniciarSesion(ci, password)` | validar con `validarRegistro`/`validarLogin`; CI o teléfono repetido → 409; contraseña incorrecta → 401; crear el usuario con su primer perfil |
| `ServicioPerfil.js` | `ver(usuarioId, rol)`, `actualizar(usuarioId, rol, datos)`, `agregarRol(usuarioId, rol)` | validar con `validarPerfil`; no repetir un rol; solo ver/editar perfiles que el usuario tiene (403) |

- [ ] El constructor recibe sus dependencias: `constructor({ usuarios, hasheador, tokens })`.
- [ ] Cuando una regla falla, el servicio lanza un error con su código: `throw Object.assign(new Error('El CI o el teléfono ya están registrados.'), { estado: 409 })`.
- [ ] **Prohibido** importar Express, `db.js` o `seguridad.js` aquí.
- [ ] (Opcional) Crear `tests/servicios/ServicioAuth.test.js` con un repositorio falso en memoria.
- [ ] `npm test` → 28 ✅

**Arquitectura:** Capa de Aplicación (casos de uso). **Patrones:** Inyección de dependencias, Inversión de dependencias. **Esfuerzo:** medio.

---

### Paso 5 — Controladores (`backend/controladores/`) 🔀
**Objetivo:** renombrar las rutas y dejarles **solo** la parte HTTP.

```bash
mkdir backend/controladores
git mv backend/routes/registro.js backend/controladores/registroController.js
git mv backend/routes/login.js    backend/controladores/loginController.js
git mv backend/routes/perfil.js   backend/controladores/perfilController.js
```

| Archivo | Clase | Rutas | Qué queda dentro |
|---|---|---|---|
| `registroController.js` | `RegistroController` | `POST /api/registro` | leer `req.body` → `ServicioAuth.registrar()` → 201 o error |
| `loginController.js` | `LoginController` | `POST /api/login` | leer `req.body` → `ServicioAuth.iniciarSesion()` → 200 o error |
| `perfilController.js` | `PerfilController` | `GET`, `PUT /api/perfil`, `POST /api/perfil/roles` | `Cache-Control`, `MiddlewareSesion`, llamar a `ServicioPerfil` → responder |
| `MiddlewareSesion.js` 🆕 | `MiddlewareSesion` | — | lee `Authorization: Bearer ...`, llama a `tokens.verificar()`, guarda `req.usuarioId` o responde 401 |

- [ ] Borrar de los controladores todo el SQL y las reglas (ya están en el repositorio y los servicios).
- [ ] Cada controlador expone `this.router` (un `express.Router()`).
- [ ] Las respuestas deben ser **idénticas** a las de hoy (mismos campos, códigos y mensajes). Revisar `docs/API.md`.

**Arquitectura:** Controlador (MVC) + API REST (cliente-servidor). **Patrones:** Chain of Responsibility. **Esfuerzo:** medio.

---

### Paso 6 — App (`backend/server.js`) y tests ✏️
**Objetivo:** convertir `server.js` en la **raíz de composición**.

- [ ] Crear las piezas y conectarlas (código de la sección 6.2).
- [ ] Reemplazar los imports de `./routes/*.js` por los controladores.
- [ ] Mantener igual: `validarConfiguracionJwt()`, archivos estáticos, redirecciones, manejo de 404 y de errores, `export default app`.
- [ ] Actualizar `tests/registro.test.js`, `login.test.js` y `perfil.test.js`: hoy importan `../backend/routes/*.js`; pasan a importar `app` desde `../backend/server.js` (como ya hace `server.test.js`) o a montar el controlador correspondiente.
- [ ] `npm test` → 28 ✅ y probar a mano con `npm start`: registro, login, ver perfil, editar perfil y agregar rol.

**Arquitectura:** Monolito (un solo punto de arranque). **Patrones:** Raíz de composición, Inyección de dependencias. **Esfuerzo:** medio.

---

### Paso 7 — Revisión del backend
- [ ] Confirmar que la carpeta `backend/routes/` quedó vacía y borrarla.
- [ ] Revisar que ningún servicio ni controlador importe `db.js` o `seguridad.js`:
  `grep -rn "db.js\|seguridad.js" backend/servicios backend/controladores`
- [ ] Decidir con — qué hacer con `requiereSesion` en `seguridad.js` (la app ya no la usa).
- [ ] `npm test` → 28 ✅

**Esfuerzo:** bajo.

---

### Paso 8 — Frontend ✏️ 🔌
**Objetivo:** las páginas pasan a ser clases, **sin cambiar el HTML**.

| Archivo | Acción | Detalle |
|---|---|---|
| `sesion.js` | agregar 2 funciones | `guardarRolActivo(rol)`, `obtenerRolActivo()` (sección 5-G) |
| `nucleo/Sesion.js` 🆕 | adaptador de `sesion.js` | `guardar()`, `obtener()`, `cerrar()`, `guardarRolActivo()`, `obtenerRolActivo()` |
| `nucleo/ClienteApi.js` 🆕 | adaptador de `api.js` | `get()`, `post()`, `put()` (sección 5-F) |
| `nucleo/Pagina.js` 🆕 | clase abstracta | `iniciar()`, `alCargar()`, `mostrarMensaje()`, `activarMostrarPassword()` |
| `login.js` | convertir en `PaginaLogin` | sección 5-H |
| `registro.js` | convertir en `PaginaRegistro` | sección 5-I |
| `perfil.js` | convertir en `PaginaPerfil` (2 commits) | sección 5-J |

- [ ] La última línea de cada página la crea e inicia (`new PaginaLogin(...).iniciar()`), así `login.html`, `register.html` y `perfil.html` **no cambian**.
- [ ] `api.js`, `components.js`, `ofertas.js` y los HTML de inicio y ofertas **no se tocan**.
- [ ] `npm test` → 28 ✅, `npm run test:e2e` ✅ y probar a mano en el navegador.

**Arquitectura:** Capa de Presentación; Controlador del navegador (MVC); Cliente (cliente-servidor). **Patrones:** Template Method, Facade, Adapter, Herencia. **Esfuerzo:** medio-alto (`perfil.js` tiene 659 líneas).

> **Si se acaba el tiempo:** el paso 8 puede esperar. El backend queda completo y la app sigue funcionando igual. En el diagrama, las clases del frontend se marcarían `«futuro»`.

---

### Paso 9 — Cierre
- [ ] Actualizar `README.md` (estructura de carpetas).
- [ ] Revisar que el diagrama de clases coincida con el código, clase por clase.
- [ ] Abrir un Pull Request de `feature/oop` hacia `main` y pedir revisión al equipo.

---

## 9. Cómo sabemos que terminamos (Definición de "hecho")

- [ ] Los 28 tests pasan y el test E2E pasa.
- [ ] Registro, login, ver perfil, editar perfil, agregar rol y cerrar sesión funcionan igual que antes en el navegador.
- [ ] Ningún archivo de `servicios/` ni de `controladores/` importa `db.js`, `seguridad.js` o `infraestructura/`.
- [ ] Ningún controlador contiene SQL.
- [ ] Solo `sesion.js` usa `localStorage` para el token y el rol activo (`ofertas.js` lo sigue usando para las ofertas, hasta el incremento futuro).
- [ ] No queda la carpeta `backend/routes/`.
- [ ] Cada clase del diagrama (excepto las `«futuro»`) existe en el código con el mismo nombre.

---

## 10. Riesgos y coordinación con el equipo

### Riesgos

| Riesgo | Cómo se evita |
|---|---|
| Romper una respuesta de la API sin darse cuenta | Los tests HTTP ya comprueban códigos y mensajes. No cambiar `docs/API.md`. |
| Conflictos con compañeros que editan los mismos archivos | Avisar antes (tabla de abajo) y hacer `git merge main` seguido. |
| Perder el historial de quién escribió cada parte | Usar `git mv` para renombrar. No se borra ningún archivo. |
| Que `perfil.js` (frontend) sea demasiado grande para convertirlo de una vez | Dos commits: primero mostrar y cargar, luego guardar y menú. |
| Agregar funciones nuevas "de paso" | Regla de la Opción B: **solo reorganizar**. |

### Archivos que se tocan y a quién avisar

| Archivo | Responsable (según el encabezado) | Qué le pasa | Paso |
|---|---|---|---|
| `backend/routes/registro.js` | Natalia Arze | Se renombra a `registroController.js` y se reparte | 5 |
| `backend/routes/login.js` | — | Se renombra a `loginController.js` y se reparte | 5 |
| `backend/routes/perfil.js` | — | Se renombra a `perfilController.js` y se reparte | 5 |
| `backend/seguridad.js` | — | Se agrega `verificarToken()` | 3 |
| `backend/server.js` | — | Raíz de composición | 6 |
| `frontend/assets/js/login.js` | Natalia Arze | Pasa a ser `PaginaLogin` | 8 |
| `frontend/assets/js/registro.js` | — | Pasa a ser `PaginaRegistro` | 8 |
| `frontend/assets/js/perfil.js` | — | Pasa a ser `PaginaPerfil` | 8 |
| `frontend/assets/js/sesion.js` | — | Se agregan 2 funciones | 8 |
| `backend/db.js`, `database/*.sql` | Natalia Arze | **No se tocan** | — |

> Completar los "—" con el equipo. Mientras un archivo está en migración, **solo una persona** lo edita.

---

## 11. Ajustes al diagrama de clases

| # | Cambio | Por qué |
|---|---|---|
| 1 | `AuthController` se divide en **`RegistroController`** y **`LoginController`**. Los dos tienen una asociación → `ServicioAuth`; `App` ⇢ los dos ("monta"); `ClienteApi` ⇢ los dos ("HTTP"). | Cada archivo conserva su nombre + `Controller` |
| 2 | Pintar en gris punteado con `«futuro»`: `Oferta`, `PerfilEmpleador.publicarOferta()`, `RepositorioOfertas`, `RepositorioOfertasSqlite`, `ServicioOfertas`, `OfertasController`, `PaginaOfertas` y sus flechas | Las ofertas son el incremento futuro |
| 3 | Quitar `- secreto : string` de `TokensJwt` | El secreto lo sigue leyendo `seguridad.js` |
| 4 | `Sesion`: agregar `+ guardarRolActivo(rol)` y `+ obtenerRolActivo() string` | Para que solo `Sesion` toque `localStorage` |
| 5 | `Pagina`: agregar `# sesion : Sesion`, `+ activarMostrarPassword()` y una **asociación** `Pagina → Sesion` | Las páginas guardan el token, leen el rol y cierran sesión |
| 6 | Agregar a la leyenda: "Gris punteado = incremento futuro" | — |
| 7 *(opcional)* | Cajas `«módulo»` para `seguridad.js`, `api.js` y `sesion.js`, con flechas punteadas "usa" desde `HasheadorBcrypt`, `TokensJwt`, `ClienteApi` y `Sesion` | Muestra el patrón Adapter y por qué esos archivos siguen existiendo |

---

## 12. Alternativas que se consideraron

| Alternativa | Por qué no se eligió |
|---|---|
| **Plan completo:** mover todo a carpetas nuevas y repartir `seguridad.js`, `api.js` y `sesion.js` en clases propias | Más archivos de compañeros tocados y más tests que editar, sin ninguna ventaja funcional |
| **Solo backend:** igual que la Opción B, sin convertir las páginas del frontend | Válida si falta tiempo (el paso 8 se puede cortar), pero se pierden el Template Method y el Facade en el diagrama |
| **Mínima:** sacar el SQL a funciones sueltas, sin clases | Cumple el 5.2.2, pero **no es OOP** y el diagrama de clases quedaría como una simple propuesta |
| **Dejar las rutas tal como están** | Las clases nuevas no tendrían uso: se caería ~70% del backend del diagrama |

---

## 13. Glosario rápido

| Término | Significado sencillo |
|---|---|
| **Clase abstracta** | Un molde que no se usa directamente; solo sirve para que otras clases hereden de él (`Perfil`, `Pagina`). |
| **Contrato / interfaz** | Una lista de métodos que una clase **promete** tener (`Hasheador` promete `hashear` y `comparar`). |
| **Implementar** | Cumplir un contrato (`HasheadorBcrypt` implementa `Hasheador`). |
| **Adaptador** | Una clase pequeña que envuelve un archivo que ya existe para que encaje en el diseño. |
| **Inyectar** | Pasarle a una clase lo que necesita por su constructor, en vez de que ella lo importe. |
| **Raíz de composición** | El único lugar donde se crean y conectan todas las piezas (`server.js`). |
| **Repositorio** | La clase que guarda y busca objetos en la base de datos; el único lugar con SQL. |
| **Servicio** | La clase que aplica las reglas de un caso de uso (registrarse, iniciar sesión). |
| **Controlador** | La clase que traduce entre HTTP y el servicio. |
| **Dominio** | Los objetos del negocio (`Usuario`, `Perfil`) y sus reglas, sin nada técnico. |
| **`git mv`** | Renombrar o mover un archivo sin que Git pierda su historial. |
| **Asociación** | A **guarda** a B en una propiedad (línea continua, flecha abierta). |
| **Dependencia** | A **usa** a B un momento (línea punteada, flecha abierta). |
| **Composición** | B **es parte** de A y muere con A (rombo lleno). |
| **Herencia / Implementación** | A **es un tipo de** B, o **cumple** el contrato de B (triángulo vacío). |

---

## 14. Limpieza de archivos sin uso (después del paso 9)

Al terminar la refactorización se buscaron archivos que **ningún otro archivo del repositorio usa**. Es una excepción a la regla "no se borra ningún archivo" de la sección 0. Esa regla protege el código que se reorganiza; estos archivos no forman parte de la refactorización y estaban sobrando.

### Cómo se comprobó

Se revisaron todos los archivos que sigue Git (`git ls-files`):
- imports de JavaScript, incluidos los imports dinámicos de los tests;
- etiquetas `<script>`, `<link>` e `<img>` del HTML;
- rutas que `components.js` arma como texto (solo carga `headerauth.html` y `headerCambio.html`);
- búsqueda sin distinguir mayúsculas, porque en Windows `Header.html` y `header.html` son el mismo archivo.

Ningún archivo menciona los tres archivos borrados.

### Archivos borrados (`git rm`)

| Archivo | Qué era | Por qué se borró |
|---|---|---|
| `frontend/assets/css/components/navbarempleador.css` | Estilos de un navbar antiguo para el empleador | Ningún HTML lo carga, ni siquiera `headerempleador.html` |
| `frontend/assets/css/pages/empl_trab.css` | Estilos antiguos de las páginas de empleador y trabajador | Ningún HTML lo carga |
| `frontend/components/headerempleador.html` | Header antiguo del empleador | `components.js` usa `headerauth.html` y `headerCambio.html`; ninguna página lo carga |

Después de borrarlos: `npm test` 31/31 ✅.

### Se encontraron sin uso pero se conservan (decisión del equipo)

| Archivo o código | Por qué se conserva |
|---|---|
| `frontend/images/LILA-logotipo-oficial.jpeg` y `.png`, `Libreria Labora.jpeg`, `Lila transparent logo.jpeg` | La web no las usa, pero pueden ser archivos de marca del proyecto |
| `frontend/website/perfilPúblico.html` | Página provisional "en construcción" para un incremento futuro |
| `requiereSesion()` en `backend/seguridad.js` | Nadie la importa (la app usa `MiddlewareSesion`). Se decide con — |
| `export { app };` en `backend/server.js` | Nadie lo importa (todos usan `export default app`). Es una sola línea |

> Si se recuperan del historial: `git checkout <commit-anterior> -- <ruta del archivo>`.
