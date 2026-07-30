import { Button, Card, CardContent, Stack, Typography } from '@mui/material'
import { useQuery } from '@tanstack/react-query'
import { Download } from 'lucide-react'
import { StatusChip } from '../../components/StatusChip'
import { PageHeader } from '../../components/PageHeader'
import { dashboardService } from '../../services/dashboardService'
import { reportService } from '../../services/reportService'

export function TenantDashboardPage() {
  const dashboardQuery = useQuery({
    queryKey: ['dashboard', 'tenant'],
    queryFn: dashboardService.getTenantDashboard,
  })
  const dashboard = dashboardQuery.data?.data
  const currentBill = dashboard?.currentBill

  return (
    <Stack spacing={3}>
      <PageHeader title="Tenant Dashboard" subtitle="View your current bill and payment history." />
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
                  void reportService.downloadBillPdf(currentBill.billId)
                }
              }}
            >
              Download PDF
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  )
}
