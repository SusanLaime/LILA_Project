-- =====================================================================
-- DUEÑA/O: Persona 1 — Tarea T-01 (Base de datos)
-- Modelo de datos acordado: docs/API.md (sección "Modelo de datos")
-- =====================================================================
--
CREATE TABLE IF NOT EXISTS usuarios (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre TEXT NOT NULL,
  ci TEXT NOT NULL UNIQUE,
  telefono TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  rol TEXT NOT NULL DEFAULT 'trabajador',
  ciudad TEXT,
  habilidades TEXT,
  experiencia TEXT,
  estado_verificacion TEXT NOT NULL DEFAULT 'no_verificado',
  consentimiento_fecha TEXT NOT NULL,
  creado_en TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
