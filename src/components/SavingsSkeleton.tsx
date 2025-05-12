import { Card, Skeleton, Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';

export function SavingsSkeleton() {
  return (
    <Card sx={{ borderRadius: 2, boxShadow: '0 2px 8px rgba(37,99,235,0.08)' }}>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><Skeleton variant="text" width="60%" height={24} /></TableCell>
              <TableCell><Skeleton variant="text" width="40%" height={24} /></TableCell>
              <TableCell><Skeleton variant="text" width="30%" height={24} /></TableCell>
              <TableCell><Skeleton variant="text" width="40%" height={24} /></TableCell>
              <TableCell><Skeleton variant="text" width="30%" height={24} /></TableCell>
              <TableCell><Skeleton variant="text" width="30%" height={24} /></TableCell>
              <TableCell align="right"><Skeleton variant="text" width="20%" height={24} /></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {[1, 2, 3, 4, 5].map((index) => (
              <TableRow key={index}>
                <TableCell><Skeleton variant="text" width="80%" height={20} /></TableCell>
                <TableCell><Skeleton variant="text" width="60%" height={20} /></TableCell>
                <TableCell><Skeleton variant="text" width="40%" height={20} /></TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Skeleton variant="rectangular" width="100%" height={8} sx={{ borderRadius: 1 }} />
                    <Skeleton variant="text" width={40} height={20} />
                  </Box>
                </TableCell>
                <TableCell><Skeleton variant="text" width="30%" height={20} /></TableCell>
                <TableCell><Skeleton variant="text" width="40%" height={20} /></TableCell>
                <TableCell align="right">
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                    <Skeleton variant="circular" width={24} height={24} />
                    <Skeleton variant="circular" width={24} height={24} />
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Card>
  );
}

export function SavingsListSkeleton() {
  return <SavingsSkeleton />;
}