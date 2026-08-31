package com.smartcivic.backend.audit.entity;

import com.smartcivic.backend.user.entity.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(
        name = "audit_logs",
        indexes = {

                @Index(
                        name = "idx_audit_logs_actor_id",
                        columnList = "actor_id"
                ),

                @Index(
                        name = "idx_audit_logs_action",
                        columnList = "action"
                ),

                @Index(
                        name = "idx_audit_logs_entity_type",
                        columnList = "entity_type"
                ),

                @Index(
                        name = "idx_audit_logs_entity_id",
                        columnList = "entity_id"
                ),

                @Index(
                        name = "idx_audit_logs_created_at",
                        columnList = "created_at"
                )
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuditLog {

    // =====================================================
    // PRIMARY KEY
    // =====================================================

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;


    // =====================================================
    // ACTOR
    // =====================================================

    /*
     * The user who performed the action.
     *
     * Nullable because some future system-level
     * operations may not have a logged-in user.
     */

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "actor_id",
            nullable = true,
            foreignKey = @ForeignKey(
                    name = "fk_audit_logs_actor"
            )
    )
    private User actor;


    // =====================================================
    // ACTION
    // =====================================================

    @Enumerated(EnumType.STRING)
    @Column(
            nullable = false,
            length = 50
    )
    private AuditAction action;


    // =====================================================
    // ENTITY TYPE
    // =====================================================

    @Enumerated(EnumType.STRING)
    @Column(
            name = "entity_type",
            nullable = false,
            length = 30
    )
    private AuditEntityType entityType;


    // =====================================================
    // ENTITY ID
    // =====================================================

    /*
     * ID of the object affected by the action.
     *
     * Examples:
     *
     * Issue UUID
     * User UUID
     */

    @Column(name = "entity_id")
    private UUID entityId;


    // =====================================================
    // DESCRIPTION
    // =====================================================

    @Column(
            nullable = false,
            columnDefinition = "TEXT"
    )
    private String description;


    // =====================================================
    // OLD VALUE
    // =====================================================

    /*
     * Stores the previous state when useful.
     *
     * Example:
     *
     * IN_PROGRESS
     */

    @Column(
            name = "old_value",
            columnDefinition = "TEXT"
    )
    private String oldValue;


    // =====================================================
    // NEW VALUE
    // =====================================================

    /*
     * Stores the new state when useful.
     *
     * Example:
     *
     * RESOLVED
     */

    @Column(
            name = "new_value",
            columnDefinition = "TEXT"
    )
    private String newValue;


    // =====================================================
    // IP ADDRESS
    // =====================================================

    /*
     * Optional for now.
     *
     * We will populate this later when the
     * audit service is integrated with the controller/security layer.
     */

    @Column(
            name = "ip_address",
            length = 45
    )
    private String ipAddress;


    // =====================================================
    // CREATED AT
    // =====================================================

    @Column(
            name = "created_at",
            nullable = false,
            updatable = false
    )
    private Instant createdAt;


    // =====================================================
    // PRE PERSIST
    // =====================================================

    @PrePersist
    protected void onCreate() {

        if (createdAt == null) {
            createdAt = Instant.now();
        }
    }
}