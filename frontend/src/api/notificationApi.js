import apiClient from './apiClient'


// =====================================================
// GET MY NOTIFICATIONS
// =====================================================

export const getMyNotifications = async () => {

    const response =
        await apiClient.get('/notifications')

    return response.data
}


// =====================================================
// GET UNREAD NOTIFICATION COUNT
// =====================================================

export const getUnreadNotificationCount = async () => {

    const response =
        await apiClient.get('/notifications/unread-count')

    return response.data
}


// =====================================================
// MARK SINGLE NOTIFICATION AS READ
// =====================================================

export const markNotificationAsRead = async (
    notificationId
) => {

    const response =
        await apiClient.put(
            `/notifications/${notificationId}/read`
        )

    return response.data
}


// =====================================================
// MARK ALL NOTIFICATIONS AS READ
// =====================================================

export const markAllNotificationsAsRead = async () => {

    const response =
        await apiClient.put(
            '/notifications/read-all'
        )

    return response.data
}