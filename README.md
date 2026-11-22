# LILA — Librería Laboral

## Integrantes

- Natalia Arze Torrez
- Susan Laime Lucero
- Sara Revollo Mérida
- Joaquin Peredo

## ¿Qué es LILA?

**LILA conecta, de forma ágil, simple y confiable, a personas que buscan trabajo con empleadores que necesitan talento en Bolivia.**

- Reúne en un solo lugar trabajos formales, informales, temporales, por proyecto o por servicio, que hoy están dispersos en grupos y canales informales.
- Una misma cuenta puede ser **trabajador**, **empleador** o ambos.
- Contraseñas cifradas, sesión segura y perfil propio para cada rol.
- Este incremento cubre: **registro → inicio de sesión → ver y editar el perfil**.

## Arquitectura

- **Monolítica modular:** todo corre en un solo proceso de Node.js. `backend/server.js` arranca, crea las piezas, entrega el frontend, atiende la API y usa SQLite dentro del mismo proceso.
- **Cliente-servidor (API REST + JSON):** el navegador (`ClienteApi`) pide datos con `fetch` a `/api/registro`, `/api/login` y `/api/perfil`. El servidor responde en JSON, y la sesión viaja como token JWT (`Authorization: Bearer`).
- **Tres capas:** presentación (`frontend/` y `backend/controladores/`), aplicación (`backend/servicios/`, `backend/dominio/`, `backend/contratos/`) y datos (`backend/infraestructura/`, `backend/db.js`, `database/`).
- **MVC:** la Vista son las páginas HTML y las clases `Pagina*`; el Controlador son los `*Controller`; el Modelo son los servicios, el dominio y el repositorio.

## Tech stack

- **Backend:** Node.js 22.13+ (ES Modules) con Express 5
- **Base de datos:** SQLite incorporado en Node (`node:sqlite`); no se instala ningún motor aparte
- **Seguridad:** bcryptjs (cifrado de contraseñas) y jsonwebtoken (sesión con JWT de 8 horas)
- **Frontend:** HTML, CSS y JavaScript sin frameworks, organizado en clases
- **Pruebas:** `node:test` (incluido en Node) y playwright-core para las pruebas en el navegador

## Getting started

### Prerrequisitos

- [Node.js](https://nodejs.org/) **22.13 o superior** (incluye `npm`)
- Git
- Chrome o Edge instalado (solo para `npm run test:e2e`)

### Instalación

```bash
git clone https://github.com/SusanLaime/LILA_Project.git
cd LILA_Project
npm install
```

Crea un archivo `.env` en la raíz del proyecto:

```
PORT=3000                   # puerto del servidor (opcional, por defecto 3000)
DB_PATH=database/lila.db    # archivo SQLite (opcional, se crea al arrancar)
JWT_SECRET=cambia-esta-clave  # obligatorio: sin esta clave el servidor no arranca
```

### Comandos

```bash
npm start          # Arranca el servidor con .env; abrir http://localhost:3000
npm run dev        # Igual que start, pero reinicia solo al guardar cambios
npm test           # Corre todas las pruebas automatizadas de tests/ con una base en memoria
npm run test:e2e   # Abre las páginas reales en Chrome o Edge y prueba el recorrido
```

## Estructura del repositorio

El repositorio está dividido en tres partes: `backend/`, el servidor en Node.js y Express; `frontend/`, las páginas que ve el usuario; y `database/` con `tests/`, la base SQLite y las pruebas. Dentro de `backend/`, cada carpeta corresponde a una capa de la arquitectura: los controladores reciben HTTP, los servicios aplican las reglas, el dominio guarda los objetos del negocio, los contratos definen las interfaces y la infraestructura habla con SQLite, bcrypt y JWT. `server.js` es el único archivo que une todo.

```
backend/
├── server.js          Punto de entrada: crea, inyecta y monta todas las piezas
├── db.js              Conexión única a SQLite
├── seguridad.js       bcrypt (contraseñas) y JWT (tokens)
├── validacion.js      Reglas de registro, login y perfil
├── controladores/     RegistroController, LoginController, PerfilController, MiddlewareSesion
├── servicios/         ServicioAuth, ServicioPerfil, errores.js
├── dominio/           Usuario, Perfil, PerfilTrabajador, PerfilEmpleador
├── contratos/         RepositorioUsuarios, Hasheador, Tokens
└── infraestructura/   RepositorioUsuariosSqlite, HasheadorBcrypt, TokensJwt
database/              Esquema y datos de prueba
frontend/
├── auth/, website/    Páginas HTML
├── components/        Navbar y footer
└── assets/
    ├── css/           Estilos
    └── js/
        ├── nucleo/                          Pagina, ClienteApi, Sesion
        ├── login.js, registro.js, perfil.js PaginaLogin, PaginaRegistro, PaginaPerfil
        └── api.js, sesion.js, components.js, ofertas.js
tests/                 Pruebas automatizadas (npm test)
docs/                  API.md, plan de implementación y diagrama de clases
```

## Diagrama de clases

El diagrama de clases ([`docs/LILA diagrama-clases-oop REPO V5.drawio`](docs/LILA%20diagrama-clases-oop%20REPO%20V5.drawio), pestaña *LILA - Clases OOP*) es sencillo y muestra cómo LILA aplica la programación orientada a objetos: clases con una sola responsabilidad, herencia, composición e interfaces. Está dividido en seis grupos, que coinciden con las carpetas del código: **Frontend**, **Controladores HTTP**, **Servicios**, **Dominio**, **Contratos** y **Datos e infraestructura**. Las clases en gris punteado («futuro») son del siguiente incremento (ofertas). Abajo se resume en una línea qué hace cada clase y cuáles son las relaciones clave para entender el diagrama de una pasada.

**Relaciones clave**
- **Usuario ◆— Perfil (composición):** un `Usuario` tiene 1 o 2 perfiles; sin el usuario, el perfil no existe.
- **PerfilTrabajador y PerfilEmpleador ◁— Perfil (herencia):** los dos son un `Perfil`, y el servicio los trata igual (polimorfismo).
- **Controlador → Servicio:** `RegistroController` y `LoginController` usan `ServicioAuth`; `PerfilController` usa `ServicioPerfil` y pasa antes por `MiddlewareSesion`.
- **Servicio → Contrato ◁┄ Infraestructura (implementa):** los servicios dependen de las interfaces (`RepositorioUsuarios`, `Hasheador`, `Tokens`), y `RepositorioUsuariosSqlite`, `HasheadorBcrypt` y `TokensJwt` las implementan.
- **server.js ┄> todo (crea e inyecta / monta):** `server.js` crea las clases concretas, se las pasa a los servicios y monta los controladores.
- **Pagina → ClienteApi → Sesion → (HTTP) Controladores:** cada página usa `ClienteApi`, que envía el token de `Sesion` a la API.

**Frontend**
- `Pagina` (abstracta): base de las páginas; `iniciar()` llama a `alCargar()` y muestra mensajes.
- `PaginaLogin`: formulario de inicio de sesión; guarda el token.
- `PaginaRegistro`: formulario de registro y modo "agregar rol".
- `PaginaPerfil`: carga, muestra y guarda el perfil.
- `ClienteApi`: `get`, `post` y `put` a la API con el token de `Sesion`.
- `Sesion`: guarda, lee y borra el token y el rol activo en el navegador.

**Controladores HTTP**
- `server.js` (módulo): crea las clases concretas, las inyecta y monta los controladores.
- `RegistroController`: `POST /api/registro` → `ServicioAuth.registrar()`.
- `LoginController`: `POST /api/login` → `ServicioAuth.iniciarSesion()`.
- `PerfilController`: `GET`/`PUT /api/perfil` y `POST /api/perfil/roles` → `ServicioPerfil`.
- `MiddlewareSesion`: revisa el token antes de las rutas de perfil y guarda `req.usuarioId`.

**Servicios**
- `ServicioAuth`: registra usuarios (`registrar`) e inicia sesión (`iniciarSesion`).
- `ServicioPerfil`: ve, actualiza y agrega un rol al perfil.

**Dominio**
- `Usuario`: datos de la cuenta y sus perfiles; agrega y busca un perfil por rol.
- `Perfil` (abstracta): datos comunes (ciudad, género, edad); `actualizar()` y `aJSON()`.
- `PerfilTrabajador`: hereda de `Perfil` y agrega habilidades y experiencia.
- `PerfilEmpleador`: hereda de `Perfil` con el rol empleador.

**Contratos**
- `RepositorioUsuarios`: define `buscarPorId`, `buscarPorCi`, `existe` y `guardar`.
- `Hasheador`: define `hashear` y `comparar` contraseñas.
- `Tokens`: define `crear` y `verificar` el token de sesión.

**Datos e infraestructura**
- `RepositorioUsuariosSqlite`: implementa `RepositorioUsuarios`; es la única clase con SQL.
- `HasheadorBcrypt`: implementa `Hasheador` con bcrypt.
- `TokensJwt`: implementa `Tokens` con JWT (8 horas).

## Patrones de diseño

Los patrones de diseño están marcados en la pestaña *Design Patterns* del mismo drawio. Cada patrón aparece como un óvalo unido a las clases que participan en él, sin cambiar el orden del diagrama de clases. Se usan siete patrones, y cada uno resuelve un problema concreto del código: separar el SQL, aislar las librerías externas, cambiar de tecnología sin tocar los servicios y evitar repetir código en el frontend.

- **Repository:** `RepositorioUsuariosSqlite` concentra todo el acceso a SQLite detrás de `RepositorioUsuarios`.
- **Adapter:** `HasheadorBcrypt`, `TokensJwt` y `Sesion` adaptan bcrypt, JWT y `localStorage` a una interfaz propia.
- **Strategy:** los servicios dependen de `RepositorioUsuarios`, `Hasheador` y `Tokens`, no de una tecnología concreta.
- **Dependency Injection:** solo `server.js` crea las clases concretas y se las pasa por el constructor.
- **Template Method:** `Pagina.iniciar()` define los pasos y cada página implementa `alCargar()`.
- **Facade:** `ClienteApi` oculta `fetch`, el token y el manejo de errores detrás de `get`, `post` y `put`.
- **Chain of Responsibility:** `MiddlewareSesion` → `PerfilController`; cada eslabón atiende la petición o la corta con `401`.
