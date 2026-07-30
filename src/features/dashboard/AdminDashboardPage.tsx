import { Button, Grid, Stack } from '@mui/material'
import { useQuery } from '@tanstack/react-query'
import { Building2, Receipt, Users } from 'lucide-react'
import { Link } from 'react-router-dom'
import { MetricCard } from '../../components/MetricCard'
import { PageHeader } from '../../components/PageHeader'
import { dashboardService } from '../../services/dashboardService'

export function AdminDashboardPage() {
  const dashboardQuery = useQuery({
    queryKey: ['dashboard', 'admin'],
    queryFn: dashboardService.getAdminDashboard,
  })
  const summary = dashboardQuery.data?.data

  return (
    <Stack spacing={3}>
      <PageHeader
        title="Admin Dashboard"
        subtitle="Monitor occupancy, tenant records, and bill status."
        action={
          <Button component={Link} to="/admin/bills/generate" variant="contained" startIcon={<Receipt size={18} />}>
            Generate bill
          </Button>
        }
      />
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 4 }}>
          <MetricCard label="Total flats" value={(summary?.totalFlats ?? 0).toString()} helper="Active flat records" icon={<Building2 size={28} />} />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <MetricCard label="Total tenants" value={(summary?.totalTenants ?? 0).toString()} helper="Active tenant profiles" icon={<Users size={28} />} />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <MetricCard label="Pending bills" value={(summary?.pendingBills ?? 0).toString()} helper={`৳${(summary?.pendingAmount ?? 0).toLocaleString()} pending`} icon={<Receipt size={28} />} />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <MetricCard label="Paid bills" value={(summary?.paidBills ?? 0).toString()} helper={`৳${(summary?.collectedAmount ?? 0).toLocaleString()} collected`} icon={<Receipt size={28} />} />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <MetricCard label="Overdue bills" value={(summary?.overdueBills ?? 0).toString()} helper="Requires follow-up" icon={<Receipt size={28} />} />
        </Grid>
      </Grid>
    </Stack>
  )
}
