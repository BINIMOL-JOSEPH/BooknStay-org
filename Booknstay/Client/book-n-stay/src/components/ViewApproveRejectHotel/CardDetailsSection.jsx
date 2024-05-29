import React from "react";
import { Card, CardContent, Typography } from "@mui/material";

const CardDetailsSection = ({ title, children, hotel, renderActionButtons }) => (
  <Card
    sx={{
      width: "100%",
      height: "100%",
      backgroundColor: "#FFF",
      boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
      borderRadius: "8px",
      marginBottom: "20px",
    }}
  >
    <CardContent>
      <div>
        <Typography variant="h6" color="primary" mb={2}>
          {title}
        </Typography>
        {children}
        {hotel && renderActionButtons(hotel)}
      </div>
    </CardContent>
  </Card>
);

export default CardDetailsSection;
