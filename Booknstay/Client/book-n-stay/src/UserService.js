import { axiosPrivate } from './interceptor';

const CustomerRegistration = (data) => {
  return axiosPrivate.post(`user/customer-register/`, data);
};
const LoginUser = (data) => {
  return axiosPrivate.post(`user/login/`, data);
};

const FetchUser = (params) => {
  return axiosPrivate.get(`user/customer-details/`,{ params: { query: params.query } });
};

const FetchUserByStatus = (status) => {
  return axiosPrivate.get(`user/customers-by-status/${status}/`);
};

const ForgotPassword = (data) => {
  return axiosPrivate.post(`user/forgotpassword/`,data)
}
const ResetPassword = (token,data) =>{
  return axiosPrivate.post(`user/resetpassword/${token}/`,data)
}
const CheckTokenExpired = (token)=>{
  return axiosPrivate.get(`user/checktokenexpiry/${token}/`,token)
}
const ChangePassword = async(data) =>{
  return axiosPrivate.post(`user/changepassword/`,data)
}

const EditUser = (data) =>{
  return axiosPrivate.put(`user/edit-customer/`,data);
}

const GetEditUser = (data) =>{
  return axiosPrivate.get(`user/edit-customer/`,data);
}

const VerifyEmail = (id) => {
  return axiosPrivate.get(`user/verify-email/${id}/`);
}

const Review = (data, id) => {
  return axiosPrivate.post(`hotel/review/${id}/`, data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
}

const ViewCustomer = (id) =>{
  return axiosPrivate.get(`user/view-customer/${id}/`)
}

const SuspendCustomer = (id) =>{
  return axiosPrivate.post(`user/suspend-customer/${id}/`)
}

const DeleteCustomer = (id) =>{
  return axiosPrivate.post(`user/delete-customer/${id}/`)
}

const GetReview = () => {
  return axiosPrivate.get('hotel/get-review/')
}

const GetReviewById = (id) => {
  return axiosPrivate.get(`hotel/review-update/${id}/`);
}

const UpdateReview = (id, data) => {
  return axiosPrivate.put(`hotel/review-update/${id}/`, data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
}

const DeleteReview = (id) => {
  return axiosPrivate.put(`hotel/review-delete/${id}/`);
}
const DeleteCustomerAccount = (customer_id) =>{
  return axiosPrivate.put(`user/delete-customer-account/${customer_id}/`)
}

const CancelBooking = (booking_id)=>{
  return axiosPrivate.post(`hotel/cancel-bookings/${booking_id}/`)
}

const GetUserData = ()=>{
  return axiosPrivate.get(`user/get-user-data/`)
}
const CustomerNotifications = () => {
  return axiosPrivate.get('user/customer-notifications/');
}
const DeleteCustomerNotifications = (notificationId) =>{
  return axiosPrivate.post(`user/delete-customer-notifications/${notificationId}/`)
}
const ToggleFavoriteNotificationByCustomer = (notificationId) => {
  return axiosPrivate.post(`/user/add-favorite-notification-customer/${notificationId}/`);

};
const ReadCustomerNotification = (notificationId) => {
  return axiosPrivate.post(`/user/read-customer-notification/${notificationId}/`);

};

const UnReadCustomerNotificationCount = ()=>{
  return axiosPrivate.get(`user/unread-customer-notification-count/`)
}

const userService={
    
    CustomerRegistration,
    LoginUser,
    FetchUser,
    FetchUserByStatus,
    ForgotPassword,
    ResetPassword,
    CheckTokenExpired,
    ChangePassword,
    GetEditUser,
    EditUser,
    VerifyEmail,
    Review,
    ViewCustomer,
    SuspendCustomer,
    DeleteCustomer,
    GetReview,
    GetReviewById,
    UpdateReview,
    DeleteReview,
    DeleteCustomerAccount,
    CancelBooking,
    GetUserData,
    CustomerNotifications,
    DeleteCustomerNotifications,
    ToggleFavoriteNotificationByCustomer,
    ReadCustomerNotification,
    UnReadCustomerNotificationCount

}

export {userService}

