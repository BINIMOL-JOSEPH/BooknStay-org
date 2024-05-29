import * as React from 'react';
import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Divider from '@mui/material/Divider';
import { createTheme } from '@mui/material/styles';
import Stack from '@mui/material/Stack';
import CollapsibleSidebar from '../Sidebar/Sidebar';
import { userService } from '../../UserService';
import Swal from 'sweetalert2';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { IconButton, Breadcrumbs, ImageList } from '@mui/material';
import Rating from '@mui/material/Rating';
import { Link } from "react-router-dom";
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Button from '@mui/material/Button';
import Loading from "../Loading/Loading";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import NoDataFound from '../ListReviewsByHotels/NoDataFound';

const defaultTheme = createTheme();

function ListReviewByUser() {

    const [data, setData] = useState([]);
    const [reviewId, setReviewId] = useState('');
    const [dialogOpen, setDialogOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [showAllImgaes, setShowAllImages] = useState(false);

    useEffect(() => {
        fetchReviews();
    }, []);

    const fetchReviews = async () => {
        try {
            const response = await userService.GetReview();
            setData(response.data)
            setLoading(false);

        } catch (error) {
            if (error.response) {
                console.log(error)
            }
            setLoading(false);
        }
    };

    const handleDeleteReview = async () => {
        try {
            const response = await userService.DeleteReview(reviewId);
            Swal.fire({
                position: 'top',
                icon: 'success',
                title: response.data.message,
                showConfirmButton: false,
                timer: 5000,
            });
            handleDialogClose();
            fetchReviews();
        } catch (error) {
            console.log(error.response)
        }
    };

    const handleFormattedDate = (created_at) => {
        const formattedDate = new Date(created_at).toLocaleDateString('en-US', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });

        return formattedDate;
    };

    const handleDialogOpen = (reviewId) => {
        setReviewId(reviewId);
        setDialogOpen(true);
    };

    const handleDialogClose = () => {
        if (dialogOpen) {
            setReviewId(null);
            setDialogOpen(false);
        }
    };
    if (loading) {
        return <Loading />;
    }


    return (
        <>
            <CollapsibleSidebar />
            {data.length > 0 ? (
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        minHeight: '100vh',
                        width: '100%',
                        backgroundColor: '#F8F8F8',
                    }}
                >
                    <Breadcrumbs
                        separator={<NavigateNextIcon fontSize="small" />}
                        aria-label="breadcrumb"
                        sx={{ mt: 2, mb: 5 }}
                    >
                        <Link to="/">Home</Link>
                        <Typography color="textPrimary">Your reviews</Typography>
                    </Breadcrumbs>
                    {data.map((review, index) => (
                        <Card
                            key={review.index}
                            sx={{
                                display: 'flex',
                                width: '70%',
                                boxShadow: '1px 1px 10px rgba(0, 0, 0, 0.3)',
                                mb: 3
                            }}
                            data-testid='card'
                        >
                            <Divider orientation="vertical" variant="middle" flexItem />
                            <Box
                                sx={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    width: '100%',
                                    height: 'auto',

                                }}
                            >
                                <CardContent sx={{ flex: '1 0 auto', display: 'flex', flexDirection: 'column' }}>
                                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ mt: 1 }}>
                                        <Avatar sx={{ width: 55, height: 55 }}>
                                            {review.rating}
                                        </Avatar>

                                        <Stack direction="row" spacing={50} sx={{ alignItems: 'center', mt: 1, width: '100%' }}>
                                            <Stack sx={{ width: '80%' }}>
                                                <Typography component="div" variant="h6" sx={{ ml: 1, color: 'grey', mt: -0.1, fontSize: 'large', fontWeight: 'bold' }}>
                                                    {review.hotel_name}
                                                </Typography>
                                                <Rating
                                                    name="size-large"
                                                    size="medium"
                                                    value={review.rating}
                                                    data-testid='rating'
                                                    readOnly
                                                    sx={{ ml: 0.5, mt: -0.5 }}
                                                />
                                            </Stack>
                                            <Stack direction="row" >
                                                <IconButton component={Link} to={`/review-update/${review.id}/`} sx={{ color: "grey" }}>
                                                    <EditIcon />
                                                </IconButton>
                                                <IconButton sx={{ color: "grey" }} onClick={() => handleDialogOpen(review.id)} data-testid="delete-icon">
                                                    <DeleteIcon />
                                                </IconButton>
                                            </Stack>
                                        </Stack>
                                    </Stack>
                                    <Typography component="div" variant="h6" sx={{ ml: 9, mt: 1, fontWeight: 'bold', color: '#45474B' }}>
                                        {review.title}
                                    </Typography>
                                    <Typography variant="body1" component="div" sx={{ ml: 9 }}>
                                        {review.comment}
                                    </Typography>
                                    <Stack direction={'row'}>
                                        {review.image_urls && review.image_urls.length > 0 && !showAllImgaes && (
                                            <ImageList cols={9} sx={{ ml: 8 }}>
                                                {review.image_urls.slice(0, 8).map((imageUrl, index) => (
                                                    <Avatar
                                                        key={imageUrl.index}
                                                        sx={{ width: 100, height: 100, borderRadius: "8px", ml: 1 }}
                                                    >
                                                        <img key={imageUrl.index} alt={`Review ${index + 1}`} src={imageUrl} />
                                                    </Avatar>
                                                ))}
                                            </ImageList>
                                        )}
                                        {review.image_urls.length > 8 && !showAllImgaes && (
                                            <Link component={Button} onClick={() => setShowAllImages(true)} style={{ textDecoration: 'none', marginLeft: '-8%', marginTop: '4%' }}>View more..</Link>
                                        )}
                                    </Stack>
                                    {showAllImgaes && (
                                        <ImageList cols={9} sx={{ ml: 9 }}>
                                            {review.image_urls.map((imageUrl, index) => (
                                                <Avatar key={imageUrl.index} sx={{ width: 100, height: 100, borderRadius: "8px" }}>
                                                    <img key={imageUrl.index} alt={`Review ${index + 5}`} src={imageUrl} />
                                                </Avatar>
                                            ))}
                                        </ImageList>
                                    )}
                                    <Typography component="div" sx={{ ml: 9, mt: '2%', color: 'grey', fontSize: 'small' }}>
                                        Posted On: {handleFormattedDate(review.created_at)}
                                    </Typography>
                                </CardContent>
                            </Box>
                        </Card>
                    ))}
                </Box>
            ) : (
                <NoDataFound />
            )}

            {/* dialog for deleting review */}
            <Dialog open={dialogOpen} onClose={handleDialogClose} data-testid='dialog'>
                <DialogTitle>Delete Review</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to delete your review?<br /><br />
                        Once pressing "Delete" will remove your review from BookNStay. This action cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button data-testid='cancelbutton' onClick={handleDialogClose}>Cancel</Button>
                    <Button color="error" data-testid='delete-confirm' onClick={handleDeleteReview}>Delete</Button>
                </DialogActions>
            </Dialog>
        </>
    );
}

export default ListReviewByUser;
