package com.smartcivic.backend.user.service;

import com.smartcivic.backend.user.dto.CreateFieldWorkerRequest;
import com.smartcivic.backend.user.dto.UpdateAccountStatusRequest;
import com.smartcivic.backend.user.dto.UserResponse;
import com.smartcivic.backend.user.entity.AccountStatus;
import com.smartcivic.backend.user.entity.Role;
import com.smartcivic.backend.user.entity.User;
import com.smartcivic.backend.user.dto.RegisterUserRequest;
import com.smartcivic.backend.user.exception.UserAlreadyExistsException;
import com.smartcivic.backend.user.exception.UserNotFoundException;
import com.smartcivic.backend.user.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class UserService {


    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }



    public void registerUser(RegisterUserRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new UserAlreadyExistsException("Email already exists");
        }
        if (userRepository.existsByPhoneNumber(request.phoneNumber())) {
            throw new UserAlreadyExistsException("Phone number already exists");
        }

        String passwordHash = passwordEncoder.encode(request.password());

        User user = new User(
                request.fullName(),
                request.email().trim().toLowerCase(),
                request.phoneNumber(),
                passwordHash,
                Role.CITIZEN);

        userRepository.save(user);
    }


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


    public void createFieldWorker(CreateFieldWorkerRequest request) {

        if (userRepository.existsByEmail(request.email())) {
            throw new UserAlreadyExistsException("Email already exists");
        }

        if (userRepository.existsByPhoneNumber(request.phoneNumber())) {
            throw new UserAlreadyExistsException("Phone number already exists");
        }

        String passwordHash = passwordEncoder.encode(request.password());

        User fieldWorker = new User(
                request.fullName(),
                request.email().trim().toLowerCase(),
                request.phoneNumber(),
                passwordHash,
                Role.FIELD_WORKER
        );

        userRepository.save(fieldWorker);
    }

    public List<UserResponse> getAllUsers(
            Role role,
            AccountStatus accountStatus
    ) {

        List<User> users;

        if (role != null && accountStatus != null) {

            users = userRepository
                    .findByRoleAndAccountStatus(
                            role,
                            accountStatus
                    );

        } else if (role != null) {

            users = userRepository.findByRole(role);

        } else if (accountStatus != null) {

            users = userRepository
                    .findByAccountStatus(accountStatus);

        } else {

            users = userRepository.findAll();
        }

        return users.stream()
                .map(user -> new UserResponse(
                        user.getId(),
                        user.getFullName(),
                        user.getEmail(),
                        user.getPhoneNumber(),
                        user.getRole(),
                        user.getAccountStatus(),
                        user.getCreatedAt()
                ))
                .toList();
    }


}
