package com.smartcivic.backend.issue.dto.projection;

import com.smartcivic.backend.issue.enums.IssueCategory;
import com.smartcivic.backend.issue.enums.IssuePriority;
import com.smartcivic.backend.issue.enums.IssueStatus;

import java.time.LocalDateTime;
import java.util.UUID;

public interface NearbyIssueProjection {

    UUID getId();

    String getTitle();

    IssueCategory getCategory();

    IssuePriority getPriority();

    IssueStatus getStatus();

    String getAddress();

    LocalDateTime getCreatedAt();

    Double getDistance();
}