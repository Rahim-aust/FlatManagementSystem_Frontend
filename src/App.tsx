import { Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from './layouts/AppLayout'
import { LoginPage } from './features/auth/LoginPage'
import { ChangePasswordPage } from './features/auth/ChangePasswordPage'
import { AdminDashboardPage } from './features/dashboard/AdminDashboardPage'
import { TenantDashboardPage } from './features/dashboard/TenantDashboardPage'
import { ManageFlatsPage } from './features/flats/ManageFlatsPage'
import { ManageTenantsPage } from './features/tenants/ManageTenantsPage'
import { GenerateBillPage } from './features/bills/GenerateBillPage'
import { BillHistoryPage } from './features/bills/BillHistoryPage'
import { ReportsPage } from './features/reports/ReportsPage'
import { ProtectedRoute } from './routes/ProtectedRoute'

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <AdminDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/flats"
            element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <ManageFlatsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/tenants"
            element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <ManageTenantsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/bills/generate"
            element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <GenerateBillPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/reports"
            element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <ReportsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/change-password"
            element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <ChangePasswordPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tenant/dashboard"
            element={
              <ProtectedRoute allowedRoles={['Tenant']}>
                <TenantDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tenant/bills"
            element={
              <ProtectedRoute allowedRoles={['Tenant']}>
                <BillHistoryPage />
              </ProtectedRoute>
            }
          />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

export default App
