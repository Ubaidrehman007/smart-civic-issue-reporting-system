import apiClient from './apiClient'

export const getMyIssues = async () => {
    const response = await apiClient.get('/issues/my', {
        params: {
            page: 0,
            size: 50,
            sort: 'createdAt,desc',
        },
    })

    return response.data
}
export const createIssue = async (formData) => {
    const response = await apiClient.post(
        '/issues',
        formData,
        {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        }
    )

    return response.data
}

export const getIssueById = async (issueId) => {
    const response = await apiClient.get(
        `/issues/${issueId}`
    )

    return response.data
}
export const getIssueStatusHistory = async (issueId) => {

    const response = await apiClient.get(
        `/issues/${issueId}/status-history`
    )

    return response.data
}