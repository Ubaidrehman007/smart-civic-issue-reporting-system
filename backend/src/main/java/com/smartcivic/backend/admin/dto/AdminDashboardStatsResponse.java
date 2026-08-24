package com.smartcivic.backend.admin.dto;

public record AdminDashboardStatsResponse(

        long totalIssues,

        long reportedIssues,

        long underReviewIssues,

        long inProgressIssues,

        long resolvedIssues,

        long totalUsers,

        long totalCitizens,

        long totalFieldWorkers,

        long activeUsers,

        long suspendedUsers

) {
}