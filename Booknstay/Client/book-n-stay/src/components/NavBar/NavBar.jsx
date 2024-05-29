import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { faUser } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";


const NavBar = () => {
  const [username, setUsername] = useState('');
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const userString = localStorage.getItem('user');
      if (userString) {
        const user = JSON.parse(userString);
        setUsername(user.first_name);
      }
    }
  }, []);

  return (
    <Box
      sx={{
        backgroundColor: 'white',
        padding: '16px',
        width: '100%',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow:
          '0px 2px 4px -1px rgba(0,0,0,0.1), 0px 4px 5px 0px rgba(0,0,0,0.04), 0px 1px 10px 0px rgba(0,0,0,0.05)',
      }}
    >
      <Typography data-testid="title"
        variant="h4"
        sx={{
          fontFamily: 'cursive',
          color: '#FF0000',
        }}
      >
        B
        <span style={{ color: '#FFA500' }}>oo</span>
        <span style={{ color: '#0000FF' }}>k</span>
        n
        <span style={{ color: '#FFA500' }}>S</span>
        tay
      </Typography>
      {username && (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography variant="body1" sx={{ fontWeight: 'bold', marginLeft: '8px' }}>
          <FontAwesomeIcon icon={faUser}/>
            {username}
          </Typography>
       
        </Box>
      )}
    </Box>
  );
};

export default NavBar;
