export type UserRole = 'Admin' | 'Tenant'

export type UserSummary = {
  userId: string
  userName: string
  email: string
  fullName?: string | null
  roles: UserRole[]
  mustChangePassword: boolean
}

export type AuthResponse = {
  accessToken: string
  refreshToken: string
  accessTokenExpiresAt: string
  user: UserSummary
}

export type ApiResponse<T> = {
  success: boolean
  message: string
  data?: T
  errors?: string[]
}
