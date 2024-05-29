import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import Drawer from '@mui/material/Drawer';
import Divider from '@mui/material/Divider';
import Toolbar from '@mui/material/Toolbar';
import NavBar from '../NavBar/NavBar';
import { createTheme, ThemeProvider } from '@mui/material/styles';

import {AdminCard,CustomerCard,SupervisorCard,HotelCard} from '../DashboardCard/DashboardCards'

const drawerWidth = 240;
const defaultTheme = createTheme();

function Dashboard() {
  const user = JSON.parse(localStorage.getItem('user'));
  const userType = user ? user.userType : null;

  return (
    <ThemeProvider theme={defaultTheme}>
      <Box sx={{ display: 'flex' }}>
        <CssBaseline />
        <Drawer
          variant="permanent"
          open={true} 
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            whiteSpace: 'nowrap',
            '& .MuiDrawer-paper': {
              width: drawerWidth,
            },
          }}
        >
          <Divider />
          <div className="sidebar">
          </div>
        </Drawer>
        <Box
          component="main"
          sx={{
            backgroundColor: (theme) =>
              theme.palette.mode === 'light'
                ? theme.palette.grey[100]
                : theme.palette.grey[900],
            flexGrow: 1,
            height: '100vh',
            overflow: 'auto',
          }}
        >
          <NavBar username={user ? user.first_name : ''} />
          <Toolbar />
          <Routes>
            {userType === 'admin' && <Route path="/" element={<AdminCard />} />}
            {userType === 'customer' && <Route path="/" element={<CustomerCard />} />}
            {userType === 'supervisor' && <Route path="/" element={<SupervisorCard />} />}
            {userType === 'hotel' && <Route path="/" element={<HotelCard />} />}
          </Routes>
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default Dashboard;
