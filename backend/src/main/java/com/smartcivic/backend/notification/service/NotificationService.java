package com.smartcivic.backend.notification.service;

import com.smartcivic.backend.notification.dto.NotificationResponse;
import com.smartcivic.backend.notification.dto.UnreadNotificationCountResponse;
import com.smartcivic.backend.notification.entity.NotificationType;
import com.smartcivic.backend.user.entity.User;

import java.util.List;
import java.util.UUID;

public interface NotificationService {

    void createNotification(
            User user,
            NotificationType type,
            String title,
            String message,
            UUID referenceId
    );

    List<NotificationResponse> getUserNotifications(
            User user
    );

    UnreadNotificationCountResponse getUnreadNotificationCount(
            User user
    );

    void markAsRead(
            UUID notificationId,
            User user
    );

    void markAllAsRead(
            User user
    );
}