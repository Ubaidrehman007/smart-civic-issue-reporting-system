package com.smartcivic.backend.user.service;

import com.smartcivic.backend.adminsettings.entity.AdminSettings;
import com.smartcivic.backend.adminsettings.repository.AdminSettingsRepository;
import com.smartcivic.backend.auth.entity.OtpPurpose;
import com.smartcivic.backend.auth.exception.InvalidCredentialsException;
import com.smartcivic.backend.auth.service.OtpService;
import com.smartcivic.backend.common.exception.ResourceNotFoundException;
import com.smartcivic.backend.user.dto.*;
import com.smartcivic.backend.user.entity.AccountStatus;
import com.smartcivic.backend.user.entity.Role;
import com.smartcivic.backend.user.entity.User;
import com.smartcivic.backend.user.exception.UserAlreadyExistsException;
import com.smartcivic.backend.user.exception.UserNotFoundException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import com.smartcivic.backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import com.smartcivic.backend.audit.entity.AuditAction;
import org.springframework.security.core.context.SecurityContextHolder;
import com.smartcivic.backend.audit.entity.AuditEntityType;
import com.smartcivic.backend.audit.service.AuditLogService;


import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final OtpService otpService;
    private final AuditLogService auditLogService;
    private final AdminSettingsRepository adminSettingsRepository;

    @Override
    @Transactional
    public void registerUser(RegisterUserRequest request) {

        // =====================================================
        // ADMIN SYSTEM CONTROLS
        // =====================================================

        AdminSettings settings =
                adminSettingsRepository
                        .findTopByOrderByCreatedAtAsc()
                        .orElseGet(() ->
                                adminSettingsRepository.save(
                                        AdminSettings.createDefault()
                                )
                        );

        // Maintenance Mode
        if (settings.isMaintenanceMode()) {

            throw new IllegalStateException(
                    "System is currently under maintenance. Please try again later."
            );
        }

        // New Citizen Registrations
        if (!settings.isAllowNewRegistrations()) {

            throw new IllegalStateException(
                    "New citizen registrations are currently disabled."
            );
        }


        // =====================================================
        // EXISTING REGISTRATION LOGIC
        // =====================================================

        String email =
                request.email()
                        .trim()
                        .toLowerCase();

        if (userRepository.existsByEmail(email)) {

            throw new UserAlreadyExistsException(
                    "Email already exists"
            );
        }

        if (userRepository.existsByPhoneNumber(
                request.phoneNumber()
        )) {

            throw new UserAlreadyExistsException(
                    "Phone number already exists"
            );
        }

        String passwordHash =
                passwordEncoder.encode(
                        request.password()
                );

        User user = new User(
                request.fullName(),
                email,
                request.phoneNumber(),
                passwordHash,
                Role.CITIZEN
        );

        user.setAccountStatus(
                AccountStatus.PENDING
        );

        user.setEmailVerified(false);

        userRepository.save(user);

        otpService.generateAndSendOtp(
                user,
                OtpPurpose.REGISTRATION
        );
    }

    @Override
    @Transactional
    public void updateAccountStatus(
            UUID userId,
            UpdateAccountStatusRequest request
    ) {

        // =====================================================
        // FIND LOGGED-IN ADMIN
        // =====================================================

        User currentUser = userRepository.findByEmail(
                SecurityContextHolder
                        .getContext()
                        .getAuthentication()
                        .getName()
        ).orElseThrow(() ->
                new UsernameNotFoundException(
                        "Authenticated admin not found"
                )
        );


        // =====================================================
        // FIND TARGET USER
        // =====================================================

        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new UserNotFoundException(
                                "User not found"
                        )
                );


        // =====================================================
        // GET OLD STATUS
        // =====================================================

        AccountStatus oldStatus =
                user.getAccountStatus();


        AccountStatus newStatus =
                request.accountStatus();


        // =====================================================
        // NO CHANGE VALIDATION
        // =====================================================

        if (oldStatus == newStatus) {

            throw new IllegalArgumentException(
                    "User already has account status: "
                            + newStatus
            );
        }


        // =====================================================
        // UPDATE ACCOUNT STATUS
        // =====================================================

        user.setAccountStatus(newStatus);

        User updatedUser =
                userRepository.save(user);


        // =====================================================
        // AUDIT LOG
        // =====================================================

        auditLogService.createAuditLog(

                currentUser,

                AuditAction.USER_STATUS_CHANGED,

                AuditEntityType.USER,

                updatedUser.getId(),

                "User account status changed for: "
                        + updatedUser.getFullName(),

                oldStatus.name(),

                newStatus.name(),

                null
        );
    }

    @Override
    @Transactional
    public void createFieldWorker(
            CreateFieldWorkerRequest request,
            String email
    ) {

        // =====================================================
        // FIND LOGGED-IN ADMIN
        // =====================================================

        User currentUser = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new UsernameNotFoundException(
                                "User not found with email: " + email
                        )
                );


        // =====================================================
        // VALIDATE EMAIL
        // =====================================================

        if (userRepository.existsByEmail(request.email())) {

            throw new UserAlreadyExistsException(
                    "Email already exists"
            );
        }


        // =====================================================
        // VALIDATE PHONE
        // =====================================================

        if (userRepository.existsByPhoneNumber(
                request.phoneNumber()
        )) {

            throw new UserAlreadyExistsException(
                    "Phone number already exists"
            );
        }


        // =====================================================
        // HASH PASSWORD
        // =====================================================

        String passwordHash =
                passwordEncoder.encode(
                        request.password()
                );


        // =====================================================
        // CREATE FIELD WORKER
        // =====================================================

        User fieldWorker = new User(
                request.fullName(),
                request.email().trim().toLowerCase(),
                request.phoneNumber(),
                passwordHash,
                Role.FIELD_WORKER
        );


        User savedFieldWorker =
                userRepository.save(fieldWorker);


        // =====================================================
        // AUDIT LOG
        // =====================================================

        auditLogService.createAuditLog(

                currentUser,

                AuditAction.USER_CREATED,

                AuditEntityType.USER,

                savedFieldWorker.getId(),

                "Field worker created: "
                        + savedFieldWorker.getFullName(),

                null,

                "name=" + savedFieldWorker.getFullName()
                        + ", email=" + savedFieldWorker.getEmail()
                        + ", phone=" + savedFieldWorker.getPhoneNumber()
                        + ", role=" + savedFieldWorker.getRole(),

                null
        );
    }

    @Override
    public List<UserResponse> getAllUsers(
            Role role,
            AccountStatus accountStatus
    ) {

        List<User> users;

        if (role != null && accountStatus != null) {

            users = userRepository.findByRoleAndAccountStatus(
                    role,
                    accountStatus
            );

        } else if (role != null) {

            users = userRepository.findByRole(role);

        } else if (accountStatus != null) {

            users = userRepository.findByAccountStatus(accountStatus);

        } else {

            users = userRepository.findAll();
        }

        return users.stream()
                .filter(user -> user.getRole() != Role.ADMIN)
                .map(this::mapToUserResponse)
                .toList();
    }

    @Override
    public List<UserResponse> searchUsers(String keyword) {

        return userRepository
                .findByFullNameContainingIgnoreCaseOrEmailContainingIgnoreCase(
                        keyword,
                        keyword
                )
                .stream()
                .filter(user -> user.getRole() != Role.ADMIN)
                .map(this::mapToUserResponse)
                .toList();
    }

    @Override
    public UserResponse getUserById(UUID userId) {

        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new UserNotFoundException("User not found")
                );

        return mapToUserResponse(user);
    }

    @Override
    @Transactional
    public void updateProfile(
            UUID userId,
            UpdateProfileRequest request
    ) {

        // =====================================================
        // FIND USER
        // =====================================================

        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new UserNotFoundException(
                                "User not found"
                        )
                );


        // =====================================================
        // CAPTURE OLD VALUES
        // =====================================================

        String oldFullName =
                user.getFullName();

        String oldPhoneNumber =
                user.getPhoneNumber();


        // =====================================================
        // VALIDATE PHONE NUMBER
        // =====================================================

        if (!user.getPhoneNumber().equals(request.phoneNumber())
                && userRepository.existsByPhoneNumber(
                request.phoneNumber()
        )) {

            throw new UserAlreadyExistsException(
                    "Phone number already exists"
            );
        }


        // =====================================================
        // UPDATE PROFILE
        // =====================================================

        user.setFullName(
                request.fullName()
        );

        user.setPhoneNumber(
                request.phoneNumber()
        );


        // =====================================================
        // SAVE UPDATED USER
        // =====================================================

        User updatedUser =
                userRepository.save(user);


        // =====================================================
        // AUDIT LOG
        // =====================================================

        auditLogService.createAuditLog(

                updatedUser,

                AuditAction.USER_UPDATED,

                AuditEntityType.USER,

                updatedUser.getId(),

                "User profile updated: "
                        + updatedUser.getFullName(),

                "fullName=" + oldFullName
                        + ", phoneNumber=" + oldPhoneNumber,

                "fullName=" + updatedUser.getFullName()
                        + ", phoneNumber=" + updatedUser.getPhoneNumber(),

                null
        );
    }

    @Override
    public UserResponse getUserByEmail(String email) {

        User user = userRepository.findByEmail(
                email.trim().toLowerCase()
        ).orElseThrow(() ->
                new UserNotFoundException("User not found")
        );

        return mapToUserResponse(user);
    }

    @Override
    public DashboardStatsResponse getDashboardStats() {

        long totalUsers = userRepository.count();

        long totalCitizens =
                userRepository.countByRole(Role.CITIZEN);

        long totalFieldWorkers =
                userRepository.countByRole(Role.FIELD_WORKER);

        long activeUsers =
                userRepository.countByAccountStatus(
                        AccountStatus.ACTIVE
                );

        long suspendedUsers =
                userRepository.countByAccountStatus(
                        AccountStatus.SUSPENDED
                );

        return new DashboardStatsResponse(
                totalUsers,
                totalCitizens,
                totalFieldWorkers,
                activeUsers,
                suspendedUsers
        );
    }

    @Override
    @Transactional
    public void deleteUser(UUID userId) {

        // =====================================================
        // FIND LOGGED-IN ADMIN
        // =====================================================

        User currentUser = userRepository.findByEmail(
                SecurityContextHolder
                        .getContext()
                        .getAuthentication()
                        .getName()
        ).orElseThrow(() ->
                new UsernameNotFoundException(
                        "Authenticated admin not found"
                )
        );


        // =====================================================
        // FIND TARGET USER
        // =====================================================

        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new UserNotFoundException(
                                "User not found"
                        )
                );


        // =====================================================
        // CAPTURE USER INFORMATION BEFORE DELETE
        // =====================================================

        UUID deletedUserId =
                user.getId();

        String deletedUserName =
                user.getFullName();

        String deletedUserEmail =
                user.getEmail();

        String deletedUserRole =
                user.getRole().name();


        // =====================================================
        // CREATE AUDIT LOG BEFORE DELETE
        // =====================================================

        auditLogService.createAuditLog(

                currentUser,

                AuditAction.USER_DELETED,

                AuditEntityType.USER,

                deletedUserId,

                "User deleted: "
                        + deletedUserName,

                "name=" + deletedUserName
                        + ", email=" + deletedUserEmail
                        + ", role=" + deletedUserRole,

                null,

                null
        );


        // =====================================================
        // DELETE USER
        // =====================================================

        userRepository.delete(user);
    }

    private UserResponse mapToUserResponse(User user) {

        return new UserResponse(
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getPhoneNumber(),
                user.getRole(),
                user.getAccountStatus(),
                user.getCreatedAt()
        );
    }

    @Override
    @Transactional
    public void deleteMyAccount(String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new UserNotFoundException(
                                "User account not found"
                        )
                );

        userRepository.delete(user);
    }


    @Override
    public void changePassword(
            String email,
            ChangePasswordRequest request
    ) {

        User user = userRepository.findByEmail(
                email.trim().toLowerCase()
        ).orElseThrow(() ->
                new UserNotFoundException("User not found")
        );

        boolean currentPasswordMatches =
                passwordEncoder.matches(
                        request.currentPassword(),
                        user.getPasswordHash()
                );

        if (!currentPasswordMatches) {

            throw new InvalidCredentialsException(
                    "Please enter a valid current password"
            );
        }

        if (passwordEncoder.matches(
                request.newPassword(),
                user.getPasswordHash()
        )) {

            throw new IllegalArgumentException(
                    "New password must be different from your current password"
            );
        }

        user.setPasswordHash(
                passwordEncoder.encode(
                        request.newPassword()
                )
        );

        userRepository.save(user);
    }

}