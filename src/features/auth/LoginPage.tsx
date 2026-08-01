import { zodResolver } from '@hookform/resolvers/zod'
import { Alert, Box, Button, Card, CardContent, Stack, TextField, Typography } from '@mui/material'
import { KeyRound } from 'lucide-react'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { authService } from '../../services/authService'
import { authStore } from '../../store/authStore'
import { getApiErrorMessage, getUnknownErrorMessage } from '../../utils/apiError'
import { PasswordTextField } from '../../components/PasswordTextField'

const loginSchema = z.object({
  usernameOrEmail: z.string().min(1, 'Username or email is required'),
  password: z.string().min(1, 'Password is required'),
})

type LoginFormValues = z.infer<typeof loginSchema>

export function LoginPage() {
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()
  const { control, handleSubmit, formState } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      usernameOrEmail: '',
      password: '',
    },
  })

  const onSubmit = handleSubmit(async (values) => {
    setError(null)
    const response = await authService.login(values).catch((loginError: unknown) => {
      setError(getUnknownErrorMessage(loginError))
      return null
    })

    if (!response) {
      return
    }

    if (!response.success || !response.data) {
      setError(getApiErrorMessage(response))
      return
    }

    authStore.setAuth(response.data)
    const isTenant = response.data.user.roles.includes('Tenant')
    const path = response.data.user.mustChangePassword
      ? isTenant
        ? '/tenant/change-password'
        : '/admin/change-password'
      : isTenant
        ? '/tenant/dashboard'
        : '/admin/dashboard'
    navigate(path, { replace: true })
  })

  return (
    <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', px: 2, bgcolor: 'background.default' }}>
      <Card sx={{ width: '100%', maxWidth: 430 }}>
        <CardContent sx={{ p: 4 }}>
          <Stack spacing={3}>
            <Stack spacing={1}>
              <KeyRound size={30} />
              <Typography variant="h4">Flat Manager</Typography>
              <Typography color="text.secondary">Sign in to manage flats, tenants, and monthly bills.</Typography>
            </Stack>
            {error ? <Alert severity="error">{error}</Alert> : null}
            <Stack component="form" spacing={2.5} onSubmit={onSubmit}>
              <Controller
                name="usernameOrEmail"
                control={control}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    label="Username or email"
                    error={Boolean(fieldState.error)}
                    helperText={fieldState.error?.message}
                    autoComplete="username"
                    fullWidth
                  />
                )}
              />
              <Controller
                name="password"
                control={control}
                render={({ field, fieldState }) => (
                  <PasswordTextField
                    {...field}
                    label="Password"
                    error={Boolean(fieldState.error)}
                    helperText={fieldState.error?.message}
                    autoComplete="current-password"
                    fullWidth
                  />
                )}
              />
              <Button type="submit" variant="contained" size="large" disabled={formState.isSubmitting}>
                Sign in
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  )
}
