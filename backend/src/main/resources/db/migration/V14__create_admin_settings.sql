ALTER TABLE admin_settings
    ADD COLUMN IF NOT EXISTS notify_issue_assignments BOOLEAN NOT NULL DEFAULT TRUE;

ALTER TABLE admin_settings
    ADD COLUMN IF NOT EXISTS notify_sla_warnings BOOLEAN NOT NULL DEFAULT TRUE;

ALTER TABLE admin_settings
    ADD COLUMN IF NOT EXISTS notify_new_citizen_registrations BOOLEAN NOT NULL DEFAULT TRUE;

ALTER TABLE admin_settings
    ADD COLUMN IF NOT EXISTS notify_account_status_changes BOOLEAN NOT NULL DEFAULT TRUE;

ALTER TABLE admin_settings
    ADD COLUMN IF NOT EXISTS default_issue_status VARCHAR(30) NOT NULL DEFAULT 'REPORTED';

ALTER TABLE admin_settings
    ADD COLUMN IF NOT EXISTS email_notifications BOOLEAN NOT NULL DEFAULT TRUE;

ALTER TABLE admin_settings
    ADD COLUMN IF NOT EXISTS sessions_invalidated_at TIMESTAMPTZ;

UPDATE admin_settings
SET
    notify_issue_assignments = TRUE,
    notify_sla_warnings = TRUE,
    notify_new_citizen_registrations = TRUE,
    notify_account_status_changes = TRUE,
    default_issue_status = 'REPORTED',
    email_notifications = TRUE
WHERE
    notify_issue_assignments IS NULL
   OR notify_sla_warnings IS NULL
   OR notify_new_citizen_registrations IS NULL
   OR notify_account_status_changes IS NULL
   OR default_issue_status IS NULL
   OR email_notifications IS NULL;