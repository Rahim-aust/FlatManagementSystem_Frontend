import { Box, Typography } from '@mui/material'

type EmptyStateProps = {
  title: string
  message: string
}

export function EmptyState({ title, message }: EmptyStateProps) {
  return (
    <Box sx={{ border: 1, borderColor: 'divider', borderRadius: 1, p: 4, textAlign: 'center', bgcolor: 'background.paper' }}>
      <Typography variant="h6">{title}</Typography>
      <Typography color="text.secondary" sx={{ mt: 1 }}>
        {message}
      </Typography>
    </Box>
  )
}
