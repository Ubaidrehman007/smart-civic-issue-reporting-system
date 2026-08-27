package com.smartcivic.backend.auth.repository;

import com.smartcivic.backend.auth.entity.EmailOtp;
import com.smartcivic.backend.auth.entity.OtpPurpose;
import com.smartcivic.backend.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface EmailOtpRepository
        extends JpaRepository<EmailOtp, UUID> {

    Optional<EmailOtp> findTopByUserAndPurposeOrderByCreatedAtDesc(
            User user,
            OtpPurpose purpose
    );

    List<EmailOtp> findByUserAndPurpose(
            User user,
            OtpPurpose purpose
    );

    void deleteByUserAndPurpose(
            User user,
            OtpPurpose purpose
    );
}