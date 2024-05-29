import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Container, Typography, Link } from '@mui/material';

const NotFound = () => {
  const isLoggedIn = !!localStorage.getItem('token');
  const userData = localStorage.getItem('user');
  const user = userData ? JSON.parse(userData) : null;
  const userType = user ? user.userType : null;

  const generateDashboardPath = () => {
    switch (userType) {
      case 'admin':
        return '/supervisor-dashboard';
      case 'supervisor':
        return '/supervisor-dashboard';
      case 'hotel':
        return '/hotel-dashboard';
      case 'customer':
        return '/select-hotels';
      default:
        return '/';
    }
  };

  return (
    <Container>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '80vh',
        }}
      >
        <Typography variant="h1" color="primary" sx={{ fontSize: '8rem', fontWeight: 'bold' }}>
          404
        </Typography>
        <Typography variant="h5" color="textSecondary" gutterBottom>
          Oops! Page not found.
        </Typography>
        <Typography variant="body1" color="textSecondary">
          The page you are looking for might be unavailable or does not exist.
        </Typography>
        {isLoggedIn ? (
          <Link component={RouterLink} to={generateDashboardPath()} color="primary" sx={{ marginTop: 2 }}>
            Go to Home
          </Link>
        ) : (
          <Link component={RouterLink} to="/login" color="primary" sx={{ marginTop: 2 }}>
            Go back to Login
          </Link>
        )}
      </Box>
    </Container>
  );
};

export default NotFound;
