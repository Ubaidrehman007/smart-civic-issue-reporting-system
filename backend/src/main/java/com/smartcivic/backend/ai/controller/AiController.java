package com.smartcivic.backend.ai.controller;

import com.smartcivic.backend.ai.dto.AiAnalysisRequest;
import com.smartcivic.backend.ai.dto.AiAnalysisResponse;
import com.smartcivic.backend.ai.service.AiService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ai")
public class AiController {

    private final AiService aiService;

    public AiController(AiService aiService) {
        this.aiService = aiService;
    }

    @PostMapping("/analyze")
    public ResponseEntity<AiAnalysisResponse> analyze(
            @Valid @RequestBody AiAnalysisRequest request
    ) {

        String result = aiService.analyze(request.prompt());

        AiAnalysisResponse response =
                new AiAnalysisResponse(
                        "gemini",
                        result
                );

        return ResponseEntity.ok(response);
    }
}