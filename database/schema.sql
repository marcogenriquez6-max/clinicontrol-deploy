-- ================================================
-- HISTORIA CLÍNICA ELECTRÓNICA (HCE)
-- Base de Datos Normalizada 3FN + Auditoría
-- PostgreSQL v15+
-- ================================================

-- ================================================
-- 1. TABLAS CATÁLOGO
-- ================================================

CREATE TABLE IF NOT EXISTS rol (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(50) UNIQUE NOT NULL,
    descripcion VARCHAR(200),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS genero (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    codigo CHAR(1) UNIQUE
);

CREATE TABLE IF NOT EXISTS grupo_sanguineo (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(10) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS especialidad (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    descripcion VARCHAR(300)
);

CREATE TABLE IF NOT EXISTS estado_cita (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE,
    codigo VARCHAR(20) UNIQUE
);

-- ================================================
-- 2. TABLAS PRINCIPALES
-- ================================================

CREATE TABLE IF NOT EXISTS usuario (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    ci VARCHAR(20) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    telefono VARCHAR(20),
    rol_id INTEGER NOT NULL REFERENCES rol(id) ON DELETE RESTRICT,
    activo BOOLEAN DEFAULT TRUE,
    bloqueado BOOLEAN DEFAULT FALSE,
    bloqueado_motivo VARCHAR(200),
    intentos_fallidos INTEGER DEFAULT 0 CHECK (intentos_fallidos >= 0),
    ultimo_login TIMESTAMPTZ,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_usuario_email ON usuario(email);
CREATE INDEX idx_usuario_ci ON usuario(ci);
CREATE INDEX idx_usuario_rol ON usuario(rol_id);
CREATE INDEX idx_usuario_activo ON usuario(activo) WHERE activo = TRUE;

CREATE TABLE IF NOT EXISTS paciente (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    ci VARCHAR(20) UNIQUE NOT NULL,
    fecha_nacimiento DATE NOT NULL,
    genero_id INTEGER NOT NULL REFERENCES genero(id) ON DELETE RESTRICT,
    telefono VARCHAR(20),
    direccion TEXT,
    email VARCHAR(255),
    grupo_sanguineo_id INTEGER REFERENCES grupo_sanguineo(id) ON DELETE SET NULL,
    alergias TEXT,
    antecedentes TEXT,
    activo BOOLEAN DEFAULT TRUE,
    usuario_registro_id INTEGER REFERENCES usuario(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_paciente_ci ON paciente(ci);
CREATE INDEX idx_paciente_apellido_nombre ON paciente(apellido, nombre);
CREATE INDEX idx_paciente_genero ON paciente(genero_id);
CREATE INDEX idx_paciente_activo ON paciente(activo) WHERE activo = TRUE;

CREATE TABLE IF NOT EXISTS medico (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    especialidad_id INTEGER NOT NULL REFERENCES especialidad(id) ON DELETE RESTRICT,
    telefono VARCHAR(20),
    email VARCHAR(255) UNIQUE,
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_medico_especialidad ON medico(especialidad_id);
CREATE INDEX idx_medico_activo ON medico(activo) WHERE activo = TRUE;

-- ================================================
-- 3. TABLAS DE NEGOCIO
-- ================================================

CREATE TABLE IF NOT EXISTS cita (
    id SERIAL PRIMARY KEY,
    paciente_id INTEGER NOT NULL REFERENCES paciente(id) ON DELETE CASCADE,
    medico_id INTEGER NOT NULL REFERENCES medico(id) ON DELETE RESTRICT,
    estado_cita_id INTEGER NOT NULL REFERENCES estado_cita(id) ON DELETE RESTRICT DEFAULT 1,
    fecha TIMESTAMPTZ NOT NULL,
    duracion_minutos INTEGER DEFAULT 30 CHECK (duracion_minutos > 0),
    motivo TEXT,
    notas TEXT,
    cancelado_motivo VARCHAR(300),
    created_by INTEGER REFERENCES usuario(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_cita_paciente ON cita(paciente_id);
CREATE INDEX idx_cita_medico ON cita(medico_id);
CREATE INDEX idx_cita_fecha ON cita(fecha);
CREATE INDEX idx_cita_estado ON cita(estado_cita_id);
CREATE INDEX idx_cita_medico_fecha ON cita(medico_id, fecha);
CREATE INDEX idx_cita_paciente_fecha ON cita(paciente_id, fecha);

CREATE TABLE IF NOT EXISTS cie10 (
    id SERIAL PRIMARY KEY,
    codigo VARCHAR(10) UNIQUE NOT NULL,
    descripcion VARCHAR(500) NOT NULL,
    es_cronico BOOLEAN DEFAULT FALSE
);

CREATE INDEX idx_cie10_codigo ON cie10(codigo);
CREATE INDEX idx_cie10_descripcion ON cie10(descripcion);

CREATE TABLE IF NOT EXISTS consulta (
    id SERIAL PRIMARY KEY,
    paciente_id INTEGER NOT NULL REFERENCES paciente(id) ON DELETE CASCADE,
    medico_id INTEGER NOT NULL REFERENCES medico(id) ON DELETE RESTRICT,
    cita_id INTEGER REFERENCES cita(id) ON DELETE SET NULL,
    fecha TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    motivo_consulta TEXT,
    sintomas TEXT,
    diagnostico_principal TEXT,
    tratamiento TEXT,
    peso DECIMAL(5,2),
    altura DECIMAL(5,2),
    presion_arterial VARCHAR(10),
    temperatura DECIMAL(4,1),
    frecuencia_cardiaca INTEGER,
    notas_evolucion TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_consulta_paciente ON consulta(paciente_id);
CREATE INDEX idx_consulta_medico ON consulta(medico_id);
CREATE INDEX idx_consulta_fecha ON consulta(fecha);
CREATE INDEX idx_consulta_paciente_fecha ON consulta(paciente_id, fecha);

CREATE TABLE IF NOT EXISTS diagnostico (
    id SERIAL PRIMARY KEY,
    consulta_id INTEGER NOT NULL REFERENCES consulta(id) ON DELETE CASCADE,
    cie10_id INTEGER NOT NULL REFERENCES cie10(id) ON DELETE RESTRICT,
    es_principal BOOLEAN DEFAULT FALSE,
    es_cronico BOOLEAN DEFAULT FALSE,
    observaciones TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_diagnostico_consulta ON diagnostico(consulta_id);
CREATE INDEX idx_diagnostico_cie10 ON diagnostico(cie10_id);

CREATE TABLE IF NOT EXISTS medicamento (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(200) NOT NULL,
    descripcion TEXT,
    presentacion VARCHAR(100),
    concentracion VARCHAR(50)
);

CREATE INDEX idx_medicamento_nombre ON medicamento(nombre);

CREATE TABLE IF NOT EXISTS receta (
    id SERIAL PRIMARY KEY,
    consulta_id INTEGER NOT NULL REFERENCES consulta(id) ON DELETE CASCADE,
    paciente_id INTEGER NOT NULL REFERENCES paciente(id) ON DELETE RESTRICT,
    medico_id INTEGER NOT NULL REFERENCES medico(id) ON DELETE RESTRICT,
    fecha_emision DATE NOT NULL DEFAULT CURRENT_DATE,
    fecha_validez DATE,
    indicaciones_generales TEXT,
    estado VARCHAR(20) DEFAULT 'activa' CHECK (estado IN ('activa', 'completada', 'cancelada')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_receta_consulta ON receta(consulta_id);
CREATE INDEX idx_receta_paciente ON receta(paciente_id);
CREATE INDEX idx_receta_estado ON receta(estado);

CREATE TABLE IF NOT EXISTS receta_medicamento (
    id SERIAL PRIMARY KEY,
    receta_id INTEGER NOT NULL REFERENCES receta(id) ON DELETE CASCADE,
    medicamento_id INTEGER NOT NULL REFERENCES medicamento(id) ON DELETE RESTRICT,
    dosis VARCHAR(100) NOT NULL,
    frecuencia VARCHAR(100) NOT NULL,
    duracion VARCHAR(100),
    via_administracion VARCHAR(50),
    notas TEXT
);

CREATE INDEX idx_receta_medicamento_receta ON receta_medicamento(receta_id);
CREATE INDEX idx_receta_medicamento_med ON receta_medicamento(medicamento_id);

-- ================================================
-- 4. FUNCIONES Y TRIGGERS
-- ================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
DECLARE
    tbl TEXT;
    tables_with_updated_at TEXT[] := ARRAY[
        'usuario', 'paciente', 'medico', 'cita',
        'consulta', 'receta'
    ];
BEGIN
    FOREACH tbl IN ARRAY tables_with_updated_at
    LOOP
        EXECUTE format(
            'CREATE TRIGGER set_%I_updated_at
             BEFORE UPDATE ON %I
             FOR EACH ROW
             EXECUTE FUNCTION update_updated_at_column()',
            tbl, tbl
        );
    END LOOP;
END;
$$;

-- ================================================
-- 5. VISTAS
-- ================================================

CREATE OR REPLACE VIEW v_pacientes_completos AS
SELECT
    p.id,
    p.nombre,
    p.apellido,
    p.ci,
    p.fecha_nacimiento,
    EXTRACT(YEAR FROM AGE(p.fecha_nacimiento))::INTEGER AS edad,
    g.nombre AS genero,
    gs.nombre AS grupo_sanguineo,
    p.telefono,
    p.email,
    p.alergias,
    p.antecedentes,
    p.activo,
    p.created_at
FROM paciente p
LEFT JOIN genero g ON p.genero_id = g.id
LEFT JOIN grupo_sanguineo gs ON p.grupo_sanguineo_id = gs.id;

CREATE OR REPLACE VIEW v_medicos_completos AS
SELECT
    m.id,
    m.nombre,
    m.apellido,
    e.nombre AS especialidad,
    m.telefono,
    m.email,
    m.activo
FROM medico m
JOIN especialidad e ON m.especialidad_id = e.id;

CREATE OR REPLACE VIEW v_citas_detalladas AS
SELECT
    c.id,
    p.nombre || ' ' || p.apellido AS paciente_nombre,
    p.ci AS paciente_ci,
    m.nombre || ' ' || m.apellido AS medico_nombre,
    e.nombre AS especialidad,
    ec.nombre AS estado,
    c.fecha,
    c.duracion_minutos,
    c.motivo
FROM cita c
JOIN paciente p ON c.paciente_id = p.id
JOIN medico m ON c.medico_id = m.id
JOIN especialidad e ON m.especialidad_id = e.id
JOIN estado_cita ec ON c.estado_cita_id = ec.id;

CREATE OR REPLACE VIEW v_historia_clinica AS
SELECT
    p.id AS paciente_id,
    p.nombre || ' ' || p.apellido AS paciente_nombre,
    p.ci,
    c.fecha AS consulta_fecha,
    m.nombre || ' ' || m.apellido AS medico_nombre,
    c.motivo_consulta,
    c.presion_arterial_sistolica || '/' || c.presion_arterial_diastolica AS presion_arterial,
    c.temperatura,
    STRING_AGG(DISTINCT d.codigo || ' - ' || d.descripcion, '; ') AS diagnosticos_cie10,
    COUNT(DISTINCT r.id) AS total_recetas
FROM paciente p
JOIN consulta c ON c.paciente_id = p.id
JOIN medico m ON c.medico_id = m.id
LEFT JOIN diagnostico dg ON dg.consulta_id = c.id
LEFT JOIN cie10 d ON dg.cie10_id = d.id
LEFT JOIN receta r ON r.consulta_id = c.id
GROUP BY p.id, p.nombre, p.apellido, p.ci, c.id, m.nombre, m.apellido
ORDER BY c.fecha DESC;

CREATE OR REPLACE VIEW v_estadisticas AS
SELECT
    COUNT(DISTINCT p.id) AS total_pacientes,
    COUNT(DISTINCT m.id) AS total_medicos,
    COUNT(DISTINCT c.id) AS total_citas,
    COUNT(DISTINCT ct.id) AS total_consultas,
    ROUND(AVG(EXTRACT(YEAR FROM AGE(p.fecha_nacimiento))))::INTEGER AS edad_promedio,
    COUNT(DISTINCT CASE WHEN c.estado_cita_id = 1 THEN c.id END) AS citas_pendientes
FROM paciente p
CROSS JOIN (SELECT COUNT(*) FROM medico) m
CROSS JOIN (SELECT COUNT(*) FROM cita) c
CROSS JOIN (SELECT COUNT(*) FROM consulta) ct;

-- ================================================
-- 6. DATOS INICIALES
-- ================================================

INSERT INTO rol (nombre, descripcion) VALUES
    ('admin', 'Acceso total al sistema'),
    ('medico', 'Acceso a módulo médico'),
    ('enfermeria', 'Acceso a módulo de enfermería'),
    ('recepcionista', 'Acceso a módulo de recepción'),
    ('paciente', 'Acceso a portal del paciente')
ON CONFLICT (nombre) DO NOTHING;

INSERT INTO genero (nombre, codigo) VALUES
    ('Masculino', 'M'),
    ('Femenino', 'F'),
    ('No binario', 'N')
ON CONFLICT (codigo) DO NOTHING;

INSERT INTO grupo_sanguineo (nombre) VALUES
    ('A+'), ('A-'), ('B+'), ('B-'), ('AB+'), ('AB-'), ('O+'), ('O-')
ON CONFLICT (nombre) DO NOTHING;

INSERT INTO estado_cita (nombre, codigo) VALUES
    ('Pendiente', 'PENDIENTE'),
    ('Confirmada', 'CONFIRMADA'),
    ('En curso', 'EN_CURSO'),
    ('Completada', 'COMPLETADA'),
    ('Cancelada', 'CANCELADA'),
    ('No asistió', 'NO_ASISTIO')
ON CONFLICT (codigo) DO NOTHING;

INSERT INTO especialidad (nombre) VALUES
    ('Medicina General'), ('Pediatría'), ('Cardiología'),
    ('Dermatología'), ('Neurología'), ('Traumatología'),
    ('Oftalmología'), ('Ginecología'), ('Psiquiatría'),
    ('Medicina Interna')
ON CONFLICT (nombre) DO NOTHING;

SELECT '✅ Esquema HCE inicializado correctamente';
