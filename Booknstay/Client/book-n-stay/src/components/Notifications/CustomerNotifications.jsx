import React, { useState, useEffect } from "react";
import {
  IconButton,
  Typography,
  Box,
  Modal,
  Button,
  Stack,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import NotificationHeader from "./NotificationHeader";
import { axiosPrivate } from "../../interceptor";
import { userService } from "../../UserService";
import Loading from "../Loading/Loading";

const CustomerNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [filteredNotifications, setFilteredNotifications] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [nextCustomerNotification, setNextCustomerNotification] = useState("");
  const [previousCustomerNotification, setPreviousCustomerNotification] =
    useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isNoData, setIsNoData] = useState(true);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [openModal, setOpenModal] = useState(false);

  useEffect(() => {
    const fetchCustomerNotifications = async () => {
      try {
        const response = await userService.CustomerNotifications();
        const updatedNotifications = response.data.results.map(
          (notification) => ({
            ...notification,
          })
        );
        setNotifications(updatedNotifications);
        setNextCustomerNotification(response.data.next);
        setPreviousCustomerNotification(response.data.previous);
        setLoading(false);
        setIsNoData(response.data.results.length === 0);
      } catch (error) {
        console.error("Error fetching notifications:", error);
        setLoading(false);
      }
    };

    fetchCustomerNotifications();
  }, []);

  useEffect(() => {
    filterCustomerNotifications(filter);
  }, [notifications, filter]);

  const filterCustomerNotifications = (filter) => {
    switch (filter) {
      case "favorites":
        setFilteredNotifications(
          notifications.filter(
            (notification) => notification.is_customer_favorite
          )
        );
        break;
      case "all":
        setFilteredNotifications(notifications);
        break;
      default:
        setFilteredNotifications([]);
    }
  };

  const deleteCustomerNotification = async (notificationId) => {
    try {
      await userService.DeleteCustomerNotifications(notificationId);
      setNotifications((prevNotifications) =>
        prevNotifications.filter(
          (notification) => notification.id !== notificationId
        )
      );
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  const handleCustomerDeleteClicked = async (notificationId) => {
    await deleteCustomerNotification(notificationId);
  };

  const handleFilterChange = (value) => {
    setFilter(value);
  };

  const toggleCustomerFavorite = async (notificationId, isFavorite) => {
    try {
      const response = await userService.ToggleFavoriteNotificationByCustomer(
        notificationId
      );

      if (response.status === 200) {
        const updatedNotifications = notifications.map((n) =>
          n.id === notificationId
            ? { ...n, is_customer_favorite: isFavorite }
            : n
        );
        setNotifications(updatedNotifications);
      }
    } catch (error) {
      console.error("Error toggling favorite status:", error);
    }
  };

  const handleNextCustomerNotification = () => {
    axiosPrivate.get(nextCustomerNotification).then((response) => {
      setNotifications(response.data.results);
      setNextCustomerNotification(response.data.next);
      setPreviousCustomerNotification(response.data.previous);
      setCurrentPage(currentPage + 1);
    });
  };

  const handlePreviousCustomerNotification = () => {
    axiosPrivate.get(previousCustomerNotification).then((response) => {
      setNotifications(response.data.results);
      setNextCustomerNotification(response.data.next);
      setPreviousCustomerNotification(response.data.previous);
      setCurrentPage(currentPage - 1);
    });
  };

  const handleCustomerNotificationClick = async (notification) => {
    setSelectedNotification(notification);
    setOpenModal(true);
    await ReadCustomerNotification(notification.id);
    const updatedNotifications = notifications.map((n) =>
      n.id === notification.id ? { ...n, is_customer_read: true } : n
    );
    setNotifications(updatedNotifications);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  const ReadCustomerNotification = async (notificationId) => {
    try {
      await userService.ReadCustomerNotification(notificationId);
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const getCustomerNotificationTitle = () => {
    if (!selectedNotification) {
      return "Unknown Notification Type";
    }

    const { type } = selectedNotification;
    if (type === "Hotel Booking") {
      return "New booking to hotel";
    } else if (type === "Payment") {
      return "Payment Successful";
    } else if (type === "Password Reset") {
      return "Password Reset Successful";
    } else {
      return "Unknown Notification Type";
    }
  };

  if (loading) {
    return <Loading />;
  };

  return (
    <>
      <NotificationHeader
        isNoData={isNoData}
        handleFilterChange={handleFilterChange}
        filteredNotifications={filteredNotifications}
        currentPage={currentPage}
        toggleFavorite={toggleCustomerFavorite}
        handleDeleteClicked={handleCustomerDeleteClicked}
        filter={filter}
        handleNotificationClick={handleCustomerNotificationClick}
        fontWeight={600}
        userType="customer"
      />
      {!isNoData && (
        <Stack sx={{ mt: 2, ml: "79%" }} direction="row">
          {previousCustomerNotification ? (
            <Button
              data-testid="previous"
              onClick={handlePreviousCustomerNotification}
            >
              Previous
            </Button>
          ) : (
            <Button disabled>Previous</Button>
          )}
          <Button>{currentPage}</Button>
          {nextCustomerNotification ? (
            <Button data-testid="next" onClick={handleNextCustomerNotification}>
              Next
            </Button>
          ) : (
            <Button disabled>Next</Button>
          )}
        </Stack>
      )}
      <Modal
        data-testid="open"
        open={openModal}
        aria-labelledby="notification-modal"
        aria-describedby="notification-description"
      >
        <Box
          sx={{
            position: "absolute",
            width: "70%",
            height: "70%",
            bgcolor: "background.paper",
            border: "2px solid #000",
            boxShadow: 24,
            p: 4,
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          }}
        >
          <IconButton
            data-testid="close"
            onClick={handleCloseModal}
            sx={{
              position: "absolute",
              top: 0,
              right: 10,
              color: "rgba(0, 0, 0, 0.54)",
            }}
          >
            <CloseIcon />
          </IconButton>{" "}
          <div style={{ textAlign: "center" }}>
            {selectedNotification && (
              <>
                <Typography
                  id="notification-modal"
                  variant="h6"
                  component="h2"
                  gutterBottom
                >
                  {getCustomerNotificationTitle()}
                </Typography>
                <Typography
                  id="notification-description"
                  variant="body1"
                  component="p"
                >
                  {selectedNotification.message}
                </Typography>
                {selectedNotification.type === "Hotel Booking" && (
                  <img
                    src="Booking.jpg"
                    style={{ width: "40%", height: "40%" }}
                    alt="Hotel Booking"
                  />
                )}
                {selectedNotification.type === "Payment" && (
                  <img
                    src="CustomerPayment.jpg"
                    height="80%"
                    width="60%"
                    alt="Payment"
                  />
                )}
                {selectedNotification.type === "Password Reset" && (
                  <img
                    src="ResetCustomer.jpg"
                    height="40%"
                    width="40%"
                    alt="Payment"
                  />
                )}
              </>
            )}
          </div>
        </Box>
      </Modal>
    </>
  );
};

export default CustomerNotifications;
