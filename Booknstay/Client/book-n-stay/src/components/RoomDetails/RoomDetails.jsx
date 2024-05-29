import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  Stack,
  Button,
  IconButton,
  MenuItem,
  Breadcrumbs,
} from "@mui/material";
import {
  AttachMoney as AttachMoneyIcon,
  Hotel as HotelIcon,
  RoomService as RoomServiceIcon,
  AddPhotoAlternate as AddPhotoAlternateIcon,
  Close as CloseIcon,
  NavigateNext as NavigateNextIcon,
} from "@mui/icons-material";
import { useNavigate, Link } from "react-router-dom";
import Swal from "sweetalert2";
import { hotelService } from "../../HotelService";
import CollapsibleSidebar from "../Sidebar/Sidebar";
import { validators } from "../../Validations";
import CircularProgress from "@mui/material/CircularProgress";
import Backdrop from "@mui/material/Backdrop";
import Avatar from "@mui/material/Avatar";

const RoomDetails = () => {
  const initialRoomDetailsState = {
    room_type_id: "",
    number_of_rooms: "",
    room_facilities: "",
    rate: "",
    images: [],
  };
  const [roomDetails, setRoomDetails] = useState({
    ...initialRoomDetailsState,
  });
  const [numberofroomsError, setNumberOfRoomsError] = useState("");
  const [roomFacilitiesError, setRoomFacilitiesError] = useState("");
  const [rateError, setRateError] = useState("");
  const [roomTypes, setRoomTypes] = useState([]);
  const [roomExistsError, setRoomExistsError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageError, setImageError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRoomTypes = async () => {
      try {
        const response = await hotelService.GetroomTypes();
        if (response.data && Array.isArray(response.data)) {
          setRoomTypes(response.data);
        } else {
          console.error(
            "Invalid data structure for room types:",
            response.data
          );
        }
      } catch (error) {
        console.error("Error fetching room types:", error);
      }
    };

    fetchRoomTypes();
  }, []);
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setRoomDetails((prevDetails) => ({
      ...prevDetails,
      [name]: value,
      images: Array.isArray(prevDetails.images) ? [...prevDetails.images] : [], // Ensure images is initialized as an array
    }));

    if (name === "number_of_rooms") {
      const roomNumberValidation = validators.validateNumberOfRooms(value);
      setNumberOfRoomsError(roomNumberValidation);
    } else if (name === "room_facilities") {
      const roomFacilitiesValidation = validators.validateRoomFacilites(value);
      setRoomFacilitiesError(roomFacilitiesValidation);
    } else if (name === "rate") {
      const rateValidation = validators.validateServiceCharge(value);
      setRateError(rateValidation);
    }
  };

  const handleImageChange = (e) => {
    const imagesArray = Array.from(e.target.files);

    const newImages = imagesArray.map((image) => {
      const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
      if (!allowedTypes.includes(image.type)) {
        setImageError("Please select a valid image file (jpg, png, jpeg).");
        return null;
      }

      if (image.size > 5 * 1024 * 1024) {
        setImageError("Image size should be less than 1 MB");
        return null;
      }

      setImageError("");
      return {
        file: image,
        preview: URL.createObjectURL(image),
      };
    });

    const filteredImages = newImages.filter((image) => image !== null);
    const updatedImages = [...roomDetails.images, ...filteredImages];
    const imagesToAdd = updatedImages.slice(0, 3);

    setRoomDetails((prevDetails) => ({
      ...prevDetails,
      images: imagesToAdd,
    }));
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      const formDataToSend = new FormData();
      formDataToSend.append("room_type_id", roomDetails.room_type_id);
      formDataToSend.append("number_of_rooms", roomDetails.number_of_rooms);
      formDataToSend.append("room_facilities", roomDetails.room_facilities);
      formDataToSend.append("rate", roomDetails.rate);
      roomDetails.images.forEach((image, index) => {
        formDataToSend.append(`image${index + 1}`, image.file);
      });
      const response = await hotelService.RoomDetails(formDataToSend);
      if (response.status === 201) {
        setRoomExistsError("");
        setRoomDetails({ ...initialRoomDetailsState });
        Swal.fire({
          icon: "success",
          title: "Room Details and Images Added Successfully",
          showConfirmButton: false,
          timer: 1500,
        });
        navigate(`/view-hotel-room-details/`);
        setIsSubmitting(false);
      }
    } catch (error) {
      setIsSubmitting(false);
      if (error?.response?.data?.message && error.response.status === 400) {
        setRoomExistsError(error.response.data.message);
      } else {
        Swal.fire({
          icon: "error",
          title: "Failed to Add Room Details and Images",
          text: "An unexpected error occurred while adding room details and images.",
        });
      }
    }
  };

  const handleRemoveImage = (index) => {
    const filteredImages = roomDetails.images.filter((_, i) => i !== index);
    setRoomDetails((prevDetails) => ({
      ...prevDetails,
      images: filteredImages,
    }));
  };

  return (
    <>
      <CollapsibleSidebar />
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          minHeight: "90vh",
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
          <Link to="/view-hotel-room-details">View Room Details</Link>
          <Typography color="textPrimary">Add Room Details</Typography>
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
            marginTop: "2%",
            height: "auto",
            overflow: "hidden",
            marginBottom: "3%",
          }}
          margin="auto"
        >
          <Stack direction="column" spacing={3} sx={{ mb: 2 }}>
            <TextField
              select
              label="Room Type"
              name="room_type_id"
              fullWidth
              sx={{ width: "100%", ml: 2 }}
              value={roomDetails.room_type_id}
              onChange={handleInputChange}
            >
              {roomTypes.map((roomType) => (
                <MenuItem
                  key={roomType.id}
                  value={roomType.id}
                  style={{ color: "black" }}
                >
                  {roomType.room_type}
                </MenuItem>
              ))}
            </TextField>

            {roomExistsError && (
              <Typography
                variant="body2"
                color="error"
                sx={{ fontSize: 13, mt: -1 }}
              >
                {roomExistsError}
              </Typography>
            )}

            <TextField
              name="number_of_rooms"
              required
              id="number_of_rooms"
              label="Number Of Rooms"
              autoFocus
              SelectProps={{
                MenuProps: {
                  PaperProps: {
                    style: {
                      backgroundColor: "white !important",
                    },
                  },
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <HotelIcon color="action.active" />
                  </InputAdornment>
                ),
              }}
              value={roomDetails.number_of_rooms}
              onChange={handleInputChange}
              error={!!numberofroomsError}
              helperText={numberofroomsError}
            />

            <TextField
              id="room_facilities"
              name="room_facilities"
              label="Room Facilities"
              fullWidth
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <RoomServiceIcon color="action.active" />
                  </InputAdornment>
                ),
              }}
              value={roomDetails.room_facilities}
              onChange={handleInputChange}
              error={!!roomFacilitiesError}
              helperText={roomFacilitiesError}
            />

            <TextField
              id="rate"
              name="rate"
              label="Room Rate"
              fullWidth
              autoFocus
              sx={{ width: "100%", ml: 2 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <AttachMoneyIcon color="action.active" />
                  </InputAdornment>
                ),
              }}
              value={roomDetails.rate}
              onChange={handleInputChange}
              error={!!rateError}
              helperText={rateError}
            />

            <input
              accept="image/*"
              id="select-image"
              type="file"
              multiple
              style={{ display: "none" }}
              onChange={handleImageChange}
            />
            <label htmlFor="select-image">
              <div
                style={{
                  width: "100%",
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
                  Click to add photos (Max 3)
                </Typography>
              </div>
            </label>

            <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
              {roomDetails.images &&
                roomDetails.images.map((image, index) => (
                  <Avatar
                    key={image.index}
                    sx={{
                      width: 100,
                      height: 100,
                      borderRadius: "8px",
                      marginRight: 2,
                      position: "relative",
                    }}
                  >
                    <img
                      src={image.preview}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        borderRadius: "8px",
                      }}
                      alt={`Image ${index + 1}`}
                    />
                    <IconButton
                      size="small"
                      onClick={() => handleRemoveImage(index)}
                      sx={{
                        position: "absolute",
                        top: 0,
                        right: 0,
                        color: "white",
                      }}
                    >
                      <CloseIcon />
                    </IconButton>
                  </Avatar>
                ))}
            </Stack>

            {imageError && (
              <Typography
                variant="body2"
                color="error"
                sx={{ fontSize: 13, mt: -1 }}
              >
                {imageError}
              </Typography>
            )}

            <Button
              variant="contained"
              color="primary"
              data-testid="button"
              onClick={handleSubmit}
              disabled={
                !(
                  roomDetails.room_type_id &&
                  roomDetails.number_of_rooms &&
                  roomDetails.room_facilities &&
                  roomDetails.rate &&
                  roomDetails.images.length > 0
                )
              }
            >
              Add Room Details
            </Button>
            <Backdrop
              sx={{
                color: "#fff",
                zIndex: (theme) => theme.zIndex.drawer + 1,
              }}
              open={isSubmitting}
            >
              <CircularProgress color="inherit" />
            </Backdrop>
          </Stack>
        </Box>
      </Box>
    </>
  );
};

export default RoomDetails;
