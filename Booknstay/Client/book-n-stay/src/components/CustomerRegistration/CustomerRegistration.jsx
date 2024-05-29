import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import {
  Avatar,
  Box,
  Button,
  Container,
  CssBaseline,
  InputAdornment,
  IconButton,
  TextField,
  Typography,
} from '@mui/material';
import {
  LockOutlined as LockOutlinedIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Person as PersonIcon,
  Visibility,
  VisibilityOff,
} from '@mui/icons-material';
import LockIcon from '@mui/icons-material/Lock'
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { userService } from '../../UserService';
import NavigationBar from '../NavigationBar/NavigationBar';
import { validators } from '../../Validations';
import { useNavigate } from "react-router-dom";

const defaultTheme = createTheme();

const CustomerRegistration = () => {
  const [passwordError, setPasswordError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    password: '',
    confirmPassword: '',
  });
  
  const inputs={first_name: formData.first_name,last_name:formData.last_name,email:formData.email,phone_number:formData.phone_number,password:formData.password}
    
   
  const [firstNameError, setFirstNameError] = useState('');
  const [lastNameError, setLastNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [phoneNumberError, setPhoneNumberError] = useState('');
  const [passwordsMatch, setPasswordsMatch] = useState(true);
  const [formValid, setFormValid] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();


  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
  
    try {
      await userService.CustomerRegistration(inputs);
      Swal.fire({
        position: 'center',
        icon: 'success',
        title: 'Registration Successful. Verification email has been sent to the registered email.',
        showConfirmButton: false,
        timer: 5000,
      });
      navigate(`/login`);

      
      setFormData({
        first_name: '',
        last_name: '',
        email: '',
        phone_number: '',
        password: '',
        confirmPassword: '',
      });
      
      setIsSubmitting(false);
  
    } catch (error) {
      setIsSubmitting(false);
      const emailError = error?.response?.data?.email?.[0];
      if (emailError) {
        toast.error(emailError);
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Registration Failed',
          text: 'An error occurred during registration. Please try again.',
        });
      }
      }
    }
    
    const handleFirstNameChange = (e) => {
      const inputValue = e.target.value;
      setFormData((prevData) => ({
        ...prevData,
        first_name: inputValue,
      }));
      
      const customerFNameValidation = validators.validateName(inputValue);
      setFirstNameError(customerFNameValidation);

      checkFormValidity();
    };
    
      const handleLastNameChange = (e) => {
      const inputValue = e.target.value;
      setFormData((prevData) => ({
        ...prevData,
        last_name: inputValue,
      }));
    
      const customerLNameValidation = validators.validateName(inputValue);
      setLastNameError(customerLNameValidation);

      checkFormValidity();
    };
  
  const handleCustomerEmailChange = (e) => {
    const inputValue = e.target.value;
    setFormData((prevData) => ({
      ...prevData,
      email: inputValue,
    }));
  
    const customerEmailValidation = validators.validateEmail(inputValue);
    setEmailError(customerEmailValidation);

    checkFormValidity();
  };
  
  const handleCustomerPhoneNumberChange = (e) => {
    const inputValue = e.target.value;
    setFormData((prevData) => ({
      ...prevData,
      phone_number: inputValue.trim(),
    }));
  
    const customerPhoneValidation = validators.validatePhoneNumber(inputValue);
    setPhoneNumberError(customerPhoneValidation);
  
    checkFormValidity();
  };
  
  
  const handleCustomerPasswordChange = (e) => {
    const inputValue = e.target.value;
    setFormData((prevData) => ({
      ...prevData,
      password: inputValue.trim(),
    }));
    
    const customerPasswordValidation = validators.validatePassword(inputValue);
    setPasswordError(customerPasswordValidation);

    checkFormValidity();
  };

  const handleCustomerConfirmPasswordChange = (e) => {
    const inputValue = e.target.value;
    setFormData((prevData) => ({
      ...prevData,
      confirmPassword: inputValue.trim(),
    }));
    setPasswordsMatch(formData.password === inputValue);
  };

  const checkFormValidity = () => {
    setFormValid(
      formData.first_name.trim() !== '' &&
      formData.last_name.trim() !== '' &&
      formData.email.trim() !== '' &&
      formData.phone_number.trim() !== '' &&
      formData.password.trim() !== '' &&
      formData.confirmPassword.trim() !== '' &&
      passwordsMatch
    );
  };
  
  useEffect(() => {
    checkFormValidity();
  }, [
    formData.first_name,
    formData.last_name,
    formData.email,
    formData.phone_number,
    formData.password,
    formData.confirmPassword,
    passwordsMatch,
  ]);
  
  
  return (
    <>
    <NavigationBar/>
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        width: '100%',
        backgroundColor: '#F8F8F8',
      }}
    >
      <ThemeProvider theme={defaultTheme}>
        <CssBaseline />
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            p: 3,
            boxShadow: 3,
            borderRadius: '3px',
            bgcolor: 'background.paper',
            marginTop: '20px',
            marginBottom: '20px',
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
                <LockOutlinedIcon />
              </Avatar>
              <Typography component="h1" variant="h5">
                Sign up
              </Typography>
              <Box
              component="form"
              noValidate
              onSubmit={handleSubmit}
              sx={{ mt: 3 }}
              aria-labelledby="registration-form-label"
            >
                <TextField
                  autoComplete="given-name"
                  name="firstName"
                  required
                  fullWidth
                  id="firstName"
                  label="First Name"
                  value={formData.first_name}
                  autoFocus
                  onChange={handleFirstNameChange}
                  sx={{ mb: 2 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonIcon color="action.active" />
                      </InputAdornment>
                    ),
                  }}
                />
               {firstNameError && (
                <Typography
                  data-testid="first-name-error"
                  variant="body2"
                  color="error"
                  sx={{ fontSize: 13, mt : -2, mb : 2 }}
                >
                  {firstNameError}
                </Typography>
              )}
                <TextField
                  required
                  fullWidth
                  id="lastName"
                  value={formData.last_name}
                  label="Last Name"
                  name="lastName"
                  onChange={handleLastNameChange}
                  sx={{ mb: 2 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonIcon color="action.active" />
                      </InputAdornment>
                    ),
                  }}
                />
                    {lastNameError && (
                  <Typography
                  data-testid="last-name-error"
                    variant="body2"
                    color="error"
                    sx={{ fontSize: 13, mt : -2, mb : 2 }}
                  >
                    {lastNameError}
                  </Typography>
                )}
                <TextField
                  required
                  fullWidth
                  id="email"
                  label="Email Address"
                  autoComplete="email"
                  name="email"
                  value={formData.email}
                  sx={{ mb: 2 }}
                  onChange={handleCustomerEmailChange}
                  InputProps={{
                    startAdornment: (
                      <EmailIcon style={{ marginRight: '8px', color: '#757575' }} />
                    ),
                  }}
                />
                {emailError && (
                  <Typography
                   data-testid="emailerror"
                    variant="body2"
                    color="error"
                    sx={{ fontSize: 13, mt : -2, mb : 2 }}
                  >
                    {emailError}
                  </Typography>
                )}
                <TextField
                  required
                  fullWidth
                  id="phoneNumber"
                  value={formData.phone_number}
                  label="Phone Number"
                  name="phoneNumber"
                  onChange={handleCustomerPhoneNumberChange}
                  sx={{ mb: 2 }}
                  InputProps={{
                    startAdornment: (
                      <PhoneIcon style={{ marginRight: '8px', color: '#757575' }} />
                    ),
                  }}
                />
                {phoneNumberError && (
                  <Typography
                  data-testid="phone-error"
                    variant="body2"
                    color="error"
                    sx={{ fontSize: 13, mt : -2, mb : 2 }}
                  >
                    {phoneNumberError}
                  </Typography>
                )}

              <TextField
                required
                fullWidth
                name="password"
                label="Password" 
                data-testid="password"
                value={formData.password}
                autoComplete="new-password"
                type={showPassword ? 'text' : 'password'}
                id="password"
                onChange={handleCustomerPasswordChange}
                sx={{ mb: 2 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon color="action.active" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                      data-testid="password-toggle"
                        edge="end"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <Visibility /> : <VisibilityOff />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              {passwordError && (
                <Typography
                  data-testid="password-error" 
                  variant="body2"
                  color="error"
                  sx={{ fontSize: 13, mt : -2, mb : 2 }}
                >
                  {passwordError}
                </Typography>
              )}
                            
                <TextField
                  required
                  fullWidth
                  name="confirmPassword"
                  label="Confirm Password"
                  data-testid="confirm-password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  autoComplete="new-password"
                  sx={{ mb: 2 }}
                  onChange={handleCustomerConfirmPasswordChange}
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
                  <Typography
                  data-testid="password-error"
                    variant="body2"
                    color="error"

                    sx={{ fontSize: 13, mt : -2, mb : 2 }}
                  >
                    Password and Confirm Password do not match.
                  </Typography>
                )}
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  sx={{ mt: 3, mb: 2 }}
                  disabled={!formValid || isSubmitting}
                >
                  {isSubmitting ? 'Signing Up...' : 'Sign Up'}
                </Button>
              </Box>
            </Box>
          </Container>
        </Box>
      </ThemeProvider>
    </Box>
    </>
  );
}
export default CustomerRegistration
