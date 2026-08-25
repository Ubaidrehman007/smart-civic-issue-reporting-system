package com.smartcivic.backend.issue.service;

import com.smartcivic.backend.issue.dto.AssignIssueRequest;
import com.smartcivic.backend.issue.dto.UpdateIssueRequest;
import com.smartcivic.backend.issue.dto.request.CreateIssueRequest;
import com.smartcivic.backend.issue.dto.response.*;
import com.smartcivic.backend.issue.entity.Issue;
import com.smartcivic.backend.issue.entity.IssueStatusHistory;
import com.smartcivic.backend.issue.enums.IssueCategory;
import com.smartcivic.backend.issue.enums.IssuePriority;
import com.smartcivic.backend.issue.enums.IssueStatus;
import com.smartcivic.backend.issue.enums.IssueStatusTransition;
import com.smartcivic.backend.issue.exception.InvalidIssueStatusTransitionException;
import com.smartcivic.backend.issue.exception.IssueAccessDeniedException;
import com.smartcivic.backend.issue.exception.IssueDeletionNotAllowedException;
import com.smartcivic.backend.issue.exception.IssueNotFoundException;
import com.smartcivic.backend.issue.repository.IssueRepository;
import com.smartcivic.backend.issue.repository.IssueStatusHistoryRepository;
import com.smartcivic.backend.storage.service.ImageStorageService;
import com.smartcivic.backend.user.entity.AccountStatus;
import com.smartcivic.backend.user.entity.Role;
import com.smartcivic.backend.user.entity.User;
import com.smartcivic.backend.user.exception.UserNotFoundException;
import com.smartcivic.backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.locationtech.jts.geom.Coordinate;
import org.locationtech.jts.geom.GeometryFactory;
import org.locationtech.jts.geom.Point;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class IssueServiceImpl implements IssueService {

    private final IssueRepository issueRepository;
    private final UserRepository userRepository;
    private final ImageStorageService imageStorageService;
    private final GeometryFactory geometryFactory;
    private final IssueStatusHistoryRepository issueStatusHistoryRepository;
    private final SlaService slaService;

    @Override
    public IssueResponse createIssue(CreateIssueRequest request, String userEmail) {

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() ->
                        new UsernameNotFoundException(
                                "User not found with email: " + userEmail
                        )
                );
        String imageFileName = null;

        if (request.getImage() != null && !request.getImage().isEmpty()) {
            imageFileName = imageStorageService.storeImage(request.getImage());
        }



        Point location = createLocation(
                request.getLatitude(),
                request.getLongitude()
        );

        IssuePriority priority = IssuePriority.MEDIUM;

        LocalDateTime slaDueAt = slaService.calculateSlaDueAt(
                request.getCategory(),
                priority,
                LocalDateTime.now()
        );

        Issue issue = Issue.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .category(request.getCategory())
                .imageUrl(imageFileName)
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .address(request.getAddress())
                .location(location)
                .priority(priority)
                .status(IssueStatus.REPORTED)
                .slaDueAt(slaDueAt)
                .reportedBy(user)
                .build();

        Issue savedIssue = issueRepository.save(issue);

        return mapToIssueResponse(savedIssue);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<IssueSummaryResponse> getAllIssues(Pageable pageable) {

        Page<Issue> issues = issueRepository.findAll(pageable);

        return issues.map(this::mapToIssueSummaryResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<IssueSummaryResponse> searchIssues(
            String keyword,
            Pageable pageable
    ) {

        return issueRepository
                .searchIssues(keyword.trim(), pageable)
                .map(this::mapToIssueSummaryResponse);
    }

    @Transactional(readOnly = true)
    @Override
    public IssueResponse getIssueById(
            UUID id,
            String userEmail
    ) {

        Issue issue = issueRepository.findById(id)
                .orElseThrow(() ->
                        new IssueNotFoundException("Issue not found")
                );

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() ->
                        new UserNotFoundException("User not found")
                );

        if (user.getRole() == Role.FIELD_WORKER) {

            if (issue.getAssignedTo() == null ||
                    !issue.getAssignedTo().getId().equals(user.getId())) {

                throw new IssueAccessDeniedException(
                        "You are not allowed to access this issue"
                );
            }
        }

        return mapToIssueResponse(issue);
    }


    @Transactional(readOnly = true)
    @Override
    public Page<IssueSummaryResponse> getMyIssues(
            String email,
            Pageable pageable
    ) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new UsernameNotFoundException(
                                "User not found with email: " + email
                        )
                );

        return issueRepository.findByReportedBy(user, pageable)
                .map(issue -> IssueSummaryResponse.builder()
                        .id(issue.getId())
                        .title(issue.getTitle())
                        .category(issue.getCategory())
                        .priority(issue.getPriority())
                        .status(issue.getStatus())
                        .address(issue.getAddress())
                        .createdAt(issue.getCreatedAt())
                        .build());
    }


    @Transactional(readOnly = true)
    @Override
    public Page<IssueSummaryResponse> getIssuesByStatus(
            IssueStatus status,
            Pageable pageable
    ) {

        return issueRepository.findByStatus(status, pageable)
                .map(issue -> IssueSummaryResponse.builder()
                        .id(issue.getId())
                        .title(issue.getTitle())
                        .category(issue.getCategory())
                        .priority(issue.getPriority())
                        .status(issue.getStatus())
                        .address(issue.getAddress())
                        .createdAt(issue.getCreatedAt())
                        .build());
    }



    @Transactional(readOnly = true)
    @Override
    public Page<IssueSummaryResponse> getIssuesByCategory(
            IssueCategory category,
            Pageable pageable
    ) {

        return issueRepository.findByCategory(category, pageable)
                .map(issue -> IssueSummaryResponse.builder()
                        .id(issue.getId())
                        .title(issue.getTitle())
                        .category(issue.getCategory())
                        .priority(issue.getPriority())
                        .status(issue.getStatus())
                        .address(issue.getAddress())
                        .createdAt(issue.getCreatedAt())
                        .build());
    }


    @Override
    @Transactional(readOnly = true)
    public Page<IssueSummaryResponse> getNearbyIssues(
            double latitude,
            double longitude,
            double radius,
            Pageable pageable
    ) {

        // API radius is in kilometers
        double radiusInMeters = radius * 1000;

        return issueRepository.findNearbyIssues(
                        latitude,
                        longitude,
                        radiusInMeters,
                        pageable
                )
                .map(issue -> IssueSummaryResponse.builder()
                        .id(issue.getId())
                        .title(issue.getTitle())
                        .category(issue.getCategory())
                        .priority(issue.getPriority())
                        .status(issue.getStatus())
                        .address(issue.getAddress())
                        .createdAt(issue.getCreatedAt())
                        .distance(issue.getDistance())
                        .build()
                );
    }


    @Override
    @Transactional(readOnly = true)
    public PossibleDuplicateResponse getPossibleDuplicates(
            double latitude,
            double longitude,
            IssueCategory category,
            double radius,
            Pageable pageable
    ) {

        // API radius is in kilometers
        double radiusInMeters = radius * 1000;

        Page<IssueSummaryResponse> duplicatePage =
                issueRepository.findNearbyIssuesByCategory(
                                latitude,
                                longitude,
                                radiusInMeters,
                                category.name(),
                                pageable
                        )
                        .map(issue -> IssueSummaryResponse.builder()
                                .id(issue.getId())
                                .title(issue.getTitle())
                                .category(issue.getCategory())
                                .priority(issue.getPriority())
                                .status(issue.getStatus())
                                .address(issue.getAddress())
                                .createdAt(issue.getCreatedAt())
                                .distance(issue.getDistance())
                                .build()
                        );

        return PossibleDuplicateResponse.builder()
                .possibleDuplicate(!duplicatePage.isEmpty())
                .duplicateCount(duplicatePage.getTotalElements())
                .duplicates(duplicatePage.getContent())
                .build();
    }

    @Override
    @Transactional
    public IssueResponse updateIssue(
            UUID issueId,
            UpdateIssueRequest request,
            String email) {

        // Find logged-in user
        User currentUser = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new UsernameNotFoundException(
                                "User not found with email: " + email
                        )
                );

        // Find issue
        Issue issue = issueRepository.findById(issueId)
                .orElseThrow(() ->
                        new IssueNotFoundException("Issue not found with ID: " + issueId));

        // Ownership check
        if (!issue.getReportedBy().getId().equals(currentUser.getId())) {
            throw new IssueAccessDeniedException(
                    "You are not authorized to update this issue."
            );
        }

        // Update editable fields
        issue.setTitle(request.getTitle());
        issue.setDescription(request.getDescription());
        issue.setCategory(request.getCategory());
        issue.setPriority(request.getPriority());
        issue.setImageUrl(request.getImageUrl());
        issue.setLatitude(request.getLatitude());
        issue.setLongitude(request.getLongitude());
        issue.setAddress(request.getAddress());




        issue.setLocation(
                createLocation(
                        request.getLatitude(),
                        request.getLongitude()
                )
        );


        // Save updated issue
        Issue updatedIssue = issueRepository.save(issue);

        return mapToIssueResponse(updatedIssue);
    }

    @Override
    @Transactional
    public IssueResponse updateIssueStatus(
            UUID issueId,
            IssueStatus newStatus,
            String email
    ) {

        // Find logged-in user
        User currentUser = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new UsernameNotFoundException(
                                "User not found with email: " + email
                        )
                );

        // Find issue
        Issue issue = issueRepository.findById(issueId)
                .orElseThrow(() ->
                        new IssueNotFoundException(
                                "Issue not found with ID: " + issueId
                        )
                );

        // Get current status
        IssueStatus currentStatus = issue.getStatus();

        // Validate status transition
        if (!IssueStatusTransition.isValidTransition(
                currentStatus,
                newStatus
        )) {
            throw new InvalidIssueStatusTransitionException(
                    "Invalid status transition from "
                            + currentStatus
                            + " to "
                            + newStatus
            );
        }

        // Update issue status
        issue.setStatus(newStatus);

        // Save updated issue
        Issue updatedIssue = issueRepository.save(issue);

        // Create status history
        IssueStatusHistory statusHistory =
                IssueStatusHistory.builder()
                        .issue(updatedIssue)
                        .fromStatus(currentStatus)
                        .toStatus(newStatus)
                        .changedBy(currentUser)
                        .changedAt(Instant.now())
                        .build();

        // Save status history
        issueStatusHistoryRepository.save(statusHistory);

        return mapToIssueResponse(updatedIssue);
    }


    /**
     * Convert Issue Entity to IssueResponse DTO
     */
    private IssueResponse mapToIssueResponse(Issue issue) {

        return IssueResponse.builder()
                .id(issue.getId())
                .title(issue.getTitle())
                .description(issue.getDescription())
                .category(issue.getCategory())
                .priority(issue.getPriority())
                .status(issue.getStatus())
                .imageUrl(issue.getImageUrl())
                .latitude(issue.getLatitude())
                .longitude(issue.getLongitude())
                .address(issue.getAddress())
                .reportedBy(issue.getReportedBy().getFullName())

                .assignedToId(
                        issue.getAssignedTo() != null
                                ? issue.getAssignedTo().getId()
                                : null
                )

                .assignedToName(
                        issue.getAssignedTo() != null
                                ? issue.getAssignedTo().getFullName()
                                : null
                )

                .assignedToEmail(
                        issue.getAssignedTo() != null
                                ? issue.getAssignedTo().getEmail()
                                : null
                )

                .createdAt(issue.getCreatedAt())
                .updatedAt(issue.getUpdatedAt())
                .build();
    }

    @Override
    @Transactional
    public void deleteIssue(
            UUID issueId,
            String email) {

        // Find logged-in user
        User currentUser = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new UsernameNotFoundException(
                                "User not found with email: " + email
                        )
                );

        // Find issue
        Issue issue = issueRepository.findById(issueId)
                .orElseThrow(() ->
                        new IssueNotFoundException(
                                "Issue not found with ID: " + issueId
                        )
                );

        // Ownership check
        if (!issue.getReportedBy().getId().equals(currentUser.getId())) {
            throw new IssueAccessDeniedException(
                    "You are not authorized to delete this issue."
            );
        }

        // Business Rule:
        // Only REPORTED issues can be deleted
        if (issue.getStatus() != IssueStatus.REPORTED) {
            throw new IssueDeletionNotAllowedException(
                    "Only issues with REPORTED status can be deleted."
            );
        }

        // Delete uploaded image if present
        if (issue.getImageUrl() != null && !issue.getImageUrl().isBlank()) {
            imageStorageService.deleteImage(issue.getImageUrl());
        }

// Delete issue
        issueRepository.delete(issue);
    }

    @Override
    public Page<IssueSummaryResponse> getIssuesByPriority(
            IssuePriority priority,
            Pageable pageable
    ) {

        return issueRepository
                .findByPriority(priority, pageable)
                .map(this::mapToIssueSummaryResponse);
    }
    private IssueSummaryResponse mapToIssueSummaryResponse(Issue issue) {

        return IssueSummaryResponse.builder()
                .id(issue.getId())
                .title(issue.getTitle())
                .category(issue.getCategory())
                .priority(issue.getPriority())
                .status(issue.getStatus())
                .address(issue.getAddress())
                .createdAt(issue.getCreatedAt())

        .assignedToId(
                issue.getAssignedTo() != null
                        ? issue.getAssignedTo().getId()
                        : null
        )

                .assignedToName(
                        issue.getAssignedTo() != null
                                ? issue.getAssignedTo().getFullName()
                                : null
                )

                .assignedToEmail(
                        issue.getAssignedTo() != null
                                ? issue.getAssignedTo().getEmail()
                                : null
                )
                .build();
    }


    private Point createLocation(
            double latitude,
            double longitude
    ) {
        return geometryFactory.createPoint(
                new Coordinate(longitude, latitude)
        );
    }


    @Override
    @Transactional(readOnly = true)
    public List<IssueStatusHistoryResponse> getIssueStatusHistory(UUID issueId) {

        // Check whether issue exists
        Issue issue = issueRepository.findById(issueId)
                .orElseThrow(() ->
                        new IssueNotFoundException(
                                "Issue not found with ID: " + issueId
                        )
                );

        // Get complete status history
        List<IssueStatusHistory> historyList =
                issueStatusHistoryRepository
                        .findByIssueIdOrderByChangedAtAsc(issue.getId());

        // Convert entities into response DTOs
        return historyList.stream()
                .map(history -> IssueStatusHistoryResponse.builder()
                        .id(history.getId())
                        .fromStatus(history.getFromStatus())
                        .toStatus(history.getToStatus())
                        .changedById(history.getChangedBy().getId())
                        .changedByEmail(history.getChangedBy().getEmail())
                        .remark(history.getRemark())
                        .changedAt(history.getChangedAt())
                        .build())
                .toList();
    }

    @Transactional
    @Override
    public void assignIssue(
            UUID issueId,
            AssignIssueRequest request
    ) {

        Issue issue = issueRepository.findById(issueId)
                .orElseThrow(() ->
                        new IssueNotFoundException("Issue not found")
                );

        User fieldWorker = userRepository
                .findById(request.fieldWorkerId())
                .orElseThrow(() ->
                        new UserNotFoundException("Field worker not found")
                );

        if (fieldWorker.getRole() != Role.FIELD_WORKER) {
            throw new IllegalArgumentException(
                    "Issue can only be assigned to a field worker"
            );
        }

        if (fieldWorker.getAccountStatus() != AccountStatus.ACTIVE) {
            throw new IllegalArgumentException(
                    "Issue can only be assigned to an active field worker"
            );
        }

        issue.setAssignedTo(fieldWorker);

        issueRepository.save(issue);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<IssueSummaryResponse> getAssignedIssues(
            String email,
            Pageable pageable
    ) {

        User fieldWorker = userRepository
                .findByEmail(email)
                .orElseThrow(() ->
                        new UserNotFoundException("User not found")
                );

        Page<Issue> issues = issueRepository.findByAssignedTo_Id(
                fieldWorker.getId(),
                pageable
        );

        return issues.map(this::mapToIssueSummaryResponse);
    }


    @Override
    @Transactional(readOnly = true)
    public Page<IssueSummaryResponse> getSlaBreachedIssues(
            Pageable pageable
    ) {
        return issueRepository
                .findBySlaBreachedTrue(pageable)
                .map(this::mapToIssueSummaryResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public SlaStatisticsResponse getSlaStatistics() {

        long totalIssues = issueRepository.count();

        long breachedIssues =
                issueRepository.countBySlaBreachedTrue();

        long withinSlaIssues =
                issueRepository.countBySlaBreachedFalse();

        long resolvedIssues =
                issueRepository.countByStatus(
                        IssueStatus.RESOLVED
                );

        return SlaStatisticsResponse.builder()
                .totalIssues(totalIssues)
                .breachedIssues(breachedIssues)
                .withinSlaIssues(withinSlaIssues)
                .resolvedIssues(resolvedIssues)
                .build();
    }


}