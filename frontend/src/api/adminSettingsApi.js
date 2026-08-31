import apiClient from './apiClient'


export const getAdminSettings = async () => {

    const response =
        await apiClient.get(
            '/admin/settings'
        )

    return response.data
}


export const updateNotificationPreferences = async (
    data
) => {

    const response =
        await apiClient.put(
            '/admin/settings/notifications',
            data
        )

    return response.data
}


export const updateIssueConfiguration = async (
    data
) => {

    const response =
        await apiClient.put(
            '/admin/settings/issues',
            data
        )

    return response.data
}


export const updateSystemConfiguration = async (
    data
) => {

    const response =
        await apiClient.put(
            '/admin/settings/system',
            data
        )

    return response.data
}


export const resetAdminSettings = async () => {

    const response =
        await apiClient.post(
            '/admin/settings/reset'
        )

    return response.data
}


export const logoutAllAdminSessions = async () => {

    const response =
        await apiClient.post(
            '/admin/settings/logout-all'
        )

    return response.data
}