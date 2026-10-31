# LILA — Librería Laboral

**Plataforma web de trabajos ocasionales en Bolivia.**

> **Primer Parcial — Primer incremento funcional.**
> Este repositorio contiene **solo** el primer recorrido del MVP:
> **página de inicio → crear cuenta (trabajador o empleador) → validación → guardar en la base de datos → iniciar sesión → ver y editar el perfil.**

<!-- Coordinación del README: Susan Laime. Cada integrante completa SUS filas y los TODO con su nombre. -->

## Equipo y responsabilidades

Cada persona se encarga de **una pantalla y del backend que está detrás de ella**.
Cada archivo indica su dueña o dueño en la primera línea (`DUEÑA/O: ...`).
**Solo se editan los archivos propios.** Si necesitas un cambio en un archivo de otra persona, pídeselo.

| Integrante | Frontend | Backend | Pruebas |
|---|---|---|---|
| **Susan Laime** | **Página de inicio (Home):** `frontend/index.html`, `css/pages/home.css`. **Estilos globales:** `css/base/reset.css`, `css/base/typography.css`, `css/utilities/responsive.css` | `backend/server.js`, `backend/validacion.js` | P-09 a P-11 (manuales) |
| **Natalia Arze** | **Inicio de sesión y registro (trabajador o empleador):** `auth/login.html`, `auth/register.html`, `js/login.js`, `js/registro.js`, `css/pages/login.css`, `css/components/forms.css` | **Base de datos:** `database/schema.sql`, `database/seed.sql`, `backend/db.js`. **Registro:** `backend/routes/registro.js` (CA-02) | `tests/db.test.js`, `tests/registro.test.js` (P-00 a P-03) |
| **Sara Revollo** | **Perfil:** `website/trabajador/perfil.html`, `js/perfil.js`, `css/pages/profile.css` (y revisar `css/pages/buscar.css`) | `backend/routes/perfil.js` (CA-01) | `tests/perfil.test.js` (P-06 a P-08) |
| **Joaquín Peredo** | **Navbar y footer:** `components/header.html`, `components/footer.html`, `js/components.js`, `css/components/header.css`, `css/components/footer.css`. **Sesión en el navegador:** `js/sesion.js`, `js/api.js` | `backend/seguridad.js`, `backend/routes/login.js` | `tests/login.test.js` (P-04, P-05) |

**Acuerdo entre frontend y backend:** [`docs/API.md`](docs/API.md). Nadie lo cambia sin avisar al grupo.

**Orden para no interrumpirse:**
1. Primero: Natalia (base de datos), Susan (`server.js`, `validacion.js` y estilos globales) y Joaquín (`seguridad.js` y navbar). Los demás los necesitan.
2. Después, en paralelo: cada persona hace su pantalla y su ruta.
3. Al final: se une todo en `dev` y Susan hace las pruebas P-09 a P-11.

**Ramas:** `main` (entrega) ← `dev` ← una rama `feature/...` por persona. Se une a `dev` con pull request y cada quien hace commits desde su propia cuenta. Solo Natalia ejecuta `npm install` para agregar dependencias, así nadie más modifica `package.json`.

## Funcionalidad implementada

<!-- TODO (Susan): describir en 3–5 líneas solo lo que SÍ funciona al momento de la entrega. -->

## Criterios de aceptación

| ID | Dado / Cuando / Entonces | Cómo verificar | Responsables |
|---|---|---|---|
| **CA-01** | **Dado** un usuario registrado (trabajador o empleador) que inició sesión, **cuando** guarda los datos de su perfil, **entonces** los datos quedan en la base de datos y se muestran al volver a abrir el perfil, incluso después de cerrar sesión y volver a ingresar. | Registrar → ingresar → guardar perfil → salir → volver a ingresar → ver los mismos datos y el rol. Pruebas P-06 y P-11. | Sara Revollo |
| **CA-02** | **Dado** que ya existe una cuenta con un CI o teléfono, **cuando** alguien intenta registrarse otra vez con ese mismo CI o teléfono, **entonces** el sistema rechaza el registro, explica el motivo y no crea una segunda cuenta. | Registrar dos veces el mismo teléfono → ver el mensaje de rechazo → comprobar que solo existe una cuenta. Pruebas P-02 y P-09. | Natalia Arze |

La verificación de identidad (carnet, rostro, entrevista, teléfono) queda para el Segundo Parcial.

## Requisitos previos

- [Node.js](https://nodejs.org/) **22.13 o superior** (incluye `npm` y SQLite incorporado; no hace falta instalar un motor de base de datos)
- Git
- Un navegador actualizado

## Instalación y arranque

```bash
git clone https://github.com/SusanLaime/LILA_Project.git
cd LILA_Project
npm install
cp .env.example .env        # en Windows (PowerShell): Copy-Item .env.example .env
npm start
```

Abrir **http://localhost:3000** en el navegador.

<!-- TODO (Susan): confirmar estos pasos en una computadora limpia antes de la entrega. -->

## Variables de entorno

Ver [`.env.example`](.env.example). No contiene secretos reales.

| Variable | Para qué sirve |
|---|---|
| `PORT` | Puerto del servidor (por defecto 3000) |
| `DB_PATH` | Ruta del archivo de la base de datos SQLite (se crea al iniciar) |
| `JWT_SECRET` | Texto secreto para firmar las sesiones |

## Datos de prueba

<!-- TODO (Natalia): teléfono y contraseña de los usuarios de prueba de database/seed.sql
     (un trabajador y un empleador; datos inventados, nunca reales). -->

## Cómo comprobar el flujo principal

<!-- TODO (Susan): pasos exactos para que el docente compruebe CA-01 y CA-02 desde la pantalla. -->

## Pruebas

```bash
npm test
```

Cada persona completa las filas de sus pruebas **después de ejecutarlas**. Si una prueba falla, se anota el defecto y su estado; no se oculta.

**Entorno:** _(ej. Windows 11, Node 24.x, Chrome 1xx)_ · **Commit / versión:** _(ej. v0.1-parcial1)_

### Pruebas automatizadas (`npm test`)

| Caso | Responsable | Entrada | Resultado esperado | Resultado real | Fecha |
|---|---|---|---|---|---|
| P-00 Base de datos | Natalia Arze | Iniciar; insertar CI repetido o rol `admin` directamente | Tabla creada; la BD rechaza ambos | _[Completar]_ | |
| P-01 Registro correcto | Natalia Arze | Datos válidos, rol trabajador y rol empleador | 201, cuentas creadas con su rol | _[Completar]_ | |
| P-02 Registro duplicado (CA-02) | Natalia Arze | Mismo teléfono o CI por segunda vez | 409, mensaje de rechazo, solo 1 cuenta | _[Completar]_ | |
| P-03 Dato inválido | Natalia Arze | Teléfono `123`, nombre vacío o rol `admin` | 400, mensaje de error | _[Completar]_ | |
| P-04 Login correcto | Joaquín Peredo | Teléfono y contraseña correctos | 200 y token | _[Completar]_ | |
| P-05 Contraseña incorrecta | Joaquín Peredo | Contraseña equivocada | 401, mensaje genérico | _[Completar]_ | |
| P-06 Guardar y leer perfil (CA-01) | Sara Revollo | Ciudad, habilidades, experiencia | Datos y rol devueltos al volver a leer | _[Completar]_ | |
| P-07 Perfil sin sesión | Sara Revollo | `GET /api/perfil` sin token | 401 | _[Completar]_ | |
| P-08 Perfil con datos inválidos | Sara Revollo | Experiencia de más de 1000 caracteres | 400, mensaje de error | _[Completar]_ | |

### Pruebas manuales en el navegador

| Caso | Responsable | Pasos | Resultado esperado | Resultado real | Fecha |
|---|---|---|---|---|---|
| P-09 Registro desde la pantalla | Susan Laime | Registrar un empleador; repetir el mismo teléfono | Mensaje de éxito; luego mensaje de duplicado visible | _[Completar]_ | |
| P-10 Perfil sin sesión | Susan Laime | Abrir el perfil sin haber ingresado | Redirige al inicio de sesión | _[Completar]_ | |
| P-11 Recorrido completo (CA-01) | Susan Laime | Inicio → registrar trabajador → ingresar → guardar perfil → Salir → ingresar | El navbar dice TRABAJADOR y los datos siguen ahí | _[Completar]_ | |

### Defectos encontrados

| ID | Descripción | Prueba | Estado | Responsable |
|---|---|---|---|---|
| | | | | |

## Contribuciones individuales

Cada persona completa **su propia fila** con enlaces directos (issue, commit, pull request, prueba, corrección de error). La cantidad de commits no basta: los enlaces deben mostrar el trabajo real.

| Integrante | Responsabilidad | Enlaces / evidencia | Demostración en la defensa |
|---|---|---|---|
| Susan Laime | Página de inicio, estilos globales, servidor, validaciones, pruebas de punta a punta | _Issue: · PR: · Commits:_ | Hacer el recorrido completo desde la Home y explicar las decisiones de diseño |
| Natalia Arze | Inicio de sesión y registro (pantallas), base de datos, regla de duplicados (CA-02) | _Issue: · PR: · Commits:_ | Mostrar la tabla creada y el rechazo de un CI o teléfono repetido |
| Sara Revollo | Perfil (pantalla y ruta), guardar y mostrar datos (CA-01) | _Issue: · PR: · Commits:_ | Guardar el perfil, salir, volver a ingresar y ver los mismos datos |
| Joaquín Peredo | Navbar y footer, sesión en el navegador, cifrado de contraseñas, inicio de sesión | _Issue: · PR: · Commits:_ | Mostrar la contraseña cifrada en la BD y el cierre de sesión desde el navbar |

## Uso de IA generativa

Cada persona agrega una fila por cada uso relevante de IA (programación, depuración, pruebas o documentación) y guarda ejemplos de las instrucciones (prompts) por si el docente los pide. Cada estudiante sigue siendo responsable de lo que entrega.

| Integrante | Herramienta | Finalidad | Ejemplo de instrucción (prompt) | Verificación humana aplicada |
|---|---|---|---|---|
| Susan Laime (coordinación) | Claude Code (Anthropic) | Preparar la estructura del repositorio: limpieza, archivos guía con tareas (TODO) por integrante, contrato de la API y plantillas de documentación. **No se generó el código del backend.** | "Prepara el repositorio para que cada integrante sepa exactamente cuál es su parte." | _[Completar]_ |
| Equipo (frontend) | Agente de IA para programación + Claude Code (Anthropic) | Primera versión del **frontend** (registro con selector de rol, inicio de sesión, perfil y scripts `api.js`, `sesion.js`, `registro.js`, `login.js`, `perfil.js`). Cada dueña o dueño de pantalla la revisa, la entiende y la mejora. El backend generado en la misma sesión **se descartó**. | _[Completar]_ | _[Cada integrante: qué revisó, qué cambió y cómo lo probó]_ |
| | | | | |

## Estructura del proyecto

```
backend/      Servidor Express, validaciones, seguridad y rutas de la API
database/     Esquema y datos de prueba de SQLite
frontend/     Página de inicio, inicio de sesión, registro, perfil, navbar y footer
tests/        Pruebas automatizadas (node --test)
docs/API.md   Acuerdo entre frontend y backend
```

## Limitaciones conocidas

- La verificación de identidad (carnet, reconocimiento facial, entrevista, confirmación de teléfono) **no** forma parte de este incremento; todos los usuarios quedan como "no verificado".
- Ofertas, postulaciones, búsqueda, calificaciones y panel de administración quedan para incrementos posteriores.
<!-- TODO (Susan): agregar errores o pendientes reales al momento de la entrega. -->

## Versión de entrega

<!-- TODO (Susan): etiqueta y commit entregados, ej. v0.1-parcial1 (abc1234). -->

---
© 2026 LILA. Todos los derechos reservados.
