import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  Stack,
  Button,
  CssBaseline,
  InputLabel,
  Alert,
  Breadcrumbs,
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Hotel as HotelIcon,
  RoomService as RoomServiceIcon,
  AttachMoney as AttachMoneyIcon,
  CloudUpload as CloudUploadIcon,
  Visibility as VisibilityIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import CollapsibleSidebar from "../Sidebar/Sidebar";
import { hotelService } from "../../HotelService";
import Swal from "sweetalert2";
import Modal from "react-modal";
import customModalStyles from "./ModalStyle";
import { validators } from "../../Validations";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import Tooltip from "@mui/material/Tooltip";

const defaultTheme = createTheme();

const EditRoomDetails = () => {
  const [roomDetails, setRoomDetails] = useState({
    number_of_rooms: "",
    room_facilities: "",
    rate: "",
    image1: null,
    image2: null,
    image3: null,
  });

  const [numberofroomsError, setNumberOfRoomsError] = useState("");
  const [roomFacilitiesError, setRoomFacilitiesError] = useState("");
  const [rateError, setRateError] = useState("");
  const [errorMessage, setErrorMessage] = useState(null);
  const [isImagePreviewModalOpen, setImagePreviewModalOpen] = useState(false);
  const [selectedImagePreviewUrl, setSelectedImagePreviewUrl] = useState("");
  const { room_details_id } = useParams();
  const navigate = useNavigate();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fileErrors, setFileErrors] = useState({
    image1: "",
    image2: "",
    image3: "",
  });

  useEffect(() => {
    const fetchRoomDetails = async () => {
      try {
        const response = await hotelService.GetEditRoomDetails(
          String(room_details_id)
        );

        setRoomDetails((prevDetails) => ({
          ...prevDetails,
          number_of_rooms: response.data.room_details.number_of_rooms,
          room_facilities: response.data.room_details.room_facilities,
          rate: response.data.room_details.rate,
          image1: response.data.room_images.image1,
          image2: response.data.room_images.image2,
          image3: response.data.room_images.image3,
        }));
      } catch (error) {
        const errorMessage =
          "Failed to fetch room details. Please try again later.";
        setErrorMessage(errorMessage);
      }
    };

    fetchRoomDetails();
  }, [room_details_id]);

  const handleImagePreview = (imageData) => {
    try {
      let imageUrl;

      if (imageData instanceof Blob) {
        imageUrl = URL.createObjectURL(imageData);
      } else if (imageData instanceof File) {
        imageUrl = URL.createObjectURL(new Blob([imageData]));
      } else if (typeof imageData === "string") {
        const baseURL = process.env.REACT_APP_URL;
        const imagePath = imageData.replace(/\/\//g, "/");
        imageUrl = `${baseURL}${imagePath}`;
      } else {
        console.error("Invalid image data type:", imageData);
        return;
      }
      setSelectedImagePreviewUrl(imageUrl);
      setImagePreviewModalOpen(true);
    } catch (error) {
      console.error("Error in handleImagePreview:", error);
    }
  };
  const handleRemoveImage = (key) => {
    setRoomDetails((prevDetails) => ({
      ...prevDetails,
      [key]: null,
    }));
  };

  const handleEditNumberOfRoomsChange = (e) => {
    const inputValue = e.target.value;

    setRoomDetails((prevDetails) => ({
      ...prevDetails,
      number_of_rooms: inputValue,
    }));

    const editRoomNumberValidation =
      validators.validateNumberOfRooms(inputValue);
    setNumberOfRoomsError(editRoomNumberValidation);
  };

  const handleEditRoomFacilitiesChange = (e) => {
    const inputValue = e.target.value;

    setRoomDetails((prevDetails) => ({
      ...prevDetails,
      room_facilities: inputValue,
    }));

    const editRoomFacilitiesValidation =
      validators.validateRoomFacilites(inputValue);
    setRoomFacilitiesError(editRoomFacilitiesValidation);
  };

  const handleEditRateChange = (e) => {
    const inputValue = e.target.value;

    setRoomDetails((prevDetails) => ({
      ...prevDetails,
      rate: inputValue,
    }));

    const editRateValidation = validators.validateServiceCharge(inputValue);
    setRateError(editRateValidation);
  };

  const handleImageUpload = (event, key) => {
    const file = event.target.files[0];

    if (!isImageFormatValid(file)) {
      setFileErrors((prevErrors) => ({
        ...prevErrors,
        [key]:
          "Invalid file format. Only jpeg, jpg, and png formats are allowed.",
      }));
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setFileErrors((prevErrors) => ({
        ...prevErrors,
        [key]: "File size exceeds the maximum allowed limit of 5 MB.",
      }));
      return;
    }

    if (file.size < 1 * 1024) {
      setFileErrors((prevErrors) => ({
        ...prevErrors,
        [key]: "File size should be at least 1 KB.",
      }));
      return;
    }

    setFileErrors((prevErrors) => ({
      ...prevErrors,
      [key]: "",
    }));

    setRoomDetails((prevDetails) => ({
      ...prevDetails,
      [key]: file,
    }));
  };

  const isImageFormatValid = (file) => {
    const allowedFormats = ["image/jpeg", "image/jpg", "image/png"];
    return file && allowedFormats.includes(file.type);
  };

  const renderImageUploadFields = () => {
    const images = [
      { key: "image1", data: roomDetails.image1 },
      { key: "image2", data: roomDetails.image2 },
      { key: "image3", data: roomDetails.image3 },
    ];

    const extractFileName = (path) => {
      if (typeof path === "string") {
        const parts = path.split("/");
        const filename = parts.pop();
        const filenameParts = filename.split("_");
        const extractedName = filenameParts[0];
        return extractedName || filename;
      }
      return path.name;
    };

    return images.map((image, index) => (
      <div
        key={image.key}
        style={{
          marginBottom: "16px",
          position: "relative",
          marginTop: "28px",
        }}
      >
        <InputLabel
          htmlFor={`image${index + 1}`}
          style={{
            position: "absolute",
            fontSize: "13px",
          }}
        >{`Image ${index + 1}:`}</InputLabel>

        <input
          type="file"
          data-testid={`file-input-${image.key}`}
          accept="image/*"
          onChange={(e) => handleImageUpload(e, image.key)}
          id={`image${index + 1}`}
          style={{ display: "none" }}
        />
        <label htmlFor={`image${index + 1}`}>
          <Button
            variant="outlined"
            color="primary"
            data-testid="choosefile"
            component="span"
            sx={{
              fontSize: "14px",
              padding: "10px",
              height: "50px",
              width: "100%",
              position: "absolute",
            }}
          >
            <InputAdornment
              position="start"
              sx={{
                position: "absolute",
                left: "10px",
                top: "50%",
                transform: "translateY(-50%)",
              }}
            >
              <CloudUploadIcon color="primary" />
            </InputAdornment>
            <Tooltip title="Image Preview">
              <Button
                color="primary"
                data-testId="preview-button"
                sx={{
                  position: "absolute",
                  right: "-150px",
                  top: "50%",
                  width: "100%",
                  transform: "translateY(-50%)",
                  padding: "20px",
                  marginBottom: "20px",
                  visibility: image.data ? "visible" : "hidden",
                }}
                onClick={() => handleImagePreview(image.data)}
              >
                <VisibilityIcon />
              </Button>
            </Tooltip>
            {image.data ? extractFileName(image.data) : "Choose File"}

            {image.data && (
              <Tooltip title="Remove Image">
                <Button
                  sx={{
                    position: "absolute",
                    right: "-20px",
                    color: "primary",
                    top: "50%",
                    transform: "translateY(-50%)",
                  }}
                  onClick={() => handleRemoveImage(image.key)}
                >
                  <CloseIcon />
                </Button>
              </Tooltip>
            )}
          </Button>
        </label>

        <div
          style={{
            color: defaultTheme.palette.error.main,
            marginTop: "8px",
            fontSize: "13px",
          }}
        >
          {fileErrors[image.key]}
        </div>
      </div>
    ));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await hotelService.EditRoomDetails(
        room_details_id,
        roomDetails
      );
      Swal.fire({
        position: "top",
        icon: "success",
        title: response.data.message,
        showConfirmButton: false,
        timer: 1000,
      });
      navigate(`/view-hotel-room-details/`);
    } catch (error) {
      if (error.response?.data) {
        Swal.fire({
          position: "top",
          icon: "error",
          title: "Failed to update room details",
          showConfirmButton: true,
          timer: 1000,
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {errorMessage && (
        <Alert
          severity="info"
          sx={{ mx: "auto" }}
          data-testid="backend-error-message"
        >
          {errorMessage}
        </Alert>
      )}
      <CollapsibleSidebar />
      <ThemeProvider theme={defaultTheme}>
        <CssBaseline />
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
            <Link to="/view-hotel-room-details">List Room Details</Link>
            <Typography color="textPrimary">Edit Room Details</Typography>
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
              overflow: "hidden",
            }}
            margin="auto"
          >
            <Typography variant="h6" gutterBottom>
              Edit Room Details
            </Typography>

            <Stack direction="column" spacing={2} sx={{ mt: 4 }}>
              <TextField
                autoComplete="no_of_rooms"
                name="number_of_rooms"
                required
                data-testid="number_of_rooms"
                id="number_of_rooms"
                label="Number Of Rooms"
                autoFocus
                sx={{ width: "100%", ml: 2, mt: 2 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <HotelIcon color="action.active" />
                    </InputAdornment>
                  ),
                }}
                value={roomDetails.number_of_rooms}
                onChange={handleEditNumberOfRoomsChange}
                error={!!numberofroomsError}
                helperText={numberofroomsError}
              />

              <TextField
                id="room_facilities"
                name="room_facilities"
                label="Room Facilities"
                fullWidth
                data-testid="room_facilities"
                autoComplete="room_facilities"
                autoFocus
                sx={{ width: "100%", ml: 2, mt: 2 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <RoomServiceIcon color="action.active" />
                    </InputAdornment>
                  ),
                }}
                value={roomDetails.room_facilities}
                onChange={handleEditRoomFacilitiesChange}
                error={!!roomFacilitiesError}
                helperText={roomFacilitiesError}
              />

              <TextField
                id="rate"
                name="rate"
                label="Room Rate"
                fullWidth
                data-testid="room-rate"
                autoComplete="Room Rate"
                autoFocus
                sx={{ width: "100%", ml: 2, mt: 2 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <AttachMoneyIcon color="action.active" />
                    </InputAdornment>
                  ),
                }}
                value={roomDetails.rate}
                onChange={handleEditRateChange}
                error={!!rateError}
                helperText={rateError}
              />

              {renderImageUploadFields()}
            </Stack>

            <Stack direction="row" spacing={2} sx={{ mt: "30px" }}>
              <Button
                variant="contained"
                color="primary"
                sx={{ flex: 1 }}
                onClick={handleSubmit}
                role="add-room-details-button"
                data-testid="button"
              >
                {isSubmitting ? "Updating..." : "Update"}
              </Button>
            </Stack>
          </Box>
        </Box>
      </ThemeProvider>

      {isImagePreviewModalOpen && (
        <Modal
          isOpen={isImagePreviewModalOpen}
          onRequestClose={() => setImagePreviewModalOpen(false)}
          style={{
            ...customModalStyles,
            overlay: {
              ...customModalStyles.overlay,
              zIndex: 1000,
            },
          }}
        >
          <button
            onClick={() => setImagePreviewModalOpen(false)}
            style={customModalStyles.closeButton}
          >
            Close
          </button>
          <img
            src={selectedImagePreviewUrl}
            alt=""
            style={{
              width: "420px",
              height: "400px",
              overflow: "hidden",
              objectFit: "contain",
            }}
          />
        </Modal>
      )}
    </>
  );
};

export default EditRoomDetails;
