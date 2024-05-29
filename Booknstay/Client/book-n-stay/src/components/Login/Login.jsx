import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import Swal from 'sweetalert2';
import {
  Box,
  Button,
  Grid,
  InputAdornment,
  IconButton,
  TextField,
  Typography,
} from '@mui/material';
import {
  Email as EmailIcon,
  Lock as LockIcon,
  Visibility,
  VisibilityOff,
} from '@mui/icons-material';
import { userService } from '../../UserService';
import CommonAuthLayout from './CommonAuthLayout';

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [formError, setFormError] = useState('');
  const [errors, setErrors] = useState({ email: '', password: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate('');
  const location = useLocation();

  const searchParams = new URLSearchParams(location.search);
  const reviewHotelId = searchParams.get('reviewHotelId');
  const roomId = searchParams.get('roomId');
  const checkInDate = searchParams.get("checkInDate");
  const checkOutDate = searchParams.get("checkOutDate");

  const handleInput = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: '' });
    setFormError('');
  };

  const isSubmitDisabled = !(formData.email && formData.password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
  
    try {
      const response = await userService.LoginUser(formData);
      if (response?.data.accessToken) {
        const { accessToken, userType, id, first_name } = response.data;
        if (!['customer', 'hotel', 'admin', 'supervisor'].includes(userType)) {
          setErrors({ ...errors, email: 'User type not allowed.' });
          setFormError('User type not allowed.');
          return;
        }
  
        localStorage.setItem('token', accessToken);
        const user = { id, userType, first_name };
        localStorage.setItem('user', JSON.stringify(user));
  
        if (userType === 'customer' && roomId) {
          const queryParams = new URLSearchParams({
            checkInDate: checkInDate,
            checkOutDate: checkOutDate
          });
          navigate(`/book-rooms/${roomId}/?${queryParams.toString()}`);
        } else if (userType === 'customer' && reviewHotelId){
          navigate(`/review/${reviewHotelId}&checkOutDate=${checkOutDate}`);
        } else if (userType === 'admin') {
          navigate('/supervisor-dashboard');
        }
          else if (userType === 'supervisor') {
            navigate('/supervisor-dashboard');
        } else if (userType === 'hotel') {
          navigate('/hotel-dashboard');
        } else if (userType === 'customer') {
          navigate('/select-hotels');
        } else {
          navigate('/sidebar');
        }
      }
    } catch (error) {
      handleLoginError(error);
    } finally {
      setIsSubmitting(false);
    }
  };
  

  const handleLoginError = (error) => {
    const errorMessage = error?.response?.data?.error;

    if (error?.response?.status === 500) {
      setFormError('An error occurred during login. Please try again.');
      Swal.fire({
        icon: 'error',
        title: 'Login Failed',
        text: 'An error occurred during login. Please try again.',
      });
    } else {
      setFormError(errorMessage);
    }
  };

  return (
    <>
      <CommonAuthLayout>
    
        <Typography textAlign="center" component="h1" variant="h5">
          Sign In
        </Typography>
        <Box component="form" noValidate sx={{ mt: 3 }} onSubmit={handleSubmit}>
          <TextField
            required
            fullWidth
            id="email"
            label="Email Address"
            autoComplete="email"
            name="email"
            value={formData.email}
            sx={{ mb: 1 }}
            error={Boolean(errors.email)}
            helperText={errors.email}
            InputProps={{
              startAdornment: <EmailIcon style={{ marginRight: '8px', color: '#757575' }} />,
            }}
            onChange={handleInput}
          />
          <TextField
            required
            fullWidth
            name="password"
            label="Password"
            data-testid="password"
            autoComplete="new-password"
            type={showPassword ? 'text' : 'password'}
            id="password"
            value={formData.password}
            sx={{ mb: 1, mt : 1 }}
            error={Boolean(errors.password)}
            helperText={errors.password}
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
                    data-testid="toggle-password"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <Visibility /> : <VisibilityOff />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            onChange={handleInput}
          />
          <Typography variant="body2" color="error" sx={{ textAlign: 'center', mt: 1, mb: 2, width: '100%' }}>
            {formError}
          </Typography>
          <Button
            type="submit"
            data-testid="login"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={isSubmitDisabled}
          >
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </Button>
          <Grid container sx={{ mt: 2 }}>
            <Grid item xs={6}>
              <Button component={Link} to="/forgot-password" variant="body2" sx={{ cursor: 'pointer', color: '#1976D2'}}>
                Forgot Password?
              </Button>
            </Grid>
          </Grid>
        </Box>
      </CommonAuthLayout>
    </>
  );
};

export default Login;
