package com.smartcivic.backend.ai.dto;

import jakarta.validation.constraints.NotBlank;

public record AiAnalysisRequest(

        @NotBlank(message = "Prompt is required")
        String prompt

) {
}