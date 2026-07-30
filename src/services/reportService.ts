import { apiClient } from './apiClient'
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
    downloadBlob(response.data, 'bill-report.pdf')
  },
  async downloadBillPdf(billId: number) {
    const response = await apiClient.get<Blob>(`/reports/bills/${billId}/pdf`, {
      responseType: 'blob',
    })
    downloadBlob(response.data, `bill-${billId}.pdf`)
  },
}
