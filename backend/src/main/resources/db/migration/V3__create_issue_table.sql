CREATE TABLE issues
(
    id UUID PRIMARY KEY,

    title VARCHAR(100) NOT NULL,

    description TEXT NOT NULL,

    category VARCHAR(30) NOT NULL,

    priority VARCHAR(20) NOT NULL DEFAULT 'MEDIUM',

    status VARCHAR(30) NOT NULL DEFAULT 'REPORTED',

    image_url TEXT,

    latitude DOUBLE PRECISION NOT NULL,

    longitude DOUBLE PRECISION NOT NULL,

    address TEXT NOT NULL,

    reported_by UUID NOT NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_issue_user
        FOREIGN KEY (reported_by)
            REFERENCES users(id)
            ON DELETE RESTRICT
);