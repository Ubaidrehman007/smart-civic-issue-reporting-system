package com.smartcivic.backend.user.controller;

import com.smartcivic.backend.common.response.ApiResponse;
import com.smartcivic.backend.user.dto.CreateFieldWorkerRequest;
import com.smartcivic.backend.user.dto.RegisterUserRequest;
import com.smartcivic.backend.user.dto.UpdateAccountStatusRequest;
import com.smartcivic.backend.user.dto.UserResponse;
import com.smartcivic.backend.user.entity.AccountStatus;
import com.smartcivic.backend.user.entity.Role;
import com.smartcivic.backend.user.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
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


    @GetMapping
    public ResponseEntity<ApiResponse<List<UserResponse>>> getAllUsers(
            @RequestParam(required = false) Role role,
            @RequestParam(required = false) AccountStatus status
    ) {

        List<UserResponse> users =
                userService.getAllUsers(role, status);

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Users fetched successfully",
                        users
                )
        );
    }


    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<UserResponse>>> searchUsers(
            @RequestParam String keyword
    ) {

        List<UserResponse> users = userService.searchUsers(keyword);

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Users fetched successfully",
                        users
                )
        );
    }


}