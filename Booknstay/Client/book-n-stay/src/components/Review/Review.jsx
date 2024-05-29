import * as React from 'react';
import { useState } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import { createTheme } from '@mui/material/styles';
import Rating from '@mui/material/Rating';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import CollapsibleSidebar from '../Sidebar/Sidebar';
import { Grid, TextField, Breadcrumbs } from '@mui/material';
import Avatar from '@mui/material/Avatar';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import { userService } from '../../UserService';
import Swal from 'sweetalert2';
import Typography from '@mui/material/Typography';
import { useParams, useNavigate, Link as RouterLink, useLocation  } from "react-router-dom";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import CircularProgress from '@mui/material/CircularProgress';
import Backdrop from '@mui/material/Backdrop';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import ImageList from '@mui/material/ImageList'; 

const defaultTheme = createTheme();

function Review() {
    
    const [formData, setFormData] = useState({
        rating: "",
        title: "",
        comment: "",
        images: [],
    });
    const [titleError, setTitleError] = useState("");
    const [commentError, setCommentError] = useState("");
    const [imageError, setImageError] = useState("");
    const { hotel_id } = useParams();
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const checkInDate = queryParams.get("checkInDate");
    const checkOutDate = queryParams.get("checkOutDate");

    const handleTitleChange = (e) => {
        const inputValue = e.target.value;
        setFormData((prevData) => ({
            ...prevData,
            title: inputValue,
        }));

        if (!inputValue.trim()) {
            setTitleError("Please add a title.");
        } else {
            setTitleError("");
        }
    };

    const handleCommentChange = (e) => {
        const inputValue = e.target.value;
        setFormData((prevData) => ({
            ...prevData,
            comment: inputValue,
        }));

        if (!inputValue.trim()) {
            setCommentError("Please add a comment.");
        } else {
            setCommentError("");
        }
    };

    const handleRating = (e) => {
        const inputValue = e.target.value;
        setFormData((prevData) => ({
            ...prevData,
            rating: inputValue,
        }));
    };

    const handleImageChange = (e) => {
        const imagesArray = Array.from(e.target.files);

        const newImages = imagesArray.map((image) => {
            const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];

            if (!allowedTypes.includes(image.type)) {
                setImageError("Please select a valid image file (jpg, png, jpeg).");
                return null;
            }

            if (image.size > 1 * 1024 * 1024) {
                setImageError("File size exceeds the maximum allowed limit of 1 MB.");
                return null;
            }

            setImageError("");
            return {
                file: image,
                preview: URL.createObjectURL(image),
            };

        }).filter(Boolean);

        setFormData((prevData) => ({
            ...prevData,
            images: [...prevData.images, ...newImages],
        }));
    };


    const handleRemoveImage = (index) => {
        const filteredImages = formData.images.filter((_, i) => i !== index);
        setFormData((prevData) => ({
            ...prevData,
            images: filteredImages,
        }));
    };

    const handleSubmit = async (e) => {
        try {
            setLoading(true);

            const formDataToSend = new FormData();

            formDataToSend.append("rating", formData.rating);
            formDataToSend.append("title", formData.title);
            formDataToSend.append("comment", formData.comment);
            formData.images.forEach((image) => {
                formDataToSend.append("images", image.file);
            });

            const response = await userService.Review(formDataToSend, hotel_id);
            Swal.fire({
                position: "top",
                icon: "success",
                title: response.data.message,
                showConfirmButton: false,
                timer: 5000,
            });
            navigate(`/view-selected-hotels/${hotel_id}?checkInDate=${checkInDate}&checkOutDate=${checkOutDate}`);

        } catch (error) {
            if (error.response) {
                Swal.fire({
                    position: "top",
                    icon: "error",
                    title: error.response.data.message,
                    showConfirmButton: false,
                    timer: 5000,
                });
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <CollapsibleSidebar />
            <Backdrop sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }} open={loading} >
                <CircularProgress color="inherit" />
            </Backdrop>
            <Box
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    minHeight: "90vh",
                    width: "100%",
                    backgroundColor: "#F8F8F8",

                }}
                data-testid="review-component"
            >
                <Breadcrumbs
                    separator={<NavigateNextIcon fontSize="small" />}
                    aria-label="breadcrumb"
                    sx={{ marginBottom: 2, marginLeft: 2, textAlign: "left" }}
                >
                    <RouterLink to="/" color="inherit">
                        Home
                    </RouterLink>
                    <RouterLink to={`/view-selected-hotels/${hotel_id}?checkInDate=${checkInDate}&checkOutDate=${checkOutDate}`} color="inherit">
                        Hotel Details
                    </RouterLink>
                    <Typography color="textPrimary">Add Review</Typography>
                </Breadcrumbs>

                <Card sx={{ minWidth: 650, marginTop: "2%", height: "auto" }} data-testid="card" >
                    <CardHeader title="Review" />
                    <CardContent>
                        <Rating
                            name="size-large"
                            size="large"
                            value={formData.rating}
                            onChange={handleRating}
                            data-testid="rating"
                        />
                        <Stack spacing={3} sx={{ ml: 1, mt: 4 }}>
                            <Grid sx={{ mt: -1, mb: -2 }}>
                                <TextField
                                    autoComplete="given-name"
                                    name="title"
                                    required
                                    id="title"
                                    label="Title"
                                    data-testid="title"
                                    value={formData.title}
                                    autoFocus
                                    size="small"
                                    sx={{
                                        mb: 1,
                                        width: { md: 600 },
                                    }}
                                    onChange={handleTitleChange}
                                />
                                {titleError && (
                                    <Typography variant="body2" color="error" sx={{ fontSize: 13, mt: -1, mb: -1 }} >
                                        {titleError}
                                    </Typography>
                                )}
                            </Grid>
                            <Grid sx={{ mt: -1, mb: -2 }}>
                                <TextField
                                    autoComplete="given-name"
                                    name="comment"
                                    required
                                    id="comment"
                                    label="Comment"
                                    value={formData.comment}
                                    autoFocus
                                    size="large"
                                    sx={{
                                        mb: 2,
                                        width: { md: 600 },
                                    }}
                                    multiline
                                    rows={5}
                                    onChange={handleCommentChange}
                                />
                                {commentError && (
                                    <Typography variant="body2" color="error" sx={{ fontSize: 13, mt: -2, mb: -1 }} >
                                        {commentError}
                                    </Typography>
                                )}
                            </Grid>
                        </Stack>
                        <Stack direction="column" spacing={3} sx={{ ml: 1, mt: 2 }}  data-testid="stack" >
                            <input
                                accept="image/*"
                                type="file"
                                id="select-image"
                                style={{ display: "none" }}
                                onChange={handleImageChange}
                                multiple
                                data-testid="image"
                            />
                            <label htmlFor="select-image">
                                <div
                                    style={{
                                        width: "98.5%",
                                        height: "100px",
                                        border: "2px dashed #ccc",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        cursor: "pointer",
                                        borderRadius: "8px",
                                    }}
                                >
                                    <AddPhotoAlternateIcon sx={{ fontSize: "large" }} />
                                    <Typography variant="body1" sx={{ ml: 1 }}>
                                        Click to add photos
                                    </Typography>
                                </div>
                            </label>

                            <ImageList cols={5}> 
                                {formData.images.map((image, index) => (
                                    <Avatar
                                        key={image.index}
                                        sx={{ width: 100, height: 100, borderRadius: "8px", marginRight: 2, }} 
                                    >
                                        <img
                                            src={image.preview}
                                            style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "8px", }}
                                            alt={`ReviewImages ${index + 1}`}
                                        />
                                        <IconButton
                                            size="small"
                                            onClick={() => handleRemoveImage(index)}
                                            data-testid="closeButton1"
                                            sx={{ position: "absolute", top: 0, right: 0, color: "white", }}
                                        >
                                            <CloseIcon />
                                        </IconButton>
                                    </Avatar>
                                ))}
                            </ImageList>

                            {imageError && (
                                <Typography variant="body2" color="error" sx={{ fontSize: 13, mt: 1, ml: 1 }}>
                                    {imageError}
                                </Typography>
                            )}
                        </Stack>

                        <Button
                            type="submit"
                            variant="contained"
                            sx={{ mt: 5, mb: 2, bgcolor: "#5d9cdf", ml: 1, width: { md: 600 }, }}
                            onClick={handleSubmit}
                            data-testid="button"
                        >
                            SUBMIT REVIEW
                        </Button>
                    </CardContent>
                </Card>
            </Box>
        </>
    );
}

export default Review;
