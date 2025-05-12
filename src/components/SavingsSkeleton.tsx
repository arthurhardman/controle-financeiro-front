import { Card, CardContent, Skeleton, Box, Grid } from '@mui/material';

export function SavingsCardSkeleton() {
  return (
    <Card>
      <CardContent>
        <Box sx={{ mb: 2 }}>
          <Skeleton variant="text" width="70%" height={28} />
          <Skeleton variant="text" width="50%" height={20} />
        </Box>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Skeleton variant="text" width="80%" height={20} />
            <Skeleton variant="text" width="60%" height={24} />
          </Grid>
          <Grid item xs={6}>
            <Skeleton variant="text" width="80%" height={20} />
            <Skeleton variant="text" width="60%" height={24} />
          </Grid>
        </Grid>
        <Box sx={{ mt: 2 }}>
          <Skeleton variant="rectangular" height={8} sx={{ borderRadius: 1 }} />
        </Box>
      </CardContent>
    </Card>
  );
}

export function SavingsListSkeleton() {
  return (
    <Grid container spacing={3}>
      {[1, 2, 3].map((index) => (
        <Grid item xs={12} md={4} key={index}>
          <SavingsCardSkeleton />
        </Grid>
      ))}
    </Grid>
  );
}