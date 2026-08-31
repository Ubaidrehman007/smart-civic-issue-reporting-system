package com.smartcivic.backend.adminsettings.dto;

public record UpdateNotificationPreferencesRequest(

        boolean notifyNewIssues,

        boolean notifyIssueAssignments,

        boolean notifyStatusChanges,

        boolean notifyIssueResolved,

        boolean notifySlaWarnings,

        boolean notifySlaBreaches,

        boolean notifyNewCitizenRegistrations,

        boolean notifyAccountStatusChanges

) {
}