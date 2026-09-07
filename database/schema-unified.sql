-- ============================================================================
-- CLÍNICA SANTA ISABEL - ESQUEMA UNIFICADO PostgreSQL 15+
-- Historia Clínica Electrónica (HCE) - Normalizado 3FN + Auditoría
-- ============================================================================
-- Este esquema UNIFICA los 5 schemas competidores anteriores en UNO SOLO.
-- Diseñado para: multi-sucursal, multi-especialidad, continuidad de atención.
-- ============================================================================

BEGIN;

-- ============================================================================
-- 1. CATÁLOGOS BASE
-- ============================================================================

CREATE SCHEMA IF NOT EXISTS clinica;
SET search_path TO clinica, public;

CREATE TABLE genero (
    id SMALLSERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE,
    codigo CHAR(1) UNIQUE,
    activo BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE grupo_sanguineo (
    id SMALLSERIAL PRIMARY KEY,
    nombre VARCHAR(10) NOT NULL UNIQUE,
    factor_rh CHAR(1) CHECK (factor_rh IN ('+', '-')),
    activo BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE estado_civil (
    id SMALLSERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE,
    activo BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE rol (
    id SMALLSERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE,
    codigo VARCHAR(20) UNIQUE NOT NULL,
    descripcion VARCHAR(200),
    nivel_acceso SMALLINT NOT NULL DEFAULT 1 CHECK (nivel_acceso >= 1 AND nivel_acceso <= 10),
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE especialidad (
    id SMALLSERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    codigo VARCHAR(20) UNIQUE,
    descripcion VARCHAR(300),
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE estado_cita (
    id SMALLSERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE,
    codigo VARCHAR(20) UNIQUE NOT NULL,
    color VARCHAR(7) DEFAULT '#808080',
    es_terminal BOOLEAN NOT NULL DEFAULT FALSE,
    orden SMALLINT NOT NULL DEFAULT 0,
    activo BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE forma_pago (
    id SMALLSERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE,
    requiere_referencia BOOLEAN NOT NULL DEFAULT FALSE,
    activo BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE via_administracion (
    id SMALLSERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE,
    descripcion VARCHAR(200)
);

CREATE TABLE presentacion_medicamento (
    id SMALLSERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    descripcion VARCHAR(200)
);

CREATE TABLE tipo_alergia (
    id SMALLSERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    severidad_base VARCHAR(20) CHECK (severidad_base IN ('leve', 'moderada', 'severa', 'anafilactica')),
    descripcion VARCHAR(300)
);

CREATE TABLE grupo_medicamento (
    id SMALLSERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    descripcion VARCHAR(300),
    activo BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE principio_activo (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(200) NOT NULL UNIQUE,
    descripcion TEXT,
    grupo_medicamento_id SMALLINT REFERENCES grupo_medicamento(id) ON DELETE SET NULL,
    activo BOOLEAN NOT NULL DEFAULT TRUE
);

-- ============================================================================
-- 2. SUCURSAL / MULTI-SEDE
-- ============================================================================

CREATE TABLE sucursal (
    id SMALLSERIAL PRIMARY KEY,
    nombre VARCHAR(200) NOT NULL,
    direccion TEXT,
    telefono VARCHAR(30),
    email VARCHAR(255),
    rnc VARCHAR(30),
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 3. CIE-10 (Clasificación Internacional de Enfermedades)
-- ============================================================================

CREATE TABLE cie10 (
    id SERIAL PRIMARY KEY,
    codigo VARCHAR(10) NOT NULL UNIQUE,
    descripcion TEXT NOT NULL,
    categoria VARCHAR(10),
    subcategoria VARCHAR(10),
    capitulo VARCHAR(200),
    sexo_aplicable CHAR(1) CHECK (sexo_aplicable IN ('M', 'F', 'A')) DEFAULT 'A',
    es_cronico BOOLEAN NOT NULL DEFAULT FALSE,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    search_vector TSVECTOR GENERATED ALWAYS AS (
        SETWEIGHT(TO_TSVECTOR('spanish', codigo), 'A') ||
        SETWEIGHT(TO_TSVECTOR('spanish', descripcion), 'B')
    ) STORED,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_cie10_search ON cie10 USING GIN (search_vector);
CREATE INDEX idx_cie10_codigo ON cie10(codigo);
CREATE INDEX idx_cie10_activo ON cie10(activo) WHERE activo = TRUE;

-- ============================================================================
-- 4. USUARIOS Y AUTENTICACIÓN
-- ============================================================================

CREATE TABLE usuario (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    ci VARCHAR(20) UNIQUE NOT NULL,
    telefono VARCHAR(30),
    direccion TEXT,
    rol_id SMALLINT NOT NULL REFERENCES rol(id) ON DELETE RESTRICT,
    sucursal_id SMALLINT REFERENCES sucursal(id) ON DELETE SET NULL,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    bloqueado BOOLEAN NOT NULL DEFAULT FALSE,
    bloqueado_motivo VARCHAR(200),
    intentos_fallidos SMALLINT NOT NULL DEFAULT 0,
    ultimo_login TIMESTAMPTZ,
    mfa_secret VARCHAR(255),
    mfa_activado BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_usuario_email ON usuario(email);
CREATE INDEX idx_usuario_ci ON usuario(ci);
CREATE INDEX idx_usuario_rol ON usuario(rol_id);
CREATE INDEX idx_usuario_activo ON usuario(activo) WHERE activo = TRUE;

-- ============================================================================
-- 5. PACIENTES
-- ============================================================================

CREATE TABLE paciente (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES usuario(id) ON DELETE SET NULL,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    ci VARCHAR(20) UNIQUE NOT NULL,
    fecha_nacimiento DATE NOT NULL,
    edad SMALLINT GENERATED ALWAYS AS (DATE_PART('year', AGE(fecha_nacimiento))::SMALLINT) STORED,
    genero_id SMALLINT REFERENCES genero(id) ON DELETE SET NULL,
    estado_civil_id SMALLINT REFERENCES estado_civil(id) ON DELETE SET NULL,
    grupo_sanguineo_id SMALLINT REFERENCES grupo_sanguineo(id) ON DELETE SET NULL,
    telefono VARCHAR(30),
    telefono_emergencia VARCHAR(30),
    email VARCHAR(255),
    direccion TEXT,
    ocupacion VARCHAR(100),
    contacto_emergencia_nombre VARCHAR(200),
    contacto_emergencia_telefono VARCHAR(30),
    contacto_emergencia_parentesco VARCHAR(50),
    antecedentes_personales TEXT,
    antecedentes_familiares TEXT,
    observaciones TEXT,
    foto_url VARCHAR(500),
    sucursal_id SMALLINT REFERENCES sucursal(id) ON DELETE SET NULL,
    usuario_registro_id INTEGER REFERENCES usuario(id) ON DELETE SET NULL,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_paciente_ci ON paciente(ci);
CREATE INDEX idx_paciente_nombre ON paciente USING GIN (TO_TSVECTOR('spanish', nombre || ' ' || apellido));
CREATE INDEX idx_paciente_activo ON paciente(activo) WHERE activo = TRUE;
CREATE INDEX idx_paciente_sucursal ON paciente(sucursal_id);

-- ============================================================================
-- 6. ALERGIAS DEL PACIENTE
-- ============================================================================

CREATE TABLE alergia (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(200) NOT NULL UNIQUE,
    descripcion TEXT,
    severidad VARCHAR(20) NOT NULL CHECK (severidad IN ('leve', 'moderada', 'severa', 'anafilactica')),
    tipo_alergia_id SMALLINT REFERENCES tipo_alergia(id) ON DELETE SET NULL,
    activo BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE paciente_alergia (
    id SERIAL PRIMARY KEY,
    paciente_id INTEGER NOT NULL REFERENCES paciente(id) ON DELETE CASCADE,
    alergia_id INTEGER NOT NULL REFERENCES alergia(id) ON DELETE RESTRICT,
    severidad VARCHAR(20) CHECK (severidad IN ('leve', 'moderada', 'severa', 'anafilactica')),
    fecha_deteccion DATE NOT NULL DEFAULT CURRENT_DATE,
    observaciones TEXT,
    usuario_registro_id INTEGER REFERENCES usuario(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(paciente_id, alergia_id)
);

CREATE INDEX idx_paciente_alergia_paciente ON paciente_alergia(paciente_id);
CREATE INDEX idx_paciente_alergia_alergia ON paciente_alergia(alergia_id);

-- ============================================================================
-- 7. MÉDICOS
-- ============================================================================

CREATE TABLE medico (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER UNIQUE REFERENCES usuario(id) ON DELETE SET NULL,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    ci VARCHAR(20) UNIQUE,
    especialidad_primaria_id SMALLINT NOT NULL REFERENCES especialidad(id) ON DELETE RESTRICT,
    especialidades_secundarias INTEGER[] DEFAULT '{}',
    numero_colegiado VARCHAR(50) UNIQUE,
    telefono VARCHAR(30),
    email VARCHAR(255),
    consultorio VARCHAR(20),
    duracion_consulta SMALLINT NOT NULL DEFAULT 30,
    precio_consulta DECIMAL(10,2),
    horario_entrada TIME,
    horario_salida TIME,
    sucursal_id SMALLINT REFERENCES sucursal(id) ON DELETE SET NULL,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_medico_especialidad ON medico(especialidad_primaria_id);
CREATE INDEX idx_medico_sucursal ON medico(sucursal_id);
CREATE INDEX idx_medico_activo ON medico(activo) WHERE activo = TRUE;

-- ============================================================================
-- 8. MEDICAMENTOS
-- ============================================================================

CREATE TABLE medicamento (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(200) NOT NULL,
    principio_activo_id INTEGER REFERENCES principio_activo(id) ON DELETE SET NULL,
    presentacion_id SMALLINT REFERENCES presentacion_medicamento(id) ON DELETE SET NULL,
    concentracion VARCHAR(50),
    via_administracion_id SMALLINT REFERENCES via_administracion(id) ON DELETE SET NULL,
    laboratorio VARCHAR(100),
    requiere_receta BOOLEAN NOT NULL DEFAULT TRUE,
    es_controlado BOOLEAN NOT NULL DEFAULT FALSE,
    es_antibiotico BOOLEAN NOT NULL DEFAULT FALSE,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(nombre, concentracion, presentacion_id)
);

CREATE INDEX idx_medicamento_nombre ON medicamento(nombre);
CREATE INDEX idx_medicamento_activo ON medicamento(activo) WHERE activo = TRUE;
CREATE INDEX idx_medicamento_search ON medicamento USING GIN (TO_TSVECTOR('spanish', nombre));

-- ============================================================================
-- 9. INTERACCIONES MEDICAMENTOSAS (SEGURIDAD MÉDICA)
-- ============================================================================

CREATE TABLE interaccion_medicamento (
    id SERIAL PRIMARY KEY,
    medicamento_id_1 INTEGER NOT NULL REFERENCES medicamento(id) ON DELETE RESTRICT,
    medicamento_id_2 INTEGER NOT NULL REFERENCES medicamento(id) ON DELETE RESTRICT,
    severidad VARCHAR(20) NOT NULL CHECK (severidad IN ('leve', 'moderada', 'severa', 'contraindicada')),
    descripcion TEXT NOT NULL,
    efecto TEXT,
    recomendacion TEXT,
    nivel_evidencia VARCHAR(10),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CHECK (medicamento_id_1 < medicamento_id_2),
    UNIQUE(medicamento_id_1, medicamento_id_2)
);

CREATE INDEX idx_interaccion_med1 ON interaccion_medicamento(medicamento_id_1);
CREATE INDEX idx_interaccion_med2 ON interaccion_medicamento(medicamento_id_2);

-- ============================================================================
-- 10. CITAS MÉDICAS
-- ============================================================================

CREATE TABLE cita (
    id SERIAL PRIMARY KEY,
    paciente_id INTEGER NOT NULL REFERENCES paciente(id) ON DELETE RESTRICT,
    medico_id INTEGER NOT NULL REFERENCES medico(id) ON DELETE RESTRICT,
    especialidad_id SMALLINT REFERENCES especialidad(id) ON DELETE RESTRICT,
    estado_id SMALLINT NOT NULL REFERENCES estado_cita(id) ON DELETE RESTRICT,
    sucursal_id SMALLINT REFERENCES sucursal(id) ON DELETE SET NULL,
    fecha DATE NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_fin TIME NOT NULL,
    duracion_minutos SMALLINT NOT NULL DEFAULT 30,
    tipo_cita VARCHAR(30) DEFAULT 'presencial' CHECK (tipo_cita IN ('presencial', 'telemedicina', 'domicilio')),
    motivo TEXT NOT NULL,
    observaciones TEXT,
    es_virtual BOOLEAN NOT NULL DEFAULT FALSE,
    es_recurrente BOOLEAN NOT NULL DEFAULT FALSE,
    recurrencia_tipo VARCHAR(20),
    sesion_numero SMALLINT DEFAULT 1,
    codigo_confirmacion VARCHAR(20),
    recordatorio_enviado BOOLEAN NOT NULL DEFAULT FALSE,
    llegada_paciente TIMESTAMPTZ,
    inicio_atencion TIMESTAMPTZ,
    fin_atencion TIMESTAMPTZ,
    cancelado_motivo TEXT,
    cancelado_por_id INTEGER REFERENCES usuario(id) ON DELETE SET NULL,
    fecha_cancelacion TIMESTAMPTZ,
    created_by_id INTEGER NOT NULL REFERENCES usuario(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Prevenir doble reserva (mismo médico, misma fecha y hora)
CREATE UNIQUE INDEX idx_cita_unico ON cita(paciente_id, medico_id, fecha, hora_inicio);
CREATE INDEX idx_cita_fecha ON cita(fecha);
CREATE INDEX idx_cita_paciente ON cita(paciente_id);
CREATE INDEX idx_cita_medico ON cita(medico_id);
CREATE INDEX idx_cita_estado ON cita(estado_id);
CREATE INDEX idx_cita_medico_fecha ON cita(medico_id, fecha);
CREATE INDEX idx_cita_paciente_fecha ON cita(paciente_id, fecha);
CREATE INDEX idx_cita_sucursal ON cita(sucursal_id);

-- ============================================================================
-- 11. CONSULTAS MÉDICAS (Formato SOAP)
-- ============================================================================

CREATE TABLE consulta (
    id SERIAL PRIMARY KEY,
    paciente_id INTEGER NOT NULL REFERENCES paciente(id) ON DELETE RESTRICT,
    medico_id INTEGER NOT NULL REFERENCES medico(id) ON DELETE RESTRICT,
    cita_id INTEGER UNIQUE REFERENCES cita(id) ON DELETE SET NULL,
    medico_original_id INTEGER REFERENCES medico(id) ON DELETE SET NULL,
    sucursal_id SMALLINT REFERENCES sucursal(id) ON DELETE SET NULL,
    fecha TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    tipo_consulta VARCHAR(30) DEFAULT 'general',
    es_virtual BOOLEAN NOT NULL DEFAULT FALSE,
    es_primera_vez BOOLEAN NOT NULL DEFAULT FALSE,
    -- SOAP: Subjetivo
    motivo_consulta TEXT,
    sintomas TEXT,
    enfermedad_actual TEXT,
    -- SOAP: Objetivo
    examen_fisico TEXT,
    peso DECIMAL(5,2) CHECK (peso IS NULL OR (peso >= 0.5 AND peso <= 500)),
    talla DECIMAL(5,2) CHECK (talla IS NULL OR (talla >= 20 AND talla <= 280)),
    imc DECIMAL(4,1),
    temperatura DECIMAL(4,1) CHECK (temperatura IS NULL OR (temperatura >= 34 AND temperatura <= 42)),
    frecuencia_cardiaca SMALLINT CHECK (frecuencia_cardiaca IS NULL OR (frecuencia_cardiaca >= 20 AND frecuencia_cardiaca <= 280)),
    frecuencia_respiratoria SMALLINT CHECK (frecuencia_respiratoria IS NULL OR (frecuencia_respiratoria >= 4 AND frecuencia_respiratoria <= 60)),
    presion_arterial_sistolica SMALLINT CHECK (presion_arterial_sistolica IS NULL OR (presion_arterial_sistolica >= 50 AND presion_arterial_sistolica <= 300)),
    presion_arterial_diastolica SMALLINT CHECK (presion_arterial_diastolica IS NULL OR (presion_arterial_diastolica >= 30 AND presion_arterial_diastolica <= 200)),
    saturacion_oxigeno DECIMAL(4,1) CHECK (saturacion_oxigeno IS NULL OR (saturacion_oxigeno >= 50 AND saturacion_oxigeno <= 100)),
    glucosa_capilar DECIMAL(6,1),
    -- SOAP: Evaluación
    evaluacion TEXT,
    -- SOAP: Plan
    plan_tratamiento TEXT,
    indicaciones TEXT,
    proximo_control DATE,
    dias_incapacidad SMALLINT DEFAULT 0,
    incapacidad_inicio DATE,
    incapacidad_fin DATE,
    requiere_referencia BOOLEAN NOT NULL DEFAULT FALSE,
    referencia_especialidad_id SMALLINT REFERENCES especialidad(id) ON DELETE SET NULL,
    requiere_hospitalizacion BOOLEAN NOT NULL DEFAULT FALSE,
    observaciones TEXT,
    -- Continuidad: otro médico continuó esta consulta
    es_continuacion BOOLEAN NOT NULL DEFAULT FALSE,
    consulta_original_id INTEGER REFERENCES consulta(id) ON DELETE SET NULL,
    medico_continuador_id INTEGER REFERENCES medico(id) ON DELETE SET NULL,
    motivo_continuacion TEXT,
    -- Metadata
    created_by_id INTEGER REFERENCES usuario(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_consulta_paciente ON consulta(paciente_id);
CREATE INDEX idx_consulta_medico ON consulta(medico_id);
CREATE INDEX idx_consulta_fecha ON consulta(fecha);
CREATE INDEX idx_consulta_paciente_fecha ON consulta(paciente_id, fecha);
CREATE INDEX idx_consulta_cita ON consulta(cita_id);
CREATE INDEX idx_consulta_continuacion ON consulta(consulta_original_id);

-- ============================================================================
-- 12. DIAGNÓSTICOS
-- ============================================================================

CREATE TABLE diagnostico (
    id SERIAL PRIMARY KEY,
    consulta_id INTEGER NOT NULL REFERENCES consulta(id) ON DELETE CASCADE,
    cie10_id INTEGER REFERENCES cie10(id) ON DELETE SET NULL,
    descripcion TEXT NOT NULL,
    tipo VARCHAR(30) NOT NULL DEFAULT 'principal' CHECK (tipo IN ('principal', 'secundario', 'complicacion', 'cronico')),
    es_cronico BOOLEAN NOT NULL DEFAULT FALSE,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_diagnostico_consulta ON diagnostico(consulta_id);
CREATE INDEX idx_diagnostico_cie10 ON diagnostico(cie10_id);
CREATE INDEX idx_diagnostico_cronico ON diagnostico(es_cronico) WHERE es_cronico = TRUE;

-- ============================================================================
-- 13. HISTORIAL DE DIAGNÓSTICOS CRÓNICOS POR PACIENTE
-- ============================================================================

CREATE TABLE paciente_diagnostico_cronico (
    id SERIAL PRIMARY KEY,
    paciente_id INTEGER NOT NULL REFERENCES paciente(id) ON DELETE CASCADE,
    diagnostico_id INTEGER NOT NULL REFERENCES diagnostico(id) ON DELETE CASCADE,
    cie10_id INTEGER REFERENCES cie10(id) ON DELETE SET NULL,
    descripcion TEXT NOT NULL,
    fecha_diagnostico DATE NOT NULL DEFAULT CURRENT_DATE,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(paciente_id, diagnostico_id)
);

CREATE INDEX idx_paciente_cronico_paciente ON paciente_diagnostico_cronico(paciente_id);

-- ============================================================================
-- 14. RECETAS MÉDICAS
-- ============================================================================

CREATE TABLE receta (
    id SERIAL PRIMARY KEY,
    consulta_id INTEGER NOT NULL REFERENCES consulta(id) ON DELETE CASCADE,
    paciente_id INTEGER NOT NULL REFERENCES paciente(id) ON DELETE RESTRICT,
    medico_id INTEGER NOT NULL REFERENCES medico(id) ON DELETE RESTRICT,
    numero_receta VARCHAR(20) UNIQUE NOT NULL,
    instrucciones_generales TEXT,
    fecha_prescripcion DATE NOT NULL DEFAULT CURRENT_DATE,
    fecha_validez DATE,
    estado VARCHAR(20) NOT NULL DEFAULT 'activa' CHECK (estado IN ('activa', 'dispensada_parcial', 'dispensada_total', 'cancelada', 'vencida')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_receta_consulta ON receta(consulta_id);
CREATE INDEX idx_receta_paciente ON receta(paciente_id);
CREATE INDEX idx_receta_medico ON receta(medico_id);
CREATE INDEX idx_receta_estado ON receta(estado);

CREATE TABLE receta_medicamento (
    id SERIAL PRIMARY KEY,
    receta_id INTEGER NOT NULL REFERENCES receta(id) ON DELETE CASCADE,
    medicamento_id INTEGER NOT NULL REFERENCES medicamento(id) ON DELETE RESTRICT,
    dosis VARCHAR(100) NOT NULL,
    dosis_numero DECIMAL(8,2),
    dosis_unidad VARCHAR(20),
    frecuencia VARCHAR(100) NOT NULL,
    via_administracion_id SMALLINT REFERENCES via_administracion(id) ON DELETE SET NULL,
    duracion VARCHAR(100),
    duracion_dias INTEGER,
    cantidad INTEGER NOT NULL,
    observaciones TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_receta_medicamento_receta ON receta_medicamento(receta_id);
CREATE INDEX idx_receta_medicamento_med ON receta_medicamento(medicamento_id);

-- ============================================================================
-- 15. NOTAS DE EVOLUCIÓN
-- ============================================================================

CREATE TABLE nota_evolucion (
    id SERIAL PRIMARY KEY,
    consulta_id INTEGER NOT NULL REFERENCES consulta(id) ON DELETE CASCADE,
    tipo VARCHAR(30) NOT NULL DEFAULT 'evolucion' CHECK (tipo IN ('evolucion', 'ingreso', 'alta', 'interconsulta', 'enfermeria')),
    contenido TEXT NOT NULL,
    creado_por_id INTEGER NOT NULL REFERENCES usuario(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_nota_evolucion_consulta ON nota_evolucion(consulta_id);

-- ============================================================================
-- 16. AUDITORÍA COMPLETA (HIPAA-compliant)
-- ============================================================================

CREATE TABLE audit_log (
    id BIGSERIAL PRIMARY KEY,
    tabla VARCHAR(100) NOT NULL,
    operacion VARCHAR(10) NOT NULL CHECK (operacion IN ('INSERT', 'UPDATE', 'DELETE')),
    registro_id INTEGER NOT NULL,
    datos_anteriores JSONB,
    datos_nuevos JSONB,
    cambios JSONB GENERATED ALWAYS AS (
        CASE
            WHEN operacion = 'INSERT' THEN datos_nuevos
            WHEN operacion = 'DELETE' THEN datos_anteriores
            ELSE (
                SELECT JSONB_OBJECT_AGG(key, JSONB_BUILD_OBJECT('old', datos_anteriores->key, 'new', datos_nuevos->key))
                FROM JSONB_EACH(datos_nuevos)
                WHERE datos_anteriores->key IS DISTINCT FROM datos_nuevos->key
            )
        END
    ) STORED,
    usuario_id INTEGER REFERENCES usuario(id) ON DELETE SET NULL,
    usuario_email VARCHAR(255),
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
) PARTITION BY RANGE (created_at);

-- Particiones mensuales
CREATE TABLE audit_log_2026_06 PARTITION OF audit_log FOR VALUES FROM ('2026-06-01') TO ('2026-07-01');
CREATE TABLE audit_log_2026_07 PARTITION OF audit_log FOR VALUES FROM ('2026-07-01') TO ('2026-08-01');
CREATE TABLE audit_log_2026_08 PARTITION OF audit_log FOR VALUES FROM ('2026-08-01') TO ('2026-09-01');
CREATE TABLE audit_log_2026_09 PARTITION OF audit_log FOR VALUES FROM ('2026-09-01') TO ('2026-10-01');
CREATE TABLE audit_log_2026_10 PARTITION OF audit_log FOR VALUES FROM ('2026-10-01') TO ('2026-11-01');
CREATE TABLE audit_log_2026_11 PARTITION OF audit_log FOR VALUES FROM ('2026-11-01') TO ('2026-12-01');
CREATE TABLE audit_log_2026_12 PARTITION OF audit_log FOR VALUES FROM ('2026-12-01') TO ('2027-01-01');
CREATE TABLE audit_log_default PARTITION OF audit_log DEFAULT;

CREATE INDEX idx_audit_log_tabla ON audit_log(tabla);
CREATE INDEX idx_audit_log_operacion ON audit_log(operacion);
CREATE INDEX idx_audit_log_registro ON audit_log(registro_id);
CREATE INDEX idx_audit_log_usuario ON audit_log(usuario_id);
CREATE INDEX idx_audit_log_created_at ON audit_log(created_at);
CREATE INDEX idx_audit_log_cambios ON audit_log USING GIN (cambios);

-- ============================================================================
-- 17. FUNCIONES Y TRIGGERS
-- ============================================================================

CREATE OR REPLACE FUNCTION fn_update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION fn_audit_trigger()
RETURNS TRIGGER AS $$
DECLARE
    v_usuario_id INTEGER;
    v_usuario_email VARCHAR(255);
    v_ip VARCHAR(45);
    v_agent TEXT;
BEGIN
    v_usuario_id := NULLIF(CURRENT_SETTING('app.usuario_id', TRUE), '')::INTEGER;
    v_usuario_email := CURRENT_SETTING('app.usuario_email', TRUE);
    v_ip := CURRENT_SETTING('app.ip_address', TRUE);
    v_agent := CURRENT_SETTING('app.user_agent', TRUE);

    IF TG_OP = 'INSERT' THEN
        INSERT INTO audit_log (tabla, operacion, registro_id, datos_anteriores, datos_nuevos, usuario_id, usuario_email, ip_address, user_agent)
        VALUES (TG_TABLE_NAME, 'INSERT', NEW.id, NULL, TO_JSONB(NEW), v_usuario_id, v_usuario_email, v_ip, v_agent);
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO audit_log (tabla, operacion, registro_id, datos_anteriores, datos_nuevos, usuario_id, usuario_email, ip_address, user_agent)
        VALUES (TG_TABLE_NAME, 'UPDATE', NEW.id, TO_JSONB(OLD), TO_JSONB(NEW), v_usuario_id, v_usuario_email, v_ip, v_agent);
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO audit_log (tabla, operacion, registro_id, datos_anteriores, datos_nuevos, usuario_id, usuario_email, ip_address, user_agent)
        VALUES (TG_TABLE_NAME, 'DELETE', OLD.id, TO_JSONB(OLD), NULL, v_usuario_id, v_usuario_email, v_ip, v_agent);
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Triggers de updated_at
CREATE TRIGGER tr_usuario_updated_at BEFORE UPDATE ON usuario FOR EACH ROW EXECUTE FUNCTION fn_update_timestamp();
CREATE TRIGGER tr_paciente_updated_at BEFORE UPDATE ON paciente FOR EACH ROW EXECUTE FUNCTION fn_update_timestamp();
CREATE TRIGGER tr_medico_updated_at BEFORE UPDATE ON medico FOR EACH ROW EXECUTE FUNCTION fn_update_timestamp();
CREATE TRIGGER tr_cita_updated_at BEFORE UPDATE ON cita FOR EACH ROW EXECUTE FUNCTION fn_update_timestamp();
CREATE TRIGGER tr_consulta_updated_at BEFORE UPDATE ON consulta FOR EACH ROW EXECUTE FUNCTION fn_update_timestamp();
CREATE TRIGGER tr_receta_updated_at BEFORE UPDATE ON receta FOR EACH ROW EXECUTE FUNCTION fn_update_timestamp();

-- Triggers de auditoría (solo tablas clínicas críticas)
CREATE TRIGGER tr_paciente_audit AFTER INSERT OR UPDATE OR DELETE ON paciente FOR EACH ROW EXECUTE FUNCTION fn_audit_trigger();
CREATE TRIGGER tr_consulta_audit AFTER INSERT OR UPDATE OR DELETE ON consulta FOR EACH ROW EXECUTE FUNCTION fn_audit_trigger();
CREATE TRIGGER tr_diagnostico_audit AFTER INSERT OR UPDATE OR DELETE ON diagnostico FOR EACH ROW EXECUTE FUNCTION fn_audit_trigger();
CREATE TRIGGER tr_receta_audit AFTER INSERT OR UPDATE OR DELETE ON receta FOR EACH ROW EXECUTE FUNCTION fn_audit_trigger();

-- ============================================================================
-- 18. VISTAS CLÍNICAS
-- ============================================================================

-- Historia clínica completa del paciente (cronológica)
CREATE OR REPLACE VIEW v_historia_clinica AS
SELECT
    p.id AS paciente_id,
    p.nombre || ' ' || p.apellido AS paciente_nombre,
    p.ci,
    c.id AS consulta_id,
    c.fecha AS consulta_fecha,
    m.nombre || ' ' || m.apellido AS medico_nombre,
    e.nombre AS especialidad,
    c.motivo_consulta,
    c.sintomas,
    c.examen_fisico,
    c.temperatura,
    c.frecuencia_cardiaca,
    c.presion_arterial_sistolica || '/' || c.presion_arterial_diastolica AS presion_arterial,
    c.peso,
    c.talla,
    c.imc,
    c.plan_tratamiento,
    c.indicaciones,
    c.es_continuacion,
    c.motivo_continuacion,
    STRING_AGG(DISTINCT d.descripcion, '; ') AS diagnosticos,
    STRING_AGG(DISTINCT d2.codigo || ' - ' || d2.descripcion, '; ') AS cie10_codes,
    COUNT(DISTINCT r.id) AS total_recetas,
    COUNT(DISTINCT ne.id) AS total_notas
FROM paciente p
JOIN consulta c ON c.paciente_id = p.id
JOIN medico m ON c.medico_id = m.id
JOIN especialidad e ON m.especialidad_primaria_id = e.id
LEFT JOIN diagnostico d ON d.consulta_id = c.id
LEFT JOIN cie10 d2 ON d.cie10_id = d2.id
LEFT JOIN receta r ON r.consulta_id = c.id
LEFT JOIN nota_evolucion ne ON ne.consulta_id = c.id
GROUP BY p.id, p.nombre, p.apellido, p.ci, c.id, m.nombre, m.apellido, e.nombre
ORDER BY c.fecha DESC;

-- Dashboard de citas del día
CREATE OR REPLACE VIEW v_citas_hoy AS
SELECT
    c.id,
    c.fecha,
    c.hora_inicio,
    c.hora_fin,
    p.nombre AS paciente_nombre,
    p.apellido AS paciente_apellido,
    p.ci AS paciente_ci,
    p.telefono AS paciente_telefono,
    m.nombre AS medico_nombre,
    m.apellido AS medico_apellido,
    esp.nombre AS especialidad,
    ec.nombre AS estado,
    ec.color AS estado_color,
    c.motivo,
    c.tipo_cita,
    c.es_virtual,
    c.llegada_paciente,
    c.inicio_atencion,
    s.nombre AS sucursal
FROM cita c
JOIN paciente p ON c.paciente_id = p.id
JOIN medico m ON c.medico_id = m.id
JOIN especialidad esp ON m.especialidad_primaria_id = esp.id
JOIN estado_cita ec ON c.estado_id = ec.id
LEFT JOIN sucursal s ON c.sucursal_id = s.id
WHERE c.fecha = CURRENT_DATE
ORDER BY c.hora_inicio;

-- Perfil completo del paciente (vista médica)
CREATE OR REPLACE VIEW v_paciente_perfil AS
SELECT
    p.id,
    p.nombre || ' ' || p.apellido AS nombre_completo,
    p.ci,
    p.fecha_nacimiento,
    p.edad,
    g.nombre AS genero,
    gs.nombre AS grupo_sanguineo,
    p.telefono,
    p.email,
    p.direccion,
    p.antecedentes_personales,
    p.antecedentes_familiares,
    p.ocupacion,
    p.contacto_emergencia_nombre,
    p.contacto_emergencia_telefono,
    STRING_AGG(DISTINCT a.nombre || ' (' || pa.severidad || ')', ', ') AS alergias,
    COUNT(DISTINCT c.id) AS total_consultas,
    COUNT(DISTINCT r.id) AS total_recetas,
    COUNT(DISTINCT ct.id) FILTER (WHERE ct.estado_id = 1) AS citas_pendientes,
    MAX(c.fecha) AS ultima_consulta,
    p.created_at AS registrado_desde
FROM paciente p
LEFT JOIN genero g ON p.genero_id = g.id
LEFT JOIN grupo_sanguineo gs ON p.grupo_sanguineo_id = gs.id
LEFT JOIN paciente_alergia pa ON pa.paciente_id = p.id
LEFT JOIN alergia a ON pa.alergia_id = a.id
LEFT JOIN consulta c ON c.paciente_id = p.id
LEFT JOIN receta r ON r.paciente_id = p.id
LEFT JOIN cita ct ON ct.paciente_id = p.id
WHERE p.activo = TRUE AND p.deleted_at IS NULL
GROUP BY p.id, p.nombre, p.apellido, p.ci, p.fecha_nacimiento, p.edad, g.nombre, gs.nombre,
         p.telefono, p.email, p.direccion, p.antecedentes_personales, p.antecedentes_familiares,
         p.ocupacion, p.contacto_emergencia_nombre, p.contacto_emergencia_telefono, p.created_at;

-- ============================================================================
-- 19. FUNCIÓN DE BÚSQUEDA GLOBAL
-- ============================================================================

CREATE OR REPLACE FUNCTION fn_buscar_global(p_query TEXT)
RETURNS TABLE (tipo VARCHAR(30), id INTEGER, nombre TEXT, detalle TEXT, relevancia REAL) AS $$
DECLARE
    v_tsquery TSQUERY;
BEGIN
    v_tsquery := WEBSEARCH_TO_TSQUERY('spanish', p_query);

    RETURN QUERY
    SELECT 'paciente'::VARCHAR, p.id,
           p.nombre || ' ' || p.apellido,
           'CI: ' || p.ci || ' | Tel: ' || COALESCE(p.telefono, ''),
           TS_RANK(TO_TSVECTOR('spanish', p.nombre || ' ' || p.apellido || ' ' || COALESCE(p.ci, '')), v_tsquery)::REAL
    FROM paciente p WHERE TO_TSVECTOR('spanish', p.nombre || ' ' || p.apellido || ' ' || COALESCE(p.ci, '')) @@ v_tsquery AND p.activo = TRUE
    UNION ALL
    SELECT 'diagnostico'::VARCHAR, c.id, c.codigo || ' - ' || c.descripcion, c.capitulo,
           TS_RANK(c.search_vector, v_tsquery)::REAL
    FROM cie10 c WHERE c.search_vector @@ v_tsquery AND c.activo = TRUE
    UNION ALL
    SELECT 'medicamento'::VARCHAR, m.id, m.nombre, COALESCE(m.concentracion, ''),
           TS_RANK(TO_TSVECTOR('spanish', m.nombre), v_tsquery)::REAL
    FROM medicamento m WHERE TO_TSVECTOR('spanish', m.nombre) @@ v_tsquery AND m.activo = TRUE
    ORDER BY relevancia DESC LIMIT 50;
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================================================
-- 20. FUNCIÓN: VERIFICAR INTERACCIONES MEDICAMENTOSAS
-- ============================================================================

CREATE OR REPLACE FUNCTION fn_verificar_interacciones(p_medicamento_ids INTEGER[])
RETURNS TABLE (
    medicamento_1 VARCHAR(200),
    medicamento_2 VARCHAR(200),
    severidad VARCHAR(20),
    descripcion TEXT,
    recomendacion TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        m1.nombre AS medicamento_1,
        m2.nombre AS medicamento_2,
        im.severidad,
        im.descripcion,
        im.recomendacion
    FROM interaccion_medicamento im
    JOIN medicamento m1 ON im.medicamento_id_1 = m1.id
    JOIN medicamento m2 ON im.medicamento_id_2 = m2.id
    WHERE im.medicamento_id_1 = ANY(p_medicamento_ids)
      AND im.medicamento_id_2 = ANY(p_medicamento_ids)
    ORDER BY im.severidad DESC;
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================================================
-- 21. FUNCIÓN: HISTORIAL DE CAMBIOS DE UN REGISTRO
-- ============================================================================

CREATE OR REPLACE FUNCTION fn_historial_cambios(p_tabla VARCHAR, p_registro_id INTEGER)
RETURNS TABLE (fecha TIMESTAMPTZ, operacion VARCHAR(10), cambios JSONB, usuario_nombre TEXT) AS $$
BEGIN
    RETURN QUERY
    SELECT a.created_at, a.operacion, a.cambios,
           COALESCE(u.nombre || ' ' || u.apellido, 'Sistema') AS usuario_nombre
    FROM audit_log a
    LEFT JOIN usuario u ON a.usuario_id = u.id
    WHERE a.tabla = p_tabla AND a.registro_id = p_registro_id
    ORDER BY a.created_at ASC;
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================================================
-- 22. SEED DATA
-- ============================================================================

-- Géneros
INSERT INTO genero (nombre, codigo) VALUES
    ('Masculino', 'M'), ('Femenino', 'F'), ('No binario', 'N')
ON CONFLICT (codigo) DO NOTHING;

-- Grupos sanguíneos
INSERT INTO grupo_sanguineo (nombre, factor_rh) VALUES
    ('A+', '+'), ('A-', '-'), ('B+', '+'), ('B-', '-'),
    ('AB+', '+'), ('AB-', '-'), ('O+', '+'), ('O-', '-')
ON CONFLICT (nombre) DO NOTHING;

-- Estados civiles
INSERT INTO estado_civil (nombre) VALUES
    ('Soltero/a'), ('Casado/a'), ('Unión libre'), ('Divorciado/a'), ('Viudo/a')
ON CONFLICT (nombre) DO NOTHING;

-- Roles
INSERT INTO rol (nombre, codigo, descripcion, nivel_acceso) VALUES
    ('Administrador', 'admin', 'Acceso total al sistema', 10),
    ('Médico', 'medico', 'Profesional médico', 7),
    ('Enfermería', 'enfermeria', 'Personal de enfermería', 5),
    ('Recepcionista', 'recepcionista', 'Atención al público', 3),
    ('Paciente', 'paciente', 'Portal del paciente', 1)
ON CONFLICT (codigo) DO NOTHING;

-- Estados de cita
INSERT INTO estado_cita (nombre, codigo, color, es_terminal, orden) VALUES
    ('Pendiente', 'pendiente', '#FFC107', FALSE, 1),
    ('Confirmada', 'confirmada', '#2196F3', FALSE, 2),
    ('En curso', 'en_curso', '#FF9800', FALSE, 3),
    ('Atendida', 'atendida', '#4CAF50', TRUE, 4),
    ('Cancelada', 'cancelada', '#F44336', TRUE, 5),
    ('No asistió', 'no_asistio', '#9E9E9E', TRUE, 6)
ON CONFLICT (codigo) DO NOTHING;

-- Especialidades
INSERT INTO especialidad (nombre, codigo) VALUES
    ('Medicina General', 'MG'), ('Pediatría', 'PED'), ('Cardiología', 'CARD'),
    ('Dermatología', 'DERM'), ('Neurología', 'NEUR'), ('Traumatología', 'TRAUM'),
    ('Oftalmología', 'OFT'), ('Ginecología', 'GINE'), ('Psiquiatría', 'PSIQ'),
    ('Medicina Interna', 'MI'), ('Cirugía General', 'CG'), ('Urología', 'URO'),
    ('Endocrinología', 'ENDO'), ('Gastroenterología', 'GASTRO'),
    ('Otorrinolaringología', 'ORL')
ON CONFLICT (codigo) DO NOTHING;

-- Tipos de alergia
INSERT INTO tipo_alergia (nombre, severidad_base, descripcion) VALUES
    ('Medicamentosa', 'severa', 'Reacción alérgica a medicamentos'),
    ('Alimentaria', 'moderada', 'Reacción alérgica a alimentos'),
    ('Ambiental', 'leve', 'Reacción alérgica a factores ambientales'),
    ('Insectos', 'severa', 'Reacción alérgica a picaduras'),
    ('Contacto', 'leve', 'Reacción alérgica por contacto cutáneo'),
    ('Anafilaxia', 'anafilactica', 'Reacción alérgica severa generalizada')
ON CONFLICT (nombre) DO NOTHING;

-- Vías de administración
INSERT INTO via_administracion (nombre, descripcion) VALUES
    ('Oral', 'Administración por boca'),
    ('Intravenosa', 'Administración por vía venosa'),
    ('Intramuscular', 'Administración por vía muscular'),
    ('Subcutánea', 'Administración por vía subcutánea'),
    ('Tópica', 'Administración sobre la piel'),
    ('Inhalatoria', 'Administración por inhalación'),
    ('Oftálmica', 'Administración en ojos'),
    ('Ótica', 'Administración en oídos'),
    ('Nasal', 'Administración por nariz'),
    ('Rectal', 'Administración por recto'),
    ('Sublingual', 'Administración debajo de la lengua')
ON CONFLICT (nombre) DO NOTHING;

-- Formas de pago
INSERT INTO forma_pago (nombre) VALUES
    ('Efectivo'), ('Tarjeta Débito'), ('Tarjeta Crédito'),
    ('Transferencia'), ('Seguro Médico'), ('Convenio')
ON CONFLICT (nombre) DO NOTHING;

-- ============================================================================
-- 24. CIRUGÍAS PREVIAS DEL PACIENTE
-- ============================================================================

CREATE TABLE cirugia_previa (
    id SERIAL PRIMARY KEY,
    paciente_id INTEGER NOT NULL REFERENCES paciente(id) ON DELETE CASCADE,
    nombre_procedimiento VARCHAR(300) NOT NULL,
    fecha_cirugia DATE,
    hospital VARCHAR(200),
    medico_cirujano VARCHAR(200),
    tipo_anestesia VARCHAR(100),
    complicaciones TEXT,
    observaciones TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_cirugia_previa_paciente ON cirugia_previa(paciente_id);

-- ============================================================================
-- 23. VACUNAS
-- ============================================================================

CREATE TABLE vacuna (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(200) NOT NULL,
    descripcion TEXT,
    dosis_recomendadas SMALLINT DEFAULT 1,
    edad_minima_meses SMALLINT,
    edad_maxima_meses SMALLINT,
    intervalo_dias SMALLINT,
    es_obligatoria BOOLEAN NOT NULL DEFAULT FALSE,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE paciente_vacuna (
    id SERIAL PRIMARY KEY,
    paciente_id INTEGER NOT NULL REFERENCES paciente(id) ON DELETE CASCADE,
    vacuna_id INTEGER NOT NULL REFERENCES vacuna(id) ON DELETE RESTRICT,
    dosis_numero SMALLINT NOT NULL DEFAULT 1,
    fecha_aplicacion DATE NOT NULL,
    lote VARCHAR(50),
    laboratorio VARCHAR(100),
    lugar_aplicacion VARCHAR(200),
    aplicado_por_id INTEGER REFERENCES usuario(id) ON DELETE SET NULL,
    proxima_dosis DATE,
    observaciones TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(paciente_id, vacuna_id, dosis_numero)
);

CREATE INDEX idx_paciente_vacuna_paciente ON paciente_vacuna(paciente_id);
CREATE INDEX idx_paciente_vacuna_fecha ON paciente_vacuna(fecha_aplicacion);

-- ============================================================================
-- 25. AGENDA INTELIGENTE - HORARIOS Y DISPONIBILIDAD
-- ============================================================================

CREATE TABLE horario_medico (
    id SERIAL PRIMARY KEY,
    medico_id INTEGER NOT NULL REFERENCES medico(id) ON DELETE CASCADE,
    dia_semana SMALLINT NOT NULL CHECK (dia_semana BETWEEN 0 AND 6),
    hora_inicio TIME NOT NULL,
    hora_fin TIME NOT NULL,
    hora_inicio_tarde TIME,
    hora_fin_tarde TIME,
    duracion_slot_minutos SMALLINT NOT NULL DEFAULT 30,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(medico_id, dia_semana, hora_inicio)
);

CREATE INDEX idx_horario_medico ON horario_medico(medico_id);

CREATE TABLE bloqueo_agenda (
    id SERIAL PRIMARY KEY,
    medico_id INTEGER NOT NULL REFERENCES medico(id) ON DELETE CASCADE,
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL,
    hora_inicio TIME,
    hora_fin TIME,
    motivo VARCHAR(300) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CHECK (fecha_fin >= fecha_inicio)
);

CREATE INDEX idx_bloqueo_medico ON bloqueo_agenda(medico_id);
CREATE INDEX idx_bloqueo_fechas ON bloqueo_agenda(fecha_inicio, fecha_fin);

-- ============================================================================
-- 26. EXÁMENES CLÍNICOS Y RESULTADOS
-- ============================================================================

CREATE TABLE tipo_examen (
    id SMALLSERIAL PRIMARY KEY,
    nombre VARCHAR(200) NOT NULL UNIQUE,
    categoria VARCHAR(100) CHECK (categoria IN ('laboratorio', 'imagen', 'procedimiento', 'gabinete', 'endoscopia', 'cardiologia', 'neurologia', 'otros')),
    descripcion TEXT,
    requiere_ayuno BOOLEAN NOT NULL DEFAULT FALSE,
    tiempo_resultado_horas INTEGER,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE examen_solicitado (
    id SERIAL PRIMARY KEY,
    consulta_id INTEGER NOT NULL REFERENCES consulta(id) ON DELETE RESTRICT,
    paciente_id INTEGER NOT NULL REFERENCES paciente(id) ON DELETE RESTRICT,
    medico_id INTEGER NOT NULL REFERENCES medico(id) ON DELETE RESTRICT,
    tipo_examen_id SMALLINT NOT NULL REFERENCES tipo_examen(id) ON DELETE RESTRICT,
    indicaciones TEXT,
    fecha_solicitud DATE NOT NULL DEFAULT CURRENT_DATE,
    fecha_realizacion DATE,
    fecha_resultado DATE,
    resultado TEXT,
    resultado_json JSONB,
    archivos JSONB DEFAULT '[]',
    es_critico BOOLEAN NOT NULL DEFAULT FALSE,
    valores_referencia TEXT,
    estado VARCHAR(20) NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'realizado', 'informado', 'entregado', 'cancelado')),
    realizado_por_id INTEGER REFERENCES usuario(id) ON DELETE SET NULL,
    validado_por_id INTEGER REFERENCES usuario(id) ON DELETE SET NULL,
    observaciones TEXT,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_examen_consulta ON examen_solicitado(consulta_id);
CREATE INDEX idx_examen_paciente ON examen_solicitado(paciente_id);
CREATE INDEX idx_examen_estado ON examen_solicitado(estado);
CREATE INDEX idx_examen_fecha ON examen_solicitado(fecha_solicitud);
CREATE INDEX idx_examen_tipo ON examen_solicitado(tipo_examen_id);

-- Seed data for exam types
INSERT INTO tipo_examen (nombre, categoria, descripcion, requiere_ayuno, tiempo_resultado_horas) VALUES
    ('Hemograma Completo', 'laboratorio', 'Recuento sanguíneo completo', FALSE, 24),
    ('Glucosa en Ayunas', 'laboratorio', 'Medición de glucosa en sangre', TRUE, 4),
    ('Perfil Lipídico', 'laboratorio', 'Colesterol total, HDL, LDL, triglicéridos', TRUE, 24),
    ('Examen General de Orina', 'laboratorio', 'Análisis completo de orina', FALSE, 24),
    ('Radiografía de Tórax', 'imagen', 'Rayos X de tórax AP y lateral', FALSE, 2),
    ('Ecografía Abdominal', 'imagen', 'Ultrasonido de abdomen total', TRUE, 2),
    ('Electrocardiograma', 'cardiologia', 'ECG de 12 derivaciones', FALSE, 1),
    ('Endoscopía Digestiva', 'endoscopia', 'Endoscopía alta', TRUE, 48),
    ('Tomografía Computarizada', 'imagen', 'TC simple o contrastada', FALSE, 24),
    ('Resonancia Magnética', 'imagen', 'RMN por área a estudiar', FALSE, 48),
    ('Prueba de Esfuerzo', 'cardiologia', 'Test ergométrico', FALSE, 24),
    ('Espirometría', 'gabinete', 'Prueba de función pulmonar', FALSE, 2),
    ('Electroencefalograma', 'neurologia', 'EEG en reposo', FALSE, 24),
    ('Cultivo de Herida', 'laboratorio', 'Cultivo bacteriológico con antibiograma', FALSE, 72),
    ('Prueba de Embarazo', 'laboratorio', 'HCG cuantitativa en sangre', FALSE, 4)
ON CONFLICT (nombre) DO NOTHING;

-- ============================================================================
-- 27. DUPLICIDAD TERAPÉUTICA Y GRUPOS FARMACOLÓGICOS
-- ============================================================================

CREATE TABLE grupo_farmacologico (
    id SMALLSERIAL PRIMARY KEY,
    nombre VARCHAR(200) NOT NULL UNIQUE,
    descripcion TEXT,
    riesgo_duplicidad VARCHAR(20) NOT NULL DEFAULT 'moderado' CHECK (riesgo_duplicidad IN ('bajo', 'moderado', 'alto', 'critico')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE medicamento_grupo (
    id SERIAL PRIMARY KEY,
    medicamento_id INTEGER NOT NULL REFERENCES medicamento(id) ON DELETE CASCADE,
    grupo_farmacologico_id SMALLINT NOT NULL REFERENCES grupo_farmacologico(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(medicamento_id, grupo_farmacologico_id)
);

CREATE INDEX idx_medicamento_grupo_med ON medicamento_grupo(medicamento_id);
CREATE INDEX idx_medicamento_grupo_grupo ON medicamento_grupo(grupo_farmacologico_id);

CREATE TABLE contraindicacion (
    id SERIAL PRIMARY KEY,
    medicamento_id INTEGER NOT NULL REFERENCES medicamento(id) ON DELETE CASCADE,
    condicion VARCHAR(300) NOT NULL,
    severidad VARCHAR(20) NOT NULL DEFAULT 'moderada' CHECK (severidad IN ('leve', 'moderada', 'severa', 'absoluta')),
    descripcion TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_contraindicacion_med ON contraindicacion(medicamento_id);

-- ============================================================================
-- 29. HISTÓRICO FARMACOLÓGICO Y CAMBIOS DE TRATAMIENTO
-- ============================================================================

CREATE TABLE historico_tratamiento (
    id SERIAL PRIMARY KEY,
    paciente_id INTEGER NOT NULL REFERENCES paciente(id) ON DELETE CASCADE,
    medicamento_id INTEGER NOT NULL REFERENCES medicamento(id) ON DELETE RESTRICT,
    consulta_id INTEGER REFERENCES consulta(id) ON DELETE SET NULL,
    receta_id INTEGER REFERENCES receta(id) ON DELETE SET NULL,
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE,
    dosis VARCHAR(100) NOT NULL,
    frecuencia VARCHAR(100) NOT NULL,
    via_administracion_id SMALLINT REFERENCES via_administracion(id) ON DELETE SET NULL,
    estado VARCHAR(20) NOT NULL DEFAULT 'activo' CHECK (estado IN ('activo', 'suspendido', 'completado', 'cambiado', 'abandonado')),
    motivo_cambio TEXT,
    medico_id INTEGER REFERENCES medico(id) ON DELETE SET NULL,
    observaciones TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_historico_paciente ON historico_tratamiento(paciente_id);
CREATE INDEX idx_historico_medicamento ON historico_tratamiento(medicamento_id);
CREATE INDEX idx_historico_activo ON historico_tratamiento(paciente_id) WHERE estado = 'activo';

-- ============================================================================
-- 28. SAAS - PLANES Y SUSCRIPCIONES
-- ============================================================================

CREATE TABLE plan_suscripcion (
    id SMALLSERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    codigo VARCHAR(30) NOT NULL UNIQUE,
    descripcion TEXT,
    precio_mensual DECIMAL(10,2) NOT NULL DEFAULT 0,
    max_sucursales SMALLINT NOT NULL DEFAULT 1,
    max_medicos SMALLINT NOT NULL DEFAULT 5,
    max_pacientes INTEGER NOT NULL DEFAULT 100,
    incluye_laboratorio BOOLEAN NOT NULL DEFAULT FALSE,
    incluye_farmacia BOOLEAN NOT NULL DEFAULT FALSE,
    incluye_hospitalizacion BOOLEAN NOT NULL DEFAULT FALSE,
    incluye_facturacion BOOLEAN NOT NULL DEFAULT FALSE,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE sucursal ADD COLUMN IF NOT EXISTS plan_suscripcion_id SMALLINT REFERENCES plan_suscripcion(id) ON DELETE SET NULL;
ALTER TABLE sucursal ADD COLUMN IF NOT EXISTS fecha_activacion DATE DEFAULT CURRENT_DATE;
ALTER TABLE sucursal ADD COLUMN IF NOT EXISTS fecha_expiracion DATE;

INSERT INTO plan_suscripcion (nombre, codigo, precio_mensual, max_sucursales, max_medicos, max_pacientes, incluye_laboratorio, incluye_farmacia, incluye_hospitalizacion, incluye_facturacion) VALUES
    ('Básico', 'BASIC', 99.00, 1, 3, 500, FALSE, FALSE, FALSE, TRUE),
    ('Profesional', 'PRO', 199.00, 2, 10, 2000, TRUE, TRUE, FALSE, TRUE),
    ('Enterprise', 'ENTERPRISE', 399.00, 10, 50, 10000, TRUE, TRUE, TRUE, TRUE),
    ('Ilimitado', 'UNLIMITED', 799.00, 999, 999, 999999, TRUE, TRUE, TRUE, TRUE)
ON CONFLICT (codigo) DO NOTHING;

COMMIT;

SELECT '✅ Esquema Clínica Santa Isabel creado exitosamente' AS resultado;
