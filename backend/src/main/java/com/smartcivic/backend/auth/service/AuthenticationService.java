package com.smartcivic.backend.auth.service;

import com.smartcivic.backend.auth.dto.ForgotPasswordRequest;
import com.smartcivic.backend.auth.dto.LoginRequest;
import com.smartcivic.backend.auth.dto.LoginResponse;
import com.smartcivic.backend.auth.dto.ResetPasswordRequest;
import com.smartcivic.backend.auth.dto.VerifyRegistrationOtpRequest;
import com.smartcivic.backend.auth.entity.OtpPurpose;
import com.smartcivic.backend.auth.exception.InvalidCredentialsException;
import com.smartcivic.backend.auth.security.JwtService;
import com.smartcivic.backend.user.entity.AccountStatus;
import com.smartcivic.backend.user.entity.Role;
import com.smartcivic.backend.user.entity.User;
import com.smartcivic.backend.user.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthenticationService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final OtpService otpService;

    public AuthenticationService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            OtpService otpService
    ) {

        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.otpService = otpService;
    }


    // =====================================================
    // LOGIN
    // =====================================================

    public LoginResponse login(LoginRequest request) {

        String email =
                request.email()
                        .trim()
                        .toLowerCase();

        User user =
                userRepository.findByEmail(email)
                        .orElseThrow(() ->
                                new InvalidCredentialsException(
                                        "Invalid email or password"
                                )
                        );

        if (user.getAccountStatus() != AccountStatus.ACTIVE) {

            throw new InvalidCredentialsException(
                    "Your account is not active"
            );
        }

        boolean passwordMatches =
                passwordEncoder.matches(
                        request.password(),
                        user.getPasswordHash()
                );

        if (!passwordMatches) {

            throw new InvalidCredentialsException(
                    "Invalid email or password"
            );
        }

        String token =
                jwtService.generateToken(
                        user.getEmail()
                );

        return new LoginResponse(
                token,
                "Bearer"
        );
    }


    // =====================================================
    // REGISTRATION OTP VERIFICATION
    // =====================================================

    @Transactional
    public void verifyRegistrationOtp(
            VerifyRegistrationOtpRequest request
    ) {

        String email =
                request.email()
                        .trim()
                        .toLowerCase();

        User user =
                userRepository.findByEmail(email)
                        .orElseThrow(() ->
                                new InvalidCredentialsException(
                                        "Invalid email or OTP"
                                )
                        );

        if (user.getRole() != Role.CITIZEN) {

            throw new InvalidCredentialsException(
                    "Registration verification is only available for citizens"
            );
        }

        if (user.getAccountStatus() != AccountStatus.PENDING) {

            throw new InvalidCredentialsException(
                    "This account does not require registration verification"
            );
        }

        boolean verified =
                otpService.verifyOtp(
                        user,
                        OtpPurpose.REGISTRATION,
                        request.otp()
                );

        if (!verified) {

            throw new InvalidCredentialsException(
                    "Invalid or expired OTP"
            );
        }

        user.setEmailVerified(true);
        user.setAccountStatus(AccountStatus.ACTIVE);

        userRepository.save(user);
    }


    // =====================================================
    // FORGOT PASSWORD
    // =====================================================

    @Transactional
    public void forgotPassword(
            ForgotPasswordRequest request
    ) {

        String email =
                request.email()
                        .trim()
                        .toLowerCase();

        User user =
                userRepository.findByEmail(email)
                        .orElseThrow(() ->
                                new InvalidCredentialsException(
                                        "No account found with this email"
                                )
                        );

        /*
         * Only active accounts can reset passwords.
         */
        if (user.getAccountStatus() != AccountStatus.ACTIVE) {

            throw new InvalidCredentialsException(
                    "Your account is not active"
            );
        }

        /*
         * Password reset OTP.
         */
        otpService.generateAndSendOtp(
                user,
                OtpPurpose.PASSWORD_RESET
        );
    }


    // =====================================================
    // RESET PASSWORD
    // =====================================================

    @Transactional
    public void resetPassword(
            ResetPasswordRequest request
    ) {

        String email =
                request.email()
                        .trim()
                        .toLowerCase();

        User user =
                userRepository.findByEmail(email)
                        .orElseThrow(() ->
                                new InvalidCredentialsException(
                                        "Invalid email or OTP"
                                )
                        );

        if (user.getAccountStatus() != AccountStatus.ACTIVE) {

            throw new InvalidCredentialsException(
                    "Your account is not active"
            );
        }

        /*
         * Verify password reset OTP.
         */
        boolean verified =
                otpService.verifyOtp(
                        user,
                        OtpPurpose.PASSWORD_RESET,
                        request.otp()
                );

        if (!verified) {

            throw new InvalidCredentialsException(
                    "Invalid or expired OTP"
            );
        }

        /*
         * Never store raw password.
         */
        String passwordHash =
                passwordEncoder.encode(
                        request.newPassword()
                );

        user.setPasswordHash(passwordHash);

        userRepository.save(user);
    }
}