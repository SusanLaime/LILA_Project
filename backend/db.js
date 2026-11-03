// =====================================================================
// DUEÑA/O: Natalia Arze — Base de datos
// Responsables: README.md (sección Equipo)  ·  Modelo de datos: docs/API.md
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

// 8. Exportar la conexión para otros módulos
export { db };
export default db;
