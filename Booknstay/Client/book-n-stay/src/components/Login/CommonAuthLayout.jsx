import React from "react";
import { Box, Avatar,Container, CssBaseline, ThemeProvider, Typography, Button, Stack } from "@mui/material";
import { createTheme } from "@mui/material/styles";
import NavigationBar from "../NavigationBar/NavigationBar";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { Link } from 'react-router-dom'; 
import NavigateNextIcon from '@mui/icons-material/NavigateNext';

const defaultTheme = createTheme();

const CommonAuthLayout = ({ children }) => (
  <>
    <NavigationBar />

    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "90vh",
        backgroundImage: "url('https://booknstay.innovaturelabs.com/hotel_image1.jpg')",
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat"
      }}
    >
      <ThemeProvider theme={defaultTheme}>
        <CssBaseline />
      </ThemeProvider>
      <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'left', width: '100%', }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'left', justifyContent:'center', width: '50%', ml:'5%', flexWrap: 'wrap' }}>
      <Stack sx={{ display: 'flex', flexDirection: 'column' }}>
      <Typography component='div' variant='h3' color="#DADADA">
          You will never forget how we made you feel...!
      </Typography>
      </Stack>
      <Button variant="outlined" component={Link} to="/"  data-testid="landing-page" 
          sx={{mt:'5%', width:'23%', color:'#DADADA', borderColor: '#DADADA'}} endIcon={<NavigateNextIcon />}>
                    Visit Now
      </Button>
      </Box>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          p: 3,
          boxShadow: 3,
          borderRadius: "3px",
          marginTop: "5px",
          height: "450px",
          bgcolor:'rgba(255, 255, 255, 0.9)'
          
        }}
      >
        <Avatar sx={{ m: 1, bgcolor: "primary.main" }}>
          <LockOutlinedIcon />
        </Avatar>
        <Container component="main" maxWidth="xs">
          {children}
        </Container>
      </Box>
      </Box>
    </Box>
  </>
);

export default CommonAuthLayout;
