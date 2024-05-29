import React, { useState, useEffect } from 'react';
import 'sweetalert2/dist/sweetalert2.min.css';
import Swal from 'sweetalert2';
import { Grid, TextField, Typography, Card,CardHeader,Box, Button, 
         Divider,Stack,Table, TableCell, TableRow, CardContent, 
         Checkbox, FormControlLabel, Breadcrumbs
} from "@mui/material";
import CollapsibleSidebar from '../Sidebar/Sidebar';
import 'react-toastify/dist/ReactToastify.css';
import PinIcon from '@mui/icons-material/Pin';
import { validators } from '../../Validations';
import { useParams, Link, useLocation } from "react-router-dom";
import { hotelService, } from '../../HotelService';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';
import { userService } from '../../UserService';

const Booking = () =>{
    const { id } = useParams();
    const [bookingId, setBookingId] = useState('');
    const [bookingData, setBookingData] = useState('');
    const [formValid, setFormValid] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [nameError, setNameError] = useState('');
    const [emailError, setEmailError] = useState('');
    const [addressError, setAddressError] = useState('');
    const [phoneNumberError, setPhoneNumberError] = useState('');
    const [aadharNumberError, setAadharNumberError] = useState('');
    const [showBookingDetails, setShowBookingDetails] = useState(false);
    const [services, setServices] = useState([]);
    const [selectedServices, setSelectedServices] = useState([]);
    const [serviceError, setServiceError] = useState('');
    const [backdrop, setBackdrop] = useState(false);

    const hotel_id = localStorage.getItem('hotel_id');
    const location = useLocation();
    const queryParam = new URLSearchParams(location.search);
    const checkInDate = queryParam.get("checkInDate");
    const checkOutDate = queryParam.get("checkOutDate");

    const [formData, setFormData] = useState({
        guest_name: '', 
        email: '', 
        phone_number: '', 
        address:'',
        number_of_adults:"1", 
        number_of_children:"0", 
        number_of_rooms:"1",
        aadhar_number:'', 
        check_in_date : checkInDate,
        check_out_date: checkOutDate,
    });
    const inputs = {
        guest_name:formData.guest_name, 
        email:formData.email, 
        phone_number:formData.phone_number,
        address:formData.address, 
        number_of_adults:formData.number_of_adults,
        number_of_children:formData.number_of_children,
        number_of_rooms:formData.number_of_rooms,
        aadhar_number:formData.aadhar_number,
        check_in_date:formData.check_in_date,
        check_out_date:formData.check_out_date,
        room_id:id,
        selected_services: selectedServices
    }


  const resetForm = () => {
    setFormData({
      guest_name: '', email: '', phone_number: '', address: '', number_of_adults: '1',
      number_of_children: '0', number_of_rooms: '1', aadhar_number: '', check_in_date: '',
      check_out_date: '',
    });

    setNameError('');
    setEmailError('');
    setAddressError('');
    setPhoneNumberError('');
    setAadharNumberError('');
    setSelectedServices('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setBackdrop(true)
    try{
      const response = await hotelService.BookHotelRoom((inputs))
      setBookingId(response.data.id)
      setBackdrop(false)
      Swal.fire({
        position: 'top',
        icon: 'success',
        title: 'You Have successfully reserved the room.',
        showConfirmButton: false,
        timer: 3000,
      })
        setShowBookingDetails(true)      
        setIsSubmitting(false);
        resetForm();
        
      }catch (error) {
        setBackdrop(false)
        console.log(error) 
          Swal.fire({
            position: 'top',
            icon: 'error',
            title: 'Reservation Failed. Please make sure you have valid data',
            showConfirmButton: false,
            timer: 3000,
          });           
        setIsSubmitting(false);
        setShowBookingDetails(false)   
      };  

  };

  const handleGuestNameChange = (e) => {
    const inputValue = e.target.value;
    setFormData((prevData) => ({
      ...prevData,
      guest_name: inputValue,
    }));
    const guestNameValidation = validators.validateName(inputValue);
    setNameError(guestNameValidation);
    checkFormValidity();   
  };

const handleAddressChange = (e) => {
    const inputValue = e.target.value;
    setFormData((prevData) => ({
      ...prevData,
      address: inputValue,
    }));
    const guestAddressValidation = validators.validateAddress(inputValue);
    setAddressError(guestAddressValidation);

    checkFormValidity();    
  };
  
const handleEmailChange = (e) => {
    const inputValue = e.target.value;
    setFormData((prevData) => ({
      ...prevData,
      email: inputValue,
    }));
    const guestEmailValidation = validators.validateEmail(inputValue);
    setEmailError(guestEmailValidation);

    checkFormValidity();    
  };

const handlePhoneNumberChange = (e) => {
    const inputValue = e.target.value;
    setFormData((prevData) => ({
      ...prevData,
      phone_number: inputValue.trim(),
    }));
    const guestPhoneValidation = validators.validatePhoneNumber(inputValue);
    setPhoneNumberError(guestPhoneValidation);

    checkFormValidity();    
  };

  const handleAadharChange = (e) => {
    const inputValue = e.target.value;
    setFormData((prevData) => ({
      ...prevData,
      aadhar_number: inputValue.trim(),
    }));

    const guestAadharValidation = validators.validateAadharNumber(inputValue);
    setAadharNumberError(guestAadharValidation);

    checkFormValidity();    
  };

const handleAdultNumberChange = (e, minValue) => {
    const inputValue = e.target.value;
    if (!isNaN(inputValue) && inputValue >= minValue) {
        setFormData((prevData) => ({
            ...prevData,
            number_of_adults: inputValue,
          }));
      }
      checkFormValidity();    
}
const handleChildrenNumberChange = (e, minValue) => {
    const inputValue = e.target.value;
    if (!isNaN(inputValue) && inputValue >= minValue) {
        setFormData((prevData) => ({
            ...prevData,
            number_of_children: inputValue,
          }));
      }
      checkFormValidity();    
}
const handleRoomNumberChange = (e, minValue) => {
    const inputValue = e.target.value;
    if (!isNaN(inputValue) && inputValue >= minValue) {
        setFormData((prevData) => ({
            ...prevData,
            number_of_rooms: inputValue,
          }));
      }
      checkFormValidity();    
}

const checkFormValidity = () => {
    setFormValid(
      formData.guest_name.trim() !== '' &&
      formData.address.trim() !== '' &&
      formData.number_of_adults >= 1 &&
      formData.number_of_rooms >=1 &&
      formData.number_of_children >=0 &&
      formData.check_in_date.trim() !== '' &&
      formData.check_out_date.trim() !== '' &&
      formData.aadhar_number.trim() !== '' &&
      formData.email.trim() !== '' &&
      formData.phone_number.trim() !== ''  
    );
  };

  useEffect(() => {
    checkFormValidity();
  }, [
    formData.guest_name,
    formData.email,
    formData.phone_number,
    formData.address,
    formData.number_of_adults,
    formData.number_of_rooms,
    formData.aadhar_number,
    formData.check_in_date,
    formData.check_out_date,
  ]);

  const fetchBookingDetailsById = async() => {
    try{
        const response = await hotelService.GetCustomerBookings(bookingId);
        setBookingData(response.data);
    } catch(error) {
        if(error.response){
            console.log(error.response)
        }
    }
  };
  useEffect(()=>{
    if (showBookingDetails) {
      fetchBookingDetailsById();
    }
  }, [showBookingDetails]);

  const handleServiceChange = (serviceId) => {
    setSelectedServices((prevSelectedServices) => {
      if (prevSelectedServices.includes(serviceId)) {
          return prevSelectedServices.filter((id) => id !== serviceId);
      } else {
          return [...prevSelectedServices, serviceId];
      }
    });
  };

  const fetchServices = async() => {
    try {
      const response = await hotelService.ListServicesAddedToRooms(id);
        setServices(response.data.map(item => item.additional_activites_details));
    } catch(error) {
      if (error.response) {
        setServiceError(error.response.data.message);
      }
    }
  };

  useEffect(() => {
    fetchServices();
    GetUserData();
  }, []);

  const GetUserData = async () => {
    try {
      const response = await userService.GetUserData();
        const userData = response.data;
        setFormData(prevState => ({
            ...prevState,
            guest_name: userData.first_name+" "+userData.last_name || "",
            phone_number: userData.phone_number || "",
            email: userData.email || ""
        }));
    } catch (error) {
      console.log("Unable to retrieve the data")
    }
  }

    return(
        <>
        <CollapsibleSidebar/>
         <Box  sx={{backgroundColor: '#F8F8F8', minHeight: '100vh', display: 'flex', flexDirection: 'column',
                            alignItems: 'center', justifyContent: 'center', p: 3, position: 'relative', width: '100%',
                    }}>
                              <Breadcrumbs
              separator={<NavigateNextIcon fontSize="small" />}
              aria-label="breadcrumb"
              sx={{ marginBottom: 2, marginLeft: 2, textAlign: "left" }}
            >
              < Link to="/" color="inherit">
                Home
              </ Link>
              <Link to={`/view-selected-hotels/${hotel_id}?checkInDate=${checkInDate}&checkOutDate=${checkOutDate}`} color="inherit">
                Hotel Details
              </Link>
              <Typography color="textPrimary">Book your room</Typography>
            </Breadcrumbs>
                <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'left', width: '100%', }}>
                        
                        <Card sx={{ width: '50%', marginTop: '2%', minHeight: '90%', ml: '1%' }}>
                        <CardHeader title="Complete Your booking.."sx={{ mx: 'auto', textAlign: 'center', alignItems: 'center'}} />
                        <Box
            component="form" data-testid='form-submit' noValidate sx={{ mt: 3 }}  onSubmit={handleSubmit}
        >
            <Grid container spacing={2}>
               
            <Grid item xs={12} sm={12}>
                <TextField autoComplete="given-name" name="guest_name" required fullWidth data-testid="guest-name"
                  id="guest_name" label="Full Name"  autoFocus size="small" value={formData.guest_name}
                   sx={{ mb: '2%', width:'84%', ml: '8%', mr: '3%' }} onChange={handleGuestNameChange}
                />
                {nameError && (
                  <Typography variant="body2" color="error" sx={{ fontSize:13, width:'90%',ml:'5%' }}>
                    {nameError}
                  </Typography>
                )}
            </Grid>
            </Grid>
            <Stack  direction="column" sx={{mt: '2%', width:'100%'}}>
            <Typography sx={{ml:'8%',fontSize:'large',fontWeight:'bold', textDecoration: 'underline',color:'green'}}>Address Details</Typography>
            </Stack>
            <Grid container spacing={1} sx={{mt:'1%', ml: '4%', mr: '20%'}}>
            <Grid item xs={12} sm={6} >
                <TextField required fullWidth id="email" label="Email Address" name="email" data-testid="guest-email"
                  autoComplete="email" sx={{ mb: '2%', width:'90%',ml:'5%' }} size="small" value={formData.email} onChange={handleEmailChange}
                />
                {emailError && (
                  <Typography variant="body2" color="error" sx={{ fontSize:13, width:'90%',ml:'5%' }}>
                    {emailError}
                  </Typography>
                )}
            </Grid>
            <Grid item xs={12} sm={6}>
                <TextField required fullWidth id="address"  label="Address" size="small" value={formData.address}
                  name="address"  sx={{ mb: '2%', width:'70%',ml:'5%' }} data-testid="address" onChange={handleAddressChange}
                />
                {addressError && (
                  <Typography variant="body2" color="error" sx={{ fontSize:13, width:'90%',ml:'5%' }}>
                    {addressError}
                  </Typography>
                )}
            </Grid>
            <Grid item xs={12} sm={6}>
                <TextField required fullWidth id="phone_number" size="small" value={formData.phone_number} data-testid="guest-phone"
                  label="Phone Number" name="phone_number"  sx={{ mb: '2%', width:'90%',ml:'5%' }} onChange={handlePhoneNumberChange}
                />
                {phoneNumberError && (
                  <Typography variant="body2" color="error" sx={{ fontSize:13, width:'90%',ml:'5%' }}>
                    {phoneNumberError}
                  </Typography>
                )}
            </Grid>
            <Grid item xs={12} sm={6}>
                <TextField required fullWidth id="aadhar_number" size="small" value={formData.aadhar_number} data-testid="aadhar"
                  label="Aadhar Number" name="aadhar_number" sx={{ mb: '2%', width:'70%',ml:'5%' }} onChange={handleAadharChange}
                />   
                {aadharNumberError && (
                  <Typography variant="body2" color="error" sx={{ fontSize:13, width:'90%',ml:'5%' }}>
                    {aadharNumberError}
                  </Typography>
                )}             
            </Grid>
            </Grid>
            <Stack  direction="column" sx={{mt: '2%', width:'100%'}}>
            <Typography sx={{ml:'8%',fontSize:'large',fontWeight:'bold', textDecoration: 'underline',color:'green'}}>Booking Details</Typography>
            </Stack>
            <Grid container spacing={2} sx={{mt:'1%', ml: '5.5%'}}>
            <Grid item xs={12} sm={6}>
                <TextField required fullWidth id="number_of_adults" label="Number of Adults" name="number_of_adults"  sx={{ mb: '2%', width:'90%'}}
                  size="small" type="number" value={formData.number_of_adults} onChange={(e) => handleAdultNumberChange(e, 1)} data-testid="adults"
                />
                
            </Grid>
            <Grid item xs={12} sm={6}>
                <TextField required fullWidth id="number_of_children" label="Number of Children" name="number_of_children" data-testid="children"
                   sx={{ mb: '2%', width: '70%'}}  size="small" type="number" value={formData.number_of_children} onChange={(e) => handleChildrenNumberChange(e, 0)}
                />
                
            </Grid>
            <Grid item xs={12} sm={6}>
                <TextField required fullWidth id="number_of_rooms" label="Number of Rooms" name="number_of_rooms" data-testid="rooms"
                   sx={{ mb: '2%', width:'90%' }} size="small" type="number" value={formData.number_of_rooms} onChange={(e) => handleRoomNumberChange(e, 1)}
                />
                
            </Grid>
            <Grid item xs={12} sm={6}>
                <TextField type='date' required fullWidth id="CheckinDate"  label="Check In" data-testid="check-in-date"
                  name="check-in date"  sx={{ mb: '2%', width:'70%',}} size="small" value={formData.check_in_date}
                  InputProps={{
                    startAdornment: (
                      <PinIcon style={{ marginRight: '8px', color: '#757575' }} />
                    ),
                    readOnly: true 
                  }}
                />   
                </Grid>
                <Grid item xs={12} sm={6}>
                <TextField type='date' required fullWidth id="CheckoutDate"  label="Check Out" value={formData.check_out_date}
                  name="check-out date"  sx={{ mb: '2%', width:'90%'}} size="small" data-testid="check-out-date"
                  InputProps={{
                    startAdornment: (
                      <PinIcon style={{ marginRight: '8px', color: '#757575' }} />
                    ),
                    readOnly: true 
                  }}
                />    
            </Grid>
            <Typography component="div" variant="subtitle1" sx={{ color: "green", textDecoration: 'underline', fontSize: "large", ml: '2.5%',mt: '1%', fontWeight: 'bold', width : '90%'}}>
              Additional Services
            </Typography>
            <Box sx={{ ml: '2.5%'}}>
              {serviceError && (
                <Typography variant="subtitle1" color="grey" component="div" sx={{ mt : '2%', fontSize : 'small'}}>
                 {serviceError}
                </Typography>
              )}
              {services.map((service) => (
                <FormControlLabel
                  key={service.id} data-testid="service"
                  control={<Checkbox checked={selectedServices.includes(service.id)} onChange={() => handleServiceChange(service.id)} />}
                  label={service.title}
                />
              ))}
            </Box>


                <Button type="submit" fullWidth variant="contained" sx={{ bgcolor : 'green' , mt: '2%', ml:'3%', width:'80%', mb: '5%' }}
                  disabled={!formValid || isSubmitting}
                >
                {isSubmitting ? 'Booking...' : 'Book Now'}
                </Button>
                <Backdrop
                    sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }} open={backdrop}
                >
                  <CircularProgress color="inherit" />
                </Backdrop>
            </Grid>
        </Box>
        </Card>
                        <Divider orientation="vertical" flexItem sx={{ marginTop: '2%', backgroundColor: 'black', height: '96%', ml: '2%' }} />
                        {showBookingDetails && (
                            <Box sx={{ width: '45%', marginTop: '2%', minHeight: '90%', ml: '2%' }} data-testid='booking-details'>
                               <Card sx={{ width: '100%', height: '100%' }} >
                               <CardHeader title="Reservation Details"
                                        sx={{ mx: 'auto', textAlign: 'center', alignItems: 'center' }}/>
                            <CardContent sx={{ mx: 'auto', textAlign: 'center', alignItems: 'center'}}>
                                <Table sx={{ width:'80%',mx: 'auto', textAlign: 'center', alignItems: 'center', marginTop: '5%'}}>
                                    <TableRow>
                                        <TableCell variant="head" sx={{ fontWeight: 'bold' }}>Category</TableCell>
                                        <TableCell variant="head" sx={{ fontWeight: 'bold' }}>Detail</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell variant="head">Guest Name</TableCell>
                                        <TableCell>{bookingData.guest_name}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell variant="head">Address</TableCell>
                                        <TableCell>{bookingData.address}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell variant="head">Check in Date: {bookingData.check_out_date}</TableCell>
                                        <TableCell>Check out Date: {bookingData.check_out_date}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell variant="head">Number of rooms: {bookingData.number_of_rooms}</TableCell>
                                        <TableCell>Status: {bookingData.status}</TableCell>
                                    </TableRow>
                                </Table>
                                <Stack sx={{ display: 'flex', mt: '24%',  width: '100%', alignItems: 'center' }}
                                        direction="row" data-testid="navigate-stack">
                                        <CheckCircleIcon sx={{color:'gray'}}/> <Typography sx={{fontFamily:'Arial'}}>You can now navigate to continue with your payment process</Typography>
                                        </Stack>
                                <Stack sx={{mt:'4%', display: 'flex',  width: '100%', alignItems: 'center' }}
                                        direction="column" data-testid="navigate-stack">
                                    <Button variant="contained" sx={{bgcolor:'green',width: '100%'}} component={Link} to={`/view-payment-details/${bookingData.id}/`}>Payment Details</Button>
                                </Stack>
                            </CardContent>
                        </Card>
                            </Box>
                        )}                       
                </Box>
                </Box>

                </>
    )
}

export default Booking;
