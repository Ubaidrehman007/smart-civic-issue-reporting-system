import apiClient from './apiClient'

export const getAdminDashboardStatistics = async () => {
    const response = await apiClient.get(
        '/admin/dashboard/statistics'
    )

    return response.data
}
/* =========================
   SLA STATISTICS
========================= */

export const getSlaStatistics = async () => {

    const response = await apiClient.get(
        '/issues/sla-statistics'
    )

    return response.data
}


/* =========================
   SLA BREACHED ISSUES
========================= */

export const getSlaBreachedIssues = async ({
                                               page = 0,
                                               size = 10,
                                               sort = 'createdAt,desc',
                                           } = {}) => {

    const response = await apiClient.get(
        '/issues/sla-breached',
        {
            params: {
                page,
                size,
                sort,
            },
        }
    )

    return response.data
}