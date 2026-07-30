export type Tenant = {
  tenantId: number
  applicationUserId: string
  flatId?: number | null
  flatNumber?: string | null
  name: string
  phone?: string | null
  email: string
  nationalId: string
  hasUnpaidBills: boolean
}

export type TenantPayload = {
  name: string
  email: string
  password?: string
  phone?: string
  nationalId: string
  flatId?: number | null
}

export type AssignFlatPayload = {
  tenantId: number
  flatId?: number | null
}
