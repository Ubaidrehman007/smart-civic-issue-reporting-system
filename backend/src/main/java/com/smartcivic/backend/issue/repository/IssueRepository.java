package com.smartcivic.backend.issue.repository;

import com.smartcivic.backend.issue.entity.Issue;
import com.smartcivic.backend.issue.enums.IssueCategory;
import com.smartcivic.backend.issue.enums.IssuePriority;
import com.smartcivic.backend.issue.enums.IssueStatus;
import com.smartcivic.backend.user.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface IssueRepository extends JpaRepository<Issue, UUID> {

    List<Issue> findByReportedBy(User user);

    List<Issue> findByStatus(IssueStatus status);

    List<Issue> findByCategory(IssueCategory category);

    List<Issue> findByPriority(IssuePriority priority);

}