import { zodResolver } from '@hookform/resolvers/zod'
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  TextField,
} from '@mui/material'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'
import { PasswordTextField } from '../../../components/PasswordTextField'
import type { Tenant, TenantPayload } from '../../../types/tenants'

const tenantSchema = z.object({
  name: z.string().min(1, 'Name is required').max(150),
  email: z.string().min(1, 'Email is required').email().max(256),
  password: z.string().optional(),
  phone: z.string().max(30).optional(),
  nationalId: z.string().min(1, 'National ID is required').max(50),
})

type TenantFormValues = z.infer<typeof tenantSchema>

type TenantFormDialogProps = {
  open: boolean
  tenant?: Tenant | null
  loading?: boolean
  error?: string | null
  onClose: () => void
  onSubmit: (payload: TenantPayload) => void
}

export function TenantFormDialog({ open, tenant, loading = false, error = null, onClose, onSubmit }: TenantFormDialogProps) {
  const { control, handleSubmit, reset } = useForm<TenantFormValues>({
    resolver: zodResolver(
      tenantSchema.superRefine((value, ctx) => {
        if (!tenant && value.password && !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/.test(value.password)) {
          ctx.addIssue({
            code: 'custom',
            path: ['password'],
            message: 'Use 8+ chars with uppercase, lowercase, number, and symbol',
          })
        }
      }),
    ),
    values: {
      name: tenant?.name ?? '',
      email: tenant?.email ?? '',
      password: '',
      phone: tenant?.phone ?? '',
      nationalId: tenant?.nationalId ?? '',
    },
  })

  const handleClose = () => {
    reset()
    onClose()
  }

  const submit = handleSubmit((values) => {
    onSubmit({
      name: values.name,
      email: values.email,
      password: values.password || undefined,
      phone: values.phone || undefined,
      nationalId: values.nationalId,
    })
  })

  return (
    <Dialog open={open} onClose={loading ? undefined : handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>{tenant ? 'Edit tenant' : 'Add tenant'}</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ pt: 1 }}>
          {error ? (
            <Grid size={{ xs: 12 }}>
              <Alert severity="error">{error}</Alert>
            </Grid>
          ) : null}
          <Grid size={{ xs: 12, sm: 6 }}>
            <Controller
              name="name"
              control={control}
              render={({ field, fieldState }) => (
                <TextField {...field} label="Name" error={Boolean(fieldState.error)} helperText={fieldState.error?.message} fullWidth />
              )}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Controller
              name="email"
              control={control}
              render={({ field, fieldState }) => (
                <TextField {...field} label="Email" error={Boolean(fieldState.error)} helperText={fieldState.error?.message} fullWidth />
              )}
            />
          </Grid>
          {!tenant ? (
            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller
                name="password"
                control={control}
                render={({ field, fieldState }) => (
                  <PasswordTextField
                    {...field}
                    label="Password (optional)"
                    error={Boolean(fieldState.error)}
                    helperText={fieldState.error?.message ?? 'Leave blank to auto-generate and email credentials.'}
                    fullWidth
                  />
                )}
              />
            </Grid>
          ) : null}
          <Grid size={{ xs: 12, sm: 6 }}>
            <Controller
              name="phone"
              control={control}
              render={({ field, fieldState }) => (
                <TextField {...field} label="Phone" error={Boolean(fieldState.error)} helperText={fieldState.error?.message} fullWidth />
              )}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Controller
              name="nationalId"
              control={control}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  label="National ID"
                  error={Boolean(fieldState.error)}
                  helperText={fieldState.error?.message}
                  fullWidth
                />
              )}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Button onClick={submit} variant="contained" disabled={loading}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  )
}
