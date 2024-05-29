from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from user_app.models import Login,Customer,Notification
from book_n_stay.pagination import CustomPagination
from book_n_stay.permissions import (
    AdminPermission,
    AdminSupervisorPermission,
    CustomerPermission,
    HotelAdminPermission,
    HotelPermission,
    CustomerPermission,
    HotelAdminSupervisorPermission
)
from rest_framework.permissions import IsAuthenticated
from django.core.files.uploadedfile import InMemoryUploadedFile
from django.db.models import Q
from django.core.mail import send_mail
from django.utils.html import format_html
from book_n_stay import settings
from django.utils import timezone
from django.template.loader import render_to_string
from django.shortcuts import get_object_or_404
from django.core.exceptions import ValidationError
from hotel_app.serializer import (
    HotelSerializer,
    RoomTypeSerializer,
    RoomDetailsSerializer,
    RoomImagesSerializer,
    EditHotelSerializer,
    ListHotelSerializer,
    RoomServicesSerializer,
    RoomsAdditionalActivitesSerializer,
    ReviewSerializer,
    BookingSerializer,
    PaymentSerializer,
    ReviewImageSerializer
)
from datetime import datetime, timedelta, date
from rest_framework import serializers 
from rest_framework.parsers import MultiPartParser,FormParser
from hotel_app.models import (
    Hotel,
    RoomType,
    RoomDetails,
    RoomImages,
    RoomServices,
    Booking,
    Payment,
    Review,
    RoomAdditionalActivites,
    ReviewImage
)
from user_app.models import Customer
from io import BytesIO
from django.http import HttpResponse
from xhtml2pdf import pisa
from django.template.loader import render_to_string
import os
from decimal import Decimal
import stripe
from django.db.models import Min,Avg,Sum
from django.http import JsonResponse
from django.db.models.functions import Coalesce
import pytz
from django.http import Http404
from rest_framework.exceptions import NotFound, ValidationError
from book_n_stay.paginations import CustomPaginations
from user_app.views import get_human_readable_time
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.utils.html import strip_tags



# Create your views here.

#search
def search_room_type(query):
    search_result = RoomType.objects.filter(
        Q(room_type__icontains=query) 
    )
    return search_result


def search_user_details(query):

    search_result = Hotel.objects.filter(
        Q(hotel_name__icontains=query) |  
        Q(city__icontains=query) |   
        Q(district__icontains=query) | 
        Q(email__icontains=query) 
   
    )
    return search_result

def search_room_details(hotel_id, query):
    search_result = RoomDetails.objects.filter(
        hotel_id=hotel_id
    ).filter(
        Q(room_type_id__room_type__icontains=query) |
        Q(number_of_rooms__icontains=query) |
        Q(rate__icontains=query)
    )
    return search_result

def search_room_services(hotel_id, query):
    search_result = RoomServices.objects.filter(
        hotel_id=hotel_id
    ).filter(
        Q(title__icontains=query)
    )
    return search_result

def search_booking_details(query):
    search_result = Booking.objects.filter(
        Q(booked_at__icontains=query) |
        Q(check_in_date__icontains=query) |
        Q(phone_number__icontains=query) | 
        Q(guest_name__icontains=query) 
    )
    return search_result

def search_admin_room_details(query):
    search_result = RoomDetails.objects.filter(
        Q(room_type_id__room_type__icontains=query) |
        Q(hotel_id__hotel_name__icontains=query)
    )
    return search_result

def replace_http_with_https(url):
        if url:
            return url.replace('http://', 'https://')
        return None

def modify_pagination_urls(paginator):
        url_next = replace_http_with_https(paginator.get_next_link())
        url_previous = replace_http_with_https(paginator.get_previous_link())
        return url_next, url_previous

# Common Variables

hotel_not_found = "Hotel user not found"
hotel_data_not_found = "Hotel data not available"
hotel_not_active = "Hotel is not active"
no_roomtype = "No room types found"
unknown_hotel_user = 'User is not associated with any hotel.'
Review_not_found = 'Review not found'
mail_template = 'hotel_app/emailnotifications.html'
user_not_found = 'User not found'
no_booking_found = 'No booking details found'
service_added = 'Services added to room successfully'
no_additional_activities =  'No additional activities added for this room'
check_hotel_booking_error = 'Error checking hotel bookings'
in_progress = 'in progress'
notification_not_found = 'Notification not found'

# Create your views here.

class HotelRegister(APIView):
    def post(self, request, format=None):
        serializer = HotelSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({
                'message': 'Hotel Registered Successfully'
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class GetHotelDetails(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request, format=None):
        try:
            query = request.GET.get('query')
            if query:
                hotel = search_user_details(query).filter(user_type="hotel")
            else:
                hotel = Hotel.objects.filter(user_type="hotel")
            if(hotel):
                pagination_class = CustomPagination()
                paginated_result=pagination_class.paginate_queryset(hotel,request)
                serializer = ListHotelSerializer(paginated_result, many=True)

                url_next_hotel, url_previous_hotel = modify_pagination_urls(pagination_class)

                paginated_response = pagination_class.get_paginated_response(serializer.data)

                if url_next_hotel:
                    paginated_response['next'] = url_next_hotel
                if url_previous_hotel:
                    paginated_response['previous'] = url_previous_hotel

                response_data = {
                    'count': pagination_class.page.paginator.count,
                    'next': url_next_hotel,
                    'previous': url_previous_hotel,
                    'results': paginated_response.data['results'],
                }

                return Response(response_data)
            else:
                return Response({'message': ' No hotels found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'message': f'There is something wrong occurs: {str(e)}'},status=status.HTTP_417_EXPECTATION_FAILED)


class HotelDetailsByStatus(APIView):
    permission_classes = [IsAuthenticated,AdminSupervisorPermission]
    def get(self, request, hotelstatus, format=None):
        try:
            hotel = Hotel.objects.filter(status=hotelstatus)
            if(hotel):
                pagination_class = CustomPagination()
                paginated_result=pagination_class.paginate_queryset(hotel,request)
                serializer = ListHotelSerializer(paginated_result, many=True)
                return pagination_class.get_paginated_response(serializer.data)
            else:
                return Response({'message': f' No {hotelstatus} hotels found'}, status=status.HTTP_404_NOT_FOUND)

        except Exception as e:
            return Response({'message': f'There is something wrong occurs: {str(e)}'},status=status.HTTP_417_EXPECTATION_FAILED)


def sent_confirmation_mail(to_email, link, name):
    subject = 'BooknStay - Account confirmation'
    html_message = render_to_string('approve_hotel.html', {'name': name, 'link': link})
    text_content = strip_tags(html_message)
    from_email = settings.EMAIL_HOST_USER
    to_email = [to_email]

    email = EmailMultiAlternatives(subject, text_content, from_email, to_email)
    email.attach_alternative(html_message, "text/html")
    email.send()


#approving an account
class ApproveHotel(APIView):
    permission_classes=[IsAuthenticated,AdminSupervisorPermission]
    def post(self, request, id):
        try:
            hotel = Hotel.objects.get(id=id)
        except Hotel.DoesNotExist:
            return Response({'message': hotel_data_not_found}, status=status.HTTP_404_NOT_FOUND)
        try:
            user = Login.objects.get(email=hotel.email)
        except Login.DoesNotExist:
            return Response({'message': hotel_not_found}, status=status.HTTP_404_NOT_FOUND)

        if hotel.status == 'inactive':
            hotel.status = 'active'
            hotel.save()
            user.status = 'active'
            user.save()
            login_link = settings.LOGIN_URL
            sent_confirmation_mail(hotel.email, login_link, hotel.hotel_name)
            return Response({'message': 'Hotel approved successfully'}, status=status.HTTP_200_OK)
        elif hotel.status == 'active':
            return Response({'message': 'Hotel is already verified'}, status=status.HTTP_400_BAD_REQUEST)
        else:
            return Response({'message': 'Hotel is already rejected'}, status=status.HTTP_400_BAD_REQUEST)
    

def send_rejection_mail(to_email, name):
    subject = 'BooknStay - Account Rejection'
    message = render_to_string('reject_hotel.html', {'name': name})
    from_mail = settings.EMAIL_HOST_USER
    recipient_list = [to_email]
    send_mail(subject, '', from_mail, recipient_list, html_message=message)

#rejecting an account
class RejectHotel(APIView):
    permission_classes=[IsAuthenticated,AdminSupervisorPermission]
    def post(self, request, id):
        try:
            hotel = Hotel.objects.get(id=id)
        except Hotel.DoesNotExist:
            return Response({'message': hotel_data_not_found}, status=status.HTTP_404_NOT_FOUND)
        
        try:
            user = Login.objects.get(email=hotel.email)
        except Login.DoesNotExist:
            return Response({'message': hotel_not_found}, status=status.HTTP_404_NOT_FOUND)

        if hotel.status == 'inactive':
            hotel.status = 'rejected'
            hotel.save()
            user.status = 'rejected'
            user.save()             
            send_rejection_mail(hotel.email, hotel.hotel_name)   
            return Response({'message': 'Hotel rejected successfully'}, status=status.HTTP_200_OK)
        elif hotel.status == 'active':
            return Response({'message': 'Hotel is already verified'}, status=status.HTTP_400_BAD_REQUEST)
        else:
            return Response({'message': 'Hotel is already rejected'}, status=status.HTTP_400_BAD_REQUEST)
        

#view hotel details using hotel id
class ViewHotel(APIView):
    serializer_class = ListHotelSerializer
     
    def get(self, request, id):
        try:
            hotel = Hotel.objects.filter(id=id).first()
            
            if hotel:
                serializer = ListHotelSerializer(hotel)
                hotel_data = {'hotel_details': serializer.data}
                
                if serializer.data.get('image'):
                    base_url = request.build_absolute_uri('/')[:-1]
                    image_url = base_url + serializer.data['image']
                    hotel_data['hotel_image'] = image_url

                return Response([hotel_data], status=status.HTTP_200_OK)
            else:
                return Response({'message': 'No data found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'message': f'There is something wrong occurs: {str(e)}'}, status=status.HTTP_417_EXPECTATION_FAILED)

def send_notification_mail(to_email, hotel_name, action):
    subject = f'BooknStay - {action.capitalize()} Hotel'
    
    if action == 'suspended':
        email_content = render_to_string(mail_template, {'hotel_name': hotel_name, 'action': 'suspended'})
        message = "Hotel suspension notification"
    elif action == 'delete':
        email_content = render_to_string(mail_template, {'hotel_name': hotel_name, 'action': 'delete'})
        message = "Hotel deletion notification"
    elif action == 'active':
        email_content = render_to_string(mail_template, {'hotel_name': hotel_name, 'action': 'active'})
        message = "Hotel active notification"
    else:
        raise ValueError('Invalid action provided')

    from_email = settings.EMAIL_HOST_USER
    recipient_list = [to_email]
    send_mail(subject, message, from_email, recipient_list, html_message=email_content)

def get_hotel_data(id):
    try:
        hotel = Hotel.objects.get(id=id)
        return hotel
    except Hotel.DoesNotExist:
        return None

def get_user_data(email):
    try:
        user = Login.objects.get(email=email)
        return user
    except Login.DoesNotExist:
        return None

class CheckBooking(APIView):
    def get(self, request, hotel_id):
        try:
            current_date = timezone.now().date()
            active_bookings = Booking.objects.filter(room__hotel_id=hotel_id, status='confirmed',check_out_date__gt=current_date).exists()
            return Response({'has_active_bookings': active_bookings}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': f"Error checking hotel bookings: {e}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
  
class SuspendHotel(APIView):
    permission_classes = [IsAuthenticated, AdminSupervisorPermission]

    def post(self, request, id):
        try:
            check_booking_instance = CheckBooking()
            active_bookings = check_booking_instance.get(request, hotel_id=id).data.get('has_active_bookings', False)

            hotel = get_hotel_data(id)
            if not hotel:
                return Response({'message': 'Hotel data not found'}, status=status.HTTP_404_NOT_FOUND)

            user = get_user_data(hotel.email)
            if not user:
                return Response({'message': 'User data not found'}, status=status.HTTP_404_NOT_FOUND)

            if active_bookings:
                return Response({'message': 'Unable to suspend the hotel. Hotels have active bookings.'}, status=status.HTTP_400_BAD_REQUEST)
            else:
                if hotel.status == 'active':
                    hotel.status = 'suspended'
                    hotel_name = hotel.hotel_name
                    hotel.save()
                    user.status = 'suspended'
                    user.save()
                    send_notification_mail(hotel.email, hotel_name, action='suspended')
                    return Response({'message': 'Hotel suspended successfully'}, status=status.HTTP_200_OK)
                elif hotel.status == 'suspended':
                    return Response({'message': 'Hotel is already suspended'}, status=status.HTTP_400_BAD_REQUEST)
                else:
                    return Response({'message': 'Hotel should be active in order to be suspended'}, status=status.HTTP_400_BAD_REQUEST)
        except Exception:
            return Response({'message': 'Unable to process the request'}, status=status.HTTP_400_BAD_REQUEST)


class DeleteHotel(APIView):
    permission_classes = [IsAuthenticated, AdminSupervisorPermission]

    def post(self, request, id):
        try:
            check_booking_instance = CheckBooking()
            active_bookings_response = check_booking_instance.get(request, hotel_id=id)
            
            if active_bookings_response.status_code != status.HTTP_200_OK:
                return Response({'message': check_hotel_booking_error}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

            active_bookings = active_bookings_response.data.get('has_active_bookings', False)

            if active_bookings:
                return Response({
                    'message': 'Unable to delete the hotel. Hotels have active bookings.'
                }, status=status.HTTP_400_BAD_REQUEST)
            else:
                hotel = get_hotel_data(id)
                if not hotel:
                    return Response({'message': hotel_data_not_found}, status=status.HTTP_404_NOT_FOUND)
                
                user = get_user_data(hotel.email)
                if not user:
                    return Response({'message': hotel_data_not_found}, status=status.HTTP_404_NOT_FOUND)

                hotel_name = hotel.hotel_name 
                hotel.delete()
                user.delete()

                send_notification_mail(hotel.email, hotel_name, action='delete')
                return Response({'message': 'Hotel deleted successfully'}, status=status.HTTP_200_OK)

        except Exception:
            return Response({'message': 'Unable to process the request'}, status=status.HTTP_400_BAD_REQUEST)



# add room type
class AddRoomType(APIView):
    permission_classes = [IsAuthenticated, AdminPermission]

    def post(self, request, format=None):
        serializer = RoomTypeSerializer(data=request.data)

        if serializer.is_valid():
            room_type = serializer.validated_data.get('room_type')
            room_type_exist = RoomType.objects.filter(room_type=room_type).exists()

            if room_type_exist:
                return Response({
                    'room_type': 'Room type already exists',
                }, status=status.HTTP_400_BAD_REQUEST)
            else:
                serializer.save()
                return Response(
                    {'message': 'Room type added successfully'},
                    status=status.HTTP_201_CREATED,
                )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# list room types
class ListRoomTypes(APIView) :
    permission_classes = [ IsAuthenticated, HotelAdminPermission ]
    def get(self, request, format=None):
        pagination_class = CustomPagination()

        try:
            query = request.GET.get('query')
            
            if query:
                room_type = search_room_type(query)
            else:
                room_type = RoomType.objects.all()  
            
            if room_type:
                paginated_result = pagination_class.paginate_queryset(room_type,request)
                serializer = RoomTypeSerializer(paginated_result, many=True)

                url_next_roomtype, url_previous_roomtype = modify_pagination_urls(pagination_class)

                paginated_response = pagination_class.get_paginated_response(serializer.data)

                if url_next_roomtype:
                    paginated_response['next'] = url_next_roomtype
                if url_previous_roomtype:
                    paginated_response['previous'] = url_previous_roomtype

                response_data = {
                    'count': pagination_class.page.paginator.count,
                    'next': url_next_roomtype,
                    'previous': url_previous_roomtype,
                    'results': paginated_response.data['results'],
                }

                return Response(response_data)
            else:
                 return Response({'message': no_roomtype}, status=status.HTTP_404_NOT_FOUND)
        except RoomType.DoesNotExist:
                return Response({'message': no_roomtype}, status=status.HTTP_404_NOT_FOUND)     



# delete hotel user account
class DeleteHotelAccount(APIView):
    permission_classes = [IsAuthenticated, HotelPermission]

    def get_hotel_user(self, request):
        try:
            user_email = request.user.email
            hotel = Hotel.objects.get(email=user_email)
            return hotel
        except Hotel.DoesNotExist:
            return None

    def put(self, request, id):
        hotel = self.get_hotel_user(request)

        if hotel is None:
            return Response({
                'detail': hotel_not_found
            }, status=status.HTTP_404_NOT_FOUND)

        check_booking_instance = CheckBooking()
        active_bookings_response = check_booking_instance.get(request, hotel_id=hotel.id)

        if active_bookings_response.status_code != status.HTTP_200_OK:
            return Response({'detail': check_hotel_booking_error}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        active_bookings = active_bookings_response.data.get('has_active_bookings', False)

        if active_bookings:
            return Response({
                'detail': 'You cant delete your account. You have active bookings. Please check'
            }, status=status.HTTP_400_BAD_REQUEST)
        else:
            if hotel.status == 'inactive':
                return Response({
                    'detail': hotel_not_active
                }, status=status.HTTP_400_BAD_REQUEST)

            if hotel.status == 'deleted':
                return Response({
                    'detail': 'Hotel account is already deleted'
                }, status=status.HTTP_400_BAD_REQUEST)
            else:
                try:
                    deleted_email = f"{hotel.email}_{datetime.now().strftime('%Y%m%d%H%M%S')}"

                    hotel.email = deleted_email
                    hotel.status = 'deleted'
                    hotel.save()
                    hotel.deleted_on = datetime.now().date()

                    login_hotel = Login.objects.get(email=request.user.email)
                    login_hotel.status = 'deleted'
                    login_hotel.email = deleted_email
                    login_hotel.save()

                    return Response({
                        'detail': 'Hotel account deleted successfully',
                        'new_email': deleted_email
                    }, status=status.HTTP_200_OK)
                except Hotel.DoesNotExist:
                    return Response({
                        'detail': hotel_not_found
                    }, status=status.HTTP_404_NOT_FOUND)
                

# add room details
class AddRoomDetails(APIView):
    permission_classes = [IsAuthenticated, HotelPermission]
    parser_classes = [MultiPartParser]

    def get_hotel_id_for_user(self, user_email):
        try:
            hotel = Hotel.objects.get(email=user_email)
            return hotel.id
        except Hotel.DoesNotExist:
            return None

    def post(self, request, format=None):
        user_email = request.user.email
        hotel_id = self.get_hotel_id_for_user(user_email)

        if not hotel_id:
            return Response({
                'message': unknown_hotel_user,
            }, status=status.HTTP_400_BAD_REQUEST)

        room_type_id = request.data.get('room_type_id')
        number_of_rooms = request.data.get('number_of_rooms')
        room_facilities = request.data.get('room_facilities')
        rate = request.data.get('rate')
        images = {
            'image1': request.FILES.get('image1'),
            'image2': request.FILES.get('image2'),
            'image3': request.FILES.get('image3'),
        }


        roomdata = {
            'hotel_id': hotel_id,
            'room_type_id': room_type_id,
            'number_of_rooms': number_of_rooms,
            'room_facilities': room_facilities,
            'rate': rate,
        }

        serializer = RoomDetailsSerializer(data=roomdata)

        if serializer.is_valid():
            room_type_id = serializer.validated_data.get('room_type_id')
            room_exists = RoomDetails.objects.filter(hotel_id=hotel_id, room_type_id=room_type_id).exists()

            if room_exists:
                return Response({
                    'message': 'Room with the same hotel and room type already exists.',
                }, status=status.HTTP_400_BAD_REQUEST)

            roomdata = serializer.save()

            num_images_present = sum(1 for img in images.values() if img)
            if num_images_present >= 1:
                images['room_details_id'] = roomdata.id
                images_serializer = RoomImagesSerializer(data=images)

                if images_serializer.is_valid():
                    images_serializer.save()
                    return Response({
                        'message': 'Room details and images added successfully',
                        'id': roomdata.id
                    }, status=status.HTTP_201_CREATED)

                roomdata.delete()
                return Response({
                    'message': 'Failed to save room images.',
                    'errors': images_serializer.errors
                }, status=status.HTTP_400_BAD_REQUEST)

            return Response({
                'message': 'Room details added successfully',
                'id': roomdata.id
            }, status=status.HTTP_201_CREATED)

        return Response({
            'message': 'Failed to save room details.',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)

class ViewHotelRoomDetails(APIView):
    permission_classes = [IsAuthenticated, HotelPermission]
    pagination_class = CustomPagination()

    def get_booked_and_available_rooms(self, hotel_id, room_type_id, current_date):
        total_rooms = RoomDetails.objects.filter(hotel_id=hotel_id, room_type_id=room_type_id).aggregate(total_rooms=Sum('number_of_rooms'))['total_rooms'] or 0

        booked_rooms = Booking.objects.filter(
            hotel_id=hotel_id,
            room__room_type_id=room_type_id,
            status='confirmed',
            check_out_date__gte=current_date,
            check_in_date__lte=current_date
        ).aggregate(booked_rooms=Coalesce(Sum('number_of_rooms'), 0))['booked_rooms']

        available_rooms = total_rooms - booked_rooms

        return {
            'total_rooms': total_rooms,
            'booked_rooms': booked_rooms,
            'available_rooms': available_rooms,
        }

    def process_room_detail(self, room_detail, hotel_id, current_date):
        room_type_id = room_detail.get('room_type_id')
        try:
            room_type = RoomType.objects.get(id=room_type_id)
            room_detail['room_type'] = room_type.room_type
            rooms_info = self.get_booked_and_available_rooms(hotel_id, room_type_id, current_date)
            room_detail['rooms_info'] = rooms_info
            room_detail['booked_rooms'] = rooms_info['booked_rooms']
            room_detail['available_rooms'] = rooms_info['available_rooms']

            room_images = RoomImages.objects.filter(room_details_id=room_detail['id'], room_details_id__hotel_id=hotel_id)
            room_images_data = RoomImagesSerializer(
                room_images,
                many=True,
                context={'request': self.request}
            ).data

            for i, image in enumerate(room_images_data):
                for key, value in image.items():
                    if key != 'room_details_id':
                        room_detail[key] = value

            return room_detail
        except RoomType.DoesNotExist:
            room_detail['room_type'] = 'Unknown Room Type'
            room_detail['rooms_info'] = {}
            room_detail['booked_rooms'] = 0
            room_detail['available_rooms'] = 0
            return room_detail

    def get(self, request, format=None):
        user_email = request.user.email

        try:
            hotel = Hotel.objects.get(email=user_email)
        except Hotel.DoesNotExist:
            return Response({
                'message': 'Hotel not found for the logged-in user.',
            }, status=status.HTTP_404_NOT_FOUND)

        room_details_query = RoomDetails.objects.filter(hotel_id=hotel.id)

        search_query = request.query_params.get('query', '')

        if search_query:
            room_details_query = search_room_details(hotel.id, search_query)

            if not room_details_query.exists():
                return Response({
                    'message': 'No data found based on the search criteria.',
                }, status=status.HTTP_404_NOT_FOUND)

        room_details_data = RoomDetailsSerializer(room_details_query, many=True).data

        room_details_with_info = []
        current_date = date.today()

        for room_detail in room_details_data:
            processed_room_detail = self.process_room_detail(room_detail, hotel.id, current_date)
            room_details_with_info.append(processed_room_detail)

        room_details_paginated = self.pagination_class.paginate_queryset(room_details_with_info, request)
        url_next_room, url_previous_room = modify_pagination_urls(self.pagination_class)
        paginated_response = self.pagination_class.get_paginated_response(room_details_paginated)
        if url_next_room:
            paginated_response['next'] = url_next_room
        if url_previous_room:
            paginated_response['previous'] = url_previous_room

        response_data = {
            'count': self.pagination_class.page.paginator.count,
            'next': url_next_room,
            'previous': url_previous_room,
            'results': paginated_response.data['results'],
        }

        return Response(response_data)
class RoomDetailsByStatus(APIView):
    permission_classes = [IsAuthenticated, HotelPermission]

    def get(self, request, roomdetailstatus, format=None):

        user_email = request.user.email

        try :
            hotel = Hotel.objects.get(email=user_email)
        except Hotel.DoesNotExist :
            return Response({'message' : unknown_hotel_user}, status=status.HTTP_404_NOT_FOUND)
        
        try:
            roomdetails = RoomDetails.objects.filter(status=roomdetailstatus, hotel_id=hotel.id)
            if roomdetails:
                pagination_class = CustomPagination()
                paginated_result = pagination_class.paginate_queryset(roomdetails, request)

                serializer = RoomDetailsSerializer(paginated_result, many=True)
                room_details_data = serializer.data

                room_images = RoomImages.objects.filter(room_details_id__in=paginated_result)
                room_images_serializer = RoomImagesSerializer(room_images, many=True, context={'request': request})
                room_images_data = room_images_serializer.data

                response_data = {
                    'room_details': room_details_data,
                    'room_images': room_images_data
                }

                return pagination_class.get_paginated_response(response_data)
            else:
                return Response({'message': f'No {roomdetailstatus} room details found'}, status=status.HTTP_404_NOT_FOUND)

        except Exception as e:
            return Response({'message': f'There is something wrong occurs: {str(e)}'}, status=status.HTTP_417_EXPECTATION_FAILED)


# view room details by admin
class AdminViewRoomDetails(APIView):
    permission_classes = [IsAuthenticated, AdminPermission]

    def get(self, request, format=None):
        pagination_class = CustomPagination()

        try:
            query = request.GET.get('query')

            if query:
                room_details = search_admin_room_details(query)
            else:
                room_details = RoomDetails.objects.all()

            if room_details:
                paginated_result = pagination_class.paginate_queryset(room_details, request)
                url_next_room, url_previous_room = modify_pagination_urls(pagination_class)

                current_date = date.today()
                paginated_response_data = []

                for room_detail in paginated_result:
                    total_booked_rooms = Booking.objects.filter(
                        room=room_detail,
                        check_in_date__lte=current_date,
                        check_out_date__gte=current_date,
                        status__in=['confirmed', 'in_progress']
                    ).aggregate(total_booked_rooms=Sum('number_of_rooms'))['total_booked_rooms'] or 0

                    available_rooms = room_detail.number_of_rooms - total_booked_rooms

                    room_data = {
                        'room_detail': RoomDetailsSerializer(room_detail).data,
                        'booked_rooms': total_booked_rooms,
                        'available_rooms': available_rooms
                    }
                    paginated_response_data.append(room_data)

                paginated_response = pagination_class.get_paginated_response(paginated_response_data)

                if url_next_room:
                    paginated_response.data['next'] = url_next_room
                if url_previous_room:
                    paginated_response.data['previous'] = url_previous_room

                return Response(paginated_response.data )
            else:
                return Response({'message': 'No room details found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception:
            return Response({'message': 'Error occurred while fetching room details'}, status=status.HTTP_404_NOT_FOUND)
        
# view room details by id for admin
class ViewRoomDetailsById(APIView):
    permission_classes = [IsAuthenticated, AdminPermission]

    def get(self, request, id):
        try: 
            room_details_id = RoomDetails.objects.filter(id=id).first()

            if room_details_id:
                room_details_data = {
                    'room_facilities': room_details_id.room_facilities,
                    'rate': room_details_id.rate,
                    'date_joined': room_details_id.date_joined,
                    'updated_on': room_details_id.updated_on,
                    'deleted_on': room_details_id.deleted_on,
                }
                return Response(room_details_data, status=status.HTTP_200_OK)
            else:
                return Response({'message': 'No data found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'message': f'There is something wrong occurs: {str(e)}'}, status=status.HTTP_417_EXPECTATION_FAILED)
    
#Get active hotels 
class ListActiveHotelDetails(APIView):
    def get(self, request, format=None):
        try:
            hotels = Hotel.objects.filter(status='active', roomdetails__isnull=False).distinct()
            if hotels.exists():
                hotel_data = []
                for hotel in hotels:
                    lowest_rate = RoomDetails.objects.filter(hotel_id=hotel).aggregate(lowest_rate=Min('rate'))['lowest_rate']
                    average_rating = Review.objects.filter(hotel_email=hotel.email).aggregate(avg_rating=Avg('rating'))['avg_rating']
                    average_rating = round(average_rating, 1) if average_rating else None
                    rating_count = Review.objects.filter(hotel_email=hotel.email).count()
                    hotel_serializer = ListHotelSerializer(hotel)
                    
                    hotel_data_entry = {'hotel_details': hotel_serializer.data}
                    
                    if hotel_serializer.data.get('image'):
                        base_url = request.build_absolute_uri('/')[:-1]
                        image_url = base_url + hotel_serializer.data['image']
                        hotel_data_entry['hotel_image'] = image_url

                    hotel_data_entry.update({
                        'lowest_rate': lowest_rate,
                        'average_rating': average_rating,
                        'rating_count': rating_count
                    })
                    hotel_data.append(hotel_data_entry)

                return Response(hotel_data, status=status.HTTP_200_OK)
            else:
                return Response({'message': 'No active hotels found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'message': f'There is something wrong occurs: {str(e)}'}, status=status.HTTP_417_EXPECTATION_FAILED)

def check_bookings(check_in_date, check_out_date, hotel_id):

    active_bookings = Booking.objects.filter(
        hotel_id=hotel_id,
        check_in_date__lt=check_out_date,
        check_out_date__gt=check_in_date,
        status__in=[in_progress, 'confirmed']
    )

    booked_rooms_by_type = active_bookings.values('room__room_type_id').annotate(total_booked=Sum('number_of_rooms'))

    total_rooms_by_type = RoomDetails.objects.filter(hotel_id=hotel_id).values('room_type_id').annotate(total_rooms=Sum('number_of_rooms'))

    for available_room_type in total_rooms_by_type:
        if available_room_type['total_rooms'] > 0:
            for booked_room_type in booked_rooms_by_type:
                if booked_room_type['room__room_type_id'] == available_room_type['room_type_id']:
                    if booked_room_type['total_booked'] < available_room_type['total_rooms']:
                        return False
            return False
    return True


# sort hotel details for customer
class HotelSearchView(APIView):
    def post(self, request, format=None):
        location = request.data.get('location')
        check_in_date = request.data.get('check_in_date')
        check_out_date = request.data.get('check_out_date')

        active_hotels,message = self.get_active_hotels(location)

        if not active_hotels.exists():
            return Response({'message': 'No active hotels found for the given location.'}, status=status.HTTP_404_NOT_FOUND)

        hotel_data = self.get_hotel_data(active_hotels, check_in_date, check_out_date, request)
        response_data = {
            'message': message,
            'hotel_data': hotel_data
        }
        return Response(response_data, status=status.HTTP_200_OK)

    def get_active_hotels(self, location):
        message = ''
        active_hotels = Hotel.objects.filter(
            Q(city=location) | Q(district=location) | Q(state=location),
            status='active',
            roomdetails__isnull=False
            ).distinct()
        if not active_hotels.exists():
            message = 'Sorry, we cannot find hotels in your preferred location'
            active_hotels = Hotel.objects.filter(status='active')
        return active_hotels, message

    def get_hotel_data(self, active_hotels, check_in_date, check_out_date, request):
        hotel_data = []
        for hotel in active_hotels:
            if not check_bookings(check_in_date, check_out_date, hotel.id):
                lowest_rate = RoomDetails.objects.filter(hotel_id=hotel).aggregate(lowest_rate=Min('rate'))['lowest_rate']
                average_rating = self.get_average_rating(hotel)
                rating_count = self.get_rating_count(hotel)
                hotel_serializer = ListHotelSerializer(hotel)
                hotel_data_entry = {'hotel_details': hotel_serializer.data}
                if hotel_serializer.data.get('image'):
                    base_url = request.build_absolute_uri('/')[:-1]
                    image_url = base_url + hotel_serializer.data['image']
                    hotel_data_entry['hotel_image'] = image_url
                hotel_data_entry.update({
                    'lowest_rate': lowest_rate,
                    'average_rating': average_rating,
                    'rating_count': rating_count
                })
                hotel_data.append(hotel_data_entry)
        return hotel_data

    def get_average_rating(self, hotel):
        average_rating = Review.objects.filter(hotel_email=hotel.email).aggregate(avg_rating=Avg('rating'))['avg_rating']
        average_rating = round(average_rating, 1) if average_rating else None
        return average_rating

    def get_rating_count(self, hotel):
        return Review.objects.filter(hotel_email=hotel.email).count()

class GetRoomTypes(APIView) :
    def get(self, request, format=None):
        try:           
            room_type = RoomType.objects.all()             
            if room_type:
                serializer = RoomTypeSerializer(room_type, many=True)
                return Response(serializer.data, status=status.HTTP_200_OK)
            else:
                return Response({'message': 'No room types found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'message': f'There is something wrong occurs: {str(e)}'}, status=status.HTTP_400_BAD_REQUEST)    

# edit hotel details by hotels
class EditHotelDetails(APIView):
    permission_classes = [IsAuthenticated, HotelPermission]

    def get_user(self, id):
        try:
            return Login.objects.get(id=id)           
        except Login.DoesNotExist:
            return None
        
    def get(self, request):
        hotel_id = request.user.id
        hotel_user = self.get_user(hotel_id)

        if hotel_user is None:
            return Response({'message': hotel_not_found}, status=status.HTTP_404_NOT_FOUND)
         
        if hotel_user.status != 'active':
            return Response({'message': hotel_not_active}, status=status.HTTP_404_NOT_FOUND)
        else :
            try:
                hotel = Hotel.objects.get(email=hotel_user.email)

                if hotel.status != 'active':
                    return Response({'message':hotel_not_active}, status=status.HTTP_404_NOT_FOUND)
                else :
                    image = hotel.image.url if hotel.image else None

                    return Response({
                        'hotel_name': hotel.hotel_name,
                        'phone_number': hotel.phone_number,
                        'address': hotel.address,
                        'city' : hotel.city,
                        'district' : hotel.district,
                        'state' : hotel.state,
                        'pincode' : hotel.pincode,
                        'description' : hotel.description,
                        'service_charge' : hotel.service_charge,
                        'location_link' : hotel.location_link,
                        'email' : hotel.email,
                        'license_number' : hotel.license_number,
                        'image' : image
                    }) 

            except Hotel.DoesNotExist:
                return Response({'message': hotel_data_not_found}, status=status.HTTP_404_NOT_FOUND)
        
    
    def put(self, request):
        hotel_id = request.user.id
        hotel_user = self.get_user(hotel_id)

        if hotel_user is None:
            return Response({'message': hotel_not_found}, status=status.HTTP_404_NOT_FOUND)
        
        if hotel_user.status != 'active':
            return Response({'message': hotel_not_active}, status=status.HTTP_404_NOT_FOUND)
        else :
            try:
                hotel = Hotel.objects.get(email=hotel_user.email)

                if hotel.status != 'active':
                    return Response({'message':hotel_not_active}, status=status.HTTP_400_BAD_REQUEST)
                else:  
                    data={
                        'hotel_name': request.data.get('hotel_name'),
                        'phone_number': request.data.get('phone_number'),
                        'address': request.data.get('address'),
                        'city' : request.data.get('city'),
                        'district' : request.data.get('district'),
                        'state' : request.data.get('state'),
                        'pincode' : request.data.get('pincode'),
                        'description' : request.data.get('description'),
                        'service_charge' : request.data.get('service_charge'),
                        'location_link' : request.data.get('location_link'),
                        'image' : request.data.get('image'),
                        'updated_on' : timezone.now().date()
                    }

                    serializer =EditHotelSerializer(hotel, data)

                    if serializer.is_valid():
                        serializer.save()

                        user_login = Login.objects.get(email=hotel_user.email)
                        user_login.first_name = data['hotel_name']
                        user_login.save()  
                     
                        return Response({'message': 'Hotel details updated successfully'}, status=status.HTTP_200_OK)
                    else:
                        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
                
            except Hotel.DoesNotExist:
                return Response({'message': 'Hotel data not found'}, status=status.HTTP_404_NOT_FOUND)
            
# add review view
class ReviewView(APIView):
    permission_classes = [IsAuthenticated, CustomerPermission]

    def post(self, request, hotel_id):
        try:
            user = Customer.objects.get(email=request.user.email)
            
            if user.status != 'active':
                return Response({'message': 'User is not active'}, status=status.HTTP_400_BAD_REQUEST)
            
            hotel = Hotel.objects.get(id=hotel_id)

            rating = request.data.get('rating')
            title = request.data.get('title')
            comment = request.data.get('comment')
            images = request.FILES.getlist('images')  

            if hotel.status != 'active':
                return Response({'message': 'Hotel is not active'}, status=status.HTTP_400_BAD_REQUEST)
            
            data = {
                'customer_name': user.email,
                'hotel_email': hotel.email,  
                'rating': rating,
                'title': title,
                'comment': comment,
                'created_at': timezone.now().date()
            }

            serializer = ReviewSerializer(data=data)

            if serializer.is_valid():
                review = serializer.save()

                for image in images:
                    ReviewImage.objects.create(review=review, image=image)

                return Response({'message': 'Review added successfully'}, status=status.HTTP_201_CREATED)
            else:
                return Response({'message': 'An error occurred while adding review. Please try again'}, status=status.HTTP_400_BAD_REQUEST)
            
        except ValidationError as e:
            return Response({'message': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({'message': f'There is something wrong occurs: {str(e)}'}, status=status.HTTP_404_NOT_FOUND)
        
# display review 
class GetReviewView(APIView):

    def get_hotel_name(self, email):
        try:
            hotel = Hotel.objects.get(email=email)
            return hotel.hotel_name
        except Hotel.DoesNotExist:
            return None

    def get_review_data(self, review_user, request):
        review_data = []
        base_url = request.build_absolute_uri('/')[:-1]
        
        for review in review_user:
            email = review.hotel_email
            hotel_name = self.get_hotel_name(email)

            images = review.images.all()
            image_urls = [base_url + image.image.url for image in images]

            review_details = {
                'id': review.id,
                'rating': review.rating,
                'title': review.title,
                'comment': review.comment,
                'created_at': review.created_at,
                'hotel_name': hotel_name,
                'image_urls': image_urls
            }

            review_data.append(review_details)

        return review_data

    def get(self, request):
        try:
            user = Customer.objects.get(email=request.user.email)

            if user is None:
                return Response({'message': user_not_found}, status=status.HTTP_404_NOT_FOUND)

            review_user = Review.objects.filter(customer_name=user.email, status='active')

            if not review_user:
                return Response({'message': 'You have no reviews yet.'}, status=status.HTTP_404_NOT_FOUND)

            review_data = self.get_review_data(review_user, request)
            return Response(review_data, status=status.HTTP_200_OK)
        
        except Exception as e:
            return Response({'message': f'There is something wrong occurs: {str(e)}'}, status=status.HTTP_404_NOT_FOUND)

# update review
class UpdateReview(APIView):
    parser_classes = [MultiPartParser, FormParser]

    def delete_existing_images(self, review):
        ReviewImage.objects.filter(review=review).delete()

    def get_review(self, review_id):
        try:
            return Review.objects.get(id=review_id)
        except Review.DoesNotExist:
            raise Http404('Review_not_found')

    def get(self, request, review_id):
        try:
            review = self.get_review(review_id)

            images = ReviewImage.objects.filter(review=review)
            image_urls = [image.image.url for image in images]

            return Response({
                'rating': review.rating,
                'title': review.title,
                'comment': review.comment,
                'image_urls': image_urls,
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({'message': f'There is something wrong occurs: {str(e)}'}, status=status.HTTP_404_NOT_FOUND)

    def put(self, request, review_id):
        try:
            review = self.get_review(review_id)
            
            self.delete_existing_images(review)

            serializer = ReviewSerializer(review, data=request.data)
            if serializer.is_valid():
                serializer.save()

                for key, file in request.FILES.items():
                    if key.startswith('image'):
                        image_serializer = ReviewImageSerializer(data={'review': review.id, 'image': file})
                        if image_serializer.is_valid():
                            image_serializer.save()
                        else:
                            return Response({'message': 'An error occurred while saving image'}, status=status.HTTP_400_BAD_REQUEST)

                return Response({'message': 'Review updated successfully'}, status=status.HTTP_200_OK)
            else:
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Http404 as e:
            return Response({'message': str(e)}, status=status.HTTP_404_NOT_FOUND)
        except ValidationError as e:
            return Response({'message': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({'message': f'Internal Server Error: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# delete reviews added by the users
class DeleteReview(APIView):
    def put(self, request, review_id):
        try:
            review = Review.objects.get(id=review_id)

            if review is None:
                return Response({'message' : Review_not_found}, status=status.HTTP_404_NOT_FOUND)
            else:
                if review.status != 'active':
                    return Response({'message' : 'Review is already deleted'}, status=status.HTTP_400_BAD_REQUEST)
                else:
                    review.status = 'deleted'
                    review.save()

                    return Response({'message' : 'Review deleted successfully'}, status=status.HTTP_200_OK)

        except Exception:
            return Response({'message' : Review_not_found}, status=status.HTTP_404_NOT_FOUND)

class EditRoomDetails(APIView):
    permission_classes = [IsAuthenticated, HotelPermission]

    def get_room_images(self, room_details_id):
        room_images = RoomImages.objects.filter(room_details_id=room_details_id).first()

        return {
            'image1': room_images.image1.url if room_images and room_images.image1 else None,
            'image2': room_images.image2.url if room_images and room_images.image2 else None,
            'image3': room_images.image3.url if room_images and room_images.image3 else None
        }

    def get(self, request, room_details_id=None, format=None):
        try:
            room_details = get_object_or_404(RoomDetails, id=room_details_id)

            room_details_serializer = RoomDetailsSerializer(room_details)
            room_details_data = room_details_serializer.data
            room_images_data = self.get_room_images(room_details_id)

            result_data = {'room_details': room_details_data, 'room_images': room_images_data}
            return Response(result_data)

        except RoomDetails.DoesNotExist:
            return Response({'message': 'Room details not found.'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'message': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def put(self, request, room_details_id, format=None):
        try:
            room_details = get_object_or_404(RoomDetails, id=room_details_id)

            room_details.number_of_rooms = request.data.get('number_of_rooms', room_details.number_of_rooms)
            room_details.room_facilities = request.data.get('room_facilities', room_details.room_facilities)
            room_details.rate = request.data.get('rate', room_details.rate)
            room_details.updated_on = datetime.now().date()
            room_details.save()

            room_images = RoomImages.objects.filter(room_details_id=room_details.id).first()

            if room_images:
                images_data = {f'image{index}': request.FILES.get(f'image{index}') for index in range(1, 4)}
                for key, value in images_data.items():
                    if value:
                        setattr(room_images, key, value)

                room_images.save()
            else:
                images_data = {f'image{index}': request.FILES.get(f'image{index}') for index in range(1, 4)}
                serializer = RoomImagesSerializer(data={'room_details_id': room_details.id, **images_data})
                serializer.is_valid(raise_exception=True)
                serializer.save()

            room_images_data = self.get_room_images(room_details_id)
            updated_serializer = RoomDetailsSerializer(room_details)
            result_data = {'message': 'Room details updated successfully.', 'data': updated_serializer.data, 'room_images': room_images_data}

            return Response(result_data, status=status.HTTP_200_OK)
        except ValidationError as e:
            return Response({'message': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({'message': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class ListHotelRoomDetails(APIView):
    def post(self, request, hotel_id, format=None):
        try:
            hotel = self.get_hotel(hotel_id)
            if not hotel:
                return Response({'message': 'No active hotel data found'}, status=status.HTTP_404_NOT_FOUND)
            check_in = request.data.get('check_in')
            check_out = request.data.get('check_out')

            room_details = RoomDetails.objects.filter(hotel_id=hotel_id, status="active")
            if not room_details:
                return Response({'message': 'Unable to find room details'}, status=status.HTTP_404_NOT_FOUND)

            room_data = self.get_room_data(request, room_details, check_in, check_out)
            return Response(room_data)

        except Exception as e:
            return Response({'message': f'There is something wrong occurs: {str(e)}'}, status=status.HTTP_417_EXPECTATION_FAILED)

    def get_hotel(self, hotel_id):
        return Hotel.objects.filter(status='active', id=hotel_id).first()

    def get_room_data(self, request, room_details, check_in, check_out):
        room_data = []
        for room in room_details:
            available_rooms = self.calculate_available_rooms(room, check_in, check_out)
            if available_rooms > 0:
                room_serializer = RoomDetailsSerializer(room)
                room_data_entry = {"room": room_serializer.data}

                additional_services = self.get_additional_services(room)
                additional_services_serializer = RoomServicesSerializer(additional_services, many=True)
                room_data_entry["additional_services_details"] = additional_services_serializer.data

                image_data = self.get_image_data(request, room)
                room_data_entry["image"] = image_data
                room_data_entry["available_rooms"] = available_rooms

                room_data.append(room_data_entry)
        return room_data
    
    def calculate_available_rooms(self, room, check_in, check_out):
        bookings = Booking.objects.filter(room=room, status__in=[in_progress, 'confirmed']).filter(
            Q(check_in_date__lte=check_in, check_out_date__gte=check_in) | 
            Q(check_in_date__lte=check_out, check_out_date__gte=check_out) |
            Q(check_in_date__gte=check_in, check_out_date__lte=check_out)
        ).aggregate(total_booked_rooms=Sum('number_of_rooms'))
        
        total_booked_rooms = bookings['total_booked_rooms'] if bookings['total_booked_rooms'] else 0
        available_rooms = room.number_of_rooms - total_booked_rooms
        return available_rooms

    def get_additional_services(self, room):
        additional_services_ids = RoomAdditionalActivites.objects.filter(room_details_id=room.id, status='active').values_list('additional_activites_id', flat=True)
        return RoomServices.objects.filter(id__in=additional_services_ids)

    def get_image_data(self, request, room):
        room_images = RoomImages.objects.filter(room_details_id=room.id)
        image_serializer = RoomImagesSerializer(room_images, many=True)
        image_data = image_serializer.data[0] if image_serializer.data else None
        if image_data:
            base_url = request.build_absolute_uri('/')[:-1]
            image_data = {
                "room_details_id": image_data["room_details_id"],
                "image1": f"{base_url}{image_data['image1']}",
                "image2": f"{base_url}{image_data['image2']}",
                "image3": f"{base_url}{image_data['image3']}"
            }
        return image_data

def checking_booking(room_details_id):
    current_date = date.today()
    bookings_count = Booking.objects.filter(room__id=room_details_id, check_out_date__gte=current_date,status__in=[in_progress, 'confirmed'],).count()
    return bookings_count > 0

class DeleteRoomDetails(APIView):
    permission_classes = [HotelPermission]

    def get_hotel_id_for_user(self, user_email):
        try:
            hotel = Hotel.objects.get(email=user_email)
            return hotel.id
        except Hotel.DoesNotExist:
            return None

    def delete(self, request, room_details_id):
        user_email = request.user.email
        hotel_id = self.get_hotel_id_for_user(user_email)

        if not hotel_id:
            return Response({
                'message': 'User is not associated with any hotel.',
            }, status=status.HTTP_400_BAD_REQUEST)

        try:
            room_details = RoomDetails.objects.get(id=room_details_id, hotel_id=hotel_id)
        except RoomDetails.DoesNotExist:
            return Response({"detail": "Room details not found"}, status=status.HTTP_404_NOT_FOUND)

        if checking_booking(room_details_id):
            return Response({"detail": "Active bookings for this room."}, status=status.HTTP_400_BAD_REQUEST)

        room_details.delete()

        return Response({"detail": "Room details deleted successfully"}, status=status.HTTP_200_OK)
    

class AddRoomServices(APIView):
    permission_classes = [IsAuthenticated, HotelPermission]
    parser_classes = [MultiPartParser, FormParser]

    def get_hotel_id_for_user(self, user_email):
        try:
            hotel = Hotel.objects.get(email=user_email)
            return hotel.id
        except Hotel.DoesNotExist:
            return None

    def post(self, request, format=None):
        user_email = request.user.email
        hotel_id = self.get_hotel_id_for_user(user_email)

        if not hotel_id:
            return Response({
                'message': unknown_hotel_user,
            }, status=status.HTTP_400_BAD_REQUEST)
        data = {
            'title': request.data.get('title'),
            'description': request.data.get('description'),
            'price': request.data.get('price'),
            'hotel_id': hotel_id
        }

        image_file = request.data.get('image')
        if image_file:
            data['image'] = image_file

        serializer = RoomServicesSerializer(data=data, context={'hotel_id': hotel_id})
        try:
            serializer.is_valid(raise_exception=True)
            serializer.save()
            success_message = "Room services added successfully."
            return Response({
                "message": success_message,
            }, status=status.HTTP_201_CREATED)
        except serializers.ValidationError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error": f"Failed to add room services. {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# list reviews by hotels
class ListFeedbacksByHotels(APIView):
    permission_classes = [IsAuthenticated, HotelPermission]

    def get_hotel(self, email):
        try:
            hotel = Hotel.objects.get(email=email)
            return hotel.email
        except Hotel.DoesNotExist:
            return None

    def get(self, request):
        try:
            hotel_user = request.user.email
            hotel_email = self.get_hotel(hotel_user)

            if not hotel_email:
                return Response({'message': hotel_not_found}, status=status.HTTP_404_NOT_FOUND)
            else:
                reviews = Review.objects.filter(hotel_email=hotel_email, status='active')

                return Response(reviews.values(), status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": f"Failed to fetch reviews. {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)

# add feedbacks to the reviews by hotels
class AddFeedbacksByHotels(APIView) :
    permission_classes = [IsAuthenticated, HotelPermission]

    def get_hotel(self, email):
        try:
            hotel = Hotel.objects.get(email=email)
            return hotel.email
        except Hotel.DoesNotExist:
            return None

    def post(self, request, review_id):
        try:
            hotel_user = request.user.email
            hotel_email = self.get_hotel(hotel_user)

            if not hotel_email:
                return Response({'message': hotel_not_found}, status=status.HTTP_404_NOT_FOUND)
            else:
                try:
                    review = Review.objects.get(id=review_id)
                except Review.DoesNotExist :
                    return Response({'message': Review_not_found}, status=status.HTTP_404_NOT_FOUND)

                if review.hotel_email != hotel_email:
                    return Response({'message' : 'Unauthorized to provide feedback for this review'}, status=status.HTTP_401_UNAUTHORIZED)
                else:
                    feedback = request.data.get('feedbacks')

                    review.feedbacks = feedback
                    review.feedbacks_created_at = timezone.now()
                    review.feedbacks_updated_on = timezone.now()
                    review.save()

                    return Response({'message' : 'Feedback added successfully'}, status=status.HTTP_201_CREATED)
        
        except Exception:
            return Response({"error": "Failed to add feedbacks"}, status=status.HTTP_400_BAD_REQUEST)

# function to get hotel user
    
def get_hotel(email):
    try:
        hotel = Hotel.objects.get(email=email)
        return hotel.id
    except Hotel.DoesNotExist:
        return None
    
# add additional activites to rooms by hotels
class RoomAdditionalActivitesView(APIView):
    permission_classes = [IsAuthenticated, HotelPermission]

    def post(self, request, room_id, additional_activities_id):
        try:
            hotel_user = request.user.email
            hotel_id = get_hotel(hotel_user)

            if not hotel_id:
                return Response({'message': hotel_not_found}, status=status.HTTP_404_NOT_FOUND)

            room_id, additional_activities_id = self.get_room_and_activities_ids(room_id, additional_activities_id, hotel_id)

            if not room_id or not additional_activities_id:
                return Response({'message': 'Unauthorized'}, status=status.HTTP_401_UNAUTHORIZED)

            service = self.get_service(room_id, additional_activities_id)

            if service:
                if service.status == 'active':
                    return Response({'message': 'Services already exists for this room'}, status=status.HTTP_400_BAD_REQUEST)
                elif service.status == 'deleted':
                    service.status = 'active'
                    service.save()
                    return Response({'message': service_added}, status=status.HTTP_201_CREATED)

            return self.create_service(room_id, additional_activities_id, hotel_id)
        except Exception:
            return Response({'message': 'An error occurred please try again later'}, status=status.HTTP_400_BAD_REQUEST)

    def get_room_and_activities_ids(self, room_id, additional_activities_id, hotel_id):
        room = RoomDetails.objects.filter(id=room_id, hotel_id__id=hotel_id).first()
        activities = RoomServices.objects.filter(id=additional_activities_id, hotel_id__id=hotel_id).first()
        return room, activities

    def get_service(self, room_id, additional_activities_id):
        return RoomAdditionalActivites.objects.filter(
            room_details_id=room_id.id, additional_activites=additional_activities_id.id
        ).first()

    def create_service(self, room_id, additional_activities_id, hotel_id):
        data = {
            'additional_activites': additional_activities_id.id,
            'room_details_id': room_id.id,
            'hotel_id': hotel_id,
            'status': 'active',
            'created_at': timezone.now()
        }
        serializer = RoomsAdditionalActivitesSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response({'message': service_added}, status=status.HTTP_201_CREATED)
        else:
            return Response({'message': 'Error occurred while adding services'}, status=status.HTTP_400_BAD_REQUEST)


# list additional activites added by hotels
class ViewAdditionalActivitesByHotel(APIView):
    def get(self, request):
        try:
            hotel_user = request.user.email
            hotel_id = get_hotel(hotel_user)

            if not hotel_id:
                return Response({'message': hotel_not_found}, status=status.HTTP_404_NOT_FOUND)
            else:
                additional_activities = RoomServices.objects.filter(hotel_id=hotel_id, status='active')

                serializer = RoomServicesSerializer(additional_activities, many=True)

                return Response(serializer.data, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({'message': f'An error occurred, please try again later : {str(e)}'}, status=status.HTTP_400_BAD_REQUEST)


# list activities added to rooms by admin
class ViewActivitiesAddedToRooms(APIView):

    def get(self, request, room_id):
        try:
            room_activities = RoomAdditionalActivites.objects.filter(room_details_id=room_id, status='active')

            if not room_activities:
                return Response({'message': no_additional_activities}, status=status.HTTP_404_NOT_FOUND)

            serializer = RoomsAdditionalActivitesSerializer(room_activities, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        
        except Exception as e:
            return Response({'message': f'An error occurred, please try again later: {str(e)}'}, status=status.HTTP_400_BAD_REQUEST)

# delete services added to rooms by hotels
class DeleteServicesAddedToRooms(APIView):
    permission_classes = [IsAuthenticated, HotelPermission]

    def put(self, request, room_id, additional_activities_id):
        try:
            hotel_user = request.user.email
            hotel_id = get_hotel(hotel_user)

            if not hotel_id:
                return Response({'message': hotel_not_found}, status=status.HTTP_404_NOT_FOUND)
            else:
                room_id = RoomDetails.objects.get(id=room_id)
                additional_activities_id = RoomServices.objects.get(id=additional_activities_id)

                if room_id.hotel_id.id != hotel_id or additional_activities_id.hotel_id.id != hotel_id:
                    return Response({'message': 'Unauthorized'}, status=status.HTTP_401_UNAUTHORIZED)
                else:
                    services = RoomAdditionalActivites.objects.get(
                        additional_activites=additional_activities_id,
                        room_details_id=room_id,
                        hotel_id=hotel_id
                    )

                    if services.status == 'active':
                        services.status = 'deleted'
                        services.save()
                        return Response({'message': 'Services deleted successfully'}, status=status.HTTP_200_OK)
                    else:
                        return Response({'message': 'Services already deleted'}, status=status.HTTP_400_BAD_REQUEST)
        except Exception:
            return Response({'message': 'An error occurred while deleting the services. Please try again later'}, status=status.HTTP_400_BAD_REQUEST)
        
#view room services
class ViewRoomServices(APIView):
    permission_classes = [IsAuthenticated, HotelPermission]
    pagination_class = CustomPagination

    def get(self, request, format=None):
        pagination_class = CustomPagination()
        try:
            user_email = request.user.email

            hotel = Hotel.objects.get(email=user_email)

            room_services = RoomServices.objects.filter(hotel_id=hotel.id,status='active')

            search_query = self.request.query_params.get('search', None)
            if search_query:
                room_services = search_room_services(hotel.id, search_query)

                if not room_services.exists():
                    return Response({'message': 'No room services found based on the search criteria.'}, status=status.HTTP_404_NOT_FOUND)

            ordering = self.request.query_params.get('ordering', None)
            if ordering == 'price':
                room_services = room_services.order_by('price')
            elif ordering == '-price':
                room_services = room_services.order_by('-price')

            if room_services:
                paginated_result = pagination_class.paginate_queryset(room_services, request)
                serializer = RoomServicesSerializer(paginated_result, many=True)
                url_next_service, url_previous_service = modify_pagination_urls(pagination_class)
                for service_data in serializer.data:
                    service_data['image'] = request.build_absolute_uri(service_data['image'])
                paginated_response = pagination_class.get_paginated_response(serializer.data)
                if url_next_service:
                    paginated_response['next'] = url_next_service
                if url_previous_service:
                    paginated_response['previous'] = url_previous_service

                response_data = {
                    'count': pagination_class.page.paginator.count,
                    'next': url_next_service,
                    'previous': url_previous_service,
                    'results': paginated_response.data['results'],
                }

                return Response(response_data)
            else:
                return Response({'message': 'No room services found'}, status=status.HTTP_404_NOT_FOUND)

        except Hotel.DoesNotExist:
            return Response({'message': 'Hotel not found for the logged-in user.'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': f'Unexpected error occurred: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
#view for edit room services 
class EditRoomServices(APIView):
    permission_classes = [IsAuthenticated, HotelPermission]
    parser_classes = [MultiPartParser, FormParser]

    def get(self, request, room_services_id=None, format=None):
        try:
            room_services = get_object_or_404(RoomServices, id=room_services_id)
            room_services_serializer = RoomServicesSerializer(room_services)
            room_services_data = room_services_serializer.data
            result_data = {'room_services': room_services_data}
            return Response(result_data)

        except RoomDetails.DoesNotExist:
            return Response({'message': 'Room services not found.'}, status=status.HTTP_404_NOT_FOUND)

        except Exception:
            return Response({'error': 'An internal server error occurred.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def put(self, request, room_services_id=None, format=None):
        try:
            room_services = get_object_or_404(RoomServices, id=room_services_id)
            room_services.title = request.data.get('title', room_services.title)
            room_services.description = request.data.get('description', room_services.description)
            room_services.price = request.data.get('price', room_services.price)
            room_services.updated_on = datetime.now().date()

            image_file = request.data.get('image')
            if image_file and isinstance(image_file, InMemoryUploadedFile):
                if image_file.name.startswith('/media/'):
                    image_file.name = image_file.name[len('/media/'):]

                room_services.image = image_file

            room_services.save()

            success_message = "Room services updated successfully."
            return Response({"message": success_message}, status=status.HTTP_200_OK)

        except ValidationError as ve:
            return Response({"error": f"Validation error: {ve}"}, status=status.HTTP_400_BAD_REQUEST)

        except Exception as ve:
            return Response({"error": "An internal server error occurred."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# function for checking active bookings for room services
def checking_booking_services(room_services_id):
    current_date = date.today()
    bookings_count = Booking.objects.filter(selected_services__id=room_services_id, check_out_date__gte=current_date,status__in=[in_progress, 'confirmed'],).count()
    return bookings_count > 0

class DeleteRoomServices(APIView):
    permission_classes = [IsAuthenticated, HotelPermission]

    def get_hotel_id_for_user(self, user_email):
        try:
            hotel = Hotel.objects.get(email=user_email)
            return hotel.id
        except Hotel.DoesNotExist:
            return None

    def get_room_services_instance(self, room_services_id, hotel_id):
        try:
            return RoomServices.objects.get(id=room_services_id, hotel_id=hotel_id)
        except RoomServices.DoesNotExist:
            return None

    def delete(self, request, room_services_id):
        user_email = request.user.email
        hotel_id = self.get_hotel_id_for_user(user_email)

        if not hotel_id:
            return Response({'message': 'Unknown hotel user.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            room_services = self.get_room_services_instance(room_services_id, hotel_id)

            if not room_services:
                return Response({"detail": "Room services not found"}, status=status.HTTP_404_NOT_FOUND)

            if checking_booking_services(room_services_id):
                return Response({"detail": "Active bookings for this service."}, status=status.HTTP_400_BAD_REQUEST)

            room_services.status = "inactive"
            room_services.deleted_on = datetime.now().date()
            room_services.save()

            return Response({"detail": "Room services deleted successfully" }, status=status.HTTP_200_OK)

        except Exception :
            return Response({'detail' : 'Error occured while deleting the service'}, status=status.HTTP_400_BAD_REQUEST)

# list activities added to rooms by hotels
class ViewActivitiesAddedToRoomsByHotels(APIView):

    def get(self, request, room_id):
        try:
            user_type = request.user.userType

            if user_type == 'hotel':
                return self.handle_hotel_user(request, room_id)
            
            elif user_type == 'customer':
                return self.handle_customer_user(room_id)
            
            else:
                return Response({'message': 'Unknown user'}, status=status.HTTP_400_BAD_REQUEST)
        
        except RoomDetails.DoesNotExist:
            return Response({'message': 'Room details not found'}, status=status.HTTP_404_NOT_FOUND)

    def handle_hotel_user(self, request, room_id):
        hotel_user = request.user.email
        hotel_id = self.get_hotel_id(hotel_user)
        
        if not hotel_id:
            return Response({'message': hotel_not_found}, status=status.HTTP_404_NOT_FOUND)
        
        room_details = self.get_room_details(room_id)
        
        if room_details.hotel_id.id != hotel_id:
            return Response({'message': 'Unauthorized'}, status=status.HTTP_401_UNAUTHORIZED)
        
        return self.get_room_activities_response(room_id)

    def handle_customer_user(self, room_id):
        return self.get_room_activities_response(room_id)

    def get_hotel_id(self, hotel_user):
        return get_hotel(hotel_user)

    def get_room_details(self, room_id):
        return RoomDetails.objects.get(id=room_id)

    def get_room_activities_response(self, room_id):
        room_activities = RoomAdditionalActivites.objects.filter(room_details_id=room_id, status='active')
        if not room_activities:
            return Response({'message': no_additional_activities}, status=status.HTTP_404_NOT_FOUND)
        serializer = RoomsAdditionalActivitesSerializer(room_activities, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

# list details of services by id
class ViewServicesById(APIView):
    def get(self, request, service_id):
        try :
            services = RoomServices.objects.get(id=service_id)

            serializer = RoomServicesSerializer(services)
            
            image = None
            if serializer.data.get('image'):
                base_url = request.build_absolute_uri('/')[:-1]
                image = base_url+serializer.data['image']

            data={
                'title':services.title,
                'description':services.description,
                'price':services.price,
                'image':image,
            }


            return Response(data)

        except RoomServices.DoesNotExist:
            return Response({'message' : 'Services not found'}, status=status.HTTP_404_NOT_FOUND)
        

class ActivateHotel(APIView):
    permission_classes = [IsAuthenticated, AdminSupervisorPermission]

    def post(self, request, hotel_id):
        try:
            hotel = Hotel.objects.get(id=hotel_id)
        except Hotel.DoesNotExist:
            return Response({'message': hotel_not_found}, status=status.HTTP_404_NOT_FOUND)

        try:
            user = Login.objects.get(email=hotel.email)
        except Login.DoesNotExist:
            return Response({'message': hotel_not_found}, status=status.HTTP_404_NOT_FOUND)

        if hotel.status == 'suspended':
            hotel.status = 'active'
            hotel_name = hotel.hotel_name 
            hotel.save()
            user.status = 'active'
            user.save()
            send_notification_mail(hotel.email, hotel_name, action='active')

            return Response({'message': 'Hotel activated successfully'}, status=status.HTTP_200_OK)
        elif hotel.status == 'active':
            return Response({'message': 'Hotel is already active'}, status=status.HTTP_400_BAD_REQUEST)
        else:
            return Response({'message': 'Hotel should be suspended to be activated'}, status=status.HTTP_400_BAD_REQUEST)

class BookingHotelRoom(APIView):
    permission_classes = [IsAuthenticated, CustomerPermission]

    def get_customer_user(self, user_email):
        try:
            customer = Customer.objects.get(email=user_email, status='active')
            return customer.id
        except Customer.DoesNotExist:
            return None

    def post(self, request, format=None):
        user_email = request.user.email
        customer_id = self.get_customer_user(user_email)

        if not customer_id:
            return Response({'message': 'Unable to find the customer data.'}, status=status.HTTP_400_BAD_REQUEST)

        room_id = request.data.get('room_id')
        guest_name = request.data.get('guest_name')
        email = request.data.get('email')
        phone_number = request.data.get('phone_number')
        address = request.data.get('address')
        aadhar_number = request.data.get('aadhar_number')
        number_of_rooms = request.data.get('number_of_rooms')
        number_of_adults = request.data.get('number_of_adults')
        number_of_children = request.data.get('number_of_children')
        check_in_date = request.data.get('check_in_date')
        check_out_date = request.data.get('check_out_date')
        customer = customer_id
        selected_services = request.data.get('selected_services')

        room_details = RoomDetails.objects.get(id=room_id)

        booking_data = {
            'customer': customer,
            'room': room_id,
            'guest_name': guest_name,
            'email': email,
            'phone_number': phone_number,
            'address': address,
            'aadhar_number': aadhar_number,
            'number_of_rooms': number_of_rooms,
            'number_of_adults': number_of_adults,
            'number_of_children': number_of_children,
            'check_in_date': check_in_date,
            'check_out_date': check_out_date,
            'hotel' : room_details.hotel_id.id,
            'selected_services' : selected_services
        }

        serializer = BookingSerializer(data=booking_data)

        if serializer.is_valid():
            booked_rooms = int(serializer.validated_data.get('number_of_rooms'))
            available_rooms = self.available_rooms(room_details, check_in_date, check_out_date)

            if available_rooms >= booked_rooms:
                booking = serializer.save()

                payment_data = {
                    'booking': booking.id,
                    'customer': customer,
                }

                payment_serializer = PaymentSerializer(data=payment_data)
                if payment_serializer.is_valid():
                    payment = payment_serializer.save()
                    return Response({'message': 'Booking Successful',
                                     'id': booking.id,
                                     'payment_id': payment.id},
                                    status=status.HTTP_201_CREATED)
                else:
                    return Response(payment_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            else:
                return Response({'message': 'Room is not available'}, status=status.HTTP_400_BAD_REQUEST)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def available_rooms(self, room, check_in, check_out):
        bookings = Booking.objects.filter(room=room, status__in=[in_progress, 'confirmed']).filter(
            Q(check_in_date__lte=check_in, check_out_date__gte=check_in) | 
            Q(check_in_date__lte=check_out, check_out_date__gte=check_out) |
            Q(check_in_date__gte=check_in, check_out_date__lte=check_out)
        ).aggregate(total_booked_rooms=Sum('number_of_rooms'))
        
        total_booked_rooms = bookings['total_booked_rooms'] if bookings['total_booked_rooms'] else 0
        available_rooms = room.number_of_rooms - total_booked_rooms
        return available_rooms
        
class GetCustomerBookings(APIView):
    permission_classes = [IsAuthenticated, CustomerPermission]
    
    def get(self, request, booking_id,format=None):
        try:
            user_email = request.user.email
            customer_id = Customer.objects.get(email=user_email,status='active')

            booking = Booking.objects.filter(id=booking_id,customer=customer_id).first()
            if booking:
                booking_details_data = {
                    'id': booking.id,
                    'guest_name': booking.guest_name,
                    'address': booking.address,
                    'check_in_date': booking.check_in_date,
                    'check_out_date': booking.check_out_date,
                    'status': booking.status,
                    'number_of_rooms': booking.number_of_rooms
                }
                return Response(booking_details_data, status=status.HTTP_200_OK)
            else:
                return Response({'message': 'No booking data found'}, status=status.HTTP_404_NOT_FOUND)

        except Exception as e:
            return Response({'message': f'There is something wrong occurs: {str(e)}'},status=status.HTTP_400_BAD_REQUEST)

# list bookings for hotel, supervisor and admin
        
class ListBookings(APIView):
    permission_classes = [IsAuthenticated, HotelAdminSupervisorPermission]

    def get_hotel(self, email):
        try:
            hotel = Hotel.objects.get(email=email)
            return hotel.id
        except Hotel.DoesNotExist:
            return None

    def get_bookings(self, user, hotel_id=None, query=None):
        if user == 'hotel':
            if query:
                bookings = search_booking_details(query).filter(hotel_id=hotel_id)
            else:
                bookings = Booking.objects.filter(hotel_id=hotel_id)
        elif user == 'admin' or user == 'supervisor':
            if query:
                bookings = search_booking_details(query)
            else:
                bookings = Booking.objects.all()
        else:
            return None, "Unknown user"
        return bookings, None

    def get(self, request):
        pagination_class = CustomPagination()

        try:
            user = request.user.userType
            query = request.GET.get('query')
            hotel_id = None

            if user == 'hotel':
                hotel_user = request.user.email
                hotel_id = self.get_hotel(hotel_user)
                if not hotel_id:
                    return Response({'message': hotel_not_found}, status=status.HTTP_404_NOT_FOUND)

            bookings, error_message = self.get_bookings(user, hotel_id, query)

            if error_message:
                return Response({'message': error_message}, status=status.HTTP_400_BAD_REQUEST)

            if bookings:
                paginated_result = pagination_class.paginate_queryset(bookings, request)
                serializer = BookingSerializer(paginated_result, many=True)
            
                url_next_hotel, url_previous_hotel = modify_pagination_urls(pagination_class)

                paginated_response = pagination_class.get_paginated_response(serializer.data)

                if url_next_hotel:
                    paginated_response['next'] = url_next_hotel
                if url_previous_hotel:
                    paginated_response['previous'] = url_previous_hotel

                response_data = {
                    'count': pagination_class.page.paginator.count,
                    'next': url_next_hotel,
                    'previous': url_previous_hotel,
                    'results': paginated_response.data['results'],
                }

                return Response(response_data)
            
            else:
                return Response({'message': 'No bookings data found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'message': f'Error occurred while fetching booking details {str(e)}'}, status=status.HTTP_400_BAD_REQUEST)

# sort booking list
class SortBooking(APIView):

    def get_hotel(self, email):
        try:
            hotel = Hotel.objects.get(email=email)
            return hotel.id
        except Hotel.DoesNotExist:
            return None
        
    def get(self, request, sort_by):
        try:
            user = request.user.userType

            if user == 'admin' :
                bookings = Booking.objects.order_by(sort_by)

                if bookings:
                    pagination_class = CustomPagination()
                    paginated_result = pagination_class.paginate_queryset(bookings, request)
                    serializer = BookingSerializer(paginated_result, many=True)
                    return pagination_class.get_paginated_response(serializer.data)
                else:
                    return Response({'message': no_booking_found}, status=status.HTTP_404_NOT_FOUND)
            
            elif user == 'hotel' : 
                hotel_user = request.user.email
                hotel_id = self.get_hotel(hotel_user)

                if not hotel_id:
                    return Response({'message': hotel_not_found}, status=status.HTTP_404_NOT_FOUND)
                else:
                    bookings = Booking.objects.filter(hotel=hotel_id).order_by(sort_by)

                    if bookings:
                        pagination_class = CustomPagination()
                        paginated_result = pagination_class.paginate_queryset(bookings, request)
                        serializer = BookingSerializer(paginated_result, many=True)
                        return pagination_class.get_paginated_response(serializer.data)
                    else:
                        return Response({'message': no_booking_found}, status=status.HTTP_404_NOT_FOUND)

        except Exception as e:
            return Response({'message': f'There is something wrong occurs: {str(e)}'}, status=status.HTTP_417_EXPECTATION_FAILED)
# payment process
        
class PaymentCalculation(APIView):
    permission_classes = [IsAuthenticated, CustomerPermission]

    def get(self, request, booking_id, format=None):
        user_email = request.user.email
        try:
            Customer.objects.get(email=user_email)
        except Customer.DoesNotExist:
            return Response({'message': user_not_found}, status=status.HTTP_404_NOT_FOUND)
      
        try:
            booking = Booking.objects.get(id=booking_id)
            room_details = RoomDetails.objects.get(id=booking.room.id)
            hotel_details = Hotel.objects.get(id=room_details.hotel_id.id)
        except (Booking.DoesNotExist , RoomDetails.DoesNotExist , Hotel.DoesNotExist):
            return Response({'message': 'Unable to find appropriate data '}, status=status.HTTP_404_NOT_FOUND)

        try:
            number_of_rooms = booking.number_of_rooms
            number_of_days = (booking.check_out_date - booking.check_in_date).days
            room_rate = room_details.rate
            service_charge = hotel_details.service_charge
            total_room_rate = number_of_rooms * number_of_days * room_rate
            gst_percentage = Decimal(0.12)
            gst_amount = total_room_rate * gst_percentage
            
            total_service_price = Decimal(0)
            for service in booking.selected_services.all():
                total_service_price += service.price 
            
            total_payment = service_charge + (total_room_rate + gst_amount) + total_service_price
            
            payment = {
                'booking_id': booking_id,
                'service_charge': service_charge,
                'gst_amount': gst_amount,
                'room_rate': total_room_rate,
                'total_service_price': total_service_price,
                'total_payment': total_payment
            }
            return Response(payment, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'message': str(e)}, status=status.HTTP_400_BAD_REQUEST)

def sent_booking_confirmation_mail(booking, payment):
    subject = 'BooknStay - Booking Confirmation'
    context = {
        'name': booking.guest_name,
        'check_in': booking.check_in_date,
        'check_out': booking.check_out_date,
        'rooms': booking.number_of_rooms,
        'payment_amount': payment.amount,
        'caller': 'confirmation' 
    }
    message = render_to_string('booking_confirmation.html', context)
    from_email = settings.EMAIL_HOST_USER
    recipient_list = [booking.email]
    send_mail(subject, '', from_email, recipient_list, html_message=message)


def sent_booking_notification_mail(hotel, booking, payment):
    subject = 'BooknStay - Booking Notification'
    context = {
        'name': hotel.hotel_name,
        'guest_name': booking.guest_name,
        'check_in': booking.check_in_date,
        'check_out': booking.check_out_date,
        'rooms': booking.number_of_rooms,
        'payment_amount': payment.amount,
        'caller': 'notification' 
    }
    message = render_to_string('booking_confirmation.html', context)
    from_email = settings.EMAIL_HOST_USER
    recipient_list = [hotel.email]
    send_mail(subject, '', from_email, recipient_list, html_message=message)

class PaymentConfirmation(APIView):
    permission_classes = [IsAuthenticated, CustomerPermission]

    def post(self, request, format=None):
        user_email = request.user.email

        customer = get_object_or_404(Customer, email=user_email)

        booking_id = request.data.get('booking_id')
        payment_method = request.data.get('payment_method')
        payment_id = request.data.get('payment_id')
        payment_amount = request.data.get('payment_amount')

        booking = get_object_or_404(Booking, id=booking_id, customer=customer)
        hotel = get_object_or_404(Hotel, id=booking.hotel.id)
        try:
            payment = Payment.objects.get(booking=booking.id)
        except Payment.DoesNotExist:
            payment = Payment.objects.create(
                booking=booking,
                customer=customer,
            )               
        try:
            if booking:
                if booking.status == in_progress and payment_method in ['cash','card'] and payment.status =='pending':
                    booking.status = 'confirmed'
                    booking.save()
                    payment.payment_method=payment_method
                    payment.amount = payment_amount
                    payment.paid_at = timezone.now()
                    if payment_method == 'cash':
                        payment.status = 'confirmed'
                    else:
                        payment.payment_id = payment_id
                        payment.status = 'paid'
                    payment.save()
                    sent_booking_confirmation_mail(booking, payment)
                    sent_booking_notification_mail(hotel,booking, payment)
                    return Response({'message': 'Booking confirmed successfully'}, status=status.HTTP_200_OK)
                elif booking.status =='confirmed':
                    return Response({'message': 'Booking already confirmed'}, status=status.HTTP_400_BAD_REQUEST)
                else:
                    return Response({'message': 'Requested data is not an active booking'}, status=status.HTTP_400_BAD_REQUEST)
        except Exception:
            return Response({'message': 'Error occured during the process'}, status=status.HTTP_400_BAD_REQUEST)


# stripe payment gateway

stripe.api_key = settings.STRIPE_SECRETE_KEY

class StripePaymentCheckout(APIView):
    def post(self, request, *args, **kwargs):
        try:
            total_payment = Decimal(request.data.get('total_payment'))
            intent = stripe.PaymentIntent.create(
                amount=int(total_payment * 100), 
                currency='inr', 
                description='Payment for booking',
                payment_method_types=['card'] ,
            )

            return Response({'clientSecret': intent.client_secret})
        except Exception as e:
            return Response({'error': str(e)}, status=400)

# retrieve booking, payment and selected hotel details 
class BookingPaymentDetails(APIView):
    permission_classes = [IsAuthenticated, CustomerPermission]

    def get(self, request, booking_id):
        try: 
            user_email = request.user.email
            try:
                customer = Customer.objects.get(email=user_email)
            except Customer.DoesNotExist:
                return Response({'message': user_not_found}, status=status.HTTP_404_NOT_FOUND)
            
            booking = get_object_or_404(Booking.objects.select_related('room__hotel_id'), id=booking_id, customer=customer.id)


            booking_serializer = BookingSerializer(booking)

            payment = Payment.objects.filter(booking=booking)
            payment_data = PaymentSerializer(payment, many=True).data if payment.exists() else None

            hotel_serializer = ListHotelSerializer(booking.room.hotel_id)

            response_data = {
                'booking': booking_serializer.data,
                'payment': payment_data[0] if payment_data else None,
                'hotel': hotel_serializer.data
            }

            return Response(response_data, status=status.HTTP_200_OK)

        except Exception:
            return Response({'message': 'Unable to retrieve the data'}, status=status.HTTP_417_EXPECTATION_FAILED)


class PaymentInvoiceDetails(APIView):
    permission_classes = [IsAuthenticated, CustomerPermission]

    def get(self, request, booking_id):
        try: 
            user_email = request.user.email
            try:
                customer = Customer.objects.get(email=user_email)
            except Customer.DoesNotExist:
                return Response({'message': user_not_found}, status=status.HTTP_404_NOT_FOUND)
            
            booking = get_object_or_404(Booking.objects.select_related('room__hotel_id'), id=booking_id, customer=customer.id)

            booking_serializer = BookingSerializer(booking)
            payment = Payment.objects.filter(booking=booking)
            payment_data = PaymentSerializer(payment, many=True).data if payment.exists() else None
            hotel_serializer = ListHotelSerializer(booking.room.hotel_id)

            date = timezone.now().date()
            year = date.year

            html_template = render_to_string('invoice_template.html', {
                'booking': booking_serializer.data,
                'payment': payment_data[0] if payment_data else None,
                'hotel': hotel_serializer.data,
                'currentDate': date,
                'currentYear': year
            })

            pdf_file = BytesIO()
            pisa_status = pisa.CreatePDF(html_template, dest=pdf_file)
            if pisa_status.err:
                return Response({'message': 'Unable to generate PDF'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            pdf_path = os.path.join(settings.MEDIA_ROOT, f'invoice_{booking_id}.pdf')
            with open(pdf_path, 'wb') as f:

                f.write(pdf_file.getvalue())
            
            response = HttpResponse(pdf_file.getvalue(), content_type='application/pdf')
            response['Content-Disposition'] = 'attachment; filename="invoice.pdf"'
            return response
        except Exception as e:
            return Response({'message': f'There is something wrong occurs: {str(e)}'}, status=status.HTTP_417_EXPECTATION_FAILED)

# customer reservation history
class CustomerReservationList(APIView):
    permission_classes = [IsAuthenticated, CustomerPermission]

    def get_customer_id_for_user(self, user_email):
        try:
            customer = Customer.objects.get(email=user_email)
            return customer.id
        except Customer.DoesNotExist:
            return None 
    
    def search_booking_details(self, bookings, query):
        booking = bookings.filter(
            Q(booked_at__icontains=query) |
            Q(check_in_date__icontains=query) |
            Q(check_out_date__icontains=query) |
            Q(phone_number__icontains=query) | 
            Q(guest_name__icontains=query)|
            Q(status__icontains=query)
        )
        return booking
        
    def post(self, request, format=None):
        user_email = request.user.email
        customer_id = self.get_customer_id_for_user(user_email)
        
        if not customer_id:
            return Response({'message': 'Unknown user.'}, status=status.HTTP_400_BAD_REQUEST)
        
        status_filter = request.data.get('data', {}).get('status_filter')
        current_date = date.today()

        try:
            if status_filter == 'upcoming':
                bookings = Booking.objects.filter(customer=customer_id, check_in_date__gte=current_date).exclude(status='cancelled')
            elif status_filter == 'cancelled':
                bookings = Booking.objects.filter(customer=customer_id, status='cancelled')
            elif status_filter == 'completed':
                bookings = Booking.objects.filter(customer=customer_id, check_out_date__lte=current_date).exclude(status__in=['cancelled','in progress'])
            else:
                bookings = Booking.objects.filter(customer=customer_id)
            
            query = request.data.get('params', {}).get('query')

            if query:
                bookings = self.search_booking_details(bookings, query)

            if bookings.exists():
                pagination_class = CustomPagination()
                paginated_result = pagination_class.paginate_queryset(bookings, request)
                serializer = BookingSerializer(paginated_result, many=True)
                url_next_reservation, url_previous_reservation = modify_pagination_urls(pagination_class)

                paginated_response = pagination_class.get_paginated_response(serializer.data)

                if url_next_reservation:
                    paginated_response['next'] = url_next_reservation
                if url_previous_reservation:
                    paginated_response['previous'] = url_previous_reservation

                response_data = {
                    'count': pagination_class.page.paginator.count,
                    'next': url_next_reservation,
                    'previous': url_previous_reservation,
                    'results': paginated_response.data['results'],
                }

                return Response(response_data)

            else:
                return Response({'message': 'No bookings found'}, status=status.HTTP_404_NOT_FOUND)

        except Exception as e:
            return Response({'message': f'There is something wrong occurs: {str(e)}'},status=status.HTTP_417_EXPECTATION_FAILED)

class SortCustomerReservation(APIView):
    def get(self, request, sort_by):
        user_email = request.user.email
        try:
            customer = Customer.objects.get(email=user_email)
        except Customer.DoesNotExist:
            return Response({'message': 'Unknown user.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            bookings = Booking.objects.filter(customer = customer.id) .order_by(sort_by)

            if bookings:
                pagination_class = CustomPagination()
                paginated_result = pagination_class.paginate_queryset(bookings, request)
                serializer = BookingSerializer(paginated_result, many=True)
                return pagination_class.get_paginated_response(serializer.data)
            else:
                return Response({'message': no_booking_found},
                    status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'message': f'There is something wrong occurs: {str(e)}'}, status=status.HTTP_417_EXPECTATION_FAILED)

class CountTodayBooking(APIView):
    permission_classes = [IsAuthenticated, HotelPermission]

    def get(self, request, format=None):
        try:
            hotel = Hotel.objects.get(email=request.user.email)
            today = timezone.now().date()

            today_bookings_count = Booking.objects.filter(
                hotel=hotel,
                check_in_date=today,
            ).count()

            return Response({
                'today_bookings_count': today_bookings_count,
            }, status=status.HTTP_200_OK)

        except Hotel.DoesNotExist:
            return Response({'error': hotel_not_found}, status=status.HTTP_404_NOT_FOUND)

        except Exception as e:
            error_message = f"An error occurred: {str(e)}"
            return Response({'error': error_message}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class PaymentPercentage(APIView):
    permission_classes = [IsAuthenticated, HotelPermission]

    def get(self, request, format=None):
        try:
            hotel = Hotel.objects.get(email=request.user.email)

            cash_payments = Payment.objects.filter(
                booking__hotel=hotel,
                payment_method='cash'
            ).count()

            return Response({
                'cash_percentage': cash_payments,
            }, status=status.HTTP_200_OK)

        except Hotel.DoesNotExist:
            return Response({'error': hotel_not_found}, status=status.HTTP_404_NOT_FOUND)

        except Exception as e:
            error_message = f"An error occurred: {str(e)}"
            return Response({'error': error_message}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class GetSelectedWeekBookings(APIView):
    permission_classes = [IsAuthenticated, HotelPermission]

    def get_queryset(self):
        hotel = get_object_or_404(Hotel, email=self.request.user.email)
        
        start_date_str = self.request.query_params.get('start_date')

        if start_date_str is None:
            return []

        start_date = datetime.strptime(start_date_str, '%Y-%m-%d').replace(tzinfo=pytz.UTC)

        start_day_of_week = start_date.weekday()

        day_names = {
            0: 'Monday',
            1: 'Tuesday',
            2: 'Wednesday',
            3: 'Thursday',
            4: 'Friday',
            5: 'Saturday',
            6: 'Sunday'
        }

        reordered_day_names = {i: day_names[(start_day_of_week + i) % 7] for i in range(7)}

        booking_counts = []

        for day_of_week in range(7):
            bookings_count = Booking.objects.filter(
                hotel=hotel,
                check_in_date__range=[start_date, start_date + timedelta(days=6)],
                check_in_date__week_day=(start_day_of_week + day_of_week) % 7
            ).count()
            booking_counts.append({
                'day_of_week': reordered_day_names[day_of_week],
                'count': bookings_count
            })

        return booking_counts

    def get(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        return Response(queryset)



class RecentReviews(APIView):
    permission_classes = [IsAuthenticated, HotelPermission]
    def get(self, request, *args, **kwargs):
        try:
            hotel = Hotel.objects.get(email=request.user.email)

            hotel_email = hotel.email

            recent_reviews = Review.objects.filter(
                Q(hotel_email=hotel_email),Q(status='active'),
                Q(created_at__isnull=False) | Q(updated_on__isnull=False)
            ).order_by('-created_at', '-updated_on')[:2]

            serialized_reviews = [{'customer_name': review.customer_name,
                                   'rating': review.rating,
                                   'title': review.title,
                                   'comment': review.comment,
                                   } for review in recent_reviews]

            return Response(serialized_reviews, status=status.HTTP_200_OK)
        except Hotel.DoesNotExist:
            return Response({'error': hotel_not_found}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            error_message = f"An error occurred: {str(e)}"
            return Response({'error': error_message}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# display payment details to the admin and hotel
class ViewPaymentDetails(APIView):
    permission_classes=[IsAuthenticated, HotelAdminSupervisorPermission]
    serializer_class = PaymentSerializer
     
    def get(self, request,booking_id):
        try:
            payment = Payment.objects.filter(booking=booking_id)
            if payment:
                serializer = PaymentSerializer(payment, many=True)
                return Response(serializer.data, status=status.HTTP_200_OK)
            else:
                return Response({'message': 'Payment data not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'message': f'There is something wrong occurs: {str(e)}'},status=status.HTTP_400_BAD_REQUEST)
        
# list reviews for customers by hotel id
class ReviewsListByHotelId(APIView):
    
    def get(self, request, hotel_id):
        try:
            hotel_email = get_hotel_data(hotel_id)

            if not hotel_email:
                return Response({'message': hotel_not_found}, status=status.HTTP_404_NOT_FOUND)
            else:
                reviews = Review.objects.filter(hotel_email=hotel_email.email, status='active')
                reviews_data = []

                for review in reviews:
                    review_data = {
                        'hotel_email' : review.hotel_email,
                        'customer_name' : review.customer_name,
                        'rating' : review.rating,
                        'title' : review.title,
                        'comment' : review.comment,
                        'created_at' : review.created_at,
                        'id': review.id,
                        'feedbacks' : review.feedbacks,
                        'feedbacks_created_at' : review.feedbacks_created_at
                    }
                    base_url = request.build_absolute_uri('/')[:-1]

                    images = review.images.all()
                    image_urls = [base_url + image.image.url for image in images]
                    review_data['images'] = image_urls

                    reviews_data.append(review_data)

                return Response(reviews_data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": f"Failed to fetch reviews. {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)

# booking cancellation
def sent_cancellation_mail(to_email, name):
    subject = 'BooknStay - Booking Cancellation'
    message = format_html(
        'Hi {name},<br><br>'
        'Your booking has been cancelled. '
        'Any paid amount will be refunded to your account in 7 working days<br>'
        'Contact with our team for any queries.<br>'
        'Thank you for cooperating with our team <br><br><br>Thanks & regards, <br>BooknStay Team',
        name=name,
    )
    from_mail = settings.EMAIL_HOST_USER
    recipient_list = [to_email]
    send_mail(subject, '', from_mail, recipient_list, html_message=message)

def refund_payment( payment_id):
    try:
        stripe.Refund.create(
            payment_intent=payment_id,
        )
        return JsonResponse({'success': True, 'message': 'Refund processed successfully.'})
    except stripe.error.StripeError as e:
        return JsonResponse({'success': False, 'message': str(e)})

class CancelBookings(APIView):
    permission_classes = [IsAuthenticated, CustomerPermission]
    
    def post(self, request, booking_id,format=None):
        try:
            user_email = request.user.email
            customer_id = Customer.objects.get(email=user_email,status='active')

            booking = Booking.objects.filter(id=booking_id,customer=customer_id).first()
            payment = Payment.objects.filter(booking=booking_id,customer=customer_id).first()
            if booking and payment:
                if booking.status != 'cancelled' and payment.status!= 'cancelled':
                    booking.status = 'cancelled'               
                    payment.status = 'cancelled'
                    if payment.payment_method == 'card':
                        refund_payment(payment.payment_id)
                    booking.save()
                    payment.save()
                    sent_cancellation_mail(booking.email,  booking.guest_name)
                    return Response({'message': 'Booking cancelled successfully'}, status=status.HTTP_200_OK)
                else:
                    return Response({'message': 'Booking already cancelled'}, status=status.HTTP_400_BAD_REQUEST)
            else:
                return Response({'message': 'No booking data found'}, status=status.HTTP_404_NOT_FOUND)

        except Exception as e:
            return Response({'message': f'There is something wrong occurs: {str(e)}'},status=status.HTTP_400_BAD_REQUEST)

class RoomAndServicesCount(APIView):
    def get(self, request):
        try :
            hotel = request.user.email
            hotel_id = get_hotel(hotel)

            if hotel :
                room_count = RoomDetails.objects.filter(hotel_id=hotel_id, status='active').count()
                service_count = RoomServices.objects.filter(hotel_id=hotel_id, status='active').count()

                data = {
                    'room_count' : room_count,
                    'service_count' : service_count
                }

                return Response(data, status=status.HTTP_200_OK)
            else :
                return Response({'message' : hotel_data_not_found}, status=status.HTTP_404_NOT_FOUND)
            
        except Exception as e:
            return Response({'message' : f'An error occured while fetching data {str(e)}'}, status=status.HTTP_417_EXPECTATION_FAILED)

# hotel cancel the incomplete bookings
class CancelIncompleteBookings(APIView):
    permission_classes = [IsAuthenticated, HotelPermission]
    
    def post(self, request, booking_id,format=None):
        try:
            user_email = request.user.email
            hotel_id = Hotel.objects.get(email=user_email,status='active')

            booking = Booking.objects.filter(id=booking_id,hotel=hotel_id).first()
            payment = Payment.objects.filter(booking=booking_id).first()
            if booking and payment:
                booking.status = 'cancelled'               
                payment.status = 'cancelled'
                booking.save()
                payment.save()
                sent_cancellation_mail(booking.email,  booking.guest_name)
                return Response({'message': 'Booking cancelled successfully'}, status=status.HTTP_200_OK)
            else:
                return Response({'message': 'No booking details found'}, status=status.HTTP_404_NOT_FOUND)

        except Exception as e:
            return Response({'message': f'There is something wrong occurs: {str(e)}'},status=status.HTTP_400_BAD_REQUEST)

class SortActiveHotelDetails(APIView):
    def post(self, request, format=None):
        try:
            option = request.data.get('option')
            hotels = Hotel.objects.filter(status='active', roomdetails__isnull=False).distinct()
            if hotels.exists():
                hotel_data = []
                for hotel in hotels:
                    lowest_rate = RoomDetails.objects.filter(hotel_id=hotel).aggregate(lowest_rate=Min('rate'))['lowest_rate']
                    average_rating = Review.objects.filter(hotel_email=hotel.email).aggregate(avg_rating=Avg('rating'))['avg_rating']
                    average_rating = round(average_rating, 1) if average_rating else 0
                    rating_count = Review.objects.filter(hotel_email=hotel.email).count()
                    hotel_serializer = ListHotelSerializer(hotel)
                    
                    hotel_data_entry = {'hotel_details': hotel_serializer.data}
                    
                    if hotel_serializer.data.get('image'):
                        base_url = request.build_absolute_uri('/')[:-1]
                        image_url = base_url + hotel_serializer.data['image']
                        hotel_data_entry['hotel_image'] = image_url

                    hotel_data_entry.update({
                        'lowest_rate': lowest_rate,
                        'average_rating': average_rating,
                        'rating_count': rating_count
                    })
                    hotel_data.append(hotel_data_entry)

                if option == '1':
                    hotel_data.sort(key=lambda x: x['average_rating'], reverse=True)
                elif option == '2':
                    hotel_data.sort(key=lambda x: x['lowest_rate'], reverse=True)
                elif option == '3':
                    hotel_data.sort(key=lambda x: x['lowest_rate'])

                return Response(hotel_data, status=status.HTTP_200_OK)
            else:
                return Response({'message': 'No active hotels found to process'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'message': f'There is something wrong occurs: {str(e)}'}, status=status.HTTP_417_EXPECTATION_FAILED)
        

class HotelNotifications(APIView):
    permission_classes = [IsAuthenticated, HotelPermission]
    
    def format_notification_message(self, notification):
        if notification.notification_type == 'Payment':
            payment_info = notification.message.split("has been made by")
            if len(payment_info) == 2:
                return f"A new payment of {payment_info[0].strip()} has been made for booking by {payment_info[1].split('for booking')[0].strip()}"
        elif notification.notification_type == 'Hotel Booking':
            username = notification.message.split("by ")[1]
            return f"A new booking to hotel :  by {username}"
        return notification.message

    def get(self, request):
        try:
            user = request.user

            hotel = Hotel.objects.filter(email=user.email).first()

            if not hotel:
                return Response({"error": "Hotel not found for the current user."}, status=status.HTTP_404_NOT_FOUND)

            hotel_id = hotel.id

            hotel_notifications = Notification.objects.filter(
                Q(hotel_id=hotel_id) | 
                Q(booking__hotel_id=hotel_id) | 
                Q(payment__booking__hotel_id=hotel_id),
                is_hotel_deleted=False
            ).exclude(notification_type='Hotel Registration').order_by('-created_at')

            formatted_hotel_notifications = []
            for notification in hotel_notifications:
                formatted_notification = {
                    "id": notification.id,
                    "type": notification.notification_type,
                    "message": self.format_notification_message(notification),
                    "is_hotel_read": notification.is_hotel_read,
                    "created_at": get_human_readable_time(notification.created_at),
                    "is_hotel_favorite": notification.is_hotel_favorite
                }
                formatted_hotel_notifications.append(formatted_notification)
               
            password_reset_notifications = Notification.objects.filter(
                user=user,
                notification_type='Password Reset'
            ).order_by('-created_at')

            formatted_password_reset_notifications = []
            for notification in password_reset_notifications:
                formatted_password_reset_notifications.append({
                    "id": notification.id,
                    "type": notification.notification_type,
                    "message": notification.message,
                    "is_hotel_read": notification.is_hotel_read,
                    "created_at": get_human_readable_time(notification.created_at),
                    "is_hotel_favorite": notification.is_hotel_favorite
                })

            all_notifications = formatted_hotel_notifications + formatted_password_reset_notifications

            
            paginator = CustomPaginations()
            paginated_data = paginator.paginate_queryset(all_notifications, request)
            
            return paginator.get_paginated_response(paginated_data)
        except Exception as e:
            return Response({"error": f"Internal Server Error: {e}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class DeleteHotelNotifications(APIView):
    permission_classes = [IsAuthenticated, HotelPermission]

    def post(self, request, notification_id):
        try:
            notification_to_delete = Notification.objects.get(id=notification_id)
            notification_to_delete.is_hotel_deleted = True
            notification_to_delete.save()

            return Response("Notification marked as deleted successfully.", status=status.HTTP_200_OK)

        except Notification.DoesNotExist:
            return Response(notification_not_found, status=status.HTTP_404_NOT_FOUND)

        except Exception as e:
            return Response(f"Internal Server Error: {e}", status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
class AddHotelNotificationToFavorites(APIView):
    permission_classes = [IsAuthenticated, HotelPermission]
    def post(self, request, notification_id):
        try:
            notification = Notification.objects.get(pk=notification_id)
            notification.hotel_toggle_favorite()
            return Response({"message": "Notification added to favorites successfully."}, status=status.HTTP_200_OK)
        except Notification.DoesNotExist:
            return Response({"error": notification_not_found}, status=status.HTTP_404_NOT_FOUND)
      


class ReadHotelnotification(APIView):
    permission_classes = [IsAuthenticated, HotelPermission]

    def post(self, request, notification_id):
        try:
            notification_read = Notification.objects.get(id=notification_id)
            notification_read.is_hotel_read = True
            notification_read.save()

            return Response("Notification read successfully.", status=status.HTTP_200_OK)

        except Notification.DoesNotExist:
            return Response(notification_not_found, status=status.HTTP_404_NOT_FOUND)

        except Exception as e:
            return Response(f"Internal Server Error: {e}", status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class UnreadHotelNotificationCount(APIView):
    permission_classes = [IsAuthenticated, HotelPermission]

    def get(self, request):
        unread_count = Notification.objects.filter(is_hotel_read=False, hotel_id=request.user.id).count()
        return Response({"unread_count": unread_count}) 
