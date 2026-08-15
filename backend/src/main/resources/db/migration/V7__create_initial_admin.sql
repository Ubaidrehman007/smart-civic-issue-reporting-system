-- =========================================================
-- Migration: V7 - Create Initial Admin User
-- Purpose:
-- Creates the first system administrator account.
-- Public registration only creates CITIZEN accounts.
-- =========================================================

INSERT INTO users (
    id,
    full_name,
    email,
    phone_number,
    password_hash,
    role,
    account_status,
    email_verified,
    phone_verified,
    created_at,
    updated_at
)
VALUES (
           gen_random_uuid(),
           'System Administrator',
           'admin@smartcivic.com',
           '9999999999',
           '$2a$10$w7SeDtGAT68pmtUiScC1juFsPgrdJc8cBjJ.EUw028hXZF/kIAmSK',
           'ADMIN',
           'ACTIVE',
           TRUE,
           TRUE,
           CURRENT_TIMESTAMP,
           CURRENT_TIMESTAMP
       );