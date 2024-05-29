import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Swal from "sweetalert2";
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  Stack,
  Input,
  Button,
  Breadcrumbs,
} from "@mui/material";
import {
  CloudUpload as CloudUploadIcon,
  RoomService as RoomServiceIcon,
  AttachMoney as AttachMoneyIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import CollapsibleSidebar from "../Sidebar/Sidebar";
import { validators } from "../../Validations";
import { hotelService } from "../../HotelService";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import Tooltip from "@mui/material/Tooltip";

const EditRoomServices = () => {
  const [roomService, setRoomService] = useState({
    title: "",
    description: "",
    price: "",
    image: null,
  });

  const [serviceTitleError, setServiceTitleError] = useState("");
  const [serviceDescriptionError, setServiceDescriptionError] = useState("");
  const [servicePriceError, setServicePriceError] = useState("");
  const [imageError, setImageError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { room_service_id } = useParams();
  const [selectedImagePreviewUrl, setSelectedImagePreviewUrl] = useState("");
  const navigate = useNavigate();
  const handleservicetitleChange = (e) => {
    const inputValue = e.target.value;

    setRoomService((prevData) => ({
      ...prevData,
      title: inputValue,
    }));
    const titleValidations = validators.validateServiceTitle(inputValue);
    setServiceTitleError(titleValidations);
  };

  const handleservicedescriptionChange = (e) => {
    const inputValue = e.target.value;

    setRoomService((prevData) => ({
      ...prevData,
      description: inputValue,
    }));

    const descriptionValidation =
      validators.validateServiceDescription(inputValue);
    setServiceDescriptionError(descriptionValidation);
  };

  const handleservicepriceChange = (e) => {
    const inputValue = e.target.value;

    setRoomService((prevData) => ({
      ...prevData,
      price: inputValue,
    }));

    const priceValidation = validators.validateServiceCharge(inputValue);
    setServicePriceError(priceValidation);
  };
  const getImageBlob = async (imageUrl) => {
    try {
      const fullImageUrl = `${process.env.REACT_APP_URL}${imageUrl}`;
      const response = await fetch(fullImageUrl);
      const blob = await response.blob();
      return blob;
    } catch (error) {
      console.error("Error fetching image blob:", error);
      return null;
    }
  };

  useEffect(() => {
    const fetchRoomService = async () => {
      try {
        const response = await hotelService.GetEditRoomService(
          String(room_service_id)
        );
        console.log("Response", response);
        if (response.data && response.data.room_services) {
          const { title, description, price, image } =
            response.data.room_services;

          let imageBlob = null;
          if (image) {
            imageBlob = await getImageBlob(image);
          }

          setRoomService((prevDetails) => ({
            ...prevDetails,
            title,
            description,
            price,
            image: imageBlob,
          }));

          if (imageBlob instanceof Blob) {
            const imageUrl = URL.createObjectURL(imageBlob);
            setSelectedImagePreviewUrl(imageUrl);
          } else {
            console.error("Received image is not a Blob:", imageBlob);
          }
        } else {
          console.error(
            "Invalid response or missing room_services data:",
            response
          );
        }
      } catch (error) {
        console.error("Error fetching room service:", error);
      }
    };

    fetchRoomService();
  }, [room_service_id]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];

    const imageValidation = validators.validateImage(file);
    setImageError(imageValidation);

    if (!imageValidation) {
      setRoomService((prevData) => ({
        ...prevData,
        image: file,
      }));

      const imageUrl = URL.createObjectURL(file);
      setSelectedImagePreviewUrl(imageUrl);
      console.log("Selected image preview URL:", imageUrl);
    }
  };

  const handleRemoveImage = () => {
    setRoomService((prevDetails) => ({
      ...prevDetails,
      image: null,
    }));
    setSelectedImagePreviewUrl("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("title", roomService.title);
      formData.append("description", roomService.description);
      formData.append("price", roomService.price);
      formData.append("image", roomService.image);

      const response = await hotelService.EditRoomServices(
        room_service_id,
        formData
      );
      Swal.fire({
        position: "top",
        icon: "success",
        title: response.data.message,
        showConfirmButton: false,
        timer: 5000,
      });
      navigate(`/view-room-services/`);
    } catch (error) {
      if (error.response?.data) {
        Swal.fire({
          position: "top",
          icon: "error",
          title: "Failed to update room service",
          showConfirmButton: true,
          timer: 5000,
        });
      }
    }
  };

  return (
    <>
      <CollapsibleSidebar />
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          minHeight: "100vh",
          width: "100%",
          backgroundColor: "#F8F8F8",
        }}
      >
        <Breadcrumbs
          separator={<NavigateNextIcon fontSize="small" />}
          aria-label="breadcrumb"
          sx={{ mt: 2, ml: 4.2 }}
        >
          <Link to="/sidebar">Home</Link>
          <Link to="/view-room-services">List Room Services</Link>
          <Typography color="textPrimary">Edit Room Services</Typography>
        </Breadcrumbs>
        <Box
          border={1}
          borderColor="grey.300"
          borderRadius={2}
          p={2}
          width="40%"
          bgcolor="white"
          data-testid="form-submit"
          onSubmit={handleSubmit}
          sx={{ mt: 3 }}
          ml={10}
          style={{
            marginTop: "40px",
            height: "auto",
          }}
          margin="auto"
        >
          <Typography variant="h6" gutterBottom data-testid="roomservices">
            Room Services
          </Typography>
          <Stack direction="column" spacing={3} sx={{ mb: 2 }}>
            <TextField
              id="title"
              name="title"
              label="Service Title"
              fullWidth
              data-testid="title"
              onChange={handleservicetitleChange}
              value={roomService.title}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <RoomServiceIcon color="action.active" />
                  </InputAdornment>
                ),
              }}
              error={!!serviceTitleError}
              helperText={serviceTitleError}
            />

            <TextField
              id="description"
              name="description"
              data-testid="description"
              label="Service Description"
              fullWidth
              onChange={handleservicedescriptionChange}
              value={roomService.description}
              autoFocus
              sx={{ width: "100%", ml: 2 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <RoomServiceIcon color="action.active" />
                  </InputAdornment>
                ),
              }}
              error={!!serviceDescriptionError}
              helperText={serviceDescriptionError}
            />
            <TextField
              id="price"
              name="price"
              data-testid="price"
              label="Service Price"
              fullWidth
              onChange={handleservicepriceChange}
              value={roomService.price}
              autoFocus
              sx={{ width: "100%", ml: 2 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <AttachMoneyIcon color="action.active" />
                  </InputAdornment>
                ),
              }}
              error={!!servicePriceError}
              helperText={servicePriceError}
            />
            <Input
              type="file"
              accept="image/*"
              id="image"
              style={{ display: "none" }}
              onChange={(event) => handleImageUpload(event)}
            />
            {selectedImagePreviewUrl && (
              <Box
                sx={{
                  width: "100%",
                  height: "300px",
                  border: "1px solid #ccc",
                  borderRadius: "4px",
                  padding: "4px",
                  position: "relative",
                }}
              >
                <img
                  src={selectedImagePreviewUrl}
                  alt="Room Service"
                  style={{
                    width: "100%",
                    height: "100%",
                  }}
                />

                <Tooltip title="Remove Image">
                  <Button
                    sx={{
                      position: "absolute",
                      top: "4px",
                      right: "4px",
                      color: "white",
                      borderRadius: "50%",
                    }}
                    data-testid="removeimage"
                    onClick={handleRemoveImage}
                  >
                    <CloseIcon />
                  </Button>
                </Tooltip>
              </Box>
            )}

            {!roomService.image && (
              <label htmlFor="image">
                <Button
                  variant="outlined"
                  color="primary"
                  data-testid="choosefile"
                  component="span"
                  sx={{
                    alignItems: "center",
                    fontSize: "14px",
                    padding: "10px",
                    height: "50px",
                    width: "100%",
                    borderRadius: "4px",
                  }}
                >
                  <InputAdornment position="start">
                    <CloudUploadIcon color="primary" />
                  </InputAdornment>
                  {"Choose File"}
                </Button>
              </label>
            )}
            <Typography
              color="error"
              sx={{ fontSize: "14px", marginTop: "8px" }}
            >
              {imageError}
            </Typography>
            <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
              <Button
                variant="contained"
                color="primary"
                sx={{ flex: 1 }}
                role="edit-room-services"
                onClick={handleSubmit}
                data-testid="button"
                disabled={
                  !(
                    roomService.title &&
                    roomService.description &&
                    roomService.price &&
                    roomService.image
                  )
                }
              >
                {isSubmitting ? "Updating..." : "Update Room Services"}
              </Button>
            </Stack>
          </Stack>
        </Box>
      </Box>
    </>
  );
};

export default EditRoomServices;
