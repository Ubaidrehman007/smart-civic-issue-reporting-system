package com.smartcivic.backend.auth.service;

import com.smartcivic.backend.auth.dto.LoginRequest;
import com.smartcivic.backend.auth.dto.LoginResponse;
import com.smartcivic.backend.auth.exception.InvalidCredentialsException;
import com.smartcivic.backend.auth.security.JwtService;
import com.smartcivic.backend.user.entity.User;
import com.smartcivic.backend.user.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthenticationService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthenticationService(UserRepository userRepository,
                                 PasswordEncoder passwordEncoder,
                                 JwtService jwtService) {

        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    public LoginResponse login(LoginRequest request) {

        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() ->
                        new InvalidCredentialsException("Invalid email or password"));

        boolean passwordMatches = passwordEncoder.matches(
                request.password(),
                user.getPasswordHash()
        );

        if (!passwordMatches) {
            throw new InvalidCredentialsException("Invalid email or password");
        }

        String token = jwtService.generateToken(user.getEmail());

        return new LoginResponse(
                token,
                "Bearer"
        );
    }
}