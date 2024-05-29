import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Avatar,
  Box,
  Button,
  Container,
  CssBaseline,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
} from '@mui/material';

import { createTheme, ThemeProvider } from '@mui/material/styles';
import Swal from 'sweetalert2';
import { userService } from '../../UserService';
import ExpiredLinkPage from '../ExpiredLinkPage/ExpiredLinkPage';
import {
  LockOutlined as LockOutlinedIcon,
  Visibility,
  VisibilityOff
} from '@mui/icons-material';
import LockIcon from '@mui/icons-material/Lock';
import NavigationBar from '../NavigationBar/NavigationBar';
import { validators } from '../../Validations';

const defaultTheme = createTheme();

function ResetPassword() {
  const [formData, setFormData] = useState({ new_password: '', confirm_password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordsMatch, setPasswordsMatch] = useState(true);
  const [expiredLink, setExpiredLink] = useState(false);
  const { token } = useParams();
  const [formValid, setFormValid] = useState(false);
  const [isNotEmpty, setIsNotEmpty] = useState(false);
  const navigate = useNavigate();

  const checkTokenExpired = async () => {
    try {
      const response = await userService.CheckTokenExpired(token);
      return response.data.isExpired;
    } catch (error) {
    }
  };

  useEffect(() => {
    const fetchTokenStatus = async () => {
      const isTokenExpired = await checkTokenExpired();
      setExpiredLink(isTokenExpired);
    };

    fetchTokenStatus();
  }, [token]);

  const handleResetPassword = async (e) => {
    e.preventDefault();
  
    const data = {
      new_password: formData.new_password,
      confirm_password: formData.confirm_password,
    };
  
    try {
      await userService.ResetPassword(token, data);
      
      Swal.fire({
        position: 'center',
        icon: 'success',
        title: 'Password reset successfully. You can log in with the new password.',
        showConfirmButton: false,
        timer: 5000,
      });
  
      setTimeout(() => {
        navigate('/login');
      }, 6000);
    } catch (error) {
      Swal.fire({
        position: 'center',
        icon: 'error',
        title: 'Password reset failed. Please try again.',
        showConfirmButton: true,
      });
    }
  };
  


  const checkFormValidity = () => {
    const newIsNotEmpty = formData.new_password.trim() !== '';
    setIsNotEmpty(newIsNotEmpty);

    setFormValid(
      newIsNotEmpty &&
      formData.confirm_password.trim() !== '' &&
      passwordsMatch
    );
  };

  useEffect(() => {
    checkFormValidity();
  }, [formData.new_password, formData.confirm_password]);

  const handlePasswordChange = (e) => {
    const inputValue = e.target.value;

    setFormData((prevData) => ({
      ...prevData,
      new_password: inputValue,
    }));

    const passwordValidation = validators.validatePassword(inputValue);
    setPasswordError(passwordValidation);

    checkFormValidity();
  };


  const handleConfirmPasswordChange = (e) => {
    const inputValue = e.target.value;

    setFormData((prevData) => ({
      ...prevData,
      confirm_password: inputValue,
    }));

    setPasswordsMatch(formData.new_password === inputValue);
  };

  if (expiredLink) {
    return <ExpiredLinkPage />;
  }

  return (
    <>
    <NavigationBar/>
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '90vh',
        backgroundColor: '#F8F8F8',
      }}
    >
      <ThemeProvider theme={defaultTheme}>
        <CssBaseline />
      </ThemeProvider>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          p: 3,
          boxShadow: 3,
          borderRadius: '3px',
          bgcolor: 'background.paper',
          marginTop: '15px',
          height: '450px',
          width:'500px'
        }}
      >

        <Container component="main" maxWidth="xs">
          <CssBaseline />
          <Box
            sx={{
              backgroundColor: 'white',
              padding: '16px',
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              flexDirection: 'column',
            }}
          >
            <Avatar sx={{ m: 1, bgcolor: 'primary.main' }}>
              <LockOutlinedIcon/>
            </Avatar>
            <Typography component="h1" variant="h5">
              Reset Password
            </Typography>
            <Box component="form" role="form" noValidate onSubmit={handleResetPassword} sx={{ mt: 3 }}>
              <TextField
                required
                fullWidth
                id="new_password"
                data-testid="new_password"
                onChange={handlePasswordChange}
                label="Password"
                autoComplete="new_password"
                name="new_password"
                value={formData.new_password}
                sx={{ mb: 1 ,width:'400px' }}
                type={showPassword ? 'text' : 'password'}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon color="action.active" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        edge="end"
                        data-testid="password-toggle"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <Visibility /> : <VisibilityOff />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              {passwordError && (
                <div id="password-error" data-testid="password-error">
                  <Typography variant="body2" color="error" sx={{ fontSize: 13, mt: -1 }}>
                    {passwordError}
                  </Typography>
                </div>
              )}

              <TextField
                required
                fullWidth
                id="confirm_password"
                data-testid="confirm_password"
                label="Confirm Password"
                autoComplete="confirm_password"
                name="confirm_password"
                onChange={handleConfirmPasswordChange}
                value={formData.confirm_password}
                sx={{ mb: 1 }}
                type={showConfirmPassword ? 'text' : 'password'}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon color="action.active" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        data-testid="password-toggle-confirm"
                        edge="end"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? <Visibility /> : <VisibilityOff />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              {!passwordsMatch && (
                <Typography variant="body2" data-testid="password" color="error" sx={{ fontSize: 13, mt: -1 }}>
                  Password and Confirm Password do not match.
                </Typography>
              )}

              {isNotEmpty && <div data-testid="password-not-empty" />}

              <Button
                type="submit"
                data-testid="reset-password"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
                disabled={!formValid}
              >
                Submit
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>
    </Box>
    </>
  );
}

export default ResetPassword;
