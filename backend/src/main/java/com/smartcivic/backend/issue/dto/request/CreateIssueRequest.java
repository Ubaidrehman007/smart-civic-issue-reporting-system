package com.smartcivic.backend.issue.dto.request;

import com.smartcivic.backend.issue.enums.IssueCategory;
import jakarta.validation.constraints.*;

import lombok.*;
import org.springframework.web.multipart.MultipartFile;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateIssueRequest {

    @NotBlank(message = "Title is required")
    @Size(max = 100)
    private String title;

    @NotBlank(message = "Description is required")
    @Size(max = 1000)
    private String description;

    @NotNull(message = "Category is required")
    private IssueCategory category;

    private MultipartFile image;

    @NotNull(message = "Latitude is required")
    @DecimalMin(
            value = "-90.0",
            message = "Latitude must be between -90 and 90"
    )
    @DecimalMax(
            value = "90.0",
            message = "Latitude must be between -90 and 90"
    )
    private Double latitude;

    @NotNull(message = "Longitude is required")
    @DecimalMin(
            value = "-180.0",
            message = "Longitude must be between -180 and 180"
    )
    @DecimalMax(
            value = "180.0",
            message = "Longitude must be between -180 and 180"
    )
    private Double longitude;

    @NotBlank
    private String address;

}