# Tareas del equipo — Primer Parcial (Primer incremento funcional)

> **Lee esto primero.** Aquí está, para cada persona, **qué construir, en qué archivos, cómo saber
> que terminó y cómo defenderlo**. Cada archivo del proyecto tiene arriba un comentario
> `DUEÑA/O: Persona N`.
>
> Documentos relacionados: [API.md](API.md) (contrato entre frontend y backend) · [CRITERIOS.md](CRITERIOS.md) ·
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
| 1. Crear cuenta | Formulario: nombre, CI, teléfono, contraseña, consentimiento y **rol (trabajador o empleador)** | Campos obligatorios y formatos. **CI o teléfono repetido → rechazo (CA-02)** |
| 2. Iniciar sesión | Teléfono + contraseña | Contraseña cifrada; datos incorrectos → mensaje de error |
| 3. Mi perfil | Rol (TRABAJADOR / EMPLEADOR), ciudad; el trabajador además: habilidades y experiencia | **Los datos se guardan y se vuelven a mostrar (CA-01)** |

**Queda fuera** (se explica en el informe, apartado V.5): verificación de CI, reconocimiento facial,
entrevista, confirmación de teléfono, ofertas, postulaciones, matching, calificaciones y panel de administración.
El empleador puede registrarse y ver su perfil, pero todavía no publica ofertas.

**Tecnología:** HTML/CSS/JavaScript (frontend) · Node.js + Express (servidor) · SQLite con el módulo
incorporado `node:sqlite` (base de datos) · `bcryptjs` (contraseñas) · `jsonwebtoken` (sesión) ·
`node --test` (pruebas). El proyecto usa módulos ES (`import` / `export`).

---

## 2. Cómo se dividió el trabajo (y por qué)

El trabajo se divide **por capas**:

- **Persona 1 hace todo el frontend.** Así las pantallas tienen **un solo diseño coherente**.
- **Personas 2, 3 y 4 hacen el backend**, cada una una parte completa. Su espacio de diseño es
  la base de datos, las reglas, los mensajes de error y la seguridad.
- **El punto de unión es [`docs/API.md`](API.md):** el frontend llama a esas rutas y el backend
  responde exactamente eso. Si alguien necesita cambiarlo, lo acuerda con el equipo antes.

| | Parte | Resumen |
|---|---|---|
| **Persona 1** | T-01 Frontend y diseño | Las 3 pantallas, estilos, encabezado/pie, comunicación con la API |
| **Persona 2** | T-02 Servidor y base de datos | Express, SQLite, datos de prueba, configuración, README |
| **Persona 3** | T-03 Registro y validaciones | Reglas de los datos, rol, **regla de duplicados (CA-02)** |
| **Persona 4** | T-04 Sesión y perfil | Cifrado de contraseñas, login, token, **perfil (CA-01)** |

---

## 3. Mapa de archivos: ¿de quién es cada uno?

| Archivo | Dueña/o |
|---|---|
| `frontend/` (todo: `auth/`, `website/`, `components/`, `assets/css/`, `assets/js/`) | **Persona 1** |
| `backend/server.js`, `backend/db.js` | **Persona 2** |
| `database/schema.sql`, `database/seed.sql` | **Persona 2** |
| `package.json` (dependencias), `.env.example`, `README.md` | **Persona 2** |
| `tests/db.test.js` | **Persona 2** |
| `backend/validacion.js`, `backend/routes/registro.js` | **Persona 3** |
| `tests/registro.test.js` | **Persona 3** |
| `backend/seguridad.js`, `backend/routes/login.js`, `backend/routes/perfil.js` | **Persona 4** |
| `tests/login.test.js`, `tests/perfil.test.js` | **Persona 4** |
| `docs/PRUEBAS.md` | Cada persona anota sus filas; coordina **Persona 4** |
| `docs/API.md` | **Compartido**: avisar al equipo antes de cambiarlo |

> **Regla de oro:** cada persona modifica **solo sus archivos**. Así no hay conflictos al unir ramas.
> Si necesitas algo de otra persona, pídeselo (o abre un issue) en vez de editar su archivo.

---

## 4. Cómo trabajar con Git

```
main  ← solo la entrega final (etiqueta v0.1-parcial1)
 └─ dev  ← aquí se unen las tareas terminadas
     ├─ feature/T-01-frontend   (Persona 1)
     ├─ feature/T-02-servidor   (Persona 2)
     ├─ feature/T-03-registro   (Persona 3)
     └─ feature/T-04-sesion     (Persona 4)
```

1. Actualiza `dev`: `git checkout dev` y `git pull`
2. Crea tu rama: `git checkout -b feature/T-0N-nombre`
3. Trabaja y haz commits pequeños **con tu propia cuenta de Git**, con mensajes claros:
   `feat(registro): rechazar teléfono duplicado (CA-02)`
4. Sube tu rama: `git push -u origin feature/T-0N-nombre`
5. En GitHub, abre un **Pull Request hacia `dev`**, enlaza tu issue y pide que otra persona lo revise.
6. Después de unir, vuelve al paso 1.

**Orden:** la Persona 2 une primero su base a `dev` (hasta el 4 de nov). La Persona 4 entrega
`seguridad.js` temprano (hasta el 7 de nov) porque la Persona 3 la necesita. La Persona 1 puede
trabajar desde el primer día porque `docs/API.md` ya dice qué responderá el servidor.

**Nunca** subir el archivo `.env`, la base de datos (`*.db`) ni contraseñas reales.

---

## 5. Tareas por persona

### 🟪 Persona 1 — T-01 Frontend y diseño

**Objetivo:** que las 3 pantallas se vean bien, con un **diseño propio y coherente**, y que hablen con la API.
**Rama:** `feature/T-01-frontend`

**Punto de partida:** las pantallas ya tienen una **primera versión funcional hecha con ayuda de IA**
(ver [DECLARACION_IA.md](DECLARACION_IA.md)). Tu tarea es **revisarla, entenderla línea por línea,
mejorarla y darle tu diseño**. Lo que cambies y decidas es tu aporte.

**Pasos:**
1. **Registro** (`auth/register.html` + `assets/js/registro.js`): campos, selector de rol
   (trabajador / empleador), consentimiento, mensajes de error claros, botón desactivado mientras se envía.
2. **Inicio de sesión** (`auth/login.html` + `assets/js/login.js`): teléfono y contraseña, mensaje de error, enlace a crear cuenta.
3. **Perfil** (`website/trabajador/perfil.html` + `assets/js/perfil.js`): mostrar rol y datos; formulario
   de edición; ocultar habilidades/experiencia al empleador; sin sesión → login.
4. **Diseño compartido:** estilos (`assets/css/`), encabezado y pie (`components/`, `assets/js/components.js`),
   que todo se vea bien en el **celular** (diseño *mobile first*, Dossier §8.c).
5. **Comunicación:** `assets/js/api.js` (llamadas al servidor) y `assets/js/sesion.js` (guardar/borrar el token).
6. **Tu prueba:** prueba manual reproducible de las pantallas (P-09 a P-11 en `docs/PRUEBAS.md`), con capturas.

**Mientras el backend no esté listo:** trabajar el diseño; las pantallas mostrarán
"No se pudo conectar con el servidor." hasta que exista la API.

**Listo cuando:** se puede hacer todo el recorrido desde el navegador, sin tocar el código, y los errores se ven claros.

**Preguntas probables en la defensa:**
- ¿Cómo sabe la pantalla de perfil si el usuario es trabajador o empleador?
- ¿Dónde se guarda el token y por qué no se guarda la contraseña en el navegador?
- ¿Por qué se usa `textContent` y no `innerHTML` para mostrar datos?
- ¿Qué decisiones de diseño tomaste y por qué (colores, orden de campos, mensajes)?

---

### 🟦 Persona 2 — T-02 Servidor y base de datos

**Objetivo:** que el proyecto arranque con `npm install` + `npm start` y que la base de datos se cree sola.
**Rama:** `feature/T-02-servidor` · **Fecha límite:** 4 de noviembre (el backend depende de esto).

**Pasos:**
1. Instalar **todas** las dependencias del equipo de una vez (evita conflictos en `package-lock.json`):
   `npm install express bcryptjs jsonwebtoken`
2. `backend/server.js`: Express, servir `/frontend`, redirigir `/` al login, montar las 3 rutas, manejador de errores.
3. `backend/db.js` + `database/schema.sql`: tabla `usuarios` según [API.md §2](API.md) (con `UNIQUE` y `CHECK` del rol).
4. `database/seed.sql`: un trabajador y un empleador de prueba, **inventados**, con la contraseña cifrada.
5. `.env.example` revisado y **README** completo (instalación, arranque, datos de prueba, cómo comprobar CA-01 y CA-02).
6. `tests/db.test.js`: P-00.
7. 17 de nov: unir `dev` → `main` y crear la etiqueta `v0.1-parcial1`.

**Listo cuando:** en una computadora limpia, siguiendo solo el README, el proyecto abre en `http://localhost:3000`.

**Preguntas probables en la defensa:**
- ¿Por qué SQLite y no PostgreSQL? ¿Y por qué no seguir con `localStorage`?
- ¿Qué pasa si se ejecuta el proyecto por primera vez en otra computadora?
- ¿Por qué no se sirve la carpeta raíz del proyecto?
- ¿Qué es una consulta preparada y qué ataque evita?

---

### 🟩 Persona 3 — T-03 Registro y validaciones (CA-02)

**Objetivo:** que el registro guarde la cuenta con su rol y **rechace un CI o teléfono repetido**.
**Rama:** `feature/T-03-registro`

**Pasos:**
1. `backend/validacion.js`: `validarRegistro` (incluye **rol: trabajador o empleador**), `validarLogin`, `validarPerfil` según [API.md §3](API.md).
2. `backend/routes/registro.js`: validar, **regla de duplicados → 409**, cifrar la contraseña con `hashPassword` (Persona 4), guardar con el rol y `estado_verificacion = 'no_verificado'`.
3. `tests/registro.test.js`: P-01 (correcto, ambos roles), P-02 (duplicado), P-03 (dato o rol inválido).

**Mientras la Persona 4 termina `seguridad.js`:** empezar por `validacion.js` y la consulta de duplicados.

**Listo cuando:** al repetir el teléfono, la API responde 409 y la base de datos sigue con una sola cuenta.

**Preguntas probables en la defensa:**
- ¿En qué línea del código está la regla de duplicados?
- ¿Qué pasa si dos personas se registran con el mismo teléfono al mismo tiempo? (pista: `UNIQUE`)
- ¿Por qué se responde 409 y no 400? ¿Por qué se valida en el servidor si la pantalla ya valida?
- ¿Qué pasa si alguien envía el rol `admin` directamente a la API?

---

### 🟥 Persona 4 — T-04 Sesión y perfil (CA-01)

**Objetivo:** iniciar sesión de forma segura y que el perfil **se guarde y siga ahí al volver**.
**Rama:** `feature/T-04-sesion` · **Fecha límite para `seguridad.js`:** 7 de noviembre (la usa la Persona 3).

**Pasos:**
1. `backend/seguridad.js`: `hashPassword`, `verificarPassword`, `crearToken`, `requiereSesion`.
2. `backend/routes/login.js`: comprobar teléfono y contraseña; el mismo mensaje de error para ambos casos.
3. `backend/routes/perfil.js`: `GET` (incluye el **rol**) y `PUT /api/perfil`, protegidos; nunca devolver `password_hash`.
4. `tests/login.test.js` y `tests/perfil.test.js`: P-04 a P-08.
5. Coordinar que todos anoten sus resultados en `docs/PRUEBAS.md`.

**Listo cuando:** login correcto → guardar perfil → login otra vez → la API devuelve los mismos datos.

**Preguntas probables en la defensa:**
- ¿Por qué no se guarda la contraseña tal cual? ¿Qué es un hash y qué es la "sal" de bcrypt?
- ¿Por qué el mensaje de error es el mismo si falla el teléfono o la contraseña?
- ¿Cómo sabe el servidor de quién es el perfil que se pide? ¿Qué pasa si alguien modifica el token?

---

## 6. Informe técnico (5 a 8 páginas, formato UPB)

Estructura obligatoria: *Proyecto de Grado — Diseño de artefacto o sistema* (Manual UPB, pp. 14–15).
Formato: carta; márgenes 2,5 cm (sup., inf., der.) y 3,5 cm (izq.); Times New Roman 12; interlineado 1,5;
redacción impersonal; tablas con título **arriba**, figuras con título **abajo**; referencias APA 7.
El Dossier se **resume**, no se copia.

| Sección | Responsable | Fuente |
|---|---|---|
| Resumen ejecutivo (español e inglés) · I Introducción | Persona 1 | Dossier §2, §3; lo que realmente funciona |
| II Estudio de diagnóstico · III Bases teóricas | Persona 3 | Dossier §3, §4, §9 |
| IV Estudio de alternativas · V.2 Diseño (diagrama) | Persona 2 | Comparar `localStorage` vs. Express + SQLite vs. PostgreSQL |
| V.1 Especificaciones (CA-01, CA-02) · V.3 Construcción · V.4 Verificación | Persona 4 | `docs/CRITERIOS.md`, `docs/API.md`, `docs/PRUEBAS.md` |
| V.5 Limitaciones · Conclusiones y recomendaciones | Todos | |
| Anexos: matriz de contribuciones y declaración de IA | Todos | `docs/CONTRIBUCIONES.md`, `docs/DECLARACION_IA.md` |

---

## 7. Antes de entregar (lista de control)

- [ ] El proyecto arranca en otra computadora siguiendo **solo** el README.
- [ ] CA-01 y CA-02 se pueden demostrar en vivo, como trabajador y como empleador.
- [ ] `npm test` pasa y `docs/PRUEBAS.md` tiene los resultados reales.
- [ ] Cada persona tiene en `docs/CONTRIBUCIONES.md` enlaces a **su** issue, PR, commits y prueba.
- [ ] `docs/DECLARACION_IA.md` está completo.
- [ ] No hay contraseñas reales, `.env` ni base de datos en el repositorio.
- [ ] Existe la etiqueta `v0.1-parcial1` en `main`.
- [ ] Cada persona ensayó explicar su parte (3–5 minutos).
