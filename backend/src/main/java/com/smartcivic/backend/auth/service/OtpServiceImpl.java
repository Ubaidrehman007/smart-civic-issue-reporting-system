package com.smartcivic.backend.auth.service;

import com.smartcivic.backend.auth.entity.EmailOtp;
import com.smartcivic.backend.auth.entity.OtpPurpose;
import com.smartcivic.backend.auth.repository.EmailOtpRepository;
import com.smartcivic.backend.user.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.Instant;

@Service
@RequiredArgsConstructor
public class OtpServiceImpl implements OtpService {

    private static final int OTP_EXPIRY_MINUTES = 10;

    private static final int MAX_ATTEMPTS = 5;

    private final EmailOtpRepository emailOtpRepository;

    private final EmailService emailService;

    private final PasswordEncoder passwordEncoder;

    private final SecureRandom secureRandom =
            new SecureRandom();


    @Override
    @Transactional
    public void generateAndSendOtp(
            User user,
            OtpPurpose purpose
    ) {

        /*
         * Invalidate previous OTPs for this
         * user and purpose.
         */
        emailOtpRepository.deleteByUserAndPurpose(
                user,
                purpose
        );


        /*
         * Generate a secure 6-digit OTP.
         */
        String otp = String.format(
                "%06d",
                secureRandom.nextInt(1_000_000)
        );


        /*
         * Never store the raw OTP.
         */
        String otpHash =
                passwordEncoder.encode(otp);


        /*
         * OTP remains valid for 10 minutes.
         */
        Instant expiresAt =
                Instant.now()
                        .plusSeconds(
                                OTP_EXPIRY_MINUTES * 60L
                        );


        EmailOtp emailOtp =
                EmailOtp.builder()
                        .user(user)
                        .email(user.getEmail())
                        .otpHash(otpHash)
                        .purpose(purpose)
                        .expiresAt(expiresAt)
                        .attempts(0)
                        .build();


        emailOtpRepository.save(emailOtp);


        /*
         * Prepare branded HTML email.
         */
        String subject;

        String htmlBody;


        if (purpose == OtpPurpose.REGISTRATION) {

            subject =
                    "Smart Civic - Verify your email";

            htmlBody =
                    buildRegistrationEmail(
                            user.getFullName(),
                            otp
                    );

        } else {

            subject =
                    "Smart Civic - Password reset verification";

            htmlBody =
                    buildPasswordResetEmail(
                            user.getFullName(),
                            otp
                    );
        }


        emailService.sendEmail(
                user.getEmail(),
                subject,
                htmlBody
        );
    }


    @Override
    @Transactional
    public boolean verifyOtp(
            User user,
            OtpPurpose purpose,
            String otp
    ) {

        EmailOtp emailOtp =
                emailOtpRepository
                        .findTopByUserAndPurposeOrderByCreatedAtDesc(
                                user,
                                purpose
                        )
                        .orElse(null);


        if (emailOtp == null) {
            return false;
        }


        /*
         * OTP cannot be reused.
         */
        if (emailOtp.getVerifiedAt() != null) {
            return false;
        }


        /*
         * OTP has expired.
         */
        if (Instant.now().isAfter(
                emailOtp.getExpiresAt()
        )) {
            return false;
        }


        /*
         * Prevent unlimited guessing attempts.
         */
        if (emailOtp.getAttempts() >= MAX_ATTEMPTS) {
            return false;
        }


        /*
         * Count every verification attempt.
         */
        emailOtp.setAttempts(
                emailOtp.getAttempts() + 1
        );


        boolean matches =
                passwordEncoder.matches(
                        otp,
                        emailOtp.getOtpHash()
                );


        if (!matches) {

            emailOtpRepository.save(emailOtp);

            return false;
        }


        /*
         * Mark OTP as consumed.
         */
        emailOtp.setVerifiedAt(
                Instant.now()
        );

        emailOtpRepository.save(emailOtp);

        return true;
    }


    /*
     * =====================================================
     * REGISTRATION EMAIL
     * =====================================================
     */

    private String buildRegistrationEmail(
            String fullName,
            String otp
    ) {

        return """
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta
                        name="viewport"
                        content="width=device-width, initial-scale=1.0"
                    >
                    <title>Verify your email</title>
                </head>

                <body style="
                    margin:0;
                    padding:0;
                    background:#f4f7fb;
                    font-family:Arial,Helvetica,sans-serif;
                    color:#172033;
                ">

                <table
                    width="100%%"
                    cellpadding="0"
                    cellspacing="0"
                    border="0"
                    style="background:#f4f7fb;padding:40px 15px;"
                >

                    <tr>

                        <td align="center">

                            <table
                                width="100%%"
                                cellpadding="0"
                                cellspacing="0"
                                border="0"
                                style="
                                    max-width:600px;
                                    background:#ffffff;
                                    border-radius:16px;
                                    overflow:hidden;
                                    box-shadow:0 8px 30px rgba(23,32,51,0.08);
                                "
                            >

                                <!-- HEADER -->

                                <tr>

                                    <td style="
                                        background:#172033;
                                        padding:28px 30px;
                                        text-align:center;
                                    ">

                                        <div style="
                                            color:#ffffff;
                                            font-size:24px;
                                            font-weight:700;
                                            letter-spacing:0.5px;
                                        ">
                                            SMART CIVIC
                                        </div>

                                        <div style="
                                            color:#b9c3d4;
                                            font-size:12px;
                                            margin-top:6px;
                                        ">
                                            Smart Civic Reporting System
                                        </div>

                                    </td>

                                </tr>


                                <!-- CONTENT -->

                                <tr>

                                    <td style="
                                        padding:40px 35px;
                                    ">

                                        <h1 style="
                                            margin:0 0 12px;
                                            font-size:25px;
                                            line-height:1.3;
                                            color:#172033;
                                        ">
                                            Verify your email
                                        </h1>


                                        <p style="
                                            margin:0 0 20px;
                                            font-size:15px;
                                            line-height:1.7;
                                            color:#667085;
                                        ">
                                            Hello %s,
                                        </p>


                                        <p style="
                                            margin:0 0 25px;
                                            font-size:14px;
                                            line-height:1.7;
                                            color:#667085;
                                        ">
                                            Thanks for creating your Smart Civic
                                            account. Please use the verification
                                            code below to complete your
                                            registration.
                                        </p>


                                        <!-- OTP BOX -->

                                        <table
                                            width="100%%"
                                            cellpadding="0"
                                            cellspacing="0"
                                            border="0"
                                        >

                                            <tr>

                                                <td align="center">

                                                    <div style="
                                                        background:#f0f4ff;
                                                        border:1px solid #dbe4ff;
                                                        border-radius:12px;
                                                        padding:22px;
                                                        text-align:center;
                                                    ">

                                                        <div style="
                                                            color:#667085;
                                                            font-size:11px;
                                                            font-weight:600;
                                                            letter-spacing:1.5px;
                                                            text-transform:uppercase;
                                                            margin-bottom:10px;
                                                        ">
                                                            Verification Code
                                                        </div>

                                                        <div style="
                                                            color:#172033;
                                                            font-size:34px;
                                                            font-weight:700;
                                                            letter-spacing:8px;
                                                        ">
                                                            %s
                                                        </div>

                                                    </div>

                                                </td>

                                            </tr>

                                        </table>


                                        <p style="
                                            margin:25px 0 8px;
                                            font-size:13px;
                                            color:#667085;
                                            text-align:center;
                                        ">
                                            This code expires in
                                            <strong>10 minutes</strong>.
                                        </p>


                                        <p style="
                                            margin:0;
                                            font-size:12px;
                                            line-height:1.6;
                                            color:#98a2b3;
                                            text-align:center;
                                        ">
                                            For your security, never share
                                            this code with anyone.
                                        </p>


                                        <!-- SECURITY NOTICE -->

                                        <div style="
                                            margin-top:30px;
                                            padding:15px 16px;
                                            background:#fafafa;
                                            border-radius:10px;
                                            border:1px solid #eaecf0;
                                        ">

                                            <p style="
                                                margin:0;
                                                font-size:12px;
                                                line-height:1.6;
                                                color:#667085;
                                            ">
                                                If you did not create a Smart
                                                Civic account, you can safely
                                                ignore this email.
                                            </p>

                                        </div>

                                    </td>

                                </tr>


                                <!-- FOOTER -->

                                <tr>

                                    <td style="
                                        border-top:1px solid #eaecf0;
                                        padding:22px 30px;
                                        text-align:center;
                                        background:#fafbfc;
                                    ">

                                        <div style="
                                            font-size:12px;
                                            color:#667085;
                                        ">
                                            Smart Civic Team
                                        </div>

                                        <div style="
                                            margin-top:5px;
                                            font-size:11px;
                                            color:#98a2b3;
                                        ">
                                            Smart Civic Reporting System
                                        </div>

                                    </td>

                                </tr>

                            </table>

                        </td>

                    </tr>

                </table>

                </body>
                </html>
                """.formatted(
                escapeHtml(fullName),
                otp
        );
    }


    /*
     * =====================================================
     * PASSWORD RESET EMAIL
     * =====================================================
     */

    private String buildPasswordResetEmail(
            String fullName,
            String otp
    ) {

        return """
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta
                        name="viewport"
                        content="width=device-width, initial-scale=1.0"
                    >
                    <title>Password reset</title>
                </head>

                <body style="
                    margin:0;
                    padding:0;
                    background:#f4f7fb;
                    font-family:Arial,Helvetica,sans-serif;
                    color:#172033;
                ">

                <table
                    width="100%%"
                    cellpadding="0"
                    cellspacing="0"
                    border="0"
                    style="background:#f4f7fb;padding:40px 15px;"
                >

                    <tr>

                        <td align="center">

                            <table
                                width="100%%"
                                cellpadding="0"
                                cellspacing="0"
                                border="0"
                                style="
                                    max-width:600px;
                                    background:#ffffff;
                                    border-radius:16px;
                                    overflow:hidden;
                                    box-shadow:0 8px 30px rgba(23,32,51,0.08);
                                "
                            >

                                <!-- HEADER -->

                                <tr>

                                    <td style="
                                        background:#172033;
                                        padding:28px 30px;
                                        text-align:center;
                                    ">

                                        <div style="
                                            color:#ffffff;
                                            font-size:24px;
                                            font-weight:700;
                                            letter-spacing:0.5px;
                                        ">
                                            SMART CIVIC
                                        </div>

                                        <div style="
                                            color:#b9c3d4;
                                            font-size:12px;
                                            margin-top:6px;
                                        ">
                                            Smart Civic Reporting System
                                        </div>

                                    </td>

                                </tr>


                                <!-- CONTENT -->

                                <tr>

                                    <td style="
                                        padding:40px 35px;
                                    ">

                                        <h1 style="
                                            margin:0 0 12px;
                                            font-size:25px;
                                            line-height:1.3;
                                            color:#172033;
                                        ">
                                            Reset your password
                                        </h1>


                                        <p style="
                                            margin:0 0 20px;
                                            font-size:15px;
                                            line-height:1.7;
                                            color:#667085;
                                        ">
                                            Hello %s,
                                        </p>


                                        <p style="
                                            margin:0 0 25px;
                                            font-size:14px;
                                            line-height:1.7;
                                            color:#667085;
                                        ">
                                            We received a request to reset
                                            your Smart Civic password. Use
                                            the verification code below to
                                            continue.
                                        </p>


                                        <!-- OTP BOX -->

                                        <table
                                            width="100%%"
                                            cellpadding="0"
                                            cellspacing="0"
                                            border="0"
                                        >

                                            <tr>

                                                <td align="center">

                                                    <div style="
                                                        background:#f0f4ff;
                                                        border:1px solid #dbe4ff;
                                                        border-radius:12px;
                                                        padding:22px;
                                                        text-align:center;
                                                    ">

                                                        <div style="
                                                            color:#667085;
                                                            font-size:11px;
                                                            font-weight:600;
                                                            letter-spacing:1.5px;
                                                            text-transform:uppercase;
                                                            margin-bottom:10px;
                                                        ">
                                                            Password Reset Code
                                                        </div>

                                                        <div style="
                                                            color:#172033;
                                                            font-size:34px;
                                                            font-weight:700;
                                                            letter-spacing:8px;
                                                        ">
                                                            %s
                                                        </div>

                                                    </div>

                                                </td>

                                            </tr>

                                        </table>


                                        <p style="
                                            margin:25px 0 8px;
                                            font-size:13px;
                                            color:#667085;
                                            text-align:center;
                                        ">
                                            This code expires in
                                            <strong>10 minutes</strong>.
                                        </p>


                                        <p style="
                                            margin:0;
                                            font-size:12px;
                                            line-height:1.6;
                                            color:#98a2b3;
                                            text-align:center;
                                        ">
                                            Never share this code with
                                            anyone.
                                        </p>


                                        <!-- SECURITY NOTICE -->

                                        <div style="
                                            margin-top:30px;
                                            padding:15px 16px;
                                            background:#fff8ed;
                                            border-radius:10px;
                                            border:1px solid #f5dfb8;
                                        ">

                                            <p style="
                                                margin:0;
                                                font-size:12px;
                                                line-height:1.6;
                                                color:#8a5a00;
                                            ">
                                                If you did not request a
                                                password reset, ignore this
                                                email and make sure your
                                                account password remains
                                                secure.
                                            </p>

                                        </div>

                                    </td>

                                </tr>


                                <!-- FOOTER -->

                                <tr>

                                    <td style="
                                        border-top:1px solid #eaecf0;
                                        padding:22px 30px;
                                        text-align:center;
                                        background:#fafbfc;
                                    ">

                                        <div style="
                                            font-size:12px;
                                            color:#667085;
                                        ">
                                            Smart Civic Team
                                        </div>

                                        <div style="
                                            margin-top:5px;
                                            font-size:11px;
                                            color:#98a2b3;
                                        ">
                                            Smart Civic Reporting System
                                        </div>

                                    </td>

                                </tr>

                            </table>

                        </td>

                    </tr>

                </table>

                </body>
                </html>
                """.formatted(
                escapeHtml(fullName),
                otp
        );
    }


    /*
     * Prevent HTML injection through user's name.
     */
    private String escapeHtml(String value) {

        if (value == null) {
            return "";
        }

        return value
                .replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;")
                .replace("'", "&#39;");
    }
}