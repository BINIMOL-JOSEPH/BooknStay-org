import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Card,
  Stack,
  Button,
  CssBaseline,
  CardMedia,
  CardContent,
  Alert,
  TextField,
  Breadcrumbs,
  Container
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import Carousel from "react-material-ui-carousel";
import { hotelService } from "../../HotelService";
import { axiosPrivate } from "../../interceptor";
import CollapsibleSidebar from "../Sidebar/Sidebar";
import { useNavigate, Link } from "react-router-dom";
import ListServicesToRoomsHotels from "../ListAddedServicesHotel/ListAddedServiceHotel";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import ServicesDialog from "../ListAdditionalActivites/ListAdditionalActivites";
import Loading from "../Loading/Loading";

const defaultTheme = createTheme();

const ViewRoomDetails = () => {
  const [roomDetails, setRoomDetails] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [next, setNext] = useState("");
  const [previous, setPrevious] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedRoomId, setSelectedRoomId] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedRoomIdForView, setSelectedRoomIdForView] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    fetchRoomDetails();
  }, [searchTerm, setLoading]);

  const fetchRoomDetails = async () => {
    try {
      const response = await hotelService.ListHotelRoomDetails({
        query: searchTerm,

      });

      const responseData = response.data;
      setRoomDetails(responseData.results);
      setNext(responseData.next);
      setPrevious(responseData.previous);
      setError("");
      setLoading(false);
    } catch (error) {
      setError( error.response?.data?.message );
      setRoomDetails([]);
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (next) {
      axiosPrivate
        .get(next)
        .then((response) => {
          setRoomDetails(response.data.results);
          setNext(response.data.next);
          setPrevious(response.data.previous);
          setCurrentPage(currentPage + 1);
        })
        .catch((error) => {
          setError(
            "An error occurred while fetching the next page. Please try again."
          );
        });
    }
  };

  const handlePrevious = () => {
    if (previous) {
      axiosPrivate
        .get(previous)
        .then((response) => {
          setRoomDetails(response.data.results);
          setNext(response.data.next);
          setPrevious(response.data.previous);
          setCurrentPage(currentPage - 1);
        })
        .catch((error) => {
          setError(
            "An error occurred while fetching the previous page. Please try again."
          );
        });
    }
  };

  const handleEditRoom = (roomId) => {
    navigate(`/edit-room-details/${roomId}`);
  };

  const handleDeleteRoom = (roomId) => {
    navigate(`/delete-room-details/${roomId}`);
  };

  const handleAddRoom = () => {
    navigate(`/room-details/`);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

 
  const handleAddServicesClick = (roomId) => {
    setSelectedRoomId(roomId);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  const handleViewServicesClick = (roomId) => {
    setSelectedRoomIdForView(roomId);
    setViewDialogOpen(true);
  };
  if (loading) {
    return <Loading />;
  }

  const manageRoomHeader = (
    <>
      <Breadcrumbs
        separator={<NavigateNextIcon fontSize="small" />}
        aria-label="breadcrumb"
        sx={{ mt: 2, ml: 4.2 }}
      >
        <Link to="/hotel-dashboard">Home</Link>
        <Typography color="textPrimary">List Room Details</Typography>
      </Breadcrumbs>
      <Box
        sx={{
          backgroundColor: "#F8F8F8",
          borderRadius: 3,
          overflow: "hidden",
          width: "90%",
          mt: "2%",
          height: "55px",
        }}
      >
        <Stack direction="row" justifyContent="right" spacing={"68%"} sx={{ ml: "2%", mt: "1%" }} width= "95%" >
          <Typography component="div" variant="h5" sx={{ fontWeight: "bold", fontSize: "30px" }} >
            Manage Rooms
          </Typography>
          <Button data-testid="add" variant="contained" sx={{ bgcolor: "green" }} onClick={() => handleAddRoom()} >
            Add Rooms
          </Button>
        </Stack>
      </Box>
      <Stack direction="row" spacing={2} sx={{ mt: "1%", ml: "-0.5%", width: "85%" }} >
        <TextField
          type="text"
          data-testid="search"
          placeholder="Search Room Rate, Total number of rooms, Room Type"
          value={searchTerm}
          onChange={handleSearch}
          size="small"
          sx={{ width: "450px" }}
        />
      </Stack>
    </>
  )

  const noRoomDetailsMessage =
    !error && roomDetails.length === 0 ? (
        <Container>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '80vh'
            }}
          >
            <img alt='No data found' src='https://booknstay.innovaturelabs.com/No_data.png' height= '30%' width='30%' />
            <Typography variant="h5" color="textSecondary" gutterBottom>
              <br></br>No rooms added !
            </Typography>
            <Typography variant="h8" color="textSecondary" gutterBottom>
              You don't have any rooms added to your account. Please add a room.
            </Typography>
            <Button
              data-testid="add"
              variant="contained"
              sx={{ bgcolor: "green", mb: '3%' }}
              onClick={() => handleAddRoom()}
            >
              Add Rooms
            </Button>
            <Button component={Link} to="/hotel-dashboard" color="primary">
              Go back
            </Button>
          </Box>
        </Container>
    ) : null;

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
            minHeight: "90vh",
            width: "100%",
            backgroundColor: "#F8F8F8",
          }}
        >
          {roomDetails.length > 0 && (
            <>
              {manageRoomHeader}
            </>
          )}

          {error && (
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
              <>
                {manageRoomHeader}
                <Alert
                  severity="info"
                  sx={{
                    justifyContent: "center",
                    alignItems: "center",
                    textAlign: "center",
                    width: "60%",
                    mt: '5%'
                  }}
                >
                  {error}
                </Alert>
              </>
            </Box>
          )}

          {noRoomDetailsMessage}
          {roomDetails.map((room, index) => {
            const imagesToRepeat = [];

            for (let i = 1; i <= 3; i++) {
              const imageKey = `image${i}`;
              const imageUrl =
                roomDetails[index]?.[imageKey] ||
                roomDetails.find(
                  (image) => image.room_details_id === room.id && image[imageKey]
                )?.[imageKey];

              if ((!imageUrl || imageUrl.trim() === "") && i !== 1) {
                imagesToRepeat.push(imagesToRepeat[0]);
              } else {
                imagesToRepeat.push(imageUrl);
              }
            }
      
            return (
              <Box key={room.id} sx={{ mt: 3, width: "90%" }}>
                <Card
                  key={room.id}
                  sx={{
                    display: "flex",
                    mt: "1%",
                    ml: "2.5%",
                    mb: "-1%",
                    width: "95%",
                    position: "relative",
                    borderRadius: 3,
                    overflow: "hidden",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      width: "25%",
                      ml: "1%",
                      mb: "1%",
                      mt: "1%",
                    }}
                  >
                    <Carousel animation="slide"
                      indicatorContainerProps={{
                        style: { position: "absolute", bottom: 2 },
                      }}
                      sx={{ borderRadius: 3, overflow: "hidden" }}
                    >
                      {imagesToRepeat.map((img, i) => (
                        <CardMedia
                          key={roomDetails.id}
                          data-testid={`image${i + 1}`}
                          component="img"
                          sx={{
                            width: 400,
                            height: 250,
                          }}
                          image={img}
                          alt={`${room.room_type} - Image ${i + 1}`}
                        />
                      ))}
                    </Carousel>
                  </Box>
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      width: "40%",
                      ml: "1%",
                      mb: "-2%",
                    }}
                  >
                    <CardContent sx={{ flex: "1 0 auto" }}>
                      <Typography omponent="div" variant="h5" sx={{ fontWeight: "bold" }} data-testid="roomtype" >
                        {room.room_type_name}
                      </Typography>
                      <Typography variant="subtitle1" component="div" data-testid="total-rooms" >
                        {`Number of Rooms: ${room.number_of_rooms}`}
                      </Typography>
                      <Typography variant="subtitle1" component="div" data-testid="rate" >
                        {`Rate: $${room.rate}`}
                      </Typography>
                      <Typography variant="subtitle1" component="div" data-testid="facilities" >
                        {`Facilities: ${room.room_facilities}`}
                      </Typography>
                      <Typography variant="subtitle1" data-testid="available_rooms" component="div" >
                        {`Available Rooms: ${room.available_rooms}`}
                      </Typography>
                      <Typography variant="subtitle1" data-testid="booked_rooms" component="div" >
                        {`Booked Rooms: ${room.booked_rooms}`}
                      </Typography>
                      <Typography variant="subtitle1" component="div">
                        {`Room Status: ${room.status}`}
                      </Typography>
                      <Typography variant="subtitle1" component="div">
                        {`Created at : ${room.date_joined}`}
                      </Typography>
                      <Typography variant="subtitle1" component="div">
                        {`Room Services: `}
                        <Link data-testid="view-service" onClick={() => handleViewServicesClick(room.id)}> View </Link>
                        <ListServicesToRoomsHotels isOpen={viewDialogOpen} onClose={() => setViewDialogOpen(false)} roomId={selectedRoomIdForView} />
                      </Typography>
                    </CardContent>
                  </Box>
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      width: "40%",
                      mt: "3%",
                    }}
                  > 
                    <Stack direction="row" spacing={2}
                      sx={{
                        position: "absolute",
                        bottom: 0,
                        right: 0,
                        marginBottom: 2,
                        marginRight: 2,
                      }}
                    >
                    {room.status == 'active' && (
                        <>
                          <Button
                            sx={{ alignItems: "right", bgcolor: "#40A2E3" }}
                            data-testid="edit"
                            variant="contained"
                            onClick={() => handleEditRoom(room.id)}
                            size='small'
                          >
                            Edit
                          </Button>
                          <Button
                            sx={{ alignItems: "right", bgcolor: "#D04848" }}
                            data-testid="delete"
                            variant="contained"
                            onClick={() => handleDeleteRoom(room.id)}
                            size='small'
                          >
                            Delete
                          </Button>
                          <ServicesDialog open={dialogOpen} onClose={handleCloseDialog} roomId={selectedRoomId} />
                          <Button
                            sx={{ alignItems: "right", bgcolor: "grey" }}
                            variant="contained"
                            data-testid="view-more"
                            onClick={() => handleAddServicesClick(room.id)}
                            size='small'
                          >
                            ADD SERVICES
                          </Button>
                        </>
                    )}
                      
                    </Stack>
                  </Box>
                </Card>
              </Box>
            );
          })}
          {roomDetails.length > 0 && (
            <Stack
              sx={{ mt: 2, alignItems: "center" }}
              direction="row"
              data-testid="navigate-stack"
            >
              {previous ? (
                <Button data-testid="previous" onClick={handlePrevious}> Previous </Button>
              ) : (
                <Button data-testid="previous" disabled> Previous </Button>
              )}
              <Button data-testid="page">{currentPage}</Button>
              {next ? (
                <Button data-testid="next" onClick={handleNext}> Next </Button>
              ) : (
                <Button data-testid="next" disabled> Next </Button>
              )}
            </Stack>
          )}
        </Box>
      </ThemeProvider>
    </>
  );
};

export default ViewRoomDetails;
