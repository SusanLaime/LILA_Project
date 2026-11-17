-- =====================================================================
-- DUEÑA/O: Natalia Arze — Base de datos
-- Modelo objetivo: docs/API.md (sección "Modelo de datos")
-- =====================================================================
--
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
CREATE TABLE IF NOT EXISTS usuario_roles (
    usuario_id INTEGER NOT NULL
        REFERENCES usuarios(id) ON DELETE CASCADE,
    rol TEXT NOT NULL
        CHECK (rol IN ('trabajador', 'empleador')),
    PRIMARY KEY (usuario_id, rol)
);

CREATE TABLE IF NOT EXISTS perfiles_trabajador (
    usuario_id INTEGER PRIMARY KEY
        REFERENCES usuarios(id) ON DELETE CASCADE,
    ciudad TEXT,
    habilidades TEXT,
    experiencia TEXT,
    genero TEXT,
    edad INTEGER
);

CREATE TABLE IF NOT EXISTS perfiles_empleador (
    usuario_id INTEGER PRIMARY KEY
        REFERENCES usuarios(id) ON DELETE CASCADE,
    ciudad TEXT,
    genero TEXT,
    edad INTEGER
);
