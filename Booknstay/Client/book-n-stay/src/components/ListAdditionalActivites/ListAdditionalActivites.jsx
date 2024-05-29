import React, { useEffect, useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import { hotelService } from '../../HotelService';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import AddIcon from '@mui/icons-material/Add';
import IconButton from '@mui/material/IconButton';
import Swal from 'sweetalert2';
import Alert from '@mui/material/Alert';


const ServicesDialog = ({ open, onClose, roomId }) => {
    const [additionalServices, setAdditionalServices] = useState([]);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');


    useEffect(() => {
      handleFetchAdditionalServices();
    }, []);
  
    const handleFetchAdditionalServices = async () => {
        try {
            const response = await hotelService.FetchAdditionalServices();
            setAdditionalServices(response.data);
        } catch (error) {
            if (error.response) {
                Swal.fire({
                    position: 'top',
                    icon: 'error',
                    title: error.response.data.message,
                    showConfirmButton: false,
                    timer: 1000,
                });
            } else {
                Swal.fire({
                    position: 'top',
                    icon: 'error',
                    title: 'Failed to fetch additional services',
                    showConfirmButton: false,
                    timer: 1000,
                });
            }
        }
    };

    const handleAddAdditionalServices = async (service_id) => {
        try{
            const response = await hotelService.AddAdditionalServices(roomId, service_id);
            setSuccessMessage(response.data.message);
            setTimeout(() => {
                setSuccessMessage('');
            }, 3000);
        } catch(error) {
            if(error.response) {
                setErrorMessage(error.response.data.message);
            }
            setTimeout(() => {
                setErrorMessage('');
            }, 3000);
        }
    };

    const handleAddService = (service_id) => {
        handleAddAdditionalServices(service_id);
    };
  
    return (
        <Dialog open={open} onClose={onClose} data-testid='dialog'>
            <DialogTitle>Add Services</DialogTitle>
            {additionalServices.length > 0 ? (
                <DialogContent>
                {errorMessage &&
                    <Alert severity="error" sx={{mt : '2%', ml : '1%', mr : 1, width : '97%'}}>
                        {errorMessage}
                    </Alert>
                }
    
                {successMessage &&
                    <Alert severity="success" sx={{mt : '2%', ml : '1%', mr : 1, width : '97%'}}>
                        {successMessage}
                    </Alert>
                }
                    <List sx={{ width: '100rem', maxWidth: 360 }}>
                        {additionalServices.map((service) => (
                            <ListItem key={service.id} 
                                disableGutters 
                                secondaryAction={
                                    <IconButton aria-label="add-icon"><AddIcon onClick={() => handleAddService(service.id)}  data-testid='add'/></IconButton>
                                }
                            >
                                <ListItemText primary={service.title}/>
                            </ListItem>
                        ))}
                    </List>
                </DialogContent>
            ) : (
                <Alert severity="info" sx={{mt : '2%', ml : '4.5%', mr : 1, width : '90%'}}>{'You dont have any services added. Please add services.'}</Alert>
            )}
            
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
            </DialogActions>
        </Dialog>
    );
};
  
export default ServicesDialog;
