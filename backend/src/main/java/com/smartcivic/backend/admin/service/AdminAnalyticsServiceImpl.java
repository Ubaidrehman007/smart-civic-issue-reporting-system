package com.smartcivic.backend.admin.service;

import com.smartcivic.backend.admin.dto.AdminAnalyticsResponse;
import com.smartcivic.backend.issue.repository.IssueRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminAnalyticsServiceImpl
        implements AdminAnalyticsService {

    private final IssueRepository issueRepository;


    /* =========================
       GET ANALYTICS
    ========================= */

    @Override
    public AdminAnalyticsResponse getAnalytics() {

        List<AdminAnalyticsResponse.AnalyticsItem> issuesByStatus =
                mapAnalyticsData(
                        issueRepository.countIssuesByStatus()
                );


        List<AdminAnalyticsResponse.AnalyticsItem> issuesByCategory =
                mapAnalyticsData(
                        issueRepository.countIssuesByCategory()
                );


        List<AdminAnalyticsResponse.AnalyticsItem> issuesByPriority =
                mapAnalyticsData(
                        issueRepository.countIssuesByPriority()
                );


        return new AdminAnalyticsResponse(
                issuesByStatus,
                issuesByCategory,
                issuesByPriority
        );
    }


    /* =========================
       MAP QUERY RESULT
    ========================= */

    private List<AdminAnalyticsResponse.AnalyticsItem> mapAnalyticsData(
            List<Object[]> results
    ) {

        return results.stream()
                .map(row ->
                        new AdminAnalyticsResponse.AnalyticsItem(
                                row[0].toString(),
                                ((Number) row[1]).longValue()
                        )
                )
                .toList();
    }

}