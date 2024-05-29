import React, { useState, useEffect } from "react";
import { hotelService } from "../../HotelService";
import { Box, Button, Stack, Alert, AlertTitle, Typography, Grid, TextField } from "@mui/material";
import { useStripe, useElements,CardElement } from "@stripe/react-stripe-js";
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';
import { useNavigate } from "react-router-dom";

const CheckoutForm = ({ totalPayment,bookingId }) => {
    const [clientSecret, setClientSecret] = useState("");
    const [formData,setFormData] = useState({name:'',line:'',city:'',state:''})
    const inputs={name:formData.name,line: formData.line, city:formData.city, state:formData.state}
    const [successMessage, setSuccessMessage] = useState("");
    const [error, setError] = useState("");
    const input_data = { total_payment: totalPayment, booking_id: bookingId };
    const stripe = useStripe();
    const elements = useElements();
    const [backdrop, setBackdrop] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        createPaymentIntent();
    }, []);

    const createPaymentIntent = async () => {
        try {
            const response = await hotelService.PaymentCheckout(input_data);
            setClientSecret(response.data.clientSecret);
        } catch (error) {
            console.error("Error creating payment intent:", error);
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!stripe || !elements) {
            return;
        }
        setBackdrop(true)
        const result = await stripe.confirmCardPayment(clientSecret, {
            payment_method: {
                card: elements.getElement(CardElement),
                billing_details: {
                    name: inputs.name,
                    address:{
                        "city":inputs.city,
                        "country":"US",
                        "line1":inputs.line,
                        "state":inputs.state
                    },
                },
            }
        });
        console.log(result)
        if (result.error) {
            console.error(result.error.message);
        } else {
            if (result.paymentIntent.status === 'succeeded') {
                setSuccessMessage("Payment completed successfully!");
                handleCardConfirmPayment(result.paymentIntent.id,result.paymentIntent.status)
            }
        }
        setBackdrop(false)
        }

        const handleCardConfirmPayment = async(payment_id,paymentstatus) => {
            setBackdrop(true)
            try {
                const payment_inputs = {
                    booking_id:bookingId,payment_method:'card',
                    payment_amount:totalPayment,payment_id:payment_id,
                    payment_status:paymentstatus
            
                }
                await hotelService.PaymentConfirmation(payment_inputs);
                setBackdrop(false)
                setSuccessMessage("Booking confirmed successfully!");
                setError('')
                navigate(`/payment-invoice/${bookingId}/`)
            } catch (error) {
                setBackdrop(false)
                setError("Unable to retrieve the payment data.");
                setSuccessMessage('')         
            }
        };

        const handleAddressLine = (e) => {
            const inputValue = e.target.value;
            
            setFormData((prevData) => ({
                ...prevData,
                line: inputValue,
              }));
    
        };
        const handleCity = (e) => {
            const inputValue = e.target.value;
            
            setFormData((prevData) => ({
                ...prevData,
                city: inputValue,
              }));
    
        };
        const handleState = (e) => {
            const inputValue = e.target.value;
            
            setFormData((prevData) => ({
                ...prevData,
                state: inputValue,
              }));
    
        };
        const handleCustomerName = (e) => {
            const inputValue = e.target.value;
            
            setFormData((prevData) => ({
                ...prevData,
                name: inputValue,
              }));
    
        };

    return (
        <form onSubmit={handleSubmit} data-testid="checkout-form">
            {clientSecret ? (
                <Box sx={{ width: '90%', marginTop: '2%', minHeight: '90%', alignItems: 'center',p: 3}} data-testid='checkout-box'>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold',mt: 2,mb: 2 }}>Card details</Typography>
                    <CardElement  />
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mt: 2 }}>Billing details</Typography>
                    <Stack sx={{ display: 'flex', mt: 2, alignItems: 'center',textAlign: 'center',}}>
                        <Grid container spacing={1}>
                            <Grid item xs={12} sm={6}>
                                <TextField required id="name" value={formData.name} label="Card Holder Name" name="name" sx={{ mb: 2, mt:2 }} 
                                     data-testid="name" size= 'small' onChange={handleCustomerName}/>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField required id="line" value={formData.line} label="Address Line" name="line" sx={{ mb: 2, mt:2 }} 
                                     data-testid="line" size= 'small' onChange={handleAddressLine}/>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField required id="city" value={formData.city} label="City" name="city" sx={{ mb: 2, mt:2 }} 
                                     data-testid="city" size= 'small' onChange={handleCity}/>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField required id="state" value={formData.state} label="State" name="state" sx={{ mb: 2, mt:2 }} 
                                     data-testid="state" size= 'small' onChange={handleState}/>
                            </Grid>
                        </Grid>
                    </Stack>
                    <Button type="submit" data-testid="payment" variant="contained" color="primary" sx={{ width: '100%', mt:2 }}
                         disabled={!stripe}>Pay ${totalPayment}</Button>
                    <Backdrop 
                        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }} open={backdrop}
                    >
                        <CircularProgress color="inherit" />
                    </Backdrop>
                    {successMessage && (
                        <Stack sx={{ width: '90%', mt:2 }}>
                            <Alert severity="success"><AlertTitle>Success</AlertTitle>{successMessage} </Alert>
                        </Stack>
                    )}
                    {error && (
                        <Stack sx={{ width: '90%' }}>
                            <Alert severity="error"><AlertTitle>Error</AlertTitle>{error} </Alert>
                        </Stack>
                    )}
                </Box>
            ): (
                <div>Loading...</div>
            )}
        </form>
    );
};

export default CheckoutForm;
