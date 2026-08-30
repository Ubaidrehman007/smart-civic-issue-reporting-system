package com.smartcivic.backend.audit.service;

import com.smartcivic.backend.audit.dto.AuditLogResponse;
import com.smartcivic.backend.audit.entity.AuditAction;
import com.smartcivic.backend.audit.entity.AuditEntityType;
import com.smartcivic.backend.audit.entity.AuditLog;
import com.smartcivic.backend.audit.repository.AuditLogRepository;
import com.smartcivic.backend.user.entity.User;
import com.smartcivic.backend.user.exception.UserNotFoundException;
import com.smartcivic.backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AuditLogServiceImpl
        implements AuditLogService {


    private final AuditLogRepository auditLogRepository;

    private final UserRepository userRepository;


    // =====================================================
    // CREATE AUDIT LOG
    // =====================================================

    @Override
    @Transactional
    public AuditLogResponse createAuditLog(

            User actor,

            AuditAction action,

            AuditEntityType entityType,

            UUID entityId,

            String description,

            String oldValue,

            String newValue,

            String ipAddress

    ) {

        AuditLog auditLog =
                AuditLog.builder()
                        .actor(actor)
                        .action(action)
                        .entityType(entityType)
                        .entityId(entityId)
                        .description(description)
                        .oldValue(oldValue)
                        .newValue(newValue)
                        .ipAddress(ipAddress)
                        .build();


        AuditLog savedAuditLog =
                auditLogRepository.save(auditLog);


        return mapToAuditLogResponse(
                savedAuditLog
        );
    }


    // =====================================================
    // GET ALL AUDIT LOGS
    // =====================================================

    @Override
    public Page<AuditLogResponse> getAllAuditLogs(
            Pageable pageable
    ) {

        return auditLogRepository
                .findAll(pageable)
                .map(this::mapToAuditLogResponse);
    }


    // =====================================================
    // GET AUDIT LOGS BY ACTOR
    // =====================================================

    @Override
    public Page<AuditLogResponse> getAuditLogsByActor(

            UUID actorId,

            Pageable pageable

    ) {

        User actor =
                userRepository.findById(actorId)
                        .orElseThrow(() ->
                                new UserNotFoundException(
                                        "User not found"
                                )
                        );


        return auditLogRepository
                .findByActor(
                        actor,
                        pageable
                )
                .map(this::mapToAuditLogResponse);
    }


    // =====================================================
    // GET AUDIT LOGS BY ACTION
    // =====================================================

    @Override
    public Page<AuditLogResponse> getAuditLogsByAction(

            AuditAction action,

            Pageable pageable

    ) {

        return auditLogRepository
                .findByAction(
                        action,
                        pageable
                )
                .map(this::mapToAuditLogResponse);
    }


    // =====================================================
    // GET AUDIT LOGS BY ENTITY TYPE
    // =====================================================

    @Override
    public Page<AuditLogResponse> getAuditLogsByEntityType(

            AuditEntityType entityType,

            Pageable pageable

    ) {

        return auditLogRepository
                .findByEntityType(
                        entityType,
                        pageable
                )
                .map(this::mapToAuditLogResponse);
    }


    // =====================================================
    // GET AUDIT LOGS FOR SPECIFIC ENTITY
    // =====================================================

    @Override
    public Page<AuditLogResponse> getAuditLogsByEntity(

            AuditEntityType entityType,

            UUID entityId,

            Pageable pageable

    ) {

        return auditLogRepository
                .findByEntityTypeAndEntityId(
                        entityType,
                        entityId,
                        pageable
                )
                .map(this::mapToAuditLogResponse);
    }


    // =====================================================
    // SEARCH AUDIT LOGS
    // =====================================================

    @Override
    public Page<AuditLogResponse> searchAuditLogs(

            String keyword,

            Pageable pageable

    ) {

        return auditLogRepository
                .findByDescriptionContainingIgnoreCase(
                        keyword,
                        pageable
                )
                .map(this::mapToAuditLogResponse);
    }


    // =====================================================
    // FILTER AUDIT LOGS
    // =====================================================

    @Override
    public Page<AuditLogResponse> filterAuditLogs(

            String keyword,

            AuditAction action,

            AuditEntityType entityType,

            Pageable pageable

    ) {

        return auditLogRepository
                .findAuditLogsWithFilters(
                        keyword,
                        action,
                        entityType,
                        pageable
                )
                .map(this::mapToAuditLogResponse);
    }


    // =====================================================
    // ENTITY → RESPONSE DTO
    // =====================================================

    private AuditLogResponse mapToAuditLogResponse(
            AuditLog auditLog
    ) {

        User actor =
                auditLog.getActor();


        return new AuditLogResponse(

                auditLog.getId(),

                actor != null
                        ? actor.getId()
                        : null,

                actor != null
                        ? actor.getFullName()
                        : null,

                actor != null
                        ? actor.getEmail()
                        : null,

                actor != null
                        && actor.getRole() != null
                        ? actor.getRole().name()
                        : null,

                auditLog.getAction(),

                auditLog.getEntityType(),

                auditLog.getEntityId(),

                auditLog.getDescription(),

                auditLog.getOldValue(),

                auditLog.getNewValue(),

                auditLog.getIpAddress(),

                auditLog.getCreatedAt()
        );
    }
}