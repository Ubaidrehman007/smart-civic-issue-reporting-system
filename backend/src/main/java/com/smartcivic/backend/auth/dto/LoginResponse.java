package com.smartcivic.backend.auth.dto;

public record LoginResponse(
        String token,
        String type) {


}
