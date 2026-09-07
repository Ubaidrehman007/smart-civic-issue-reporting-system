package com.smartcivic.backend.ai.controller;

import com.smartcivic.backend.ai.dto.AiChatRequest;
import com.smartcivic.backend.ai.dto.AiChatResponse;
import com.smartcivic.backend.ai.service.AiService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/ai")
public class AiController {

    private final AiService aiService;


    public AiController(AiService aiService) {

        this.aiService = aiService;
    }


    // =========================================================
    // AI ASSISTANT CHAT
    // =========================================================

    @PostMapping("/chat")
    public ResponseEntity<AiChatResponse> chat(

            @Valid @RequestBody AiChatRequest request

    ) {

        String reply =
                aiService.chat(
                        request.message()
                );


        AiChatResponse response =
                new AiChatResponse(
                        true,
                        reply,
                        LocalDateTime.now()
                );


        return ResponseEntity.ok(response);
    }
}