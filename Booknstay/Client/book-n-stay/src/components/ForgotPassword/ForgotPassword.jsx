import React, { useState } from "react";
import {
  Box,
  Button,
  Typography,
  TextField,
} from "@mui/material";

import EmailIcon from "@mui/icons-material/Email";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";
import { userService } from "../../UserService";
import CommonAuthLayout from "../Login/CommonAuthLayout";


const ForgotPassword = () => {
  const [formData, setFormData] = useState({ email: "" });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInput = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setError("");
  };

  const isSubmitDisabled = !formData.email;

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await userService.ForgotPassword(formData);

      Swal.fire({
        position: "center",
        icon: "success",
        title: "Password reset link has been sent to your email",
        showConfirmButton: false,
        timer: 5000,
      });
      setFormData({ email: "" });
    } catch (error) {
      const errorMessage = error.response?.data?.errors?.email?.[0];
      setError(errorMessage);
      if (!error.response) {
        Swal.fire({
          position: "center",
          icon: "error",
          title: "Unexpected Error",
          text: "An unexpected error occurred. Please try again later.",
          showConfirmButton: true,
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <CommonAuthLayout>
        <Typography component="h1" variant="h5">
          Forgot Password
        </Typography>
        <Box component="form" noValidate sx={{ mt: 3 }}>
          <TextField
            required
            fullWidth
            id="email"
            label="Email Address"
            autoComplete="email"
            name="email"
            value={formData.email}
            sx={{ mb: 1 }}
            InputProps={{
              startAdornment: (
                <EmailIcon style={{ marginRight: "8px", color: "#757575" }} />
              ),
            }}
            onChange={handleInput}
          />
          {error && (
            <Typography
              color="error"
              variant="body2"
              sx={{
                mt: 1,
                minHeight: "20px",
                display: "flex",
                alignItems: "center",
              }}
            >
              {error}
            </Typography>
          )}
          {!error && <Box mt={1} minHeight="20px" />}
          <Button
            type="submit"
            data-testid="forgot-password"
            onClick={handleForgotPassword}
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={isSubmitDisabled || isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Submit"}
          </Button>
        </Box>
      </CommonAuthLayout>
    </>
  );
};

export default ForgotPassword;
