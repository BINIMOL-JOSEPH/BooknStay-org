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
import { hotelService } from "../../HotelService";
import { axiosPrivate } from "../../interceptor";
import Loading from "../Loading/Loading";

const HotelNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [filteredNotifications, setFilteredNotifications] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [nextHotelNotification, setNextHotelNotification] = useState("");
  const [previousHotelNotification, setPreviousHotelNotification] =
    useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isNoData, setIsNoData] = useState(true);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [openModal, setOpenModal] = useState(false);

  useEffect(() => {
    const fetchHotelNotifications = async () => {
      try {
        const response = await hotelService.HotelNotifications();
        const updatedNotifications = response.data.results.map(
          (notification) => ({
            ...notification,
          })
        );
        setNotifications(updatedNotifications);
        setNextHotelNotification(response.data.next);
        setPreviousHotelNotification(response.data.previous);
        setLoading(false);
        setIsNoData(response.data.results.length === 0);
      } catch (error) {
        console.error("Error fetching notifications:", error);
        setLoading(false);
      }
    };

    fetchHotelNotifications();
  }, []);

  useEffect(() => {
    filterHotelNotifications(filter);
  }, [notifications, filter]);

  const filterHotelNotifications = (filter) => {
    switch (filter) {
      case "favorites":
        setFilteredNotifications(
          notifications.filter((notification) => notification.is_hotel_favorite)
        );
        break;
      case "all":
        setFilteredNotifications(notifications);
        break;
      default:
        setFilteredNotifications([]);
    }
  };

  const deleteHotelNotification = async (notificationId) => {
    try {
      await hotelService.DeleteHotelNotifications(notificationId);
      setNotifications((prevNotifications) =>
        prevNotifications.filter(
          (notification) => notification.id !== notificationId
        )
      );
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  const handlHoteleDeleteClicked = async (notificationId) => {
    await deleteHotelNotification(notificationId);
  };

  const handleFilterChange = (value) => {
    setFilter(value);
  };

  const toggleHotelFavorite = async (notificationId, isFavorite) => {
    try {
      const response = await hotelService.ToggleFavoriteNotificationByHotel(
        notificationId
      );

      if (response.status === 200) {
        const updatedNotifications = notifications.map((n) =>
          n.id === notificationId ? { ...n, is_hotel_favorite: isFavorite } : n
        );
        setNotifications(updatedNotifications);
      }
    } catch (error) {
      console.error("Error toggling favorite status:", error);
    }
  };

  const handleNextHotelNotification = () => {
    axiosPrivate.get(nextHotelNotification).then((response) => {
      setNotifications(response.data.results);
      setNextHotelNotification(response.data.next);
      setPreviousHotelNotification(response.data.previous);
      setCurrentPage(currentPage + 1);
    });
  };

  const handlePreviousHotelNotification = () => {
    axiosPrivate.get(previousHotelNotification).then((response) => {
      setNotifications(response.data.results);
      setNextHotelNotification(response.data.next);
      setPreviousHotelNotification(response.data.previous);
      setCurrentPage(currentPage - 1);
    });
  };

  const handleHotelNotificationClick = async (notification) => {
    setSelectedNotification(notification);
    setOpenModal(true);
    await ReadHotelNotification(notification.id);
    const updatedNotifications = notifications.map((n) =>
      n.id === notification.id ? { ...n, is_hotel_read: true } : n
    );
    setNotifications(updatedNotifications);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  const ReadHotelNotification = async (notificationId) => {
    try {
      await hotelService.ReadHotelNotification(notificationId);
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const getHotelNotificationTitle = () => {
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
        toggleFavorite={toggleHotelFavorite}
        handleDeleteClicked={handlHoteleDeleteClicked}
        filter={filter}
        handleNotificationClick={handleHotelNotificationClick}
        fontWeight={600}
        userType="hotel"
      />
      {!isNoData && (
        <Stack sx={{ mt: 2, ml: "79%" }} direction="row">
          {previousHotelNotification ? (
            <Button
              data-testid="previous"
              onClick={handlePreviousHotelNotification}
            >
              Previous
            </Button>
          ) : (
            <Button disabled>Previous</Button>
          )}
          <Button>{currentPage}</Button>
          {nextHotelNotification ? (
            <Button data-testid="next" onClick={handleNextHotelNotification}>
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
                  {getHotelNotificationTitle()}
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
                    src="Booking2.jpg"
                    style={{ width: "40%", height: "40%" }}
                    alt="Hotel Booking"
                  />
                )}
                {selectedNotification.type === "Payment" && (
                  <img
                    src="HotelPayment.jpg"
                    height="80%"
                    width="55%"
                    alt="Payment"
                  />
                )}
                {selectedNotification.type === "Password Reset" && (
                  <img
                    src="Reset.jpg"
                    height="40%"
                    width="40%"
                    alt="Password Reset"
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

export default HotelNotifications;
