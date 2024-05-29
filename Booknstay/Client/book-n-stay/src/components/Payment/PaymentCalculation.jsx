import React, { useState, useEffect } from "react";
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CollapsibleSidebar from "../Sidebar/Sidebar";
import { useNavigate, useParams, Link } from "react-router-dom";
import { hotelService } from "../../HotelService";
import { Table, TableCell, TableRow, Card, CardContent, 
    CardHeader, Stack, Box, Button, Alert, AlertTitle, Divider,Breadcrumbs,
    Typography, Radio, FormControlLabel, RadioGroup} from "@mui/material";
import CheckoutForm from "./PaymentCheckout";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';

const defaultTheme = createTheme();

const PaymentCalculation = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState([]);
    const [errorMessage, setErrorMessage] = useState("");
    const [showAdditionalStatement, setShowAdditionalStatement] = useState(false);
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [error, setError] = useState("");
    const [totalPayment,setTotalPayment] = useState('');
    const [backdrop, setBackdrop] = useState(false);

    const cash_inputs = {
        booking_id:id,payment_method:selectedPaymentMethod,
        payment_amount:totalPayment

    }

    useEffect(() => {
        fetchPaymentDetails();
    }, []);

    const fetchPaymentDetails = async () => {
        try {
            const response = await hotelService.PaymentDetails(String(id));
            setData(response.data);
            setTotalPayment(response.data.total_payment)
            setErrorMessage('')
        } catch (error) {
            setErrorMessage("Unable to retrieve the payment data.");
        }
    };

    const handleMakePayment = () => {
        setShowAdditionalStatement(true);
    };

    const handleConfirmPayment = async() => {
        setBackdrop(true)
        try {
            const response = await hotelService.PaymentConfirmation(cash_inputs);
            console.log(response)
            setBackdrop(false)
            setSuccessMessage("Booking confirmed successfully!");
            setError('')
            navigate(`/payment-invoice/${id}/`);
        } catch (error) {
            setError("Unable to retrieve the payment data.");
            setSuccessMessage('') 
            setBackdrop(false)           
        }
    };

    return (
        <>
            <CollapsibleSidebar />
            <ThemeProvider theme={defaultTheme}>
                <Box  sx={{ backgroundColor: '#F8F8F8', minHeight: '100vh', display: 'flex', flexDirection: 'column',
                            alignItems: 'left',p: '2%', position: 'relative', width: '100%',
                    }}>
                <Breadcrumbs
                    separator={<NavigateNextIcon fontSize="small" />} aria-label="breadcrumb"
                    sx={{ ml:'40%'}}
                >
                    <Link to="/">Home</Link>
                    <Typography color="textPrimary">Payment details</Typography>
                </Breadcrumbs>
                <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'left', width: '100%', }}>
                    {errorMessage && (
                        <Stack sx={{ width: '100%', mt: 2 }} spacing={10}>
                           <Alert severity="info"><AlertTitle>Info</AlertTitle>{errorMessage} </Alert> 
                        </Stack>
                    )}
                    {!errorMessage && (
                        <>
                        <Card sx={{ width: '40%', marginTop: '2%', minHeight: '90%', ml: 2 }}>
                            <CardHeader title="Payment Details" sx={{ mx: 'auto', textAlign: 'center' }} />
                            <CardContent>
                                <Table>
                                    <TableRow>
                                        <TableCell variant="head" sx={{ fontWeight: 'bold' }}>Category</TableCell>
                                        <TableCell variant="head" sx={{ fontWeight: 'bold' }}>Amount</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell variant="head">Room Rate</TableCell>
                                        <TableCell>{data.room_rate}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell variant="head">GST Amount</TableCell>
                                        <TableCell>{data.gst_amount}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell variant="head">Service Charge</TableCell>
                                        <TableCell>{data.service_charge}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell variant="head">Additional Services</TableCell>
                                        <TableCell>{data.total_service_price}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell variant="head" sx={{ fontWeight: 'bold' }}>Total Amount</TableCell>
                                        <TableCell>{data.total_payment}</TableCell>
                                    </TableRow>
                                </Table>

                                <Stack sx={{ display: 'flex', mt: 10,  width: '100%', alignItems: 'center' }}
                                        direction="row" data-testid="navigate-stack">
                                    <Button data-testid="make-payment" variant="contained" color="primary" sx={{ width: '100%' }}
                                        onClick={handleMakePayment}> Make Payment
                                    </Button>
                                </Stack>
                            </CardContent>
                        </Card>
                        <Divider orientation="vertical" flexItem sx={{ marginTop: '2%', backgroundColor: 'black', height: '96%', ml: 2 }} />
                        {showAdditionalStatement && (
                            <Box sx={{ width: '60%', marginTop: '2%', minHeight: '90%', ml: 2 }}>
                                <Card sx={{ width: '100%', height: '100%' }}>
                                    <CardHeader title="Payment Method"
                                        sx={{ mx: 'auto', textAlign: 'center', alignItems: 'center' }}/>
                                    <CardContent>
                                        <RadioGroup name="paymentMethod" value={selectedPaymentMethod}
                                            onChange={(event) => setSelectedPaymentMethod(event.target.value)}>
                                            <Stack sx={{ display: 'flex', mt: 2, alignItems: 'center', justifyContent: 'center', textAlign: 'center',}}
                                                        direction="row" spacing={5} data-testid='radio-stack'>
                                                <Typography variant="subtitle1">Select a payment method: </Typography>
                                                <FormControlLabel value="cash" data-testid='cash-option' control={<Radio />} label={<Typography variant="body1">Cash</Typography>}/>
                                                <FormControlLabel value="card" data-testid='card-option' control={<Radio />} label={<Typography variant="body1">Card</Typography>}/>
                                            </Stack>
                                        </RadioGroup>
                                    </CardContent>
                                    {selectedPaymentMethod === "cash" && (
                                        <Stack sx={{ mt: 4, alignItems: 'center' }} spacing={5}>
                                            <Typography variant="subtitle1"> You can confirm your payment{' '} </Typography>
                                            <Button variant="contained" color="primary" onClick={handleConfirmPayment}  mt={2} data-testid='confirm-button'>
                                                Confirm Payment</Button>
                                                <Backdrop
                                                    sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }} open={backdrop}
                                                >
                                                    <CircularProgress color="inherit" />
                                                </Backdrop>
                                            {successMessage && (
                                                <Stack sx={{ width: '90%' }}>
                                                    <Alert severity="success"><AlertTitle>Success</AlertTitle>{successMessage} </Alert>
                                                </Stack>
                                            )}
                                            {error && (
                                                <Stack sx={{ width: '90%' }}>
                                                    <Alert severity="error"><AlertTitle>Error</AlertTitle>{error} </Alert>
                                                </Stack>
                                            )}
                                        </Stack>
                                    )}
                                    {selectedPaymentMethod === "card" && (
                                        <CheckoutForm totalPayment={data.total_payment} bookingId={data.booking_id} />
                                    )}
                                </Card>
                            </Box>
                        )}
                        </>
                    )}
                </Box>
                </Box>
            </ThemeProvider>
        </>
    );
};

export default PaymentCalculation;
