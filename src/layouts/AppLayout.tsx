import {
  AppBar,
  Box,
  Button,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
} from '@mui/material'
import { Building2, ClipboardList, FileText, Home, KeyRound, LogOut, Menu, Receipt, Users } from 'lucide-react'
import { useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { NotificationBell } from '../components/NotificationBell'
import { authStore } from '../store/authStore'

const drawerWidth = 264

const adminItems = [
  { label: 'Dashboard', path: '/admin/dashboard', icon: Home },
  { label: 'Flats', path: '/admin/flats', icon: Building2 },
  { label: 'Tenants', path: '/admin/tenants', icon: Users },
  { label: 'Generate Bill', path: '/admin/bills/generate', icon: Receipt },
  { label: 'Reports', path: '/admin/reports', icon: FileText },
  { label: 'Change Password', path: '/admin/change-password', icon: KeyRound },
]

const tenantItems = [
  { label: 'Dashboard', path: '/tenant/dashboard', icon: Home },
  { label: 'Bill History', path: '/tenant/bills', icon: ClipboardList },
  { label: 'Change Password', path: '/tenant/change-password', icon: KeyRound },
]

export function AppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const user = authStore.getUser()
  const isTenant = user?.roles.includes('Tenant')
  const items = isTenant ? tenantItems : adminItems
  const portalTitle = isTenant ? 'Tenant Portal' : 'Admin Panel'

  const handleLogout = () => {
    authStore.clear()
    navigate('/login', { replace: true })
  }

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ px: 3, py: 2.5 }}>
        <Typography variant="h6">Flat Manager</Typography>
        <Typography variant="body2" color="text.secondary">
          {portalTitle}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {user?.fullName ?? user?.userName}
        </Typography>
      </Box>
      <Divider />
      <List sx={{ px: 1.5, py: 2 }}>
        {items.map((item) => {
          const Icon = item.icon
          const selected = location.pathname === item.path

          return (
            <ListItemButton
              key={item.path}
              component={NavLink}
              to={item.path}
              selected={selected}
              onClick={() => setMobileOpen(false)}
              sx={{ borderRadius: 1, mb: 0.5 }}
            >
              <ListItemIcon sx={{ minWidth: 38 }}>
                <Icon size={19} />
              </ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          )
        })}
      </List>
      <Box sx={{ flexGrow: 1 }} />
      <Box sx={{ p: 2 }}>
        <Button fullWidth variant="outlined" startIcon={<LogOut size={18} />} onClick={handleLogout}>
          Sign out
        </Button>
      </Box>
    </Box>
  )

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', width: '100%', overflowX: 'hidden' }}>
      <AppBar
        position="fixed"
        color="inherit"
        elevation={0}
        sx={{
          borderBottom: 1,
          borderColor: 'divider',
          ml: { md: `${drawerWidth}px` },
          width: { md: `calc(100% - ${drawerWidth}px)` },
        }}
      >
        <Toolbar>
          <IconButton edge="start" onClick={() => setMobileOpen(true)} sx={{ display: { md: 'none' }, mr: 1 }}>
            <Menu size={22} />
          </IconButton>
          <Typography variant="h6" noWrap sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
            {portalTitle}
          </Typography>
          <Box sx={{ flexGrow: 1 }} />
          <NotificationBell />
        </Toolbar>
      </AppBar>
      <Box component="nav" sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}>
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { width: drawerWidth },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          minWidth: 0,
          width: { xs: '100%', md: `calc(100% - ${drawerWidth}px)` },
          px: { xs: 1.5, sm: 2, md: 3 },
          py: { xs: 2, md: 3 },
          mt: { xs: 7, md: 8 },
          overflowX: 'hidden',
        }}
      >
        <Outlet />
      </Box>
    </Box>
  )
}
