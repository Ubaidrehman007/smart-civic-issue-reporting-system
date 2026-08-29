package com.smartcivic.backend.audit.service;

import com.smartcivic.backend.audit.dto.AuditLogResponse;
import com.smartcivic.backend.audit.entity.AuditAction;
import com.smartcivic.backend.audit.entity.AuditEntityType;
import com.smartcivic.backend.user.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface AuditLogService {

    // =====================================================
    // CREATE AUDIT LOG
    // =====================================================

    AuditLogResponse createAuditLog(
            User actor,
            AuditAction action,
            AuditEntityType entityType,
            UUID entityId,
            String description,
            String oldValue,
            String newValue,
            String ipAddress
    );


    // =====================================================
    // GET ALL AUDIT LOGS
    // =====================================================

    Page<AuditLogResponse> getAllAuditLogs(
            Pageable pageable
    );


    // =====================================================
    // GET AUDIT LOGS BY ACTOR
    // =====================================================

    Page<AuditLogResponse> getAuditLogsByActor(
            UUID actorId,
            Pageable pageable
    );


    // =====================================================
    // GET AUDIT LOGS BY ACTION
    // =====================================================

    Page<AuditLogResponse> getAuditLogsByAction(
            AuditAction action,
            Pageable pageable
    );


    // =====================================================
    // GET AUDIT LOGS BY ENTITY TYPE
    // =====================================================

    Page<AuditLogResponse> getAuditLogsByEntityType(
            AuditEntityType entityType,
            Pageable pageable
    );


    // =====================================================
    // GET AUDIT LOGS FOR SPECIFIC ENTITY
    // =====================================================

    Page<AuditLogResponse> getAuditLogsByEntity(
            AuditEntityType entityType,
            UUID entityId,
            Pageable pageable
    );


    // =====================================================
    // SEARCH AUDIT LOGS
    // =====================================================

    Page<AuditLogResponse> searchAuditLogs(
            String keyword,
            Pageable pageable
    );
}