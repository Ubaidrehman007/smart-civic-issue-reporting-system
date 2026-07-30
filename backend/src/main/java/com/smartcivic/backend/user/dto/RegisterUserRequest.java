package com.smartcivic.backend.user.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record RegisterUserRequest(
        @NotBlank(message = "Full name is required")
        @Size(min = 2, max = 100, message = "Full name must be between 2 and 100 charecters")
        String fullName,

        @NotBlank(message = "Email is required")
        @Size(max = 255, message = "Email must not exceed 255 characters")
        @Email(message = "Email address is invalid")
        String email,

        @NotBlank(message = "PhoneNumber is Required")
        @Pattern(
                regexp = "^[6-9][0-9]{9}$",
                message = "Phone number must be a valid 10-digit Indian mobile number"
        )
        String phoneNumber,

        @NotBlank(message = "Password os required")
        @Size(min = 8, max = 72, message = "Password must be between 8 and 72 Charecters")
        String password
        )
{


}
