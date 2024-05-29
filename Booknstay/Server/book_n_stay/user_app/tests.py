from unittest.mock import patch
from rest_framework.test import APITestCase,APIClient,force_authenticate
from django.test import TestCase
from django.core import mail
from rest_framework.status import HTTP_200_OK, HTTP_400_BAD_REQUEST
from rest_framework import status
from django.test import Client
from django.utils import timezone
from django.urls import reverse
from django.contrib.auth.hashers import make_password
from user_app.models import Customer,Login, PasswordReset , Notification
from hotel_app.models import Review,Hotel,RoomDetails,Booking,RoomType
from datetime import datetime, timedelta


# test cases for login
password = "Password@123"
email = "user@gmail.com"
invalid_input = "Invalid input data"
user_not_found = 'User not found'

class LoginViewTest(TestCase):
    notuser_email = "notuser@gmail.com"
    def setUp(self):      
        self.client = APIClient()
        self.user_data = {
            "email": email,
            "password": password
        }
        self.user = Login.objects.create(
            email=email,
            password=(password),
            status="active"
        )

    def test_valid_login(self):
        self.user.status = "active"
        self.user.save()
        url = reverse('login')
        response = self.client.post(url, self.user_data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_invalid_email(self):
        invalid_data = {
            "email": self.notuser_email,
            "password": password
        }
        url = reverse('login')
        response = self.client.post(url, invalid_data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST) 

    def test_unapproved_user(self):
        Login.objects.create(
            email=self.notuser_email,
            password=(password),
            status="pending",
            first_name="user"
        )
        pending_data = {
            "email": self.notuser_email,
            "password":password
        }
        url = reverse('login')
        response = self.client.post(url, pending_data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    
    def test_incorrect_password(self):
        incorrect_password_data = {
            "email": email,
            "password": password
        }
        url = reverse('login')
        response = self.client.post(url, incorrect_password_data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

class TestResetPasswordView(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = Login.objects.create_user(
            email="test@example.com",
            password="old_password",
            userType="student",
            status="active",
        )
        self.password_reset = PasswordReset.objects.create(user=self.user, token="abcdefg")
    def test_invalid_token(self):
        data = {"new_password": "new_password123"}
        url = reverse("resetpassword", kwargs={"token": "invalid_token"})
        response = self.client.post(url, data=data, follow=True)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


    def test_missing_password(self):
        data = {}
        url = reverse("resetpassword", kwargs={"token": "abcdefg"})
        response = self.client.post(url, data=data, follow=True)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("new_password", response.json()["errors"])

    def test_short_password(self):
        data = {"new_password": "short"}
        url = reverse("resetpassword", kwargs={"token": "abcdefg"})
        response = self.client.post(url, data=data, follow=True)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("new_password", response.json()["errors"])
        
class TestCheckTokenExpiredView(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.url_valid = reverse('checktokenexpiry', args=['valid_token'])
        self.url_expired = reverse('checktokenexpiry', args=['expired_token'])
        self.url_nonexistent = reverse('checktokenexpiry', args=['nonexistent_token'])
        self.user = Login.objects.create_user(
            email='test@example.com',
            password='password123',
            userType='student',
            status='active',
        )
        self.password_reset_valid = PasswordReset.objects.create(
            user=self.user,
            token='valid_token',
            created_at=timezone.now() - timezone.timedelta(minutes=30)
        )
        self.password_reset_expired = PasswordReset.objects.create(
            user=self.user,
            token='expired_token',
            created_at=timezone.now() - timezone.timedelta(hours=2)
        )

    def test_valid_token(self):
        response = self.client.get(self.url_valid)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(response.data['isExpired'])


    def test_nonexistent_token(self):
        response = self.client.get(self.url_nonexistent)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertTrue(response.data['isExpired'])
    def test_expired_token(self):
        response = self.client.get(self.url_expired)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(response.data['isExpired'])

class TestForgotPasswordView(TestCase):
    forgot_email = "test@example.com"
    def setUp(self):
        self.client = Client()
        self.user = Login.objects.create_user(email=self.forgot_email, password="testpassword")

    def test_valid_forgot_password_request(self):
        data = {"email": self.forgot_email}
        url = reverse("forgotpassword")

        response = self.client.post(url, data=data, follow=True)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.json().get("message"), "Password reset link sent successfully, check your email")

        self.assertEqual(len(mail.outbox), 1)
        self.assertEqual(mail.outbox[0].subject, "BooknStay - Password Reset")
        self.assertEqual(mail.outbox[0].to, ['test@example.com'])
        
        reset_object = PasswordReset.objects.get(user=self.user)
        self.assertEqual(reset_object.token, response.json().get("token"))

    def test_invalid_forgot_password_request_user_not_found(self):
        data = {"email": "nonexistent@example.com"}
        url = reverse("forgotpassword")
        response = self.client.post(url, data=data, follow=True)

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.json().get("error"), invalid_input)
        self.assertEqual(len(mail.outbox), 0)

    def test_invalid_forgot_password_request_invalid_data(self):
        data = {"email": "invalid_email"}
        url = reverse("forgotpassword")
        response = self.client.post(url, data=data, follow=True)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.json().get("error"), invalid_input)
        self.assertEqual(len(mail.outbox), 0)

# Customer register test cases.
class CustomerRegisterTestCase(APITestCase):
    email = 'test@gmail.com'
    url = '/user/customer-register/'

    def test_valid_customer_registration(self) :
        data = {
                "first_name" : "Test",
                "last_name" : "Test",
                "email" : self.email,
                "phone_number" : "9867543221",
                "password":"test@1234"
        }
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_invalid_customer_registration(self):
        data = {
            "first_name" : "Test"
        }

        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_invalid_first_name(self) :
        data = {
                "first_name" : "Test123",
                "last_name" : "Test",
                "email" :  self.email,
                "phone_number" : "9867543221"
        }
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_invalid_first_name_len(self) :
        data = {
                "first_name" : " ",
                "last_name" : "Test",
                "email" :  self.email,
                "phone_number" : "9867543221"
        }
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_invalid_first_name_len_exceeds(self) :
        data = {
                "first_name" : "Testttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttt",
                "last_name" : "Test",
                "email" :  self.email,
                "phone_number" : "9867543221"
        }
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_invalid_last_name(self) :
        data = {
                "first_name" : "Test",
                "last_name" : "Test123",
                "email" :  self.email,
                "phone_number" : "9867543221"
        }
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_invalid_last_name_len(self) :
        data = {
                "first_name" : "Test",
                "last_name" : " ",
                "email" :  self.email,
                "phone_number" : "9867543221"
        }
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_invalid_last_name_len_exceeds(self) :
        data = {
                "first_name" : "Test",
                "last_name" : "Testtttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttt",
                "email" :  self.email,
                "phone_number" : "9867543221"
        }
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_invalid_email(self) :
        data = {
                "first_name" : "Test",
                "last_name" : "Test",
                "email" : "test@gmail.com123",
                "phone_number" : "9867543221"
        }
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_invalid_customer_registration_existing_email(self):
        Customer.objects.create(
            first_name="Existing",
            last_name="Test",
            email="existing_test@example.com",
            phone_number="9876543210"
        )
        data = {
            "first_name": "Test",
            "last_name": "Test",
            "email": "existing_test@example.com",
            "phone_number": "9867543221"
        }
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('email', response.data)

    def test_invalid_phone_number(self) :
        data = {
                "first_name" : "Test",
                "last_name" : "Test",
                "email" :  self.email,
                "phone_number" : "986123wwrw"
        }
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_invalid_phone_number_len(self) :
        data = {
                "first_name" : "Test",
                "last_name" : "Test",
                "email" :  self.email,
                "phone_number" : "98786754321233"
        }
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_invalid_password(self) :
        data = {
                "first_name" : "Test",
                "last_name" : "Test",
                "email" :  self.email,
                "password" : "Te",
                "phone_number" : "9878675432"
        }
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_invalid_password_only_digits(self) :
        data = {
                "first_name" : "Test",
                "last_name" : "Test",
                "email" :  self.email,
                "password" : "12345678",
                "phone_number" : "9878675432"
        }
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_invalid_password_only_letters(self) :
        data = {
                "first_name" : "Test",
                "last_name" : "Test",
                "email" :  self.email,
                "password" : "Testtest",
                "phone_number" : "9878675432"
        }
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_invalid_password_no_special_characters(self) :
        data = {
                "first_name" : "Test",
                "last_name" : "Test",
                "email" :  self.email,
                "password" : "Test1234",
                "phone_number" : "9878675432"
        }
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

#fetch user details
class GetUserDetailsTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.admin = Login.objects.create(
            email=email,
            password=(password),
            status="active",
            userType="admin",
            first_name="admin"
        )
    def test_get_user_details_with_query(self):
        Customer.objects.create(first_name='John', last_name='Doe', email='john@example.com', 
                                user_type='customer', status='active')
        url = reverse('customer-details')
        self.client.force_authenticate(user=self.admin)
        response = self.client.get(url, {'query': 'John'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertContains(response, 'John')

    def test_get_user_details_without_query(self):
        Customer.objects.create(first_name='Jane', last_name='Doe', email='jane@example.com', user_type='customer')
        url = reverse('customer-details')
        self.client.force_authenticate(user=self.admin)
        response = self.client.get(url, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertContains(response, 'Jane')

    def test_get_user_details_no_user(self):
        url = reverse('customer-details')
        self.client.force_authenticate(user=self.admin)
        response = self.client.get(url, format='json')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

class UserDetailsByStatusTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.admin = Login.objects.create(
            email=email,
            password=(password),
            status="active",
            userType="admin",
            first_name="admin"
        )

    def test_get_user_details_by_status(self):
        Customer.objects.create(first_name='John', last_name='Doe', email='john@example.com', user_type='customer', status='active')
        url = reverse('customers-by-status', args=['active'])
        self.client.force_authenticate(user=self.admin)
        response = self.client.get(url, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertContains(response, 'John')

    def test_get_user_details_by_status_not_found(self):
        url = reverse('customers-by-status', args=['inactive'])
        self.client.force_authenticate(user=self.admin)
        response = self.client.get(url, format='json')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)


# TestUpdateUser
class TestUpdateUser(APITestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = Login.objects.create(
            email='customer@gmail.com',
            userType='customer',
            status='active',
            first_name='customer',
            password=password
        )
        self.user2 = Login.objects.create(
            email='customer2@gmail.com',
            userType='customer',
            status='inactive',
            first_name='customer',
            password=password
        )
        self.user1 = Login.objects.create(
            email='hotel@gmail.com',
            userType='hotel',
            status='active',
            first_name='hotel',
            password=password
        )
        self.customer = Customer.objects.create(
            first_name="customer",
            last_name="last",
            phone_number="3456677754",
            email="customer@gmail.com",
            status="active",
            date_joined="2023-12-17",
            user_type="customer"
        )
        self.data = {
            "first_name": "Updatedcustomer",
            "last_name": "Updatedlastname",
            "phone_number": "9876545673",
            "address" : "UpdateAddress",
            "state" : "UpdateState"
        }

    def test_get_user_success(self):
        url = reverse('edit-customer')
        self.client.force_authenticate(user=self.user)
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['first_name'], self.customer.first_name)
        self.assertEqual(response.data['last_name'], self.customer.last_name)
        self.assertEqual(response.data['phone_number'], self.customer.phone_number)

    def test_update_customer_details(self):
        self.client.force_authenticate(user=self.user)
        url = reverse('edit-customer')
        response = self.client.put(url, self.data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_get_update_user_not_found(self):
        self.client.force_authenticate(user=self.user)
        url = reverse('edit-customer')
        self.user.delete()
        response = self.client.get(url, self.data, format='json')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_get_update_customer_not_found(self):
        self.client.force_authenticate(user=self.user)
        url = reverse('edit-customer')
        self.customer.delete()
        response = self.client.get(url, self.data, format='json')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_forbidden_update_customer(self):
        self.client.force_authenticate(user=self.user1)
        url = reverse('edit-customer')
        response = self.client.get(url, self.data, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_inactive_update_customer(self):
        self.client.force_authenticate(user=self.user2)
        url = reverse('edit-customer')
        response = self.client.get(url, self.data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_update_customer_not_found(self):
        self.client.force_authenticate(user=self.user)
        url = reverse('edit-customer')
        self.user.delete()
        response = self.client.put(url, self.data, format='json')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_put_user_invalid_data(self):
        data = {
            'first_name': '',
            'last_name': 'Updated Last Name',
            'phone_number': '9876543210',
        }
        self.client.force_authenticate(user=self.user)
        url = reverse('edit-customer')
        response = self.client.put(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

# test cases for email verification
class VerifyEmailTestCase(APITestCase):
    def setUp(self):
        self.client = APIClient()

        self.customer = Customer.objects.create(
            first_name='Customer',
            last_name='customer',
            email='cust@test.com',
            status='inactive'
        )

        self.customer2 = Customer.objects.create(
            first_name='Customer',
            last_name='customer',
            email='customer2@gmail.com',
            status='active'
        )

    def test_update_user_status_on_verification(self):
        url = reverse('verify-email', args=[self.customer.id])
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_update_already_verified_status(self):
        url = reverse('verify-email', args=[self.customer2.id])
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_update_user_does_not_exist(self):
        response = self.client.get('/user/verify-email/10/')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

# suspend the user
def check_activity_mock(customer_id):
    return True

class SuspendUserTestCase(APITestCase):
    def setUp(self):
        self.client = APIClient()
        self.admin = Login.objects.create(
            email='adminsuspend@test.com',
            password=password,
            status="active",
            userType="admin",
            first_name="admin"
        )

        self.customer_user = Login.objects.create(
            email='custsuspend@test.com',
            password=password,
            userType='customer',
            status='active'
        )
        self.customer = Customer.objects.create(
            first_name="Suspend",
            last_name="last",
            phone_number="3456677754",
            email="custsuspend@test.com",
            status="active",
            date_joined="2023-12-03",
            user_type="customer"
        )

    def test_suspend_user_success(self):
        self.client.force_authenticate(user=self.admin)
        url=reverse('suspend-customer', kwargs={'id': self.customer.id})
        response = self.client.post(url, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['message'], 'User suspended successfully')

    def test_suspend_user_already_suspended(self):
        self.customer.status = 'suspended'
        self.customer.save()
        self.client.force_authenticate(user=self.admin)
        url=reverse('suspend-customer', kwargs={'id': self.customer.id})
        response = self.client.post(url, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data['message'], 'User is already suspended')

    def test_suspend_user_inactive(self):
        self.customer.status = 'inactive'
        self.customer.save()
        self.client.force_authenticate(user=self.admin)
        url=reverse('suspend-customer', kwargs={'id': self.customer.id})
        response = self.client.post(url, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data['message'], 'User should be active in order to be suspended')

    def test_suspend_user_not_found(self):
        self.client.force_authenticate(user=self.admin)
        url=reverse('suspend-customer', kwargs={'id': 999})
        self.customer.delete()
        response = self.client.post(url, format='json')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(response.data['message'], user_not_found)
    
    def test_suspend_user_data_not_found(self):
        self.client.force_authenticate(user=self.admin)
        url=reverse('suspend-customer', kwargs={'id': self.customer.id})
        self.customer_user.delete()
        response = self.client.post(url, format='json')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(response.data['message'], 'User data not found')

    @patch('user_app.views.CheckActivity', side_effect=check_activity_mock)
    def test_suspend_user_with_active_bookings(self, mock_check_activity):
        self.client.force_authenticate(user=self.admin)
        url=reverse('suspend-customer', kwargs={'id': self.customer.id})
        response = self.client.post(url, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class DeleteUserTestCase(APITestCase):
    def setUp(self):
        self.client = APIClient()
        self.admin = Login.objects.create(
            email="admindelete@test.com",
            password=password,
            status="active",
            userType="admin",
            first_name="admin"
        )

        self.customer_user = Login.objects.create(
            email='custdelete@gmail.com',
            password=password,
            userType='customer',
            status='active'
        )
        self.customer = Customer.objects.create(
            first_name="customer",
            last_name="last",
            phone_number="3456677754",
            email="custdelete@gmail.com",
            status="active",
            date_joined="2023-12-17",
            user_type="customer"
        )

    def test_delete_user_not_found(self):
        self.client.force_authenticate(user=self.admin)
        url=reverse('delete-customer', kwargs={'id': 999})
        self.customer.delete()
        response = self.client.post(url, format='json')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(response.data['message'], user_not_found)
    
    def test_delete_user_data_not_found(self):
        self.client.force_authenticate(user=self.admin)
        url=reverse('delete-customer', kwargs={'id': self.customer.id})
        self.customer_user.delete()
        response = self.client.post(url, format='json')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(response.data['message'], 'User data not found')

    @patch('user_app.views.CheckActivity', side_effect=check_activity_mock)
    def test_delete_user_with_active_bookings(self, mock_check_activity):
        self.client.force_authenticate(user=self.admin)
        url=reverse('delete-customer', kwargs={'id': self.customer.id})
        response = self.client.post(url, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    
    def test_delete_user_success(self):
        self.client.force_authenticate(user=self.admin)
        url=reverse('delete-customer', kwargs={'id': self.customer.id})
        response = self.client.post(url, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['message'], 'User deleted successfully')

class ViewCustomerDetailsTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.admin = Login.objects.create(
            email=email,
            password=(password),
            status="active",
            userType="admin",
            first_name="admin"
        )
        self.customer = Customer.objects.create(
            first_name="customer",
            last_name="last",
            phone_number="3456677754",
            email="customer@test.com",
            status="active",
            date_joined="2023-12-17",
            user_type="customer"
        )
        self.client.force_authenticate(user=self.admin)
    
    def test_view_customer(self):
        self.client.force_authenticate(user=self.admin)
        url = reverse('view-customer', kwargs={'id': self.customer.id})
        response = self.client.get(url,format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_get_user_details_no_user(self):
        url = reverse('view-customer',kwargs={'id': self.customer.id})
        self.customer.delete()
        response = self.client.get(url, format='json')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

# create supervisor test cases
class CreateSupervisorTestCases(APITestCase):
    def setUp(self):
        self.client = APIClient()
        self.admin_user = Login.objects.create(
            email=email,
            password=password,
            userType="admin"
        )

    def test_valid_create_supervisor(self):
        data = {
            "first_name": "Test",
            "email": "test@gmail.com",
            "userType": "supervisor",
            "status": "active",
            "password": "test@123"
        }

        self.client.force_authenticate(user=self.admin_user)
        url = reverse('create-supervisor')
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_create_supervisor_bad_request(self):
        data = {
            "first_name": "Test"
        }

        self.client.force_authenticate(user=self.admin_user)
        url = reverse('create-supervisor')
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class ChangePasswordTestCase(TestCase):
    new_password = 'new_password123!'
    def setUp(self):
        self.client = APIClient()
        self.user = Login.objects.create_user(email='test@test.com', password=password, userType='admin')
        self.client.force_authenticate(user=self.user)

    def test_password_change_success(self):
        url = reverse('changepassword')
        data = {
            'current_password': password,
            'new_password': self.new_password,
            'confirm_password': self.new_password
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data, {'message': 'Password changed successfully!!!!'})
        self.assertTrue(self.user.check_password(self.new_password))

    def test_invalid_input_data(self):
        url = reverse('changepassword')
        data = {
            'current_password': 'wrongpassword!1',
            'new_password': self.new_password,
            'confirm_password': self.new_password
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, 400)
        self.assertEqual(
            response.data,
            {"error": "Incorrect current password"}
        )

    def test_password_mismatch(self):
        url = reverse('changepassword')
        data = {
            'current_password': password,
            'new_password': self.new_password,
            'confirm_password': 'different_password!'
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.data, {'error': 'Invalid input data', 'errors': {'non_field_errors': ['New password and Confirm password do not match']}})

    def test_unauthorized_user_type(self):
        self.user.userType = 'unauthorized_type'
        self.user.save()
        url = reverse('changepassword')
        data = {
            'current_password': password,
            'new_password': self.new_password,
            'confirm_password': self.new_password
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, 403)

    def test_password_same(self):
        url = reverse('changepassword')
        data = {
            'current_password': password,
            'new_password': password,
            'confirm_password': password
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, 400)

class ListSupervisorTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.admin = Login.objects.create(
            email=email,
            password=(password),
            status="active",
            userType="admin",
            first_name="admin"
        )

    def test_get_supervisor_details(self):
        Login.objects.create(first_name='John',email='supervisor@test.com', 
                                 userType='supervisor', status='active', password=password)
        url = reverse('list-supervisors')
        self.client.force_authenticate(user=self.admin)
        response = self.client.get(url, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertContains(response, 'John')

    def test_get_user_details_no_user(self):
        url = reverse('list-supervisors')
        self.client.force_authenticate(user=self.admin)
        response = self.client.get(url, format='json')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

class DeleteSuperVisorTestCase(APITestCase):
    def setUp(self):
        self.client = APIClient()
        self.admin = Login.objects.create(
            email=email,
            password=(password),
            status="active",
            userType="admin",
            first_name="admin"
        )

        self.supervisor_user = Login.objects.create(
            email='supervisor@gmail.com',
            password=password,
            userType='supervisor',
            status='active'
        )
        

    def test_delete_user_not_found(self):
        self.client.force_authenticate(user=self.admin)
        url=reverse('delete-supervisor', kwargs={'id': 999})
        self.supervisor_user.delete()
        response = self.client.post(url, format='json')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(response.data['message'], user_not_found)
    
    def test_delete_user_data_not_found(self):
        self.client.force_authenticate(user=self.admin)
        url=reverse('delete-supervisor', kwargs={'id': self.supervisor_user.id})
        self.supervisor_user.delete()
        response = self.client.post(url, format='json')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(response.data['message'], user_not_found)

    def test_delete_user_success(self):
        self.client.force_authenticate(user=self.admin)
        url=reverse('delete-supervisor', kwargs={'id': self.supervisor_user.id})
        response = self.client.post(url, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['message'], 'Supervisor deleted successfully')

class DeleteCustomerAccountTestCases(APITestCase):
    def setUp(self):
        self.client = APIClient()
        self.customer_user = Login.objects.create(
            email = 'customer12@test.com',
            password = password,
            userType = 'customer',
            status = 'active'
        )

        self.customer_details = Customer.objects.create(
            first_name = "Tester",
            email = "customer12@test.com",
            phone_number = "8590923292",
            status='active'
        )


    def test_delete_already_deleted_customer_account(self):
        deleted_customer_user = Login.objects.create(
            email="customerdeleted@gmail.com",
            password=password,
            userType="customer",
            status="deleted"
        )
        url = reverse('delete-customer-account', kwargs={'customer_id': self.customer_details.id})
        self.client.force_authenticate(user=deleted_customer_user)
        response = self.client.put(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_delete_customer_account_success(self):
        url = reverse('delete-customer-account', kwargs={'customer_id': self.customer_details.id})
        self.client.force_authenticate(user=self.customer_user)
        response = self.client.put(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_delete_customer_account_not_found(self):
        invalid_customer_user = Login.objects.create(
            email="customernotexist@example.com",
            password=password,
            userType="customer",
            status="active"
        )

        url = reverse('delete-customer-account', kwargs={'customer_id': self.customer_details.id})
        self.client.force_authenticate(user=invalid_customer_user)
        response = self.client.put(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_delete_user_data_not_found(self):
        self.client.force_authenticate(user=self.customer_user)
        url = reverse('delete-customer-account', kwargs={'customer_id': self.customer_details.id})
        self.customer_user.delete()
        response = self.client.put(url, format='json')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

class ActivateCustomerTestCase(APITestCase):
    def setUp(self):
        self.client = APIClient()
        self.admin = Login.objects.create(
            email=email,
            password=password,
            status="active",
            userType="admin",
            first_name="admin"
        )

        self.customer_user = Login.objects.create(
            email='customertest@gmail.com',
            password=password,
            userType='customer',
            status='suspended'
        )
        self.customer = Customer.objects.create(
            first_name="customer",
            last_name="last",
            phone_number="3456677754",
            email="customertest@gmail.com",
            status="suspended",
            date_joined="2023-12-17",
            user_type="customer"
        )

    def test_activate_customer_success(self):
        self.client.force_authenticate(user=self.admin)
        url=reverse('activate-customer', kwargs={'customer_id': self.customer.id})
        response = self.client.post(url, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['message'], 'Customer activated successfully')

    def test_activate_customer_already_active(self):
        self.customer.status = 'active'
        self.customer.save()
        self.client.force_authenticate(user=self.admin)
        url=reverse('activate-customer', kwargs={'customer_id': self.customer.id})
        response = self.client.post(url, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data['message'], 'Customer is already active')

    def test_activate_customer_not_found(self):
        self.client.force_authenticate(user=self.admin)
        url=reverse('activate-customer', kwargs={'customer_id': 999})
        self.customer.delete()
        response = self.client.post(url, format='json')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
class CountListTestCase(APITestCase):
    def setUp(self):
        self.client = APIClient()
        self.admin = Login.objects.create(
            email=email,
            password=password,
            status="active",
            userType="admin",
            first_name="admin"
        )

        self.customer_user = Customer.objects.create(
            email='customertest@gmail.com',
            status='active'
        )
        self.supervisor_user = Login.objects.create(
            email='supervisortest@gmail.com',
            password=password,
            userType='supervisor',
            status='active'
        )
        self.hotel_user = Hotel.objects.create(
            email='hoteltest1@gmail.com',
            status='active',
            service_charge = '150',
        )
    def test_success_count(self):
        self.client.force_authenticate(user=self.admin)
        url=reverse('count-list')
        response = self.client.get(url, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)


class HotelBookingGraphTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()

        self.admin_user = Login.objects.create_user(
            email=email,
            password=password,
            status="active",
            userType="admin",
            first_name="admin"
        )

        self.user = Customer.objects.create(
            email='user@gmail.com',
            status = 'active'
        )

        self.room_type = RoomType.objects.create(room_type='Single')
        self.hotel1 = Hotel.objects.create(hotel_name='Hotel 1', service_charge="140", status='active')
        self.room1 = RoomDetails.objects.create(
            hotel_id=self.hotel1,
            rate="20",
            number_of_rooms="10",
            room_type_id=self.room_type
        )

        self.booking1 = Booking.objects.create(
            room=self.room1,
            customer=self.user,
            guest_name="John Doe",
            email="john.doe@example.com",
            phone_number="1234567890",
            address="123 Main St",
            aadhar_number=123456789012,
            number_of_adults=2,
            number_of_children=1,
            number_of_rooms=1,
            check_in_date="2024-02-20",
            check_out_date="2024-02-25",
            hotel=self.hotel1
        )

    def test_hotel_booking_graph(self):
        self.client.force_authenticate(user=self.admin_user)
        url = reverse('hotel-booking-graph')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)


class CountListHotelTestCase(APITestCase):
    def setUp(self):
        self.client = APIClient()
        self.supervisor = Login.objects.create(
            email="supervisor223@gmail.com",
            password=password,
            status="active",
            userType="supervisor",
        )

        self.customer_user = Customer.objects.create(
            email='customertest1@gmail.com',
            status='active'
        )
       
        self.hotel_user = Hotel.objects.create(
            email='hoteltest11@gmail.com',
            status='active',
            service_charge = '160',
        )
    def test_success_count(self):
        self.client.force_authenticate(user=self.supervisor)
        url=reverse('count-list-hotels')
        response = self.client.get(url, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

class HotelReviewGraph(TestCase):
    def setUp(self):
        self.client = APIClient()

        self.admin_user = Login.objects.create_user(
            email=email,
            password=password,
            status="active",
            userType="admin",
            first_name="admin"
        )

        self.customer = Customer.objects.create(
            email='user55@gmail.com',
            status = 'active'
        )
        self.hotel = Hotel.objects.create(
            hotel_name='Test Hotel',
            email='testhotel@example.com',
            service_charge = '100',
        )
        self.review = Review.objects.create(
            hotel_email=self.hotel.email,
            customer_name= self.customer.email,
            rating=4,
            title='Test Title',
            comment='Test Comment',
        )
    def test_hotel_average_rating(self):
        self.client.force_authenticate(user=self.admin_user)
        url = reverse('most-reviewd-hotel')  
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

class GetUserDataTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = Login.objects.create(
            email=email,
            password=(password),
            status="active",
            userType="customer",
            first_name="customertest"
        )
        self.customer = Customer.objects.create(
            first_name="customertest",
            last_name="test",
            phone_number="3636677754",
            email=email,
            user_type="customer"
        )
    
    def test_get_user_data(self):
        self.client.force_authenticate(user=self.user)
        url = reverse('get-user-data')
        response = self.client.get(url,format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_get_user_details_no_customer(self):
        self.client.force_authenticate(user=self.user)
        url = reverse('get-user-data')
        self.customer.delete()
        response = self.client.get(url, format='json')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
    
    def test_get_user_details_no_user(self):
        self.client.force_authenticate(user=self.user)
        url = reverse('get-user-data')
        self.user.delete()
        response = self.client.get(url, format='json')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
    
    def test_get_user_details_not_active(self):
        self.client.force_authenticate(user=self.user)
        url = reverse('get-user-data')
        self.user.status= 'inactive'
        self.user.save()
        response = self.client.get(url, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class AdminNotificationsTestCase(TestCase):

    def setUp(self):
        self.client = APIClient()
        self.admin_user = Login.objects.create_user(
            email=email,
            password=password,
            status="active",
            userType="admin",
            first_name="admin"
        )

        
        self.notification2=Notification.objects.create(
            notification_type='Type 2',
            message='Test message 2',
            is_admin_read=True,
            created_at=datetime.now() - timedelta(hours=2),
            is_admin_favorite=True,
            is_admin_deleted=False
        )

    def test_get_admin_notifications(self):
        self.client.force_authenticate(user=self.admin_user)
        url = reverse('admin-notifications')  
        response = self.client.get(url)
        self.assertEqual(response.status_code, 200)

class DeleteAdminNotificationsTestCase(TestCase):

    def setUp(self):
        self.client = APIClient()
        self.admin_user = Login.objects.create_user(
            email="admin@example.com",
            password="adminpassword",
            status="active",
            userType="admin",
            first_name="admin"
        )

        self.notification = Notification.objects.create(
            notification_type='Type 11',
            message='Test message 11',
            created_at=datetime.now() - timedelta(hours=1),
            is_admin_favorite=True,
            is_admin_deleted=False
        )

        self.notification2 = Notification.objects.create(
            notification_type='Type 3',
            message='Test message 3',
            is_admin_read=True,
            created_at=datetime.now() - timedelta(hours=2),
            is_admin_favorite=True,
            is_admin_deleted=False
        )

    def test_delete_notification_success(self):
        self.client.force_authenticate(user=self.admin_user)
        url = reverse('delete-notifications', kwargs={'notification_id': self.notification.id})
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_delete_notification_not_found(self):
        self.client.force_authenticate(user=self.admin_user)
        url = reverse('delete-notifications', kwargs={'notification_id' : '999'})
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)


    
class AddFavoriteNotificationTestCase(TestCase):

    def setUp(self):
        self.client = APIClient()
        self.admin_user = Login.objects.create_user(
            email=email,
            password=password,
            status="active",
            userType="admin",
            first_name="admin"
        )

        self.notification = Notification.objects.create(
            notification_type='Type 4',
            message='Test message 4',
            is_admin_read=False,
            created_at=datetime.now() - timedelta(hours=1),
            is_admin_favorite=True,
            is_admin_deleted=False
        )
        

     
    def test_add_notification_to_favorites_success(self):
        self.client.force_authenticate(user=self.admin_user)
        url = reverse('add-favorite-notification', kwargs={'notification_id': self.notification.id})
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_add_notification_to_favorites_not_found(self):
        self.client.force_authenticate(user=self.admin_user)
        url = reverse('add-favorite-notification', kwargs={'notification_id': 999})
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)


class DeleteCustomerNotificationsTestCase(TestCase):

    def setUp(self):
        self.client = APIClient()
        self.customer_user = Login.objects.create_user(
            email=email,
            password=password,
            status="active",
            userType="customer",
            first_name="customer"
        )

        self.notification = Notification.objects.create(
            notification_type='Type 5',
            message='Test message 5',
            created_at=datetime.now() - timedelta(hours=1),
            is_customer_favorite=True,
            is_customer_deleted=False
        )

        self.notification2 = Notification.objects.create(
            notification_type='Type 12',
            message='Test message 12',
            is_customer_read=True,
            created_at=datetime.now() - timedelta(hours=2),
            is_customer_favorite=True,
            is_customer_deleted=False
        )

    def test_delete_customer_notification_success(self):
        self.client.force_authenticate(user=self.customer_user)
        url = reverse('delete-customer-notifications', kwargs={'notification_id': self.notification.id})
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_delete_notification_not_found(self):
        self.client.force_authenticate(user=self.customer_user)
        url = reverse('delete-customer-notifications', kwargs={'notification_id' : '999'})
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)


    
class AddFavoriteCustomerNotificationTestCase(TestCase):

    def setUp(self):
        self.client = APIClient()
        self.customer_user = Login.objects.create_user(
            email=email,
            password=password,
            status="active",
            userType="admin",
            first_name="admin"
        )

        self.notification = Notification.objects.create(
            notification_type='Type 6',
            message='Test message 6',
            is_customer_read=False,
            created_at=datetime.now() - timedelta(hours=1),
            is_admin_favorite=True,
            is_admin_deleted=False
        )
        

     
    def test_add_customer_notification_to_favorites_success(self):
        self.client.force_authenticate(user=self.customer_user)
        url = reverse('add-favorite-notification-customer', kwargs={'notification_id': self.notification.id})
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_add_customer_notification_to_favorites_not_found(self):
        self.client.force_authenticate(user=self.customer_user)
        url = reverse('add-favorite-notification-customer', kwargs={'notification_id': 999})
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

class ReadCustomerNotificationTestCase(TestCase):

    def setUp(self):
        self.client = APIClient()
        self.customer_user = Login.objects.create_user(
            email=email,
            password=password,
            status="active",
            userType="customer",
            first_name="admin"
        )

        self.notification = Notification.objects.create(
            notification_type='Type 7',
            message='Test message 7',
            is_customer_read=False,
            created_at=datetime.now() - timedelta(hours=1),
        )
        

     
    def test_customer_notification_to_read_success(self):
        self.client.force_authenticate(user=self.customer_user)
        url = reverse('read-customer-notification', kwargs={'notification_id': self.notification.id})
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_customer_notification_to_read_not_found(self):
        self.client.force_authenticate(user=self.customer_user)
        url = reverse('read-customer-notification', kwargs={'notification_id': 999})
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)


         
class UnReadCustomerNotifications(APITestCase):
    def setUp(self):
        self.client = APIClient()

        self.supervisor = Login.objects.create_user(
            email="user45@gmail.com",
            password=password,
            status="active",
            userType="customer",
        )

        self.customer_user = Customer.objects.create(
            email=self.supervisor.email,
            status='active'
        )

        self.notification = Notification.objects.create(
            notification_type='Type 8',
            message='Test message 8',
            is_customer_read=False,
            customer=self.customer_user,  
            created_at=datetime.now() - timedelta(hours=1),
        )
        
    def test_unread_customer_notification_success_count(self):
        self.client.force_authenticate(user=self.supervisor)
        url = reverse('unread-customer-notification-count')
        response = self.client.get(url, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

class ReadAdminNotificationTestCase(TestCase):

    def setUp(self):
        self.client = APIClient()
        self.customer_user = Login.objects.create_user(
            email=email,
            password=password,
            status="active",
            userType="admin",
            first_name="admin"
        )

        self.notification = Notification.objects.create(
            notification_type='Type 10',
            message='Test message 10',
            is_admin_read=False,
            created_at=datetime.now() - timedelta(hours=1),
        )
        

     
    def test_admin_notification_to_read_success(self):
        self.client.force_authenticate(user=self.customer_user)
        url = reverse('read-admin-notification', kwargs={'notification_id': self.notification.id})
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_admin_notification_to_read_not_found(self):
        self.client.force_authenticate(user=self.customer_user)
        url = reverse('read-admin-notification', kwargs={'notification_id': 999})
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
class UnReadAdminNotifications(APITestCase):
    def setUp(self):
        self.client = APIClient()

        self.supervisor = Login.objects.create_user(
            email="admin89@gmail.com",
            password=password,
            status="active",
            userType="admin",
        )

      

        self.notification = Notification.objects.create(
            notification_type='Type 9',
            message='Test message 9',
            is_admin_read=False,
            created_at=datetime.now() - timedelta(hours=1),
        )
        
    def test_unread_customer_notification_success_count(self):
        self.client.force_authenticate(user=self.supervisor)
        url = reverse('unread-admin-notification-count')
        response = self.client.get(url, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)