import { zodResolver } from '@hookform/resolvers/zod'
import { Alert, Button, Card, CardContent, Stack } from '@mui/material'
import { KeyRound } from 'lucide-react'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { PageHeader } from '../../components/PageHeader'
import { PasswordTextField } from '../../components/PasswordTextField'
import { authService } from '../../services/authService'
import { authStore } from '../../store/authStore'
import { getApiErrorMessage, getUnknownErrorMessage } from '../../utils/apiError'

const passwordRule = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z
      .string()
      .regex(passwordRule, 'Use 8+ chars with uppercase, lowercase, number, and symbol'),
    confirmNewPassword: z.string().min(1, 'Confirm password is required'),
  })
  .refine((value) => value.newPassword === value.confirmNewPassword, {
    path: ['confirmNewPassword'],
    message: 'Confirm password must match the new password',
  })

type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>

export function ChangePasswordPage() {
  const [message, setMessage] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)
  const navigate = useNavigate()
  const user = authStore.getUser()
  const isTenant = user?.roles.includes('Tenant')
  const title = isTenant ? 'Change Temporary Password' : 'Change Password'
  const subtitle = user?.mustChangePassword
    ? 'Please change your temporary password before using the system.'
    : 'Update your account password.'
  const { control, handleSubmit, formState } = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmNewPassword: '',
    },
  })

  const onSubmit = handleSubmit(async (values) => {
    setMessage(null)
    setIsSuccess(false)

    const response = await authService.changePassword(values).catch((error: unknown) => {
      setMessage(getUnknownErrorMessage(error))
      return null
    })

    if (!response) {
      return
    }

    if (!response.success) {
      setMessage(getApiErrorMessage(response))
      return
    }

    // Changing the admin password revokes refresh tokens on the server.
    // Clearing local auth here keeps the browser session aligned with the backend.
    setIsSuccess(true)
    setMessage(response.message || 'Password changed. Please sign in again.')
    authStore.clear()
    window.setTimeout(() => navigate('/login', { replace: true }), 1200)
  })

  return (
    <Stack spacing={3}>
      <PageHeader title={title} subtitle={subtitle} />
      <Card sx={{ maxWidth: 560 }}>
        <CardContent>
          <Stack component="form" spacing={2.5} onSubmit={onSubmit}>
            {message ? <Alert severity={isSuccess ? 'success' : 'error'}>{message}</Alert> : null}
            <Controller
              name="currentPassword"
              control={control}
              render={({ field, fieldState }) => (
                <PasswordTextField
                  {...field}
                  label="Current password"
                  autoComplete="current-password"
                  error={Boolean(fieldState.error)}
                  helperText={fieldState.error?.message}
                  fullWidth
                />
              )}
            />
            <Controller
              name="newPassword"
              control={control}
              render={({ field, fieldState }) => (
                <PasswordTextField
                  {...field}
                  label="New password"
                  autoComplete="new-password"
                  error={Boolean(fieldState.error)}
                  helperText={fieldState.error?.message ?? 'Example: Strong@123'}
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
                  label="Confirm new password"
                  autoComplete="new-password"
                  error={Boolean(fieldState.error)}
                  helperText={fieldState.error?.message}
                  fullWidth
                />
              )}
            />
            <Button
              type="submit"
              variant="contained"
              startIcon={<KeyRound size={18} />}
              disabled={formState.isSubmitting || isSuccess}
            >
              Change password
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  )
}
