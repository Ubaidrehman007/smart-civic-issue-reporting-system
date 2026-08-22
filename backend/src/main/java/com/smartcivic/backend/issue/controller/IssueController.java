package com.smartcivic.backend.issue.controller;

import com.smartcivic.backend.common.response.ApiResponse;
import com.smartcivic.backend.issue.dto.AssignIssueRequest;
import com.smartcivic.backend.issue.dto.UpdateIssueRequest;
import com.smartcivic.backend.issue.dto.request.CreateIssueRequest;
import com.smartcivic.backend.issue.dto.request.UpdateIssueStatusRequest;
import com.smartcivic.backend.issue.dto.response.IssueResponse;
import com.smartcivic.backend.issue.dto.response.IssueStatusHistoryResponse;
import com.smartcivic.backend.issue.dto.response.SlaStatisticsResponse;
import com.smartcivic.backend.issue.enums.IssueCategory;
import com.smartcivic.backend.issue.enums.IssuePriority;
import com.smartcivic.backend.issue.enums.IssueStatus;
import com.smartcivic.backend.issue.service.IssueService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Positive;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import com.smartcivic.backend.issue.dto.response.IssueSummaryResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.data.domain.Sort;


import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/issues")
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

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<IssueResponse> createIssue(
            @Valid @ModelAttribute CreateIssueRequest request,
            Authentication authentication
    ) {

        String userEmail = authentication.getName();

        IssueResponse response = issueService.createIssue(request, userEmail);

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/assigned")
    public ResponseEntity<Page<IssueSummaryResponse>> getAssignedIssues(
            Authentication authentication,

            @PageableDefault(
                    page = 0,
                    size = 10,
                    sort = "createdAt",
                    direction = Sort.Direction.DESC
            )
            Pageable pageable
    ) {

        return ResponseEntity.ok(
                issueService.getAssignedIssues(
                        authentication.getName(),
                        pageable
                )
        );
    }


    @GetMapping("/sla-breached")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Page<IssueSummaryResponse>> getSlaBreachedIssues(

            @PageableDefault(
                    page = 0,
                    size = 10,
                    sort = "createdAt",
                    direction = Sort.Direction.DESC
            )
            Pageable pageable
    ) {

        return ResponseEntity.ok(
                issueService.getSlaBreachedIssues(pageable)
        );
    }
    @GetMapping("/sla-statistics")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<SlaStatisticsResponse> getSlaStatistics() {

        return ResponseEntity.ok(
                issueService.getSlaStatistics()
        );
    }



    @GetMapping("/{id}")
    public ResponseEntity<IssueResponse> getIssueById(
            @PathVariable UUID id,
            Authentication authentication
    ) {

        IssueResponse response = issueService.getIssueById(
                id,
                authentication.getName()
        );

        return ResponseEntity.ok(response);
    }

    @GetMapping("/nearby")
    public ResponseEntity<Page<IssueSummaryResponse>> getNearbyIssues(

            @RequestParam
            @DecimalMin(
                    value = "-90.0",
                    message = "Latitude must be between -90 and 90"
            )
            @DecimalMax(
                    value = "90.0",
                    message = "Latitude must be between -90 and 90"
            )
            double latitude,

            @RequestParam
            @DecimalMin(
                    value = "-180.0",
                    message = "Longitude must be between -180 and 180"
            )
            @DecimalMax(
                    value = "180.0",
                    message = "Longitude must be between -180 and 180"
            )
            double longitude,

            @RequestParam(defaultValue = "5")
            @Positive(message = "Radius must be greater than 0")
            double radius,

            @PageableDefault(
                    page = 0,
                    size = 10,
                    sort = "created_at",
                    direction = Sort.Direction.DESC
            )
            Pageable pageable
    ) {

        return ResponseEntity.ok(
                issueService.getNearbyIssues(
                        latitude,
                        longitude,
                        radius,
                        pageable
                )
        );
    }

    @GetMapping("/possible-duplicates")
    public ResponseEntity<Page<IssueSummaryResponse>> getPossibleDuplicates(

            @RequestParam
            @DecimalMin(
                    value = "-90.0",
                    message = "Latitude must be between -90 and 90"
            )
            @DecimalMax(
                    value = "90.0",
                    message = "Latitude must be between -90 and 90"
            )
            double latitude,

            @RequestParam
            @DecimalMin(
                    value = "-180.0",
                    message = "Longitude must be between -180 and 180"
            )
            @DecimalMax(
                    value = "180.0",
                    message = "Longitude must be between -180 and 180"
            )
            double longitude,

            @RequestParam
            IssueCategory category,

            @RequestParam(defaultValue = "1")
            @Positive(message = "Radius must be greater than 0")
            double radius,

            @PageableDefault(
                    page = 0,
                    size = 10
            )
            Pageable pageable
    ) {

        return ResponseEntity.ok(
                issueService.getPossibleDuplicates(
                        latitude,
                        longitude,
                        category,
                        radius,
                        pageable
                )
        );
    }


    @GetMapping("/my")
    public ResponseEntity<Page<IssueSummaryResponse>> getMyIssues(

            Authentication authentication,

            @PageableDefault(
                    page = 0,
                    size = 10,
                    sort = "createdAt",
                    direction = Sort.Direction.DESC
            )
            Pageable pageable
    ) {

        return ResponseEntity.ok(
                issueService.getMyIssues(
                        authentication.getName(),
                        pageable
                )
        );
    }


    @GetMapping("/status/{status}")
    public ResponseEntity<Page<IssueSummaryResponse>> getIssuesByStatus(

            @PathVariable IssueStatus status,

            @PageableDefault(
                    page = 0,
                    size = 10,
                    sort = "createdAt",
                    direction = Sort.Direction.DESC
            )
            Pageable pageable
    ) {

        return ResponseEntity.ok(
                issueService.getIssuesByStatus(status, pageable)
        );
    }


    @GetMapping("/category/{category}")
    public ResponseEntity<Page<IssueSummaryResponse>> getIssuesByCategory(

            @PathVariable IssueCategory category,

            @PageableDefault(
                    page = 0,
                    size = 10,
                    sort = "createdAt",
                    direction = Sort.Direction.DESC
            )
            Pageable pageable
    ) {

        return ResponseEntity.ok(
                issueService.getIssuesByCategory(category, pageable)
        );
    }



    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<IssueResponse>> updateIssue(

            @PathVariable UUID id,

            @Valid
            @RequestBody UpdateIssueRequest request,

            Authentication authentication
    ) {

        IssueResponse response = issueService.updateIssue(
                id,
                request,
                authentication.getName()
        );

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Issue updated successfully.",
                        response
                )
        );
    }

    @PatchMapping("/{issueId}/status")
    public ResponseEntity<ApiResponse<IssueResponse>> updateIssueStatus(
            @PathVariable UUID issueId,
            @Valid @RequestBody UpdateIssueStatusRequest request,
            Authentication authentication
    ) {

        String email = authentication.getName();

        IssueResponse response = issueService.updateIssueStatus(
                issueId,
                request.getStatus(),
                email
        );

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Issue status updated successfully.",
                        response
                )
        );
    }

    @DeleteMapping("/{issueId}")
    public ResponseEntity<ApiResponse<Void>> deleteIssue(
            @PathVariable UUID issueId,
            Authentication authentication
    ) {

        issueService.deleteIssue(
                issueId,
                authentication.getName()
        );

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Issue deleted successfully.",
                        null
                )
        );
    }

    @GetMapping("/priority/{priority}")
    public ResponseEntity<Page<IssueSummaryResponse>> getIssuesByPriority(

            @PathVariable IssuePriority priority,

            @PageableDefault(
                    page = 0,
                    size = 10,
                    sort = "createdAt",
                    direction = Sort.Direction.DESC
            )
            Pageable pageable
    ) {

        return ResponseEntity.ok(
                issueService.getIssuesByPriority(
                        priority,
                        pageable
                )
        );
    }

    @PatchMapping("/{issueId}/assign")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> assignIssue(
            @PathVariable UUID issueId,
            @Valid @RequestBody AssignIssueRequest request
    ) {

        issueService.assignIssue(issueId, request);

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Issue assigned successfully",
                        null
                )
        );
    }


    @GetMapping("/{issueId}/status-history")
    public ResponseEntity<List<IssueStatusHistoryResponse>> getIssueStatusHistory(
            @PathVariable UUID issueId
    ) {
        return ResponseEntity.ok(
                issueService.getIssueStatusHistory(issueId)
        );
    }



}