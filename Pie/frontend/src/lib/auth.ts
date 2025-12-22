import apiClient from './api-client'

export interface LoginCredentials {
  identifier: string
  password: string
}

export interface RegisterData {
  email?: string
  phone?: string
  name: string
  password: string
}

export interface AuthResponse {
  user: {
    id: string
    email?: string
    phone?: string
    name: string
  }
  tokens: {
    accessToken: string
    refreshToken: string
  }
}

export const authService = {
  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await apiClient.post('/auth/register', data)
    return response.data.data
  },

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await apiClient.post('/auth/login', credentials)
    return response.data.data
  },

  async logout(): Promise<void> {
    await apiClient.post('/auth/logout')
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem('accessToken')
  },

  getUser() {
    const token = localStorage.getItem('accessToken')
    if (!token) return null

    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      return payload
    } catch {
      return null
    }
  },
}
