import { axiosPrivate } from './interceptor';

const HotelRegistration = (data) => {
  return axiosPrivate.post(`hotel/hotel-register/`, data);
};

const GetHotelDetails = (data) =>{
  return axiosPrivate.get(`hotel/edit-hotel-details/`,data);
}

const EditHotelDetails = (data) =>{
  return axiosPrivate.put(`hotel/edit-hotel-details/`,data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
}
const DeleteHotelAccount = (hotelId) => {
  return axiosPrivate.put(`hotel/delete-hotel-account/${hotelId}/`);
};

const GetroomTypes = () => {
    return axiosPrivate.get(`hotel/get-room-types/`);
  };
  const RoomDetails = (data) => {
    return axiosPrivate.post(`hotel/add-room-details/`,data,{
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  };

const FetchHotel = (params) => {
  return axiosPrivate.get(`hotel/hotel-details/`,{ params: { query: params.query } });
};

const FetchHotelByStatus = (status) => {
  return axiosPrivate.get(`hotel/hotels-by-status/${status}/`);
}

const ListHotelRoomDetails = (params) => {
  return axiosPrivate.get(`hotel/list-hotel-room-details/`,{ params: {query: params.query}});
};


const ViewHotel = (id) =>{
  return axiosPrivate.get(`hotel/view-hotel/${id}/`)
}

const ApproveHotel = (hotel_id) =>{
  return axiosPrivate.post(`hotel/approve-hotel/${hotel_id}/`)
}

const RejectHotel = (hotel_id) =>{
  return axiosPrivate.post(`hotel/reject-hotel/${hotel_id}/`)
}
const GetEditRoomDetails = (room_details_id) => {
  return axiosPrivate.get(`hotel/edit-room-details/${room_details_id}/`);
};

const EditRoomDetails = (roomId, updatedRoomDetails) => {
  return axiosPrivate.put(`hotel/edit-room-details/${roomId}/`, updatedRoomDetails,{ headers: {
    "Content-Type": "multipart/form-data",
  },}
 )
  ;
};
const ListHotelRoomDetailsByStatus = (roomdetailstatus) => {
  return axiosPrivate.get(`hotel/list-hotel-room-details-by-status/${roomdetailstatus}/`);
}


const DeleteRoomDetails = (roomid) =>{
  return axiosPrivate.delete(`hotel/delete-room-details/${roomid}/`)
}
const RoomServices = (data) => {
  return axiosPrivate.post(`hotel/add-room-services/`, data,{ headers: {
    "Content-Type": "multipart/form-data",
  },}
 )
  ;
};

const FetchHotelRoom =(id, data) =>{
  return axiosPrivate.post(`hotel/hotel-room-details/${id}/`,data)
}

const FetchActiveHotel=()=>{
  return axiosPrivate.get(`hotel/list-active-hotels/`)
}
  
const FetchSelectedHotel =(data) =>{
  return axiosPrivate.post(`hotel/select-hotels/`,data)
}

const FetchPaymentInvoice =(id) =>{
  return axiosPrivate.get(`hotel/payment_details/${id}/`)
}

const DownloadPaymentInvoice =(id) =>{
  return axiosPrivate.get(`hotel/download_payment_invoice/${id}/`)
}
  
const FetchReviewsByHotels = () => {
  return axiosPrivate.get('hotel/list-reviews-by-hotels/');
}

const AddFeedbacks = (review_id, data) => {
  return axiosPrivate.post(`hotel/add-feedbacks/${review_id}/`, data);
}
  
const PaymentDetails =(id) =>{
  return axiosPrivate.get(`hotel/payment-calculation/${id}/`)
}

const PaymentConfirmation =(data) =>{
  return axiosPrivate.post(`hotel/payment-confirmation/`,data)
}

const PaymentCheckout =(data)=>{
  return axiosPrivate.post(`hotel/create_payment_checkout/`,data)
};
const ListRoomServices = (data) => {
  return axiosPrivate.get(`hotel/view-room-services/`,data);
};
const GetEditRoomService = (room_details_id) => {
  return axiosPrivate.get(`hotel/edit-room-services/${room_details_id}/`);
};

const EditRoomServices = (room_services_id, updatedRoomServcies) => {
  return axiosPrivate.put(`hotel/edit-room-services/${room_services_id}/`, updatedRoomServcies,{ headers: {
    "Content-Type": "multipart/form-data",
  },}
 );
};
const DeleteRoomServices = (roomserviceId) =>{
  return axiosPrivate.delete(`hotel/delete-room-services/${roomserviceId}/`)
}

const ReservationList = (data,params) => {
  return axiosPrivate.post(`hotel/reservation-list/`,{ params: { query: params.query },data });
};

const SortCustomerReservation = (sort_by) => {
  return axiosPrivate.get(`hotel/sort-customer-reservation/${sort_by}/`);
};
const ListBookings = (params) =>{
  return axiosPrivate.get(`hotel/list-booking-details/`, { params: {query: params.query}});
}

const SortBookings = (sortBy) =>{
  return axiosPrivate.get(`hotel/sort-booking-details/${sortBy}/`);
}

const FetchAdditionalServices =() =>{
  return axiosPrivate.get(`hotel/list-room-additional-activities/`);
}

const AddAdditionalServices =(room_id, additional_activites_id) =>{
  return axiosPrivate.post(`hotel/add-room-additional-activities/${room_id}/${additional_activites_id}/`);
}

const ListServicesAddedToRooms = (room_id) => {
  return axiosPrivate.get(`hotel/hotel_list_activities_of_room/${room_id}/`);
}

const DeleteServicesAddedToRooms = (room_id, service_id) => {
  return axiosPrivate.put(`hotel/hotel_delete_activities_of_room/${room_id}/${service_id}/`);
}

const ServicesById = (service_id) => {
  return axiosPrivate.get(`hotel/list-services-by-id/${service_id}/`);
}
  
const BookHotelRoom = (data) =>{
  return axiosPrivate.post(`hotel/book-hotel-room/`,data)
}

const GetCustomerBookings = (booking_id)=>{
  return axiosPrivate.get(`hotel/get-customer-booking/${booking_id}/`)
}

const FetchPaymentDetails = (booking_id) =>{
  return axiosPrivate.get(`hotel/view-payment-details/${booking_id}/`);
}
const HotelProfile = () => {
  return axiosPrivate.get('hotel/hotel-profile/');
}
const GettodayHotelDetails = () => {
  return axiosPrivate.get('hotel/today-booking-count/');
}
const GetPayementPercentage = () => {
  return axiosPrivate.get('hotel/payment-percentage/');
}
const GetSelectedWeekBookings = (start_date, end_date) => {
  return axiosPrivate.get(`hotel/selected-week-bookings/?start_date=${start_date}&end_date=${end_date}`);
}
const RecentReview = () =>{
  return axiosPrivate.get(`hotel/recent-reviews/`)
}

const FetchReview = (id) =>{
  return axiosPrivate.get(`hotel/hotel-reviews-for-customer/${id}/`);
}

const RoomAndServicesCount = () => {
  return axiosPrivate.get('hotel/count-room-and-services/');
}

const CancelIncompleteBooking = (booking_id)=>{
  return axiosPrivate.post(`hotel/cancel-incomplete-bookings/${booking_id}/`)
}

const ActivateRoom = (room_id)=>{
  return axiosPrivate.put(`hotel/activate-room-details/${room_id}/`);
}

const SortActiveHotel =(data) =>{
  return axiosPrivate.post(`hotel/sort-active-hotels/`,data)
}
const HotelNotifications = () => {
  return axiosPrivate.get('hotel/hotel-notifications/');
}
const DeleteHotelNotifications = (notificationId) =>{
  return axiosPrivate.post(`hotel/delete-hotel-notifications/${notificationId}/`)
}
const ToggleFavoriteNotificationByHotel = (notificationId) => {
  return axiosPrivate.post(`/hotel/add-favorite-notification/${notificationId}/`);

};

const ReadHotelNotification = (notificationId) => {
  return axiosPrivate.post(`/hotel/read-hotel-notification/${notificationId}/`);

};

const UnReadHotelNotificationCount = ()=>{
  return axiosPrivate.get(`hotel/unread-hotel-notification-count/`)
}
const hotelService={
    
    HotelRegistration,
    GetHotelDetails,
    EditHotelDetails,
    DeleteHotelAccount,
    FetchHotel,
    FetchHotelByStatus,
    ViewHotel,
    ApproveHotel,
    RejectHotel,
    RoomDetails,
    GetroomTypes,
    ListHotelRoomDetails,
    FetchActiveHotel,
    FetchSelectedHotel,
    GetEditRoomDetails,
    EditRoomDetails,
    BookHotelRoom,
    DeleteRoomDetails,
    GetCustomerBookings,
    FetchHotelRoom,
    RoomServices,
    PaymentDetails,
    PaymentConfirmation,
    ListHotelRoomDetailsByStatus,
    FetchPaymentInvoice,
    DownloadPaymentInvoice,
    FetchReviewsByHotels,
    AddFeedbacks,
    ListRoomServices,
    EditRoomServices,
    ReservationList,
    SortCustomerReservation,
    ListBookings,
    SortBookings,
    PaymentCheckout,
    FetchAdditionalServices,
    AddAdditionalServices,
    ListServicesAddedToRooms,
    DeleteServicesAddedToRooms,
    GetEditRoomService,
    DeleteRoomServices,
    FetchPaymentDetails,
    ServicesById,
    HotelProfile,
    GettodayHotelDetails,
    GetPayementPercentage,
    GetSelectedWeekBookings,
    RecentReview,
    FetchReview,
    RoomAndServicesCount,
    CancelIncompleteBooking,
    ActivateRoom,
    SortActiveHotel,
    HotelNotifications,
    DeleteHotelNotifications,
    ToggleFavoriteNotificationByHotel,
    ReadHotelNotification,
    UnReadHotelNotificationCount



}

export {hotelService}


