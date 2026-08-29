package com.smartcivic.backend.user.service;

import com.smartcivic.backend.user.dto.*;
import com.smartcivic.backend.user.entity.AccountStatus;
import com.smartcivic.backend.user.entity.Role;

import java.util.List;
import java.util.UUID;

public interface UserService {

    void registerUser(RegisterUserRequest request);

    void updateAccountStatus(
            UUID userId,
            UpdateAccountStatusRequest request
    );

    void createFieldWorker(
            CreateFieldWorkerRequest request,
            String email
    );

    List<UserResponse> getAllUsers(
            Role role,
            AccountStatus accountStatus
    );

    List<UserResponse> searchUsers(
            String keyword
    );

    UserResponse getUserById(
            UUID userId
    );
    UserResponse getUserByEmail(
            String email
    );

    DashboardStatsResponse getDashboardStats();

    void deleteUser(UUID userId);

    void updateProfile(
            UUID userId,
            UpdateProfileRequest request
    );

    void changePassword(
            String email,
            ChangePasswordRequest request
    );
}

