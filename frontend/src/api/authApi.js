import apiClient from './apiClient'

export const loginUser = (credentials) => {
    return apiClient.post('/auth/login', credentials)
}

export const registerUser = (userData) => {
    return apiClient.post('/users/register', userData)
}

export const verifyRegistrationOtp = (data) => {
    return apiClient.post(
        '/auth/verify-registration-otp',
        data
    )
}

export const resendRegistrationOtp = (email) => {
    return apiClient.post(
        '/auth/resend-registration-otp',
        null,
        {
            params: {
                email,
            },
        }
    )
}

export const forgotPassword = (data) => {
    return apiClient.post(
        '/auth/forgot-password',
        data
    )
}

export const resetPassword = (data) => {
    return apiClient.post(
        '/auth/reset-password',
        data
    )
}