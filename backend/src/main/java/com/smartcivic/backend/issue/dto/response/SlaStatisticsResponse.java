package com.smartcivic.backend.issue.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class SlaStatisticsResponse {

    private final long totalIssues;

    private final long breachedIssues;

    private final long withinSlaIssues;

    private final long resolvedIssues;
}