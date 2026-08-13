package com.smartcivic.backend.issue.enums;

import java.util.Set;

public final class IssueStatusTransition {

    private IssueStatusTransition() {
    }

    public static boolean isValidTransition(
            IssueStatus currentStatus,
            IssueStatus newStatus
    ) {

        if (currentStatus == newStatus) {
            return false;
        }

        return switch (currentStatus) {

            case REPORTED ->
                    newStatus == IssueStatus.UNDER_REVIEW;

            case UNDER_REVIEW ->
                    Set.of(
                            IssueStatus.IN_PROGRESS,
                            IssueStatus.REJECTED
                    ).contains(newStatus);

            case IN_PROGRESS ->
                    newStatus == IssueStatus.RESOLVED;

            case RESOLVED, REJECTED ->
                    false;
        };
    }
}