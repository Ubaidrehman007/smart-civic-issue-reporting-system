package com.smartcivic.backend.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record VerifyRegistrationOtpRequest(

        @NotBlank(message = "Email is required")
        @Email(message = "Email address is invalid")
        String email,

        @NotBlank(message = "OTP is required")
        @Pattern(
                regexp = "^\\d{6}$",
                message = "OTP must be a 6-digit number"
        )
        String otp
) {
}