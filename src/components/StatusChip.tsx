import { Chip } from '@mui/material'

type StatusChipProps = {
  status: 'Pending' | 'Paid' | 'Overdue'
}

export function StatusChip({ status }: StatusChipProps) {
  const color = status === 'Paid' ? 'success' : status === 'Overdue' ? 'error' : 'warning'
  return <Chip label={status} color={color} size="small" />
}
