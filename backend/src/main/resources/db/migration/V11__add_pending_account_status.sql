ALTER TABLE users
DROP CONSTRAINT IF EXISTS chk_users_account_status;

ALTER TABLE users
    ADD CONSTRAINT chk_users_account_status
        CHECK (
            account_status IN (
                               'PENDING',
                               'ACTIVE',
                               'SUSPENDED',
                               'DISABLED'
                )
            );