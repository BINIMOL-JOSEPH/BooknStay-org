import { axiosPrivate } from './interceptor';


const AddRoomType = (data) => {
  return axiosPrivate.post(`hotel/add-room-type/`, data);
};

const ListRoomType = (params) => {
  return axiosPrivate.get('hotel/list-room-types/', { params: { query: params.query } });
}

const ListRoomTypeByDate = (date) => {
  return axiosPrivate.get(`hotel/list-room-types-by-date/${date}`);
}

const CreateSupervisor = (data) => {
  return axiosPrivate.post(`user/create-supervisor/`, data);
};

const ListRoomDetails = (params) => {
  return axiosPrivate.get(`hotel/admin-view-room-details/`, { params: { query: params.query } });
}

const ListRoomDetailsById = (id) => {
  return axiosPrivate.get(`hotel/list-room-details-by-id/${id}/`);
}

const ListSupervisor = (params) => {
  return axiosPrivate.get(`user/list-supervisors/`, { params: { query: params.query } });
}
const DeleteSuperVisor = (supervisorId) =>{
  return axiosPrivate.post(`user/delete-supervisor/${supervisorId}/`)
}

const ListAdditionalServices = (room_id) => {
  return axiosPrivate.get(`hotel/admin_list_activities_of_room/${room_id}/`);
}

const SuspendHotel = (hotel_id) =>{
  return axiosPrivate.post(`hotel/suspend-hotel/${hotel_id}/`)
}
const DeleteHotel = (hotel_id) =>{
  return axiosPrivate.post(`hotel/delete-hotel/${hotel_id}/`)
}
const SuspendCustomer = (customer_id) =>{
  return axiosPrivate.post(`user/suspend-customer/${customer_id}/`)
}
const ActivateCustomer = (customer_id) =>{
  return axiosPrivate.post(`user/activate-customer/${customer_id}/`)
}
const DeleteCustomer = (customer_id) =>{
  return axiosPrivate.post(`user/delete-customer/${customer_id}/`)
}
const ActivateHotel = (hotel_id) =>{
  return axiosPrivate.post(`hotel/activate-hotel/${hotel_id}/`)
}
const CountList = () =>{
  return axiosPrivate.get(`user/count-list/`)
}
const HotelBookingGraph = () =>{
  return axiosPrivate.get(`user/hotel-booking-graph/`)
}

const CountListHotels = () =>{
  return axiosPrivate.get(`user/count-list-hotels/`)
}
const HotelReviewGraph = () =>{
  return axiosPrivate.get(`user/most-reviewd-hotel/`)
}
const AdminNotifications = () => {
  return axiosPrivate.get('user/admin-notifications/');
}


const DeleteNotifications = (notificationId) =>{
  return axiosPrivate.post(`user/delete-notifications/${notificationId}/`)
}
const ToggleFavoriteNotification = (notificationId) => {
  return axiosPrivate.post(`/user/add-favorite-notification/${notificationId}/`);

};
const ReadAdminNotification = (notificationId) => {
  return axiosPrivate.post(`/user/read-admin-notification/${notificationId}/`);

};

const UnReadAdminNotificationCount = ()=>{
  return axiosPrivate.get(`user/unread-admin-notification-count/`)
}


const adminServices={
    AddRoomType,
    ListRoomType,
    CreateSupervisor,
    ListRoomDetails,
    ListRoomTypeByDate,
    ListRoomDetailsById,
    ListSupervisor,
    ListAdditionalServices,
    DeleteSuperVisor,
    SuspendHotel,
    DeleteHotel,
    SuspendCustomer,
    ActivateCustomer,
    DeleteCustomer,
    ActivateHotel,
    CountList,
    HotelBookingGraph,
    CountListHotels,
    HotelReviewGraph,
    AdminNotifications,
    DeleteNotifications,
    ToggleFavoriteNotification,
    ReadAdminNotification,
    UnReadAdminNotificationCount



}

export {adminServices}