package com.smartcivic.backend.issue.dto.response;

import lombok.*;

import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PossibleDuplicateResponse {

    private boolean possibleDuplicate;

    private long duplicateCount;

    private List<IssueSummaryResponse> duplicates;
}