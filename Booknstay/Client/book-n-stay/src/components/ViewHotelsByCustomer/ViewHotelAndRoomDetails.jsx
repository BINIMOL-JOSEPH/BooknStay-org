import React, { useEffect, useState } from "react";
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { hotelService } from "../../HotelService";
import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import NavigationBar from "../NavigationBar/NavigationBar";
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import { Breadcrumbs, Avatar  } from '@mui/material';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Carousel from 'react-material-ui-carousel';
import CollapsibleSidebar from "../Sidebar/Sidebar";
import ServicesDetailsDialog from "./ViewServicesDetailsDialog";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import MapComponent from "../MapComponent/MapComponent";
import ImageList from '@mui/material/ImageList'; 
import Rating from '@mui/material/Rating';

const defaultTheme = createTheme();

const ViewHotelRooms = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState([]);
    const [roomData, setRoomData] = useState([]);
    const [errorMessage, setErrorMessage] = useState("");
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedService, setSelectedService] = useState("");
    const [reviews, setReviews] = useState([]);
    const [reviewError, setReviewError] = useState("");
    const [locationLinks, setLocationLinks] = useState('');
    const [showAllImgaes, setShowAllImages] = useState(false);

    const user = JSON.parse(localStorage.getItem('user'));

    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const checkInDate = queryParams.get("checkInDate");
    const checkOutDate = queryParams.get("checkOutDate");

    useEffect(() => {
        ViewHotelDetails();
        ViewRoomDetails();
        ViewReviews();
    }, []);

    const ViewHotelDetails = async () => {
        try {
            const response = await hotelService.ViewHotel(String(id));
            if (Array.isArray(response.data)) {
                setData(response.data);
                setLocationLinks(response.data.map(hotel => hotel.hotel_details.location_link))
                setErrorMessage("")
            } else {
                setErrorMessage("Data is not received in the correct format")
            }
        } catch (error) {
            if (error.response) {
                setErrorMessage(error.response.data.message)
            }
        }
    }

    const ViewRoomDetails = async () => {
        try {
            const inputs = { check_in: checkInDate, check_out: checkOutDate }
            const response = await hotelService.FetchHotelRoom(String(id), inputs);
            if (Array.isArray(response.data)) {
                setRoomData(response.data);
                setErrorMessage("")
            } else {
                setErrorMessage("Data is not received in the correct format")
            }
        } catch (error) {
            if (error.response) {
                setErrorMessage(error.response.data.message)
            }
        }
    }

    const ViewReviews = async () => {
        try {
            const response = await hotelService.FetchReview(String(id));
            setReviews(response.data);
        } catch (error) {
            if (error.response) {
                setReviewError(error.response.data.message);
            }
        }
    }

    const handleLinkClick = (services_id) => {
        const id = services_id
        setSelectedService(id);
        setDialogOpen(true);
    };

    const handlePageNavigation = async (room_id) => {
        if (user) {
            navigate(`/book-rooms/${room_id}/?checkInDate=${checkInDate}&checkOutDate=${checkOutDate}`)
        } else {
            navigate(`/login?roomId=${room_id}&checkInDate=${checkInDate}&checkOutDate=${checkOutDate}`);
        }

    };

    const handleReviewClick = (hotel_id) => {
        if (user) {
            navigate(`/review/${hotel_id}/?checkInDate=${checkInDate}&checkOutDate=${checkOutDate}`);
        } else {
            navigate(`/login?reviewHotelId=${hotel_id}?checkInDate=${checkInDate}&checkOutDate=${checkOutDate}`);
        }
    };

    return (
        <>
            {user ? (<CollapsibleSidebar />) : (<NavigationBar />)}
            <Box sx={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: '100vh',
                width: '100%', backgroundColor: '#F8F8F8',
            }}>
                <ThemeProvider theme={defaultTheme}>
                    <Breadcrumbs
                        separator={<NavigateNextIcon fontSize="small" />}
                        aria-label="breadcrumb"
                        sx={{ mt: 2 }}
                    >
                        <Link to="/">Home</Link>
                        <Typography color="textPrimary">Hotel Details</Typography>
                    </Breadcrumbs>
                    {errorMessage && <Stack sx={{ width: '70%', ml: 10, mt: 5 }} spacing={10}><Alert severity="info" sx={{ mx: 'auto' }}>{errorMessage}</Alert></Stack>}
                    {data.map((hotel, index) => (
                        <Stack key={hotel.index} direction={'row'} spacing={2} sx={{ width: '93%', mt: '3%' }}>
                            <Box sx={{ width: '20%', height: '285px', borderRadius: '3%', overflow: 'hidden',}}>
                                <Box sx={{ width: '97%', height: '232px', ml: '2%', mt: '2%', mr: '2%', borderRadius: '3%', overflow: 'hidden' }}>
                                    <MapComponent locationLinks={locationLinks} />
                                </Box>
                                <Button variant="outlined" sx={{ mt: '2%', mb: '2%', ml: '2%', width: '97%' }} component={Link} to={`${hotel.hotel_details.location_link}`}>
                                    Explore on maps
                                </Button>
                            </Box>
                            <Box sx={{ width: '80%' }}>
                                <Card key={hotel.index} sx={{ display: 'flex', width: '100%', boxShadow: '1px 1px 10px rgba(0, 0, 0, 0.3)', borderRadius: 3 }} data-testid='detail-card'>
                                    <CardMedia
                                        component="img"
                                        sx={{ width: 400, height: 250, mt: '1.3%', ml: '1.3%', mb: '1%', borderRadius: 3 }}
                                        image={hotel.hotel_image}
                                        alt="Hotel image" />
                                    <Divider orientation="vertical" variant="middle" flexItem />
                                    <Box sx={{ display: 'flex', flexDirection: 'column', width: '57%' }}>
                                        <CardContent sx={{ flex: '1 0 auto' }}>
                                            <Typography component="div" variant="h5" sx={{ fontWeight: 'bold' }}>
                                                {hotel.hotel_details.hotel_name}
                                            </Typography>
                                            <Typography variant="subtitle1" component="div" sx={{ fontWeight: 'bold', color: 'grey' }}>
                                                {hotel.hotel_details.address}<br />
                                            </Typography>
                                            <Typography variant="subtitle1" component="div">
                                                {hotel.hotel_details.city} | {hotel.hotel_details.district} | {hotel.hotel_details.state}
                                            </Typography>
                                            <Typography variant="subtitle1" component="div" sx={{ fontSize: 'medium', color: '#0D9276' }}>
                                                {hotel.hotel_details.description?.split(',').map((part, index) => (
                                                    <div key={part.index}>✓ {part.trim()}</div>
                                                ))}
                                            </Typography>
                                            <Typography variant="subtitle1" component="div" style={{ fontSize: 'smaller' }}>
                                                <br />Email id: {hotel.hotel_details.email}<br />
                                                contact: {hotel.hotel_details.phone_number}
                                            </Typography>
                                        </CardContent>
                                    </Box>
                                    <Divider orientation="vertical" variant="middle" flexItem sx={{ backgroundColor: 'black', mr: '2%' }} />
                                    <Box sx={{ display: 'flex', flexDirection: 'column', width: "20%", mt: '1.3%', mr: '2%', mb: '0.5%' }}>
                                        <Stack direction="column" sx={{ display: "flex", alignItems: 'flex-end' }}>
                                            <Typography component="div" variant="subtitle1" sx={{ color: "grey", fontSize: "small" }}>
                                                ₹ {hotel.hotel_details.service_charge} service charges
                                            </Typography>
                                            <Typography component="div" variant="subtitle1" sx={{ color: "grey", fontSize: "small" }}>
                                                Per Night
                                            </Typography>
                                        </Stack>
                                        <Stack direction="column" sx={{ display: "flex", alignItems: 'flex-end', mt: '88%' }}>
                                            <Button variant="contained" onClick={() => handleReviewClick(hotel.hotel_details.id)} data-testid="manage-review">
                                                Write Review
                                            </Button>
                                        </Stack>
                                    </Box>
                                </Card>
                            </Box>
                        </Stack>
                    ))}
                    <Typography component="div" variant="h5" sx={{ display: "flex", mt: 3 }}>
                        Room Details
                    </Typography>
                    <Box sx={{ mt: 3, width: "90%" }}>
                        {roomData.map((room, index) => (
                            <Card key={room.index} sx={{
                                display: "flex", mt: '2%', ml: '2.5%', mb: '1.5%', width: "95%", position: 'relative', borderRadius: 3,
                                overflow: 'hidden'
                            }} data-testid="room-detail-card">
                                <Box sx={{ display: "flex", flexDirection: "column", width: "25%", ml: '1.5%', mb: '1.5%' }}>
                                    <Carousel animation="slide" indicatorContainerProps={{ style: { position: 'absolute', bottom: 2 } }}
                                        sx={{ borderRadius: 3, overflow: 'hidden', '& .Carousel-button': { opacity: 0, transition: 'opacity 0.3s', '&:hover': { opacity: 1, }, } }}>
                                        {[room.image.image1, room.image.image2, room.image.image3].map((image, i) => (
                                            <CardMedia key={room.i} component="img" sx={{ width: 400, height: 250, mt: '5.5%' }} image={image}
                                                alt={`${room.room.room_type_name} Room ${i + 1}`} />
                                        ))}
                                    </Carousel></Box>
                                <Divider orientation="vertical" flexItem sx={{ marginTop: '2%', backgroundColor: 'black', height: '96%', ml: 2 }} />
                                <Box sx={{ display: "flex", flexDirection: "column", width: "40%" }}>
                                    <CardContent sx={{ flex: "1 0 auto" }}>
                                        <Typography component="div" variant="h5" sx={{ fontWeight: 'bold' }}>
                                            {room.room.room_type_name}
                                        </Typography>
                                        <Typography variant="subtitle1" component="div">
                                            {room.room.room_facilities}
                                        </Typography>
                                        <Stack spacing={5} sx={{ display: 'flex', mt: '2%' }}>
                                            <Typography component="div" variant="h6" sx={{ fontWeight: 'bold' }}>
                                                Additional Services
                                                {room.additional_services_details.length === 0 ? (
                                                    <Typography variant="subtitle1" component="div" sx={{ color: "grey", fontSize: "small" }}>
                                                        No additional services available
                                                    </Typography>
                                                ) : (
                                                    room.additional_services_details.map((service, index) => (
                                                        <Typography key={service.index} variant="subtitle1" component="div" sx={{ display: 'flex', alignItems: 'center' }}>
                                                            ‣&nbsp;&nbsp;<Link style={{ color: 'green' }} onClick={() => handleLinkClick(service.id)} data-testid='services-link'>{service.title}</Link>
                                                        </Typography>
                                                    ))
                                                )}
                                            </Typography>
                                            <ServicesDetailsDialog isOpen={dialogOpen} onClose={() => setDialogOpen(false)} serviceID={selectedService} />
                                        </Stack>
                                    </CardContent>
                                </Box>
                                <Box sx={{ display: "flex", flexDirection: "column", width: "30%", alignItems: 'flex-end', }}>
                                    <Stack direction="row" sx={{ mt: '2%' }}>
                                        {room.available_rooms > 5 ? (
                                            <Typography component="div" variant="subtitle1" sx={{ fontFamily: 'serif', color: '#0D9276' }}>
                                                {room.available_rooms} rooms available
                                            </Typography>
                                        ) : (
                                            <Typography component="div" variant="subtitle1" sx={{ fontFamily: 'serif', color: '#D24545' }}>
                                                Only {room.available_rooms} left!
                                            </Typography>
                                        )}
                                    </Stack>
                                    <Stack direction="row" sx={{ mt: '23%' }}>
                                        <Typography component="div" variant="h4" sx={{ fontWeight: 'bold' }}>
                                            {room.room.rate}
                                        </Typography>
                                        <Typography component="div" variant="subtitle1" sx={{ mt: '5%' }}>&nbsp; INR</Typography>
                                    </Stack>
                                    <Stack direction="column" sx={{ display: "flex", alignItems: 'flex-end' }}>
                                        <Typography component="div" variant="subtitle1" sx={{ color: "grey", fontSize: "small" }}>
                                            per night
                                        </Typography>
                                        <Typography component="div" variant="subtitle1" sx={{ color: "grey", fontSize: "small" }}>
                                            Excludes taxes and fees
                                        </Typography>
                                    </Stack>
                                    <Button
                                        sx={{ height: "15%", width: "40%", alignItems: "right", bgcolor: 'green' }}
                                        variant="contained"
                                        data-testid="book-room"
                                        onClick={() => handlePageNavigation(room.room.id)}
                                    >
                                        Book Room
                                    </Button>
                                </Box>
                            </Card>
                        ))}
                    </Box>
                    <Typography component="div" variant="h5" sx={{ display: "flex", mt: 3 }}>
                        User Reviews & Ratings
                    </Typography>
                    {reviewError && <Stack sx={{ width: '70%', ml: 10, mt: 5 }} spacing={10}><Alert severity="info" sx={{ mx: 'auto' }}>No reviews yet! </Alert></Stack>}

                    {reviews.length === 0 ? (
                        <Typography variant="subtitle1" component="div" sx={{ color: "grey", fontSize: "small", mt: '2%', mb: '3%' }}>
                            No reviews available
                        </Typography>
                    ) : (
                        <Box sx={{ mt: 3, width: "90%", mb: '3%' }}>
                            {reviews.map((review, index) => (
                                <>
                                    <Card
                                        key={review.index}
                                        sx={{
                                            display: 'flex',
                                            mt: '1%',
                                            width: '95%',
                                            ml: '3%',
                                            backgroundColor: '#F8F8F8',
                                        }}
                                        data-testid='card'
                                    >
                                        <CardContent sx={{ flex: '1 0 auto' }}>
                                            <Typography component="div" variant="h6" sx={{ mt: 2, ml: '1%', fontWeight: 'bold', color: '#45474B' }}>
                                                {review.title}
                                            </Typography>
                                            <Stack direction={'row'} sx={{ ml: '0.8%' }}>
                                                <Rating
                                                    name="size-small"
                                                    size="small"
                                                    value={review.rating}
                                                    data-testid='rating'
                                                    readOnly
                                                />
                                                <Typography component="div" variant="h6" sx={{ ml: '1%', fontSize: 'small', color: 'grey' }}>
                                                    &nbsp; by {review.customer_name}
                                                    &nbsp; on {review.created_at}
                                                </Typography>
                                            </Stack>
                                            <Stack direction="row" spacing={2} sx={{ ml: '1%', width: '60%' }}>
                                                <Typography variant="subtitle1" component="div" sx={{ ml: '1%', color: '#45474B', mr: '2%' }}>
                                                    {review.comment}
                                                </Typography>
                                            </Stack>
                                            <Stack direction={'row'} sx={{ ml: '0.5%' }}>
                                                {review.images && review.images.length > 0 && !showAllImgaes && (
                                                    <ImageList cols={12} >
                                                        {review.images.slice(0, 11).map((imageUrl, index) => (
                                                            <Avatar
                                                                key={imageUrl.index}
                                                                sx={{ width: 100, height: 100, borderRadius: "8px", ml: 1, objectFit: "contain" }}
                                                            >
                                                                <img key={imageUrl.index} alt={`review image ${index + 1}`} src={imageUrl} />
                                                            </Avatar>
                                                        ))}
                                                    </ImageList>
                                                )}
                                                {review.images.length > 11 && !showAllImgaes && (
                                                    <Link component={Button} onClick={() => setShowAllImages(true)} style={{ textDecoration: 'none', marginLeft: '-7%', marginTop: '3%' }}>View more..</Link>
                                                )}
                                            </Stack>
                                            {showAllImgaes && (
                                                <ImageList cols={12} sx={{ ml: 2 }}>
                                                    {review.images.map((imageUrl, index) => (
                                                        <Avatar key={imageUrl.index} sx={{ width: 100, height: 100, borderRadius: "8px" }}>
                                                            <img key={imageUrl.index} alt={`review image ${index + 5}`} src={imageUrl} />
                                                        </Avatar>
                                                    ))}
                                                </ImageList>
                                            )}
                                            <Stack direction="row" spacing={2} sx={{ ml: '1%', mt: '1%' }}>
                                                <Typography component="div" variant="h6" sx={{ ml: '1%', fontSize: 'small', color: 'grey' }}>
                                                    Do you find this helpful? 👍
                                                </Typography>
                                            </Stack>
                                        </CardContent>
                                    </Card>
                                    {review.feedbacks && (
                                        <Box
                                            sx={{
                                                backgroundColor: "#F0F0F0",
                                                padding: "10px",
                                                borderRadius: "5px",
                                                mt: "1%",
                                                ml: "8%",
                                                width: "90%",
                                                position: "relative",
                                            }}
                                        >
                                            <Stack direction={{ xs: "column", sm: "row" }} spacing={1} sx={{ mt: 1 }} >
                                                <Typography component="div" sx={{ ml: 9, mt: "1%", fontWeight: "bold", fontSize: "15px", color: "grey", }} >
                                                    Reply from {review.hotel_email} :
                                                </Typography>
                                            </Stack>
                                            <Typography variant="subtitle1" component="div" sx={{ mt: "1%", ml: "2%" }} >
                                                {review.feedbacks}
                                            </Typography>
                                        </Box>
                                    )}
                                </>
                            ))}
                        </Box>
                    )}
                </ThemeProvider>
            </Box>
        </>
    )

}

export default ViewHotelRooms;
