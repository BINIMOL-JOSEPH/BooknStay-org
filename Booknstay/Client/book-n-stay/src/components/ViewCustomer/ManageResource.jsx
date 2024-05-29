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
  CircularProgress,
} from "@mui/material";
import Swal from "sweetalert2";
import CollapsibleSidebar from "../Sidebar/Sidebar";
import { adminServices } from "../../AdminService";

const ManageResource = ({ resourceType, action }) => {
  const { resource_id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleAction = async (action, resource_id) => {
    try {
      setLoading(true);
      let response;
      switch (action) {
        case "activate":
          if (resourceType === "customer") {
            response = await adminServices.ActivateCustomer(resource_id);
          } else if (resourceType === "hotel") {
            response = await adminServices.ActivateHotel(resource_id);
          }
          break;
        case "delete":
          if (resourceType === "customer") {
            response = await adminServices.DeleteCustomer(resource_id);
          } else if (resourceType === "hotel") {
            response = await adminServices.DeleteHotel(resource_id);
          }
          break;
        case "suspend":
          if (resourceType === "customer") {
            response = await adminServices.SuspendCustomer(resource_id);
          } else if (resourceType === "hotel") {
            response = await adminServices.SuspendHotel(resource_id);
          }
          break;
        default:
          break;
      }

      Swal.fire({
        position: "top",
        icon: "success",
        title: response.data.message,
        showConfirmButton: false,
        timer: 5000,
      });

      navigate(`/list-${resourceType}s`);
    } catch (error) {
      if (error.response) {
        Swal.fire({
          position: "top",
          icon: "error",
          title: error.response.data.message,
          showConfirmButton: false,
          timer: 5000,
        });
        navigate(`/list-${resourceType}s`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <CollapsibleSidebar />

      {loading && (
  <CircularProgress
    size={24}
    style={{
      position: "absolute",
      top: "50%",
      left: "50%",
      zIndex: 9999, 
      color: "inherit"
    }}
  />
)}

      <Box>
        <Dialog
          open={Boolean(resource_id)}
          PaperProps={{ sx: { width: "100%", height: "180px" } }}
        >
          <DialogTitle>
            {resourceType
              ? `Manage ${resourceType.charAt(0).toUpperCase() + resourceType.slice(1)}`
              : "Manage Resource"}
          </DialogTitle>
          <DialogContent>
            <Typography>
              {resourceType
                ? `Are you sure you want to ${action} the ${resourceType}?`
                : "Are you sure you want to perform this action on the resource?"}
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button
              variant="contained"
              style={{ backgroundColor: "#C0C0C0", color: "black" }}
              onClick={() => navigate(`/list-${resourceType}s`)}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={() => handleAction(action, resource_id)}
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

export default ManageResource;
