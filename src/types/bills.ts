export type BillStatus = 'Pending' | 'Paid' | 'Overdue'

export type Bill = {
  billId: number
  tenantId: number
  tenantName: string
  flatNumber?: string | null
  billMonth: string
  rentAmount: number
  electricityBill: number
  waterBill: number
  gasBill: number
  garbageCharge: number
  serviceCharge: number
  otherCharge: number
  discount: number
  totalBill: number
  dueDate: string
  status: BillStatus
  billingType: 'Inclusive' | 'Exclusive'
}

export type BillPreview = {
  tenantId: number
  tenantName: string
  flatId: number
  flatNumber: string
  billingType: 'Inclusive' | 'Exclusive'
  rentAmount: number
}

export type GenerateBillPayload = {
  tenantId: number
  billMonth: string
  electricityBill: number
  waterBill: number
  gasBill: number
  garbageCharge: number
  serviceCharge: number
  otherCharge: number
  discount: number
  dueDate: string
}
