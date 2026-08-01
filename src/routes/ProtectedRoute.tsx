import type { ReactNode } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { authStore } from '../store/authStore'
import type { UserRole } from '../types/auth'

type ProtectedRouteProps = {
  allowedRoles?: UserRole[]
  children?: ReactNode
}

export function ProtectedRoute({ allowedRoles, children }: ProtectedRouteProps) {
  const location = useLocation()

  if (!authStore.isAuthenticated()) {
    return <Navigate to="/login" replace />
  }

  const user = authStore.getUser()
  const changePasswordPath = user?.roles.includes('Tenant') ? '/tenant/change-password' : '/admin/change-password'

  if (user?.mustChangePassword && location.pathname !== changePasswordPath) {
    return <Navigate to={changePasswordPath} replace />
  }

  if (!authStore.hasRole(allowedRoles)) {
    const fallback = user?.roles.includes('Tenant') ? '/tenant/dashboard' : '/admin/dashboard'
    return <Navigate to={fallback} replace />
  }

  return children ? <>{children}</> : <Outlet />
}
