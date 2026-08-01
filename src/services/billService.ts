import { apiClient } from './apiClient'
import type { ApiResponse } from '../types/auth'
import type { Bill, BillPreview, BillStatus, GenerateBillPayload, RequestBillPaymentPayload, ReviewBillPaymentPayload } from '../types/bills'
import type { PagedResult } from '../types/flats'

export type BillListParams = {
  status?: BillStatus
  tenantId?: number
  billMonth?: string
  pageNumber: number
  pageSize: number
}

export const billService = {
  async getBills(params: BillListParams) {
    const response = await apiClient.get<ApiResponse<PagedResult<Bill>>>('/bills', { params })
    return response.data
  },
  async getMyBills() {
    const response = await apiClient.get<ApiResponse<Bill[]>>('/bills/my-bills')
    return response.data
  },
  async getPreview(tenantId: number) {
    const response = await apiClient.get<ApiResponse<BillPreview>>(`/bills/preview/${tenantId}`)
    return response.data
  },
  async generateBill(payload: GenerateBillPayload) {
    const response = await apiClient.post<ApiResponse<Bill>>('/bills', payload)
    return response.data
  },
  async updateStatus(billId: number, status: BillStatus) {
    const response = await apiClient.put<ApiResponse<Bill>>(`/bills/${billId}/status`, { status })
    return response.data
  },
  async requestPayment(billId: number, payload: RequestBillPaymentPayload = {}) {
    const response = await apiClient.post<ApiResponse<Bill>>(`/bills/${billId}/payment-request`, payload)
    return response.data
  },
  async reviewPaymentRequest(billId: number, payload: ReviewBillPaymentPayload) {
    const response = await apiClient.post<ApiResponse<Bill>>(`/bills/${billId}/payment-request/review`, payload)
    return response.data
  },
}
