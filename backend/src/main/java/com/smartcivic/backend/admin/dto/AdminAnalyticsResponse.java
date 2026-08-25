package com.smartcivic.backend.admin.dto;

import java.util.List;

public record AdminAnalyticsResponse(

        List<AnalyticsItem> issuesByStatus,

        List<AnalyticsItem> issuesByCategory,

        List<AnalyticsItem> issuesByPriority

) {

    public record AnalyticsItem(

            String label,

            long count

    ) {
    }
}