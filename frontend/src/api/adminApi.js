import apiClient from './apiClient'

export const getAdminDashboardStatistics = async () => {
    const response = await apiClient.get(
        '/admin/dashboard/statistics'
    )

    return response.data
}