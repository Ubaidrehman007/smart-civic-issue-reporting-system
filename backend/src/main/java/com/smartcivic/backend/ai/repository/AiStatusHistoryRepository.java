package com.smartcivic.backend.ai.repository;

import com.smartcivic.backend.issue.entity.IssueStatusHistory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface AiStatusHistoryRepository
        extends JpaRepository<IssueStatusHistory, UUID> {

    List<IssueStatusHistory> findByIssueIdOrderByChangedAtAsc(
            UUID issueId
    );
}