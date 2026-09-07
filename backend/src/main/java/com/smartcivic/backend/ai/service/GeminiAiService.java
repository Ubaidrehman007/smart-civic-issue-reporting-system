package com.smartcivic.backend.ai.service;

import com.google.genai.Client;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class GeminiAiService implements AiService {

    private final Client client;
    private final String model;

    public GeminiAiService(
            @Value("${gemini.api-key}") String apiKey,
            @Value("${gemini.model}") String model
    ) {

        this.client = Client.builder()
                .apiKey(apiKey)
                .build();

        this.model = model;
    }


    @Override
    public String chat(String message) {

        // =====================================================
        // VALIDATION
        // =====================================================

        if (message == null || message.isBlank()) {

            throw new IllegalArgumentException(
                    "Message is required."
            );
        }


        // =====================================================
        // AI ASSISTANT SYSTEM INSTRUCTION
        // =====================================================

        String prompt = """
                You are the AI Assistant of the
                Smart Civic Reporting System.

                Your primary purpose is to help users understand
                and use the Smart Civic Reporting System.

                You can help users with:

                - Reporting civic issues
                - Issue categories
                - Issue reporting workflow
                - Issue status
                - Status history
                - Notifications
                - Issue assignment
                - Worker workload
                - SLA concepts
                - Citizen dashboard
                - Worker dashboard
                - Admin dashboard
                - Location and civic issue reporting
                - General questions about the system

                IMPORTANT RULES:

                1. Give clear, concise and useful answers.

                2. Never invent real issue data.

                3. Never invent users, workers or administrators.

                4. Never claim that an action was performed
                   when it was not actually performed.

                5. Never expose passwords, JWT tokens, API keys,
                   credentials or other secrets.

                6. Never expose unauthorized private information.

                7. If the user asks for real backend data that
                   has not been provided to you, clearly explain
                   that the information requires access to the
                   relevant system data.

                8. Do not pretend that you can directly modify
                   database records.

                9. Stay focused on the Smart Civic Reporting System.

                10. Answer naturally like a helpful AI assistant.

                11. Do NOT return JSON unless the user explicitly
                    asks for JSON.

                12. Do NOT add unnecessary prefixes such as
                    "Here is the JSON" or markdown JSON blocks.

                User message:
                %s
                """.formatted(message.trim());


        // =====================================================
        // GEMINI REQUEST
        // =====================================================

        var response = client.models.generateContent(
                model,
                prompt,
                null
        );


        // =====================================================
        // RESPONSE VALIDATION
        // =====================================================

        if (response == null) {

            throw new IllegalStateException(
                    "Gemini returned a null response."
            );
        }


        String result = response.text();


        if (result == null || result.isBlank()) {

            throw new IllegalStateException(
                    "Gemini returned an empty response."
            );
        }


        return result.trim();
    }
}