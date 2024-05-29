import * as React from "react";
import { useState, useEffect } from "react";
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
import Button from "@mui/material/Button";
import InputAdornment from "@mui/material/InputAdornment";
import MeetingRoomIcon from "@mui/icons-material/MeetingRoom";
import Stack from "@mui/material/Stack";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";
import SearchIcon from "@mui/icons-material/Search";
import { adminServices } from "../../AdminService";
import { axiosPrivate } from "../../interceptor";
import Alert from "@mui/material/Alert";
import CollapsibleSidebar from "../Sidebar/Sidebar";
import { Breadcrumbs, Typography, TextField } from "@mui/material";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import { Link } from "react-router-dom";
import { validators } from "../../Validations";
import CircularProgress from "@mui/material/CircularProgress";

function RoomType() {
  const [formData, setFormData] = useState({ room_type: "" });
  const [data, setData] = useState([]);
  const [nextType, setNextType] = useState("");
  const [previousType, setPreviousType] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState("");
  const [roomTypeError, setRoomTypeError] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(false);

  const handleRoomType = (e) => {
    const inputValue = e.target.value;
    setFormData((prevData) => ({
      ...prevData,
      room_type: inputValue,
    }));

    const roomTypeValidations = validators.validateRoomType(inputValue);
    setRoomTypeError(roomTypeValidations);
  };

  useEffect(() => {
    fetchRoomType();
  }, [searchQuery]);

  useEffect(() => {
    fetchRoomType();
  }, []);

  const fetchRoomType = async () => {
    try {
      const response = await adminServices.ListRoomType({ query: searchQuery });
      setData(response.data.results);
      setNextType(response.data.next);
      setPreviousType(response.data.previous);
      setCurrentPage(1);
      setError("");
    } catch (error) {
      if (error.response) {
        setError(error.response.data.message);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);

      await adminServices.AddRoomType({
        room_type: formData.room_type,
      });

      const successMessage = "Room type added successfully";
      Swal.fire({
        position: "top",
        icon: "success",
        title: successMessage,
        showConfirmButton: false,
        timer: 5000,
      });

      setError("");
      setFormData({ room_type: "" });
      fetchRoomType();
    } catch (error) {
      Swal.fire({
        position: "top",
        icon: "error",
        title: "Room type adding failed",
        showConfirmButton: false,
        timer: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    axiosPrivate.get(nextType).then((response) => {
      setData(response.data.results);
      setNextType(response.data.next);
      setPreviousType(response.data.previous);
      setCurrentPage(currentPage + 1);
    });
  };

  const handlePrevious = () => {
    axiosPrivate.get(previousType).then((response) => {
      setData(response.data.results);
      setNextType(response.data.next);
      setPreviousType(response.data.previous);
      setCurrentPage(currentPage - 1);
    });
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
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
          sx={{ mt: 2 }}
        >
          <Link to="/supervisor-dashboard">Home</Link>
          <Typography color="textPrimary">Add Room Type</Typography>
        </Breadcrumbs>
        <Card sx={{ width: "70%", marginTop: "3%" }}>
          <CardHeader title="Room Type" />
          <CardContent>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={"10.5%"}
              sx={{ ml: "4%" }}
              data-testid="stack"
            >
              <TextField
                autoComplete="given-name"
                name="Room Type"
                required
                id="firstName"
                label="Room Type"
                data-testid="roomtype"
                value={formData.room_type}
                autoFocus
                size="small"
                sx={{
                  width: { sm: "75%", md: "60%" },
                }}
                onChange={handleRoomType}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <MeetingRoomIcon color="action.active" />
                    </InputAdornment>
                  ),
                }}
              />

              <Button
                variant="contained"
                color="success"
                data-testid="button"
                onClick={handleSubmit}
                sx={{
                  width: { sm: "25%", md: "25%" },
                  padding: 0,
                }}
              >
                Add Room Type
              </Button>
              {loading && (
                <CircularProgress
                  size={24}
                  style={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    zIndex: 9999,
                    color: "inherit",
                  }}
                />
              )}
            </Stack>
            {roomTypeError && (
              <Typography variant="body2" color="error" sx={{ ml: "4%" }}>
                {roomTypeError}
              </Typography>
            )}

            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={2}
              sx={{ ml: "4%", mt: 2 }}
            >
              <TextField
                autoComplete="given-name"
                name="Room Type"
                id="firstName"
                label="Search"
                autoFocus
                size="small"
                value={searchQuery}
                onChange={handleSearchChange}
                sx={{ width: { sm: "100%", md: "95.8%" } }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon color="action.active" />
                    </InputAdornment>
                  ),
                }}
              />
            </Stack>

            {error && (
              <Alert severity="info" sx={{ mt: 3, ml: "4%", width: "92%" }}>
                {error}
              </Alert>
            )}
            {!error && (
              <>
                <TableContainer
                  component={Paper}
                  sx={{ maxWidth: { sm: "90%", md: "92%" }, mx: "auto", mt: 2 }}
                >
                  <Table
                    width="90%"
                    aria-label="simple table"
                    data-testid="table"
                  >
                    <TableHead sx={{ bgcolor: "#B4B4B8" }}>
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
                          Room Type
                        </TableCell>
                        <TableCell
                          align="center"
                          sx={{ color: "#272829", fontWeight: "bold" }}
                        >
                          Created at
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {data.map((row, index) => (
                        <TableRow
                          key={row.index}
                          sx={{
                            "&:last-child td, &:last-child th": { border: 0 },
                          }}
                        >
                          <TableCell align="center">{index + 1}</TableCell>
                          <TableCell align="center">{row.room_type}</TableCell>
                          <TableCell align="center">{row.created_at}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                <Stack
                  sx={{ mt: 2, ml: "72%" }}
                  direction="row"
                  data-testid="navigate-stack"
                >
                  {previousType ? (
                    <Button data-testid="previous" onClick={handlePrevious}>
                      Previous
                    </Button>
                  ) : (
                    <Button data-testid="previous" disabled>
                      Previous
                    </Button>
                  )}
                  <Button data-testid="page">{currentPage}</Button>
                  {nextType ? (
                    <Button data-testid="next" onClick={handleNext}>
                      Next
                    </Button>
                  ) : (
                    <Button data-testid="next" disabled>
                      Next
                    </Button>
                  )}
                </Stack>
              </>
            )}
          </CardContent>
        </Card>
      </Box>
    </>
  );
}

export default RoomType;
