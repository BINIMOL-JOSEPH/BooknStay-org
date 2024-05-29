import React, { useState, useEffect } from 'react';
import 'sweetalert2/dist/sweetalert2.min.css';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import CssBaseline from '@mui/material/CssBaseline';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import 'react-toastify/dist/ReactToastify.css';
import { hotelService, } from '../../HotelService';
import CollapsibleSidebar from '../Sidebar/Sidebar';
import { Divider, Stack, Breadcrumbs } from '@mui/material';
import Link from '@mui/material/Link';
import Alert from '@mui/material/Alert';
import { useParams, Link as RouterLink } from "react-router-dom";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";

const defaultTheme = createTheme();

function Copyright() {
    return (
      <Typography variant="body2" color="text.secondary">
        {'Copyright © '}
        <Link color="inherit" href="https://mui.com/">
         BooknStay
        </Link>{' '}
        {new Date().getFullYear()}
        {'.'}
      </Typography>
    );
  }

const PaymentInvoice =() =>{
    const { id } = useParams();
    const [paymentData,setPaymentData] = useState({payment_method:'',amount:'',paid_at:'',status:''})
    const [bookingData,setBookingData] = useState({guest_name:'',address:'',number_of_rooms:'',status:'',booked_at:'',check_in_date:'',check_out_date:''})
    const [hotelData,setHotelData] = useState({hotel_name:'',address:'',email:'',phone_number:''})
    const [error,setError] = useState("")

    useEffect(() =>{
        FetchPaymentInvoice()

    },[])

    const DownloadInvoice = async () => {
      window.open(`/download-invoice/${id}`, '_blank');
  };

    const extractPaymentData = (payment) => ({
    payment_method: payment?.payment_method || "",
    amount: payment?.amount || "",
    paid_at: payment?.paid_at || "",
    status: payment?.status || "",
  });
  
  const extractBookingData = (booking) => ({
    guest_name: booking?.guest_name || "",
    address: booking?.address || "",
    number_of_rooms: booking?.number_of_rooms || "",
    status: booking?.status || "",
    booked_at: booking?.booked_at || "",
    check_in_date: booking?.check_in_date || "",
    check_out_date: booking?.check_out_date || "",
  });
  
  const extractHotelData = (hotel) => ({
    hotel_name: hotel?.hotel_name || "",
    address: hotel?.address || "",
    email: hotel?.email || "",
    phone_number: hotel?.phone_number || "",
  });
  
  const FetchPaymentInvoice = async () => {
    try {
      const response = await hotelService.FetchPaymentInvoice(String(id));
      const { payment, booking, hotel } = response.data;
  
      const paymentData = extractPaymentData(payment);
      const bookingData = extractBookingData(booking);
      const hotelData = extractHotelData(hotel);
  
      setPaymentData(paymentData);
      setBookingData(bookingData);
      setHotelData(hotelData);
      setError("");
    } catch (error) {
      setError("Unable to retrieve the data");
    }
  };

    return(
        <>
        <CollapsibleSidebar/>
        <Box
          sx={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          minHeight: '100vh', width: '100%', backgroundColor: '#F8F8F8',
          }}
        >
        <Breadcrumbs
          separator={<NavigateNextIcon fontSize="small" />} aria-label="breadcrumb" sx={{ mt:'1%'}}
        >
          <RouterLink to="/">Home</RouterLink>
          <Typography color="textPrimary">Payment invoice</Typography>
        </Breadcrumbs>
        <ThemeProvider theme={defaultTheme}>
        <CssBaseline />
        <Box
          sx={{display: 'flex', flexDirection: 'column', p: 3, boxShadow: 3,width: '70%',
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
        {error && <Alert severity="info" sx={{mt : 3, ml : 3, mr : 1, width : '95%'}}>{error}</Alert>}
                    
        {!error && (
            <>
         <Typography component="h1" variant="h3" sx={{  textAlign: 'center'}}>Payment Invoice </Typography>
         <Stack sx={{ mt: 2, ml:'88%',alignItems: 'right' }} spacing={5}>
                      <Button type="submit" variant="contained" color="success" sx={{ mt: 3, mb: 2 }}
                        onClick={DownloadInvoice} data-testid="download">
                        Download
                      </Button>
                    </Stack>
        <Box
            component="form" data-testid='form-submit' noValidate  sx={{ mt: 3 }}
        >
            <Stack spacing={3}>
            <Typography component="h1" variant="h5" sx={{ mt: 3, mb: 2 }}> Payment Details </Typography>
            <Grid container spacing={1}>
            <Grid item xs={12} sm={4}>
                <TextField autoComplete="given-name" name="payment_method" required fullWidth
                  id="payment-method" label="Payment Method" value={paymentData.payment_method} autoFocus size='small'
                  sx={{ mb: 2 }} data-testid="payment-method"/>
            </Grid>
            <Grid item xs={12} sm={4}>
                <TextField autoComplete="given-name" name="payment_amount" required fullWidth
                  id="payment-amount" label="Payment Amount" value={paymentData.amount} autoFocus size='small'
                  sx={{ mb: 2 }}/>
            </Grid>
            <Grid item xs={12} sm={4}>
                <TextField autoComplete="given-name" name="payment_status" required fullWidth
                  id="payment-status" label="Payment Status" value={paymentData.status} autoFocus size='small'
                  sx={{ mb: 2 }}/>
            </Grid>
            <Grid item xs={12} sm={4}>
                <TextField autoComplete="given-name" name="payment_date" required fullWidth
                  id="pai-at" label="Payment Date" value={paymentData.paid_at} autoFocus size='small'
                  sx={{ mb: 2 }} />
            </Grid>
            </Grid>
            </Stack>
            <Stack spacing={3}>
            <Typography component="h1" variant="h5" sx={{ mt: 3, mb: 2 }}> Booking Details </Typography>
            <Grid container spacing={1}>
            <Grid item xs={12} sm={4}>
                <TextField autoComplete="given-name" name="guest_name" required fullWidth
                  id="guest-name" label="Guest Name" value={bookingData.guest_name} autoFocus size='small'
                  sx={{ mb: 2 }} />
            </Grid>
            <Grid item xs={12} sm={4}>
                <TextField autoComplete="given-name" name="address" required fullWidth
                  id="address" label="Address" value={bookingData.address} autoFocus size='small'
                  sx={{ mb: 2 }} />
            </Grid>
            <Grid item xs={12} sm={4}>
                <TextField autoComplete="given-name" name="number_of_rooms" required fullWidth
                  id="number-of-rooms" label="Number of rooms" value={bookingData.number_of_rooms} autoFocus size='small'
                  sx={{ mb: 2 }} />
            </Grid>
            <Grid item xs={12} sm={4}>
                <TextField autoComplete="given-name" name="check_in_date" required fullWidth
                  id="check-in" label="Check-in Date" value={bookingData.check_in_date} autoFocus size='small'
                  sx={{ mb: 2 }}/>
            </Grid>
            <Grid item xs={12} sm={4}>
                <TextField autoComplete="given-name" name="check_in_date" required fullWidth
                  id="check-in" label="Check-in Date" value={bookingData.check_out_date} autoFocus size='small'
                  sx={{ mb: 2 }} />
            </Grid>
            <Grid item xs={12} sm={4}>
                <TextField autoComplete="given-name" name="booked_date" required fullWidth
                  id="booked-at" label="Booked Date" value={bookingData.booked_at} autoFocus size='small'
                  sx={{ mb: 2 }}/>
            </Grid>
            <Grid item xs={12} sm={4}>
                <TextField autoComplete="given-name" name="booking_status" required fullWidth
                  id="booking-status" label="Booking Status" value={bookingData.status} autoFocus size='small'
                  sx={{ mb: 2 }} />
            </Grid>
            </Grid>
            </Stack>
            <Stack spacing={3}>
            <Typography component="h1" variant="h5" sx={{ mt: 3, mb: 2 }}> Hotel Details </Typography>
            <Grid container spacing={1}>
            <Grid item xs={12} sm={4}>
                <TextField autoComplete="given-name" name="hotel_name" required fullWidth
                  id="hotel-name" label="Hotel Name" value={hotelData.hotel_name} autoFocus size='small'
                  sx={{ mb: 2 }} />
            </Grid>
            <Grid item xs={12} sm={4}>
                <TextField autoComplete="given-name" name="hotel_address" required fullWidth
                  id="hotel-address" label="Hotel Address" value={hotelData.address} autoFocus size='small'
                  sx={{ mb: 2 }}/>
            </Grid>
            <Grid item xs={12} sm={4}>
                <TextField autoComplete="given-name" name="hotel_email" required fullWidth
                  id="hotel-email" label="Email Id" value={hotelData.email} autoFocus size='small'
                  sx={{ mb: 2 }}/>
            </Grid>
            <Grid item xs={12} sm={4}>
                <TextField autoComplete="given-name" name="contact" required fullWidth
                  id="contact" label="Hotel Contact" value={hotelData.phone_number} autoFocus size='small'
                  sx={{ mb: 2 }}/>
            </Grid> 
            </Grid>
            </Stack>
            
        </Box>
        </>
        )}
        </Box>
        </Container>
        <Divider orientation="horizontal" flexItem sx={{ marginTop: '2%', backgroundColor: 'black', height: '96%', ml: 2 }} />
        <Box component="footer" sx={{ mt: 2,textAlign: 'center' }}>
          <Container maxWidth="sm">
            <Typography variant="body1">
             Thank you for using our service.
            </Typography>
            <Copyright />
          </Container>
        </Box>
    </Box>  
    </ThemeProvider>
    {/* )} */}
    </Box>
    </>
    )

}

export default PaymentInvoice;
