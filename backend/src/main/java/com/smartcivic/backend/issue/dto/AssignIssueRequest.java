package com.smartcivic.backend.issue.dto;

import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record AssignIssueRequest(

        @NotNull(message = "Field worker ID is required")
        UUID fieldWorkerId

) {
}