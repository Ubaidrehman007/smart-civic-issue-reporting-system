package com.smartcivic.backend.ai.dto;

import jakarta.validation.constraints.NotBlank;

public record AiChatRequest(

        @NotBlank(message = "Message is required")
        String message,

        @NotBlank(message = "Role is required")
        String role

) {
}