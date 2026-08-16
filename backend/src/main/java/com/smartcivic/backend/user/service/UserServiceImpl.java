package com.smartcivic.backend.user.service;

import com.smartcivic.backend.user.dto.*;
import com.smartcivic.backend.user.entity.AccountStatus;
import com.smartcivic.backend.user.entity.Role;
import com.smartcivic.backend.user.entity.User;
import com.smartcivic.backend.user.exception.UserAlreadyExistsException;
import com.smartcivic.backend.user.exception.UserNotFoundException;
import com.smartcivic.backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void registerUser(RegisterUserRequest request) {

        if (userRepository.existsByEmail(request.email())) {
            throw new UserAlreadyExistsException("Email already exists");
        }

        if (userRepository.existsByPhoneNumber(request.phoneNumber())) {
            throw new UserAlreadyExistsException("Phone number already exists");
        }

        String passwordHash =
                passwordEncoder.encode(request.password());

        User user = new User(
                request.fullName(),
                request.email().trim().toLowerCase(),
                request.phoneNumber(),
                passwordHash,
                Role.CITIZEN
        );

        userRepository.save(user);
    }

    @Override
    public void updateAccountStatus(
            UUID userId,
            UpdateAccountStatusRequest request
    ) {

        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new UserNotFoundException("User not found")
                );

        user.setAccountStatus(request.accountStatus());

        userRepository.save(user);
    }

    @Override
    public void createFieldWorker(
            CreateFieldWorkerRequest request
    ) {

        if (userRepository.existsByEmail(request.email())) {
            throw new UserAlreadyExistsException("Email already exists");
        }

        if (userRepository.existsByPhoneNumber(request.phoneNumber())) {
            throw new UserAlreadyExistsException("Phone number already exists");
        }

        String passwordHash =
                passwordEncoder.encode(request.password());

        User fieldWorker = new User(
                request.fullName(),
                request.email().trim().toLowerCase(),
                request.phoneNumber(),
                passwordHash,
                Role.FIELD_WORKER
        );

        userRepository.save(fieldWorker);
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
    public void deleteUser(UUID userId) {

        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new UserNotFoundException("User not found")
                );

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
}