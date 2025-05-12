import { Button, ButtonProps, CircularProgress } from '@mui/material';

interface LoadingButtonProps extends ButtonProps {
  loading?: boolean;
  loadingText?: string;
}

export function LoadingButton({
  children,
  loading = false,
  loadingText,
  disabled,
  ...props
}: LoadingButtonProps) {
  return (
    <Button
      disabled={disabled || loading}
      {...props}
      startIcon={
        loading ? (
          <CircularProgress
            size={20}
            color="inherit"
            sx={{ mr: 1 }}
          />
        ) : props.startIcon
      }
    >
      {loading ? loadingText || children : children}
    </Button>
  );
} 