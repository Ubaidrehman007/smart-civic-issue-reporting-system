package com.smartcivic.backend.issue.service;

import com.smartcivic.backend.issue.dto.request.CreateIssueRequest;
import com.smartcivic.backend.issue.dto.response.IssueResponse;
import com.smartcivic.backend.issue.entity.Issue;
import com.smartcivic.backend.issue.enums.IssuePriority;
import com.smartcivic.backend.issue.enums.IssueStatus;
import com.smartcivic.backend.issue.repository.IssueRepository;
import com.smartcivic.backend.user.domain.User;
import com.smartcivic.backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class IssueServiceImpl implements IssueService {

    private final IssueRepository issueRepository;
    private final UserRepository userRepository;

    @Override
    public IssueResponse createIssue(CreateIssueRequest request, String userEmail) {

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Issue issue = Issue.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .category(request.getCategory())
                .imageUrl(request.getImageUrl())
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .address(request.getAddress())
                .priority(IssuePriority.MEDIUM)
                .status(IssueStatus.REPORTED)
                .reportedBy(user)
                .build();

        Issue savedIssue = issueRepository.save(issue);

        return IssueResponse.builder()
                .id(savedIssue.getId())
                .title(savedIssue.getTitle())
                .description(savedIssue.getDescription())
                .category(savedIssue.getCategory())
                .priority(savedIssue.getPriority())
                .status(savedIssue.getStatus())
                .imageUrl(savedIssue.getImageUrl())
                .latitude(savedIssue.getLatitude())
                .longitude(savedIssue.getLongitude())
                .address(savedIssue.getAddress())
                .reportedBy(savedIssue.getReportedBy().getEmail())
                .createdAt(savedIssue.getCreatedAt())
                .updatedAt(savedIssue.getUpdatedAt())
                .build();
    }
}