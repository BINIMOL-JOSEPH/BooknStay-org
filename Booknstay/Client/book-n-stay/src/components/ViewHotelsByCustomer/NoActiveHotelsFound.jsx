import React from "react";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";

const NoActiveHotelsFound = () => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
      }}
    >
          <Typography variant="h5" color="textSecondary" gutterBottom sx={{ marginTop: 2 }}>
        Oops! No active hotels found. 
      </Typography>
      <Typography variant="h1" color="primary" sx={{ fontSize: '30rem', fontWeight: 'bold' }}>
        <img alt='No data found' src='https://img.freepik.com/free-vector/hand-drawn-no-data-concept_52683-127823.jpg?w=740&t=st=1710144379~exp=1710144979~hmac=8307a9ebeab076e3ef510f68fb2bfcba27f6a98105fc4600863b0c6e6f6a0e53data.jpg' height='50%' width="90%" />
      </Typography>
    
    </Box>
  );
};

export default NoActiveHotelsFound;
