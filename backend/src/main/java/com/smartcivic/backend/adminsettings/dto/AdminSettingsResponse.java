package com.smartcivic.backend.adminsettings.dto;

import com.smartcivic.backend.user.dto.UserResponse;

import java.time.Instant;

public record AdminSettingsResponse(

        UserResponse profile,

        boolean notifyNewIssues,

        boolean notifyIssueAssignments,

        boolean notifyStatusChanges,

        boolean notifyIssueResolved,

        boolean notifySlaWarnings,

        boolean notifySlaBreaches,

        boolean notifyNewCitizenRegistrations,

        boolean notifyAccountStatusChanges,

        String defaultIssuePriority,

        String defaultIssueStatus,

        String assignmentStrategy,

        boolean maintenanceMode,

        boolean allowNewRegistrations,

        boolean allowIssueReporting,

        boolean emailNotifications,

        Instant updatedAt

) {
}