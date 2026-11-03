// =====================================================================
// Pruebas de registro: validación, alta de trabajador/empleador y duplicados.
// La ruta usa una base SQLite en memoria; nunca modifica la base de demostración.
// =====================================================================


import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import bcrypt from 'bcryptjs';

// =======================================================
// PRUEBAS AUTOMÁTICAS DEL REGISTRO DE USUARIOS - LILA
// Responsable: Natalia
// Archivo: tests/registro.test.js
// =======================================================

// Variables que utilizaremos durante las pruebas.
let db;
let servidor;
let urlBase;
let contador = 0;

// =======================================================
// FUNCIÓN AUXILIAR: GENERAR USUARIOS DE PRUEBA
// =======================================================

// Genera datos válidos para registrar un usuario.
// Cada usuario tendrá un CI y teléfono diferentes.
// "cambios" permite modificar un dato para probar errores.

function usuarioValido(cambios = {}) {
  contador += 1;

  return {
    nombre: 'Ana Prueba',
    ci: String(1234500 + contador),
    telefono: String(70000000 + contador),
    password: 'Prueba1234',
    consentimiento: true,
    rol: 'trabajador',
    ...cambios
  };
}

// =======================================================
// FUNCIÓN AUXILIAR: ENVIAR REGISTRO AL BACKEND
// =======================================================

// Simula el envío del formulario "Crear cuenta".
// Usa POST para enviar los datos en formato JSON.

function enviarRegistro(datos) {
  return fetch(`${urlBase}/api/registro`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(datos)
  });
}

// =======================================================
// CONFIGURACIÓN INICIAL DE LAS PRUEBAS
// =======================================================

// Se ejecuta una sola vez antes de las pruebas.

before(async () => {

  // Utilizar SQLite en memoria.
  // Así no modificamos database/lila.db.
  // Debe configurarse ANTES de importar el registro.

  process.env.DB_PATH = ':memory:';

  // Importar la ruta real de registro.
  const { default: routerRegistro } =
    await import('../backend/routes/registro.js');

  // Importar la conexión SQLite utilizada por la ruta.
  ({ db } = await import('../backend/db.js'));

  // Crear una aplicación Express solo para las pruebas.
  const app = express();

  // Permitir recibir datos JSON.
  app.use(express.json());

  // Conectar la ruta de registro.
  app.use('/api/registro', routerRegistro);

  // Iniciar el servidor en un puerto disponible.
  servidor = app.listen(0, '127.0.0.1');

  await new Promise((resolver, rechazar) => {
    servidor.once('listening', resolver);
    servidor.once('error', rechazar);
  });

  urlBase =
    `http://127.0.0.1:${servidor.address().port}`;
});

// =======================================================
// FINALIZACIÓN DE LAS PRUEBAS
// =======================================================

// Cerrar el servidor y la base temporal al terminar.

after(async () => {
  if (servidor) {
    await new Promise((resolver, rechazar) => {
      servidor.close(error =>
        error ? rechazar(error) : resolver()
      );
    });
  }

  if (db) {
    db.close();
  }
});

// =======================================================
// REG-01: REGISTRO CORRECTO DE UN USUARIO
// =======================================================

// Objetivo:
// Verificar que un usuario con datos válidos
// pueda crear una cuenta correctamente.
//
// También comprobamos que la contraseña se guarde
// mediante un hash bcrypt y no como texto plano.

test('REG-01: registra un usuario correctamente', async () => {

  // Preparar los datos.
  const datos = usuarioValido();

  // Enviar los datos al backend.
  const respuesta = await enviarRegistro(datos);
  const cuerpo = await respuesta.json();

  // Debe responder HTTP 201: cuenta creada.
  assert.equal(respuesta.status, 201);

  // La respuesta debe contener el ID del usuario.
  assert.ok(Number.isInteger(cuerpo.id));

  // Buscar al usuario en SQLite.
  const guardado = db.prepare(
    'SELECT * FROM usuarios WHERE id = ?'
  ).get(cuerpo.id);

  // Comprobar que realmente se guardó.
  assert.ok(guardado);

  // Comparar los datos registrados.
  assert.equal(guardado.nombre, datos.nombre);
  assert.equal(guardado.ci, datos.ci);
  assert.equal(guardado.telefono, datos.telefono);
  assert.equal(guardado.rol, datos.rol);

  // La contraseña guardada no debe ser la original.
  assert.notEqual(
    guardado.password_hash,
    datos.password
  );

  // Verificar que bcrypt reconoce la contraseña.
  assert.equal(
    await bcrypt.compare(
      datos.password,
      guardado.password_hash
    ),
    true
  );

  // No se debe devolver la contraseña ni el hash.
  assert.equal(cuerpo.password, undefined);
  assert.equal(cuerpo.password_hash, undefined);
});

// =======================================================
// REG-02: REGISTRO CON DATOS INCORRECTOS
// =======================================================

// Objetivo:
// Verificar que validarRegistro() rechace
// nombre, CI, teléfono y contraseña incorrectos.

test('REG-02: rechaza datos inválidos', async () => {

  // Preparar un usuario con datos incorrectos.
  const datos = usuarioValido({
    nombre: 'A',
    ci: 'ABC',
    telefono: '123',
    password: '12'
  });

  const respuesta = await enviarRegistro(datos);
  const cuerpo = await respuesta.json();

  // HTTP 400 significa datos inválidos.
  assert.equal(respuesta.status, 400);

  // Debe existir un mensaje de error.
  assert.ok(cuerpo.error);

  // Verificar que el usuario no fue guardado.
  const guardado = db.prepare(
    'SELECT id FROM usuarios WHERE ci = ?'
  ).get(datos.ci);

  assert.equal(guardado, undefined);
});

// =======================================================
// REG-03: CONSENTIMIENTO OBLIGATORIO
// =======================================================

// Objetivo:
// Verificar que una cuenta no pueda crearse
// sin aceptar el tratamiento de datos personales.

test('REG-03: rechaza registro sin consentimiento', async () => {

  const datos = usuarioValido({
    consentimiento: false
  });

  const respuesta = await enviarRegistro(datos);

  // Debe rechazar la solicitud.
  assert.equal(respuesta.status, 400);
});

// =======================================================
// REG-04: VALIDACIÓN DEL ROL DEL USUARIO
// =======================================================

// Objetivo:
// Verificar que solamente se acepten los roles
// "trabajador" y "empleador".

test('REG-04: rechaza rol no permitido', async () => {

  const datos = usuarioValido({
    rol: 'admin'
  });

  const respuesta = await enviarRegistro(datos);

  // No debe permitir registrar un administrador.
  assert.equal(respuesta.status, 400);
});

// =======================================================
// REG-05: CI DUPLICADO
// =======================================================

// Objetivo:
// Comprobar que dos cuentas no puedan tener
// el mismo número de carnet de identidad.

test('REG-05: rechaza CI duplicado', async () => {

  // Registrar el primer usuario.
  const primero = usuarioValido();

  const respuesta1 = await enviarRegistro(primero);

  // El primer registro debe funcionar.
  assert.equal(respuesta1.status, 201);

  // Crear otro usuario con el mismo CI.
  // El teléfono será diferente.
  const segundo = usuarioValido({
    ci: primero.ci
  });

  const respuesta2 = await enviarRegistro(segundo);

  // HTTP 409 significa conflicto por duplicación.
  assert.equal(respuesta2.status, 409);
});

// =======================================================
// REG-06: TELÉFONO DUPLICADO
// =======================================================

// Objetivo:
// Comprobar que dos cuentas no puedan registrarse
// utilizando el mismo número de teléfono.

test('REG-06: rechaza teléfono duplicado', async () => {

  // Registrar el primer usuario.
  const primero = usuarioValido();

  const respuesta1 = await enviarRegistro(primero);

  assert.equal(respuesta1.status, 201);

  // Crear otro usuario con el mismo teléfono.
  // Su CI será diferente.
  const segundo = usuarioValido({
    telefono: primero.telefono
  });

  const respuesta2 = await enviarRegistro(segundo);

  // Debe rechazar el registro duplicado.
  assert.equal(respuesta2.status, 409);
});
