import {
  Alert,
  Button,
  Card,
  CardContent,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material'
import { useQuery } from '@tanstack/react-query'
import { Download } from 'lucide-react'
import { useState } from 'react'
import { StatusChip } from '../../components/StatusChip'
import { PageHeader } from '../../components/PageHeader'
import { dashboardService } from '../../services/dashboardService'
import { reportService } from '../../services/reportService'
import { getUnknownErrorMessage } from '../../utils/apiError'

export function TenantDashboardPage() {
  const [error, setError] = useState<string | null>(null)
  const dashboardQuery = useQuery({
    queryKey: ['dashboard', 'tenant'],
    queryFn: dashboardService.getTenantDashboard,
  })
  const dashboard = dashboardQuery.data?.data
  const currentBill = dashboard?.currentBill
  const recentBills = dashboard?.recentBills ?? []

  const handleDownload = (billId: number) => {
    void reportService
      .downloadBillPdf(billId)
      .catch((downloadError: unknown) => setError(getUnknownErrorMessage(downloadError)))
  }

  return (
    <Stack spacing={3}>
      <PageHeader title="Tenant Dashboard" subtitle="View your current bill and payment history." />
      {error ? (
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      ) : null}
      <Card>
        <CardContent>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ justifyContent: 'space-between' }}>
            <Stack spacing={1}>
              <Typography variant="body2" color="text.secondary">
                Current bill {dashboard?.flatNumber ? `for ${dashboard.flatNumber}` : ''}
              </Typography>
              <Typography variant="h4">৳{(currentBill?.totalBill ?? 0).toLocaleString()}</Typography>
              {currentBill ? <StatusChip status={currentBill.status} /> : null}
              <Typography color="text.secondary">
                {currentBill ? `Due ${currentBill.dueDate}` : 'No bill has been generated yet.'}
              </Typography>
            </Stack>
            <Button
              variant="outlined"
              startIcon={<Download size={18} />}
              disabled={!currentBill}
              onClick={() => {
                if (currentBill) {
                  handleDownload(currentBill.billId)
                }
              }}
            >
              Download PDF
            </Button>
          </Stack>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Stack spacing={2}>
            <Stack spacing={0.5}>
              <Typography variant="h6">Bill Details</Typography>
              <Typography variant="body2" color="text.secondary">
                Recent rent and utility bill breakdown.
              </Typography>
            </Stack>

            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Month</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell align="right">Rent</TableCell>
                    <TableCell align="right">Electricity</TableCell>
                    <TableCell align="right">Water</TableCell>
                    <TableCell align="right">Gas</TableCell>
                    <TableCell align="right">Garbage</TableCell>
                    <TableCell align="right">Service</TableCell>
                    <TableCell align="right">Other</TableCell>
                    <TableCell align="right">Discount</TableCell>
                    <TableCell align="right">Total</TableCell>
                    <TableCell>Due</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>PDF</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {recentBills.map((bill) => (
                    <TableRow key={bill.billId} hover>
                      <TableCell>{bill.billMonth}</TableCell>
                      <TableCell>{bill.billingType}</TableCell>
                      <TableCell align="right">৳{bill.rentAmount.toLocaleString()}</TableCell>
                      <TableCell align="right">৳{bill.electricityBill.toLocaleString()}</TableCell>
                      <TableCell align="right">৳{bill.waterBill.toLocaleString()}</TableCell>
                      <TableCell align="right">৳{bill.gasBill.toLocaleString()}</TableCell>
                      <TableCell align="right">৳{bill.garbageCharge.toLocaleString()}</TableCell>
                      <TableCell align="right">৳{bill.serviceCharge.toLocaleString()}</TableCell>
                      <TableCell align="right">৳{bill.otherCharge.toLocaleString()}</TableCell>
                      <TableCell align="right">৳{bill.discount.toLocaleString()}</TableCell>
                      <TableCell align="right">৳{bill.totalBill.toLocaleString()}</TableCell>
                      <TableCell>{bill.dueDate}</TableCell>
                      <TableCell>
                        <StatusChip status={bill.status} />
                      </TableCell>
                      <TableCell>
                        <Button size="small" startIcon={<Download size={16} />} onClick={() => handleDownload(bill.billId)}>
                          PDF
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {!dashboardQuery.isLoading && recentBills.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={14}>No bill details found.</TableCell>
                    </TableRow>
                  ) : null}
                </TableBody>
              </Table>
            </TableContainer>
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  )
}
