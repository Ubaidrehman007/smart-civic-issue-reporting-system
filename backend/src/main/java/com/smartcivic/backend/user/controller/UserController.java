package com.smartcivic.backend.user.controller;

import com.smartcivic.backend.common.response.ApiResponse;
import com.smartcivic.backend.user.dto.*;
import com.smartcivic.backend.user.entity.AccountStatus;
import com.smartcivic.backend.user.entity.Role;
import com.smartcivic.backend.user.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
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
                                "Registration initiated. Please check your email for the verification OTP.",
                                null
                        )
                );
    }


    @PostMapping("/field-workers")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> createFieldWorker(
            @Valid @RequestBody CreateFieldWorkerRequest request,
            Authentication authentication) {

        userService.createFieldWorker(
                request,
                authentication.getName()
        );

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

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserResponse>> getCurrentUser(
            Authentication authentication
    ) {

        String email = authentication.getName();

        UserResponse user =
                userService.getUserByEmail(email);

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Current user fetched successfully",
                        user
                )
        );
    }


    @GetMapping("/{userId}")
    public ResponseEntity<ApiResponse<UserResponse>> getUserById(
            @PathVariable UUID userId
    ) {

        UserResponse user = userService.getUserById(userId);

        return ResponseEntity.ok(
                ApiResponse.success(
                        "User fetched successfully",
                        user
                )
        );
    }

    @PutMapping("/{userId}/profile")
    public ResponseEntity<ApiResponse<Void>> updateProfile(
            @PathVariable UUID userId,
            @Valid @RequestBody UpdateProfileRequest request
    ) {

        userService.updateProfile(userId, request);

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Profile updated successfully",
                        null
                )
        );
    }

    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<DashboardStatsResponse>> getDashboardStats() {

        DashboardStatsResponse stats = userService.getDashboardStats();

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Dashboard statistics fetched successfully",
                        stats
                )
        );
    }

    @DeleteMapping("/{userId}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteUser(
            @PathVariable UUID userId
    ) {

        userService.deleteUser(userId);

        return ResponseEntity.ok(
                ApiResponse.success(
                        "User deleted successfully",
                        null
                )
        );
    }

    @DeleteMapping("/me")
    @PreAuthorize("hasAuthority('CITIZEN')")
    public ResponseEntity<ApiResponse<Void>> deleteMyAccount(
            Authentication authentication
    ) {

        String email = authentication.getName();

        userService.deleteMyAccount(email);

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Your account has been deleted successfully",
                        null
                )
        );
    }

    @PutMapping("/me/password")
    public ResponseEntity<ApiResponse<Void>> changePassword(
            Authentication authentication,
            @Valid @RequestBody ChangePasswordRequest request
    ) {

        String email = authentication.getName();

        userService.changePassword(email, request);

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Password changed successfully",
                        null
                )
        );
    }



}