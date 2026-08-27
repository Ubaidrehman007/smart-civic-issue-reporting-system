package com.smartcivic.backend.notification.entity;

import com.smartcivic.backend.user.entity.User;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(
        name = "notifications",
        indexes = {
                @Index(
                        name = "idx_notifications_user_id",
                        columnList = "user_id"
                ),
                @Index(
                        name = "idx_notifications_user_read",
                        columnList = "user_id, is_read"
                ),
                @Index(
                        name = "idx_notifications_created_at",
                        columnList = "created_at"
                ),
                @Index(
                        name = "idx_notifications_reference_id",
                        columnList = "reference_id"
                )
        }
)
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Notification {

    @Id
    @GeneratedValue
    @Column(
            name = "id",
            nullable = false,
            updatable = false
    )
    private UUID id;


    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "user_id",
            nullable = false
    )
    private User user;


    @Enumerated(EnumType.STRING)
    @Column(
            name = "type",
            nullable = false,
            length = 50
    )
    private NotificationType type;


    @Column(
            name = "title",
            nullable = false,
            length = 255
    )
    private String title;


    @Column(
            name = "message",
            nullable = false,
            columnDefinition = "TEXT"
    )
    private String message;


    @Column(
            name = "reference_id"
    )
    private UUID referenceId;


    @Column(
            name = "is_read",
            nullable = false
    )
    private boolean read = false;


    @Column(
            name = "created_at",
            nullable = false,
            updatable = false
    )
    private Instant createdAt;


    @PrePersist
    protected void onCreate() {

        if (createdAt == null) {
            createdAt = Instant.now();
        }

    }
}