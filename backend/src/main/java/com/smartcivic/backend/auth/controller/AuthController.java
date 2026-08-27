package com.smartcivic.backend.auth.controller;

import com.smartcivic.backend.auth.dto.ForgotPasswordRequest;
import com.smartcivic.backend.auth.dto.LoginRequest;
import com.smartcivic.backend.auth.dto.LoginResponse;
import com.smartcivic.backend.auth.dto.ResetPasswordRequest;
import com.smartcivic.backend.auth.dto.VerifyRegistrationOtpRequest;
import com.smartcivic.backend.auth.service.AuthenticationService;
import com.smartcivic.backend.common.response.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final AuthenticationService authenticationService;

    public AuthController(
            AuthenticationService authenticationService
    ) {

        this.authenticationService =
                authenticationService;
    }


    // =====================================================
    // LOGIN
    // =====================================================

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<LoginResponse>> login(
            @Valid @RequestBody LoginRequest request
    ) {

        LoginResponse response =
                authenticationService.login(request);

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Login successful",
                        response
                )
        );
    }


    // =====================================================
    // VERIFY REGISTRATION OTP
    // =====================================================

    @PostMapping("/verify-registration-otp")
    public ResponseEntity<ApiResponse<Void>>
    verifyRegistrationOtp(
            @Valid
            @RequestBody VerifyRegistrationOtpRequest request
    ) {

        authenticationService.verifyRegistrationOtp(
                request
        );

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Email verified successfully. Your account is now active.",
                        null
                )
        );
    }


    // =====================================================
    // FORGOT PASSWORD
    // =====================================================

    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse<Void>>
    forgotPassword(
            @Valid
            @RequestBody ForgotPasswordRequest request
    ) {

        authenticationService.forgotPassword(
                request
        );

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Password reset OTP sent to your email.",
                        null
                )
        );
    }


    // =====================================================
    // RESET PASSWORD
    // =====================================================

    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse<Void>>
    resetPassword(
            @Valid
            @RequestBody ResetPasswordRequest request
    ) {

        authenticationService.resetPassword(
                request
        );

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Password reset successfully.",
                        null
                )
        );
    }

    @PostMapping("/resend-registration-otp")
    public ResponseEntity<ApiResponse<Void>> resendRegistrationOtp(
            @RequestParam String email
    ) {

        authenticationService.resendRegistrationOtp(email);

        return ResponseEntity.ok(
                ApiResponse.success(
                        "A new registration OTP has been sent to your email.",
                        null
                )
        );
    }

}