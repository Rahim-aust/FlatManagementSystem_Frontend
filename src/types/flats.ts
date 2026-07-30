export type Flat = {
  flatId: number
  flatNumber: string
  floor: number
  sizeSqFt: number
  rentAmount: number
  billingType: 'Inclusive' | 'Exclusive'
  isOccupied: boolean
}

export type FlatPayload = {
  flatNumber: string
  floor: number
  sizeSqFt: number
  rentAmount: number
  billingType: 'Inclusive' | 'Exclusive'
}

export type PagedResult<T> = {
  items: T[]
  pageNumber: number
  pageSize: number
  totalRecords: number
  totalPages: number
}
