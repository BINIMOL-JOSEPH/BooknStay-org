from unittest.mock import patch, MagicMock
from django.test import TestCase
from rest_framework import status
from rest_framework.test import APITestCase,APIClient
from django.urls import reverse
from django.core.files.uploadedfile import SimpleUploadedFile
from io import BytesIO
from pathlib import Path
from user_app.models import Login ,Notification , Customer
from django.core import mail
from django.test import TestCase
from hotel_app.serializer import (
    RoomDetailsSerializer,
    RoomsAdditionalActivitesSerializer,
    RoomServicesSerializer
)
from hotel_app.models import (
    Hotel,
    RoomDetails,
    RoomType,
    RoomImages,
    RoomServices,
    Booking,Payment,
    RoomAdditionalActivites,
    Review,
)
from PIL import Image
from io import BytesIO
from datetime import date,timedelta,datetime
from user_app.models import Customer
from decimal import Decimal
import json
from django.utils import timezone


# Create your tests here.
admin_email= "admin@gmail.com"
admin_password = "admin@123"
test_email = "test@example.com"
content_type = "image/jpeg"
hotel_data_not_available = "Hotel data not available"
hotel_user_not_found = 'Hotel user not found'
test_password = "Password@123"

class HotelRegisterTestCase(APITestCase):
    def setUp(self):
        self.url = '/hotel/hotel-register/'
    
    def test_valid_hotel_registration(self) :
        data = {
                    "hotel_name":"Mariott",
                    "email":"mariott@gmail.com",
                    "phone_number":"9878865455",
                    "address":"Mariott",
                    "city":"Vyttila",
                    "district":"ernakulam",
                    "state":"kerala",
                    "pincode":"678988",
                    "license_number":"12-4353-6785",
                    "description":"test 7 star hotel",
                    "service_charge":"1786.56",
                    "password":"Mariott@123",
                    "location_link":"http://google.com"
            }
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
    
    def test_invalid_hotel_registration(self) :
        data = {
                    "hotel_name":"Mariott",
                    "email":"mario@gmail.com",
                    "phone_number":"9878865455",
                    "address":"Mariotttower",
                    "city":"Vyttila",
                    "district":"ernakulam",
                    "state":"kerala",
                    "pincode":"678988",
            }
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    
    def test_invalid_email_hotel_registration(self):
        data = {
            "email": "invalid_email",
        }
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

        self.assertIn('Enter a valid email address.', response.data['email'])
    
    def test_invalid_password_hotel_registration(self):
        data_no_digit = {
            "password": "invalid_password",
        }
        response = self.client.post(self.url, data_no_digit, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

        self.assertIn('Password should contain at least one digit.', response.data['password'])

        data_no_char = {
            "password": "123@12323",
        }
        response = self.client.post(self.url, data_no_char, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

        self.assertIn('Password should contain at least one letter (uppercase or lowercase).', response.data['password'])

        data_no_spec_char = {
            "password": "Maroti123",
        }
        response = self.client.post(self.url, data_no_spec_char, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

        self.assertIn('Password should contain at least one special character.', response.data['password'])

        data_short_len = {
            "password": "123@",
        }
        response = self.client.post(self.url, data_short_len, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

        self.assertIn('Password should be at least 8 characters long.', response.data['password'])
    
    def test_invalid_hotel_name_hotel_registration(self):
        data = {
            "hotel_name": "hotel#@!",
        }
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

        self.assertIn('Hotel name should only contain alphanumeric characters and & character.', response.data['hotel_name'])

        data_long_len = {
            "hotel_name": "hotel paradise test hotel name for the test purpose which is temperory",
        }
        response = self.client.post(self.url, data_long_len, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

        self.assertIn('Hotel name should not exceed 50 characters.', response.data['hotel_name'])

    def test_invalid_phone_number_hotel_registration(self):
        data = {
            "phone_number": "98765gtf",
        }
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

        self.assertIn('Phone number should only contain numeric digits.', response.data['phone_number'])

        data_short_len = {
            "phone_number": "98765",
        }
        response = self.client.post(self.url, data_short_len, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

        self.assertIn('Phone number should be 10 digits long.', response.data['phone_number'])


    def test_invalid_pincode_hotel_registration(self):
        data = {
            "pincode": "pin567",
        }
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

        self.assertIn('PIN code should only contain numeric digits.', response.data['pincode'])

        data_short_len = {
            "pincode": "6567",
        }
        response = self.client.post(self.url, data_short_len, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

        self.assertIn('PIN code should be exactly 6 digits long.', response.data['pincode'])

    def test_invalid_service_charge_hotel_registration(self):
        data = {
            "service_charge": "1.9g",
        }
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

        self.assertIn('A valid number is required.', response.data['service_charge'])

        data_dec_place = {
            "service_charge": "1.908",
        }
        response = self.client.post(self.url, data_dec_place, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

        self.assertIn('Ensure that there are no more than 2 decimal places.', response.data['service_charge'])

        data_neg = {
            "service_charge": "-1.9",
        }
        response = self.client.post(self.url, data_neg, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

        self.assertIn('Rate should be a non-negative value.', response.data['service_charge'])


    def test_invalid_license_number_hotel_registration(self):
        data = {
            "license_number": "765-877",
        }
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

        self.assertIn('Invalid license number format. Please use the format XX-XXXX-XXXX.', response.data['license_number'])

    def test_invalid_city_hotel_registration(self):
        data = {
            "city": "city#@!",
        }
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

        self.assertIn('City name should only contain alphabetic characters.', response.data['city'])

        data_short_len = {
            "city": "ci",
        }
        response = self.client.post(self.url, data_short_len, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

        self.assertIn('City name should be at least 3 characters long.', response.data['city'])

        data_long_len = {
            "city": "cityparadisetestcitynameforthetestpurposewhichistemperory",
        }
        response = self.client.post(self.url, data_long_len, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

        self.assertIn('City name should not exceed 50 characters.', response.data['city'])
    
    def test_invalid_district_hotel_registration(self):
        data = {
            "district": "district#@!",
        }
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

        self.assertIn('District name should only contain alphabetic characters.', response.data['district'])

        data_short_len = {
            "district": "ci",
        }
        response = self.client.post(self.url, data_short_len, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

        self.assertIn('District name should be at least 3 characters long.', response.data['district'])

        data_long_len = {
            "district": "paradisetestdistrictnameforthetestpurposewhichistemperory",
        }
        response = self.client.post(self.url, data_long_len, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

        self.assertIn('District name should not exceed 50 characters.', response.data['district'])

    def test_invalid_state_hotel_registration(self):
        data = {
            "state": "state#@!",
        }
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

        self.assertIn('State name should only contain alphabetic characters.', response.data['state'])

        data_short_len = {
            "state": "ci",
        }
        response = self.client.post(self.url, data_short_len, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

        self.assertIn('State name should be at least 3 characters long.', response.data['state'])

        data_long_len = {
            "state": "paradisetestdistrictnameforthetestpurposewhichistemperory",
        }
        response = self.client.post(self.url, data_long_len, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

        self.assertIn('State name should not exceed 50 characters.', response.data['state'])

    def test_invalid_address_hotel_registration(self):
        data_long_len = {
            "address": "address is the contact point of a person to any other party which helps to maintain aware of the person and their existance. paradise test address details for the test purpose which is temperory. it should be deleted when the testing is completed.",
        }
        response = self.client.post(self.url, data_long_len, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

        self.assertIn('Address should not exceed 200 characters.', response.data['address'])

    def test_invalid_description_hotel_registration(self):
        data_long_len = {
            "description": "description of a hotel is the communication point of a hotel to any other party which helps to maintain aware of the hotel and their existance. paradise test address details for the test purpose which is temperory. it should be deleted when the testing is completed.",
        }
        response = self.client.post(self.url, data_long_len, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

        self.assertIn('Description should not exceed 255 characters.', response.data['description'])

    def test_duplicate_value_hotel_registration(self) :
        data = {
                    "hotel_name":"Mariott",
                    "email":"mariot@test.com",
                    "phone_number":"9878865455",
                    "address":"Mariott test towers",
                    "city":"Vyttila",
                    "district":"ernakulam",
                    "state":"kerala",
                    "pincode":"678988",
                    "license_number":"12-4353-6785",
                    "description":"7 star hotel demo and residency",
                    "service_charge":"1786.56",
                    "password":"Mariott@123",
            }
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        data_duplicate = {
            "email": "mariot@test.com",
            "license_number":"12-4353-6785",
        }
        response = self.client.post(self.url, data_duplicate, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

        self.assertIn('This email address is already in use.', response.data['email'])
        self.assertIn('This license number is already in use.', response.data['license_number'])
    
# #fetch hotel details
class GetHotelDetailsTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.admin = Login.objects.create(
            email=admin_email,
            password=(admin_password),
            status="active",
            userType="admin",
            first_name="admin"
        )
        self.hotel=Hotel.objects.create(
            hotel_name='Summer', address='Homes', email='summer@tests.com', phone_number='9876656789',
            user_type='hotel', status='active',city='test',district='test',state='test',
            license_number='12-1234-1234',service_charge='1234.34',description='good')
    def test_get_hotel_details_with_query(self):       
        url = reverse('hotel-details')
        self.client.force_authenticate(user=self.admin)
        response = self.client.get(url, {'query': 'Summer'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertContains(response, 'Summer')

    def test_get_hotel_details_without_query(self):
        url = reverse('hotel-details')
        self.client.force_authenticate(user=self.admin)
        response = self.client.get(url, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertContains(response, 'Summer')

    def test_get_user_details_no_user(self):
        url = reverse('hotel-details')
        self.client.force_authenticate(user=self.admin)
        self.hotel.delete()
        response = self.client.get(url, format='json')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

class HotelDetailsByStatusTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.admin = Login.objects.create(
            email=admin_email,
            password=(admin_password),
            status="active",
            userType="admin",
            first_name="admin"
        )
        self.hotel=Hotel.objects.create(
            hotel_name='Summer', address='Homes', email='summer@example.com', phone_number='9876656789',
            user_type='hotel', status='active',city='test',district='test',state='test',
            license_number='12-1234-1234',service_charge='1234.34',description='good')

    def test_get_user_details_by_status(self):
        url = reverse('hotels-by-status', args=['active'])
        self.client.force_authenticate(user=self.admin)
        response = self.client.get(url, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertContains(response, 'Summer')

    def test_get_user_details_by_status_not_found(self):
        url = reverse('hotels-by-status', args=['inactive'])
        self.client.force_authenticate(user=self.admin)
        response = self.client.get(url, format='json')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)


class RejectHotelTestCase(APITestCase):
    def setUp(self):
        # Create a user with admin permissions for authentication
        self.admin = Login.objects.create(
            email=admin_email,
            password=(admin_password),
            status="active",
            userType="admin",
            first_name="admin"
        )
        self.hotel=Hotel.objects.create(
            hotel_name='Summer', address='Homes', email='summertest@gmail.com', phone_number='9876656789',
            user_type='hotel', status='inactive',city='test',district='test',state='test',
            license_number='12-1234-1234',service_charge='1234.34',description='good')     
        self.hotel1=Hotel.objects.create(
            hotel_name='Heaven', address='Homes', email='test@gmail.com', phone_number='9876656789',
            user_type='hotel', status='active',city='test',district='test',state='test',
            license_number='12-1234-1235',service_charge='1234.34',description='good')
        self.hotel2=Hotel.objects.create(
            hotel_name='Taj', address='Homes', email='test1@gmail.com', phone_number='9876656789',
            user_type='hotel', status='rejected',city='test',district='test',state='test',
            license_number='12-1234-1236',service_charge='1234.34',description='good')

        self.hotel_user = Login.objects.create(email='summertest@gmail.com', password='Summer@12345', userType='hotel', status='inactive')
        self.hotel_user1 = Login.objects.create(email='test@gmail.com', password='Test@1234', userType='hotel', status='active')
        self.hotel_user2 = Login.objects.create(email='test1@gmail.com', password='Test1@1234', userType='hotel', status='rejected')
        self.client.force_authenticate(user=self.admin)

    def test_reject_hotel(self):
        url = reverse('reject-hotel', args=[self.hotel.id])
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.hotel.refresh_from_db()
        self.hotel_user.refresh_from_db()
        self.assertEqual(self.hotel.status, 'rejected')
        self.assertEqual(self.hotel_user.status, 'rejected')

        self.assertEqual(len(mail.outbox), 1)
        self.assertEqual(mail.outbox[0].subject, 'BooknStay - Account Rejection')
        self.assertEqual(mail.outbox[0].to, [self.hotel.email])
    
    def test_reject_hotel_no_hotel_found(self):
        url = reverse('reject-hotel', args=[self.hotel.id])
        self.hotel.delete()
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
    
    def test_reject_active_hotel(self):
        url = reverse('reject-hotel', args=[self.hotel1.id])
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    
    def test_reject_rejected_hotel(self):
        url = reverse('reject-hotel', args=[self.hotel2.id])
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_reject_hotel_no_hotel_login_found(self):
        url = reverse('reject-hotel', args=[self.hotel.id])
        self.hotel_user.delete()
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

class ApproveHotelTestCase(APITestCase):
    def setUp(self):
        # Create a user with admin permissions for authentication
        self.admin = Login.objects.create(
            email=admin_email,
            password=(admin_password),
            status="active",
            userType="admin",
            first_name="admin"
        )
        self.hotel=Hotel.objects.create(
            hotel_name='Motel', address='Homes', email='motel@gmail.com', phone_number='9876656789',
            user_type='hotel', status='inactive',city='test',district='test',state='test',
            license_number='12-1234-1234',service_charge='1234.34',description='good')     
        self.hotel1=Hotel.objects.create(
            hotel_name='Hyatt', address='Homes', email='hyatt@gmail.com', phone_number='9876656789',
            user_type='hotel', status='active',city='test',district='test',state='test',
            license_number='12-1234-1235',service_charge='1234.34',description='good')
        self.hotel2=Hotel.objects.create(
            hotel_name='Taj', address='Homes', email='taj@gmail.com', phone_number='9876656789',
            user_type='hotel', status='rejected',city='test',district='test',state='test',
            license_number='12-1234-1236',service_charge='1234.34',description='good')

        self.hotel_user = Login.objects.create(email='motel@gmail.com', password='Motel@1234', userType='hotel', status='inactive')
        self.hotel_user1 = Login.objects.create(email='hyatt@gmail.com', password='Hyatt@1234', userType='hotel', status='active')
        self.hotel_user2 = Login.objects.create(email='taj@gmail.com', password='Taj@1234', userType='hotel', status='rejected')
        self.client.force_authenticate(user=self.admin)

    def test_approve_hotel(self):
        url = reverse('approve-hotel', args=[self.hotel.id])
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.hotel.refresh_from_db()
        self.hotel_user.refresh_from_db()
        self.assertEqual(self.hotel.status, 'active')
        self.assertEqual(self.hotel_user.status, 'active')

        self.assertEqual(len(mail.outbox), 1)
        self.assertEqual(mail.outbox[0].subject, 'BooknStay - Account confirmation')
        self.assertEqual(mail.outbox[0].to, [self.hotel.email])
    
    def test_approve_hotel_no_hotel_found(self):
        url = reverse('approve-hotel', args=[self.hotel.id])
        self.hotel.delete()
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
    
    def test_approve_active_hotel(self):
        url = reverse('approve-hotel', args=[self.hotel1.id])
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    
    def test_approve_rejected_hotel(self):
        url = reverse('approve-hotel', args=[self.hotel2.id])
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_approve_hotel_no_hotel_login_found(self):
        url = reverse('approve-hotel', args=[self.hotel.id])
        self.hotel_user.delete()
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

class ViewHotelDetailsTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.admin = Login.objects.create(
            email=admin_email,
            password=(admin_password),
            status="active",
            userType="admin",
            first_name="admin"
        )
        self.hotel=Hotel.objects.create(
            hotel_name='Summer', address='Homes', email='summer@test.com', phone_number='9876656789',
            user_type='hotel', status='active',city='test',district='test',state='test',
            license_number='12-1234-1234',service_charge='1234.34',description='good')
        self.client.force_authenticate(user=self.admin)
    
    def test_view_hotel(self):
        url = reverse('view-hotel', kwargs={'id': self.hotel.id})
        response = self.client.get(url,format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_get_user_details_no_user(self):
        url = reverse('view-hotel',kwargs={'id': self.hotel.id})
        self.hotel.delete()
        response = self.client.get(url, format='json')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
    

# # suspend the user
def check_booking_mock(customer_id):
    return True

class SuspendHotelTestCase(APITestCase):
    def setUp(self):
        self.client = APIClient()
        self.admin = Login.objects.create(
            email=admin_email,
            password=admin_password,
            status="active",
            userType="admin",
            first_name="admin"
        )

        self.hotel_user = Login.objects.create(
            email='summer@gmail.com',
            password="Summer@12346",
            userType='hotel',
            status='active'
        )
        self.hotel=Hotel.objects.create(
            hotel_name='Summer', address='Homes', email='summer@gmail.com', phone_number='9876656789',
            user_type='hotel', status='active',city='test',district='test',state='test',
            license_number='12-1234-1234',service_charge='1234.34',description='good')

    def test_suspend_hotel_success(self):
        self.client.force_authenticate(user=self.admin)
        url=reverse('suspend-hotel', kwargs={'id': self.hotel.id})
        response = self.client.post(url, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['message'], 'Hotel suspended successfully')

    def test_suspend_hotel_already_suspended(self):
        self.hotel.status = 'suspended'
        self.hotel.save()
        self.client.force_authenticate(user=self.admin)
        url=reverse('suspend-hotel', kwargs={'id': self.hotel.id})
        response = self.client.post(url, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data['message'], 'Hotel is already suspended')

    def test_suspend_hotel_inactive(self):
        self.hotel.status = 'inactive'
        self.hotel.save()
        self.client.force_authenticate(user=self.admin)
        url=reverse('suspend-hotel', kwargs={'id': self.hotel.id})
        response = self.client.post(url, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data['message'], 'Hotel should be active in order to be suspended')

    def test_suspend_hotel_not_found(self):
        self.client.force_authenticate(user=self.admin)
        url=reverse('suspend-hotel', kwargs={'id': 999})
        self.hotel.delete()
        response = self.client.post(url, format='json')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
    
    def test_suspend_hotel_data_not_found(self):
        self.client.force_authenticate(user=self.admin)
        url=reverse('suspend-hotel', kwargs={'id': self.hotel.id})
        self.hotel_user.delete()
        response = self.client.post(url, format='json')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_suspend_hotel_with_active_bookings(self):
        self.client.force_authenticate(user=self.admin)
        url=reverse('suspend-hotel', kwargs={'id': self.hotel.id})
        response = self.client.post(url, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)


class DeleteHotelTestCase(APITestCase):
    def setUp(self):
        self.client = APIClient()
        self.admin = Login.objects.create(
            email=admin_email,
            password=(admin_password),
            status="active",
            userType="admin",
            first_name="admin"
        )

        self.hotel_user = Login.objects.create(
            email=test_email,
            password="Hotel@1234",
            userType='hotel',
            status='active'
        )
        self.hotel=Hotel.objects.create(
            hotel_name='Summer', address='Homes', email=test_email, phone_number='9876656789',
            user_type='hotel', status='active',city='test',district='test',state='test',
            license_number='12-1234-1234',service_charge='1234.34',description='good')

    def test_delete_hotel_not_found(self):
        self.client.force_authenticate(user=self.admin)
        url=reverse('delete-hotel', kwargs={'id': 999})
        self.hotel.delete()
        response = self.client.post(url, format='json')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(response.data['message'], hotel_data_not_available)
    
    def test_delete_hotel_data_not_found(self):
        self.client.force_authenticate(user=self.admin)
        url=reverse('delete-hotel', kwargs={'id': self.hotel.id})
        self.hotel_user.delete()
        response = self.client.post(url, format='json')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(response.data['message'], hotel_data_not_available)

    def test_delete_hotel_with_active_bookings(self):
        self.client.force_authenticate(user=self.admin)
        url=reverse('delete-hotel', kwargs={'id': self.hotel.id})
        response = self.client.post(url, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
    
    def test_delete_hotel_success(self):
        self.client.force_authenticate(user=self.admin)
        url=reverse('delete-hotel', kwargs={'id': self.hotel.id})
        response = self.client.post(url, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['message'], 'Hotel deleted successfully')

# # Test cases for add room type
class AddRoomTypeTestCases(APITestCase):
    def setUp(self):
        self.client = APIClient()
        self.admin_user = Login.objects.create(
            email=admin_email,
            password=admin_password,
            userType="admin"
        )

    def test_valid_add_room_type(self) :
        data = {
                "room_type" : "Single"
        }
        self.client.force_authenticate(user=self.admin_user)
        url = reverse('add-room-type')
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_invalid_add_room_type(self) :
        data = {
           
        }
        self.client.force_authenticate(user=self.admin_user)
        url = reverse('add-room-type')
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_invalid_room_type(self) :
        data = {
                "room_type" : "TestRoomType123",
        }
        self.client.force_authenticate(user=self.admin_user)
        url = reverse('add-room-type')
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_invalid_room_type_len(self) :
        data = {
                "room_type" : "Testttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttt",
        }
        self.client.force_authenticate(user=self.admin_user)
        url = reverse('add-room-type')
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_add_existimg_room_type(self):
        RoomType.objects.create(
            room_type = 'single'
        )

        data = {
            "room_type" : "Single"
        }

        self.client.force_authenticate(user=self.admin_user)
        url = reverse('add-room-type')
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    

# # list room type test cases
class ListRoomTypeTestCases(APITestCase):
    def setUp(self):
        self.client = APIClient()
        self.admin_user = Login.objects.create(
            email=admin_email,
            password=admin_password,
            userType="admin"
        )

        self.roomType = RoomType.objects.create(
            room_type = 'Single'
        )

    def test_valid_room_type_list(self):
        self.client.force_authenticate(user=self.admin_user)
        url = reverse('list-room-types')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_unauthorized_room_type_list(self):
        url = reverse('list-room-types')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_valid_room_type_test_with_search_query(self):
        self.client.force_authenticate(user=self.admin_user)
        url = reverse('list-room-types')
        response = self.client.get(url, {'query' : 'Single'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertContains(response, 'Single')

    def test_list_room_type_with_no_data(self):
        self.client.force_authenticate(user=self.admin_user)
        url = reverse('list-room-types')
        self.roomType.delete()
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

# # test cases for deleteing hotel user account
class DeleteHotelAccountTestCases(APITestCase):
    def setUp(self):
        self.client = APIClient()
        self.hotel_user = Login.objects.create(
            email = 'hotel@test.com',
            password = 'Hotel@12',
            userType = 'hotel',
            status = 'active'
        )

        self.hotel_details = Hotel.objects.create(
            hotel_name = "Mariott",
            email = "hotel@test.com",
            phone_number = "9878865455",
            address = "Mariott tower",
            city = "Vyttila",
            district = "ernakulam",
            state = "kerala",
            pincode = "678988",
            license_number = "12-4353-6785",
            description = "7 star hotel",
            service_charge = "1786.56",
            status='active'
        )
    def test_delete_inactive_hotel_account(self):
        inactive_hotel_user = Login.objects.create(
            email="hotelinactive@gmail.com",
            password="password",
            userType="hotel",
            status="inactive"
        )

        url = reverse('delete-hotel-account', args=[self.hotel_details.id])
        self.client.force_authenticate(user=inactive_hotel_user)
        response = self.client.put(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)



    def test_delete_already_deleted_hotel_account(self):
        deleted_hotel_user = Login.objects.create(
            email="hoteldeleted@gmail.com",
            password="password",
            userType="hotel",
            status="deleted"
        )
        url = reverse('delete-hotel-account', args=[self.hotel_details.id])
        self.client.force_authenticate(user=deleted_hotel_user)
        response = self.client.put(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_delete_hotel_account_success(self):
        url = reverse('delete-hotel-account', args=[self.hotel_details.id])
        self.client.force_authenticate(user=self.hotel_user)
        response = self.client.put(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
    

    def test_delete_hotel_account_not_found(self):
        invalid_hotel_user = Login.objects.create(
            email="hotelnotexist@example.com",
            password="password",
            userType="hotel",
            status="active"
        )

        url = reverse('delete-hotel-account', args=[self.hotel_details.id])
        self.client.force_authenticate(user=invalid_hotel_user)
        response = self.client.put(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

  
#add room details test case
class AddRoomDetailsTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()

        self.login_user = Login.objects.create_user(
            email=test_email,
            password="testpassword",
            userType="hotel",
            status="active",
        )
        self.hotel = Hotel.objects.create(
            hotel_name="Test Hotel",
            email=test_email,
            service_charge=10.00,
            status="active",
           
        )
        self.room_type = RoomType.objects.create(room_type="Standard")
    def test_add_room_details_success(self):
        self.client.force_authenticate(user=self.login_user)
        data = {
            "hotel_id": self.hotel.id,
            "room_type_id": self.room_type.id,
            "number_of_rooms": 10,
            "room_facilities": "AC,TV,WiFi",
            "rate": 1500.00,
        }
        response = self.client.post(reverse('add-room-details'), data, format='json')

        if response.status_code == status.HTTP_400_BAD_REQUEST:
            self.assertEqual(response.status_code, status.HTTP_201_CREATED)
            self.assertEqual(RoomDetails.objects.count(), 1)

    def test_invalid_serializer(self):
        self.client.force_authenticate(user=self.login_user)
        invalid_data = {
            "hotel_id": self.hotel.id,
            "room_type_id": self.room_type.id,
            "number_of_rooms": 10,
        }
        response = self.client.post(reverse('add-room-details'), invalid_data, format='multipart')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    def test_user_not_associated_with_hotel(self):
        self.client.force_authenticate(user=self.login_user)
        data = {
            "room_type_id": self.room_type.id,
            "number_of_rooms": 10,
            "room_facilities": "AC, ",
            "rate": 1500.00,
        }
        self.hotel.delete()
        response = self.client.post(reverse('add-room-details'), data,format='multipart')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data['message'], 'User is not associated with any hotel.')
    

class ViewHotelRoomDetailsTest(APITestCase):
    def setUp(self):
        self.client = APIClient()

        self.login_user = Login.objects.create_user(
            email=test_email,
            password="testroompassword",
            userType="hotel",
            status="active",
        )

        self.hotel = Hotel.objects.create(email=test_email, service_charge=16.00)
        self.room_type = RoomType.objects.create(room_type="Single Room")
        self.room_details = RoomDetails.objects.create(
            hotel_id=self.hotel,
            room_type_id=self.room_type,
            number_of_rooms=10,
            room_facilities="test",
            rate=1500.00,
        )

        self.room_image1 = RoomImages.objects.create(
            room_details_id=self.room_details,
            image1='path/to/image1.jpg',
        )

        self.room_image2 = RoomImages.objects.create(
            room_details_id=self.room_details,
            image2='path/to/image2.jpg',
        )

        self.room_image3 = RoomImages.objects.create(
            room_details_id=self.room_details,
            image3='path/to/image3.jpg',
        )

    def test_view_hotel_room_details(self):
        self.client.force_authenticate(user=self.login_user)
        url = reverse('list-hotel-room-details')  
        response = self.client.get(url, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('results', response.data)
        
    
    def test_no_hotel_room_details(self):
        self.client.force_authenticate(user=self.login_user)
        self.hotel.delete()
        url = reverse('list-hotel-room-details')  
        response = self.client.get(url, format='json')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

class ViewRoomDetailsTestCases(APITestCase):
    def setUp(self):
        self.client = APIClient()
        self.admin_user = Login.objects.create(
            email=admin_email,
            password=admin_password,
            userType="admin"
        )

        self.hotel = Hotel.objects.create(
            hotel_name="ABC Hotel",
            email=test_email,
            service_charge=10.00,
            status="active",
        )
        self.room_type = RoomType.objects.create(room_type="Single")  
        self.room_details = RoomDetails.objects.create(
            hotel_id=self.hotel,
            room_type_id=self.room_type,  
            number_of_rooms=5,
            room_facilities='Some test facilities',
            rate=100.00
        )

    def test_valid_room_details_view(self):
        self.client.force_authenticate(user=self.admin_user)
        url = reverse('admin-view-room-details')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_no_room_details_found(self):
        self.client.force_authenticate(user=self.admin_user)
        RoomDetails.objects.all().delete()  
        url = reverse('admin-view-room-details')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_error_fetching_room_details_attribute_error(self):
        self.client.force_authenticate(user=self.admin_user)
        with patch.object(RoomDetails, 'objects', None):
            url = reverse('admin-view-room-details')
            response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)


# View rooms details by id - admin
class ViewRoomDetailsByIdTestCases(APITestCase):
    def setUp(self):
        self.client = APIClient()
        self.admin_user = Login.objects.create(
            email=admin_email,
            password=admin_password,
            userType="admin"
        )

        self.hotel = Hotel.objects.create(
            hotel_name="Te Hotel",
            email=test_email,
            service_charge=10.00,
            status="active",
        )

        self.room_type = RoomType.objects.create(room_type="Standard")
        self.room_details = RoomDetails.objects.create(
            hotel_id=self.hotel,
            room_type_id=self.room_type,
            number_of_rooms=10,
            room_facilities="rooms",
            rate=1500.00,
        )

    def test_valid_room_details_by_id(self):
        self.client.force_authenticate(user=self.admin_user)
        url = reverse('list-room-details-by-id', args=[self.room_details.id])
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_room_details_not_found(self):
        self.client.force_authenticate(user=self.admin_user)
        url = reverse('list-room-details-by-id', args=[999])
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_exception_occurs(self):
        self.client.force_authenticate(user=self.admin_user)
        with patch.object(RoomDetails.objects, 'filter', side_effect=Exception('Error')):
            url = reverse('list-room-details-by-id', args=[self.room_details.id])
            response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_417_EXPECTATION_FAILED)

# test cases for review 
class ReviewViewTestCases(APITestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = Login.objects.create(
            email=admin_email,
            password="adminReviewPassword",
            userType="customer"
        )

        self.user_table = Customer.objects.create(
            id=1,
            first_name = 'review',
            last_name = 'test',
            email = admin_email,
            status = 'active',
            user_type = 'customer'
        )

        self.user_inactive = Customer.objects.create(
            id=2,
            first_name = 'review',
            last_name = 'inactive',
            email = 'customerreview_inactive@test.com',
            status = 'inactive',
            user_type = 'customer'
        )

        self.hotel = Hotel.objects.create(
            id=1,
            hotel_name="MariottTest",
            email="mariottest@test.com",
            phone_number="9878865455",
            address="Mariottexample towers",
            city="Vyttila",
            district="ernakulam",
            state="kerala",
            pincode="678988",
            license_number="12-4353-6785",
            description="7 star hotel sample and residency",
            service_charge="1786.56",
            status='active'
        )

        self.hotel_inactive = Hotel.objects.create(
            id=2,
            hotel_name="Mariott Inactive",
            email="mariot_inactive@gmail.com",
            phone_number="9878865455",
            address="Mariott sample test towers",
            city="Vyttila",
            district="ernakulam",
            state="kerala",
            pincode="678988",
            license_number="12-4353-6665",
            description="7 star hotel example and residency",
            service_charge="1786.56",
        )

    def generate_image_file(self, width=100, height=100):
        image = Image.new('RGB', (width, height))
        buffer_image = BytesIO()
        image.save(buffer_image, format='JPEG')
        return SimpleUploadedFile("image.jpg", buffer_image.getvalue(), content_type=content_type)


    def test_add_review_successful(self):
        image_file_1 = self.generate_image_file()
        image_file_2 = self.generate_image_file()

        data = {
            'customer_name' : self.user.first_name,
            'hotel_email' : self.hotel.email,
            'rating': 5,
            'title': 'Great test Experience',
            'comment': 'Enjoyed my test stay!',
            'image1': image_file_1,
            'image2': image_file_2,
        }

        self.client.force_authenticate(user=self.user)
        url = reverse('review', args=[self.hotel.id])
        response = self.client.post(url, data, format='multipart')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_add_review_unsuccessful(self):
    
        data = {
            'customer_name' : self.user.first_name,
            'hotel_email' : self.hotel.email,
            'rating': 5
        }

        self.client.force_authenticate(user=self.user)
        url = reverse('review', args=[self.hotel.id])
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_add_review_user_not_found(self):
        data = {
            'customer_name' : self.user.first_name,
            'hotel_email' : self.hotel.email,
            'rating': 5,
            'title': 'Great demo Experience',
            'comment': 'Enjoyed my demo stay!',
        }

        self.client.force_authenticate(user=self.user)
        self.user_table.delete()
        url = reverse('review', args=[self.hotel.id])
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_add_review_hotel_inactive(self):
        data = {
            'customer_name' : self.user.first_name,
            'hotel_email' : self.hotel_inactive.email,
            'rating': 5,
            'title': 'Great mini Experience',
            'comment': 'Enjoyed my mini stay!',
        }

        self.client.force_authenticate(user=self.user)
        url = reverse('review', args=[self.hotel_inactive.id])
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

#testcase for active hotel details
class ActiveHotelDetailsTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.customer = Login.objects.create(
            email="test1@gmail.com",
            password=(test_password),
            status="active",
            userType="customer",
            first_name="customer"
        )
        self.hotel=Hotel.objects.create(
            hotel_name='Summer', address='Homes', email='summer@example.com', phone_number='9876656789',
            user_type='hotel', status='active',city='test',district='test',state='test',
            license_number='12-1234-1234',service_charge='1234.34',description='good')
        
        self.roomType = RoomType.objects.create(
            room_type = 'Single'
        )

        self.room1 = RoomDetails.objects.create(
            hotel_id=self.hotel,
            room_type_id=self.roomType,
            number_of_rooms=5,
            room_facilities="Wi-Fi",
            rate=100.00,
        )

    def test_get_active_hotels_details(self):
        url = reverse('list-active-hotels')
        self.client.force_authenticate(user=self.customer)
        response = self.client.get(url, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertContains(response, 'Summer')

    def test_get_active_hotels_details_not_found(self):
        url = reverse('list-active-hotels')
        self.client.force_authenticate(user=self.customer)
        self.hotel.delete()
        response = self.client.get(url, format='json')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

# list room type test cases
class GetRoomTypeTestCases(APITestCase):
    def setUp(self):
        self.client = APIClient()
        self.admin_user = Login.objects.create(
            email=admin_email,
            password=admin_password,
            userType="admin"
        )

        self.roomType = RoomType.objects.create(
            room_type = 'Single'
        )

    def test_valid_room_type_list(self):
        self.client.force_authenticate(user=self.admin_user)
        url = reverse('get-room-types')
        response = self.client.get(url,format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_list_room_type_with_no_data(self):
        self.client.force_authenticate(user=self.admin_user)
        url = reverse('get-room-types')
        self.roomType.delete()
        response = self.client.get(url,format='json')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)



class HotelSearchViewTestCase(APITestCase):
    def setUp(self):
        self.hotel=Hotel.objects.create(
            hotel_name='Test', address='Homes', email='test@test.com', phone_number='9876656789',
            user_type='hotel', status='active',city='test',district='test',state='test',
            license_number='12-1234-1234',service_charge='1234.34',description='good',
            image=SimpleUploadedFile("hotel_image.jpg", b"file_content", content_type=content_type),)
        
        self.room_type = RoomType.objects.create(room_type='Standard')
        
        self.room1 = RoomDetails.objects.create(
            hotel_id=self.hotel,
            room_type_id=self.room_type,
            number_of_rooms=5,
            room_facilities="Wi-Fi, TV",
            rate=100.00,
        )
        self.room2 = RoomDetails.objects.create(
            hotel_id=self.hotel,
            room_type_id=self.room_type,
            number_of_rooms=3,
            room_facilities="AC, Mini Bar",
            rate=150.00,
        )


    def test_search_hotels_success(self):
        data = {
            'location': 'test',
            'check_in_date': str(date.today()),
            'check_out_date': str(date.today())
        }
        url = reverse('select-hotels')
        response = self.client.post(url, data,format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_search_hotels_no_results(self):

        data = {
            'city': 'Nonexistent City',
            'check_in_date': str(date.today()),
            'check_out_date': str(date.today())
        }
        url = reverse('select-hotels')
        response = self.client.post(url, data,format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)


# update hotel details test cases
class EditHotelDetailsTestCases(APITestCase):   
    def setUp(self):
        self.client = APIClient()
        self.user = Login.objects.create(
            email=test_email,
            userType='hotel',
            status='active',
            first_name='hotel_name',
            password='Hotel@100'
        )

        self.user_none = Login.objects.create(
            email='hotel123@gmail.com',
            userType='hotel',
            status='active',
            first_name='hotel_name',
            password='Hotel@122'
        )

        self.inactive_user = Login.objects.create(
            email='hotelinactive@gmail.com',
            userType='hotel',
            status='inactive',
            first_name='hotel_name',
            password='Hotel@12'
        )
        
        self.hotel = Hotel.objects.create(
            hotel_name='hotel_name',
            email=test_email,
            phone_number='9867654221',
            address='TestAddress',
            city='TestCity',
            district='TestDistrict',
            state='TestState',
            pincode='686508',
            license_number='12-2222-2222',
            description='Food,pool,wifi',
            service_charge='1200',
            user_type='hotel',
            status='active',
            location_link='https://testhotellocation.com/'
        )

        self.hotel_inactive = Hotel.objects.create(
            hotel_name='hotel_inactive_name',
            email='hotelinactive@gmail.com',
            phone_number='9867654221',
            address='TestAddress',
            city='TestCity',
            district='TestDistrict',
            state='TestState',
            pincode='686508',
            license_number='12-2222-2221',
            description='Food,wine,wifi',
            service_charge='1200',
            user_type='hotel',
            status='inactive',
            location_link='https://testrestlocation.com/'
        )

        self.data = {
            'hotel_name' : 'UpdatedName',
            "phone_number": "9867654112",
            "address": "Palarivattom",
            "city": "Ernakulam",
            "district": "Ernakulam",
            "state": "Kerala",
            "pincode": "686501",
            "description": "hkj",
            "location_link" : "https://location.com/",
            "service_charge": 120.0,
        }

    def test_get_hotel_details(self):
        url=reverse('edit-hotel-details')
        self.client.force_authenticate(user=self.user)
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
    
    def test_get_inactive_hotel_details(self):
        url=reverse('edit-hotel-details')
        self.client.force_authenticate(user=self.user)
        self.hotel.status = 'inactive'
        self.hotel.save()
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
    
    def test_put_inactive_hotel_details(self):
        url=reverse('edit-hotel-details')
        self.client.force_authenticate(user=self.user)
        self.hotel.status = 'inactive'
        self.hotel.save()
        response = self.client.put(url,self.data,format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_get_hotel_details_not_found(self):
        self.client.force_authenticate(user=self.user)
        url=reverse('edit-hotel-details')
        self.user.delete()
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
    
    def test_get_hotel_data_not_found(self):
        self.client.force_authenticate(user=self.user)
        url=reverse('edit-hotel-details')
        self.hotel.delete()
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
    
    def test_put_hotel_data_not_found(self):
        self.client.force_authenticate(user=self.user)
        url=reverse('edit-hotel-details')
        self.hotel.delete()
        response = self.client.put(url,self.data,format='json')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_get_hotel_inactive(self):
        self.client.force_authenticate(user=self.inactive_user)
        url=reverse('edit-hotel-details')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
    
    def test_update_hotel_details(self):
        self.client.force_authenticate(user=self.user)
        url=reverse('edit-hotel-details')
        response = self.client.put(url,self.data,format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_update_hotel_not_found(self):
        self.client.force_authenticate(user=self.user)
        url=reverse('edit-hotel-details')
        self.user.delete()
        response = self.client.put(url,self.data,format='json')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_updated_hotel_not_valid(self):
        data = {
            'hotel_name' : 'UpdatedName',
        }

        self.client.force_authenticate(user=self.user)
        url=reverse('edit-hotel-details')
        response = self.client.put(url, data, fromat='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_update_hotel_inactive(self):
        self.client.force_authenticate(user=self.inactive_user)
        url=reverse('edit-hotel-details')
        response = self.client.put(url, self.data, fromat='json')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

class EditRoomDetailsTestCase(APITestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = Login.objects.create_user(
            email="hoteltest@gmail.com",
            password="testpassword",
            userType="hotel",
            status="active",
        )
        self.hotel = Hotel.objects.create(email=test_email, service_charge=10.00)
        self.room_type = RoomType.objects.create(room_type="Single")
        self.room_details = RoomDetails.objects.create(
            hotel_id=self.hotel,
            room_type_id=self.room_type,
            number_of_rooms=10,
            room_facilities="AC, TV, Gym WiFi",
            rate=1500.00,
        )

        self.room_image1 = RoomImages.objects.create(
            room_details_id=self.room_details,
            image1=SimpleUploadedFile("test_edit_image1.jpg", b"file_content", content_type=content_type),
        )

        self.room_image2 = RoomImages.objects.create(
            room_details_id=self.room_details,
            image2=SimpleUploadedFile("test_edit_image2.jpg", b"file_content", content_type=content_type),
        )

        self.room_image3 = RoomImages.objects.create(
            room_details_id=self.room_details,
            image3=SimpleUploadedFile("test_edit_image3.jpg", b"file_content", content_type=content_type),
        )

    def generate_file(self, name, content_type):
        image = Image.new('RGB', (100, 100))
        file_content = BytesIO()
        image.save(file_content, format='JPEG')
        file_content.seek(0)
        return SimpleUploadedFile(name, file_content.read(), content_type=content_type)


    def test_unauthorized_access_get(self):
        url = reverse('edit-room-details', kwargs={'room_details_id': self.room_details.id})
        unauthorized_user = Login.objects.create_user(
            email="unauthorized@gmail.com",
            password="testpassword",
            userType="customer",
            status="active",
        )
        self.client.force_authenticate(user=unauthorized_user)
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
    
    def test_update_room_details_general_error(self):
        self.client.force_authenticate(user=self.user)

        invalid_room_details_id = 9999

        invalid_data = {
            'number_of_rooms': 15,
            'room_facilities': 'New facilities',
            'rate': 2000.00,
            'image1': self.generate_file("updated_image1.jpg", content_type),
            'image2': self.generate_file("updated_image2.jpg", content_type),
            'image3': self.generate_file("updated_image3.jpg", content_type),
        }

        response = self.client.put(reverse('edit-room-details', kwargs={'room_details_id': invalid_room_details_id}),
                                data=invalid_data, format='multipart')
        self.assertEqual(response.status_code, status.HTTP_500_INTERNAL_SERVER_ERROR)
        self.assertIn('message', response.data)
        
    def test_update_room_details_success(self):
        url = reverse('edit-room-details', kwargs={'room_details_id': self.room_details.id})
        self.client.force_authenticate(user=self.user)

        valid_data = {
            'number_of_rooms': '400',  
            'room_facilities': 'New facilities',
            'rate': 2000.00,
            'image1': self.generate_file("updated_image1.jpg", content_type),
            'image2': self.generate_file("updated_image2.jpg", content_type),
            'image3': self.generate_file("updated_image3.jpg", content_type),
        }

        response = self.client.put(url, data=valid_data, format='multipart')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('message', response.data)
     
    def test_get_room_details_success(self):
        url = reverse('edit-room-details', kwargs={'room_details_id': self.room_details.id})
        self.client.force_authenticate(user=self.user)

        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('room_details', response.data)
        self.assertIn('room_images', response.data)

        expected_room_details_data = RoomDetailsSerializer(self.room_details).data
        self.assertEqual(response.data['room_details'], expected_room_details_data)


    def test_get_room_details_not_found(self):
        invalid_room_details_id = 9999
        url = reverse('edit-room-details', kwargs={'room_details_id': invalid_room_details_id})
        self.client.force_authenticate(user=self.user)

        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_500_INTERNAL_SERVER_ERROR)
        self.assertIn('message', response.data)

class ListHotelRoomDetailsTest(TestCase):
    def setUp(self):
        self.hotel=Hotel.objects.create(
            hotel_name='Summer', address='Homes', email='summer@test.com', phone_number='9876656789',
            user_type='hotel', status='active',city='test',district='test',state='test',
            license_number='12-1234-1234',service_charge='1234.34',description='good')

        self.room_type = RoomType.objects.create(room_type="Standard")

        self.room1 = RoomDetails.objects.create(
            hotel_id=self.hotel,
            room_type_id=self.room_type,
            number_of_rooms=5,
            room_facilities="Wi-Fi, TV",
            rate=100.00,
        )
        self.room2 = RoomDetails.objects.create(
            hotel_id=self.hotel,
            room_type_id=self.room_type,
            number_of_rooms=3,
            room_facilities="AC, Mini Bar",
            rate=150.00,
        )

        RoomImages.objects.create(room_details_id=self.room1, image1="room1_image1.jpg")
        RoomImages.objects.create(room_details_id=self.room2, image1="room2_image1.jpg")
        self.data ={
            'check_in' : '2024-03-03',
            'check_out':'2024-04-03'
        }

        self.client = APIClient()

    def test_list_hotel_room_details(self):
        url = reverse('hotel-room-details', args=[self.hotel.id])
        response = self.client.post(url,self.data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_no_hotel_details(self):
        url = reverse('hotel-room-details', args=[self.hotel.id])
        self.hotel.delete()
        response = self.client.post(url,self.data, format='json')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
    
    def test__no_room_details(self):
        url = reverse('hotel-room-details', args=[self.hotel.id])
        self.room1.delete()
        self.room2.delete()
        response = self.client.post(url,self.data, format='json')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
  

# get all review for user test cases 
class GetReviewViewTestCases(APITestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = Login.objects.create(
            email=admin_email,
            password=admin_password,
            userType="customer"
        )

        self.user_table = Customer.objects.create(
            id=1,
            first_name = 'customer',
            last_name = 'lastname',
            email = admin_email,
            status = 'active',
            user_type = 'customer'
        )

        self.user_no_review = Customer.objects.create(
            id=2,
            first_name = 'cus',
            last_name = 'lastname',
            email = 'cus@gmail.com',
            status = 'active',
            user_type = 'customer'
        )

        self.hotel = Hotel.objects.create(
            id=1,
            hotel_name="Mariott",
            email="mariottest@gmail.com",
            phone_number="9878865455",
            address="Mariott sample towers",
            city="Vyttila",
            district="ernakulam",
            state="kerala",
            pincode="678988",
            license_number="12-4353-6785",
            description="7 star hotel test and residency",
            service_charge="1786.56",
            status='active'
        )

        self.review = Review.objects.create(
            customer_name=self.user.email,
            hotel_email=self.hotel.email,
            rating=5,
            title='Great sample Hotel',
            comment='I enjoyed my short stay.',
            status='active'
        )
        
    def test_get_review_details(self):
        url=reverse('get-review')
        self.client.force_authenticate(user=self.user)
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_get_review_details_user_not_found(self):
        url=reverse('get-review')
        self.client.force_authenticate(user=self.user)
        self.user_table.delete()
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_get_user_no_review(self):
        url=reverse('get-review')
        self.client.force_authenticate(user=self.user_no_review)
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)


class DeleteRoomDetailsTestCases(APITestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = Login.objects.create_user(
            email=test_email,
            password="testpassword",
            userType="hotel",
            status="active",
        )
        self.hotel = Hotel.objects.create(email=test_email, service_charge=10.00)
        self.room_type = RoomType.objects.create(room_type="Single")
        self.room_details = RoomDetails.objects.create(
            hotel_id=self.hotel,
            room_type_id=self.room_type,
            number_of_rooms=10,
            room_facilities="AC, TV, pool WiFi",
            rate=1500.00,
            status= "active"
        )

        self.room_image1 = RoomImages.objects.create(
            room_details_id=self.room_details,
            image1=SimpleUploadedFile("test_delete_image1.jpg", b"file_content", content_type=content_type),
        )

        self.room_image2 = RoomImages.objects.create(
            room_details_id=self.room_details,
            image2=SimpleUploadedFile("test_delete_image2.jpg", b"file_content", content_type=content_type),
        )

        self.room_image3 = RoomImages.objects.create(
            room_details_id=self.room_details,
            image3=SimpleUploadedFile("test_delete_image3.jpg", b"file_content", content_type=content_type),
        )

    def generate_file(self, name, content_type):
        image = Image.new('RGB', (100, 100))
        file_content = BytesIO()
        image.save(file_content, format='JPEG')
        file_content.seek(0)
        return SimpleUploadedFile(name, file_content.read(), content_type=content_type)


    def test_delete_room_details_without_associated_hotel(self):
        self.client.force_authenticate(user=self.user)
        self.hotel.delete()
        url = reverse('delete-room-details', args=[self.room_details.id])
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("User is not associated with any hotel", response.data['message'])


    def test_delete_room_details_success_with_associated_hotel(self):
        self.user.hotel = self.hotel
        self.user.save()
        url = reverse('delete-room-details', kwargs={'room_details_id': self.room_details.id})
        self.client.force_authenticate(user=self.user)
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("Room details deleted successfully", response.data['detail'])

    def test_get_room_details_not_found(self):
        invalid_room_details_id = 9999
        url = reverse('delete-room-details', kwargs={'room_details_id': invalid_room_details_id})
        self.client.force_authenticate(user=self.user)
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertIn('detail', response.data)

# update reviews by user test cases
class UpdateReviewTestCases(APITestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = Login.objects.create(
            email=admin_email,
            password=admin_password,
            userType="customer"
        )

        self.user_table = Customer.objects.create(
            id=1,
            first_name='customer',
            last_name='lastname',
            email=admin_email,
            status='active',
            user_type='customer'
        )

        self.hotel = Hotel.objects.create(
            id=1,
            hotel_name="Mariott",
            email=test_email,
            phone_number="9878865455",
            address="Sample towers",
            city="Vyttila",
            district="ernakulam",
            state="kerala",
            pincode="678988",
            license_number="12-4353-6785",
            description="7 star sample hotel and residency",
            service_charge="1786.56",
            status='active'
        )

        self.review = Review.objects.create(
            customer_name=self.user.email,
            hotel_email=self.hotel.email,
            rating=5,
            title='Great stay for Hotel',
            comment='I enjoyed my hotel stay.'
        )

    def test_get_review(self):
        url = reverse('review-update', args=[self.review.id])
        self.client.force_authenticate(user=self.user)
        self.review.delete()
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_update_review_success(self):
        data = {
            'rating': 4,  
            'title': 'Updated title',  
            'comment': 'Updated comment',  
        }
        
        self.client.force_authenticate(user=self.user)
        
        url = reverse('review-update', args=[self.review.id])
        response = self.client.put(url, data, format='multipart')

        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_update_review_invalid_data(self):
        data = {}
         
        url = reverse('review-update', args=[self.review.id])
        self.client.force_authenticate(user=self.user)
        response = self.client.put(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_500_INTERNAL_SERVER_ERROR)

    def test_update_review_expect(self):
        url = reverse('review-update', args=[self.review.id])
        self.review.delete()
        self.client.force_authenticate(user=self.user)
        response = self.client.put(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

# # delete review test cases
class DeleteReviewTestCases(APITestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = Login.objects.create(
            email=admin_email,
            password=admin_password,
            userType="customer"
        )

        self.review = Review.objects.create(
            customer_name="customer@gmail.com",
            hotel_email="hotel@gmail.com",
            rating=5,
            title='Great Hotel',
            comment='I enjoyed my stay.',
            status='active'
        )

        self.inactive_review = Review.objects.create(
            customer_name="customer@gmail.com",
            hotel_email="hotel@gmail.com",
            rating=5,
            title='Great Hotel',
            comment='I enjoyed my stay.',
            status='inactive'
        )

    def test_delete_active_review(self):
        url = reverse('review-delete', args=[self.review.id])
        self.client.force_authenticate(user=self.user)
        response = self.client.put(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_delete_inactive_review(self):
        url = reverse('review-delete', args=[self.inactive_review.id])
        self.client.force_authenticate(user=self.user)
        response = self.client.put(url)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_delete_review_not_found(self):
        url = reverse('review-delete', args=[self.review.id])
        self.review.delete()
        self.client.force_authenticate(user=self.user)
        response = self.client.put(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

class AddRoomServicesTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user_email = "test@example.com" 
        self.login_user = Login.objects.create_user(
            email=self.user_email,
            password="testpassword",
            userType="hotel",
            status="active",
        )
        self.hotel = Hotel.objects.create(
            hotel_name="Test Hotel",
            email=self.user_email,
            service_charge=10.00,
            status="active",
        )

   
    def test_add_room_services_unknown_hotel_user(self):
        self.client.force_authenticate(user=self.login_user)
        self.hotel.delete()
        url = reverse('add-room-services')
        data = {
            "title": "Spa",
            "description": "sdsdsdddddddddddddddddddddddddddddd",
            "price": 2000.0,
        }

        response = self.client.post(url, data, format='multipart')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("User is not associated with any hotel.", response.data.get("message", ""))
    @patch('hotel_app.views.RoomServicesSerializer.save')
    def test_successful_add_room_services(self, mock_save):
        self.client.force_authenticate(user=self.login_user)
        
        url = reverse('add-room-services')
        data = {
            "hotel_id":self.hotel.id,
            "title": "Spa",
            "description": "sdsdsdddddddddddddddddddddddddddddd",
            "price": 2000.0,
        }

        response = self.client.post(url, data, format='multipart')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn("Room services added successfully.", response.data.get("message", ""))
        mock_save.assert_called_once()
    
    @patch('hotel_app.views.RoomServicesSerializer.save')
    def test_validation_error_add_room_services(self, mock_save):
        self.client.force_authenticate(user=self.login_user)
        
        url = reverse('add-room-services')
        data = {
            "title": "123",
            "description": "sdsdsdddddddddddddddddddddddddddddd",
            "price": 2000.0,
        }

        response = self.client.post(url, data, format='multipart')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        mock_save.assert_not_called()
        
class RoomDetailsByStatusTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()

        self.login_user = Login.objects.create_user(
            email=test_email,
            password="testroomstatuspassword",
            userType="hotel",
            status="active",
        )

        self.hotel = Hotel.objects.create(email=test_email, service_charge=20.00)
        self.room_type = RoomType.objects.create(room_type="Single")
        self.room_details = RoomDetails.objects.create(
            hotel_id=self.hotel,
            room_type_id=self.room_type,
            number_of_rooms=10,
            room_facilities="test",
            rate=1500.00,
            status="active"
        )

    def test_get_room_details_by_status(self):
        url = reverse('list-hotel-room-details-by-status', args=['active'])
        self.client.force_authenticate(user=self.login_user)
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('results', response.data)
    
    def test_get_room_details_by_status_not_found(self):
        url = reverse('list-hotel-room-details-by-status', args=['inactive'])
        self.client.force_authenticate(user=self.login_user)
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

class BookingPaymentDetailsTestCase(APITestCase):
    def setUp(self):
        self.user = Login.objects.create_user(
            email=test_email,password=test_password,userType="customer",status="active",
        )
        self.customer = Customer.objects.create(
            first_name="Guest",email=test_email,status="active",
        )
        self.hotel = Hotel.objects.create(
            hotel_name="Book Hotels",email=test_email,service_charge=10.00,status="active",
        )
        self.room_type = RoomType.objects.create(room_type="Double")
        self.room_details = RoomDetails.objects.create(
            hotel_id=self.hotel,room_type_id=self.room_type,number_of_rooms=10,room_facilities="AC",rate=1500.00,
        )
        self.booking = Booking.objects.create(
            room =self.room_details,check_in_date="2024-10-24",check_out_date="2024-10-25",guest_name="Binimol",email="binimoltest@gmail.com",phone_number="9876543212",address="ABC",
            number_of_rooms="11",number_of_adults="2",number_of_children="0",aadhar_number="123412341234",customer=self.customer,hotel=self.hotel
        )
        self.payment = Payment.objects.create(
            booking =self.booking,amount=12900.56,payment_method="cash",status="confirmed",paid_at="2024-02-08 08:48:53.593713",
            customer=self.customer
        )

    def test_valid_payment_details(self):
        self.client.force_authenticate(user=self.user)
        url = reverse('payment_details',kwargs={'booking_id': self.booking.id})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
    
    def test_payment_details_not_fount(self):
        self.client.force_authenticate(user=self.user)
        url = reverse('payment_details',kwargs={'booking_id': 999})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_417_EXPECTATION_FAILED)

    def test_customer_not_fount(self):
        self.client.force_authenticate(user=self.user)
        self.customer.delete()
        url = reverse('payment_details',kwargs={'booking_id': 999})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)


class DownloadPaymentInvoiceTestCase(APITestCase):
    def setUp(self):
        self.user = Login.objects.create_user(
            email=test_email,password=test_password,userType="customer",status="active",
        )
        self.customer = Customer.objects.create(
            first_name="Guest",email=test_email,status="active",
        )
        self.hotel = Hotel.objects.create(
            hotel_name="Book Test Hotels",email=test_email,service_charge=10.00,status="active",
        )
        self.room_type = RoomType.objects.create(room_type="King")
        self.room_details = RoomDetails.objects.create(
            hotel_id=self.hotel,room_type_id=self.room_type,number_of_rooms=10,room_facilities="AC",rate=1500.00,
        )
        self.booking = Booking.objects.create(
            room =self.room_details,check_in_date="2024-10-24",check_out_date="2024-10-25",guest_name="Binimol",email="binimo@gmail.com",phone_number="9876543212",address="ABC",
            number_of_rooms="11",number_of_adults="2",number_of_children="0",aadhar_number="123412341234",customer=self.customer,status='confirmed',hotel=self.hotel
        )
        self.payment = Payment.objects.create(
            booking =self.booking,amount=12900.56,payment_method="cash",status="confirmed",paid_at="2024-02-08 08:48:53.593713",
            customer=self.customer
        )

    def test_valid_payment_invoice_download(self):
        self.client.force_authenticate(user=self.user)
        url = reverse('download_payment_invoice',kwargs={'booking_id': self.booking.id})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
    
    def test_customer_not_found(self):
        self.client.force_authenticate(user=self.user)
        url = reverse('download_payment_invoice',kwargs={'booking_id': self.booking.id})
        self.customer.delete()
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
    
    @patch('hotel_app.views.pisa.CreatePDF')
    def test_pdf_generation_failure(self, mock_create_pdf):
        mock_create_pdf.return_value = {'err': True}

        self.client.force_authenticate(user=self.user)
        url = reverse('download_payment_invoice',kwargs={'booking_id': self.booking.id})
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_417_EXPECTATION_FAILED)
    
# add feedbacks to reviews test cases
class AddFeedbacksByHotelsTestCases(APITestCase):
    def setUp(self):
        self.client = APIClient()

        self.login_user = Login.objects.create_user(
            email=test_email,
            password=test_password,
            userType="hotel",
            status="active",
        )

        self.customer = Customer.objects.create(
            id=1,
            first_name = 'customer',
            last_name = 'lastname',
            email = admin_email,
            status = 'active',
            user_type = 'customer'
        )

        self.hotel = Hotel.objects.create(
            id=1,
            hotel_name="Mariott",
            email=test_email,
            phone_number="9878865455",
            address="Mariott new towers",
            city="Vyttila",
            district="ernakulam",
            state="kerala",
            pincode="678988",
            license_number="12-4353-6785",
            description="7 star hotel testing",
            service_charge="1786.56",
            status='active'
        )

        self.review1 = Review.objects.create(
            hotel_email=test_email,
            customer_name='testcustomer@gmail.com',
            rating=5,
            title='Great test experience',
            comment='Enjoyed my long stay',
        )

    def test_add_feedback_by_hotel_success(self):
        data = {
            'feedbacks': 'Thank you for the support'
        }

        self.client.force_authenticate(user=self.login_user)
        url = reverse('add-feedbacks', args=[self.review1.id])
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['message'], 'Feedback added successfully')

    def test_add_feedback_by_hotel_unauthorized(self):

        review2 = Review.objects.create(
            hotel_email='hotel@gmail.com',
            customer_name='customerdemo@gmail.com',
            rating=5,
            title='Great stay',
            comment='Enjoyed my time',
        )

        data = {
            'feedbacks': 'Thank you for the feedback. Visit again!'
        }

        self.client.force_authenticate(user=self.login_user)
        url = reverse('add-feedbacks', args=[review2.id])
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertEqual(response.data['message'], 'Unauthorized to provide feedback for this review')

    def test_add_feedback_by_hotel_review_not_found(self):
        data = {
            'feedbacks': 'Thank you for the support. Visit again!'
        }

        self.client.force_authenticate(user=self.login_user)
        url = reverse('add-feedbacks', args=[999])
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(response.data['message'], 'Review not found')

    def test_add_feedback_by_hotel_not_found(self):
        data = {
            'feedbacks': 'Thank you for the support. Visit again!'
        }

        self.hotel.delete()
        self.client.force_authenticate(user=self.login_user)
        url = reverse('add-feedbacks', args=[self.review1.id])
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(response.data['message'], hotel_user_not_found)

# list reviews by hotels
class ListFeedbacksByHotelsTestCases(APITestCase):
    def setUp(self):
        self.client = APIClient()

        self.login_user = Login.objects.create_user(
            email='mariot@gmail.com',
            password=test_password,
            userType="hotel",
            status="active",
        )

        self.hotel = Hotel.objects.create(
            id=1,
            hotel_name="Mariott",
            email="mariot@gmail.com",
            phone_number="9878865455",
            address="Mariott old towers",
            city="Vyttila",
            district="ernakulam",
            state="kerala",
            pincode="678988",
            license_number="12-4353-6785",
            description="7 star hotel and testing",
            service_charge="1786.56",
            status='active'
        )

        self.review1 = Review.objects.create(
            hotel_email='mariot@gmail.com',
            customer_name='customertest@gmail.com',
            rating=5,
            title='Great experience',
            comment='Enjoyed my stay',
        )

    def test_get_reviews_by_hotels(self):
        self.client.force_authenticate(user=self.login_user)
        url = reverse('list-reviews-by-hotels')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_get_reviews_by_hotels_not_found(self):
        self.hotel.delete()
        self.client.force_authenticate(user=self.login_user)
        url = reverse('list-reviews-by-hotels')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(response.data['message'], hotel_user_not_found)

        
class EditRoomServicesTestCases(APITestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = Login.objects.create_user(
            email=test_email,
            password="testpassword",
            userType="hotel",
            status="active",
        )
        self.hotel = Hotel.objects.create(email=test_email, service_charge=10.00)
        self.room_services = RoomServices.objects.create(
            hotel_id = self.hotel,
            title="Spa",
            description="sdsdsdddddddddddddddddddddddddddddd",
            price=2000.0,
            image=None,
        )
    def test_get_room_services_success(self):
        url = reverse('edit-room-services', kwargs={'room_services_id': self.room_services.id})  
        self.client.force_authenticate(user=self.user)
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('room_services', response.data) 
        expected_room_services_data = RoomServicesSerializer(self.room_services).data
        self.assertEqual(response.data['room_services'], expected_room_services_data)

    def test_get_room_details_error(self):
        invalid_room_services_id = 9999
        url = reverse('edit-room-services', kwargs={'room_services_id': invalid_room_services_id})
        self.client.force_authenticate(user=self.user)
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def test_update_room_services_success(self):
        url = reverse('edit-room-services', kwargs={'room_services_id': self.room_services.id})
        self.client.force_authenticate(user=self.user)

        valid_data = {
            "hotel_id": self.hotel.id,
            'price': '400',  
            'title': 'spa',
            'description' : 'dffrfrefewfrefrefrefrerfrefrefrefreffrfref'
        }

        response = self.client.put(url, data=valid_data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
    
    def test_update_room_details_general_error(self):
        self.client.force_authenticate(user=self.user)
        invalid_room_services_id = 9999
        invalid_data = {
            "hotel_id": self.hotel.id,
            'price': '400',  
            'title': 'spa',
            'description' : 'dffrfrefewfrefrefrefrerfrefrefrefreffrfref'
        }

        response = self.client.put(reverse('edit-room-services', kwargs={'room_services_id': invalid_room_services_id}),
                                data=invalid_data)
        self.assertEqual(response.status_code, status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def test_update_room_services_validation_error(self):
        url = reverse('edit-room-services', kwargs={'room_services_id': self.room_services.id})
        self.client.force_authenticate(user=self.user)

        invalid_data = {
            "hotel_id": self.hotel.id,
            'price': '46grf00',  
            'title': 'spa@$#%',
            'description' : 'dffrfrefew'
        }

        response = self.client.put(url, data=invalid_data)
        self.assertEqual(response.status_code, status.HTTP_500_INTERNAL_SERVER_ERROR)

class DeleteRoomServicesTestCase(APITestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = Login.objects.create_user(
            email=test_email,
            password="testpassword",
            userType="hotel",
            status="active",
        )
        self.hotel = Hotel.objects.create(email=test_email, service_charge=10.00)
        self.room_services = RoomServices.objects.create(
            hotel_id=self.hotel,
            title="Gym",
            description="dsefrefregrtgrtgrt",
            price=1500.00,
            status= "active"
        )

      
    def test_delete_room_details_without_associated_hotel(self):
        self.client.force_authenticate(user=self.user)
        self.hotel.delete()
        url = reverse('delete-room-services', args=[self.room_services.id])
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


    def test_delete_room_details_success_with_associated_hotel(self):
        self.user.hotel = self.hotel
        self.user.save()
        url = reverse('delete-room-services', kwargs={'room_services_id': self.room_services.id})
        self.client.force_authenticate(user=self.user)
        response = self.client.delete(url)
        if response.status_code != status.HTTP_200_OK:
            self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("Room services deleted successfully", response.data['detail'])

    def test_get_room_details_not_found(self):
        invalid_room_services_id = 9999
        url = reverse('delete-room-services', kwargs={'room_services_id': invalid_room_services_id})
        self.client.force_authenticate(user=self.user)
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertIn('detail', response.data)


#view room services test case
class ViewHotelRoomServices(APITestCase):
    def setUp(self):
        self.client = APIClient()

        self.login_user = Login.objects.create_user(
            email=test_email,
            password="testexample@.com",
            userType="hotel",
            status="active",
        )

        self.hotel = Hotel.objects.create(email=test_email, service_charge=10.00)
        self.room_services1 = RoomServices.objects.create(
            hotel_id=self.hotel,
            title="Service 1",
            description="xxxxxxxxxxxxxx",
            price=1500.00,
        )
        self.room_services2 = RoomServices.objects.create(
            hotel_id=self.hotel,
            title="Service 1",
            description="xxxxxxxxxxxxxx",
            price=2000.00,
        )

    def test_success_view_room_services(self):
        self.client.force_authenticate(user=self.login_user)
        url = reverse('view-room-services')  
        response = self.client.get(url, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_search_room_services(self):
        self.client.force_authenticate(user=self.login_user)
        url = reverse('view-room-services')
        search_query = 'Service 1'
        response = self.client.get(url, {'search': search_query}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertContains(response, 'Service 1')

    def test_ordering_by_price_asc(self):
        self.client.force_authenticate(user=self.login_user)
        url = reverse('view-room-services')
        ordering = 'price'
        response = self.client.get(url, {'ordering': ordering}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        self.assertTrue(data['results'][0]['price'] <= data['results'][1]['price'])

    def test_ordering_by_price_desc(self):
        self.client.force_authenticate(user=self.login_user)
        url = reverse('view-room-services')
        ordering = '-price'
        response = self.client.get(url, {'ordering': ordering}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        self.assertTrue(data['results'][0]['price'] >= data['results'][1]['price'])

class ActivateHotelTestCase(APITestCase):
    def setUp(self):
        self.client = APIClient()
        self.admin = Login.objects.create(
            email=admin_email,
            password=admin_password,
            status="active",
            userType="admin",
            first_name="admin"
        )

        self.hotel_user = Login.objects.create(
            email='hoteltest@gmail.com',
            password="Hotel@2023",
            userType='hotel',
            status='suspended'
        )
        self.hotel=Hotel.objects.create(
            hotel_name='Mariott', address='Homes', email='hoteltest@gmail.com', phone_number='9645639929',
            user_type='hotel', status='suspended',city='testcity',district='testdistrict',state='teststate',
            license_number='11-1111-2222',service_charge='1334.34',description='nice')

    def test_activate_hotel_success(self):
        self.client.force_authenticate(user=self.admin)
        url=reverse('activate-hotel', kwargs={'hotel_id': self.hotel.id})
        response = self.client.post(url, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['message'], 'Hotel activated successfully')

    def test_activate_hotel_already_active(self):
        self.hotel.status = 'active'
        self.hotel.save()
        self.client.force_authenticate(user=self.admin)
        url=reverse('activate-hotel', kwargs={'hotel_id': self.hotel.id})
        response = self.client.post(url, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data['message'], 'Hotel is already active')

    def test_activate_hotel_not_found(self):
        self.client.force_authenticate(user=self.admin)
        url=reverse('activate-hotel', kwargs={'hotel_id': 999})
        self.hotel.delete()
        response = self.client.post(url, format='json')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(response.data['message'], hotel_user_not_found)

# hotel room booking testcase
class BookHotelRoomTestCase(APITestCase):
    def setUp(self):
        self.url = 'book-hotel-room'
        self.user = Login.objects.create_user(
            email=test_email,
            password="testpassword",
            userType="customer",
            status="active",
        )
        self.customer = Customer.objects.create(
            first_name="Customer",
            email=test_email,
            status="active",
        )
        self.hotel = Hotel.objects.create(
            hotel_name="Tes Hotels",
            email=test_email,
            service_charge=10.00,
            status="active",
        )
        self.room_type = RoomType.objects.create(room_type="Standard")
        self.room_details = RoomDetails.objects.create(
            hotel_id=self.hotel,
            room_type_id=self.room_type,
            number_of_rooms=10,
            room_facilities="AC",
            rate=1500.00,
        )
        
    def test_valid_room_booking(self) :
        booking_data = {
            "room_id" : self.room_details.id,
            "check_in_date":"2024-10-24",
            "check_out_date":"2024-10-25",
            "guest_name":"Binimol",
            "email":"binimol@gmail.com",
            "phone_number":"9876543212",
            "address":"ABC",
            "number_of_rooms":"1",
            "number_of_adults":"2",
            "number_of_children":"0",
            "aadhar_number":"123412341234",
            "selected_services":[]

        }
        url = reverse('book-hotel-room')
        self.client.force_authenticate(user=self.user)
        response = self.client.post(url, booking_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
    
    def test_invalid_room_booking(self) :
        booking_data = {
            "room_id" : self.room_details.id,
            'guest_name' : 'guest_name',
            'email' : 'guest@gmail.com',

        }
        url = reverse('book-hotel-room')
        self.client.force_authenticate(user=self.user)
        response = self.client.post(url, booking_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    
    def test_room_not_available(self) :
        booking_data = {
            "room_id" : self.room_details.id,
            "check_in_date":"2024-10-24",
            "check_out_date":"2024-10-25",
            "guest_name":"Binimol",
            "email":"bini@gmail.com",
            "phone_number":"9876543212",
            "address":"ABC",
            "number_of_rooms":"11",
            "number_of_adults":"2",
            "number_of_children":"0",
            "aadhar_number":"123412341234"

        }
        url = reverse('book-hotel-room')
        self.client.force_authenticate(user=self.user)
        response = self.client.post(url, booking_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    
    def test_customer_not_found(self) :
        booking_data = {
            "room_id" : self.room_details.id,
            "check_in_date":"2024-10-24",
            "check_out_date":"2024-10-25",
            "guest_name":"Binimol",
            "email":"bin@gmail.com",
            "phone_number":"9876543212",
            "address":"ABC",
            "number_of_rooms":"11",
            "number_of_adults":"2",
            "number_of_children":"0",
            "aadhar_number":"123412341234"

        }
        url = reverse('book-hotel-room')
        self.client.force_authenticate(user=self.user)
        self.customer.delete()
        response = self.client.post(url, booking_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    
    def test_invalid_guest_name_(self):
        data = {
            "room_id" : self.room_details.id,
            "guest_name": "hotel#@!",
        }
        url = reverse('book-hotel-room')
        self.client.force_authenticate(user=self.user)
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

        self.assertIn('Name can only contain letters', response.data['guest_name'])

        data_long_len = {
            "room_id" : self.room_details.id,
            "guest_name": "hotel paradise test hotel name for the test purpose which is temperory",
        }
        response = self.client.post(url, data_long_len, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

        self.assertIn('Name should not exceed 50 characters', response.data['guest_name'])

    def test_invalid_email(self):
        data = {
            "room_id" : self.room_details.id,
            "email": "invalid_email",
        }
        url = reverse('book-hotel-room')
        self.client.force_authenticate(user=self.user)
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

        self.assertIn('Enter a valid email address.', response.data['email'])
    
    def test_invalid_date(self):
        data = {
            "room_id" : self.room_details.id,
            "check_in_date": "2023-10-10",
        }
        url = reverse('book-hotel-room')
        self.client.force_authenticate(user=self.user)
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

        self.assertIn('Selected ate cannot be a past date.', response.data['check_in_date'])
    
    def test_invalid_aadhar_number(self):
        data = {
            "room_id" : self.room_details.id,
            "aadhar_number": "2121sfd",
        }
        url = reverse('book-hotel-room')
        self.client.force_authenticate(user=self.user)
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

        self.assertIn('Aadhar number should only contain numeric digits.', response.data['aadhar_number'])

        short_data = {
            "room_id" : self.room_details.id,
            "aadhar_number":"21213243"
        }
        response = self.client.post(url, short_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

        self.assertIn('Aadhar number should be 12 digits long.', response.data['aadhar_number'])
    
    def test_invalid_number_of_person(self):
        data = {
            "room_id" : self.room_details.id,
            "number_of_adults":"2sd",
            "number_of_children":"-11",
        }
        url = reverse('book-hotel-room')
        self.client.force_authenticate(user=self.user)
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

        self.assertIn('Number of people must be a non-negative integer.', response.data['number_of_children'])
        self.assertIn('Number of people must be a valid integer.', response.data['number_of_adults'])


class GetCustomerBookingCase(APITestCase):
    def setUp(self):
        self.user = Login.objects.create_user(
            email=test_email,password="testpswd",userType="customer",status="active",
        )
        self.customer = Customer.objects.create(
            first_name="Customer",email=test_email,status="active",
        )
        self.hotel = Hotel.objects.create(
            hotel_name="Tes Hotels",email=test_email,service_charge=10.00,status="active",
        )
        self.room_type = RoomType.objects.create(room_type="Standard")
        self.room_details = RoomDetails.objects.create(
            hotel_id=self.hotel,room_type_id=self.room_type,number_of_rooms=10,room_facilities="AC",rate=1500.00,
        )
        self.booking = Booking.objects.create(
            room =self.room_details,check_in_date="2024-10-24",check_out_date="2024-10-25",guest_name="Binimol",email="bini@gmail.com",phone_number="9876543212",address="ABC",
            number_of_rooms="11",number_of_adults="2",number_of_children="0",aadhar_number="123412341234",customer=self.customer,hotel=self.hotel
        )

    def test_valid_booking_details_view(self):
        self.client.force_authenticate(user=self.user)
        url = reverse('get-customer-booking',kwargs={'booking_id': self.booking.id})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
    
    def test_booking_details_not_found(self):
        self.client.force_authenticate(user=self.user)
        url = reverse('get-customer-booking',kwargs={'booking_id': 999})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_booking_details_error(self):
        self.client.force_authenticate(user=self.user)
        url = reverse('get-customer-booking',kwargs={'booking_id': self.booking.id})
        self.customer.delete()
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

# list bookings test cases 
class ListBookingTestCases(APITestCase):
    def setUp(self) :
        self.client = APIClient()

        self.admin_login = Login.objects.create_user(
            email=test_email,
            password="testlistpassword",
            userType="admin",
            status="active",
        )

        self.hotel_login = Login.objects.create_user(
            email='hotellist@gmail.com',
            password="testpassword",
            userType="hotel",
            status="active",
        )

        self.customer_login = Login.objects.create_user(
            email='customerexist@test.com',
            password="customerPassword",
            userType="customer",
            status="active",
        )

        self.hotel_not_exist = Login.objects.create_user(
            email='hotelnotexistlist@gmail.com',
            password="testpassword",
            userType="hotel",
            status="active",
        )
        
        self.customer = Customer.objects.create(
            first_name="Customer",
            email='customerexist@test.com',
            status="active",
        )

        self.hotel = Hotel.objects.create(
            hotel_name="Mariott List",
            email="hotellist@gmail.com",
            phone_number="9878865455",
            address="Mariott list towers",
            city="test",
            district="ernakulam",
            state="kerala",
            pincode="678988",
            license_number="12-4353-6785",
            description="7 star hotel and residency",
            service_charge="1500.56",
            status='active'
        )

        self.room_type = RoomType.objects.create(room_type="Standard")

        self.room_details = RoomDetails.objects.create(
            hotel_id=self.hotel,
            room_type_id=self.room_type,
            number_of_rooms=10,
            room_facilities="AC",
            rate=1500.00,
        )

        self.booking = Booking.objects.create(
            room =self.room_details,
            check_in_date="2024-12-24",
            check_out_date="2024-12-25",
            guest_name="Binil",
            email="binil@test.com",
            phone_number="9876873212",
            address="ABC",
            number_of_rooms="1",
            number_of_adults="2",
            number_of_children="0",
            aadhar_number="123412341234",
            customer=self.customer,
            hotel = self.hotel
        )

    def test_list_bookings_with_hotel(self):
        self.client.force_authenticate(user=self.hotel_login)
        url = reverse('list-booking-details')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_list_bookings_with_hotel_not_found(self):
        self.client.force_authenticate(user=self.hotel_not_exist)
        url = reverse('list-booking-details')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(response.data['message'], hotel_user_not_found)

    def test_user_type_hotel_with_no_bookings(self):
        self.client.force_authenticate(user=self.hotel_login)
        self.booking.delete()
        url = reverse('list-booking-details')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(response.data['message'], 'No bookings data found')

    def test_list_bookings_with_unknown_user(self):
        self.client.force_authenticate(user=self.customer_login)
        url = reverse('list-booking-details')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)   

    def test_list_bookings_with_admin(self):
        self.client.force_authenticate(user=self.admin_login)
        url = reverse('list-booking-details')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_user_type_admin_with_no_bookings(self):
        self.client.force_authenticate(user=self.admin_login)
        self.booking.delete()
        url = reverse('list-booking-details')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(response.data['message'], 'No bookings data found')

    def test_booking_details_with_hotel(self):
        self.client.force_authenticate(user=self.hotel_login)
        url = reverse('list-booking-details')
        response = self.client.get(url, {'query' : 'Binil'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
    
    def test_booking_details_with_admin(self):
        self.client.force_authenticate(user=self.admin_login)
        url = reverse('list-booking-details')
        response = self.client.get(url, {'query' : 'Binil'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)

# sort list booking test cases
class SortBookingTestCases(APITestCase):
    def setUp(self) :
        self.client = APIClient()

        self.admin_login = Login.objects.create_user(
            email=test_email,
            password="testsortpassword",
            userType="admin",
            status="active",
        )

        self.hotel_login = Login.objects.create_user(
            email='hotelexist@gmail.com',
            password="testpassword",
            userType="hotel",
            status="active",
        )

        self.customer_login = Login.objects.create_user(
            email='customerexist@gmail.com',
            password="customerPassword",
            userType="customer",
            status="active",
        )

        self.hotel_not_exist = Login.objects.create_user(
            email='hotelnotexist@gmail.com',
            password="testsortpassword",
            userType="hotel",
            status="active",
        )
        
        self.customer = Customer.objects.create(
            first_name="Customer",
            email='customerexist@gmail.com',
            status="active",
        )

        self.hotel = Hotel.objects.create(
            hotel_name="Mariott  Sort",
            email="hotelexist@gmail.com",
            phone_number="9878865455",
            address="Mariott sort towers",
            city="Vyttila",
            district="test",
            state="kerala",
            pincode="678988",
            license_number="12-4353-6785",
            description="7 star hotel and residency",
            service_charge="1786.56",
            status='active'
        )

        self.room_type = RoomType.objects.create(room_type="Standard")

        self.room_details = RoomDetails.objects.create(
            hotel_id=self.hotel,
            room_type_id=self.room_type,
            number_of_rooms=10,
            room_facilities="AC, TV",
            rate=2500.00,
        )

        self.booking = Booking.objects.create(
            room =self.room_details,
            check_in_date="2024-10-24",
            check_out_date="2024-10-25",
            guest_name="Binil",
            email="biniltest@gmail.com",
            phone_number="9876543212",
            address="ABC",
            number_of_rooms="1",
            number_of_adults="2",
            number_of_children="0",
            aadhar_number="123412341234",
            customer=self.customer,
            hotel = self.hotel
        )

    def test_sort_booking_details_with_name(self):       
        url = reverse('sort-booking-details',kwargs={'sort_by': 'guest_name'})
        self.client.force_authenticate(user=self.admin_login)
        response = self.client.get(url, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_sort_booking_details_not_found(self):       
        url = reverse('sort-booking-details',kwargs={'sort_by': 'guest_name'})
        self.client.force_authenticate(user=self.admin_login)
        self.booking.delete()
        response = self.client.get(url, format='json')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_sort_booking_hotel_not_found(self):
        url = reverse('sort-booking-details',kwargs={'sort_by': 'guest_name'})
        self.client.force_authenticate(user=self.hotel_login)
        self.hotel.delete()
        response = self.client.get(url, format='json')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(response.data['message'], hotel_user_not_found)

    def test_hotel_sort_booking_details_not_found(self):       
        url = reverse('sort-booking-details',kwargs={'sort_by': 'guest_name'})
        self.client.force_authenticate(user=self.hotel_login)
        self.booking.delete()
        response = self.client.get(url, format='json')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_sort_booking_details_by_hotel(self):       
        url = reverse('sort-booking-details',kwargs={'sort_by': 'guest_name'})
        self.client.force_authenticate(user=self.hotel_login)
        response = self.client.get(url, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)


#  add additional activites to rooms test cases
class RoomAdditionalActivitesTestCase(APITestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = Login.objects.create(
            email=test_email,
            userType='hotel',
            status='active',
            first_name='hotel_name',
            password='Hotel@11'
        )
        
        self.hotel = Hotel.objects.create(
            hotel_name='hotel_name',
            email=test_email,
            phone_number='9867654221',
            address='TestAddress',
            city='TestCity',
            district='TestDistrict',
            state='TestState',
            pincode='686508',
            license_number='12-2222-2222',
            description='Food,cleaning,wifi',
            service_charge='1200',
            user_type='hotel',
            status='active',
            location_link='https://testroomlocation.com/'
        )

        self.hotel1 = Hotel.objects.create(
            hotel_name='hotel_name1',
            email="hoteltest@gmail.com",
            phone_number='9867654221',
            address='TestAddress',
            city='TestCity',
            district='TestDistrict',
            state='TestState',
            pincode='686508',
            license_number='12-2222-2233',
            description='Food,beverage,wifi',
            service_charge='1200',
            user_type='hotel',
            status='active',
            location_link='https://testsamplelocation.com/'
        )

        self.room_type = RoomType.objects.create(room_type="Single")   

        self.room_details = RoomDetails.objects.create(
            hotel_id=self.hotel,
            room_type_id=self.room_type,
            number_of_rooms=10,
            room_facilities="AC, TV,order facility, WiFi",
            rate=1500.00,
            status= "active"
        )

        self.room_details_unauthorized = RoomDetails.objects.create(
            hotel_id=self.hotel1,
            room_type_id=self.room_type,
            number_of_rooms=10,
            room_facilities="AC, TV, view point,WiFi",
            rate=1500.00,
            status= "active"
        )

        self.room_services = RoomServices.objects.create(
            hotel_id=self.hotel,
            title="Spa",
            description="Spa facilities for special guests",
            price=2000.0,
            image=None,
        )

        self.data = {
            'additional_activites' : self.room_services.id,
            'room_details_id' : self.room_details.id,
            'hotel_id' : self.hotel.id,
            'status' : 'active',
        }


    def test_successful_addition_of_services_to_rooms(self):
        self.client.force_authenticate(user=self.user)
        url = reverse('add-room-additional-activities', args=[self.room_details.id, self.room_services.id])
        response = self.client.post(url, self.data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['message'], 'Services added to room successfully')

    def test_unauthorized_access(self):
        self.client.force_authenticate(user=self.user)
        url = reverse('add-room-additional-activities', args=[self.room_details_unauthorized.id, self.room_services.id])
        response = self.client.post(url, self.data)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertEqual(response.data['message'], 'Unauthorized')

    def test_internal_server_error(self):
        self.client.force_authenticate(user=self.user)
        url = reverse('add-room-additional-activities', args=[self.room_details.id, self.room_services.id])
    
        with patch.object(RoomsAdditionalActivitesSerializer, 'save', side_effect=Exception('Error')):
            response = self.client.post(url, self.data)
    
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data['message'], 'An error occurred please try again later')

    def test_hotel_not_found(self):
        self.client.force_authenticate(user=self.user)
        self.hotel.delete()
        url = reverse('add-room-additional-activities', args=[self.room_details.id, self.room_services.id])
        response = self.client.post(url, self.data)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(response.data['message'], hotel_user_not_found)

    def test_services_already_exist(self):
        room_type1 = RoomType.objects.create(room_type="Double")  

        existing_room_details = RoomDetails.objects.create(
            hotel_id=self.hotel,
            room_type_id=room_type1,
            number_of_rooms=10,
            room_facilities="AC, TV, test WiFi",
            rate=1500.00,
            status="active"
        )

        existing_room_services = RoomServices.objects.create(
            hotel_id=self.hotel,
            title="Gym",
            description="Gym facilities for guests",
            price=2000.0,
            image=None,
        )

        RoomAdditionalActivites.objects.create(
            room_details_id=existing_room_details,
            additional_activites=existing_room_services,
            hotel_id=self.hotel.id,
            status='active'
        )

        data = {
            'additional_activites': existing_room_services.id,
            'room_details_id': existing_room_details.id,
            'hotel_id': self.hotel.id,
            'status': 'active',
        }

        self.client.force_authenticate(user=self.user)
        url = reverse('add-room-additional-activities', args=[existing_room_details.id, existing_room_services.id])
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data['message'], 'Services already exists for this room')

# view additional activites to rooms
class ViewAdditionalActivitesTestCases(APITestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = Login.objects.create(
            email=test_email,
            userType='hotel',
            status='active',
            first_name='hotel_name',
            password='Hotel@11'
        )
        
        self.hotel = Hotel.objects.create(
            hotel_name='hotel_name',
            email=test_email,
            phone_number='9867654221',
            address='TestAddress',
            city='TestCity',
            district='TestDistrict',
            state='TestState',
            pincode='686508',
            license_number='12-2222-2222',
            description='Food,test, wifi',
            service_charge='1200',
            user_type='hotel',
            status='active',
            location_link='https://hotellocation.com/'
        )

        self.room_services = RoomServices.objects.create(
            hotel_id=self.hotel,
            title="Spa",
            description="Spa facilities for regular guests",
            price=2000.0,
            image=None,
        )

    def test_hotel_not_found(self):
        self.client.force_authenticate(user=self.user)
        self.hotel.delete()
        url = reverse('list-room-additional-activities')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(response.data['message'], hotel_user_not_found)

    def test_get_additional_activites(self):
        self.client.force_authenticate(user=self.user)
        url = reverse('list-room-additional-activities')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)


# list additional activites added to rooms by admin
class ViewActivitiesAddedToRoomsTestCases(APITestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = Login.objects.create(
            email=test_email,
            userType='admin',
            status='active',
            first_name='admin',
            password=admin_password
        )

        self.hotel = Hotel.objects.create(
            hotel_name='hotel_name',
            email=test_email,
            phone_number='9867654221',
            address='TestAddress',
            city='TestCity',
            district='TestDistrict',
            state='TestState',
            pincode='686508',
            license_number='12-2222-2222',
            description='Food,  massage, wifi',
            service_charge='1200',
            user_type='hotel',
            status='active',
            location_link='https://spalocation.com/'
        )

        self.room_type = RoomType.objects.create(room_type="Single")   

        self.room_details = RoomDetails.objects.create(
            hotel_id=self.hotel,
            room_type_id=self.room_type,
            number_of_rooms=10,
            room_facilities="AC, gym, pool",
            rate=1500.00,
            status= "active"
        )

        self.room_services = RoomServices.objects.create(
            hotel_id=self.hotel,
            title="Spa",
            description="Spa facilities for single guests",
            price=2000.0,
            image=None,
        )

        self.room_additional_activites = RoomAdditionalActivites.objects.create(
            additional_activites = self.room_services,
            room_details_id = self.room_details,
            hotel_id = self.hotel.id,
            status = "active"
        )

    def test_get_additional_activities_for_valid_room(self):
        self.client.force_authenticate(user=self.user)
        url = reverse('admin_list_activities_of_room', args=[self.room_details.id])
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_get_additional_activities_for_invalid_room(self):
        self.client.force_authenticate(user=self.user)
        url = reverse('admin_list_activities_of_room', args=[10])
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(response.data['message'], 'No additional activities added for this room')

# list additional activities added to rooms by hotels
class ViewRoomsActivitiesByHotelsTestCases(APITestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = Login.objects.create(
            email=test_email,
            userType='hotel',
            status='active',
            first_name='hotel_name',
            password='Hoteltest@123'
        )

        self.hotel = Hotel.objects.create(
            hotel_name='hotel_name',
            email=test_email,
            phone_number='9867654221',
            address='TestAddress',
            city='TestCity',
            district='TestDistrict',
            state='TestState',
            pincode='686508',
            license_number='12-2222-2222',
            description='Food,pool',
            service_charge='1200',
            user_type='hotel',
            status='active',
            location_link='https://demolocation.com/'
        )

        self.room_type = RoomType.objects.create(room_type="Single")   

        self.room_details = RoomDetails.objects.create(
            hotel_id=self.hotel,
            room_type_id=self.room_type,
            number_of_rooms=20,
            room_facilities="AC, test",
            rate=2500.00,
            status= "active"
        )

        self.room_services = RoomServices.objects.create(
            hotel_id=self.hotel,
            title="Spa facility",
            description="Spa facilities for regular guests",
            price=1800.0,
            image=None,
        )

        self.room_additional_activites = RoomAdditionalActivites.objects.create(
            additional_activites = self.room_services,
            room_details_id = self.room_details,
            hotel_id = self.hotel.id,
            status = "active"
        )

    def test_get_additional_activities_for_rooms_hotels(self):
        self.client.force_authenticate(user=self.user)
        url = reverse('hotel_list_activities_of_room', args=[self.room_details.id])
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_get_additional_activities_for_rooms_hotels_not_founds(self):
        self.client.force_authenticate(user=self.user)
        self.hotel.delete()
        url = reverse('hotel_list_activities_of_room', args=[self.room_details.id])
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(response.data['message'], hotel_user_not_found)

    def test_get_additional_activities_for_rooms_hotels_unauthorized(self):
        hotel_user = Login.objects.create(
            email='hotel1@gmail.com',
            userType='hotel',
            status='active',
            first_name='hotel_name',
            password='Hoteltest@123'
        )

        Hotel.objects.create(
            hotel_name='hotel_name',
            email='hotel1@gmail.com',
            phone_number='9867654221',
            address='TestAddress',
            city='TestCity',
            district='TestDistrict',
            state='TestState',
            pincode='686508',
            license_number='12-2222-4444',
            description='Food,wifi',
            service_charge='1200',
            user_type='hotel',
            status='active',
            location_link='https://testlocation.com/'
        )

        self.client.force_authenticate(user=hotel_user)
        url = reverse('hotel_list_activities_of_room', args=[self.room_details.id])
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertEqual(response.data['message'], 'Unauthorized')

    def test_get_additional_activities_for_rooms_not_found(self):
        self.client.force_authenticate(user=self.user)
        url = reverse('hotel_list_activities_of_room', args=[999])
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(response.data['message'], 'Room details not found')

    def test_get_additional_activities_for_invalid_room(self):
        self.client.force_authenticate(user=self.user)
        self.room_additional_activites.delete()
        url = reverse('hotel_list_activities_of_room', args=[self.room_details.id])
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(response.data['message'], 'No additional activities added for this room')

# delete services added to rooms by hotels test cases
class DeleteAddedServicesTestCases(APITestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = Login.objects.create(
            email=test_email,
            userType='hotel',
            status='active',
            first_name='hotel_name',
            password='Hoteldemo@123'
        )

        self.hotel = Hotel.objects.create(
            hotel_name='hotel_name',
            email=test_email,
            phone_number='9867654221',
            address='TestAddress',
            city='TestCity',
            district='TestDistrict',
            state='TestState',
            pincode='686508',
            license_number='12-2222-2222',
            description='Food,wifi',
            service_charge='1200',
            user_type='hotel',
            status='active',
            location_link='https://testlocation.com/'
        )

        self.room_type = RoomType.objects.create(room_type="Single")   

        self.room_details = RoomDetails.objects.create(
            hotel_id=self.hotel,
            room_type_id=self.room_type,
            number_of_rooms=10,
            room_facilities="AC, TV, WiFi",
            rate=1500.00,
            status= "active"
        )

        self.room_services = RoomServices.objects.create(
            hotel_id=self.hotel,
            title="Spa",
            description="Spa facilities for test guests",
            price=2000.0,
            image=None,
        )

        self.room_additional_activites = RoomAdditionalActivites.objects.create(
            additional_activites = self.room_services,
            room_details_id = self.room_details,
            hotel_id = self.hotel.id,
            status = "active"
        )

        self.room_additional_activites1 = RoomAdditionalActivites.objects.create(
            additional_activites = self.room_services,
            room_details_id = self.room_details,
            hotel_id = self.hotel.id,
            status = "deleted"
        )

    def test_hotel_not_found(self):
        self.client.force_authenticate(user=self.user)
        self.hotel.delete()
        url = reverse('hotel_delete_activities_of_room', args=[self.room_details.id, self.room_additional_activites.id])
        response = self.client.put(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(response.data['message'], hotel_user_not_found)
        
    def test_room_id_does_not_exist(self):
        self.client.force_authenticate(user=self.user)
        url = reverse('hotel_delete_activities_of_room', args=[1000, self.room_additional_activites.id])  
        response = self.client.put(url)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data['message'], 'An error occurred while deleting the services. Please try again later')

    def test_additional_activities_id_does_not_exist(self):
        self.client.force_authenticate(user=self.user)
        url = reverse('hotel_delete_activities_of_room', args=[self.room_details.id, 1000])  
        response = self.client.put(url)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data['message'], 'An error occurred while deleting the services. Please try again later')


class PaymentCalculationCase(APITestCase):
    def setUp(self):
        self.user = Login.objects.create_user(
            email=test_email,password="testpswd",userType="customer",status="active",
        )
        self.customer = Customer.objects.create(
            first_name="Customer",email=test_email,status="active",
        )
        self.hotel = Hotel.objects.create(
            hotel_name="Test data Hotels",email=test_email,service_charge=10.00,status="active",
        )
        self.room_type = RoomType.objects.create(room_type="Standard")
        self.room_details = RoomDetails.objects.create(
            hotel_id=self.hotel,room_type_id=self.room_type,number_of_rooms=10,room_facilities="AC",rate=1500.00,
        )
        self.booking = Booking.objects.create(
            room =self.room_details,check_in_date="2024-10-24",check_out_date="2024-10-25",guest_name="Binimol",email="binil@gmail.com",phone_number="9876543212",address="ABC",
            number_of_rooms="11",number_of_adults="2",number_of_children="0",aadhar_number="123412341234",customer=self.customer,hotel=self.hotel
        )

    def test_valid_payment_calculation(self):
        self.client.force_authenticate(user=self.user)
        url = reverse('payment-calculation',kwargs={'booking_id': self.booking.id})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_user_not_found(self):
        self.client.force_authenticate(user=self.user)
        url = reverse('payment-calculation',kwargs={'booking_id': self.booking.id})
        self.customer.delete()
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
    
    def test_data_not_found(self):
        self.client.force_authenticate(user=self.user)
        url = reverse('payment-calculation',kwargs={'booking_id': self.booking.id})
        self.booking.delete()
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)


class PaymentConfirmationCase(APITestCase):
    def setUp(self):
        self.user = Login.objects.create_user(
            email=test_email,password="testpswd",userType="customer",status="active",
        )
        self.customer = Customer.objects.create(
            first_name="Customer",email=test_email,status="active",
        )
        self.hotel = Hotel.objects.create(
            hotel_name="Test Hotels",email=test_email,service_charge=10.00,status="active",
        )
        self.room_type = RoomType.objects.create(room_type="Standard")
        self.room_details = RoomDetails.objects.create(
            hotel_id=self.hotel,room_type_id=self.room_type,number_of_rooms=10,room_facilities="AC",rate=1500.00,
        )
        self.booking = Booking.objects.create(
            room =self.room_details,check_in_date="2024-10-24",check_out_date="2024-10-25",guest_name="Binimol",email="binimol@gmail.com",phone_number="9876543212",address="ABC",
            number_of_rooms="11",number_of_adults="2",number_of_children="0",aadhar_number="123412341234",customer=self.customer,status='in progress',hotel=self.hotel
        )
        self.data = {"booking_id":self.booking.id, "payment_method":"cash"}
        self.card_data = {"booking_id":self.booking.id, "payment_method":"card", "payment_id":"123"}

    def test_valid_payment_confirmation(self):
        self.client.force_authenticate(user=self.user)
        url = reverse('payment-confirmation')
        response = self.client.post(url,self.data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
    
    def test_valid_card_payment_confirmation(self):
        self.client.force_authenticate(user=self.user)
        url = reverse('payment-confirmation')
        response = self.client.post(url,self.card_data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_user_not_found(self):
        self.client.force_authenticate(user=self.user)
        url = reverse('payment-confirmation')
        self.customer.delete()
        response = self.client.post(url,self.data)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
    
    def test_data_not_found(self):
        self.client.force_authenticate(user=self.user)
        url = reverse('payment-confirmation')
        self.booking.delete()
        response = self.client.post(url,self.data)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
    
    def test_confirmed_booking(self):
        self.client.force_authenticate(user=self.user)
        url = reverse('payment-confirmation')
        self.booking.status='confirmed'
        self.booking.save()
        response = self.client.post(url,self.data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    
    def test_cancelled_booking(self):
        self.client.force_authenticate(user=self.user)
        url = reverse('payment-confirmation')
        self.booking.status='cancelled'
        self.booking.save()
        response = self.client.post(url,self.data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

#stripe payment intent testcase
class StripePaymentCheckoutTestCase(APITestCase):
    @patch('stripe.PaymentIntent.create')
    def test_create_payment_intent(self, mock_payment_intent_create):
        mock_client_secret = 'mock_client_secret'
        mock_payment_intent = MagicMock(client_secret=mock_client_secret)
        mock_payment_intent_create.return_value = mock_payment_intent

        total_payment = Decimal('100.00')
        data = {'total_payment': str(total_payment)}
        url = reverse('create-payment-checkout')
        response = self.client.post(url, data=json.dumps(data), content_type='application/json')

        self.assertEqual(response.status_code, 200)
        self.assertIn('clientSecret', response.data)
        self.assertEqual(response.data['clientSecret'], mock_client_secret)

        mock_payment_intent_create.assert_called_once_with(
            amount=int(total_payment * 100),
            currency='inr',
            description='Payment for booking',
            payment_method_types=['card']
        )

    def test_invalid_payment_intent(self):
        total_payment = Decimal('123')
        data = {'total_payment': str(total_payment)}
        url = reverse('create-payment-checkout')
        response = self.client.post(url, data=data, content_type='application/json')

        self.assertEqual(response.status_code, 400)

#view customer reservation list and sorting
class CustomerReservationListTestcase(APITestCase):
    TEST_EMAIL = 'aac@dgf.cvs'

    def setUp(self):
        self.client = APIClient()

        self.login_user = Login.objects.create_user(
            email=self.TEST_EMAIL,
            password="testexample@.com",
            userType="customer",
            status="active",
        )
        self.customer = Customer.objects.create(email=self.TEST_EMAIL, first_name='customer', status="active")
        self.hotel = Hotel.objects.create(
            hotel_name="TestHotels",
            email=self.TEST_EMAIL,
            service_charge=10.00,
            status="active",
        )

        self.room_type = RoomType.objects.create(room_type="Standard")
        self.room_details = RoomDetails.objects.create(
            hotel_id=self.hotel,
            room_type_id=self.room_type,
            number_of_rooms=10,
            room_facilities="AC",
            rate=1500.00,
        )

        self.bookings = Booking.objects.create(
            guest_name='guest customer',
            room=self.room_details,
            customer=self.customer,
            aadhar_number='123412341234',
            email=self.TEST_EMAIL,
            phone_number='9876543211',
            address='dcs',
            number_of_rooms=2,
            check_in_date='2024-02-10',
            check_out_date='2024-02-15',
            status='confirmed',
            hotel=self.hotel,
            number_of_adults=3,
            number_of_children=0
        )

        self.bookings2 = Booking.objects.create(
            guest_name='test',
            room=self.room_details,
            customer=self.customer,
            aadhar_number='123412341234',
            email=self.TEST_EMAIL,
            phone_number='7676543211',
            address='dcs',
            number_of_rooms=2,
            check_in_date='2024-02-10',
            check_out_date='2024-02-15',
            status='cancelled',
            hotel=self.hotel,
            number_of_adults=3,
            number_of_children=0
        )

        self.bookings3 = Booking.objects.create(
            guest_name='test',
            room=self.room_details,
            customer=self.customer,
            aadhar_number='123412341234',
            email=self.TEST_EMAIL,
            phone_number='7676543211',
            address='dcs',
            number_of_rooms=2,
            check_in_date='2024-02-10',
            check_out_date='2024-04-15',
            status='completed',
            hotel=self.hotel,
            number_of_adults=3,
            number_of_children=0
        )

        self.bookings4 = Booking.objects.create(
            guest_name='test',
            room=self.room_details,
            customer=self.customer,
            aadhar_number='123412341234',
            email=self.TEST_EMAIL,
            phone_number='7676543211',
            address='dcs',
            number_of_rooms=2,
            check_in_date='2025-04-20',
            check_out_date='2025-04-25',
            status='completed',
            hotel=self.hotel,
            number_of_adults=3,
            number_of_children=0
        )

    def test_get_cancelled_bookings(self):
        url = reverse('reservation-list')
        data = {'data': {'status_filter': 'cancelled'}, 'params': {'query': ''}}
        self.client.force_authenticate(user=self.login_user)
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_get_upcoming_bookings(self):
        url = reverse('reservation-list')
        self.client.force_authenticate(user=self.login_user)
        data = {"params": {"query": ""}, "data": {"status_filter": "upcoming"}}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, 200)

    def test_get_completed_bookings(self):
        url = reverse('reservation-list')
        self.client.force_authenticate(user=self.login_user)
        data = {'data': {'status_filter': 'completed'}, 'params': {'query': ''}}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, 200)

    def test_get_all_bookings(self):
        url = reverse('reservation-list')
        self.client.force_authenticate(user=self.login_user)
        data = {'data': {'status_filter': ''}, 'params': {'query': ''}}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, 200)

    def test_get_reservation_details_with_query(self):
        url = reverse('reservation-list')
        self.client.force_authenticate(user=self.login_user)
        response = self.client.post(url, {'query': 'guest'}, format='json')
        print(response.content)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertContains(response, 'guest')

    def test_no_reservation_list(self):
        self.client.force_authenticate(user=self.login_user)
        url = reverse('reservation-list')
        self.bookings.delete()
        self.bookings2.delete()
        self.bookings3.delete()
        self.bookings4.delete()
        data = {'data': {'status_filter': ''}, 'params': {'query': None}}
        response = self.client.post(url, data, format='json')
        print(response.content)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_sort_reservation_details_with_name(self):
        url = reverse('sort-customer-reservation', kwargs={'sort_by': 'guest_name'})
        self.client.force_authenticate(user=self.login_user)
        response = self.client.get(url, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_sort_reservation_details_no_customer(self):
        url = reverse('sort-customer-reservation', kwargs={'sort_by': 'guest_name'})
        self.client.force_authenticate(user=self.login_user)
        self.customer.delete()
        response = self.client.get(url, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_sort_reservation_details_no_booking(self):
        url = reverse('sort-customer-reservation', kwargs={'sort_by': 'guest_name'})
        self.client.force_authenticate(user=self.login_user)
        self.bookings.delete()
        self.bookings2.delete()
        self.bookings3.delete()
        self.bookings4.delete()
        response = self.client.get(url, format='json')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

class CountTodayBookingTest(APITestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = Login.objects.create(
            email=test_email,
            userType='hotel',
            status='active',
            first_name='hotel_name',
            password='Hotelcount@123'
        )
        self.hotel = Hotel.objects.create(email=test_email, service_charge='100')

    def test_count_today_booking(self):
        self.client.force_authenticate(user=self.user)
        customer = Customer.objects.create(
            first_name='John',
            last_name='Doe',
            email='john.doe123@example.com',
        )
        room_type = RoomType.objects.create(room_type='Single')
        room = RoomDetails.objects.create(
            hotel_id=self.hotel, room_type_id=room_type, number_of_rooms=5, room_facilities='Some facilities',
            rate=100.00)
        Booking.objects.create(hotel=self.hotel, room=room, customer=customer, aadhar_number='24651210838',
                               number_of_adults='1', number_of_children='0', number_of_rooms='1',
            check_in_date='2024-12-10', check_out_date='2024-12-12')
        url = reverse('today-booking-count')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        expected_data = {'today_bookings_count': 0 }
        self.assertEqual(response.data, expected_data)

    def test_count_today_booking_no_bookings(self):
        self.client.force_authenticate(user=self.user)
        url = reverse('today-booking-count')
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        expected_data = {'today_bookings_count': 0 }
        self.assertEqual(response.data, expected_data)
    
    def test_boookimg_hotel_fails(self):
        url = reverse('today-booking-count')
        self.client.force_authenticate(user=self.user)
        self.hotel.delete()
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

class PaymentPercentageTest(APITestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = Login.objects.create(
            email=test_email,
            userType='hotel',
            status='active',
            first_name='hotel_name',
            password='Hotelpay@123'
        )
        self.hotel = Hotel.objects.create(email=test_email, service_charge='100')
    def test_payment_percentage(self):
        self.client.force_authenticate(user=self.user)
        customer = Customer.objects.create(
            first_name='John',
            last_name='Doe',
            email='john.doe1@example.com',
        )
        room_type = RoomType.objects.create(room_type='Single')
        room = RoomDetails.objects.create(
            hotel_id=self.hotel, room_type_id=room_type, number_of_rooms=5, room_facilities='Some facilities',
            rate=100.00)
        booking=Booking.objects.create(hotel=self.hotel, room=room, customer=customer, aadhar_number='24651210838',
                               number_of_adults='1', number_of_children='0', number_of_rooms='1',
                               check_in_date='2024-02-28', check_out_date='2024-03-03')

        Payment.objects.create(
            booking=booking,
            payment_method='cash',
            customer = customer
        )
        Payment.objects.create(
            booking=booking,
            payment_method='cash',
            customer = customer

        )
        Payment.objects.create(
            booking=booking,
            payment_method='card',
            customer = customer

        )
        url = reverse('payment-percentage') 
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_payment_hotel_fails(self):
        url = reverse('payment-percentage') 
        self.client.force_authenticate(user=self.user)
        self.hotel.delete()
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
      
    
class WeeklyBookingCountTest(TestCase):
    def setUp(self):
        self.client = APIClient()

        self.user = Login.objects.create(
            email=test_email,
            userType='hotel',
            status='active',
            first_name='hotel_name',
            password='Hotel@123'
        )
        self.hotel = Hotel.objects.create(email=test_email, service_charge=100)

        room_type = RoomType.objects.create(room_type='Single') 
        room_details = RoomDetails.objects.create(
            hotel_id=self.hotel,
            room_type_id=room_type,
            number_of_rooms=10,  
            room_facilities='Facilities for Single Room',
            rate=100.0   
        )
        customer = Customer.objects.create(
            first_name='John',
            last_name='Doe',
            email='john.doe1@example.com',
        )
        today = timezone.now()
        self.this_week = [
            Booking.objects.create(
                hotel=self.hotel,
                room=room_details, 
                customer=customer,
                check_in_date=today - timedelta(days=i),
                check_out_date=today - timedelta(days=i-1),
                guest_name='Keerthana',
                email='keerthana142@gmail.com', 
                phone_number='1234567890',
                address='XYZ', 
                aadhar_number=123456789012,
                number_of_adults=1,
                number_of_children=0,
                number_of_rooms=1, 
            )
            for i in range(today.weekday() + 1)
        ]
        
    def test_weekly_booking_count(self):
        self.client.force_authenticate(user=self.user)
        url = reverse('selected-week-bookings') 
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)


        expected_counts = [1, 1, 1, 1, 1, 1, 0]  
        for day_count, expected_count in zip(response.data, expected_counts):
            self.assertEqual(day_count['count'], expected_count)

    def test_weekly_hotel_fails(self):
        url = reverse('selected-week-bookings') 
        self.client.force_authenticate(user=self.user)
        self.hotel.delete()
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

class RecentReviewsTestCase(APITestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = Login.objects.create(
            email='test_email',
            userType='hotel',
            status='active',
            first_name='hotel_name',
            password='Hotel@123'
        )
        self.hotel = Hotel.objects.create(
            hotel_name="Mariott",
            email='test_email',
            phone_number="9878865455",
            address="Mariott old towers",
            city="Vyttila",
            district="ernakulam",
            state="kerala",
            pincode="678988",
            license_number="12-4353-6785",
            description="7 star hotel and testing",
            service_charge="1786.56",
            status='active'
        )

        self.review1 = Review.objects.create(
            hotel_email='test_email',
            customer_name='customertest@gmail.com',
            rating=5,
            title='Great experience',
            comment='Enjoyed my stay',
        )

    def test_recent_reviews_success(self):
        self.client.force_authenticate(user=self.user)
        url = reverse('recent-reviews') 
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_recent_reviews_not_found(self):
        self.client.force_authenticate(user=self.user)
        self.hotel.delete()
        url = reverse('recent-reviews') 
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

# display payment details for admin and hotel
class PaymentDetailsCase(APITestCase):
    def setUp(self):
        self.user = Login.objects.create_user(
            email=test_email,password="testpaymentpswd",userType="admin",status="active",
        )
        self.customer = Customer.objects.create(
            first_name="payment",email=test_email,status="active",
        )
        self.hotel = Hotel.objects.create(
            hotel_name="Test Payment Hotels",email=test_email,service_charge=100.00,status="active",
        )
        self.room_type = RoomType.objects.create(room_type="Deluxe")
        self.room_details = RoomDetails.objects.create(
            hotel_id=self.hotel,room_type_id=self.room_type,number_of_rooms=10,room_facilities="AC",rate=1500.00,
        )
        self.booking = Booking.objects.create(
            room =self.room_details,check_in_date="2024-10-24",check_out_date="2024-10-25",guest_name="Test customer",email="customer@test.pay",phone_number="9876543212",address="ABC",
            number_of_rooms="9",number_of_adults="2",number_of_children="0",aadhar_number="123412341234",customer=self.customer,hotel=self.hotel
        )
        self.payment = Payment.objects.create(
            booking=self.booking,customer=self.customer,amount=10000,payment_method='cash'
        )

    def test_valid_payment_details(self):
        self.client.force_authenticate(user=self.user)
        url = reverse('view-payment-details',kwargs={'booking_id': self.booking.id})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
    
    def test_payment_details_not_found(self):
        self.client.force_authenticate(user=self.user)
        url = reverse('view-payment-details',kwargs={'booking_id': self.booking.id})
        self.payment.delete()
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

#booking cancellation and payment refund
class CancelBookingTestcase(APITestCase):
    def setUp(self):
        self.client = APIClient()

        self.login_user = Login.objects.create_user(
            email=test_email, password="userexample@test.com", userType="customer", status="active")
        
        self.customer = Customer.objects.create(email=test_email, first_name='guest',status="active")
        self.hotel = Hotel.objects.create(hotel_name="StarHotels",email=test_email,service_charge=100.00,status="active",)

        self.room_type = RoomType.objects.create(room_type="Suite")
        self.room_details = RoomDetails.objects.create(hotel_id=self.hotel,room_type_id=self.room_type,number_of_rooms=5,room_facilities="AC,tv,Balcony",rate=15000.00)

        self.bookings = Booking.objects.create(guest_name='guest user',room=self.room_details,customer=self.customer,aadhar_number='345678764521',
            email='xyz@dgf.cv',phone_number='9876543211',address='abc',number_of_rooms=2,check_in_date='2024-10-10',
            check_out_date='2024-10-15',status='confirmed',hotel = self.hotel,number_of_adults=3,number_of_children=0)

        self.cancelled_bookings = Booking.objects.create(guest_name='guest test',room=self.room_details,customer=self.customer,aadhar_number='123412341234',
            email='aac@dgf.cvs',phone_number='7676543211',address='dcs',number_of_rooms=2,check_in_date='2024-02-10',
            check_out_date='2024-02-15',status='cancelled', hotel=self.hotel,number_of_adults=2,number_of_children=0)
        
        self.payment = Payment.objects.create(
            booking=self.bookings,customer=self.customer,amount=10000,payment_id='pi_30hrg4434',payment_method='card',status='paid')
        self.cancelled_payment = Payment.objects.create(
            booking=self.cancelled_bookings,customer=self.customer,amount=10000,payment_method='cash',status='cancelled')
        
    def test_success_booking_cancel(self):
        self.client.force_authenticate(user=self.login_user)
        url = reverse('cancel-bookings',kwargs={'booking_id': self.bookings.id})  
        response = self.client.post(url, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
    
    def test_already_cancelled_booking(self):
        self.client.force_authenticate(user=self.login_user)
        url = reverse('cancel-bookings',kwargs={'booking_id': self.cancelled_bookings.id})  
        response = self.client.post(url, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    
    def test_booking_not_found(self):
        self.client.force_authenticate(user=self.login_user)
        url = reverse('cancel-bookings',kwargs={'booking_id': self.bookings.id})  
        self.bookings.delete()
        response = self.client.post(url, format='json')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
    
    def test_user_not_found(self):
        self.client.force_authenticate(user=self.login_user)
        url = reverse('cancel-bookings',kwargs={'booking_id': self.bookings.id})  
        self.customer.delete()
        response = self.client.post(url, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    
    def test_cancel_booking_with_payment_refund(self):
        with patch('hotel_app.views.refund_payment') as mock_refund_payment:
            self.client.force_authenticate(user=self.login_user)
            url = reverse('cancel-bookings',kwargs={'booking_id': self.bookings.id})  
            response = self.client.post(url, format='json')
            mock_refund_payment.assert_called_once_with(self.payment.payment_id)
            self.assertEqual(response.status_code, status.HTTP_200_OK)

class ReviewsListByHotelId(APITestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = Login.objects.create(
            email=admin_email,
            password=admin_password,
            userType="customer"
        )

        self.user_table = Customer.objects.create(
            id=1,
            first_name = 'review',
            last_name = 'customer',
            email = admin_email,
            status = 'active',
            user_type = 'customer'
        )
        self.hotel = Hotel.objects.create(
            id=1,
            hotel_name="Mariott",
            email="mariottest@gmail.com",
            phone_number="9878865455",
            address="Mariott sample towers",
            city="Vyttila",
            district="ernakulam",
            state="kerala",
            pincode="678988",
            license_number="12-4353-6785",
            description="7 star hotel test and residency",
            service_charge="1786.56",
            status='active'
        )

        self.review = Review.objects.create(
            customer_name=self.user.email,
            hotel_email=self.hotel.email,
            rating=5,
            title='Great sample Hotel',
            comment='I enjoyed my short stay.',
            status='active',
        )
        
    def test_get_review_details(self):
        url=reverse('hotel-reviews-for-customer',kwargs={'hotel_id': self.hotel.id})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
    
    def test_hotel_not_found(self):
        url=reverse('hotel-reviews-for-customer',kwargs={'hotel_id': self.hotel.id})
        self.hotel.delete()
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

class RoomAndServicesCountTestCases(APITestCase):
    def setUp(self):
        self.client = APIClient()

        self.login_user = Login.objects.create(
            email='test@hotel.com',
            password=admin_password,
            userType="customer"
        )

        self.hotel = Hotel.objects.create(
            hotel_name="StarHotels Test",
            email='test@hotel.com',
            service_charge=100.00,
            status="active"
        )

        self.room_type = RoomType.objects.create(room_type="Suite")

        self.room_details = RoomDetails.objects.create(
            hotel_id=self.hotel,
            room_type_id=self.room_type,
            number_of_rooms=5,
            room_facilities="AC,Balcony",
            rate=15000.00
        )

        self.room_services = RoomServices.objects.create(
            hotel_id = self.hotel,
            title="Spa test",
            description="spa",
            price=2000.0,
            image=None,
        )

    def test_get_rooms_count(self):
        self.client.force_authenticate(user=self.login_user)
        url = reverse('count-room-and-services') 
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

#cancel incomplete booking by hotel
class CancelIncompleteBookingTestcase(APITestCase):
    def setUp(self):
        self.client = APIClient()

        self.login_user = Login.objects.create_user(
            email=test_email, password="hotel@test.com", userType="hotel", status="active")
        
        self.customer = Customer.objects.create(email=test_email, first_name='guest',status="active")
        self.hotel = Hotel.objects.create(hotel_name="StarHotels",email=test_email,service_charge=100.00,status="active",)

        self.room_type = RoomType.objects.create(room_type="Suite")
        self.room_details = RoomDetails.objects.create(hotel_id=self.hotel,room_type_id=self.room_type,number_of_rooms=5,room_facilities="AC,Balcony",rate=15000.00)

        self.incomplete_bookings = Booking.objects.create(guest_name='guest user',room=self.room_details,customer=self.customer,aadhar_number='345678764521',
            email='xyz@dgf.cv',phone_number='9876543211',address='abc',number_of_rooms=2,check_in_date='2024-10-10',
            check_out_date='2024-10-15',status='in progress',hotel = self.hotel,number_of_adults=3,number_of_children=0)
        
        self.incomplete_payment = Payment.objects.create(
            booking=self.incomplete_bookings,customer=self.customer,amount=0,status='pending')
        
    def test_success_booking_cancel_by_hotel(self):
        self.client.force_authenticate(user=self.login_user)
        url = reverse('cancel-incomplete-bookings',kwargs={'booking_id': self.incomplete_bookings.id})  
        response = self.client.post(url, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
    
    def test_cancel_not_found_booking_by_hotel(self):
        self.client.force_authenticate(user=self.login_user)
        url = reverse('cancel-incomplete-bookings',kwargs={'booking_id': self.incomplete_bookings.id})  
        self.incomplete_bookings.delete()
        response = self.client.post(url, format='json')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

class SortActiveHotelDetailsTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.customer = Login.objects.create(
            email="test1@test.com",
            password=(test_password),
            status="active",
            userType="customer",
            first_name="customer"
        )
        self.hotel=Hotel.objects.create(
            hotel_name='Test', address='Homes', email='test@test.com', phone_number='9333656789',
            user_type='hotel', status='active',city='testcity',district='testdist',state='testst',
            license_number='12-1234-1245',service_charge='1634.34',description='excellent',
            image=SimpleUploadedFile("hotel_image1.jpg", b"file_content", content_type=content_type))
        
        self.roomType = RoomType.objects.create(
            room_type = 'Standard'
        )

        self.room1 = RoomDetails.objects.create(
            hotel_id=self.hotel,
            room_type_id=self.roomType,
            number_of_rooms=15,
            room_facilities="Wi-Fi,Ac",
            rate=300.00,
        )

    def test_sort_active_hotels_details_basedon_rating(self):
        data = {'option':'1'}
        url = reverse('sort-active-hotels')
        self.client.force_authenticate(user=self.customer)
        response = self.client.post(url,data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertContains(response, 'Test')
    
    def test_sort_active_hotels_details_basedon_price(self):
        data = {'option':'2'}
        url = reverse('sort-active-hotels')
        self.client.force_authenticate(user=self.customer)
        response = self.client.post(url,data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertContains(response, 'Test')

    def test_sort_active_hotels_details_basedon_lowest_price(self):
        data = {'option':'3'}
        url = reverse('sort-active-hotels')
        self.client.force_authenticate(user=self.customer)
        response = self.client.post(url,data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertContains(response, 'Test')

    def test_sort_active_hotels_details_not_found(self):
        data = {'option':'1'}
        url = reverse('sort-active-hotels')
        self.client.force_authenticate(user=self.customer)
        self.hotel.delete()
        response = self.client.post(url,data, format='json')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

class DeleteHotelNotificationsTestCase(TestCase):

    def setUp(self):
        self.client = APIClient()
        self.hotel_user = Login.objects.create_user(
            email=test_email,
            password="Hotel567",
            status="active",
            userType="hotel",
            first_name="hotel"
        )

        self.notification = Notification.objects.create(
            notification_type='Type 1',
            message='Test message 1',
            is_hotel_read=False,
            created_at=datetime.now() - timedelta(hours=1),
            is_hotel_favorite=True,
            is_hotel_deleted=False
        )

        self.notification2 = Notification.objects.create(
            notification_type='Type 3',
            message='Test message 3',
            is_hotel_read=True,
            created_at=datetime.now() - timedelta(hours=2),
            is_hotel_favorite=True,
            is_hotel_deleted=False
        )

    def test_delete_hotel_notification_success(self):
        self.client.force_authenticate(user=self.hotel_user)
        url = reverse('delete-hotel-notifications', kwargs={'notification_id': self.notification.id})
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_delete_notification_not_found(self):
        self.client.force_authenticate(user=self.hotel_user)
        url = reverse('delete-hotel-notifications', kwargs={'notification_id' : '999'})
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)


    
class AddFavoriteNotificationTestCase(TestCase):

    def setUp(self):
        self.client = APIClient()
        self.hotel_user = Login.objects.create_user(
            email=test_email,
            password="Hotel678",
            status="active",
            userType="admin",
            first_name="admin"
        )

        self.notification = Notification.objects.create(
            notification_type='Type 2',
            message='Test message 2',
            is_hotel_read=False,
            created_at=datetime.now() - timedelta(hours=1),
            is_hotel_favorite=True,
            is_hotel_deleted=False
        )
        
    def test_add_notification_to_favorites_success(self):
        self.client.force_authenticate(user=self.hotel_user)
        url = reverse('add-favorite-notification', kwargs={'notification_id': self.notification.id})
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_add_notification_to_favorites_not_found(self):
        self.client.force_authenticate(user=self.hotel_user)
        url = reverse('add-favorite-notification', kwargs={'notification_id': 999})
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

class ReadHotelNotificationTestCase(TestCase):

    def setUp(self):
        self.client = APIClient()
        self.hotel_user = Login.objects.create_user(
            email="hotel78@gmail.com",
            password="Hotel@345",
            status="active",
            userType="hotel",
        )

        self.notification = Notification.objects.create(
            notification_type='Type 4',
            message='Test message 4',
            is_hotel_read=False,
            created_at=datetime.now() - timedelta(hours=1),
        )
        

     
    def test_hotel_notification_to_read_success(self):
        self.client.force_authenticate(user=self.hotel_user)
        url = reverse('read-hotel-notification', kwargs={'notification_id': self.notification.id})
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_hotel_notification_to_read_not_found(self):
        self.client.force_authenticate(user=self.hotel_user)
        url = reverse('read-hotel-notification', kwargs={'notification_id': 999})
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)


         
class UnReadHotelNotifications(APITestCase):
    def setUp(self):
        self.client = APIClient()

        self.supervisor = Login.objects.create_user(
            email="hotel7856@gmail.com",
            password="Passty678#22",
            status="active",
            userType="hotel",
        )

        self.hotel_user = Hotel.objects.create(
            email=self.supervisor.email,
            status='active',
            service_charge="100",
        )

        self.notification = Notification.objects.create(
            notification_type='Type 5',
            message='Test message 5',
            is_hotel_read=False,
            hotel=self.hotel_user,  
            created_at=datetime.now() - timedelta(hours=1),
        )
        
    def test_unread_hotel_notification_success_count(self):
        self.client.force_authenticate(user=self.supervisor)
        url = reverse('unread-hotel-notification-count')
        response = self.client.get(url, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
