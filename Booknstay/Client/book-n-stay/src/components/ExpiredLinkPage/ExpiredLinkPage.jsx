import React from "react";
import { Link as RouterLink } from 'react-router-dom';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import { createTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';

const defaultTheme = createTheme();


function ExpiredLinkPage() {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: '#F8F8F8',
      }}
    >
      <Container component="main" maxWidth="xs"> 
        <div>
          <Typography variant="h5" component="h2" sx={{ mt: 4}}>
            <b>Password Reset Link Expired</b>
          </Typography>
          <Typography variant="body1" sx={{ whiteSpace: 'nowrap' }}>
        The reset password link has expired. Please request a new one.
        </Typography>
        <Box sx={{ mt: 2 }}>
          <Button
            component={RouterLink}
            to="/forgot-password"
            variant="contained"
            size="large"
            sx={{ backgroundColor: '#1976D2', color: '#fff', '&:hover': { backgroundColor: '#125699' } }}
          >
            Resend Link
          </Button>
          </Box>
        </div>
      </Container>
    </Box>
  );
}

export default ExpiredLinkPage;
