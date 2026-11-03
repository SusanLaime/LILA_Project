// =====================================================================
// DUEÑA/O: Natalia Arze — Base de datos (P-00)
// Registro de resultados: README.md (sección Pruebas)
// Se ejecuta con: npm test   (usa el ejecutor incorporado de Node: node --test)
// =====================================================================
//
// TODO (Natalia): P-00 — la base de datos se crea al iniciar y la tabla "usuarios"
//                   rechaza un CI o un teléfono repetido (UNIQUE) y un rol distinto de
//                   'trabajador' / 'empleador' (CHECK).
// TODO (Natalia): usar una base de datos de prueba (DB_PATH distinto), nunca la de la demostración.
// TODO (Natalia): anotar el resultado real en README.md (sección Pruebas) (fecha, entorno y commit).

import test from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { readFileSync } from 'node:fs';

// Leer el esquema que ya creaste
const esquema = readFileSync(
  new URL('../database/schema.sql', import.meta.url),
  'utf8'
);

// Crear una base de datos temporal para cada prueba
function conBDDePrueba(callback) {
  const db = new DatabaseSync(':memory:');

  try {
    db.exec(esquema);
    callback(db);
  } finally {
    db.close();
  }
}

// Insertar un usuario ficticio
function insertarUsuario(db, {
  ci = '1234567',
  telefono = '70000001',
  rol = 'trabajador'
} = {}) {
  return db.prepare(`
    INSERT INTO usuarios
    (nombre, ci, telefono, password_hash, rol, consentimiento_fecha)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(
    'Ana Prueba',
    ci,
    telefono,
    'hash_ficticio_solo_prueba',
    rol,
    new Date().toISOString()
  );
}

// PRUEBA 1: Verificar que existe la tabla
test('DB-00: la tabla usuarios existe', () => {
  conBDDePrueba(db => {
    const tabla = db.prepare(
      "SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'usuarios'"
    ).get();

    assert.equal(tabla.name, 'usuarios');
  });
});

// PRUEBA 2: Insertar un usuario
test('DB-00: permite registrar un usuario', () => {
  conBDDePrueba(db => {
    insertarUsuario(db);

    const resultado = db.prepare(
      'SELECT COUNT(*) AS total FROM usuarios'
    ).get();

    assert.equal(resultado.total, 1);
  });
});

// PRUEBA 3: Rechazar CI duplicado
test('DB-00: rechaza CI duplicado', () => {
  conBDDePrueba(db => {
    insertarUsuario(db);

    assert.throws(
      () => insertarUsuario(db, { telefono: '70000002' }),
      /UNIQUE constraint failed/
    );

    assert.equal(
      db.prepare('SELECT COUNT(*) AS total FROM usuarios').get().total,
      1
    );
  });
});

// PRUEBA 4: Rechazar teléfono duplicado
test('DB-00: rechaza teléfono duplicado', () => {
  conBDDePrueba(db => {
    insertarUsuario(db);

    assert.throws(
      () => insertarUsuario(db, { ci: '7654321' }),
      /UNIQUE constraint failed/
    );

    assert.equal(
      db.prepare('SELECT COUNT(*) AS total FROM usuarios').get().total,
      1
    );
  });
});

// PRUEBA 5: Rechazar rol no permitido
test('DB-00: rechaza rol admin', () => {
  conBDDePrueba(db => {
    assert.throws(
      () => insertarUsuario(db, { rol: 'admin' }),
      /CHECK constraint failed/
    );

    assert.equal(
      db.prepare('SELECT COUNT(*) AS total FROM usuarios').get().total,
      0
    );
  });
});
