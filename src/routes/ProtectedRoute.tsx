import type { ReactNode } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { authStore } from '../store/authStore'
import type { UserRole } from '../types/auth'

type ProtectedRouteProps = {
  allowedRoles?: UserRole[]
  children?: ReactNode
}

export function ProtectedRoute({ allowedRoles, children }: ProtectedRouteProps) {
  if (!authStore.isAuthenticated()) {
    return <Navigate to="/login" replace />
  }

  if (!authStore.hasRole(allowedRoles)) {
    const user = authStore.getUser()
    const fallback = user?.roles.includes('Tenant') ? '/tenant/dashboard' : '/admin/dashboard'
    return <Navigate to={fallback} replace />
  }

  return children ? <>{children}</> : <Outlet />
}
