import { apiClient } from './apiClient'
import type { ApiResponse } from '../types/auth'
import type { AdminDashboard, TenantDashboard } from '../types/dashboard'

export const dashboardService = {
  async getAdminDashboard() {
    const response = await apiClient.get<ApiResponse<AdminDashboard>>('/dashboard/admin')
    return response.data
  },
  async getTenantDashboard() {
    const response = await apiClient.get<ApiResponse<TenantDashboard>>('/dashboard/tenant')
    return response.data
  },
}
