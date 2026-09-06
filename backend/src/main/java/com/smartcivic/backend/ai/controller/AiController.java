package com.smartcivic.backend.ai.controller;

import com.smartcivic.backend.ai.dto.AiAnalysisRequest;
import com.smartcivic.backend.ai.dto.AiAnalysisResponse;
import com.smartcivic.backend.ai.dto.AiIssueAnalysisResponse;
import com.smartcivic.backend.ai.service.AiService;
import jakarta.validation.Valid;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/ai")
public class AiController {

    private final AiService aiService;


    public AiController(AiService aiService) {

        this.aiService = aiService;
    }


    // =========================================================
    // GENERIC GEMINI TEXT ANALYSIS
    // =========================================================

    @PostMapping("/analyze")
    public ResponseEntity<AiAnalysisResponse> analyze(
            @Valid @RequestBody AiAnalysisRequest request
    ) {

        String result =
                aiService.analyze(
                        request.prompt()
                );


        AiAnalysisResponse response =
                new AiAnalysisResponse(
                        "gemini",
                        result
                );


        return ResponseEntity.ok(response);
    }


    // =========================================================
    // CIVIC ISSUE AI ANALYSIS
    // =========================================================

    @PostMapping(
            value = "/analyze-issue",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE
    )
    public ResponseEntity<AiIssueAnalysisResponse> analyzeIssue(

            @RequestParam("title")
            String title,

            @RequestParam("description")
            String description,

            @RequestParam("citizenCategory")
            String citizenCategory,

            @RequestParam("image")
            MultipartFile image

    ) {

        AiIssueAnalysisResponse response =
                aiService.analyzeIssue(
                        title,
                        description,
                        citizenCategory,
                        image
                );


        return ResponseEntity.ok(response);
    }
}