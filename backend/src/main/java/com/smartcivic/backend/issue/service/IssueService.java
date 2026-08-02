package com.smartcivic.backend.issue.service;

import com.smartcivic.backend.issue.dto.request.CreateIssueRequest;
import com.smartcivic.backend.issue.dto.response.IssueResponse;
import com.smartcivic.backend.issue.dto.response.IssueSummaryResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface IssueService {

    IssueResponse createIssue(CreateIssueRequest request, String userEmail);

    Page<IssueSummaryResponse> getAllIssues(Pageable pageable);

}