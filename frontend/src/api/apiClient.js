import axios from 'axios'


const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
})


// =====================================================
// REQUEST INTERCEPTOR
// =====================================================

apiClient.interceptors.request.use(

    (config) => {

        const token =
            localStorage.getItem('token')

        if (token) {

            config.headers.Authorization =
                `Bearer ${token}`
        }

        return config
    },

    (error) => {

        return Promise.reject(error)
    },
)


// =====================================================
// RESPONSE INTERCEPTOR
// =====================================================

apiClient.interceptors.response.use(

    (response) => {

        return response
    },

    (error) => {

        const status =
            error.response?.status



        if (status === 401) {

            localStorage.removeItem('token')
            localStorage.removeItem('user')
            localStorage.removeItem('userRole')

            window.location.href = '/login'

            return Promise.reject(error)
        }


        // =================================================
        // BACKEND ERROR MESSAGE
        // =================================================

        const backendMessage =
            error.response?.data?.message ||
            error.response?.data?.error ||
            error.message ||
            'Something went wrong.'


        // Keep backend message available to every
        // component through error.message
        error.message =
            backendMessage


        return Promise.reject(error)
    }
)


export default apiClient