import {
  Alert,
  Box,
  Button,
  Chip,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Tooltip,
} from '@mui/material'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Edit, Home, KeyRound, Search, Trash2, UserPlus } from 'lucide-react'
import { useState } from 'react'
import { ConfirmDialog } from '../../components/ConfirmDialog'
import { PageHeader } from '../../components/PageHeader'
import { tenantService } from '../../services/tenantService'
import type { ResetTenantPasswordPayload, Tenant, TenantPayload } from '../../types/tenants'
import { getApiErrorMessage, getUnknownErrorMessage } from '../../utils/apiError'
import { AssignFlatDialog } from './components/AssignFlatDialog'
import { ResetPasswordDialog } from './components/ResetPasswordDialog'
import { TenantFormDialog } from './components/TenantFormDialog'

export function ManageTenantsPage() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(10)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [assignDialogOpen, setAssignDialogOpen] = useState(false)
  const [resetPasswordDialogOpen, setResetPasswordDialogOpen] = useState(false)
  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null)
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null)
  const [deletingTenant, setDeletingTenant] = useState<Tenant | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [tenantDialogError, setTenantDialogError] = useState<string | null>(null)
  const [resetPasswordError, setResetPasswordError] = useState<string | null>(null)
  const [resetPasswordSuccess, setResetPasswordSuccess] = useState<string | null>(null)

  const tenantsQuery = useQuery({
    queryKey: ['tenants', search, page, pageSize],
    queryFn: () => tenantService.getTenants({ search: search || undefined, pageNumber: page + 1, pageSize }),
  })

  const invalidateTenants = async () => {
    await queryClient.invalidateQueries({ queryKey: ['tenants'] })
  }

  const createMutation = useMutation({
    mutationFn: tenantService.createTenant,
    onSuccess: async (response) => {
      if (!response.success) {
        setTenantDialogError(getApiErrorMessage(response))
        return
      }

      setTenantDialogError(null)
      setDialogOpen(false)
      await invalidateTenants()
    },
    onError: (mutationError) => setTenantDialogError(getUnknownErrorMessage(mutationError)),
  })

  const updateMutation = useMutation({
    mutationFn: ({ tenantId, payload }: { tenantId: number; payload: Omit<TenantPayload, 'password' | 'flatId'> }) =>
      tenantService.updateTenant(tenantId, payload),
    onSuccess: async (response) => {
      if (!response.success) {
        setTenantDialogError(getApiErrorMessage(response))
        return
      }

      setTenantDialogError(null)
      setDialogOpen(false)
      setEditingTenant(null)
      await invalidateTenants()
    },
    onError: (mutationError) => setTenantDialogError(getUnknownErrorMessage(mutationError)),
  })

  const assignMutation = useMutation({
    mutationFn: ({ tenantId, flatId }: { tenantId: number; flatId?: number | null }) =>
      tenantService.assignFlat({ tenantId, flatId }),
    onSuccess: async (response) => {
      if (!response.success) {
        setError(getApiErrorMessage(response))
        return
      }

      setAssignDialogOpen(false)
      setSelectedTenant(null)
      await invalidateTenants()
    },
    onError: (mutationError) => setError(getUnknownErrorMessage(mutationError)),
  })

  const deleteMutation = useMutation({
    mutationFn: tenantService.deleteTenant,
    onSuccess: async (response) => {
      if (!response.success) {
        setError(getApiErrorMessage(response))
        return
      }

      setDeletingTenant(null)
      await invalidateTenants()
    },
    onError: (mutationError) => setError(getUnknownErrorMessage(mutationError)),
  })

  const resetPasswordMutation = useMutation({
    mutationFn: ({ tenantId, payload }: { tenantId: number; payload: ResetTenantPasswordPayload }) =>
      tenantService.resetPassword(tenantId, payload),
    onSuccess: (response) => {
      if (!response.success) {
        setResetPasswordError(getApiErrorMessage(response))
        setResetPasswordSuccess(null)
        return
      }

      setResetPasswordError(null)
      setResetPasswordSuccess(response.message || 'Tenant password reset.')
    },
    onError: (mutationError) => {
      setResetPasswordError(getUnknownErrorMessage(mutationError))
      setResetPasswordSuccess(null)
    },
  })

  const tenants = tenantsQuery.data?.data?.items ?? []
  const totalRecords = tenantsQuery.data?.data?.totalRecords ?? 0
  const isSaving = createMutation.isPending || updateMutation.isPending

  const handleSubmit = (payload: TenantPayload) => {
    setTenantDialogError(null)
    if (editingTenant) {
      updateMutation.mutate({
        tenantId: editingTenant.tenantId,
        payload: {
          name: payload.name,
          email: payload.email,
          phone: payload.phone,
          nationalId: payload.nationalId,
        },
      })
      return
    }

    createMutation.mutate(payload)
  }

  return (
    <>
      <PageHeader
        title="Manage Tenants"
        subtitle="Register tenants, update profiles, assign flats, and enforce unpaid-bill delete rules."
        action={
          <Button
            variant="contained"
            startIcon={<UserPlus size={18} />}
            onClick={() => {
              setEditingTenant(null)
              setTenantDialogError(null)
              setDialogOpen(true)
            }}
          >
            Add tenant
          </Button>
        }
      />

      <Stack spacing={2}>
        {error ? (
          <Alert severity="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        ) : null}

        <Paper sx={{ p: 2 }}>
          <TextField
            value={search}
            onChange={(event) => {
              setSearch(event.target.value)
              setPage(0)
            }}
            placeholder="Search name, email, NID, phone, or flat"
            size="small"
            slotProps={{
              input: {
                startAdornment: <Search size={18} />,
              },
            }}
            sx={{ maxWidth: 460 }}
            fullWidth
          />
        </Paper>

        <TableContainer component={Paper} sx={{ width: '100%', overflowX: 'auto' }}>
          <Table sx={{ minWidth: 1020 }}>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Phone</TableCell>
                <TableCell>National ID</TableCell>
                <TableCell>Flat</TableCell>
                <TableCell>Billing</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tenants.map((tenant) => (
                <TableRow key={tenant.tenantId} hover>
                  <TableCell>{tenant.name}</TableCell>
                  <TableCell>{tenant.email}</TableCell>
                  <TableCell>{tenant.phone || '-'}</TableCell>
                  <TableCell>{tenant.nationalId}</TableCell>
                  <TableCell>{tenant.flatNumber || 'Unassigned'}</TableCell>
                  <TableCell>
                    <Chip
                      label={tenant.hasUnpaidBills ? 'Unpaid bills' : 'Clear'}
                      color={tenant.hasUnpaidBills ? 'warning' : 'success'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                    <Tooltip title="Assign flat">
                      <IconButton
                        onClick={() => {
                          setSelectedTenant(tenant)
                          setAssignDialogOpen(true)
                        }}
                      >
                        <Home size={18} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit tenant">
                      <IconButton
                        onClick={() => {
                          setEditingTenant(tenant)
                          setTenantDialogError(null)
                          setDialogOpen(true)
                        }}
                      >
                        <Edit size={18} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Reset password">
                      <IconButton
                        onClick={() => {
                          setSelectedTenant(tenant)
                          setResetPasswordError(null)
                          setResetPasswordSuccess(null)
                          setResetPasswordDialogOpen(true)
                        }}
                      >
                        <KeyRound size={18} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete tenant">
                      <span>
                        <IconButton
                          color="error"
                          disabled={tenant.hasUnpaidBills}
                          onClick={() => setDeletingTenant(tenant)}
                        >
                          <Trash2 size={18} />
                        </IconButton>
                      </span>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
              {!tenantsQuery.isLoading && tenants.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7}>
                    <Box sx={{ py: 4, textAlign: 'center', color: 'text.secondary' }}>No tenants found.</Box>
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
          <TablePagination
            component="div"
            count={totalRecords}
            page={page}
            rowsPerPage={pageSize}
            rowsPerPageOptions={[5, 10, 25]}
            onPageChange={(_, nextPage) => setPage(nextPage)}
            onRowsPerPageChange={(event) => {
              setPageSize(Number(event.target.value))
              setPage(0)
            }}
          />
        </TableContainer>
      </Stack>

      <TenantFormDialog
        open={dialogOpen}
        tenant={editingTenant}
        loading={isSaving}
        error={tenantDialogError}
        onClose={() => {
          setDialogOpen(false)
          setEditingTenant(null)
          setTenantDialogError(null)
        }}
        onSubmit={handleSubmit}
      />

      <ResetPasswordDialog
        open={resetPasswordDialogOpen}
        tenant={selectedTenant}
        loading={resetPasswordMutation.isPending}
        error={resetPasswordError}
        success={resetPasswordSuccess}
        onClose={() => {
          setResetPasswordDialogOpen(false)
          setSelectedTenant(null)
          setResetPasswordError(null)
          setResetPasswordSuccess(null)
        }}
        onSubmit={(payload) => {
          if (selectedTenant) {
            setResetPasswordError(null)
            setResetPasswordSuccess(null)
            resetPasswordMutation.mutate({ tenantId: selectedTenant.tenantId, payload })
          }
        }}
      />

      <AssignFlatDialog
        open={assignDialogOpen}
        tenant={selectedTenant}
        loading={assignMutation.isPending}
        onClose={() => {
          setAssignDialogOpen(false)
          setSelectedTenant(null)
        }}
        onSubmit={(flatId) => {
          if (selectedTenant) {
            setError(null)
            assignMutation.mutate({ tenantId: selectedTenant.tenantId, flatId })
          }
        }}
      />

      <ConfirmDialog
        open={Boolean(deletingTenant)}
        title="Delete tenant"
        message={`Soft delete ${deletingTenant?.name ?? 'this tenant'}? This is blocked when unpaid bills exist.`}
        confirmLabel="Delete"
        loading={deleteMutation.isPending}
        onClose={() => setDeletingTenant(null)}
        onConfirm={() => {
          if (deletingTenant) {
            setError(null)
            deleteMutation.mutate(deletingTenant.tenantId)
          }
        }}
      />
    </>
  )
}
