package com.smartcivic.backend.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record ForgotPasswordRequest(

        @NotBlank(message = "Email is required")
        @Email(message = "Email address is invalid")
        String email

) {
}