package com.smartcivic.backend.issue.service;

import com.smartcivic.backend.issue.enums.IssueCategory;
import com.smartcivic.backend.issue.enums.IssuePriority;

import java.time.LocalDateTime;

public interface SlaService {

    LocalDateTime calculateSlaDueAt(
            IssueCategory category,
            IssuePriority priority,
            LocalDateTime createdAt
    );
}