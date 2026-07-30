import type { Bill } from './bills'

export type AdminDashboard = {
  totalFlats: number
  totalTenants: number
  pendingBills: number
  paidBills: number
  overdueBills: number
  pendingAmount: number
  collectedAmount: number
}

export type TenantDashboard = {
  tenantName: string
  flatNumber?: string | null
  currentBill?: Bill | null
  recentBills: Bill[]
}
