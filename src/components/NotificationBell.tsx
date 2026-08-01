import {
  Badge,
  Box,
  Button,
  Divider,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  Popover,
  Typography,
} from '@mui/material'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Bell } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { notificationService } from '../services/notificationService'

export function NotificationBell() {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const notificationsQuery = useQuery({
    queryKey: ['notifications'],
    queryFn: notificationService.getNotifications,
    refetchInterval: 30_000,
  })

  const unreadCountQuery = useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: notificationService.getUnreadCount,
    refetchInterval: 30_000,
  })

  const markReadMutation = useMutation({
    mutationFn: notificationService.markAsRead,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
  })

  const notifications = notificationsQuery.data?.data ?? []
  const unreadCount = unreadCountQuery.data?.data ?? 0
  const open = Boolean(anchorEl)

  return (
    <>
      <IconButton color="inherit" onClick={(event) => setAnchorEl(event.currentTarget)} aria-label="Open notifications">
        <Badge color="error" badgeContent={unreadCount}>
          <Bell size={20} />
        </Badge>
      </IconButton>
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Box sx={{ width: { xs: 320, sm: 380 }, maxWidth: '90vw' }}>
          <Box sx={{ px: 2, py: 1.5 }}>
            <Typography variant="subtitle1">Notifications</Typography>
            <Typography variant="caption" color="text.secondary">
              Latest system updates
            </Typography>
          </Box>
          <Divider />
          <List dense disablePadding sx={{ maxHeight: 360, overflowY: 'auto' }}>
            {notifications.map((notification) => (
              <ListItemButton
                key={notification.notificationId}
                selected={!notification.isRead}
                onClick={() => {
                  markReadMutation.mutate(notification.notificationId)
                  setAnchorEl(null)

                  if (notification.link) {
                    navigate(notification.link)
                  }
                }}
              >
                <ListItemText
                  primary={notification.title}
                  secondary={
                    <>
                      <Typography component="span" variant="body2" color="text.secondary">
                        {notification.message}
                      </Typography>
                      <br />
                      <Typography component="span" variant="caption" color="text.secondary">
                        {new Date(notification.createdAt).toLocaleString()}
                      </Typography>
                    </>
                  }
                />
              </ListItemButton>
            ))}
            {!notificationsQuery.isLoading && notifications.length === 0 ? (
              <Box sx={{ px: 2, py: 3, textAlign: 'center' }}>
                <Typography color="text.secondary">No notifications yet.</Typography>
              </Box>
            ) : null}
          </List>
          <Divider />
          <Box sx={{ p: 1 }}>
            <Button fullWidth size="small" onClick={() => setAnchorEl(null)}>
              Close
            </Button>
          </Box>
        </Box>
      </Popover>
    </>
  )
}
