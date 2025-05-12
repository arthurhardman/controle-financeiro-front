import { Card, CardContent, Skeleton, Box } from '@mui/material';

export function TransactionSkeleton() {
  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ flex: 1 }}>
            <Skeleton variant="text" width="60%" height={24} />
            <Skeleton variant="text" width="40%" height={20} />
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Skeleton variant="text" width={80} height={24} />
            <Skeleton variant="circular" width={24} height={24} />
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

export function TransactionListSkeleton() {
  return (
    <>
      {[1, 2, 3, 4, 5].map((index) => (
        <TransactionSkeleton key={index} />
      ))}
    </>
  );
} 