import React, { useEffect, useState } from "react";
import {
  Box,
  Alert,
  List,
  ListItem,
  ListItemText,
  Typography,
  Breadcrumbs,
  ThemeProvider,
  Stack,
  Table,
  TableCell,
  TableRow
} from "@mui/material";
import { createTheme } from "@mui/material/styles";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import CollapsibleSidebar from "../Sidebar/Sidebar";
import { useParams, useNavigate, Link as RouterLink } from "react-router-dom";
import Swal from "sweetalert2";
import { hotelService } from "../../HotelService";
import RenderActionButtons from "./RenderActionButtons";
import CardDetailsSection from "./CardDetailsSection";

const customTheme = createTheme({
  palette: {
    primary: {
      main: "#2196F3",
    },
    secondary: {
      main: "#FF4081",
    },
  },
});

const ViewHotel = () => {
  const { id } = useParams();
  const [data, setData] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchHotelData();
  }, []);

  const fetchHotelData = async () => {
    try {
      const response = await hotelService.ViewHotel(String(id));
      if (Array.isArray(response.data)) {
        setData(response.data);
        console.log(response.data)
        setErrorMessage("");
      } else {
        setErrorMessage("Data is not received in the correct format");
      }
    } catch (error) {
      if (error.response) {
        setErrorMessage(error.response.data.message);
      }
    }
  };

  const handleApprove = async (hotel_id) => {
    try {
      const response = await hotelService.ApproveHotel(hotel_id);
      Swal.fire({
        position: "top",
        icon: "success",
        title: response.data.message,
        showConfirmButton: false,
        timer: 5000,
      });
      navigate("/list-hotels");
      fetchHotelData();
      setErrorMessage("");
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
    }
  };

  const handleReject = async (hotel_id) => {
    try {
      const response = await hotelService.RejectHotel(hotel_id);
      Swal.fire({
        position: "top",
        icon: "success",
        title: response.data.message,
        showConfirmButton: false,
        timer: 5000,
      });
      navigate("/list-hotels");
      fetchHotelData();
      setErrorMessage("");
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
    }
  };

  const handleActivate = (hotel_id) => {
    navigate(`/activate-hotel/${hotel_id}`);
  };

  const handleDelete = (hotel_id) => {
    navigate(`/delete-hotel/${hotel_id}`);
  };

  const handleSuspend = (hotel_id) => {
    navigate(`/suspend-hotel/${hotel_id}`);
  };

  const renderHotelDetails = (hotel) => (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        minHeight: "90vh",
        width: "100%",
        backgroundColor: "#F8F8F8",
        padding: "20px",
        borderRadius: "8px",
        marginBottom: "20px",
      }}
    >
      <Stack direction='row' spacing={2} sx={{ width: '80%' }}>
          <CardDetailsSection title="Hotel Details" >
            <Table>
              <TableRow>
                <TableCell variant="head">Hotel Name</TableCell>
                <TableCell>{hotel.hotel_details.hotel_name}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell variant="head">License Number</TableCell>
                <TableCell>{hotel.hotel_details.license_number}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell variant="head">Service Charge</TableCell>
                <TableCell>{hotel.hotel_details.service_charge}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell variant="head">Address</TableCell>
                <TableCell>{hotel.hotel_details.address}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell variant="head">City</TableCell>
                <TableCell>{hotel.hotel_details.city}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell variant="head">District</TableCell>
                <TableCell>{hotel.hotel_details.district}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell variant="head">State</TableCell>
                <TableCell>{hotel.hotel_details.state}</TableCell>
              </TableRow>
            </Table>
          </CardDetailsSection>
        
          <CardDetailsSection
            title="Contact Details"
            hotel={hotel.hotel_details}
            renderActionButtons={renderActionButtons}
          >
            <Table>
              <TableRow>
                <TableCell variant="head">Phone Number:</TableCell>
                <TableCell>{hotel.hotel_details.phone_number}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell variant="head">Email</TableCell>
                <TableCell>{hotel.hotel_details.email}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell variant="head">Date Joined</TableCell>
                <TableCell>{hotel.hotel_details.date_joined}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell variant="head">Status</TableCell>
                <TableCell>{hotel.hotel_details.status}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell variant="head">Updated On</TableCell>
                <TableCell>{hotel.hotel_details.updated_on}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell variant="head">Deleted On</TableCell>
                <TableCell>{hotel.hotel_details.deleted_on}</TableCell>
              </TableRow>
            </Table>
          </CardDetailsSection>
          </Stack>
    </Box>
  );

  const renderActionButtons = (hotel) => (
    <RenderActionButtons
      hotel={hotel}
      handleApprove={handleApprove}
      handleReject={handleReject}
      handleActivate={handleActivate}
      handleDelete={handleDelete}
      handleSuspend={handleSuspend}
    />
  );

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
        <ThemeProvider theme={customTheme}>
            <Breadcrumbs
              separator={<NavigateNextIcon fontSize="small" />}
              aria-label="breadcrumb"
              sx={{ marginBottom: 2, marginLeft: 2 }}
            >
              <RouterLink to="/supervisor-dashboard" color="inherit">
                Home
              </RouterLink>
              <RouterLink to="/list-hotels" color="inherit">
                List Hotels
              </RouterLink>
              <Typography color="textPrimary">Hotel Details</Typography>
            </Breadcrumbs>
          {errorMessage && (
            <Alert
              severity="info"
              sx={{
                width: "50%",
                mx: "auto",
                backgroundColor: "#FF4081",
                color: "#FFF",
                mb: 2,
              }}
            >
              {errorMessage}
            </Alert>
          )}
          {!errorMessage && (
            <List sx={{ ml: 0, textAlign: "left", width: "100%" }}>
              {data.map((hotel, index) => (
                <React.Fragment key={hotel.index}>
                  <ListItem>
                    <ListItemText primary={<>{renderHotelDetails(hotel)}</>} />
                  </ListItem>
                </React.Fragment>
              ))}
            </List>
          )}
        </ThemeProvider>
      </Box>
    </>
  );
};

export default ViewHotel;
