package com.smartcivic.backend.admin.controller;

import com.smartcivic.backend.admin.dto.AdminAnalyticsResponse;
import com.smartcivic.backend.admin.service.AdminAnalyticsService;
import com.smartcivic.backend.common.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RequiredArgsConstructor
@RestController
@RequestMapping("/api/v1/admin/analytics")
public class AdminAnalyticsController {

    private final AdminAnalyticsService adminAnalyticsService;

    @GetMapping
    public ResponseEntity<ApiResponse<AdminAnalyticsResponse>> getAnalytics() {

        AdminAnalyticsResponse analytics =
                adminAnalyticsService.getAnalytics();

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Admin analytics fetched successfully",
                        analytics
                )
        );
    }
}