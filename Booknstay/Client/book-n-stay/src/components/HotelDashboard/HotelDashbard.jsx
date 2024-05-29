import React, { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import { Card, CardContent, Typography } from "@mui/material";
import CardMedia from "@mui/material/CardMedia";
import Divider from "@mui/material/Divider";
import Button from "@mui/material/Button";
import Avatar from "@mui/material/Avatar";
import { useNavigate, Link } from "react-router-dom";
import CollapsibleSidebar from "../Sidebar/Sidebar";
import { hotelService } from "../../HotelService";
import ApexChart from "react-apexcharts";
import Grid from "@mui/material/Grid";
import Rating from "@mui/material/Rating";
import Stack from "@mui/material/Stack";
import SingleBedOutlinedIcon from "@mui/icons-material/SingleBedOutlined";
import BookmarkAddedOutlinedIcon from "@mui/icons-material/BookmarkAddedOutlined";
import RoomServiceIcon from "@mui/icons-material/RoomService";
import PaymentIcon from "@mui/icons-material/Payment";
import TextField from "@mui/material/TextField";
const HotelDashboard = () => {
  const [hotelData, setHotelData] = useState("");
  const [todayBookingsCount, setTodayBookingsCount] = useState(0);
  const [cashPercentage, setCashPercentage] = useState(0.0);
  const [recentReviews, setRecentReviews] = useState([]);
  const [roomCount, setRoomCount] = useState();
  const [servicesCount, setServicesCount] = useState();
  const [bookingCounts, setBookingCounts] = useState([]);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [showGraph, setShowGraph] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    fetchHotelProfileDetails();
    fetchTodayBookingCount();
    fetchPaymentPercentage();
    fetchRecentReviews();
    fetchRoomServicesCount();
    fetchSelectedWeekBookings(startDate, endDate);
  }, []);

  const fetchHotelProfileDetails = async () => {
    try {
      const response = await hotelService.GetHotelDetails();
      const baseURL = process.env.REACT_APP_URL;
      const image = `${baseURL}${response.data.image}`;
      setHotelData({
        hotel_name: response.data.hotel_name || "",
        phone_number: response.data.phone_number || "",
        address: response.data.address || "",
        city: response.data.city || "",
        district: response.data.district || "",
        state: response.data.state || "",
        pincode: response.data.pincode || "",
        service_charge: response.data.service_charge || "",
        description: response.data.description || "",
        location_link: response.data.location_link || "",
        license_number: response.data.license_number || "",
        email: response.data.email || "",
        image: image || "",
      });
    } catch (error) {
      console.log(error);
    }
  };

  const fetchTodayBookingCount = async () => {
    try {
      const response = await hotelService.GettodayHotelDetails();
      setTodayBookingsCount(response.data.today_bookings_count);
    } catch (error) {
      console.log(error);
    }
  };

  const fetchPaymentPercentage = async () => {
    try {
      const response = await hotelService.GetPayementPercentage();
      setCashPercentage(response.data.cash_percentage);
    } catch (error) {
      console.log(error);
    }
  };

  const fetchRecentReviews = async () => {
    try {
      const response = await hotelService.RecentReview();
      setRecentReviews(response.data);
    } catch (error) {
      console.error("Error fetching recent reviews:", error);
    }
  };

  const fetchRoomServicesCount = async () => {
    try {
      const response = await hotelService.RoomAndServicesCount();
      setRoomCount(response.data.room_count);
      setServicesCount(response.data.service_count);
    } catch (error) {
      console.log("Error");
    }
  };

  const handleEditProfile = () => {
    navigate(`/edit-hotel-details`);
  };

  const getInitials = (name) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("");
  };

  useEffect(() => {
    const currentDate = new Date();
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    const endOfWeek = new Date(currentDate);
    endOfWeek.setDate(endOfWeek.getDate() + (6 - endOfWeek.getDay()));

    setStartDate(startOfWeek);
    setEndDate(endOfWeek);

    fetchSelectedWeekBookings(startOfWeek, endOfWeek);
  }, []);

  const fetchSelectedWeekBookings = async (start, end) => {
    try {
      const formattedStartDate = start.toISOString().split("T")[0];
      const formattedEndDate = end.toISOString().split("T")[0];

      const response = await hotelService.GetSelectedWeekBookings(
        formattedStartDate,
        formattedEndDate
      );
      setBookingCounts(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  const days = bookingCounts.map((item) => item.day_of_week);
  const counts = bookingCounts.map((item) => item.count);
  const options = {
    chart: {
      id: "booking-chart",
      toolbar: {
        show: false,
      },

      type: "bar",
      height: 350,
    },
    xaxis: {
      categories: days,
    },
   
  };

  const series = [
    {
      name: "Bookings",
      data: counts,
    },
  ];
  const handleStartDateChange = (date) => {
    setStartDate(date);
    const endDateDefault = new Date(date.getTime() + 6 * 24 * 60 * 60 * 1000);
    setEndDate(endDateDefault);
    fetchSelectedWeekBookings(date, endDateDefault);
  };


  useEffect(() => {
    setShowGraph(true);
  }, [bookingCounts]);

  return (
    <>
      <CollapsibleSidebar />
      <Box display="flex" sx={{ backgroundColor: "#F8F8F8" }}>
        <Box sx={{ width: "35%", mt: "2%", ml: "2%" }}>
          <Card
            sx={{
              width: "100%",
              height: "82vh",
            }}
            data-testid="profile-card"
          >
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                width: "90%",
                height: "94%",
                alignItems: "center",
                ml: "5%",
                mt: "5%",
              }}
            >
              {hotelData.image ? (
                <CardMedia
                  component="img"
                  sx={{
                    width: "30vh",
                    height: "30vh",
                    borderRadius: "50%",
                    mt: "3%",
                  }}
                  image={hotelData.image}
                  alt="Hotel image"
                />
              ) : (
                <Avatar sx={{ width: "30vh", height: "30vh", mt: "3%" }} />
              )}
              <Box sx={{ mt: "4%", width: "95%", height: "36%" }}>
                <Typography
                  variant="h5"
                  align="center"
                  sx={{ fontWeight: "bold" }}
                >
                  {hotelData.hotel_name}
                </Typography>
                <Typography
                  variant="h5"
                  align="center"
                  sx={{ fontWeight: "bold", color: "grey", fontSize: "small" }}
                >
                  {hotelData.address}
                </Typography>
                <Typography
                  variant="h5"
                  align="center"
                  sx={{ fontSize: "small", color: "grey", mt: "1%" }}
                >
                  {hotelData.city} | {hotelData.district} | {hotelData.state}
                </Typography>

                <Divider
                  orientation="horizontal"
                  variant="middle"
                  flexItem
                  sx={{ mt: "4%", backgroundColor: "#999999" }}
                />

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Typography
                    variant="h5"
                    sx={{
                      color: "grey",
                      mt: "5%",
                      ml: "5%",
                      fontSize: "small",
                    }}
                  >
                    Email
                  </Typography>
                  <Typography
                    variant="h5"
                    sx={{
                      color: "grey",
                      mt: "5%",
                      mr: "5%",
                      fontSize: "small",
                    }}
                  >
                    {hotelData.email}
                  </Typography>
                </Box>

                <Divider
                  orientation="horizontal"
                  variant="middle"
                  flexItem
                  sx={{ mt: "1%", backgroundColor: "#999999" }}
                />

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Typography
                    variant="h5"
                    sx={{
                      color: "grey",
                      mt: "5%",
                      ml: "5%",
                      fontSize: "small",
                    }}
                  >
                    Phone
                  </Typography>
                  <Typography
                    variant="h5"
                    sx={{
                      color: "grey",
                      mt: "5%",
                      mr: "5%",
                      fontSize: "small",
                    }}
                  >
                    {hotelData.phone_number}
                  </Typography>
                </Box>

                <Divider
                  orientation="horizontal"
                  variant="middle"
                  flexItem
                  sx={{ mt: "1%", backgroundColor: "#999999" }}
                />

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Typography
                    variant="h5"
                    sx={{
                      color: "grey",
                      mt: "5%",
                      ml: "5%",
                      fontSize: "small",
                    }}
                  >
                    License Number
                  </Typography>
                  <Typography
                    variant="h5"
                    sx={{
                      color: "grey",
                      mt: "5%",
                      mr: "6%",
                      fontSize: "small",
                    }}
                  >
                    {hotelData.license_number}
                  </Typography>
                </Box>
              </Box>
              <Button
                sx={{ bgcolor: "#358fc9", mt: "13%", mb: "10%", width: "85%" }}
                variant="contained"
                onClick={() => handleEditProfile()}
                data-testid="edit-profile"
              >
                Edit Profile
              </Button>
            </Box>
          </Card>
        </Box>

        <Box sx={{ width: "99%" }}>
          <Grid
            container
            spacing={2}
            direction="row"
            justify="center"
            alignItems="flex-start"
            sx={{ width: "98%", mt: "1%", height: "100%", ml: "1%", mr: "3%" }}
          >
            <Grid item xs={3}>
              <Card data-testid="todaybooking">
                <CardContent align="center">
                  <Stack direction="row" alignItems="center">
                    <Box
                      bgcolor="#E2BFB3"
                      width={50}
                      height={50}
                      mr={1}
                      display="flex"
                      justifyContent="center"
                      alignItems="center"
                    >
                      <BookmarkAddedOutlinedIcon
                        sx={{ color: "white", fontSize: 35 }}
                      />
                    </Box>
                    <Typography
                      variant="h8"
                      style={{ color: "#3f51b5", fontSize: "14px" }}
                    >
                      Today's Bookings
                      <br />
                      <Typography variant="h5" style={{ color: "black" }}>
                        {todayBookingsCount}
                      </Typography>
                    </Typography>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={3}>
              <Card data-testid="roomsCard">
                <CardContent align="center">
                  <Stack direction="row" alignItems="center">
                    <Box
                      bgcolor="#E2BFB3"
                      width={50}
                      height={50}
                      mr={1}
                      display="flex"
                      justifyContent="center"
                      alignItems="center"
                    >
                      <SingleBedOutlinedIcon
                        sx={{ color: "white", fontSize: 35 }}
                      />
                    </Box>
                    <Typography
                      variant="h8"
                      style={{ color: "#3f51b5", fontSize: "14px" }}
                    >
                      Rooms Available
                      <br />
                      <Typography variant="h5" style={{ color: "black" }}>
                        {roomCount}
                      </Typography>
                    </Typography>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={3}>
              <Card data-testid="servicesCard">
                <CardContent align="center">
                  <Stack direction="row" alignItems="center">
                    <Box
                      bgcolor="#E2BFB3"
                      width={50}
                      height={50}
                      mr={1}
                      display="flex"
                      justifyContent="center"
                      alignItems="center"
                    >
                      <RoomServiceIcon sx={{ color: "white", fontSize: 35 }} />
                    </Box>
                    <Typography
                      variant="h8"
                      style={{ color: "#3f51b5", fontSize: "14px" }}
                    >
                      Services <br />
                      <Typography variant="h5" style={{ color: "black" }}>
                        {servicesCount}
                      </Typography>
                    </Typography>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={3}>
              <Card>
                <CardContent align="center">
                  <Stack direction="row" alignItems="center">
                    <Box
                      bgcolor="#E2BFB3"
                      width={50}
                      height={50}
                      mr={1}
                      display="flex"
                      justifyContent="center"
                      alignItems="center"
                    >
                      <PaymentIcon sx={{ color: "white", fontSize: 35 }} />
                    </Box>
                    <Typography
                      variant="h8"
                      style={{ color: "#3f51b5", fontSize: "14px" }}
                    >
                      Pending Payments
                      <br />
                      <Typography variant="h5" style={{ color: "black" }}>
                        {cashPercentage}
                      </Typography>
                    </Typography>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            <Box
              sx={{
                display: "flex",
                flexDirection: "row",
                width: "100%",
                height: "73%",
                mt: "-2%",
              }}
            >
              <Card
                sx={{
                  mt: "1%",
                  ml: "1.5%",
                  width: "50%",
                  position: "relative",
                }}
                data-testid="count"
              >
                <CardContent align="left">
                  <Typography variant="h8" style={{ color: "#3f51b5" }}>
                    Weekly Booking Graph
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <TextField
                      type="date"
                      data-testid="start"
                      value={startDate.toISOString().split("T")[0]}
                      onChange={(e) =>
                        handleStartDateChange(new Date(e.target.value))
                      }
                      sx={{ marginBottom: 1, width: "38%", marginRight: "2%" }}
                    />
                    <TextField
                      type="date"
                      data-testid="end"
                      value={endDate.toISOString().split("T")[0]}
                      sx={{ marginBottom: 1, width: "38%", marginRight: "2%" }}
                      InputProps={{ readOnly: true }}
                    />
                  
                  </Box>

                  {showGraph && (
                    <div>
                      <ApexChart
                        options={options}
                        series={series}
                        type="bar"
                        height={350}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card
                sx={{
                  mt: "1%",
                  ml: "1.2%",
                  width: "50%",
                  maxHeight: "100%",
                  overflow: "auto",
                }}
                data-testid="reviews"
              >
                <CardContent>
                  <Typography variant="h8" style={{ color: "#3f51b5" }}>
                    Recent Reviews
                  </Typography>
                  {recentReviews.map((review, index) => (
                    <Card
                      key={review.id}
                      sx={{
                        mt: "6%",
                        backgroundColor: "#ebebeb",
                        width: "100%",
                      }}
                    >
                      <CardContent>
                        <div style={{ display: "flex", alignItems: "center" }}>
                          <Avatar>{getInitials(review.customer_name)}</Avatar>
                          <div style={{ marginLeft: "10px" }}>
                            <Typography
                              variant="body1"
                              sx={{ fontWeight: "bold" }}
                            >
                              {review.customer_name}
                            </Typography>
                            <Rating
                              name={`rating-${index}`}
                              value={review.rating}
                              readOnly
                              sx={{ color: "#ebab34" }}
                            />
                          </div>
                        </div>
                        <div style={{ marginLeft: "50px" }}>
                          <Typography
                            variant="body1"
                            sx={{ marginTop: "5px", whiteSpace: "pre-wrap" }}
                          >
                            {review.comment}
                          </Typography>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {recentReviews.length > 0 && (
                    <Stack
                      sx={{
                        display: "flex",
                        alignItems: "flex-end",
                        mr: "3%",
                        mt: "6%",
                      }}
                    >
                      <Link to="/list-reviews-by-hotels">View more</Link>
                    </Stack>
                  )}
                </CardContent>
              </Card>
            </Box>
          </Grid>
        </Box>
      </Box>
    </>
  );
};

export default HotelDashboard;
