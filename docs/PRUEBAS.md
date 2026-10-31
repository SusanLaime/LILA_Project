# Registro de pruebas — Primer Parcial

> Cada persona completa las filas de sus pruebas **después de ejecutarlas**.
> Si una prueba falla, se anota el defecto y su estado; no se oculta (Tutorial, §6).
> Coordinación de este documento: **Persona 4**.

**Entorno:** _(ej. Windows 11, Node 24.x, Chrome 1xx)_ · **Commit / versión:** _(ej. v0.1-parcial1)_

| Caso | Responsable | Entrada | Resultado esperado | Resultado real | Fecha | Evidencia |
|---|---|---|---|---|---|---|
| P-00 Base de datos | Persona 1 | Iniciar el servidor; insertar CI repetido directamente | Tabla creada; la BD rechaza el duplicado | _[Completar al ejecutar]_ | | _(enlace a test / captura)_ |
| P-01 Registro correcto | Persona 2 | Datos válidos | 201, cuenta creada | _[Completar al ejecutar]_ | | |
| P-02 Registro duplicado (CA-02) | Persona 2 | Mismo teléfono o CI por segunda vez | 409, mensaje de rechazo, solo 1 cuenta | _[Completar al ejecutar]_ | | |
| P-03 Dato inválido | Persona 2 | Teléfono `123` o nombre vacío | 400, mensaje de error | _[Completar al ejecutar]_ | | |
| P-04 Login correcto | Persona 3 | Teléfono y contraseña correctos | 200, token, va al perfil | _[Completar al ejecutar]_ | | |
| P-05 Contraseña incorrecta | Persona 3 | Contraseña equivocada | 401, mensaje genérico | _[Completar al ejecutar]_ | | |
| P-06 Guardar y leer perfil (CA-01) | Persona 4 | Ciudad, habilidades, experiencia | Datos guardados y mostrados al volver | _[Completar al ejecutar]_ | | |
| P-07 Perfil sin sesión | Persona 4 | Abrir perfil sin token | 401 / redirige al login | _[Completar al ejecutar]_ | | |
| P-08 Perfil con datos inválidos | Persona 4 | Experiencia de más de 1000 caracteres | 400, mensaje de error | _[Completar al ejecutar]_ | | |

## Defectos encontrados

| ID | Descripción | Prueba | Estado | Responsable |
|---|---|---|---|---|
| | | | | |
