import React, { useEffect,useState } from 'react';
import { useParams,useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.css';
import { FcCheckmark, FcCancel } from "react-icons/fc";
import { createTheme, ThemeProvider } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import { userService } from '../../UserService';
import NavigationBar from '../NavigationBar/NavigationBar';


const defaultTheme = createTheme();


function VerifyEmail() {
    const { id } = useParams();
    const [verificationStatus, setVerificationStatus] = useState('');
    const [verificationErrorStatus, setVerificationErrorStatus] = useState('');
    const navigate = useNavigate();

    const navigateLogin = () => {
      navigate('/login');
    }

    const verifyEmail = async (id) => {
        try {
            const response = await userService.VerifyEmail(id);
            if (response.data.message){
                setVerificationStatus(response.data.message);
            }     
        } catch (error) {
            if (error.response) {
                setVerificationErrorStatus(error.response.data.message);
            }
        }
    };


    useEffect(() => {
        verifyEmail(id);
    }, [id]);

    return (
      <>
      <NavigationBar/>
      <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                minHeight: '90vh',
                width: '100%',
                backgroundColor: '#F8F8F8',
            }}
        >
        <ThemeProvider theme={defaultTheme}>
            <Card 
                sx={{ 
                        minWidth: 275,
                        marginTop: '12%' 
                    }}>
                <CardContent>
                  {verificationStatus && (
                    <Typography 
                        sx={{ 
                                fontSize: 20,
                            }} 
                            color="text.secondary" gutterBottom
                    >
                          <center><FcCheckmark size={56} /></center><br/>
                          <center>{verificationStatus}</center>
                          <br/><br/> <Button size="small" onClick={navigateLogin}>Login</Button>
                    </Typography>
                  )}
                  {verificationErrorStatus && (
                    <Typography 
                        sx={{ 
                                fontSize: 20,
                            }} 
                            color="text.secondary" gutterBottom
                    >
                          <center><FcCancel size={56} /></center><br/>
                          <center>{verificationErrorStatus}</center>
                          <br/><br/> <Button size="small">Home</Button>
                    </Typography>
                  )}
                    
                </CardContent>
            </Card>
      </ThemeProvider>
      </Box>
      </>
);
}

export default VerifyEmail;