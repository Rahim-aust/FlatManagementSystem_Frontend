import { zodResolver } from '@hookform/resolvers/zod'
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  MenuItem,
  TextField,
} from '@mui/material'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'
import type { Flat, FlatPayload } from '../../../types/flats'

const flatSchema = z.object({
  flatNumber: z.string().min(1, 'Flat number is required').max(50),
  floor: z.coerce.number().int().min(0, 'Floor must be 0 or greater'),
  sizeSqFt: z.coerce.number().positive('Size must be greater than 0'),
  rentAmount: z.coerce.number().min(0, 'Rent cannot be negative'),
  billingType: z.enum(['Inclusive', 'Exclusive']),
})

type FlatFormInput = z.input<typeof flatSchema>
type FlatFormOutput = z.output<typeof flatSchema>

type FlatFormDialogProps = {
  open: boolean
  flat?: Flat | null
  loading?: boolean
  onClose: () => void
  onSubmit: (payload: FlatPayload) => void
}

export function FlatFormDialog({ open, flat, loading = false, onClose, onSubmit }: FlatFormDialogProps) {
  const { control, handleSubmit, reset } = useForm<FlatFormInput, unknown, FlatFormOutput>({
    resolver: zodResolver(flatSchema),
    values: {
      flatNumber: flat?.flatNumber ?? '',
      floor: flat?.floor ?? 0,
      sizeSqFt: flat?.sizeSqFt ?? 0,
      rentAmount: flat?.rentAmount ?? 0,
      billingType: flat?.billingType ?? 'Exclusive',
    },
  })

  const handleClose = () => {
    reset()
    onClose()
  }

  const submit = handleSubmit((values: FlatFormOutput) => {
    onSubmit(values)
  })

  return (
    <Dialog open={open} onClose={loading ? undefined : handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>{flat ? 'Edit flat' : 'Add flat'}</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ pt: 1 }}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Controller
              name="flatNumber"
              control={control}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  label="Flat number"
                  error={Boolean(fieldState.error)}
                  helperText={fieldState.error?.message}
                  fullWidth
                />
              )}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Controller
              name="floor"
              control={control}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  label="Floor"
                  type="number"
                  error={Boolean(fieldState.error)}
                  helperText={fieldState.error?.message}
                  fullWidth
                />
              )}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Controller
              name="sizeSqFt"
              control={control}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  label="Size"
                  type="number"
                  error={Boolean(fieldState.error)}
                  helperText={fieldState.error?.message}
                  fullWidth
                />
              )}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Controller
              name="rentAmount"
              control={control}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  label="Rent"
                  type="number"
                  error={Boolean(fieldState.error)}
                  helperText={fieldState.error?.message}
                  fullWidth
                />
              )}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Controller
              name="billingType"
              control={control}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  select
                  label="Billing type"
                  error={Boolean(fieldState.error)}
                  helperText={fieldState.error?.message}
                  fullWidth
                >
                  <MenuItem value="Exclusive">Exclusive rent</MenuItem>
                  <MenuItem value="Inclusive">Inclusive rent</MenuItem>
                </TextField>
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
