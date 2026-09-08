import axios from 'axios'


const API_BASE_URL =
    'http://localhost:8080/api'


export async function sendAiMessage(
    message
) {

    const token =
        localStorage.getItem('token')


    /*
     * =====================================================
     * AUTHENTICATION CHECK
     * =====================================================
     */

    if (!token) {

        throw new Error(
            'Authentication required.'
        )

    }


    /*
     * =====================================================
     * MESSAGE VALIDATION
     * =====================================================
     */

    const trimmedMessage =
        message?.trim()


    if (!trimmedMessage) {

        throw new Error(
            'Message is required.'
        )

    }


    try {

        const response =
            await axios.post(

                `${API_BASE_URL}/ai/chat`,

                {
                    message: trimmedMessage
                },

                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`,

                        'Content-Type':
                            'application/json'
                    },

                    timeout: 60000

                }

            )


        /*
         * =================================================
         * RESPONSE VALIDATION
         * =================================================
         */

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


        /*
         * =================================================
         * BACKEND RESPONSE ERROR
         * =================================================
         */

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


        /*
         * =================================================
         * REQUEST SENT BUT NO RESPONSE
         * =================================================
         */

        if (error.request) {

            throw new Error(
                'Unable to connect to the Smart Civic backend.'
            )

        }


        /*
         * =================================================
         * LOCAL / VALIDATION ERROR
         * =================================================
         */

        throw new Error(
            error.message ||
            'Something went wrong.'
        )

    }
}