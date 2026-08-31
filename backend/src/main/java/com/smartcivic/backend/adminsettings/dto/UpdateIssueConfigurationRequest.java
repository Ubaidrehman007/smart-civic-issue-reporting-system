package com.smartcivic.backend.adminsettings.dto;

import jakarta.validation.constraints.NotBlank;

public record UpdateIssueConfigurationRequest(

        @NotBlank
        String defaultIssuePriority,

        @NotBlank
        String defaultIssueStatus,

        @NotBlank
        String assignmentStrategy

) {
}