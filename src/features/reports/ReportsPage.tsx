import {
  Alert,
  Button,
  Chip,
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
import { Check, Download, X } from 'lucide-react'
import { ConfirmDialog } from '../../components/ConfirmDialog'
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
  const [pendingStatusChange, setPendingStatusChange] = useState<{
    billId: number
    tenantName: string
    currentStatus: BillStatus
    nextStatus: BillStatus
  } | null>(null)

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

  const reviewPaymentMutation = useMutation({
    mutationFn: ({ billId, decision }: { billId: number; decision: 'Approve' | 'Reject' }) =>
      billService.reviewPaymentRequest(billId, { decision }),
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
            sx={{ minWidth: { xs: '100%', sm: 220 } }}
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="Pending">Pending</MenuItem>
            <MenuItem value="Paid">Paid</MenuItem>
            <MenuItem value="Overdue">Overdue</MenuItem>
          </TextField>
        </Paper>

        <TableContainer component={Paper} sx={{ width: '100%', overflowX: 'auto' }}>
          <Table sx={{ minWidth: 1180 }}>
            <TableHead>
              <TableRow>
                <TableCell>Tenant</TableCell>
                <TableCell>Flat</TableCell>
                <TableCell>Month</TableCell>
                <TableCell>Total</TableCell>
                <TableCell>Due date</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Payment Request</TableCell>
                <TableCell>Update</TableCell>
                <TableCell>Review Request</TableCell>
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
                  <TableCell sx={{ minWidth: 150 }}>
                    <StatusChip status={bill.status} />
                  </TableCell>
                  <TableCell sx={{ minWidth: 170 }}>
                    <Chip
                      size="small"
                      label={bill.paymentRequestStatus}
                      color={
                        bill.paymentRequestStatus === 'Requested'
                          ? 'warning'
                          : bill.paymentRequestStatus === 'Approved'
                            ? 'success'
                            : bill.paymentRequestStatus === 'Rejected'
                              ? 'error'
                              : 'default'
                      }
                    />
                  </TableCell>
                  <TableCell sx={{ whiteSpace: 'nowrap' }}>
                    <TextField
                      select
                      size="small"
                      value={bill.status}
                      disabled={bill.status === 'Paid' || statusMutation.isPending}
                      onChange={(event) => {
                        const nextStatus = event.target.value as BillStatus

                        if (nextStatus === bill.status) {
                          return
                        }

                        setPendingStatusChange({
                          billId: bill.billId,
                          tenantName: bill.tenantName,
                          currentStatus: bill.status,
                          nextStatus,
                        })
                      }}
                    >
                      <MenuItem value="Pending">Pending</MenuItem>
                      <MenuItem value="Paid">Paid</MenuItem>
                      <MenuItem value="Overdue">Overdue</MenuItem>
                    </TextField>
                  </TableCell>
                  <TableCell>
                    <Button
                      size="small"
                      startIcon={<Check size={16} />}
                      disabled={bill.paymentRequestStatus !== 'Requested' || reviewPaymentMutation.isPending}
                      onClick={() => reviewPaymentMutation.mutate({ billId: bill.billId, decision: 'Approve' })}
                    >
                      Approve
                    </Button>
                    <Button
                      size="small"
                      color="error"
                      startIcon={<X size={16} />}
                      disabled={bill.paymentRequestStatus !== 'Requested' || reviewPaymentMutation.isPending}
                      onClick={() => reviewPaymentMutation.mutate({ billId: bill.billId, decision: 'Reject' })}
                    >
                      Reject
                    </Button>
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
                  <TableCell colSpan={10}>No bills found.</TableCell>
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

      <ConfirmDialog
        open={Boolean(pendingStatusChange)}
        title="Confirm status update"
        message={
          pendingStatusChange
            ? `Change ${pendingStatusChange.tenantName}'s bill status from ${pendingStatusChange.currentStatus} to ${pendingStatusChange.nextStatus}? Paid bills cannot be changed again after confirmation.`
            : ''
        }
        confirmLabel="Update status"
        loading={statusMutation.isPending}
        onClose={() => setPendingStatusChange(null)}
        onConfirm={() => {
          if (pendingStatusChange) {
            statusMutation.mutate({
              billId: pendingStatusChange.billId,
              nextStatus: pendingStatusChange.nextStatus,
            })
            setPendingStatusChange(null)
          }
        }}
      />
    </>
  )
}
