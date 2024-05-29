import React from 'react';
import Typography from '@mui/material/Typography';

const StyledTitle = () => {
  return (
    <Typography
      variant="h4"
      sx={{
        fontFamily: 'cursive',
        color: '#FF0000',
        marginTop: '9px',
      }}
    >
      <span style={{ color: 'white' }}>BooknStay</span>
    </Typography>
  );
};

export default StyledTitle;
