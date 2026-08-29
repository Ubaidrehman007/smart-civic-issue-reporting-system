package com.smartcivic.backend.audit.controller;

import com.smartcivic.backend.audit.dto.AuditLogResponse;
import com.smartcivic.backend.audit.entity.AuditAction;
import com.smartcivic.backend.audit.entity.AuditEntityType;
import com.smartcivic.backend.audit.service.AuditLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/audit-logs")
@RequiredArgsConstructor
@PreAuthorize("hasAuthority('ADMIN')")
public class AuditLogController {

    private final AuditLogService auditLogService;


    // =====================================================
    // GET ALL AUDIT LOGS
    // =====================================================

    @GetMapping
    public ResponseEntity<Page<AuditLogResponse>> getAllAuditLogs(

            @RequestParam(defaultValue = "0")
            int page,

            @RequestParam(defaultValue = "20")
            int size

    ) {

        Pageable pageable =
                createPageable(page, size);

        return ResponseEntity.ok(
                auditLogService.getAllAuditLogs(pageable)
        );
    }


    // =====================================================
    // SEARCH AUDIT LOGS
    // =====================================================

    @GetMapping("/search")
    public ResponseEntity<Page<AuditLogResponse>> searchAuditLogs(

            @RequestParam String keyword,

            @RequestParam(defaultValue = "0")
            int page,

            @RequestParam(defaultValue = "20")
            int size

    ) {

        Pageable pageable =
                createPageable(page, size);

        return ResponseEntity.ok(
                auditLogService.searchAuditLogs(
                        keyword,
                        pageable
                )
        );
    }


    // =====================================================
    // FILTER BY ACTOR
    // =====================================================

    @GetMapping("/actor/{actorId}")
    public ResponseEntity<Page<AuditLogResponse>> getByActor(

            @PathVariable UUID actorId,

            @RequestParam(defaultValue = "0")
            int page,

            @RequestParam(defaultValue = "20")
            int size

    ) {

        Pageable pageable =
                createPageable(page, size);

        return ResponseEntity.ok(
                auditLogService.getAuditLogsByActor(
                        actorId,
                        pageable
                )
        );
    }


    // =====================================================
    // FILTER BY ACTION
    // =====================================================

    @GetMapping("/action/{action}")
    public ResponseEntity<Page<AuditLogResponse>> getByAction(

            @PathVariable AuditAction action,

            @RequestParam(defaultValue = "0")
            int page,

            @RequestParam(defaultValue = "20")
            int size

    ) {

        Pageable pageable =
                createPageable(page, size);

        return ResponseEntity.ok(
                auditLogService.getAuditLogsByAction(
                        action,
                        pageable
                )
        );
    }


    // =====================================================
    // FILTER BY ENTITY TYPE
    // =====================================================

    @GetMapping("/entity-type/{entityType}")
    public ResponseEntity<Page<AuditLogResponse>> getByEntityType(

            @PathVariable AuditEntityType entityType,

            @RequestParam(defaultValue = "0")
            int page,

            @RequestParam(defaultValue = "20")
            int size

    ) {

        Pageable pageable =
                createPageable(page, size);

        return ResponseEntity.ok(
                auditLogService.getAuditLogsByEntityType(
                        entityType,
                        pageable
                )
        );
    }


    // =====================================================
    // GET AUDIT LOGS FOR SPECIFIC ENTITY
    // =====================================================

    @GetMapping("/entity/{entityType}/{entityId}")
    public ResponseEntity<Page<AuditLogResponse>> getByEntity(

            @PathVariable AuditEntityType entityType,

            @PathVariable UUID entityId,

            @RequestParam(defaultValue = "0")
            int page,

            @RequestParam(defaultValue = "20")
            int size

    ) {

        Pageable pageable =
                createPageable(page, size);

        return ResponseEntity.ok(
                auditLogService.getAuditLogsByEntity(
                        entityType,
                        entityId,
                        pageable
                )
        );
    }


    // =====================================================
    // PAGEABLE HELPER
    // =====================================================

    private Pageable createPageable(
            int page,
            int size
    ) {

        if (page < 0) {
            page = 0;
        }

        if (size < 1) {
            size = 20;
        }

        if (size > 100) {
            size = 100;
        }

        return PageRequest.of(
                page,
                size,
                Sort.by(
                        Sort.Direction.DESC,
                        "createdAt"
                )
        );
    }
}