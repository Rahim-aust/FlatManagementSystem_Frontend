import {
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
import { useQuery } from '@tanstack/react-query'
import { Download } from 'lucide-react'
import { PageHeader } from '../../components/PageHeader'
import { StatusChip } from '../../components/StatusChip'
import { billService } from '../../services/billService'
import { reportService } from '../../services/reportService'

export function BillHistoryPage() {
  const billsQuery = useQuery({
    queryKey: ['my-bills'],
    queryFn: billService.getMyBills,
  })

  const bills = billsQuery.data?.data ?? []

  return (
    <>
      <PageHeader title="Bill History" subtitle="Review previous bills and payment status." />
      <Stack spacing={2}>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Month</TableCell>
                <TableCell>Flat</TableCell>
                <TableCell>Total</TableCell>
                <TableCell>Due date</TableCell>
                <TableCell>Status</TableCell>
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
                  <TableCell>
                    <Button size="small" startIcon={<Download size={16} />} onClick={() => void reportService.downloadBillPdf(bill.billId)}>
                      PDF
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {!billsQuery.isLoading && bills.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6}>No bills found.</TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </TableContainer>
      </Stack>
    </>
  )
}
