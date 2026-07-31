import {
  Alert,
  Button,
  MenuItem,
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
} from '@mui/material'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Download } from 'lucide-react'
import { PageHeader } from '../../components/PageHeader'
import { StatusChip } from '../../components/StatusChip'
import { billService } from '../../services/billService'
import { reportService } from '../../services/reportService'
import type { BillStatus } from '../../types/bills'
import { useState } from 'react'
import { getApiErrorMessage, getUnknownErrorMessage } from '../../utils/apiError'

export function ReportsPage() {
  const queryClient = useQueryClient()
  const [status, setStatus] = useState<BillStatus | ''>('')
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(10)
  const [error, setError] = useState<string | null>(null)

  const billsQuery = useQuery({
    queryKey: ['bills', status, page, pageSize],
    queryFn: () => billService.getBills({ status: status || undefined, pageNumber: page + 1, pageSize }),
  })

  const statusMutation = useMutation({
    mutationFn: ({ billId, nextStatus }: { billId: number; nextStatus: BillStatus }) =>
      billService.updateStatus(billId, nextStatus),
    onSuccess: async (response) => {
      if (!response.success) {
        setError(getApiErrorMessage(response))
        return
      }

      setError(null)
      await queryClient.invalidateQueries({ queryKey: ['bills'] })
    },
    onError: (mutationError) => setError(getUnknownErrorMessage(mutationError)),
  })

  const bills = billsQuery.data?.data?.items ?? []
  const totalRecords = billsQuery.data?.data?.totalRecords ?? 0

  return (
    <>
      <PageHeader
        title="Reports"
        subtitle="Filter pending, paid, and overdue bills."
        action={
          <Button
            variant="outlined"
            startIcon={<Download size={18} />}
            onClick={() =>
              void reportService
                .downloadBillReportPdf(status)
                .catch((downloadError: unknown) => setError(getUnknownErrorMessage(downloadError)))
            }
          >
            Download PDF
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
            select
            size="small"
            label="Status"
            value={status}
            onChange={(event) => {
              setStatus(event.target.value as BillStatus | '')
              setPage(0)
            }}
            sx={{ minWidth: 220 }}
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="Pending">Pending</MenuItem>
            <MenuItem value="Paid">Paid</MenuItem>
            <MenuItem value="Overdue">Overdue</MenuItem>
          </TextField>
        </Paper>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Tenant</TableCell>
                <TableCell>Flat</TableCell>
                <TableCell>Month</TableCell>
                <TableCell>Total</TableCell>
                <TableCell>Due date</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Update</TableCell>
                <TableCell>PDF</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {bills.map((bill) => (
                <TableRow key={bill.billId} hover>
                  <TableCell>{bill.tenantName}</TableCell>
                  <TableCell>{bill.flatNumber ?? '-'}</TableCell>
                  <TableCell>{bill.billMonth}</TableCell>
                  <TableCell>৳{bill.totalBill.toLocaleString()}</TableCell>
                  <TableCell>{bill.dueDate}</TableCell>
                  <TableCell>
                    <StatusChip status={bill.status} />
                  </TableCell>
                  <TableCell>
                    <TextField
                      select
                      size="small"
                      value={bill.status}
                      onChange={(event) =>
                        statusMutation.mutate({ billId: bill.billId, nextStatus: event.target.value as BillStatus })
                      }
                    >
                      <MenuItem value="Pending">Pending</MenuItem>
                      <MenuItem value="Paid">Paid</MenuItem>
                      <MenuItem value="Overdue">Overdue</MenuItem>
                    </TextField>
                  </TableCell>
                  <TableCell>
                    <Button
                      size="small"
                      startIcon={<Download size={16} />}
                      onClick={() =>
                        void reportService
                          .downloadBillPdf(bill.billId)
                          .catch((downloadError: unknown) => setError(getUnknownErrorMessage(downloadError)))
                      }
                    >
                      PDF
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {!billsQuery.isLoading && bills.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8}>No bills found.</TableCell>
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
    </>
  )
}
