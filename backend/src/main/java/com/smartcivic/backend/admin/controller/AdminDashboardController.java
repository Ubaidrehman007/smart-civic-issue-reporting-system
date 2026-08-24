package com.smartcivic.backend.admin.controller;

import com.smartcivic.backend.admin.dto.AdminDashboardStatsResponse;
import com.smartcivic.backend.admin.service.AdminDashboardService;
import com.smartcivic.backend.common.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RequiredArgsConstructor
@RestController
@RequestMapping("/api/v1/admin/dashboard")
public class AdminDashboardController {

    private final AdminDashboardService adminDashboardService;

    @GetMapping("/statistics")
    public ResponseEntity<ApiResponse<AdminDashboardStatsResponse>> getDashboardStatistics() {

        AdminDashboardStatsResponse stats =
                adminDashboardService.getDashboardStatistics();

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Admin dashboard statistics fetched successfully",
                        stats
                )
        );
    }
}