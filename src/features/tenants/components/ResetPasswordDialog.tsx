import { zodResolver } from '@hookform/resolvers/zod'
import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack } from '@mui/material'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'
import { PasswordTextField } from '../../../components/PasswordTextField'
import type { ResetTenantPasswordPayload, Tenant } from '../../../types/tenants'

const passwordRule = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/

const resetPasswordSchema = z
  .object({
    newPassword: z.string().regex(passwordRule, 'Use 8+ chars with uppercase, lowercase, number, and symbol'),
    confirmNewPassword: z.string().min(1, 'Confirm password is required'),
  })
  .refine((value) => value.newPassword === value.confirmNewPassword, {
    path: ['confirmNewPassword'],
    message: 'Confirm password must match the new password',
  })

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>

type ResetPasswordDialogProps = {
  open: boolean
  tenant?: Tenant | null
  loading?: boolean
  error?: string | null
  success?: string | null
  onClose: () => void
  onSubmit: (payload: ResetTenantPasswordPayload) => void
}

export function ResetPasswordDialog({
  open,
  tenant,
  loading = false,
  error = null,
  success = null,
  onClose,
  onSubmit,
}: ResetPasswordDialogProps) {
  const { control, handleSubmit, reset } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    values: {
      newPassword: '',
      confirmNewPassword: '',
    },
  })

  const handleClose = () => {
    reset()
    onClose()
  }

  const submit = handleSubmit((values) => onSubmit(values))

  return (
    <Dialog open={open} onClose={loading ? undefined : handleClose} maxWidth="xs" fullWidth>
      <DialogTitle>Reset tenant password</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          {error ? <Alert severity="error">{error}</Alert> : null}
          {success ? <Alert severity="success">{success}</Alert> : null}
          <Alert severity="info">
            Set a temporary password for {tenant?.name ?? 'this tenant'}. The system will email it to the tenant and force password change after login.
          </Alert>
          <Controller
            name="newPassword"
            control={control}
            render={({ field, fieldState }) => (
              <PasswordTextField
                {...field}
                label="New temporary password"
                error={Boolean(fieldState.error)}
                helperText={fieldState.error?.message ?? 'Example: Tenant@123'}
                fullWidth
              />
            )}
          />
          <Controller
            name="confirmNewPassword"
            control={control}
            render={({ field, fieldState }) => (
              <PasswordTextField
                {...field}
                label="Confirm password"
                error={Boolean(fieldState.error)}
                helperText={fieldState.error?.message}
                fullWidth
              />
            )}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Close
        </Button>
        <Button onClick={submit} variant="contained" disabled={loading || Boolean(success)}>
          Reset password
        </Button>
      </DialogActions>
    </Dialog>
  )
}
