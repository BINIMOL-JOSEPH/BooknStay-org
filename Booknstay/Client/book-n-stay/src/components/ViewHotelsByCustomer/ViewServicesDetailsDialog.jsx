import React, { useEffect, useState } from "react";
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import { hotelService } from "../../HotelService";


const ServicesDetailsDialog = ({ isOpen, onClose, serviceID }) => {

  const [serviceData, setServiceData] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    ViewServicesById();
  }, [serviceID]);

  const ViewServicesById = async() => {
    try {
      setErrorMsg('');
      const response = await hotelService.ServicesById(serviceID);
      console.log(response.data);
      setServiceData(response.data);
    } catch(error) {
      if(error.response){
        setErrorMsg('Unable to load data');
      }
    }
  }

  return (
    <Dialog open={isOpen} onClose={onClose} fullWidth maxWidth="md" data-testid='dialog'>
      <DialogContent>
        <DialogTitle sx={{ ml: '-4%' }}>Services Details</DialogTitle>
        {errorMsg ? (
          <Alert severity="error">{errorMsg}</Alert>
        ) : (
          <Box>
              {serviceData && (
                <Card sx={{ display: 'flex' ,mt:'2%' ,width:'92%', ml : '3.7%', boxShadow: '1px 1px 10px rgba(0, 0, 0, 0.3)' , height: '220px'}} data-testid = 'service-card'>
              
                <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
                  <CardMedia
                    component="img"
                    sx={{ width: 200, height: 200, ml : '5%', mt : '1.2%', mb : '1.2%'}}
                    image={serviceData.image}
                    // image="http://localhost:3000/breakfast.jpg"
                    alt={`${serviceData.title}`}
                  />
                </Box>
  
                <Box sx={{ width: "70%", ml : '2%' }}>
                  <CardContent sx={{ flex: '1 0 auto', mt : '1%' }}>
                    <Typography component="div" variant="h5" sx={{fontWeight : 'bold'}}>
                      {serviceData.title}
                    </Typography>
                    <Typography variant="subtitle1" color="text.secondary" component="div">
                      {serviceData.description}
                    </Typography>
                    <Typography variant="subtitle1" color="text.secondary" component="div" sx={{ mt : '2%', fontSize : 'small', color : '#FC6736'}}>
                      This booking is non-refundable and the tariff cannot be cancelled with zero fee. 
                    </Typography>
                  </CardContent>
                </Box>
  
                <Box sx={{ display: "flex", flexDirection: "column", pb: 3,  width: "30%", alignItems: 'flex-end', mt : '12%', mr : '2%'}}>
                    <Stack direction="row" sx={{ mt : '33%', mb : '-0.5%'}}>
                      <Typography  component="div" variant="h4" sx={{fontWeight : 'bold'}}>
                          {serviceData.price} 
                      </Typography>
                      <Typography component="div" variant="subtitle1" sx={{ mt : '5%'}}>&nbsp; INR</Typography>
                    </Stack>
                    <Stack direction="column" sx={{ display: "flex",  alignItems: 'flex-end'}}>
                      <Typography component="div" variant="subtitle1" sx={{ color: "grey", fontSize: "small" }}>
                          Excludes taxes and fees
                      </Typography>
                    </Stack>
                </Box>
  
              </Card>
              )}
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ServicesDetailsDialog;
