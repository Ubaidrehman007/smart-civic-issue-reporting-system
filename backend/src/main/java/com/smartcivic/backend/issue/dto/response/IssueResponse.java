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
public class IssueResponse {

    private UUID id;

    private String title;

    private String description;

    private IssueCategory category;

    private IssuePriority priority;

    private IssueStatus status;

    private String imageUrl;

    private Double latitude;

    private Double longitude;

    private String address;

    private String reportedBy;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}