package com.smartcivic.backend.issue.service;

import com.smartcivic.backend.issue.dto.AssignIssueRequest;
import com.smartcivic.backend.issue.dto.UpdateIssueRequest;
import com.smartcivic.backend.issue.dto.request.CreateIssueRequest;
import com.smartcivic.backend.issue.dto.response.IssueResponse;
import com.smartcivic.backend.issue.dto.response.IssueStatusHistoryResponse;
import com.smartcivic.backend.issue.dto.response.IssueSummaryResponse;
import com.smartcivic.backend.issue.dto.response.SlaStatisticsResponse;
import com.smartcivic.backend.issue.enums.IssueCategory;
import com.smartcivic.backend.issue.enums.IssuePriority;
import com.smartcivic.backend.issue.enums.IssueStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.UUID;

public interface IssueService {

    IssueResponse createIssue(CreateIssueRequest request, String userEmail);

    Page<IssueSummaryResponse> getAllIssues(Pageable pageable);

    IssueResponse getIssueById(
            UUID id,
            String userEmail
    );


    Page<IssueSummaryResponse> getMyIssues(
            String email,
            Pageable pageable
    );


    Page<IssueSummaryResponse> getIssuesByStatus(
            IssueStatus status,
            Pageable pageable
    );


    Page<IssueSummaryResponse> getIssuesByCategory(
            IssueCategory category,
            Pageable pageable
    );

    IssueResponse updateIssue(
            UUID issueId,
            UpdateIssueRequest request,
            String email
    );

    IssueResponse updateIssueStatus(
            UUID issueId,
            IssueStatus newStatus,
            String email
    );

    void deleteIssue(UUID issueId, String name);


    Page<IssueSummaryResponse> getNearbyIssues(
            double latitude,
            double longitude,
            double radius,
            Pageable pageable
    );

    Page<IssueSummaryResponse> getIssuesByPriority(
            IssuePriority priority,
            Pageable pageable
    );

    List<IssueStatusHistoryResponse> getIssueStatusHistory(UUID issueId);

    void assignIssue(
            UUID issueId,
            AssignIssueRequest request
    );

    Page<IssueSummaryResponse> getAssignedIssues(
            String email,
            Pageable pageable
    );

    Page<IssueSummaryResponse> getSlaBreachedIssues(
            Pageable pageable
    );

    SlaStatisticsResponse getSlaStatistics();

}