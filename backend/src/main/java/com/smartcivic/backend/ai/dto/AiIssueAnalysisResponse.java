package com.smartcivic.backend.ai.dto;

import com.smartcivic.backend.issue.enums.IssueCategory;

public record AiIssueAnalysisResponse(

        IssueCategory category,

        Double confidence,

        String severity,

        String reason

) {
}