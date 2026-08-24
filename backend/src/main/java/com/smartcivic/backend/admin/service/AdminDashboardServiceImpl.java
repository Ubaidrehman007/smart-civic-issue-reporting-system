package com.smartcivic.backend.admin.service;

import com.smartcivic.backend.admin.dto.AdminDashboardStatsResponse;
import com.smartcivic.backend.issue.enums.IssueStatus;
import com.smartcivic.backend.issue.repository.IssueRepository;
import com.smartcivic.backend.user.dto.DashboardStatsResponse;
import com.smartcivic.backend.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AdminDashboardServiceImpl implements AdminDashboardService {

    private final UserService userService;
    private final IssueRepository issueRepository;

    @Override
    public AdminDashboardStatsResponse getDashboardStatistics() {

        DashboardStatsResponse userStats =
                userService.getDashboardStats();

        long totalIssues =
                issueRepository.count();

        long reportedIssues =
                issueRepository.countByStatus(
                        IssueStatus.REPORTED
                );

        long underReviewIssues =
                issueRepository.countByStatus(
                        IssueStatus.UNDER_REVIEW
                );

        long inProgressIssues =
                issueRepository.countByStatus(
                        IssueStatus.IN_PROGRESS
                );

        long resolvedIssues =
                issueRepository.countByStatus(
                        IssueStatus.RESOLVED
                );

        return new AdminDashboardStatsResponse(
                totalIssues,
                reportedIssues,
                underReviewIssues,
                inProgressIssues,
                resolvedIssues,
                userStats.totalUsers(),
                userStats.totalCitizens(),
                userStats.totalFieldWorkers(),
                userStats.activeUsers(),
                userStats.suspendedUsers()
        );
    }
}