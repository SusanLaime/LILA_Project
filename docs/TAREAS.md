# Tareas del equipo — Primer Parcial (Primer incremento funcional)

> **Lee esto primero.** Aquí está, para cada persona, **qué construir, en qué archivos, cómo saber
> que terminó y cómo defenderlo**. Cada archivo del proyecto tiene arriba un comentario
> `DUEÑA/O: Persona N` y una lista de `TODO` con los pasos.
>
> Documentos relacionados: [API.md](API.md) (contrato entre todos) · [CRITERIOS.md](CRITERIOS.md) ·
> [PRUEBAS.md](PRUEBAS.md) · [CONTRIBUCIONES.md](CONTRIBUCIONES.md) ·
> [DECLARACION_IA.md](DECLARACION_IA.md) · [CALENDARIO.md](CALENDARIO.md)

---

## 1. ¿Qué vamos a mostrar?

**Un solo recorrido que funciona de verdad** (y nada más):

```
Crear cuenta  →  Validación  →  Se guarda en la base de datos  →  Iniciar sesión  →  Ver y editar mi perfil
```

| Paso | Qué ve el usuario | Regla que se comprueba |
|---|---|---|
| 1. Crear cuenta | Formulario: nombre, CI, teléfono, contraseña, consentimiento | Campos obligatorios y formatos. **CI o teléfono repetido → rechazo (CA-02)** |
| 2. Iniciar sesión | Teléfono + contraseña | Contraseña cifrada; datos incorrectos → mensaje de error |
| 3. Mi perfil | Ciudad, habilidades, experiencia → Guardar | **Los datos se guardan y se vuelven a mostrar (CA-01)** |

**Queda fuera** (se explica en el informe, apartado V.5): verificación de CI, reconocimiento facial,
entrevista, confirmación de teléfono, ofertas, postulaciones, empleadores, calificaciones y panel de administración.

**Tecnología:** HTML/CSS/JavaScript (frontend) · Node.js + Express (servidor) · SQLite con el módulo
incorporado `node:sqlite` (base de datos) · `bcryptjs` (contraseñas) · `jsonwebtoken` (sesión) ·
`node --test` (pruebas). El proyecto usa módulos ES (`import` / `export`).

---

## 2. Mapa de archivos: ¿de quién es cada uno?

| Archivo | Dueña/o |
|---|---|
| `backend/server.js`, `backend/db.js` | **Persona 1** |
| `database/schema.sql`, `database/seed.sql` | **Persona 1** |
| `frontend/assets/js/api.js`, `.env.example`, `package.json` (dependencias) | **Persona 1** |
| `tests/db.test.js` | **Persona 1** |
| `backend/routes/registro.js` | **Persona 2** |
| `frontend/auth/register.html`, `frontend/assets/js/registro.js` | **Persona 2** |
| `README.md` | **Persona 2** |
| `tests/registro.test.js` | **Persona 2** |
| `backend/routes/login.js`, `backend/seguridad.js`, `backend/validacion.js` | **Persona 3** |
| `frontend/auth/login.html`, `frontend/assets/js/login.js`, `frontend/assets/js/sesion.js` | **Persona 3** |
| `tests/login.test.js` | **Persona 3** |
| `backend/routes/perfil.js` | **Persona 4** |
| `frontend/website/trabajador/perfil.html`, `frontend/assets/js/perfil.js` | **Persona 4** |
| `tests/perfil.test.js`, `docs/PRUEBAS.md` | **Persona 4** |
| `docs/API.md`, `frontend/assets/js/components.js`, CSS | **Compartidos** — avisar al equipo antes de cambiarlos |

> **Regla de oro:** cada persona modifica **solo sus archivos**. Así no hay conflictos al unir ramas.
> Si necesitas algo de otra persona, pídeselo (o abre un issue) en vez de editar su archivo.

---

## 3. Cómo trabajar con Git

```
main  ← solo la entrega final (etiqueta v0.1-parcial1)
 └─ dev  ← aquí se unen las tareas terminadas
     ├─ feature/T-01-servidor   (Persona 1)
     ├─ feature/T-02-registro   (Persona 2)
     ├─ feature/T-03-login      (Persona 3)
     └─ feature/T-04-perfil     (Persona 4)
```

1. Actualiza `dev`: `git checkout dev` y `git pull`
2. Crea tu rama: `git checkout -b feature/T-0N-nombre`
3. Trabaja y haz commits pequeños **con tu propia cuenta de Git**, con mensajes claros:
   `feat(registro): rechazar teléfono duplicado (CA-02)`
4. Sube tu rama: `git push -u origin feature/T-0N-nombre`
5. En GitHub, abre un **Pull Request hacia `dev`**, enlaza tu issue y pide que otra persona lo revise.
6. Después de unir, vuelve al paso 1.

**Orden:** la Persona 1 une primero su base a `dev` (hasta el 4 de nov). Las demás personas crean
o actualizan su rama **después** de eso (`git pull origin dev` dentro de su rama).

**Nunca** subir el archivo `.env`, la base de datos (`*.db`) ni contraseñas reales.

---

## 4. Tareas por persona

### 🟦 Persona 1 — T-01 Servidor y base de datos

**Objetivo:** que el proyecto arranque con `npm install` + `npm start` y que la base de datos se cree sola.
**Rama:** `feature/T-01-servidor` · **Fecha límite:** 4 de noviembre (los demás dependen de esto).

**Pasos:**
1. Instalar **todas** las dependencias del equipo de una vez (evita conflictos en `package-lock.json`):
   `npm install express bcryptjs jsonwebtoken`
2. `backend/server.js`: Express, servir `/frontend`, redirigir `/` al login, montar las 3 rutas de la API, manejador de errores.
3. `backend/db.js` + `database/schema.sql`: crear la tabla `usuarios` según [API.md §2](API.md).
4. `database/seed.sql`: 1–2 usuarios de prueba **inventados**, con la contraseña ya cifrada.
5. `frontend/assets/js/api.js`: la función `pedirApi()` que usan todas las pantallas.
6. `.env.example` revisado (ya existe una versión inicial).
7. `tests/db.test.js`: la tabla se crea y rechaza un CI/teléfono repetido.

**Listo cuando:** en una computadora limpia, `npm install` → copiar `.env.example` a `.env` → `npm start`
→ `http://localhost:3000` abre el login y aparece el archivo de la base de datos.

**Preguntas probables en la defensa:**
- ¿Por qué SQLite y no PostgreSQL? ¿Y por qué no seguir con `localStorage`?
- ¿Qué pasa si se ejecuta el proyecto por primera vez en otra computadora?
- ¿Por qué no se sirve la carpeta raíz del proyecto?
- ¿Qué es una consulta preparada y qué ataque evita?

---

### 🟩 Persona 2 — T-02 Registro (CA-02)

**Objetivo:** crear una cuenta desde la pantalla y que el sistema **rechace un CI o teléfono repetido**.
**Rama:** `feature/T-02-registro`

**Pasos:**
1. `frontend/auth/register.html`: agregar contraseña, casilla de consentimiento (Ley 2472) y zona de mensajes (ver los `TODO`).
2. `backend/routes/registro.js`: validar (con `validarRegistro` de la Persona 3), **regla de duplicados → 409**, cifrar la contraseña (con `hashPassword` de la Persona 3), guardar con `estado_verificacion = 'no_verificado'`.
3. `frontend/assets/js/registro.js`: enviar el formulario a la API y mostrar los mensajes.
4. `tests/registro.test.js`: P-01 (correcto), P-02 (duplicado), P-03 (dato inválido).
5. `README.md`: completar todas las secciones marcadas con `TODO`.
6. 17 de nov: unir `dev` → `main` y crear la etiqueta `v0.1-parcial1`.

**Mientras la Persona 3 termina `validacion.js` / `seguridad.js`:** empezar por la pantalla (paso 1) y la consulta de duplicados.

**Listo cuando:** desde la pantalla se crea una cuenta; al repetir el teléfono aparece "El CI o el teléfono ya están registrados." y la base de datos sigue con una sola cuenta.

**Preguntas probables en la defensa:**
- ¿En qué línea del código está la regla de duplicados?
- ¿Qué pasa si dos personas se registran con el mismo teléfono al mismo tiempo? (pista: la restricción `UNIQUE` de la Persona 1)
- ¿Por qué se responde 409 y no 400?
- ¿Cómo instala y ejecuta el proyecto alguien que nunca lo vio? (README)

---

### 🟨 Persona 3 — T-03 Inicio de sesión, seguridad y validaciones

**Objetivo:** iniciar sesión de forma segura y ofrecer al equipo las funciones de validación y cifrado.
**Rama:** `feature/T-03-login` · **Fecha límite para `validacion.js` y `seguridad.js`:** 7 de noviembre (las usan las Personas 2 y 4).

**Pasos:**
1. `backend/validacion.js`: `validarRegistro`, `validarLogin`, `validarPerfil` según [API.md §3](API.md).
2. `backend/seguridad.js`: `hashPassword`, `verificarPassword`, `crearToken`, `requiereSesion`.
3. `backend/routes/login.js`: comprobar teléfono y contraseña; mismo mensaje de error para ambos casos.
4. `frontend/auth/login.html` + `frontend/assets/js/login.js`: formulario de teléfono y contraseña.
5. `frontend/assets/js/sesion.js`: guardar, leer y borrar el token; el enlace **Salir** del encabezado debe cerrar la sesión.
6. `tests/login.test.js`: P-04 (correcto), P-05 (contraseña incorrecta) y comprobar que la contraseña está cifrada en la BD.

**Listo cuando:** con la cuenta creada se ingresa y se llega al perfil; con una contraseña equivocada aparece el mensaje de error; en la base de datos la contraseña no se puede leer.

**Preguntas probables en la defensa:**
- ¿Por qué no se guarda la contraseña tal cual? ¿Qué es un hash y qué es la "sal" de bcrypt?
- ¿Por qué el mensaje de error es el mismo si falla el teléfono o la contraseña?
- ¿Qué contiene el token y qué pasa si alguien lo modifica?
- ¿Dónde se valida: en el navegador, en el servidor o en ambos? ¿Por qué?

---

### 🟥 Persona 4 — T-04 Perfil y pruebas (CA-01)

**Objetivo:** que el trabajador vea y edite su perfil, y que los datos **sigan ahí al volver a ingresar**.
**Rama:** `feature/T-04-perfil`

**Pasos:**
1. `frontend/website/trabajador/perfil.html`: mostrar los datos y un formulario para ciudad, habilidades y experiencia (ver los `TODO`).
2. `backend/routes/perfil.js`: `GET` y `PUT /api/perfil`, protegidos con `requiereSesion` (Persona 3), sin devolver nunca `password_hash`.
3. `frontend/assets/js/perfil.js`: cargar y guardar el perfil; sin sesión → ir al login.
4. `tests/perfil.test.js`: P-06 (CA-01), P-07 (sin sesión), P-08 (datos inválidos).
5. `docs/PRUEBAS.md`: coordinar que todas las personas anoten sus resultados reales.

**Mientras la Persona 3 termina `seguridad.js`:** empezar por la pantalla (paso 1).

**Listo cuando:** guardar perfil → Salir → ingresar otra vez → aparecen los mismos datos.

**Preguntas probables en la defensa:**
- ¿Cómo sabe el servidor de quién es el perfil que se pide?
- ¿Qué pasa si alguien intenta ver el perfil sin iniciar sesión?
- ¿Por qué se usa `textContent` y no `innerHTML` para mostrar los datos?
- ¿Qué prueba falla actualmente (si alguna) y cuál es la solución prevista?

---

## 5. Informe técnico (5 a 8 páginas, formato UPB)

Estructura obligatoria: *Proyecto de Grado — Diseño de artefacto o sistema* (Manual UPB, pp. 14–15).
Formato: carta; márgenes 2,5 cm (sup., inf., der.) y 3,5 cm (izq.); Times New Roman 12; interlineado 1,5;
redacción impersonal; tablas con título **arriba**, figuras con título **abajo**; referencias APA 7.
El Dossier se **resume**, no se copia.

| Sección | Responsable | Fuente |
|---|---|---|
| Resumen ejecutivo (español e inglés) | Persona 2 | Lo que realmente funciona |
| I Introducción · II Estudio de diagnóstico | Persona 2 | Dossier §2, §3, §4 |
| III Bases teóricas · IV Estudio de alternativas | Persona 1 | Dossier §9; comparar `localStorage` vs. Express + SQLite vs. PostgreSQL |
| V.1 Especificaciones (CA-01, CA-02) · V.2 Diseño (diagrama) · V.3 Construcción | Persona 3 | `docs/CRITERIOS.md`, `docs/API.md`, enlace al commit |
| V.4 Verificación · V.5 Limitaciones · Conclusiones y recomendaciones | Persona 4 | `docs/PRUEBAS.md` |
| Anexos: matriz de contribuciones y declaración de IA | Todos | `docs/CONTRIBUCIONES.md`, `docs/DECLARACION_IA.md` |

---

## 6. Antes de entregar (lista de control)

- [ ] El proyecto arranca en otra computadora siguiendo **solo** el README.
- [ ] CA-01 y CA-02 se pueden demostrar en vivo.
- [ ] `npm test` pasa y `docs/PRUEBAS.md` tiene los resultados reales.
- [ ] Cada persona tiene en `docs/CONTRIBUCIONES.md` enlaces a **su** issue, PR, commits y prueba.
- [ ] `docs/DECLARACION_IA.md` está completo.
- [ ] No hay contraseñas reales, `.env` ni base de datos en el repositorio.
- [ ] Existe la etiqueta `v0.1-parcial1` en `main`.
- [ ] Cada persona ensayó explicar su parte (3–5 minutos).
