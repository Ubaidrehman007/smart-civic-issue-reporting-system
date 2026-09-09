import apiClient from './apiClient'

export async function sendAiMessage(
    message
) {

    const trimmedMessage =
        message?.trim()

    if (!trimmedMessage) {

        throw new Error(
            'Message is required.'
        )

    }

    const apiBaseUrl =
        import.meta.env.VITE_API_BASE_URL

    const apiRoot =
        apiBaseUrl?.replace(
            /\/v1\/?$/,
            ''
        )

    if (!apiRoot) {

        throw new Error(
            'API base URL is not configured.'
        )

    }

    try {

        const response =
            await apiClient.post(

                '/ai/chat',

                {
                    message: trimmedMessage
                },

                {
                    baseURL: apiRoot,
                    timeout: 60000
                }

            )

        if (!response.data) {

            throw new Error(
                'Empty response received from AI service.'
            )

        }

        if (
            response.data.success === false
        ) {

            throw new Error(
                response.data.message ||
                'AI service request failed.'
            )

        }

        if (
            !response.data.message
        ) {

            throw new Error(
                'AI returned an empty response.'
            )

        }

        return response.data

    } catch (error) {

        console.error(
            'AI API error:',
            error
        )

        if (error.response) {

            const status =
                error.response.status

            const backendMessage =
                error.response.data?.message

            if (
                status === 401 ||
                status === 403
            ) {

                throw new Error(
                    'Your session has expired or you are not authorized.'
                )

            }

            if (status === 429) {

                throw new Error(
                    'AI service is temporarily busy. Please try again shortly.'
                )

            }

            if (status === 503) {

                throw new Error(
                    'AI service is temporarily unavailable. Please try again shortly.'
                )

            }

            if (status >= 500) {

                throw new Error(
                    backendMessage ||
                    'AI service is temporarily unavailable. Please try again.'
                )

            }

            throw new Error(
                backendMessage ||
                'Unable to get a response from the AI Assistant.'
            )

        }

        if (error.request) {

            throw new Error(
                'Unable to connect to the Smart Civic backend.'
            )

        }

        throw new Error(
            error.message ||
            'Something went wrong.'
        )

    }

}