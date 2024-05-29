import React, { useEffect, useState } from "react";
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import CssBaseline from "@mui/material/CssBaseline";
import CardContent from "@mui/material/CardContent";
import TextField from "@mui/material/TextField";
import Divider from "@mui/material/Divider";
import Container from "@mui/material/Container";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { hotelService } from "../../HotelService";
import { userService } from "../../UserService";
import { axiosPrivate } from "../../interceptor";
import CollapsibleSidebar from "../Sidebar/Sidebar";
import { Link } from "react-router-dom";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';
import Loading from "../Loading/Loading";
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import TodayIcon from '@mui/icons-material/Today';
import EventBusyIcon from '@mui/icons-material/EventBusy';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import DateRangeIcon from '@mui/icons-material/DateRange';

const defaultTheme = createTheme();

const CustomerReservationList = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const [value, setValue] = useState('all');
    const [reservationData, setReservationData] = useState([]);
    const [error, setError] = useState("");
    const [nextPage, setNextPage] = useState("");
    const [previousPage, setPreviousPage] = useState("");
    const [currentPage, setCurrentPage] = useState(0);
    const [backdrop, setBackdrop] = useState(false);
    const [loading, setLoading] = useState(true);
    const [bookingId, setBookingId] = useState('');
    const [dialogboxOpen, setDialogboxOpen] = useState(false);

    const handleValueChange = (event, newValue) => {
        setValue(newValue);
    };

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
    };

    useEffect(() => {
        GetReservationList();
    }, [value, searchQuery]);

    const GetReservationList = async () => {
        const input = { status_filter: value }
        try {
            const response = await hotelService.ReservationList(input, { query: searchQuery });
            if (Array.isArray(response.data.results)) {
                setReservationData(response.data.results);
                setNextPage(response.data.next)
                setPreviousPage(response.data.previous)
                setCurrentPage(1)
                setError("")
            } else {
                setError("Data is not received in the correct room format")
            }
        } catch (error) {
            setError("Unable to retrieve the data")
        } finally {
            setLoading(false);
        }
    };

    const handleNextPage = () => {
        axiosPrivate.get(nextPage).then((response) => {
            setReservationData(response.data.results);
            setNextPage(response.data.next);
            setPreviousPage(response.data.previous);
            setCurrentPage(currentPage + 1)
        });
    };

    const handlePreviousPage = () => {
        axiosPrivate.get(previousPage).then((response) => {
            setReservationData(response.data.results);
            setNextPage(response.data.next);
            setPreviousPage(response.data.previous);
            setCurrentPage(currentPage - 1)
        });
    };

    const renderStatusBadges = (booking) => {
        if (booking.status === 'confirmed') {
            return (
                <>
                    <img src='https://booknstay.innovaturelabs.com/confirm_badge.png' alt="cancelled" style={{ width: 100, height: 100, marginBottom: '5px' }} />
                    <Stack direction='row' sx={{ alignItems: 'center', mr: '5%', mt: '4%' }}>
                        <Button sx={{ ml: 2, height: '70%', alignItems: 'right', bgcolor: 'green' }} variant="contained"
                            data-testid='view-more' component={Link} to={`/payment-invoice/${booking.id}/`}>Invoice</Button>
                        <Button sx={{ ml: 2, height: '70%', alignItems: 'right', bgcolor: 'gray' }} variant="contained"
                            data-testid='cancel' onClick={() => handleCancel(booking.id)} >Cancel</Button></Stack>
                </>
            );
        }
        else if (booking.status === 'in progress') {
            return (
                <>
                    <img src='https://booknstay.innovaturelabs.com/pending_badge.png' alt="in progress" style={{ width: 100, height: 100, marginBottom: '5px' }} />
                    <Stack direction='row' sx={{ alignItems: 'center', mr: '10%', mt: '5%' }}>
                        <Button sx={{ ml: 2, height: '70%', alignItems: 'right', bgcolor: 'green' }} variant="contained"
                            data-testid='view-more' component={Link} to={`/view-payment-details/${booking.id}/`}>Payment</Button>
                        <Button sx={{ ml: 2, height: '70%', alignItems: 'right', bgcolor: 'gray' }} variant="contained"
                            data-testid='cancel' onClick={() => handleCancel(booking.id)} >Cancel</Button></Stack>

                </>
            )
        } else {
            return (
                <img src='https://booknstay.innovaturelabs.com/cancelled_badge.png' alt="cancelled" style={{ width: 120, height: 'auto', marginTop: '5px' }} />
            );
        }
    }

    const handleCancel = async (booking_id) => {
        setBookingId(booking_id);
        setDialogboxOpen(true);

    }

    const handleCancelBooking = async () => {
        setBackdrop(true)
        setDialogboxOpen(false)
        try {
            await userService.CancelBooking(bookingId);
            setBackdrop(false)
            Swal.fire({
                position: 'center',
                icon: 'success',
                title: 'Booking cancelled successfully',
                showConfirmButton: false,
                timer: 2000,
            });
            GetReservationList();
        } catch (error) {
            setBackdrop(false)
            Swal.fire({
                position: 'center',
                icon: 'error',
                title: 'An error occurred during process. Please try again.',
                showConfirmButton: false,
                timer: 2000,
            });
        }
    }

    const handleDialogClose = () => {
        setDialogboxOpen(false)
    }

    if (loading) {
        return <Loading />;
    };

    const noReservationData = (
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
                <img alt='No data found' src='http://localhost:3000/No_data.png' height='30%' width='30%' />
                <Typography variant="h5" color="textSecondary" gutterBottom>
                    <br></br>No Bookings yet !
                </Typography>
                <Typography variant="h8" color="textSecondary" gutterBottom>
                    You don't have any bookings yet. Please make a booking and come back again.
                </Typography>
                <Button variant="contained" component={Link} to="/"
                    sx={{ mt: '2%', width: '15%', background: 'linear-gradient(to bottom, #20A4F3 0%, #2c67f2 100%)', borderRadius: 4 }}>
                    Plan a Trip
                </Button>
            </Box>
        </Container>
    )

    const noDataCategory = (
        <Container>
            <Stack direction={'row'}
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '60vh',
                }}
            >
                <img alt='No data found' src='http://localhost:3000/No_data.png' height='30%' width='30%' />
                <Stack direction={'column'}
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <Typography variant="h5" color="textSecondary" gutterBottom>
                        <br></br>No Bookings yet !
                    </Typography>
                    <Typography variant="h8" color="textSecondary" gutterBottom>
                        You don't have any bookings in this category
                    </Typography>
                    <Button variant="contained" component={Link} to="/"
                        sx={{ mt: '2%', width: '45%', background: 'linear-gradient(to bottom, #20A4F3 0%, #2c67f2 100%)', borderRadius: 4 }}>
                        Plan a Trip
                    </Button></Stack>
            </Stack>
        </Container>
    )

    return (
        <>
            <CollapsibleSidebar />
            <ThemeProvider theme={defaultTheme}>
                <CssBaseline />
                <Box
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        width: "100%",
                        minHeight: "90vh",
                        position: "relative",
                        backgroundColor: '#F8F8F8',
                    }}
                >
                    <Box sx={{ width: '100%', height: '14rem', backgroundImage: 'linear-gradient(262deg,#dbdbdb,#cfcfcf)' }}>
                        <Breadcrumbs
                            separator={<NavigateNextIcon sx={{ color: 'white' }} fontSize="medium" />}
                            aria-label="breadcrumb"
                            sx={{ ml: '2%', mt: '2%' }}
                        >
                            <Link to="/" style={{ textDecoration: 'none', color: 'white' }}>Home</Link>
                            <Typography color="textPrimary" sx={{ color: 'white' }}>Reservation list</Typography>
                        </Breadcrumbs>

                        <Box sx={{ mt: '1%' }}>
                            <TextField
                                type="text"
                                variant="outlined"
                                placeholder="Search by Guest Name, Phone Number, Booked At date"
                                sx={{
                                    display: 'flex', width: "450px", ml: '67.2%', height: "69px",
                                    "& .MuiOutlinedInput-root": {
                                        color: "#000",
                                        fontFamily: "Arial",
                                        backgroundColor: "#FFFFFF",
                                        borderRadius: '12px'
                                    },

                                }} size='large'
                                value={searchQuery} onChange={handleSearchChange} data-testid='search-field'
                            />
                        </Box>
                    </Box>
                    <Card sx={{ zIndex: '2', mt: '-4.5%', width: '90%', height: 'auto', mb: '2%', borderRadius: '15px', boxShadow: '1px 1px 10px rgba(0, 0, 0, 0.1)' }} >

                        <Tabs value={value} onChange={handleValueChange} aria-label="disabled tabs example" >
                            <Tab icon={<DateRangeIcon />} iconPosition="start" value="all" label="All" sx={{ fontFamily: 'Arial', fontWeight: 'bold', fontSize: '20px', color: '#c4c3c3' }} />
                            <Tab icon={<TodayIcon />} iconPosition="start" value="upcoming" label="Upcoming" sx={{ fontFamily: 'Arial', fontWeight: 'bold', fontSize: '20px', color: '#c4c3c3' }} />
                            <Tab icon={<EventBusyIcon />} iconPosition="start" value="cancelled" label="Cancelled" sx={{ fontFamily: 'Arial', fontWeight: 'bold', fontSize: '20px', color: '#c4c3c3' }} />
                            <Tab icon={<EventAvailableIcon />} iconPosition="start" value="completed" label="Completed" sx={{ fontFamily: 'Arial', fontWeight: 'bold', fontSize: '20px', color: '#c4c3c3' }} />
                        </Tabs>

                        {reservationData.length === 0 && noReservationData}
                        {error && reservationData.length > 0 && noDataCategory}

                        {!error && (
                            <>
                                {reservationData.map((booking, index) => (
                                    <Card key={booking.index} sx={{ display: 'flex', mt: '2%', width: '90%', ml: '5%' }} data-testid='detail-card'>
                                        <Box sx={{ display: 'flex', flexDirection: 'column', width: '40%' }}>
                                            <CardContent sx={{ flex: '1 0 auto' }}>
                                                <Typography component="div" variant="h5">
                                                    Booking ID: {booking.id}
                                                </Typography>
                                                <Typography component="div" variant="subtitle1" style={{ fontSize: 'large' }}>
                                                    {booking.guest_name}
                                                </Typography>
                                                <Typography variant="subtitle1" component="div" style={{ fontSize: 'medium', fontWeight: 'bold' }}>
                                                    Details
                                                </Typography>
                                                <Typography variant="subtitle1" component="div" style={{ fontSize: 'smaller' }}>
                                                    Email id: {booking.email}<br />
                                                    contact: {booking.phone_number}<br />
                                                    Address: {booking.address}
                                                </Typography>
                                            </CardContent>
                                        </Box>
                                        <Box sx={{ display: 'flex', flexDirection: 'column', width: '40%', mt: '5%' }}>
                                            <CardContent sx={{ flex: '1 0 auto' }}>
                                                <Typography component="div" variant="h5" style={{ fontSize: 'medium', fontWeight: 'bold' }}>
                                                    Booking Details
                                                </Typography>
                                                <Typography variant="subtitle1" component="div" style={{ fontSize: 'smaller' }}>
                                                    Number of rooms: {booking.number_of_rooms}<br />
                                                    Check in date: {booking.check_in_date}<br />
                                                    Check out date: {booking.check_out_date}<br />
                                                    Booked At: {booking.booked_at}
                                                </Typography>
                                            </CardContent>
                                        </Box>
                                        <Divider orientation="vertical" variant="middle" flexItem />
                                        <Box sx={{ display: 'flex', flexDirection: 'column', width: '20%', mt: '3%', alignItems: 'center' }}>
                                            {renderStatusBadges(booking)}
                                        </Box>
                                    </Card>
                                ))}
                                {!error && (
                                    <Stack sx={{ mt: '1%', mb: '2%', ml: '40%' }} direction="row" data-testid='navigate-stack'>
                                        {previousPage ? (
                                            <Button data-testid="previous" onClick={handlePreviousPage}>Previous</Button>
                                        ) : (
                                            <Button data-testid="previous" disabled>Previous</Button>
                                        )}
                                        <Button data-testid="page">{currentPage}</Button>
                                        {nextPage ? (
                                            <Button data-testid="next" onClick={handleNextPage}>Next</Button>
                                        ) : (
                                            <Button data-testid="next" disabled>Next</Button>
                                        )}
                                    </Stack>
                                )}
                                <Backdrop
                                    sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }} open={backdrop}
                                >
                                    <CircularProgress color="inherit" />
                                </Backdrop>
                            </>
                        )}
                    </Card>
                </Box>
                <Dialog open={dialogboxOpen} onClose={handleDialogClose} data-testid="dialog">
                    <DialogTitle>Cancel Booking</DialogTitle>
                    <DialogContent >
                        <DialogContentText>
                            Are you sure want to cancel the booking?
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button variant="contained" sx={{ bgcolor: 'green' }} onClick={handleCancelBooking} data-testid="confirmbutton">
                            Confirm
                        </Button>
                        <Button variant="contained" sx={{ bgcolor: 'gray' }} onClick={handleDialogClose} data-testid="closebutton">
                            Close
                        </Button>
                    </DialogActions>
                </Dialog>
            </ThemeProvider>
        </>
    )
}

export default CustomerReservationList;