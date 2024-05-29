import React from 'react';
import { Box, CircularProgress, CssBaseline, ThemeProvider } from '@mui/material';
import { createTheme } from '@mui/material/styles';

const defaultTheme = createTheme();

const Loading = () => {
  return (
    <ThemeProvider theme={defaultTheme}>
      <CssBaseline />
      <Box
        sx={{
          backgroundColor: "#F8F8F8",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          p: 3,
          position: "relative",
        }}
      >
   <CircularProgress disableShrink />
      </Box>
    </ThemeProvider>
  );
};

export default Loading;
