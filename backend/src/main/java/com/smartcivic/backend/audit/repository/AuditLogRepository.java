package com.smartcivic.backend.audit.repository;

import com.smartcivic.backend.audit.entity.AuditAction;
import com.smartcivic.backend.audit.entity.AuditEntityType;
import com.smartcivic.backend.audit.entity.AuditLog;
import com.smartcivic.backend.user.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface AuditLogRepository
        extends JpaRepository<AuditLog, UUID> {


    // =====================================================
    // GET AUDIT LOGS BY ACTOR
    // =====================================================

    Page<AuditLog> findByActor(
            User actor,
            Pageable pageable
    );


    // =====================================================
    // GET AUDIT LOGS BY ACTION
    // =====================================================

    Page<AuditLog> findByAction(
            AuditAction action,
            Pageable pageable
    );


    // =====================================================
    // GET AUDIT LOGS BY ENTITY TYPE
    // =====================================================

    Page<AuditLog> findByEntityType(
            AuditEntityType entityType,
            Pageable pageable
    );


    // =====================================================
    // GET AUDIT LOGS BY ENTITY
    // =====================================================

    Page<AuditLog> findByEntityTypeAndEntityId(
            AuditEntityType entityType,
            UUID entityId,
            Pageable pageable
    );


    // =====================================================
    // SEARCH AUDIT LOGS
    // =====================================================

    Page<AuditLog>
    findByDescriptionContainingIgnoreCase(
            String keyword,
            Pageable pageable
    );
}