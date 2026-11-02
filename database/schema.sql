-- =====================================================================
-- DUEÑA/O: Natalia Arze — Base de datos
-- Modelo de datos acordado: docs/API.md (sección "Modelo de datos")
-- =====================================================================
--
-- TODO (Natalia): crear la tabla "usuarios" (CREATE TABLE IF NOT EXISTS ...)
--                   con las columnas y restricciones descritas en docs/API.md.
--                   Importante:
--                   - "ci" y "telefono" deben ser UNIQUE (soporta la regla CA-02).
--                   - "rol" solo acepta 'trabajador' o 'empleador' (restricción CHECK).

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
    estado_verificacion TEXT NOT NULL
        DEFAULT 'no_verificado',
    consentimiento_fecha TEXT NOT NULL,
    creado_en TEXT NOT NULL
        DEFAULT CURRENT_TIMESTAMP
);
