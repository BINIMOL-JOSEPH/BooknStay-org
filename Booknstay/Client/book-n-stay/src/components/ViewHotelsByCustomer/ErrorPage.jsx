import React from "react";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import SentimentVeryDissatisfiedIcon from "@mui/icons-material/SentimentVeryDissatisfied";

const ErrorPage = () => {
  return (
    <Stack
      direction="column"
      justifyContent="center"
      alignItems="center"
      sx={{ minHeight: "100vh", backgroundColor: "#F8F8F8" }}
    >
      <Typography variant="h1" color="error" sx={{ textAlign: "center", mt: 2, fontWeight: 'bold', fontSize: '200px' }}>
        500
      </Typography>
      <Typography variant="h4" gutterBottom sx={{ color: "text.secondary" }}>
        <SentimentVeryDissatisfiedIcon fontSize="large" color="error" />
        {" Oops! Something went wrong."}
      </Typography>
      <Typography variant="body1" sx={{ textAlign: "center", mt: 2, color: "text.secondary" }}>
        We're sorry, but there seems to be an issue with our server. Please try again later.
      </Typography>
    </Stack>
  );
};

export default ErrorPage;
