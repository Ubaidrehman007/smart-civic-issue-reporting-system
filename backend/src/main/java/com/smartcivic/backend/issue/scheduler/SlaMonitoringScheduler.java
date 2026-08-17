package com.smartcivic.backend.issue.scheduler;

import com.smartcivic.backend.issue.entity.Issue;
import com.smartcivic.backend.issue.enums.IssueStatus;
import com.smartcivic.backend.issue.repository.IssueRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
public class SlaMonitoringScheduler {

    private final IssueRepository issueRepository;

    @Scheduled(fixedRate = 60000)
    @Transactional
    public void checkSlaBreaches() {

        LocalDateTime now = LocalDateTime.now();

        List<Issue> overdueIssues =
                issueRepository
                        .findBySlaDueAtBeforeAndSlaBreachedFalseAndStatusNot(
                                now,
                                IssueStatus.RESOLVED
                        );

        for (Issue issue : overdueIssues) {

            issue.setSlaBreached(true);
            issue.setSlaBreachedAt(now);
        }
    }
}