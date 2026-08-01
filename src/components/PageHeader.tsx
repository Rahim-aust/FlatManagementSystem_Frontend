import { Box, Button, Stack, Typography } from '@mui/material'
import type { ReactNode } from 'react'

type PageHeaderProps = {
  title: string
  subtitle?: string
  action?: ReactNode
}

export function PageHeader({ title, subtitle, action }: PageHeaderProps) {
  return (
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      spacing={2}
      sx={{
        mb: 3,
        alignItems: { xs: 'stretch', sm: 'center' },
        justifyContent: 'space-between',
        minWidth: 0,
      }}
    >
      <Box>
        <Typography variant="h4" sx={{ fontSize: { xs: '1.6rem', sm: '2.125rem' }, wordBreak: 'break-word' }}>
          {title}
        </Typography>
        {subtitle ? (
          <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5 }}>
            {subtitle}
          </Typography>
        ) : null}
      </Box>
      {action ? <Box sx={{ width: { xs: '100%', sm: 'auto' }, '& .MuiButton-root': { width: { xs: '100%', sm: 'auto' } } }}>{action}</Box> : null}
    </Stack>
  )
}

export function HeaderButton({ children }: { children: ReactNode }) {
  return <Button variant="contained">{children}</Button>
}
