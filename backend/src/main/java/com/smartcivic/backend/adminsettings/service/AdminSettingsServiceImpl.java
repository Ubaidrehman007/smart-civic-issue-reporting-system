package com.smartcivic.backend.adminsettings.service;

import com.smartcivic.backend.adminsettings.dto.AdminSettingsResponse;
import com.smartcivic.backend.adminsettings.dto.UpdateIssueConfigurationRequest;
import com.smartcivic.backend.adminsettings.dto.UpdateNotificationPreferencesRequest;
import com.smartcivic.backend.adminsettings.dto.UpdateSystemConfigurationRequest;
import com.smartcivic.backend.adminsettings.entity.AdminSettings;
import com.smartcivic.backend.adminsettings.repository.AdminSettingsRepository;
import com.smartcivic.backend.user.dto.UserResponse;
import com.smartcivic.backend.user.entity.User;
import com.smartcivic.backend.user.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AdminSettingsServiceImpl
        implements AdminSettingsService {

    private final AdminSettingsRepository adminSettingsRepository;
    private final UserRepository userRepository;


    // =====================================================
    // GET SETTINGS
    // =====================================================

    @Override
    @Transactional
    public AdminSettingsResponse getSettings(String adminEmail) {

        User admin = getAdmin(adminEmail);

        AdminSettings settings =
                getOrCreateSettings();

        return mapToResponse(admin, settings);
    }


    // =====================================================
    // UPDATE NOTIFICATIONS
    // =====================================================

    @Override
    @Transactional
    public AdminSettingsResponse updateNotificationPreferences(
            String adminEmail,
            UpdateNotificationPreferencesRequest request
    ) {

        User admin = getAdmin(adminEmail);

        AdminSettings settings =
                getOrCreateSettings();

        settings.setNotifyNewIssues(
                request.notifyNewIssues()
        );

        settings.setNotifyIssueAssignments(
                request.notifyIssueAssignments()
        );

        settings.setNotifyStatusChanges(
                request.notifyStatusChanges()
        );

        settings.setNotifyIssueResolved(
                request.notifyIssueResolved()
        );

        settings.setNotifySlaWarnings(
                request.notifySlaWarnings()
        );

        settings.setNotifySlaBreaches(
                request.notifySlaBreaches()
        );

        settings.setNotifyNewCitizenRegistrations(
                request.notifyNewCitizenRegistrations()
        );

        settings.setNotifyAccountStatusChanges(
                request.notifyAccountStatusChanges()
        );

        adminSettingsRepository.save(settings);

        return mapToResponse(admin, settings);
    }


    // =====================================================
    // UPDATE ISSUE CONFIGURATION
    // =====================================================

    @Override
    @Transactional
    public AdminSettingsResponse updateIssueConfiguration(
            String adminEmail,
            UpdateIssueConfigurationRequest request
    ) {

        User admin = getAdmin(adminEmail);

        AdminSettings settings =
                getOrCreateSettings();

        String priority =
                request.defaultIssuePriority()
                        .trim()
                        .toUpperCase();

        String status =
                request.defaultIssueStatus()
                        .trim()
                        .toUpperCase();

        String assignmentStrategy =
                request.assignmentStrategy()
                        .trim()
                        .toUpperCase();

        validatePriority(priority);
        validateStatus(status);
        validateAssignmentStrategy(
                assignmentStrategy
        );

        settings.setDefaultIssuePriority(priority);
        settings.setDefaultIssueStatus(status);
        settings.setAssignmentStrategy(
                assignmentStrategy
        );

        adminSettingsRepository.save(settings);

        return mapToResponse(admin, settings);
    }


    // =====================================================
    // UPDATE SYSTEM CONFIGURATION
    // =====================================================

    @Override
    @Transactional
    public AdminSettingsResponse updateSystemConfiguration(
            String adminEmail,
            UpdateSystemConfigurationRequest request
    ) {

        User admin = getAdmin(adminEmail);

        AdminSettings settings =
                getOrCreateSettings();

        settings.setMaintenanceMode(
                request.maintenanceMode()
        );

        settings.setAllowNewRegistrations(
                request.allowNewRegistrations()
        );

        settings.setAllowIssueReporting(
                request.allowIssueReporting()
        );

        settings.setEmailNotifications(
                request.emailNotifications()
        );

        adminSettingsRepository.save(settings);

        return mapToResponse(admin, settings);
    }


    // =====================================================
    // RESET
    // =====================================================

    @Override
    @Transactional
    public AdminSettingsResponse resetSettings(
            String adminEmail
    ) {

        User admin = getAdmin(adminEmail);

        AdminSettings settings =
                getOrCreateSettings();

        AdminSettings defaults =
                AdminSettings.createDefault();

        settings.setNotifyNewIssues(
                defaults.isNotifyNewIssues()
        );

        settings.setNotifyIssueAssignments(
                defaults.isNotifyIssueAssignments()
        );

        settings.setNotifyStatusChanges(
                defaults.isNotifyStatusChanges()
        );

        settings.setNotifyIssueResolved(
                defaults.isNotifyIssueResolved()
        );

        settings.setNotifySlaWarnings(
                defaults.isNotifySlaWarnings()
        );

        settings.setNotifySlaBreaches(
                defaults.isNotifySlaBreaches()
        );

        settings.setNotifyNewCitizenRegistrations(
                defaults.isNotifyNewCitizenRegistrations()
        );

        settings.setNotifyAccountStatusChanges(
                defaults.isNotifyAccountStatusChanges()
        );

        settings.setDefaultIssuePriority(
                defaults.getDefaultIssuePriority()
        );

        settings.setDefaultIssueStatus(
                defaults.getDefaultIssueStatus()
        );

        settings.setAssignmentStrategy(
                defaults.getAssignmentStrategy()
        );

        settings.setMaintenanceMode(
                defaults.isMaintenanceMode()
        );

        settings.setAllowNewRegistrations(
                defaults.isAllowNewRegistrations()
        );

        settings.setAllowIssueReporting(
                defaults.isAllowIssueReporting()
        );

        settings.setEmailNotifications(
                defaults.isEmailNotifications()
        );

        adminSettingsRepository.save(settings);

        return mapToResponse(admin, settings);
    }


    // =====================================================
    // LOGOUT ALL ADMIN SESSIONS
    // =====================================================

    @Override
    @Transactional
    public void logoutAllSessions(String adminEmail) {

        getAdmin(adminEmail);

        AdminSettings settings =
                getOrCreateSettings();

        settings.setSessionsInvalidatedAt(
                java.time.Instant.now()
        );

        adminSettingsRepository.save(settings);
    }


    // =====================================================
    // ADMIN VALIDATION
    // =====================================================

    private User getAdmin(String email) {

        User user =
                userRepository.findByEmail(
                                email.trim().toLowerCase()
                        )
                        .orElseThrow(() ->
                                new EntityNotFoundException(
                                        "Admin user not found"
                                )
                        );

        if (user.getRole() == null ||
                !user.getRole().name().equals("ADMIN")) {

            throw new AccessDeniedException(
                    "Only administrators can access admin settings"
            );
        }

        return user;
    }


    // =====================================================
    // GET / CREATE SETTINGS
    // =====================================================

    private AdminSettings getOrCreateSettings() {

        return adminSettingsRepository
                .findTopByOrderByCreatedAtAsc()
                .orElseGet(() ->
                        adminSettingsRepository.save(
                                AdminSettings.createDefault()
                        )
                );
    }


    // =====================================================
    // VALIDATION
    // =====================================================

    private void validatePriority(String priority) {

        if (!priority.equals("LOW") &&
                !priority.equals("MEDIUM") &&
                !priority.equals("HIGH") &&
                !priority.equals("CRITICAL")) {

            throw new IllegalArgumentException(
                    "Invalid issue priority"
            );
        }
    }


    private void validateStatus(String status) {

        if (!status.equals("REPORTED") &&
                !status.equals("UNDER_REVIEW") &&
                !status.equals("IN_PROGRESS") &&
                !status.equals("RESOLVED") &&
                !status.equals("REJECTED")) {

            throw new IllegalArgumentException(
                    "Invalid issue status"
            );
        }
    }


    private void validateAssignmentStrategy(
            String strategy
    ) {

        if (!strategy.equals("MANUAL") &&
                !strategy.equals("AUTOMATIC")) {

            throw new IllegalArgumentException(
                    "Invalid assignment strategy"
            );
        }
    }


    // =====================================================
    // MAPPER
    // =====================================================

    private AdminSettingsResponse mapToResponse(
            User admin,
            AdminSettings settings
    ) {

        UserResponse profile =
                new UserResponse(
                        admin.getId(),
                        admin.getFullName(),
                        admin.getEmail(),
                        admin.getPhoneNumber(),
                        admin.getRole(),
                        admin.getAccountStatus(),
                        admin.getCreatedAt()
                );

        return new AdminSettingsResponse(

                profile,

                settings.isNotifyNewIssues(),

                settings.isNotifyIssueAssignments(),

                settings.isNotifyStatusChanges(),

                settings.isNotifyIssueResolved(),

                settings.isNotifySlaWarnings(),

                settings.isNotifySlaBreaches(),

                settings.isNotifyNewCitizenRegistrations(),

                settings.isNotifyAccountStatusChanges(),

                settings.getDefaultIssuePriority(),

                settings.getDefaultIssueStatus(),

                settings.getAssignmentStrategy(),

                settings.isMaintenanceMode(),

                settings.isAllowNewRegistrations(),

                settings.isAllowIssueReporting(),

                settings.isEmailNotifications(),

                settings.getUpdatedAt()
        );
    }
}