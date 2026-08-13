package com.smartcivic.backend.issue.dto.request;

import com.smartcivic.backend.issue.enums.IssueStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateIssueStatusRequest {

    @NotNull(message = "Status is required")
    private IssueStatus status;
}