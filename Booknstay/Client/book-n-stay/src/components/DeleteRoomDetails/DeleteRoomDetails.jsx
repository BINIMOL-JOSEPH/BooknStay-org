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
import { hotelService } from "../../HotelService";
import Swal from "sweetalert2";
import CollapsibleSidebar from "../Sidebar/Sidebar";

const DeleteRoomDetails = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [hasBookings] = useState(false);
  const [dialogOpen] = useState(false);

  const handleConfirmDelete = async () => {
    try {
      setLoading(true);
      if (roomId) {
        await hotelService.DeleteRoomDetails(roomId);

        Swal.fire({
          icon: "success",
          title: "Room details deleted successfully",
          showConfirmButton: false,
          timer: 1500,
        });
        navigate("/view-hotel-room-details");
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: error.response.data.detail,
      });
      navigate("/view-hotel-room-details");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <CollapsibleSidebar />

      <Box>
        <Dialog
          open={dialogOpen}
          PaperProps={{ sx: { width: "50%", height: "180px" } }}
        >
          <DialogTitle>Cannot Delete Room Details</DialogTitle>
          <DialogContent>
            <Typography>
              There are existing bookings for this room. You cannot delete it.
            </Typography>
          </DialogContent>
          <DialogActions></DialogActions>
        </Dialog>

        <Dialog
          open={!hasBookings && roomId}
          PaperProps={{ sx: { width: "100%", height: "180px" } }}
        >
          <DialogTitle>Delete Room Details</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete the room details?
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button
              style={{ backgroundColor: "#C0C0C0" }}
              variant="contained"
              onClick={() => navigate("/view-hotel-room-details")}
              color="primary"
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

export default DeleteRoomDetails;
