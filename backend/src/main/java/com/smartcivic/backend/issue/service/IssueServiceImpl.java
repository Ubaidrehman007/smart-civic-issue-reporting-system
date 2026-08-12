package com.smartcivic.backend.issue.service;

import com.smartcivic.backend.issue.dto.UpdateIssueRequest;
import com.smartcivic.backend.issue.dto.request.CreateIssueRequest;
import com.smartcivic.backend.issue.dto.response.IssueResponse;
import com.smartcivic.backend.issue.dto.response.IssueSummaryResponse;
import com.smartcivic.backend.issue.entity.Issue;
import com.smartcivic.backend.issue.enums.IssueCategory;
import com.smartcivic.backend.issue.enums.IssuePriority;
import com.smartcivic.backend.issue.enums.IssueStatus;
import com.smartcivic.backend.issue.exception.IssueAccessDeniedException;
import com.smartcivic.backend.issue.exception.IssueDeletionNotAllowedException;
import com.smartcivic.backend.issue.exception.IssueNotFoundException;
import com.smartcivic.backend.issue.repository.IssueRepository;
import com.smartcivic.backend.storage.service.ImageStorageService;
import com.smartcivic.backend.user.domain.User;
import com.smartcivic.backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.locationtech.jts.geom.Coordinate;
import org.locationtech.jts.geom.GeometryFactory;
import org.locationtech.jts.geom.Point;
import org.locationtech.jts.geom.PrecisionModel;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class IssueServiceImpl implements IssueService {

    private final IssueRepository issueRepository;
    private final UserRepository userRepository;
    private final ImageStorageService imageStorageService;

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

        GeometryFactory geometryFactory =
                new GeometryFactory(new PrecisionModel(), 4326);

        Point location = geometryFactory.createPoint(
                new Coordinate(
                        request.getLongitude(),
                        request.getLatitude()
                )
        );

        Issue issue = Issue.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .category(request.getCategory())
                .imageUrl(imageFileName)
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .location(location)
                .address(request.getAddress())
                .priority(IssuePriority.MEDIUM)
                .status(IssueStatus.REPORTED)
                .reportedBy(user)
                .build();

        Issue savedIssue = issueRepository.save(issue);

        return mapToIssueResponse(savedIssue);
    }

    @Override
    public Page<IssueSummaryResponse> getAllIssues(Pageable pageable) {

        Page<Issue> issues = issueRepository.findAll(pageable);

        return issues.map(issue ->
                IssueSummaryResponse.builder()
                        .id(issue.getId())
                        .title(issue.getTitle())
                        .category(issue.getCategory())
                        .priority(issue.getPriority())
                        .status(issue.getStatus())
                        .address(issue.getAddress())
                        .createdAt(issue.getCreatedAt())
                        .build()
        );
    }

    @Transactional(readOnly = true)
    @Override
    public IssueResponse getIssueById(UUID id) {

        Issue issue = issueRepository.findById(id)
                .orElseThrow(() ->
                        new IssueNotFoundException(
                                "Issue not found with ID: " + id
                        )
                );

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
                        .build()
                );
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


        GeometryFactory geometryFactory =
                new GeometryFactory(new PrecisionModel(), 4326);

        Point location = geometryFactory.createPoint(
                new Coordinate(
                        request.getLongitude(),
                        request.getLatitude()
                )
        );

        issue.setLocation(location);


        // Save updated issue
        Issue updatedIssue = issueRepository.save(issue);

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
                .build();
    }

}