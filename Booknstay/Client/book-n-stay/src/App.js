import React, {useEffect} from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import CustomerRegistration from "./components/CustomerRegistration/CustomerRegistration";
import Login from "./components/Login/Login";
import Dashboard from "./components/Dashboard/Dashboard";
import ListCustomer from "./components/ListCustomer/ListCustomer";
import ListHotels from "./components/ListHotels/ListHotels";
import AddSupervisor from "./components/AddSupervisor/AddSupervisor";
import EditUser from "./components/EditUser/EditUser";
import HotelRegistration from "./components/HotelRegistration/HotelRegistration";
import ViewHotel from "./components/ViewApproveRejectHotel/ViewApproveRejectHotel";
import ViewCustomer from "./components/ViewCustomer/ViewCustomer";
import ForgotPassword from "./components/ForgotPassword/ForgotPassword";
import ResetPassword from "./components/ResetPassword/ResetPassword";
import ExpiredLinkPage from "./components/ExpiredLinkPage/ExpiredLinkPage";
import ChangePassword from "./components/ChangePassword/ChangePassword";
import RoomDetails from "./components/RoomDetails/RoomDetails";
import VerifyEmail from "./components/VerifyEmail/VerifyEmail";
import ViewRoomDetails from "./components/ViewRoomDetails/ViewRoomDetails";
import RoomType from "./components/RoomType/RoomType";
import ListRoomDetails from "./components/AdminViewRoomDetails/AdminViewRoomDetails";
import CollapsibleSidebar from "./components/Sidebar/Sidebar";
import EditHotelDetails from "./components/EditHotelDetails/EditHotelDetails";
import PropTypes from "prop-types";
import Supervisor from "./components/ListSupervisor/ListSupervisors";
import EditRoomDetails from "./components/EditRoomDetails/EditRoomDetails";
import NotFound from "./components/NotFound/NotFound";
import PrivateHotelRoute from "./components/PrivateHotelRoutePath";
import PrivateAdminRoute from "./components/PrivateAdminRoutePath";
import PrivateCustomerRoutePath from "./components/PrivateCustomerRoutePath";
import BookingRooms from "./components/BookingRooms/BookingRooms";
import ViewHotelRooms from "./components/ViewHotelsByCustomer/ViewHotelAndRoomDetails";
import Review from "./components/Review/Review";
import SelectHotels from "./components/ViewHotelsByCustomer/ViewHotelsByCustomer";
import DeleteRoomDetails from "./components/DeleteRoomDetails/DeleteRoomDetails";
import ListReviewByUser from "./components/UpdateReviews/ListReviews";
import ReviewUpdate from "./components/UpdateReviews/ReviewUpdate";
import RoomServices from "./components/RoomServices/RoomServices";
import PaymentCalculation from "./components/Payment/PaymentCalculation";
import CheckoutForm from "./components/Payment/PaymentCheckout";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import DeleteSuperVisor from "./components/DeleteSuperVisor/DeleteSuperVisor";
import PaymentInvoice from "./components/Payment/PaymentInvoice";
import InvoiceDownload from "./components/Payment/InvoicePrevire";
import ListReviewByHotels from "./components/ListReviewsByHotels/ListReviewsByHotels";
import ViewRoomServices from "./components/ViewRoomServices/ViewRoomServices";
import EditRoomServices from "./components/EditRoomServices/EditRoomServices";
import ListBookings from "./components/ListBookings/ListBookings";
import DeleteRoomServices from "./components/DeleteRoomServices/DeleteRoomServices";
import CustomerReservationList from "./components/CustomerReservationList/CustomerReservationList";
import PrivateSupervisorAdminRoute from "./components/PrivateSupervisorAdminRoutePath";
import DeleteCustomerAccount from "./components/DeleteCustomerAccount/DeleteCustomerAccount";
import HotelDashboard from "./components/HotelDashboard/HotelDashbard";
import ManageResource from "./components/ViewCustomer/ManageResource";
import SupervisorDashboard from "./components/Sidebar/SupervisorDashboard";
import AdminNotifications from "./components/Notifications/AdminNotifications";
import CustomerNotifications from "./components/Notifications/CustomerNotifications";
import HotelNotifications from "./components/Notifications/HotelNotifications";
import ProfilePage from "./components/ProfilePage/ProfilePage";

const stripePromise = loadStripe(
  "pk_test_51OgfktSH5Ttsih91N6JwISv4CvJa2zBdo9vi8A4SSvhwogRbNKxXuAf8lRe7RT7TkGQyvTtzSyKbREbkb0Bwmk4e00EuTd2Odj"
);

const isAuthenticated = () => {
  const refreshToken = localStorage.getItem("token");
  return !!refreshToken;
};

const PrivateRoute = ({ element, path }) => {
  return isAuthenticated() ? (
    element
  ) : (
    <Navigate to="/login" replace state={{ from: path }} />
  );
};
const userData = localStorage.getItem('user');
  const user = userData ? JSON.parse(userData) : null;
  const userType = user ? user.userType : null;



const PublicRoute = ({ element, path }) => {
  
  if (isAuthenticated()) {
    if (userType === "admin") {
      return <Navigate to="/supervisor-dashboard" replace state={{ from: path }} />;
    } 
   else  if (userType === "hotel") {
      return <Navigate to="/hotel-dashboard" replace state={{ from: path }} />;
    }
    else  if (userType === "supervisor") {
      return <Navigate to="/supervisor-dashboard" replace state={{ from: path }} />;
    }else {
      return <Navigate to="/select-hotels" replace state={{ from: path }} />;
    }
  } else {
    return element;
  }
};
const ProtectedRoute = ({ element, path }) => {
  return !isAuthenticated() ? (
    <Navigate to="/not-found" replace state={{ from: path }} />
  ) : (
    element
  );
};

PrivateRoute.propTypes = {
  element: PropTypes.element.isRequired,
  path: PropTypes.string.isRequired,
};

PublicRoute.propTypes = {
  element: PropTypes.element.isRequired,
  path: PropTypes.string.isRequired,
};
ProtectedRoute.propTypes = {
  element: PropTypes.element.isRequired,
  path: PropTypes.string.isRequired,
};

function App() {
  useEffect(() => {
    const handleBackButton = (event) => {
      event.preventDefault();

      const select_hotel_regex = /^\/view-selected-hotels\/\d+\/?$/;
      const book_room_regex = /^\/book-rooms\/\d+\/?$/;
      if (userType === 'customer' && (select_hotel_regex.test(window.location.pathname) || book_room_regex.test(window.location.pathname))) {
        window.location.href = "/";
      }
        
    };

    window.addEventListener("popstate", handleBackButton);

    return () => window.removeEventListener("popstate", handleBackButton);
  }, []);

  return (
    <Router>
      <Routes>
        <Route
          path="/customer-registration"
          element={<CustomerRegistration />}
        />
        <Route
          path="/login/:roomId?"
          element={<PublicRoute element={<Login />}/>}
        />
        <Route path="/"  element={<SelectHotels />}/>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/expired-link" element={<ExpiredLinkPage />} />
        <Route
          path="/change-password"
          element={
            <ProtectedRoute
              element={<ChangePassword />}
              path="/change-password"
            />
          }
        />
        <Route
          path="/room-details"
          element={<PrivateHotelRoute element={<RoomDetails />} />}
        />
        <Route
          path="/list-customers"
          element={<PrivateSupervisorAdminRoute element={<ListCustomer />} />}
        />
        <Route
          path="/list-hotels"
          element={<PrivateSupervisorAdminRoute element={<ListHotels />} />}
        />
        <Route path="/verify-email/:id/" element={<VerifyEmail />} />
        <Route
          path="/room-type"
          element={<PrivateAdminRoute element={<RoomType />} />}
        />
        <Route
          path="/add-supervisor"
          element={<PrivateAdminRoute element={<AddSupervisor />} />}
        />
        <Route
          path="/edit-user"
          element={<PrivateCustomerRoutePath element={<EditUser />} />}
        />
        <Route path="/hotel-registration" element={<HotelRegistration />} />
        <Route
          path="/view-hotel-room-details"
          element={<PrivateHotelRoute element={<ViewRoomDetails />} />}
        />
        <Route
          path="/view-hotel/:id?"
          element={<PrivateSupervisorAdminRoute element={<ViewHotel />} />}
        />
        <Route
          path="/list-room-details"
          element={
            <PrivateSupervisorAdminRoute element={<ListRoomDetails />} />
          }
        />
        <Route path="/sidebar" element={<CollapsibleSidebar />} />
        <Route path="/edit-hotel-details" element={<PrivateHotelRoute element={<EditHotelDetails />} />}/>
        <Route
          path="/edit-room-details/:room_details_id"
          element={<PrivateHotelRoute element={<EditRoomDetails />} />}
        />
        <Route
          path="/list-supervisor"
          element={<PrivateAdminRoute element={<Supervisor />} />}
        />
        <Route
          path="/view-customer/:id?"
          element={<PrivateAdminRoute element={<ViewCustomer />} />}
        />
        <Route path="/not-found" element={<NotFound />} />
        <Route
          path="/book-rooms/:id/"
          element={<PrivateCustomerRoutePath element={<BookingRooms /> } />}
        />
        <Route path="/view-selected-hotels/:id?/" element={<ViewHotelRooms />}/>
        <Route path="/review/:hotel_id/" element={<Review />} />
        <Route path="/select-hotels" element={<SelectHotels />}/>
        <Route
          path="/delete-room-details/:roomId"
          element={<PrivateHotelRoute element={<DeleteRoomDetails />} />}
        />
        <Route
          path="/edit-room-details/:room_details_id"
          element={<EditRoomDetails />}
        />
        <Route path="/review/:hotel_id/" element={<Review />} />
        <Route path="/review-list" element={<ListReviewByUser />} />
        <Route path="/review-update/:review_id/" element={<ReviewUpdate />} />
        <Route
          path="/add-room-services"
          element={<PrivateHotelRoute element={<RoomServices />} />}
        />
        <Route
          path="/view-payment-details/:id?"
          element={<PrivateCustomerRoutePath element={<PaymentCalculation />} />}
        />
        <Route
          path="/checkout"
          element={
            <Elements stripe={stripePromise}>
              <CheckoutForm />
            </Elements>
          }
        />
        <Route
          path="/delete-supervisor/:supervisorId"
          element={<PrivateAdminRoute element={<DeleteSuperVisor />} />}
        />
        <Route
          path="/payment-invoice/:id/"
          element={<PrivateCustomerRoutePath element={<PaymentInvoice />} />}
        />
        <Route
          path="/download-invoice/:id/"
          element={<PrivateCustomerRoutePath element={<InvoiceDownload />} />}
        />
        <Route 
          path="/list-reviews-by-hotels" 
          element={<ListReviewByHotels />} 
        />
          <Route
          path="/view-room-services"
          element={<PrivateHotelRoute element={<ViewRoomServices />} />}
        />
        <Route
          path="/edit-room-services/:room_service_id"
          element={<PrivateHotelRoute element={<EditRoomServices />} />}
        />   
        <Route
          path="/delete-supervisor/:supervisorId"
          element={<PrivateAdminRoute element={<DeleteSuperVisor />} />}
        />
        <Route path='/list-bookings' element={<ListBookings/>} />     
        <Route
          path="/delete-room-services/:roomserviceId"
          element={<PrivateHotelRoute element={<DeleteRoomServices />} />}
        />
        <Route
          path="/suspend-hotel/:resource_id"
          element={<ManageResource resourceType="hotel" action="suspend" />}
        />
        <Route
          path="/delete-hotel/:resource_id"
          element={<ManageResource resourceType="hotel" action="delete" />}
        />
        <Route
          path="/suspend-customer/:resource_id"
          element={<ManageResource resourceType="customer" action="suspend" />}
        />
        <Route
          path="/delete-customer/:resource_id"
          element={<ManageResource resourceType="customer" action="delete" />}
        />
        <Route
          path="/activate-customer/:resource_id"
          element={<ManageResource resourceType="customer" action="activate" />}
        />

        <Route
          path="/activate-hotel/:resource_id"
          element={<ManageResource resourceType="hotel" action="activate" />}
        />
        <Route
          path="/delete-customer-account/"
          element={
            <PrivateCustomerRoutePath element={<DeleteCustomerAccount />} />
          }
        />
        <Route
          path="/hotel-dashboard"
          element={<PrivateHotelRoute element={<HotelDashboard />} />}
        />
        <Route
          path="/supervisor-dashboard"
          element={
            <PrivateSupervisorAdminRoute element={<SupervisorDashboard />} />
          }
        />
        <Route
          path="/reservation-list"
          element={<PrivateCustomerRoutePath element={<CustomerReservationList />} />}
        />
         <Route
          path="/admin-notifications"
          element={
            <PrivateSupervisorAdminRoute element={<AdminNotifications />} />
          }
        />
         <Route
          path="/hotel-notifications"
          element={
            <PrivateHotelRoute element={<HotelNotifications />} />
          }
        />
         <Route
          path="/customer-notifications"
          element={
            <PrivateCustomerRoutePath element={<CustomerNotifications />} />
          }
        />
        <Route path='/profile-page' element={<ProfilePage /> } />

      </Routes>
    </Router>
  );
}

export default App;
