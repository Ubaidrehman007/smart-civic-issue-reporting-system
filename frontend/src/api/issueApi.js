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

export const getAssignedIssues = async ({
                                            page = 0,
                                            size = 50,
                                            sort = 'createdAt,desc',
                                        } = {}) => {

    const response = await apiClient.get(
        '/issues/assigned',
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


export const updateIssueStatus = async ({
                                            issueId,
                                            status,
                                        }) => {

    const response = await apiClient.patch(
        `/issues/${issueId}/status`,
        {
            status,
        }
    )

    return response.data
}


export const deleteIssue = async (issueId) => {
    const response = await apiClient.delete(
        `/issues/${issueId}`
    )

    return response.data
}


export const getPossibleDuplicates = async ({
                                                latitude,
                                                longitude,
                                                category,
                                                radius = 1,
                                            }) => {

    const response = await apiClient.get(
        '/issues/possible-duplicates',
        {
            params: {
                latitude,
                longitude,
                category,
                radius,
                page: 0,
                size: 10,
            },
        }
    )

    return response.data
}


export const getAllIssues = async ({
                                       page = 0,
                                       size = 10,
                                       sort = 'createdAt,desc',
                                   } = {}) => {

    const response = await apiClient.get(
        '/issues',
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


export const searchIssues = async ({
                                       keyword,
                                       page = 0,
                                       size = 10,
                                   }) => {

    const response = await apiClient.get(
        '/issues/search',
        {
            params: {
                keyword,
                page,
                size,
                sort: 'createdAt,desc',
            },
        }
    )

    return response.data
}


export const getIssuesByStatus = async ({
                                            status,
                                            page = 0,
                                            size = 10,
                                            sort = 'createdAt,desc',
                                        }) => {

    const response = await apiClient.get(
        `/issues/status/${status}`,
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


export const getIssuesByCategory = async ({
                                              category,
                                              page = 0,
                                              size = 10,
                                              sort = 'createdAt,desc',
                                          }) => {

    const response = await apiClient.get(
        `/issues/category/${category}`,
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


export const getIssuesByPriority = async ({
                                              priority,
                                              page = 0,
                                              size = 10,
                                              sort = 'createdAt,desc',
                                          }) => {

    const response = await apiClient.get(
        `/issues/priority/${priority}`,
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

export const assignIssue = async ({
                                      issueId,
                                      fieldWorkerId,
                                  }) => {

    const response = await apiClient.patch(
        `/issues/${issueId}/assign`,
        {
            fieldWorkerId,
        }
    )

    return response.data
}