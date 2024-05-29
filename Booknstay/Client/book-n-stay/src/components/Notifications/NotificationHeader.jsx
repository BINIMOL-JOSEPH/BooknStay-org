import React from "react";
import PropTypes from "prop-types";
import {
  Box,
  Card,
  Container,
  Divider,
  IconButton,
  Typography,
  Breadcrumbs,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import NotificationsIcon from "@mui/icons-material/Notifications";
import StarIcon from "@mui/icons-material/Star";
import CollapsibleSidebar from "../Sidebar/Sidebar";
import { Link } from "react-router-dom";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import NoDataFound from "../ListReviewsByHotels/NoDataFound";

const getFavoriteProp = (userType) => {
  switch (userType) {
    case "admin":
      return "is_admin_favorite";
    case "hotel":
      return "is_hotel_favorite";
    case "customer":
      return "is_customer_favorite";
    default:
      return "";
  }
};

const getReadProp = (userType) => {
  switch (userType) {
    case "admin":
      return "is_admin_read";
    case "hotel":
      return "is_hotel_read";
    case "customer":
      return "is_customer_read";
    default:
      return "";
  }
};

const getDeleteProp = (userType) => {
  switch (userType) {
    case "admin":
      return "is_admin_delete";
    case "hotel":
      return "is_hotel_delete";
    case "customer":
      return "is_customer_delete";
    default:
      return "";
  }
};

const NotificationHeader = ({
  isNoData,
  handleFilterChange,
  filteredNotifications,
  toggleFavorite,
  handleDeleteClicked,
  filter,
  handleNotificationClick,
  userType,
}) => {
  const favoriteProp = getFavoriteProp(userType);
  const readProp = getReadProp(userType);
  const deleteProp = getDeleteProp(userType);

  let userTypeLink;
  if (userType === "customer") {
    userTypeLink = "select-hotels";
  } else if (userType === "admin") {
    userTypeLink = "supervisor-dashboard";
  } else {
    userTypeLink = `${userType}-dashboard`;
  }

  const destinationLink = `/${userTypeLink}`;


  return (
    <>
      <CollapsibleSidebar />
      <Container>
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          mt={4}
        >
          {!isNoData && (
            <Breadcrumbs
              separator={<NavigateNextIcon fontSize="small" />}
              aria-label="breadcrumb"
            >
              <Link to={destinationLink}>Home</Link>
              <Typography color="textPrimary">Notifications</Typography>
            </Breadcrumbs>
          )}
          <Box width="100%">
            {isNoData ? (
              <NoDataFound />
            ) : (
              <Card variant="outlined" sx={{ borderRadius: 4 }}>
                <Box
                  p={2}
                  sx={{
                    backgroundColor: "#e0e0e0",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <NotificationsIcon sx={{ mr: 1 }} />
                  <Typography variant="h6" color="black">
                    List Notification
                  </Typography>
                </Box>
                <Divider />

                <Box p={2}>
                  <Box mb={2} display="flex" justifyContent="space-around">
                    <Typography
                      component="a"
                      href="#"
                      onClick={() => handleFilterChange("all")}
                      style={{
                        textDecoration: filter === "all" ? "underline" : "none",
                        color: filter === "all" ? "black" : "inherit",
                      }}
                    >
                      All
                    </Typography>
                    <Typography
                      component="a"
                      href="#"
                      onClick={() => handleFilterChange("favorites")}
                      style={{
                        textDecoration: filter === "favorites" ? "underline" : "none",
                        color: filter === "favorites" ? "black" : "inherit",
                      }}
                    >
                      Favorites
                    </Typography>
                  </Box>
                  {filteredNotifications.map((notification, index) => (
                    <React.Fragment key={notification.index}>
                      <Box
                        display="flex"
                        alignItems="center"
                        justifyContent="space-between"
                        p={1}
                        style={{ cursor: "pointer" }}
                      >
                        <Box
                          display="flex"
                          alignItems="center"
                          onClick={() => handleNotificationClick(notification)}
                        >
                          <StarIcon
                            className="star-icon"
                            data-testid={`star-icon-${notification.id}`}
                            style={{
                              color: notification[favoriteProp] ? "gold" : "inherit",
                              cursor: "pointer",
                            }}
                            onClick={(event) => {
                              event.stopPropagation();
                              toggleFavorite(
                                notification.id,
                                !notification[favoriteProp]
                              );
                            }}
                          />
                          <Typography
                            data-testid="message"
                            variant="body1"
                            ml={1}
                            fontWeight={notification[readProp] ? "normal" : 600}
                          >
                            {notification.message}
                          </Typography>
                        </Box>
                        <Box>
                          <IconButton
                            data-testid={`delete-button-${notification.id}`}
                            onClick={() => handleDeleteClicked(notification.id)}
                            disabled={notification[deleteProp]}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      </Box>
                      {index < filteredNotifications.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </Box>
              </Card>
            )}
          </Box>
        </Box>
      </Container>
    </>
  );
};

NotificationHeader.propTypes = {
  isNoData: PropTypes.bool.isRequired,
  handleFilterChange: PropTypes.func.isRequired,
  filteredNotifications: PropTypes.array.isRequired,
  toggleFavorite: PropTypes.func.isRequired,
  handleDeleteClicked: PropTypes.func.isRequired,
  filter: PropTypes.string.isRequired,
  handleNotificationClick: PropTypes.func.isRequired,
  userType: PropTypes.string.isRequired
};

export default NotificationHeader;
