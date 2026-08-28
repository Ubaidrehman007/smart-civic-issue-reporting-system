package com.smartcivic.backend.issue.scheduler;

import com.smartcivic.backend.issue.entity.Issue;
import com.smartcivic.backend.issue.enums.IssueStatus;
import com.smartcivic.backend.issue.repository.IssueRepository;
import com.smartcivic.backend.notification.entity.NotificationType;
import com.smartcivic.backend.notification.service.NotificationService;
import com.smartcivic.backend.user.entity.User;
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
    private final NotificationService notificationService;


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

            // =====================================================
            // MARK SLA AS BREACHED
            // =====================================================

            issue.setSlaBreached(true);
            issue.setSlaBreachedAt(now);

            issueRepository.save(issue);


            // =====================================================
            // CITIZEN NOTIFICATION
            // =====================================================

            User citizen = issue.getReportedBy();

            if (citizen != null) {

                notificationService.createNotification(
                        citizen,
                        NotificationType.SLA_BREACHED,
                        "Issue SLA Breached",
                        "The SLA for your issue \""
                                + issue.getTitle()
                                + "\" has been breached.",
                        issue.getId()
                );
            }


            // =====================================================
            // FIELD WORKER NOTIFICATION
            // =====================================================

            User fieldWorker = issue.getAssignedTo();

            if (fieldWorker != null) {

                notificationService.createNotification(
                        fieldWorker,
                        NotificationType.SLA_BREACHED,
                        "Issue SLA Breached",
                        "The SLA for the assigned issue \""
                                + issue.getTitle()
                                + "\" has been breached.",
                        issue.getId()
                );
            }
        }
    }
}