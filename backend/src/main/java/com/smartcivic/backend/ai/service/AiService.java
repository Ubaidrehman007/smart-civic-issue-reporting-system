package com.smartcivic.backend.ai.service;

import com.smartcivic.backend.ai.dto.AiChatRequest;

public interface AiService {

    String chat(AiChatRequest request);

}