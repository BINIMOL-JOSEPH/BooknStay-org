import React, { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  Stack,
  Input,
  Button,
  IconButton,
  Breadcrumbs,
} from "@mui/material";
import {
  CloudUpload as CloudUploadIcon,
  RoomService as RoomServiceIcon,
  AttachMoney as AttachMoneyIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import CollapsibleSidebar from "../Sidebar/Sidebar";
import { hotelService } from "../../HotelService";
import Swal from "sweetalert2";
import { validators } from "../../Validations";
import { useNavigate, Link } from "react-router-dom";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import Backdrop from "@mui/material/Backdrop";
import CircularProgress from "@mui/material/CircularProgress";

const RoomServices = () => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    image: null,
    imageName: "",
  });

  const [serviceTitleError, setServiceTitleError] = useState("");
  const [serviceDescriptionError, setServiceDescriptionError] = useState("");
  const [servicePriceError, setServicePriceError] = useState("");
  const [imageError, setImageError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleServiceTitleChange = (e) => {
    const inputValue = e.target.value;

    setFormData((prevData) => ({
      ...prevData,
      title: inputValue,
    }));
    const titleValidations = validators.validateServiceTitle(inputValue);
    setServiceTitleError(titleValidations);
  };

  const handleServiceDescriptionChange = (e) => {
    const inputValue = e.target.value;

    setFormData((prevData) => ({
      ...prevData,
      description: inputValue,
    }));

    const descriptionValidation =
      validators.validateServiceDescription(inputValue);
    setServiceDescriptionError(descriptionValidation);
  };

  const handleServicePriceChange = (e) => {
    const inputValue = e.target.value;

    setFormData((prevData) => ({
      ...prevData,
      price: inputValue,
    }));

    const priceValidation = validators.validateServiceCharge(inputValue);
    setServicePriceError(priceValidation);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];

    if (file) {
      const imageValidation = validators.validateImage(file);

      if (imageValidation) {
        setImageError(imageValidation);
      } else {
        setFormData((prevData) => ({
          ...prevData,
          image: file,
          imageName: file.name,
        }));
        setImageError("");
      }
    }
  };

  const handleRemoveImage = () => {
    setFormData((prevData) => ({
      ...prevData,
      image: null,
      imageName: "",
    }));
  };

  const handleAddRoomServices = async () => {
    setIsSubmitting(true);

    try {
      await hotelService.RoomServices(formData);
      Swal.fire({
        position: "center",
        icon: "success",
        title: "Room Services Added Successfully",
        showConfirmButton: false,
        timer: 1000,
      });
      navigate(`/view-room-services`);
      setFormData({
        title: "",
        description: "",
        price: "",
        image: null,
        imageName: "",
      });
    } catch (error) {
      Swal.fire({
        position: "center",
        icon: "error",
        title: "Failed to add room services",
        showConfirmButton: false,
        timer: 1000,
      });
    } finally {
      setIsSubmitting(false);
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
          <Link to="/hotel-dashboard">Home</Link>
          <Link to="/view-room-services">List Room Services</Link>
          <Typography color="textPrimary">Add Room Service</Typography>
        </Breadcrumbs>
        <Box
          border={1}
          borderColor="grey.300"
          borderRadius={2}
          p={2}
          width="40%"
          bgcolor="white"
          ml={10}
          style={{
            marginTop: "40px",
            height: "auto",
          }}
          margin="auto"
        >
          <Typography variant="h6" gutterBottom data-testid="room-services">
            Room Services
          </Typography>
          <Stack direction="column" spacing={3} sx={{ mb: 2 }}>
            <TextField
              id="title"
              name="title"
              label="Service Title"
              fullWidth
              data-testid="title"
              onChange={handleServiceTitleChange}
              value={formData.title}
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
              onChange={handleServiceDescriptionChange}
              value={formData.description}
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
              onChange={handleServicePriceChange}
              value={formData.price}
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
            <label htmlFor="image">
              {!formData.image && (
                <Input
                  data-testid="choosefile1"
                  type="file"
                  accept="image/*"
                  id="image"
                  style={{ display: "none" }}
                  onChange={(event) => handleImageUpload(event)}
                />
              )}
            </label>
            <Button
              variant="outlined"
              color="primary"
              component="span"
              data-testid="choosefile"
              sx={{
                fontSize: "14px",
                padding: "10px",
                height: "50px",
                width: "100%",
                position: "relative",
                display: formData.image ? "none" : "block",
              }}
              onClick={() => document.getElementById("image").click()}
            >
              <CloudUploadIcon color="primary" />
              <Typography
                variant="body1"
                sx={{
                  ml: 1,
                  position: "absolute",
                  left: "50%",
                  top: "50%",
                  transform: "translate(-50%, -50%)",
                }}
              >
                Choose File
              </Typography>
            </Button>

            {formData.image && (
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
                  src={URL.createObjectURL(formData.image)}
                  alt="Selected Image"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
                <IconButton
                  sx={{
                    position: "absolute",
                    color: "white",
                    top: "0",
                    right: "0",
                    zIndex: 1,
                  }}
                  onClick={handleRemoveImage}
                >
                  <CloseIcon />
                </IconButton>
              </Box>
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
                role="add-room-services"
                onClick={handleAddRoomServices}
                data-testid="button"
                disabled={
                  !(
                    formData.title &&
                    formData.description &&
                    formData.price &&
                    formData.image
                  )
                }
              >
                {isSubmitting ? "Submitting..." : "Add Room Services"}
                <Backdrop
                  sx={{
                    color: "#fff",
                    zIndex: (theme) => theme.zIndex.drawer + 1,
                  }}
                >
                  <CircularProgress color="inherit" />
                </Backdrop>
              </Button>
            </Stack>
          </Stack>
        </Box>
      </Box>
    </>
  );
};

export default RoomServices;
