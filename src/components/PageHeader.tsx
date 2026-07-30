import { Box, Button, Stack, Typography } from '@mui/material'
import type { ReactNode } from 'react'

type PageHeaderProps = {
  title: string
  subtitle?: string
  action?: ReactNode
}

export function PageHeader({ title, subtitle, action }: PageHeaderProps) {
  return (
    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 3, justifyContent: 'space-between' }}>
      <Box>
        <Typography variant="h4">{title}</Typography>
        {subtitle ? (
          <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5 }}>
            {subtitle}
          </Typography>
        ) : null}
      </Box>
      {action ? <Box>{action}</Box> : null}
    </Stack>
  )
}

export function HeaderButton({ children }: { children: ReactNode }) {
  return <Button variant="contained">{children}</Button>
}
