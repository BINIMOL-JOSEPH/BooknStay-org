import * as React from 'react';
import { useState, useEffect } from 'react';
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
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import { useParams, useNavigate, Link } from "react-router-dom";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import ImageList from '@mui/material/ImageList';

const defaultTheme = createTheme();

function ReviewUpdate() {

  const [formData, setFormData] = useState({
    rating: '',
    title: '',
    comment: '',
    images: [],
  });
  const [titleUpdateError, setTitleUpdateError] = useState('');
  const [commentUpdateError, setCommentUpdateError] = useState('');
  const [imageUpdateError, setImageUpdateError] = useState('');
  const { review_id } = useParams();

  const navigate = useNavigate("");

  useEffect(() => {
    fetchReviewById();
  }, []);

  const fetchReviewById = async () => {
    try {
      const response = await userService.GetReviewById(review_id);

      const userData = response.data
      const baseURL = process.env.REACT_APP_URL;

      const imagesToFile = userData.image_urls.map(async (imageItem) => {
        return await getImageFile(baseURL + imageItem);
      });

      const imageFiles = await Promise.all(imagesToFile);

      setFormData({
        rating: userData.rating || "",
        title: userData.title || "",
        comment: userData.comment || "",
        images: imageFiles
      });

    } catch (error) {
      if (error.response) {
        Swal.fire({
          position: 'top',
          icon: 'error',
          title: error.response.data.message,
          showConfirmButton: false,
          timer: 2000,
        });
      }
    }
  };

  const getImageFile = async (imageUrl) => {
    if (!imageUrl) return null;
    try {
      const imageResponse = await fetch(imageUrl);
      const blob = await imageResponse.blob();
      const file = new File([blob], "image.jpg", { type: blob.type });
      return file;
    } catch (error) {
      return null;
    }
  };

  const handleSubmit = async (e) => {

    e.preventDefault();

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("rating", formData.rating);
      formDataToSend.append("title", formData.title);
      formDataToSend.append("comment", formData.comment);

      formData.images.forEach((image, index) => {
        formDataToSend.append(`image${index + 1}`, image);
      });

      const response = await userService.UpdateReview(review_id, formDataToSend);

      Swal.fire({
        position: 'top',
        icon: 'success',
        title: response.data.message,
        showConfirmButton: false,
        timer: 2000,
      });
      navigate("/review-list");

    } catch (error) {
      if (error.response) {
        Swal.fire({
          position: 'top',
          icon: 'error',
          title: error.response.data.message,
          showConfirmButton: false,
          timer: 2000,
        });
      }
    }
  };

  const handleUpdateTitleChange = (e) => {
    const inputValue = e.target.value;
    setFormData((prevData) => ({
      ...prevData,
      title: inputValue,
    }));

    if (!inputValue.trim()) {
      setTitleUpdateError('Please add a title.');
    } else {
      setTitleUpdateError('');
    }
  };

  const handleUpdateCommentChange = (e) => {
    const inputValue = e.target.value;
    setFormData((prevData) => ({
      ...prevData,
      comment: inputValue,
    }));

    if (!inputValue.trim()) {
      setCommentUpdateError('Please add a comment.');
    } else {
      setCommentUpdateError('');
    }
  };

  const handleUpdateRating = (e) => {
    const inputValue = e.target.value;
    setFormData((prevData) => ({
      ...prevData,
      rating: inputValue,
    }));
  };

  const handleUpdateImageChange = (e, index) => {

    const inputValue = e.target.files[0];

    const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];

    if (!allowedTypes.includes(inputValue.type)) {
      setImageUpdateError("Please select a valid image file (jpg, png, jpeg).");
      return;
    } else if (inputValue.size > 1 * 1024 * 1024) {
      setImageUpdateError("File size exceeds the maximum allowed limit of 1 MB.");
      return;
    } else {
      setImageUpdateError("");
    }

    setFormData((prevData) => ({
      ...prevData,
      images: [...prevData.images, inputValue],
    }));
  };

  const handleClearUpdateImage = (index) => {
    const updatedImages = formData.images.filter((_, i) => i !== index);
    setFormData((prevData) => ({
      ...prevData,
      images: updatedImages,
    }));
  };

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
          backgroundColor: '#F8F8F8',
        }}
      >
        <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} aria-label="breadcrumb" sx={{ mt: 2 }} >
          <Link to="/" color="inherit"> Home </ Link>
          <Link to={`/review-list`} color="inherit"> Your reviews </Link>
          <Typography color="textPrimary">Update your review</Typography>
        </Breadcrumbs>

        <Card sx={{ minWidth: 650, marginTop: '2%', height: 'auto' }} data-testid='card'>
          <CardHeader title="Review" sx={{ ml: 1 }} />
          <CardContent>
            <Rating
              name="size-large"
              size="large"
              value={formData.rating}
              onChange={handleUpdateRating}
              data-testid='rating'
              sx={{ ml: 1 }}
            />
            <Stack spacing={3} sx={{ ml: 1, mt: 4 }}>
              <Grid sx={{ mt: -1, mb: -2 }}>
                <TextField
                  autoComplete="given-name"
                  name="title"
                  required
                  id="title"
                  label="Title"
                  data-testid='title'
                  value={formData.title}
                  autoFocus
                  size="small"
                  sx={{
                    mb: 1,
                    width: { md: 600 },
                  }}
                  onChange={handleUpdateTitleChange}
                />
                {titleUpdateError && (
                  <Typography variant="body2" color="error" sx={{ fontSize: 13, mt: -1, mb: -1 }}>
                    {titleUpdateError}
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
                  onChange={handleUpdateCommentChange}
                />
                {commentUpdateError && (
                  <Typography variant="body2" color="error" sx={{ fontSize: 13, mt: -2, mb: -1 }}>
                    {commentUpdateError}
                  </Typography>
                )}
              </Grid>
            </Stack>
            <Stack direction={{ xs: 'column' }} spacing={3} sx={{ ml: 1, mt: 2 }} data-testid='stack'>
              <input
                accept="image/*"
                type="file"
                id="select-image"
                style={{ display: 'none' }}
                onChange={handleUpdateImageChange}
                multiple
                data-testid='image'
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
                  <Typography variant="body1" sx={{ ml: 1 }}> Click to add photos </Typography>
                </div>
              </label>

              <ImageList cols={5}>
                {formData.images.map((image, index) => (
                  <Avatar
                    key={image.index}
                    sx={{ width: 100, height: 100, borderRadius: "8px", marginRight: 2, }}
                  >
                    <img
                      src={URL.createObjectURL(image)}
                      style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "8px", }}
                      alt={`Image ${index + 1}`}
                    />
                    <IconButton
                      size="small"
                      onClick={() => handleClearUpdateImage(index)}
                      data-testid="closeButton1"
                      sx={{ position: "absolute", top: 0, right: 0, color: "white", }}
                    >
                      <CloseIcon />
                    </IconButton>
                  </Avatar>
                ))}
              </ImageList>
              {imageUpdateError && (
                <Typography variant="body2" color="error" sx={{ fontSize: 13, mt: 1, ml: 1 }}>
                  {imageUpdateError}
                </Typography>
              )}

            </Stack>

            <Button
              type="submit"
              variant="contained"
              sx={{ mt: 5, mb: 2, bgcolor: '#5d9cdf', ml: 1, width: { md: 600 }, }}
              onClick={handleSubmit}
              data-testid='button'
            >
              UPDATE REVIEW
            </Button>
          </CardContent>
        </Card>
      </Box>
    </>
  );
}

export default ReviewUpdate;