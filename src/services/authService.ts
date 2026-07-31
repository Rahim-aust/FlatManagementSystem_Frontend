import { apiClient } from './apiClient'
import type { ApiResponse, AuthResponse, UserSummary } from '../types/auth'

export type LoginPayload = {
  usernameOrEmail: string
  password: string
}

export type RegisterTenantPayload = {
  name: string
  email: string
  password: string
  phone?: string
  nationalId: string
  flatId?: number
}

export type ChangePasswordPayload = {
  currentPassword: string
  newPassword: string
  confirmNewPassword: string
}

export const authService = {
  async login(payload: LoginPayload) {
    const response = await apiClient.post<ApiResponse<AuthResponse>>('/auth/login', payload)
    return response.data
  },
  async registerTenant(payload: RegisterTenantPayload) {
    const response = await apiClient.post<ApiResponse<UserSummary>>('/auth/register', payload)
    return response.data
  },
  async changePassword(payload: ChangePasswordPayload) {
    const response = await apiClient.post<ApiResponse<object>>('/auth/change-password', payload)
    return response.data
  },
}
