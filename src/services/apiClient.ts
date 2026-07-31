import axios from 'axios'
import { env } from '../config/env'
import { authStore } from '../store/authStore'
import type { ApiResponse, AuthResponse } from '../types/auth'

export const apiClient = axios.create({
  baseURL: env.apiBaseUrl,
})

apiClient.interceptors.request.use((config) => {
  const token = authStore.getAccessToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    const refreshToken = authStore.getRefreshToken()
    const isLoginRequest = originalRequest?.url?.includes('/auth/login')
    const isRefreshRequest = originalRequest?.url?.includes('/auth/refresh-token')

    if (
      error.response?.status === 401 &&
      refreshToken &&
      originalRequest &&
      !originalRequest._retry &&
      !isLoginRequest &&
      !isRefreshRequest
    ) {
      // For protected API calls, try one refresh-token rotation before failing.
      // Login/refresh endpoints are excluded to avoid retry loops.
      originalRequest._retry = true
      try {
        const response = await axios.post<ApiResponse<AuthResponse>>(
          `${env.apiBaseUrl}/auth/refresh-token`,
          { refreshToken },
        )

        if (response.data.success && response.data.data) {
          authStore.setAuth(response.data.data)
          originalRequest.headers.Authorization = `Bearer ${response.data.data.accessToken}`
          return apiClient(originalRequest)
        }
      } catch {
        authStore.clear()
      }
    }

    if (error.response?.status === 401 && !isLoginRequest && !isRefreshRequest) {
      // If refresh failed or no refresh token exists, the local session is stale.
      // Clear it and return the user to login instead of leaving a broken dashboard open.
      authStore.clear()
      if (window.location.pathname !== '/login') {
        window.location.assign('/login')
      }
      return Promise.reject(error)
    }

    if (error.response?.data) {
      return error.response
    }

    return Promise.reject(error)
  },
)
