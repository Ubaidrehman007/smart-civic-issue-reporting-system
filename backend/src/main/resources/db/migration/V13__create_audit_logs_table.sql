CREATE TABLE audit_logs (

                            id UUID NOT NULL,

                            actor_id UUID,

                            action VARCHAR(50) NOT NULL,

                            entity_type VARCHAR(30) NOT NULL,

                            entity_id UUID,

                            description TEXT NOT NULL,

                            old_value TEXT,

                            new_value TEXT,

                            ip_address VARCHAR(45),

                            created_at TIMESTAMP WITH TIME ZONE NOT NULL,

                            CONSTRAINT pk_audit_logs
                                PRIMARY KEY (id),

                            CONSTRAINT fk_audit_logs_actor
                                FOREIGN KEY (actor_id)
                                    REFERENCES users(id)
);


-- =====================================================
-- INDEXES
-- =====================================================

CREATE INDEX idx_audit_logs_actor_id
    ON audit_logs(actor_id);

CREATE INDEX idx_audit_logs_action
    ON audit_logs(action);

CREATE INDEX idx_audit_logs_entity_type
    ON audit_logs(entity_type);

CREATE INDEX idx_audit_logs_entity_id
    ON audit_logs(entity_id);

CREATE INDEX idx_audit_logs_created_at
    ON audit_logs(created_at);