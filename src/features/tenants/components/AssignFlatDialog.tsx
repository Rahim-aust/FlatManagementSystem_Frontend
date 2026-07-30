import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  TextField,
} from '@mui/material'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { flatService } from '../../../services/flatService'
import type { Tenant } from '../../../types/tenants'

type AssignFlatDialogProps = {
  open: boolean
  tenant?: Tenant | null
  loading?: boolean
  onClose: () => void
  onSubmit: (flatId?: number | null) => void
}

export function AssignFlatDialog({ open, tenant, loading = false, onClose, onSubmit }: AssignFlatDialogProps) {
  const [flatId, setFlatId] = useState<string>('')
  const flatsQuery = useQuery({
    queryKey: ['flats', 'assignment-list'],
    queryFn: () => flatService.getFlats({ pageNumber: 1, pageSize: 100 }),
    enabled: open,
  })

  const flats = flatsQuery.data?.data?.items ?? []

  return (
    <Dialog open={open} onClose={loading ? undefined : onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Assign flat</DialogTitle>
      <DialogContent sx={{ pt: 1 }}>
        <TextField
          select
          label="Flat"
          value={flatId}
          onChange={(event) => setFlatId(event.target.value)}
          fullWidth
        >
          <MenuItem value="">No flat</MenuItem>
          {flats
            .filter((flat) => !flat.isOccupied || flat.flatId === tenant?.flatId)
            .map((flat) => (
              <MenuItem key={flat.flatId} value={flat.flatId.toString()}>
                {flat.flatNumber}
              </MenuItem>
            ))}
        </TextField>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          variant="contained"
          disabled={loading}
          onClick={() => onSubmit(flatId ? Number(flatId) : null)}
        >
          Assign
        </Button>
      </DialogActions>
    </Dialog>
  )
}
