import React, { useState, useEffect } from "react";
import {
  Avatar,
  Box,
  Button,
  Container,
  CssBaseline,
  IconButton,
  InputAdornment,
  TextField,
  Typography,Breadcrumbs
} from '@mui/material';
import { createTheme } from '@mui/material/styles';
import {
  LockOutlined as LockOutlinedIcon,
  Visibility,
  VisibilityOff
} from '@mui/icons-material';
import LockIcon from '@mui/icons-material/Lock'
import Swal from 'sweetalert2';
import { userService } from '../../UserService';
import CollapsibleSidebar from '../Sidebar/Sidebar';
import { validators } from '../../Validations';
import { Link } from "react-router-dom";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";

const defaultTheme = createTheme();

const ChangePassword = () => {
  const [formData, setFormData] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordsMatch, setPasswordsMatch] = useState(false);
  const [formValid, setFormValid] = useState(false);
  const [currentPasswordError, setCurrentPasswordError] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentPasswordEntered, setCurrentPasswordEntered] = useState(false);
  const userData = localStorage.getItem('user');
  const user = userData ? JSON.parse(userData) : null;
  const userType = user ? user.userType : null;

  useEffect(() => {
    checkFormValidity();
  }, [
    formData.current_password,
    formData.new_password,
    formData.confirm_password,
    passwordsMatch,
  ]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
    setCurrentPasswordEntered(
      name === "current_password" && value.trim() !== ""
    );
  };

  const handlePasswordChange = (e) => {
    const inputValue = e.target.value;
    setFormData((prevData) => ({
      ...prevData,
      new_password: inputValue,
    }));

    if (
      inputValue === formData.current_password &&
      formData.current_password !== ""
    ) {
      setPasswordError(
        "New password should be different from the current password."
      );
    } else {
      const passwordValidation = validators.validatePassword(inputValue);
      setPasswordError(passwordValidation);
    }
  };

  const handleConfirmPasswordChange = (e) => {
    const inputValue = e.target.value;
    setFormData((prevData) => ({
      ...prevData,
      confirm_password: inputValue,
    }));
    setPasswordsMatch(formData.new_password === inputValue);
  };

  const checkFormValidity = () => {
    setFormValid(
      formData.current_password.trim() !== "" &&
        formData.new_password.trim() !== "" &&
        formData.confirm_password.trim() !== "" &&
        passwordsMatch &&
        formData.new_password !== formData.current_password &&
        formData.new_password === formData.confirm_password
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      await userService.ChangePassword(formData);
      setFormData({
        current_password: "",
        new_password: "",
        confirm_password: "",
      });
      setPasswordError("");
      setCurrentPasswordError("");

      Swal.fire({
        position: "center",
        icon: "success",
        "data-testid": "success-message",
        title: "Password changed successfully",
        showConfirmButton: false,
        timer: 5000,
      });
    } catch (error) {
      const apiErrorMessage = error?.response?.data?.error;
      if (apiErrorMessage === "Incorrect current password") {
        setCurrentPasswordError(apiErrorMessage);
        setPasswordError("");
      } else {
        Swal.fire({
          position: "center",
          icon: "error",
          "data-testid": "error-message",
          title: "Failed to update change password",
          showConfirmButton: true,
        });
      }
    } finally {
      setLoading(false);
    }
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
          backgroundColor: "#F8F8F8",
        }}
      >
       
          <Breadcrumbs
            separator={<NavigateNextIcon fontSize="small" />}
            aria-label="breadcrumb"
            sx={{ mt: '1%'}}
          >
             {userType === 'admin' && (
              <Link to="/supervisor-dashboard">Home</Link>
              )}
            {userType === 'hotel' && (
              <Link to="/hotel-dashboard">Home</Link>
            )}
            {userType === 'customer' && (
              <Link to="/select-hotels">Home</Link>
            )}
            {userType === 'supervisor' && (
              <Link to="/supervisor-dashboard">Home</Link>
            )}
            <Typography color="textPrimary">Change Password</Typography>
          </Breadcrumbs>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            p: '2%',
            mt: '2%',
            boxShadow: 3,
            borderRadius: "3px",
            bgcolor: "background.paper",
            height: "505px",
          }}
        >
          <Container component="main" maxWidth="xs">
            <CssBaseline />
            <Box
              sx={{
                backgroundColor: "white",
                width: "100%",
                display: "flex",
                alignItems: "center",
                flexDirection: "column",
              }}
            >
              <Avatar sx={{ m: 1, bgcolor: "primary.main" }}>
                <LockOutlinedIcon />
              </Avatar>

              <Typography component="h1" variant="h5">
                Change Password
              </Typography>
              <Box
                component="form"
                noValidate
                sx={{ mt: 3 }}
                onSubmit={handleSubmit}
              >
                <TextField
                  required
                  fullWidth
                  data-testid="current_password"
                  name="current_password"
                  label="Current Password"
                  autoComplete="current-password"
                  type={showCurrentPassword ? "text" : "password"}
                  id="current_password"
                  value={formData.current_password}
                  sx={{ mb: 2 }}
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
                          data-testid="show-current-password-button"
                          onClick={() =>
                            setShowCurrentPassword(!showCurrentPassword)
                          }
                        >
                          {showCurrentPassword ? (
                            <Visibility />
                          ) : (
                            <VisibilityOff />
                          )}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  onChange={handleInputChange}
                />
                {currentPasswordError && currentPasswordEntered && (
                  <Typography
                    data-testid="current-password-error"
                    variant="body2"
                    color="error"
                    sx={{ fontSize: 13, mt: '-3%', mb: '2%' }}
                  >
                    {currentPasswordError}
                  </Typography>
                )}

                <TextField
                  required
                  fullWidth
                  name="new_password"
                  label="New Password"
                  autoComplete="new_password"
                  type={showNewPassword ? "text" : "password"}
                  id="new_password"
                  onChange={handlePasswordChange}
                  value={formData.new_password}
                  sx={{ mb: 2, mt: 0 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockIcon color="action.active" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          data-testid="show-new-password-button"
                          edge="end"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                        >
                          {showNewPassword ? <Visibility /> : <VisibilityOff />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  inputProps={{ "data-testid": "new_password" }}
                />
                {passwordError && (
                  <Typography
                    data-testid="password-error"
                    id="password-error"
                    variant="body2"
                    color="error"
                    sx={{ fontSize: 13, mt: '-3%', mb: '1%' }}
                  >
                    {passwordError}
                  </Typography>
                )}

                <TextField
                  required
                  fullWidth
                  data-testid="confirm_password"
                  name="confirm_password"
                  label="Confirm New Password"
                  autoComplete="confirm_password"
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirm_password"
                  value={formData.confirm_password}
                  sx={{ mb: 1, mt: 1 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockIcon color="action.active" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          data-testid="show-confirm-password-button"
                          edge="end"
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                        >
                          {showConfirmPassword ? (
                            <Visibility />
                          ) : (
                            <VisibilityOff />
                          )}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  onChange={handleConfirmPasswordChange}
                />

                {formData.confirm_password && !passwordsMatch && (
                  <Typography
                    data-testid="password-match-error"
                    variant="body2"
                    color="error"
                    sx={{ fontSize: 13, mt: '-2%' }}
                  >
                    New Password and Confirm Password do not match.
                  </Typography>
                )}

                <Button
                  type="submit"
                  data-testid="submit-button"
                  fullWidth sx={{mt:'5%'}}
                  variant="contained"
                  disabled={!formValid || loading}
                >
                  {loading ? "Submitting..." : "Submit"}
                </Button>
              </Box>
            </Box>
          </Container>
        </Box>
      </Box>
    </>
  );
};

export default ChangePassword;
