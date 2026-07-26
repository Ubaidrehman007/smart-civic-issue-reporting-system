-- =========================================================
-- Migration: V2 - Create Users Table
-- Purpose:
-- Stores common authentication and account information
-- for Citizens, Field Workers, and Administrators.
-- =========================================================

CREATE TABLE users
(
    id UUID PRIMARY KEY,

    full_name VARCHAR(100) NOT NULL,

    email VARCHAR(255) UNIQUE,

    phone_number VARCHAR(20) UNIQUE,

    password_hash VARCHAR(255) NOT NULL,

    role VARCHAR(30) NOT NULL,

    account_status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',

    email_verified BOOLEAN NOT NULL DEFAULT FALSE,

    phone_verified BOOLEAN NOT NULL DEFAULT FALSE,

    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT chk_users_role
        CHECK (role IN ('CITIZEN', 'FIELD_WORKER', 'ADMIN')),

    CONSTRAINT chk_users_account_status
        CHECK (account_status IN ('ACTIVE', 'SUSPENDED', 'DISABLED')),

    CONSTRAINT chk_users_contact
        CHECK (email IS NOT NULL OR phone_number IS NOT NULL)
);