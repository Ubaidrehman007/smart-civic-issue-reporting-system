package com.smartcivic.backend.issue.service;

import com.smartcivic.backend.adminsettings.entity.AdminSettings;
import com.smartcivic.backend.adminsettings.repository.AdminSettingsRepository;
import com.smartcivic.backend.audit.entity.AuditEntityType;
import com.smartcivic.backend.audit.service.AuditLogService;
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
import com.smartcivic.backend.notification.entity.NotificationType;
import com.smartcivic.backend.notification.service.NotificationService;
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
import com.smartcivic.backend.audit.entity.AuditAction;
import org.springframework.web.multipart.MultipartFile;

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
    private final PriorityEvaluationService priorityEvaluationService;
    private final NotificationService notificationService;
    private final AuditLogService auditLogService;
    private final AdminSettingsRepository adminSettingsRepository;

    @Override
    @Transactional
    public IssueResponse createIssue(
            CreateIssueRequest request,
            String userEmail
    ) {

        // =====================================================
        // FIND AUTHENTICATED USER
        // =====================================================

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() ->
                        new UsernameNotFoundException(
                                "User not found with email: " + userEmail
                        )
                );


        // =====================================================
        // LOAD ADMIN SETTINGS
        // =====================================================

        AdminSettings settings =
                adminSettingsRepository
                        .findTopByOrderByCreatedAtAsc()
                        .orElseGet(() ->
                                adminSettingsRepository.save(
                                        AdminSettings.createDefault()
                                )
                        );


        // =====================================================
        // ADMIN SYSTEM CONTROLS
        // =====================================================

        // Maintenance Mode
        if (settings.isMaintenanceMode()) {

            throw new IllegalStateException(
                    "System is currently under maintenance. Please try again later."
            );
        }


        // Issue Reporting
        if (!settings.isAllowIssueReporting()) {

            throw new IllegalStateException(
                    "Issue reporting is currently disabled. Please try again later."
            );
        }


        // =====================================================
        // STORE IMAGE
        // =====================================================

        String imageFileName = null;

        if (request.getImage() != null
                && !request.getImage().isEmpty()) {

            imageFileName =
                    imageStorageService.storeImage(
                            request.getImage()
                    );
        }


        // =====================================================
        // CREATE SPATIAL LOCATION
        // =====================================================

        Point location = createLocation(
                request.getLatitude(),
                request.getLongitude()
        );


        // =====================================================
        // CALCULATE DEFAULT PRIORITY
        // =====================================================

        IssuePriority priority =
                IssuePriority.valueOf(
                        settings.getDefaultIssuePriority()
                );


        // =====================================================
        // DEFAULT ISSUE STATUS
        // =====================================================

        IssueStatus status =
                IssueStatus.REPORTED;


        // =====================================================
        // CALCULATE SLA
        // =====================================================

        LocalDateTime slaDueAt =
                slaService.calculateSlaDueAt(
                        request.getCategory(),
                        priority,
                        LocalDateTime.now()
                );


        // =====================================================
        // BUILD ISSUE
        // =====================================================

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
                .status(status)
                .slaDueAt(slaDueAt)
                .reportedBy(user)
                .build();


        // =====================================================
        // SAVE ISSUE
        // =====================================================

        Issue savedIssue =
                issueRepository.save(issue);


        // =====================================================
        // AUDIT LOG
        // =====================================================

        auditLogService.createAuditLog(

                user,

                AuditAction.ISSUE_CREATED,

                AuditEntityType.ISSUE,

                savedIssue.getId(),

                "Issue created: "
                        + savedIssue.getTitle(),

                null,

                savedIssue.getTitle(),

                null
        );


        // =====================================================
        // RETURN RESPONSE
        // =====================================================

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
            String email
    ) {

        // =====================================================
        // FIND LOGGED-IN USER
        // =====================================================

        User currentUser = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new UsernameNotFoundException(
                                "User not found with email: " + email
                        )
                );


        // =====================================================
        // FIND ISSUE
        // =====================================================

        Issue issue = issueRepository.findById(issueId)
                .orElseThrow(() ->
                        new IssueNotFoundException(
                                "Issue not found with ID: " + issueId
                        )
                );


        // =====================================================
        // OWNERSHIP CHECK
        // =====================================================

        if (!issue.getReportedBy().getId()
                .equals(currentUser.getId())) {

            throw new IssueAccessDeniedException(
                    "You are not authorized to update this issue."
            );
        }


        // =====================================================
        // CAPTURE OLD VALUES
        // =====================================================

        String oldValue =
                "title=" + issue.getTitle()
                        + ", description=" + issue.getDescription()
                        + ", category=" + issue.getCategory()
                        + ", imageUrl=" + issue.getImageUrl()
                        + ", latitude=" + issue.getLatitude()
                        + ", longitude=" + issue.getLongitude()
                        + ", address=" + issue.getAddress();


        // =====================================================
        // UPDATE EDITABLE FIELDS
        // =====================================================

        issue.setTitle(request.getTitle());

        issue.setDescription(request.getDescription());

        issue.setCategory(request.getCategory());


        // =====================================================
        // RECALCULATE PRIORITY
        // =====================================================

        IssuePriority recalculatedPriority =
                priorityEvaluationService.calculatePriority(
                        request.getCategory()
                );

        issue.setPriority(recalculatedPriority);


        // =====================================================
        // RECALCULATE SLA
        // =====================================================

        LocalDateTime recalculatedSlaDueAt =
                slaService.calculateSlaDueAt(
                        request.getCategory(),
                        recalculatedPriority,
                        issue.getCreatedAt()
                );

        issue.setSlaDueAt(recalculatedSlaDueAt);


        // =====================================================
        // UPDATE IMAGE
        // =====================================================

        issue.setImageUrl(request.getImageUrl());


        // =====================================================
        // UPDATE LOCATION
        // =====================================================

        issue.setLatitude(request.getLatitude());

        issue.setLongitude(request.getLongitude());

        issue.setAddress(request.getAddress());

        issue.setLocation(
                createLocation(
                        request.getLatitude(),
                        request.getLongitude()
                )
        );


        // =====================================================
        // SAVE UPDATED ISSUE
        // =====================================================

        Issue updatedIssue =
                issueRepository.save(issue);


        // =====================================================
        // CAPTURE NEW VALUES
        // =====================================================

        String newValue =
                "title=" + updatedIssue.getTitle()
                        + ", description=" + updatedIssue.getDescription()
                        + ", category=" + updatedIssue.getCategory()
                        + ", imageUrl=" + updatedIssue.getImageUrl()
                        + ", latitude=" + updatedIssue.getLatitude()
                        + ", longitude=" + updatedIssue.getLongitude()
                        + ", address=" + updatedIssue.getAddress();


        // =====================================================
        // AUDIT LOG
        // =====================================================

        auditLogService.createAuditLog(

                currentUser,

                AuditAction.ISSUE_UPDATED,

                AuditEntityType.ISSUE,

                updatedIssue.getId(),

                "Issue updated: "
                        + updatedIssue.getTitle(),

                oldValue,

                newValue,

                null
        );


        // =====================================================
        // RETURN UPDATED ISSUE
        // =====================================================

        return mapToIssueResponse(updatedIssue);
    }

    @Override
    @Transactional
    public IssueResponse updateIssueStatus(
            UUID issueId,
            IssueStatus newStatus,
            MultipartFile evidencePhoto,
            String email
    ) {

        // =====================================================
        // FIND LOGGED-IN USER
        // =====================================================

        User currentUser = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new UsernameNotFoundException(
                                "User not found with email: " + email
                        )
                );


        // =====================================================
        // FIND ISSUE
        // =====================================================

        Issue issue = issueRepository.findById(issueId)
                .orElseThrow(() ->
                        new IssueNotFoundException(
                                "Issue not found with ID: " + issueId
                        )
                );


        // =====================================================
        // FIELD WORKER OWNERSHIP VALIDATION
        // =====================================================

        if (currentUser.getRole() == Role.FIELD_WORKER) {

            if (
                    issue.getAssignedTo() == null
                            || !issue.getAssignedTo()
                            .getId()
                            .equals(currentUser.getId())
            ) {

                throw new IssueAccessDeniedException(
                        "You are not authorized to update this issue."
                );
            }
        }


        // =====================================================
        // GET CURRENT STATUS
        // =====================================================

        IssueStatus currentStatus = issue.getStatus();


        // =====================================================
        // VALIDATE STATUS TRANSITION
        // =====================================================

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


        // =====================================================
        // EVIDENCE PHOTO VALIDATION
        // =====================================================

        boolean photoRequired =
                newStatus == IssueStatus.IN_PROGRESS
                        || newStatus == IssueStatus.RESOLVED;

        if (
                photoRequired
                        && (evidencePhoto == null
                        || evidencePhoto.isEmpty())
        ) {

            throw new IllegalArgumentException(
                    "Evidence photo is required when changing issue status to "
                            + newStatus
            );
        }


        // =====================================================
        // STORE EVIDENCE PHOTO
        // =====================================================

        String evidencePhotoUrl = null;

        if (
                evidencePhoto != null
                        && !evidencePhoto.isEmpty()
        ) {

            evidencePhotoUrl =
                    imageStorageService.storeImage(
                            evidencePhoto
                    );
        }


        // =====================================================
        // UPDATE ISSUE STATUS
        // =====================================================

        issue.setStatus(newStatus);

        Issue updatedIssue =
                issueRepository.save(issue);


        // =====================================================
        // CREATE STATUS HISTORY
        // =====================================================

        IssueStatusHistory statusHistory =
                IssueStatusHistory.builder()
                        .issue(updatedIssue)
                        .fromStatus(currentStatus)
                        .toStatus(newStatus)
                        .changedBy(currentUser)
                        .changedAt(Instant.now())
                        .remark(null)
                        .evidencePhotoUrl(evidencePhotoUrl)
                        .build();

        issueStatusHistoryRepository.save(statusHistory);


        // =====================================================
        // AUDIT LOG
        // =====================================================

        auditLogService.createAuditLog(

                currentUser,

                AuditAction.ISSUE_STATUS_CHANGED,

                AuditEntityType.ISSUE,

                updatedIssue.getId(),

                "Issue status changed from "
                        + currentStatus
                        + " to "
                        + newStatus,

                currentStatus.name(),

                newStatus.name(),

                null
        );


        // =====================================================
        // NOTIFICATION TYPE AND TITLE
        // =====================================================

        NotificationType notificationType;

        String notificationTitle;

        if (newStatus == IssueStatus.RESOLVED) {

            notificationType =
                    NotificationType.ISSUE_RESOLVED;

            notificationTitle =
                    "Issue Resolved";

        } else {

            notificationType =
                    NotificationType.ISSUE_STATUS_CHANGED;

            notificationTitle =
                    "Issue Status Updated";
        }


        // =====================================================
        // CITIZEN NOTIFICATION
        // =====================================================

        User citizen =
                updatedIssue.getReportedBy();

        if (citizen != null) {

            String citizenMessage;

            if (newStatus == IssueStatus.RESOLVED) {

                citizenMessage =
                        "Your issue \""
                                + updatedIssue.getTitle()
                                + "\" has been resolved.";

            } else {

                citizenMessage =
                        "The status of your issue \""
                                + updatedIssue.getTitle()
                                + "\" has been changed from "
                                + currentStatus
                                + " to "
                                + newStatus
                                + ".";
            }

            notificationService.createNotification(
                    citizen,
                    notificationType,
                    notificationTitle,
                    citizenMessage,
                    updatedIssue.getId()
            );
        }


        // =====================================================
        // FIELD WORKER NOTIFICATION
        // =====================================================

        User fieldWorker =
                updatedIssue.getAssignedTo();

        if (
                fieldWorker != null
                        && !fieldWorker.getId()
                        .equals(currentUser.getId())
        ) {

            String workerMessage;

            if (newStatus == IssueStatus.RESOLVED) {

                workerMessage =
                        "The issue \""
                                + updatedIssue.getTitle()
                                + "\" has been marked as resolved.";

            } else {

                workerMessage =
                        "The status of issue \""
                                + updatedIssue.getTitle()
                                + "\" has been changed from "
                                + currentStatus
                                + " to "
                                + newStatus
                                + ".";
            }

            notificationService.createNotification(
                    fieldWorker,
                    notificationType,
                    notificationTitle,
                    workerMessage,
                    updatedIssue.getId()
            );
        }


        // =====================================================
        // ADMIN NOTIFICATION
        // =====================================================

        List<User> admins =
                userRepository.findByRole(Role.ADMIN);

        for (User admin : admins) {

            String adminMessage;

            if (newStatus == IssueStatus.RESOLVED) {

                adminMessage =
                        "Issue \""
                                + updatedIssue.getTitle()
                                + "\" has been marked as resolved by "
                                + currentUser.getFullName()
                                + ".";

            } else {

                adminMessage =
                        "Issue \""
                                + updatedIssue.getTitle()
                                + "\" status has been changed from "
                                + currentStatus
                                + " to "
                                + newStatus
                                + " by "
                                + currentUser.getFullName()
                                + ".";
            }

            notificationService.createNotification(
                    admin,
                    notificationType,
                    notificationTitle,
                    adminMessage,
                    updatedIssue.getId()
            );
        }


        // =====================================================
        // RETURN UPDATED ISSUE RESPONSE
        // =====================================================

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
                .reportedBy(
                        issue.getReportedBy() != null
                                ? issue.getReportedBy().getFullName()
                                : "Deleted User"
                )

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
                .slaDueAt(issue.getSlaDueAt())
                .slaBreached(issue.getSlaBreached())
                .slaBreachedAt(issue.getSlaBreachedAt())
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
        if (
                issue.getReportedBy() == null ||
                        !issue.getReportedBy().getId().equals(currentUser.getId())
        ) {
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

        LocalDateTime resolvedAt = null;

        if (issue.getStatus() == IssueStatus.RESOLVED) {

            resolvedAt = issueStatusHistoryRepository
                    .findByIssueIdOrderByChangedAtAsc(issue.getId())
                    .stream()
                    .filter(history ->
                            history.getToStatus() == IssueStatus.RESOLVED
                    )
                    .map(IssueStatusHistory::getChangedAt)
                    .findFirst()
                    .map(instant ->
                            instant.atZone(
                                    java.time.ZoneId.systemDefault()
                            ).toLocalDateTime()
                    )
                    .orElse(null);
        }

        return IssueSummaryResponse.builder()
                .id(issue.getId())
                .title(issue.getTitle())
                .description(issue.getDescription())
                .category(issue.getCategory())
                .priority(issue.getPriority())
                .status(issue.getStatus())
                .address(issue.getAddress())
                .createdAt(issue.getCreatedAt())
                .resolvedAt(resolvedAt)
                .slaDueAt(issue.getSlaDueAt())
                .slaBreached(issue.getSlaBreached())
                .slaBreachedAt(issue.getSlaBreachedAt())

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
                .map(history ->
                        IssueStatusHistoryResponse.builder()
                                .id(history.getId())
                                .fromStatus(history.getFromStatus())
                                .toStatus(history.getToStatus())
                                .changedById(
                                        history.getChangedBy() != null
                                                ? history.getChangedBy().getId()
                                                : null
                                )
                                .changedByName(
                                        history.getChangedBy() != null
                                                ? history.getChangedBy().getFullName()
                                                : null
                                )
                                .changedByEmail(
                                        history.getChangedBy() != null
                                                ? history.getChangedBy().getEmail()
                                                : null
                                )
                                .remark(history.getRemark())
                                .evidencePhotoUrl(history.getEvidencePhotoUrl())
                                .changedAt(history.getChangedAt())
                                .build()
                )
                .toList();
    }
    @Override
    @Transactional
    public void assignIssue(
            UUID issueId,
            AssignIssueRequest request,
            String email
    ) {


        User currentUser = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new UsernameNotFoundException(
                                "User not found with email: " + email
                        )
                );

        // =====================================================
        // FIND ISSUE
        // =====================================================

        Issue issue = issueRepository.findById(issueId)
                .orElseThrow(() ->
                        new IssueNotFoundException("Issue not found")
                );


        // =====================================================
        // FIND FIELD WORKER
        // =====================================================

        User fieldWorker = userRepository
                .findById(request.fieldWorkerId())
                .orElseThrow(() ->
                        new UserNotFoundException(
                                "Field worker not found"
                        )
                );


        // =====================================================
        // VALIDATE FIELD WORKER
        // =====================================================

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


        // =====================================================
        // CAPTURE PREVIOUS ASSIGNMENT
        // =====================================================

        User previousWorker = issue.getAssignedTo();

        String oldValue;

        if (previousWorker != null) {

            oldValue =
                    "assignedToId=" + previousWorker.getId()
                            + ", assignedToName="
                            + previousWorker.getFullName()
                            + ", assignedToEmail="
                            + previousWorker.getEmail();

        } else {

            oldValue = "assignedTo=null";
        }


        // =====================================================
        // ASSIGN ISSUE
        // =====================================================

        issue.setAssignedTo(fieldWorker);

        Issue updatedIssue =
                issueRepository.save(issue);


        // =====================================================
        // NEW ASSIGNMENT VALUE
        // =====================================================

        String newValue =
                "assignedToId=" + fieldWorker.getId()
                        + ", assignedToName="
                        + fieldWorker.getFullName()
                        + ", assignedToEmail="
                        + fieldWorker.getEmail();


        // =====================================================
        // AUDIT LOG
        // =====================================================

        auditLogService.createAuditLog(

                currentUser,

                AuditAction.ISSUE_ASSIGNED,

                AuditEntityType.ISSUE,

                updatedIssue.getId(),

                "Issue assigned to "
                        + fieldWorker.getFullName()
                        + ": "
                        + updatedIssue.getTitle(),

                oldValue,

                newValue,

                null
        );


        // =====================================================
        // WORKER NOTIFICATION
        // =====================================================

        notificationService.createNotification(

                fieldWorker,

                NotificationType.ISSUE_ASSIGNED,

                "New Issue Assigned",

                "You have been assigned a new civic issue: "
                        + updatedIssue.getTitle(),

                updatedIssue.getId()
        );


        // =====================================================
        // CITIZEN NOTIFICATION
        // =====================================================

        User citizen =
                updatedIssue.getReportedBy();

        if (citizen != null) {

            notificationService.createNotification(

                    citizen,

                    NotificationType.ISSUE_ASSIGNED,

                    "Field Worker Assigned",

                    "A field worker has been assigned to your reported issue: "
                            + updatedIssue.getTitle(),

                    updatedIssue.getId()
            );
        }
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