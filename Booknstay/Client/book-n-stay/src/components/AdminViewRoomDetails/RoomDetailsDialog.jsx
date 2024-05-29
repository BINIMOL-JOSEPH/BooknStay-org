import React, { useEffect, useState } from "react";
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import { adminServices } from "../../AdminService";
import Alert from '@mui/material/Alert';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableRow from '@mui/material/TableRow';
import TableHead from '@mui/material/TableHead';
import Paper from '@mui/material/Paper';


const RoomDetailsDialog = ({ isOpen, onClose, roomId }) => {
  const [data, setData] = useState({});
  const [errorMessage, setErrorMessage] = useState("");
  const [additionalServices, setAdditionalServices] = useState([]);
  const [additionalServicesError, setAdditionalServicesError] = useState([]);

  useEffect(() => {
    if (isOpen) {
      fetchRoomDetailsById();
      fetchAdditionalServicesById();
    }
  }, [isOpen]);

  const fetchRoomDetailsById = async () => {
    try {
      const response = await adminServices.ListRoomDetailsById(roomId);
      setData(response.data);
    } catch (error) {
      if (error.response) {
        setErrorMessage(error.response.data.message)
      }
    }
  };

  const fetchAdditionalServicesById = async () => {
    try {
      const response = await adminServices.ListAdditionalServices(roomId);
      setAdditionalServices(response.data.map(item => item.additional_activites_details));
    } catch (error) {
      if (error.response) {
        setAdditionalServices("");
        setAdditionalServicesError(error.response.data.message);
      }
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} fullWidth maxWidth="sm">
      <DialogContent>
        {errorMessage ? (
          <Alert severity="error">{errorMessage}</Alert>
        ) : (
          <>
            <DialogTitle sx={{ ml: '-4%' }}>Room Details</DialogTitle>
            <TableContainer component={Paper} sx={{ mt : '-2%'}}>
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>Room Facilities</TableCell>
                    <TableCell>{data.room_facilities}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>Rate</TableCell>
                    <TableCell>{data.rate}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>Created at</TableCell>
                    <TableCell>{data.date_joined}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>

            <DialogTitle sx={{ ml: '-4%', mt : '1%' }}>Room Services</DialogTitle>
            {additionalServices ? (
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead sx={{ bgcolor: '#5d9cdf' }}>
                      <TableRow>
                        <TableCell align="left" sx={{ color: 'white', fontWeight: 'bold' }}>Title</TableCell>
                        <TableCell align="left" sx={{ color: 'white', fontWeight: 'bold' }}>Description</TableCell>
                        <TableCell align="left" sx={{ color: 'white', fontWeight: 'bold' }}>Rate</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {additionalServices.map((service) => (
                        <TableRow key={service.index}>
                          <TableCell>{service.title}</TableCell>
                          <TableCell>{service.description}</TableCell>
                          <TableCell>{service.price}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
            ) : (
              <Alert severity="info" sx={{ mt : '1%'}}>{additionalServicesError}</Alert>
            )}
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button
          onClick={onClose}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RoomDetailsDialog;
