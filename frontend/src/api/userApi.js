import apiClient from './apiClient'


/* =========================
   CURRENT USER
========================= */

export const getCurrentUser = async () => {

    const response =
        await apiClient.get('/users/me')

    return response.data
}


/* =========================
   UPDATE PROFILE
========================= */

export const updateProfile = async (
    userId,
    profileData
) => {

    const response =
        await apiClient.put(
            `/users/${userId}/profile`,
            profileData
        )

    return response.data
}


/* =========================
   CHANGE PASSWORD
========================= */

export const changePassword = async (
    passwordData
) => {

    const response =
        await apiClient.put(
            '/users/me/password',
            passwordData
        )

    return response.data
}


/* =========================
   DELETE MY ACCOUNT
========================= */

export const deleteMyAccount = async () => {

    const response =
        await apiClient.delete(
            '/users/me'
        )

    return response.data
}


/* =========================
   GET ALL USERS
========================= */

export const getAllUsers = async ({
                                      role,
                                      status,
                                  } = {}) => {

    const params = {}

    if (role) {
        params.role = role
    }

    if (status) {
        params.status = status
    }

    const response =
        await apiClient.get(
            '/users',
            {
                params,
            }
        )

    return response.data
}


/* =========================
   GET ACTIVE FIELD WORKERS
========================= */

export const getActiveFieldWorkers = async () => {

    const response =
        await apiClient.get(
            '/users',
            {
                params: {
                    role: 'FIELD_WORKER',
                    status: 'ACTIVE',
                },
            }
        )

    return response.data
}


/* =========================
   CREATE FIELD WORKER
========================= */

export const createFieldWorker = async (
    workerData
) => {

    const response =
        await apiClient.post(
            '/users/field-workers',
            workerData
        )

    return response.data
}


/* =========================
   SEARCH USERS
========================= */

export const searchUsers = async (
    keyword
) => {

    const response =
        await apiClient.get(
            '/users/search',
            {
                params: {
                    keyword,
                },
            }
        )

    return response.data
}


/* =========================
   UPDATE ACCOUNT STATUS
========================= */

export const updateAccountStatus = async (
    userId,
    accountStatus
) => {

    const response =
        await apiClient.patch(
            `/users/${userId}/account-status`,
            {
                accountStatus,
            }
        )

    return response
}


/* =========================
   GET USER BY ID
========================= */

export const getUserById = async (
    userId
) => {

    const response =
        await apiClient.get(
            `/users/${userId}`
        )

    return response.data
}