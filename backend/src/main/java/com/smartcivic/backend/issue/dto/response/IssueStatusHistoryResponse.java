package com.smartcivic.backend.issue.dto.response;

import com.smartcivic.backend.issue.enums.IssueStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class IssueStatusHistoryResponse {

    private UUID id;

    private IssueStatus fromStatus;

    private IssueStatus toStatus;

    private UUID changedById;

    private String changedByName;

    private String changedByEmail;

    private String remark;

    private String evidencePhotoUrl;

    private Instant changedAt;
}