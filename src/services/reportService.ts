import { apiClient } from './apiClient'
import { getApiErrorMessage } from '../utils/apiError'
import type { BillStatus } from '../types/bills'

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

export const reportService = {
  async downloadBillReportPdf(status?: BillStatus | '') {
    const response = await apiClient.get<Blob>('/reports/bills/pdf', {
      params: { status: status || undefined },
      responseType: 'blob',
    })
    if (response.status >= 400) {
      throw new Error(await getBlobErrorMessage(response.data))
    }
    downloadBlob(response.data, 'bill-report.pdf')
  },
  async downloadBillPdf(billId: number) {
    const response = await apiClient.get<Blob>(`/reports/bills/${billId}/pdf`, {
      responseType: 'blob',
    })
    if (response.status >= 400) {
      throw new Error(await getBlobErrorMessage(response.data))
    }
    downloadBlob(response.data, `bill-${billId}.pdf`)
  },
}

async function getBlobErrorMessage(blob: Blob) {
  // PDF endpoints normally return a Blob. When the API returns an error, Axios still
  // gives us a Blob because responseType is "blob", so we manually read JSON errors.
  if (blob.type.includes('application/json')) {
    try {
      return getApiErrorMessage(JSON.parse(await blob.text()))
    } catch {
      return 'PDF download failed.'
    }
  }

  return 'PDF download failed.'
}
