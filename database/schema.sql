-- =====================================================================
-- Natalia Arze — Base de datos
-- schema.sql — Define las tablas de la base de datos (cuentas, roles y perfiles). db.js lo ejecuta al arrancar y solo crea las tablas que faltan.
-- =====================================================================
--
-- Cuentas de usuario: datos de acceso e identidad.
-- El CI y el teléfono son UNIQUE: no puede haber dos cuentas con el mismo (CA-02).
-- La contraseña se guarda solo como hash, nunca en texto plano.
-- Las columnas ciudad, habilidades, experiencia, género y edad son antiguas:
-- ahora esos datos viven en perfiles_trabajador y perfiles_empleador.
CREATE TABLE IF NOT EXISTS usuarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    ci TEXT NOT NULL UNIQUE,
    telefono TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    rol TEXT NOT NULL
        CHECK (rol IN ('trabajador', 'empleador')),
    ciudad TEXT,
    habilidades TEXT,
    experiencia TEXT,
    genero TEXT,
    edad INTEGER,
    estado_verificacion TEXT NOT NULL
        DEFAULT 'no_verificado',
    consentimiento_fecha TEXT NOT NULL,
    creado_en TEXT NOT NULL
        DEFAULT CURRENT_TIMESTAMP
);

-- usuarios.rol se conserva temporalmente para compatibilidad y referencia al rol inicial.
-- usuario_roles es la fuente de verdad para los permisos de perfil.
-- Roles de cada cuenta: una fila por rol. Una misma cuenta puede ser
-- trabajador y empleador (dos filas). No se puede repetir el mismo rol.
-- Si se borra el usuario, se borran también sus roles (ON DELETE CASCADE).
CREATE TABLE IF NOT EXISTS usuario_roles (
    usuario_id INTEGER NOT NULL
        REFERENCES usuarios(id) ON DELETE CASCADE,
    rol TEXT NOT NULL
        CHECK (rol IN ('trabajador', 'empleador')),
    PRIMARY KEY (usuario_id, rol)
);

-- Perfil de trabajador: una fila por usuario que tiene el rol trabajador.
-- Guarda ciudad, habilidades, experiencia, género y edad.
CREATE TABLE IF NOT EXISTS perfiles_trabajador (
    usuario_id INTEGER PRIMARY KEY
        REFERENCES usuarios(id) ON DELETE CASCADE,
    ciudad TEXT,
    habilidades TEXT,
    experiencia TEXT,
    genero TEXT,
    edad INTEGER
);

-- Perfil de empleador: una fila por usuario que tiene el rol empleador.
-- Solo guarda ciudad, género y edad (no tiene habilidades ni experiencia).
CREATE TABLE IF NOT EXISTS perfiles_empleador (
    usuario_id INTEGER PRIMARY KEY
        REFERENCES usuarios(id) ON DELETE CASCADE,
    ciudad TEXT,
    genero TEXT,
    edad INTEGER
);
