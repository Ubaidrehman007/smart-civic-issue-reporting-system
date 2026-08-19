import apiClient from './apiClient'

export const getCurrentUser = async () => {
    const response = await apiClient.get('/users/me')

    return response.data
}

export const updateProfile = async (userId, profileData) => {
    const response = await apiClient.put(
        `/users/${userId}/profile`,
        profileData
    )

    return response.data
}