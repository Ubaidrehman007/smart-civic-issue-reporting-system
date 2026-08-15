ALTER TABLE issues
    ADD COLUMN assigned_to UUID;

ALTER TABLE issues
    ADD CONSTRAINT fk_issues_assigned_to
        FOREIGN KEY (assigned_to)
            REFERENCES users(id);