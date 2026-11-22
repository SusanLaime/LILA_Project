// =====================================================================
// Natalia Arze — Base de datos
// db.js — Abre la base de datos SQLite, crea las tablas, carga datos de prueba y comparte una sola conexión con todo el backend.
// =====================================================================
// Regla para todo el equipo: usar SIEMPRE consultas preparadas (db.prepare("... ?")),
// nunca concatenar datos del usuario dentro del SQL (evita inyección SQL).


import { DatabaseSync } from 'node:sqlite';
import { readFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';

// 1. Ubicar la carpeta principal del proyecto
const raiz = fileURLToPath(new URL('../', import.meta.url));

// 2. Obtener la ruta de la base de datos desde .env
const rutaConfigurada = process.env.DB_PATH || 'database/lila.db';

const rutaBD = rutaConfigurada === ':memory:'
  ? ':memory:'
  : resolve(raiz, rutaConfigurada);

// 3. Crear la carpeta si no existe
if (rutaBD !== ':memory:') {
  mkdirSync(dirname(rutaBD), { recursive: true });
}

// 4. Abrir o crear la base de datos SQLite
const db = new DatabaseSync(rutaBD);

// 5. Activar las claves foráneas
db.exec('PRAGMA foreign_keys = ON');

// 6. Ejecutar el esquema de las tablas
const esquema = readFileSync(
  join(raiz, 'database', 'schema.sql'),
  'utf8'
);

db.exec(esquema);

/* =====================================================
   Actualización automática del perfil del trabajador
   Las bases creadas antes no tenían las columnas género y edad;
   aquí se agregan solo si faltan, sin borrar datos.
   ===================================================== */

// Consultar las columnas existentes en usuarios
const columnasUsuarios = db.prepare(
  'PRAGMA table_info(usuarios)'
).all();

const nombresColumnas = new Set(
  columnasUsuarios.map(columna => columna.name)
);

// Agregar género si todavía no existe
if (!nombresColumnas.has('genero')) {
  db.exec('ALTER TABLE usuarios ADD COLUMN genero TEXT');
}

// Agregar edad si todavía no existe
if (!nombresColumnas.has('edad')) {
  db.exec('ALTER TABLE usuarios ADD COLUMN edad INTEGER');
}

// 7. Cargar datos de prueba si no existen usuarios
const resultado = db.prepare(
  'SELECT COUNT(*) AS total FROM usuarios'
).get();

if (resultado.total === 0) {
  const datosPrueba = readFileSync(
    join(raiz, 'database', 'seed.sql'),
    'utf8'
  );

  db.exec(datosPrueba);
}

// Migrar las cuentas existentes a roles y perfiles separados sin borrar datos.
// Copia el rol de cada usuario a usuario_roles y sus datos de perfil a
// perfiles_trabajador o perfiles_empleador. "OR IGNORE" evita duplicar lo que ya se copió,
// así que es seguro repetirlo cada vez que arranca el servidor.
// Si algo falla, se deshace todo (ROLLBACK).
db.exec('BEGIN');
try {
  db.exec(`
    INSERT OR IGNORE INTO usuario_roles (usuario_id, rol)
    SELECT id, rol
    FROM usuarios;

    INSERT OR IGNORE INTO perfiles_trabajador (
      usuario_id, ciudad, habilidades, experiencia, genero, edad
    )
    SELECT id, ciudad, habilidades, experiencia, genero, edad
    FROM usuarios
    WHERE rol = 'trabajador';

    INSERT OR IGNORE INTO perfiles_empleador (
      usuario_id, ciudad, genero, edad
    )
    SELECT id, ciudad, genero, edad
    FROM usuarios
    WHERE rol = 'empleador';
  `);
  db.exec('COMMIT');
} catch (error) {
  db.exec('ROLLBACK');
  throw error;
}

// 8. Exportar la conexión para otros módulos
export { db };
export default db;
