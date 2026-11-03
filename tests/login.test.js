// =====================================================================
// Pruebas de inicio de sesión con SQLite en memoria.
// =====================================================================

import test, { after } from 'node:test';
import assert from 'node:assert/strict';
import jwt from 'jsonwebtoken';
import { validarLogin } from '../backend/validacion.js';

process.env.DB_PATH = ':memory:';
process.env.JWT_SECRET = 'solo-para-pruebas-de-integracion';

const [
  { default: express },
  { default: loginRouter },
  { default: db },
  { hashPassword }
] = await Promise.all([
  import('express'),
  import('../backend/routes/login.js'),
  import('../backend/db.js'),
  import('../backend/seguridad.js')
]);

const password = 'clave-de-prueba';
const passwordHash = await hashPassword(password);
const insert = db.prepare(`
  INSERT INTO usuarios (
    nombre, ci, telefono, password_hash, rol, consentimiento_fecha
  )
  VALUES (?, ?, ?, ?, ?, ?)
`);
const usuarioId = Number(insert.run(
  'Ana Prueba',
  '1234567',
  '70000001',
  passwordHash,
  'trabajador',
  new Date().toISOString()
).lastInsertRowid);

const app = express();
app.use(express.json());
app.use('/api/login', loginRouter);

const server = app.listen(0, '127.0.0.1');
await new Promise(resolve => server.once('listening', resolve));
const url = `http://127.0.0.1:${server.address().port}/api/login`;

after(async () => {
  await new Promise((resolve, reject) => {
    server.close(error => error ? reject(error) : resolve());
  });
  db.close();
});

async function iniciarSesion(datos) {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(datos)
  });
  return { response, body: await response.json() };
}

test('P-04: login correcto devuelve token de 8 horas y usuario público', async () => {
  const { response, body } = await iniciarSesion({
    ci: '1234567',
    password
  });

  assert.equal(response.status, 200);
  assert.deepEqual(body.usuario, {
    id: usuarioId,
    nombre: 'Ana Prueba',
    rol: 'trabajador'
  });

  const payload = jwt.verify(body.token, process.env.JWT_SECRET);
  assert.equal(payload.id, usuarioId);
  assert.equal(payload.exp - payload.iat, 8 * 60 * 60);
  assert.equal('password_hash' in body.usuario, false);
});

test('P-05: contraseña incorrecta y CI inexistente responden igual', async () => {
  const incorrecta = await iniciarSesion({
    ci: '1234567',
    password: 'otra-clave'
  });
  const inexistente = await iniciarSesion({
    ci: '7654321',
    password: 'otra-clave'
  });

  assert.equal(incorrecta.response.status, 401);
  assert.equal(inexistente.response.status, 401);
  assert.deepEqual(incorrecta.body, inexistente.body);
  assert.equal(incorrecta.body.error, 'Carnet o contraseña incorrectos.');
});

test('login valida que CI válido y contraseña estén presentes', async () => {
  for (const datos of [
    {},
    { ci: '1234567' },
    { ci: '1234', password },
    { password }
  ]) {
    const { response, body } = await iniciarSesion(datos);
    assert.equal(response.status, 400);
    assert.equal(typeof body.error, 'string');
    assert.ok(body.error.length > 0);
  }
});

test('validarLogin devuelve el formato acordado', () => {
  assert.deepEqual(validarLogin({
    ci: '1234567',
    password
  }), { ok: true });
  assert.equal(validarLogin({ ci: '1234', password }).ok, false);
  assert.equal(validarLogin(null).ok, false);
});
