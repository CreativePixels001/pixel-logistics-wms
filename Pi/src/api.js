import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  }
})

export const sendMessage = async (message, sessionId = 'default', language = 'en') => {
  const response = await api.post('/chat', {
    message,
    sessionId,
    language
  })
  return response.data
}

export default api
