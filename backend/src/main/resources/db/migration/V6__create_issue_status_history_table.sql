CREATE TABLE issue_status_history
(
    id UUID PRIMARY KEY,

    issue_id UUID NOT NULL,

    from_status VARCHAR(30) NOT NULL,

    to_status VARCHAR(30) NOT NULL,

    changed_by UUID NOT NULL,

    remark TEXT,

    changed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_issue_status_history_issue
        FOREIGN KEY (issue_id)
            REFERENCES issues(id)
            ON DELETE CASCADE,

    CONSTRAINT fk_issue_status_history_user
        FOREIGN KEY (changed_by)
            REFERENCES users(id)
            ON DELETE RESTRICT
);

CREATE INDEX idx_issue_status_history_issue_id
    ON issue_status_history(issue_id);

CREATE INDEX idx_issue_status_history_changed_at
    ON issue_status_history(changed_at);