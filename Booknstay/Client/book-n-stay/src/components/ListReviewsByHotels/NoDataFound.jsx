import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Container, Typography, Button } from '@mui/material';

const NoDataFound = () => {
  const userData = localStorage.getItem('user');
  const user = userData ? JSON.parse(userData) : null;
  const userType = user ? user.userType : null;

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
        <img alt='No data found' src='https://booknstay.innovaturelabs.com/No_data.png' height= '30%' width='30%' />
        <Typography variant="h5" color="textSecondary" gutterBottom>
        <br></br>Oops! No data found
        </Typography>
        {userType == 'hotel' && (
        <Button component={RouterLink} to="/hotel-dashboard" variant="outlined" color="primary" sx={{ marginTop: 2 }}>
            Go back
        </Button>
        )}
          {userType == 'admin' && (
        <Button component={RouterLink} to="/supervisor-dashboard" variant="outlined" color="primary" sx={{ marginTop: 2 }}>
            Go back
        </Button>
        )}
         {userType == 'supervisor' && (
        <Button component={RouterLink} to="/supervisor-dashboard" variant="outlined" color="primary" sx={{ marginTop: 2 }}>
            Go back
        </Button>
        )}
        {userType == 'customer' && (
        <Button component={RouterLink} to="/" variant="outlined" color="primary" sx={{ marginTop: 2 }}>
            Go back
        </Button>
        )}
      </Box>
    </Container>
  );
};

export default NoDataFound;
