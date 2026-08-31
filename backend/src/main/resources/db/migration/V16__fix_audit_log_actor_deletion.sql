-- ============================================================
-- V16: FIX AUDIT LOG ACTOR FOREIGN KEY
-- ============================================================

-- Audit logs must survive user/account deletion.
-- When the actor/user is deleted, keep the audit log
-- and remove only the actor reference.

ALTER TABLE audit_logs
DROP CONSTRAINT IF EXISTS fk_audit_logs_actor;

ALTER TABLE audit_logs
    ALTER COLUMN actor_id DROP NOT NULL;

ALTER TABLE audit_logs
    ADD CONSTRAINT fk_audit_logs_actor
        FOREIGN KEY (actor_id)
            REFERENCES users(id)
            ON DELETE SET NULL;