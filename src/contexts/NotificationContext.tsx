import React, { createContext, useContext, useState } from 'react';
import { Snackbar, Alert, AlertColor } from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';

interface NotificationContextData {
  showSuccess: (message: string) => void;
  showError: (message: string) => void;
  showInfo: (message: string) => void;
  showWarning: (message: string) => void;
}

const NotificationContext = createContext<NotificationContextData>({} as NotificationContextData);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [severity, setSeverity] = useState<AlertColor>('success');
  const [icon, setIcon] = useState<React.ReactNode>(<CheckCircleIcon />);

  const handleClose = () => {
    setOpen(false);
  };

  const showNotification = (message: string, severity: AlertColor, icon: React.ReactNode) => {
    setMessage(message);
    setSeverity(severity);
    setIcon(icon);
    setOpen(true);
  };

  const showSuccess = (message: string) => {
    showNotification(message, 'success', <CheckCircleIcon sx={{ fontSize: 20 }} />);
  };

  const showError = (message: string) => {
    showNotification(message, 'error', <ErrorIcon sx={{ fontSize: 20 }} />);
  };

  const showInfo = (message: string) => {
    showNotification(message, 'info', <InfoIcon sx={{ fontSize: 20 }} />);
  };

  const showWarning = (message: string) => {
    showNotification(message, 'warning', <WarningIcon sx={{ fontSize: 20 }} />);
  };

  return (
    <NotificationContext.Provider value={{ showSuccess, showError, showInfo, showWarning }}>
      {children}
      <Snackbar
        open={open}
        autoHideDuration={3000}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        sx={{
          '& .MuiSnackbar-root': {
            top: '24px !important',
          },
        }}
      >
        <Alert
          onClose={handleClose}
          severity={severity}
          variant="filled"
          icon={icon}
          sx={{
            width: '100%',
            borderRadius: 2,
            boxShadow: '0 4px 24px rgba(0,0,0,0.1)',
            '& .MuiAlert-icon': {
              fontSize: 20,
              padding: '8px 0',
            },
            '& .MuiAlert-message': {
              fontSize: '0.875rem',
              fontWeight: 500,
            },
          }}
        >
          {message}
        </Alert>
      </Snackbar>
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
}; 