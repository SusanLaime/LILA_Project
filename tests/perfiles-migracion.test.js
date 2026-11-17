import test, { after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { DatabaseSync } from 'node:sqlite';

const directorioTemporal = mkdtempSync(join(tmpdir(), 'lila-migracion-'));
const rutaBD = join(directorioTemporal, 'legacy.db');
const dbAnterior = new DatabaseSync(rutaBD);

dbAnterior.exec(`
  CREATE TABLE usuarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    ci TEXT NOT NULL UNIQUE,
    telefono TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    rol TEXT NOT NULL CHECK (rol IN ('trabajador', 'empleador')),
    ciudad TEXT,
    habilidades TEXT,
    experiencia TEXT,
    estado_verificacion TEXT NOT NULL DEFAULT 'no_verificado',
    consentimiento_fecha TEXT NOT NULL,
    creado_en TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
  INSERT INTO usuarios (
    nombre, ci, telefono, password_hash, rol, ciudad, habilidades,
    experiencia, consentimiento_fecha
  ) VALUES (
    'Ana Trabajadora', '1234567', '70000001', 'hash', 'trabajador',
    'La Paz', 'Ventas', 'Un año', '2026-01-01'
  );
  INSERT INTO usuarios (
    nombre, ci, telefono, password_hash, rol, ciudad, consentimiento_fecha
  ) VALUES (
    'Empleador Prueba', '1234568', '70000002', 'hash', 'empleador',
    'Santa Cruz', '2026-01-02'
  );
`);
dbAnterior.close();

process.env.DB_PATH = rutaBD;
const { default: db } = await import('../backend/db.js');

after(() => {
  db.close();
  rmSync(directorioTemporal, { recursive: true, force: true });
});

test('migra roles y perfiles existentes sin perder sus datos', () => {
  const roles = db.prepare(`
    SELECT usuario_id, rol
    FROM usuario_roles
    ORDER BY usuario_id
  `).all().map(({ usuario_id, rol }) => ({ usuario_id, rol }));
  assert.deepEqual(roles, [
    { usuario_id: 1, rol: 'trabajador' },
    { usuario_id: 2, rol: 'empleador' }
  ]);

  const perfilTrabajador = db.prepare(`
    SELECT ciudad, habilidades, experiencia
    FROM perfiles_trabajador
    WHERE usuario_id = 1
  `).get();
  assert.equal(perfilTrabajador.ciudad, 'La Paz');
  assert.equal(perfilTrabajador.habilidades, 'Ventas');
  assert.equal(perfilTrabajador.experiencia, 'Un año');
  assert.equal(
    db.prepare(`
      SELECT ciudad
      FROM perfiles_empleador
      WHERE usuario_id = 2
    `).get().ciudad,
    'Santa Cruz'
  );
});
