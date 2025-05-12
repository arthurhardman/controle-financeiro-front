import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#2563EB',
      contrastText: '#fff',
    },
    secondary: {
      main: '#10B981',
      contrastText: '#fff',
    },
    error: {
      main: '#DC2626',
    },
    warning: {
      main: '#F59E42',
    },
    info: {
      main: '#3B82F6',
    },
    success: {
      main: '#059669',
    },
    background: {
      default: '#F3F4F6',
      paper: '#fff',
    },
    text: {
      primary: '#1F2937',
      secondary: '#6B7280',
    },
  },
  typography: {
    fontFamily: [
      'Inter',
      'Roboto',
      'Helvetica Neue',
      'Arial',
      'sans-serif',
    ].join(','),
    h1: { fontWeight: 700 },
    h2: { fontWeight: 700 },
    h3: { fontWeight: 700 },
    h4: { fontWeight: 700 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  shape: {
    borderRadius: 16,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 2px 8px rgba(37,99,235,0.08)',
          fontWeight: 600,
          transition: 'all 0.2s',
          '&:hover': {
            boxShadow: '0 4px 16px rgba(37,99,235,0.15)',
            transform: 'translateY(-2px) scale(1.03)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 18,
          boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 18,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
  },
}); 