# Registro de pruebas — Primer Parcial

> Cada persona completa las filas de sus pruebas **después de ejecutarlas**.
> Si una prueba falla, se anota el defecto y su estado; no se oculta (Tutorial, §6).
> Coordinación de este documento: **Persona 4**.

**Entorno:** _(ej. Windows 11, Node 24.x, Chrome 1xx)_ · **Commit / versión:** _(ej. v0.1-parcial1)_

## Pruebas automatizadas (`npm test`)

| Caso | Responsable | Entrada | Resultado esperado | Resultado real | Fecha | Evidencia |
|---|---|---|---|---|---|---|
| P-00 Base de datos | Persona 2 | Iniciar; insertar CI repetido o rol `admin` directamente | Tabla creada; la BD rechaza ambos | _[Completar al ejecutar]_ | | _(enlace al test)_ |
| P-01 Registro correcto | Persona 3 | Datos válidos, rol trabajador y rol empleador | 201, cuentas creadas con su rol | _[Completar al ejecutar]_ | | |
| P-02 Registro duplicado (CA-02) | Persona 3 | Mismo teléfono o CI por segunda vez | 409, mensaje de rechazo, solo 1 cuenta | _[Completar al ejecutar]_ | | |
| P-03 Dato inválido | Persona 3 | Teléfono `123`, nombre vacío o rol `admin` | 400, mensaje de error | _[Completar al ejecutar]_ | | |
| P-04 Login correcto | Persona 4 | Teléfono y contraseña correctos | 200 y token | _[Completar al ejecutar]_ | | |
| P-05 Contraseña incorrecta | Persona 4 | Contraseña equivocada | 401, mensaje genérico | _[Completar al ejecutar]_ | | |
| P-06 Guardar y leer perfil (CA-01) | Persona 4 | Ciudad, habilidades, experiencia | Datos y rol devueltos al volver a leer | _[Completar al ejecutar]_ | | |
| P-07 Perfil sin sesión | Persona 4 | `GET /api/perfil` sin token | 401 | _[Completar al ejecutar]_ | | |
| P-08 Perfil con datos inválidos | Persona 4 | Experiencia de más de 1000 caracteres | 400, mensaje de error | _[Completar al ejecutar]_ | | |

## Pruebas manuales de pantallas (reproducibles en el navegador)

| Caso | Responsable | Pasos | Resultado esperado | Resultado real | Fecha | Evidencia |
|---|---|---|---|---|---|---|
| P-09 Registro desde la pantalla | Persona 1 | Registrar un empleador; repetir el mismo teléfono | Mensaje de éxito; luego mensaje de duplicado visible | _[Completar al ejecutar]_ | | _(captura)_ |
| P-10 Perfil sin sesión | Persona 1 | Abrir `/frontend/website/trabajador/perfil.html` sin haber ingresado | Redirige al inicio de sesión | _[Completar al ejecutar]_ | | |
| P-11 Recorrido completo (CA-01) | Persona 1 | Registrar trabajador → ingresar → guardar perfil → Salir → ingresar | El encabezado dice TRABAJADOR y los datos siguen ahí | _[Completar al ejecutar]_ | | |

## Defectos encontrados

| ID | Descripción | Prueba | Estado | Responsable |
|---|---|---|---|---|
| | | | | |
