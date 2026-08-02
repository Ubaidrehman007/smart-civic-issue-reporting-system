package com.smartcivic.backend.issue.controller;

import com.smartcivic.backend.issue.dto.request.CreateIssueRequest;
import com.smartcivic.backend.issue.dto.response.IssueResponse;
import com.smartcivic.backend.issue.service.IssueService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import com.smartcivic.backend.issue.dto.response.IssueSummaryResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.data.domain.Sort;

@RestController
@RequestMapping("/api/issues")
@RequiredArgsConstructor
public class IssueController {

    private final IssueService issueService;


    @GetMapping
    public ResponseEntity<Page<IssueSummaryResponse>> getAllIssues(

            @PageableDefault(
                    page = 0,
                    size = 10,
                    sort = "createdAt",
                    direction = Sort.Direction.DESC
            )
            Pageable pageable
    ) {

        Page<IssueSummaryResponse> response =
                issueService.getAllIssues(pageable);

        return ResponseEntity.ok(response);
    }

    @PostMapping
    public ResponseEntity<IssueResponse> createIssue(
            @Valid @RequestBody CreateIssueRequest request,
            Authentication authentication
    ) {

        String userEmail = authentication.getName();

        IssueResponse response = issueService.createIssue(request, userEmail);

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}