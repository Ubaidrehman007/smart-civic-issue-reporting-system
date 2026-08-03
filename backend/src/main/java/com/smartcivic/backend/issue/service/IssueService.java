package com.smartcivic.backend.issue.service;

import com.smartcivic.backend.issue.dto.UpdateIssueRequest;
import com.smartcivic.backend.issue.dto.request.CreateIssueRequest;
import com.smartcivic.backend.issue.dto.response.IssueResponse;
import com.smartcivic.backend.issue.dto.response.IssueSummaryResponse;
import com.smartcivic.backend.issue.enums.IssueCategory;
import com.smartcivic.backend.issue.enums.IssueStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface IssueService {

    IssueResponse createIssue(CreateIssueRequest request, String userEmail);

    Page<IssueSummaryResponse> getAllIssues(Pageable pageable);

    IssueResponse getIssueById(UUID id);


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

}