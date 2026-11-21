// Tests /api/perfil: it requires a session, returns the roles and active profile, adds a missing role, blocks editing roles the user does not have, and keeps worker and employer data separate.
// Prueba /api/perfil: exige sesión, devuelve los roles y el perfil activo, agrega un rol faltante, impide editar roles que el usuario no tiene y mantiene separados los datos de trabajador y empleador.
import test, { after } from 'node:test';
import assert from 'node:assert/strict';

process.env.DB_PATH = ':memory:';
process.env.JWT_SECRET = 'solo-para-pruebas-de-integracion';

const [
  { default: express },
  { default: perfilRouter },
  { default: db },
  { crearToken }
] = await Promise.all([
  import('express'),
  import('../backend/controladores/perfilController.js'),
  import('../backend/db.js'),
  import('../backend/seguridad.js')
]);

const usuarioId = Number(db.prepare(`
  INSERT INTO usuarios (
    nombre, ci, telefono, password_hash, rol, consentimiento_fecha
  )
  VALUES (?, ?, ?, ?, ?, ?)
`).run(
  'Ana Prueba',
  '1234567',
  '70000001',
  'hash-solo-pruebas',
  'trabajador',
  new Date().toISOString()
).lastInsertRowid);

db.prepare(
  'INSERT INTO usuario_roles (usuario_id, rol) VALUES (?, ?)'
).run(usuarioId, 'trabajador');
db.prepare(`
  INSERT INTO perfiles_trabajador (
    usuario_id, ciudad, habilidades, experiencia, genero, edad
  )
  VALUES (?, ?, ?, ?, ?, ?)
`).run(usuarioId, 'La Paz', 'Ventas', 'Un año', 'femenino', 25);

const app = express();
app.use(express.json());
app.use('/api/perfil', perfilRouter);

const server = app.listen(0, '127.0.0.1');
await new Promise(resolve => server.once('listening', resolve));
const url = `http://127.0.0.1:${server.address().port}/api/perfil`;
const token = crearToken({ id: usuarioId });

after(async () => {
  await new Promise((resolve, reject) => {
    server.close(error => error ? reject(error) : resolve());
  });
  db.close();
});

async function pedirPerfil({ method = 'GET', body, authorization = `Bearer ${token}`, rol } = {}) {
  const response = await fetch(
    rol ? `${url}?rol=${encodeURIComponent(rol)}` : url,
    {
      method,
      headers: {
        ...(authorization ? { Authorization: authorization } : {}),
        ...(body ? { 'Content-Type': 'application/json' } : {})
      },
      body: body ? JSON.stringify(body) : undefined
    }
  );
  return { response, body: await response.json() };
}

test('GET perfil requiere sesión y devuelve roles y perfil activo', async () => {
  const anonimo = await pedirPerfil({ authorization: '' });
  assert.equal(anonimo.response.status, 401);

  const resultado = await pedirPerfil();
  assert.equal(resultado.response.status, 200);
  assert.equal(resultado.response.headers.get('cache-control'), 'no-store');
  assert.deepEqual(resultado.body.roles, ['trabajador']);
  assert.equal(resultado.body.rol, 'trabajador');
  assert.equal(resultado.body.ciudad, 'La Paz');
  assert.equal(resultado.body.perfiles.trabajador.experiencia, 'Un año');
  assert.equal('ci' in resultado.body, false);
  assert.equal('password_hash' in resultado.body, false);
});

test('POST perfil roles requiere sesión y agrega el rol faltante a la misma cuenta', async () => {
  const anonimo = await fetch(`${url}/roles`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ rol: 'empleador' })
  });
  assert.equal(anonimo.status, 401);
  const rolInvalido = await fetch(`${url}/roles`, {
    method: 'POST',
    headers: {
      Authorization: 'Bearer ' + token,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ rol: 'admin' })
  });
  assert.equal(rolInvalido.status, 400);

  const nuevoUsuarioId = Number(db.prepare(`
    INSERT INTO usuarios (
      nombre, ci, telefono, password_hash, rol, consentimiento_fecha
    )
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(
    'Luis Prueba',
    '1234568',
    '70000002',
    'hash-solo-pruebas',
    'trabajador',
    new Date().toISOString()
  ).lastInsertRowid);
  db.prepare(
    'INSERT INTO usuario_roles (usuario_id, rol) VALUES (?, ?)'
  ).run(nuevoUsuarioId, 'trabajador');
  db.prepare(
    'INSERT INTO perfiles_trabajador (usuario_id) VALUES (?)'
  ).run(nuevoUsuarioId);

  const tokenUsuario = crearToken({ id: nuevoUsuarioId });
  const pedirAgregarRol = () => fetch(`${url}/roles`, {
    method: 'POST',
    headers: {
      Authorization: 'Bearer ' + tokenUsuario,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ rol: 'empleador' })
  });
  const agregado = await pedirAgregarRol();
  const cuerpoAgregado = await agregado.json();
  assert.equal(agregado.status, 200, cuerpoAgregado.error);
  assert.deepEqual(cuerpoAgregado.roles, ['trabajador', 'empleador']);
  assert.ok(db.prepare(
    'SELECT usuario_id FROM perfiles_empleador WHERE usuario_id = ?'
  ).get(nuevoUsuarioId));
  assert.equal(db.prepare(
    'SELECT COUNT(*) AS total FROM usuarios WHERE id = ?'
  ).get(nuevoUsuarioId).total, 1);

  const repetido = await pedirAgregarRol();
  const cuerpoRepetido = await repetido.json();
  assert.equal(repetido.status, 200);
  assert.deepEqual(cuerpoRepetido.roles, ['trabajador', 'empleador']);
  assert.equal(db.prepare(
    'SELECT COUNT(*) AS total FROM usuario_roles WHERE usuario_id = ? AND rol = ?'
  ).get(nuevoUsuarioId, 'empleador').total, 1);
});

test('PUT perfil no permite modificar roles no asignados', async () => {
  const resultado = await pedirPerfil({
    method: 'PUT',
    body: {
      rol: 'empleador',
      ciudad: 'Cochabamba',
      habilidades: '',
      experiencia: '',
      genero: 'femenino',
      edad: 30
    }
  });

  assert.equal(resultado.response.status, 403);
  assert.equal(resultado.body.error, 'No tienes activo ese perfil.');
});

test('PUT perfil guarda los datos del perfil trabajador', async () => {
  const resultado = await pedirPerfil({
    method: 'PUT',
    body: {
      rol: 'trabajador',
      ciudad: 'Cochabamba',
      habilidades: 'Atención al cliente',
      experiencia: 'Dos años',
      genero: 'femenino',
      edad: 30
    }
  });

  assert.equal(resultado.response.status, 200);
  assert.equal(resultado.body.ciudad, 'Cochabamba');
  assert.equal(resultado.body.habilidades, 'Atención al cliente');
  assert.equal(resultado.body.perfiles.trabajador.edad, 30);
});

test('una cuenta con ambos roles mantiene separados sus perfiles', async () => {
  db.prepare(
    'INSERT INTO usuario_roles (usuario_id, rol) VALUES (?, ?)'
  ).run(usuarioId, 'empleador');
  db.prepare(
    'INSERT INTO perfiles_empleador (usuario_id, ciudad) VALUES (?, ?)'
  ).run(usuarioId, 'Santa Cruz');

  const actualizacion = await pedirPerfil({
    method: 'PUT',
    body: {
      rol: 'empleador',
      ciudad: 'Sucre',
      habilidades: '',
      experiencia: '',
      genero: 'otro',
      edad: 40
    }
  });
  assert.equal(actualizacion.response.status, 200);
  assert.equal(actualizacion.body.rol, 'empleador');
  assert.deepEqual(actualizacion.body.roles, ['trabajador', 'empleador']);
  assert.equal(actualizacion.body.ciudad, 'Sucre');

  const trabajador = await pedirPerfil({ rol: 'trabajador' });
  assert.equal(trabajador.body.ciudad, 'Cochabamba');
  assert.equal(trabajador.body.habilidades, 'Atención al cliente');

  const empleador = await pedirPerfil({ rol: 'empleador' });
  assert.equal(empleador.body.ciudad, 'Sucre');
  assert.equal(empleador.body.habilidades, null);
});
