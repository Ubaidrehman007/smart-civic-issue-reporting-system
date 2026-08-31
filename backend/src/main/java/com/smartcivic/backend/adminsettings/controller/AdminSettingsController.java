package com.smartcivic.backend.adminsettings.controller;

import com.smartcivic.backend.adminsettings.dto.AdminSettingsResponse;
import com.smartcivic.backend.adminsettings.dto.UpdateIssueConfigurationRequest;
import com.smartcivic.backend.adminsettings.dto.UpdateNotificationPreferencesRequest;
import com.smartcivic.backend.adminsettings.dto.UpdateSystemConfigurationRequest;
import com.smartcivic.backend.adminsettings.service.AdminSettingsService;
import com.smartcivic.backend.common.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin/settings")
@RequiredArgsConstructor
@PreAuthorize("hasAuthority('ADMIN')")
public class AdminSettingsController {

    private final AdminSettingsService adminSettingsService;


    @GetMapping
    public ResponseEntity<ApiResponse<AdminSettingsResponse>>
    getSettings(Authentication authentication) {

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Admin settings fetched successfully",
                        adminSettingsService.getSettings(
                                authentication.getName()
                        )
                )
        );
    }


    @PutMapping("/notifications")
    public ResponseEntity<ApiResponse<AdminSettingsResponse>>
    updateNotificationPreferences(

            Authentication authentication,

            @Valid
            @RequestBody
            UpdateNotificationPreferencesRequest request
    ) {

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Notification preferences updated successfully",
                        adminSettingsService
                                .updateNotificationPreferences(
                                        authentication.getName(),
                                        request
                                )
                )
        );
    }


    @PutMapping("/issues")
    public ResponseEntity<ApiResponse<AdminSettingsResponse>>
    updateIssueConfiguration(

            Authentication authentication,

            @Valid
            @RequestBody
            UpdateIssueConfigurationRequest request
    ) {

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Issue configuration updated successfully",
                        adminSettingsService
                                .updateIssueConfiguration(
                                        authentication.getName(),
                                        request
                                )
                )
        );
    }


    @PutMapping("/system")
    public ResponseEntity<ApiResponse<AdminSettingsResponse>>
    updateSystemConfiguration(

            Authentication authentication,

            @Valid
            @RequestBody
            UpdateSystemConfigurationRequest request
    ) {

        return ResponseEntity.ok(
                ApiResponse.success(
                        "System configuration updated successfully",
                        adminSettingsService
                                .updateSystemConfiguration(
                                        authentication.getName(),
                                        request
                                )
                )
        );
    }


    @PostMapping("/reset")
    public ResponseEntity<ApiResponse<AdminSettingsResponse>>
    resetSettings(Authentication authentication) {

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Admin settings reset to defaults",
                        adminSettingsService.resetSettings(
                                authentication.getName()
                        )
                )
        );
    }


    @PostMapping("/logout-all")
    public ResponseEntity<ApiResponse<Void>>
    logoutAllSessions(Authentication authentication) {

        adminSettingsService.logoutAllSessions(
                authentication.getName()
        );

        return ResponseEntity.ok(
                ApiResponse.success(
                        "All administrator sessions have been invalidated",
                        null
                )
        );
    }
}