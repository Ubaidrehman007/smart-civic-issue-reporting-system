package com.smartcivic.backend.auth.service;

import com.smartcivic.backend.auth.entity.OtpPurpose;
import com.smartcivic.backend.user.entity.User;

public interface OtpService {

    void generateAndSendOtp(
            User user,
            OtpPurpose purpose
    );

    boolean verifyOtp(
            User user,
            OtpPurpose purpose,
            String otp
    );
}