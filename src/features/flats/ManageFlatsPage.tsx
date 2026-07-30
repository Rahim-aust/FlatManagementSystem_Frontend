import {
  Alert,
  Box,
  Button,
  Chip,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Tooltip,
} from '@mui/material'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Edit, Plus, Search, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { ConfirmDialog } from '../../components/ConfirmDialog'
import { PageHeader } from '../../components/PageHeader'
import { flatService } from '../../services/flatService'
import type { Flat, FlatPayload } from '../../types/flats'
import { getApiErrorMessage, getUnknownErrorMessage } from '../../utils/apiError'
import { FlatFormDialog } from './components/FlatFormDialog'

export function ManageFlatsPage() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(10)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingFlat, setEditingFlat] = useState<Flat | null>(null)
  const [deletingFlat, setDeletingFlat] = useState<Flat | null>(null)
  const [error, setError] = useState<string | null>(null)

  const flatsQuery = useQuery({
    queryKey: ['flats', search, page, pageSize],
    queryFn: () =>
      flatService.getFlats({
        search: search || undefined,
        pageNumber: page + 1,
        pageSize,
      }),
  })

  const invalidateFlats = async () => {
    await queryClient.invalidateQueries({ queryKey: ['flats'] })
  }

  const createMutation = useMutation({
    mutationFn: flatService.createFlat,
    onSuccess: async (response) => {
      if (!response.success) {
        setError(getApiErrorMessage(response))
        return
      }

      setDialogOpen(false)
      await invalidateFlats()
    },
    onError: (mutationError) => setError(getUnknownErrorMessage(mutationError)),
  })

  const updateMutation = useMutation({
    mutationFn: ({ flatId, payload }: { flatId: number; payload: FlatPayload }) =>
      flatService.updateFlat(flatId, payload),
    onSuccess: async (response) => {
      if (!response.success) {
        setError(getApiErrorMessage(response))
        return
      }

      setDialogOpen(false)
      setEditingFlat(null)
      await invalidateFlats()
    },
    onError: (mutationError) => setError(getUnknownErrorMessage(mutationError)),
  })

  const deleteMutation = useMutation({
    mutationFn: flatService.deleteFlat,
    onSuccess: async (response) => {
      if (!response.success) {
        setError(getApiErrorMessage(response))
        return
      }

      setDeletingFlat(null)
      await invalidateFlats()
    },
    onError: (mutationError) => setError(getUnknownErrorMessage(mutationError)),
  })

  const flats = flatsQuery.data?.data?.items ?? []
  const totalRecords = flatsQuery.data?.data?.totalRecords ?? 0
  const isSaving = createMutation.isPending || updateMutation.isPending

  const handleSubmit = (payload: FlatPayload) => {
    setError(null)
    if (editingFlat) {
      updateMutation.mutate({ flatId: editingFlat.flatId, payload })
      return
    }

    createMutation.mutate(payload)
  }

  return (
    <>
      <PageHeader
        title="Manage Flats"
        subtitle="Add, edit, search, paginate, and soft-delete apartment units."
        action={
          <Button
            variant="contained"
            startIcon={<Plus size={18} />}
            onClick={() => {
              setEditingFlat(null)
              setDialogOpen(true)
            }}
          >
            Add flat
          </Button>
        }
      />

      <Stack spacing={2}>
        {error ? (
          <Alert severity="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        ) : null}

        <Paper sx={{ p: 2 }}>
          <TextField
            value={search}
            onChange={(event) => {
              setSearch(event.target.value)
              setPage(0)
            }}
            placeholder="Search flat number"
            size="small"
            slotProps={{
              input: {
                startAdornment: <Search size={18} />,
              },
            }}
            sx={{ maxWidth: 360 }}
            fullWidth
          />
        </Paper>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Flat</TableCell>
                <TableCell>Floor</TableCell>
                <TableCell>Size</TableCell>
                <TableCell>Rent</TableCell>
                <TableCell>Billing</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {flats.map((flat) => (
                <TableRow key={flat.flatId} hover>
                  <TableCell>{flat.flatNumber}</TableCell>
                  <TableCell>{flat.floor}</TableCell>
                  <TableCell>{flat.sizeSqFt.toLocaleString()} sq ft</TableCell>
                  <TableCell>৳{flat.rentAmount.toLocaleString()}</TableCell>
                  <TableCell>{flat.billingType}</TableCell>
                  <TableCell>
                    <Chip
                      label={flat.isOccupied ? 'Occupied' : 'Available'}
                      color={flat.isOccupied ? 'warning' : 'success'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Edit flat">
                      <IconButton
                        onClick={() => {
                          setEditingFlat(flat)
                          setDialogOpen(true)
                        }}
                      >
                        <Edit size={18} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete flat">
                      <span>
                        <IconButton color="error" disabled={flat.isOccupied} onClick={() => setDeletingFlat(flat)}>
                          <Trash2 size={18} />
                        </IconButton>
                      </span>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
              {!flatsQuery.isLoading && flats.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7}>
                    <Box sx={{ py: 4, textAlign: 'center', color: 'text.secondary' }}>No flats found.</Box>
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
          <TablePagination
            component="div"
            count={totalRecords}
            page={page}
            rowsPerPage={pageSize}
            rowsPerPageOptions={[5, 10, 25]}
            onPageChange={(_, nextPage) => setPage(nextPage)}
            onRowsPerPageChange={(event) => {
              setPageSize(Number(event.target.value))
              setPage(0)
            }}
          />
        </TableContainer>
      </Stack>

      <FlatFormDialog
        open={dialogOpen}
        flat={editingFlat}
        loading={isSaving}
        onClose={() => {
          setDialogOpen(false)
          setEditingFlat(null)
        }}
        onSubmit={handleSubmit}
      />

      <ConfirmDialog
        open={Boolean(deletingFlat)}
        title="Delete flat"
        message={`Soft delete flat ${deletingFlat?.flatNumber ?? ''}? This is blocked if a tenant is assigned.`}
        confirmLabel="Delete"
        loading={deleteMutation.isPending}
        onClose={() => setDeletingFlat(null)}
        onConfirm={() => {
          if (deletingFlat) {
            setError(null)
            deleteMutation.mutate(deletingFlat.flatId)
          }
        }}
      />
    </>
  )
}
