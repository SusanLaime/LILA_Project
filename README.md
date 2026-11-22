# LILA — Librería Laboral

Plataforma web que conecta a personas que buscan trabajo con empleadores en Bolivia.

## Índice

1. [¿Qué es LILA?](#qué-es-lila)
2. [Tecnologías](#tecnologías)
3. [Cómo ejecutarlo](#cómo-ejecutarlo)
4. [Estructura del proyecto](#estructura-del-proyecto)
5. [Arquitectura](#arquitectura)
6. [Diseño orientado a objetos](#diseño-orientado-a-objetos)
7. [Patrones de diseño](#patrones-de-diseño)
8. [Equipo](#equipo)
9. [Licencia](#licencia)

## ¿Qué es LILA?

**LILA conecta, de forma ágil, simple y confiable, a personas que buscan trabajo con empleadores que necesitan talento en Bolivia.**

- Reúne en un solo lugar trabajos formales, informales, temporales, por proyecto o por servicio, que hoy están dispersos en grupos y canales informales.
- Una misma cuenta puede ser **trabajador**, **empleador** o ambos.
- Contraseñas cifradas, sesión segura y perfil propio para cada rol.
- Este incremento cubre: **registro → inicio de sesión → ver y editar el perfil**.

## Tecnologías

- **Backend:** Node.js 22.13+ (ES Modules) con Express 5
- **Base de datos:** SQLite incorporado en Node (`node:sqlite`); no se instala ningún motor aparte
- **Seguridad:** bcryptjs (cifrado de contraseñas) y jsonwebtoken (sesión con JWT de 8 horas)
- **Frontend:** HTML, CSS y JavaScript sin frameworks, organizado en clases
- **Pruebas:** `node:test` (incluido en Node) y playwright-core para las pruebas en el navegador

## Cómo ejecutarlo

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
npm test           # Corre todas las pruebas automatizadas con una base en memoria
npm run test:e2e   # Abre las páginas reales en Chrome o Edge y prueba el recorrido
```

## Estructura del proyecto

```
LILA_Project/
├── backend/
│   ├── contratos/
│   ├── controladores/
│   ├── dominio/
│   ├── infraestructura/
│   ├── servicios/
│   ├── db.js
│   ├── seguridad.js
│   ├── server.js
│   └── validacion.js
├── database/
├── docs/
├── frontend/
│   ├── assets/
│   ├── auth/
│   ├── components/
│   ├── images/
│   └── website/
├── tests/
└── README.md
```

- **backend/**: el servidor que recibe las peticiones, aplica las reglas del negocio y guarda los datos.
- **database/**: la estructura de las tablas y los datos de prueba.
- **docs/**: la documentación del proyecto.
- **frontend/**: las pantallas, estilos y lógica que el usuario ve y usa en el navegador.
- **tests/**: las pruebas automáticas que revisan que todo funcione.
- **README.md**: este documento, con el resumen del proyecto.

En la raíz también hay archivos secundarios. `package.json` define los comandos (`npm start`, `npm test`) y las librerías que usa la app. `package-lock.json` guarda la versión exacta de cada librería para que todo el equipo instale lo mismo. `.gitignore` indica qué archivos no se suben al repositorio, y `LICENSE` contiene la licencia del proyecto.

## Arquitectura

LILA combina cuatro ideas de arquitectura, y cada una responde a una pregunta distinta:

- **¿Cómo se despliega? Monolítica modular.** Todo el sistema funciona como una sola aplicación, con una sola base de datos. Es más simple de construir, probar y poner en marcha que varios servicios separados. Por dentro, el código está dividido en módulos con responsabilidades claras, lo que permite repartir el trabajo entre el equipo.
- **¿Cómo se comunican sus partes? Cliente-servidor con API REST.** El navegador (cliente) pide información y el servidor la procesa y responde. Cada recurso tiene una dirección, cada acción usa un método HTTP y los datos viajan en formato JSON. Toda la lógica sensible se ejecuta en el servidor, porque lo que envía el cliente no se considera confiable.
- **¿Cómo se ordena el código? Tres capas.** La **presentación** muestra la información y recibe las acciones del usuario. La **aplicación** contiene las reglas del negocio. Los **datos** guardan y recuperan la información. Cada capa solo conversa con la de al lado.
- **¿Cómo se separan responsabilidades? MVC.** La **Vista** es lo que el usuario ve, el **Controlador** recibe sus acciones y decide qué hacer, y el **Modelo** representa los datos y sus reglas. Así, cambiar el diseño de una pantalla no obliga a cambiar la lógica, y al revés.

Además, el sistema aplica **inversión de dependencias**: las reglas del negocio no dependen de herramientas concretas (la base de datos, la librería de cifrado o la de tokens), sino de **contratos** que esas herramientas cumplen. Si mañana se cambia una tecnología, las reglas no se tocan.

## Diseño orientado a objetos

El sistema está modelado con **programación orientada a objetos**, siguiendo cuatro principios:

- **Una responsabilidad por clase:** cada clase tiene un solo motivo para cambiar. La que atiende peticiones no guarda datos, y la que guarda datos no decide reglas.
- **Herencia y polimorfismo:** los perfiles de trabajador y de empleador comparten una base común y cada uno agrega lo suyo. El resto del sistema los trata igual, sin preguntar de qué tipo son. Lo mismo ocurre con las páginas del navegador.
- **Composición:** un usuario está formado por uno o dos perfiles. Un perfil no existe sin su usuario.
- **Abstracción:** las partes del sistema se comunican mediante contratos (interfaces), no mediante detalles técnicos. Así, cada pieza puede cambiar o probarse por separado.

El diagrama de clases está en la documentación del proyecto. Las clases marcadas como «futuro» corresponden al siguiente incremento: la publicación de ofertas.

## Patrones de diseño

LILA aplica 12 patrones y técnicas de diseño que se detallan a continuación:
### Patrones de arquitectura

1. **Repository:** `RepositorioUsuariosSqlite` concentra todo el SQL de usuarios y perfiles, y los servicios solo le piden buscar o guardar sin saber que debajo hay SQLite.
2. **Inyección de dependencias:** `server.js` crea todas las piezas concretas y se las pasa a cada clase por su constructor, en vez de que cada una las cree.

### Principios de orientación a objetos

3. **Herencia:** `PerfilTrabajador` y `PerfilEmpleador` heredan de la clase abstracta `Perfil`, y las páginas del navegador heredan de `Pagina`.
4. **Polimorfismo:** `ServicioPerfil` llama a `actualizar(datos)` sobre cualquier perfil y cada tipo decide qué campos cambiar.
5. **Composición:** un `Usuario` contiene uno o dos perfiles (uno por rol), así una persona puede ser trabajador y empleador con una sola cuenta.

### Patrones clásicos

6. **Adapter:** `HasheadorBcrypt` y `TokensJwt` adaptan las funciones de `seguridad.js` a los contratos del sistema, y `Sesion` y `ClienteApi` hacen lo mismo en el navegador.
7. **Strategy:** `ServicioAuth` usa los contratos `Hasheador` y `Tokens`, hoy con una sola implementación cada uno (bcrypt y JWT), que podría cambiarse sin tocar las reglas del negocio.
8. **Template Method:** `Pagina.iniciar()` define cómo arranca toda página y cada página hija solo completa `alCargar()`.
9. **Facade:** `ClienteApi` ofrece a las páginas `get`, `post` y `put`, y oculta el token, el formato JSON y el manejo de errores de conexión.
10. **Chain of Responsibility:** en `/api/perfil`, el middleware de Express `MiddlewareSesion` revisa el token y corta con 401 o deja pasar la petición al controlador.
11. **Singleton (a nivel de módulo):** `db.js` abre una única conexión a SQLite y la exporta para que todo el backend la comparta.
12. **Observer:** las páginas se suscriben con `addEventListener` a los eventos del navegador (clics, envíos, cambios) y reaccionan cuando ocurren.

## Equipo

- Natalia Arze Torrez
- Susan Laime Lucero
- Sara Revollo Mérida
- Joaquin Peredo

## Licencia

Este proyecto se distribuye bajo la licencia Apache 2.0. Consulta el archivo [LICENSE](LICENSE).
