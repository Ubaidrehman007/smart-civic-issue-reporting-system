package com.smartcivic.backend.notification.repository;

import com.smartcivic.backend.notification.entity.Notification;
import com.smartcivic.backend.notification.entity.NotificationType;
import com.smartcivic.backend.user.entity.User;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface NotificationRepository
        extends JpaRepository<Notification, UUID> {

    /*
     * Fetch latest notifications for a user.
     */
    List<Notification> findByUserOrderByCreatedAtDesc(
            User user,
            Pageable pageable
    );


    /*
     * Fetch unread notifications for a user.
     */
    List<Notification> findByUserAndReadFalseOrderByCreatedAtDesc(
            User user
    );


    /*
     * Count unread notifications for a user.
     */
    long countByUserAndReadFalse(
            User user
    );


    /*
     * Find a notification belonging to a specific user.
     *
     * This prevents one user from accessing
     * another user's notification.
     */
    @Query("""
            SELECT n
            FROM Notification n
            WHERE n.id = :notificationId
              AND n.user = :user
            """)
    java.util.Optional<Notification> findByIdAndUser(
            @Param("notificationId") UUID notificationId,
            @Param("user") User user
    );


    /*
     * Mark one user's unread notifications as read.
     */
    @Modifying
    @Query("""
            UPDATE Notification n
            SET n.read = true
            WHERE n.user = :user
              AND n.read = false
            """)
    int markAllAsRead(
            @Param("user") User user
    );

    boolean existsByUserAndTypeAndReferenceId(
            User user,
            NotificationType type,
            UUID referenceId
    );

}