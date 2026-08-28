package com.smartcivic.backend.issue.scheduler;

import com.smartcivic.backend.issue.entity.Issue;
import com.smartcivic.backend.issue.enums.IssueStatus;
import com.smartcivic.backend.issue.repository.IssueRepository;
import com.smartcivic.backend.notification.entity.NotificationType;
import com.smartcivic.backend.notification.repository.NotificationRepository;
import com.smartcivic.backend.notification.service.NotificationService;
import com.smartcivic.backend.user.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class SlaMonitoringScheduler {

    private final IssueRepository issueRepository;
    private final NotificationService notificationService;
    private final NotificationRepository notificationRepository;


    @Scheduled(fixedRate = 60000)
    @Transactional
    public void checkSlaBreaches() {

        LocalDateTime now = LocalDateTime.now();

        // =====================================================
        // SLA WARNING
        // =====================================================

        checkSlaWarnings(now);


        // =====================================================
        // SLA BREACH
        // =====================================================

        checkSlaBreaches(now);
    }


    // =========================================================
    // SLA WARNING CHECK
    // =========================================================

    private void checkSlaWarnings(LocalDateTime now) {

        LocalDateTime warningThreshold =
                now.plusHours(1);

        List<Issue> warningIssues =
                issueRepository
                        .findBySlaDueAtBetweenAndSlaBreachedFalseAndStatusNot(
                                now,
                                warningThreshold,
                                IssueStatus.RESOLVED
                        );


        for (Issue issue : warningIssues) {

            log.info(
                    "SLA warning detected for issue: {}",
                    issue.getId()
            );


            // =================================================
            // CITIZEN WARNING
            // =================================================

            User citizen = issue.getReportedBy();

            if (citizen != null
                    && !notificationRepository
                    .existsByUserAndTypeAndReferenceId(
                            citizen,
                            NotificationType.SLA_WARNING,
                            issue.getId()
                    )) {

                log.info(
                        "Creating citizen SLA warning notification for issue: {}",
                        issue.getId()
                );

                notificationService.createNotification(
                        citizen,
                        NotificationType.SLA_WARNING,
                        "SLA Warning",
                        "The SLA deadline for your issue \""
                                + issue.getTitle()
                                + "\" is approaching. Please be aware that the issue is nearing its resolution deadline.",
                        issue.getId()
                );
            }


            // =================================================
            // FIELD WORKER WARNING
            // =================================================

            User fieldWorker = issue.getAssignedTo();

            if (fieldWorker != null
                    && !notificationRepository
                    .existsByUserAndTypeAndReferenceId(
                            fieldWorker,
                            NotificationType.SLA_WARNING,
                            issue.getId()
                    )) {

                log.info(
                        "Creating worker SLA warning notification for issue: {}",
                        issue.getId()
                );

                notificationService.createNotification(
                        fieldWorker,
                        NotificationType.SLA_WARNING,
                        "SLA Warning",
                        "The SLA deadline for the assigned issue \""
                                + issue.getTitle()
                                + "\" is approaching.",
                        issue.getId()
                );
            }
        }
    }


    // =========================================================
    // SLA BREACH CHECK
    // =========================================================

    private void checkSlaBreaches(LocalDateTime now) {

        List<Issue> overdueIssues =
                issueRepository
                        .findBySlaDueAtBeforeAndSlaBreachedFalseAndStatusNot(
                                now,
                                IssueStatus.RESOLVED
                        );


        for (Issue issue : overdueIssues) {

            // =================================================
            // MARK SLA AS BREACHED
            // =================================================

            issue.setSlaBreached(true);
            issue.setSlaBreachedAt(now);

            issueRepository.save(issue);

            log.info(
                    "SLA breach detected for issue: {}",
                    issue.getId()
            );


            // =================================================
            // CITIZEN NOTIFICATION
            // =================================================

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


            // =================================================
            // FIELD WORKER NOTIFICATION
            // =================================================

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