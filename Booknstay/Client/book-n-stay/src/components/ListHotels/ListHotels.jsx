import React, { useEffect, useState } from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardHeader from "@mui/material/CardHeader";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { TextField, Tooltip,Breadcrumbs, Typography } from "@mui/material";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import { hotelService } from "../../HotelService";
import { Link } from "react-router-dom";
import { axiosPrivate } from "../../interceptor";
import Alert from "@mui/material/Alert";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import CollapsibleSidebar from "../Sidebar/Sidebar";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import NoDataFound from "../ListReviewsByHotels/NoDataFound";
import Loading from "../Loading/Loading";

const defaultTheme = createTheme();

const ListHotels = () => {
  const [data, setData] = useState([]);
  const [errorHotelMessage, setErrorHotelMessage] = useState("");
  const [nextHotel, setNextHotel] = useState("");
  const [previousHotel, setPreviousHotel] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (filter) {
      hotelService
        .FetchHotelByStatus(filter)
        .then((response) => {
          setData(response.data.results);
          setNextHotel(response.data.next);
          setPreviousHotel(response.data.previous);
          setErrorHotelMessage("");
        })
        .catch((error) => {
          setErrorHotelMessage(error.response.data.message);
          setData([]);
        });
    } else {
      fetchHotelData();
    }
  }, [searchQuery, filter]);

  const fetchHotelData = async () => {
    try {
      const response = await hotelService.FetchHotel({ query: searchQuery });
      setData(response.data.results);
      setNextHotel(response.data.next);
      setPreviousHotel(response.data.previous);
      setErrorHotelMessage("");
      setCurrentPage(1);
    } catch (error) {
      if (error.response?.data) {
        setErrorHotelMessage(error.response.data.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleNextHotels = () => {
    axiosPrivate.get(nextHotel).then((response) => {
      setData(response.data.results);
      setNextHotel(response.data.next);
      setPreviousHotel(response.data.previous);
      setCurrentPage(currentPage + 1);
    });
  };

  const handlePreviousHotels = () => {
    axiosPrivate.get(previousHotel).then((response) => {
      setData(response.data.results);
      setNextHotel(response.data.next);
      setPreviousHotel(response.data.previous);
      setCurrentPage(currentPage - 1);
    });
  };

  const handleChange = (e) => {
    setFilter(e.target.value);
    setSearchQuery("");
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setFilter("");
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
          minHeight: "100vh",
          width: "100%",
          backgroundColor: "#F8F8F8",
        }}
      >
          <Breadcrumbs
            separator={<NavigateNextIcon fontSize="small" />}
            aria-label="breadcrumb"
            sx={{ mt : 2 }}
          >
            <Link to="/supervisor-dashboard">Home</Link>
            <Typography color="textPrimary">List Hotels</Typography>
          </Breadcrumbs>
        <ThemeProvider theme={defaultTheme}>
          <Card sx={{ minWidth: 1000, marginTop: "4%", width: "90%" }}>
            <CardHeader title="Hotel Details" sx={{ mx: "auto" }} />
            <CardContent>
              <Stack direction="row" spacing={2} sx={{ ml: 4.2 }}>
                <TextField
                  id="Search"
                  name="search"
                  label="Search"
                  autoFocus
                  size="small"
                  sx={{ mb: 2, ml: 20, width: { sm: 750 } }}
                  value={searchQuery}
                  onChange={handleSearchChange}
                ></TextField>

                <Select
                  value={filter}
                  onChange={handleChange}
                  size="small"
                  data-testid="select-option"
                  sx={{ mb: 2, width: { sm: 300 } }}
                  name="Customer Status"
                  displayEmpty
                  inputProps={{ "aria-label": "Without label" }}
                >
                  <MenuItem value="">
                    <em>--Select Hotel Status--</em>
                  </MenuItem>
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                  <MenuItem value="rejected">Rejected</MenuItem>
                  <MenuItem value="suspended">Suspended</MenuItem>
                  <MenuItem value="deleted">Deleted</MenuItem>
                </Select>
              </Stack>
              {errorHotelMessage &&  data.length> 0 && (
                <Alert
                  severity="info"
                  sx={{ mt: 3, ml: 4, mr: 1, width: "95%" }}
                >
                  {errorHotelMessage}
                </Alert>
              )}
              {data.length===0 &&
              <NoDataFound/>}

              {!errorHotelMessage && (
                <TableContainer
                  component={Paper}
                  sx={{ maxWidth: "95%", mx: "auto", mt: 2 }}
                >
                  <Table sx={{ minWidth: 300 }} aria-label="simple table">
                  <TableHead sx={{ bgcolor: '#B4B4B8'}}>
                      <TableRow>
                        <TableCell
                          align="center"
                          sx={{ color: "#272829", fontWeight: "bold" }}
                        >
                          SI. No
                        </TableCell>
                        <TableCell
                          align="center"
                          sx={{ color: "#272829", fontWeight: "bold" }}
                        >
                          Hotel Name
                        </TableCell>
                        <TableCell
                          align="center"
                          sx={{ color: "#272829", fontWeight: "bold" }}
                        >
                          License Number
                        </TableCell>
                        <TableCell
                          align="center"
                          sx={{ color: "#272829", fontWeight: "bold" }}
                        >
                          Email
                        </TableCell>
                        <TableCell
                          align="center"
                          sx={{ color: "#272829", fontWeight: "bold" }}
                        >
                          Phone Number
                        </TableCell>
                        <TableCell
                          align="center"
                          sx={{ color: "#272829", fontWeight: "bold" }}
                        >
                          Date Joined
                        </TableCell>
                        <TableCell
                          align="center"
                          sx={{ color: "#272829", fontWeight: "bold" }}
                        >
                          Status
                        </TableCell>
                        <TableCell
                          align="center"
                          sx={{ color: "#272829", fontWeight: "bold" }}
                        >
                          Updated On
                        </TableCell>
                        <TableCell
                          align="center"
                          sx={{ color: "#272829", fontWeight: "bold" }}
                        >
                          Action
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {data.map((hotel, index) => (
                        <TableRow
                          key={hotel.index}
                          sx={{
                            "&:last-child td, &:last-child th": { border: 0 },
                          }}
                        >
                          <TableCell align="center">{index + 1}</TableCell>
                          <TableCell align="center">
                            {hotel.hotel_name}
                          </TableCell>
                          <TableCell align="center">
                            {hotel.license_number}
                          </TableCell>
                          <TableCell align="center">{hotel.email}</TableCell>
                          <TableCell align="center">
                            {hotel.phone_number}
                          </TableCell>
                          <TableCell align="center">
                            {hotel.date_joined}
                          </TableCell>
                          <TableCell align="center">{hotel.status}</TableCell>
                          <TableCell align="center">
                            {hotel.updated_on}
                          </TableCell>
                          <TableCell align="center">
                            <Link
                              to={`/view-hotel/${hotel.id}`}
                              data-testid="view-more-link"
                            >
                              <Tooltip title="View more">
                                <VisibilityIcon style={{ color: "#272829" }} />
                              </Tooltip>
                            </Link>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
              {!errorHotelMessage && (
                <Stack sx={{ mt: 2, ml: '79%' }} direction="row" data-testid='navigate-stack'>
                  {previousHotel ? (
                      <Button data-testid="previous" onClick={handlePreviousHotels}>Previous</Button>
                  ) : (
                      <Button data-testid="previous" disabled>Previous</Button>
                  )}
                  <Button data-testid="page">{currentPage}</Button>
                  {nextHotel ? (
                      <Button data-testid="next" onClick={handleNextHotels}>Next</Button>
                  ) : (
                      <Button data-testid="next" disabled>Next</Button>
                  )}
                </Stack>
              )}
            </CardContent>
          </Card>
        </ThemeProvider>
      </Box>
    </>
  );
};

export default ListHotels;
