# Criterios de aceptación — Primer Parcial

> Se derivan del alcance acordado en la tutoría inicial y de la historia **HU-01** del
> Dossier Final (registro de trabajador). En este incremento se implementa la parte de
> **registro y perfil**; la carga y revisión del carnet (verificación) queda para el
> Segundo Parcial, previa aprobación del docente.

| ID | Dado / Cuando / Entonces | Cómo verificar | Responsable |
|---|---|---|---|
| **CA-01** | **Dado** un trabajador registrado que inició sesión, **cuando** guarda su ciudad, habilidades y experiencia en su perfil, **entonces** los datos quedan almacenados en la base de datos y se muestran al volver a abrir el perfil, incluso después de cerrar sesión y volver a ingresar. | Registrar → ingresar → guardar perfil → salir → volver a ingresar → ver los mismos datos. Prueba P-06. | Persona 4 |
| **CA-02** | **Dado** que ya existe una cuenta con un CI o teléfono, **cuando** alguien intenta registrarse otra vez con ese mismo CI o teléfono, **entonces** el sistema rechaza el registro, explica el motivo y no crea una segunda cuenta. | Registrar dos veces el mismo teléfono → ver el mensaje de rechazo → comprobar que solo existe una cuenta. Prueba P-02. | Persona 2 |

## Casos inválidos que también se demostrarán

| Caso | Resultado esperado | Responsable |
|---|---|---|
| Campo obligatorio vacío o teléfono con formato incorrecto | Mensaje de error, no se guarda nada (P-03) | Persona 2 / Persona 3 |
| Contraseña incorrecta | "Teléfono o contraseña incorrectos." (P-05) | Persona 3 |
| Abrir el perfil sin iniciar sesión | Se redirige al inicio de sesión (P-07) | Persona 4 |
