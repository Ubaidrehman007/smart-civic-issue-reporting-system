package com.smartcivic.backend.adminsettings.dto;

public record UpdateSystemConfigurationRequest(

        boolean maintenanceMode,

        boolean allowNewRegistrations,

        boolean allowIssueReporting,

        boolean emailNotifications

) {
}