import React, { useEffect, useState } from "react";
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Alert from '@mui/material/Alert';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableRow from '@mui/material/TableRow';
import TableHead from '@mui/material/TableHead';
import Paper from '@mui/material/Paper';
import Tooltip from '@mui/material/Tooltip';
import DeleteIcon from '@mui/icons-material/Delete';
import { hotelService } from "../../HotelService";

const ListServicesToRoomsHotels = ({ isOpen, onClose, roomId }) => {
  const [data, setData] = useState([]);
  const [errorMsg, setErrorMsg] = useState('');
  const [deleteSuccessMsg, setDeleteSuccessMsg] = useState('');
  const [deleteErrorMsg, setDeleteErrorMsg] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchServicesAddedToRooms();
    }
  }, [isOpen]);

  const fetchServicesAddedToRooms = async() => {
    try {
      const response = await hotelService.ListServicesAddedToRooms(roomId);
      setErrorMsg('');
      setData(response.data.map(item => item.additional_activites_details));
    } catch(error) {
      if (error.response) {
        setData([]);
        setErrorMsg(error.response.data.message);
      }
    }
  };

  const handleDeleteService = async(service_id) => {
    try {
      const response = await hotelService.DeleteServicesAddedToRooms(roomId, service_id);
      setData(prevData => prevData.filter(service => service.id !== service_id));
      setDeleteSuccessMsg(response.data.message);
      setTimeout(() => {
        setDeleteSuccessMsg('');
      }, 3000);
    } catch (error) {
      if (error.response) {
        setDeleteSuccessMsg('');
        setDeleteErrorMsg(error.response.data.message);
        setTimeout(() => {
          setDeleteErrorMsg('');
        }, 3000);
      }
    }
  };

  const handleDelete = (service_id) => {
    handleDeleteService(service_id);
  };

  return (
    <Dialog open={isOpen} onClose={onClose} fullWidth maxWidth="md" data-testid='dialog'>
      <DialogContent>
        {deleteSuccessMsg &&
          <Alert severity="success" sx={{ mt: '2%', ml: '1%', mr: 1, width: '97%' }}>
            {deleteSuccessMsg}
          </Alert>
        }
        
        {deleteErrorMsg &&
          <Alert severity="error" sx={{ mt: '2%', ml: '1%', mr: 1, width: '97%' }}>
            {deleteErrorMsg}
          </Alert>
        }

        <DialogTitle sx={{ ml: '-4%', mt: '1%' }}>Room Services</DialogTitle>
        {errorMsg ? (
          <Alert severity="info">{errorMsg}</Alert>
        ) : (
          <TableContainer component={Paper} data-testid='table'>
            <Table>
              <TableHead sx={{ bgcolor: '#5d9cdf' }}>
                <TableRow>
                  <TableCell align="left" sx={{ color: 'white', fontWeight: 'bold' }}>Title</TableCell>
                  <TableCell align="left" sx={{ color: 'white', fontWeight: 'bold' }}>Description</TableCell>
                  <TableCell align="left" sx={{ color: 'white', fontWeight: 'bold' }}>Rate</TableCell>
                  <TableCell align="left" sx={{ color: 'white', fontWeight: 'bold' }}>Status</TableCell>
                  <TableCell align="left" sx={{ color: 'white', fontWeight: 'bold' }}>Created on</TableCell>
                  <TableCell align="left" sx={{ color: 'white', fontWeight: 'bold' }}>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.map((service) => (
                  <TableRow key={service.index}>
                    <TableCell>{service.title}</TableCell>
                    <TableCell>{service.description}</TableCell>
                    <TableCell>{service.price}</TableCell>
                    <TableCell>{service.status}</TableCell>
                    <TableCell>{service.created_on}</TableCell>
                    <TableCell align="center">
                      <Tooltip title="Delete">
                        <DeleteIcon sx={{ color: "#5d9cdf" }} onClick={() => handleDelete(service.id)} data-testid='delete'/>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ListServicesToRoomsHotels;
