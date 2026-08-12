package com.smartcivic.backend.issue.repository;

import com.smartcivic.backend.issue.dto.projection.NearbyIssueProjection;
import com.smartcivic.backend.issue.entity.Issue;
import com.smartcivic.backend.issue.enums.IssueCategory;
import com.smartcivic.backend.issue.enums.IssuePriority;
import com.smartcivic.backend.issue.enums.IssueStatus;
import com.smartcivic.backend.user.domain.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.UUID;

public interface IssueRepository extends JpaRepository<Issue, UUID> {

    Page<Issue> findByReportedBy(User user, Pageable pageable);

    Page<Issue> findByStatus(IssueStatus status, Pageable pageable);

    Page<Issue> findByCategory(IssueCategory category, Pageable pageable);

    Page<Issue> findByPriority(IssuePriority priority, Pageable pageable);


    @Query(
            value = """
            SELECT
                id,
                title,
                category,
                priority,
                status,
                address,
                created_at AS createdAt,

                ST_Distance(
                    location::geography,
                    ST_SetSRID(
                        ST_MakePoint(:longitude, :latitude),
                        4326
                    )::geography
                ) AS distance

            FROM issues

            WHERE ST_DWithin(
                location::geography,
                ST_SetSRID(
                    ST_MakePoint(:longitude, :latitude),
                    4326
                )::geography,
                :radius
            )

            ORDER BY distance ASC
            """,

            countQuery = """
            SELECT COUNT(*)
            FROM issues

            WHERE ST_DWithin(
                location::geography,
                ST_SetSRID(
                    ST_MakePoint(:longitude, :latitude),
                    4326
                )::geography,
                :radius
            )
            """,

            nativeQuery = true
    )
    Page<NearbyIssueProjection> findNearbyIssues(
            @Param("latitude") double latitude,
            @Param("longitude") double longitude,
            @Param("radius") double radius,
            Pageable pageable
    );
}