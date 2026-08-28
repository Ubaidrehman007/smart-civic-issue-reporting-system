package com.smartcivic.backend.notification.controller;

import com.smartcivic.backend.notification.dto.NotificationResponse;
import com.smartcivic.backend.notification.dto.UnreadNotificationCountResponse;
import com.smartcivic.backend.notification.service.NotificationService;
import com.smartcivic.backend.user.entity.User;
import com.smartcivic.backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;
    private final UserRepository userRepository;


    // =====================================================
    // GET MY NOTIFICATIONS
    // =====================================================

    @GetMapping
    public ResponseEntity<List<NotificationResponse>>
    getMyNotifications(Authentication authentication) {

        User user = getAuthenticatedUser(authentication);

        return ResponseEntity.ok(
                notificationService.getUserNotifications(user)
        );
    }


    // =====================================================
    // GET UNREAD NOTIFICATION COUNT
    // =====================================================

    @GetMapping("/unread-count")
    public ResponseEntity<UnreadNotificationCountResponse>
    getUnreadNotificationCount(
            Authentication authentication
    ) {

        User user = getAuthenticatedUser(authentication);

        return ResponseEntity.ok(
                notificationService.getUnreadNotificationCount(user)
        );
    }


    // =====================================================
    // MARK SINGLE NOTIFICATION AS READ
    // =====================================================

    @PutMapping("/{notificationId}/read")
    public ResponseEntity<Void> markAsRead(
            @PathVariable UUID notificationId,
            Authentication authentication
    ) {

        User user = getAuthenticatedUser(authentication);

        notificationService.markAsRead(
                notificationId,
                user
        );

        return ResponseEntity.noContent().build();
    }


    // =====================================================
    // MARK ALL NOTIFICATIONS AS READ
    // =====================================================

    @PutMapping("/read-all")
    public ResponseEntity<Void> markAllAsRead(
            Authentication authentication
    ) {

        User user = getAuthenticatedUser(authentication);

        notificationService.markAllAsRead(user);

        return ResponseEntity.noContent().build();
    }


    // =====================================================
    // GET AUTHENTICATED USER
    // =====================================================

    private User getAuthenticatedUser(
            Authentication authentication
    ) {

        String email = authentication.getName();

        return userRepository
                .findByEmail(email)
                .orElseThrow(() ->
                        new IllegalStateException(
                                "Authenticated user not found"
                        )
                );
    }
}