package com.smartcivic.backend.issue.entity;

import com.smartcivic.backend.issue.enums.IssueStatus;
import com.smartcivic.backend.user.entity.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "issue_status_history")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class IssueStatusHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "issue_id", nullable = false)
    private Issue issue;

    @Enumerated(EnumType.STRING)
    @Column(name = "from_status", nullable = false, length = 30)
    private IssueStatus fromStatus;

    @Enumerated(EnumType.STRING)
    @Column(name = "to_status", nullable = false, length = 30)
    private IssueStatus toStatus;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "changed_by", nullable = false)
    private User changedBy;

    @Column(columnDefinition = "TEXT")
    private String remark;

    @Column(name = "changed_at", nullable = false)
    private Instant changedAt;
}