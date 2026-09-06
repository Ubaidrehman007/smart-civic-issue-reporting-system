package com.smartcivic.backend.ai.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.genai.Client;
import com.google.genai.types.Content;
import com.google.genai.types.GenerateContentConfig;
import com.google.genai.types.GenerateContentResponse;
import com.google.genai.types.Part;
import com.smartcivic.backend.ai.dto.AiIssueAnalysisResponse;
import com.smartcivic.backend.issue.enums.IssueCategory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Locale;

@Service
public class GeminiAiService implements AiService {

    private final Client client;
    private final String model;
    private final ObjectMapper objectMapper;

    public GeminiAiService(
            @Value("${gemini.api-key}") String apiKey,
            @Value("${gemini.model}") String model,
            ObjectMapper objectMapper
    ) {

        this.client = Client.builder()
                .apiKey(apiKey)
                .build();

        this.model = model;
        this.objectMapper = objectMapper;
    }


    // =========================================================
    // GENERIC GEMINI TEXT ANALYSIS
    // =========================================================

    @Override
    public String analyze(String prompt) {

        if (prompt == null || prompt.isBlank()) {

            throw new IllegalArgumentException(
                    "Prompt is required."
            );
        }

        GenerateContentResponse response =
                client.models.generateContent(
                        model,
                        prompt,
                        null
                );

        String text = response.text();

        if (text == null || text.isBlank()) {

            throw new IllegalStateException(
                    "Gemini returned an empty response."
            );
        }

        return text;
    }


    // =========================================================
    // CIVIC ISSUE IMAGE + TEXT ANALYSIS
    // =========================================================

    @Override
    public AiIssueAnalysisResponse analyzeIssue(
            String title,
            String description,
            String citizenCategory,
            MultipartFile image
    ) {

        validateInput(
                title,
                description,
                citizenCategory,
                image
        );

        try {

            // -------------------------------------------------
            // RESOLVE IMAGE MIME TYPE
            // -------------------------------------------------

            String mimeType =
                    resolveImageMimeType(image);

            // -------------------------------------------------
            // BUILD AI PROMPT
            // -------------------------------------------------

            String prompt = """
                    You are an AI civic issue analysis assistant
                    for a Smart Civic Issue Reporting System.

                    Your job is to analyze the uploaded civic issue
                    image together with the citizen's title,
                    description, and selected category.

                    =================================================
                    ALLOWED ISSUE CATEGORIES
                    =================================================

                    You MUST return exactly one of these categories:

                    POTHOLE
                    GARBAGE
                    STREETLIGHT
                    WATER_LEAKAGE
                    SEWER
                    ROAD_DAMAGE
                    DRAINAGE
                    FALLEN_TREE
                    TRAFFIC_SIGNAL
                    OTHER


                    =================================================
                    CATEGORY DEFINITIONS
                    =================================================

                    POTHOLE:
                    A hole or depression in a road surface.

                    GARBAGE:
                    General accumulated waste or garbage.

                    STREETLIGHT:
                    Broken, damaged, missing, or malfunctioning
                    street lighting.

                    WATER_LEAKAGE:
                    Water pipe leakage, water escaping from
                    infrastructure, or visible water wastage.

                    SEWER:
                    Sewer-related problems including exposed,
                    damaged, overflowing, or blocked sewer systems.

                    ROAD_DAMAGE:
                    General road damage that is not specifically
                    a pothole.

                    DRAINAGE:
                    Drain blockage, flooding caused by drainage,
                    damaged drainage infrastructure, or similar
                    drainage problems.

                    FALLEN_TREE:
                    A fallen or dangerously damaged tree.

                    TRAFFIC_SIGNAL:
                    Broken, damaged, missing, or malfunctioning
                    traffic signal.

                    OTHER:
                    Use only when the issue does not reasonably
                    belong to any of the categories above.


                    =================================================
                    SEVERITY
                    =================================================

                    Return exactly one severity:

                    LOW
                    MEDIUM
                    HIGH
                    CRITICAL


                    LOW:
                    Minor civic issue with limited public impact
                    and low immediate risk.

                    MEDIUM:
                    Noticeable civic issue that requires municipal
                    attention but does not represent an immediate
                    serious safety threat.

                    HIGH:
                    Significant public inconvenience, infrastructure
                    damage, property risk, or meaningful safety risk.

                    CRITICAL:
                    Immediate or potentially severe public safety
                    risk requiring urgent attention.


                    =================================================
                    CONFIDENCE
                    =================================================

                    Return a confidence value between:

                    0.0 and 1.0

                    0.0 means very uncertain.
                    1.0 means extremely confident.


                    =================================================
                    IMPORTANT RULES
                    =================================================

                    1. Analyze BOTH the image and text.

                    2. Do not blindly trust the citizen's selected
                       category. Use it only as additional context.

                    3. If the image strongly contradicts the citizen's
                       selected category, classify according to the
                       actual evidence.

                    4. Do not invent information that cannot be
                       reasonably inferred from the image or text.

                    5. If the image is unclear, use OTHER or a
                       lower confidence score where appropriate.

                    6. Severity must be based on the visible or
                       described public impact and safety risk.

                    7. Return ONLY valid JSON.

                    8. Do NOT return markdown.

                    9. Do NOT wrap the JSON in ```.

                    10. Do NOT add fields other than the four
                        requested fields.


                    =================================================
                    REQUIRED JSON FORMAT
                    =================================================

                    {
                      "category": "POTHOLE",
                      "confidence": 0.95,
                      "severity": "HIGH",
                      "reason": "The image shows a large road depression that may create a significant safety risk."
                    }


                    =================================================
                    CITIZEN INPUT
                    =================================================

                    Citizen selected category:
                    %s

                    Title:
                    %s

                    Description:
                    %s
                    """.formatted(
                    citizenCategory,
                    title,
                    description
            );


            // -------------------------------------------------
            // BUILD MULTIMODAL CONTENT
            // -------------------------------------------------

            Content content =
                    Content.fromParts(

                            Part.fromText(prompt),

                            Part.fromBytes(
                                    image.getBytes(),
                                    mimeType
                            )
                    );


            // -------------------------------------------------
            // FORCE JSON RESPONSE
            // -------------------------------------------------

            GenerateContentConfig config =
                    GenerateContentConfig.builder()
                            .responseMimeType("application/json")
                            .build();


            // -------------------------------------------------
            // CALL GEMINI
            // -------------------------------------------------

            GenerateContentResponse response =
                    client.models.generateContent(
                            model,
                            content,
                            config
                    );


            String json = response.text();

            if (json == null || json.isBlank()) {

                throw new IllegalStateException(
                        "Gemini returned an empty AI analysis."
                );
            }


            // -------------------------------------------------
            // PARSE GEMINI JSON
            // -------------------------------------------------

            AiIssueAnalysisResponse result =
                    objectMapper.readValue(
                            json,
                            AiIssueAnalysisResponse.class
                    );


            // -------------------------------------------------
            // VALIDATE AI RESULT
            // -------------------------------------------------

            validateResult(result);

            return result;


        } catch (IOException exception) {

            throw new IllegalStateException(
                    "Failed to process the issue image for AI analysis.",
                    exception
            );
        }
    }


    // =========================================================
    // INPUT VALIDATION
    // =========================================================

    private void validateInput(
            String title,
            String description,
            String citizenCategory,
            MultipartFile image
    ) {

        if (title == null || title.isBlank()) {

            throw new IllegalArgumentException(
                    "Issue title is required."
            );
        }


        if (description == null || description.isBlank()) {

            throw new IllegalArgumentException(
                    "Issue description is required."
            );
        }


        if (citizenCategory == null
                || citizenCategory.isBlank()) {

            throw new IllegalArgumentException(
                    "Citizen category is required."
            );
        }


        try {

            IssueCategory.valueOf(
                    citizenCategory.trim().toUpperCase()
            );

        } catch (IllegalArgumentException exception) {

            throw new IllegalArgumentException(
                    "Invalid citizen category: "
                            + citizenCategory
            );
        }


        if (image == null || image.isEmpty()) {

            throw new IllegalArgumentException(
                    "Issue image is required for AI analysis."
            );
        }


        // -------------------------------------------------
        // RESOLVE MIME TYPE INSTEAD OF TRUSTING ONLY
        // MULTIPART CONTENT-TYPE
        // -------------------------------------------------

        resolveImageMimeType(image);
    }


    // =========================================================
    // IMAGE MIME TYPE RESOLUTION
    // =========================================================

    private String resolveImageMimeType(
            MultipartFile image
    ) {

        String contentType =
                image.getContentType();


        // -------------------------------------------------
        // CASE 1:
        // MultipartFile already contains a valid image MIME
        // -------------------------------------------------

        if (contentType != null
                && contentType.toLowerCase(Locale.ROOT)
                .startsWith("image/")) {

            return normalizeMimeType(contentType);
        }


        // -------------------------------------------------
        // CASE 2:
        // Resolve MIME type from original filename
        // -------------------------------------------------

        String filename =
                image.getOriginalFilename();


        if (filename != null) {

            String lowerFilename =
                    filename.toLowerCase(Locale.ROOT);


            if (lowerFilename.endsWith(".png")) {

                return "image/png";
            }


            if (lowerFilename.endsWith(".jpg")
                    || lowerFilename.endsWith(".jpeg")) {

                return "image/jpeg";
            }


            if (lowerFilename.endsWith(".webp")) {

                return "image/webp";
            }


            if (lowerFilename.endsWith(".gif")) {

                return "image/gif";
            }
        }


        // -------------------------------------------------
        // Unsupported / unknown image type
        // -------------------------------------------------

        throw new IllegalArgumentException(
                "Only PNG, JPG, JPEG, WEBP, and GIF image files "
                        + "are allowed for AI analysis."
        );
    }


    // =========================================================
    // MIME TYPE NORMALIZATION
    // =========================================================

    private String normalizeMimeType(
            String contentType
    ) {

        String normalized =
                contentType
                        .toLowerCase(Locale.ROOT)
                        .trim();


        if (normalized.equals("image/png")) {

            return "image/png";
        }


        if (normalized.equals("image/jpg")
                || normalized.equals("image/jpeg")) {

            return "image/jpeg";
        }


        if (normalized.equals("image/webp")) {

            return "image/webp";
        }


        if (normalized.equals("image/gif")) {

            return "image/gif";
        }


        throw new IllegalArgumentException(
                "Unsupported image type: "
                        + contentType
        );
    }


    // =========================================================
    // AI RESULT VALIDATION
    // =========================================================

    private void validateResult(
            AiIssueAnalysisResponse result
    ) {

        if (result == null) {

            throw new IllegalStateException(
                    "AI analysis result is null."
            );
        }


        if (result.category() == null) {

            throw new IllegalStateException(
                    "AI returned an invalid issue category."
            );
        }


        if (result.confidence() == null
                || result.confidence().isNaN()
                || result.confidence().isInfinite()
                || result.confidence() < 0.0
                || result.confidence() > 1.0) {

            throw new IllegalStateException(
                    "AI returned an invalid confidence score."
            );
        }


        if (result.severity() == null) {

            throw new IllegalStateException(
                    "AI returned an invalid severity."
            );
        }


        if (result.reason() == null
                || result.reason().isBlank()) {

            throw new IllegalStateException(
                    "AI returned an empty analysis reason."
            );
        }
    }
}