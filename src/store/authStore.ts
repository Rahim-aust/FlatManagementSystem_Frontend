import type { AuthResponse, UserRole, UserSummary } from '../types/auth'

const storageKey = 'flat-management.auth'

type StoredAuth = {
  accessToken: string
  refreshToken: string
  user: UserSummary
}

function readStoredAuth(): StoredAuth | null {
  const raw = localStorage.getItem(storageKey)
  if (!raw) {
    return null
  }

  try {
    return JSON.parse(raw) as StoredAuth
  } catch {
    localStorage.removeItem(storageKey)
    return null
  }
}

let currentAuth = readStoredAuth()

export const authStore = {
  getAccessToken() {
    return currentAuth?.accessToken ?? null
  },
  getRefreshToken() {
    return currentAuth?.refreshToken ?? null
  },
  getUser() {
    return currentAuth?.user ?? null
  },
  isAuthenticated() {
    return Boolean(currentAuth?.accessToken)
  },
  hasRole(roles?: UserRole[]) {
    if (!roles?.length) {
      return true
    }

    return currentAuth?.user.roles.some((role) => roles.includes(role)) ?? false
  },
  setAuth(response: AuthResponse) {
    currentAuth = {
      accessToken: response.accessToken,
      refreshToken: response.refreshToken,
      user: response.user,
    }
    localStorage.setItem(storageKey, JSON.stringify(currentAuth))
  },
  clear() {
    currentAuth = null
    localStorage.removeItem(storageKey)
  },
}
