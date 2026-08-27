package com.smartcivic.backend.auth.service;

public interface EmailService {

    void sendEmail(
            String to,
            String subject,
            String body
    );
}