# LILA — Librería Laboral

**Plataforma web de trabajos ocasionales en Bolivia.**

> **Primer Parcial — Primer incremento funcional.**
> Este repositorio contiene **solo** el primer recorrido del MVP:
> **crear cuenta → validación → guardar en la base de datos → iniciar sesión → ver y editar el perfil del trabajador.**
>
> 👉 **Equipo:** la guía de tareas está en [`docs/TAREAS.md`](docs/TAREAS.md).

<!-- DUEÑA/O del README: Persona 2 (T-02). Completar cada sección marcada con TODO antes de la entrega. -->

## Funcionalidad implementada

<!-- TODO (Persona 2): describir en 3–5 líneas solo lo que SÍ funciona al momento de la entrega. -->

| Criterio | Descripción |
|---|---|
| CA-01 | El perfil del trabajador se guarda en la base de datos y se vuelve a mostrar al ingresar de nuevo |
| CA-02 | No se puede registrar dos veces el mismo CI o teléfono |

Detalle: [`docs/CRITERIOS.md`](docs/CRITERIOS.md).

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

<!-- TODO (Persona 2): confirmar estos pasos en una computadora limpia antes de la entrega. -->

## Variables de entorno

Ver [`.env.example`](.env.example). No contiene secretos reales.

| Variable | Para qué sirve |
|---|---|
| `PORT` | Puerto del servidor (por defecto 3000) |
| `DB_PATH` | Ruta del archivo de la base de datos SQLite (se crea al iniciar) |
| `JWT_SECRET` | Texto secreto para firmar las sesiones |

## Datos de prueba

<!-- TODO (Persona 2, con Persona 1): teléfono y contraseña del usuario de prueba de database/seed.sql
     (datos inventados, nunca reales). -->

## Cómo comprobar el flujo principal

<!-- TODO (Persona 2): pasos exactos para que el docente compruebe CA-01 y CA-02 desde la pantalla. -->

## Pruebas

```bash
npm test
```

Resultados registrados en [`docs/PRUEBAS.md`](docs/PRUEBAS.md).

## Estructura del proyecto

```
backend/      Servidor Express y rutas de la API
database/     Esquema y datos de prueba de SQLite
frontend/     Pantallas (registro, inicio de sesión, perfil), estilos y scripts
tests/        Pruebas automatizadas (node --test)
docs/         Tareas, contrato de la API, criterios, pruebas, contribuciones, declaración de IA
resources/    Dossier Final del proyecto
```

## Limitaciones conocidas

- La verificación de identidad (carnet, reconocimiento facial, entrevista, confirmación de teléfono) **no** forma parte de este incremento; todos los usuarios quedan como "no verificado".
- Ofertas, postulaciones, empleadores, calificaciones y panel de administración quedan para incrementos posteriores.
<!-- TODO (Persona 2): agregar errores o pendientes reales al momento de la entrega. -->

## Versión de entrega

<!-- TODO (Persona 2): etiqueta y commit entregados, ej. v0.1-parcial1 (abc1234). -->

---
© 2026 LILA. Todos los derechos reservados.
