package com.smartcivic.backend.ai.repository;

import com.smartcivic.backend.issue.entity.Issue;
import com.smartcivic.backend.issue.enums.IssueCategory;
import com.smartcivic.backend.issue.enums.IssuePriority;
import com.smartcivic.backend.issue.enums.IssueStatus;
import com.smartcivic.backend.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public interface AiContextRepository extends JpaRepository<Issue, UUID> {

    // =========================================================
    // CITIZEN
    // =========================================================

    long countByReportedBy(User user);

    long countByReportedByAndStatus(
            User user,
            IssueStatus status
    );

    List<Issue> findTop10ByReportedByOrderByCreatedAtDesc(
            User user
    );


    // =========================================================
    // FIELD WORKER
    // =========================================================

    long countByAssignedTo(User worker);

    long countByAssignedToAndStatus(
            User worker,
            IssueStatus status
    );

    long countByAssignedToAndPriority(
            User worker,
            IssuePriority priority
    );

    long countByAssignedToAndSlaBreachedTrue(
            User worker
    );

    List<Issue> findTop10ByAssignedToOrderByCreatedAtDesc(
            User worker
    );


    // =========================================================
    // ADMIN - BASIC
    // =========================================================

    long countByAssignedToIsNull();

    long countBySlaBreachedTrue();

    long countBySlaBreachedFalse();


    // =========================================================
    // ADMIN - STATUS
    // =========================================================

    long countByStatus(
            IssueStatus status
    );


    // =========================================================
    // ADMIN - CATEGORY
    // =========================================================

    @Query("""
            SELECT i.category, COUNT(i)
            FROM Issue i
            GROUP BY i.category
            ORDER BY COUNT(i) DESC
            """)
    List<Object[]> countByCategory();


    // =========================================================
    // ADMIN - PRIORITY
    // =========================================================

    @Query("""
            SELECT i.priority, COUNT(i)
            FROM Issue i
            GROUP BY i.priority
            ORDER BY COUNT(i) DESC
            """)
    List<Object[]> countByPriority();


    // =========================================================
    // ADMIN - RESOLVED IN TIME RANGE
    // =========================================================

    @Query("""
            SELECT COUNT(DISTINCT h.issue.id)
            FROM IssueStatusHistory h
            WHERE h.toStatus = :resolvedStatus
              AND h.changedAt >= :start
              AND h.changedAt < :end
            """)
    long countResolvedBetween(
            @Param("resolvedStatus") IssueStatus resolvedStatus,
            @Param("start") java.time.Instant start,
            @Param("end") java.time.Instant end
    );


    // =========================================================
    // SLA APPROACHING
    // =========================================================

    long countBySlaDueAtBetweenAndSlaBreachedFalseAndStatusNot(
            LocalDateTime start,
            LocalDateTime end,
            IssueStatus status
    );


    // =========================================================
    // ADMIN - WORKER WORKLOAD
    // =========================================================

    @Query("""
            SELECT
                i.assignedTo.id,
                i.assignedTo.fullName,
                COUNT(i)
            FROM Issue i
            WHERE i.assignedTo IS NOT NULL
            GROUP BY i.assignedTo.id, i.assignedTo.fullName
            ORDER BY COUNT(i) DESC
            """)
    List<Object[]> findWorkerWorkload();


    // =========================================================
    // EXACT ISSUE ACCESS
    // =========================================================

    @Query("""
            SELECT i
            FROM Issue i
            WHERE i.id = :issueId
              AND i.reportedBy.id = :userId
            """)
    java.util.Optional<Issue> findCitizenIssue(
            @Param("issueId") UUID issueId,
            @Param("userId") UUID userId
    );


    @Query("""
            SELECT i
            FROM Issue i
            WHERE i.id = :issueId
              AND i.assignedTo.id = :workerId
            """)
    java.util.Optional<Issue> findWorkerIssue(
            @Param("issueId") UUID issueId,
            @Param("workerId") UUID workerId
    );
}