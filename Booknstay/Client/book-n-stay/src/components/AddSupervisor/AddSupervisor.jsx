import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import Container from '@mui/material/Container';
import CssBaseline from '@mui/material/CssBaseline';
import Avatar from '@mui/material/Avatar';
import TextField from '@mui/material/TextField';
import PersonIcon from '@mui/icons-material/Person';
import InputAdornment from '@mui/material/InputAdornment';
import Button from '@mui/material/Button';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import IconButton from '@mui/material/IconButton';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import CollapsibleSidebar from '../Sidebar/Sidebar';
import SupervisorAccountOutlinedIcon from '@mui/icons-material/SupervisorAccountOutlined';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';
import { adminServices } from '../../AdminService';
import { useNavigate,Link } from 'react-router-dom';
import { validators } from '../../Validations';
import { Breadcrumbs, Typography } from "@mui/material";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import CircularProgress from '@mui/material/CircularProgress';
import Backdrop from '@mui/material/Backdrop';
const defaultTheme = createTheme();

function AddSupervisor() {
  const [formData, setFormData] = useState({
    first_name: "",
    email: "",
    password: "",
  });
  const [formValid, setFormValid] = useState(false);
  const [firstNameError, setFirstNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [openBackdrop, setOpenBackdrop] = useState(false); 

  const navigate = useNavigate("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setOpenBackdrop(true);

    try {
      await adminServices.CreateSupervisor({
        first_name: formData.first_name,
        email: formData.email,
        password: formData.password,
      });

      const successMessage = "Supervisor created successfully";
      Swal.fire({
        position: "top",
        icon: "success",
        title: successMessage,
        showConfirmButton: false,
        timer: 3000,
      });

      navigate("/list-supervisor");
    } catch (error) {
      const errorMessage = error.response.data.message;
      Swal.fire({
        position: "top",
        icon: "error",
        title: errorMessage,
        showConfirmButton: false,
        timer: 3000,
      });
    } finally {
      setOpenBackdrop(false);
    }
  };


  const checkFormValidity = () => {
    setFormValid(
      formData.first_name.trim() !== "" &&
        formData.email.trim() !== "" &&
        formData.password.trim() !== ""
    );
  };

  const handleFirstNameChange = (e) => {
    const inputValue = e.target.value;
    setFormData((prevData) => ({
      ...prevData,
      first_name: inputValue,
    }));

    const nameValidation = validators.validateName(inputValue);
    setFirstNameError(nameValidation);

    checkFormValidity();
  };

  const handleEmailChange = (e) => {
    const inputValue = e.target.value;
    setFormData((prevData) => ({
      ...prevData,
      email: inputValue,
    }));

    const emailValidation = validators.validateEmail(inputValue);
    setEmailError(emailValidation);

    checkFormValidity();
  };

  const handlePasswordChange = (e) => {
    const inputValue = e.target.value;
    setFormData((prevData) => ({
      ...prevData,
      password: inputValue,
    }));

    const passwordValidation = validators.validatePassword(inputValue);
    setPasswordError(passwordValidation);

    checkFormValidity();
  };

  useEffect(() => {
    checkFormValidity();
  }, [formData.first_name, formData.email, formData.password]);

  return (
    <>
      <CollapsibleSidebar />
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "90vh",
          width: "100%",
          backgroundColor: "#F8F8F8",
        }}
      >
          <Breadcrumbs
            separator={<NavigateNextIcon fontSize="small" />}
            aria-label="breadcrumb"
            sx={{ marginBottom: 2, marginLeft: 2}}
          >
            <Link to="/sidebar">Home</Link>
            <Link to="/list-supervisor">List Supervisor</Link>
            <Typography color="textPrimary">Add Supervisor</Typography>
          </Breadcrumbs>

        <ThemeProvider theme={defaultTheme}>
          <CssBaseline />
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              p: 3,
              boxShadow: 3,
              borderRadius: "3px",
              bgcolor: "background.paper",
              mt: '4%'
            }}
          >
            <Container component="main" maxWidth="xs">
              <CssBaseline />
              <Box
                sx={{
                  backgroundColor: "white",
                  padding: "16px",
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  flexDirection: "column",
                }}
              >
                <Avatar sx={{ m: 1, bgcolor: "primary.main" }}>
                  <SupervisorAccountOutlinedIcon />
                </Avatar>
                <Typography component="h1" variant="h5">
                  Create Supervisor
                </Typography>

                <Box
                  component="form"
                  noValidate
                  sx={{ mt: 3 }}
                  data-testid="form-submit"
                  onSubmit={handleSubmit}
                >
                  <TextField
                    autoComplete="given-name"
                    name="firstName"
                    required
                    fullWidth
                    id="firstName"
                    label="Name"
                    value={formData.first_name}
                    autoFocus
                    onChange={handleFirstNameChange}
                    sx={{ mb: 2 }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PersonIcon color="action.active" />
                        </InputAdornment>
                      ),
                    }}
                  />
                  {firstNameError && (
                    <Typography
                      variant="body2"
                      color="error"
                      sx={{ fontSize: 13, mt: -2, mb: 2 }}
                    >
                      {firstNameError}
                    </Typography>
                  )}

                  <TextField
                    required
                    fullWidth
                    id="email"
                    label="Email Address"
                    autoComplete="email"
                    name="email"
                    value={formData.email}
                    sx={{ mb: 2 }}
                    onChange={handleEmailChange}
                    InputProps={{
                      startAdornment: (
                        <EmailIcon
                          style={{ marginRight: "8px", color: "#757575" }}
                        />
                      ),
                    }}
                  />
                  {emailError && (
                    <Typography
                      variant="body2"
                      color="error"
                      sx={{ fontSize: 13, mt: -2, mb: 2 }}
                    >
                      {emailError}
                    </Typography>
                  )}

                  <TextField
                    required
                    fullWidth
                    name="password"
                    label="Password"
                    autoComplete="new-password"
                    value={formData.password}
                    type={showPassword ? "text" : "password"}
                    id="password"
                    data-testid="password"
                    sx={{ mb: 2 }}
                    onChange={handlePasswordChange}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockIcon color="action.active" />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            edge="end"
                            data-testid="password-toggle"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? <Visibility /> : <VisibilityOff />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                  {passwordError && (
                    <Typography
                      variant="body2"
                      color="error"
                      sx={{ fontSize: 13, mt: -2, mb: 2 }}
                    >
                      {passwordError}
                    </Typography>
                  )}
                 <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    sx={{ mt: 3, mb: 2 }}
                    disabled={!formValid }
                  >
                    Create
                  </Button>
                  <Backdrop
          sx={{ color: '#fff'}}
          open={openBackdrop}
        >
          <CircularProgress color="inherit" />
        </Backdrop>
                </Box>
              </Box>
            </Container>
          </Box>
        </ThemeProvider>
      </Box>
    </>
  );
}

export default AddSupervisor;
