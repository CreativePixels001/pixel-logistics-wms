import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'

export const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 60000, // 60 seconds for AI queries
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor - add auth token if available (optional)
apiClient.interceptors.request.use(
  (config) => {
    // Authentication is optional for chat
    const token = localStorage.getItem('accessToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor - handle errors
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Don't retry on 401 for anonymous access
    if (error.response?.status === 401) {
      // Just pass through the error for anonymous users
      return Promise.reject(error)
    }

    return Promise.reject(error)
  }
)

export default apiClient
