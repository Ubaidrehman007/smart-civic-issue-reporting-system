package com.smartcivic.backend.user.config;

import com.smartcivic.backend.auth.security.JwtAuthenticationFilter;
import com.smartcivic.backend.auth.service.CustomUserDetailsService;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@EnableMethodSecurity
@Configuration
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final CustomUserDetailsService userDetailsService;
    private final PasswordEncoder passwordEncoder;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter, CustomUserDetailsService userDetailsService, PasswordEncoder passwordEncoder) {

        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
        this.userDetailsService = userDetailsService;
        this.passwordEncoder = passwordEncoder;
    }

    @Bean
    public AuthenticationProvider authenticationProvider() {

        DaoAuthenticationProvider provider = new DaoAuthenticationProvider(userDetailsService);

        provider.setPasswordEncoder(passwordEncoder);

        return provider;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

        http
                .cors(Customizer.withDefaults())
                .csrf(csrf -> csrf.disable())

                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )

                .authenticationProvider(authenticationProvider())

                .authorizeHttpRequests(auth -> auth

                        .requestMatchers(
                                "/api/v1/users/register",
                                "/api/v1/auth/login",
                                "/api/v1/auth/verify-registration-otp",
                                "/api/v1/auth/forgot-password",
                                "/api/v1/auth/reset-password",
                                "/api/v1/auth/resend-registration-otp",
                                "/api/images/**"
                        ).permitAll()

                        .requestMatchers(
                                HttpMethod.PATCH,
                                "/api/v1/issues/*/status"
                        ).hasAnyAuthority("FIELD_WORKER", "ADMIN")

                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/v1/issues/assigned"
                        ).hasAuthority("FIELD_WORKER")

                        .requestMatchers(
                                HttpMethod.PATCH,
                                "/api/v1/issues/*/assign"
                        ).hasAuthority("ADMIN")

                        .requestMatchers(
                                HttpMethod.PATCH,
                                "/api/v1/users/*/account-status"
                        ).hasAuthority("ADMIN")

                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/v1/users/search"
                        ).hasAuthority("ADMIN")
                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/v1/users"
                        ).hasAuthority("ADMIN")

                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/v1/users/dashboard"
                        ).hasAuthority("ADMIN")

                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/v1/users/me"
                        ).authenticated()
                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/v1/users/*"
                        ).hasAuthority("ADMIN")

                        .anyRequest().authenticated()
                )

                .addFilterBefore(
                        jwtAuthenticationFilter,
                        UsernamePasswordAuthenticationFilter.class
                );

        return http.build();
    }
}