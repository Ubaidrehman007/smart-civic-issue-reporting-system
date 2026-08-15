package com.smartcivic.backend.user.dto;

public record DashboardStatsResponse(

        long totalUsers,

        long totalCitizens,

        long totalFieldWorkers,

        long activeUsers,

        long suspendedUsers

) {
}