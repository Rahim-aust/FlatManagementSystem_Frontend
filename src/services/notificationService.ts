import { apiClient } from './apiClient'
import type { ApiResponse } from '../types/auth'
import type { AppNotification } from '../types/notifications'

export const notificationService = {
  async getNotifications() {
    const response = await apiClient.get<ApiResponse<AppNotification[]>>('/notifications')
    return response.data
  },

  async getUnreadCount() {
    const response = await apiClient.get<ApiResponse<number>>('/notifications/unread-count')
    return response.data
  },

  async markAsRead(notificationId: number) {
    const response = await apiClient.post<ApiResponse<object>>(`/notifications/${notificationId}/read`)
    return response.data
  },
}
