package com.smartcivic.backend.notification.dto;

import com.smartcivic.backend.notification.entity.NotificationType;

import java.time.Instant;
import java.util.UUID;

public record NotificationResponse(

        UUID id,

        NotificationType type,

        String title,

        String message,

        UUID referenceId,

        boolean isRead,

        Instant createdAt

) {
}