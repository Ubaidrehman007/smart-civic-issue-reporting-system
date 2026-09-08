package com.smartcivic.backend.ai.service;

import com.smartcivic.backend.ai.repository.AiContextRepository;
import com.smartcivic.backend.ai.repository.AiStatusHistoryRepository;
import com.smartcivic.backend.issue.entity.Issue;
import com.smartcivic.backend.issue.entity.IssueStatusHistory;
import com.smartcivic.backend.issue.enums.IssuePriority;
import com.smartcivic.backend.issue.enums.IssueStatus;
import com.smartcivic.backend.user.entity.User;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
@Transactional(readOnly = true)
public class AiContextService {

    private static final int MAX_RECENT_ISSUES = 10;

    private static final DateTimeFormatter DATE_FORMAT =
            DateTimeFormatter.ofPattern("dd MMM yyyy, hh:mm a");

    private final AiContextRepository aiContextRepository;
    private final AiStatusHistoryRepository aiStatusHistoryRepository;

    public AiContextService(
            AiContextRepository aiContextRepository,
            AiStatusHistoryRepository aiStatusHistoryRepository
    ) {
        this.aiContextRepository = aiContextRepository;
        this.aiStatusHistoryRepository = aiStatusHistoryRepository;
    }


    // =========================================================
    // MAIN ENTRY POINT
    // =========================================================

    public String buildContext(
            User user,
            String role,
            String message
    ) {

        return switch (role) {

            case "CITIZEN" ->
                    buildCitizenContext(user, message);

            case "FIELD_WORKER" ->
                    buildFieldWorkerContext(user, message);

            case "ADMIN" ->
                    buildAdminContext(user, message);

            default ->
                    throw new IllegalStateException(
                            "Unsupported user role: " + role
                    );
        };
    }


    // =========================================================
    // CITIZEN CONTEXT
    // =========================================================

    private String buildCitizenContext(
            User user,
            String message
    ) {

        StringBuilder context = new StringBuilder();

        context.append("""
                VERIFIED SYSTEM CONTEXT
                =======================

                Role: CITIZEN
                User name: %s

                The following information is read directly
                from the authenticated user's authorized
                backend data.

                """.formatted(user.getFullName()));

        long total =
                aiContextRepository.countByReportedBy(user);

        long reported =
                aiContextRepository.countByReportedByAndStatus(
                        user,
                        IssueStatus.REPORTED
                );

        long underReview =
                aiContextRepository.countByReportedByAndStatus(
                        user,
                        IssueStatus.UNDER_REVIEW
                );

        long inProgress =
                aiContextRepository.countByReportedByAndStatus(
                        user,
                        IssueStatus.IN_PROGRESS
                );

        long resolved =
                aiContextRepository.countByReportedByAndStatus(
                        user,
                        IssueStatus.RESOLVED
                );

        long rejected =
                aiContextRepository.countByReportedByAndStatus(
                        user,
                        IssueStatus.REJECTED
                );

        context.append("""
                MY ISSUE STATISTICS

                Total issues: %d
                REPORTED: %d
                UNDER_REVIEW: %d
                IN_PROGRESS: %d
                RESOLVED: %d
                REJECTED: %d

                """.formatted(
                total,
                reported,
                underReview,
                inProgress,
                resolved,
                rejected
        ));

        context.append("RECENT MY ISSUES\n\n");

        List<Issue> recentIssues =
                aiContextRepository
                        .findTop10ByReportedByOrderByCreatedAtDesc(user);

        if (recentIssues.isEmpty()) {

            context.append("No issues have been reported by this citizen.\n");

        } else {

            appendIssues(
                    context,
                    recentIssues,
                    false
            );
        }

        Optional<UUID> issueId =
                extractUuid(message);

        if (issueId.isPresent()) {

            context.append("\nREQUESTED ISSUE DETAILS\n\n");

            Optional<Issue> issue =
                    aiContextRepository.findCitizenIssue(
                            issueId.get(),
                            user.getId()
                    );

            if (issue.isPresent()) {

                appendDetailedIssue(
                        context,
                        issue.get()
                );

            } else {

                context.append("""
                        No issue with the requested ID belongs
                        to the authenticated citizen.

                        Do not reveal whether an issue with that
                        ID belongs to another user.
                        """);
            }
        }

        return context.toString();
    }


    // =========================================================
    // FIELD WORKER CONTEXT
    // =========================================================

    private String buildFieldWorkerContext(
            User worker,
            String message
    ) {

        StringBuilder context = new StringBuilder();

        context.append("""
                VERIFIED SYSTEM CONTEXT
                =======================

                Role: FIELD_WORKER
                Worker name: %s

                The following information is read directly
                from the authenticated worker's authorized
                backend data.

                """.formatted(worker.getFullName()));

        long total =
                aiContextRepository.countByAssignedTo(worker);

        long reported =
                aiContextRepository.countByAssignedToAndStatus(
                        worker,
                        IssueStatus.REPORTED
                );

        long underReview =
                aiContextRepository.countByAssignedToAndStatus(
                        worker,
                        IssueStatus.UNDER_REVIEW
                );

        long inProgress =
                aiContextRepository.countByAssignedToAndStatus(
                        worker,
                        IssueStatus.IN_PROGRESS
                );

        long resolved =
                aiContextRepository.countByAssignedToAndStatus(
                        worker,
                        IssueStatus.RESOLVED
                );

        long rejected =
                aiContextRepository.countByAssignedToAndStatus(
                        worker,
                        IssueStatus.REJECTED
                );

        long highPriority =
                aiContextRepository.countByAssignedToAndPriority(
                        worker,
                        IssuePriority.HIGH
                );

        long criticalPriority =
                aiContextRepository.countByAssignedToAndPriority(
                        worker,
                        IssuePriority.CRITICAL
                );

        long breached =
                aiContextRepository.countByAssignedToAndSlaBreachedTrue(
                        worker
                );

        context.append("""
                MY ASSIGNMENT STATISTICS

                Total assigned issues: %d
                REPORTED: %d
                UNDER_REVIEW: %d
                IN_PROGRESS: %d
                RESOLVED: %d
                REJECTED: %d

                HIGH priority: %d
                CRITICAL priority: %d
                SLA breached: %d

                """.formatted(
                total,
                reported,
                underReview,
                inProgress,
                resolved,
                rejected,
                highPriority,
                criticalPriority,
                breached
        ));

        LocalDateTime now =
                LocalDateTime.now();

        LocalDateTime oneHourLater =
                now.plusHours(1);

        long approaching =
                aiContextRepository
                        .countBySlaDueAtBetweenAndSlaBreachedFalseAndStatusNot(
                                now,
                                oneHourLater,
                                IssueStatus.RESOLVED
                        );

        context.append("""
                SLA APPROACHING

                Assignments due within the next hour:
                %d

                """.formatted(approaching));

        context.append("RECENT ASSIGNED ISSUES\n\n");

        List<Issue> recentIssues =
                aiContextRepository
                        .findTop10ByAssignedToOrderByCreatedAtDesc(
                                worker
                        );

        if (recentIssues.isEmpty()) {

            context.append(
                    "No issues are currently assigned to this worker.\n"
            );

        } else {

            appendIssues(
                    context,
                    recentIssues,
                    true
            );
        }

        Optional<UUID> issueId =
                extractUuid(message);

        if (issueId.isPresent()) {

            context.append("\nREQUESTED ASSIGNMENT DETAILS\n\n");

            Optional<Issue> issue =
                    aiContextRepository.findWorkerIssue(
                            issueId.get(),
                            worker.getId()
                    );

            if (issue.isPresent()) {

                appendDetailedIssue(
                        context,
                        issue.get()
                );

            } else {

                context.append("""
                        No assigned issue with the requested ID
                        belongs to the authenticated field worker.

                        Do not reveal private information about
                        other users' or workers' issues.
                        """);
            }
        }

        return context.toString();
    }


    // =========================================================
    // ADMIN CONTEXT
    // =========================================================

    private String buildAdminContext(
            User admin,
            String message
    ) {

        StringBuilder context = new StringBuilder();

        context.append("""
                VERIFIED SYSTEM CONTEXT
                =======================

                Role: ADMIN
                Administrator: %s

                The following information is read directly
                from the backend database for administrative
                operational intelligence.

                """.formatted(admin.getFullName()));

        long total =
                aiContextRepository.count();

        long reported =
                aiContextRepository.countByStatus(
                        IssueStatus.REPORTED
                );

        long underReview =
                aiContextRepository.countByStatus(
                        IssueStatus.UNDER_REVIEW
                );

        long inProgress =
                aiContextRepository.countByStatus(
                        IssueStatus.IN_PROGRESS
                );

        long resolved =
                aiContextRepository.countByStatus(
                        IssueStatus.RESOLVED
                );

        long rejected =
                aiContextRepository.countByStatus(
                        IssueStatus.REJECTED
                );

        long unassigned =
                aiContextRepository.countByAssignedToIsNull();

        long breached =
                aiContextRepository.countBySlaBreachedTrue();

        long withinSla =
                aiContextRepository.countBySlaBreachedFalse();

        context.append("""
                SYSTEM ISSUE STATISTICS

                Total issues: %d
                REPORTED: %d
                UNDER_REVIEW: %d
                IN_PROGRESS: %d
                RESOLVED: %d
                REJECTED: %d

                Unassigned: %d

                SLA breached: %d
                SLA within limit: %d

                """.formatted(
                total,
                reported,
                underReview,
                inProgress,
                resolved,
                rejected,
                unassigned,
                breached,
                withinSla
        ));

        LocalDateTime now =
                LocalDateTime.now();

        LocalDateTime oneHourLater =
                now.plusHours(1);

        long approaching =
                aiContextRepository
                        .countBySlaDueAtBetweenAndSlaBreachedFalseAndStatusNot(
                                now,
                                oneHourLater,
                                IssueStatus.RESOLVED
                        );

        context.append("""
                SLA APPROACHING

                Issues due within the next hour:
                %d

                """.formatted(approaching));

        // -----------------------------------------------------
        // CATEGORY
        // -----------------------------------------------------

        context.append("ISSUES BY CATEGORY\n\n");

        for (Object[] row :
                aiContextRepository.countByCategory()) {

            context.append(
                    "- %s: %d\n"
                            .formatted(
                                    row[0],
                                    ((Number) row[1]).longValue()
                            )
            );
        }

        context.append("\nISSUES BY PRIORITY\n\n");

        for (Object[] row :
                aiContextRepository.countByPriority()) {

            context.append(
                    "- %s: %d\n"
                            .formatted(
                                    row[0],
                                    ((Number) row[1]).longValue()
                            )
            );
        }

        // -----------------------------------------------------
        // RESOLVED THIS WEEK
        // -----------------------------------------------------

        Instant weekStart =
                LocalDateTime.now()
                        .minusDays(7)
                        .atZone(ZoneId.systemDefault())
                        .toInstant();

        Instant nowInstant =
                Instant.now();

        long resolvedThisWeek =
                aiContextRepository.countResolvedBetween(
                        IssueStatus.RESOLVED,
                        weekStart,
                        nowInstant
                );

        context.append("""
                
                RESOLUTION ACTIVITY

                Issues resolved during the last 7 days:
                %d

                """.formatted(resolvedThisWeek));

        // -----------------------------------------------------
        // WORKER WORKLOAD
        // -----------------------------------------------------

        context.append("FIELD WORKER WORKLOAD\n\n");

        List<Object[]> workloads =
                aiContextRepository.findWorkerWorkload();

        if (workloads.isEmpty()) {

            context.append(
                    "No currently assigned issues found.\n"
            );

        } else {

            for (Object[] row : workloads) {

                context.append(
                        "- Worker: %s | Assigned issues: %d\n"
                                .formatted(
                                        row[1],
                                        ((Number) row[2]).longValue()
                                )
                );
            }
        }

        // -----------------------------------------------------
        // EXACT ISSUE
        // -----------------------------------------------------

        Optional<UUID> issueId =
                extractUuid(message);

        if (issueId.isPresent()) {

            context.append("\nREQUESTED ISSUE DETAILS\n\n");

            Optional<Issue> issue =
                    aiContextRepository.findById(issueId.get());

            if (issue.isPresent()) {

                appendDetailedIssue(
                        context,
                        issue.get()
                );

            } else {

                context.append(
                        "No issue exists with the requested ID.\n"
                );
            }
        }

        return context.toString();
    }


    // =========================================================
    // ISSUE SUMMARY
    // =========================================================

    private void appendIssues(
            StringBuilder context,
            List<Issue> issues,
            boolean includeAssignment
    ) {

        int count = 0;

        for (Issue issue : issues) {

            if (count++ >= MAX_RECENT_ISSUES) {
                break;
            }

            context.append(
                    """
                    Issue ID: %s
                    Title: %s
                    Category: %s
                    Priority: %s
                    Status: %s
                    Address: %s
                    Created: %s
                    SLA due: %s
                    SLA breached: %s
                    """
                            .formatted(
                                    issue.getId(),
                                    safe(issue.getTitle()),
                                    issue.getCategory(),
                                    issue.getPriority(),
                                    issue.getStatus(),
                                    safe(issue.getAddress()),
                                    format(issue.getCreatedAt()),
                                    format(issue.getSlaDueAt()),
                                    Boolean.TRUE.equals(
                                            issue.getSlaBreached()
                                    )
                            )
            );

            if (includeAssignment &&
                    issue.getAssignedTo() != null) {

                context.append(
                        "Assigned worker: "
                                + safe(
                                issue.getAssignedTo().getFullName()
                        )
                                + "\n"
                );
            }

            context.append("\n");
        }
    }


    // =========================================================
    // DETAILED ISSUE
    // =========================================================

    private void appendDetailedIssue(
            StringBuilder context,
            Issue issue
    ) {

        context.append(
                """
                Issue ID: %s
                Title: %s
                Description: %s
                Category: %s
                Priority: %s
                Status: %s
                Address: %s
                Created: %s
                Updated: %s
                SLA due: %s
                SLA breached: %s
                SLA breached at: %s
                """
                        .formatted(
                                issue.getId(),
                                safe(issue.getTitle()),
                                safe(issue.getDescription()),
                                issue.getCategory(),
                                issue.getPriority(),
                                issue.getStatus(),
                                safe(issue.getAddress()),
                                format(issue.getCreatedAt()),
                                format(issue.getUpdatedAt()),
                                format(issue.getSlaDueAt()),
                                Boolean.TRUE.equals(
                                        issue.getSlaBreached()
                                ),
                                format(issue.getSlaBreachedAt())
                        )
        );

        if (issue.getAssignedTo() != null) {

            context.append(
                    """
                    Assigned worker: %s
                    """
                            .formatted(
                                    safe(
                                            issue.getAssignedTo()
                                                    .getFullName()
                                    )
                            )
            );
        } else {

            context.append(
                    "Assigned worker: Not assigned\n"
            );
        }

        appendStatusHistory(
                context,
                issue
        );
    }


    // =========================================================
    // STATUS HISTORY
    // =========================================================

    private void appendStatusHistory(
            StringBuilder context,
            Issue issue
    ) {

        List<IssueStatusHistory> history =
                aiStatusHistoryRepository
                        .findByIssueIdOrderByChangedAtAsc(
                                issue.getId()
                        );

        context.append("\nSTATUS HISTORY\n\n");

        if (history.isEmpty()) {

            context.append(
                    "No status history records available.\n"
            );

            return;
        }

        for (IssueStatusHistory item : history) {

            context.append(
                    """
                    %s → %s
                    Changed at: %s
                    Remark: %s

                    """
                            .formatted(
                                    item.getFromStatus(),
                                    item.getToStatus(),
                                    format(item.getChangedAt()),
                                    safe(item.getRemark())
                            )
            );
        }
    }


    // =========================================================
    // UUID EXTRACTION
    // =========================================================

    private Optional<UUID> extractUuid(
            String message
    ) {

        if (message == null) {
            return Optional.empty();
        }

        Pattern pattern =
                Pattern.compile(
                        "[0-9a-fA-F]{8}-" +
                                "[0-9a-fA-F]{4}-" +
                                "[0-9a-fA-F]{4}-" +
                                "[0-9a-fA-F]{4}-" +
                                "[0-9a-fA-F]{12}"
                );

        Matcher matcher =
                pattern.matcher(message);

        if (!matcher.find()) {
            return Optional.empty();
        }

        try {

            return Optional.of(
                    UUID.fromString(matcher.group())
            );

        } catch (IllegalArgumentException exception) {

            return Optional.empty();
        }
    }


    // =========================================================
    // FORMAT HELPERS
    // =========================================================

    private String format(
            LocalDateTime value
    ) {

        if (value == null) {
            return "Not available";
        }

        return value.format(DATE_FORMAT);
    }


    private String format(
            Instant value
    ) {

        if (value == null) {
            return "Not available";
        }

        return value
                .atZone(ZoneId.systemDefault())
                .toLocalDateTime()
                .format(DATE_FORMAT);
    }


    private String safe(
            String value
    ) {

        if (value == null || value.isBlank()) {
            return "Not available";
        }

        return value;
    }
}