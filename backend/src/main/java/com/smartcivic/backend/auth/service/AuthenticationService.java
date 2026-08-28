package com.smartcivic.backend.auth.service;

import com.smartcivic.backend.auth.dto.ForgotPasswordRequest;
import com.smartcivic.backend.auth.dto.LoginRequest;
import com.smartcivic.backend.auth.dto.LoginResponse;
import com.smartcivic.backend.auth.dto.ResetPasswordRequest;
import com.smartcivic.backend.auth.dto.VerifyRegistrationOtpRequest;
import com.smartcivic.backend.auth.entity.EmailOtp;
import com.smartcivic.backend.auth.entity.OtpPurpose;
import com.smartcivic.backend.auth.exception.InvalidCredentialsException;
import com.smartcivic.backend.auth.repository.EmailOtpRepository;
import com.smartcivic.backend.auth.security.JwtService;
import com.smartcivic.backend.notification.service.NotificationService;
import com.smartcivic.backend.notification.entity.NotificationType;
import com.smartcivic.backend.user.entity.AccountStatus;
import com.smartcivic.backend.user.entity.Role;
import com.smartcivic.backend.user.entity.User;
import com.smartcivic.backend.user.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;
import java.util.List;



@Service
public class AuthenticationService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final OtpService otpService;
    private final EmailOtpRepository emailOtpRepository;
    private final NotificationService notificationService;

    public AuthenticationService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            OtpService otpService,
            EmailOtpRepository emailOtpRepository,
            NotificationService notificationService
    ) {

        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.otpService = otpService;
        this.emailOtpRepository = emailOtpRepository;
        this.notificationService = notificationService;
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

        // =====================================================
// ADMIN NOTIFICATION — NEW CITIZEN REGISTERED
// =====================================================

        List<User> admins =
                userRepository.findByRole(Role.ADMIN);

        for (User admin : admins) {

            notificationService.createNotification(
                    admin,
                    NotificationType.NEW_CITIZEN_REGISTERED,
                    "New Citizen Registered",
                    "A new citizen has joined Smart Civic.",
                    user.getId()
            );
        }

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

    @Transactional
    public void resendRegistrationOtp(String email) {

        String normalizedEmail =
                email.trim().toLowerCase();

        User user =
                userRepository.findByEmail(normalizedEmail)
                        .orElseThrow(() ->
                                new InvalidCredentialsException(
                                        "Invalid email"
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

        EmailOtp latestOtp =
                emailOtpRepository
                        .findTopByUserAndPurposeOrderByCreatedAtDesc(
                                user,
                                OtpPurpose.REGISTRATION
                        )
                        .orElse(null);

        if (latestOtp != null) {

            Instant now = Instant.now();

            Instant nextAllowedTime =
                    latestOtp.getCreatedAt()
                            .plusSeconds(60);

            if (now.isBefore(nextAllowedTime)) {

                long remainingSeconds =
                        Duration.between(
                                now,
                                nextAllowedTime
                        ).getSeconds();

                throw new InvalidCredentialsException(
                        "Please wait "
                                + remainingSeconds
                                + " seconds before requesting another OTP."
                );
            }
        }

        otpService.generateAndSendOtp(
                user,
                OtpPurpose.REGISTRATION
        );
    }

}