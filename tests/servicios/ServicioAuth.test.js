// Prueba ServicioAuth sin Express ni base de datos: usa un repositorio, un
// hasheador y unos tokens falsos en memoria (inversión de dependencias).
import test from 'node:test';
import assert from 'node:assert/strict';
import { ServicioAuth } from '../../backend/servicios/ServicioAuth.js';

class RepositorioFalso {
  usuarios = [];
  buscarPorId(id) { return this.usuarios.find(u => u.id === id) ?? null; }
  buscarPorCi(ci) { return this.usuarios.find(u => u.ci === ci) ?? null; }
  existe(ci, telefono) { return this.usuarios.some(u => u.ci === ci || u.telefono === telefono); }
  guardar(usuario) {
    if (usuario.id === null) {
      usuario.id = this.usuarios.length + 1;
      this.usuarios.push(usuario);
    }
    return usuario;
  }
}

const hasheador = {
  hashear: async password => `hash:${password}`,
  comparar: async (password, hash) => hash === `hash:${password}`
};
const tokens = { crear: id => `token-${id}`, verificar: () => null };

const datosValidos = {
  nombre: 'Ana Prueba',
  ci: '1234567',
  telefono: '70000001',
  password: 'secreta123',
  consentimiento: true,
  roles: ['trabajador', 'empleador']
};

test('SRV-01: registra un usuario con sus dos perfiles', async () => {
  const usuarios = new RepositorioFalso();
  const servicio = new ServicioAuth({ usuarios, hasheador, tokens });

  const usuario = await servicio.registrar(datosValidos);

  assert.equal(usuario.id, 1);
  assert.equal(usuario.passwordHash, 'hash:secreta123');
  assert.deepEqual(usuario.roles(), ['trabajador', 'empleador']);
});

test('SRV-02: rechaza CI o teléfono repetido con estado 409', async () => {
  const usuarios = new RepositorioFalso();
  const servicio = new ServicioAuth({ usuarios, hasheador, tokens });
  await servicio.registrar(datosValidos);

  await assert.rejects(servicio.registrar(datosValidos), { estado: 409 });
});

test('SRV-03: inicia sesión y rechaza la contraseña incorrecta', async () => {
  const usuarios = new RepositorioFalso();
  const servicio = new ServicioAuth({ usuarios, hasheador, tokens });
  await servicio.registrar(datosValidos);

  const resultado = await servicio.iniciarSesion({ ci: '1234567', password: 'secreta123' });
  assert.equal(resultado.token, 'token-1');
  assert.deepEqual(resultado.usuario, {
    id: 1, nombre: 'Ana Prueba', rol: 'trabajador', roles: ['trabajador', 'empleador']
  });

  await assert.rejects(
    servicio.iniciarSesion({ ci: '1234567', password: 'otra-clave' }),
    { estado: 401, message: 'Carnet o contraseña incorrectos.' }
  );
});
