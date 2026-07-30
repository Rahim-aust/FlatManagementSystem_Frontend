import { createTheme } from '@mui/material/styles'

export const appTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#2155a3',
      dark: '#183c75',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#0f766e',
    },
    success: {
      main: '#188038',
    },
    warning: {
      main: '#b7791f',
    },
    error: {
      main: '#c2413a',
    },
    background: {
      default: '#f5f7fb',
      paper: '#ffffff',
    },
    text: {
      primary: '#172033',
      secondary: '#5e6a7d',
    },
    divider: '#dfe5ee',
  },
  shape: {
    borderRadius: 8,
  },
  typography: {
    fontFamily:
      'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    h4: {
      fontWeight: 700,
      letterSpacing: 0,
    },
    h5: {
      fontWeight: 700,
      letterSpacing: 0,
    },
    h6: {
      fontWeight: 700,
      letterSpacing: 0,
    },
    button: {
      fontWeight: 700,
      textTransform: 'none',
      letterSpacing: 0,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          boxShadow: '0 1px 2px rgba(23, 32, 51, 0.08)',
          border: '1px solid #dfe5ee',
        },
      },
    },
  },
})
