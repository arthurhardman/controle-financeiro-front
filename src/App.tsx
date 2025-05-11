import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Box, Container } from '@mui/material';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Savings from './pages/Savings';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import PrivateRoute from './components/PrivateRoute';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <ThemeProvider>
        <Router>
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
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route
                  path="/"
                  element={
                    <PrivateRoute>
                      <Dashboard />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/transactions"
                  element={
                    <PrivateRoute>
                      <Transactions />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/savings"
                  element={
                    <PrivateRoute>
                      <Savings />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <PrivateRoute>
                      <Profile />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/settings"
                  element={
                    <PrivateRoute>
                      <Settings />
                    </PrivateRoute>
                  }
                />
              </Routes>
            </Container>
          </Box>
        </Router>
      </ThemeProvider>
    </AuthProvider>
  );
};

export default App; 