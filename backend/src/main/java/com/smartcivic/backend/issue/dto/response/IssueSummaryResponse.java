package com.smartcivic.backend.issue.dto.response;

import com.smartcivic.backend.issue.enums.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class IssueSummaryResponse {

    private UUID id;

    private String title;

    private IssueCategory category;

    private IssuePriority priority;

    private IssueStatus status;

    private String address;

    private LocalDateTime createdAt;

    private Double distance;
}