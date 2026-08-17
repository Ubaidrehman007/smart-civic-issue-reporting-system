package com.smartcivic.backend.issue.service;

import com.smartcivic.backend.issue.enums.IssueCategory;
import com.smartcivic.backend.issue.enums.IssuePriority;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class SlaServiceImpl implements SlaService {

    @Override
    public LocalDateTime calculateSlaDueAt(
            IssueCategory category,
            IssuePriority priority,
            LocalDateTime createdAt
    ) {

        return switch (priority) {

            case CRITICAL ->
                    createdAt.plusHours(4);

            case HIGH ->
                    createdAt.plusHours(12);

            case MEDIUM ->
                    createdAt.plusHours(24);

            case LOW ->
                    createdAt.plusHours(48);
        };
    }
}