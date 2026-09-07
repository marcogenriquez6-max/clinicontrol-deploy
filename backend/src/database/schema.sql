-- =====================================================
-- SISTEMA DE HISTORIAL DE CLIENTES - PostgreSQL Schema
-- =====================================================
-- Entidades: AccountStatus, Customer, ContactInfo, Address, Interaction, Attachment, AuditLog
-- =====================================================

-- 1. ACCOUNT STATUS (catálogo)
CREATE TABLE IF NOT EXISTS account_status (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE
);

CREATE INDEX idx_account_status_name ON account_status(name);

-- 2. CUSTOMER
CREATE TABLE IF NOT EXISTS customer (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    company VARCHAR(255),
    account_status_id INT REFERENCES account_status(id) DEFAULT 3,
    notes TEXT,
    tags JSONB DEFAULT '[]',
    created_by UUID,
    updated_by UUID,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_customer_status ON customer(account_status_id);
CREATE INDEX idx_customer_name ON customer(name);
CREATE INDEX idx_customer_company ON customer(company);
CREATE INDEX idx_customer_created_at ON customer(created_at);
CREATE INDEX idx_customer_deleted_at ON customer(deleted_at) WHERE deleted_at IS NULL;

-- 3. CONTACT INFO
CREATE TABLE IF NOT EXISTS contact_info (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES customer(id) ON DELETE CASCADE,
    contact_type VARCHAR(20) NOT NULL,
    value VARCHAR(255) NOT NULL,
    is_primary BOOLEAN DEFAULT FALSE,
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_contact_customer ON contact_info(customer_id);
CREATE INDEX idx_contact_type ON contact_info(contact_type);
CREATE UNIQUE INDEX contact_info_value_type ON contact_info(customer_id, contact_type, value) WHERE deleted_at IS NULL;

-- 4. ADDRESS
CREATE TABLE IF NOT EXISTS address (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES customer(id) ON DELETE CASCADE,
    address_type VARCHAR(20) DEFAULT 'billing',
    street VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100),
    zip_code VARCHAR(20),
    country VARCHAR(100) DEFAULT 'Bolivia',
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_address_customer ON address(customer_id);
CREATE INDEX idx_address_type ON address(address_type);

-- 5. INTERACTION
CREATE TABLE IF NOT EXISTS interaction (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES customer(id) ON DELETE CASCADE,
    interaction_type VARCHAR(20) NOT NULL,
    subject VARCHAR(255),
    content TEXT,
    direction VARCHAR(10),
    user_id UUID,
    related_to_id UUID,
    related_to_type VARCHAR(50),
    due_date TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    priority VARCHAR(10) DEFAULT 'normal',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_interaction_customer ON interaction(customer_id);
CREATE INDEX idx_interaction_user ON interaction(user_id);
CREATE INDEX idx_interaction_type ON interaction(interaction_type);
CREATE INDEX idx_interaction_due_date ON interaction(due_date);
CREATE INDEX idx_interaction_priority ON interaction(priority);

-- 6. ATTACHMENT
CREATE TABLE IF NOT EXISTS attachment (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID NOT NULL,
    filename VARCHAR(255) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    mime_type VARCHAR(100),
    size BIGINT,
    path VARCHAR(500) NOT NULL,
    thumbnail_path VARCHAR(500),
    uploaded_by UUID,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_attachment_entity ON attachment(entity_type, entity_id);
CREATE INDEX idx_attachment_filename ON attachment(filename);

-- 7. AUDIT LOG
CREATE TABLE IF NOT EXISTS audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    user_email VARCHAR(255),
    action VARCHAR(20) NOT NULL,
    entity_type VARCHAR(50),
    entity_id UUID,
    old_value JSONB,
    new_value JSONB,
    changes JSONB,
    ip_address INET,
    user_agent VARCHAR(500),
    session_id UUID,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_user ON audit_log(user_id);
CREATE INDEX idx_audit_entity ON audit_log(entity_type, entity_id);
CREATE INDEX idx_audit_action ON audit_log(action);
CREATE INDEX idx_audit_created ON audit_log(created_at);

-- 8. FUNCIÓN PARA AUDITAR CAMBIOS
CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO audit_log (user_id, action, entity_type, entity_id, new_value, created_at)
        VALUES (current_setting('app.current_user_id', TRUE)::UUID, 'CREATE', TG_TABLE_NAME, NEW.id, to_jsonb(NEW), CURRENT_TIMESTAMP);
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO audit_log (user_id, action, entity_type, entity_id, old_value, new_value, created_at)
        VALUES (current_setting('app.current_user_id', TRUE)::UUID, 'UPDATE', TG_TABLE_NAME, NEW.id, to_jsonb(OLD), to_jsonb(NEW), CURRENT_TIMESTAMP);
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO audit_log (user_id, action, entity_type, entity_id, old_value, created_at)
        VALUES (current_setting('app.current_user_id', TRUE)::UUID, 'DELETE', TG_TABLE_NAME, OLD.id, to_jsonb(OLD), CURRENT_TIMESTAMP);
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- SEEDS DE EJEMPLO
-- =====================================================

-- Account Status
INSERT INTO account_status (name, is_active) VALUES 
    ('active', TRUE),
    ('inactive', FALSE),
    ('prospect', TRUE),
    ('blocked', FALSE)
ON CONFLICT (name) DO NOTHING;

-- Customer de ejemplo
INSERT INTO customer (id, name, company, account_status_id, notes, tags) VALUES 
    ('a0eebc99-9c0b-4ef8-bb6d-3bb9d9a45c71', 'Juan Pérez', 'Empresa XYZ', 1, 'Cliente importante del sector tecnológico', '["vip", "premium"]'),
    ('b0eebc99-9c0b-4ef8-bb6d-3bb9d9a45c72', 'María García', 'Corp ABC', 1, 'Contacto principal para negociaciones', '["new"]'),
    ('c0eebc99-9c0b-4ef8-bb6d-3bb9d9a45c73', 'Carlos López', NULL, 3, 'Prospecto potencial', '["prospect"]')
ON CONFLICT (id) DO NOTHING;

-- Contact Info
INSERT INTO contact_info (customer_id, contact_type, value, is_primary) VALUES 
    ('a0eebc99-9c0b-4ef8-bb6d-3bb9d9a45c71', 'email', 'juan@empresaxyz.com', TRUE),
    ('a0eebc99-9c0b-4ef8-bb6d-3bb9d9a45c71', 'phone', '+591 70123456', TRUE),
    ('b0eebc99-9c0b-4ef8-bb6d-3bb9d9a45c72', 'email', 'maria@corpabc.com', TRUE),
    ('c0eebc99-9c0b-4ef8-bb6d-3bb9d9a45c73', 'email', 'carlos@email.com', TRUE),
    ('c0eebc99-9c0b-4ef8-bb6d-3bb9d9a45c73', 'phone', '+591 71234567', FALSE)
ON CONFLICT DO NOTHING;

-- Address
INSERT INTO address (customer_id, address_type, street, city, state, zip_code, is_default) VALUES 
    ('a0eebc99-9c0b-4ef8-bb6d-3bb9d9a45c71', 'billing', 'Av. Heroes del Acre #123', 'La Paz', 'La Paz', '11101', TRUE),
    ('a0eebc99-9c0b-4ef8-bb6d-3bb9d9a45c71', 'shipping', ' Calle 21 de Calhoun', 'El Alto', 'La Paz', '11102', FALSE),
    ('b0eebc99-9c0b-4ef8-bb6d-3bb9d9a45c72', 'billing', 'Plaza Principal #456', 'Santa Cruz', 'Santa Cruz', '11103', TRUE)
ON CONFLICT DO NOTHING;

-- Interaction
INSERT INTO interaction (customer_id, interaction_type, subject, content, priority, due_date) VALUES 
    ('a0eebc99-9c0b-4ef8-bb6d-3bb9d9a45c71', 'call', 'Llamada de seguimiento', 'Conversación sobre nuevos productos', 'normal', CURRENT_TIMESTAMP + INTERVAL '3 days'),
    ('b0eebc99-9c0b-4ef8-bb6d-3bb9d9a45c72', 'meeting', 'Reunión de presentación', 'Presentación de servicios al equipo directivo', 'high', CURRENT_TIMESTAMP + INTERVAL '7 days'),
    ('c0eebc99-9c0b-4ef8-bb6d-3bb9d9a45c73', 'note', 'Observaciones iniciales', 'Cliente mostró interés en servicios de consultoría', 'low', NULL)
ON CONFLICT DO NOTHING;

SELECT '✅ Base de datos inicializada correctamente';