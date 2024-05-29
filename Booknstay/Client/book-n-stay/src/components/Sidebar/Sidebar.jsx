import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItemText from "@mui/material/ListItemText";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import DashboardIcon from "@mui/icons-material/Dashboard";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import StyledTitle from "../HeaderStyle/HeaderStyle";
import Button from "@mui/material/Button";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import MenuItem from "@mui/material/MenuItem";
import Popover from "@mui/material/Popover";
import GroupIcon from "@mui/icons-material/Group";
import PersonIcon from "@mui/icons-material/Person";
import MeetingRoomIcon from "@mui/icons-material/MeetingRoom";
import LibraryBooksIcon from "@mui/icons-material/LibraryBooks";
import GroupAddIcon from "@mui/icons-material/GroupAdd";
import PasswordIcon from "@mui/icons-material/Password";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";
import { hotelService } from "../../HotelService";
import { ListItemButton } from "@mui/material";
import "./Sidebar.css";
import ReviewsIcon from "@mui/icons-material/Reviews";
import DeleteCustomerAccount from "../DeleteCustomerAccount/DeleteCustomerAccount";
import NotificationsIcon from "@mui/icons-material/Notifications";
import { userService } from "../../UserService";
import { adminServices } from "../../AdminService";

const CollapsibleSidebar = () => {
  const userData = localStorage.getItem("user");
  const user = userData ? JSON.parse(userData) : null;
  const userType = user ? user.userType : null;
  const navigate = useNavigate("");

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isDeleteCustomerOpen, setIsDeleteCustomerOpen] = useState(false);
  const [deleteCustomerId, setDeleteCustomerId] = useState(null);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);
  const [unreadAdminNotificationCount, setUnreadAdminNotificationCount] =
    useState(0);
  const [unreadHotelNotificationCount, setUnreadHotelNotificationCount] =
    useState(0);

  useEffect(() => {
    fetchUnreadNotifications();
  }, []);

  const handleSidebarToggle = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleDashboardToggle = () => {
    setIsDashboardOpen(!isDashboardOpen);
  };

  const handlePopoverOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handlePopoverClose = () => {
    setAnchorEl(null);
  };

  const handleDialogOpen = () => {
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
  };

  const handleDeleteCustomerOpen = () => {
    const customer_id = user?.id;
    setIsDeleteCustomerOpen(true);
    setDeleteCustomerId(customer_id);
  };

  const handleDeleteHotelAccount = async () => {
    try {
      await hotelService.DeleteHotelAccount(user?.id);
      handleLogout();
    } catch (error) {
      if (error.response) {
        Swal.fire({
          position: "top",
          icon: "error",
          title: error.response.data.detail,
          showConfirmButton: false,
          timer: 5000,
        });
      }
    }
    setDialogOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  
  
  const fetchUnreadNotifications = async (userType, setUnreadNotificationCount) => {
    try {
      let response;
      if (userType === 'customer') {
        response = await userService.UnReadCustomerNotificationCount();
        console.log("Resposne",response)
      } else if (userType === 'hotel') {
        response = await hotelService.UnReadHotelNotificationCount();
      } else if (userType === 'admin') {
        response = await adminServices.UnReadAdminNotificationCount();
      }
      if (response && response.data && response.data.unread_count !== undefined) {
        setUnreadNotificationCount(response.data.unread_count);
      } else {
        console.error("Error: Invalid response format");
      }
    } catch (error) {
      console.error("Error fetching unread notification count:", error);
    }
  };
  
  if (userType === 'customer') {
    fetchUnreadNotifications(userType, setUnreadNotificationCount);
  } else if (userType === 'hotel') {
    fetchUnreadNotifications(userType, setUnreadHotelNotificationCount);
  } else if (userType === 'admin') {
    fetchUnreadNotifications(userType, setUnreadAdminNotificationCount);
  } else {
    console.error("Invalid user type");
  }
  
  const open = Boolean(anchorEl);

  return (
    <div>
      <AppBar
        position="static"
        sx={{ backgroundColor: "#333", zIndex: 1 }}
        className="app-bar"
      >
        <Toolbar style={{ display: "flex", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center" }}>
            <IconButton edge="start" color="inherit" onClick={handleSidebarToggle} >
              <MenuIcon data-testid="menuIcon" />
            </IconButton>
            <StyledTitle />
          </div>
          <Typography>
            <Button sx={{ display: "flex", alignItems: "center", marginLeft: "auto", color: "white", }} onClick={handlePopoverOpen} >
              <AccountCircleIcon data-testid="AccountCircleIcon" />
              &nbsp;&nbsp; {user?.first_name}
            </Button>
            <Popover
              data-testid="popover"
              open={open}
              anchorEl={anchorEl}
              onClose={handlePopoverClose}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "right",
              }}
              transformOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
            >
              {userType === "customer" && (
                <MenuItem button component={Link} to="/profile-page">
                  Profile
                </MenuItem>
              )}
              {userType === "hotel" && (
                <MenuItem button component={Link} to="/edit-hotel-details">
                  Profile
                </MenuItem>
              )}
              {userType === "customer" && (
                <MenuItem onClick={handleDeleteCustomerOpen}>
                  Delete Account
                </MenuItem>
              )}

              {isDeleteCustomerOpen && (
                <DeleteCustomerAccount
                  isOpen={isDeleteCustomerOpen}
                  onClose={() => setIsDeleteCustomerOpen(false)}
                  customer_id={deleteCustomerId}
                />
              )}

              {userType !== "admin" &&
                userType !== "supervisor" &&
                userType !== "customer" && (
                  <MenuItem
                    data-testid="delete-account"
                    onClick={handleDialogOpen}
                  >
                    Delete Account
                  </MenuItem>
                )}

              <MenuItem onClick={handleLogout}>Logout</MenuItem>
            </Popover>
          </Typography>
        </Toolbar>
      </AppBar>

      {/* dialog for deleting account */}
      <Dialog open={dialogOpen} onClose={handleDialogClose} data-testid="dialog" >
        <DialogTitle>Delete Account</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete your account?
            <br />
            <br />
            Deleting your account will remove all of your information. This
            cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button variant="contained" style={{ backgroundColor: "#C0C0C0" }} onClick={handleDialogClose} data-testid="cancelbutton" >
            Cancel
          </Button>
          <Button onClick={handleDeleteHotelAccount} color="error" variant="contained" data-testid="deletebutton" >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

      <Drawer open={isSidebarOpen} onClose={handleSidebarToggle} classes={{ paper: "custom-drawer" }} data-testid="drawer" >
        {userType === "hotel" && (
          <List>
            <ListItemButton component={Link} to="/hotel-dashboard">
              <DashboardIcon />
              &nbsp;&nbsp;
              <ListItemText primary="Home" />
            </ListItemButton>
            <ListItemButton component={Link} to="/view-hotel-room-details">
              <MeetingRoomIcon />
              &nbsp;&nbsp;
              <ListItemText primary="Rooms" />
            </ListItemButton>
            <ListItemButton component={Link} to="/view-room-services">
              <MeetingRoomIcon />
              &nbsp;&nbsp;
              <ListItemText primary="Room Services" />
            </ListItemButton>
            <ListItemButton component={Link} to="/list-bookings">
              <LibraryBooksIcon />
              &nbsp;&nbsp;
              <ListItemText primary="Bookings" />
            </ListItemButton>
            <MenuItem
              component={Link}
              to="/hotel-notifications"
              style={{
                display: "flex",
                alignItems: "center",
                position: "relative",
              }}
            >
              <NotificationsIcon />
              &nbsp; Notification{" "}
              <span
                style={{
                  position: "absolute",
                  top: "-3px",
                  right: "100px",
                  backgroundColor:
                    unreadHotelNotificationCount > 0 ? "red" : "transparent",
                  color: "white",
                  borderRadius: "50%",
                  padding: "2px 5px",
                  fontSize: "12px",
                }}
              >
                {unreadHotelNotificationCount}
              </span>{" "}
            </MenuItem>

            <ListItemButton component={Link} to="/change-password">
              <PasswordIcon />
              &nbsp;&nbsp;
              <ListItemText primary="Change Password" />
            </ListItemButton>
            <ListItemButton component={Link} to="/list-reviews-by-hotels">
              <ReviewsIcon />
              &nbsp;&nbsp;
              <ListItemText primary="Your Reviews" />
            </ListItemButton>
          </List>
        )}
        {userType === "customer" && (
          <List>
            <ListItemButton component={Link} to="/reservation-list">
              <LibraryBooksIcon />
              &nbsp;&nbsp;
              <ListItemText primary="My Bookings" />
            </ListItemButton>
            <MenuItem
              component={Link}
              to="/customer-notifications"
              style={{
                display: "flex",
                alignItems: "center",
                position: "relative",
              }}
            >
              <NotificationsIcon />
              &nbsp; Notification{" "}
              <span
                style={{
                  position: "absolute",
                  top: "-3px",
                  right: "100px",
                  backgroundColor:
                    unreadNotificationCount > 0 ? "red" : "transparent",
                  color: "white",
                  borderRadius: "50%",
                  padding: "2px 5px",
                  fontSize: "12px",
                }}
              >
                {unreadNotificationCount}
              </span>
            </MenuItem>

            <ListItemButton component={Link} to="/change-password">
              <PasswordIcon />
              &nbsp;&nbsp;
              <ListItemText primary="Change Password" />
            </ListItemButton>
            <ListItemButton component={Link} to="/review-list">
              <ReviewsIcon />
              &nbsp;&nbsp;
              <ListItemText primary="Your Reviews" />
            </ListItemButton>
          </List>
        )}
        {userType === "admin" && (
          <List>
            <ListItemButton component={Link} to="/supervisor-dashboard">
              <DashboardIcon />
              &nbsp;&nbsp;
              <ListItemText primary="Home" />
            </ListItemButton>
            <ListItemButton onClick={handleDashboardToggle}>
              <GroupIcon />
              &nbsp;&nbsp;
              <ListItemText primary="Users" />
            </ListItemButton>
            {isDashboardOpen && (
              <List style={{ paddingLeft: "20px" }}>
                <ListItemButton component={Link} to="/list-customers">
                  <PersonIcon />
                  &nbsp;&nbsp;
                  <ListItemText primary="Customer" />
                </ListItemButton>
                <ListItemButton component={Link} to="/list-hotels">
                  <PersonIcon />
                  &nbsp;&nbsp;
                  <ListItemText primary="Hotel" />
                </ListItemButton>
                <ListItemButton component={Link} to="/list-supervisor">
                  <GroupAddIcon />
                  &nbsp;&nbsp;
                  <ListItemText primary="Supervisor" />
                </ListItemButton>
              </List>
            )}
            <ListItemButton component={Link} to="/room-type">
              <MeetingRoomIcon />
              &nbsp;&nbsp;
              <ListItemText primary="Room Type" />
            </ListItemButton>
            <ListItemButton component={Link} to="/list-room-details">
              <MeetingRoomIcon />
              &nbsp;&nbsp;
              <ListItemText primary="Room Details" />
            </ListItemButton>
            <ListItemButton component={Link} to="/list-bookings">
              <LibraryBooksIcon />
              &nbsp;&nbsp;
              <ListItemText primary="Bookings" />
            </ListItemButton>
            <MenuItem
              component={Link}
              to="/admin-notifications"
              style={{
                display: "flex",
                alignItems: "center",
                position: "relative",
              }}
            >
              <NotificationsIcon />
              &nbsp; Notification{" "}
              <span
                style={{
                  position: "absolute",
                  top: "-3px",
                  right: "100px",
                  backgroundColor:
                    unreadAdminNotificationCount > 0 ? "red" : "transparent",
                  color: "white",
                  borderRadius: "50%",
                  padding: "2px 5px",
                  fontSize: "12px",
                }}
              >
                {unreadAdminNotificationCount}
              </span>
            </MenuItem>
            <ListItemButton component={Link} to="/change-password">
              <PasswordIcon />
              &nbsp;&nbsp;
              <ListItemText primary="Change Password" />
            </ListItemButton>
          </List>
        )}
        {userType === "supervisor" && (
          <List>
            <ListItemButton component={Link} to="/supervisor-dashboard">
              <DashboardIcon />
              &nbsp;&nbsp;
              <ListItemText primary="Home" />
            </ListItemButton>
            <ListItemButton onClick={handleDashboardToggle}>
              <GroupIcon />
              &nbsp;&nbsp;
              <ListItemText primary="Users" />
            </ListItemButton>
            {isDashboardOpen && (
              <List style={{ paddingLeft: "20px" }}>
                <ListItemButton component={Link} to="/list-customers">
                  <PersonIcon />
                  &nbsp;&nbsp;
                  <ListItemText primary="Customer" />
                </ListItemButton>
                <ListItemButton component={Link} to="/list-hotels">
                  <PersonIcon />
                  &nbsp;&nbsp;
                  <ListItemText primary="Hotel" />
                </ListItemButton>
              </List>
            )}
            <ListItemButton component={Link} to="/change-password">
              <PasswordIcon />
              &nbsp;&nbsp;
              <ListItemText primary="Change Password" />
            </ListItemButton>
          </List>
        )}
      </Drawer>
    </div>
  );
};

export default CollapsibleSidebar;
