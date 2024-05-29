import React, { useEffect, useState } from "react";
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { TextField, Breadcrumbs, Typography, Container } from '@mui/material';
import Stack from '@mui/material/Stack';
import { axiosPrivate } from "../../interceptor";
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import CollapsibleSidebar from "../Sidebar/Sidebar";
import { hotelService } from "../../HotelService";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import { Link } from "react-router-dom";
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';
import 'sweetalert2/dist/sweetalert2.min.css';
import Swal from 'sweetalert2';
import Loading from "../Loading/Loading";

const defaultTheme = createTheme();

const ListBookings = () => {
    const userData = localStorage.getItem('user');
    const user = userData ? JSON.parse(userData) : null;
    const userType = user ? user.userType : null;

    const [data, setData] = useState([]);
    const [errorMessage, setErrorMessage] = useState("");
    const [nextBooking, setNextBooking] = useState("");
    const [previousBooking, setPreviousBooking] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(0);
    const [sortBy, setSortBy] = useState("");
    const [sortDirection] = useState("asc");
    const [dialogOpen, setDialogOpen] = useState(false);
    const [paymentData, setPaymentData] = useState([]);
    const [backdrop, setBackdrop] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (sortBy) {
            sortBookingDetails();
        } else {
            fetchBookingDetails();
        }
    }, [searchQuery, sortBy]);

    const fetchBookingDetails = async () => {
        setLoading(true);
        try {
            const response = await hotelService.ListBookings({ query: searchQuery });
            setData(response.data.results);
            setNextBooking(response.data.next);
            setPreviousBooking(response.data.previous);
            setCurrentPage(1);
            setErrorMessage("");
        } catch (error) {
            if (error.response?.data) {
                setErrorMessage(error.response.data.message);
            }
        } finally {
            setLoading(false);
        }
    };

    const sortBookingDetails = async () => {
        try {
            const response = await hotelService.SortBookings(sortBy);
            setData(response.data.results);
            setNextBooking(response.data.next);
            setPreviousBooking(response.data.previous);
            setErrorMessage("");
        } catch (error) {
            if (error.response) {
                setErrorMessage(error.response.data.message);
            }
        } 
    };

    const handleNext = async () => {
        try {
            const response = await axiosPrivate.get(nextBooking);
            setData(response.data.results);
            setNextBooking(response.data.next);
            setPreviousBooking(response.data.previous);
            setCurrentPage(currentPage + 1);
        } catch (error) {
            console.error("Error fetching next booking:", error);
        }
    };
    
    const handlePrevious = async () => {
        try {
            const response = await axiosPrivate.get(previousBooking);
            setData(response.data.results);
            setNextBooking(response.data.next);
            setPreviousBooking(response.data.previous);
            setCurrentPage(currentPage - 1);
        } catch (error) {
            console.error("Error fetching previous booking:", error);
        }
    };
    

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
        setSortBy("");
    };

    const handleApplySorting = (value) => {
        setSortBy(value);
        setSearchQuery("");
    };

    const getSortIndicator = (column) => {
        if (sortBy === column) {
            return sortDirection === "asc" ? "↑" : "↓";
        }
        return "↑↓";
    };

    const handleDialogClose = () => {
        setDialogOpen(false);
    };

    const fetchPaymentDetails = async (booking_id) => {
        setDialogOpen(true)
        try {
            const response = await hotelService.FetchPaymentDetails(String(booking_id))
            setPaymentData(response.data)
        } catch (error) {
            setPaymentData([])
        }
    }

    const isCancelable = (bookedAt) => {
        const twoHoursInMillis = 2 * 60 * 60 * 1000;
        const currentTime = new Date();
        const bookedTime = new Date(bookedAt);
        const timeDifference = currentTime.getTime() - bookedTime.getTime();
        return timeDifference > twoHoursInMillis;
    };

    const cancelIncompleteBooking = async (booking_id) => {
        setBackdrop(true)
        try {
            await hotelService.CancelIncompleteBooking(String(booking_id))
            setBackdrop(false)
            Swal.fire({
                position: 'top',
                icon: 'success',
                title: 'You have successfully cancelled the booking',
                showConfirmButton: false,
                timer: 3000,
            });
            setErrorMessage('')
            fetchBookingDetails()
        } catch (error) {
            if (error.response) {
                setErrorMessage(error.response.data.message);
            }
        }
    }

    if (loading) {
        return <Loading />;
    }

    const nodata = (
        <Container>
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '80vh',
                }}
            >
                <img alt='No data found' src='https://booknstay.innovaturelabs.com/no_hotel_booking.png' height='35%' width='35%'/>
                <Typography variant="h5" color="textSecondary" gutterBottom>
                    <br></br>No Bookings Found !
                </Typography>
                {userType == 'hotel' && (
                    <>
                        <Typography variant="h8" color="textSecondary" gutterBottom>
                            Once user make booking with your hotel, your bookings will appear here.
                        </Typography>

                        <Button component={Link} to="/hotel-dashboard" variant="outlined" color="primary" sx={{ mt: '2%'}}>
                            Go back
                        </Button>
                    </>
                )}
                {(userType == 'admin' || userType == 'supervisor') && (
                    <>
                        <Typography variant="h8" color="textSecondary" gutterBottom>
                           Once user make booking with hotel, bookings will appear here.
                        </Typography>

                        <Button component={Link} to="/supervisor-dashboard" variant="outlined" color="primary" sx={{ mt: '2%'}}>
                            Go back
                        </Button>
                    </>
                )}
            </Box>
        </Container>
    )

    return (
        <>
            <CollapsibleSidebar />
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    minHeight: '90vh',
                    width: '100%',
                    backgroundColor: '#F8F8F8'
                }}
            >
                {data.length > 0 && (
                    <Breadcrumbs
                        separator={<NavigateNextIcon fontSize="small" />}
                        aria-label="breadcrumb"
                        sx={{ mt: 2 }}
                    >
                        {userType === 'supervisor' && (
                            <Link to="/supervisor-dashboard">Home</Link>
                        )}
                        {userType === 'admin' && (
                            <Link to="/supervisor-dashboard">Home</Link>
                        )}
                        {userType === 'hotel' && (
                            <Link to="/hotel-dashboard">Home</Link>
                        )}
                        <Typography color="textPrimary">Booking Details</Typography>
                    </Breadcrumbs>
                )}

                {data.length === 0 && (
                    <>
                        {nodata}
                    </>
                )}

                <ThemeProvider theme={defaultTheme}>
                    {data.length > 0 && (
                        <Card sx={{ minWidth: 1000, marginTop: '2%', width: '93%', mb: '2%' }}>
                            <CardHeader title="Booking Details" />
                            <CardContent>
                                <Stack direction="row" spacing={2} sx={{ ml: 4 }}>
                                    <TextField
                                        id="Search"
                                        name="search"
                                        label="Search"
                                        autoFocus
                                        size="small"
                                        sx={{ mb: 2, ml: 21, width: { sm: 750 } }}
                                        value={searchQuery}
                                        onChange={handleSearchChange}
                                        data-testid='search'
                                    />
                                </Stack>
                                {errorMessage && data.length > 0 && <Alert severity="info" sx={{ mt: 3, ml: 4, mr: 1, width: '90%' }}>{errorMessage}</Alert>}

                                {!errorMessage && (userType === "admin" || userType === "supervisor") && (
                                    <TableContainer component={Paper} sx={{ maxWidth: '95%', mx: 'auto', mt: 2 }}>
                                        <Table sx={{ minWidth: 300 }} aria-label="simple table" data-testid='table'>
                                            <TableHead sx={{ bgcolor: '#B4B4B8' }}>
                                                <TableRow>
                                                    <TableCell align="center" sx={{ color: '#272829', fontWeight: 'bold' }}>SI. No</TableCell>
                                                    <TableCell align="center" sx={{ color: '#272829', fontWeight: 'bold' }}>Hotel Name</TableCell>
                                                    <TableCell align="center" sx={{ color: '#272829', fontWeight: 'bold', "&:hover": { cursor: 'pointer' } }} onClick={() => handleApplySorting('guest_name')}>Guest Name {getSortIndicator('guest_name')}</TableCell>
                                                    <TableCell align="center" sx={{ color: '#272829', fontWeight: 'bold' }}>Address</TableCell>
                                                    <TableCell align="center" sx={{ color: '#272829', fontWeight: 'bold', "&:hover": { cursor: 'pointer' } }} onClick={() => handleApplySorting('check_in_date')}>Check In {getSortIndicator('check_in_date')}</TableCell>
                                                    <TableCell align="center" sx={{ color: '#272829', fontWeight: 'bold' }}>Check Out</TableCell>
                                                    <TableCell align="center" sx={{ color: '#272829', fontWeight: 'bold', "&:hover": { cursor: 'pointer' } }} onClick={() => handleApplySorting('booked_at')}>Booked At {getSortIndicator('booked_at')}</TableCell>
                                                    <TableCell align="center" sx={{ color: '#272829', fontWeight: 'bold', "&:hover": { cursor: 'pointer' } }} onClick={() => handleApplySorting('status')}>Status {getSortIndicator('status')}</TableCell>
                                                    <TableCell align="center" sx={{ color: '#272829', fontWeight: 'bold' }}>Payment</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {data && data.map((customer, index) => (
                                                    <TableRow key={customer.index} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                                        <TableCell align="center">{index + 1}</TableCell>
                                                        <TableCell align="center">{customer.hotel_name}</TableCell>
                                                        <TableCell align="center">{customer.guest_name}</TableCell>
                                                        <TableCell align="center">{customer.address}</TableCell>
                                                        <TableCell align="center">{customer.check_in_date}</TableCell>
                                                        <TableCell align="center">{customer.check_out_date}</TableCell>
                                                        <TableCell align="center">{customer.booked_at}</TableCell>
                                                        <TableCell align="center">{customer.status}</TableCell>
                                                        <TableCell align="center" >
                                                            <Stack direction="column" spacing={'2%'} sx={{ width: "170px" }}>
                                                                {customer.status != 'in progress' && (
                                                                    <Button variant="contained" sx={{ width: '100%', bgcolor: "#35374B" }} data-testid="view-payment"
                                                                        onClick={() => fetchPaymentDetails(customer.id)}>
                                                                        View Payment
                                                                    </Button>
                                                                )}
                                                            </Stack>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                )}

                                {(!errorMessage && userType === "hotel") && (
                                    <TableContainer component={Paper} sx={{ maxWidth: '95.5%', mx: 'auto', mt: 2 }} data-testid='table2'>
                                        <Table sx={{ minWidth: 300 }} aria-label="simple table">
                                            <TableHead sx={{ bgcolor: '#B4B4B8' }}>
                                                <TableRow>
                                                    <TableCell align="center" sx={{ color: '#272829', fontWeight: 'bold' }}>SI. No</TableCell>
                                                    <TableCell align="center" sx={{ color: '#272829', fontWeight: 'bold' }}>Room Type</TableCell>
                                                    <TableCell align="center" sx={{ color: '#272829', fontWeight: 'bold', "&:hover": { cursor: 'pointer' } }} onClick={() => handleApplySorting('guest_name')}>Guest Name {getSortIndicator('guest_name')}</TableCell>
                                                    <TableCell align="left" sx={{ color: '#272829', fontWeight: 'bold' }}>Address</TableCell>
                                                    <TableCell align="left" sx={{ color: '#272829', fontWeight: 'bold' }}>Email</TableCell>
                                                    <TableCell align="left" sx={{ color: '#272829', fontWeight: 'bold' }}>Phone</TableCell>
                                                    <TableCell align="left" sx={{ color: '#272829', fontWeight: 'bold' }}>Aadhar</TableCell>
                                                    <TableCell align="center" sx={{ color: '#272829', fontWeight: 'bold', "&:hover": { cursor: 'pointer' } }} onClick={() => handleApplySorting('check_in_date')}>Check IN {getSortIndicator('check_in_date')}</TableCell>
                                                    <TableCell align="center" sx={{ color: '#272829', fontWeight: 'bold' }}>Check OUT</TableCell>
                                                    <TableCell align="left" sx={{ color: '#272829', fontWeight: 'bold' }}>No. of Persons</TableCell>
                                                    <TableCell align="center" sx={{ color: '#272829', fontWeight: 'bold' }}>No. of Rooms</TableCell>
                                                    <TableCell align="center" sx={{ color: '#272829', fontWeight: 'bold', "&:hover": { cursor: 'pointer' } }} onClick={() => handleApplySorting('booked_at')}>Booked At {getSortIndicator('booked_at')}</TableCell>
                                                    <TableCell align="center" sx={{ color: '#272829', fontWeight: 'bold', "&:hover": { cursor: 'pointer' } }} onClick={() => handleApplySorting('status')}>Status {getSortIndicator('status')}</TableCell>
                                                    <TableCell align="center" sx={{ color: '#272829', fontWeight: 'bold' }}>Payment</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {data && data.map((bookings, index) => (
                                                    <TableRow key={bookings.index} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                                        <TableCell align="center">{index + 1}</TableCell>
                                                        <TableCell align="center">{bookings.room_type}</TableCell>
                                                        <TableCell align="center">{bookings.guest_name}</TableCell>
                                                        <TableCell align="left">{bookings.address} <br /></TableCell>
                                                        <TableCell align="left">{bookings.email} <br /></TableCell>
                                                        <TableCell align="left">{bookings.phone_number} <br /></TableCell>
                                                        <TableCell align="left">{bookings.aadhar_number}</TableCell>
                                                        <TableCell align="center">{bookings.check_in_date}</TableCell>
                                                        <TableCell align="center">{bookings.check_out_date}</TableCell>
                                                        <TableCell align="left">Adults : {bookings.number_of_adults} <br /> Children : {bookings.number_of_children}</TableCell>
                                                        <TableCell align="center">{bookings.number_of_rooms}</TableCell>
                                                        <TableCell align="center">{bookings.booked_at}</TableCell>
                                                        <TableCell align="center">{bookings.status}</TableCell>
                                                        <TableCell align="center" sx={{ "&:hover": { cursor: 'pointer' }, }}  >
                                                            <Stack direction="column" spacing={'2%'} sx={{ width: "170px" }}>
                                                                {bookings.status != 'in progress' && (
                                                                    <Button variant="contained" sx={{ width: '100%', bgcolor: "#35374B" }} data-testid="payment" onClick={() => fetchPaymentDetails(bookings.id)}>View Payment</Button>
                                                                )}
                                                                {bookings.status === 'in progress' && isCancelable(bookings.booked_at) && (
                                                                    <Button variant="contained" sx={{ bgcolor: "#61677A" }} onClick={() => cancelIncompleteBooking(bookings.id)}>Cancel booking</Button>
                                                                )}
                                                            </Stack>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                )}
                                {!errorMessage && (
                                    <Stack sx={{ mt: 2, ml: '79.5%' }} direction="row" data-testid='navigate-stack'>
                                        {previousBooking ? (
                                            <Button data-testid="previous" onClick={handlePrevious}>Previous</Button>
                                        ) : (
                                            <Button data-testid="previous" disabled>Previous</Button>
                                        )}
                                        <Button data-testid="page">{currentPage}</Button>
                                        {nextBooking ? (
                                            <Button data-testid="next" onClick={handleNext}>Next</Button>
                                        ) : (
                                            <Button data-testid="next" disabled>Next</Button>
                                        )}
                                    </Stack>
                                )}
                            </CardContent>
                        </Card>
                    )}
                    <Dialog
                        open={dialogOpen}
                        onClose={handleDialogClose}
                        data-testid="dialog"
                    >
                        <DialogTitle>Payment Details</DialogTitle>
                        {paymentData ? (paymentData.map((payments, index) => (
                            <DialogContent key={payments.index}>
                                <DialogContentText>
                                    payment id: {payments.id}
                                    <br />
                                    payment amount: {payments.amount}
                                    <br />
                                    payment user: {payments.customer_name}
                                    <br />
                                    payment method: {payments.payment_method}
                                    <br />
                                    payment status: {payments.status}
                                    <br />
                                </DialogContentText>
                            </DialogContent>
                        ))
                        ) : (
                            <DialogContent>
                                <DialogContentText>
                                    Oops! Unable to fetch the data
                                </DialogContentText>
                            </DialogContent>
                        )}
                        <DialogActions>
                            <Button
                                variant="contained"
                                onClick={handleDialogClose}
                                data-testid="cancelbutton"
                            >
                                Close
                            </Button>
                        </DialogActions>
                    </Dialog>
                    <Backdrop
                        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }} open={backdrop}
                    >
                        <CircularProgress color="inherit" />
                    </Backdrop>
                </ThemeProvider>
            </Box>
        </>
    );
}

export default ListBookings;
