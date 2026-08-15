package com.smartcivic.backend.user.controller;

import com.smartcivic.backend.common.response.ApiResponse;
import com.smartcivic.backend.user.dto.CreateFieldWorkerRequest;
import com.smartcivic.backend.user.dto.RegisterUserRequest;
import com.smartcivic.backend.user.dto.UpdateAccountStatusRequest;
import com.smartcivic.backend.user.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<Void>> registerUser(
            @Valid @RequestBody RegisterUserRequest request) {

        userService.registerUser(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(
                        ApiResponse.success(
                                "User registered successfully",
                                null
                        )
                );
    }


    @PostMapping("/field-workers")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> createFieldWorker(
            @Valid @RequestBody CreateFieldWorkerRequest request) {

        userService.createFieldWorker(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(
                        ApiResponse.success(
                                "Field worker created successfully",
                                null
                        )
                );
    }


    @PatchMapping("/{userId}/account-status")
    public ResponseEntity<Void> updateAccountStatus(
            @PathVariable UUID userId,
            @Valid @RequestBody UpdateAccountStatusRequest request
    ) {

        userService.updateAccountStatus(userId, request);

        return ResponseEntity.noContent().build();
    }


}