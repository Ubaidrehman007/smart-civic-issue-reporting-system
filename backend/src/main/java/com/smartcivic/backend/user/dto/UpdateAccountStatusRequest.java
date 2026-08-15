package com.smartcivic.backend.user.dto;

import com.smartcivic.backend.user.entity.AccountStatus;
import jakarta.validation.constraints.NotNull;

public record UpdateAccountStatusRequest(

        @NotNull(message = "Account status is required")
        AccountStatus accountStatus

) {
}