import React from 'react';
import { Box, Container } from '@mui/material';
import Navbar from './Navbar';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      minHeight: '100vh',
      bgcolor: 'background.default'
    }}>
      <Navbar />
      <Container maxWidth="lg" sx={{ 
        flexGrow: 1, 
        py: 4,
        px: { xs: 2, sm: 3, md: 4 }
      }}>
        {children}
      </Container>
    </Box>
  );
} 