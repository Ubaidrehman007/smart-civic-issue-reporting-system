package com.smartcivic.backend.ai.service;

import com.smartcivic.backend.ai.dto.AiIssueAnalysisResponse;
import org.springframework.web.multipart.MultipartFile;

public interface AiService {

    String analyze(String prompt);

    AiIssueAnalysisResponse analyzeIssue(
            String title,
            String description,
            String citizenCategory,
            MultipartFile image
    );
}