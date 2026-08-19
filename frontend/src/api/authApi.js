import apiClient from './apiClient'

export const loginUser = (credentials) => {
    return apiClient.post('/auth/login', credentials)
}

export const registerUser = (userData) => {
    return apiClient.post('/users/register', userData)
}