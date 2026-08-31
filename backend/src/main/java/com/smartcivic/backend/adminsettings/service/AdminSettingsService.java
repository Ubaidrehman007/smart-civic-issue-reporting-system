package com.smartcivic.backend.adminsettings.service;

import com.smartcivic.backend.adminsettings.dto.AdminSettingsResponse;
import com.smartcivic.backend.adminsettings.dto.UpdateIssueConfigurationRequest;
import com.smartcivic.backend.adminsettings.dto.UpdateNotificationPreferencesRequest;
import com.smartcivic.backend.adminsettings.dto.UpdateSystemConfigurationRequest;

public interface AdminSettingsService {

    AdminSettingsResponse getSettings(
            String adminEmail
    );

    AdminSettingsResponse updateNotificationPreferences(
            String adminEmail,
            UpdateNotificationPreferencesRequest request
    );

    AdminSettingsResponse updateIssueConfiguration(
            String adminEmail,
            UpdateIssueConfigurationRequest request
    );

    AdminSettingsResponse updateSystemConfiguration(
            String adminEmail,
            UpdateSystemConfigurationRequest request
    );

    AdminSettingsResponse resetSettings(
            String adminEmail
    );

    void logoutAllSessions(
            String adminEmail
    );
}