import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Card,
  Stack,
  Button,
  CardMedia,
  CardContent,
  TextField,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Alert,Breadcrumbs,
  Container
} from "@mui/material";
import { hotelService } from "../../HotelService";
import CollapsibleSidebar from "../Sidebar/Sidebar";
import { axiosPrivate } from "../../interceptor";
import { useNavigate,Link } from "react-router-dom";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import Loading from "../Loading/Loading";

const ViewRoomServices = () => {
  const [roomservices, setRoomServices] = useState([]);
  const [error, setError] = useState(null);
  const [next, setNext] = useState("");
  const [previous, setPrevious] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchRoomServices = async (sortingOption) => {
    try {
      const response = await hotelService.ListRoomServices({
        params: { ordering: sortingOption },
      });

      setRoomServices(response.data.results);
      setNext(response.data.next);
      setPrevious(response.data.previous);
      setLoading(false);
      setError(null);
    } catch (error) {
      const errorMessageFromApi =
        error.response?.data?.message ||
        "An error occurred while fetching room details.";
      setError(errorMessageFromApi);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoomServices();
  }, []);

  const handleNextRoomService = () => {
    if (next) {
      axiosPrivate
        .get(next)
        .then((response) => {
          setRoomServices(response.data.results);
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

  const handlePreviousRoomService = () => {
    if (previous) {
      axiosPrivate
        .get(previous)
        .then((response) => {
          setRoomServices(response.data.results);
          setNext(response.data.next);
          setPrevious(response.data.previous);
          setCurrentPage(currentPage - 1);
        })
        .catch(() => {
          console.log(error)
          setError(
            "An error occurred while fetching the previous page. Please try again."
          );
        });
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSort = (e) => {
    const selectedSortOption = e.target.value;
    setSortOption(selectedSortOption);
    fetchRoomServices(selectedSortOption);
  };

  const filteredRoomServices = roomservices.filter((roomService) =>
    roomService.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddServices = () => {
    navigate(`/add-room-services/`);
  };
  const handleEditRoomService = (serviceId) => {
    navigate(`/edit-room-services/${serviceId}`);
  };
  const handleDeleteRoomService = (serviceId) => {
    navigate(`/delete-room-services/${serviceId}`);
  };


  if (loading) {
    return <Loading />;
  }



  return (
    <>
      <CollapsibleSidebar />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
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
          {roomservices.length > 0 && (
            <>
              <Breadcrumbs
                separator={<NavigateNextIcon fontSize="small" />}
                aria-label="breadcrumb"
                sx={{ mt: 2, ml: 4.2 }}
              >
                <Link to="/hotel-dashboard">
                  Home
                </Link>

                <Typography color="textPrimary">List Room Services</Typography>
              </Breadcrumbs>
              <Box
                sx={{
                  backgroundColor: '#F8F8F8',
                  borderRadius: 3,
                  overflow: 'hidden',
                  width: '90%',
                  mt: '2%',
                  height: '55px',
                }}
              >
                <Stack direction="row" justifyContent="right" spacing={'64%'} width='95%' sx={{ ml: '2%', mt: '1%' }}>
                  <Typography component="div" variant="h5" sx={{ fontWeight: 'bold', fontSize: '30px' }} >
                    Manage Services
                  </Typography>
                  <Button variant="contained" sx={{ bgcolor: 'green' }} data-testid="add" onClick={handleAddServices}>
                    Add Services
                  </Button>
                </Stack>
              </Box>

              <Stack direction="row" spacing={2} sx={{ mt: '1%', ml: '-0.5%', width: '85%' }}>
                <TextField
                  type="text"
                  placeholder="Search Room Services"
                  value={searchTerm}
                  onChange={handleSearch}
                  size="small"
                  sx={{ width: "450px" }}
                />&nbsp;&nbsp;
                <FormControl size="small" sx={{ width: "150px" }}>
                  <InputLabel data-testid="sort">Sort By</InputLabel>
                  <Select value={sortOption} onChange={handleSort}>
                    <MenuItem value="">Select Option</MenuItem>
                    <MenuItem value="price">Price Ascending</MenuItem>
                    <MenuItem value="-price">Price Descending</MenuItem>
                  </Select>
                </FormControl>
              </Stack>
            </>
          )}
        
          {roomservices.length === 0 ? (
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
                <img alt='No data found' src='https://booknstay.innovaturelabs.com/No_data.png' height= '30%' width='30%' />
                <Typography variant="h5" color="textSecondary" gutterBottom>
                  <br></br>No services added !
                </Typography>
                <Typography variant="h8" color="textSecondary" gutterBottom>
                  You don't have any room services added to your account. Please add a service.
                </Typography>
                <Button
                  data-testid="add"
                  variant="contained"
                  sx={{ bgcolor: "green", mb: '3%' }}
                  onClick={() => handleAddServices()}
                >
                  Add Services
                </Button>
                <Button component={Link} to="/hotel-dashboard" color="primary">
                  Go back
                </Button>
              </Box>
            </Container>
          ) : (
          <>    
             {filteredRoomServices.length > 0 ? (
              filteredRoomServices.map((roomService) => (
                <Box key={roomService.id} sx={{ mt: 3, width: "90%" }}>
                  <Card
                    key={roomService.id}
                    sx={{  display: "flex",  mt: '1%', ml : '2.5%', mb : '-1%', width: "95%", position : 'relative', borderRadius: 3, overflow: 'hidden' }}
                  >
                    <CardMedia
                        component="img"
                        sx={{
                          width: 380,
                          height: 240,
                          mt : '1%',
                          ml : '1%',
                          mb : '1%',
                          borderRadius: 3, 
                          overflow: 'hidden'
                        }}
                        src={roomService.image}
                        alt={roomService.title}
                    />
                    <Box sx={{ display: 'flex', flexDirection: 'column', width: "40%", ml : '1%'}}>
                      <CardContent sx={{ flex: "1 0 auto" }} >
                        <Typography component="div" variant="h5" sx={{fontWeight : 'bold'}} data-testid="title" >
                          {roomService.title}
                        </Typography>
                        <Typography variant="subtitle1" component="div" data-testid="description" >
                          {roomService.description}
                        </Typography>
                        <Typography variant="subtitle1" component="div" data-testid="price" >
                          Price: {roomService.price}
                        </Typography>
                        <Typography variant="subtitle1" component="div" data-testid="status" >
                          Status: {roomService.status}
                        </Typography>
                      </CardContent>
                    </Box>
                    <Box sx={{ display: 'flex', flexDirection: 'column', width: "40%", mt: '3%' }}>
                    <Stack direction="row" spacing={2}
                      sx={{ position: 'absolute', bottom: 0, right: 0, marginBottom: 2, marginRight: 2 }}
                    >
                        <Button sx={{alignItems: "right", bgcolor : '#40A2E3' }} data-testid="edit" variant="contained" size='small' onClick={() => handleEditRoomService(roomService.id)} >
                          Edit
                        </Button>
                        {roomService.status === "active" && (
                          <Button sx={{alignItems: "right", bgcolor : '#D04848' }} data-testid="delete" variant="contained" size='small' onClick={() => handleDeleteRoomService(roomService.id)} >
                            Delete
                          </Button>
                        )}
                    </Stack>
                  </Box>
                </Card>
              </Box>
              )) 
            ) : (
              <Alert
                severity="info"
                sx={{
                  justifyContent: "center",
                  alignItems: "center",
                  textAlign: "center",
                  width: "46%",
                  mt: '5%',
                  marginLeft: "120px", 
                }}
                data-testid="backend-error-message"
              >
                No search results found.
              </Alert>
            )} 
            {roomservices.length > 0 && (
                  <Stack sx={{ mt: 2, alignItems: 'center', }} direction="row" data-testid='navigate-stack'>
                    {previous ? (
                      <Button data-testid="previous" onClick={handlePreviousRoomService}>Previous</Button>
                    ) : (
                      <Button data-testid="previous" disabled>Previous</Button>
                    )}
                    <Button data-testid="page">{currentPage}</Button>
                    {next ? (
                      <Button data-testid="next" onClick={handleNextRoomService}>Next</Button>
                    ) : (
                      <Button data-testid="next" disabled>Next</Button>
                    )}
                  </Stack>
            )}
              </>        
        )}
        </Box>
      </div>
    </>
  );
};

export default ViewRoomServices;
