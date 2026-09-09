-- =========================================================
-- Migration: V14 - Create Admin Settings
-- Purpose:
-- Stores global administrator/system configuration.
-- =========================================================

CREATE TABLE admin_settings
(
    id UUID PRIMARY KEY,

    notify_new_issues BOOLEAN NOT NULL DEFAULT TRUE,

    notify_status_changes BOOLEAN NOT NULL DEFAULT TRUE,

    notify_sla_breaches BOOLEAN NOT NULL DEFAULT TRUE,

    notify_issue_resolved BOOLEAN NOT NULL DEFAULT TRUE,

    default_issue_priority VARCHAR(30) NOT NULL DEFAULT 'MEDIUM',

    assignment_strategy VARCHAR(50) NOT NULL DEFAULT 'MANUAL',

    maintenance_mode BOOLEAN NOT NULL DEFAULT FALSE,

    allow_new_registrations BOOLEAN NOT NULL DEFAULT TRUE,

    allow_issue_reporting BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);


-- =========================================================
-- ADDITIONAL NOTIFICATION / SYSTEM SETTINGS
-- =========================================================

ALTER TABLE admin_settings
    ADD COLUMN notify_issue_assignments BOOLEAN NOT NULL DEFAULT TRUE;

ALTER TABLE admin_settings
    ADD COLUMN notify_sla_warnings BOOLEAN NOT NULL DEFAULT TRUE;

ALTER TABLE admin_settings
    ADD COLUMN notify_new_citizen_registrations BOOLEAN NOT NULL DEFAULT TRUE;

ALTER TABLE admin_settings
    ADD COLUMN notify_account_status_changes BOOLEAN NOT NULL DEFAULT TRUE;

ALTER TABLE admin_settings
    ADD COLUMN default_issue_status VARCHAR(30) NOT NULL DEFAULT 'REPORTED';

ALTER TABLE admin_settings
    ADD COLUMN email_notifications BOOLEAN NOT NULL DEFAULT TRUE;

ALTER TABLE admin_settings
    ADD COLUMN sessions_invalidated_at TIMESTAMPTZ;