import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import CssBaseline from '@mui/material/CssBaseline';
import Grid from '@mui/material/Grid';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PinIcon from '@mui/icons-material/Pin';
import BusinessIcon from '@mui/icons-material/Business';
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';
import LockIcon from '@mui/icons-material/Lock';
import PersonIcon from '@mui/icons-material/Person';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { hotelService, } from '../../HotelService';
import NavigationBar from '../NavigationBar/NavigationBar';
import { validators } from '../../Validations';
import { useNavigate } from "react-router-dom";

const defaultTheme = createTheme();

const HotelRegistration = () => {
  const [passwordError, setPasswordError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    hotel_name: '', email: '', phone_number: '', address:'',
    city:'', district:'', state:'', pincode:'', description:'',
    service_charge:'', license_number:'', location_link : '', password: '', confirmPassword: '',
  });
  
    const inputs={hotel_name: formData.hotel_name,email:formData.email,city:formData.city,
        phone_number:formData.phone_number,address:formData.address,description:formData.description,
        district:formData.district,state:formData.state,pincode:formData.pincode,
        license_number:formData.license_number,service_charge:formData.service_charge,
        password:formData.password, location_link: formData.location_link}
      
  const [hotelNameError, setHotelNameError] = useState('');
  const [addressError, setAddressError] = useState('');
  const [cityError, setCityError] = useState('');
  const [districtError, setDistrictError] = useState('');
  const [stateError, setStateError] = useState('');
  const [pincodeError, setPincodeError] = useState('');
  const [descriptionError, setDescriptionError] = useState('');
  const [serviceChargeError, setSeviceChargeError] = useState('');
  const [licenseError, setLicenseError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [phoneNumberError, setPhoneNumberError] = useState('');
  const [locationLinkError, setLocationLinkError] = useState('');
  const [passwordsMatch, setPasswordsMatch] = useState(true);
  const [formValid, setFormValid] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();


  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
      await hotelService.HotelRegistration((inputs))
      .then((response)=>{
        Swal.fire({
          position: 'top',
          icon: 'success',
          title: 'Registartion Successfull, Wait for mail to confirm the approval from Admin',
          showConfirmButton: false,
          timer: 5000,
        });
        navigate(`/login`);

        setIsSubmitting(false);
        setFormData({
          hotel_name: '', email: '', phone_number: '', address:'',
          city:'', district:'', state:'', pincode:'', description:'',
          service_charge:'', license_number:'', location_link : '', password: '', confirmPassword: '',
        });
      }).catch ((error)=> {
        setIsSubmitting(false);
        if (error.response && error.response.data) {
          
          if(error.response.data.email){
            const emailmessage = error.response.data.email[0];
            toast.error(emailmessage)
          }else if(error.response.data.license_number){
            const licensemessage = error.response.data.license_number[0]
            toast.error(licensemessage)
          }         
        else {    
          Swal.fire({
            position: 'top',
            icon: 'error',
            title: 'Registration failed due to unknown reason',
            showConfirmButton: false,
            timer: 5000,
          });     

        }
      }
      
      });  
  };

  const handleHotelNameChange = (e) => {
    const inputValue = e.target.value;
    setFormData((prevData) => ({
      ...prevData,
      hotel_name: inputValue,
    }));

    const hotelNameValidation = validators.validateHotelName(inputValue);
    setHotelNameError(hotelNameValidation);
   
    checkFormValidity();
  };

  const handleAddressChange = (e) => {
    const inputValue = e.target.value;
    setFormData((prevData) => ({
      ...prevData,
      address: inputValue,
    }));

    const addressValidation = validators.validateAddress(inputValue);
    setAddressError(addressValidation);

    checkFormValidity();
  };

  const handleDescriptionChange = (e) => {
    const inputValue = e.target.value;
    setFormData((prevData) => ({
      ...prevData,
      description: inputValue,
    }));
  
    const hotelDescriptionValidation = validators.validateDescription(inputValue);
    setDescriptionError(hotelDescriptionValidation);
    
    checkFormValidity();
  };

  const handleCityChange = (e) => {
    const inputValue = e.target.value;
    setFormData((prevData) => ({
      ...prevData,
      city: inputValue,
    }));
  
    const cityValidation = validators.validateCity(inputValue);
    setCityError(cityValidation);

    checkFormValidity();
  };

  const handleDistrictChange = (e) => {
    const inputValue = e.target.value;
    setFormData((prevData) => ({
      ...prevData,
      district: inputValue,
    }));
   
    const districtValidation = validators.validateDistrict(inputValue);
    setDistrictError(districtValidation);
    
    checkFormValidity();
  };
  
  const handleStateChange = (e) => {
    const inputValue = e.target.value;
    setFormData((prevData) => ({
      ...prevData,
      state: inputValue,
    }));
  
    const stateValidation = validators.validateState(inputValue);
    setStateError(stateValidation);

    checkFormValidity();
  };
  
  
  const handleEmailChange = (e) => {
    const inputValue = e.target.value;
    setFormData((prevData) => ({
      ...prevData,
      email: inputValue,
    }));
  
    const emailValidation = validators.validateEmail(inputValue);
    setEmailError(emailValidation);

    checkFormValidity();
  };
  

  const handlePhoneNumberChange = (e) => {
    const inputValue = e.target.value;
    setFormData((prevData) => ({
      ...prevData,
      phone_number: inputValue.trim(),
    }));
 
    const phoneNumberValidation = validators.validatePhoneNumber(inputValue);
    setPhoneNumberError(phoneNumberValidation);
  
    checkFormValidity();
  };


  const handlePincodeChange = (e) => {
    const inputValue = e.target.value;
    setFormData((prevData) => ({
      ...prevData,
      pincode: inputValue,
    }));
 
    const pinCodeValidation = validators.validatePinCode(inputValue);
    setPincodeError(pinCodeValidation);
  
    checkFormValidity();
  };

  
  const handlePasswordChange = (e) => {
    const inputValue = e.target.value;
    setFormData((prevData) => ({
      ...prevData,
      password: inputValue.trim(),
    }));

    const passwordValidation = validators.validatePassword(inputValue);
    setPasswordError(passwordValidation);

    checkFormValidity();
  };

  const handleConfirmPasswordChange = (e) => {
    const inputValue = e.target.value;
    setFormData((prevData) => ({
      ...prevData,
      confirmPassword: inputValue.trim(),
    }));
    setPasswordsMatch(formData.password === inputValue);
  };

  const handleServiceChargeChange = (e) => {
    const inputValue = e.target.value;
    setFormData((prevData) => ({
      ...prevData,
      service_charge: inputValue,
    }));
  
    const serviceChargeValidation = validators.validateServiceCharge(inputValue);
    setSeviceChargeError(serviceChargeValidation);
  
    checkFormValidity();
  };

  const handleLicenseChange = (e) => {
    const inputValue = e.target.value;
    setFormData((prevData) => ({
      ...prevData,
      license_number: inputValue,
    }));
  
    const licenseNumberValidation = validators.validateLicenseNumber(inputValue);
    setLicenseError(licenseNumberValidation);
  
    checkFormValidity();
  };

  const handleLocationLinkChange = (e) => {
    const inputValue = e.target.value;
    setFormData((prevData) => ({
      ...prevData,
      location_link: inputValue,
    }));

    const locationLinkValidation = validators.validateLink(inputValue);
    setLocationLinkError(locationLinkValidation);
    
    checkFormValidity();
  };


  const checkFormValidity = () => {
    setFormValid(
      formData.hotel_name.trim() !== '' &&
      formData.address.trim() !== '' &&
      formData.city.trim() !== '' &&
      formData.district.trim() !== '' &&
      formData.state.trim() !== '' &&
      formData.pincode.trim() !== '' &&
      formData.description.trim() !== '' &&
      formData.service_charge.trim() !== '' &&
      formData.license_number.trim() !== '' &&
      formData.email.trim() !== '' &&
      formData.phone_number.trim() !== '' &&
      formData.location_link.trim() !== '' &&
      formData.password.trim() !== '' &&
      formData.confirmPassword.trim() !== '' &&
      passwordsMatch
    );
  };

  useEffect(() => {
    checkFormValidity();
  }, [
    formData.hotel_name,
    formData.email,
    formData.phone_number,
    formData.address,
    formData.city,
    formData.district,
    formData.state,
    formData.pincode,
    formData.description,
    formData.service_charge,
    formData.location_link,
    formData.license_number,
    formData.password,
    formData.confirmPassword,
    passwordsMatch,
  ]);

  return (
    <>
     <NavigationBar/>
    <Box
      sx={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        minHeight: '100vh', width: '100%', backgroundColor: '#F8F8F8',
      }}
    >
    <ThemeProvider theme={defaultTheme}>
    <CssBaseline />
    <Box
      sx={{display: 'flex', flexDirection: 'column', alignItems: 'center', p: 3, boxShadow: 3,width: '50%',
            borderRadius: '3px', bgcolor: 'background.paper', marginTop: '20px', marginBottom: '20px',            
      }}
    >
        <Container component="main" >
        <CssBaseline />
        <Box
          sx={{backgroundColor: 'white',padding: '16px',width: '100%',display: 'flex',
                alignItems: 'center', flexDirection: 'column',
          }}
        >
        <Avatar sx={{ m: 1, bgcolor: 'primary.main' }}>
            <LockOutlinedIcon />
        </Avatar>
        <Typography component="h1" variant="h5">Sign up</Typography>

        <Box
            component="form" data-testid='form-submit' noValidate onSubmit={handleSubmit} sx={{ mt: 3 }}
        >
            <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
                <TextField autoComplete="given-name" name="hotel_name" required fullWidth
                  id="hotel_name" label="Hotel Name" value={formData.hotel_name} autoFocus
                  onChange={handleHotelNameChange} sx={{ mb: 2 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonIcon color="action.active" />
                      </InputAdornment>
                    ),
                  }}
                />
                {hotelNameError && (
                  <Typography variant="body2" color="error" sx={{ fontSize: 13, mt: -2,mb:2 }}>
                    {hotelNameError}
                  </Typography>
                )}
            </Grid>
            <Grid item xs={12} sm={6}>
                <TextField required fullWidth id="email" label="Email Address" name="email"
                  autoComplete="email" value={formData.email} sx={{ mb: 2 }}
                  onChange={handleEmailChange}
                  InputProps={{
                    startAdornment: (
                      <EmailIcon style={{ marginRight: '8px', color: '#757575' }} />
                    ),
                  }}
                />
                {emailError && (
                  <Typography variant="body2" color="error" sx={{ fontSize: 13, mt: -2,mb:2}}>
                    {emailError}
                  </Typography>
                )}
            </Grid>
            <Grid item xs={12} sm={12}>
                <TextField required fullWidth id="address" value={formData.address} label="Address"
                  name="address" onChange={handleAddressChange} sx={{ mb: 2, mt : -2 }} data-testid="address"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <BusinessIcon color="action.active" />
                      </InputAdornment>
                    ),
                  }}
                />
                {addressError && (
                  <Typography variant="body2" color="error" sx={{ fontSize: 13, mt: -2,mb:2 }} data-testid='address-error'>
                    {addressError}
                  </Typography>
                )}
            </Grid>
            <Grid item xs={12} sm={6}>
                <TextField required fullWidth id="city" label="City Name" name="city"  sx={{ mb: 2, mt : -2 }}
                  value={formData.city} onChange={handleCityChange}
                  InputProps={{
                    startAdornment: (
                      <LocationOnIcon style={{ marginRight: '8px', color: '#757575' }} />
                    ),
                  }}
                />
                {cityError && (
                  <Typography variant="body2" color="error" sx={{ fontSize: 13, mt: -2,mb:2 }}>
                    {cityError}
                  </Typography>
                )}
            </Grid>
            <Grid item xs={12} sm={6}>
                <TextField required fullWidth id="district" label="District Name" name="email"
                  value={formData.district} sx={{ mb: 2, mt : -2 }} onChange={handleDistrictChange}
                  InputProps={{
                    startAdornment: (
                      <LocationOnIcon style={{ marginRight: '8px', color: '#757575' }} />
                    ),
                  }}
                />
                {districtError && (
                  <Typography variant="body2" color="error" sx={{ fontSize: 13, mt: -2,mb:2 }}>
                    {districtError}
                  </Typography>
                )}
            </Grid>
            <Grid item xs={12} sm={6}>
                <TextField required fullWidth id="state" label="State Name" name="state"
                  value={formData.state} sx={{ mb: 2, mt : -2 }} onChange={handleStateChange}
                  InputProps={{
                    startAdornment: (
                      <LocationOnIcon style={{ marginRight: '8px', color: '#757575' }} />
                    ),
                  }}
                />
                {stateError && (
                  <Typography variant="body2" color="error" sx={{ fontSize: 13, mt: -2,mb:2 }}>
                    {stateError}
                  </Typography>
                )}
            </Grid>
            <Grid item xs={12} sm={6}>
                <TextField required fullWidth id="pincode" value={formData.pincode} label="PIN code"
                  name="pincode" onChange={handlePincodeChange} sx={{ mb: 2, mt : -2 }}
                  InputProps={{
                    startAdornment: (
                      <PinIcon style={{ marginRight: '8px', color: '#757575' }} />
                    ),
                  }}
                />
                {pincodeError && (
                  <Typography  variant="body2" color="error" sx={{ fontSize: 13, mt: -2,mb:2 }}>
                    {pincodeError}
                  </Typography>
                )}
            </Grid>
            <Grid item xs={12} sm={6}>
                <TextField required fullWidth id="phone_number" value={formData.phone_number}
                  label="Phone Number" name="phone_number" onChange={handlePhoneNumberChange} sx={{ mb: 2, mt : -2 }}
                  InputProps={{
                    startAdornment: (
                      <PhoneIcon style={{ marginRight: '8px', color: '#757575' }} />
                    ),
                  }}
                />
                {phoneNumberError && (
                  <Typography variant="body2" color="error" sx={{ fontSize: 13, mt: -2,mb:2 }}>
                    {phoneNumberError}
                  </Typography>
                )}
            </Grid>
            <Grid item xs={12} sm={6}>
                <TextField required fullWidth id="license_number" value={formData.license_number}
                  label="License Number" name="license_number" onChange={handleLicenseChange} sx={{ mb: 2, mt : -2 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonIcon color="action.active" />
                      </InputAdornment>
                    ),
                  }}
                />
                {licenseError && (
                  <Typography variant="body2" color="error" data-testid='license-error' sx={{ fontSize: 13, mt: -2,mb:2 }}>
                    {licenseError}
                  </Typography>
                )}
            </Grid>
            <Grid item xs={12} sm={12}>
                <TextField required fullWidth id="description" value={formData.description}  sx={{ mb: 2, mt : -2 }}
                  label="Hotel Description" name="description" onChange={handleDescriptionChange}                 
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonIcon color="action.active" />
                      </InputAdornment>
                    ),
                  }}
                />
                {descriptionError && (
                  <Typography variant="body2" color="error" sx={{ fontSize: 13,mt: -2,mb:2 }}>
                    {descriptionError}
                  </Typography>
                )}
            </Grid>
            <Grid item xs={12} sm={12}>
                <TextField required fullWidth id="service_charge" value={formData.service_charge} sx={{ mb: 2, mt : -2 }}
                   label="Service Charge" name="service_charge" onChange={handleServiceChargeChange} 
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <CurrencyRupeeIcon color="action.active" />
                      </InputAdornment>
                    ),
                  }}
                />
                {serviceChargeError && (
                  <Typography variant="body2" color="error" sx={{ fontSize: 13, mt: -2,mb:2 }}>
                    {serviceChargeError}
                  </Typography>
                )}
            </Grid>
            <Grid item xs={12} sm={12}>
                <TextField required fullWidth id="location_link" value={formData.location_link} sx={{ mb: 2, mt : -2 }}
                   label="Location Link" name="location_link" onChange={handleLocationLinkChange} 
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LocationOnIcon color="action.active" />
                      </InputAdornment>
                    ),
                  }}
                />
                {locationLinkError && (
                  <Typography variant="body2" color="error" sx={{ fontSize: 13, mt: -2,mb:2 }}>
                    {locationLinkError}
                  </Typography>
                )}
            </Grid>
            <Grid item xs={12} sm={6}>
                <TextField required fullWidth name="password" label="Password"  data-testid="password"
                 value={formData.password} autoComplete="new-password" type={showPassword ? 'text' : 'password'}
                  id="password" onChange={handlePasswordChange} sx={{ mb: 2, mt : -2 }}
                   InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                         <LockIcon color="action.active" />
                        </InputAdornment>
                        ),
                    endAdornment: (
                    <InputAdornment position="end">
                        <IconButton edge="end" data-testid="password-toggle" onClick={() => setShowPassword(!showPassword)}>
                            {showPassword ? <Visibility /> : <VisibilityOff />}</IconButton>
                    </InputAdornment>
                    ),
                }}
                />
                {passwordError && (
                  <Typography data-testid="password-error"  variant="body2" color="error" sx={{ fontSize: 13, mt: -2,mb:2 }}>
                    {passwordError}
                  </Typography>
                )}
            </Grid>
            <Grid item xs={12} sm={6}>
                <TextField required fullWidth name="confirmPassword" label="Confirm Password"
                 type={showConfirmPassword ? 'text' : 'password'} id="confirmPassword" sx={{ mb: 2, mt :-2 }}
                 autoComplete="new-password" onChange={handleConfirmPasswordChange}
                 InputProps={{
                    startAdornment: (
                    <InputAdornment position="start"><LockIcon color="action.active" /></InputAdornment>
                    ),
                    endAdornment: (
                    <InputAdornment position="end">
                        <IconButton data-testid="password-toggle-confirm" edge="end"
                         onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                             {showConfirmPassword ? <Visibility /> : <VisibilityOff />}
                        </IconButton>
                    </InputAdornment>
                    ),
                }}
                />
                {!passwordsMatch && (
                  <Typography variant="body2" color="error" sx={{ fontSize: 13, mt: -2,mb:2 }}>
                    Password and Confirm Password do not match.
                  </Typography>
                )}
            </Grid>
                <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }}
                  disabled={!formValid || isSubmitting}
                >
                {isSubmitting ? 'Signing Up...' : 'Sign Up'}
                </Button>
            </Grid>
        </Box>
        </Box>
        </Container>
    </Box>
    </ThemeProvider>
    </Box>
    </>
  );
}
export default HotelRegistration;
