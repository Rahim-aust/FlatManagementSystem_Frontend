import { apiClient } from './apiClient'
import type { ApiResponse } from '../types/auth'
import type { Flat, FlatPayload, PagedResult } from '../types/flats'

export type FlatListParams = {
  search?: string
  pageNumber: number
  pageSize: number
}

export const flatService = {
  async getFlats(params: FlatListParams) {
    const response = await apiClient.get<ApiResponse<PagedResult<Flat>>>('/flats', { params })
    return response.data
  },
  async createFlat(payload: FlatPayload) {
    const response = await apiClient.post<ApiResponse<Flat>>('/flats', payload)
    return response.data
  },
  async updateFlat(flatId: number, payload: FlatPayload) {
    const response = await apiClient.put<ApiResponse<Flat>>(`/flats/${flatId}`, payload)
    return response.data
  },
  async deleteFlat(flatId: number) {
    const response = await apiClient.delete<ApiResponse<object>>(`/flats/${flatId}`)
    return response.data
  },
}
