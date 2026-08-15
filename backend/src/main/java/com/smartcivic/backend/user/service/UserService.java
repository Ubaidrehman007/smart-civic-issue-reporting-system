package com.smartcivic.backend.user.service;

import com.smartcivic.backend.user.entity.Role;
import com.smartcivic.backend.user.entity.User;
import com.smartcivic.backend.user.dto.RegisterUserRequest;
import com.smartcivic.backend.user.exception.UserAlreadyExistsException;
import com.smartcivic.backend.user.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

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


}
