import React, { useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText
} from "@mui/material";
import Swal from "sweetalert2";
import { userService } from "../../UserService";
import { useNavigate } from "react-router-dom";

const DeleteCustomerAccount = ({ isOpen, onClose, customer_id }) => {
  const [dialogOpen, setDialogOpen] = useState(isOpen);
  const navigate = useNavigate();

  const handleDeleteCustomerAccount = async () => {
    try {
      await userService.DeleteCustomerAccount(customer_id);
      Swal.fire({
        position: "success",
        icon: "success", 
        title: "Account Deleted Successfully",
        showConfirmButton: false,
        timer: 5000,
      });
      handleLogout();
    } catch (error) {
      if (error.response) {
        Swal.fire({
          position: "top",
          icon: "error",
          title: error.response.data.detail,
          showConfirmButton: false,
          timer: 5000,
        });
        console.log(error)
      }
    }
    setDialogOpen(false);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    onClose(); 
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <Box>
      <Dialog
        open={dialogOpen}
        onClose={handleDialogClose}
        data-testid="dialog"
      >
        <DialogTitle>Delete Account</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete your account?
            <br />
            <br />
            Deleting your account will remove all of your information
            This cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            variant="contained"
            style={{ backgroundColor: "#C0C0C0" }}
            onClick={handleDialogClose}
            data-testid="cancelbutton"
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteCustomerAccount}
            color="error"
            variant="contained"
            data-testid="deletebutton"
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DeleteCustomerAccount;
