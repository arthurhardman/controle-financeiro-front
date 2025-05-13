import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  useTheme,
  useMediaQuery,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  AccountBalance as AccountBalanceIcon,
  Savings as SavingsIcon,
  Person as PersonIcon,
  Logout as LogoutIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const menuItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
  { text: 'Transações', icon: <AccountBalanceIcon />, path: '/transactions' },
  { text: 'Poupanças', icon: <SavingsIcon />, path: '/savings' },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleClose();
    logout();
    navigate('/login');
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  const adminMenuItems = user?.role === 'admin'
    ? [
        ...menuItems,
        { text: 'Usuários', icon: <PersonIcon />, path: '/users' },
      ]
    : menuItems;

  const drawer = (
    <Box sx={{ width: 250 }}>
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Avatar
          src={user?.photo}
          alt={user?.name}
          sx={{ 
            width: 40, 
            height: 40,
            border: '2px solid',
            borderColor: 'primary.main',
            boxShadow: '0 2px 8px rgba(37,99,235,0.15)',
          }}
        />
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            {user?.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {user?.email}
          </Typography>
        </Box>
      </Box>
      <Divider />
      <List>
        {adminMenuItems.map((item) => (
          <ListItem
            button
            key={item.text}
            onClick={() => handleNavigation(item.path)}
            selected={location.pathname === item.path}
            sx={{
              borderRadius: 2,
              mx: 1,
              my: 0.5,
              '&.Mui-selected': {
                backgroundColor: 'rgba(37,99,235,0.08)',
                '&:hover': {
                  backgroundColor: 'rgba(37,99,235,0.12)',
                },
              },
              '&:hover': {
                backgroundColor: 'rgba(37,99,235,0.04)',
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 40, color: location.pathname === item.path ? 'primary.main' : 'inherit' }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText 
              primary={item.text} 
              primaryTypographyProps={{ 
                fontWeight: location.pathname === item.path ? 600 : 400,
                color: location.pathname === item.path ? 'primary.main' : 'inherit',
              }}
            />
          </ListItem>
        ))}
        <ListItem
          button
          onClick={handleLogout}
          sx={{
            borderRadius: 2,
            mx: 1,
            my: 0.5,
            color: 'error.main',
            '&:hover': {
              backgroundColor: 'rgba(220,38,38,0.04)',
            },
          }}
        >
          <ListItemIcon sx={{ minWidth: 40, color: 'error.main' }}>
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText 
            primary="Sair" 
            primaryTypographyProps={{ 
              fontWeight: 600,
              color: 'error.main',
            }}
          />
        </ListItem>
      </List>
    </Box>
  );

  return (
    <>
      <AppBar 
        position="fixed" 
        sx={{ 
          backgroundColor: 'white',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        }}
      >
        <Toolbar>
          {isMobile && (
            <IconButton
              color="primary"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}
          <Typography 
            variant="h6" 
            component="div" 
            sx={{ 
              flexGrow: 1,
              fontWeight: 700,
              letterSpacing: 1,
              color: 'primary.main',
            }}
          >
            FinanceApp
          </Typography>
          {!isMobile && (
            <Box sx={{ display: 'flex', gap: 1 }}>
              {adminMenuItems.map((item) => (
                <Button
                  key={item.text}
                  color="primary"
                  startIcon={item.icon}
                  onClick={() => handleNavigation(item.path)}
                  sx={{
                    borderRadius: 2,
                    px: 2,
                    fontWeight: location.pathname === item.path ? 600 : 400,
                    backgroundColor: location.pathname === item.path ? 'rgba(37,99,235,0.08)' : 'transparent',
                    '&:hover': {
                      backgroundColor: 'rgba(37,99,235,0.12)',
                    },
                  }}
                >
                  {item.text}
                </Button>
              ))}
            </Box>
          )}
          <Box sx={{ ml: 2 }}>
            <IconButton
              size="small"
              onClick={handleMenu}
              sx={{ 
                p: 0.5,
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.1)',
                },
              }}
            >
              <Avatar
                src={user?.photo}
                alt={user?.name}
                sx={{ 
                  width: 32, 
                  height: 32,
                  border: '2px solid',
                  borderColor: 'white',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                }}
              />
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleClose}
              PaperProps={{
                sx: {
                  mt: 1,
                  borderRadius: 3,
                  boxShadow: '0 4px 24px rgba(37,99,235,0.15)',
                },
              }}
            >
              <Box sx={{ px: 2, py: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  {user?.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {user?.email}
                </Typography>
              </Box>
              <Divider />
              <MenuItem 
                onClick={() => {
                  handleClose();
                  handleNavigation('/profile');
                }}
                sx={{ 
                  borderRadius: 1,
                  mx: 1,
                  my: 0.5,
                  '&:hover': {
                    backgroundColor: 'rgba(37,99,235,0.04)',
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>
                  <PersonIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText primary="Perfil" />
              </MenuItem>
              <MenuItem 
                onClick={handleLogout}
                sx={{ 
                  borderRadius: 1,
                  mx: 1,
                  my: 0.5,
                  color: 'error.main',
                  '&:hover': {
                    backgroundColor: 'rgba(220,38,38,0.04)',
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 40, color: 'error.main' }}>
                  <LogoutIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText 
                  primary="Sair" 
                  primaryTypographyProps={{ 
                    fontWeight: 600,
                    color: 'error.main',
                  }}
                />
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>
      <Box component="nav">
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: 250,
              border: 'none',
              boxShadow: '0 4px 24px rgba(37,99,235,0.15)',
            },
          }}
        >
          {drawer}
        </Drawer>
      </Box>
      <Toolbar />
    </>
  );
} 