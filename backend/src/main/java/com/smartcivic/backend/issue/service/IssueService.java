package com.smartcivic.backend.issue.service;

import com.smartcivic.backend.issue.dto.request.CreateIssueRequest;
import com.smartcivic.backend.issue.dto.response.IssueResponse;

public interface IssueService {

    IssueResponse createIssue(CreateIssueRequest request, String userEmail);

}