import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardHeader from "@mui/material/CardHeader";
import { createTheme } from "@mui/material/styles";
import {
  TextField,
  Menu,
  MenuItem,
  Button,
  Breadcrumbs,
  Typography,
} from "@mui/material";
import Stack from "@mui/material/Stack";
import { userService } from "../../UserService";
import { axiosPrivate } from "../../interceptor";
import Alert from "@mui/material/Alert";
import Select from "@mui/material/Select";
import CollapsibleSidebar from "../Sidebar/Sidebar";
import NoDataFound from "../ListReviewsByHotels/NoDataFound";
import Loading from "../Loading/Loading";

const defaultTheme = createTheme();

const ListCustomer = () => {
  const navigate = useNavigate();

  const [data, setData] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [next, setNext] = useState("");
  const [previous, setPrevious] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState("");
  const [customerAnchorElMap, setCustomerAnchorElMap] = useState({});
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (filter) {
      userService
        .FetchUserByStatus(filter)
        .then((response) => {
          setData(response.data.results);
          setNext(response.data.next);
          setPrevious(response.data.previous);
          setErrorMessage("");
        })
        .catch((error) => {
          setErrorMessage(error.response.data.message);
          setData([]);
        });
    } else {
      fetchCustomerData();
    }
  }, [searchQuery, filter]);

  const fetchCustomerData = async () => {
    try {
      const response = await userService.FetchUser({ query: searchQuery });
      setData(response.data.results);
      setNext(response.data.next);
      setPrevious(response.data.previous);
      setCurrentPage(1);
      setErrorMessage("");
    } catch (error) {
      if (error.response?.data) {
        setErrorMessage(error.response.data.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    axiosPrivate.get(next).then((response) => {
      setData(response.data.results);
      setNext(response.data.next);
      setPrevious(response.data.previous);
      setCurrentPage(currentPage + 1);
    });
  };

  const handleChange = (e) => {
    setFilter(e.target.value);
    setSearchQuery("");
  };

  const handleSuspend = (id) => {
    navigate(`/suspend-customer/${id}`);
  };

  const handleDelete = async (id) => {
    navigate(`/delete-customer/${id}`);
  };

  const handleActivate = async (id) => {
    navigate(`/activate-customer/${id}`);
  };

  const handlePrevious = () => {
    axiosPrivate.get(previous).then((response) => {
      setData(response.data.results);
      setNext(response.data.next);
      setPrevious(response.data.previous);
      setCurrentPage(currentPage - 1);
    });
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setFilter("");
  };

  const handleClick = (event, customer) => {
    setCustomerAnchorElMap({
      ...customerAnchorElMap,
      [customer.id]: event.currentTarget,
    });

  };

  const handleClose = (customer_id) => {
    setCustomerAnchorElMap({
      ...customerAnchorElMap,
      [customer_id]: null,
    });
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
            sx={{ mt: 2 }}
          >
            <Link to="/supervisor-dashboard">Home</Link>
            <Typography color="textPrimary">Customer Details</Typography>
          </Breadcrumbs>

          <Card sx={{ minWidth: 1000, marginTop: "3%", width: "90%"}}>
            <CardHeader title="Customer Details" />
            <CardContent>
              <Stack direction="row" spacing={2} sx={{ ml: 4.2 }}>
                <TextField
                  id="Search"
                  name="search"
                  label="Search"
                  autoFocus
                  size="small"
                  sx={{ mb: 2, ml: 21, width: { sm: 750 } }}
                  value={searchQuery}
                  onChange={handleSearchChange}
                />
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
                    <em>--Select Customer Status--</em>
                  </MenuItem>
                  <MenuItem value="active" data-testid="active-option">
                    Active
                  </MenuItem>
                  <MenuItem value="inactive" data-testid="inactive-option">
                    Inactive
                  </MenuItem>
                  <MenuItem value="suspended">Suspended</MenuItem>
                  <MenuItem value="deleted">Deleted</MenuItem>
                </Select>
              </Stack>
              {errorMessage && data.length > 0 &&  (
                <Alert
                  severity="info"
                  sx={{ mt: 3, ml: 4, mr: 1, width: "95%" }}
                >
                  {errorMessage}
                </Alert>
              )}
              {data.length === 0 &&
              <NoDataFound/>}
              {!errorMessage && (
                <TableContainer
                  component={Paper}
                  sx={{ maxWidth: "95%", mx: "auto", mt: 2 }}
                >
                  <Table sx={{ minWidth: 300 }} aria-label="simple table">
                    <TableHead sx={{ bgcolor: '#B4B4B8'}}>
                      <TableRow>
                        <TableCell align="center" sx={{ color: "#272829", fontWeight: "bold" }} > SI. No </TableCell>
                        <TableCell align="center" sx={{ color: "#272829", fontWeight: "bold" }} > First Name </TableCell>
                        <TableCell align="center" sx={{ color: "#272829", fontWeight: "bold" }} > Last Name </TableCell>
                        <TableCell align="center" sx={{ color: "#272829", fontWeight: "bold" }} > Email </TableCell>
                        <TableCell align="center" sx={{ color: "#272829", fontWeight: "bold" }} > Phone Number </TableCell>
                        <TableCell align="center" sx={{ color: "#272829", fontWeight: "bold" }} > Date Joined </TableCell>
                        <TableCell align="center" sx={{ color: "#272829", fontWeight: "bold" }} > Status </TableCell>
                        <TableCell align="center" sx={{ color: "#272829", fontWeight: "bold" }} > Updated On </TableCell>
                        <TableCell align="center" sx={{ color: "#272829", fontWeight: "bold" }} > Deleted On </TableCell>
                        <TableCell align="center" sx={{ color: "#272829", fontWeight: "bold" }} > Action </TableCell>
                      </TableRow>
                    </TableHead>

                    <TableBody>
                      {data &&
                        data.map((customer, index) => (
                          <TableRow key={customer.index} sx={{ "&:last-child td, &:last-child th": { border: 0 } }} >
                            <TableCell align="center"> {index + 1} </TableCell>
                            <TableCell align="center"> {customer.first_name} </TableCell>
                            <TableCell align="center"> {customer.last_name} </TableCell>
                            <TableCell align="center" data-testid="email"> {customer.email} </TableCell>
                            <TableCell align="center"> {customer.phone_number} </TableCell>
                            <TableCell align="center"> {customer.date_joined} </TableCell>
                            <TableCell align="center"> {customer.status} </TableCell>
                            <TableCell align="center"> {customer.updated_on} </TableCell>
                            <TableCell align="center"> {customer.deleted_on} </TableCell>
                            <TableCell align="center">
                              {(customer.status !== "deleted" && customer.status !== "inactive") && (
                                <>
                                  <MoreVertIcon
                                    style={{
                                      fontSize: "20px",
                                      cursor: "pointer",
                                    }}
                                    data-testid='more-icon'
                                    onClick={(e) => handleClick(e, customer)}
                                  />
                                  <Menu
                                    id={`simple-menu-${customer.id}`}
                                    anchorEl={customerAnchorElMap[customer.id]}
                                    open={Boolean(
                                      customerAnchorElMap[customer.id]
                                    )}
                                    onClose={() => handleClose(customer.id)}
                                  >
                                    {customer.status === "suspended" && (
                                      <>
                                         <MenuItem
                                          onClick={() =>
                                            handleActivate(customer.id)
                                          }
                                          data-testid="activate"
                                        >
                                          Activate
                                        </MenuItem>                                
                                         <MenuItem
                                          onClick={() =>
                                            handleDelete(customer.id)
                                          }
                                          data-testid="delete"
                                        >
                                          Delete
                                        </MenuItem>                               
                                      </>
                                    )}
                                    {customer.status === "active" && (
                                      <>
                                        <MenuItem
                                          onClick={() =>
                                            handleSuspend(customer.id)
                                          }
                                          data-testid="suspend"
                                        >
                                          Suspend
                                        </MenuItem>
                                        <MenuItem
                                          onClick={() =>
                                            handleDelete(customer.id)
                                          }
                                          data-testid="delete"
                                        >
                                          Delete
                                        </MenuItem>
                                      </>
                                    )}
                                  </Menu>
                                </>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
              {!errorMessage && (
                <Stack sx={{ mt: 2, ml: '79%' }} direction="row" data-testid='navigate-stack'>
                  {previous ? (
                      <Button data-testid="previous" onClick={handlePrevious}>Previous</Button>
                  ) : (
                      <Button data-testid="previous" disabled>Previous</Button>
                  )}
                  <Button data-testid="page">{currentPage}</Button>
                  {next ? (
                      <Button data-testid="next" onClick={handleNext}>Next</Button>
                  ) : (
                      <Button data-testid="next" disabled>Next</Button>
                  )}
                </Stack>
              )}
            </CardContent>
          </Card>
      </Box>
    </>
  );
};

export default ListCustomer;
