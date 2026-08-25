package com.smartcivic.backend.issue.service;

import com.smartcivic.backend.issue.enums.IssueCategory;
import com.smartcivic.backend.issue.enums.IssuePriority;
import org.springframework.stereotype.Service;

@Service
public class PriorityEvaluationService {

    public IssuePriority calculatePriority(
            IssueCategory category
    ) {

        return switch (category) {

            case TRAFFIC_SIGNAL,
                 WATER_LEAKAGE,
                 SEWER,
                 DRAINAGE ->
                    IssuePriority.HIGH;

            case FALLEN_TREE,
                 ROAD_DAMAGE ->
                    IssuePriority.HIGH;

            case POTHOLE,
                 GARBAGE,
                 STREETLIGHT ->
                    IssuePriority.MEDIUM;

            case OTHER ->
                    IssuePriority.LOW;
        };
    }
}