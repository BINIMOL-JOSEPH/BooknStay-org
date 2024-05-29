import React, { useEffect, useState } from "react";
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import { createTheme } from '@mui/material/styles';
import VisibilityIcon from '@mui/icons-material/Visibility';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import { adminServices } from "../../AdminService";
import RoomDetailsDialog from "./RoomDetailsDialog";
import Stack from "@mui/material/Stack";
import { axiosPrivate } from "../../interceptor";
import CollapsibleSidebar from "../Sidebar/Sidebar";
import { Breadcrumbs, Typography, Tooltip, TextField } from "@mui/material";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import { Link } from "react-router-dom";
import NoDataFound from "../ListReviewsByHotels/NoDataFound";
import Loading from "../Loading/Loading";

const defaultTheme = createTheme();

const ListRoomDetails = () => {
  const [data, setData] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState("");
  const [nextRoom, setNextRoom] = useState("");
  const [previousRoom, setPreviousRoom] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRoomDetails();
  }, [searchQuery]);

  const fetchRoomDetails = async () => {
    try {
      const response = await adminServices.ListRoomDetails({ query: searchQuery });
      setData(response.data.results);
      setNextRoom(response.data.next);
      setPreviousRoom(response.data.previous);
      setCurrentPage(1);
      setErrorMessage("");
    } catch (error) {
      if (error.response) {
        setErrorMessage(error.response.data.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleMoreVertIconClick = (roomDetails) => {
    const id = roomDetails.id;
    setSelectedRoom(id);
    setDialogOpen(true);
  };

  const handleNext = () => {
    axiosPrivate.get(nextRoom).then((response) => {
      setData(response.data.results);
      setNextRoom(response.data.next);
      setPreviousRoom(response.data.previous);
      setCurrentPage(currentPage + 1);
    });
  };

  const handlePrevious = () => {
    axiosPrivate.get(previousRoom).then((response) => {
      setData(response.data.results);
      setNextRoom(response.data.next);
      setPreviousRoom(response.data.previous);
      setCurrentPage(currentPage - 1);
    });
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  if (loading) {
    return <Loading />;
  }

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
        {data.length > 0 && (
          <Breadcrumbs
            separator={<NavigateNextIcon fontSize="small" />}
            aria-label="breadcrumb"
            sx={{ mt: 2, ml: 4.2 }}
          >
            <Link to="/supervisor-dashboard">Home</Link>
            <Typography color="textPrimary">List Room Details</Typography>
          </Breadcrumbs>
        )}

        {data.length === 0 && (
          <NoDataFound />
        )}

        {data.length > 0 && (
          <Card sx={{ minWidth: 1000, marginTop: "4%", width: "85%" }} data-testid="card_element" >
            <CardHeader title="Room Details" />
            <CardContent>
              <Stack direction="row" spacing={2} sx={{ ml: '3.5%' }}>
                <TextField
                  id="Search"
                  name="search"
                  label="Search"
                  autoFocus
                  size="small"
                  sx={{ mb: 2, width: { sm: 750 } }}
                  value={searchQuery}
                  onChange={handleSearch}
                />
              </Stack>

              {errorMessage && data.length > 0 && (
                <Alert severity="info" sx={{ mx: "auto", mt: '3%', width: '93%', ml: '3.5%' }}>
                  {errorMessage}
                </Alert>
              )}

              {!errorMessage && (
                <TableContainer component={Paper} sx={{ width: "93%", mx: "auto", mt: 3 }} data-testid="table_container" >
                  <Table aria-label="simple table">
                    <TableHead sx={{ bgcolor: '#B4B4B8' }}>
                      <TableRow>
                        <TableCell align="center" sx={{ color: "#272829", fontWeight: "bold" }} > SI. No </TableCell>
                        <TableCell align="center" sx={{ color: "#272829", fontWeight: "bold" }} > Room type </TableCell>
                        <TableCell align="center" sx={{ color: "#272829", fontWeight: "bold" }} > Hotel Name </TableCell>
                        <TableCell align="center" sx={{ color: "#272829", fontWeight: "bold" }} > No.of Rooms </TableCell>
                        <TableCell align="center" sx={{ color: "#272829", fontWeight: "bold" }} > Booked Rooms </TableCell>
                        <TableCell align="center" sx={{ color: "#272829", fontWeight: "bold" }} > Available Rooms </TableCell>
                        <TableCell align="center" sx={{ color: "#272829", fontWeight: "bold" }} > Action </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {data && data.map((roomData, index) => (
                        <TableRow key={roomData.room_detail.id} sx={{ "&:last-child td, &:last-child th": { border: 0 }, }} >
                          <TableCell align="center"> {index + 1} </TableCell>
                          <TableCell align="center"> {roomData.room_detail.room_type_name} </TableCell>
                          <TableCell align="center"> {roomData.room_detail.hotel_name} </TableCell>
                          <TableCell align="center"> {roomData.room_detail.number_of_rooms} </TableCell>
                          <TableCell align="center"> {roomData.booked_rooms} </TableCell>
                          <TableCell align="center"> {roomData.available_rooms} </TableCell>
                          <RoomDetailsDialog isOpen={dialogOpen} onClose={() => setDialogOpen(false)} roomId={selectedRoom} data-testid="room-details-dialog" />
                          <TableCell align="center">
                            <Tooltip title="View more">
                              <VisibilityIcon onClick={() => handleMoreVertIconClick(roomData.room_detail)} style={{ color: "black" }} data-testid="view-more-icon" />
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
              {!errorMessage && (
                <Stack sx={{ mt: 2, ml: '77%' }} direction="row" data-testid='navigate-stack'>
                  {previousRoom ? (
                    <Button data-testid="previous" onClick={handlePrevious}>Previous</Button>
                  ) : (
                    <Button data-testid="previous" disabled>Previous</Button>
                  )}
                  <Button data-testid="page">{currentPage}</Button>
                  {nextRoom ? (
                    <Button data-testid="next" onClick={handleNext}>Next</Button>
                  ) : (
                    <Button data-testid="next" disabled>Next</Button>
                  )}
                </Stack>
              )}
            </CardContent>
          </Card>
        )}

      </Box>
    </>
  );
};

export default ListRoomDetails;
