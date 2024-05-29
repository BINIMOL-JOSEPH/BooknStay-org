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
import { adminServices } from "../../AdminService";
import Loading from "../Loading/Loading";

const AdminNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [filteredNotifications, setFilteredNotifications] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [nextAdminNotification, setNextAdminNotification] = useState("");
  const [previousAdminNotification, setPreviousAdminNotification] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isNoData, setIsNoData] = useState(true);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [openModal, setOpenModal] = useState(false);

  useEffect(() => {
    const fetchAdminNotifications = async () => {
      try {
        const response = await adminServices.AdminNotifications();

        const updatedNotifications = response.data.results.map(
          (notification) => ({
            ...notification,
          })
        );
        setNotifications(updatedNotifications);
        setNextAdminNotification(response.data.next);
        setPreviousAdminNotification(response.data.previous);
        setLoading(false);
        setIsNoData(response.data.results.length === 0);
      } catch (error) {
        console.error("Error fetching notifications:", error);
        setLoading(false);
      }
    };

    fetchAdminNotifications();
  }, []);

  useEffect(() => {
    filterAdminNotifications(filter);
  }, [notifications, filter]);

  const filterAdminNotifications = (filter) => {
    switch (filter) {
      case "favorites":
        setFilteredNotifications(
          notifications.filter((notification) => notification.is_admin_favorite)
        );
        break;
      case "all":
        setFilteredNotifications(notifications);
        break;
      default:
        setFilteredNotifications([]);
    }
  };

  const deleteAdminNotification = async (notificationId) => {
    try {
      await adminServices.DeleteNotifications(notificationId);
      setNotifications((prevNotifications) =>
        prevNotifications.filter(
          (notification) => notification.id !== notificationId
        )
      );
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  const handleAdminDeleteClicked = async (notificationId) => {
    await deleteAdminNotification(notificationId);
  };

  const handleFilterChange = (value) => {
    setFilter(value);
  };

  const toggleAdminFavorite = async (notificationId, isFavorite) => {
    try {
      const response = await adminServices.ToggleFavoriteNotification(
        notificationId
      );

      if (response.status === 200) {
        const updatedNotifications = notifications.map((n) =>
          n.id === notificationId ? { ...n, is_admin_favorite: isFavorite } : n
        );
        setNotifications(updatedNotifications);
      }
    } catch (error) {
      console.error("Error toggling favorite status:", error);
    }
  };

  const handleNextAdminNotification = () => {
    axiosPrivate.get(nextAdminNotification).then((response) => {
      setNotifications(response.data.results);
      setNextAdminNotification(response.data.next);
      setPreviousAdminNotification(response.data.previous);
      setCurrentPage(currentPage + 1);
    });
  };

  const handlePreviousAdminNotification = () => {
    axiosPrivate.get(previousAdminNotification).then((response) => {
      setNotifications(response.data.results);
      setNextAdminNotification(response.data.next);
      setPreviousAdminNotification(response.data.previous);
      setCurrentPage(currentPage - 1);
    });
  };

  const handleNotificationClick = async (notification) => {
    setSelectedNotification(notification);
    setOpenModal(true);
    await ReadAdminNotification(notification.id);
    const updatedNotifications = notifications.map((n) =>
      n.id === notification.id ? { ...n, is_admin_read: true } : n
    );
    setNotifications(updatedNotifications);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  const ReadAdminNotification = async (notificationId) => {
    try {
      await adminServices.ReadAdminNotification(notificationId);
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const getAdminNotificationTitle = () => {
    if (!selectedNotification) {
      return "Unknown Notification Type";
    }

    const { type } = selectedNotification;
    if (type === "Hotel Booking") {
      return "New booking to hotel";
    } else if (type === "Payment") {
      return "Payment Successful";
    } else if (type === "Customer Registration") {
      return "New Customer Registration";
    } else if (type === "Hotel Registration") {
      return "New Hotel Registration";
    } else {
      return "Unknown Notification Type";
    }
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <>
      <NotificationHeader
        isNoData={isNoData}
        handleFilterChange={handleFilterChange}
        filteredNotifications={filteredNotifications}
        currentPage={currentPage}
        toggleFavorite={toggleAdminFavorite}
        handleDeleteClicked={handleAdminDeleteClicked}
        filter={filter}
        handleNotificationClick={handleNotificationClick}
        fontWeight={600}
        userType="admin"
      />
      {!isNoData && (
        <Stack sx={{ mt: 2, ml: "79%" }} direction="row">
          {previousAdminNotification ? (
            <Button
              data-testid="previous"
              onClick={handlePreviousAdminNotification}
            >
              Previous
            </Button>
          ) : (
            <Button disabled>Previous</Button>
          )}
          <Button>{currentPage}</Button>
          {nextAdminNotification ? (
            <Button data-testid="next" onClick={handleNextAdminNotification}>
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
                  {getAdminNotificationTitle()}
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
                    src="Booking1.jpg"
                    style={{ width: "40%", height: "40%" }}
                    alt="Hotel Booking"
                  />
                )}
                {selectedNotification.type === "Payment" && (
                  <img
                    src="Admin_Salary.jpg"
                    height="60%"
                    width="40%"
                    alt="Payment"
                  />
                )}

                {selectedNotification.type === "Customer Registration" && (
                  <img
                    src="CustomerRegister.jpg"
                    style={{ width: "40%", height: "40%" }}
                    alt="Hotel Booking"
                  />
                )}
                {selectedNotification.type === "Hotel Registration" && (
                  <img
                    src="HotelRegister.jpg"
                    style={{ width: "40%", height: "40%" }}
                    alt="Hotel Booking"
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

export default AdminNotifications;
