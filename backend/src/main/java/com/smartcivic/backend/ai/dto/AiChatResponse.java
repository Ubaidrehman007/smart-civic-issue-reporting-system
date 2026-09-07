package com.smartcivic.backend.ai.dto;

import java.time.LocalDateTime;

public record AiChatResponse(

        boolean success,

        String message,

        LocalDateTime timestamp

) {
}