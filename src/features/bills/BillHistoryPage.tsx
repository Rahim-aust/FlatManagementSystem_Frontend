import {
  Alert,
  Button,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Download, HandCoins } from 'lucide-react'
import { useState } from 'react'
import { PageHeader } from '../../components/PageHeader'
import { StatusChip } from '../../components/StatusChip'
import { billService } from '../../services/billService'
import { reportService } from '../../services/reportService'
import { getUnknownErrorMessage } from '../../utils/apiError'

export function BillHistoryPage() {
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const queryClient = useQueryClient()
  const billsQuery = useQuery({
    queryKey: ['my-bills'],
    queryFn: billService.getMyBills,
  })

  const bills = billsQuery.data?.data ?? []
  const requestPaymentMutation = useMutation({
    mutationFn: (billId: number) => billService.requestPayment(billId),
    onSuccess: async (response) => {
      if (!response.success) {
        setError(response.message || 'Payment request failed.')
        return
      }

      setError(null)
      setMessage(response.message || 'Payment request submitted.')
      await queryClient.invalidateQueries({ queryKey: ['my-bills'] })
    },
    onError: (requestError) => setError(getUnknownErrorMessage(requestError)),
  })

  return (
    <>
      <PageHeader title="Bill History" subtitle="Review previous bills and payment status." />
      <Stack spacing={2}>
        {error ? (
          <Alert severity="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        ) : null}
        {message ? (
          <Alert severity="success" onClose={() => setMessage(null)}>
            {message}
          </Alert>
        ) : null}

        <TableContainer component={Paper} sx={{ width: '100%', overflowX: 'auto' }}>
          <Table sx={{ minWidth: 900 }}>
            <TableHead>
              <TableRow>
                <TableCell>Month</TableCell>
                <TableCell>Flat</TableCell>
                <TableCell>Total</TableCell>
                <TableCell>Due date</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Payment Request</TableCell>
                <TableCell>Request Paid</TableCell>
                <TableCell>PDF</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {bills.map((bill) => (
                <TableRow key={bill.billId} hover>
                  <TableCell>{bill.billMonth}</TableCell>
                  <TableCell>{bill.flatNumber ?? '-'}</TableCell>
                  <TableCell>৳{bill.totalBill.toLocaleString()}</TableCell>
                  <TableCell>{bill.dueDate}</TableCell>
                  <TableCell>
                    <StatusChip status={bill.status} />
                  </TableCell>
                  <TableCell>{bill.paymentRequestStatus}</TableCell>
                  <TableCell>
                    <Button
                      size="small"
                      startIcon={<HandCoins size={16} />}
                      disabled={bill.status === 'Paid' || bill.paymentRequestStatus === 'Requested' || requestPaymentMutation.isPending}
                      onClick={() => requestPaymentMutation.mutate(bill.billId)}
                    >
                      Request
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
                  <TableCell colSpan={8}>No bills found.</TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </TableContainer>
      </Stack>
    </>
  )
}
