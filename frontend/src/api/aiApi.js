import axios from 'axios'

const API_BASE_URL = 'http://localhost:8080/api'

export async function sendAiMessage(message) {

    const token = localStorage.getItem('token')

    if (!token) {
        throw new Error('Authentication required.')
    }

    const response = await axios.post(
        `${API_BASE_URL}/ai/chat`,
        {
            message: message.trim()
        },
        {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        }
    )

    return response.data
}