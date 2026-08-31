-- ============================================================
-- V15: FIX CITIZEN ACCOUNT DELETION
-- ============================================================

-- ============================================================
-- 1. ISSUE REPORTED_BY
-- ============================================================

-- Existing foreign key prevents user deletion because
-- issues.reported_by references users.id.

ALTER TABLE issues
DROP CONSTRAINT IF EXISTS fk_issue_user;

-- A deleted citizen's issues must remain in the system.
-- Only the reporter reference is removed.

ALTER TABLE issues
    ALTER COLUMN reported_by DROP NOT NULL;

ALTER TABLE issues
    ADD CONSTRAINT fk_issue_user
        FOREIGN KEY (reported_by)
            REFERENCES users(id)
            ON DELETE SET NULL;


-- ============================================================
-- 2. NOTIFICATIONS
-- ============================================================

-- Notifications belong to a user and do not need to survive
-- after that user's account is permanently deleted.

ALTER TABLE notifications
DROP CONSTRAINT IF EXISTS fk_notifications_user;

ALTER TABLE notifications
    ADD CONSTRAINT fk_notifications_user
        FOREIGN KEY (user_id)
            REFERENCES users(id)
            ON DELETE CASCADE;

