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
import { createTheme } from "@mui/material/styles";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import "sweetalert2/dist/sweetalert2.min.css";
import Tooltip from "@mui/material/Tooltip";
import { adminServices } from "../../AdminService";
import { axiosPrivate } from "../../interceptor";
import Alert from "@mui/material/Alert";
import CollapsibleSidebar from "../Sidebar/Sidebar";
import DeleteIcon from "@mui/icons-material/Delete";
import InputAdornment from "@mui/material/InputAdornment";
import SearchIcon from "@mui/icons-material/Search";
import { Link } from "react-router-dom";
import { Breadcrumbs, Typography, TextField, Container } from "@mui/material";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Swal from "sweetalert2";
import Loading from "../Loading/Loading";

const defaultTheme = createTheme();

function Supervisor() {
  const [data, setData] = useState([]);
  const [nextPage, setNextPage] = useState("");
  const [previousPage, setPreviousPage] = useState("");
  const [error, setError] = useState("");
  const [supervisorSearchQuery, setSupervisorSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [dialogOpen, setDialogOpen] = useState("");
  const [supervisorID, setSupervisorID] = useState("");
  const [supervisorName, setSupervisorName] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSupervisor();
  }, [supervisorSearchQuery]);

  const fetchSupervisor = async () => {
    try {
      const response = await adminServices.ListSupervisor({ query: supervisorSearchQuery });
      setData(response.data.results);
      setNextPage(response.data.next);
      setPreviousPage(response.data.previous);
      setCurrentPage(1);
      setError("");
    } catch (error) {
      if (error.response) {
        setError(error.response.data.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleNextPage = () => {
    axiosPrivate.get(nextPage).then((response) => {
      setData(response.data.results);
      setNextPage(response.data.next);
      setPreviousPage(response.data.previous);
      setCurrentPage(currentPage + 1);
    });
  };

  const handlePreviousPage = () => {
    axiosPrivate.get(previousPage).then((response) => {
      setData(response.data.results);
      setNextPage(response.data.next);
      setPreviousPage(response.data.previous);
      setCurrentPage(currentPage - 1);
    });
  };

  const handleSearchChange = (e) => {
    setSupervisorSearchQuery(e.target.value);
  }; 

  const handleDeleteSuperVisor = async() => {
    try {
        await adminServices.DeleteSuperVisor(supervisorID);
        setDialogOpen(false);
        Swal.fire({
          position: "top",
          icon: "success",
          title: 'Supervisor deleted successfully',
          showConfirmButton: false,
          timer: 3000,
        });
        fetchSupervisor();
    } catch(error) {
      Swal.fire({
        position: "top",
        icon: "success",
        title: 'Error occured while deleting supervisor',
        showConfirmButton: false,
        timer: 5000,
      });
    }
  };

  const handleDialogOpen = (supervisorId, supervisorName) => {
    setSupervisorID(supervisorId);
    setSupervisorName(supervisorName);
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
  };

  if (loading) {
    return <Loading />;
  }

  const noSupervisor = (
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
        <img alt='No data found' src='http://localhost:3000/No_data.png' height= '40%' width='40%' />
        <Typography variant="h5" color="textSecondary" gutterBottom>
          <br></br>No Supervisors added !
        </Typography>
        <Typography variant="h8" color="textSecondary" gutterBottom>
          <br></br>No supervisors are added to BooknStay. Please add a supervisor.<br/>
        </Typography>
        <Button
          data-testid="add"
          variant="contained"
          sx={{ bgcolor: "green", mb: '3%' }}
          component={Link}
          to='/add-supervisor'
        >
          Add Supervisor
        </Button>
        <Button component={Link} to="/supervisor-dashboard" color="primary">
          Go back
        </Button>
      </Box>
    </Container>
  )

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
        

        {data.length === 0 &&
          <>
            {noSupervisor}
          </>
        }

        {data.length > 0 && (
          <>
            <Breadcrumbs
              separator={<NavigateNextIcon fontSize="small" />}
              aria-label="breadcrumb"
              sx={{ mt: 2 }}
            >
              <Link to="/supervisor-dashboard">Home</Link>
              <Typography color="textPrimary">List Supervisors</Typography>
            </Breadcrumbs>

            <Card sx={{ minWidth: 750, marginTop: "3%", width: "75%" }} data-testid="card" >
              <CardHeader title="Supervisor Details" />
              <CardContent>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={16} sx={{ ml: '5%', mt: 1 }} data-testid="stack" >
                  <TextField
                    autoComplete="given-name"
                    name="Room Type"
                    id="firstName"
                    label="Search"
                    autoFocus
                    size="small"
                    value={supervisorSearchQuery}
                    onChange={handleSearchChange}
                    data-testid="search"
                    sx={{
                      mb: 2,
                      mt: 2,
                      ml: 1,
                      width: { sm: "70%", md: "60%" },
                    }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon color="action.active" />
                        </InputAdornment>
                      ),
                    }}
                  />
                  <Button variant="contained" color="success" sx={{ width: { sm: "25%", md: "20%" }, padding: 0 }} component={Link} to="/add-supervisor" >
                    Add Supervisor
                  </Button>
                </Stack>

                {error && data.length > 0 && (
                  <Alert severity="info" sx={{ mt: 5, ml: 6.5, mr: 1, width: "90%" }}>
                    {error}
                  </Alert>
                )}

                {!error && (
                  <>
                    <TableContainer component={Paper} sx={{ maxWidth: { sm: "90%", md: "90%" }, mx: "auto", mt: 2 }} >
                      <Table sx={{ minWidth: 300 }} aria-label="simple table" data-testid="table" >
                        <TableHead sx={{ bgcolor: '#B4B4B8' }}>
                          <TableRow>
                            <TableCell align="center" sx={{ color: "#272829", fontWeight: "bold" }} > SI. No </TableCell>
                            <TableCell align="center" sx={{ color: "#272829", fontWeight: "bold" }} > Name </TableCell>
                            <TableCell align="center" sx={{ color: "#272829", fontWeight: "bold" }} > Email </TableCell>
                            <TableCell align="center" sx={{ color: "#272829", fontWeight: "bold" }} > Status </TableCell>
                            <TableCell align="center" sx={{ color: "#272829", fontWeight: "bold" }} > Delete </TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {data.map((row, index) => (
                            <TableRow key={row.index} sx={{ "&:last-child td, &:last-child th": { border: 0 } }} >
                              <TableCell align="center">{index + 1}</TableCell>
                              <TableCell align="center">{row.first_name}</TableCell>
                              <TableCell align="center">{row.email}</TableCell>
                              <TableCell align="center">{row.status}</TableCell>
                              <TableCell align="center">
                                {" "}
                                <Tooltip title="Delete SuperVisor" arrow>
                                  <IconButton
                                    color="error"
                                    aria-label="delete"
                                    onClick={() => handleDialogOpen(row.id, row.first_name)}
                                    sx={{
                                      "& .MuiSvgIcon-root": { fontSize: "1rem" },
                                    }}
                                  >
                                    <DeleteIcon sx={{ color: '#272829' }} data-testid='delete' />
                                  </IconButton>
                                </Tooltip>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                    <Stack sx={{ mt: 2, ml: '73%' }} direction="row" data-testid='navigate-stack'>
                      {previousPage ? (
                        <Button data-testid="previous" onClick={handlePreviousPage}>Previous</Button>
                      ) : (
                        <Button data-testid="previous" disabled>Previous</Button>
                      )}
                      <Button data-testid="page">{currentPage}</Button>
                      {nextPage ? (
                        <Button data-testid="next" onClick={handleNextPage}>Next</Button>
                      ) : (
                        <Button data-testid="next" disabled>Next</Button>
                      )}
                    </Stack>
                  </>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </Box>

      {/* dialog for deleting supervisor */}
      <Dialog open={dialogOpen} onClose={handleDialogClose} data-testid="dialog" >
        <DialogTitle>Delete Account</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete {supervisorName}'s account? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button variant="contained" style={{ backgroundColor: "#C0C0C0", color: 'black' }} onClick={handleDialogClose} data-testid="cancelbutton" >
            Cancel
          </Button>
          <Button onClick={handleDeleteSuperVisor} color="error" variant="contained" data-testid="deletebutton" >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default Supervisor;
