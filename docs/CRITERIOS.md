# Criterios de aceptación — Primer Parcial

> Se derivan del alcance acordado en la tutoría inicial y de la historia **HU-01** del
> Dossier Final (registro). En este incremento se implementa el **registro (trabajador o
> empleador) y el perfil**; la carga y revisión del carnet (verificación) queda para el
> Segundo Parcial, previa aprobación del docente.

| ID | Dado / Cuando / Entonces | Cómo verificar | Responsables |
|---|---|---|---|
| **CA-01** | **Dado** un usuario registrado (trabajador o empleador) que inició sesión, **cuando** guarda los datos de su perfil, **entonces** los datos quedan almacenados en la base de datos y se muestran al volver a abrir el perfil, incluso después de cerrar sesión y volver a ingresar. | Registrar → ingresar → guardar perfil → salir → volver a ingresar → ver los mismos datos y el rol. Pruebas P-06 y P-11. | Persona 4 (API) · Persona 1 (pantalla) |
| **CA-02** | **Dado** que ya existe una cuenta con un CI o teléfono, **cuando** alguien intenta registrarse otra vez con ese mismo CI o teléfono, **entonces** el sistema rechaza el registro, explica el motivo y no crea una segunda cuenta. | Registrar dos veces el mismo teléfono → ver el mensaje de rechazo → comprobar que solo existe una cuenta. Pruebas P-02 y P-09. | Persona 3 (API) · Persona 1 (pantalla) |

## Casos inválidos que también se demostrarán

| Caso | Resultado esperado | Responsable |
|---|---|---|
| Campo obligatorio vacío, teléfono con formato incorrecto o rol no permitido | Mensaje de error, no se guarda nada (P-03) | Persona 3 |
| Contraseña incorrecta | "Teléfono o contraseña incorrectos." (P-05) | Persona 4 |
| Abrir el perfil sin iniciar sesión | Se redirige al inicio de sesión (P-07, P-10) | Persona 4 · Persona 1 |
