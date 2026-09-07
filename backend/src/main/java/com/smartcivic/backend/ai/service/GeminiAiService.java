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

        if (message == null || message.isBlank()) {
            throw new IllegalArgumentException("Message is required.");
        }

        String prompt = """
                You are the AI Assistant of the
                                Smart Civic Issue Reporting System.
                
                                Your job is to help users understand and use
                                the civic issue reporting platform.
                
                                You can help with:
                                - Reporting civic issues
                                - Understanding issue categories
                                - Understanding issue statuses
                                - Explaining the issue reporting workflow
                                - Explaining notifications
                                - Explaining issue assignment
                                - Explaining SLA concepts
                                - Explaining dashboard features
                                - General questions about this project
                
                                Important rules:
                                - Give clear and concise answers.
                                - Never invent real issue, user, worker or admin data.
                                - Never claim that an action was performed when it was not.
                                - Do not expose passwords, API keys, tokens or other secrets.
                                - Do not provide unauthorized private information.
                                - If the user asks for information that requires backend data,
                                  clearly say that the information requires access to the
                                  relevant system data.
                                - Stay focused on the Smart Civic Reporting System.
                
                                User message:
                                %s
                """.formatted(message.trim());

        var response = client.models.generateContent(
                model,
                prompt,
                null
        );

        String result = response.text();

        if (result == null || result.isBlank()) {
            throw new IllegalStateException(
                    "Gemini returned an empty response."
            );
        }

        return result.trim();
    }
}