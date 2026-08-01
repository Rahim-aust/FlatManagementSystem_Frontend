import { Card, CardContent, Stack, Typography } from '@mui/material'
import type { ReactNode } from 'react'

type MetricCardProps = {
  label: string
  value: string
  helper: string
  icon: ReactNode
}

export function MetricCard({ label, value, helper, icon }: MetricCardProps) {
  return (
    <Card>
      <CardContent>
        <Stack direction="row" spacing={2} sx={{ alignItems: 'flex-start', justifyContent: 'space-between', minWidth: 0 }}>
          <Stack spacing={0.5} sx={{ minWidth: 0 }}>
            <Typography variant="body2" color="text.secondary">
              {label}
            </Typography>
            <Typography variant="h5" sx={{ overflowWrap: 'anywhere' }}>
              {value}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {helper}
            </Typography>
          </Stack>
          {icon}
        </Stack>
      </CardContent>
    </Card>
  )
}
