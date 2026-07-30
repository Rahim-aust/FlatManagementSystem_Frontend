import {
  Alert,
  Button,
  Card,
  CardContent,
  Grid,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { useMutation, useQuery } from '@tanstack/react-query'
import { Receipt } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { PageHeader } from '../../components/PageHeader'
import { billService } from '../../services/billService'
import { tenantService } from '../../services/tenantService'
import type { GenerateBillPayload } from '../../types/bills'
import { getApiErrorMessage, getUnknownErrorMessage } from '../../utils/apiError'

export function GenerateBillPage() {
  const [tenantId, setTenantId] = useState('')
  const [form, setForm] = useState({
    billMonth: '',
    electricityBill: 0,
    waterBill: 0,
    gasBill: 0,
    garbageCharge: 0,
    serviceCharge: 0,
    otherCharge: 0,
    discount: 0,
    dueDate: '',
  })
  const [message, setMessage] = useState<string | null>(null)

  const tenantsQuery = useQuery({
    queryKey: ['tenants', 'bill-generation'],
    queryFn: () => tenantService.getTenants({ pageNumber: 1, pageSize: 100 }),
  })

  const previewQuery = useQuery({
    queryKey: ['bill-preview', tenantId],
    queryFn: () => billService.getPreview(Number(tenantId)),
    enabled: Boolean(tenantId),
  })

  const generateMutation = useMutation({
    mutationFn: billService.generateBill,
    onSuccess: (response) => {
      setMessage(response.success ? 'Bill generated successfully.' : getApiErrorMessage(response))
    },
    onError: (mutationError) => setMessage(getUnknownErrorMessage(mutationError)),
  })

  const preview = previewQuery.data?.data
  const tenants = tenantsQuery.data?.data?.items ?? []
  const isInclusive = preview?.billingType === 'Inclusive'

  useEffect(() => {
    if (isInclusive) {
      setForm((current) => ({
        ...current,
        electricityBill: 0,
        waterBill: 0,
        gasBill: 0,
        garbageCharge: 0,
        serviceCharge: 0,
        otherCharge: 0,
        discount: 0,
      }))
    }
  }, [isInclusive])

  const total = useMemo(() => {
    if (!preview) {
      return 0
    }

    if (preview.billingType === 'Inclusive') {
      return preview.rentAmount
    }

    return (
      preview.rentAmount +
      form.electricityBill +
      form.waterBill +
      form.gasBill +
      form.garbageCharge +
      form.serviceCharge +
      form.otherCharge -
      form.discount
    )
  }, [form, preview])

  const updateNumber = (field: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [field]: value === '' ? 0 : Number(value) }))
  }

  const handleGenerate = () => {
    if (!tenantId || !form.billMonth || !form.dueDate) {
      setMessage('Tenant, billing month, and due date are required.')
      return
    }

    const payload: GenerateBillPayload = {
      tenantId: Number(tenantId),
      ...form,
    }

    generateMutation.mutate(payload)
  }

  return (
    <Stack spacing={3}>
      <PageHeader title="Generate Bill" subtitle="Create monthly rent and utility bills." />
      {message ? (
        <Alert severity={message.includes('successfully') ? 'success' : 'error'} onClose={() => setMessage(null)}>
          {message}
        </Alert>
      ) : null}
      <Card>
        <CardContent>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField select label="Tenant" value={tenantId} onChange={(event) => setTenantId(event.target.value)} fullWidth>
                {tenants.map((tenant) => (
                  <MenuItem key={tenant.tenantId} value={tenant.tenantId.toString()}>
                    {tenant.name} {tenant.flatNumber ? `- ${tenant.flatNumber}` : ''}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <TextField
                label="Bill month"
                type="date"
                value={form.billMonth}
                onChange={(event) => setForm((current) => ({ ...current, billMonth: event.target.value }))}
                fullWidth
                slotProps={{ inputLabel: { shrink: true } }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <TextField
                label="Due date"
                type="date"
                value={form.dueDate}
                onChange={(event) => setForm((current) => ({ ...current, dueDate: event.target.value }))}
                fullWidth
                slotProps={{ inputLabel: { shrink: true } }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField label="Rent" value={preview?.rentAmount ?? 0} fullWidth disabled />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField label="Billing type" value={preview?.billingType ?? ''} fullWidth disabled />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField label="Preview total" value={`৳${total.toLocaleString()}`} fullWidth disabled />
            </Grid>
            {[
              ['electricityBill', 'Electricity'],
              ['waterBill', 'Water'],
              ['gasBill', 'Gas'],
              ['garbageCharge', 'Garbage'],
              ['serviceCharge', 'Service charge'],
              ['otherCharge', 'Other charge'],
              ['discount', 'Discount'],
            ].map(([field, label]) => (
              <Grid key={field} size={{ xs: 12, md: 4 }}>
                <TextField
                  label={label}
                  type="number"
                  value={form[field as keyof typeof form]}
                  onChange={(event) => updateNumber(field as keyof typeof form, event.target.value)}
                  fullWidth
                  disabled={isInclusive}
                />
              </Grid>
            ))}
          </Grid>
          {isInclusive ? (
            <Typography color="text.secondary" sx={{ mt: 2 }}>
              This flat uses inclusive rent, so utility fields are covered by rent and are not charged separately.
            </Typography>
          ) : null}
          <Button sx={{ mt: 3 }} variant="contained" startIcon={<Receipt size={18} />} onClick={handleGenerate} disabled={generateMutation.isPending}>
            Generate bill
          </Button>
        </CardContent>
      </Card>
    </Stack>
  )
}
