package com.smartcivic.backend.audit.dto;

import com.smartcivic.backend.audit.entity.AuditAction;
import com.smartcivic.backend.audit.entity.AuditEntityType;

import java.time.Instant;
import java.util.UUID;

public record AuditLogResponse(

        UUID id,

        UUID actorId,

        String actorName,

        String actorEmail,

        String actorRole,

        AuditAction action,

        AuditEntityType entityType,

        UUID entityId,

        String description,

        String oldValue,

        String newValue,

        String ipAddress,

        Instant createdAt

) {
}