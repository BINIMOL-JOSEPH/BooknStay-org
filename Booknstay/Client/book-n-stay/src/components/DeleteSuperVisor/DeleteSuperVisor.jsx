import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import Swal from "sweetalert2";
import CollapsibleSidebar from "../Sidebar/Sidebar";
import { adminServices } from "../../AdminService";

const DeleteSuperVisor = () => {
  const { supervisorId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleConfirmDelete = async () => {
    try {
      setLoading(true);
        await adminServices.DeleteSuperVisor(supervisorId);
        Swal.fire({
          icon: "success",
          title: "Supervisor deleted successfully",
          showConfirmButton: false,
        });
        navigate("/list-supervisor");
      
    } catch (error) {
    console.error("Backend error:", error); 

      Swal.fire({
        icon: "error",
        title: "Error",
        text: "An error occurred while deleting supervisor.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <CollapsibleSidebar />

      <Box>
        <Dialog
          open={supervisorId}
          PaperProps={{ sx: { width: "100%", height: "180px" } }}
        >
          <DialogTitle>Delete SuperVisor</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete the supervisor?
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button
              variant="contained"
              style={{ backgroundColor: "#C0C0C0" }}
              onClick={() => navigate("/list-supervisor")}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleConfirmDelete}
              color="error"
              data-testid="confirm"
              disabled={loading}
            >
              Confirm
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </>
  );
};

export default DeleteSuperVisor;
