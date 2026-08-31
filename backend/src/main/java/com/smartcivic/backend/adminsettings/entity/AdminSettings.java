package com.smartcivic.backend.adminsettings.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "admin_settings")
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class AdminSettings {

    @Id
    @GeneratedValue
    @Column(
            name = "id",
            nullable = false,
            updatable = false
    )
    private UUID id;


    // =====================================================
    // NOTIFICATION PREFERENCES
    // =====================================================

    @Column(name = "notify_new_issues", nullable = false)
    private boolean notifyNewIssues = true;

    @Column(name = "notify_issue_assignments", nullable = false)
    private boolean notifyIssueAssignments = true;

    @Column(name = "notify_status_changes", nullable = false)
    private boolean notifyStatusChanges = true;

    @Column(name = "notify_issue_resolved", nullable = false)
    private boolean notifyIssueResolved = true;

    @Column(name = "notify_sla_warnings", nullable = false)
    private boolean notifySlaWarnings = true;

    @Column(name = "notify_sla_breaches", nullable = false)
    private boolean notifySlaBreaches = true;

    @Column(name = "notify_new_citizen_registrations", nullable = false)
    private boolean notifyNewCitizenRegistrations = true;

    @Column(name = "notify_account_status_changes", nullable = false)
    private boolean notifyAccountStatusChanges = true;


    // =====================================================
    // ISSUE CONFIGURATION
    // =====================================================

    @Column(
            name = "default_issue_priority",
            nullable = false,
            length = 30
    )
    private String defaultIssuePriority = "MEDIUM";

    @Column(
            name = "default_issue_status",
            nullable = false,
            length = 30
    )
    private String defaultIssueStatus = "REPORTED";

    @Column(
            name = "assignment_strategy",
            nullable = false,
            length = 50
    )
    private String assignmentStrategy = "MANUAL";


    // =====================================================
    // SYSTEM CONFIGURATION
    // =====================================================

    @Column(name = "maintenance_mode", nullable = false)
    private boolean maintenanceMode = false;

    @Column(name = "allow_new_registrations", nullable = false)
    private boolean allowNewRegistrations = true;

    @Column(name = "allow_issue_reporting", nullable = false)
    private boolean allowIssueReporting = true;

    @Column(name = "email_notifications", nullable = false)
    private boolean emailNotifications = true;


    // =====================================================
    // SESSION SECURITY
    // =====================================================

    @Column(name = "sessions_invalidated_at")
    private Instant sessionsInvalidatedAt;


    // =====================================================
    // AUDIT
    // =====================================================

    @Column(
            name = "created_at",
            nullable = false,
            updatable = false
    )
    private Instant createdAt;

    @Column(
            name = "updated_at",
            nullable = false
    )
    private Instant updatedAt;


    // =====================================================
    // ENTITY CALLBACKS
    // =====================================================

    @PrePersist
    protected void onCreate() {

        Instant now = Instant.now();

        if (createdAt == null) {
            createdAt = now;
        }

        updatedAt = now;
    }


    @PreUpdate
    protected void onUpdate() {

        updatedAt = Instant.now();
    }


    // =====================================================
    // DEFAULT SETTINGS
    // =====================================================

    public static AdminSettings createDefault() {

        AdminSettings settings = new AdminSettings();

        settings.notifyNewIssues = true;
        settings.notifyIssueAssignments = true;
        settings.notifyStatusChanges = true;
        settings.notifyIssueResolved = true;
        settings.notifySlaWarnings = true;
        settings.notifySlaBreaches = true;
        settings.notifyNewCitizenRegistrations = true;
        settings.notifyAccountStatusChanges = true;

        settings.defaultIssuePriority = "MEDIUM";
        settings.defaultIssueStatus = "REPORTED";
        settings.assignmentStrategy = "MANUAL";

        settings.maintenanceMode = false;
        settings.allowNewRegistrations = true;
        settings.allowIssueReporting = true;
        settings.emailNotifications = true;

        settings.sessionsInvalidatedAt = null;

        return settings;
    }
}