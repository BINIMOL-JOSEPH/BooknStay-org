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
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PinIcon from '@mui/icons-material/Pin';
import BusinessIcon from '@mui/icons-material/Business';
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';
import PersonIcon from '@mui/icons-material/Person';
import Stack from '@mui/material/Stack';
import EditIcon from '@mui/icons-material/Edit';
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import { Breadcrumbs } from "@mui/material";
import { Link } from "react-router-dom";
import 'react-toastify/dist/ReactToastify.css';
import { hotelService, } from '../../HotelService';
import CollapsibleSidebar from '../Sidebar/Sidebar';
import { validators } from '../../Validations';

const defaultTheme = createTheme();

const EditHotelDetails = () => {
    
    const [editFormData, setEditFormData] = useState({
            hotel_name: '', 
            phone_number: '', 
            address:'',
            city:'', 
            district:'', 
            state:'', 
            pincode:'', 
            description:'',
            service_charge:'', 
            location_link: '',
            image: ''
    });
      
    const [hotelNameError, setHotelNameError] = useState('');
    const [addressError, setAddressError] = useState('');
    const [cityError, setCityError] = useState('');
    const [districtError, setDistrictError] = useState('');
    const [stateError, setStateError] = useState('');
    const [pincodeError, setPincodeError] = useState('');
    const [descriptionError, setDescriptionError] = useState('');
    const [serviceChargeError, setSeviceChargeError] = useState('');
    const [phoneNumberError, setPhoneNumberError] = useState('');
    const [locationLinkError, setLocationLinkError] = useState('');
    const [imageError, setImageError] = useState('');
    const [formValid, setFormValid] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchHotelDetails = async () => {
        try {
            const response = await hotelService.GetHotelDetails();

            const userData = response.data;

            const baseURL = 'https://booknstay-api.innovaturelabs.com';
            const image =  `${baseURL}${userData.image}`;
            const imageFile = await getImage(image);

            setEditFormData({
                hotel_name: userData.hotel_name || "",
                phone_number: userData.phone_number || "",
                address: userData.address || "",
                city: userData.city || "",
                district: userData.district || "",
                state: userData.state || "",
                pincode: userData.pincode || "",
                service_charge: userData.service_charge || "",
                description: userData.description || "",
                location_link: userData.location_link || "",
                image : imageFile || ""
            });

        } catch (error) {
            console.error(error);
        }
    };

    const getImage = async (image) => {
        if (!image) return null;
        try {
            const responseImage = await fetch(image);
            const blob = await responseImage.blob();
            const file = new File([blob], "image.jpg", { type: blob.type });
            return file;
        } catch (error) {
            return null;
        }
    };

    const handleSubmit = async (e) => {

        e.preventDefault();
        setIsSubmitting(true);
      
        await hotelService.EditHotelDetails({
            hotel_name: editFormData.hotel_name,
            city:editFormData.city,
            phone_number:editFormData.phone_number,
            address:editFormData.address,
            description:editFormData.description,
            district:editFormData.district,
            state:editFormData.state,
            pincode:editFormData.pincode,
            service_charge:editFormData.service_charge,
            location_link: editFormData.location_link,
            image: editFormData.image
        })
        .then((response)=>{
            Swal.fire({
                position: 'top',
                icon: 'success',
                title: response.data.message,
                showConfirmButton: false,
                timer: 2000,
            });
      
        }).catch ((error)=> {
            if (error.response && error.response.data) {
                Swal.fire({
                    position: 'top',
                    icon: 'error',
                    title: error.response.data.message,
                    showConfirmButton: false,
                    timer: 2000,
                });
            }
        });

        setIsSubmitting(false);
    };
      

    useEffect(() => {
        fetchHotelDetails();
    },[]);
  

    const handleEditHotelNameChange = (e) => {
        const inputValue = e.target.value;
        setEditFormData((prevData) => ({
            ...prevData,
            hotel_name: inputValue,
        }));
  
        const editHotelNameValidation = validators.validateHotelName(inputValue);
        setHotelNameError(editHotelNameValidation);

        checkFormValidity();
    };

    const handleEditAddressChange = (e) => {
        const inputValue = e.target.value;
        setEditFormData((prevData) => ({
            ...prevData,
            address: inputValue,
        }));
        
        const editAddressValidation = validators.validateAddress(inputValue);
        setAddressError(editAddressValidation);

        checkFormValidity();
    };

    const handleEditDescriptionChange = (e) => {
        const inputValue = e.target.value;
        setEditFormData((prevData) => ({
            ...prevData,
            description: inputValue,
        }));
  
        const editDescriptionValidation = validators.validateDescription(inputValue);
        setDescriptionError(editDescriptionValidation);

        checkFormValidity();
    };

    const handleEditCityChange = (e) => {
        const inputValue = e.target.value;
        setEditFormData((prevData) => ({
            ...prevData,
            city: inputValue,
        }));
  
        const editCityValidation = validators.validateCity(inputValue);
        setCityError(editCityValidation);

        checkFormValidity();
    };

    const handleEditDistrictChange = (e) => {
        const inputValue = e.target.value;
        setEditFormData((prevData) => ({
            ...prevData,
            district: inputValue,
        }));
   
        const editDistrictValidation = validators.validateDistrict(inputValue);
        setDistrictError(editDistrictValidation);

        checkFormValidity();
    };
  
    const handleEditStateChange = (e) => {
        const inputValue = e.target.value;
        setEditFormData((prevData) => ({
            ...prevData,
            state: inputValue,
        }));
  
        const editStateValidation = validators.validateState(inputValue);
        setStateError(editStateValidation);

        checkFormValidity();
    };
  

    const handleEditPhoneNumberChange = (e) => {
        const inputValue = e.target.value;
        setEditFormData((prevData) => ({
            ...prevData,
            phone_number: inputValue,
        }));
 
        const editPhoneNumberValidation = validators.validatePhoneNumber(inputValue);
        setPhoneNumberError(editPhoneNumberValidation);

        checkFormValidity();
    };


    const handleEditPincodeChange = (e) => {
        const inputValue = e.target.value;
        setEditFormData((prevData) => ({
            ...prevData,
            pincode: inputValue,
        }));
 
        const editPinCodeValidation = validators.validatePinCode(inputValue);
        setPincodeError(editPinCodeValidation);
  
        checkFormValidity();
    };

    const handleEditServiceChargeChange = (e) => {
        const inputValue = e.target.value;
        setEditFormData((prevData) => ({
          ...prevData,
          service_charge: inputValue,
        }));
      
        const editServiceChargeValidation = validators.validateServiceCharge(inputValue);
        setSeviceChargeError(editServiceChargeValidation);
      
        checkFormValidity();
    };

    const handleEditLocationLinkChange = (e) => {
        const inputValue = e.target.value;
        setEditFormData((prevData) => ({
          ...prevData,
          location_link: inputValue,
        }));
      
        const editLocationLinkValidation = validators.validateLink(inputValue);
        setLocationLinkError(editLocationLinkValidation);

        checkFormValidity();
    };
    
    const handleImageChange = (e) => {
        const inputValue = e.target.files[0]; 

        if (inputValue && inputValue.size > 1 * 1024 * 1024) {
            setImageError('File size exceeds the maximum allowed limit of 1 MB.');
            return;
        } else {
            setImageError('');
        }

        setEditFormData((prevData) => ({
            ...prevData,
            image : inputValue,
        }));
    };

    const checkFormValidity = () => {
        setFormValid(
            editFormData.hotel_name.trim() !== '' &&
            editFormData.address.trim() !== '' &&
            editFormData.city.trim() !== '' &&
            editFormData.district.trim() !== '' &&
            editFormData.state.trim() !== '' &&
            editFormData.pincode.trim() !== '' &&
            editFormData.description.trim() !== '' &&
            editFormData.service_charge.toString().trim() !== '' &&
            editFormData.phone_number.trim() !== '' &&
            editFormData.location_link.trim() !== '' 
        );
    };

    useEffect(() => {
        checkFormValidity();
    }, [
        editFormData.hotel_name,
        editFormData.phone_number,
        editFormData.address,
        editFormData.city,
        editFormData.district,
        editFormData.state,
        editFormData.pincode,
        editFormData.service_charge,
        editFormData.description,
        editFormData.location_link,
        editFormData.image
    ]);

    return (
    <>
    <CollapsibleSidebar/>
    <Box
        sx={{
            display: 'flex', 
            flexDirection: 'column',
            alignItems: 'center', 
            justifyContent: 'center',
            minHeight: '100vh', 
            width: '100%', 
            backgroundColor: '#F8F8F8',
        }}>

        <ThemeProvider theme={defaultTheme}>
        <CssBaseline />
        <Breadcrumbs
          separator={<NavigateNextIcon fontSize="small" />}
          aria-label="breadcrumb"
          sx={{ mt: 2, ml: 4.2 }}
        >
          <Link to="/hotel-dashboard">
            Home
          </Link>
          <Typography color="textPrimary">Edit Profile</Typography>
        </Breadcrumbs>
        <Box
            sx={{
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                p: 3, 
                boxShadow: 3,
                width: '50%',
                borderRadius: '3px', 
                bgcolor: 'background.paper', 
                marginTop: '20px', 
                marginBottom: '20px',            
            }}>

            <Container component="main" >
            <CssBaseline />
            <Box
                sx={{
                    backgroundColor: 'white',
                    padding: '16px',
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center', 
                    flexDirection: 'column',
                }}>
                <Avatar sx={{ m: 1, bgcolor: 'primary.main' }}>
                    <EditIcon />
                </Avatar>
                <Typography component="h1" variant="h5" align='left'>Edit Profile</Typography>

                <Box 
                    component="form" 
                    data-testid='form-submit' 
                    onSubmit={handleSubmit}
                    noValidate 
                    sx={{ mt: 3 }}
                >  
                <Stack direction="row" spacing={4} > 
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '90%' }}>
                        <Grid container spacing={1} sx={{ mt: '-2%' }}>        
                        <Grid item xs={12} sm={12}>
                            <TextField 
                                autoComplete="given-name" 
                                name="hotel_name" 
                                required 
                                fullWidth
                                id="hotel_name" 
                                label="Hotel Name" 
                                data-testid="hotel_name"
                                value={editFormData.hotel_name} 
                                autoFocus
                                onChange={handleEditHotelNameChange} 
                                sx={{ mb: 2 }}
                                InputProps={{
                                    startAdornment: (
                                        <PersonIcon style={{ marginRight: '8px', color: '#757575' }} />
                                    ),
                                }}
                            />
                            {hotelNameError && (
                                <Typography variant="body2" color="error" sx={{ fontSize: 13, mt: -2, mb:1 }}>
                                    {hotelNameError}
                                </Typography>
                            )}
                        </Grid>
                        <Grid item xs={12} sm={12}>
                            <TextField 
                                required 
                                fullWidth 
                                id="address" 
                                value={editFormData.address} 
                                label="Address"
                                name="address" 
                                onChange={handleEditAddressChange} 
                                sx={{ mb: 2 }} 
                                data-testid="address"
                                InputProps={{
                                    startAdornment: (
                                        <BusinessIcon style={{ marginRight: '8px', color: '#757575' }} />
                                    ),
                                }}
                            />
                            {addressError && (
                                <Typography variant="body2" color="error" sx={{ fontSize: 13, mt: -2,mb:1 }} data-testid='address-error'>
                                    {addressError}
                                </Typography>
                            )}
                        </Grid>
                        </Grid>            
                    </Box>
                    <input
                        accept="image/*"
                        type="file"
                        id="select-image"
                        style={{ display: 'none' }}
                        onChange={handleImageChange}
                        multiple
                        data-testid='image1'
                    />
                    <label htmlFor="select-image">
                        <Avatar
                            sx={{ 
                                width: 150, 
                                height: 150, 
                                borderRadius: '8px', 
                            }}
                         >
                            {editFormData.image ? (
                                <img
                                    src={URL.createObjectURL(editFormData.image)}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }}
                                />
                            ) : (
                                <Avatar/>
                            )}
                        </Avatar>
                        {imageError && (
                                <Typography variant="body2" color="error" sx={{ fontSize: 13,mb:1 }} data-testid='address-error'>
                                    {imageError}
                                </Typography>
                            )}
                    </label>
                    
                </Stack>
                    <Grid container spacing={1} sx={{ mt: '1%' }}>
                        <Grid item xs={12} sm={6}>
                            <TextField 
                                required 
                                fullWidth 
                                id="city" 
                                label="City Name" 
                                name="city"  
                                data-testid="city"
                                sx={{ mb: 2 }}
                                value={editFormData.city} 
                                onChange={handleEditCityChange}
                                InputProps={{
                                    startAdornment: (
                                        <LocationOnIcon style={{ marginRight: '8px', color: '#757575' }} />
                                    ),
                                }}
                            />
                            {cityError && (
                                <Typography variant="body2" color="error" sx={{ fontSize: 13, mt: -2,mb:1 }}>
                                    {cityError}
                                </Typography>
                            )}
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField 
                                required 
                                fullWidth 
                                id="district" 
                                label="District Name" 
                                name="email"
                                data-testid="district"
                                value={editFormData.district} 
                                sx={{ mb: 2 }} 
                                onChange={handleEditDistrictChange}
                                InputProps={{
                                    startAdornment: (
                                        <LocationOnIcon style={{ marginRight: '8px', color: '#757575' }} />
                                    ),
                                }}
                            />
                            {districtError && (
                                <Typography variant="body2" color="error" sx={{ fontSize: 13, mt: -2,mb:1 }}>
                                    {districtError}
                                </Typography>
                            )}
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField 
                                required 
                                fullWidth 
                                id="state" 
                                label="State Name" 
                                name="state"
                                data-testid="state"
                                value={editFormData.state} 
                                sx={{ mb: 2 }} 
                                onChange={handleEditStateChange}
                                InputProps={{
                                    startAdornment: (
                                        <LocationOnIcon style={{ marginRight: '8px', color: '#757575' }} />
                                    ),
                                }}
                            />
                            {stateError && (
                                <Typography variant="body2" color="error" sx={{ fontSize: 13, mt: -2,mb:1 }}>
                                    {stateError}
                                </Typography>
                            )}
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField 
                                required 
                                fullWidth 
                                id="pincode" 
                                value={editFormData.pincode} 
                                label="PIN code"
                                name="pincode" 
                                data-testid="pin_code"
                                onChange={handleEditPincodeChange} 
                                sx={{ mb: 2 }}
                                InputProps={{
                                    startAdornment: (
                                        <PinIcon style={{ marginRight: '8px', color: '#757575' }} />
                                    ),
                                }}
                            />
                            {pincodeError && (
                                <Typography  variant="body2" color="error" sx={{ fontSize: 13, mt: -2, mb:1 }}>
                                    {pincodeError}
                                </Typography>
                            )}
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField 
                                required 
                                fullWidth 
                                id="phone_number" 
                                value={editFormData.phone_number}
                                label="Phone Number" 
                                name="phone_number" 
                                data-testid="phone_number"
                                onChange={handleEditPhoneNumberChange} 
                                sx={{ mb: 2 }}
                                InputProps={{
                                    startAdornment: (
                                        <PhoneIcon style={{ marginRight: '8px', color: '#757575' }} />
                                    ),
                                }}
                            />
                            {phoneNumberError && (
                                <Typography variant="body2" color="error" sx={{ fontSize: 13, mt: -2,mb:1 }}>
                                    {phoneNumberError}
                                </Typography>
                            )}
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField 
                                required 
                                fullWidth 
                                id="service_charge" 
                                value={editFormData.service_charge} 
                                sx={{ mb: 2 }}
                                label="Service Charge" 
                                name="service_charge" 
                                data-testid="service_charge"
                                onChange={handleEditServiceChargeChange} 
                                InputProps={{
                                    startAdornment: (
                                        <CurrencyRupeeIcon style={{ marginRight: '8px', color: '#757575' }}/>
                                    ),
                                }}
                                
                            />
                            {serviceChargeError && (
                                <Typography variant="body2" color="error" sx={{ fontSize: 13, mt: -2,mb:1 }}>
                                    {serviceChargeError}
                                </Typography>
                            )}
                        </Grid>
                        <Grid item xs={12} sm={12}>
                            <TextField 
                                required 
                                fullWidth 
                                id="description" 
                                value={editFormData.description}  
                                sx={{ mb: 2 }}
                                label="Hotel Description" 
                                name="description" 
                                data-testid="description"
                                onChange={handleEditDescriptionChange}                 
                                InputProps={{
                                    startAdornment: (
                                        <PersonIcon style={{ marginRight: '8px', color: '#757575' }} />
                                    ),
                                }}
                            />
                            {descriptionError && (
                                <Typography variant="body2" color="error" sx={{ fontSize: 13,mt: -2,mb:1 }}>
                                    {descriptionError}
                                </Typography>
                            )}
                        </Grid>
                        <Grid item xs={12} sm={12}>
                            <TextField 
                                required 
                                fullWidth 
                                id="location_link" 
                                value={editFormData.location_link}  
                                sx={{ mb: 2 }}
                                label="Location Link" 
                                name="location_link" 
                                data-testid="location_link"
                                onChange={handleEditLocationLinkChange}                 
                                InputProps={{
                                    startAdornment: (
                                        <LocationOnIcon style={{ marginRight: '8px', color: '#757575' }} />
                                    ),
                                }}
                            />
                            {locationLinkError && (
                                <Typography variant="body2" color="error" sx={{ fontSize: 13,mt: -2,mb:1 }}>
                                    {locationLinkError}
                                </Typography>
                            )}
                        </Grid>
                        <Button 
                            type="submit" 
                            fullWidth 
                            variant="contained" 
                            data-testid="submit_button"
                            sx={{ mt: 3, mb: 2 }}
                            disabled={!formValid || isSubmitting }
                        >
                            {isSubmitting ? 'Updating...' : 'Update'}
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
export default EditHotelDetails;
