package com.smartcivic.backend.notification.service;

import com.smartcivic.backend.adminsettings.entity.AdminSettings;
import com.smartcivic.backend.adminsettings.repository.AdminSettingsRepository;
import com.smartcivic.backend.notification.dto.NotificationResponse;
import com.smartcivic.backend.notification.dto.UnreadNotificationCountResponse;
import com.smartcivic.backend.notification.entity.Notification;
import com.smartcivic.backend.notification.entity.NotificationType;
import com.smartcivic.backend.notification.repository.NotificationRepository;
import com.smartcivic.backend.user.entity.Role;
import com.smartcivic.backend.user.entity.User;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;



import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class NotificationServiceImpl
        implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final AdminSettingsRepository adminSettingsRepository;


    // =====================================================
    // CREATE NOTIFICATION
    // =====================================================

    @Override
    @Transactional
    public void createNotification(
            User user,
            NotificationType type,
            String title,
            String message,
            UUID referenceId
    ) {

        /*
         * Admin notification preferences apply only
         * to administrator notifications.
         */
        if (user.getRole() == Role.ADMIN) {

            AdminSettings settings =
                    adminSettingsRepository
                            .findTopByOrderByCreatedAtAsc()
                            .orElse(null);

            if (settings != null &&
                    !isAdminNotificationEnabled(
                            settings,
                            type
                    )) {

                return;
            }
        }

        Notification notification =
                Notification.create(
                        user,
                        type,
                        title,
                        message,
                        referenceId
                );

        notificationRepository.save(notification);
    }

    private boolean isAdminNotificationEnabled(
            AdminSettings settings,
            NotificationType type
    ) {

        return switch (type) {

            case ISSUE_REPORTED ->
                    settings.isNotifyNewIssues();

            case ISSUE_ASSIGNED ->
                    settings.isNotifyIssueAssignments();

            case ISSUE_STATUS_CHANGED ->
                    settings.isNotifyStatusChanges();

            case ISSUE_RESOLVED ->
                    settings.isNotifyIssueResolved();

            case SLA_WARNING ->
                    settings.isNotifySlaWarnings();

            case SLA_BREACHED ->
                    settings.isNotifySlaBreaches();

            case NEW_CITIZEN_REGISTERED ->
                    settings.isNotifyNewCitizenRegistrations();

            case ACCOUNT_STATUS_CHANGED ->
                    settings.isNotifyAccountStatusChanges();
        };
    }

    // =====================================================
    // GET USER NOTIFICATIONS
    // =====================================================

    @Override
    @Transactional(readOnly = true)
    public List<NotificationResponse> getUserNotifications(
            User user
    ) {

        return notificationRepository
                .findByUserOrderByCreatedAtDesc(
                        user,
                        PageRequest.of(0, 50)
                )
                .stream()
                .map(this::mapToResponse)
                .toList();
    }


    // =====================================================
    // GET UNREAD COUNT
    // =====================================================

    @Override
    @Transactional(readOnly = true)
    public UnreadNotificationCountResponse
    getUnreadNotificationCount(User user) {

        long unreadCount =
                notificationRepository
                        .countByUserAndReadFalse(user);

        return new UnreadNotificationCountResponse(
                unreadCount
        );
    }


    // =====================================================
    // MARK SINGLE NOTIFICATION AS READ
    // =====================================================

    @Override
    @Transactional
    public void markAsRead(
            UUID notificationId,
            User user
    ) {

        Notification notification =
                notificationRepository
                        .findByIdAndUser(
                                notificationId,
                                user
                        )
                        .orElseThrow(() ->
                                new EntityNotFoundException(
                                        "Notification not found"
                                )
                        );

        if (!notification.isRead()) {

            notification.setRead(true);

            notificationRepository.save(notification);
        }
    }


    // =====================================================
    // MARK ALL NOTIFICATIONS AS READ
    // =====================================================

    @Override
    @Transactional
    public void markAllAsRead(
            User user
    ) {

        notificationRepository.markAllAsRead(user);
    }


    // =====================================================
    // ENTITY → RESPONSE DTO
    // =====================================================

    private NotificationResponse mapToResponse(
            Notification notification
    ) {

        return new NotificationResponse(
                notification.getId(),
                notification.getType(),
                notification.getTitle(),
                notification.getMessage(),
                notification.getReferenceId(),
                notification.isRead(),
                notification.getCreatedAt()
        );
    }
}