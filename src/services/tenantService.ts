import { apiClient } from './apiClient'
import type { ApiResponse } from '../types/auth'
import type { PagedResult } from '../types/flats'
import type { AssignFlatPayload, ResetTenantPasswordPayload, Tenant, TenantPayload } from '../types/tenants'

export type TenantListParams = {
  search?: string
  pageNumber: number
  pageSize: number
}

export const tenantService = {
  async getTenants(params: TenantListParams) {
    const response = await apiClient.get<ApiResponse<PagedResult<Tenant>>>('/tenants', { params })
    return response.data
  },
  async createTenant(payload: Required<Pick<TenantPayload, 'password'>> & TenantPayload) {
    const response = await apiClient.post<ApiResponse<Tenant>>('/tenants', payload)
    return response.data
  },
  async updateTenant(tenantId: number, payload: Omit<TenantPayload, 'password' | 'flatId'>) {
    const response = await apiClient.put<ApiResponse<Tenant>>(`/tenants/${tenantId}`, payload)
    return response.data
  },
  async assignFlat(payload: AssignFlatPayload) {
    const response = await apiClient.post<ApiResponse<Tenant>>('/tenants/assign-flat', payload)
    return response.data
  },
  async resetPassword(tenantId: number, payload: ResetTenantPasswordPayload) {
    const response = await apiClient.post<ApiResponse<object>>(`/tenants/${tenantId}/reset-password`, payload)
    return response.data
  },
  async deleteTenant(tenantId: number) {
    const response = await apiClient.delete<ApiResponse<object>>(`/tenants/${tenantId}`)
    return response.data
  },
}
