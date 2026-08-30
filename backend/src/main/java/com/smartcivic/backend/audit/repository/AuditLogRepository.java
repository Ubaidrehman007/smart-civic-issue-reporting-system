package com.smartcivic.backend.audit.repository;

import com.smartcivic.backend.audit.entity.AuditAction;
import com.smartcivic.backend.audit.entity.AuditEntityType;
import com.smartcivic.backend.audit.entity.AuditLog;
import com.smartcivic.backend.user.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

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

    Page<AuditLog> findByDescriptionContainingIgnoreCase(
            String keyword,
            Pageable pageable
    );


    // =====================================================
    // COMBINED FILTER
    // =====================================================

    @Query("""
            SELECT a
            FROM AuditLog a
            LEFT JOIN a.actor actor
            WHERE
                (
                    :keyword IS NULL
                    OR :keyword = ''
                    OR LOWER(a.description)
                       LIKE LOWER(CONCAT('%', :keyword, '%'))
                    OR LOWER(COALESCE(actor.fullName, ''))
                       LIKE LOWER(CONCAT('%', :keyword, '%'))
                    OR LOWER(COALESCE(actor.email, ''))
                       LIKE LOWER(CONCAT('%', :keyword, '%'))
                )
            AND
                (
                    :action IS NULL
                    OR a.action = :action
                )
            AND
                (
                    :entityType IS NULL
                    OR a.entityType = :entityType
                )
            """)
    Page<AuditLog> findAuditLogsWithFilters(

            @Param("keyword")
            String keyword,

            @Param("action")
            AuditAction action,

            @Param("entityType")
            AuditEntityType entityType,

            Pageable pageable
    );
}