import React, { useEffect, useState } from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { Alert, Stack } from "@mui/material";
import { adminServices } from "../../AdminService";
import CollapsibleSidebar from "./Sidebar";
import ReactApexChart from "react-apexcharts";
const SupervisorDashboard = ({ userType }) => {
  const [counts, setCounts] = useState({});
  const [graphData, setGraphData] = useState(null);
  const [hotelData, setHotelData] = useState(null);
  const [reviewData, setReviewData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await adminServices.CountList();
        setCounts(response.data);

      } catch (error) {
        setError(error.message || "An error occurred while fetching data");

      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchGraphData = async () => {
      try {
        const response = await adminServices.HotelBookingGraph();
        setGraphData(response.data);

      } catch (error) {
        setError(
          error.message || "An error occurred while fetching graph data"
        );

      }
    };

    fetchGraphData();
  }, []);

  useEffect(() => {
    const fetchHotelData = async () => {
      try {
        const response = await adminServices.CountListHotels();
        setHotelData(response.data);

      } catch (error) {
        setError(error.message || "An error occurred while fetching data");

      }
    };

    fetchHotelData();
  }, []);

  useEffect(() => {
    const fetchHotelRating = async () => {
      try {
        const response = await adminServices.HotelReviewGraph();
        setReviewData(response.data);

      } catch (error) {
        setError(error.message || "An error occurred while fetching data");

      }
    };

    fetchHotelRating();
  }, []);

  const pieChartData = hotelData
    ? [
        { name: "Active", value: hotelData.active_hotels, color: "#0335fc" },
        {
          name: "Inactive",
          value: hotelData.inactive_hotels,
          color: "#7893e3",
        },
        {
          name: "Rejected",
          value: hotelData.rejected_hotels,
          color: "#78d1e3",
        },
        {
          name: "Suspended",
          value: hotelData.suspended_hotels,
          color: "#78bfe3",
        },
        { name: "Deleted", value: hotelData.deleted_hotels, color: "#7e78e3" },
      ]
    : [];

  const chartData = graphData
    ? graphData.map((item) => ({
        name: item.hotel_name,
        booking_count: item.booking_count,
      }))
    : [];

  const donutChartOptions = {
    labels: pieChartData.map((entry) => entry.name),
    colors: pieChartData.map((entry) => entry.color || "#8884d8"),
    plotOptions: {
      pie: {
        donut: {
          size: "60%",
        },
      },
    },
  };

  const barChartOptions = {
    xaxis: {
      categories: chartData.map((item) => item.name),
    },
    plotOptions: {
      bar: {
        columnWidth: "10%",
      },
    },
  };


  return (
    <>
      <CollapsibleSidebar />
      <Box display="flex" flexWrap="wrap" m={2}>
        {error && (
          <Alert
            severity="info"
            sx={{
              justifyContent: "center",
              alignItems: "center",
              textAlign: "center",
              width: "100%",
              margin: "0",
            }}
            data-testid="backend-error-message"
          >
            {error}
          </Alert>
        )}
        {counts && (
          <Box display="flex" width="100%" height="50%">
            {Object.keys(counts).map((key) => (
              <Card
                key={key}
                sx={{
                  margin: "20px",
                  width: userType === "admin" ? "20%" : "25%",
                  height: "100%",
                  border: "1px solid #ccc",
                  transition: "transform 0.2s",
                }}
              >
                <CardContent>
                  <Typography variant="h6" component="div" color="black">
                    {key.replace("_count", "").charAt(0).toUpperCase() +
                      key.replace("_count", "").slice(1)}
                  </Typography>
                  <Typography variant="h2" component="div" color="#063970">
                    {counts[key]}
                  </Typography>
                </CardContent>
              </Card>
            ))}
          </Box>
        )}

        {graphData && (
          <Box
            width="100%"
            display="flex"
            flexDirection="row"
            justifyContent="space-between"
            marginTop="4%"
            p={2}
          >
            <Stack direction="row" spacing={2} sx={{ width: "100%" }}>
              <Card
                sx={{
                  width: "40%",
                  border: "1px solid #ccc",
                  transition: "transform 0.2s",
                }}
              >
                <CardContent>
                  <Typography
                    variant="h5"
                    data-testid="test1"
                    component="div"
                    color="#063970"
                    textAlign="center"
                    marginBottom="20px"
                  >
                    Hotel Booking Graph
                  </Typography>
                  <ReactApexChart
                    type="bar"
                    options={{
                      ...barChartOptions,
                      chart: {
                        context: {},
                        toolbar: {
                          show: false,
                        },
                      },
                    }}
                    series={[
                      { data: chartData.map((item) => item.booking_count) },
                    ]}
                  />
                </CardContent>
              </Card>

              {hotelData && (
                <Card
                  sx={{
                    width: "40%",
                    border: "1px solid #ccc",
                    transition: "transform 0.2s",
                  }}
                >
                  <CardContent>
                    <Typography
                      variant="h5"
                      component="div"
                      color="#063970"
                      textAlign="center"
                      marginBottom="20px"
                    >
                      Hotel Status Chart
                    </Typography>
                    <ReactApexChart
                      type="donut"
                      options={donutChartOptions}
                      series={pieChartData.map((entry) => entry.value)}
                    />
                  </CardContent>
                </Card>
              )}

              {reviewData && (
                <Card
                  sx={{
                    width: "40%",
                    border: "1px solid #ccc",
                    transition: "transform 0.2s",
                  }}
                >
                  <CardContent>
                    <Typography
                      variant="h5"
                      component="div"
                      color="#063970"
                      textAlign="center"
                      marginBottom="20px"
                    >
                      Hotel Rating Graph
                    </Typography>
                    <ReactApexChart
                      type="bar"
                      options={{
                        xaxis: {
                          categories: reviewData.map((item) => item.hotel_name),
                        },
                        plotOptions: {
                          bar: {
                            columnWidth: "10%",
                          },
                        },
                        chart: {
                          context: {},
                          toolbar: {
                            show: false,
                          },
                        },
                      }}
                      series={[
                        {
                          name: "Average Rating",
                          data: reviewData.map(
                            (item) => item.average_rating || 0
                          ),
                        },
                      ]}
                    />
                  </CardContent>
                </Card>
              )}
            </Stack>
          </Box>
        )}
      </Box>
    </>
  );
};

export default SupervisorDashboard;
