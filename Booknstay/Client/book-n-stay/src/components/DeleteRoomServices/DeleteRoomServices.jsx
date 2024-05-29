import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { hotelService } from '../../HotelService';
import Swal from 'sweetalert2';
import CollapsibleSidebar from '../Sidebar/Sidebar';

const DeleteRoomServices = () => {
  const { roomserviceId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleConfirmDelete = async () => {
    
try {
  setLoading(true);
  if (roomserviceId) {
    await hotelService.DeleteRoomServices(roomserviceId);

    Swal.fire({
      icon: 'success',
      title: 'Room Services deleted successfully',
      showConfirmButton: false,
      timer: 1000,
    });
    navigate('/view-room-services');
  }
} catch (error) {
  Swal.fire({
    icon: 'error',
    title: error.response?.data?.detail,
  });
  navigate('/view-room-services');

} finally {
  setLoading(false);
}
  }

  return (
    <>
      <CollapsibleSidebar />

      <Box>
        <Dialog open={!!roomserviceId} PaperProps={{ sx: { width: '50%', height: '180px' } }}>
          <DialogTitle>Delete Room Services</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete the room services?
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button style={{ backgroundColor: "#C0C0C0" }}
variant="contained" onClick={() => navigate('/view-room-services')} color="primary">
              Cancel
            </Button>
            <Button variant="contained" onClick={handleConfirmDelete} color="error" data-testid="confirm" disabled={loading}>
              Confirm
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </>
  );
};

export default DeleteRoomServices;
