CREATE TABLE email_otps
(

                            id UUID PRIMARY KEY,

                            user_id UUID NOT NULL,

                            email VARCHAR(255) NOT NULL,

                            otp_hash VARCHAR(255) NOT NULL,

                            purpose VARCHAR(30) NOT NULL,

                            expires_at TIMESTAMP WITH TIME ZONE NOT NULL,

                            verified_at TIMESTAMP WITH TIME ZONE,

                            attempts INTEGER NOT NULL DEFAULT 0,

                            created_at TIMESTAMP WITH TIME ZONE NOT NULL,

                            CONSTRAINT fk_email_otps_user
                                FOREIGN KEY (user_id)
                                    REFERENCES users(id)
                                    ON DELETE CASCADE
);

CREATE INDEX idx_email_otps_user_id
    ON email_otps(user_id);

CREATE INDEX idx_email_otps_email
    ON email_otps(email);

CREATE INDEX idx_email_otps_purpose
    ON email_otps(purpose);

CREATE INDEX idx_email_otps_expires_at
    ON email_otps(expires_at);