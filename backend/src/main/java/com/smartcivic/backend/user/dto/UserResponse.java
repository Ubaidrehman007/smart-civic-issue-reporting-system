package com.smartcivic.backend.user.dto;

import com.smartcivic.backend.user.entity.AccountStatus;
import com.smartcivic.backend.user.entity.Role;

import java.time.Instant;
import java.util.UUID;

public record UserResponse(

        UUID id,

        String fullName,

        String email,

        String phoneNumber,

        Role role,

        AccountStatus accountStatus,

        Instant createdAt
) {
}