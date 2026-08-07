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

    @NotNull
    private Double latitude;

    @NotNull
    private Double longitude;

    @NotBlank
    private String address;

}